import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as Czech Koruna (CZK).
 * 
 * @param value The number to format.
 * @returns The formatted currency string (e.g., "1 234,50 Kč") or a placeholder if input is invalid.
 */
export function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
        return '-'; // Or return '0,00 Kč', or handle as needed
    }

    return new Intl.NumberFormat('cs-CZ', { 
        style: 'currency', 
        currency: 'CZK',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}
