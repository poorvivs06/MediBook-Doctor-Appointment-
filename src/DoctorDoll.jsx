import React from "react";
import "./DoctorDoll.css";

export default function DoctorDoll({
  size = 140,
  speechText = "",
  showBadge = true,
  interactive = true,
  onClick = null,
}) {
  return (
    <div
      className={`doctor-doll-wrapper ${interactive ? "interactive" : ""}`}
      onClick={onClick}
      style={{ width: `${size}px`, display: "inline-flex", flexDirection: "column", alignItems: "center" }}
    >
      {/* Optional Speech Bubble */}
      {speechText && (
        <div className="doll-speech-bubble">
          <span>{speechText}</span>
          <div className="speech-arrow"></div>
        </div>
      )}

      {/* Scalable Vector Cartoon Doctor Doll */}
      <div className="doll-figure-container">
        <svg
          viewBox="0 0 160 200"
          width={size}
          height={(size * 200) / 160}
          className="doctor-doll-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Skin Gradient */}
            <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffeedb" />
              <stop offset="100%" stopColor="#f7d4b2" />
            </linearGradient>

            {/* Coat Gradient */}
            <linearGradient id="coatGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>

            {/* Scrubs Teal Gradient */}
            <linearGradient id="scrubsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#087f8c" />
              <stop offset="100%" stopColor="#065f69" />
            </linearGradient>

            {/* Hair Gradient */}
            <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Metallic Stethoscope */}
            <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Soft Shadow Filter */}
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Floor / Ground Shadow */}
          <ellipse cx="80" cy="192" rx="46" ry="7" fill="rgba(8, 127, 140, 0.14)" />

          {/* Feet / Shoes */}
          <ellipse cx="64" cy="186" rx="12" ry="7" fill="#1e293b" />
          <ellipse cx="96" cy="186" rx="12" ry="7" fill="#1e293b" />

          {/* Pants (Dark Teal Scrubs) */}
          <path d="M54 140 L60 184 L72 184 L78 152 L82 152 L88 184 L100 184 L106 140 Z" fill="#065f69" />

          {/* Body / Inner Teal Scrubs Shirt */}
          <path d="M52 100 L108 100 L104 150 L56 150 Z" fill="url(#scrubsGrad)" />

          {/* White Doctor Lab Coat */}
          <g filter="url(#softShadow)">
            {/* Coat Body Back */}
            <path
              d="M48 98 Q80 94 112 98 L118 165 Q80 172 42 165 Z"
              fill="url(#coatGrad)"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            {/* Left Lapel */}
            <path d="M48 98 L72 135 L64 165 L44 165 Z" fill="#ffffff" />
            {/* Right Lapel */}
            <path d="M112 98 L88 135 L96 165 L116 165 Z" fill="#ffffff" />
            {/* Coat Collar */}
            <path d="M58 98 L80 120 L102 98 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
          </g>

          {/* Stethoscope Tubing around neck */}
          <path
            d="M62 96 C62 128 70 144 76 146 C82 144 98 128 98 96"
            fill="none"
            stroke="#087f8c"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Stethoscope Chest Piece / Bell */}
          <circle cx="76" cy="148" r="6" fill="url(#metalGrad)" stroke="#475569" strokeWidth="1" />
          <circle cx="76" cy="148" r="2.5" fill="#087f8c" />

          {/* Left Arm (Holding Medical Chart / Clipboard) */}
          <g className="doll-arm-left">
            {/* Arm sleeve */}
            <path d="M48 100 L30 134 L40 140 L56 108 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            {/* Hand */}
            <circle cx="32" cy="140" r="7" fill="url(#skinGrad)" />
            {/* Clipboard */}
            <rect x="18" y="128" width="22" height="28" rx="3" fill="#d97706" />
            <rect x="20" y="132" width="18" height="22" rx="2" fill="#ffffff" />
            {/* Clip */}
            <rect x="25" y="126" width="8" height="4" rx="1" fill="#64748b" />
            {/* Checklines & Heart on clipboard */}
            <line x1="23" y1="138" x2="35" y2="138" stroke="#087f8c" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="23" y1="143" x2="33" y2="143" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M28 147 A2 2 0 0 0 25 149 Q28 152 28 152 Q28 152 31 149 A2 2 0 0 0 28 147 Z" fill="#ef4444" />
          </g>

          {/* Right Arm (Waving Hand!) */}
          <g className="doll-arm-waving">
            {/* Arm sleeve */}
            <path d="M112 100 L130 80 L140 88 L120 110 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            {/* Waving Hand */}
            <circle cx="138" cy="78" r="8" fill="url(#skinGrad)" />
            {/* Fingers */}
            <circle cx="134" cy="71" r="2.5" fill="url(#skinGrad)" />
            <circle cx="139" cy="69" r="2.5" fill="url(#skinGrad)" />
            <circle cx="144" cy="71" r="2.5" fill="url(#skinGrad)" />
            <circle cx="145" cy="76" r="2" fill="url(#skinGrad)" />
          </g>

          {/* Neck */}
          <rect x="73" y="84" width="14" height="18" rx="4" fill="url(#skinGrad)" />

          {/* Head & Face */}
          <g filter="url(#softShadow)">
            {/* Head Base */}
            <rect x="44" y="32" width="72" height="64" rx="30" fill="url(#skinGrad)" />

            {/* Hair (Professional stylish bob / short cut) */}
            <path
              d="M44 56 C40 30 60 16 80 16 C100 16 120 30 116 56 C116 42 108 26 80 26 C52 26 44 42 44 56 Z"
              fill="url(#hairGrad)"
            />
            {/* Hair Bangs */}
            <path d="M45 42 Q65 48 80 34 Q95 48 115 42 Q105 28 80 26 Q55 28 45 42 Z" fill="url(#hairGrad)" />

            {/* Doctor Headband / Medical Reflector Mirror */}
            <rect x="52" y="24" width="56" height="5" rx="2" fill="#087f8c" />
            <circle cx="80" cy="26" r="7" fill="url(#metalGrad)" stroke="#087f8c" strokeWidth="1.5" />
            <circle cx="80" cy="26" r="3.5" fill="#ffffff" />
            <path d="M78 26 L82 26 M80 24 L80 28" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />

            {/* Big Friendly Eyes */}
            {/* Left Eye */}
            <ellipse cx="64" cy="58" rx="6" ry="7.5" fill="#0f172a" />
            <circle cx="62" cy="55" r="2.5" fill="#ffffff" />
            <circle cx="66" cy="61" r="1" fill="#ffffff" />

            {/* Right Eye */}
            <ellipse cx="96" cy="58" rx="6" ry="7.5" fill="#0f172a" />
            <circle cx="94" cy="55" r="2.5" fill="#ffffff" />
            <circle cx="98" cy="61" r="1" fill="#ffffff" />

            {/* Cute Eyebrows */}
            <path d="M58 48 Q64 45 70 47" fill="none" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M90 47 Q96 45 102 48" fill="none" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />

            {/* Rosy Blushing Cheeks */}
            <ellipse cx="56" cy="67" rx="6" ry="3.5" fill="#fda4af" opacity="0.65" />
            <ellipse cx="104" cy="67" rx="6" ry="3.5" fill="#fda4af" opacity="0.65" />

            {/* Cute Smile */}
            <path
              d="M72 68 Q80 77 88 68"
              fill="none"
              stroke="#be185d"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Open smile tongue sparkle */}
            <path d="M75 70 Q80 77 85 70 Z" fill="#fda4af" opacity="0.8" />
          </g>

          {/* Pocket with Pen & Badge on Coat */}
          <rect x="92" y="118" width="14" height="16" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          {/* Pen */}
          <line x1="96" y1="112" x2="96" y2="120" stroke="#087f8c" strokeWidth="2" strokeLinecap="round" />
          <line x1="100" y1="114" x2="100" y2="120" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
          {/* Medical Cross on pocket */}
          <path d="M97 126 L101 126 M99 124 L99 128" stroke="#087f8c" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>

      {/* Floating Accreditation Pill */}
      {showBadge && (
        <div className="doll-name-pill">
          <span className="doll-badge-icon">🩺</span>
          <strong>Dr. Medi</strong>
          <span className="doll-badge-sub">AI Clinical Doll</span>
        </div>
      )}
    </div>
  );
}
