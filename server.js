const express = require("express");
const fs = require("fs");
const path = require("path");

const {
  getSunriseJD,
  getSunsetJD,
  sunAt,
  moonAt,
  setLocation
} = require("./astronomy");

const { calculateMuhurtas } = require("./MuhurtaEngine");
const { computeNakshatra } = require("./NakshatraEngine_Final_Fixed");
const { computeKarana } = require("./KaranaEngine_Final_Fixed");
const { computeTithi } = require("./TithiEngine");
const { computeYoga } = require("./YogaEngine");
const { computeVara } = require("./VaraEngine");
const { computeRashi } = require("./RashiEngine");
const { calculateChoghadiya } = require("./ChoghadiyaEngine");

const app = express();
const PORT = 3000;

// ================= CACHE SETUP =================

const CACHE_DIR = path.join(__dirname, "panchanga-cache");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

// ================= IST DATE HELPER =================

function getTodayIST() {
  const now = new Date();
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + IST_OFFSET);

  return `${String(istTime.getUTCDate()).padStart(2, '0')}.` +
         `${String(istTime.getUTCMonth() + 1).padStart(2, '0')}.` +
         `${istTime.getUTCFullYear()}`;
}

// ================= DATE HELPERS =================

function getPreviousDate(dateStr) {
  const [day, month, year] = dateStr.split('.').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 1);
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
}

function getNextDate(dateStr) {
  const [day, month, year] = dateStr.split('.').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + 1);
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
}

// ================= JD → IST =================

function jdToIST(jd) {
  const unixTime = (jd - 2440587.5) * 86400000;
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  return new Date(unixTime + IST_OFFSET);
}

function formatIST(jd, sunriseJD) {
  const date = jdToIST(jd);
  const sunriseDate = jdToIST(sunriseJD);

  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  const minStr = minutes.toString().padStart(2, "0");
  const timeStr = `${hours}:${minStr} ${ampm}`;

  const sameDay =
    date.getUTCDate() === sunriseDate.getUTCDate() &&
    date.getUTCMonth() === sunriseDate.getUTCMonth() &&
    date.getUTCFullYear() === sunriseDate.getUTCFullYear();

  if (sameDay) return timeStr;

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${timeStr}, ${date.getUTCDate()} ${monthNames[date.getUTCMonth()]}`;
}

// ================= API =================

app.get("/api/panchanga", (req, res) => {
  try {

    const dateStr = req.query.date || getTodayIST();

    const isCustomLocation = req.query.lat && req.query.lon;

    const lat = isCustomLocation ? parseFloat(req.query.lat) : 28.6139;
    const lon = isCustomLocation ? parseFloat(req.query.lon) : 77.2090;

    const locationName = isCustomLocation ? "Custom Location" : "Delhi, India";

    // ===== CACHE FILE NAME =====
    const cacheFileName = `${dateStr}_${lat}_${lon}.json`;
    const cachePath = path.join(CACHE_DIR, cacheFileName);

    // ===== CHECK CACHE =====
    if (fs.existsSync(cachePath)) {
      const cachedData = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      return res.json(cachedData);
    }

    // ===== NORMAL ENGINE FLOW =====

    setLocation(lat, lon);

    const sunriseJD = getSunriseJD(dateStr);
    const sunsetJD = getSunsetJD(dateStr);

    const sunLon = sunAt(sunriseJD);
    const moonLon = moonAt(sunriseJD);

    const vara = computeVara(sunriseJD);

    const tithi = computeTithi(sunriseJD, sunAt, moonAt);
    const nakshatra = computeNakshatra(sunriseJD, moonLon, moonAt);
    const karana = computeKarana(sunriseJD, sunAt, moonAt);
    const yoga = computeYoga(sunriseJD, sunAt, moonAt);

    const moonRashi = computeRashi(sunriseJD, moonAt);
    const sunRashi = computeRashi(sunriseJD, sunAt);

    const prevDate = getPreviousDate(dateStr);
    const nextDate = getNextDate(dateStr);

    const sunsetPrevJD = getSunsetJD(prevDate);
    const nextSunriseJD = getSunriseJD(nextDate);

    const muhurtas = calculateMuhurtas(
      sunriseJD,
      sunsetJD,
      sunsetPrevJD,
      vara.index
    );

    const choghadiya = calculateChoghadiya(
      sunriseJD,
      sunsetJD,
      nextSunriseJD,
      vara.index
    );

    const response = {
      date: dateStr,
      location: {
        name: locationName,
        latitude: lat,
        longitude: lon
      },
      sunrise: formatIST(sunriseJD, sunriseJD),
      sunset: formatIST(sunsetJD, sunsetJD),
      vara: vara.name,

      tithi: {
        number: tithi.number,
        name: tithi.name,
        paksha: tithi.paksha,
        endsAt: formatIST(tithi.endTimeJD, sunriseJD)
      },

      nakshatra: {
        number: nakshatra.number,
        name: nakshatra.name,
        pada: nakshatra.pada,
        endsAt: formatIST(nakshatra.endTimeJD, sunriseJD)
      },

      karana: {
        name: karana.name,
        endsAt: formatIST(karana.endTimeJD, sunriseJD)
      },

      yoga: {
        number: yoga.number,
        name: yoga.name,
        endsAt: formatIST(yoga.endTimeJD, sunriseJD)
      },

      rashi: {
        moon: {
          name: moonRashi.name,
          endsAt: formatIST(moonRashi.endTimeJD, sunriseJD)
        },
        sun: {
          name: sunRashi.name,
          endsAt: formatIST(sunRashi.endTimeJD, sunriseJD)
        }
      },

      muhurtas: {
        rahuKalam: {
          start: formatIST(muhurtas.rahuKalam.startJD, sunriseJD),
          end: formatIST(muhurtas.rahuKalam.endJD, sunriseJD)
        },
        yamagandam: {
          start: formatIST(muhurtas.yamagandam.startJD, sunriseJD),
          end: formatIST(muhurtas.yamagandam.endJD, sunriseJD)
        },
        gulika: {
          start: formatIST(muhurtas.gulika.startJD, sunriseJD),
          end: formatIST(muhurtas.gulika.endJD, sunriseJD)
        },
        abhijit: muhurtas.abhijit
          ? {
              start: formatIST(muhurtas.abhijit.startJD, sunriseJD),
              end: formatIST(muhurtas.abhijit.endJD, sunriseJD)
            }
          : null,
        durMuhurta: muhurtas.durMuhurta.map(dm => ({
          start: formatIST(dm.startJD, sunriseJD),
          end: formatIST(dm.endJD, sunriseJD)
        })),
        brahmaMuhurta: {
          start: formatIST(muhurtas.brahmaMuhurta.startJD, sunriseJD),
          end: formatIST(muhurtas.brahmaMuhurta.endJD, sunriseJD)
        }
      },

      choghadiya: {
        day: choghadiya.day.map(c => ({
          name: c.name,
          start: formatIST(c.startJD, sunriseJD),
          end: formatIST(c.endJD, sunriseJD)
        })),
        night: choghadiya.night.map(c => ({
          name: c.name,
          start: formatIST(c.startJD, sunriseJD),
          end: formatIST(c.endJD, sunriseJD)
        }))
      }
    };

    // ===== SAVE TO CACHE =====
    fs.writeFileSync(cachePath, JSON.stringify(response));

    res.json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});