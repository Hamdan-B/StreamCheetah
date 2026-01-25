'use client';

import {
  LivestreamLayout,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useEffect } from 'react';

export default function LivestreamWatching() {
  const call = useCall();
  const { useIsCallLive } = useCallStateHooks();
  const isLive = useIsCallLive();

  useEffect(() => {
    let isMounted = true;
    const joinCall = async () => {
      if (call && isMounted && call.state.participantCount === 0) {
        try {
          await call.join();
        } catch (error: unknown) {
          if (
            error instanceof Error &&
            error.message.includes('Illegal State: call.join() shall be called only once')
          ) {
            // Call already joined, ignore this error
            return;
          }
          console.error('Error joining call:', error);
        }
      }
    };
    joinCall();
    return () => {
      isMounted = false;
    };
  }, [call]);

  return (
    <div className='aspect-video max-h-[500px] overflow-hidden'>
      {isLive && call?.id && (
        <LivestreamLayout
          muted={false}
          enableFullScreen={true}
          showLiveBadge={false}
          showDuration={true}
          showSpeakerName={false}
          showParticipantCount={true}
          floatingParticipantProps={{
            muted: false,
            enableFullScreen: true,
            showParticipantCount: false,
            showDuration: false,
            showLiveBadge: false,
            showSpeakerName: false,
            position: 'bottom-right',
          }}
        />
      )}
    </div>
  );
}
