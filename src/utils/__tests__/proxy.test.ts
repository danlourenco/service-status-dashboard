import { describe, it, expect } from 'vitest';
import { getProxyUrl } from '../http';

describe('getProxyUrl', () => {
  describe('development mode (isProduction = false)', () => {
    it('converts HTTPS URLs to proxy paths', () => {
      const result = getProxyUrl('https://api.example.com/health', false);
      expect(result).toBe('/api/api.example.com/health');
    });

    it('converts HTTP URLs to proxy paths', () => {
      const result = getProxyUrl('http://api.example.com/status', false);
      expect(result).toBe('/api/api.example.com/status');
    });

    it('preserves URL paths', () => {
      const result = getProxyUrl('https://api.example.com/v1/users/123', false);
      expect(result).toBe('/api/api.example.com/v1/users/123');
    });

    it('preserves query parameters', () => {
      const result = getProxyUrl('https://api.example.com/health?timeout=5000', false);
      expect(result).toBe('/api/api.example.com/health?timeout=5000');
    });

    it('preserves complex query parameters', () => {
      const result = getProxyUrl('https://api.example.com/search?q=test&limit=10&offset=0', false);
      expect(result).toBe('/api/api.example.com/search?q=test&limit=10&offset=0');
    });

    it('handles URLs with ports', () => {
      const result = getProxyUrl('https://api.example.com:8080/health', false);
      expect(result).toBe('/api/api.example.com:8080/health');
    });

    it('handles URLs with authentication', () => {
      const result = getProxyUrl('https://user:pass@api.example.com/health', false);
      // Note: URL.host doesn't include auth info, which is expected behavior
      expect(result).toBe('/api/api.example.com/health');
    });

    it('returns invalid URLs as-is', () => {
      const result = getProxyUrl('not-a-valid-url', false);
      expect(result).toBe('not-a-valid-url');
    });

    it('returns relative URLs as-is', () => {
      const result = getProxyUrl('/api/health', false);
      expect(result).toBe('/api/health');
    });

    it('returns empty string as-is', () => {
      const result = getProxyUrl('', false);
      expect(result).toBe('');
    });
  });

  describe('production mode (isProduction = true)', () => {
    it('returns URLs unchanged in production', () => {
      const result = getProxyUrl('https://api.example.com/health', true);
      expect(result).toBe('https://api.example.com/health');
    });

    it('returns HTTP URLs unchanged in production', () => {
      const result = getProxyUrl('http://api.example.com/status', true);
      expect(result).toBe('http://api.example.com/status');
    });

    it('returns URLs with paths unchanged in production', () => {
      const result = getProxyUrl('https://api.example.com/v1/users/123?active=true', true);
      expect(result).toBe('https://api.example.com/v1/users/123?active=true');
    });

    it('returns invalid URLs unchanged in production', () => {
      const result = getProxyUrl('not-a-valid-url', true);
      expect(result).toBe('not-a-valid-url');
    });

    it('returns relative URLs unchanged in production', () => {
      const result = getProxyUrl('/api/health', true);
      expect(result).toBe('/api/health');
    });
  });

  describe('edge cases', () => {
    it('handles localhost URLs in development', () => {
      const result = getProxyUrl('http://localhost:3000/health', false);
      expect(result).toBe('/api/localhost:3000/health');
    });

    it('handles IP addresses in development', () => {
      const result = getProxyUrl('http://192.168.1.1:8080/health', false);
      expect(result).toBe('/api/192.168.1.1:8080/health');
    });

    it('handles URLs with hash fragments', () => {
      const result = getProxyUrl('https://api.example.com/docs#section', false);
      expect(result).toBe('/api/api.example.com/docs');
    });

    it('handles very long URLs', () => {
      const longPath = '/a'.repeat(100);
      const result = getProxyUrl(`https://api.example.com${longPath}`, false);
      expect(result).toBe(`/api/api.example.com${longPath}`);
    });
  });
});