// Tests de integración de la capa HTTP que NO dependen de la base de datos:
// routing, validación Zod y manejo centralizado de errores.
// (El flujo completo con BD se prueba manualmente con Postgres + seed.)
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';
import { createApp } from '../src/app';

let server: Server;
let baseUrl = '';

beforeAll(async () => {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('API HTTP (sin BD)', () => {
  it('GET / devuelve la información de la API', async () => {
    const res = await fetch(`${baseUrl}/`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toMatch(/MasterMatch/i);
    expect(Array.isArray(body.endpoints)).toBe(true);
  });

  it('POST /api/profile/analyze con body inválido devuelve 422', async () => {
    const res = await fetch(`${baseUrl}/api/profile/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalInfo: { name: '' } }),
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toBeTypeOf('object');
  });

  it('POST /api/masters/compare con más de 3 ids devuelve 422', async () => {
    const ids = [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
      '44444444-4444-4444-8444-444444444444',
    ];
    const res = await fetch(`${baseUrl}/api/masters/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIds: ids }),
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/masters/:id con id no-UUID devuelve 422', async () => {
    const res = await fetch(`${baseUrl}/api/masters/no-es-uuid`);
    expect(res.status).toBe(422);
  });

  it('GET de una ruta inexistente devuelve 404', async () => {
    const res = await fetch(`${baseUrl}/api/ruta-inexistente`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
