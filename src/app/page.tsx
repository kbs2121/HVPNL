import { redirect } from "next/navigation";

/** Default landing: Transmission Network GIS */
export default function Home() {
  redirect("/dashboard/power-grid");
}
