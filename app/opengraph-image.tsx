import { ImageResponse } from 'next/og';

// Imagen que se muestra al compartir el link de la web en WhatsApp, X,
// Facebook, Discord, etc. Se genera en el momento del build (no en cada
// visita), así que no afecta el rendimiento del sitio.

export const alt = 'IanTBuild — Fotografía de miniaturas LEGO';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const ACCENT = '#b3382c';
const ACCENT_SHADOW = '#6e2019';
const STRIPE_COLORS = ['#b3382c', '#e0791f', '#006cb7', '#00852b'];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#05070c',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'rgba(0,108,183,0.18)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -120,
            right: -120,
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'rgba(179,56,44,0.2)',
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            width: 110,
            height: 110,
            borderRadius: 24,
            background: ACCENT,
            boxShadow: `0 10px 0 0 ${ACCENT_SHADOW}`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#e2685a', display: 'flex' }} />
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#e2685a', display: 'flex' }} />
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 92, fontWeight: 700, color: '#f5f7fb', letterSpacing: -2 }}>
          IanTBuild
        </div>
        <div style={{ display: 'flex', fontSize: 34, color: '#8c99b8', marginTop: 18 }}>
          Fotografía de miniaturas LEGO
        </div>

        <div style={{ display: 'flex', position: 'absolute', bottom: 0, left: 0, right: 0, height: 16 }}>
          {STRIPE_COLORS.map((color) => (
            <div key={color} style={{ flex: 1, background: color, display: 'flex' }} />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
