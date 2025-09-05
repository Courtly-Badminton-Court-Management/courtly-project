export function AuthCard({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl backdrop-blur-sm border border-gray-200">
      <h1 className="mb-1 text-3xl font-bold text-gray-800">{title}</h1>
      {subtitle && <p className="mb-6 text-sm text-gray-600">{subtitle}</p>}
      {children}
    </div>
  );
}