import { AdminLoginClient } from "./AdminLoginClient";

type AdminLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const expiredByIdle = pickValue(params.reason) === "expired";
  return <AdminLoginClient expiredByIdle={expiredByIdle} />;
}
