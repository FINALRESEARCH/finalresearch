'use client';

import { useEffect, useRef } from 'react';

const ROOM_URL = 'https://finalresearch.whereby.com/final5bb0e391-3d3f-41e2-b8ce-f498250152e8';
const SCRIPT_SRC = 'https://cdn.srv.whereby.com/embed/v3-embed.js';

export default function CallPage() {
  const embedRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.type = 'module';
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <whereby-embed
        ref={embedRef}
        room={ROOM_URL}
        logo="off"
        minimal="on"
        localization="off"
        precallReview="off"
        skipMediaPermissionPrompt
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 32,
          background: '#000',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
