'use client';

import { useEffect } from 'react';
import { useRoomConnection, VideoView, WherebyProvider } from '@whereby.com/browser-sdk/react';

const ROOM_URL = 'https://finalresearch.whereby.com/final5bb0e391-3d3f-41e2-b8ce-f498250152e8';

function CallSdkTestInner() {
  const { state, actions } = useRoomConnection(ROOM_URL, {
    localMediaOptions: { audio: true, video: true },
  });

  const { connectionStatus, localParticipant, remoteParticipants } = state;
  const { joinRoom, leaveRoom } = actions;

  useEffect(() => {
    console.log('[DEBUG:sdk-test] joining room');
    joinRoom();
    return () => leaveRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('[DEBUG:sdk-test] connectionStatus =', connectionStatus);
  }, [connectionStatus]);

  return (
    <div style={{ padding: 16, color: '#fff', background: '#000', minHeight: '100vh' }}>
      <p>connectionStatus: {connectionStatus}</p>
      <p>remoteParticipants: {remoteParticipants.length}</p>
      {localParticipant?.stream && (
        <div style={{ width: 320, height: 240 }}>
          <VideoView stream={localParticipant.stream} muted style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  );
}

export default function CallSdkTestPage() {
  return (
    <WherebyProvider>
      <CallSdkTestInner />
    </WherebyProvider>
  );
}
