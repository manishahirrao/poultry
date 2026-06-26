// FlockIQ — OG Image Generation
// File: apps/web/app/api/og/route.tsx
// Task Reference: SEO-001 (Phase 5)
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') ?? 'FlockIQ';
  const subtitle = searchParams.get('subtitle') ?? 'Poultry Management Platform';

  // Use Inter font from Google Fonts as a reliable system font for OG images
  const interFontData = await fetch(
    new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2', request.url)
  ).then((res) => res.arrayBuffer()).catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: 'linear-gradient(135deg, #1A5C34 0%, #0F4A28 55%, #0D3B21 100%)',
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* Logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: '#3DAE72', borderRadius: '8px' }} />
          <span style={{ color: '#FFFFFF', fontSize: '28px', fontWeight: 800, fontFamily: 'Inter, system-ui' }}>FlockIQ</span>
        </div>

        {/* Main content */}
        <div>
          <p style={{ color: '#3DAE72', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px' }}>
            Poultry Management Platform
          </p>
          <h1 style={{ color: '#FFFFFF', fontSize: '52px', fontWeight: 800, lineHeight: 1.05, fontFamily: 'Inter, system-ui', marginBottom: '20px' }}>
            {title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '22px', lineHeight: 1.5 }}>
            {subtitle}
          </p>
        </div>

        {/* Trust strip */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {['500+ Farms', '15+ Countries', '96.2% Accuracy'].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              <span style={{ color: '#3DAE72' }}>✓</span>
              {item}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            flockiq.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: interFontData ? [{ name: 'Inter', data: interFontData, style: 'normal', weight: 800 }] : [],
    }
  );
}
