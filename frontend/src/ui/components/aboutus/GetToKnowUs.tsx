"use client";

export default function GetToKnowUs() {
  return (
    <section aria-labelledby="about-title" className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
      {/* Left: photo collage */}
      <div className="relative">
        <img
          src="/images/about/hero-1.jpg"
          alt=""
          className="h-[320px] w-full rounded-3xl object-cover shadow-lg md:h-[420px]"
        />
        <img
          src="/images/about/hero-2.jpg"
          alt=""
          className="absolute -bottom-8 left-8 h-40 w-56 rounded-2xl border-4 border-white object-cover shadow-xl md:h-56 md:w-80"
        />
      </div>

      {/* Right: copy + quick contacts */}
      <div>
        <div className="mb-2 inline-block rounded-full bg-rose-100 px-4 py-1 text-sm font-semibold text-rose-700">
          About Us
        </div>
        <h1 id="about-title" className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">
          Get To Know <span className="text-pine">Courtly</span>
        </h1>

        <p className="text-neutral-700 leading-relaxed">
          <b>Courtly</b> is Thailand’s leading online badminton court booking platform,
          built for players, clubs, and venue owners. Whether you’re reserving a quick
          match with friends or managing multiple courts, <b>Courtly</b> delivers a fast,
          transparent, stress-free experience — so everyone can focus on what truly
          matters: the game.
        </p>

        {/* contact chips */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ContactChip icon="/icons/phone.svg" title="Phone" value="0998888777" />
          <ContactChip icon="/icons/facebook.svg" title="Facebook" value="Courtly" />
          <ContactChip icon="/icons/mail.svg" title="Email" value="courtly.project@gmail.com" />
          <ContactChip icon="/icons/globe.svg" title="Website" value="courtlyeasy.app" />
        </div>
      </div>
    </section>
  );
}

function ContactChip({ icon, title, value }: { icon: string; title: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
      <img src={icon} alt="" className="h-8 w-8" />
      <div className="min-w-0">
        <div className="text-xs text-neutral-500">{title}</div>
        <div className="truncate font-semibold">{value}</div>
      </div>
    </div>
  );
}
