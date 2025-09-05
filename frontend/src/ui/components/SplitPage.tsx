export default function SplitPage({
  formSide,
  heroSide,
  heroPosition = "right", // 💡 NEW: "left" or "right"
}: {
  formSide: React.ReactNode;
  heroSide: React.ReactNode;
  heroPosition?: "left" | "right";
}) {
  const isHeroLeft = heroPosition === "left";

  return (
    <main className="min-h-dvh grid grid-cols-1 lg:grid-cols-2 bg-white overflow-hidden">
      {/* HERO */}
      <aside
        className={`relative hidden lg:block ${
          isHeroLeft ? "order-1" : "order-2"
        }`}
      >
        {heroSide}
      </aside>

      {/* FORM */}
      <section
        className={`flex items-center justify-center ${
          isHeroLeft ? "order-2" : "order-1"
        }`}
      >
        <div className="w-full max-w-3xl px-6 sm:px-10 lg:px-20 py-10">
          {formSide}
        </div>
      </section>
    </main>
  );
}
