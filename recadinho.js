const audio = document.getElementById('voiceAudio');
const playBtn = document.getElementById('playBtn');
const statusEl = document.getElementById('audioStatus');
const transcriptEl = document.getElementById('transcript');

let words = [];
let wordNodes = [];
let lastActiveIndex = -1;

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
      highlightByTime();
    });
    transcriptEl.appendChild(span);
    return span;
  });
}

function highlightByTime() {
  if (!wordNodes.length) return;
  const duration = Math.max(audio.duration || 1, 1);
  const progress = Math.min(Math.max(audio.currentTime / duration, 0), 1);
  const activeIndex = Math.min(wordNodes.length - 1, Math.floor(progress * wordNodes.length));

  if (activeIndex === lastActiveIndex) return;
  lastActiveIndex = activeIndex;

  wordNodes.forEach((node, idx) => {
    node.classList.toggle('active', idx <= activeIndex);
    node.classList.toggle('current', idx === activeIndex);
  });

  const current = wordNodes[activeIndex];
  current?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
}

playBtn.addEventListener('click', async () => {
  try {
    if (audio.paused) {
      await audio.play();
      statusEl.textContent = 'Tocando seu recadinho agora 💜';
      playBtn.textContent = 'Pausar áudio';
    } else {
      audio.pause();
      playBtn.textContent = 'Tocar áudio';
      statusEl.textContent = 'Áudio pausado.';
    }
  } catch (err) {
    statusEl.textContent = 'No iPhone, toque novamente ou use os controles do player logo abaixo.';
    console.error('Erro ao tocar áudio:', err);
  }
});

audio.addEventListener('pause', () => {
  if (!audio.ended) playBtn.textContent = 'Tocar áudio';
});

audio.addEventListener('play', () => {
  playBtn.textContent = 'Pausar áudio';
});

audio.addEventListener('timeupdate', highlightByTime);
audio.addEventListener('loadedmetadata', renderTranscript);

audio.addEventListener('ended', () => {
  playBtn.textContent = 'Tocar áudio de novo';
  statusEl.textContent = 'Terminou 💜';
});
