"use client";

import Link from "next/link";

export default function ServiceCost() {
  return (
    <section
      aria-labelledby="price-title"
      className="grid gap-10 md:grid-cols-[1fr_1.1fr] items-start"
    >
      {/* LEFT: Price Information */}
      <div>
        <div className="mb-3 inline-block rounded-full bg-rose-100 px-4 py-1 text-sm font-semibold text-cherry">
          Price
        </div>
        <h2
          id="price-title"
          className="mb-4 text-3xl font-extrabold tracking-tight text-pine md:text-4xl"
        >
          Service Cost
        </h2>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold text-neutral-600">
            10:00 AM – 22:00 PM
          </div>
          <div className="mb-4 text-2xl font-extrabold text-neutral-900">
            Monday – Sunday
          </div>
          <ul className="list-disc space-y-2 pl-5 text-neutral-700">
            <li>Price: 200 THB/hour</li>
            <li>
              Please reserve at least 1 hour before playtime and pay in full to
              confirm your booking.
            </li>
            <li>
              Each customer may book up to 6 hours per day and 1 month in
              advance.
            </li>
          </ul>

          <Link href="/booking" className="block w-fit">
            <button
              type="button"
              className="mt-6 rounded-xl bg-pine px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-emerald-800 focus:ring-2 focus:ring-pine/40"
            >
              Book the courts!
            </button>
          </Link>
        </div>
      </div>

      {/* RIGHT: Image Gallery */}
      <div className="grid grid-cols-2 gap-5">
        <img
          src="/images/badminton-9.png"
          alt="Indoor badminton courts"
          className="h-51 w-full rounded-2xl object-cover shadow-sm"
        />
        <img
          src="/images/badminton-10.png"
          alt="Players in a court"
          className="h-51 w-full rounded-2xl object-cover shadow-sm"
        />
        <img
          src="/images/badminton-11.png"
          alt="Court lounge area"
          className="h-51 w-full rounded-2xl object-cover shadow-sm"
        />
        <img
          src="/images/badminton-12.png"
          alt="Badminton rackets and shuttlecocks"
          className="h-51 w-full rounded-2xl object-cover shadow-sm"
        />
      </div>
    </section>
  );
}
