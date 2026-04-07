import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon512() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: 'linear-gradient(135deg, #07100a 0%, #0f2a14 100%)',
          borderRadius: 108,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 300,
        }}
      >
        🐸
      </div>
    ),
    { width: 512, height: 512 },
  );
}
