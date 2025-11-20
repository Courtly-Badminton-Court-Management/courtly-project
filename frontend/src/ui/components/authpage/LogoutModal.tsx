"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { clientLogout } from "@/lib/auth/logout";
import Button from "@/ui/components/basic/Button";
import { LogOut, Loader2 } from "lucide-react";

type LogoutModalProps = {
  open: boolean;
  onClose: () => void;
  variant?: "player" | "manager";
};

export default function LogoutModal({ open, onClose, variant = "player", }: LogoutModalProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await clientLogout(qc);
      // simulate smooth exit
      await new Promise((r) => setTimeout(r, 900));
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Modal container */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.97 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 22,
              duration: 0.5,
            }}
            className="relative w-[min(90%,460px)] rounded-2xl bg-white/90 shadow-2xl ring-1 ring-black/10 backdrop-blur-xl overflow-hidden"
          >
            {/* animated top bar */}
            <motion.div
              className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-cherry via-pine to-cherry"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ originX: 0 }}
            />

            <div className="flex flex-col items-center text-center px-8 py-8 space-y-5 relative">
              {/* icon with pulse */}
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-full bg-cherry/10 text-cherry"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <LogOut size={24} strokeWidth={2.2} />
              </motion.div>

              {/* text */}
              <div>
                <h2 className="text-xl font-bold text-cherry mb-1">
                  {variant === "manager" ? 
                  ("Logging out?"):
                  ("Ready to Log Out?")}
                </h2>
                <p className="text-sm text-onyx leading-relaxed">
                  {variant === "manager" ? 
                  ("Great work today — take a break, you deserve it."):
                  ("You can come back anytime — your bookings and coins are safely saved.")}
                </p>
              </div>

              {/* actions */}
              <div className="flex w-full justify-center gap-4 pt-3">
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="w-1/2"
                >
                  <Button
                    label="Stay Logged In"
                    onClick={onClose}
                    full
                    bgColor="bg-white"
                    textColor="text-pine"
                    hoverBgColor="hover:bg-pine/10"
                  />
                </motion.div>

                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="w-1/2"
                >
                  <Button
                    label={
                      isLoggingOut ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin w-4 h-4" />
                          Logging out...
                        </span>
                      ) : (
                        "Logout"
                      )
                    }
                    backIcon={isLoggingOut ? undefined : "LogOut"}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    full
                    bgColor="bg-cherry"
                    hoverBgColor="hover:bg-cherry/90"
                    textColor="text-white"
                  />
                </motion.div>
              </div>
            </div>

            {/* subtle ambient glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{
                boxShadow: [
                  "0 0 0px rgba(194, 54, 58, 0)",
                  "0 0 28px rgba(194, 54, 58, 0.15)",
                  "0 0 0px rgba(194, 54, 58, 0)",
                ],
              }}
              transition={{ duration: 6, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
