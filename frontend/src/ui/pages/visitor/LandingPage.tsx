"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import BrandMark from "@/ui/components/basic/BrandMark";
import Button from "@/ui/components/basic/Button";
import AvailableSlotPanel from "@/ui/components/homepage/AvailableSlotPanel";

export default function LandingPage() {
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    setToday(dayjs().format("YYYY-MM-DD"));
  }, []);

  return (
    <div className="relative min-h-dvh overflow-hidden text-onyx">
      {/* ===== BG: สนามแบดจริง ===== */}
      <div
        className="absolute inset-0 -translate-y-[60px] z-[0] bg-[url('/brand/court.png')] bg-cover bg-center brightness-105"
        aria-hidden
      />
      {/* ===== OVERLAY ===== */}
      <div className="absolute inset-0 z-[0] bg-gradient-to-b from-white/100 via-white/85 to-white/50" />

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-[2]">
        {/* NAVBAR */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex w-full items-center justify-between px-4 sm:px-6 py-3 bg-white/85 backdrop-blur-md shadow-sm"
        >
          <Link href="/" className="flex items-center gap-3">
            <BrandMark />
          </Link>

          <div className="hidden sm:flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/login">
                <Button
                  label="Sign in"
                  bgColor="bg-transparent"
                  textColor="text-onyx"
                  hoverBgColor="hover:bg-pine/10"
                  className="border border-platinum transition-all text-sm px-3 py-2"
                />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/register">
                <Button label="Create account" className="text-sm px-3 py-2" />
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu buttons */}
          <div className="flex sm:hidden items-center gap-2">
            <Link href="/login">
              <Button
                label="Sign in"
                bgColor="bg-white/80"
                textColor="text-onyx"
                hoverBgColor="hover:bg-white/70"
                className="border border-platinum px-2 py-1 text-xs"
              />
            </Link>
            <Link href="/register">
              <Button label="Join" className="px-2 py-1 text-xs" />
            </Link>
          </div>
        </motion.nav>

        {/* HERO */}
        <header className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 items-center gap-8 sm:gap-10">
          {/* LEFT TEXT SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.1)]">
              <span className="bg-gradient-to-r from-pine to-cambridge bg-clip-text text-transparent">
                Book badminton courts
              </span>
              <br />
              the friendly way.
            </h1>

            <p className="mt-4 text-sm sm:text-base max-w-md text-walnut mx-auto md:mx-0">
              Real-time availability. CL Coin wallet. Smooth booking experience.
              Designed for both players and managers.
            </p>

            {/* Buttons */}
            <motion.div
              className="mt-6 sm:mt-8 flex flex-wrap justify-center md:justify-start gap-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.15 } },
              }}
            >
              <motion.a
                href="/login"
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button
                  label="Welcome back to Courtly!"
                  bgColor="bg-white"
                  textColor="text-onyx"
                  hoverBgColor="hover:bg-white/80"
                  className="border border-platinum text-sm sm:text-base px-4 py-2 sm:px-5 sm:py-3"
                />
              </motion.a>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.96 }}
              >
                <Link href="/register">
                  <Button
                    label="Join Courtly now!"
                    className="text-sm sm:text-base px-4 py-2 sm:px-5 sm:py-3"
                  />
                </Link>
              </motion.div>
            </motion.div>

            <p className="mt-4 text-xs sm:text-sm text-walnut">
              Friendly • Energetic • Accessible
            </p>
          </motion.div>

          {/* RIGHT SLOT PANEL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white/90 border border-platinum shadow-lg backdrop-blur-md p-4 sm:p-5 
              h-[80dvh] sm:h-[420px] overflow-hidden"
          >
            {today ? (
              <AvailableSlotPanel clubId={1} selectedDate={today} mode="landing" />
            ) : (
              <div className="flex h-full items-center justify-center text-walnut text-sm">
                Loading availability...
              </div>
            )}
          </motion.div>
        </header>

        {/* FEATURES */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 grid sm:grid-cols-3 gap-6">
          {[
            {
              title: "Instant Booking",
              desc: "Tap your time, confirm, and you’re ready to play.",
              icon: "🏸",
            },
            {
              title: "CL Coin Wallet",
              desc: "Top up once. Pay seamlessly for every booking.",
              icon: "💰",
            },
            {
              title: "Smart Cancellation",
              desc: "Cancel early and get coins refunded automatically.",
              icon: "♻️",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
              }}
              className="rounded-2xl border border-platinum bg-white p-5 sm:p-6 text-center shadow-soft backdrop-blur-sm"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <h4 className="text-base sm:text-lg font-semibold">{item.title}</h4>
              <p className="text-xs sm:text-sm text-walnut mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* FOOTER */}
        <footer className="relative border-t border-platinum/70 bg-gradient-to-r from-white via-[#F9FAF9] to-white shadow-inner">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 pt-3 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-walnut gap-3">
            <div className="flex items-center gap-2">
              <BrandMark />
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-neutral-600">
              <Link href="/about-us" className="hover:text-pine transition-colors">
                About Us
              </Link>
            </div>

            <span className="text-neutral-500 text-xs sm:text-sm">
              © {new Date().getFullYear()} Courtly • Easy Court, Easy Life
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
