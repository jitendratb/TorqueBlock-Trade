"use client";

import { create } from "zustand";
import AccountService from "@/services/AccountService";

// One in-flight request per resource, so the drawer, header and account page share a fetch.
const inflight = {};
const once = (key, fn) => {
    inflight[key] ??= fn().finally(() => {
        delete inflight[key];
    });
    return inflight[key];
};

const EMPTY = {
    account: null, // GET /trade/credit/account → data
    accountStatus: "idle", // idle | loading | ready | error
    team: [], // GET /trade/credit/salesmen
    teamStatus: "idle",
    branches: [], // GET /trade/credit/branches
    branchesStatus: "idle",
};

// Loads a list resource into `${key}` / `${key}Status`.
const loadList = (set, get, key, fetcher, force) => {
    const statusKey = `${key}Status`;
    if (!force && get()[statusKey] === "ready") return Promise.resolve(get()[key]);
    set({ [statusKey]: "loading" });
    return once(key, () =>
        fetcher()
            .then((list) => {
                set({ [key]: list, [statusKey]: "ready" });
                return list;
            })
            .catch(() => {
                set({ [key]: [], [statusKey]: "error" });
                return [];
            })
    );
};

// Trade business account state, shared by checkout (payment step) and the account screens.
export const useAccountStore = create((set, get) => ({
    ...EMPTY,

    loadAccount: ({ force = false } = {}) => {
        if (!force && get().accountStatus === "ready") return Promise.resolve(get().account);
        set((s) => ({ accountStatus: s.account ? s.accountStatus : "loading" }));
        return once("account", () =>
            AccountService.getBusinessAccount()
                .then((res) => {
                    const account = res.hasBusinessAccount === false ? null : res.data || null;
                    set({ account, accountStatus: "ready" });
                    return account;
                })
                .catch(() => {
                    set({ accountStatus: "error" });
                    return null;
                })
        );
    },

    loadTeam: ({ force = false } = {}) => loadList(set, get, "team", AccountService.getSalesmen, force),
    loadBranches: ({ force = false } = {}) => loadList(set, get, "branches", AccountService.getBranches, force),

    // After an order, payment or account change: re-read everything that was already loaded.
    refresh: () => {
        const { teamStatus, branchesStatus } = get();
        return Promise.all([
            get().loadAccount({ force: true }),
            teamStatus === "ready" ? get().loadTeam({ force: true }) : null,
            branchesStatus === "ready" ? get().loadBranches({ force: true }) : null,
        ]);
    },

    removeSalesman: async (salesmanId) => {
        await AccountService.removeSalesman(salesmanId);
        set((s) => ({
            team: s.team.filter((m) => String(m.id || m.userId) !== String(salesmanId)),
        }));
        return get().refresh();
    },

    reset: () => set(EMPTY),
}));

// The owner manages the team and branches; everyone else on the account is a member who places orders.
export const selectIsOwner = (s) => s.account?.myRole === "owner";
export const selectCreditApproved = (s) => s.account?.creditStatus === "approved";
// Backend: credit is approved and the account has a branch to bill.
export const selectCanUseCredit = (s) => Boolean(s.account?.canOrderOnCredit);
// A member tied to one branch always orders for it; "ALL" (owner, or unassigned member) chooses at checkout.
export const selectLockedBranch = (s) =>
    s.account?.myBranch && s.account.myBranch !== "ALL" ? s.account.branches?.find((b) => b.branchCode === s.account.myBranch) || null : null;

export default useAccountStore;
