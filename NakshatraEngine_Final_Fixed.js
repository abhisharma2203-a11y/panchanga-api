
/**
 * NakshatraEngine.js
 * --------------------------------------------------
 * PURPOSE:
 * - Compute Nakshatra number, name, and Pada for the Panchang day
 * - Compute Nakshatra end time (next transition after sunrise)
 *
 * CORE RULES (Drik Panchang compliant):
 * - Nakshatra & Pada displayed = Nakshatra active at sunriseJD
 * - End time = first Nakshatra boundary AFTER sunriseJD
 * - All calculations are in UTC Julian Day
 */

const NAKSHATRA_NAMES = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashirsha","Ardra",
  "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni",
  "Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
  "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta",
  "Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
];

const NAKSHATRA_SIZE = 360 / 27;
const PADA_SIZE = NAKSHATRA_SIZE / 4;

function calculateNakshatraAtSunrise(sunriseJD, moonLongitudeAtSunrise) {
  const lon = ((moonLongitudeAtSunrise % 360) + 360) % 360;

  const nakshatraIndex = Math.floor(lon / NAKSHATRA_SIZE);
  const pada = Math.floor((lon % NAKSHATRA_SIZE) / PADA_SIZE) + 1;

  return {
    number: nakshatraIndex + 1,
    name: NAKSHATRA_NAMES[nakshatraIndex],
    pada
  };
}

function findNakshatraEndJD(sunriseJD, moonAt) {
  const startLon = ((moonAt(sunriseJD) % 360) + 360) % 360;
  const startIndex = Math.floor(startLon / NAKSHATRA_SIZE);

  let lo = sunriseJD;
  let hi = sunriseJD + 1.5;

  while (hi - lo > 1e-6) {
    const mid = (lo + hi) / 2;
    const lon = ((moonAt(mid) % 360) + 360) % 360;
    const idx = Math.floor(lon / NAKSHATRA_SIZE);

    if (idx === startIndex) lo = mid;
    else hi = mid;
  }

  return hi;
}

function computeNakshatra(sunriseJD, moonLongitudeAtSunrise, moonAt) {
  const base = calculateNakshatraAtSunrise(
    sunriseJD,
    moonLongitudeAtSunrise
  );

  const endTimeJD = findNakshatraEndJD(sunriseJD, moonAt);

  return {
    number: base.number,
    name: base.name,
    pada: base.pada,
    endTimeJD
  };
}

module.exports = {
  computeNakshatra
};
