const request = require('supertest');
const app = require('../app');

describe('GET /', () => {
  it('should return 200 OK and welcome message', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .expect((res) => {
        if (!('message' in res.body)) throw new Error("Missing message key");
      })
      .end(done);
  });
});

describe('GET /health', () => {
  it('should return 200 OK and status UP', (done) => {
    request(app)
      .get('/health')
      .expect(200)
      .expect((res) => {
         if (res.body.status !== 'UP') throw new Error("Status should be UP");
      })
      .end(done);
  });
});

// Close server after tests
after(() => {
    app.close();
});
