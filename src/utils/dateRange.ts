export interface DayItem {
  date: Date;
  iso: string; // 'YYYY-MM-DD'
  apiDate: string; // 'YYYYMMDD'
  dayName: string; // 'Mon', 'सोम'
  dayNumber: number; // 19
  monthName: string; // 'Oct', 'कार्तिक'
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  offsetDays: number; // -7 to +21
  relativeLabel?: string; // '1 Wk Ago', 'Yesterday', 'Today', 'Tomorrow', '+3 Wks'
}

export const KATHMANDU_TIMEZONE = 'Asia/Kathmandu';

const NEP_DAYS = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];
const ENG_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const NEP_MONTHS = ['बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'];
const ENG_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Returns YYYY-MM-DD for any date in Kathmandu timezone.
 */
export function getKathmanduIsoDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KATHMANDU_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Returns current time formatted in Kathmandu timezone (e.g. "11:45 AM NPT" or "11:45:12 AM NPT").
 */
export function getKathmanduTimeString(d: Date = new Date(), includeSeconds = false): string {
  return (
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: true,
      timeZone: KATHMANDU_TIMEZONE,
    }).format(d) + ' NPT'
  );
}

/**
 * Returns a Date object representing midnight of today in Kathmandu.
 */
export function getKathmanduMidnight(): Date {
  const ktmIso = getKathmanduIsoDate(new Date());
  const [y, m, d] = ktmIso.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function formatIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatApiDate(d: Date): string {
  return formatIsoDate(d).replace(/-/g, '');
}

/**
 * Generates the full 1-month date window:
 * 1 week ago (-7 days) to 3 weeks next (+21 days) = 29 days total,
 * calibrated to Kathmandu timezone (NPT, UTC+5:45).
 */
export function getOneMonthDateRange(lang: 'en' | 'ne' = 'en'): DayItem[] {
  const days: DayItem[] = [];
  const today = getKathmanduMidnight();

  for (let offset = -7; offset <= 21; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    d.setHours(0, 0, 0, 0);

    const iso = formatIsoDate(d);
    const apiDate = formatApiDate(d);
    const dayOfWeek = d.getDay();
    const dayNumber = d.getDate();
    const monthIndex = d.getMonth();

    const dayName = lang === 'ne' ? NEP_DAYS[dayOfWeek] : ENG_DAYS[dayOfWeek];
    const monthName = lang === 'ne' ? NEP_MONTHS[monthIndex % 12] : ENG_MONTHS[monthIndex];

    const isToday = offset === 0;
    const isPast = offset < 0;
    const isFuture = offset > 0;

    let relativeLabel: string | undefined;
    if (offset === -7) relativeLabel = lang === 'ne' ? '१ हप्ता अघि' : '1 Wk Ago';
    else if (offset === -1) relativeLabel = lang === 'ne' ? 'हिजो' : 'Yesterday';
    else if (offset === 0) relativeLabel = lang === 'ne' ? 'आज' : 'Today';
    else if (offset === 1) relativeLabel = lang === 'ne' ? 'भोलि' : 'Tomorrow';
    else if (offset === 7) relativeLabel = lang === 'ne' ? '+१ हप्ता' : '+1 Week';
    else if (offset === 14) relativeLabel = lang === 'ne' ? '+२ हप्ता' : '+2 Weeks';
    else if (offset === 21) relativeLabel = lang === 'ne' ? '+३ हप्ता' : '+3 Weeks';

    days.push({
      date: d,
      iso,
      apiDate,
      dayName,
      dayNumber,
      monthName,
      isToday,
      isPast,
      isFuture,
      offsetDays: offset,
      relativeLabel,
    });
  }

  return days;
}

export function getMonthRangeBounds(): { minIso: string; maxIso: string; todayIso: string } {
  const today = getKathmanduMidnight();
  const past7 = new Date(today);
  past7.setDate(today.getDate() - 7);
  const future21 = new Date(today);
  future21.setDate(today.getDate() + 21);

  return {
    minIso: formatIsoDate(past7),
    maxIso: formatIsoDate(future21),
    todayIso: formatIsoDate(today),
  };
}
