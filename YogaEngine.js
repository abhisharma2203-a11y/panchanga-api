// ===========================================
// YOGA ENGINE (Pure JD Based)
// ===========================================

const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
  "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
  "Indra", "Vaidhriti"
];

function normalize(x) {
  return (x + 360) % 360;
}

// -------------------------------------------
// Yoga Number
// -------------------------------------------

function getYogaNumber(sunLongitude, moonLongitude) {
  const sum = normalize(sunLongitude + moonLongitude);
  const segment = 360 / 27;
  return Math.floor(sum / segment) + 1;
}

// -------------------------------------------
// Binary Search End Time
// -------------------------------------------

function findYogaEndTime(jdStart, sunAt, moonAt) {

  const sun0 = sunAt(jdStart);
  const moon0 = moonAt(jdStart);

  const currentYoga = getYogaNumber(sun0, moon0);

  let low = jdStart;
  let high = jdStart + 1.5;

  while (high - low > 1e-6) {
    const mid = (low + high) / 2;

    const sun = sunAt(mid);
    const moon = moonAt(mid);

    const yogaMid = getYogaNumber(sun, moon);

    if (yogaMid === currentYoga) {
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

function computeYoga(jd, sunAt, moonAt) {

  const sunLongitude = sunAt(jd);
  const moonLongitude = moonAt(jd);

  const number = getYogaNumber(sunLongitude, moonLongitude);
  const name = YOGA_NAMES[number - 1];

  const endTimeJD = findYogaEndTime(jd, sunAt, moonAt);

  return {
    number,
    name,
    endTimeJD
  };
}

module.exports = {
  computeYoga
};
