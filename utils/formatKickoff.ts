/**
 * Kickoff time in Bucharest local time, regardless of the visitor's own
 * timezone or the US game time's origin — a US kickoff time rendered in
 * the visitor's timezone would be wrong for a Romanian audience.
 */
export function formatKickoff(kickoff: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Bucharest",
  }).format(new Date(kickoff));
}
