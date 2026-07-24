'use client';

import { useState } from 'react';
import {
  useLocalMedia,
  useRoomConnection,
  VideoView,
  WherebyProvider,
  type RemoteParticipant,
  type LocalParticipant,
  type Screenshare,
  type ChatMessage,
} from '@whereby.com/browser-sdk/react';
import { ControlButtonWithMenu } from '@/components/CallCustom/DeviceMenu';
import { CameraOffX } from '@/components/CallCustom/CameraOffX';
import { ChatPanel } from '@/components/CallCustom/ChatPanel';

const ROOM_URL = 'https://finalresearch.whereby.com/final5bb0e391-3d3f-41e2-b8ce-f498250152e8';

function JoinScreen({
  localMedia,
  name,
  onNameChange,
  onJoin,
}: {
  localMedia: ReturnType<typeof useLocalMedia>;
  name: string;
  onNameChange: (name: string) => void;
  onJoin: () => void;
}) {
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const { state, actions } = localMedia;
  const { localStream, cameraDevices, microphoneDevices, speakerDevices, currentCameraDeviceId, currentMicrophoneDeviceId, currentSpeakerDeviceId } =
    state;

  const toggleCamera = () => {
    const next = !cameraOn;
    setCameraOn(next);
    actions.toggleCameraEnabled(next);
  };

  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    actions.toggleMicrophoneEnabled(next);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col gap-4">
        <div className="relative aspect-video w-full border border-foreground bg-background">
          {!localStream ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-foreground">
              LOADING CAMERA
            </div>
          ) : cameraOn ? (
            <VideoView
              stream={localStream}
              muted
              mirror
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
            />
          ) : (
            <CameraOffX />
          )}
        </div>

        <div className="flex gap-2">
          <ControlButtonWithMenu
            label={`CAMERA ${cameraOn ? 'ON' : 'OFF'}`}
            onToggle={toggleCamera}
            className="flex-1"
            groups={[
              {
                label: 'CAMERA',
                devices: cameraDevices,
                currentDeviceId: currentCameraDeviceId,
                onSelect: actions.setCameraDevice,
              },
            ]}
          />
          <ControlButtonWithMenu
            label={`MIC ${micOn ? 'ON' : 'OFF'}`}
            onToggle={toggleMic}
            className="flex-1"
            groups={[
              {
                label: 'MICROPHONE',
                devices: microphoneDevices,
                currentDeviceId: currentMicrophoneDeviceId,
                onSelect: actions.setMicrophoneDevice,
              },
            ]}
          />
          <ControlButtonWithMenu
            label="AUDIO"
            className="flex-1"
            groups={[
              {
                label: 'AUDIO',
                devices: speakerDevices,
                currentDeviceId: currentSpeakerDeviceId,
                onSelect: actions.setSpeakerDevice,
              },
            ]}
          />
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="YOUR NAME"
          autoFocus
          className="border border-foreground bg-background px-3 py-2 text-xs text-foreground placeholder:text-foreground placeholder:opacity-50 focus:outline-none"
        />

        <button
          type="button"
          onClick={onJoin}
          disabled={!name.trim()}
          className="border border-foreground py-2 text-xs text-foreground transition-opacity hover:opacity-70 disabled:opacity-50"
        >
          JOIN CALL
        </button>
      </div>
    </div>
  );
}

function ParticipantTile({
  participant,
  isLocal,
}: {
  participant: LocalParticipant | RemoteParticipant;
  isLocal: boolean;
}) {
  return (
    <div className="relative aspect-video w-full shrink-0 border border-foreground bg-background">
      {participant.stream && participant.isVideoEnabled ? (
        <VideoView
          stream={participant.stream}
          muted={isLocal}
          mirror={isLocal}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
        />
      ) : (
        <CameraOffX />
      )}
      <div className="absolute bottom-0 left-0 border-t border-r border-foreground bg-background px-2 py-1 text-xs text-foreground">
        {participant.displayName || 'GUEST'}
        {!participant.isAudioEnabled && ' · MUTED'}
      </div>
    </div>
  );
}

function ScreenshareTile({ screenshare }: { screenshare: Screenshare }) {
  return (
    <div className="relative aspect-video max-h-full w-full border border-foreground bg-background">
      {screenshare.stream && (
        <VideoView
          stream={screenshare.stream}
          muted={screenshare.isLocal}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'contain',
          }}
        />
      )}
      <div className="absolute bottom-0 left-0 border-t border-r border-foreground bg-background px-2 py-1 text-xs text-foreground">
        SCREEN SHARE{screenshare.isLocal ? ' · YOU' : ''}
      </div>
    </div>
  );
}

function InCallScreen({
  localMedia,
  localParticipant,
  remoteParticipants,
  screenshares,
  localScreenshareStatus,
  chatMessages,
  actions,
}: {
  localMedia: ReturnType<typeof useLocalMedia>;
  localParticipant: LocalParticipant;
  remoteParticipants: RemoteParticipant[];
  screenshares: Screenshare[];
  localScreenshareStatus?: string;
  chatMessages: ChatMessage[];
  actions: ReturnType<typeof useRoomConnection>['actions'];
}) {
  const { toggleCamera, toggleMicrophone, leaveRoom, startScreenshare, stopScreenshare, sendChatMessage } = actions;
  const isSharingScreen = Boolean(localScreenshareStatus) || screenshares.some((s) => s.isLocal);
  const [chatOpen, setChatOpen] = useState(false);
  const {
    cameraDevices,
    microphoneDevices,
    speakerDevices,
    currentCameraDeviceId,
    currentMicrophoneDeviceId,
    currentSpeakerDeviceId,
  } = localMedia.state;

  const senderNames = Object.fromEntries(remoteParticipants.map((p) => [p.id, p.displayName || 'GUEST']));

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="flex flex-1 flex-col overflow-y-auto sm:flex-row sm:overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          {screenshares.length > 0 ? (
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2 sm:flex-row sm:overflow-hidden">
              <div className="flex flex-1 flex-col items-center justify-center gap-2 overflow-hidden">
                {screenshares.map((screenshare) => (
                  <ScreenshareTile key={screenshare.id} screenshare={screenshare} />
                ))}
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:w-56 sm:overflow-y-auto">
                <ParticipantTile participant={localParticipant} isLocal />
                {remoteParticipants.map((participant) => (
                  <ParticipantTile key={participant.id} participant={participant} isLocal={false} />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid flex-1 auto-rows-fr grid-cols-1 gap-2 p-2 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
              <ParticipantTile participant={localParticipant} isLocal />
              {remoteParticipants.map((participant) => (
                <ParticipantTile key={participant.id} participant={participant} isLocal={false} />
              ))}
            </div>
          )}
        </div>

        {chatOpen && (
          <ChatPanel
            messages={chatMessages}
            senderNames={senderNames}
            localSenderId={localParticipant.id}
            onSend={sendChatMessage}
            onClose={() => setChatOpen(false)}
          />
        )}
      </div>

      <div className="flex justify-center gap-2 border-t border-foreground p-2">
        <ControlButtonWithMenu
          label={`CAMERA ${localParticipant.isVideoEnabled ? 'ON' : 'OFF'}`}
          onToggle={() => toggleCamera()}
          groups={[
            {
              label: 'CAMERA',
              devices: cameraDevices,
              currentDeviceId: currentCameraDeviceId,
              onSelect: localMedia.actions.setCameraDevice,
            },
          ]}
        />
        <ControlButtonWithMenu
          label={`MIC ${localParticipant.isAudioEnabled ? 'ON' : 'OFF'}`}
          onToggle={() => toggleMicrophone()}
          groups={[
            {
              label: 'MICROPHONE',
              devices: microphoneDevices,
              currentDeviceId: currentMicrophoneDeviceId,
              onSelect: localMedia.actions.setMicrophoneDevice,
            },
          ]}
        />
        <ControlButtonWithMenu
          label="AUDIO"
          groups={[
            {
              label: 'AUDIO',
              devices: speakerDevices,
              currentDeviceId: currentSpeakerDeviceId,
              onSelect: localMedia.actions.setSpeakerDevice,
            },
          ]}
        />
        <button
          type="button"
          onClick={() => (isSharingScreen ? stopScreenshare() : startScreenshare())}
          className="border border-foreground px-4 py-2 text-xs text-foreground transition-opacity hover:opacity-70"
        >
          {isSharingScreen ? 'STOP SHARING' : 'SHARE SCREEN'}
        </button>
        <button
          type="button"
          onClick={() => setChatOpen((o) => !o)}
          className="border border-foreground px-4 py-2 text-xs text-foreground transition-opacity hover:opacity-70"
        >
          CHAT{chatMessages.length > 0 ? ` (${chatMessages.length})` : ''}
        </button>
        <button
          type="button"
          onClick={() => leaveRoom()}
          className="border border-foreground px-4 py-2 text-xs text-foreground transition-opacity hover:opacity-70"
        >
          LEAVE
        </button>
      </div>
    </div>
  );
}

function CallInner() {
  const [name, setName] = useState('');
  const localMedia = useLocalMedia({ audio: true, video: true });
  const { state, actions } = useRoomConnection(ROOM_URL, { localMedia, displayName: name });
  const {
    connectionStatus,
    connectionError,
    localParticipant,
    remoteParticipants,
    screenshares,
    localScreenshareStatus,
    chatMessages,
  } = state;
  const { joinRoom, setDisplayName } = actions;

  const handleJoin = () => {
    joinRoom()
      .then(() => setDisplayName(name))
      .catch((err) => console.error('[call] joinRoom rejected', err));
  };

  if (connectionStatus === 'ready') {
    return <JoinScreen localMedia={localMedia} name={name} onNameChange={setName} onJoin={handleJoin} />;
  }

  if (connectionStatus === 'connected' && localParticipant) {
    return (
      <InCallScreen
        localMedia={localMedia}
        localParticipant={localParticipant}
        remoteParticipants={remoteParticipants}
        screenshares={screenshares}
        localScreenshareStatus={localScreenshareStatus}
        chatMessages={chatMessages}
        actions={actions}
      />
    );
  }

  if (connectionStatus === 'left') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background text-xs text-foreground">
        <div>LEFT THE ROOM</div>
        <button
          type="button"
          onClick={() => joinRoom()}
          className="border border-foreground px-4 py-2 text-xs text-foreground transition-opacity hover:opacity-70"
        >
          REJOIN
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-2 bg-background text-xs text-foreground">
      <div>{connectionStatus}</div>
      {connectionError && <div className="text-red-400">{connectionError}</div>}
    </div>
  );
}

export default function CallPage() {
  return (
    <WherebyProvider>
      <CallInner />
    </WherebyProvider>
  );
}
