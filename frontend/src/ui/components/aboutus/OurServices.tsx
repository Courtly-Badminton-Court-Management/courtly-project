"use client";

const items = [
  {
    icon: "/icons/rackets.svg",
    title: "Rackets available for rent",
    desc: "At 40 THB per racket.",
  },
  {
    icon: "/icons/food.svg",
    title: "Food & beverages available",
    desc: "Fresh dishes, drinks, ice cream, bakery treats.",
  },
  {
    icon: "/icons/lounge.svg",
    title: "Lounge & relaxing dining area",
    desc: "Rest, enjoy refreshments, and socialize between matches.",
  },
  {
    icon: "/icons/parking.svg",
    title: "Ample parking space provided",
    desc: "Spacious, convenient parking near the venue.",
  },
];

export default function OurServices() {
  return (
    <section aria-labelledby="services-title">
      <div className="mb-3 inline-block rounded-full bg-rose-100 px-4 py-1 text-sm font-semibold text-rose-700">
        Services
      </div>
      <h2 id="services-title" className="mb-6 text-3xl font-extrabold tracking-tight">
        Our Services
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        {items.map((s) => (
          <div key={s.title} className="flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-sm">
            <img src={s.icon} alt="" className="mt-1 h-12 w-12" />
            <div>
              <div className="text-lg font-bold">{s.title}</div>
              <p className="text-neutral-700">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
