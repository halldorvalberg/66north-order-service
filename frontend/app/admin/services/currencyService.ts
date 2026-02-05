import type { CurrencyTotal, CurrencyBreakdownItem } from '../types/order.types';

// Currency conversion rates (approximate - for display purposes)
export const CURRENCY_RATES: Record<string, number> = {
    ISK: 1,
    USD: 138.89,
    EUR: 153.85,
    GBP: 175.45,
    SEK: 13.86,
    NOK: 12.84,
};

export const currencyService = {
    /**
     * Format price with currency symbol
     */
    formatPrice(amount: number, currency: string): string {
        if (currency === 'ISK') {
            return `${amount.toLocaleString()} kr`;
        }
        const symbols: Record<string, string> = {
            USD: '$',
            EUR: '€',
            GBP: '£',
        };
        return `${symbols[currency] || ''}${amount.toLocaleString()}`;
    },

    /**
     * Convert amount to ISK equivalent
     */
    toISK(amount: number, currency: string): number {
        return amount * (CURRENCY_RATES[currency] || 1);
    },

    /**
     * Calculate total revenue in ISK
     */
    calculateTotalRevenueISK(currencyTotals: CurrencyTotal[]): number {
        return currencyTotals.reduce((sum, rev) => {
            return sum + this.toISK(rev.total, rev.currency);
        }, 0);
    },

    /**
     * Create currency breakdown with ISK equivalents and percentages
     */
    createCurrencyBreakdown(currencyTotals: CurrencyTotal[]): CurrencyBreakdownItem[] {
        const totalRevenueISK = this.calculateTotalRevenueISK(currencyTotals);
        
        return currencyTotals
            .map(rev => {
                const iskEquivalent = this.toISK(rev.total, rev.currency);
                const percentage = totalRevenueISK > 0 ? (iskEquivalent / totalRevenueISK) * 100 : 0;
                return {
                    ...rev,
                    iskEquivalent,
                    percentage,
                };
            })
            .sort((a, b) => b.iskEquivalent - a.iskEquivalent);
    },

    /**
     * Get all unique currencies from the breakdown
     */
    getUniqueCurrencies(currencyTotals: CurrencyTotal[]): string[] {
        return currencyTotals.map(ct => ct.currency);
    },
};
