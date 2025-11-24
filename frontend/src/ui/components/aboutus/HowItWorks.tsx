"use client";

type Step = {
  title: string;
  text: string;
};

const bookingSteps: Step[] = [
  {
    title: "Browse courts",
    text:
      "Go to the Booking page to view real-time available courts and time slots. Each slot clearly shows whether it is available, booked, or expired so you can decide quickly without asking staff.",
  },
  {
    title: "Pick your time",
    text:
      "Use the mini calendar to select your preferred day and time. Courtly keeps the schedule updated and prevents double bookings, so you always see the latest availability before you confirm.",
  },
  {
    title: "Confirm & pay with coins",
    text:
      "Review your booking details and confirm using your CL Coins balance. Once confirmed, coins are deducted instantly to secure your court and your booking is locked into the system.",
  },
  {
    title: "Receive your receipt",
    text:
      "After booking, a confirmation with your Booking ID is generated. You can download it as a PDF or simply show it at the venue during check-in for fast verification at the counter.",
  },
  {
    title: "View or cancel anytime",
    text:
      "Access Upcoming Bookings or your History page anytime. Cancellations can be made up to 24 hours before playtime and the system will handle coin refunds automatically.",
  },
];

const walletSteps: Step[] = [
  {
    title: "Open your wallet",
    text:
      "Navigate to the Wallet tab to view your live coin balance and find the PromptPay QR code ready for top-up. This is your starting point before every payment or booking.",
  },
  {
    title: "Transfer the payment",
    text:
      "Use any banking app to scan the PromptPay QR or make a manual transfer to the listed account. Keep the slip ready because it will be used as evidence for your top-up request.",
  },
  {
    title: "Submit top-up details",
    text:
      "Enter the amount (minimum 100 THB), select the transfer date and time, and upload a clear payment slip image. Check your details once more before submitting the request.",
  },
  {
    title: "Track approval status",
    text:
      "Your request appears as Pending in the wallet screen. Once reviewed by a manager, the status changes to Approved or Rejected and your balance is updated automatically.",
  },
  {
    title: "Review past transactions",
    text:
      "Visit your transaction history to view all past top-ups, check their statuses, and export your data as a CSV file for your own records or personal expense tracking.",
  },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="mt-10 md:mt-14">
      {/* Tag */}
    <div className="inline-block rounded-full bg-rose-100 px-4 py-1 text-sm font-semibold text-cherry mb-2">
        How It Works
    </div>


      {/* Booking Section */}
      <div>
        <h2
            id="how-title"
            className="my-4 text-2xl font-extrabold tracking-tight text-pine md:text-3xl"
        >
            How Courtly Booking Works
        </h2>

        <StepRow steps={bookingSteps} />
      </div>

      {/* Wallet Section */}
      <div>
        <h2 className="my-4 text-2xl font-extrabold tracking-tight text-pine md:text-3xl">
          How Courtly Wallet Top-Up Works
        </h2>

        <StepRow steps={walletSteps} />
      </div>
    </section>
  );
}

/**
 * Row wrapper with a horizontal line behind all step cards.
 */
function StepRow({ steps }: { steps: Step[] }) {
  return (
    <div className="relative">
      {/* horizontal line behind cards – desktop only */}
      <div className="pointer-events-none absolute left-[5%] right-[5%] top-[160px] hidden h-[3px] bg-pine md:block z-0" />

      <div className="grid items-stretch gap-6 md:grid-cols-5">
        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10">
            <StepCard index={idx} step={step} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCard({ index, step }: { index: number; step: Step }) {
  const number = index + 1;

  return (
    <div
      className="
        relative flex h-full flex-col justify-start
        rounded-2xl border border-platinum bg-white
        px-6 py-6 shadow-sm
      "
    >
      {/* Number + Title */}
      <div className="relative z-20 mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cherry text-base font-bold text-white">
          {number}
        </div>
        <h3 className="text-base font-bold text-neutral-900">{step.title}</h3>
      </div>

      {/* Paragraph */}
      <p className="text-sm leading-relaxed text-neutral-700">{step.text}</p>
    </div>
  );
}
