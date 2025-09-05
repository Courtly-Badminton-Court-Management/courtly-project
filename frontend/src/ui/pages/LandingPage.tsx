import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-courtBg text-onyx">
      {/* NAV */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-platinum ring-2 ring-walnut grid place-items-center">
            <span className="text-walnut">🏸</span>
          </div>
          <span className="text-2xl font-bold tracking-wide">COURTLY</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-platinum px-4 py-2 text-sm hover:bg-white/60"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-sea px-4 py-2 text-sm font-semibold text-white hover:bg-pine transition"
          >
            Create account
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* court-y background decoration */}
        <div
          className="absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]"
          aria-hidden
        >
          <svg className="h-full w-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
            <rect x="0" y="0" width="1200" height="600" fill="#75B2A0" />
            <rect x="140" y="80" width="920" height="440" fill="none" stroke="#E2E2E2" strokeWidth="6"/>
            {/* court lines */}
            <line x1="600" y1="80" x2="600" y2="520" stroke="#E2E2E2" strokeWidth="4"/>
            <line x1="140" y1="180" x2="1060" y2="180" stroke="#E2E2E2" strokeWidth="3"/>
            <line x1="140" y1="420" x2="1060" y2="420" stroke="#E2E2E2" strokeWidth="3"/>
            <line x1="360" y1="80" x2="360" y2="520" stroke="#E2E2E2" strokeWidth="2"/>
            <line x1="840" y1="80" x2="840" y2="520" stroke="#E2E2E2" strokeWidth="2"/>
          </svg>
        </div>

        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Book badminton courts, <br /> the friendly way.
            </h1>
            <p className="mt-3 max-w-prose text-walnut">
              See availability at a glance, pick your time, and you’re all set.
              No more DM back-and-forth.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#availability"
                className="rounded-lg bg-courtDeep px-5 py-3 text-white font-semibold hover:bg-sea transition"
              >
                View availability
              </a>
              <Link
                href="/register"
                className="rounded-lg border border-platinum px-5 py-3 font-semibold hover:bg-white/70"
              >
                Create account
              </Link>
            </div>
            <p className="mt-3 text-sm text-walnut">Friendly • Energetic • Accessible</p>
          </div>

          {/* teaser card */}
          <div className="rounded-2xl border border-platinum bg-white/80 p-5 shadow-soft backdrop-blur-sm">
            <div className="rounded-lg bg-gradient-to-br from-platinum/60 to-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Today’s snapshot</h3>
                <span className="rounded-md bg-cambridge px-2 py-1 text-xs text-white">
                  Live
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-platinum p-3">
                  <div className="text-2xl font-bold text-sea">12</div>
                  <div className="text-xs text-walnut">Slots open</div>
                </div>
                <div className="rounded-lg border border-platinum p-3">
                  <div className="text-2xl font-bold text-brownSugar">3</div>
                  <div className="text-xs text-walnut">Courts</div>
                </div>
                <div className="rounded-lg border border-platinum p-3">
                  <div className="text-2xl font-bold text-onyx">1h</div>
                  <div className="text-xs text-walnut">per booking</div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-walnut">
                *Calendar component coming soon.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* AVAILABILITY SECTION (จะใส่ตารางจริงภายหลัง) */}
      <section id="availability" className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-platinum bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Check court availability</h2>
            <span className="text-sm text-walnut">Guest view</span>
          </div>

          <div className="grid place-items-center rounded-lg border border-dashed border-platinum p-10">
            <p className="text-walnut">
              📅 Your availability table will render here (component to add later).
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-walnut">
              Want to book? Please{" "}
              <Link href="/register" className="font-semibold text-brownSugar underline">
                create an account
              </Link>{" "}
              or{" "}
              <Link href="/login" className="font-semibold text-sea underline">
                sign in
              </Link>
              .
            </p>
            <div className="flex gap-2">
              <button className="rounded-lg border border-platinum px-4 py-2 text-sm hover:bg-white/70">
                Previous
              </button>
              <button className="rounded-lg bg-sea px-4 py-2 text-sm font-semibold text-white hover:bg-pine">
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-platinum/70 bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 text-sm text-walnut">
          <span>© {new Date().getFullYear()} Courtly</span>
          <span>“Book Now” • “You’re all set!”</span>
        </div>
      </footer>
    </div>
  );
}
