import { parseEmailServiceRole } from './emailServiceRole';

describe('email service role authorization', () => {
    test('accepts each supported role', () => {
        expect(parseEmailServiceRole('EmailMarketing')).toBe('EmailMarketing');
        expect(parseEmailServiceRole('LightningSilver')).toBe('LightningSilver');
        expect(parseEmailServiceRole('LightningGold')).toBe('LightningGold');
    });

    test('rejects unsupported and missing roles', () => {
        expect(() => parseEmailServiceRole('Sales')).toThrow('role must be one of');
        expect(() => parseEmailServiceRole(undefined)).toThrow('role must be one of');
    });
});
