import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, preview } from 'vite';

// Exercise the real Vite config without making paid LLM requests.
for (const mode of ['dev', 'preview']) {
 test(`real Vite ${mode} serves HTML and AI on one port`, async () => {
  const server = mode === 'dev'
   ? await createServer({ server: { port: 0, strictPort: false } })
   : await preview({ preview: { port: 0, strictPort: false } });
  try {
   if (mode === 'dev') await server.listen();
   const base = `http://127.0.0.1:${server.httpServer.address().port}`;
   const html = await fetch(base);
   assert.equal(html.status, 200);
   assert.ok((await html.text()).includes('<div id="root">'));
   for (const route of ['chat', 'onboarding', 'analyze-meal']) {
    const api = await fetch(`${base}/api/${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(api.status, 400);
    assert.equal(typeof (await api.json()).error, 'string');
   }
  } finally {
   await server.close();
  }
 });
}
