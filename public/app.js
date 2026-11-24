const form = document.querySelector('#reader-form');
const summaryInput = document.querySelector('#summary-input');
const submitButton = document.querySelector('#submit');
const status = document.querySelector('#status');
const result = document.querySelector('#result');
const player = document.querySelector('#player');
let lastSummary = '';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  result.hidden = true;
  status.className = '';
  status.textContent = 'VOICEVOX で音声を生成しています…';
  try {
    lastSummary = summaryInput.value;
    const response = await fetch('/api/speak', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: lastSummary }) });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || '音声生成に失敗しました。');
    }
    player.src = URL.createObjectURL(await response.blob());
    player.load();
    result.hidden = false;
    status.textContent = '音声を生成しました。プレーヤーの再生ボタンを押してください。';
  } catch (error) {
    status.className = 'error';
    status.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});
