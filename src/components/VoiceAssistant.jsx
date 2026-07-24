import React, { useState, useEffect } from "react";
import { Mic, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { useSpeechInput } from "../services/voiceService";
import { STRINGS, CROPS_I18N, IRRIGATION_I18N } from "../services/translationService";

/**
 * VoiceAssistant Component parsing spoken text and feeding parsed parameters back to CheckForm.
 * Overhauled to present a clean, farmer-first, non-technical interface with automatic manual entry fallback transitions.
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

    // 1. Dynamic Crop Matching (loops over all language maps in CROPS_I18N)
    Object.keys(CROPS_I18N).forEach((langCode) => {
      const cropsList = CROPS_I18N[langCode];
      cropsList.forEach((c, idx) => {
        if (textLower.includes(c.toLowerCase())) {
          const currentCrops = CROPS_I18N[lang] || CROPS_I18N.en;
          payload.crop = currentCrops[idx];
          updates.push(`Crop ➔ ${payload.crop}`);
        }
      });
    });

    // 2. Dynamic Irrigation System Matching (loops over all language maps in IRRIGATION_I18N)
    Object.keys(IRRIGATION_I18N).forEach((langCode) => {
      const irrList = IRRIGATION_I18N[langCode];
      irrList.forEach((irrItem) => {
        if (textLower.includes(irrItem.label.toLowerCase())) {
          payload.irrigation = irrItem.id;
          updates.push(`Irrigation ➔ ${irrItem.label}`);
        }
      });
    });

    // 3. Multi-language Land Sizing Matcher
    const landKeywords = ["acres", "acre", "एकड़", "एकड़", "একর", "ஏக்கர்", "ఎకరాలు", "एकर", "વીઘા", "ਏਕੜ", "ಎಕರೆ", "ഏക്കർ", "ଏକର", "একৰ", "ایکڑ"];
    const landRegex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:${landKeywords.join("|")})`, "i");
    const landMatch = textLower.match(landRegex);
    if (landMatch) {
      payload.land = landMatch[1];
      updates.push(`Land ➔ ${landMatch[1]} acres`);
    } else {
      const numMatch = textLower.match(/(?:land|ज़मीन|জমি|நிலம்|భూమి|जमीन|જમીન|ਜ਼ਮੀਨ|ਜಾಗ|സ്ഥലം|ଜମି|মাটি|زمین)\s*(\d+(?:\.\d+)?)/);
      if (numMatch) {
        payload.land = numMatch[1];
      }
    }

    // 4. Multi-language Harvest Quantity Matcher
    const harvestKeywords = ["quintals", "quintal", "क्विंटल", "কুইন্টাল", "குவிண்டால்", "క్వింటాళ్లు", "क्विंटल", "ક્વિન્ટલ", "ਕੁਇੰਟਲ", "ਕੁਇੰਟਾਲ", "ക്വിന്റൽ", "କ୍ଵିଣ୍ଟାଲ୍", "কুইন্টল", "کوئنٹل"];
    const harvestRegex = new RegExp(`(\\d+)\\s*(?:${harvestKeywords.join("|")})`, "i");
    const harvestMatch = textLower.match(harvestRegex);
    if (harvestMatch) {
      payload.harvest = harvestMatch[1];
      updates.push(`Harvest ➔ ${harvestMatch[1]} quintals`);
    } else {
      const numMatch = textLower.match(/(?:harvest|yield|उपज|ফলন|அறுவடை|দিగుబడి|उत्पादन|ઉત્પાદન|ਪੈਦਾਵਾਰ|ਇಳುವರಿ|വിളവെടുപ്പ്|ଅମଳ|প্ৰতিবেদন|পিদাবার)\s*(\d+)/);
      if (numMatch) {
        payload.harvest = numMatch[1];
      }
    }

    // 5. Multi-language Location parser
    const locMatch = textLower.match(/(?:village|district|location|town|गांव|स्थान|ग्राम|கிராமம்|గ్రామం|गाव|ગામ|ਪਿੰਡ|ਹಳ್ಳಿ|ഗ്രാമം|ଗାଁ|গাঁও|گاؤں)\s*(?:is)?\s*([a-zA-Z\u0900-\u097F\u0980-\u09FF\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0B00-\u0B7F\u09A0-\u09FD\u0600-\u06FF\s]+)/);
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
      // General Fallback mapping for short values
      const words = spokenText.trim().split(" ");
      if (words.length === 1 && !isNaN(words[0])) {
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

  const { start, stop, listening, errorMessage, isSupported } = useSpeechInput(lang, handleSpeechResult);

  // Transition helper to scroll and focus manual check form
  const handleManualEntry = () => {
    const formEl = document.querySelector("form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
      const firstInput = formEl.querySelector("input");
      if (firstInput) {
        firstInput.focus();
      }
    }
  };

  // Auto-switch to manual entry on unsupported browser or errors
  useEffect(() => {
    if (!isSupported || errorMessage) {
      const timer = setTimeout(() => {
        handleManualEntry();
      }, 3500); // 3.5s delay to let the farmer read the status
      return () => clearTimeout(timer);
    }
  }, [isSupported, errorMessage]);

  // Clean, premium design variables
  const forest = "#1F3D2B";
  const ink = "#1B2B20";
  const gold = "#D4A017";

  const hasFailed = !isSupported || !!errorMessage;

  return (
    <div
      style={{
        background: "#EAF2EC", borderRadius: 16, border: "1px solid #C5DBD0",
        padding: 24, boxShadow: "0 2px 8px rgba(31,61,43,0.02)", position: "relative"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 16, color: forest }}>
          <Mic size={18} /> {t.voiceAssistantTitle || "🎤 आवाज़ से जानकारी भरें"}
        </div>
        {listening && (
          <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#B4483B", animation: "pulse 1.2s infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#B4483B" }}>Listening...</span>
          </span>
        )}
      </div>

      {!hasFailed ? (
        <>
          <p style={{ fontSize: 13, color: "#2E5A3E", lineHeight: 1.5, marginBottom: 16 }}>
            {t.voiceAssistantSub || "अपनी भाषा में बोलें। आपकी जानकारी अपने आप फ़ॉर्म में भर दी जाएगी।"}
            <br />
            <strong style={{ display: "inline-block", marginTop: 4 }}>{t.voiceExample}</strong>
          </p>

          <button
            type="button"
            onClick={listening ? stop : start}
            style={{
              background: listening ? "#B4483B" : forest, color: "#fff", border: "none", borderRadius: 10,
              padding: "12px 20px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600,
              fontSize: 14.5, cursor: "pointer", display: "inline-flex", width: "100%",
              alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s",
              position: "relative", overflow: "hidden"
            }}
          >
            {listening ? (
              <>
                <span
                  style={{
                    position: "absolute", width: "100%", height: "100%",
                    background: "rgba(255, 255, 255, 0.15)", left: 0, top: 0,
                    animation: "pulse 1.5s infinite"
                  }}
                />
                <RefreshCw size={15} style={{ animation: "spin 2s linear infinite" }} />
                <span>Listening... Speak Now</span>
              </>
            ) : (
              <>
                <Mic size={16} />
                <span>{t.voiceStart}</span>
              </>
            )}
          </button>
        </>
      ) : (
        /* Redesigned Compact Warning fallback and Buttons */
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              padding: "10px 14px", background: "#FEF7F7",
              border: "1px solid #FADAD6", borderRadius: 10, color: "#9B1C1C",
              fontSize: 12.5, display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.4
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2, color: "#B4483B" }} />
            <span>
              {t.voiceFailWarning || "🎤 आवाज़ पहचान अभी उपलब्ध नहीं है। कृपया दोबारा प्रयास करें या नीचे दिए गए फ़ॉर्म से जानकारी भरें।"}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {/* Try again button (disabled if speechrecognition is fully unsupported) */}
            <button
              type="button"
              disabled={!isSupported}
              onClick={start}
              style={{
                flex: 1, padding: "10px 14px", background: isSupported ? forest : "#E4E0D4", color: isSupported ? "#fff" : "#8a8a7c",
                border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: isSupported ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "Space Grotesk, sans-serif"
              }}
            >
              {t.btnTryAgain || "🔄 पुनः प्रयास करें"}
            </button>
            <button
              type="button"
              onClick={handleManualEntry}
              style={{
                flex: 1, padding: "10px 14px", background: "#FFFFFF", color: forest,
                border: `1px solid ${forest}`, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "Space Grotesk, sans-serif"
              }}
            >
              {t.btnManualEntry || "📝 स्वयं जानकारी भरें"}
            </button>
          </div>
        </div>
      )}

      {voiceConsole && !hasFailed && (
        <div style={{ marginTop: 16, background: "#FFFFFF", padding: 12, borderRadius: 8, border: "1px solid #C5DBD0", fontSize: 12.5 }}>
          <div style={{ color: "#7a7a6c", fontWeight: 600, fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>{t.speechRecognized}</div>
          <div style={{ color: ink, fontWeight: 500 }}>"{voiceConsole}"</div>
          {assistantLogs && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #E4E0D4", color: forest, fontWeight: 600 }}>
              {assistantLogs}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
