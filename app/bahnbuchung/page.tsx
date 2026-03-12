import { redirect } from "next/navigation";

export default function BahnbuchungRedirect() {
  redirect("/bahnbuchung-public?ref=intern");
}
