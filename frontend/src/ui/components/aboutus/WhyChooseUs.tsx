"use client";

export default function WhyChooseUs() {
  return (
    <section aria-labelledby="why-title" className="space-y-8">
      {/* --- TOP SECTION (2 columns) --- */}
      <div className="grid gap-8 md:grid-cols-[1.05fr_1fr]">
        {/* LEFT: Image */}
        <img
          src="/images/badminton-8.png"
          alt=""
          className="h-[300px] w-full rounded-3xl object-cover shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-grey-400 md:h-[490px]"
        />

        {/* RIGHT: Text + Info cards */}
        <div>
          <div className="mb-3 inline-block rounded-full bg-rose-100 px-4 py-1 text-sm font-semibold text-cherry">
            Why should you join us for badminton?
          </div>
          <h2
            id="why-title"
            className="mb-4 text-3xl font-extrabold tracking-tight text-pine md:text-4xl"
          >
            Why choose us?
          </h2>

          <p className="mb-5 text-xl leading-relaxed text-neutral-700">
            Badminton Park, <b>Courtly</b>, 10 standard badminton courts and helpful facilities. Book
            courts on our website 24/7 with instant confirmation.
          </p>

          {/* Info cards */}
          <div className="space-y-4">
            <InfoCard
              title="Business hours"
              body="Open Monday – Sunday, 10:00 AM – 22:00 PM. For reservations or appointments, contact us between 8:30 AM – 21:30 PM."
            />
            <InfoCard
              title="Comprehensive Facilities"
              body="Cozy lounge, dining area, racket rentals, daily booking screen, clean restrooms with hot showers and lockers, 24-hour CCTV, ample parking, and on-site food & beverages."
            />
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION (spans full width) --- */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat icon="/icons/shuttlecock.png" value="10" label="courts" hint="Standard Court" />
        <Stat icon="/icons/shower.png" value="20" label="bathrooms" hint="More than" />
        <Stat icon="/icons/parking.png" value="25" label="cars" hint="Ample Parking" />
        <Stat icon="/icons/cctv-camera.png" value="24" label="hours" hint="CCTV Camera" />
      </div>
    </section>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="group rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-grey-200 focus-within:-translate-y-1 focus-within:shadow-lg">
      <div className="text-lg font-bold">{title}</div>
      <p className="text-neutral-700">{body}</p>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  hint,
}: {
  icon: string;
  value: string;
  label: string;
  hint: string;
}) {
  return (
    <div
      className="
        group flex items-center gap-5 rounded-2xl bg-white p-6
        transition-shadow duration-300 ease-out
        focus-within:shadow-lg focus-within:shadow-gray-200"
      tabIndex={0} // keyboard focus
    >
      {/* Icon bubble (animates on hover/focus) */}
      <div
        className="
          relative flex h-16 w-16 items-center justify-center rounded-full bg-rose-100
          transition-transform duration-300 ease-out
          group-hover:scale-110 group-hover:-rotate-6
          group-focus-visible:scale-110 group-focus-visible:-rotate-6
        "
      >
        <img
          src={icon}
          alt=""
          className="
            h-10 w-10 transition-transform duration-300 ease-out
            group-hover:translate-y-[-2px] group-focus-visible:translate-y-[-2px]
          "
        />
      </div>

      {/* Text block */}
      <div className="min-w-0">
        {/* Hint (subtle rise + tint) */}
        <div
          className="
            text-sm text-neutral-600 transition-all duration-300 ease-out
            group-hover:-translate-y-0.5 group-hover:text-neutral-700
            group-focus-visible:-translate-y-0.5 group-focus-visible:text-neutral-700
          "
        >
          {hint}
        </div>

        {/* Value + label row */}
        <div className="mt-0.5">
          <span
            className="
              inline-block text-2xl font-extrabold leading-tight text-neutral-900
              transition-transform duration-300 ease-out
              group-hover:translate-y-[-2px] group-hover:scale-110
              group-focus-visible:translate-y-[-2px] group-focus-visible:scale-110
            "
          >
            {value}
          </span>
          <span
            className="
              ml-1 inline-block align-baseline text-base font-semibold text-neutral-900
              transition-transform duration-300 ease-out
              group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5
            "
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

