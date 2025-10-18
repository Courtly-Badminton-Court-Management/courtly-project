"use client";

export default function CourtLocation() {
  return (
    <section aria-labelledby="loc-title">
      <div className="mb-3 inline-flex items-center gap-3">
        <span className="rounded-full bg-rose-100 px-4 py-1 text-sm font-semibold text-rose-700">Location</span>
        <span className="rounded-full bg-neutral-100 px-4 py-1 text-sm font-semibold text-neutral-700">
          2/1 Sana Nikhom 1 Soi 2, Chan Kasem, Chatuchak, Bangkok 10900
        </span>
      </div>

      {/* Map placeholder (swap for real map/embed) */}
      <div className="overflow-hidden rounded-3xl border shadow-sm">
        {/* Example embed (replace src with your map link or component) */}
        <iframe
          title="Courtly Location"
          src="https://maps.google.com/maps?q=Chatuchak%20Bangkok&t=&z=13&ie=UTF8&iwloc=&output=embed"
          className="h-[420px] w-full"
        />
      </div>
    </section>
  );
}
