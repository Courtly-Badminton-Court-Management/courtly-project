"use client";

export default function WhyChooseUs() {
  return (
    <section aria-labelledby="why-title" className="grid gap-8 md:grid-cols-[1.05fr_1fr]">
      {/* Big image */}
      <img
        src="/images/about/why-hero.jpg"
        alt=""
        className="h-[340px] w-full rounded-3xl object-cover shadow-lg md:h-[520px]"
      />

      {/* Reasons */}
      <div>
        <div className="mb-3 inline-block rounded-full bg-rose-100 px-4 py-1 text-sm font-semibold text-rose-700">
          Why should you join us for badminton?
        </div>
        <h2 id="why-title" className="mb-4 text-3xl font-extrabold tracking-tight text-pine md:text-4xl">
          Why choose us?
        </h2>

        <p className="mb-5 leading-relaxed text-neutral-700">
          Badminton Park, Courtly, 10 standard badminton courts and helpful facilities. Book courts
          on our website 24/7 with instant confirmation.
        </p>

        {/* Two info cards */}
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

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat icon="/icons/court.svg" value="10" label="courts" hint="Standard Court" />
          <Stat icon="/icons/shower.svg" value="10" label="bathrooms" hint="More than" />
          <Stat icon="/icons/car.svg" value="25" label="cars" hint="Parking" />
          <Stat icon="/icons/cctv.svg" value="24" label="hours" hint="CCTV" />
        </div>
      </div>
    </section>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-lg font-bold">{title}</div>
      <p className="text-neutral-700">{body}</p>
    </div>
  );
}

function Stat({ icon, value, label, hint }: { icon: string; value: string; label: string; hint: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200">
      <img src={icon} alt="" className="h-10 w-10" />
      <div>
        <div className="text-xs text-neutral-500">{hint}</div>
        <div className="text-2xl font-extrabold leading-tight">{value} <span className="text-base font-semibold">{label}</span></div>
      </div>
    </div>
  );
}
