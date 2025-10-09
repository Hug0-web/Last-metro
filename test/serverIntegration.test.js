const request = require('supertest');

let mockQuery; 

jest.mock('pg', () => {
  
  return {
    Pool: jest.fn(() => {
      mockQuery = jest.fn();
      return { query: mockQuery };
    })
  };
});

describe('API integration', () => {
  let app;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, DATABASE_URL: 'postgres://user:pass@localhost:5432/db' };
    app = require('../server'); 
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  test('GET /health -> 200 + payload attendu', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'dernier-metro-api' });
  });

  test('GET /next-metro sans station -> 400', async () => {
    const res = await request(app).get('/next-metro');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'missing station' });
  });

  test('GET /next-metro avec station -> 200 + shape', async () => {
    const res = await request(app).get('/next-metro').query({ station: 'Bastille' });
    expect(res.status).toBe(200);
    expect(res.body.station).toBe('Bastille');
    expect(res.body.line).toBe('M1');
    expect(res.body.headwayMin).toBe(3);
    expect(res.body.nextArrival).toMatch(/^\d{2}:\d{2}$/);
  });

  test('GET /test-db (succès) -> 200', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
    const res = await request(app).get('/test-db');
    expect(mockQuery).toHaveBeenCalledWith('SELECT 1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET /test-db (échec DB) -> 500 + message', async () => {
    mockQuery.mockRejectedValueOnce(new Error('boom db'));
    const res = await request(app).get('/test-db');
    expect(res.status).toBe(500);
    expect(res.body.status).toBe('error');
    expect(res.body.error).toMatch(/boom db/);
  });

  test('GET /unknown -> 404 JSON', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'not found' });
  });

  test('Logger minimal: log sur requête', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    const calls = spy.mock.calls.map(args => args.join(' '));
    const hasHealthLog = calls.some(msg =>
      msg.startsWith('GET /health -> 200') && msg.endsWith('ms')
    );
    expect(hasHealthLog).toBe(true);
  });
});