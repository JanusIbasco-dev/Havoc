export function formatHours(value?: number | null) {
  if (!value || value < 0) {
    return "0h";
  }

  return `${Math.round(value)}h`;
}

export function formatDate(value?: string) {
  return formatPhilippineDate(value);
}

export function formatPhilippineDate(value?: string | Date | null) {
  if (!value) {
    return "Unknown";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date);
}
