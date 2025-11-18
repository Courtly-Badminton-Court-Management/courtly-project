//frontend/src/ui/components/dashboardpage/SuccessCheckinToast.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function SuccessCheckinToast({
  open,
  username,
}: {
  open: boolean;
  username: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="
            fixed top-25 left-1/2 -translate-x-1/2 
            z-[999] px-6 py-4 rounded-2xl shadow-xl
            bg-white/95 border border-cambridge/60
            flex items-left gap-3
          "
        >
          <motion.div
            initial={{ scale: 0.6 }}
            animate={{ scale: 1.15 }}
            transition={{
              repeat: Infinity,
              repeatType: "mirror",
              duration: 0.6,
            }}
            className="text-cambridge"
          >
            <CheckCircle2 size={28} />
          </motion.div>

          <div className="text-pine font-semibold text-base">
            {username} checked in! 🎉  
            <div className="text-sm text-neutral-500 -mt-1">Have fun & enjoy your game!</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
