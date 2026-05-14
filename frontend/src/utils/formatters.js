export function formatTime(value) {
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function shortName(name = "User") {
  return name.slice(0, 2).toUpperCase();
}

/** WhatsApp-style list time: time today, "Yesterday", weekday, or date */
export function formatChatListTime(value) {
  if (!value) return "";
  const d = new Date(value);
  const now = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const dayMs = 864e5;
  const diffDays = Math.floor((startOf(now) - startOf(d)) / dayMs);

  if (diffDays === 0) {
    return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(d);
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return new Intl.DateTimeFormat("en", { weekday: "short" }).format(d);
  }
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(d);
}
