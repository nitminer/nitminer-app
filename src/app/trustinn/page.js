'use client';

import dynamic from 'next/dynamic';

const ToolsComponent = dynamic(() => import('@/components/trustinn/ToolsComponent'), {
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontSize: 18,
      color: '#9ca3af',
      background: '#f8fafc',
      fontFamily: "'DM Mono', 'Fira Code', 'Cascadia Code', monospace"
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⟳</div>
        Loading Tools Interface...
      </div>
    </div>
  ),
  ssr: false
});

export default function TrustInnPage() {
  return <ToolsComponent />;
}
