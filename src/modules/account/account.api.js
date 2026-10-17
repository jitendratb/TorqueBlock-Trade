import { http } from "@/api/http";

// --- Dealer profile ---

// PUT /trade/me — edit business details and billing address (status / credit stay admin-only)
export const updateDealerProfile = (details) => http.put("/trade/me", details, { auth: true }).then((res) => res.data);

// --- B2B Trade Business Account ---

// GET /trade/credit/account — credit line, my role / branch, branches
export const fetchBusinessAccount = () => http.get("/trade/credit/account", { auth: true });

// POST /trade/credit/apply — { creditLimit, creditDays, notes }
export const applyForCredit = (payload) => http.post("/trade/credit/apply", payload, { auth: true });

// GET /trade/credit/salesmen — team with order stats (owner / manager)
export const fetchSalesmen = () => http.get("/trade/credit/salesmen", { auth: true }).then((res) => res.data || []);

// POST /trade/credit/salesmen — { name, phone, email, role, branchCode, canOrderOnCredit, perOrderLimit }
export const addSalesman = (payload) => http.post("/trade/credit/salesmen", payload, { auth: true });

// DELETE /trade/credit/salesmen/:id — remove a salesman from the business account
export const removeSalesman = (id) => http.delete(`/trade/credit/salesmen/${id}`, { auth: true });

// POST /trade/credit/branches — { branchCode, branchName, contactPerson, phone, gstin, address }
export const addBranch = (payload) => http.post("/trade/credit/branches", payload, { auth: true });
