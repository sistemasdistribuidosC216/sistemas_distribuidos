function pad(value) {
  return String(value).padStart(2, "0");
}

export function toLocalDateInput(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toLocalTimeInput(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function combineDateTime(day, time) {
  return new Date(`${day}T${time}`);
}

export function formatDay(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(iso) {
  return toLocalTimeInput(new Date(iso));
}
