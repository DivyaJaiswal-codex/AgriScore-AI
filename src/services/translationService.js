import { en } from "./translations/en";
import { hi } from "./translations/hi";
import { bn } from "./translations/bn";
import { ta, te, mr, gu, pa, kn, ml, or, as, ur } from "./translations/indianLangs";

const rawDictionaries = { en, hi, bn, ta, te, mr, gu, pa, kn, ml, or, as, ur };

// Dynamically create proxy handlers for each dictionary to fallback to English (en) when a key is missing.
const makeFallbackDictionary = (targetDict, fallbackDict) => {
  return new Proxy(targetDict, {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      return fallbackDict[prop] || prop;
    }
  });
};

export const STRINGS = {};

Object.keys(rawDictionaries).forEach((langCode) => {
  if (langCode === "en") {
    STRINGS.en = rawDictionaries.en;
  } else {
    STRINGS[langCode] = makeFallbackDictionary(rawDictionaries[langCode], rawDictionaries.en);
  }
});

// Seed Crops list and Irrigation translations mapping for all 13 languages
export const CROPS_I18N = {
  en: ["Rice", "Wheat", "Maize", "Sugarcane", "Cotton", "Potato", "Vegetables"],
  hi: ["धान", "गेहूँ", "मक्का", "गन्ना", "कपास", "आलू", "सब्जियां"],
  bn: ["ধান", "গম", "ভুট্টা", "আখ", "তুলা", "আলু", "শাকসবজি"],
  ta: ["நெல்", "கோதுமை", "சோளம்", "கரும்பு", "பருத்தி", "உருளைக்கிழங்கு", "காய்கறிகள்"],
  te: ["వరి", "గోధుమ", "మొక్కజొన్న", "చెరకు", "పత్తి", "బంగాళాదుంప", "కూరగాయలు"],
  mr: ["भात", "गहू", "मका", "ऊस", "कापूस", "बटाटा", "भाज्या"],
  gu: ["ડાંગર", "ઘઉં", "મકાઈ", "શેરડી", "કપાસ", "બટાકા", "શાકભાજી"],
  pa: ["ਝੋਨਾ", "ਕਣਕ", "ਮੱਕੀ", "ਗੰਨਾ", "ਕਪਾਹ", "ਆਲੂ", "ਸਬਜ਼ੀਆਂ"],
  kn: ["ಭತ್ತ", "ಗೋಧಿ", "ಮೆಕ್ಕೆಜೋಳ", "ಕಬ್ಬು", "ಹತ್ತಿ", "ಆಲೂಗಡ್ಡೆ", "ತರಕಾರಿಗಳು"],
  ml: ["நெல்லு", "கோதுமை", "சோளம்", "கரும்பு", "பருத்தி", "உருளைக்கிழங்கு", "காய்கறிகள்"],
  or: ["ଧାନ", "ଗହମ", "ମକା", "ଆଖୁ", "କପା", "ଆଳୁ", "ପନିପରିବା"],
  as: ["ধান", "গম", "ভুট্টা", "আখ", "তুলা", "আলু", "শাক-পাচলি"],
  ur: ["دھان", "گیہوں", "مکہ", "گنا", "کپاس", "آلو", "سبزیاں"]
};

export const IRRIGATION_I18N = {};

// Generate IRRIGATION_I18N based on language keys to prevent heavy duplication
const irrigationBase = {
  en: { drip: "Drip irrigation", sprinkler: "Sprinkler", canal: "Canal / Tube well", rainfed: "Rain-fed only" },
  hi: { drip: "ड्रिप सिंचाई", sprinkler: "स्प्रिंकलर", canal: "नहर / ट्यूबवेल", rainfed: "केवल वर्षा पर निर्भर" },
  bn: { drip: "ড্রিপ সেচ", sprinkler: "স্প্রিঙ্কলার", canal: "খাল / নলকূপ", rainfed: "শুধুমাত্র বৃষ্টির জল" },
  ta: { drip: "சொட்டு நீர் பாசனம்", sprinkler: "தெளிப்பு நீர்", canal: "கால்வாய் / குழாய் கிணறு", rainfed: "மழை சார்ந்தது மட்டும்" },
  te: { drip: "బిందు సేద్యం", sprinkler: "స్ప్రింక్లర్", canal: "కాలువ / బోరు బావి", rainfed: "వర్షాధారం మాత్రమే" },
  mr: { drip: "ठिबक सिंचन", sprinkler: "तुषार सिंचन", canal: "कालवा / कूपनलिका", rainfed: "केवळ पावसावर अवलंबून" },
  gu: { drip: "ટપક સિંચાઈ", sprinkler: "ફુવારા પદ્ધતિ", canal: "કેનાલ / ટ્યુબવેલ", rainfed: "માત્ર વરસાદ આધારિત" },
  pa: { drip: "ਟਪਕ ਸਿੰਚਾਈ", sprinkler: "ਫੁਹਾਰਾ ਸਿੰਚਾਈ", canal: "ਨਹਿਰ / ਟਿਊਬਵੈੱਲ", rainfed: "ਸਿਰਫ ਮੀਂਹ 'ਤੇ ਨਿਰਭਰ" },
  kn: { drip: "ಹನಿ ನೀರாவರಿ", sprinkler: "ಚಿಮುಕಿಸುವ ನೀರாவರಿ", canal: "ಕಾಲುವೆ / ಕೊಳವೆ ಬಾವಿ", rainfed: "ಮಳೆ ಆಶ್ರಿತ ಮಾತ್ರ" },
  ml: { drip: "തുള്ളിനന രീതി", sprinkler: "സ്പ്രിംഗ്ലർ", canal: "കനാൽ / കുഴൽക്കിണർ", rainfed: "മഴയെ മാത്രം ആശ്രയിച്ച്" },
  or: { drip: "ଡ୍ରିପ୍ ଜଳସେಚನ", sprinkler: "ସ୍ପ୍ରିଙ୍କଲର", canal: "କେନାଲ / ନଳକୂପ", rainfed: "କେବଳ ବର୍ଷା ନିର୍ଭରଶୀଳ" },
  as: { drip: "টোপাল জলসিঞ্চন", sprinkler: "স্প্ৰিংকলাৰ", canal: "খাল / নলকূপ", rainfed: "কেৱল বৰষুণৰ ওপৰত নিৰ্ভৰশীল" },
  ur: { drip: "ڈرپ آبپاشی", sprinkler: "اسپرنکلر", canal: "نہر / ٹیوب ویل", rainfed: "صرف بارشی پانی" }
};

const irrigationBonuses = { drip: 12, sprinkler: 6, canal: 0, rainfed: -12 };

Object.keys(irrigationBase).forEach((langCode) => {
  const translations = irrigationBase[langCode];
  IRRIGATION_I18N[langCode] = Object.keys(translations).map((id) => ({
    id,
    label: translations[id],
    bonus: irrigationBonuses[id]
  }));
});

// Seed static mappings for common location strings to avoid raw English output in local reports
const LOCATION_MAP = {
  en: {
    "bathinda": "Bathinda",
    "ludhiana": "Ludhiana",
    "punjab": "Punjab",
    "bengal": "Bengal",
    "west bengal": "West Bengal",
    "patna": "Patna",
    "bihar": "Bihar"
  },
  hi: {
    "bathinda": "बठिंडा",
    "ludhiana": "लुधियाना",
    "punjab": "पंजाब",
    "bengal": "बंगाल",
    "west bengal": "पश्चिम बंगाल",
    "patna": "पटना",
    "bihar": "बिहार"
  },
  bn: {
    "bathinda": "ভাটিণ্ডা",
    "ludhiana": "লুধিয়ানা",
    "punjab": "পাঞ্জাব",
    "bengal": "বঙ্গাল",
    "west bengal": "পশ্চিমবঙ্গ",
    "patna": "পাটনা",
    "bihar": "বিহার"
  }
};

/**
 * Normalizes and localizes any crop string dynamically based on the cross-language seeds list
 */
export function getLocalizedCrop(cropVal, lang) {
  if (!cropVal) return "";
  const targetLang = lang || "en";
  let cropIdx = -1;
  const langKeys = Object.keys(CROPS_I18N);
  for (let k = 0; k < langKeys.length; k++) {
    const list = CROPS_I18N[langKeys[k]];
    const idx = list.findIndex(c => c.toLowerCase() === cropVal.toLowerCase());
    if (idx !== -1) {
      cropIdx = idx;
      break;
    }
  }
  if (cropIdx !== -1) {
    return (CROPS_I18N[targetLang] || CROPS_I18N.en)[cropIdx];
  }
  return cropVal;
}

/**
 * Transliterates/translates common inputs (like Bathinda, Punjab) into the selected language
 */
export function getLocalizedLocation(locVal, lang) {
  if (!locVal) return "";
  const targetLang = lang || "en";
  const map = LOCATION_MAP[targetLang] || LOCATION_MAP.en;
  
  let resultStr = locVal;
  Object.keys(LOCATION_MAP.en).forEach((key) => {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    if (map[key]) {
      resultStr = resultStr.replace(regex, map[key]);
    }
  });
  return resultStr;
}
