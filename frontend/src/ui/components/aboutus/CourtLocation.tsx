"use client";

export default function CourtLocation() {
  return (
    <section aria-labelledby="loc-title" className="space-y-5">
      {/* Section header */}
      <div className="mb-3 inline-flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-rose-100 px-4 py-1 text-sm font-semibold text-rose-700">
          Location
        </span>
        <span className="rounded-full bg-neutral-100 px-4 py-1 text-sm font-semibold text-neutral-700">
          72/1 Sana Nikhom 1 Soi 2, Chan Kasem, Chatuchak, Bangkok 10900
        </span>
      </div>

      {/* Google Maps embed */}
      <div className="overflow-hidden rounded-3xl border shadow-sm">
        <iframe
          title="Courtly Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.6452373729745!2d100.566634!3d13.827057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29ca86e0f1b9b%3A0x6fa23f8dfe7b3c12!2s72%2F1%20Sana%20Nikhom%201%20Soi%202%2C%20Chan%20Kasem%2C%20Chatuchak%2C%20Bangkok%2010900!5e0!3m2!1sen!2sth!4v1730000000000!5m2!1sen!2sth"
          className="h-[420px] w-full"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
