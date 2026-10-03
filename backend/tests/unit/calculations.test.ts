/// <reference types="node" />
import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateCft,
  calculateCbmFromCft,
  calculateDimensions,
  convertLbsToKg,
} from '../../src/common/utils/calculations.js';

describe('Logistics Calculations Pure Functions', () => {
  it('should correctly calculate CFT from dimensions and pieces', () => {
    // 42 x 38 x 48 inches with 8 pieces
    // (42 * 38 * 48 * 8) / 1728 = 358.87
    // Let's test standard single box: 36 x 30 x 36 with 6 pieces: (36 * 30 * 36 * 6) / 1728 = 135.00
    const cft = calculateCft(36, 30, 36, 6);
    assert.strictEqual(cft, 135.0);
  });

  it('should correctly calculate CBM from CFT', () => {
    // 135 CFT * 0.0283168 = 3.822768 => 3.82
    const cbm = calculateCbmFromCft(135.0);
    assert.strictEqual(cbm, 3.82);
  });

  it('should return 0 for invalid or non-positive dimension inputs', () => {
    assert.strictEqual(calculateCft(0, 30, 36, 1), 0);
    assert.strictEqual(calculateCft(-10, 30, 36, 1), 0);
    assert.strictEqual(calculateCft(NaN as any, 30, 36, 1), 0);
    assert.strictEqual(calculateCbmFromCft(-5), 0);
  });

  it('should convert LBS to KG accurately', () => {
    // 1850 lbs * 0.453592 = 839.1452 => 839.1 kg
    const kg = convertLbsToKg(1850);
    assert.strictEqual(kg, 839.1);
  });

  it('calculateDimensions should return both CFT and CBM', () => {
    const result = calculateDimensions(36, 30, 36, 6);
    assert.strictEqual(result.cft, 135.0);
    assert.strictEqual(result.cbm, 3.82);
  });
});