import { redirect } from "next/navigation";

export default function NotaryProfilePage() {
  // Temporary bridge until authenticated notary context is wired.
  // Replace this hard-coded route once current-user notary lookup exists.
  redirect("/notaries/N261000NC");
}