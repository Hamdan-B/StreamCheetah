import { useDatabase } from "@/contexts/databaseContext";
import {
  Call,
  useCallStateHooks,
  useDeviceList,
} from "@stream-io/video-react-sdk";
import { ParticipantView } from "@stream-io/video-react-sdk";
import { Button } from "../button/button";
import { ArrowRight, User, Camera, Microphone } from "../icons";
import { useState, useEffect } from "react";
import GoLiveForm from "./goLiveForm";
import { useSupabaseAuth } from "@/lib/supabaseAuth";

export default function StreamerView({
  call,
  chatExpanded,
  setChatExpanded,
  onStreamStop,
  onStreamStart,
}: {
  call: Call;
  chatExpanded: boolean;
  setChatExpanded: (expanded: boolean) => void;
  onStreamStop?: () => Promise<void>;
  onStreamStart?: (chatSessionId: string) => void;
}) {
  const [showGoLiveForm, setShowGoLiveForm] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const { user } = useSupabaseAuth();
  const { getUserData, deleteLivestream, setLiveStatus } = useDatabase();
  const {
    useCameraState,
    useMicrophoneState,
    useScreenShareState,
    useParticipantCount,
    useIsCallLive,
    useParticipants,
  } = useCallStateHooks();

  const {
    camera,
    isEnabled: isCamEnabled,
    devices,
    selectedDevice,
  } = useCameraState();
  const { microphone, isEnabled: isMicEnabled } = useMicrophoneState();
  const { screenShare, isEnabled: isScreenShareEnabled } =
    useScreenShareState();

  const participantCount = useParticipantCount();
  const isLive = useIsCallLive();

  const [firstParticipant] = useParticipants();
  const { deviceList, selectedDeviceInfo } = useDeviceList(
    devices,
    selectedDevice,
  );

  console.log("Camera enabled: ", isCamEnabled);

  // Get current user data when component mounts
  useEffect(() => {
    const getCurrentUser = async () => {
      const userId = user?.id;
      if (userId) {
        const userData = await getUserData(userId);
        if (userData) {
          setCurrentUserName(userData.user_name);
        }
      }
    };
    getCurrentUser();
  }, [user?.id, getUserData]);

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Video Preview Section */}
      <div
        className={`relative flex items-center justify-center flex-1 overflow-hidden border-b-2 transition-colors ${
          isLive ? "border-error/50" : "border-muted"
        }`}
      >
        <>
          {firstParticipant ? (
            <>
              <ParticipantView
                className="h-full w-full"
                trackType={
                  isScreenShareEnabled ? "screenShareTrack" : "videoTrack"
                }
                VideoPlaceholder={() => (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="w-16 h-16 text-muted-foreground mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-muted-foreground">Camera is off</p>
                    </div>
                  </div>
                )}
                participant={firstParticipant}
              />
              {isScreenShareEnabled && isCamEnabled && (
                <ParticipantView
                  className="aspect-video h-32 absolute bottom-4 right-4 rounded-lg overflow-hidden border-2 border-muted shadow-lg"
                  trackType="videoTrack"
                  VideoPlaceholder={() => (
                    <div className="h-full w-full bg-muted" />
                  )}
                  participant={firstParticipant}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-muted">
              <svg
                className="w-16 h-16 text-muted-foreground mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-muted-foreground">
                Waiting for you to join...
              </p>
            </div>
          )}
        </>

        {/* Chat Toggle Button */}
        {!chatExpanded && setChatExpanded && (
          <button
            className="absolute top-4 right-4 bg-primary/90 hover:bg-primary p-3 rounded-full text-primary-foreground flex gap-2 transition-all duration-150 shadow-lg"
            onClick={() => setChatExpanded(!chatExpanded)}
            title="Open chat"
          >
            <ArrowRight />
          </button>
        )}

        {/* Live Status Indicator */}
        {isLive && (
          <div className="absolute top-4 left-4 bg-error text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </div>
        )}
      </div>

      {/* Controls and Settings */}
      <div className="bg-muted/50 border-t border-muted overflow-hidden max-h-[40%]">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-muted flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-lg">
            <User className="w-5 h-5" />
            <span className="font-semibold">
              {Math.max(0, participantCount - 1)} viewers
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                if (isLive) {
                  // Stop the stream first
                  call.stopLive();
                  // Clear chat messages
                  if (onStreamStop) {
                    await onStreamStop();
                  }
                  // Then mark as offline and remove from database
                  if (currentUserName) {
                    try {
                      // First mark as not live
                      await setLiveStatus(currentUserName, false);
                      // Then remove from database
                      const success = await deleteLivestream(currentUserName);
                      if (success) {
                        console.log("Livestream removed from database");
                      } else {
                        console.error(
                          "Failed to remove livestream from database",
                        );
                      }
                    } catch (error) {
                      console.error(
                        "Error removing livestream from database:",
                        error,
                      );
                    }
                  } else {
                    console.warn(
                      "No current username found, cannot remove livestream from database",
                    );
                  }
                } else {
                  setShowGoLiveForm(true);
                }
              }}
              className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                isLive
                  ? "bg-error hover:bg-error/90 text-white"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              {isLive ? "Stop Live" : "Go Live"}
            </button>
            <button
              onClick={() => camera.toggle()}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                isCamEnabled
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
              title={isCamEnabled ? "Disable camera" : "Enable camera"}
            >
              <Camera />
              {isCamEnabled ? "On" : "Off"}
            </button>
            <button
              onClick={() => microphone.toggle()}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                isMicEnabled
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
              title={isMicEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              <Microphone />
              {isMicEnabled ? "On" : "Off"}
            </button>
          </div>
        </div>

        {/* Share Options */}
        <div className="p-4 border-b border-muted">
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            What do you want to share?
          </h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={async () => {
                await camera.enable();
                await screenShare.disable();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isCamEnabled && !isScreenShareEnabled
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                  : "bg-background hover:bg-muted text-foreground"
              }`}
            >
              Camera only
            </button>
            <button
              onClick={async () => {
                await screenShare.enable();
                await camera.disable();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                !isCamEnabled && isScreenShareEnabled
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                  : "bg-background hover:bg-muted text-foreground"
              }`}
            >
              Screen only
            </button>
            <button
              onClick={async () => {
                await camera.enable();
                await screenShare.enable();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isCamEnabled && isScreenShareEnabled
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                  : "bg-background hover:bg-muted text-foreground"
              }`}
            >
              Screen + Camera
            </button>
          </div>
        </div>

        {/* Camera Selection */}
        {deviceList.length > 1 && (
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-foreground">
              Select camera
            </h3>
            <div className="flex gap-2 flex-wrap">
              {deviceList.map((device, index) => (
                <button
                  key={`${device.deviceId}-${index}`}
                  onClick={async () => {
                    await camera.select(device.deviceId);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedDeviceInfo?.deviceId === device.deviceId
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                      : "bg-background hover:bg-muted text-foreground"
                  }`}
                >
                  {device.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showGoLiveForm && (
        <GoLiveForm
          onGoLive={(chatSessionId) => {
            setShowGoLiveForm(false);
            call.goLive();
            onStreamStart?.(chatSessionId);
          }}
          onCancel={() => setShowGoLiveForm(false)}
        />
      )}
    </div>
  );
}
