import { redirect } from "next/navigation";

// The stock list now lives on the home page.
export default function ProductsPage() {
    redirect("/#stock");
}
