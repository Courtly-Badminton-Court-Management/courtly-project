"use client";

import Image from "next/image";
import { CreditCard, Info } from "lucide-react";

export default function BankInfoPanel() {
  return (
    <section
      className="
        relative flex flex-col gap-6 rounded-2xl border border-white/40 
        bg-white/50 backdrop-blur-xl shadow-sm p-5 sm:p-6 md:p-7 
        transition-all duration-300 hover:shadow-md
      "
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b-4 border-pine/80 pb-2">
        <div className="rounded-full bg-pine/10 p-2 text-pine">
          <CreditCard size={18} strokeWidth={2.2} />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-pine">Bank Details</h2>
          <p className="text-sm text-neutral-600">
            For CL Coin top-up verification
          </p>
        </div>
      </div>

      {/* Bank Info */}
      <div
        className="
          flex flex-col md:flex-row md:items-start md:justify-between
          gap-5 md:gap-8 w-full
        "
      >
        {/* QR Section */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3 w-full md:w-auto">
          <Image
            src="/brand/qr-code.png"
            alt="PromptPay QR"
            width={160}
            height={160}
            className="max-w-[140px] w-full h-auto rounded-xl shadow-sm mx-auto md:mx-0"
            priority
          />
          <span className="text-sm font-medium text-neutral-600">
            Scan & Pay via PromptPay
          </span>
        </div>

        {/* Bank Detail Section */}
        <div className="flex-1 space-y-2 sm:space-y-3 text-sm sm:text-base text-neutral-700">
          <p className="font-bold text-emerald-900 text-base sm:text-lg">
            Kasikorn Bank (KBank)
          </p>
          <p>
            <b>Account Name:</b> Courtly Badminton Company
          </p>
          <p>
            <b>Account No:</b> 123-456-789
          </p>
          <p>
            <b>Reference:</b> (Optional) Your Username
          </p>
          <p className="text-xs text-neutral-500 italic">
            * Only transfers from Thai banks are supported.
          </p>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-2 flex items-start gap-2 border-t border-pine/20 pt-4">
        <div className="rounded-full bg-pine/10 p-2 text-pine shrink-0">
          <Info size={16} strokeWidth={2.2} />
        </div>
        <p className="text-sm leading-relaxed text-neutral-700">
          Our wallet system allows you to <b>book</b> and <b>cancel badminton court
          reservations</b> using <b>CL Coins</b>.  
          To <b>top up</b>, please transfer money to the bank account shown above, then
          fill out the top-up form and attach your payment slip for admin verification.  
          Once verified, coins will be credited to your wallet.
          <br />
          <br />
          <span className="font-medium text-pine">
            Approvals are available daily from 09:00 – 00:00.
          </span>{" "}
          If your request is not approved within 1 day, please contact us at{" "}
          <a
            href="mailto:courtly.project@gmail.com"
            className="text-sea font-semibold hover:underline"
          >
            courtly.project@gmail.com
          </a>
          .
        </p>
      </div>

      {/* Decorative Glow */}
      <div className="absolute -top-10 left-0 h-24 w-24 bg-emerald-200/30 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 right-0 h-24 w-24 bg-pine/20 blur-3xl rounded-full pointer-events-none" />
    </section>
  );
}
