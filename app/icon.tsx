import { ImageResponse } from 'next/og';
import { BRAND_PAPER, BrickCameraMark } from '@/lib/brandMark';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

// Icono de la pestaña: la cámara-ladrillo del logo en azul bolígrafo sobre
// el papel crema de la web. Trazo más grueso que en la web para que se lea
// a 16-32 px.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: BRAND_PAPER,
          borderRadius: 14,
        }}
      >
        <BrickCameraMark width={56} strokeWidth={4.5} />
      </div>
    ),
    { ...size }
  );
}
