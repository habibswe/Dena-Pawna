import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Dena Pawna - Personal Finance Tracker'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'radial-gradient(circle at center, #121514 0%, #0a0a0a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            padding: '48px',
            borderRadius: '40px',
            marginBottom: '40px',
            border: '2px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, color: '#10b981', letterSpacing: '-0.05em' }}>
          Dena Pawna
        </div>
        <div style={{ fontSize: 40, color: '#a1a1aa', marginTop: '20px', fontWeight: 500 }}>
          Personal Finance Tracker
        </div>
      </div>
    ),
    { ...size }
  )
}
