"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Info } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onNext: () => void; // 👉 ส่งกลับไปให้ NavBar เท่านั้น
};

export default function WelcomeModal({ open, onClose, onNext }: Props) {
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
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button
              className="absolute right-4 top-4 text-neutral-500 hover:text-black"
              onClick={onClose}
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-4 text-center">
              <Info className="h-12 w-12 text-pine" />

              <h2 className="text-xl font-semibold text-neutral-900">
                Welcome to Courtly!
              </h2>

              <p className="text-sm text-neutral-600">
                Before you start booking, let’s set up your profile avatar.
              </p>

              <button
                onClick={onNext}
                className="mt-4 w-full rounded-lg bg-pine px-4 py-2 text-white font-semibold hover:bg-pine/90"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
