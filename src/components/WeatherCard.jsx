import React from "react";
import { Cloud, Droplets, Thermometer } from "lucide-react";
import { STRINGS } from "../services/translationService";

/**
 * WeatherCard Component displaying linked climatic variables.
 * Designed strictly for farmers; does not contain any developer-oriented API key inputs or technical baseline warnings.
 */
export default function WeatherCard({ weatherData, lang }) {
  const t = STRINGS[lang] || STRINGS.en;

  return (
    <div
      style={{
        background: "#FFFFFF", borderRadius: 16, border: "1px solid #E4E0D4",
        padding: 20, boxShadow: "0 2px 8px rgba(31,61,43,0.03)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 15, color: "#1B2B20" }}>
          <Cloud size={18} color="#1F3D2B" /> {t.climateSensorsTitle}
        </div>
      </div>

      {weatherData ? (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1F3D2B", marginBottom: 8 }}>
            {weatherData.locationName}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div style={{ background: "#F7F5EF", padding: 10, borderRadius: 10, textAlign: "center" }}>
              <Thermometer size={16} color="#B4483B" style={{ margin: "0 auto 4px" }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1B2B20" }}>{weatherData.temp}°C</div>
              <div style={{ fontSize: 10, color: "#6b6b60" }}>{t.temp}</div>
            </div>
            <div style={{ background: "#F7F5EF", padding: 10, borderRadius: 10, textAlign: "center" }}>
              <Droplets size={16} color="#2980B9" style={{ margin: "0 auto 4px" }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1B2B20" }}>{weatherData.humidity}%</div>
              <div style={{ fontSize: 10, color: "#6b6b60" }}>{t.humidity}</div>
            </div>
            <div style={{ background: "#F7F5EF", padding: 10, borderRadius: 10, textAlign: "center" }}>
              <Cloud size={16} color="#7a7a6c" style={{ margin: "0 auto 4px" }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1B2B20" }}>{weatherData.rain}mm</div>
              <div style={{ fontSize: 10, color: "#6b6b60" }}>{t.rain}</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12.5, color: "#8a8a7c", lineHeight: 1.5, padding: "4px 0", whiteSpace: "pre-line" }}>
          {t.weatherUnavailable || "मौसम की जानकारी अभी उपलब्ध नहीं है।\nऋण पात्रता का मूल्यांकन उपलब्ध कृषि एवं क्षेत्रीय डेटा के आधार पर किया गया है।"}
        </div>
      )}
    </div>
  );
}
