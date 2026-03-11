const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
reveals.forEach((el) => observer.observe(el));

const music = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const MUSIC_START_TIME = 320; // 05:20

function setMusicStartTime() {
  if (!music) return;
  const applyStart = () => {
    try {
      if (Number.isFinite(music.duration) && music.duration > MUSIC_START_TIME) {
        music.currentTime = MUSIC_START_TIME;
      } else {
        music.currentTime = 0;
      }
    } catch (error) {
      console.warn('Não foi possível ajustar o tempo inicial da música.', error);
    }
  };

  if (music.readyState >= 1) {
    applyStart();
  } else {
    music.addEventListener('loadedmetadata', applyStart, { once: true });
  }
}

setMusicStartTime();

async function toggleMusic() {
  if (!music || !musicToggle) return;
  try {
    if (music.paused) {
      setMusicStartTime();
      music.volume = 0.55;
      await music.play();
      musicToggle.textContent = 'Pausar nossa música';
      musicToggle.classList.remove('missing-audio');
    } else {
      music.pause();
      musicToggle.textContent = 'Tocar nossa música';
    }
  } catch (error) {
    musicToggle.textContent = 'Adicione assets/mirrors.mp3';
    musicToggle.classList.add('missing-audio');
    console.warn('Arquivo de música não encontrado ou bloqueado pelo navegador.', error);
  }
}

musicToggle?.addEventListener('click', toggleMusic);

const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = ((y / rect.height) - 0.5) * -10;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo({ top: 0, behavior: 'auto' });


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
  const now = new Date();
  let diff = Math.max(0, countdownTarget.getTime() - now.getTime());

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
setInterval(updateCountdown, 50);

document.body.classList.add('locked-site');

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
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

reminderBtn?.addEventListener('click', downloadReminder);
