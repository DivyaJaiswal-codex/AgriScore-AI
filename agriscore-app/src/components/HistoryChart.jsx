import React, { useMemo } from "react";
import { Download } from "lucide-react";
import { STRINGS } from "../services/translationService";
import { downloadReport } from "../services/pdfService";

/**
 * HistoryChart Component rendering the sparkline credit trend graph and recent evaluations log.
 */
export default function HistoryChart({ history, user, documents, lang }) {
  const t = STRINGS[lang] || STRINGS.en;
  const forest = "#1F3D2B";
  const gold = "#D4A017";
  const ink = "#1B2B20";

  // Sparkline coordinates for score trend
  const sparklineData = useMemo(() => {
    if (history.length < 2) return null;
    const scores = [...history].reverse().map(h => h.score);
    const maxVal = 100;
    const minVal = 0;
    const width = 180;
    const height = 40;
    const padding = 5;
    
    const points = scores.map((val, idx) => {
      const x = padding + (idx / (scores.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(" ");

    return points;
  }, [history]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
      
      {/* Sparkline chart */}
      <div
        style={{
          background: "#FFFFFF", borderRadius: 16, border: "1px solid #E4E0D4",
          padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: ink, fontFamily: "Space Grotesk, sans-serif" }}>{t.riskTrend}</span>
          {history.length > 1 && <span style={{ fontSize: 11, color: "#8a8a7c" }}>{history.length} checks</span>}
        </div>
        
        {history.length < 2 ? (
          <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #E4E0D4", borderRadius: 10, color: "#8a8a7c", fontSize: 12.5, textAlign: "center" }}>
            Trend line triggers after at least 2 assessments.
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="100%" height="50" viewBox="0 0 180 50">
              <path
                d={`M ${sparklineData}`}
                fill="none"
                stroke={forest}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {history.map((h, i) => {
                const x = 5 + (i / (history.length - 1)) * 170;
                const y = 45 - (h.score / 100) * 40;
                return (
                  <circle key={i} cx={x} cy={y} r="3" fill={gold} stroke={forest} strokeWidth="1.5" />
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Recent reports & download triggers */}
      <div
        style={{
          background: "#FFFFFF", borderRadius: 16, border: "1px solid #E4E0D4",
          padding: 20, display: "flex", flexDirection: "column"
        }}
      >
        <span style={{ fontSize: 14.5, fontWeight: 700, color: ink, fontFamily: "Space Grotesk, sans-serif", marginBottom: 12 }}>{t.recentReports}</span>
        {history.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#8a8a7c", fontSize: 12.5 }}>
            {t.noChecksYet}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", maxHeight: 150 }}>
            {history.slice(0, 3).map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "#F7F5EF", borderRadius: 8, border: "1px solid #E4E0D4" }}>
                <div style={{ minWidth: 0, marginRight: 8, overflow: "hidden" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.crop} · {item.location}</div>
                  <div style={{ fontSize: 10, color: "#8a8a7c" }}>{item.date} · Score: {item.score}</div>
                </div>
                <button
                  type="button"
                  onClick={() => downloadReport(item, user, documents, lang)}
                  title="Download PDF"
                  style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", color: forest }}
                >
                  <Download size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
