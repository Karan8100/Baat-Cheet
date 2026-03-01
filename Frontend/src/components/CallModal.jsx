import { useEffect, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useChatStore } from "../store/useChatStore";

const CallModal = () => {
  const {
    currentCall,
    incomingCall,
    callStatus,
    localStream,
    remoteStream,
    isMicMuted,
    isCameraOff,
    acceptIncomingCall,
    rejectIncomingCall,
    endCurrentCall,
    toggleMute,
    toggleCamera,
  } = useCallStore();

  const { users } = useChatStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream || null;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream || null;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream || null;
    }
  }, [remoteStream]);

  if (!incomingCall && !currentCall) return null;

  const activeCall = currentCall || incomingCall;
  const isVideoCall = activeCall?.callType === "video";
  const peerId = currentCall ? currentCall.peerUserId : incomingCall?.fromUserId;
  
  // Get peer user details from users list
  const peerUser = users.find(user => user._id === peerId);
  const peerLabel = peerUser?.fullName || peerUser?.email || peerId;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-base-100 border border-base-300 p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{incomingCall ? "Incoming call" : "Call in progress"}</h3>
          <span className="text-sm text-base-content/60">{callStatus}</span>
        </div>

        <p className="text-sm text-base-content/70">User: <span className="font-semibold text-base-content">{peerLabel}</span></p>
        <audio ref={remoteAudioRef} autoPlay playsInline />

        {isVideoCall ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl overflow-hidden bg-black aspect-video relative">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <p className="text-sm font-semibold text-white">{peerLabel}</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden bg-black aspect-video relative">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <p className="text-sm font-semibold text-white">You</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-base-200 p-6 text-center text-base-content/70">
            Voice call active
          </div>
        )}

        {incomingCall ? (
          <div className="flex items-center justify-center gap-3">
            <button className="btn btn-success" onClick={acceptIncomingCall}>
              <Phone className="size-4" /> Accept
            </button>
            <button className="btn btn-error" onClick={rejectIncomingCall}>
              <PhoneOff className="size-4" /> Reject
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button className="btn" onClick={toggleMute}>
              {isMicMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              {isMicMuted ? "Unmute" : "Mute"}
            </button>

            {isVideoCall && (
              <button className="btn" onClick={toggleCamera}>
                {isCameraOff ? <VideoOff className="size-4" /> : <Video className="size-4" />}
                {isCameraOff ? "Start video" : "Stop video"}
              </button>
            )}

            <button className="btn btn-error" onClick={() => endCurrentCall("ended") }>
              <PhoneOff className="size-4" /> End
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallModal;
