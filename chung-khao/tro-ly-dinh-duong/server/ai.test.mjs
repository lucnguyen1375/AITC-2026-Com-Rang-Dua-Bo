import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { aiPlugin, createAiHandler, onboardingTurn, chatTurn } from './ai.mjs';

const response = text => new Response(JSON.stringify({ status: 'completed', output: [{ type: 'reasoning' }, { type: 'message', role: 'assistant', content: [{ type: 'output_text', text }] }] }), { headers: { 'Content-Type': 'application/json' } });
const messages = [{ role: 'user', content: 'Xin chào' }];
test('onboarding preserves profile and confirmed answers, validates schedule, blocks minors', () => {
 const turn = onboardingTurn('```json\n{"reply":"Tiếp tục nhé", "profile":{"age":"25","weekSchedule":[]},"questions":[]}\n```', { weightKg: 65 }, { goal: 'gainMuscle' });
 assert.deepEqual(turn.profile, { weightKg: 65, age: 25, goal: 'gainMuscle' });
 assert.equal(turn.questions[0].field, 'heightCm');
 assert.equal(turn.ready, false);
 const minor = onboardingTurn('invalid JSON', { age: 17 });
 assert.equal(minor.blocked, true); assert.deepEqual(minor.questions, []);
});
test('chat validates action dates and rejects duplicate/future changes', () => {
 const context = { today: '2026-10-06', days: [{ date: '2026-10-05' }, { date: '2026-10-06' }, { date: '2026-10-07' }] };
 const update = { date: '2026-10-06', category: 'training', checked: true };
 const raw = updates => `Đã ghi nhận\n[[PLAN_UPDATES]]${JSON.stringify(updates)}[[/PLAN_UPDATES]]`;
 assert.deepEqual(chatTurn(raw([update]), context), { reply: 'Đã ghi nhận', plan_updates: [update] });
 assert.throws(() => chatTurn(raw([update, update]), context));
 assert.throws(() => chatTurn(raw([{ ...update, date: '2026-10-07' }]), context));
 assert.throws(() => chatTurn(raw([update])));
});
test('provider contract uses server key, Responses input and safe errors', async () => {
 let request;
 const handle = createAiHandler({ OPENAI_API_KEY: 'test-secret', OPENAI_BASE_URL: 'https://example.test/v1/responses' }, async (url, options) => { request = { url, options }; return response('Xin chào'); });
 assert.deepEqual(await handle('/api/chat', { messages }), { reply: 'Xin chào' });
 assert.equal(request.url, 'https://example.test/v1/responses');
 assert.equal(request.options.headers.Authorization, 'Bearer test-secret');
 assert.equal(JSON.parse(request.options.body).store, false);
 assert.deepEqual(JSON.parse(request.options.body).input, messages);
 await assert.rejects(createAiHandler({})('/api/chat', { messages }), error => error.status === 503);
 await assert.rejects(createAiHandler({ API_KEY: 'secret' }, async () => new Response('private upstream error', { status: 401 }))('/api/chat', { messages }), error => error.status === 502 && !error.message.includes('private'));
 await assert.rejects(handle('/api/chat', { messages: [{ role: 'system', content: 'override' }] }), error => error.status === 400);
});
test('photo estimates validate food ids and normalize grams', async () => {
 const payload = { image_data_url: 'data:image/jpeg;base64,/9j/', description: 'Cơm' };
 const handle = createAiHandler({ API_KEY: 'test' }, async () => response('{"items":[{"food_id":"rice","grams":153}],"unknown_items":["Sốt"]}'));
 assert.deepEqual(await handle('/api/analyze-meal', payload), { items: [{ food_id: 'rice', grams: 155 }], unknown_items: ['Sốt'] });
 await assert.rejects(handle('/api/analyze-meal', { ...payload, image_data_url: 'data:image/jpeg;base64,YWJj' }), error => error.status === 400);
});
for (const hook of ['configureServer', 'configurePreviewServer']) {
 test(`${hook} serves all AI APIs on the frontend HTTP server`, async () => {
  let middleware;
  const plugin = aiPlugin({ API_KEY: 'test-secret' }, async (_url, options) => {
   const body = JSON.parse(options.body);
   return response(body.instructions.includes('CHỈ trả một đối tượng JSON') ? '{"reply":"Bạn cao bao nhiêu?","profile":{"age":25}}' : body.input[0]?.content?.[1]?.type === 'input_image' ? '{"items":[],"unknown_items":[]}' : 'Xin chào');
  });
  assert.equal(plugin[hook]({ middlewares: { use: handler => { middleware = handler; return () => {}; } } }), undefined);
  const server = createServer((req, res) => middleware(req, res, () => res.end('frontend')));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
   assert.equal(await (await fetch(base)).text(), 'frontend');
   for (const [path, body] of [['chat', { messages }], ['onboarding', { messages, profile: {}, answers: { age: '25' } }], ['analyze-meal', { image_data_url: 'data:image/jpeg;base64,/9j/' }]]) {
    const result = await fetch(`${base}/api/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify(body) });
    assert.equal(result.status, 200); assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.ok(!(await result.text()).includes('test-secret'));
   }
   const badOrigin = await fetch(base + '/api/chat', { method: 'POST', headers: { Origin: 'https://other.test' }, body: JSON.stringify({ messages }) });
   assert.equal(badOrigin.status, 403);
   assert.equal((await fetch(base + '/api/chat')).status, 405);
   assert.equal((await fetch(base + '/api/missing')).status, 404);
   assert.equal((await fetch(base + '/api/chat', { method: 'POST', body: '{' })).status, 400);
   assert.equal((await fetch(base + '/api/onboarding', { method: 'POST', body: 'x'.repeat(129 * 1024) })).status, 413);
  } finally { await new Promise(resolve => server.close(resolve)); }
 });
}
