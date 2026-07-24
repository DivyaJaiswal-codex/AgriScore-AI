import React, { useState, useMemo, useEffect } from "react";
import { Sparkles, CheckCircle2, ChevronRight, HelpCircle, ShieldCheck, Droplet, Sprout, ClipboardCheck } from "lucide-react";
import { STRINGS } from "../services/translationService";

/**
 * LoanCoach Component rendering the vertical milestone timeline roadmap and the interactive What-If simulator.
 * Updated to be fully touch-friendly, with larger tap targets and simplified farmer descriptions.
 */
export default function LoanCoach({ result, documents, lang, onChangePotentialScore }) {
  const t = STRINGS[lang] || STRINGS.en;
  
  // What-If Simulator States
  const [soilTicked, setSoilTicked] = useState(documents.soil);
  const [dripTicked, setDripTicked] = useState(result.irrObj.id === "drip" || result.irrObj.id === "sprinkler");
  const [insuranceTicked, setInsuranceTicked] = useState(false);
  const [docsTicked, setDocsTicked] = useState(Object.values(documents).every(Boolean));

  // Sync state if documents object changes
  useEffect(() => {
    setSoilTicked(documents.soil);
    setDocsTicked(Object.values(documents).every(Boolean));
  }, [documents]);

  // Compute hypothetical potential score
  const potentialScore = useMemo(() => {
    let bonus = 0;
    if (!documents.soil && soilTicked) bonus += 5;
    if (!(result.irrObj.id === "drip" || result.irrObj.id === "sprinkler") && dripTicked) bonus += 12;
    if (insuranceTicked) bonus += 6;
    
    // Docs compliance bonus
    const initialTicked = Object.values(documents).filter(Boolean).length;
    if (initialTicked < 5 && docsTicked) {
      bonus += (5 - initialTicked) * 3;
    }

    return Math.min(100, result.score + bonus);
  }, [result.score, soilTicked, dripTicked, insuranceTicked, docsTicked, documents]);

  // Notify parent component of potential score updates
  useEffect(() => {
    if (onChangePotentialScore) {
      onChangePotentialScore(potentialScore);
    }
  }, [potentialScore, onChangePotentialScore]);

  // Simple localized description texts for milestones
  const milestoneDescriptions = {
    en: [
      "Get a Soil Health Card (SHC) and verify your KYC. Helps banks check compliance.",
      "Get crop insurance (PMFBY). Protects you and the bank from weather loss.",
      "Install Drip or Sprinkler systems. Lowers crop water stress and default risk."
    ],
    hi: [
      "मृदा स्वास्थ्य कार्ड (मिट्टी जांच पर्ची) लें और पहचान पत्र सत्यापित करें।",
      "प्रधानमंत्री फसल बीमा योजना (PMFBY) लें। यह फसल नुकसान की सुरक्षा देता है।",
      "ड्रिप या स्प्रिंकलर सिंचाई प्रणाली स्थापित करें। यह पानी की कमी के जोखिम को कम करता है।"
    ],
    bn: [
      "মাটি পরীক্ষার কার্ড নিন এবং পরিচয়পত্র যাচাই করুন। এটি ব্যাংককে দ্রুত ঋণ দিতে সাহায্য করে।",
      "ফসল বিমা (PMFBY) করান। এটি খরা বা বন্যাজনিত ফসল ক্ষতি থেকে বাঁচায়।",
      "ড্রিপ বা স্প্রিঙ্কলার সেচ ব্যবস্থা যুক্ত করুন। এটি জলের ঘাটতি পূরণ করে।"
    ],
    ta: [
      "மண் சுகாதார அட்டை மற்றும் KYC சரிபார்க்கவும். இது வங்கி கடன் பெற உதவும்.",
      "பயிர் காப்பீடு (PMFBY) பெறவும். இது பயிர் இழப்பில் இருந்து உங்களை பாதுகாக்கும்.",
      "சொட்டு நீர் அல்லது தெளிப்பு நீர் பாசனம் அமைக்கவும். இது வறட்சி ஆபத்தை குறைக்கும்."
    ],
    te: [
      "భూసార కార్డు పొంది, కేవైసీ ధృవీకరించుకోండి. ఇది బ్యాంక్ రుణం కోసం అవసరం.",
      "పంట బీమా (PMFBY) పొందండి. ఇది పంట నష్టం నుండి రక్షణ కల్పిస్తుంది.",
      "డ్రిప్ లేదా స్ప్రింక్లర్ సేద్యం ఏర్పాటు చేయండి. ఇది నీటి ఎద్దడిని తగ్గిస్తుంది."
    ],
    mr: [
      "मृदा आरोग्य कार्ड मिळवा आणि केवायसी तपासा. बँक अनुपालनासाठी आवश्यक.",
      "पीक विमा (PMFBY) उतरवून घ्या. दुष्काळ किंवा अतिवृष्टीच्या नुकसानीपासून रक्षण करते.",
      "ठिबक किंवा तुषार सिंचन बसवा. कोरड्या हवामानात पिकाचे रक्षण होते."
    ],
    gu: [
      "સોઈલ હેલ્થ કાર્ડ મેળવો અને કેવાયસી ચકાસો. બેંક લોન પ્રક્રિયા સરળ બનશે.",
      "પાક વીમો (PMFBY) મેળવો. પાક નુકસાન સામે સુરક્ષા પ્રદાન કરે છે.",
      "ટપક અથવા ફુવારા પદ્ધતિ અપનાવો. પાણીની અછતના જોખમને ઘટાડે છે."
    ],
    pa: [
      "ਮਿੱਟੀ ਸਿਹਤ ਕਾਰਡ ਲਓ ਅਤੇ ਕੇਵਾਈਸੀ ਵੈਰੀਫਾਈ ਕਰੋ। ਇਹ ਬੈਂਕ ਲੋਨ ਲਈ ਜ਼ਰੂਰੀ ਹੈ।",
      "ਫਸਲੀ ਬੀਮਾ (PMFBY) ਕਰਵਾਓ। ਇਹ ਫਸਲ ਦੇ ਨੁਕਸਾਨ ਦੇ ਜੋਖਮ ਤੋਂ ਬਚਾਉਂਦਾ ਹੈ।",
      "ਟਪਕ ਜਾਂ ਫੁਹਾਰਾ ਸਿੰਚਾਈ ਲਗਾਓ। ਇਹ ਪਾਣੀ ਦੀ ਕਮੀ ਦੇ ਜੋਖਮ ਨੂੰ ਘਟਾਉਂਦਾ ਹੈ।"
    ],
    kn: [
      "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಪಡೆಯಿರಿ ಮತ್ತು ಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿ. ಸಾಲ ಪಡೆಯಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
      "ಬೆಳೆ ವಿಮೆ (PMFBY) ಮಾಡಿಸಿ. ಬೆಳೆ ನಷ್ಟದಿಂದ ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸುತ್ತದೆ.",
      "ಹನಿ ಅಥವಾ ಚಿಮುಕಿಸುವ ನೀರாவರಿ ಅಳವಡಿಸಿ. ನೀರಿನ ಕೊರತೆಯ ಅಪಾಯ ತಪ್ಪಿಸುತ್ತದೆ."
    ],
    ml: [
      "മണ്ണ് ആരോഗ്യ കാർഡ് നേടി കെവൈസി സ്ഥിരീകരിക്കുക. ബാങ്ക് വായ്പയ്ക്ക് ഉപകരിക്കും.",
      "വിള ഇൻഷുറൻസ് (PMFBY) എടുക്കുക. കൃഷിനാശം മൂലമുള്ള കടബാധ്യത തടയുന്നു.",
      "തുള്ളിനന / സ്പ്രിംഗ്ലർ രീതികൾ സ്ഥാപിക്കുക. ജലക്ഷാമ സാധ്യത കുറയ്ക്കുന്നു."
    ],
    or: [
      "ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ ପ୍ରସ୍ତുତ କରନ୍ତୁ ଓ କେୱାଇସି ଯାଞ୍ચ କରନ୍ତୁ ।",
      "ଫସଲ ବୀମା (PMFBY) କରନ୍ତୁ । ଏହା ଫସଲ ନଷ୍ଟରୁ ସୁରକ୍षा ଦେଇଥାଏ ।",
      "ବୁନ୍ଦା ବା ସ୍ପ୍ରିଙ୍କଲର ଜଳସେଚନ କରନ୍ତୁ । ଏହା ଜଳାଭାବ ବିପଦକୁ କମାଇଥାଏ ।"
    ],
    as: [
      "মৃত্তিকা স্বাস্থ্য কাৰ্ড আৰু কেৱাইচি যাচাই কৰক। ই ঋণ পোৱাত সহায় কৰিব।",
      "শস্য বীমা (PMFBY) কৰক। ই শস্য হানিৰ লোকচানৰ পৰা সুৰক্ষা দিয়ে।",
      "টোপাল বা স্প্ৰিংকলাৰ জলসিঞ্চন ব্যৱস্থা কৰক। ই খৰাঙৰ আশংকা কমাব।"
    ],
    ur: [
      "مٹی کی جانچ کا کارڈ حاصل کریں اور کے وائی سی تصدیق کروائیں۔",
      "فصل کا بیما (PMFBY) کروائیں۔ یہ نقصان کی صورت میں تحفظ فراہم کرتا ہے۔",
      "ڈرپ یا اسپرنکلر آبپاشی کا نظام لگائیں۔ یہ خشک سالی کے رسک کو کم کرتا ہے۔"
    ]
  };

  const currentDesc = milestoneDescriptions[lang] || milestoneDescriptions.en;

  return (
    <div className="loan-coach-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
      
      {/* Roadmap Timeline */}
      <div
        style={{
          background: "#FFFFFF", borderRadius: 16, border: "1px solid #E4E0D4",
          padding: 24, boxShadow: "0 2px 8px rgba(31,61,43,0.03)"
        }}
      >
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 16, color: "#1F3D2B", borderBottom: "1px solid #E4E0D4", paddingBottom: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={18} color="#D4A017" /> {t.aiCoach}
        </div>
        <div style={{ color: "#3d3d34", fontSize: 13.5, marginBottom: 16, fontWeight: 500 }}>{t.coachSub}</div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 20, borderLeft: "2px solid #E4E0D4", paddingLeft: 18, marginLeft: 10 }}>
          
          {/* Milestone 1 */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: -25, top: 4, width: 12, height: 12, borderRadius: "50%", background: "#1F3D2B", border: "2px solid #fff", boxShadow: "0 0 0 2px #1F3D2B" }} />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1B2B20", display: "flex", alignItems: "center", gap: 6 }}>
              <Sprout size={14} color="#1F3D2B" /> {t.immediateAction}
            </div>
            <p style={{ fontSize: 12, color: "#6b6b60", margin: "6px 0 0 0", lineHeight: 1.5 }}>
              {currentDesc[0]}
            </p>
          </div>
          
          {/* Milestone 2 */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: -25, top: 4, width: 12, height: 12, borderRadius: "50%", background: "#D4A017", border: "2px solid #fff", boxShadow: "0 0 0 2px #D4A017" }} />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1B2B20", display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldCheck size={14} color="#D4A017" /> {t.mediumAction}
            </div>
            <p style={{ fontSize: 12, color: "#6b6b60", margin: "6px 0 0 0", lineHeight: 1.5 }}>
              {currentDesc[1]}
            </p>
          </div>

          {/* Milestone 3 */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: -25, top: 4, width: 12, height: 12, borderRadius: "50%", background: "#8a8a7c", border: "2px solid #fff", boxShadow: "0 0 0 2px #8a8a7c" }} />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1B2B20", display: "flex", alignItems: "center", gap: 6 }}>
              <Droplet size={14} color="#8a8a7c" /> {t.longAction}
            </div>
            <p style={{ fontSize: 12, color: "#6b6b60", margin: "6px 0 0 0", lineHeight: 1.5 }}>
              {currentDesc[2]}
            </p>
          </div>
        </div>
      </div>

      {/* What-If Simulator Card (Farmer-friendly checkboxes) */}
      <div
        style={{
          background: "#FCFBF8", borderRadius: 16, border: "1px solid #E4E0D4",
          padding: 24, boxShadow: "0 2px 8px rgba(31,61,43,0.03)"
        }}
      >
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 15.5, color: "#1B2B20", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <ClipboardCheck size={17} color="#1F3D2B" /> {t.whatIfSim}
        </div>
        <div style={{ color: "#6b6b60", fontSize: 12.5, marginBottom: 16, lineHeight: 1.5 }}>
          {t.whatIfSimSub}
        </div>

        {/* Chunky checkboxes designed for fingers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { id: "soil", checked: soilTicked, disabled: documents.soil, label: t.verifySoilHypo, action: () => setSoilTicked(!soilTicked) },
            { id: "drip", checked: dripTicked, disabled: result.irrObj.id === "drip" || result.irrObj.id === "sprinkler", label: t.setIrrigationHypo, action: () => setDripTicked(!dripTicked) },
            { id: "insurance", checked: insuranceTicked, disabled: false, label: t.secureCropHypo, action: () => setInsuranceTicked(!insuranceTicked) },
            { id: "docs", checked: docsTicked, disabled: Object.values(documents).every(Boolean), label: t.tickAllDocsHypo, action: () => setDocsTicked(!docsTicked) }
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => { if (!item.disabled) item.action(); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                borderRadius: 10, border: `1.5px solid ${item.checked ? "#1F3D2B" : "#E4E0D4"}`,
                background: item.checked ? "#EAF2EC" : "#FFFFFF",
                cursor: item.disabled ? "not-allowed" : "pointer",
                opacity: item.disabled ? 0.65 : 1,
                transition: "all 0.2s",
                userSelect: "none"
              }}
            >
              <input
                type="checkbox"
                checked={item.checked}
                disabled={item.disabled}
                onChange={() => {}} // handled by row container onClick
                style={{
                  width: 20, height: 20, accentColor: "#1F3D2B", cursor: item.disabled ? "not-allowed" : "pointer",
                  margin: 0, flexShrink: 0
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1B2B20" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {potentialScore > result.score && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1.5px dashed #E4E0D4", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#6b6b60", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{t.potentialScoreTitle}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#1F3D2B", fontFamily: "Space Grotesk, sans-serif", marginTop: 4 }}>
              {potentialScore} / 100
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
