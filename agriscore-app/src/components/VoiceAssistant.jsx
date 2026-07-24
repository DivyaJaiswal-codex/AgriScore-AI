import React, { useState } from "react";
import { Mic } from "lucide-react";
import { useSpeechInput } from "../services/voiceService";
import { STRINGS, CROPS_I18N } from "../services/translationService";

/**
 * VoiceAssistant Component parsing spoken text and feeding parsed parameters back to CheckForm.
 */
export default function VoiceAssistant({ lang, onVoiceUpdate }) {
  const t = STRINGS[lang] || STRINGS.en;
  const [voiceConsole, setVoiceConsole] = useState("");
  const [assistantLogs, setAssistantLogs] = useState("");

  const handleSpeechResult = (spokenText) => {
    setVoiceConsole(spokenText);
    const textLower = spokenText.toLowerCase();
    const updates = [];
    const payload = {};

    // Get localized crop list
    const crops = CROPS_I18N[lang] || CROPS_I18N.en;
    
    // Parse Crop Matchers
    const cropsEn = ["rice", "wheat", "maize", "sugarcane", "cotton", "potato", "vegetables"];
    const cropsHi = ["धान", "गेहूं", "मक्का", "गन्ना", "कपास", "आलू", "सब्जियां", "सब्जी"];
    const cropsBn = ["ধান", "গম", "ভুট্টা", "আখ", "তুলা", "আলু", "শাকসবজি"];

    cropsEn.forEach((c, idx) => {
      if (textLower.includes(c)) {
        payload.crop = crops[idx];
        updates.push(`Crop ➔ ${crops[idx]}`);
      }
    });
    cropsHi.forEach((c, idx) => {
      if (textLower.includes(c)) {
        payload.crop = crops[idx];
        updates.push(`फ़सल ➔ ${crops[idx]}`);
      }
    });
    cropsBn.forEach((c, idx) => {
      if (textLower.includes(c)) {
        payload.crop = crops[idx];
        updates.push(`ফসল ➔ ${crops[idx]}`);
      }
    });

    // Parse Land Matchers
    const landMatch = textLower.match(/(\d+(?:\.\d+)?)\s*(?:acres|acre|एकड़|एकड़|একর)/);
    if (landMatch) {
      payload.land = landMatch[1];
      updates.push(`Land ➔ ${landMatch[1]} acres`);
    } else {
      const numMatch = textLower.match(/(?:land|ज़मीन|জমি|জমির পরিমাণ)\s*(\d+(?:\.\d+)?)/);
      if (numMatch) {
        payload.land = numMatch[1];
        updates.push(`Land ➔ ${numMatch[1]} acres`);
      }
    }

    // Parse Harvest Matchers
    const harvestMatch = textLower.match(/(\d+)\s*(?:quintals|quintal|क्विंटल|কুইন্টাল)/);
    if (harvestMatch) {
      payload.harvest = harvestMatch[1];
      updates.push(`Harvest ➔ ${harvestMatch[1]} quintals`);
    } else {
      const numMatch = textLower.match(/(?:harvest|yield|उपज|ফলন)\s*(\d+)/);
      if (numMatch) {
        payload.harvest = numMatch[1];
        updates.push(`Harvest ➔ ${numMatch[1]} quintals`);
      }
    }

    // Parse Irrigation Matchers
    if (textLower.includes("drip") || textLower.includes("ड्रिप") || textLower.includes("ড্রিপ")) {
      payload.irrigation = "drip";
      updates.push("Irrigation ➔ Drip");
    } else if (textLower.includes("sprinkler") || textLower.includes("स्प्रिंकलर") || textLower.includes("স্প্রিঙ্কলার")) {
      payload.irrigation = "sprinkler";
      updates.push("Irrigation ➔ Sprinkler");
    } else if (textLower.includes("canal") || textLower.includes("नहर") || textLower.includes("খাল") || textLower.includes("tube") || textLower.includes("নলকূপ")) {
      payload.irrigation = "canal";
      updates.push("Irrigation ➔ Canal/Tube well");
    } else if (textLower.includes("rain") || textLower.includes("वर्षा") || textLower.includes("বৃষ্টি")) {
      payload.irrigation = "rainfed";
      updates.push("Irrigation ➔ Rainfed");
    }

    // Parse Location (Assume last word or after village keyword)
    const locMatch = textLower.match(/(?:village|district|location|town|गांव|स्थान|ग्राम|জেলা)\s*(?:is)?\s*([a-zA-Z\u0900-\u097F\u0980-\u09FF\s]+)/);
    if (locMatch) {
      const lVal = locMatch[1].trim();
      if (lVal) {
        payload.location = lVal;
        updates.push(`Location ➔ ${lVal}`);
      }
    }

    if (updates.length > 0) {
      setAssistantLogs(updates.join(" | "));
      onVoiceUpdate(payload);
    } else {
      // General Fallback mapping for single/double word locations
      const words = spokenText.trim().split(" ");
      if (words.length === 1 && !isNaN(words[0])) {
        // user spoke just a number
        onVoiceUpdate({ rawNumber: words[0] });
        setAssistantLogs(`Number ➔ ${words[0]}`);
      } else if (words.length <= 2) {
        payload.location = spokenText;
        onVoiceUpdate({ location: spokenText });
        setAssistantLogs(`Location ➔ ${spokenText}`);
      } else {
        setAssistantLogs(t.voiceFallback);
      }
    }
  };

  const { start, stop, listening } = useSpeechInput(lang, handleSpeechResult);

  return (
    <div
      style={{
        background: "#EAF2EC", borderRadius: 16, border: "1px solid #C5DBD0",
        padding: 24, boxShadow: "0 2px 8px rgba(31,61,43,0.02)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 15, color: "#1F3D2B" }}>
          <Mic size={17} /> {t.voiceAssistantTitle}
        </div>
        {listening && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#B4483B", animation: "pulse 1s infinite" }} />}
      </div>
      
      <p style={{ fontSize: 13, color: "#2E5A3E", lineHeight: 1.5, marginBottom: 16 }}>
        {t.voiceAssistantSub}
        <br />
        <strong style={{ display: "inline-block", marginTop: 4 }}>{t.voiceExample}</strong>
      </p>

      <button
        type="button"
        onClick={listening ? stop : start}
        style={{
          background: listening ? "#B4483B" : "#1F3D2B", color: "#fff", border: "none", borderRadius: 10,
          padding: "12px 20px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600,
          fontSize: 14.5, cursor: "pointer", display: "inline-flex", width: "100%",
          alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s"
        }}
      >
        <Mic size={16} /> {listening ? t.voiceStop : t.voiceStart}
      </button>

      {voiceConsole && (
        <div style={{ marginTop: 16, background: "#FFFFFF", padding: 12, borderRadius: 8, border: "1px solid #C5DBD0", fontSize: 12.5 }}>
          <div style={{ color: "#7a7a6c", fontWeight: 600, fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>{t.speechRecognized}</div>
          <div style={{ color: "#1B2B20", fontWeight: 500 }}>"{voiceConsole}"</div>
          {assistantLogs && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #E4E0D4", color: "#1F3D2B", fontWeight: 600 }}>
              {assistantLogs}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
