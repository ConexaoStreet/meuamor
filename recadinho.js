const transcriptParagraphs = ["Então, meu amor, eu sei que parece meio brega o que eu tô fazendo pra você, mas é minha forma de expressar do jeitinho que eu sei, da forma que eu sei, da maneira que eu sei. Faz tanto tempo que eu não te vejo, tanto tempo que eu não te abraço, tanto tempo que eu não te beijo, mas eu sinto tanta falta de você, de verdade. Só de falar já dá vontade de chorar, então eu vou ficar quietinho aqui pra não chorar, isso é óbvio.", "Esse áudio que eu tô gravando pra você é pra lembrar de todos os momentos que a gente passou junto, de tudo que a gente viveu, de todas as formas que a gente comemorou, de tudo que a gente fez. Eu sinto tanta falta de você, meu amor, eu sinto tanta falta de você, de verdade. Eu, desde que você entrou na minha vida, foi tudo muito repentino, tudo mudou do nada, mas esse do nada salvou tudo o que eu mais tinha.", "Caso eu nunca tive nada que eu tenha agora é você, e é isso que me deixa extremamente feliz. Eu espero mesmo, de verdade, que as coisas melhorem, que a gente consiga viver juntos, que a gente consiga casar, que a gente consiga passar nossa vida juntos pro resto da vida. Eu fico muito triste saber que você vai ter que voltar pra sua cidade, mas é uma coisa que você tem que fazer.", "Dá vontade de chorar, eu me sinto extremamente mal, e isso está acontecendo, mas eu não tenho muito o que fazer. Mas, de qualquer forma, eu te amo mais do que tudo, minha paixão, mais do que tudo mesmo, e eu espero que você sempre se lembre disso. Você é a razão do meu viver, eu tô morrendo de saudade.", "Eu tô deixando esse áudio gravado pra todo momento que você precisar ouvir minha voz. Mas, eu estou aqui. Sei que você tem que mandar mensagem pra me ouvir, mas de qualquer forma, às vezes eu posso estar dormindo, às vezes você pode ver isso aqui de madrugada.", "Então, eu quero que você saiba que você é o amor da minha vida, de verdade mesmo, garota. Não há ninguém que eu mais ame do que você, você é absolutamente tudo pra mim. Parabéns, você conseguiu transformar uma pessoa muito do jeito que era, pra pessoa mais incrível que existe na face da terra.", "Muito obrigado, meu amor, muito obrigado mesmo. Espero que você tenha um bom dia, ou uma boa tarde, ou uma boa noite, ou uma boa madrugada, dependendo da hora que você está ouvindo, no caso. Mas, de qualquer forma, independente da hora, eu quero que você saiba que essa mesma hora que você tá ouvindo esse áudio, é a mesma hora que eu tô pensando em você."];
const audio = document.getElementById('voiceAudio');
const playBtn = document.getElementById('playVoice');
const seekbar = document.getElementById('voiceSeek');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const transcriptBox = document.getElementById('transcriptBox');
const restartBtn = document.getElementById('restartVoice');
const autoScrollBtn = document.getElementById('toggleAutoScroll');
let autoScroll = true;
let tokenTimings = [];
let spans = [];
let rafId = null;

function formatTime(value) {
  if (!Number.isFinite(value)) return '00:00';
  const mins = Math.floor(value / 60);
  const secs = Math.floor(value % 60);
  return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

function tokenizeParagraph(text) {
  return text.split(/\s+/).filter(Boolean).map((token) => {
    const visible = token;
    const plain = token.normalize('NFD').replace(/[̀-ͯ]/g, '');
    const letters = (plain.match(/[A-Za-zÀ-ÿ0-9]/g) || []).length;
    const hardPause = /[.!?]$/.test(token) ? 0.9 : /[,;:]$/.test(token) ? 0.35 : 0;
    const extra = token.includes('...') ? 0.45 : 0;
    const weight = Math.max(0.18, letters * 0.045) + hardPause + extra;
    return { visible, weight };
  });
}

function buildTranscript() {
  transcriptBox.innerHTML = '';
  spans = [];
  const tokens = [];
  transcriptParagraphs.forEach((paragraph) => {
    const p = document.createElement('p');
    p.className = 'transcript-paragraph';
    tokenizeParagraph(paragraph).forEach((token) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = token.visible + ' ';
      p.appendChild(span);
      spans.push(span);
      tokens.push(token);
    });
    transcriptBox.appendChild(p);
  });
  return tokens;
}

function buildTimings() {
  const tokens = buildTranscript();
  const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 1;
  const totalWeight = tokens.reduce((sum, token) => sum + token.weight, 0) || 1;
  let cursor = 0;
  tokenTimings = tokens.map((token, index) => {
    const spanDuration = (token.weight / totalWeight) * duration;
    const start = cursor;
    cursor += spanDuration;
    spans[index].dataset.time = String(start);
    spans[index].addEventListener('click', () => {
      audio.currentTime = start;
      updateTranscript(true);
    });
    return { start, end: cursor };
  });
}

function updateProgress() {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  const progress = Math.min(1000, Math.max(0, (audio.currentTime / audio.duration) * 1000));
  seekbar.value = String(progress);
  seekbar.style.setProperty('--progress', `${(progress / 10).toFixed(2)}%`);
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

function updateTranscript(forceScroll = false) {
  if (!tokenTimings.length) return;
  const t = audio.currentTime;
  let activeIndex = tokenTimings.findIndex((item) => t >= item.start && t < item.end);
  if (activeIndex === -1) activeIndex = tokenTimings.length - 1;

  spans.forEach((span, index) => {
    span.classList.toggle('played', index < activeIndex);
    span.classList.toggle('active', index === activeIndex);
  });

  if ((autoScroll || forceScroll) && spans[activeIndex]) {
    const target = spans[activeIndex];
    const top = target.offsetTop - transcriptBox.clientHeight * 0.32;
    transcriptBox.scrollTo({ top: Math.max(0, top), behavior: forceScroll ? 'smooth' : 'smooth' });
  }
}

function loop() {
  updateProgress();
  updateTranscript();
  if (!audio.paused) rafId = requestAnimationFrame(loop);
}

function syncPlayUi() {
  playBtn.textContent = audio.paused ? '▶' : '❚❚';
}

playBtn.addEventListener('click', async () => {
  try {
    if (audio.paused) {
      await audio.play();
      syncPlayUi();
      cancelAnimationFrame(rafId);
      loop();
    } else {
      audio.pause();
      syncPlayUi();
    }
  } catch (_) {
    syncPlayUi();
  }
});

restartBtn.addEventListener('click', async () => {
  audio.currentTime = 0;
  updateProgress();
  updateTranscript(true);
  try {
    await audio.play();
    syncPlayUi();
    cancelAnimationFrame(rafId);
    loop();
  } catch (_) { syncPlayUi(); }
});

autoScrollBtn.addEventListener('click', () => {
  autoScroll = !autoScroll;
  autoScrollBtn.classList.toggle('active', autoScroll);
  autoScrollBtn.textContent = autoScroll ? 'Transcrição acompanhando' : 'Transcrição parada';
});

seekbar.addEventListener('input', () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  audio.currentTime = (Number(seekbar.value) / 1000) * audio.duration;
  updateProgress();
  updateTranscript(true);
});

audio.addEventListener('loadedmetadata', () => {
  totalTimeEl.textContent = formatTime(audio.duration);
  buildTimings();
  updateProgress();
  updateTranscript(true);
});

audio.addEventListener('play', () => {
  syncPlayUi();
  cancelAnimationFrame(rafId);
  loop();
});

audio.addEventListener('pause', () => {
  syncPlayUi();
  cancelAnimationFrame(rafId);
});

audio.addEventListener('ended', () => {
  syncPlayUi();
  cancelAnimationFrame(rafId);
  updateTranscript(true);
});

syncPlayUi();

window.addEventListener('load', async () => {
  const autoplayFlag = (() => {
    try { return sessionStorage.getItem('autoplayVoiceNote') === '1'; } catch (_) { return false; }
  })();
  if (autoplayFlag) {
    try { sessionStorage.removeItem('autoplayVoiceNote'); } catch (_) {}
    try {
      await audio.play();
    } catch (_) {
      syncPlayUi();
    }
  }
});
