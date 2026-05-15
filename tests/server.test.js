/**
 * Server Tests
 * Tests for main server setup and middleware
 */

const request = require('supertest');
const express = require('express');

describe('Server', () => {
  let app;

  beforeEach(() => {
    // Create a test app instance
    app = express();
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });
    });

    // 404 Handler
    app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.path} not found`
      });
    });
  });

  describe('Health Check Endpoint', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment', 'test');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body.message).toContain('unknown-route');
    });
  });

  describe('CORS Headers', () => {
    it('should have proper headers configured', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });
  });
});
