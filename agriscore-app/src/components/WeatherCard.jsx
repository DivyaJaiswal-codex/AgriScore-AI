import React, { useState } from "react";
import { Cloud, Droplets, Thermometer, Info, Settings, ShieldCheck } from "lucide-react";
import { STRINGS } from "../services/translationService";

/**
 * WeatherCard Component displaying linked climatic variables and OpenWeather API configuration settings.
 */
export default function WeatherCard({ weatherData, apiKey, onSaveApiKey, lang }) {
  const t = STRINGS[lang] || STRINGS.en;
  const [keyInput, setKeyInput] = useState(apiKey || "");
  const [showSettings, setShowSettings] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKey(keyInput);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

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
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b6b60" }}
          title={t.devSettingsTitle}
        >
          <Settings size={16} />
        </button>
      </div>

      {showSettings ? (
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#5c5c52" }}>
            {t.openWeatherKeyLabel}
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder={t.apiPlaceholder}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #E4E0D4",
                fontSize: 12, outline: "none", marginTop: 4, background: "#FCFBF8"
              }}
            />
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="submit"
              style={{
                background: "#1F3D2B", color: "#fff", border: "none", borderRadius: 6,
                padding: "6px 12px", fontSize: 11.5, fontWeight: 600, cursor: "pointer"
              }}
            >
              {t.saveConfigBtn}
            </button>
            {savedBanner && (
              <span style={{ fontSize: 11, color: "#3B7A57", display: "flex", alignItems: "center", gap: 4 }}>
                <ShieldCheck size={14} /> Saved!
              </span>
            )}
          </div>
        </form>
      ) : weatherData ? (
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
          <div style={{ fontSize: 10.5, color: "#8a8a7c", marginTop: 10, display: "flex", gap: 4, alignItems: "center" }}>
            <Info size={12} />
            Telemetry linked via {weatherData.source || "sensors"}.
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12.5, color: "#8a8a7c", textAlign: "center", padding: "10px 0" }}>
          No weather linked. Evaluated on default regional baseline.
        </div>
      )}
    </div>
  );
}
