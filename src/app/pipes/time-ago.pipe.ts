import { Pipe, PipeTransform } from '@angular/core';

// Humans read "2 hours ago" much faster than "Mar 22, 2026 10:30 AM" — this pipe handles
// that conversion everywhere we show timestamps (post dates, message times, group creation dates)
@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  // Accepts string | Date | null | undefined so it works with raw API strings
  // (ISO 8601 from the backend) and gracefully handles cases where the field is missing
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';

    const date = new Date(value);
    // isNaN guard handles malformed date strings from the API — return empty rather than crash
    if (isNaN(date.getTime())) return '';

    // Using Math.floor so we never show "1 hour ago" when only 59 minutes have passed —
    // always rounds down to the completed unit, not the nearest one
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    // "just now" threshold is 10 seconds — anything below that feels instantaneous,
    // and showing "3s ago" for a freshly posted comment would look jittery
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    // Singular vs plural handled explicitly — "1 mins ago" would look like a typo
    if (minutes < 60) return minutes === 1 ? '1 min ago' : `${minutes} mins ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    // "yesterday" is more human than "1 day ago" — everyone understands it immediately
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;

    const weeks = Math.floor(days / 7);
    // Cap weeks at 5 (roughly a month) — after that we switch to months for clarity
    if (weeks < 5) return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;

    // Approximating months as 30 days — not perfectly accurate but close enough for display
    const months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`;

    // Approximating a year as 365 days — ignores leap years but this is a UI display pipe,
    // not a financial calculator
    const years = Math.floor(days / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}
