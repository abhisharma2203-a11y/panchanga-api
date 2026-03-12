// ChoghadiyaEngine.js
// EXACT Drik Panchang Table Mapping (No cyclic logic)

const DAY_TABLE = {
  0: ["Udveg","Char","Labh","Amrit","Kaal","Shubh","Rog","Udveg"], // Sunday
  1: ["Amrit","Kaal","Shubh","Rog","Udveg","Char","Labh","Amrit"], // Monday
  2: ["Rog","Udveg","Char","Labh","Amrit","Kaal","Shubh","Rog"],   // Tuesday
  3: ["Labh","Amrit","Kaal","Shubh","Rog","Udveg","Char","Labh"],  // Wednesday
  4: ["Shubh","Rog","Udveg","Char","Labh","Amrit","Kaal","Shubh"], // Thursday
  5: ["Char","Labh","Amrit","Kaal","Shubh","Rog","Udveg","Char"],  // Friday
  6: ["Kaal","Shubh","Rog","Udveg","Char","Labh","Amrit","Kaal"]   // Saturday
};

const NIGHT_TABLE = {
  0: ["Shubh","Amrit","Char","Rog","Kaal","Labh","Udveg","Shubh"], // Sunday
  1: ["Char","Rog","Kaal","Labh","Udveg","Shubh","Amrit","Char"],  // Monday
  2: ["Kaal","Labh","Udveg","Shubh","Amrit","Char","Rog","Kaal"],  // Tuesday
  3: ["Udveg","Shubh","Amrit","Char","Rog","Kaal","Labh","Udveg"], // Wednesday
  4: ["Amrit","Char","Rog","Kaal","Labh","Udveg","Shubh","Amrit"], // Thursday
  5: ["Rog","Kaal","Labh","Udveg","Shubh","Amrit","Char","Rog"],   // Friday
  6: ["Labh","Udveg","Shubh","Amrit","Char","Rog","Kaal","Labh"]   // Saturday
};

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

  const daySegments = divideIntoEight(sunriseJD, sunsetJD);
  const nightSegments = divideIntoEight(sunsetJD, nextSunriseJD);

  const day = daySegments.map((seg, i) => ({
    name: DAY_TABLE[weekdayIndex][i],
    startJD: seg.startJD,
    endJD: seg.endJD
  }));

  const night = nightSegments.map((seg, i) => ({
    name: NIGHT_TABLE[weekdayIndex][i],
    startJD: seg.startJD,
    endJD: seg.endJD
  }));

  return { day, night };
}

module.exports = { calculateChoghadiya };