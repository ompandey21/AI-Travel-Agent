import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { acceptRequest } from "../Trip/TripAPI";

const API = "http://localhost:8080/api";

const WaveBg = () => (
  <svg
    aria-hidden="true"
    className="fixed bottom-0 left-0 w-full pointer-events-none z-0"
    style={{ opacity: 0.18 }}
    viewBox="0 0 1440 220"
    preserveAspectRatio="none"
  >
    <path
      fill="#1a7fc1"
      d="M0,160 C240,220 480,80 720,140 C960,200 1200,60 1440,120 L1440,220 L0,220 Z"
    />
    <path
      fill="#0d5a8a"
      d="M0,190 C360,140 720,220 1080,170 C1260,145 1380,200 1440,210 L1440,220 L0,220 Z"
      opacity="0.6"
    />
  </svg>
);

const Spinner = ({ size = 36 }) => (
  <div
    className="rounded-full border-[3px] border-[#cce5f8] border-t-[#1a7fc1] animate-spin"
    style={{ width: size, height: size }}
  />
);

const LoadingView = () => (
  <div className="flex flex-col items-center gap-4 py-10">
    <Spinner />
    <p className="text-[#5a8aab] text-sm m-0">Verifying your invite…</p>
  </div>
);

const ErrorView = () => (
  <div className="flex flex-col items-center">
    <div className="w-[68px] h-[68px] rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mb-5">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="13" />
        <circle cx="12" cy="16.5" r="0.6" fill="#ef4444" />
      </svg>
    </div>
    <h2 className="text-xl font-semibold text-red-900 m-0 mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
      Invite link invalid
    </h2>
    <p className="text-sm text-[#b45252] text-center leading-relaxed mb-6 max-w-[300px]">
      This invite has expired or was already used. Ask your trip organizer to send a fresh invite.
    </p>
    <button
      className="px-6 py-[9px] border border-red-300 rounded-[10px] bg-transparent text-red-700 text-sm font-medium cursor-pointer transition-colors hover:bg-red-50"
    >
      Request a new invite
    </button>
  </div>
);


const StepDots = ({ current, total = 2 }) => (
  <div className="flex gap-1.5 mt-5">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className="h-1.5 rounded-full transition-all duration-300"
        style={{
          width: i === current ? 20 : 6,
          background: i === current ? "#1a7fc1" : "#cce5f8",
        }}
      />
    ))}
  </div>
);

const Pill = ({ icon, children }) => (
  <div className="inline-flex items-center gap-1.5 px-3.5 py-[5px] bg-[#eaf5ff] border border-[#b8ddf7] rounded-full text-[13px] text-[#0d6ea8]" style={{ borderWidth: "0.5px" }}>
    {icon}
    {children}
  </div>
);

export default function InviteConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [viewState, setViewState] = useState("loading"); // loading | error | invite | success
  const [inviteData, setInviteData] = useState(null);
  const [userExists, setUserExists] = useState(false);

 
  useEffect(() => {
    if (!token) { setViewState("error"); return; }

    axios
      .get(`${API}/trips/verify-invite`, { params: { token }, withCredentials: true })
      .then(res => {
        setInviteData(res.data);
        // console.log(res.data);
        setUserExists(!!res.data.isValid);
        setViewState("invite");
      })
      .catch(() => setViewState("error"));
  }, [token]);

  const handleAccept = async () => {
    if (userExists) {
        acceptRequest(token)
        .then(navigate("/auth"))
        .catch((e) => console.log(e));
    } else {
      navigate(`/auth?token=${token}`);
    }
  };

  const card = (content) => (
    <div className="min-h-screen bg-[#f4faff] flex flex-col items-center justify-center px-4 py-12 relative" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{keyframes}</style>
      <WaveBg />

      {/* Card */}
      <div
        className="bg-white/90 backdrop-blur-xl rounded-3xl border max-w-[480px] w-full flex flex-col items-center z-[1] px-8 pt-10 pb-8 shadow-[0_8px_40px_rgba(26,127,193,0.1),0_1px_0_rgba(255,255,255,0.8)_inset]"
        style={{ borderColor: "#cce5f8", borderWidth: "0.5px", animation: "fadeUp 0.45s cubic-bezier(0.22,1,0.36,1)" }}
      >
        {content}
      </div>
    </div>
  );

  if (viewState === "loading") return card(<LoadingView />);
  if (viewState === "error") return card(<ErrorView />);

  if (viewState === "invite") return card(
    <>
      {/* Eyebrow */}
      <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#1a7fc1] m-0 mb-2">
        You're invited
      </p>
      {/* Headline */}
      <h1
        className="text-[26px] font-semibold text-[#0d4f7c] text-center leading-tight m-0 mb-2.5"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        Join the voyage
      </h1>
      {/* Sub */}
      <p className="text-sm text-[#5a8aab] text-center leading-[1.7] m-0 mb-5 max-w-[360px]">
        A spot has been reserved for you on an upcoming trip. Accept to join the crew.
      </p>

      {/* Video frame */}
      <div className="w-full aspect-video rounded-[18px] overflow-hidden border-[2.5px] border-[#b8ddf7] bg-[#daeef9] mb-5 shadow-[0_4px_24px_rgba(26,127,193,0.12)]">
        <video
          src={import.meta.env.VITE_INVITATION_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover block"
        >
          <source src="/trip-preview.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Meta pills */}
      <div className="flex gap-2.5 flex-wrap justify-center mb-5">
        {inviteData?.email && (
          <Pill icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }>
            {inviteData.email}
          </Pill>
        )}
        {inviteData?.role && (
          <Pill icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          }>
            {inviteData.role}
          </Pill>
        )}
      </div>

      <p className="text-sm text-[#5a8aab] text-center leading-[1.7] m-0 mb-7 max-w-[360px]">
        Set sail with the crew — explore new shores, share every adventure, and build memories that last beyond the horizon.
      </p>

      <button
        className="flex items-center justify-center gap-2.5 w-full max-w-[340px] py-[15px] px-7 text-white border-none rounded-[14px] text-base font-semibold cursor-pointer transition-all duration-[180ms] shadow-[0_4px_20px_rgba(26,127,193,0.3)] tracking-[0.01em]"
        style={{ background: "linear-gradient(135deg, #1e8fd4 0%, #0d5a8a 100%)", fontFamily: "inherit" }}
        onClick={handleAccept}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 10px 32px rgba(26,127,193,0.42)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,127,193,0.3)";
        }}
        onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
        onMouseUp={e => (e.currentTarget.style.transform = "translateY(-2px)")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        {userExists ? "Accept & go to profile" : "Accept invite & join the sail"}
      </button>

      <p className="text-xs text-[#8ab8d6] mt-2.5">
        {userExists ? "You already have an account — we'll link this trip to it." : "You'll create your account in the next step"}
      </p>

      <StepDots current={0} total={userExists ? 1 : 2} />
    </>
  );

  return null;
}

const keyframes = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    from { transform: scale(0.6); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @media (max-width: 480px) {
    .card { padding: 2rem 1.25rem 1.75rem !important; border-radius: 20px !important; }
  }
  input::placeholder { color: #9fc8e4; }
`;