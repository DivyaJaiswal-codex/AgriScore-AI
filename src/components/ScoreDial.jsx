import React, { useState, useEffect, useMemo } from "react";
import { STRINGS } from "../services/translationService";

/**
 * ScoreDial component rendering an animated, centered horizontal speedometer gauge.
 * Thinner needle on the outer edge ensures no overlap with the score number.
 * Displays a friendly localized advisor status note below the dial.
 */
export default function ScoreDial({ score, risk, potentialScore, lang }) {
  const t = STRINGS[lang] || STRINGS.en;
  
  // Eased progress animation from 0 to the current score
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 850; // 850ms smooth sweep
    const startVal = 0;
    const endVal = score;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = progress * (2 - progress); // easeOutQuad
      setAnimatedScore(Math.round(startVal + easedProgress * (endVal - startVal)));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [score]);

  const cx = 110, cy = 110, r = 75;

  // Needles are drawn on the outer ring to prevent center text overlap
  const angle = -180 + (animatedScore / 100) * 180;
  const rad = (Math.PI / 180) * angle;
  
  // Primary needle (sleek and thin)
  const needleX1 = cx + (r - 12) * Math.cos(rad);
  const needleY1 = cy + (r - 12) * Math.sin(rad);
  const needleX2 = cx + (r - 2) * Math.cos(rad);
  const needleY2 = cy + (r - 2) * Math.sin(rad);

  // Potential target needle (for What-If Simulator)
  const showPotential = potentialScore && potentialScore > score;
  const potAngle = -180 + (potentialScore / 100) * 180;
  const potRad = (Math.PI / 180) * potAngle;
  const potNeedleX1 = cx + (r - 12) * Math.cos(potRad);
  const potNeedleY1 = cy + (r - 12) * Math.sin(potRad);
  const potNeedleX2 = cx + (r - 2) * Math.cos(potRad);
  const potNeedleY2 = cy + (r - 2) * Math.sin(potRad);

  const COLORS = {
    bg: "#E4E0D4",
    ink: "#1B2B20",
    low: "#3B7A57", // Green
    med: "#C98A2B", // Orange
    high: "#B4483B" // Red
  };

  // Determine dynamic colors for the text based on current value
  const getScoreColor = (val) => {
    if (val <= 40) return COLORS.high;
    if (val <= 70) return COLORS.med;
    return COLORS.low;
  };
  const scoreColor = getScoreColor(animatedScore);

  const riskColor = risk === "Low" ? COLORS.low : risk === "Medium" ? COLORS.med : COLORS.high;
  const riskLabel = risk === "Low" ? t.low : risk === "Medium" ? t.medium : t.high;

  // Arc helper
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
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  const highEnd = -180 + 0.48 * 180;
  const medEnd = -180 + 0.72 * 180;

  // Localized agricultural advisory messages based on eligibility
  const advisoryMessages = {
    en: {
      good: "You are in a strong position to secure a bank loan.",
      mid: "You are close to bank loan eligibility. Follow tips to improve.",
      bad: "Improvements are required to be eligible for a loan."
    },
    hi: {
      good: "आप बैंक से लोन (ऋण) लेने के लिए बहुत अच्छी स्थिति में हैं।",
      mid: "आप बैंक से लोन लेने के करीब हैं। सुझावों के अनुसार सुधार करें।",
      bad: "लोन पाने के लिए अभी सुधार करने की आवश्यकता है।"
    },
    bn: {
      good: "আপনি ব্যাংক থেকে ঋণ নেওয়ার জন্য খুব ভালো অবস্থানে আছেন।",
      mid: "আপনি ব্যাংক ঋণের কাছাকাছি আছেন। পরামর্শগুলি অনুসরণ করুন।",
      bad: "ঋণ পাওয়ার জন্য আরো কিছু বিষয়ের উন্নতি প্রয়োজন।"
    },
    ta: {
      good: "வங்கி கடன் பெற நீங்கள் சாதகமான நிலையில் உள்ளீர்கள்.",
      mid: "கடன் பெற வாய்ப்புள்ளது. முன்னேற்ற ஆலோசனைகளை பின்பற்றவும்.",
      bad: "கடன் பெற சில ஆவணங்களை சரிசெய்ய வேண்டும்."
    },
    te: {
      good: "మీరు బ్యాంకు రుణం పొందడానికి చాలా అనుకూలమైన స్థితిలో ఉన్నారు.",
      mid: "మీరు రుణ అర్హతకు దగ్గరగా ఉన్నారు. సూచనలు పాటించండి.",
      bad: "రుణం పొందడానికి కొన్ని మెరుగుదలలు అవసరం."
    },
    mr: {
      good: "तुम्ही बँकेकडून कर्ज मिळवण्यासाठी चांगल्या स्थितीत आहात.",
      mid: "तुम्ही कर्ज मिळवण्याच्या जवळ आहात. मार्गदर्शनाचे पालन करा.",
      bad: "कर्ज मिळवण्यासाठी सुधारणा करणे आवश्यक आहे."
    },
    gu: {
      good: "તમે બેંકમાંથી લોન મેળવવા માટે ખૂબ જ સારી સ્થિતિમાં છો.",
      mid: "તમે લોન મેળવવાની નજીક છો. સૂચનોનું પાલન કરો.",
      bad: "লোન મેળવવા માટે હજુ સુધારા કરવાની જરૂર છે."
    },
    pa: {
      good: "ਤੁਸੀਂ ਬੈਂਕ ਤੋਂ ਲੋਨ ਲੈਣ ਲਈ ਬਹੁਤ ਵਧੀਆ ਸਥਿਤੀ ਵਿੱਚ ਹੋ।",
      mid: "ਤੁਸੀਂ ਲੋਨ ਲੈਣ ਦੇ ਨੇੜੇ ਹੋ। ਸੁਝਾਵਾਂ ਦੀ ਪਾਲਣਾ ਕਰੋ।",
      bad: "ਲੋਨ ਲੈਣ ਲਈ ਅਜੇ ਸੁਧਾਰ ਕਰਨ ਦੀ ਲੋੜ ਹੈ।"
    },
    kn: {
      good: "ನೀವು ಬ್ಯಾಂಕಿನಿಂದ ಸಾಲ ಪಡೆಯಲು ಉತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದೀರಿ.",
      mid: "ನೀವು ಸಾಲದ ಅರ್ಹತೆಗೆ ಹತ್ತಿರದಲ್ಲಿದ್ದೀರಿ. ಸೂಚನೆಗಳನ್ನು ಪಾಲಿಸಿ.",
      bad: "ಸಾಲ ಪಡೆಯಲು ಇನ್ನೂ ಕೆಲವು ಸುಧಾರಣೆಗಳು ಅಗತ್ಯವಿದೆ."
    },
    ml: {
      good: "ബാങ്ക് വായ്പ നേടുന്നതിന് നിങ്ങൾ അനുകൂല സാഹചര്യത്തിലാണ്.",
      mid: "നിങ്ങൾ വായ്പ യോഗ്യതയ്ക്ക് അടുത്താണ്. നിർദ്ദേശങ്ങൾ പാലിക്കുക.",
      bad: "വായ്പ ലഭിക്കുന്നതിന് കൂടുതൽ തയ്യാറെടുപ്പുകൾ ആവശ്യമാണ്."
    },
    or: {
      good: "ଆପଣ ବ୍ୟାଙ୍କରୁ ଋଣ ପାଇଁ ବହୁତ ଭଲ ସ୍ଥିତିରେ ଅଛନ୍ତି ।",
      mid: "ଆପଣ ଋଣ ପାଇବାକୁ ନିକଟତର ଅଛନ୍ତି । ଚେଷ୍ଟା ଜାରି ରଖନ୍ତು ।",
      bad: "ଋଣ ପାଇବା ପାଇଁ କିଛି ସୁଧାର ଆବଶ୍ୟକ ଅଟେ ।"
    },
    as: {
      good: "আপুনি বেংকৰ পৰা ঋণ পাবলৈ অতি সুন্দৰ অৱস্থাত আছে।",
      mid: "আপুনি ঋণ পোৱাৰ ওচৰ চাপিছে। পৰামৰ্শসমূহ মানি চলক।",
      bad: "ঋণ পাবলৈ কিছু সালসলনিৰ প্ৰয়োজন হ’ব।"
    },
    ur: {
      good: "آپ بینک سے لون حاصل کرنے کے لیے بہت اچھی پوزیشن میں ہیں۔",
      mid: "آپ لون حاصل کرنے کے قریب ہیں۔ مشوروں پر عمل کریں۔",
      bad: "لون حاصل کرنے کے لیے مزید بہتری کی ضرورت ہے۔"
    }
  };

  const msgObj = advisoryMessages[lang] || advisoryMessages.en;
  let advisoryText = msgObj.bad;
  if (score >= 71) advisoryText = msgObj.good;
  else if (score >= 41) advisoryText = msgObj.mid;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "12px 0" }}>
      
      {/* Centered responsive dial sizing (reduced slightly for mobile viewports) */}
      <div style={{ width: "100%", maxWidth: 195, height: 125, position: "relative", overflow: "visible" }}>
        <svg viewBox="0 0 220 135" width="100%" height="100%" style={{ overflow: "visible", display: "block" }}>
          {/* Background Track */}
          {arc(-180, 0, COLORS.bg)}
          
          {/* Risk Range Arcs */}
          {arc(-180, highEnd, COLORS.high)}
          {arc(highEnd, medEnd, COLORS.med)}
          {arc(medEnd, 0, COLORS.low)}
          
          {/* Potential Needle (dotted gold) */}
          {showPotential && (
            <line
              x1={potNeedleX1} y1={potNeedleY1} x2={potNeedleX2} y2={potNeedleY2}
              stroke="#D4A017" strokeWidth="2" strokeDasharray="2,2" strokeLinecap="round"
            />
          )}

          {/* Primary Needle (Thinner and shorter, on outer ring to prevent center overlap) */}
          <line
            x1={needleX1} y1={needleY1} x2={needleX2} y2={needleY2}
            stroke={COLORS.ink} strokeWidth="2.5" strokeLinecap="round"
          />
          
          {/* Centered score text colored dynamically */}
          <text x={cx} y={cy - 5} textAnchor="middle" fontSize="34" fontWeight="800" fill={scoreColor} fontFamily="Space Grotesk, sans-serif">
            {animatedScore}
          </text>

          {/* Potential text pointers */}
          {showPotential && (
            <text x={cx} y={cy - 46} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#D4A017" fontFamily="Inter, sans-serif">
              → Potential: {potentialScore}
            </text>
          )}

          {/* Spaced localized outOf100 subtitle */}
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize="9.5" fill="#8a8a7c" fontFamily="Inter, sans-serif" letterSpacing="1.2" fontWeight="600">
            {t.outOf100}
          </text>
          
          {/* Spaced localized Risk Category label */}
          <text x={cx} y={cy + 34} textAnchor="middle" fontSize="11" fontWeight="800" fill={riskColor} fontFamily="Space Grotesk, sans-serif" letterSpacing="0.8">
            {riskLabel.toUpperCase()} {t.risk.toUpperCase()}
          </text>
        </svg>
      </div>

      {/* Localized Farmer-Friendly Advisory Message below the dial */}
      <div style={{ marginTop: 8, padding: "0 10px", fontSize: 13, fontWeight: 600, color: "#3B4E41", textAlign: "center", lineHeight: 1.4, fontFamily: "Inter, sans-serif" }}>
        {advisoryText}
      </div>
    </div>
  );
}
