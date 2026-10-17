"use client";

import { create } from "zustand";
import { fetchBusinessAccount, fetchSalesmen, removeSalesman as removeSalesmanApi } from "./account.api";

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
    team: [],
    teamStatus: "idle",
    orderFilter: null, // { id, name } — salesman filter applied on My Orders
};

// B2B Trade Business Account state, shared by checkout (payment step) and the account screens.
export const useAccountStore = create((set, get) => ({
    ...EMPTY,

    loadAccount: ({ force = false } = {}) => {
        if (!force && get().accountStatus === "ready") return Promise.resolve(get().account);
        set((s) => ({ accountStatus: s.account ? s.accountStatus : "loading" }));
        return once("account", () =>
            fetchBusinessAccount()
                .then((res) => {
                    const account = res.hasBusinessAccount === false && !res.data ? null : res.data || null;
                    set({ account, accountStatus: "ready" });
                    return account;
                })
                .catch(() => {
                    set({ accountStatus: "error" });
                    return null;
                })
        );
    },

    loadTeam: ({ force = false } = {}) => {
        if (!force && get().teamStatus === "ready") return Promise.resolve(get().team);
        set({ teamStatus: "loading" });
        return once("team", () =>
            fetchSalesmen()
                .then((team) => {
                    set({ team, teamStatus: "ready" });
                    return team;
                })
                .catch(() => {
                    set({ team: [], teamStatus: "error" });
                    return [];
                })
        );
    },

    // After an order, payment or admin change: re-read everything that was already loaded.
    refresh: () => {
        const { teamStatus } = get();
        return Promise.all([
            get().loadAccount({ force: true }),
            teamStatus === "ready" ? get().loadTeam({ force: true }) : null,
        ]);
    },

    removeSalesman: async (salesmanId) => {
        await removeSalesmanApi(salesmanId);
        set((s) => ({
            team: s.team.filter((m) => String(m.id || m.userId) !== String(salesmanId)),
        }));
        return get().refresh();
    },

    setOrderFilter: (orderFilter) => set({ orderFilter }),
    reset: () => set(EMPTY),
}));

const MANAGER_ROLES = ["owner", "manager"];

export const selectIsManager = (s) => MANAGER_ROLES.includes(s.account?.myRole);
export const selectCreditApproved = (s) => s.account?.creditStatus === "approved";
export const selectCanUseCredit = (s) => Boolean(s.account?.creditStatus === "approved" && s.account?.canOrderOnCredit);
// Salesmen tied to one branch always order for it; "ALL" means free choice.
export const selectLockedBranch = (s) => (s.account?.myBranch && s.account.myBranch !== "ALL" ? s.account.myBranch : null);
