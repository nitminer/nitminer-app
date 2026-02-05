'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong!</h2>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              marginTop: '10px',
              cursor: 'pointer',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
