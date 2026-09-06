"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { useHydrated } from "@/hooks/useHydrated";

type MotionSectionProps = HTMLMotionProps<"section"> & {
  id?: string;
  className?: string;
  children: React.ReactNode;
};

export function MotionSection({
  id,
  className,
  children,
  ...props
}: MotionSectionProps) {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();

  const variants = {
    hidden: {
      opacity: reduceMotion || !hydrated ? 1 : 0,
      y: reduceMotion || !hydrated ? 0 : 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduceMotion
        ? { duration: 0 }
        : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <motion.section
      id={id}
      className={className}
      initial={hydrated ? "hidden" : false}
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -8% 0px" }}
      variants={variants}
      {...props}
    >
      {children}
    </motion.section>
  );
}
