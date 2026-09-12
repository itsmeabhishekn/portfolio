import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </Svg>
  );
}

export function WorkoutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 8v8M17 8v8M4 10v4M20 10v4M7 12h10" />
    </Svg>
  );
}

export function ProgressIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 19h16M6 16l4-5 3 3 5-7" />
    </Svg>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </Svg>
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </Svg>
  );
}
