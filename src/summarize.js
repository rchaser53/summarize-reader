export async function summarizeNews(articles, { apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_MODEL || 'gpt-4o-mini', fetchImpl = fetch } = {}) {
  if (!apiKey) throw new Error('要約には OPENAI_API_KEY が必要です。環境変数に設定してください。');
  if (!articles.length) throw new Error('検索結果がありませんでした。別のキーワードを試してください。');
  const response = await fetchImpl('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal: AbortSignal.timeout(45_000),
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'あなたは日本語のニュース編集者です。与えられた記事情報だけを根拠に、重要点を整理して自然な日本語で要約してください。異なる記事の情報を区別し、事実を補わず、最後に記事タイトルとURLを箇条書きで示してください。' },
        { role: 'user', content: JSON.stringify(articles.map(({ title, source, publishedAt, description, url }) => ({ title, source, publishedAt, description, url }))) },
      ],
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`要約 API に失敗しました (HTTP ${response.status}): ${detail.slice(0, 300)}`);
  }
  const data = await response.json();
  const summary = data.choices?.[0]?.message?.content?.trim();
  if (!summary) throw new Error('要約 API から文章を取得できませんでした。');
  return summary;
}
