const request = require('supertest');
const app = require('../server');

describe('API sans DB', () => {
  beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
  afterAll(() => console.log.mockRestore && console.log.mockRestore());

  it('GET /health → 200 + JSON', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'dernier-metro-api' });
  });

  it('GET /next-metro sans station → 400', async () => {
    const res = await request(app).get('/next-metro');
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'missing station' });
  });

  it('GET /next-metro?station=Châtelet → 200', async () => {
    const res = await request(app).get('/next-metro').query({ station: 'Châtelet' });
    expect(res.statusCode).toBe(200);
    expect(res.body.station).toBe('Châtelet');
    expect(res.body.line).toBe('M1');
    expect(typeof res.body.nextArrival).toBe('string');
  });

  it('GET /unknown → 404', async () => {
    const res = await request(app).get('/unknown');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'not found' });
  });
});
