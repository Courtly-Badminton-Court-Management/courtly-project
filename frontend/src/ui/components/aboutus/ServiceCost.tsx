"use client";

export default function ServiceCost() {
  return (
    <section aria-labelledby="price-title" className="grid gap-8 md:grid-cols-[1fr_1.15fr]">
      {/* Price card */}
      <div>
        <div className="mb-3 inline-block rounded-full bg-rose-100 px-4 py-1 text-sm font-semibold text-rose-700">
          Price
        </div>
        <h2 id="price-title" className="mb-4 text-3xl font-extrabold tracking-tight">
          Service Cost
        </h2>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold text-neutral-600">10:00 AM – 22:00 PM</div>
          <div className="mb-4 text-2xl font-extrabold">Monday – Sunday</div>
          <ul className="list-disc space-y-2 pl-5 text-neutral-700">
            <li>Price: 200 THB/hour</li>
            <li>Reserve at least 1 hour before playtime and pay in full to confirm.</li>
            <li>Up to 6 hours/day per customer, up to 1 month in advance.</li>
          </ul>

          <button
            type="button"
            className="mt-5 rounded-xl bg-pine px-4 py-2 font-semibold text-white hover:bg-emerald-800"
          >
            Book the courts!
          </button>
        </div>
      </div>

      {/* Small gallery */}
      <div className="grid grid-cols-2 gap-4">
        <img src="/images/about/gallery-1.jpg" alt="" className="h-48 w-full rounded-2xl object-cover" />
        <img src="/images/about/gallery-2.jpg" alt="" className="h-48 w-full rounded-2xl object-cover" />
        <img src="/images/about/gallery-3.jpg" alt="" className="h-48 w-full rounded-2xl object-cover" />
        <img src="/images/about/gallery-4.jpg" alt="" className="h-48 w-full rounded-2xl object-cover" />
      </div>
    </section>
  );
}
