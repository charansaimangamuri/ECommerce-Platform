import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merges conflicting Tailwind classes cleanly
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats prices into Indian Rupees (₹) or standard currency
export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}
