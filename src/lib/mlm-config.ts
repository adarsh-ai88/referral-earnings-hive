
import { MLMLevel } from "./types";

export const PRODUCT_PRICE = 150;
export const MLM_COMMISSION_TOTAL = 50;

export const MLM_LEVELS: MLMLevel[] = [
  { level: 1, commission: 10 },
  { level: 2, commission: 6 },
  { level: 3, commission: 4 },
  { level: 4, commission: 3 },
  { level: 5, commission: 2 },
  { level: 6, commission: 2 },
  { level: 7, commission: 3 },
  { level: 8, commission: 4 },
  { level: 9, commission: 6 },
  { level: 10, commission: 10 },
];

// Validate that total commission sums up to MLM_COMMISSION_TOTAL
const totalCommission = MLM_LEVELS.reduce((sum, level) => sum + level.commission, 0);
if (totalCommission !== MLM_COMMISSION_TOTAL) {
  console.error(`Total commission (${totalCommission}) does not equal ${MLM_COMMISSION_TOTAL}`);
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
