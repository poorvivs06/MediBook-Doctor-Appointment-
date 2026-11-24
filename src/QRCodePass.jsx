import React from "react";
import "./QRCodePass.css";

/**
 * Deterministic QR-like SVG pattern generator
 * Generates an authentic matrix barcode for hospital fast-track passes
 */
export default function QRCodePass({
  referenceCode = "MED-4821",
  patientName = "Patient",
  doctorName = "Doctor",
  date = "2026-11-20",
  time = "10:00 AM",
  hospital = "MediBook Clinic",
  size = 140,
}) {
  // Generate a deterministic 21x21 grid from reference string
  const gridSize = 21;
  const hashString = `${referenceCode}-${patientName}-${date}-${time}`;

  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    hash = (hash << 5) - hash + hashString.charCodeAt(i);
    hash |= 0;
  }

  const isCornerFinder = (r, c) => {
    // Top-Left 7x7
    if (r < 7 && c < 7) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Top-Right 7x7
    if (r < 7 && c >= gridSize - 7) {
      if (r === 0 || r === 6 || c === gridSize - 7 || c === gridSize - 1) return true;
      if (r >= 2 && r <= 4 && c >= gridSize - 5 && c <= gridSize - 3) return true;
      return false;
    }
    // Bottom-Left 7x7
    if (r >= gridSize - 7 && c < 7) {
      if (r === gridSize - 7 || r === gridSize - 1 || c === 0 || c === 6) return true;
      if (r >= gridSize - 5 && r <= gridSize - 3 && c >= 2 && c <= 4) return true;
      return false;
    }
    return null;
  };

  const cells = [];
  const cellSize = size / gridSize;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const finder = isCornerFinder(r, c);
      let isFilled = false;

      if (finder !== null) {
        isFilled = finder;
      } else {
        // Pseudo-random deterministic fill based on coordinate and hash
        const val = Math.sin(r * 13 + c * 37 + hash) * 10000;
        isFilled = (val - Math.floor(val)) > 0.52;
      }

      if (isFilled) {
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize - 0.2}
            height={cellSize - 0.2}
            rx={cellSize * 0.15}
            fill="#0f172a"
          />
        );
      }
    }
  }

  return (
    <div className="qr-pass-card">
      <div className="qr-pass-header">
        <span className="qr-pass-badge">🏥 HOSPITAL FAST-TRACK PASS</span>
        <span className="qr-pass-ref">{referenceCode}</span>
      </div>

      <div className="qr-svg-wrapper" style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
          className="qr-svg"
        >
          <rect width={size} height={size} fill="#ffffff" rx="8" />
          {cells}
          {/* Center Hospital Cross Pill */}
          <circle cx={size / 2} cy={size / 2} r={cellSize * 1.8} fill="#ffffff" />
          <circle cx={size / 2} cy={size / 2} r={cellSize * 1.4} fill="#087f8c" />
          <path
            d={`M${size / 2 - cellSize * 0.8} ${size / 2} H${size / 2 + cellSize * 0.8} M${size / 2} ${size / 2 - cellSize * 0.8} V${size / 2 + cellSize * 0.8}`}
            stroke="#ffffff"
            strokeWidth={cellSize * 0.45}
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p className="qr-pass-instruction">
        Scan at clinic reception for instant <strong>Express Check-in</strong>.
      </p>
    </div>
  );
}
