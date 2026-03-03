import { create } from "zustand";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";
// const rtcConfig = {
//   iceServers: [
//     // STUN servers
//     {
//       urls: [
//         "stun:stun.l.google.com:19302",
//         "stun:stun1.l.google.com:19302"
//       ]
//     },  
//     // 2. Metered.ca STUN server
//     {
//       urls: "stun:stun.relay.metered.ca:80",
//     },

//     // 3. Metered.ca TURN servers (UDP & TCP fallbacks for strict networks)
//     {
//       urls: "turn:global.relay.metered.ca:80",
//       username: import.meta.env.VITE_TURN_USERNAME,
//       credential: import.meta.env.VITE_TURN_PASSWORD,
//     },
//     {
//       urls: "turn:global.relay.metered.ca:80?transport=tcp",
//       username: import.meta.env.VITE_TURN_USERNAME,
//       credential: import.meta.env.VITE_TURN_PASSWORD,
//     },
//     {
//       urls: "turn:global.relay.metered.ca:443",
//       username: import.meta.env.VITE_TURN_USERNAME,
//       credential: import.meta.env.VITE_TURN_PASSWORD,
//     },
//     {
//       urls: "turns:global.relay.metered.ca:443?transport=tcp",
//       username: import.meta.env.VITE_TURN_USERNAME,
//       credential: import.meta.env.VITE_TURN_PASSWORD,
//     },
//   ]
// };

// Frontend/src/store/useCallStore.js

// 1. Ye naya function add kar (imports ke theek neeche)
const getRTCConfig = () => {
  const turnUsername = import.meta.env.VITE_TURN_USERNAME;
  const turnPassword = import.meta.env.VITE_TURN_PASSWORD;

  const config = {
    iceServers: [
      { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }
    ]
  };

  // 🔒 Sirf tabhi TURN use karega jab credentials env me honge. No Hardcoding!
  if (turnUsername && turnPassword) {
    config.iceServers.push({
      urls: [
        "turn:global.relay.metered.ca:80",
        "turn:global.relay.metered.ca:80?transport=tcp",
        "turn:global.relay.metered.ca:443"
      ],
      username: turnUsername,
      credential: turnPassword,
    });
  }

  return config;
};

const buildCallId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useCallStore = create((set, get) => ({
  currentCall: null,
  incomingCall: null,
  callStatus: "idle",
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  pendingOffer: null,
  pendingIceCandidates: [],
  isMicMuted: false,
  isCameraOff: false,

  resetCallState: () => {
    const { peerConnection, localStream } = get();

    if (peerConnection) {
      peerConnection.onicecandidate = null;
      peerConnection.ontrack = null;
      peerConnection.onconnectionstatechange = null;
      peerConnection.close();
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    set({
      currentCall: null,
      incomingCall: null,
      callStatus: "idle",
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      pendingOffer: null,
      pendingIceCandidates: [],
      isMicMuted: false,
      isCameraOff: false,
    });
  },

  createPeerConnection: ({ socket, callId, peerUserId, myUserId }) => {
    const pc = new RTCPeerConnection(getRTCConfig());

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        console.log("ICE candidate gathering completed");
        return;
      }

      console.log("Sending ICE candidate:", event.candidate);
      socket.emit("call:ice-candidate", {
        callId,
        fromUserId: myUserId,
        toUserId: peerUserId,
        candidate: event.candidate,
      });
    };

    pc.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      const [stream] = event.streams;
      if (stream) {
        console.log("Setting remote stream:", stream);
        set({ remoteStream: stream });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log("Connection state changed to:", state);
      
      if (state === "connected") {
        set({ callStatus: "connected" });
      }

      if (["failed", "disconnected", "closed"].includes(state)) {
        console.log("Call ended due to connection state:", state);
        get().resetCallState();
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
    };

    set({ peerConnection: pc });
    return pc;
  },

  flushPendingIceCandidates: async () => {
    const { peerConnection, pendingIceCandidates } = get();
    if (!peerConnection || pendingIceCandidates.length === 0) return;

    for (const candidate of pendingIceCandidates) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Failed to add buffered ICE candidate", error);
      }
    }

    set({ pendingIceCandidates: [] });
  },

  processPendingOffer: async (socket) => {
    const authUser = useAuthStore.getState().authUser;
    const { peerConnection, currentCall, pendingOffer } = get();

    if (!authUser || !peerConnection || !currentCall || !pendingOffer) {
      console.warn("Cannot process offer - missing:", {
        authUser: !!authUser,
        peerConnection: !!peerConnection,
        currentCall: !!currentCall,
        pendingOffer: !!pendingOffer,
      });
      return;
    }

    try {
      console.log("Setting remote description from offer...");
      await peerConnection.setRemoteDescription(new RTCSessionDescription(pendingOffer));
      
      console.log("Creating answer...");
      const answer = await peerConnection.createAnswer();
      
      console.log("Setting local description with answer...");
      await peerConnection.setLocalDescription(answer);

      console.log("Sending answer...");
      socket.emit("call:answer", {
        callId: currentCall.callId,
        fromUserId: authUser._id,
        toUserId: currentCall.peerUserId,
        sdp: answer,
      });

      console.log("Flushing pending ICE candidates...");
      await get().flushPendingIceCandidates();
      set({ pendingOffer: null });
    } catch (error) {
      console.error("Failed to process incoming offer", error);
      toast.error("Could not accept call.");
      get().resetCallState();
    }
  },

  initializeSocketListeners: (socket) => {
    if (!socket) return;

    socket.off("call:incoming");
    socket.off("call:offer");
    socket.off("call:answer");
    socket.off("call:ice-candidate");
    socket.off("call:reject");
    socket.off("call:busy");
    socket.off("call:end");
    socket.off("call:unavailable");

    socket.on("call:incoming", ({ callId, fromUserId, callType }) => {
      const authUser = useAuthStore.getState().authUser;
      const { currentCall, incomingCall } = get();

      if (currentCall || incomingCall) {
        if (authUser?._id) {
          socket.emit("call:busy", {
            callId,
            fromUserId: authUser._id,
            toUserId: fromUserId,
          });
        }
        return;
      }

      set({
        incomingCall: {
          callId,
          fromUserId,
          callType,
        },
        callStatus: "incoming",
      });
    });

    socket.on("call:offer", async ({ callId, fromUserId, sdp }) => {
      console.log("Received offer from:", fromUserId);
      set({ pendingOffer: sdp });

      const { currentCall, peerConnection, localStream } = get();
      if (
        currentCall &&
        currentCall.callId === callId &&
        currentCall.direction === "incoming" &&
        peerConnection &&
        localStream
      ) {
        console.log("Processing offer immediately (already in call)");
        await get().processPendingOffer(socket);
      }

      if (!currentCall) {
        console.log("Storing offer for later (awaiting accept)");
        set({
          incomingCall: {
            callId,
            fromUserId,
            callType: "video",
          },
          callStatus: "incoming",
        });
      }
    });

    socket.on("call:answer", async ({ sdp }) => {
      const { peerConnection } = get();
      if (!peerConnection) return;

      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        // Flush any pending ICE candidates now that remote description is set
        await get().flushPendingIceCandidates();
      } catch (error) {
        console.error("Failed to set remote answer", error);
      }
    });

    // socket.on("call:ice-candidate", async ({ candidate }) => {
    //   const { peerConnection } = get();

    //   if (!peerConnection) {
    //     console.warn("Received ICE candidate but no peer connection");
    //     return;
    //   }

    //   if (!peerConnection.remoteDescription) {
    //     console.log("Buffering ICE candidate (no remote description yet)");
    //     set({ pendingIceCandidates: [...get().pendingIceCandidates, candidate] });
    //     return;
    //   }

    //   try {
    //     console.log("Adding ICE candidate...");
    //     await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    //   } catch (error) {
    //     console.error("Failed to add ICE candidate", error);
    //   }
    // });

    socket.on("call:ice-candidate", async ({ candidate }) => {
      const { peerConnection } = get();

      // FIX: Agar peerConnection nahi hai YA remoteDescription nahi hai, dono case me BUFFER karo
      if (!peerConnection || !peerConnection.remoteDescription) {
        console.log("Buffering ICE candidate (waiting for connection/remote desc)");
        set({ pendingIceCandidates: [...get().pendingIceCandidates, candidate] });
        return;
      }

      try {
        console.log("Adding ICE candidate...");
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Failed to add ICE candidate", error);
      }
    });

    socket.on("call:reject", () => {
      toast("Call rejected");
      get().resetCallState();
    });

    socket.on("call:busy", () => {
      toast("User is busy on another call");
      get().resetCallState();
    });

    socket.on("call:unavailable", () => {
      toast("User is offline");
      get().resetCallState();
    });

    socket.on("call:end", () => {
      toast("Call ended");
      get().resetCallState();
    });
  },

  cleanupSocketListeners: (socket) => {
    if (!socket) return;

    socket.off("call:incoming");
    socket.off("call:offer");
    socket.off("call:answer");
    socket.off("call:ice-candidate");
    socket.off("call:reject");
    socket.off("call:busy");
    socket.off("call:end");
    socket.off("call:unavailable");
  },

  startCall: async (toUserId, callType = "video") => {
    const { authUser, socket } = useAuthStore.getState();
    const { currentCall, incomingCall } = get();

    if (!authUser || !socket) return;
    if (currentCall || incomingCall) {
      toast("You are already in a call");
      return;
    }

    try {
      const callId = buildCallId();
      const constraints = {
        audio: true,
        video: callType === "video" ? { width: { min: 640 }, height: { min: 480 } } : false,
      };

      console.log("Getting user media with constraints:", constraints);
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Local stream obtained:", localStream);

      const pc = get().createPeerConnection({
        socket,
        callId,
        peerUserId: toUserId,
        myUserId: authUser._id,
      });

      localStream.getTracks().forEach((track) => {
        console.log("Adding track:", track.kind);
        pc.addTrack(track, localStream);
      });

      set({
        localStream,
        currentCall: {
          callId,
          peerUserId: toUserId,
          callType,
          direction: "outgoing",
        },
        callStatus: "connecting",
      });

      socket.emit("call:initiate", {
        callId,
        fromUserId: authUser._id,
        toUserId,
        callType,
      });

      console.log("Creating offer...");
      const offer = await pc.createOffer();
      console.log("Offer created, setting local description...");
      await pc.setLocalDescription(offer);
      console.log("Local description set, sending offer...");

      socket.emit("call:offer", {
        callId,
        fromUserId: authUser._id,
        toUserId,
        sdp: offer,
      });

      set({ callStatus: "ringing" });
    } catch (error) {
      console.error("Failed to start call", error);
      toast.error("Could not start call. Check mic/camera permission.");
      get().resetCallState();
    }
  },

  // acceptIncomingCall: async () => {
  //   const { authUser, socket } = useAuthStore.getState();
  //   const { incomingCall, currentCall } = get();

  //   if (!authUser || !socket || !incomingCall || currentCall) return;

  //   try {
  //     const constraints = {
  //       audio: true,
  //       video: incomingCall.callType === "video" ? { width: { min: 640 }, height: { min: 480 } } : false,
  //     };

  //     console.log("Getting user media for incoming call with constraints:", constraints);
  //     const localStream = await navigator.mediaDevices.getUserMedia(constraints);
  //     console.log("Local stream obtained for incoming call:", localStream);

  //     const pc = get().createPeerConnection({
  //       socket,
  //       callId: incomingCall.callId,
  //       peerUserId: incomingCall.fromUserId,
  //       myUserId: authUser._id,
  //     });

  //     localStream.getTracks().forEach((track) => {
  //       console.log("Adding incoming call track:", track.kind);
  //       pc.addTrack(track, localStream);
  //     });

  //     set({
  //       localStream,
  //       currentCall: {
  //         callId: incomingCall.callId,
  //         peerUserId: incomingCall.fromUserId,
  //         callType: incomingCall.callType,
  //         direction: "incoming",
  //       },
  //       incomingCall: null,
  //       callStatus: "connecting",
  //     });

  //     console.log("Processing pending offer...");
  //     await get().processPendingOffer(socket);
  //   } catch (error) {
  //     console.error("Failed to accept call", error);
  //     toast.error("Could not accept call. Check mic/camera permission.");
  //     get().resetCallState();
  //   }
  // },

  acceptIncomingCall: async () => {
    const { authUser, socket } = useAuthStore.getState();
    const { incomingCall, currentCall } = get();

    if (!authUser || !socket || !incomingCall || currentCall) return;

    try {
      // 1. UI me turant "Connecting..." dikhao
      set({ callStatus: "connecting" }); 

      const constraints = {
        audio: true,
        video: incomingCall.callType === "video" ? { width: { min: 640 }, height: { min: 480 } } : false,
      };

      console.log("Getting media... Browser might freeze here.");
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // 🚨 2. THE FIX: Hardware on hone ke baad check karo kya socket drop ho gaya tha?
      if (!socket.connected) {
        console.log("Socket dropped during camera wakeup! Reconnecting...");
        socket.connect();
        // Socket ko wapas judne ke liye 1 second do, taaki call instantly na kate
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const pc = get().createPeerConnection({
        socket,
        callId: incomingCall.callId,
        peerUserId: incomingCall.fromUserId,
        myUserId: authUser._id,
      });

      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      set({
        localStream,
        currentCall: {
          callId: incomingCall.callId,
          peerUserId: incomingCall.fromUserId,
          callType: incomingCall.callType,
          direction: "incoming",
        },
        incomingCall: null, // Incoming popup hatao
      });

      await get().processPendingOffer(socket);
      
    } catch (error) {
      console.error("Failed to accept call", error);
      
      // Agar user ne permission deny kar di, toh caller ko batao ki reject ho gaya
      socket.emit("call:reject", {
        callId: incomingCall.callId,
        fromUserId: authUser._id,
        toUserId: incomingCall.fromUserId,
      });
      
      get().resetCallState();
    }
  },
  rejectIncomingCall: () => {
    const { authUser, socket } = useAuthStore.getState();
    const { incomingCall } = get();

    if (!authUser || !socket || !incomingCall) return;

    socket.emit("call:reject", {
      callId: incomingCall.callId,
      fromUserId: authUser._id,
      toUserId: incomingCall.fromUserId,
    });

    get().resetCallState();
  },

  endCurrentCall: (reason = "ended") => {
    const { authUser, socket } = useAuthStore.getState();
    const { currentCall } = get();

    if (authUser && socket && currentCall) {
      socket.emit("call:end", {
        callId: currentCall.callId,
        fromUserId: authUser._id,
        toUserId: currentCall.peerUserId,
        reason,
      });
    }

    get().resetCallState();
  },

  toggleMute: () => {
    const { localStream, isMicMuted } = get();
    if (!localStream) return;

    localStream.getAudioTracks().forEach((track) => {
      track.enabled = isMicMuted;
    });

    set({ isMicMuted: !isMicMuted });
  },

  toggleCamera: () => {
    const { localStream, isCameraOff } = get();
    if (!localStream) return;

    localStream.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOff;
    });

    set({ isCameraOff: !isCameraOff });
  },
}));
