/**
 * MUHURTA ENGINES (Document 8)
 * Computes Rahu Kalam, Yamagandam, Gulika Kalam, and Abhijit Muhurta
 * All based on 8-segment division of daytime (sunrise to sunset)
 */

// Segment mappings for each weekday (0=Sunday, 6=Saturday)
const RAHU_SEGMENT_MAP = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDAM_MAP = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_MAP = [7, 6, 5, 4, 3, 2, 1];


/**
 * Computes Rahu Kalam time range
 * @param {number} sunriseJD - Julian Day of sunrise
 * @param {number} sunsetJD - Julian Day of sunset
 * @param {number} weekdayIndex - Weekday (0=Sunday, 6=Saturday)
 * @returns {object} {startJD, endJD}
 */
function getRahuKalam(sunriseJD, sunsetJD, weekdayIndex) {
  const segment = (sunsetJD - sunriseJD) / 8;
  const segmentNumber = RAHU_SEGMENT_MAP[weekdayIndex];
  const start = sunriseJD + segment * (segmentNumber - 1);
  const end = start + segment;
  
  return { startJD: start, endJD: end };
}

/**
 * Computes Yamagandam time range
 * @param {number} sunriseJD - Julian Day of sunrise
 * @param {number} sunsetJD - Julian Day of sunset
 * @param {number} weekdayIndex - Weekday (0=Sunday, 6=Saturday)
 * @returns {object} {startJD, endJD}
 */
function getYamagandam(sunriseJD, sunsetJD, weekdayIndex) {
  const segment = (sunsetJD - sunriseJD) / 8;
  const segmentNumber = YAMAGANDAM_MAP[weekdayIndex];
  const start = sunriseJD + segment * (segmentNumber - 1);
  const end = start + segment;
  
  return { startJD: start, endJD: end };
}

/**
 * Computes Gulika Kalam time range
 * @param {number} sunriseJD - Julian Day of sunrise
 * @param {number} sunsetJD - Julian Day of sunset
 * @param {number} weekdayIndex - Weekday (0=Sunday, 6=Saturday)
 * @returns {object} {startJD, endJD}
 */
function getGulika(sunriseJD, sunsetJD, weekdayIndex) {
  const segment = (sunsetJD - sunriseJD) / 8;
  const segmentNumber = GULIKA_MAP[weekdayIndex];
  const start = sunriseJD + segment * (segmentNumber - 1);
  const end = start + segment;
  
  return { startJD: start, endJD: end };
}

/**
 * Computes Abhijit Muhurta time range
 * Middle muhurta of the day, 48 minutes duration
 * Excluded on Wednesdays
 * @param {number} sunriseJD - Julian Day of sunrise
 * @param {number} sunsetJD - Julian Day of sunset
 * @param {number} weekdayIndex - Weekday (0=Sunday, 6=Saturday)
 * @returns {object|null} {startJD, endJD} or null if Wednesday
 */
function getAbhijit(sunriseJD, sunsetJD, weekdayIndex) {

  if (weekdayIndex === 3) return null; // Wednesday exclusion

  const dayLength = sunsetJD - sunriseJD;

  const duration = dayLength / 15; // Drik rule

  const mid = sunriseJD + dayLength / 2;

  return {
    startJD: mid - duration / 2,
    endJD: mid + duration / 2
  };
}


function getDurMuhurta(sunriseJD, sunsetJD, sunsetPrevJD, weekdayIndex) {

//console.log("Dur Debug →", {
  //sunriseJD,
 // sunsetJD,
  //sunsetPrevJD,
  //weekdayIndex
//});
  // Normalize index safely to 0–6
  const normalizedIndex = ((weekdayIndex % 7) + 7) % 7;

  const nightDuration = sunriseJD - sunsetPrevJD;
  const nextSunriseJD = sunriseJD + nightDuration;

  const totalCycle = nextSunriseJD - sunriseJD;
  const muhurtaLength = totalCycle / 30;

  const DUR_MAP = {
    0: [8],       // Sunday
    1: [2, 10],    // Monday
    2: [7, 20],    // Tuesday
    3: [5],        // Wednesday
    4: [6, 12],    // Thursday
    5: [4, 9],     // Friday
    6: [3, 8]      // Saturday
  };

  const segments = DUR_MAP[normalizedIndex] || [];

  return segments.map(num => {
    const start = sunriseJD + muhurtaLength * (num - 1);
    return {
      startJD: start,
      endJD: start + muhurtaLength
    };
  });
}

function getBrahmaMuhurta(sunriseJD, sunsetJDPrev) {

  const nightLength = sunriseJD - sunsetJDPrev;

  const muhurtaLength = nightLength / 15;

  // 14th muhurta of night
  const start = sunsetJDPrev + muhurtaLength * 13;
  const end = start + muhurtaLength;

  return {
    startJD: start,
    endJD: end
  };
}



/**
 * Main Muhurta Engine function
 * Computes all Muhurtas for a given day
 * @param {number} sunriseJD - Julian Day of sunrise
 * @param {number} sunsetJD - Julian Day of sunset
 * @param {number} weekdayIndex - Weekday (0=Sunday, 6=Saturday)
 * @returns {object} Muhurta object with all time ranges
 */
function calculateMuhurtas(sunriseJD, sunsetJD, sunsetPrevJD, weekdayIndex) {
  return {
    rahuKalam: getRahuKalam(sunriseJD, sunsetJD, weekdayIndex),
    yamagandam: getYamagandam(sunriseJD, sunsetJD, weekdayIndex),
    gulika: getGulika(sunriseJD, sunsetJD, weekdayIndex),
    abhijit: getAbhijit(sunriseJD, sunsetJD, weekdayIndex),
    durMuhurta: getDurMuhurta(sunriseJD, sunsetJD, sunsetPrevJD, weekdayIndex),
    brahmaMuhurta: getBrahmaMuhurta(sunriseJD, sunsetPrevJD)
  };
}


module.exports = {
  calculateMuhurtas
};