import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Thermometer, Droplets, Cloud } from "lucide-react";
import ScoreDial from "./ScoreDial";
import { STRINGS } from "../services/translationService";

/**
 * LoanScoreCard component rendering ScoreDial, Risk indicators, and Explainable AI (XAI) reason details.
 */
export default function LoanScoreCard({ result, potentialScore, lang }) {
  const t = STRINGS[lang] || STRINGS.en;
  
  const riskColor = result.risk === "Low" ? "#3B7A57" : result.risk === "Medium" ? "#C98A2B" : "#B4483B";
  const riskLabel = result.risk === "Low" ? t.low : result.risk === "Medium" ? t.medium : t.high;
  const RiskIcon = result.risk === "Low" ? CheckCircle2 : result.risk === "Medium" ? AlertTriangle : XCircle;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24, contentVisibility: "auto" }}>
        
        {/* Score Dial Display */}
        <div
          style={{
            background: "#FFFFFF", borderRadius: 16, border: "1px solid #E4E0D4",
            padding: 24, boxShadow: "0 2px 8px rgba(31,61,43,0.03)",
            display: "flex", gap: 24, alignItems: "center"
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <ScoreDial score={result.score} risk={result.risk} potentialScore={potentialScore} lang={lang} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: riskColor, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 18 }}>
              <RiskIcon size={20} /> {riskLabel} {t.risk}
            </div>
            <div style={{ color: "#6b6b60", fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
              {t.basedOn}
            </div>
            {result.weatherData && (
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <div style={{ background: "#EAF2EC", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#1F3D2B", display: "flex", alignItems: "center", gap: 4 }}>
                  <Thermometer size={12} /> {result.weatherData.temp}°C
                </div>
                <div style={{ background: "#EAF2EC", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#1F3D2B", display: "flex", alignItems: "center", gap: 4 }}>
                  <Droplets size={12} /> {result.weatherData.humidity}%
                </div>
                {result.weatherData.rain > 0 && (
                  <div style={{ background: "#EAF2EC", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#1F3D2B", display: "flex", alignItems: "center", gap: 4 }}>
                    <Cloud size={12} /> {result.weatherData.rain}mm
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Confidence & Assessment details */}
        <div
          style={{
            background: "#FFFFFF", borderRadius: 16, border: "1px solid #E4E0D4",
            padding: 24, boxShadow: "0 2px 8px rgba(31,61,43,0.03)",
            display: "flex", flexDirection: "column", justifyContent: "center"
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: "#8a8a7c", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
            {t.confidence}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1F3D2B", fontFamily: "Space Grotesk, sans-serif", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <CheckCircle2 size={20} /> {result.weatherData ? t.highConf : t.medConf}
          </div>
          <p style={{ fontSize: 12.5, color: "#6b6b60", lineHeight: 1.6, margin: 0 }}>
            {result.weatherData 
              ? `Score calculated using verified live coordinate signals from the ${result.weatherData.source || "OpenWeather / Open-Meteo"} local climatic sensor grid.`
              : "Calculated using baseline historical climate tables. Link dynamic coordinates to improve confidence."
            }
          </p>
        </div>
      </div>

      {/* Explainable AI (XAI) breakdown */}
      <div
        style={{
          background: "#FFFFFF", borderRadius: 16, border: "1px solid #E4E0D4",
          padding: 24, boxShadow: "0 2px 8px rgba(31,61,43,0.03)"
        }}
      >
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 15, color: "#1B2B20", borderBottom: "1px solid #E4E0D4", paddingBottom: 10, marginBottom: 14 }}>
          {t.whyScore}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {result.reasons.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 13.5, color: "#3d3d34", lineHeight: 1.4 }}>
              {r.ok ? (
                <CheckCircle2 size={17} color="#3B7A57" style={{ flexShrink: 0, marginTop: 2 }} />
              ) : (
                <AlertTriangle size={17} color="#C98A2B" style={{ flexShrink: 0, marginTop: 2 }} />
              )}
              <span>{r.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
