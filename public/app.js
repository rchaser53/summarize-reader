const form = document.querySelector('#reader-form');
const queryInput = document.querySelector('#query');
const speakInput = document.querySelector('#speak');
const submitButton = document.querySelector('#submit');
const status = document.querySelector('#status');
const result = document.querySelector('#result');
const summary = document.querySelector('#summary');
const articles = document.querySelector('#articles');
const replay = document.querySelector('#replay');
let lastSummary = '';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  result.hidden = true;
  status.className = '';
  status.textContent = 'ニュースを検索して要約しています…';
  try {
    const response = await fetch('/api/read', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: queryInput.value }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '処理に失敗しました。');
    lastSummary = data.summary;
    summary.textContent = data.summary;
    articles.replaceChildren(...data.articles.map((item) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = item.title;
      li.append(link);
      if (item.source) li.append(document.createTextNode(` — ${item.source}`));
      return li;
    }));
    result.hidden = false;
    replay.hidden = !speakInput.checked;
    if (speakInput.checked) await playSummary();
    status.textContent = speakInput.checked ? '要約を作成し、ずんだもんの声で読み上げました。' : '要約ができました。';
  } catch (error) {
    status.className = 'error';
    status.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

replay.addEventListener('click', async () => {
  try { await playSummary(); status.textContent = '読み上げました。'; }
  catch (error) { status.className = 'error'; status.textContent = error.message; }
});

async function playSummary() {
  const response = await fetch('/api/speak', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: lastSummary }) });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || '読み上げに失敗しました。');
  }
  const audio = new Audio(URL.createObjectURL(await response.blob()));
  await audio.play();
}
