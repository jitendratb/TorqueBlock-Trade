import { http } from "@/api/http";


export const registerDealer = (details) => http.post("/trade/register", details, { auth: true }).then((res) => res.data);
