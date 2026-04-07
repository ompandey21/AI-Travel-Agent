// SVG Icons
const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const SplitIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="18" cy="18" r="3"/>
    <circle cx="6" cy="6" r="3"/>
    <path d="M6 21V9a9 9 0 0 0 9 9"/>
  </svg>
);

const CompassIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);

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

const SailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v10" />
    <path d="M12 2 C12 2, 4 8, 4 14 L12 14 Z" />
    <path d="M12 2 C12 2, 20 8, 20 14 L12 14 Z" />
    <path d="M5 19 Q12 22 19 19" />
    <line x1="5" y1="21" x2="19" y2="21" />
  </svg>
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

export {CompassIcon, SplitIcon, ShieldIcon, BrainIcon, WaveBg, SailIcon, StepDots, Pill};