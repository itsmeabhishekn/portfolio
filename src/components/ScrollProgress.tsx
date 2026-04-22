"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.15,
  });

  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[var(--accent)]"
      style={{ scaleX, opacity: 0.85 }}
      aria-hidden
    />
  );
}
