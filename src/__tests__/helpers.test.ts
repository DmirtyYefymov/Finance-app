import { describe, it, expect } from 'vitest';
import { formatCurrency, safeJSONParse, generateId } from '../utils/helpers';

describe('helpers', () => {
    it('formats currency correctly', () => {
        expect(formatCurrency(1234.56)).toBe('1,234.56');
        expect(formatCurrency(0)).toBe('0.00');
    });

    it('parses JSON safely', () => {
        expect(safeJSONParse('{"test": 123}', {})).toEqual({ test: 123 });
        expect(safeJSONParse('invalid', {})).toEqual({});
        expect(safeJSONParse(null, [])).toEqual([]);
    });

    it('generates unique IDs', () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1).not.toBe(id2);
        expect(id1).toContain('-');
    });
});
