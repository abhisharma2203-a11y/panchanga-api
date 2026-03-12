// ===========================================
// RASHI ENGINE (Generic: Moon or Sun)
// ===========================================

const RASHI_NAMES = [
  "Mesha", "Vrishabha", "Mithuna", "Karka",
  "Simha", "Kanya", "Tula", "Vrischika",
  "Dhanu", "Makara", "Kumbha", "Meena"
];

function normalize(x) {
  return (x + 360) % 360;
}

function getRashiNumber(longitude) {
  const lon = normalize(longitude);
  return Math.floor(lon / 30) + 1;
}

function findRashiEndTime(jdStart, planetAt) {

  const currentRashi = getRashiNumber(planetAt(jdStart));

  let low = jdStart;
  let high = jdStart + 3;

  while (high - low > 1e-6) {
    const mid = (low + high) / 2;
    const rashiMid = getRashiNumber(planetAt(mid));

    if (rashiMid === currentRashi) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}

function computeRashi(jd, planetAt) {

  const longitude = planetAt(jd);

  const number = getRashiNumber(longitude);
  const name = RASHI_NAMES[number - 1];

  const endTimeJD = findRashiEndTime(jd, planetAt);

  return {
    number,
    name,
    endTimeJD
  };
}

module.exports = {
  computeRashi
};
