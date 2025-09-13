"use client";

import Button from "@/ui/components/basic/ฺButton";

export default function PlayerAboutUsPage() {
  return (
    <main className="mx-auto max-w-4xl p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">About Courtly</h1>
        <p className="text-neutral-600">A badminton court booking system that makes availability transparent and payment effortless.</p>
      </header>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Why we built this</h2>
        <p className="text-neutral-700">
          No more calling or DM’ing admins to ask “is this slot free?”. See availability by day, pick consecutive hours,
          pay with coins, and manage your bookings & refunds seamlessly.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Feature title="Transparent Calendar" desc="Month view with % availability and clear closed days." />
          <Feature title="Simple Booking" desc="Pick slots, confirm, and you’re done." />
          <Feature title="Wallet & Refunds" desc="Top-up via slip, auto-capture and refund by policy." />
        </div>

        <div className="mt-6">
          <Button label="Get Started" onClick={()=>alert("Navigate to Sign Up")} />
        </div>
      </section>
    </main>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-base font-semibold">{title}</div>
      <div className="text-sm text-neutral-600">{desc}</div>
    </div>
  );
}
