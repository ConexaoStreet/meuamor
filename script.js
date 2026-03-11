const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const reveals = document.querySelectorAll('.reveal');
if (reveals.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });
  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('visible'));
}

const music = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const voiceNote = document.getElementById('voiceNote');
const voiceToggle = document.getElementById('voiceToggle');
const MUSIC_START_TIME = 320; // 05:20

function safeSetStart(audio, startTime) {
  if (!audio) return;
  const apply = () => {
    try {
      audio.currentTime = Number.isFinite(audio.duration) && audio.duration > startTime ? startTime : 0;
    } catch (_) {}
  };
  if (audio.readyState >= 1) apply();
  else audio.addEventListener('loadedmetadata', apply, { once: true });
}

safeSetStart(music, MUSIC_START_TIME);

async function toggleAudio(audio, button, labels, options = {}) {
  if (!audio || !button) return;
  try {
    if (audio.paused) {
      if (options.onBeforePlay) options.onBeforePlay();
      await audio.play();
      button.textContent = labels.pause;
      button.classList.remove('missing-audio');
    } else {
      audio.pause();
      button.textContent = labels.play;
    }
  } catch (error) {
    button.textContent = labels.missing;
    button.classList.add('missing-audio');
    console.warn('Áudio ausente ou bloqueado pelo navegador.', error);
  }
}

musicToggle?.addEventListener('click', () => toggleAudio(music, musicToggle, {
  play: 'Tocar nossa música',
  pause: 'Pausar nossa música',
  missing: 'Adicione assets/mirrors.mp3'
}, { onBeforePlay: () => { music.volume = 0.55; safeSetStart(music, MUSIC_START_TIME); } }));

voiceToggle?.addEventListener('click', () => {
  try { sessionStorage.setItem('autoplayVoiceNote', '1'); } catch (_) {}
  window.location.href = 'recadinho.html';
});

if (window.matchMedia('(pointer:fine)').matches && !prefersReducedMotion) {
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      const rotateX = ((y / rect.height) - 0.5) * -8;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    }, { passive: true });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    }, { passive: true });
  });
}

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', () => window.scrollTo(0, 0), { once: true });

document.body.classList.add('locked-site');

const countdownTarget = new Date('2026-04-04T00:00:00-03:00');
const countdownEls = {
  years: document.getElementById('cdYears'),
  months: document.getElementById('cdMonths'),
  weeks: document.getElementById('cdWeeks'),
  days: document.getElementById('cdDays'),
  hours: document.getElementById('cdHours'),
  minutes: document.getElementById('cdMinutes'),
  seconds: document.getElementById('cdSeconds'),
  milliseconds: document.getElementById('cdMilliseconds')
};

function updateCountdown() {
  const now = Date.now();
  let diff = Math.max(0, countdownTarget.getTime() - now);

  const yearMs = 365 * 24 * 60 * 60 * 1000;
  const monthMs = 30 * 24 * 60 * 60 * 1000;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const minuteMs = 60 * 1000;
  const secondMs = 1000;

  const years = Math.floor(diff / yearMs); diff -= years * yearMs;
  const months = Math.floor(diff / monthMs); diff -= months * monthMs;
  const weeks = Math.floor(diff / weekMs); diff -= weeks * weekMs;
  const days = Math.floor(diff / dayMs); diff -= days * dayMs;
  const hours = Math.floor(diff / hourMs); diff -= hours * hourMs;
  const minutes = Math.floor(diff / minuteMs); diff -= minutes * minuteMs;
  const seconds = Math.floor(diff / secondMs); diff -= seconds * secondMs;
  const milliseconds = diff;

  if (countdownEls.years) countdownEls.years.textContent = String(years);
  if (countdownEls.months) countdownEls.months.textContent = String(months);
  if (countdownEls.weeks) countdownEls.weeks.textContent = String(weeks);
  if (countdownEls.days) countdownEls.days.textContent = String(days);
  if (countdownEls.hours) countdownEls.hours.textContent = String(hours).padStart(2, '0');
  if (countdownEls.minutes) countdownEls.minutes.textContent = String(minutes).padStart(2, '0');
  if (countdownEls.seconds) countdownEls.seconds.textContent = String(seconds).padStart(2, '0');
  if (countdownEls.milliseconds) countdownEls.milliseconds.textContent = String(milliseconds).padStart(3, '0');
}

updateCountdown();
setInterval(updateCountdown, 80);

const reminderBtn = document.getElementById('reminderBtn');
function downloadReminder() {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ConexaoStreet//Meu Amor//PT-BR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:meuamor-20260404@conexaostreet',
    'DTSTAMP:20260311T120000Z',
    'DTSTART:20260404T120000Z',
    'DTEND:20260404T130000Z',
    'SUMMARY:Contagem regressiva acabou 💜',
    'DESCRIPTION:Dia 04/04 chegou. Hora de matar a saudade.\n\nLembrete criado pelo site Meu Amor.',
    'BEGIN:VALARM',
    'TRIGGER:-PT12H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Lembrete: o dia 04/04 está chegando 💜',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'lembrete-04-04.ics';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
reminderBtn?.addEventListener('click', downloadReminder);
