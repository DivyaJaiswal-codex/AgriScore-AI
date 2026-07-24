import React from "react";
import { STRINGS } from "../services/translationService";

/**
 * ScoreDial component rendering SVG needle-based visual default risk dial.
 */
export default function ScoreDial({ score, risk, potentialScore, lang }) {
  const t = STRINGS[lang] || STRINGS.en;
  
  // Draw primary needle
  const angle = -90 + (score / 100) * 180;
  const rad = (Math.PI / 180) * angle;
  const cx = 110, cy = 110, r = 86;
  const needleX = cx + r * Math.cos(rad);
  const needleY = cy + r * Math.sin(rad);

  // Draw potential needle (if simulator is active and potential score > current)
  const showPotential = potentialScore && potentialScore > score;
  const potAngle = -90 + (potentialScore / 100) * 180;
  const potRad = (Math.PI / 180) * potAngle;
  const potNeedleX = cx + r * Math.cos(potRad);
  const potNeedleY = cy + r * Math.sin(potRad);

  const COLORS = {
    bg: "#F7F5EF",
    ink: "#1B2B20",
    forest: "#1F3D2B",
    low: "#3B7A57",
    med: "#C98A2B",
    high: "#B4483B"
  };

  const riskColor = risk === "Low" ? COLORS.low : risk === "Medium" ? COLORS.med : COLORS.high;
  const riskLabel = risk === "Low" ? t.low : risk === "Medium" ? t.medium : t.high;

  const arc = (startDeg, endDeg, color) => {
    const s = (Math.PI / 180) * startDeg;
    const e = (Math.PI / 180) * endDeg;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return (
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
        stroke={color}
        strokeWidth="16"
        fill="none"
        strokeLinecap="butt"
      />
    );
  };

  return (
    <svg viewBox="0 0 220 150" width="220" height="150" style={{ display: "block", margin: "0 auto" }}>
      {arc(-90, -18, COLORS.high)}
      {arc(-18, 54, COLORS.med)}
      {arc(54, 90, COLORS.low)}
      
      {/* Potential dotted needle path */}
      {showPotential && (
        <line
          x1={cx} y1={cy} x2={potNeedleX} y2={potNeedleY}
          stroke="#D4A017" strokeWidth="3" strokeDasharray="3,3" strokeLinecap="round"
        />
      )}

      {/* Primary needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={COLORS.ink} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="8" fill={COLORS.ink} />
      
      <text x={cx} y={cy + 34} textAnchor="middle" fontSize="30" fontWeight="700" fill={COLORS.ink} fontFamily="Space Grotesk, sans-serif">
        {score}
      </text>
      
      {showPotential && (
        <text x={cx} y={cy + 15} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#D4A017" fontFamily="Inter, sans-serif">
          → Potential: {potentialScore}
        </text>
      )}

      <text x={cx} y={cy + 48} textAnchor="middle" fontSize="10" fill="#6b6b60" fontFamily="Inter, sans-serif" letterSpacing="1">
        {t.outOf100}
      </text>
      <text x={cx} y={20} textAnchor="middle" fontSize="13.5" fontWeight="700" fill={riskColor} fontFamily="Space Grotesk, sans-serif">
        {riskLabel} {t.risk}
      </text>
    </svg>
  );
}
