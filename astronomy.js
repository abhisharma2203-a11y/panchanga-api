const { execSync } = require("child_process");

// ================= CONFIG =================

const SWE = "./Swisseph-src/swetest";
const EPHE = "./ephe";

// Default: Delhi
let LAT = 28.6139;
let LON = 77.2090;
const ALT = 0;

// ================= LOCATION =================

function setLocation(lat, lon) {
  LAT = parseFloat(lat);
  LON = parseFloat(lon);
}

// ================= EXEC =================

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" });
}

// ================= DATE HELPERS =================

function prevDate(dateStr) {
  const [d, m, y] = dateStr.split(".").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);

  const dd = String(dt.getUTCDate()).padStart(2, "0");
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const yy = dt.getUTCFullYear();

  return `${dd}.${mm}.${yy}`;
}

// ================= JULIAN DAY =================

function getJulianDay(dateStr) {

  const cmd =
    `"${SWE}" -b${dateStr} -ut00:00 -p0 -eswe -edir"${EPHE}"`;

  const out = run(cmd);

  const jdLine = out.split("\n").find(l => l.includes("UT:"));
  if (!jdLine) throw new Error("JD parse failed");

  const match = jdLine.match(/UT:\s+([0-9.]+)/);
  return parseFloat(match[1]);
}

// ================= PARSE RISE/SET =================

function parseRise(out) {

  const match =
    out.match(/rise\s+(\d+\.\d+\.\d+)\s+(\d+:\d+:\d+\.\d+)/i);

  if (!match) return null;

  return {
    date: match[1],
    time: match[2]
  };
}

function parseSet(out) {

  const match =
    out.match(/set\s+(\d+\.\d+\.\d+)\s+(\d+:\d+:\d+\.\d+)/i);

  if (!match) return null;

  return {
    date: match[1],
    time: match[2]
  };
}

// ================= JD FROM TIME =================

function jdFromTime(dateStr, timeStr) {

  const jd = getJulianDay(dateStr);

  const [h, m, s] = timeStr.split(":").map(Number);

  return jd + (h + m / 60 + s / 3600) / 24;
}

// ================= SUNRISE =================

function getSunriseJD(dateStr) {

  // first attempt (normal cases)
  let cmd =
    `"${SWE}" -b${dateStr} -ut00:00 -rise -p0 ` +
    `-topo${LON},${LAT},${ALT} -eswe -edir"${EPHE}"`;

  let out = run(cmd);

  let rise = parseRise(out);

  // fallback when sunrise occurs before UTC midnight
  if (!rise) {

    const prev = prevDate(dateStr);

    cmd =
      `"${SWE}" -b${prev} -ut18:00 -rise -p0 ` +
      `-topo${LON},${LAT},${ALT} -eswe -edir"${EPHE}"`;

    out = run(cmd);

    rise = parseRise(out);

    if (!rise) {
      console.log(out);
      throw new Error("Sunrise parse failed");
    }

    return jdFromTime(rise.date, rise.time);
  }

  return jdFromTime(dateStr, rise.time);
}

// ================= SUNSET =================

function getSunsetJD(dateStr) {

  const cmd =
    `"${SWE}" -b${dateStr} -ut00:00 -rise -p0 ` +
    `-topo${LON},${LAT},${ALT} -eswe -edir"${EPHE}"`;

  const out = run(cmd);

  const set = parseSet(out);

  if (!set) {
    console.log(out);
    throw new Error("Sunset parse failed");
  }

  return jdFromTime(dateStr, set.time);
}

// ================= LONGITUDE =================

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

  const match =
    line.match(/(-?\d+)°\s*(\d+)'\s*([\d.]+)/);

  if (!match) {
    console.log(line);
    throw new Error("DMS parse failed");
  }

  const deg = parseFloat(match[1]);
  const min = parseFloat(match[2]);
  const sec = parseFloat(match[3]);

  return (dmsToDecimal(deg, min, sec) + 360) % 360;
}

// ================= PUBLIC API =================

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