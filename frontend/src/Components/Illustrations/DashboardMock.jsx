export const DashboardMockup = () => (
  <svg viewBox="0 0 420 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Outer frame */}
    <rect x="1" y="1" width="418" height="518" rx="20" stroke="#3D9A9B" strokeOpacity="0.25" strokeWidth="1"/>
    <rect x="1" y="1" width="418" height="518" rx="20" fill="#0a1628" fillOpacity="0.85"/>

    {/* Top bar */}
    <rect x="20" y="20" width="280" height="36" rx="8" fill="#3D9A9B" fillOpacity="0.12"/>
    <rect x="32" y="30" width="80" height="16" rx="4" fill="#3D9A9B" fillOpacity="0.5"/>
    <rect x="124" y="32" width="40" height="12" rx="3" fill="white" fillOpacity="0.12"/>
    <circle cx="382" cy="38" r="16" fill="#3D9A9B" fillOpacity="0.18"/>
    <circle cx="382" cy="38" r="6" fill="#3D9A9B" fillOpacity="0.7"/>

    {/* Map placeholder */}
    <rect x="20" y="72" width="240" height="148" rx="12" fill="#0d1f35"/>
    <rect x="20" y="72" width="240" height="148" rx="12" stroke="#3D9A9B" strokeOpacity="0.15" strokeWidth="1"/>
    {/* Map lines */}
    <path d="M 40 140 Q 80 110 130 130 Q 175 148 210 120 Q 235 105 250 118" stroke="#3D9A9B" strokeOpacity="0.5" strokeWidth="1.5" fill="none" strokeDasharray="4 3"/>
    <circle cx="40" cy="140" r="4" fill="#3D9A9B" fillOpacity="0.9"/>
    <circle cx="130" cy="130" r="3.5" fill="#3D9A9B" fillOpacity="0.6"/>
    <circle cx="210" cy="120" r="3.5" fill="#3D9A9B" fillOpacity="0.6"/>
    <circle cx="250" cy="118" r="5" fill="#3D9A9B"/>
    {/* Map grid */}
    <line x1="20" y1="105" x2="260" y2="105" stroke="white" strokeOpacity="0.04" strokeWidth="1"/>
    <line x1="20" y1="140" x2="260" y2="140" stroke="white" strokeOpacity="0.04" strokeWidth="1"/>
    <line x1="20" y1="175" x2="260" y2="175" stroke="white" strokeOpacity="0.04" strokeWidth="1"/>
    <line x1="70" y1="72" x2="70" y2="220" stroke="white" strokeOpacity="0.04" strokeWidth="1"/>
    <line x1="130" y1="72" x2="130" y2="220" stroke="white" strokeOpacity="0.04" strokeWidth="1"/>
    <line x1="190" y1="72" x2="190" y2="220" stroke="white" strokeOpacity="0.04" strokeWidth="1"/>

    {/* Side panel */}
    <rect x="274" y="72" width="126" height="148" rx="12" fill="#0d1f35" stroke="#3D9A9B" strokeOpacity="0.12" strokeWidth="1"/>
    <rect x="286" y="86" width="40" height="8" rx="2" fill="white" fillOpacity="0.18"/>
    <rect x="286" y="102" width="94" height="6" rx="2" fill="white" fillOpacity="0.07"/>
    <rect x="286" y="114" width="70" height="6" rx="2" fill="white" fillOpacity="0.07"/>
    <rect x="286" y="130" width="94" height="24" rx="6" fill="#3D9A9B" fillOpacity="0.15"/>
    <rect x="294" y="136" width="50" height="6" rx="2" fill="#3D9A9B" fillOpacity="0.7"/>
    <rect x="286" y="162" width="94" height="6" rx="2" fill="white" fillOpacity="0.05"/>
    <rect x="286" y="174" width="60" height="6" rx="2" fill="white" fillOpacity="0.05"/>
    <rect x="286" y="190" width="88" height="18" rx="5" fill="#3D9A9B" fillOpacity="0.9"/>
    <rect x="304" y="195" width="52" height="6" rx="2" fill="white" fillOpacity="0.9"/>

    {/* Stats row */}
    <rect x="20" y="232" width="115" height="72" rx="10" fill="#0d1f35" stroke="#3D9A9B" strokeOpacity="0.12" strokeWidth="1"/>
    <rect x="32" y="246" width="50" height="8" rx="2" fill="white" fillOpacity="0.12"/>
    <rect x="32" y="260" width="72" height="18" rx="3" fill="#3D9A9B" fillOpacity="0.18"/>
    <rect x="36" y="265" width="30" height="8" rx="2" fill="#3D9A9B" fillOpacity="0.9"/>
    <rect x="32" y="286" width="55" height="6" rx="2" fill="white" fillOpacity="0.06"/>

    <rect x="147" y="232" width="115" height="72" rx="10" fill="#0d1f35" stroke="#3D9A9B" strokeOpacity="0.12" strokeWidth="1"/>
    <rect x="159" y="246" width="50" height="8" rx="2" fill="white" fillOpacity="0.12"/>
    <rect x="159" y="260" width="72" height="18" rx="3" fill="#3D9A9B" fillOpacity="0.18"/>
    <rect x="163" y="265" width="40" height="8" rx="2" fill="#3D9A9B" fillOpacity="0.9"/>
    <rect x="159" y="286" width="55" height="6" rx="2" fill="white" fillOpacity="0.06"/>

    <rect x="274" y="232" width="126" height="72" rx="10" fill="#3D9A9B" fillOpacity="0.1" stroke="#3D9A9B" strokeOpacity="0.25" strokeWidth="1"/>
    <rect x="286" y="246" width="50" height="8" rx="2" fill="#3D9A9B" fillOpacity="0.5"/>
    <rect x="286" y="262" width="88" height="8" rx="3" fill="white" fillOpacity="0.06"/>
    <rect x="286" y="276" width="60" height="18" rx="4" fill="#3D9A9B" fillOpacity="0.8"/>
    <rect x="294" y="281" width="44" height="7" rx="2" fill="white"/>

    {/* Activity chart */}
    <rect x="20" y="318" width="380" height="90" rx="12" fill="#0d1f35" stroke="#3D9A9B" strokeOpacity="0.1" strokeWidth="1"/>
    <rect x="32" y="328" width="60" height="8" rx="2" fill="white" fillOpacity="0.15"/>
    {/* Bar chart */}
    <rect x="40" y="370" width="16" height="28" rx="3" fill="#3D9A9B" fillOpacity="0.25"/>
    <rect x="66" y="360" width="16" height="38" rx="3" fill="#3D9A9B" fillOpacity="0.4"/>
    <rect x="92" y="352" width="16" height="46" rx="3" fill="#3D9A9B" fillOpacity="0.55"/>
    <rect x="118" y="365" width="16" height="33" rx="3" fill="#3D9A9B" fillOpacity="0.35"/>
    <rect x="144" y="345" width="16" height="53" rx="3" fill="#3D9A9B" fillOpacity="0.7"/>
    <rect x="170" y="358" width="16" height="40" rx="3" fill="#3D9A9B" fillOpacity="0.45"/>
    <rect x="196" y="342" width="16" height="56" rx="3" fill="#3D9A9B"/>
    <rect x="222" y="362" width="16" height="36" rx="3" fill="#3D9A9B" fillOpacity="0.35"/>
    <rect x="248" y="350" width="16" height="48" rx="3" fill="#3D9A9B" fillOpacity="0.6"/>
    <rect x="274" y="368" width="16" height="30" rx="3" fill="#3D9A9B" fillOpacity="0.28"/>
    <rect x="300" y="355" width="16" height="43" rx="3" fill="#3D9A9B" fillOpacity="0.5"/>
    <rect x="326" y="348" width="16" height="50" rx="3" fill="#3D9A9B" fillOpacity="0.65"/>
    <rect x="352" y="363" width="16" height="35" rx="3" fill="#3D9A9B" fillOpacity="0.38"/>

    {/* Bottom tags */}
    <rect x="20" y="422" width="88" height="28" rx="14" fill="#3D9A9B" fillOpacity="0.12" stroke="#3D9A9B" strokeOpacity="0.2" strokeWidth="1"/>
    <rect x="30" y="430" width="64" height="10" rx="3" fill="#3D9A9B" fillOpacity="0.55"/>
    <rect x="120" y="422" width="72" height="28" rx="14" fill="white" fillOpacity="0.04"/>
    <rect x="130" y="430" width="50" height="10" rx="3" fill="white" fillOpacity="0.12"/>
    <rect x="204" y="422" width="88" height="28" rx="14" fill="white" fillOpacity="0.04"/>
    <rect x="214" y="430" width="64" height="10" rx="3" fill="white" fillOpacity="0.12"/>
    <rect x="304" y="422" width="96" height="28" rx="14" fill="white" fillOpacity="0.04"/>
    <rect x="314" y="430" width="72" height="10" rx="3" fill="white" fillOpacity="0.12"/>

    {/* Bottom footer line */}
    <rect x="20" y="466" width="380" height="1" fill="white" fillOpacity="0.05"/>
    <rect x="20" y="480" width="120" height="8" rx="2" fill="white" fillOpacity="0.07"/>
    <rect x="340" y="478" width="60" height="12" rx="6" fill="#3D9A9B" fillOpacity="0.7"/>
  </svg>
);