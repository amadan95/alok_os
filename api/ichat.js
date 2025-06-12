export const config = { runtime: 'edge' };

const HF_TOKEN = process.env.HF_API_KEY;
const MODEL = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (!HF_TOKEN) {
    return new Response('Server missing HF_API_KEY', { status: 500 });
  }

  const { messages } = await req.json();

  const body = JSON.stringify({
    model: MODEL,
    messages,
    max_tokens: 256,
    temperature: 0.7,
    stream: false
  });

  const resp = await fetch('https://api-inference.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body
  });

  if (!resp.ok) {
    const txt = await resp.text();
    return new Response(txt, { status: resp.status });
  }

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content || '';

  return new Response(JSON.stringify({ content }), {
    headers: { 'Content-Type': 'application/json' }
  });
} 