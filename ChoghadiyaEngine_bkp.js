// ChoghadiyaEngine.js
// Fully aligned with Drik Panchang tutorial logic

// Fixed cyclic order (as per tradition)
const CYCLE = [
  "Udveg",
  "Char",
  "Labh",
  "Amrit",
  "Kaal",
  "Shubh",
  "Rog"
];

// Day first segment per weekday (0=Sunday ... 6=Saturday)
const DAY_FIRST = {
  0: "Udveg",  // Sunday
  1: "Amrit",  // Monday
  2: "Rog",    // Tuesday
  3: "Labh",   // Wednesday
  4: "Shubh",  // Thursday
  5: "Char",   // Friday
  6: "Kaal"    // Saturday
};

// Night first segment per weekday (verified from Drik weekly pattern)
const NIGHT_FIRST = {
  0: "Shubh",  // Sunday
  1: "Char",   // Monday
  2: "Kaal",   // Tuesday
  3: "Udveg",  // Wednesday
  4: "Amrit",  // Thursday
  5: "Rog",    // Friday
  6: "Labh"    // Saturday
};

function buildSequence(firstName) {
  const startIndex = CYCLE.indexOf(firstName);
  const result = [];
  for (let i = 0; i < 8; i++) {
    result.push(CYCLE[(startIndex + i) % 7]);
  }
  return result;
}

function divideIntoEight(startJD, endJD) {
  const segmentLength = (endJD - startJD) / 8;
  const segments = [];

  for (let i = 0; i < 8; i++) {
    segments.push({
      startJD: startJD + i * segmentLength,
      endJD: startJD + (i + 1) * segmentLength
    });
  }

  return segments;
}

function calculateChoghadiya(
  sunriseJD,
  sunsetJD,
  nextSunriseJD,
  weekdayIndex
) {

  const dayNames = buildSequence(DAY_FIRST[weekdayIndex]);
  const nightNames = buildSequence(NIGHT_FIRST[weekdayIndex]);

  const daySegments = divideIntoEight(sunriseJD, sunsetJD);
  const nightSegments = divideIntoEight(sunsetJD, nextSunriseJD);

  const day = daySegments.map((seg, i) => ({
    name: dayNames[i],
    startJD: seg.startJD,
    endJD: seg.endJD
  }));

  const night = nightSegments.map((seg, i) => ({
    name: nightNames[i],
    startJD: seg.startJD,
    endJD: seg.endJD
  }));

  return { day, night };
}

module.exports = { calculateChoghadiya };