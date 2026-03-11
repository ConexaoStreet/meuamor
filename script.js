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
