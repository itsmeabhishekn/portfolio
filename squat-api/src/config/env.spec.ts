import { describe, expect, it } from '@jest/globals';
import { parseCorsOrigins } from './env.js';

describe('parseCorsOrigins', () => {
  it('strips quotes, spaces, and trailing slashes', () => {
    expect(
      parseCorsOrigins(' "https://abhishekn.dev/" , http://localhost:5173 '),
    ).toEqual(['https://abhishekn.dev', 'http://localhost:5173']);
  });

  it('rejects an empty list', () => {
    expect(() => parseCorsOrigins('  , "" ')).toThrow(/CORS_ORIGINS/);
  });
});
