import { useState, useRef, useEffect } from "react";
import { STRINGS } from "./translationService";

/**
 * Text to Speech Synthesis
 */
export function speak(text, lang) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    
    // Map languages to TTS locales
    const langLocales = {
      en: "en-IN", hi: "hi-IN", bn: "bn-IN", ta: "ta-IN", te: "te-IN",
      mr: "mr-IN", gu: "gu-IN", pa: "pa-IN", kn: "kn-IN", ml: "ml-IN",
      or: "or-IN", as: "as-IN", ur: "ur-IN"
    };
    
    u.lang = langLocales[lang] || "en-IN";
    u.rate = 0.90;
    window.speechSynthesis.speak(u);
  } catch (e) {
    console.error("Text to speech failed", e);
  }
}

/**
 * Speech Recognition Hook (Web Speech API)
 * Requests microphone permission using getUserMedia BEFORE starting SpeechRecognition.
 * Only initializes and starts SpeechRecognition if permission is successfully granted.
 * Logs browser errors explicitly and explains the technical root cause in simple terms.
 */
export function useSpeechInput(lang, onResult) {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const retriesRef = useRef(0);

  const t = STRINGS[lang] || STRINGS.en;

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setIsSupported(false);
    }
    // Clean up instances on unmount
    return () => {
      if (recRef.current) {
        try {
          recRef.current.abort();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const start = async () => {
    setErrorMessage("");
    retriesRef.current = 0; // Reset retries on manual microphone press
    
    // Check secure context first (Microphone APIs are blocked on HTTP hosts)
    if (!window.isSecureContext) {
      const secureMsg = lang === "hi"
        ? "सुरक्षा अलर्ट: यह ऐप असुरक्षित कनेक्शन (HTTP) पर चल रहा है। ब्राउज़र सुरक्षा के लिए माइक्रोफ़ोन बंद रखते हैं। कृपया 'https://' या 'localhost' का उपयोग करें।"
        : lang === "bn"
        ? "সুরক্ষা অ্যালার্ট: এই অ্যাপটি অনিরাপদ কানেকশনে (HTTP) চলছে। সুরক্ষার জন্য মাইক্রোফোন ব্লক রাখা হয়েছে। দয়া করে 'https://' বা 'localhost' ব্যবহার করুন।"
        : "Security Alert: This app is running in an insecure context (HTTP). Browsers block microphone access. Please use HTTPS or localhost.";
      setErrorMessage(secureMsg);
      setListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErrorMessage(t.errGeneric || "Speech recognition is not supported in this browser.");
      return;
    }

    // 1. Request microphone permission explicitly via mediaDevices BEFORE starting SpeechRecognition
    let stream;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Microphone Permission Timeout")), 2500)
        );
        const getUserMediaPromise = navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Race the getUserMedia call against a 2.5s timeout to prevent system-level hangs
        stream = await Promise.race([getUserMediaPromise, timeoutPromise]);
        
        // Permission granted! Immediately stop and release the tracks to free up audio hardware
        stream.getTracks().forEach(track => track.stop());
      } else {
        console.warn("navigator.mediaDevices.getUserMedia is unavailable. Trying direct launch...");
      }
    } catch (err) {
      // Permission denied, timeout, or audio capture hardware blocked
      console.error("Microphone permission denied or timed out via getUserMedia:", err);
      const permMsg = lang === "hi"
        ? "अनुमति अस्वीकृत: माइक्रोफ़ोन एक्सेस ब्लॉक है। एड्रेस बार में लॉक (ताले) के निशान पर क्लिक करके अनुमति दें।"
        : lang === "bn"
        ? "অনুমতি বাতিল: মাইক্রোফোন ব্লক করা আছে। অ্যাড্রেস বারের তালার চিহ্নে ক্লিক করে অনুমতি দিন।"
        : "Permission Denied: Microphone access is blocked. Click the lock icon in the address bar to allow it.";
      setErrorMessage(permMsg);
      setListening(false);
      return; // Do NOT start SpeechRecognition
    }

    // 2. Start SpeechRecognition since permission is verified
    initializeAndStart(SR);
  };

  const initializeAndStart = (SR) => {
    try {
      // Clean up previous active listener instance if it exists
      if (recRef.current) {
        try {
          recRef.current.abort();
        } catch (err) {
          console.log("Cleanup previous recognition error:", err);
        }
      }

      const rec = new SR();
      const langLocales = {
        en: "en-IN", hi: "hi-IN", bn: "bn-IN", ta: "ta-IN", te: "te-IN",
        mr: "mr-IN", gu: "gu-IN", pa: "pa-IN", kn: "kn-IN", ml: "ml-IN",
        or: "or-IN", as: "as-IN", ur: "ur-IN"
      };
      
      rec.lang = langLocales[lang] || "en-IN";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.continuous = false; // Auto-stops on silence

      rec.onstart = () => {
        setListening(true);
      };

      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        if (onResult) {
          onResult(text);
        }
        setListening(false);
      };

      rec.onerror = (e) => {
        // Log the actual browser error to the developer console for debugging
        console.error("Speech Recognition Browser Error Status:", e.error, e);
        
        let rootCauseExplanation = "";
        
        if (!window.isSecureContext) {
          rootCauseExplanation = lang === "hi"
            ? "यह ऐप असुरक्षित कनेक्शन (HTTP) पर है। ब्राउज़र सुरक्षा के लिए माइक्रोफ़ोन बंद रखते हैं। कृपया 'https://' या 'localhost' पर खोलें।"
            : lang === "bn"
            ? "এই অ্যাপটি অনিরাপদ কানেকশনে (HTTP) চলছে। ব্রাউজার সুরক্ষার জন্য মাইক্রোফোন বন্ধ রেখেছে। দয়া করে 'https://' বা 'localhost' ব্যবহার করুন।"
            : "This app is running in an insecure context (HTTP). Browsers disable microphone APIs on non-secure hosts. Please access via HTTPS or localhost.";
        } else {
          // Map error events to localized root cause explanation strings
          if (e.error === "network") {
            if (retriesRef.current < 2) {
              retriesRef.current += 1;
              console.log(`Speech network drop detected. Automatic attempt retry ${retriesRef.current}/2...`);
              setTimeout(() => {
                try {
                  initializeAndStart(SR);
                } catch (retryErr) {
                  console.error("Failed to restart speech engine:", retryErr);
                  setErrorMessage(
                    lang === "hi"
                      ? "नेटवर्क समस्या: कृपया अपना इंटरनेट कनेक्शन जांचें और दोबारा बोलें।"
                      : lang === "bn"
                      ? "নেটওয়ার্ক সমস্যা: দয়া করে আপনার ইন্টারনেট চেক করে আবার বলুন।"
                      : "Network issue. Please check your internet connection and try again."
                  );
                  setListening(false);
                }
              }, 800);
              return;
            } else {
              rootCauseExplanation = lang === "hi"
                ? "नेटवर्क समस्या: स्पीच रिकग्निशन सर्वर से संपर्क नहीं हो पाया। कृपया इंटरनेट कनेक्शन जांचें।"
                : lang === "bn"
                ? "নেটওয়ার্ক সমস্যা: স্পিচ সার্ভারের সাথে সংযোগ করা যায়নি। দয়া করে ইন্টারনেট চেক করুন।"
                : "Network issue. Failed to connect to speech recognition servers. Please check your internet.";
            }
          } else if (e.error === "not-allowed") {
            rootCauseExplanation = lang === "hi"
              ? "अनुमति अस्वीकृत: माइक्रोफ़ोन एक्सेस ब्लॉक है। एड्रेस बार में लॉक (ताले) के निशान पर क्लिक करके अनुमति दें।"
              : lang === "bn"
              ? "অনুমতি বাতিল: মাইক্রোফোন ব্লক করা আছে। অ্যাড্রেস বারের তালার চিহ্নে ক্লিক করে অনুমতি দিন।"
              : "Permission Denied: Microphone access is blocked. Click the lock icon in the address bar to allow it.";
          } else if (e.error === "audio-capture") {
            rootCauseExplanation = lang === "hi"
              ? "ऑडियो कैप्चर एरर: आपके सिस्टम में कोई रिकॉर्डिंग डिवाइस नहीं मिली। कृपया माइक्रोफ़ोन कनेक्ट करें।"
              : lang === "bn"
              ? "অডিও ক্যাপচার সমস্যা: কোনো মাইক্রোফোন পাওয়া যায়নি। দয়া করে ডিভাইস কানেক্ট করুন।"
              : "Audio Capture Error: No microphone was found. Please plug in a microphone.";
          } else if (e.error === "no-speech") {
            rootCauseExplanation = lang === "hi"
              ? "आवाज़ नहीं सुनाई दी: कृपया थोड़ा पास आकर या तेज बोलें।"
              : lang === "bn"
              ? "কণ্ঠস্বর শোনা যায়নি: দয়া করে একটু জোরে বলুন।"
              : "No speech detected: Please speak closer to the microphone or louder.";
          } else if (e.error === "aborted") {
            // Manual abort - no visible warning indicator
          } else {
            rootCauseExplanation = lang === "hi"
              ? `पहचान विफल: ब्राउज़र एरर (${e.error})। कृपया दोबारा प्रयास करें।`
              : lang === "bn"
              ? `ব্যর্থ হয়েছে: ব্রাউজার এরর (${e.error})। দয়া করে আবার চেষ্টা করুন।`
              : `Recognition failed: Browser error (${e.error}). Please try again.`;
          }
        }

        if (rootCauseExplanation) {
          setErrorMessage(rootCauseExplanation);
        }
        setListening(false);
      };

      rec.onend = () => {
        // Keep listening state active if a retry tick is waiting to start
        if (retriesRef.current > 0 && retriesRef.current <= 2 && !errorMessage) {
          return;
        }
        setListening(false);
      };

      recRef.current = rec;
      rec.start();
    } catch (e) {
      console.error("SpeechRecognition initialization failed:", e);
      setErrorMessage(t.errGeneric || "Failed to start speech recognition.");
      setListening(false);
    }
  };

  const stop = () => {
    if (recRef.current) {
      try {
        recRef.current.abort(); // immediately stop capture and release microphone
      } catch (e) {
        console.error("SpeechRecognition stop error:", e);
      }
      setListening(false);
    }
  };

  return { start, stop, listening, errorMessage, isSupported };
}
