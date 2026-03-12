// ===========================================
// TITHI ENGINE (Pure JD Based)
// ===========================================

const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Krishna Pratipada", "Krishna Dwitiya", "Krishna Tritiya", "Krishna Chaturthi", "Krishna Panchami",
  "Krishna Shashthi", "Krishna Saptami", "Krishna Ashtami", "Krishna Navami", "Krishna Dashami",
  "Krishna Ekadashi", "Krishna Dwadashi", "Krishna Trayodashi", "Krishna Chaturdashi", "Amavasya"
];

function normalize(x) {
  return (x + 360) % 360;
}

// -------------------------------------------
// Tithi Number
// -------------------------------------------

function getTithiNumber(sunLongitude, moonLongitude) {
  const delta = normalize(moonLongitude - sunLongitude);
  return Math.floor(delta / 12) + 1;
}

function getPaksha(tithiNumber) {
  return tithiNumber <= 15 ? "Shukla" : "Krishna";
}

// -------------------------------------------
// Binary Search End Time
// -------------------------------------------

function findTithiEndTime(jdStart, sunAt, moonAt) {

  const sun0 = sunAt(jdStart);
  const moon0 = moonAt(jdStart);

  const currentTithi = getTithiNumber(sun0, moon0);

  let low = jdStart;
  let high = jdStart + 1.5; // safe upper bound

  while (high - low > 1e-6) {
    const mid = (low + high) / 2;

    const sun = sunAt(mid);
    const moon = moonAt(mid);

    const tithiMid = getTithiNumber(sun, moon);

    if (tithiMid === currentTithi) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}

// -------------------------------------------
// MAIN ENGINE
// -------------------------------------------

function computeTithi(jd, sunAt, moonAt) {

  const sunLongitude = sunAt(jd);
  const moonLongitude = moonAt(jd);

  const number = getTithiNumber(sunLongitude, moonLongitude);
  const name = TITHI_NAMES[number - 1];
  const paksha = getPaksha(number);

  const endTimeJD = findTithiEndTime(jd, sunAt, moonAt);

  return {
    number,
    name,
    paksha,
    endTimeJD
  };
}

module.exports = {
  computeTithi
};
