"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (avatarKey: string) => void;
};

export default function AvatarPickerModal({ open, onClose, onSelect }: Props) {
  const [avatarList, setAvatarList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // index ตรงกลาง (ตัวเริ่มต้น)
  const [currentIndex, setCurrentIndex] = useState(0);

  /* ================= LOAD AVATARS ================ */
  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const res = await fetch("/api/avatars");
        const data = await res.json();

        setAvatarList(data.avatars || []);
        setCurrentIndex(0); // default.png อยู่ตรงกลาง
      } catch (e) {
        console.error("Avatar load failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const count = avatarList.length;

  const loop = (i: number) => {
    if (i < 0) return count - 1;
    if (i >= count) return 0;
    return i;
  };

  const leftIndex = loop(currentIndex - 1);
  const centerIndex = loop(currentIndex);
  const rightIndex = loop(currentIndex + 1);

  const goLeft = () => setCurrentIndex((i) => loop(i - 1));
  const goRight = () => setCurrentIndex((i) => loop(i + 1));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-[80%] max-w-3xl rounded-3xl bg-white p-8 shadow-xl overflow-hidden"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
          >

            <h2 className="mb-2 text-center text-pine text-2xl font-bold">
              Customize Your Courtly Avatar!
            </h2>

            {loading ? (
              <p className="text-center text-neutral-500">Loading...</p>
            ) : (
              <>
                {/* ============ CAROUSEL ============ */}
                <div className="flex items-center justify-center gap-6 py-8">

                  {/* LEFT BUTTON */}
                  <button onClick={goLeft} className="text-neutral-500 hover:text-black">
                    <ChevronLeft size={30} />
                  </button>

                  {/* 3 AVATARS GROUP */}
                  <div className="flex items-center gap-10">
                    {/* LEFT SMALL */}
                    <motion.div
                      key={leftIndex}
                      animate={{ scale: 0.8, opacity: 0.5 }}
                      transition={{ type: "spring", stiffness: 150 }}
                      onClick={goLeft}
                    >
                      <AvatarCircle keyName={avatarList[leftIndex]} size={140} />
                    </motion.div>

                    {/* CENTER BIG */}
                    <motion.div
                      key={centerIndex}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 180 }}
                    >
                      <AvatarCircle
                        keyName={avatarList[centerIndex]}
                        size={200}
                        highlight
                      />
                    </motion.div>

                    {/* RIGHT SMALL */}
                    <motion.div
                      key={rightIndex}
                      animate={{ scale: 0.8, opacity: 0.5 }}
                      transition={{ type: "spring", stiffness: 150 }}
                      onClick={goRight}
                    >
                      <AvatarCircle keyName={avatarList[rightIndex]} size={140} />
                    </motion.div>
                  </div>

                  {/* RIGHT BUTTON */}
                  <button onClick={goRight} className="text-neutral-500 hover:text-black">
                    <ChevronRight size={30} />
                  </button>
                </div>

                {/* ============ DOT INDICATORS ============ */}
                <div className="flex justify-center gap-3 mt-2">
                  {avatarList.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-3.5 w-3.5 rounded-full cursor-pointer transition
                        ${
                          i === currentIndex
                            ? "bg-cambridge"
                            : "bg-platinum hover:bg-silver scale-[0.8]"
                        }
                      `}
                    />
                  ))}
                </div>

                {/* ============ SAVE BUTTON ============ */}
                <button
                  onClick={() => onSelect(avatarList[currentIndex])}
                  className="mt-8 mx-auto block rounded-xl bg-pine px-8 py-3 text-white text-m font-semibold hover:bg-pine/90"
                >
                  Set my Avatar profile!
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   Avatar Bubble Component — **SHOW REAL IMAGE**
============================================================ */
function AvatarCircle({
  keyName,
  size,
  highlight,
}: {
  keyName: string;
  size: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        rounded-full flex items-center justify-center overflow-hidden border
        ${highlight ? "border-cambridge border-2 ring-1 ring-platinum shadow-lg " : "border-neutral-300"}
      `}
      style={{ width: size, height: size }}
    >
      <Image
        src={`/avatars/${keyName}`}
        alt={keyName}
        width={size}
        height={size}
        className="object-cover"
      />
    </div>
  );
}
