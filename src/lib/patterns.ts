/**
 * VIP-number pattern analysis. Computed once at insert time (mirrored by a DB
 * trigger) so that search filters translate to cheap boolean/column lookups.
 */

export interface NumberPatterns {
  digitSum: number;
  hasRepeatedDigits: boolean; // any run of 3+ identical digits, e.g. 000, 111
  isAscending: boolean; // strictly ascending sequence somewhere (e.g. 1234)
  isDescending: boolean; // strictly descending sequence somewhere (e.g. 4321)
  isMirror: boolean; // palindrome across the 10 digits
}

const onlyDigits = (mobile: string) => mobile.replace(/\D/g, "").slice(-10);

export function digitSum(mobile: string): number {
  return onlyDigits(mobile)
    .split("")
    .reduce((acc, d) => acc + Number(d), 0);
}

/** True when there is a run of `min` or more identical consecutive digits. */
export function hasRepeatedDigits(mobile: string, min = 3): boolean {
  const d = onlyDigits(mobile);
  let run = 1;
  for (let i = 1; i < d.length; i++) {
    run = d[i] === d[i - 1] ? run + 1 : 1;
    if (run >= min) return true;
  }
  return false;
}

/** True when a strictly ascending run of `min`+ digits exists (e.g. 3456). */
export function hasAscendingRun(mobile: string, min = 4): boolean {
  const d = onlyDigits(mobile);
  let run = 1;
  for (let i = 1; i < d.length; i++) {
    run = Number(d[i]) === Number(d[i - 1]) + 1 ? run + 1 : 1;
    if (run >= min) return true;
  }
  return false;
}

/** True when a strictly descending run of `min`+ digits exists (e.g. 6543). */
export function hasDescendingRun(mobile: string, min = 4): boolean {
  const d = onlyDigits(mobile);
  let run = 1;
  for (let i = 1; i < d.length; i++) {
    run = Number(d[i]) === Number(d[i - 1]) - 1 ? run + 1 : 1;
    if (run >= min) return true;
  }
  return false;
}

/** True when the full 10-digit number reads the same forwards and backwards. */
export function isMirror(mobile: string): boolean {
  const d = onlyDigits(mobile);
  if (d.length !== 10) return false;
  return d === d.split("").reverse().join("");
}

export function analyzeNumber(mobile: string): NumberPatterns {
  return {
    digitSum: digitSum(mobile),
    hasRepeatedDigits: hasRepeatedDigits(mobile),
    isAscending: hasAscendingRun(mobile),
    isDescending: hasDescendingRun(mobile),
    isMirror: isMirror(mobile),
  };
}

/** Validate an Indian 10-digit mobile number (starts 6-9). */
export function isValidIndianMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(onlyDigits(mobile));
}
