import { ImageResponse } from 'next/og';
import { BRAND_BLUE, BRAND_INK, BRAND_PAPER, BrickCameraMark } from '@/lib/brandMark';

// Imagen que se muestra al compartir el link de la web en WhatsApp, X,
// Facebook, Discord, etc. Se genera en el momento del build (no en cada
// visita), así que no afecta el rendimiento del sitio. Sigue el estilo de la
// web: papel crema, tinta y la cámara-ladrillo del logo en azul bolígrafo.

export const alt = 'IanTBuild — Fotografía de miniaturas LEGO';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const STUDS = Array.from({ length: 30 }, (_, i) => i);

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
          background: BRAND_PAPER,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', marginBottom: 36 }}>
          <BrickCameraMark width={170} strokeWidth={2.6} />
        </div>

        <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, color: BRAND_INK, letterSpacing: -2 }}>IanTBuild</div>
        <div style={{ display: 'flex', fontSize: 38, color: BRAND_BLUE, marginTop: 14 }}>Pieza a pieza, foto a foto.</div>
        <div style={{ display: 'flex', fontSize: 28, color: '#5b554b', marginTop: 10 }}>Fotografía de miniaturas LEGO</div>

        {/* Tira de película con perforaciones de studs, como los separadores de la web */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 28,
            left: 40,
            right: 40,
            height: 34,
            borderTop: `3px solid ${BRAND_INK}`,
            borderBottom: `3px solid ${BRAND_INK}`,
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: 0.25,
          }}
        >
          {STUDS.map((i) => (
            <div key={i} style={{ display: 'flex', width: 14, height: 14, borderRadius: '50%', border: `3px solid ${BRAND_INK}` }} />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
