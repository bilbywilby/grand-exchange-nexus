import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const formatPrice = (num: number | string): string => {
  let numericValue: number;
  if (typeof num === 'string') {
    let value = num.toLowerCase().replace(/,/g, '');
    let multiplier = 1;
    if (value.endsWith('k')) {
      multiplier = 1000;
      value = value.slice(0, -1);
    } else if (value.endsWith('m')) {
      multiplier = 1000000;
      value = value.slice(0, -1);
    } else if (value.endsWith('b')) {
      multiplier = 1000000000;
      value = value.slice(0, -1);
    }
    numericValue = parseFloat(value) * multiplier;
    if (isNaN(numericValue)) return num;
  } else {
    numericValue = num;
  }
  if (numericValue >= 1_000_000_000) return `${(numericValue / 1_000_000_000).toFixed(2)}b`;
  if (numericValue >= 1_000_000) return `${(numericValue / 1_000_000).toFixed(2)}m`;
  if (numericValue >= 1_000) return `${(numericValue / 1_000).toFixed(1)}k`;
  return numericValue.toLocaleString();
};