const ticks = document.querySelector('.ticks');
for (let i = 0; i < 60; i++) {
  const tick = document.createElement('i');
  tick.className = `tick${i % 5 === 0 ? ' major' : ''}`;
  tick.style.transform = `rotate(${i * 6}deg)`;
  ticks.appendChild(tick);
}

const hourHand = document.querySelector('#hour-hand');
const minuteHand = document.querySelector('#minute-hand');
const secondHand = document.querySelector('#second-hand');
const digitalTime = document.querySelector('#digital-time');
const seconds = document.querySelector('#seconds');
const dateEl = document.querySelector('#date');

const pad = value => String(value).padStart(2, '0');
const dateFormatter = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

function updateClock() {
  const now = new Date();
  const ms = now.getMilliseconds();
  const s = now.getSeconds() + ms / 1000;
  const m = now.getMinutes() + s / 60;
  const h = now.getHours() % 12 + m / 60;
  hourHand.style.transform = `rotate(${h * 30}deg)`;
  minuteHand.style.transform = `rotate(${m * 6}deg)`;
  secondHand.style.transform = `rotate(${s * 6}deg)`;
  digitalTime.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  seconds.textContent = pad(now.getSeconds());
  dateEl.textContent = dateFormatter.format(now);
  requestAnimationFrame(updateClock);
}
updateClock();

const cities = [
  ['库比蒂诺', 'America/Los_Angeles'],
  ['伦敦', 'Europe/London'],
  ['东京', 'Asia/Tokyo'],
  ['悉尼', 'Australia/Sydney']
];
const cityList = document.querySelector('#city-list');
cities.forEach(([name, zone]) => {
  const row = document.createElement('div');
  row.className = 'city';
  row.dataset.zone = zone;
  row.innerHTML = `<span class="city-name">${name}</span><span class="city-offset"></span><time class="city-time"></time>`;
  cityList.appendChild(row);
});

function updateCities() {
  const now = new Date();
  document.querySelectorAll('.city').forEach(row => {
    const formatter = new Intl.DateTimeFormat('zh-CN', { timeZone: row.dataset.zone, hour: '2-digit', minute: '2-digit', hour12: false });
    row.querySelector('.city-time').textContent = formatter.format(now);
    const hour = Number(new Intl.DateTimeFormat('en', { timeZone: row.dataset.zone, hour: 'numeric', hourCycle: 'h23' }).format(now));
    row.querySelector('.city-offset').textContent = hour >= 6 && hour < 18 ? '白天' : '夜晚';
  });
}
updateCities();
setInterval(updateCities, 30000);

const clock = document.querySelector('#clock');
document.querySelector('#clock-wrap').addEventListener('pointermove', event => {
  const rect = clock.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - .5;
  const y = (event.clientY - rect.top) / rect.height - .5;
  clock.style.transform = `rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
});
document.querySelector('#clock-wrap').addEventListener('pointerleave', () => { clock.style.transform = ''; });

const soundButton = document.querySelector('.sound-toggle');
let soundEnabled = false;
let lastChimeHour = -1;

function chime() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, context.currentTime);
  gain.gain.setValueAtTime(.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.12, context.currentTime + .02);
  gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .65);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + .7);
  oscillator.addEventListener('ended', () => context.close());
}

soundButton.addEventListener('click', () => {
  const enabled = soundButton.getAttribute('aria-pressed') !== 'true';
  soundEnabled = enabled;
  soundButton.setAttribute('aria-pressed', enabled);
  soundButton.querySelector('.sound-label').textContent = enabled ? '提示音' : '静音';
  if (enabled) chime();
});

setInterval(() => {
  const now = new Date();
  if (soundEnabled && now.getMinutes() === 0 && now.getSeconds() === 0 && lastChimeHour !== now.getHours()) {
    lastChimeHour = now.getHours();
    chime();
  }
}, 500);
