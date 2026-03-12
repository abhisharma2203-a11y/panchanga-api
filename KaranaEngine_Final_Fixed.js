/**
 * KaranaEngine.js
 * --------------------------------------------------
 * PURPOSE:
 * - Compute Karana active at sunrise (Drik Panchang compliant)
 * - Compute Karana end time (next Karana boundary after sunrise)
 *
 * CORE RULES:
 * - Karana = 6° Moon–Sun elongation segment
 * - Karana shown = Karana active at sunriseJD
 * - Boundary handling is LEFT-INCLUSIVE
 * - Repeating Karanas run continuously (not reset per Tithi)
 * - All calculations are in UTC Julian Day
 */

const KARANA_SIZE = 6; // degrees

// Repeating Karana cycle (continuous)
const REPEATING_KARANAS = [
  "Bava",
  "Balava",
  "Kaulava",
  "Taitila",
  "Gara",
  "Vanija",
  "Vishti"
];

// Fixed Karanas at the very end of lunar cycle
const FIXED_KARANAS_END = [
  "Shakuni",
  "Chatushpada",
  "Naga"
];

// --------------------------------------------------
// Boundary-safe Karana index (LEFT-INCLUSIVE)
// --------------------------------------------------
function karanaIndex(delta) {
  const EPS = 1e-9; // prevents jumping to next Karana at exact boundary
  return Math.floor((delta - EPS) / KARANA_SIZE);
}

// --------------------------------------------------
// Karana active at sunrise
// --------------------------------------------------
function calculateKaranaAtSunrise(sunriseJD, sunAt, moonAt) {
  const sunLon = sunAt(sunriseJD);
  const moonLon = moonAt(sunriseJD);

  const delta = ((moonLon - sunLon) % 360 + 360) % 360;
  const idx = karanaIndex(delta);

  // First Karana of lunar month
  if (idx === 0) {
    return "Kimstughna";
  }

  // Last three fixed Karanas
  if (idx >= 57) {
    return FIXED_KARANAS_END[idx - 57];
  }

  // Repeating Karana cycle
  return REPEATING_KARANAS[(idx - 1) % 7];
}

// --------------------------------------------------
// Karana end-time solver (next boundary after sunrise)
// --------------------------------------------------
function findKaranaEndJD(sunriseJD, sunAt, moonAt) {
  const sunLon0 = sunAt(sunriseJD);
  const moonLon0 = moonAt(sunriseJD);
  const delta0 = ((moonLon0 - sunLon0) % 360 + 360) % 360;

  const startIndex = karanaIndex(delta0);

  let lo = sunriseJD;
  let hi = sunriseJD + 1.5; // safe upper bound (> max Karana duration)

  while (hi - lo > 1e-6) {
    const mid = (lo + hi) / 2;

    const sunLon = sunAt(mid);
    const moonLon = moonAt(mid);
    const delta = ((moonLon - sunLon) % 360 + 360) % 360;

    const idx = karanaIndex(delta);

    if (idx === startIndex) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return hi;
}

// --------------------------------------------------
// Public API (UNCHANGED CONTRACT)
// --------------------------------------------------
function computeKarana(sunriseJD, sunAt, moonAt) {
  const name = calculateKaranaAtSunrise(sunriseJD, sunAt, moonAt);
  const endTimeJD = findKaranaEndJD(sunriseJD, sunAt, moonAt);

  return {
    name,
    endTimeJD
  };
}

module.exports = {
  computeKarana
};
