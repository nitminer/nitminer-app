'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Something went wrong!</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        {process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'}
      </p>
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
  )
}
