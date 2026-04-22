"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

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

  const variants = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 28 },
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
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      variants={variants}
      {...props}
    >
      {children}
    </motion.section>
  );
}
