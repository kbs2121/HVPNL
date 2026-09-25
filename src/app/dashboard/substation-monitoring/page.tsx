import { redirect } from "next/navigation";

/** Alias — Substation GIS lives at /dashboard/substation-gis */
export default async function SubstationMonitoringAliasPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; id?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.code) qs.set("code", params.code);
  else if (params.id) {
    qs.set(/^\d+$/.test(params.id) ? "code" : "id", params.id);
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/dashboard/substation-gis${suffix}`);
}
