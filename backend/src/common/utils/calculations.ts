import { APP_CONSTANTS } from '../../config/constants.js';

/**
 * Calculates Cubic Feet (CFT) from dimensions in inches and piece count.
 * Formula: (length × width × height × pieces) / 1728
 *
 * @param length Length in inches
 * @param width Width in inches
 * @param height Height in inches
 * @param pieces Number of pieces (defaults to 1)
 * @returns CFT rounded to 2 decimal places, or 0 if inputs are invalid/non-positive
 */
export function calculateCft(
  length: number,
  width: number,
  height: number,
  pieces: number = 1
): number {
  if (
    typeof length !== 'number' ||
    typeof width !== 'number' ||
    typeof height !== 'number' ||
    typeof pieces !== 'number' ||
    isNaN(length) ||
    isNaN(width) ||
    isNaN(height) ||
    isNaN(pieces) ||
    length <= 0 ||
    width <= 0 ||
    height <= 0 ||
    pieces <= 0
  ) {
    return 0;
  }

  const rawCft = (length * width * height * pieces) / APP_CONSTANTS.CONVERSIONS.INCHES_TO_CFT_DIVISOR;
  return Number(rawCft.toFixed(2));
}

/**
 * Calculates Cubic Meters (CBM) from Cubic Feet (CFT).
 * Formula: CFT × 0.0283168
 *
 * @param cft Cubic Feet value
 * @returns CBM rounded to 2 decimal places, or 0 if input is invalid/non-positive
 */
export function calculateCbmFromCft(cft: number): number {
  if (typeof cft !== 'number' || isNaN(cft) || cft <= 0) {
    return 0;
  }

  const rawCbm = cft * APP_CONSTANTS.CONVERSIONS.CFT_TO_CBM_MULTIPLIER;
  return Number(rawCbm.toFixed(2));
}

/**
 * Convenience function to calculate both CFT and CBM directly from dimensions.
 */
export function calculateDimensions(
  length: number,
  width: number,
  height: number,
  pieces: number = 1
): { cft: number; cbm: number } {
  const cft = calculateCft(length, width, height, pieces);
  const cbm = calculateCbmFromCft(cft);
  return { cft, cbm };
}

/**
 * Converts weight in Pounds (LBS) to Kilograms (KG).
 * Formula: LBS × 0.453592
 */
export function convertLbsToKg(lbs: number): number {
  if (typeof lbs !== 'number' || isNaN(lbs) || lbs <= 0) {
    return 0;
  }

  const rawKg = lbs * APP_CONSTANTS.CONVERSIONS.LBS_TO_KG_MULTIPLIER;
  return Number(rawKg.toFixed(1));
}
