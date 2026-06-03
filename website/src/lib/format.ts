export function formatHours(value?: number | null) {
  if (!value || value < 0) {
    return "0h";
  }

  return `${Math.round(value)}h`;
}

export function formatDate(value?: string) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}
