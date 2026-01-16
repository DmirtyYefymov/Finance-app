import { describe, it, expect } from 'vitest';
import { convertFromUAH, convertToUAH } from '../services/exchangeRate';

describe('exchangeRate', () => {
    const rates = {
        USD: 40,
        EUR: 45,
        lastUpdated: new Date().toISOString(),
    };

    it('converts UAH to USD', () => {
        expect(convertFromUAH(4000, 'USD', rates)).toBe(100);
    });

    it('converts USD to UAH', () => {
        expect(convertToUAH(100, 'USD', rates)).toBe(4000);
    });

    it('returns same amount for UAH', () => {
        expect(convertFromUAH(1000, 'UAH', rates)).toBe(1000);
        expect(convertToUAH(1000, 'UAH', rates)).toBe(1000);
    });
});
