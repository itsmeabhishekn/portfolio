export function formatKg(value: number): string {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest}m`;
  }
  return `${hours}h ${rest}m`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function greetingForHour(hour: number): string {
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

export function formatRepTarget(
  target: number | { min: number; max: number },
): string {
  if (typeof target === "number") {
    return `${target} reps`;
  }
  return `${target.min}–${target.max} reps`;
}

export function firstName(displayName: string): string {
  const [name] = displayName.split(" ");
  return name ?? displayName;
}
