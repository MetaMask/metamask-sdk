import request from 'supertest';
import { app } from './api-config';

jest.mock('analytics-node');

describe('API Config', () => {
  describe('GET /', () => {
    it('should respond with success', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({ success: true });
    });
  });

  describe('POST /debug', () => {
    it('should respond with error when event is missing', async () => {
      const response = await request(app).post('/debug').send({});
      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({ error: 'event is required' });
    });

    it('should respond with error when event name is wrong', async () => {
      const response = await request(app)
        .post('/debug')
        .send({ event: 'wrong_event' });
      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({ error: 'wrong event name' });
    });

    it('should respond with success when event is correct', async () => {
      const response = await request(app)
        .post('/debug')
        .send({ event: 'sdk_test' });
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({ success: true });
    });
  });
});
