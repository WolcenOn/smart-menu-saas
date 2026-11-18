import type { NextConfig } from 'next';

function trustedS3Origin(): string {
  try {
    if (process.env.S3_ENDPOINT) {
      const url = new URL(process.env.S3_ENDPOINT);
      return url.protocol === 'https:' ? url.origin : '';
    }
    const region = process.env.S3_REGION;
    const bucket = process.env.S3_BUCKET;
    if (region && /^[a-z0-9-]+$/.test(region) && bucket && /^[a-z0-9.-]+$/.test(bucket)) {
      return 'https://' + bucket + '.s3.' + region + '.amazonaws.com';
    }
  } catch { /* Invalid storage URL: don't expand CSP. */ }
  return '';
}
const photoOrigin = trustedS3Origin();
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ${photoOrigin}; upgrade-insecure-requests` },
];

// CSP inicial de compatibilidad con Next. Antes de introducir contenido de terceros,
// reemplazar unsafe-inline por nonces/hashes y probar en despliegue.
const config: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default config;
