// ===========================================
// VARA ENGINE (Pure JD Based)
// ===========================================

const VARA_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"
];

// -------------------------------------------
// JD → Weekday (IST-aware via sunriseJD)
// -------------------------------------------

function computeVara(sunriseJD) {

  // Convert JD → Unix milliseconds
  const unixMillis = (sunriseJD - 2440587.5) * 86400000;

  // IST offset (5h30m)
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;

  const date = new Date(unixMillis + IST_OFFSET);

  const index = date.getUTCDay();

  return {
    index,
    name: VARA_NAMES[index]
  };
}

module.exports = {
  computeVara
};
