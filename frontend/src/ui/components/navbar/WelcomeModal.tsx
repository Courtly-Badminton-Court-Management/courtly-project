"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Info, Calendar, Wallet } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

type Props = {
  open: boolean;
  onClose: () => void;
  onNext: () => void;
};

// ⭐ steps — พราวแก้ title / desc / image ได้ตามใจเลย
const steps = [
  {
    title: "Welcome to Courtly 👋",
    icon: <Info className="h-9 w-9 text-pine" />,
    image: "/courtly-guides/step1.png",
    desc: "Your one-stop system for booking badminton courts. Let’s walk you through the basics!",
  },
  {
    title: "How to Book a Court",
    icon: <Calendar className="h-9 w-9 text-pine" />,
    image: "/courtly-guides/step2.png",
    desc: "Check live availability, pick a slot, and confirm your booking instantly.",
  },
  {
    title: "Manage Wallet & History",
    icon: <Wallet className="h-9 w-9 text-pine" />,
    image: "/courtly-guides/step3.png",
    desc: "Top up CL Coins, track bookings, and manage your activities with ease.",
  },
];

export default function WelcomeModal({ open, onClose, onNext }: Props) {
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >


            {/* Animated Step */}
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center gap-5 text-center pt-4"
            >
              {/* ICON */}
              <div className="rounded-full bg-pine/10 p-2 text-pine">
                {steps[step].icon}
                </div>

              {/* IMAGE */}
              <div className="w-full h-52 md:h-55 relative overflow-hidden rounded-xl shadow-sm">
                <Image
                  src={steps[step].image}
                  alt="onboarding-step"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* TEXT */}
              <h2 className="text-xl text-pine font-bold text-neutral-900 px-3">
                {steps[step].title}
              </h2>

              <p className="text-sm text-neutral-600 leading-relaxed px-4">
                {steps[step].desc}
              </p>
            </motion.div>

            {/* Step indicators */}
            <div className="flex justify-center mt-4 gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === step ? "bg-pine w-5" : "bg-neutral-300 w-2"
                  }`}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={() => {
                if (isLast) onNext();
                else setStep(step + 1);
              }}
              className="mt-6 w-full rounded-lg bg-pine py-2.5 text-white text-lg font-semibold hover:bg-pine/90"
            >
              {isLast ? "That's it! Let's Go Smash!" : "Next"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
