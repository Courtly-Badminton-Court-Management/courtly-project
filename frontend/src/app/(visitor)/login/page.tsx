import NoSSR from "@/ui/components/basic/NoSSR";
import LoginPage from "@/ui/pages/visitor/LoginPage";

export default function Page() {
  return (
    <NoSSR fallback={<div className="p-6 text-sm text-neutral-600">Loading…</div>}>
      <LoginPage />
    </NoSSR>
  );
}
