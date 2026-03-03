import { useEffect, useRef ,useState} from "react";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff ,Clock} from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useChatStore } from "../store/useChatStore";



const AudioVisualizer = ({ stream }) => {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) return;

    // Web Audio API setup
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let animationFrameId;

    const renderFrame = () => {
      analyser.getByteFrequencyData(dataArray);
      // Volume ka average nikalo
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      setVolume(average);

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
      audioContext.close();
    };
  }, [stream]);

  // 5 lines ka array, aawaz ke hisaab se height change hogi
  return (
    <div className="flex items-center justify-center gap-1.5 h-16 mt-4">
      {[1, 1.5, 2, 1.5, 1].map((multiplier, i) => {
        // Aawaz ke hisaab se height calculate kar rahe hain
        const height = Math.max(8, (volume / 255) * 50 * multiplier);
        return (
          <div
            key={i}
            className="w-1.5 bg-primary rounded-full transition-all duration-75"
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
};

// ⏱️ Helper: Seconds ko MM:SS me convert karne ke liye
const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }
  return `${m}:${s}`;
};

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

  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let intervalId;
    if (callStatus === "connected") {
      intervalId = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0); // Reset if call ends or is ringing
    }
    return () => clearInterval(intervalId);
  }, [callStatus]);

useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream || null;
  }, [localStream]);

useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream || null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream || null;
  }, [remoteStream]);



  if (!incomingCall && !currentCall) return null;

  const activeCall = currentCall || incomingCall;
  const isVideoCall = activeCall?.callType === "video";
  const peerId = currentCall ? currentCall.peerUserId : incomingCall?.fromUserId;
  
  // Get peer user details from users list
  const peerUser = users.find(user => user._id === peerId);
  const peerLabel = peerUser?.fullName || peerUser?.email || peerId;
  const peerAvatar = peerUser?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${peerLabel}`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-base-100 border border-base-300 p-6 space-y-6 shadow-2xl">
        
        {/* Header */}
        {/* Header with Timer */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl tracking-tight flex items-center gap-2">
            {incomingCall ? "Incoming Call..." : "Call in progress"}
            {/* ⏱️ Timer Badge */}
            {callStatus === "connected" && (
              <span className="badge badge-primary gap-1 font-mono text-sm ml-2">
                <Clock className="size-3" /> {formatDuration(callDuration)}
              </span>
            )}
          </h3>
          <span className={`badge ${callStatus === 'connected' ? 'badge-success text-white' : 'badge-primary badge-outline animate-pulse'}`}>
            {callStatus}
          </span>
        </div>



        <audio ref={remoteAudioRef} autoPlay playsInline />

        {isVideoCall ? (
          /*  VIDEO CALL UI */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden bg-black aspect-video relative shadow-inner">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <p className="text-sm font-semibold text-white">{peerLabel}</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black aspect-video relative shadow-inner">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <p className="text-sm font-semibold text-white">You</p>
              </div>
            </div>
          </div>
        ) : (
          /*  AUDIO CALL UI */
          <div className="flex flex-col items-center justify-center py-10">
            <div className="relative">
              <img 
                src={peerAvatar} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-xl z-10 relative"
              />
              {["incoming", "ringing"].includes(callStatus) && (
                <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-75"></div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold mt-4">{peerLabel}</h2>
            
            {/* ⏱️ Timer & Status text under the name */}
            <p className="text-base-content/60 mt-1 font-mono">
              {callStatus === "connected" ? formatDuration(callDuration) : callStatus === "connecting" ? "Connecting..." : "Ringing..."}
            </p>
            
            {callStatus === "connected" && <AudioVisualizer stream={remoteStream} />}
          </div>
        )}

        {/* 🎛️ CONTROLS BAR */}
        {incomingCall ? (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button className="btn btn-success btn-wide rounded-full shadow-lg shadow-success/30 text-white" onClick={acceptIncomingCall}>
              <Phone className="size-5" /> Accept
            </button>
            <button className="btn btn-error btn-circle shadow-lg shadow-error/30" onClick={rejectIncomingCall}>
              <PhoneOff className="size-5 text-white" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 mt-8 bg-base-200 py-3 px-6 rounded-full w-fit mx-auto border border-base-300">
            <button 
              className={`btn btn-circle ${isMicMuted ? 'btn-error' : 'btn-ghost'}`} 
              onClick={toggleMute}
            >
              {isMicMuted ? <MicOff className="size-5 text-white" /> : <Mic className="size-5" />}
            </button>

            {isVideoCall && (
              <button 
                className={`btn btn-circle ${isCameraOff ? 'btn-error' : 'btn-ghost'}`} 
                onClick={toggleCamera}
              >
                {isCameraOff ? <VideoOff className="size-5 text-white" /> : <Video className="size-5" />}
              </button>
            )}

            <button className="btn btn-error btn-circle shadow-lg shadow-error/30 scale-110 ml-2" onClick={() => endCurrentCall("ended")}>
              <PhoneOff className="size-5 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallModal;
