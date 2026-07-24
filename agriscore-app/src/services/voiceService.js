import { useState, useRef } from "react";

/**
 * Text to Speech Synthesis
 */
export function speak(text, lang) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (lang === "hi") u.lang = "hi-IN";
    else if (lang === "bn") u.lang = "bn-IN";
    else u.lang = "en-IN";
    u.rate = 0.90;
    window.speechSynthesis.speak(u);
  } catch (e) {
    console.error("Text to speech failed", e);
  }
}

/**
 * Speech Recognition Hook (Web Speech API)
 */
export function useSpeechInput(lang, onResult) {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input is not supported in this browser. Please try Google Chrome.");
      return;
    }
    try {
      const rec = new SR();
      rec.lang = lang === "hi" ? "hi-IN" : lang === "bn" ? "bn-IN" : "en-IN";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        onResult(text);
        setListening(false);
      };
      rec.onerror = (e) => {
        console.error("Speech Recognition error", e);
        setListening(false);
      };
      rec.onend = () => setListening(false);
      recRef.current = rec;
      setListening(true);
      rec.start();
    } catch (e) {
      console.error(e);
      setListening(false);
    }
  };

  const stop = () => {
    if (recRef.current) {
      recRef.current.stop();
      setListening(false);
    }
  };

  return { start, stop, listening };
}
