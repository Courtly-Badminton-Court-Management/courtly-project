"use client";

export default function GetToKnowUs() {
  return (
    <section aria-labelledby="about-title" className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
      {/* Left: photo collage */}
      <div className="relative">
        {/* Big image */}
        <img
          src="/images/badminton-6.jpg"
          alt="Badminton shuttlecock on racket"
          className="h-[450px] w-[450px] rounded-3xl object-cover shadow-lg md:h-[620px]"
        />

        {/* Floating small image */}
        <img
          src="/images/badminton-3.jpg"
          alt="Indoor badminton courts"
          className="absolute top-[80%] left-[100%] h-40 w-56 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-4 border-white object-cover shadow-xl md:h-[300px] md:w-[200px] animate-float"
        />
      </div>

      {/* Right: copy + quick contacts */}
      <div>
        <div className="mb-2 inline-block rounded-full bg-rose-100 px-4 py-1 text-sm font-semibold text-cherry">
          About Us
        </div>
        <h1 id="about-title" className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">
          Get To Know <span className="text-pine">Courtly</span>
        </h1>

        <p className="text-lg text-neutral-700 leading-relaxed md:text-xl md:leading-loose">
          <b>Courtly</b> is Thailand’s leading online badminton court booking platform — designed for players, clubs, 
          and venue owners to connect effortlessly. Whether you’re reserving a quick match with friends or managing 
          multiple courts, <b>Courtly</b> offers a fast, transparent, and stress-free booking experience with secure payment 
          and real-time updates. Our goal is to make every badminton session simple and enjoyable — 
          so players can focus on what truly matters: the game.
        </p>

        {/* contact chips */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ContactChip icon="/icons/phone-call.png" title="Phone" value="0998888777" />
          <ContactChip icon="/icons/facebook.png" title="Facebook" value="Courtly" />
          <ContactChip
            icon="/icons/email.png"
            title="Email"
            value="courtly.project@gmail.com"
            small
          />
          <ContactChip icon="/icons/web.png" title="Website" value="courtlyeasy.app" />
        </div>
      </div>
    </section>
  );
}

function ContactChip({
  icon,
  title,
  value,
  small = false,
}: {
  icon: string;
  title: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-lg hover:shadow-grey-200">
      <div className="flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110">
        <img src={icon} alt="" className="h-10 w-10" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-neutral-500">{title}</div>
        <div
          className={`truncate font-semibold ${
            small ? "text-xs" : "text-base"
          } text-neutral-900`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

