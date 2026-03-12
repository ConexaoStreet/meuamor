const audio = document.getElementById('voiceAudio');
const playBtn = document.getElementById('playBtn');
const statusEl = document.getElementById('audioStatus');
const transcriptEl = document.getElementById('transcript');

let words = [];
let wordNodes = [];
let lastActiveIndex = -1;
let ticking = false;

fetch('assets/nossa-voz.txt')
  .then((r) => r.text())
  .then((text) => {
    const clean = text.replace(/\s+/g, ' ').trim();
    words = clean ? clean.split(' ') : [];
    renderTranscript();
  })
  .catch(() => {
    transcriptEl.textContent = 'Não consegui carregar a transcrição.';
  });

function renderTranscript() {
  transcriptEl.innerHTML = '';
  wordNodes = words.map((word, index) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = word;
    span.dataset.index = String(index);
    span.addEventListener('click', () => {
      const duration = Math.max(audio.duration || 1, 1);
      const targetTime = (index / Math.max(words.length, 1)) * duration;
      try {
        audio.currentTime = targetTime;
      } catch (_) {}
      updateWordHighlight();
    });
    transcriptEl.appendChild(span);
    return span;
  });
}

function updateWordHighlight() {
  if (!wordNodes.length) return;
  const duration = Math.max(audio.duration || 1, 1);
  const progress = Math.min(Math.max(audio.currentTime / duration, 0), 1);
  const activeIndex = Math.min(wordNodes.length - 1, Math.floor(progress * wordNodes.length));

  if (activeIndex === lastActiveIndex) return;
  lastActiveIndex = activeIndex;

  for (let i = 0; i < wordNodes.length; i += 1) {
    const node = wordNodes[i];
    node.classList.toggle('active', i <= activeIndex);
    node.classList.toggle('current', i === activeIndex);
  }

  const current = wordNodes[activeIndex];
  if (current) {
    const transcriptRect = transcriptEl.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();
    if (currentRect.bottom > transcriptRect.bottom - 30 || currentRect.top < transcriptRect.top + 30) {
      current.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    }
  }
}

function requestHighlight() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateWordHighlight();
    ticking = false;
  });
}

playBtn.addEventListener('click', async () => {
  try {
    if (audio.paused) {
      await audio.play();
      statusEl.textContent = 'Tocando seu recadinho agora 💜';
      playBtn.textContent = 'Pausar áudio';
    } else {
      audio.pause();
      playBtn.textContent = 'Ouvir agora';
      statusEl.textContent = 'Áudio pausado.';
    }
  } catch (err) {
    statusEl.textContent = 'Se não tocar de primeira, usa os controles do player logo abaixo.';
    console.error('Erro ao tocar áudio:', err);
  }
});

audio.addEventListener('pause', () => {
  if (!audio.ended) playBtn.textContent = 'Ouvir agora';
});

audio.addEventListener('play', () => {
  playBtn.textContent = 'Pausar áudio';
});

audio.addEventListener('timeupdate', requestHighlight, { passive: true });
audio.addEventListener('seeked', requestHighlight, { passive: true });
audio.addEventListener('loadedmetadata', renderTranscript, { passive: true });
audio.addEventListener('ended', () => {
  playBtn.textContent = 'Ouvir de novo';
  statusEl.textContent = 'Terminou 💜';
});
