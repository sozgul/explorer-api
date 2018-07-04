
const request = require('supertest');
const api = require('../api');

describe('api.js', () => {
  test('the root path should respond to GET method', async () => {
    const response = await request(api).get('/');
    expect(response.statusCode).toBe(200);
  });
});
