const { execSync } = require("child_process");

// ================= CONFIG =================

// Docker paths (instead of Windows)
const SWE = "./Swisseph-src/swetest";
const EPHE = "./ephe";

// Default: Delhi
let LAT = 28.6139;
let LON = 77.2090;
const ALT = 0;

// ================= LOCATION SETTER =================

function setLocation(lat, lon) {
  LAT = parseFloat(lat);
  LON = parseFloat(lon);
}

// ================= EXEC =================

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" });
}

// ------------------------------------------
// JD from Date (UT)
// ------------------------------------------
function getJulianDay(dateStr) {
  const cmd =
    `"${SWE}" -b${dateStr} -ut00:00 -p0 -eswe -edir"${EPHE}"`;

  const out = run(cmd);

  const jdLine = out.split("\n").find(l => l.includes("UT:"));
  if (!jdLine) throw new Error("JD parse failed");

  const match = jdLine.match(/UT:\s+([0-9.]+)/);
  return parseFloat(match[1]);
}

// ------------------------------------------
// Sunrise JD (UT)
// ------------------------------------------
function getSunriseJD(dateStr) {
  const cmd =
    `"${SWE}" -b${dateStr} -ut00:00 -rise -p0 ` +
    `-topo${LON},${LAT},${ALT} -eswe -edir"${EPHE}"`;

  const out = run(cmd);

  const riseLine = out.split("\n").find(l => l.startsWith("rise"));
  if (!riseLine) {
    console.log(out);
    throw new Error("Sunrise parse failed");
  }

  const parts = riseLine.trim().split(/\s+/);
  const time = parts[2];

  const jd = getJulianDay(dateStr);
  const [h, m, s] = time.split(":").map(Number);

  return jd + (h + m / 60 + s / 3600) / 24;
}

// ------------------------------------------
// Sunset JD (UT)
// ------------------------------------------
function getSunsetJD(dateStr) {

  const cmd =
    `"${SWE}" -b${dateStr} -ut00:00 -rise -p0 ` +
    `-topo${LON},${LAT},${ALT} -eswe -edir"${EPHE}"`;

  const out = run(cmd);

  const match = out.match(/set\s+\d+\.\d+\.\d+\s+(\d+:\d+:\d+\.\d+)/i);

  if (!match) {
    console.log("DEBUG Sunset Raw Output:\n", out);
    throw new Error("Sunset parse failed");
  }

  const timeStr = match[1];

  const jd = getJulianDay(dateStr);
  const [h, m, s] = timeStr.split(":").map(Number);

  return jd + (h + m / 60 + s / 3600) / 24;
}

// ------------------------------------------
// Proper Lahiri Sidereal Longitude
// ------------------------------------------

function dmsToDecimal(d, m, s) {
  return d + m / 60 + s / 3600;
}

function getLongitude(planet, jd) {
  const cmd =
    `"${SWE}" -bj${jd} -ut -p${planet} ` +
    `-eswe -sid1 -edir"${EPHE}"`;

  const out = run(cmd);

  const name = planet === 0 ? "Sun" : "Moon";

  const line = out
    .split("\n")
    .find(l => l.trim().startsWith(name));

  if (!line) {
    console.log(out);
    throw new Error("Longitude parse failed");
  }

  const match = line.match(/(-?\d+)°\s*(\d+)'\s*([\d.]+)/);

  if (!match) {
    console.log("FAILED LINE:", line);
    throw new Error("DMS parse failed");
  }

  const deg = parseFloat(match[1]);
  const min = parseFloat(match[2]);
  const sec = parseFloat(match[3]);

  return (dmsToDecimal(deg, min, sec) + 360) % 360;
}

// ------------------------------------------
// Public API
// ------------------------------------------

function sunAt(jd) {
  return getLongitude(0, jd);
}

function moonAt(jd) {
  return getLongitude(1, jd);
}

module.exports = {
  getSunriseJD,
  getSunsetJD,
  sunAt,
  moonAt,
  setLocation
};