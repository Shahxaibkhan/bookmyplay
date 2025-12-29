import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateReferenceCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function formatPrice(price: number, currency: 'USD' | 'IDR' | 'MYR' | 'PKR' = 'USD'): string {
  let locale = 'en-US';
  if (currency === 'PKR') locale = 'en-PK';
  if (currency === 'IDR') locale = 'id-ID';
  if (currency === 'MYR') locale = 'ms-MY';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
