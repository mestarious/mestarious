const textEl = document.getElementById('text');
const charCountEl = document.getElementById('charCount');
const recordBtn = document.getElementById('recordBtn');
const fileInput = document.getElementById('fileInput');
const refPreview = document.getElementById('refPreview');
const refStatus = document.getElementById('refStatus');
const generateBtn = document.getElementById('generateBtn');
const resultCard = document.getElementById('resultCard');
const resultAudio = document.getElementById('resultAudio');
const downloadLink = document.getElementById('downloadLink');
const errorBox = document.getElementById('errorBox');

let referenceBlob = null;
let mediaRecorder = null;
let recordedChunks = [];

textEl.addEventListener('input', () => {
  charCountEl.textContent = String(textEl.value.length);
  updateGenerateEnabled();
});

function setReference(blob, label) {
  referenceBlob = blob;
  refPreview.src = URL.createObjectURL(blob);
  refPreview.hidden = false;
  refStatus.textContent = label;
  refStatus.classList.add('status-pill--ready');
  updateGenerateEnabled();
}

function updateGenerateEnabled() {
  generateBtn.disabled = !(referenceBlob && textEl.value.trim().length > 0);
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) setReference(file, file.name);
});

recordBtn.addEventListener('click', async () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      setReference(blob, 'recorded clip');
      recordBtn.classList.remove('recording');
      recordBtn.innerHTML = '<span class="dot"></span> Record';
    };
    mediaRecorder.start();
    recordBtn.classList.add('recording');
    recordBtn.innerHTML = '<span class="dot"></span> Stop';
  } catch (err) {
    showError('Microphone access denied or unavailable. Try uploading a file instead.');
  }
});

generateBtn.addEventListener('click', async () => {
  hideError();
  resultCard.hidden = true;
  const text = textEl.value.trim();
  if (!text || !referenceBlob) return;

  generateBtn.disabled = true;
  const originalLabel = generateBtn.textContent;
  generateBtn.innerHTML = '<span class="spinner"></span> Generating...';

  try {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('reference', referenceBlob, 'reference-audio');

    const res = await fetch('/api/generate', { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Generation failed.');
    }

    resultAudio.src = data.audioUrl;
    downloadLink.href = data.audioUrl;
    resultCard.hidden = false;
    resultAudio.play().catch(() => {});
  } catch (err) {
    showError(err.message || 'Something went wrong.');
  } finally {
    generateBtn.textContent = originalLabel;
    updateGenerateEnabled();
  }
});

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function hideError() {
  errorBox.hidden = true;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
