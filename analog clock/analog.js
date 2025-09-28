var dialLines = document.getElementsByClassName('diallines');
var clockEl = document.getElementsByClassName('clock')[0];

for (var i = 1; i < 60; i++) {
  clockEl.innerHTML += "<div class='diallines'></div>";
  dialLines[i].style.transform = "rotate(" + 6 * i + "deg)";
}

// Daytime gradient (6AM – 6PM)
const dayGradient = `
  conic-gradient(
    from 180deg,
    #6fcf97 0deg 45deg,   /* Kapha */
    #ffe682ff 45deg 60deg,
    #6fcf97 0deg 120deg,   /* Kapha */
    #f2994a 120deg 180deg, /* Pitta */
    #ec7709ff 180deg 195deg,
    #f2994a 195deg 240deg, /* Pitta */
    #56ccf2 240deg 330deg,  /* Vata */
    #2f85beff 330deg 360deg
  )
`;

// Nighttime gradient (6PM – 6AM)
const nightGradient = `
  conic-gradient(
    from 180deg,
    #20695aff 0deg 30deg,
    #105029ff 30deg 90deg, 
    #13246eff 90deg 120deg,  /* Night Kapha */
    #330e55ff 120deg 240deg, /* Night Pitta */
    #1f3752ff 240deg 330deg,  /* Night Vata */
    #205255ff 330deg 360deg
  )
`;

function updateClockTheme() {
  const now = new Date();
  const hour = now.getHours();

  const clockEl = document.querySelector(".clock");

  updateBackground(hour);

  if (hour >= 18 || hour < 6) {
    // Night theme
    clockEl.style.background = nightGradient;
  } else {
    // Day theme
    clockEl.style.background = dayGradient;
  }
}

// Define all 6 dosha phases with custom names + descriptions
const doshaPhases = [
  { name: "Morning Kapha", start: 6, end: 10, description: "Steady, heavy, grounded learning - learn Language fundamentals, HTML, CSS, JavaScript. learn full stack builds, choose the right tools and skills. Build strong roots." },
  { name: "Midday Pitta", start: 10, end: 14, description: "Driven production, action, and learning - work on project, learn from FES / signal." },
  { name: "Afternoon Vata", start: 14, end: 18, description: "Project, build ideas - look into full stack project builds, look into tools, and essentials + late vata biking." },
  { name: "Evening Kapha", start: 18, end: 22, description: "Slow and heavy energy — Normal pace foundational learning, prepare learning for tommorow." },
  { name: "Night Pitta", start: 22, end: 2, description: "Transformative and metabolic — body restores and digests during sleep." },
  { name: "Early Morning Vata", start: 2, end: 6, description: "Light and subtle — great for meditation, writing, or spiritual practice." }
];

// Function to find the current dosha based on hour
function getCurrentDosha(hour) {
  for (let phase of doshaPhases) {
    if (phase.start < phase.end) {
      // Normal case (e.g. 6–10)
      if (hour >= phase.start && hour < phase.end) return phase;
    } else {
      // Wrap-around case (e.g. 22–2)
      if (hour >= phase.start || hour < phase.end) return phase;
    }
  }
}

// Hook into your existing update cycle
function updateDoshaInfo() {
  const now = new Date();
  const hour = now.getHours();

  // pick correct dosha
  const dosha = getCurrentDosha(hour);

  document.getElementById("currentDosha").textContent = "Current Dosha: " + dosha.name;
  document.getElementById("doshaDescription").textContent = dosha.description;

  // update theme
  updateClockTheme();
}

// Run every minute
setInterval(updateDoshaInfo, 60 * 1000);
updateDoshaInfo();


function clock() {
  var weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ],
    d = new Date(),
    h = d.getHours(),
    m = d.getMinutes(),
    s = d.getSeconds(),
    date = d.getDate(),
    month = d.getMonth() + 1,
    year = d.getFullYear(),

    hDeg = h * 30 + m * (360 / 720),
    mDeg = m * 6 + s * (360 / 3600),
    sDeg = s * 6,

    hEl = document.querySelector('.hour-hand'),
    mEl = document.querySelector('.minute-hand'),
    sEl = document.querySelector('.second-hand'),
    dateEl = document.querySelector('.date'),
    dayEl = document.querySelector('.day');

  var day = weekday[d.getDay()];

  if (month < 9) {
    month = "0" + month;
  }

  hEl.style.transform = "rotate(" + hDeg + "deg)";
  mEl.style.transform = "rotate(" + mDeg + "deg)";
  sEl.style.transform = "rotate(" + sDeg + "deg)";
  dateEl.innerHTML = date + "/" + month + "/" + year;
  dayEl.innerHTML = day;
}

setInterval("clock()", 100);

// Background color
function updateBackground(hour) {
  const body = document.body;

  if (hour >= 6 && hour < 10) {
    // Morning
    body.style.background = "#2d6277ff";
  } else if (hour >= 10 && hour < 18) {
    // Afternoon
    body.style.background = "#2a6e63ff";
  } else if (hour >= 18 && hour < 21) {
    // Evening
    body.style.background = "#154c6bff";
  } else {
    // Night
    body.style.background = "#1a2141ff";
  }
}