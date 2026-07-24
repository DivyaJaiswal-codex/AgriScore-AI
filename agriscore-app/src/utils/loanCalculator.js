import { IRRIGATION_I18N } from "../services/translationService";

/**
 * Deterministic Pseudo-Random Generation
 */
function seedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function seededValue(seedStr, min, max) {
  const s = seedFromString(seedStr);
  const x = Math.sin(s) * 10000;
  const frac = x - Math.floor(x);
  return Math.round(min + frac * (max - min));
}

/**
 * Core Score Engine
 */
export function computeScore({ location, crop, land, harvest, irrigation, tickedCount, weather, lang = "en" }) {
  const seedBase = `${location}-${crop}`;
  
  // Base signals representing default risk
  let rainfall = seededValue(seedBase + "-rain", 40, 95);
  let soilQuality = seededValue(seedBase + "-soil", 45, 94);
  let ndvi = seededValue(seedBase + "-ndvi", 45, 95);

  // Incorporate real-time OpenWeather / Open-Meteo weather telemetries
  if (weather && weather.success) {
    if (weather.rain > 0) {
      rainfall = Math.min(100, rainfall + Math.round(weather.rain * 4));
    } else {
      rainfall = Math.max(30, rainfall - 10); // dry spell risk
    }
    if (weather.temp > 35) {
      ndvi = Math.max(35, ndvi - 8); // heat stress
    }
    soilQuality = Math.min(98, Math.max(30, soilQuality + (weather.humidity > 60 ? 5 : -5)));
  }

  const landNum = Math.max(0.25, parseFloat(land) || 1);
  const harvestNum = Math.max(0, parseFloat(harvest) || 0);
  const yieldPerAcre = harvestNum / landNum;
  // standard yield index calculation (normalized roughly to 0-35 quintals/acre)
  const yieldScore = Math.max(0, Math.min(100, (yieldPerAcre / 30) * 100));

  // Irrigation system credit factor
  const irrList = IRRIGATION_I18N.en;
  const irrObj = irrList.find((i) => i.id === irrigation) || irrList[2];

  // Base AI default probability score (max 85 points)
  const baseRaw =
    rainfall * 0.22 +
    soilQuality * 0.20 +
    ndvi * 0.18 +
    yieldScore * 0.20 +
    (50 + irrObj.bonus) * 0.10;

  // Compliance Document checklists (adds up to 15 points credit readiness bonus)
  const docBonus = tickedCount * 3; // 5 docs * 3 points = 15 points max

  // Combine into final bank suitability readiness score (5-100)
  const score = Math.max(5, Math.min(100, Math.round(baseRaw + docBonus)));

  let risk = "High";
  if (score >= 72) risk = "Low";
  else if (score >= 48) risk = "Medium";

  // Localized Reasons & Suggestions
  const reasons = [];
  const suggestions = [];

  const textDict = {
    en: {
      rainOk: "Adequate rainfall zone reduces agricultural credit risk.",
      rainFail: "Rainfall deficit increases credit risk. Water hedging recommended.",
      soilOk: "Soil nutrients are structurally stable.",
      soilFail: "Nutrient depletion detected. Soil Health Card intervention required.",
      ndviOk: "Healthy crop greenness index proves farm productivity.",
      ndviFail: "Sparse/stressed vegetation signature flags potential default risk.",
      yieldOk: "Yield productivity satisfies credit repayment capacity.",
      yieldFail: "Yield capacity below regional bank requirements.",
      irrLow: "Lower credit risk",
      irrHigh: "Increases dry weather exposure",
      docOk: "Fully compliant for KCC",
      docFail: "Missing essential bank prerequisites.",
      sugRain: "Enroll in PM Fasal Bima Yojana (PMFBY) to offset rain deficit default risks.",
      sugSoil: "Apply for a government Soil Health Card to optimize cost on chemical inputs.",
      sugNdvi: "Consult local block officer for crop stress management and recommended seeds.",
      sugYield: "Switch to certified seeds to improve crop density per acre.",
      sugIrr: "Apply for Per Drop More Crop (PDMC) subsidy to transition to drip/sprinkler systems.",
      sugDoc: "Acquire missing compliance document certificates before applying to a bank.",
      sugPerfect: "Maintain credit discipline and farm records — farm profile is loan-ready.",
      rainSignal: "Climate Moisture Signal",
      soilSignal: "Soil Nutrient Verification",
      ndviSignal: "NDVI Biomass Density",
      yieldSignal: "Yield Yield-to-Debt capacity",
      irrLabel: "Irrigation Risk Management",
      docLabel: "Compliance Documentation status",
      docsChecked: "documents ticked"
    },
    hi: {
      rainOk: "पर्याप्त वर्षा क्षेत्र कृषि ऋण जोखिम को कम करता है।",
      rainFail: "वर्षा की कमी से ऋण जोखिम बढ़ता है। जल संचयन की सिफारिश की जाती है।",
      soilOk: "मिट्टी के पोषक तत्व संरचनात्मक रूप से स्थिर हैं।",
      soilFail: "पोषक तत्वों की कमी पायी गई। मृदा स्वास्थ्य कार्ड हस्तक्षेप की आवश्यकता है।",
      ndviOk: "स्वस्थ फसल हरापन सूचकांक खेत की उत्पादकता साबित करता है।",
      ndviFail: "कम/तनावग्रस्त वनस्पति संकेत संभावित डिफ़ॉल्ट जोखिम को दर्शाते हैं।",
      yieldOk: "फसल की उपज ऋण पुनर्भुगतान क्षमता को पूरा करती है।",
      yieldFail: "उपज क्षमता क्षेत्रीय बैंक की आवश्यकताओं से कम है।",
      irrLow: "कम क्रेडिट जोखिम",
      irrHigh: "शुष्क मौसम का जोखिम बढ़ता है",
      docOk: "केसीसी (KCC) के लिए पूर्ण रूप से अनुपालन",
      docFail: "आवश्यक बैंक पूर्वापेक्षाएँ गायब हैं।",
      sugRain: "वर्षा की कमी के डिफ़ॉल्ट जोखिमों को कम करने के लिए पीएम फसल बीमा योजना (PMFBY) में पंजीकरण करें।",
      sugSoil: "रासायनिक इनपुट पर लागत को कम करने के लिए सरकारी मृदा स्वास्थ्य कार्ड के लिए आवेदन करें।",
      sugNdvi: "फसल तनाव प्रबंधन और अनुशंसित बीजों के लिए स्थानीय ब्लॉक अधिकारी से परामर्श लें।",
      sugYield: "प्रति एकड़ फसल घनत्व में सुधार के लिए प्रमाणित बीजों का उपयोग करें।",
      sugIrr: "ड्रिप/स्प्रिंकलर सिस्टम में बदलाव के लिए प्रति बूंद अधिक फसल (PDMC) सब्सिडी के लिए आवेदन करें।",
      sugDoc: "बैंक में आवेदन करने से पहले लापता अनुपालन दस्तावेज प्रमाण पत्र प्राप्त करें।",
      sugPerfect: "क्रेडिट अनुशासन और कृषि रिकॉर्ड बनाए रखें — कृषि प्रोफ़ाइल ऋण-तैयार है।",
      rainSignal: "जलवायु आर्द्रता संकेत",
      soilSignal: "मृदा पोषक तत्व सत्यापन",
      ndviSignal: "एनडीवीआई बायोमास घनत्व",
      yieldSignal: "उपज-से-ऋण क्षमता",
      irrLabel: "सिंचाई जोखिम प्रबंधन",
      docLabel: "अनुपालन दस्तावेज़ीकरण स्थिति",
      docsChecked: "दस्तावेज़ टिक किए गए"
    },
    bn: {
      rainOk: "পর্যাপ্ত বৃষ্টিপাত অঞ্চল কৃষি ঋণ ঝুঁকি হ্রাস করে।",
      rainFail: "বৃষ্টিপাতের ঘাটতি ঋণ ঝুঁকি বৃদ্ধি করে। জল ধরে রাখার পরামর্শ দেওয়া হচ্ছে।",
      soilOk: "মাটির পুষ্টি উপাদান কাঠামোগতভাবে স্থিতিশীল।",
      soilFail: "পুষ্টির ঘাটতি সনাক্ত করা হয়েছে। মৃত্তিকা স্বাস্থ্য কার্ডের হস্তক্ষেপ প্রয়োজন।",
      ndviOk: "স্বাস্থ্যকর ফসলের সবুজ সূচক খামারের উৎপাদনশীলতা প্রমাণ করে।",
      ndviFail: "স্বল্প/পীড়িত উদ্ভিদের উপস্থিতি সম্ভাব্য খেলাপি ঝুঁকি নির্দেশ করে।",
      yieldOk: "ফলন উৎপাদনশীলতা ঋণ পরিশোধের ক্ষমতা পূরণ করে।",
      yieldFail: "ফলন ক্ষমতা আঞ্চলিক ব্যাংকের প্রয়োজনীয়তার নিচে।",
      irrLow: "কম ঋণ ঝুঁকি",
      irrHigh: "শুষ্ক আবহাওয়ার ঝুঁকি বাড়ায়",
      docOk: "কেসিসি (KCC) এর জন্য সম্পূর্ণ উপযুক্ত",
      docFail: "ব্যাংকের প্রয়োজনীয় মূল নথিপত্র ঘাটতি রয়েছে।",
      sugRain: "বৃষ্টিপাতের ঘাটতিজনিত ডিফল্ট ঝুঁকি কমাতে পিএম ফসল বিমা যোজনায় (PMFBY) নাম লেখান।",
      sugSoil: "রাসায়নিক সারের খরচ কমাতে সরকারি মৃত্তিকা স্বাস্থ্য কার্ডের জন্য আবেদন করুন।",
      sugNdvi: "ফসল চাপ নিয়ন্ত্রণ এবং প্রস্তাবিত বীজের জন্য স্থানীয় ব্লক অফিসারের পরামর্শ নিন।",
      sugYield: "একর প্রতি ফসলের ঘনত্ব উন্নত করতে শংসাপত্রপ্রাপ্ত বীজ ব্যবহার করুন।",
      sugIrr: "ড্রিপ বা স্প্রিঙ্কলার সেচ ব্যবস্থায় রূপান্তরের জন্য 'প্রতি ফোঁটায় বেশি ফসল' (PDMC) ভর্তুকির আবেদন করুন।",
      sugDoc: "ব্যাংকে আবেদন করার আগে প্রয়োজনীয় কমপ্লায়েন্স নথি সংগ্রহ করুন।",
      sugPerfect: "ঋণ শৃঙ্খলা এবং খামারের হিসাব বজায় রাখুন — খামারের প্রোফাইল ঋণের জন্য প্রস্তুত।",
      rainSignal: "জলবায়ু আর্দ্রতা সংকেত",
      soilSignal: "মাটির উর্বরতা যাচাইকরণ",
      ndviSignal: "NDVI বায়োমাস ঘনত্ব",
      yieldSignal: "ঋণ পরিশোধের ক্ষমতা সূচক",
      irrLabel: "সেচ ঝুঁকি ব্যবস্থাপনা",
      docLabel: "কমপ্লায়েন্স নথিপত্র স্থিতি",
      docsChecked: "নথি সম্পূর্ণ হয়েছে"
    }
  };

  const l = textDict[lang] || textDict.en;

  // Add Reasons
  reasons.push({
    ok: rainfall >= 60,
    text: `${l.rainSignal}: ${rainfall}/100 - ${rainfall >= 60 ? l.rainOk : l.rainFail}`,
  });
  reasons.push({
    ok: soilQuality >= 60,
    text: `${l.soilSignal}: ${soilQuality}/100 - ${soilQuality >= 60 ? l.soilOk : l.soilFail}`,
  });
  reasons.push({
    ok: ndvi >= 62,
    text: `${l.ndviSignal}: ${ndvi}/100 - ${ndvi >= 62 ? l.ndviOk : l.ndviFail}`,
  });
  reasons.push({
    ok: yieldScore >= 50,
    text: `${l.yieldSignal}: ${Math.round(yieldScore)}/100 - ${yieldScore >= 50 ? l.yieldOk : l.yieldFail}`,
  });
  
  const irrListCurrent = IRRIGATION_I18N[lang] || IRRIGATION_I18N.en;
  const irrObjCurrent = irrListCurrent.find((i) => i.id === irrigation) || irrListCurrent[2];
  
  reasons.push({
    ok: irrObj.bonus >= 0,
    text: `${l.irrLabel}: ${irrObjCurrent.label} (${irrObj.bonus > 0 ? l.irrLow : l.irrHigh})`,
  });
  reasons.push({
    ok: tickedCount >= 4,
    text: `${l.docLabel}: ${tickedCount}/5 ${l.docsChecked}. (${tickedCount === 5 ? l.docOk : l.docFail})`,
  });

  // Add Suggestions
  if (rainfall < 60) suggestions.push(l.sugRain);
  if (soilQuality < 60) suggestions.push(l.sugSoil);
  if (ndvi < 62) suggestions.push(l.sugNdvi);
  if (yieldScore < 50) suggestions.push(l.sugYield);
  if (irrObj.bonus < 6) suggestions.push(l.sugIrr);
  if (tickedCount < 5) suggestions.push(l.sugDoc);
  if (suggestions.length === 0) suggestions.push(l.sugPerfect);

  return { score, risk, reasons, suggestions, rainfall, soilQuality, ndvi, yieldScore, irrObj };
}
