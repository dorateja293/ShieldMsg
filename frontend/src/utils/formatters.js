export function formatTime(value) {
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function shortName(name = "User") {
  return name.slice(0, 2).toUpperCase();
}
