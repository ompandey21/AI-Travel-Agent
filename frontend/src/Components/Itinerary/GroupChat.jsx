import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Send, Users, MessageCircle, Loader2 } from "lucide-react";
import { getMe } from "../Auth/authApi";
import { getMembers } from "../Trip/TripAPI";
import { getChatHistory } from "./ChatAPI";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function GroupChat() {
  const { tripId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [status, setStatus] = useState("Connecting...");
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const endRef = useRef(null);

  const acceptedMembers = members.filter((member) => member.status === "accepted");
  const privateRecipients = acceptedMembers.filter((member) => member.userId !== currentUser?.id);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getMe();
        setCurrentUser(user);
      } catch (err) {
        setError("Unable to load your profile.");
      }
    };
    if (!currentUser) loadUser();
  }, [currentUser]);

  useEffect(() => {
    if (!tripId) return;
    getMembers(tripId)
      .then(setMembers)
      .catch(() => setError("Could not load trip members."));
  }, [tripId]);

  useEffect(() => {
    if (!tripId) return;
    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("Connected");
      setError("");
      socket.emit("joinTrip", { tripId });
    });

    socket.on("connect_error", (err) => {
      setStatus("Connection failed");
      setError(err.message || "Socket connection failed.");
    });

    socket.on("disconnect", () => {
      setStatus("Disconnected");
    });

    socket.on("groupMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("privateMessage", (message) => {
      const isRelevant =
        message.recipientId === currentUser?.id || message.senderId === currentUser?.id;
      const isActivePrivate =
        activeRecipient &&
        ((message.senderId === activeRecipient.userId && message.recipientId === currentUser?.id) ||
          (message.senderId === currentUser?.id && message.recipientId === activeRecipient.userId));

      if (activeRecipient) {
        if (isActivePrivate) {
          setMessages((prev) => [...prev, message]);
        }
      } else if (message.type === "group") {
        setMessages((prev) => [...prev, message]);
      }

      if (!activeRecipient && message.type === "private" && isRelevant) {
        setError("You have a new direct message. Select that member to view it.");
      }
    });

    return () => {
      socket.emit("leaveTrip", { tripId });
      socket.disconnect();
    };
  }, [tripId, activeRecipient, currentUser]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!tripId || !currentUser) return;
      try {
        const data = await getChatHistory(tripId, activeRecipient?.userId);
        setMessages(data);
      } catch (err) {
        setError("Could not load chat history.");
      }
    };
    loadHistory();
  }, [tripId, activeRecipient, currentUser]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeChatTitle = activeRecipient
    ? `Chat with ${activeRecipient.name || activeRecipient.email}`
    : "Group Chat";

  const sendMessage = () => {
    const trimmed = messageText.trim();
    if (!trimmed || !socketRef.current) return;

    const payload = {
      tripId,
      message: trimmed,
    };

    if (activeRecipient) {
      socketRef.current.emit("privateMessage", {
        ...payload,
        recipientId: activeRecipient.userId,
      });
    } else {
      socketRef.current.emit("groupMessage", payload);
    }

    setMessageText("");
  };

  const selectMember = (member) => {
    setError("");
    setActiveRecipient(member);
  };

  const startGroupChat = () => {
    setError("");
    setActiveRecipient(null);
  };

  return (
    <div className="grid grid-cols-[320px_1fr] gap-5 h-[calc(100vh-64px)] p-6 text-slate-50">
      <aside className="flex flex-col gap-4 bg-white/4 border border-white/8 rounded-3xl p-4.5 h-full backdrop-blur-3xl">
        <div className="flex items-center gap-3">
          <Users size={18} className="text-teal-400" />
          <div>
            <p className="m-0 text-base font-bold text-slate-50">Trip Chat</p>
            <p className="m-0 text-xs text-slate-400">{status}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={startGroupChat}
          className={`flex items-center gap-2.5 w-full border border-transparent rounded-xl p-3 text-slate-50 cursor-pointer bg-white/4 ${
            activeRecipient ? 'bg-white/4 border-white/8' : 'bg-teal-400/12 border-teal-400/30'
          }`}
        >
          <MessageCircle size={16} />
          Group chat
        </button>

        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
          {privateRecipients.length === 0 && (
            <p className="m-0 text-sm text-slate-400">No other accepted members yet.</p>
          )}
          {privateRecipients.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => selectMember(member)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl border border-transparent bg-white/5 text-slate-50 cursor-pointer text-left ${
                activeRecipient?.userId === member.userId ? 'border-teal-400' : ''
              }`}
            >
              <span className="w-9.5 h-9.5 rounded-full grid place-items-center font-bold text-slate-900 bg-gradient-to-br from-teal-400 to-blue-400">{(member.name || member.email || "?")[0].toUpperCase()}</span>
              <div className="flex flex-col min-w-0">
                <span className="m-0 text-sm font-bold text-slate-50 overflow-hidden text-ellipsis whitespace-nowrap">{member.name || member.email}</span>
                <span className="m-0 text-xs text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">{member.email}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex flex-col gap-4.5 bg-white/5 border border-white/8 rounded-3xl p-5.5 h-[calc(100vh-88px)] backdrop-blur-3xl">
        <header className="flex items-center justify-between gap-3 border-b border-white/8 pb-3.5">
          <div>
            <p className="m-0 text-xl font-bold text-slate-50">{activeChatTitle}</p>
            <p className="m-0 text-xs text-slate-400">{activeRecipient ? "Direct messaging" : "Messages for everyone"}</p>
          </div>
          <div className="text-xs text-teal-400 font-bold px-3 py-2 rounded-full bg-teal-400/8 whitespace-nowrap">{currentUser?.name ? `You: ${currentUser.name}` : "Hello traveler"}</div>
        </header>

        <div className="flex flex-col gap-3 flex-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-1.5 groupchat-scrollbar">
          {messages.length === 0 && (
            <div className="flex items-center justify-center min-h-[180px] rounded-2xl bg-white/3">
              <p className="m-0 text-slate-400 text-sm">No messages yet. Send one below.</p>
            </div>
          )}
          {messages.map((message) => {
            const isOwn = message.senderId === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`max-w-[76%] p-3.5 rounded-2xl border border-white/8 shadow-[0_18px_58px_rgba(0,0,0,0.08)] ${
                  isOwn ? 'self-end bg-teal-400/16 border-teal-400/4' : 'self-start bg-white/6'
                }`}
              >
                <span className="m-0 text-xs text-slate-400 mb-1.5 block">{isOwn ? "You" : message.senderName || "Guest"}</span>
                <p className="m-0 text-sm leading-relaxed text-slate-50">{message.message}</p>
                <span className="block mt-2.5 text-xs text-slate-500 text-right">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div className="grid grid-cols-[1fr_60px] gap-3 items-center">
          <input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={activeRecipient ? `Message ${activeRecipient.name || activeRecipient.email}` : 'Write a message to the group...'}
            className="w-full rounded-xl border border-white/8 bg-white/4 text-slate-50 text-sm p-3.5 outline-none"
          />
          <button type="button" onClick={sendMessage} className="w-full rounded-xl border-none bg-gradient-to-br from-teal-400 to-blue-400 text-slate-900 p-3.5 cursor-pointer grid place-items-center">
            {status === "Connecting..." ? <Loader2 size={16} /> : <Send size={16} />}
          </button>
        </div>
        {error && <p className="m-0 text-red-400 text-xs">{error}</p>}
      </section>
    </div>
  );
}