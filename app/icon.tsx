import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

const ACCENT = '#b3382c';

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
          background: ACCENT,
          borderRadius: 14,
        }}
      >
        <svg width="52" height="52" viewBox="0 0 36 36">
          <rect x="0" y="0" width="36" height="36" fill={ACCENT} />
          {[[11, 11], [25, 11], [11, 25], [25, 25]].map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx + 1} cy={cy + 1.5} r="5.5" fill="rgba(0,0,0,0.3)" />
              <circle cx={cx} cy={cy} r="5.5" fill={ACCENT} />
              <circle cx={cx - 2} cy={cy - 2} r="1.7" fill="white" fillOpacity="0.5" />
            </g>
          ))}
        </svg>
      </div>
    ),
    { ...size }
  );
}
