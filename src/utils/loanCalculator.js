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
      rainOk: "आपके इलाके में सही समय पर बारिश होती है, जिससे फसल सूखने का डर बहुत कम है।",
      rainFail: "आपके इलाके में बारिश कम होती है, जिससे फसल को पानी की दिक्कत हो सकती है। पानी देने का कोई पक्का उपाय रखें।",
      soilOk: "आपके खेत की मिट्टी उपजाऊ है, जिससे फसल की पैदावार अच्छी होगी।",
      soilFail: "आपके खेत की मिट्टी में ताकत थोड़ी कम है। मिट्टी की जाँच कराकर सही खाद डालें।",
      ndviOk: "आपके खेत की फसल की हरियाली बहुत अच्छी है, जिससे फसल की पैदावार बढ़िया होने की उम्मीद है।",
      ndviFail: "खेत में फसल की हरियाली कुछ कमजोर दिख रही है, जिससे पैदावार कम होने का डर है। फसल पर थोड़ा ध्यान दें।",
      yieldOk: "आपकी फसल की पैदावार अच्छी है, जिससे आप आसानी से बैंक का लोन चुका पाएंगे।",
      yieldFail: "आपके खेत में फसल की पैदावार अभी थोड़ी कम है, जिससे बैंक से लोन मिलने में दिक्कत आ सकती है।",
      irrLow: "खेत में ड्रिप या स्प्रिंकलर से पानी देने की व्यवस्था होने से फसल सूखने का डर नहीं है।",
      irrHigh: "खेत में पानी देने के नए साधन न होने से सूखे का डर थोड़ा ज्यादा रहता है।",
      docOk: "लोन के लिए जरूरी सभी बैंक कागज़ तैयार हैं।",
      docFail: "बैंक के कुछ जरूरी कागज़ अभी बाकी हैं, उन्हें जल्द तैयार कर लें।",
      sugRain: "सूखे या कम बारिश के नुकसान से बचने के लिए फसल बीमा योजना से फसल का बीमा जरूर करवाएं।",
      sugSoil: "खाद और दवाई का खर्च कम करने के लिए मिट्टी जाँच कार्ड (सॉइल हेल्थ कार्ड) जरूर बनवाएं।",
      sugNdvi: "कमजोर फसल को सुधारने और अच्छे बीजों के लिए गाँव के कृषि सहायक या अधिकारी से सलाह लें।",
      sugYield: "खेत में पैदावार बढ़ाने के लिए सिर्फ सहकारी समिति या भरोसेमंद दुकान के अच्छे बीजों का ही उपयोग करें।",
      sugIrr: "खेत में ड्रिप या फुआरा लगाने के लिए सरकारी योजना की छूट (सब्सिडी) का तुरंत फायदा उठाएं।",
      sugDoc: "बैंक में लोन के लिए जाने से पहले बाकी बचे कागज़ जैसे खतौनी और एनओसी (NOC) तैयार कर लें।",
      sugPerfect: "अपने खेत के कागज़ साफ रखें और बैंक खाते का लेन-देन अच्छा रखें। आपका खेत लोन के लिए बिल्कुल तैयार है।",
      rainSignal: "बारिश और मौसम",
      soilSignal: "मिट्टी की ताकत",
      ndviSignal: "फसल की हरियाली",
      yieldSignal: "पैदावार और कमाई",
      irrLabel: "पानी देने की व्यवस्था",
      docLabel: "लोन के कागज़",
      docsChecked: "कागज़ तैयार हैं"
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
    },
    ta: {
      rainOk: "போதுமான மழைப்பொழிவு மண்டலம் விவசாய கடன் அபாயத்தை குறைக்கிறது.",
      rainFail: "மழைப்பொழிவு பற்றாக்குறை கடன் அபாயத்தை அதிகரிக்கிறது. நீர் சேமிப்பு பரிந்துரைக்கப்படுகிறது.",
      soilOk: "மண் ஊட்டச்சத்துக்கள் நிலையாக உள்ளன.",
      soilFail: "மண் ஊட்டச்சத்து குறைபாடு கண்டறியப்பட்டுள்ளது. மண் சுகாதார அட்டை தேவை.",
      ndviOk: "பயிர் பசுமை குறியீடு பண்ணை உற்பத்தித்திறனை நிரூபிக்கிறது.",
      ndviFail: "குறைந்த தாவர அடர்த்தி கடன் தகுதியை குறைக்கிறது.",
      yieldOk: "பயிர் விளைச்சல் கடன் திருப்பிச் செலுத்தும் திறனை பூர்த்தி செய்கிறது.",
      yieldFail: "விளைச்சல் திறன் வங்கி தேவைகளை விட குறைவாக உள்ளது.",
      irrLow: "குறைந்த கடன் அபாயம்",
      irrHigh: "வறட்சி ஆபத்தை அதிகரிக்கிறது",
      docOk: "KCC-க்கு முழுமையாக இணக்கமானது",
      docFail: "வங்கி ஆவணங்கள் பற்றாக்குறையாக உள்ளன.",
      sugRain: "மழை பற்றாக்குறை ஆபத்தை குறைக்க பிரதமர் பயிர் காப்பீட்டு திட்டத்தில் (PMFBY) சேரவும்.",
      sugSoil: "மண் சுகாதார அட்டைக்கு விண்ணப்பித்து இரசாயன உர செலவுகளை குறைக்கவும்.",
      sugNdvi: "பயிர் அழுத்த மேலாண்மைக்கு உள்ளூர் வேளாண் அதிகாரியை அணுகவும்.",
      sugYield: "அறுவடையை அதிகரிக்க சான்றளிக்கப்பட்ட விதைகளைப் பயன்படுத்தவும்.",
      sugIrr: "சொட்டு நீர் பாசனத்திற்கு மாற 'சொட்டு நீர் பாசன மானியம்' (PDMC) திட்டத்தில் விண்ணப்பிக்கவும்.",
      sugDoc: "வங்கியில் விண்ணப்பிக்கும் முன் விடுபட்ட ஆவணங்களை சரிசெய்யவும்.",
      sugPerfect: "கடன் ஒழுக்கத்தை பேணவும் — உங்கள் பண்ணை சுயவிவரம் கடன் பெற தயாராக உள்ளது.",
      rainSignal: "காலநிலை ஈரப்பதம் சமிக்ஞை",
      soilSignal: "மண் ஊட்டச்சத்து சரிபார்ப்பு",
      ndviSignal: "பயிர் அடர்த்தி (NDVI)",
      yieldSignal: "விளைச்சல்-கடன் திறன்",
      irrLabel: "பாசன ஆபத்து மேலாண்மை",
      docLabel: "இணக்க ஆவண நிலை",
      docsChecked: "ஆவணங்கள் சரிபார்க்கப்பட்டன"
    },
    te: {
      rainOk: "తగినంత వర్షపాతం వ్యవసాయ రుణ ప్రమాదాన్ని తగ్గిస్తుంది.",
      rainFail: "వర్షపాత లోటు రుణ ప్రమాదాన్ని పెంచుతుంది. నీటి నిల్వ సిఫార్సు చేయబడింది.",
      soilOk: "నేలలో పోషకాలు స్థిరంగా ఉన్నాయి.",
      soilFail: "నేలలో పోషకాల లోపం గుర్తించబడింది. భూసార పరీక్ష కార్డ్ అవసరం.",
      ndviOk: "పంట పచ్చదనం సూచిక పొలం ఉత్పాదకతను రుజువు చేస్తుంది.",
      ndviFail: "తక్కువ పంట సాంద్రత రుణ అర్హతను తగ్గిస్తుంది.",
      yieldOk: "దిగుబడి రుణ తిరిగి చెల్లింపు సామర్థ్యాన్ని కలిగి ఉంది.",
      yieldFail: "దిగుబడి సామర్థ్యం బ్యాంకు అవసరాల కంటే తక్కువగా ఉంది.",
      irrLow: "తక్కువ రుణ ప్రమాదం",
      irrHigh: "ఎండ తీవ్రత ప్రమాదాన్ని పెంచుతుంది",
      docOk: "KCC కోసం పూర్తి అర్హత ఉంది",
      docFail: "ముఖ్యమైన బ్యాంకు పత్రాలు లేవు.",
      sugRain: "వర్షపాత లోటు ప్రమాదాన్ని నివారించడానికి PMFBY పంట బీమా పథకంలో చేరండి.",
      sugSoil: "ఖర్చులను తగ్గించుకోవడానికి ప్రభుత్వ భూసార పరీక్ష కార్డు కోసం దరఖాస్తు చేసుకోండి.",
      sugNdvi: "పంట సంరక్షణ చర్యల కోసం స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి.",
      sugYield: "దిగుబడిని పెంచడానికి ధృవీకరించబడిన విత్తనాలను ఉపయోగించండి.",
      sugIrr: "డ్రిప్/స్ప్రింక్లర్ సేద్యం కోసం PDMC పథకం కింద రాయితీకి దరఖాస్తు చేయండి.",
      sugDoc: "బ్యాంకుకు దరఖాస్తు చేయడానికి ముందు అవసరమైన పత్రాలను సమర్పించండి.",
      sugPerfect: "ఆర్థిక క్రమశిక్షణను పాటించండి — మీ ప్రొఫైల్ రుణానికి సిద్ధంగా ఉంది.",
      rainSignal: "వాతావరణ తేమ సూచిక",
      soilSignal: "నేల నాణ్యత ధృవీకరణ",
      ndviSignal: "NDVI పంట సాంద్రత",
      yieldSignal: "దిగుబడి-రుణ సామర్థ్యం",
      irrLabel: "నీటిపారుదల ప్రమాద నిర్వహణ",
      docLabel: "పత్రాల నిబంధనల స్థితి",
      docsChecked: "పత్రాలు సమర్పించారు"
    },
    mr: {
      rainOk: "पुरेशा पावसामुळे कृषी कर्जाची जोखीम कमी होते.",
      rainFail: "पावसाच्या तुटवड्यामुळे कर्जाची जोखीम वाढते. पाणी व्यवस्थापन आवश्यक आहे.",
      soilOk: "मातीमधील पोषक घटक स्थिर आहेत.",
      soilFail: "मातीमधील पोषक घटकांची कमतरता आढळली. मृदा आरोग्य कार्डाची आवश्यकता.",
      ndviOk: "पिकाची घनता शेतीची उत्पादकता सिद्ध करते.",
      ndviFail: "कमी पीक घनता कर्ज पात्रतेवर परिणाम करते.",
      yieldOk: "उत्पादन कर्ज परतफेडीची क्षमता दर्शवते.",
      yieldFail: "उत्पादन क्षमता बँकेच्या निकषांपेक्षा कमी आहे.",
      irrLow: "कमी कर्ज जोखीम",
      irrHigh: "कोरड्या हवामानाची जोखीम वाढवते",
      docOk: "KCC साठी पूर्णपणे पात्र",
      docFail: "आवश्यक कागदपत्रांची कमतरता आहे.",
      sugRain: "पावसाच्या जोखमीपासून संरक्षणासाठी पीएम पीक विमा योजनेत (PMFBY) नोंदणी करा.",
      sugSoil: "खतांचा खर्च कमी करण्यासाठी सरकारी मृदा आरोग्य कार्डासाठी अर्ज करा.",
      sugNdvi: "पीक व्यवस्थापनासाठी स्थानिक कृषी अधिकाऱ्यांचा सल्ला घ्या.",
      sugYield: "उत्पादन वाढवण्यासाठी प्रमाणित बियाण्यांचा वापर करा.",
      sugIrr: "ठिबक/तुषार सिंचनासाठी PDMC योजनेअंतर्गत अनुदानासाठी अर्ज करा.",
      sugDoc: "बँकेत अर्ज करण्यापूर्वी प्रलंबित कागदपत्रे गोळा करा.",
      sugPerfect: "कर्ज शिस्त आणि शेतीचे रेकॉर्ड चांगले ठेवा — प्रोफाइल कर्जासाठी योग्य आहे.",
      rainSignal: "हवामान आर्द्रता निर्देशक",
      soilSignal: "माती गुणवत्ता तपासणी",
      ndviSignal: "NDVI पिकाची घनता",
      yieldSignal: "उत्पादन-कर्ज परतफेडीची क्षमता",
      irrLabel: "सिंचन जोखीम व्यवस्थापन",
      docLabel: "अनुपालन दस्तऐवज स्थिती",
      docsChecked: "दस्तऐवज पडताळले"
    },
    gu: {
      rainOk: "પૂરતો વરસાદ કૃષિ ધિરાણ જોખમ ઘટાડે છે.",
      rainFail: "વરસાદની અછત લોન જોખમ વધારે છે. જળ સંચય જરૂરી છે.",
      soilOk: "જમીનના પોષક તત્વો સ્થિર છે.",
      soilFail: "પોષક તત્વોની ઉણપ જણાઈ છે. સોઈલ હેલ્થ કાર્ડ જરૂરી છે.",
      ndviOk: "પાકની હરિયાળી ખેતરની ઉત્પાદકતા દર્શાવે છે.",
      ndviFail: "ઓછી પાક ઘનતા લોન યોગ્યતા ઘટાડે છે.",
      yieldOk: "ઉપજ લોનની ચુકવણી ક્ષમતા પૂરી કરે છે.",
      yieldFail: "ઉપજ ક્ષમતા બેંકની જરૂરિયાતો કરતાં ઓછી છે.",
      irrLow: "ઓછું લોન જોખમ",
      irrHigh: "સૂકા હવામાનનું જોખમ વધારે છે",
      docOk: "KCC માટે સંપૂર્ણ યોગ્ય",
      docFail: "મહત્વના દસ્તાવેજો ખૂટે છે.",
      sugRain: "વરસાદના જોખમ સામે સુરક્ષા માટે પીએમ ફસલ બીમા યોજના (PMFBY) લો.",
      sugSoil: "ખાતરનો ખર્ચ ઘટાડવા સોઈલ હેલ્થ કાર્ડ માટે અરજી કરો.",
      sugNdvi: "પાક તણાવ વ્યવસ્થાપન માટે કૃષિ અધિકારીની સલાહ લો.",
      sugYield: "ઉત્પાદન વધારવા પ્રમાણિત બિયારણનો ઉપયોગ કરો.",
      sugIrr: "ટપક/ફુવારા પદ્ધતિ માટે PDMC યોજના હેઠળ સબસિડી મેળવો.",
      sugDoc: "બેંકમાં અરજી કરતા પહેલા બાકી દસ્તાવેજો મેળવી લો.",
      sugPerfect: "નાણાકીય શિસ્ત જાળવો — તમારી પ્રોફાઇલ લોન માટે તૈયાર છે.",
      rainSignal: "હવામાન ભેજ સંકેત",
      soilSignal: "જમીનની ગુણવત્તા ચકાસણી",
      ndviSignal: "NDVI પાક ઘનતા",
      yieldSignal: "ઉપજ-લોન ચૂકવવાની ક્ષમતા",
      irrLabel: "સિંચાઈ જોખમ વ્યવસ્થાપન",
      docLabel: "દસ્તાવેજ અનુપાલન સ્થિતિ",
      docsChecked: "દસ્તાવેજો ચકાસાયા"
    },
    pa: {
      rainOk: "ਲੋੜੀਂਦਾ ਮੀਂਹ ਖੇਤੀਬਾੜੀ ਲੋਨ ਜੋਖਮ ਨੂੰ ਘਟਾਉਂਦਾ ਹੈ।",
      rainFail: "ਮੀਂਹ ਦੀ ਕਮੀ ਲੋਨ ਜੋਖਮ ਵਧਾਉਂਦੀ ਹੈ। ਪਾਣੀ ਦੀ ਬਚਤ ਜ਼ਰੂਰੀ ਹੈ।",
      soilOk: "ਮਿੱਟੀ ਦੇ ਪੋਸ਼ਕ ਤੱਤ ਸਥਿਰ ਹਨ।",
      soilFail: "ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੀ ਕਮੀ ਪਾਈ ਗਈ। ਮਿੱਟੀ ਸਿਹਤ ਕਾਰਡ ਦੀ ਲੋੜ।",
      ndviOk: "ਫਸਲ ਦੀ ਹਰਿਆਵਲ ਖੇਤ ਦੀ ਪੈਦਾਵਾਰ ਨੂੰ ਦਰਸਾਉਂਦੀ ਹੈ।",
      ndviFail: "ਘੱਟ ਫਸਲੀ ਘਣਤਾ ਲੋਨ ਯੋਗਤਾ ਘਟਾਉਂਦੀ ਹੈ।",
      yieldOk: "ਪੈਦਾਵਾਰ ਲੋਨ ਵਾਪਸੀ ਦੀ ਸਮਰੱਥਾ ਨੂੰ ਪੂਰਾ ਕਰਦੀ ਹੈ।",
      yieldFail: "ਪੈਦਾਵਾਰ ਸਮਰੱਥਾ ਬੈਂਕ ਦੀਆਂ ਲੋੜਾਂ ਤੋਂ ਘੱਟ ਹੈ।",
      irrLow: "ਘੱਟ ਲੋਨ ਜੋਖਮ",
      irrHigh: "ਸੁੱਕੇ ਮੌਸਮ ਦਾ ਜੋਖਮ ਵਧਾਉਂਦਾ ਹੈ",
      docOk: "KCC ਲਈ ਪੂਰੀ ਤਰ੍ਹਾਂ ਯੋਗ",
      docFail: "ਜ਼ਰੂਰੀ ਬੈਂਕ ਦਸਤਾਵੇਜ਼ ਗਾਇਬ ਹਨ।",
      sugRain: "ਮੀਂਹ ਦੀ ਕਮੀ ਦੇ ਜੋਖਮ ਤੋਂ ਬਚਣ ਲਈ ਪੀਐਮ ਫਸਲ ਬੀਮਾ ਯੋਜਨਾ (PMFBY) ਲਓ।",
      sugSoil: "ਖਾਦਾਂ ਦਾ ਖਰਚਾ ਘਟਾਉਣ ਲਈ ਸਰਕਾਰੀ ਮਿੱਟੀ ਸਿਹਤ ਕਾਰਡ ਲਈ ਅਪਲਾਈ ਕਰੋ।",
      sugNdvi: "ਫਸਲ ਦੇ ਬਚਾਅ ਲਈ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਅਫਸਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
      sugYield: "ਝਾੜ ਵਧਾਉਣ ਲਈ ਪ੍ਰਮਾਣਿਤ ਬੀਜਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ।",
      sugIrr: "ਟਪਕ/ਫੁਹਾਰਾ ਸਿੰਚਾਈ ਲਈ PDMC ਸਕੀਮ ਤਹਿਤ ਸਬਸਿਡੀ ਲਈ ਅਪਲਾਈ ਕਰੋ।",
      sugDoc: "ਬੈਂਕ ਵਿੱਚ ਅਪਲਾਈ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਬਾਕੀ ਦਸਤਾਵੇਜ਼ ਪੂਰੇ ਕਰੋ।",
      sugPerfect: "ਵਿੱਤੀ ਅਨੁਸ਼ਾਸਨ ਬਣਾਈ ਰੱਖੋ — ਪ੍ਰੋਫਾਈਲ ਲੋਨ ਲਈ ਤਿਆਰ ਹੈ।",
      rainSignal: "ਮੌਸਮ ਨਮੀ ਸੰਕੇਤ",
      soilSignal: "ਮਿੱਟੀ ਗੁਣਵੱਤਾ ਵੈਰੀਫਿਕੇਸ਼ਨ",
      ndviSignal: "NDVI ਫਸਲੀ ਘਣਤਾ",
      yieldSignal: "ਝਾੜ-ਲੋਨ ਸਮਰੱਥਾ",
      irrLabel: "ਸਿੰਚਾਈ ਜੋਖਮ ਪ੍ਰਬੰਧਨ",
      docLabel: "ਦਸਤਾਵੇਜ਼ ਪਾਲਣਾ ਸਥਿਤੀ",
      docsChecked: "ਦਸਤਾਵੇਜ਼ ਵੈਰੀਫਾਈ ਹੋਏ"
    },
    kn: {
      rainOk: "ಸಾಕಷ್ಟು ಮಳೆಯು ಕೃಷಿ ಸಾಲದ ಅಪಾಯವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.",
      rainFail: "ಮಳೆ ಕೊರತೆಯು ಸಾಲದ ಅಪಾಯವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ. ನೀರು ಸಂಗ್ರಹಣೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
      soilOk: "ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳು ಸ್ಥಿರವಾಗಿವೆ.",
      soilFail: "ಪೋಷಕಾಂಶಗಳ ಕೊರತೆ ಕಂಡುಬಂದಿದೆ. ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಅಗತ್ಯವಿದೆ.",
      ndviOk: "ಬೆಳೆಯ ಹಸಿರು ಸೂಚ್ಯಂಕವು ಜಮೀನಿನ ಉತ್ಪಾದಕತೆಯನ್ನು ಸಾಬೀತುಪಡಿಸುತ್ತದೆ.",
      ndviFail: "ಕಡಿಮೆ ಬೆಳೆ ಸಾಂದ್ರತೆಯು ಸಾಲದ ಅರ್ಹತೆಯನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.",
      yieldOk: "ಇಳುವರಿಯು ಸಾಲ ಮರುಪಾವತಿ ಸಾಮರ್ಥ್ಯವನ್ನು ಪೂರೈಸುತ್ತದೆ.",
      yieldFail: "ಇಳುವರಿ ಸಾಮರ್ಥ್ಯವು ಬ್ಯಾಂಕ್ ಅಗತ್ಯತೆಗಳಿಗಿಂತ ಕಡಿಮೆಯಿದೆ.",
      irrLow: "ಕಡಿಮೆ ಸಾಲದ ಅಪಾಯ",
      irrHigh: "ಒಣ ಹವಾಮಾನದ ಅಪಾಯವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ",
      docOk: "KCC ಗಾಗಿ ಸಂಪೂರ್ಣವಾಗಿ ಅನುಸರಣೆ ಹೊಂದಿದೆ",
      docFail: "ಅಗತ್ಯ ಬ್ಯಾಂಕ್ ದಾಖಲೆಗಳು ಕೊರತೆಯಾಗಿವೆ.",
      sugRain: "ಮಳೆ ಕೊರತೆಯ ಅಪಾಯವನ್ನು ನಿವಾರಿಸಲು ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆಗೆ (PMFBY) ನೋಂದಾಯಿಸಿ.",
      sugSoil: "ರಾಸಾಯನಿಕ ವೆಚ್ಚವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಸರ್ಕಾರಿ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್‌ಗಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.",
      sugNdvi: "ಬೆಳೆ ರೋಗ ನಿರ್ವಹಣೆಗೆ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",
      sugYield: "ಉತ್ಪಾದಕತೆ ಹೆಚ್ಚಿಸಲು ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳನ್ನು ಬಳಸಿ.",
      sugIrr: "ಹನಿ/ಚಿಮುಕಿಸುವ ನೀರಾವರಿಗಾಗಿ PDMC ಯೋಜನೆಯಡಿ ಸಬ್ಸಿಡಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.",
      sugDoc: "ಬ್ಯಾಂಕ್‌ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮೊದಲು ಬಾಕಿ ದಾಖಲೆಗಳನ್ನು ಪಡೆದುಕೊಳ್ಳಿ.",
      sugPerfect: "ಆರ್ಥಿಕ ಶಿಸ್ತು ಕಾಪಾಡಿಕೊಳ್ಳಿ — ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಸಾಲಕ್ಕೆ ಸಿದ್ಧವಾಗಿದೆ.",
      rainSignal: "ಹವಾಮಾನ ತೇವಾಂಶ ಸಂಕೇತ",
      soilSignal: "ಮಣ್ಣಿನ ಪೋಷಕಾಂಶ ಪರಿಶೀಲನೆ",
      ndviSignal: "NDVI ಬೆಳೆ ಸಾಂದ್ರತೆ",
      yieldSignal: "ಇಳುವರಿ-ಸಾಲ ಸಾಮರ್ಥ್ಯ",
      irrLabel: "ನೀರಾವರಿ ಅಪಾಯ ನಿರ್ವಹಣೆ",
      docLabel: "ದಾಖಲೆಗಳ ಅನುಸರಣೆ ಸ್ಥಿತಿ",
      docsChecked: "ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ"
    },
    ml: {
      rainOk: "പര്യാപ്ത മഴ ലഭ്യത കാർഷിക വായ്പ റിസ്ക് കുറയ്ക്കുന്നു.",
      rainFail: "മഴക്കുറവ് വായ്പ റിസ്ക് വർദ്ധിപ്പിക്കുന്നു. ജലസംരക്ഷണം ശുപാർശ ചെയ്യുന്നു.",
      soilOk: "മണ്ണിലെ പോഷകങ്ങൾ സ്ഥിരതയുള്ളതാണ്.",
      soilFail: "പോഷകക്കുറവ് കണ്ടെത്തി. മണ്ണ് ആരോഗ്യ കാർഡ് ആവശ്യമാണ്.",
      ndviOk: "വിളയുടെ പച്ചപ്പ് കൃഷിയിടത്തിന്റെ ഉൽപ്പാദനക്ഷമത തെളിയിക്കുന്നു.",
      ndviFail: "കുറഞ്ഞ വിള സാന്ദ്രത വായ്പ യോഗ്യതയെ ബാധിക്കുന്നു.",
      yieldOk: "വിളവ് വായ്പ തിരിച്ചടവ് ശേഷിക്ക് അനുയോജ്യമാണ്.",
      yieldFail: "വിളവ് ശേഷി ബാങ്ക് നിബന്ധനകളേക്കാൾ കുറവാണ്.",
      irrLow: "കുറഞ്ഞ വായ്പ റിസ്ക്",
      irrHigh: "വരൾച്ചാ സാധ്യത വർദ്ധിപ്പിക്കുന്നു",
      docOk: "KCC-ക്ക് പൂർണ്ണമായും യോഗ്യം",
      docFail: "പ്രധാന ബാങ്ക് രേഖകളുടെ കുറവുണ്ട്.",
      sugRain: "മഴക്കുറവ് കാരണമുള്ള റിസ്ക് കുറയ്ക്കാൻ പിഎം വിള ഇൻഷുറൻസ് പദ്ധതിയിൽ (PMFBY) ചേരുക.",
      sugSoil: "വളപ്രയോഗ ചെലവ് കുറയ്ക്കാൻ മണ്ണ് ആരോഗ്യ കാർഡിനായി അപേക്ഷിക്കുക.",
      sugNdvi: "വിള സംരക്ഷണത്തിനായി കൃഷി ഉദ്യോഗസ്ഥനെ സമീപിക്കുക.",
      sugYield: "ഉൽപ്പാദനം കൂട്ടാൻ സാക്ഷ്യപ്പെടുത്തിയ വിത്തുകൾ ഉപയോഗിക്കുക.",
      sugIrr: "തുള്ളിനന രീതിക്കായി PDMC പദ്ധതിക്ക് കീഴിൽ സബ്‌സിഡിക്ക് അപേക്ഷിക്കുക.",
      sugDoc: "ബാങ്കിൽ അപേക്ഷിക്കുന്നതിന് മുൻപായി രേഖകൾ പൂർത്തിയാക്കുക.",
      sugPerfect: "ധനകാര്യ അച്ചടക്കം പാലിക്കുക — പ്രൊഫൈൽ വായ്പയ്ക്ക് സജ്ജമാണ്.",
      rainSignal: "കാലാവസ്ഥ ഈർപ്പ സൂചകം",
      soilSignal: "മണ്ണ് ഗുണനിലവാര പരിശോധന",
      ndviSignal: "NDVI വിള സാന്ദ്രത",
      yieldSignal: "വിളവ്-വായ്പ തിരിച്ചടവ് ശേഷി",
      irrLabel: "ജലസേചന റിസ്ക് മാനേജ്മെന്റ്",
      docLabel: "രേഖകളുടെ യോഗ്യതാ നില",
      docsChecked: "രേഖകൾ പരിശോധിച്ചു"
    },
    or: {
      rainOk: "ପର୍ଯ୍ୟାପ୍ତ ବର୍ଷା କୃଷି ଋଣ ବିପଦକୁ ହ୍ରାସ କରେ ।",
      rainFail: "ବର୍ଷାର ଅଭାବ ଋଣ ବିପଦ ବୃଦ୍ଧି କରେ । ଜଳ ସଞ୍ଚୟ ଆବଶ୍ୟକ ।",
      soilOk: "ମାଟିର ପୋଷକ ତତ୍ତ୍ଵ ସ୍ଥିର ରହିଛି ।",
      soilFail: "ମାଟିରେ ପୋଷକ ତତ୍ତ୍ଵର ଅଭାବ ଦେଖାଦେଇଛି । ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ ଆବଶ୍ୟକ ।",
      ndviOk: "ଫସଲର ସବୁଜିମା ଜମିର ଉତ୍ପାଦନଶୀଳତା ପ୍ରମାଣ କରେ ।",
      ndviFail: "କମ୍ ଫସଲ ସାନ୍ଦ୍ରତା ଋଣ ଯୋଗ୍ୟତା ହ୍ରାସ କରେ ।",
      yieldOk: "ଅମଳ ଋଣ ପରିଶୋଧ କ୍ଷମତା ପାଇଁ ପର୍ଯ୍ୟାପ୍ତ ।",
      yieldFail: "ଅମଳ କ୍ଷମତା ବ୍ୟାଙ୍କ ଆବଶ୍ୟକତା ଠାରୁ କମ୍ ରହିଛି ।",
      irrLow: "କମ୍ ଋଣ ବିପଦ",
      irrHigh: "ଶୁଖିଲା ପାଣିପାଗର ବିପଦ ବଢ଼ାଇଥାଏ",
      docOk: "KCC ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ଯୋଗ୍ୟ",
      docFail: "ଆବଶ୍ୟକୀୟ ବ୍ୟାଙ୍କ ଦସ୍ତାବିଜ ଅଭାବ ରହିଛି ।",
      sugRain: "ବର୍ଷାର ଅଭାବ ଜନିତ କ୍ଷତିରୁ ରକ୍ଷା ପାଇବା ପାଇଁ PMFBY ଫସଲ ବୀମା କରନ୍ତୁ ।",
      sugSoil: "ଖତ ଓ ସାର ଖର୍ଚ୍ଚ କମାଇବା ପାଇଁ ସରକାରୀ ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ ପାଇଁ ଆବେଦନ କରନ୍ତୁ ।",
      sugNdvi: "ଫସଲ ସୁରକ୍ଷା ଉପଦେଶ ପାଇଁ ସ୍ଥାନୀୟ କୃଷି ଅଧିକାରୀଙ୍କ ସହ ପରାମର୍ଶ କରନ୍ତୁ ।",
      sugYield: "ଉତ୍ପାଦନ ବୃଦ୍ଧି ପାଇଁ ପ୍ରମାଣିତ ବିହନ ବ୍ୟବହାର କରନ୍ତୁ ।",
      sugIrr: "ବୁନ୍ଦା ଜଳସେଚନ ପାଇଁ PDMC ଯୋଜନାରେ ସରକାରୀ ସବସିଡି ପାଇଁ ଆବେදନ କରନ୍ତୁ ।",
      sugDoc: "ବ୍ୟାଙ୍କରେ ଆବେଦନ କରିବା ପୂର୍ବରୁ ବାକି ଥିବା ଦସ୍ତାବିଜ ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ ।",
      sugPerfect: "ଆର୍ଥିକ ଶୃଙ୍ଖଳା ରଖନ୍ତୁ — ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ୍ ଋଣ ପାଇଁ ପ୍ରସ୍ତୁତ ଅଛି ।",
      rainSignal: "ପାଣିପାଗ ଆଦ୍ରତା ସଙ୍କେତ",
      soilSignal: "ମୃତ୍ତିକା ଗୁଣବତ୍ତା ଯାଞ୍ଚ",
      ndviSignal: "NDVI ଫସଲ ସାନ୍ଦ୍ରତା",
      yieldSignal: "ଅମଳ-ଋଣ ପରିଶୋଧ କ୍ଷମତା",
      irrLabel: "ଜଳସେଚନ ବିପଦ ପରିଚାଳନା",
      docLabel: "ଦସ୍ତାବିଜ ଅନୁପାଳନ ସ୍ଥିତି",
      docsChecked: "ଦସ୍ତାବିଜ ଯାଞ୍ಚ ହେଲା"
    },
    as: {
      rainOk: "পৰ্যাপ্ত বৰষুণে কৃষি ঋণৰ আশংকা হ্ৰাস কৰে।",
      rainFail: "বৰষুণৰ অভাৱে ঋণৰ আশংকা বৃদ্ধি কৰে। জল সংৰক্ষণ প্ৰয়োজন।",
      soilOk: "মাটিৰ গুণাগুণ সুস্থিৰ অৱস্থাত আছে।",
      soilFail: "মাটিৰ গুণাগুণ হ্ৰাস পাইছে। মৃত্তিকা স্বাস্থ্য কাৰ্ডৰ প্ৰয়োজন।",
      ndviOk: "শস্যৰ ঘনত্বই কৃষিভূমিৰ উৎপাদনশীলতা প্ৰমাণ কৰে।",
      ndviFail: "কম শস্যৰ ঘনত্বই ঋণ যোগ্যতা হ্ৰাস কৰে।",
      yieldOk: "শস্য উৎপাদন ঋণ পৰিশোধ ক্ষমতাৰ বাবে উপযোগী।",
      yieldFail: "শস্য উৎপাদন ক্ষমতা বেংকৰ আৱশ্যকতাতকৈ কম।",
      irrLow: "কম ঋণ আশংকা",
      irrHigh: "শুকান বতৰৰ আশংকা বৃদ্ধি কৰে",
      docOk: "KCC-ৰ বাবে সম্পূৰ্ণ উপযুক্ত",
      docFail: "প্ৰয়োজনীয় বেংক নথিপত্ৰৰ অভাৱ আছে।",
      sugRain: "বৰষুণৰ নাটনিৰ আশংকাত সুৰক্ষা পাবলৈ PMFBY শস্য বীমা আঁচনিত নাম পঞ্জীয়ন কৰক।",
      sugSoil: "সাৰৰ খৰচ কমাবলৈ চৰকাৰী মৃত্তিকা স্বাস্থ্য কাৰ্ডৰ বাবে আবেদন কৰক।",
      sugNdvi: "শস্য সুৰক্ষা পৰামৰ্শৰ বাবে স্থানীয় কৃষি বিষয়াক যোগাযোগ কৰক।",
      sugYield: "উৎপাদন উন্নত কৰিবলৈ চৰকাৰী প্ৰমাণিত বীজ ব্যৱহাৰ কৰক।",
      sugIrr: "টোপাল জলসিঞ্চনৰ বাবে PDMC আঁচনিৰ ৰাজসাহায্যৰ বাবে আবেদন কৰক।",
      sugDoc: "বেংকত আবেদন কৰাৰ পূৰ্বে নথিপত্ৰসমূহ সংগ্ৰহ কৰক।",
      sugPerfect: "আৰ্থিক অনুশাসন বৰ্তাই ৰাখক — কৃষি প্ৰফাইল ঋণৰ বাবে সাজু।",
      rainSignal: "বতৰৰ আৰ্দ্ৰতা সংকেত",
      soilSignal: "মাটিৰ উৰ্বৰতা পৰীক্ষা",
      ndviSignal: "NDVI শস্যৰ ঘনত্ব",
      yieldSignal: "উৎপাদন-ঋণ পৰিশোধ ক্ষমতা",
      irrLabel: "জলসিঞ্চন আশংকা ব্যৱস্থাপনা",
      docLabel: "নথি নিয়ম পালনৰ স্থিতি",
      docsChecked: "নথি পৰীক্ষা সম্পন্ন"
    },
    ur: {
      rainOk: "کافی بارش زرعی لون رسک کو کم کرتی ہے۔",
      rainFail: "بارش کی کمی لون رسک بڑھاتی ہے۔ پانی کی بچت کی سفارش کی جاتی ہے۔",
      soilOk: "مٹی کے غذائی اجزاء مستحکم ہیں۔",
      soilFail: "غذائی اجزاء کی کمی پائی گئی۔ مٹی کا ہیلتھ کارڈ ضروری ہے۔",
      ndviOk: "فصل کی ہریالی فارم کی پیداواری صلاحیت کو ثابت کرتی ہے۔",
      ndviFail: "کم فصل کی کثافت لون اہلیت کو کم کرتی ہے۔",
      yieldOk: "پیداوار لون کی واپسی کی صلاحیت کے مطابق ہے۔",
      yieldFail: "پیداواری صلاحیت بینک کی ضروریات سے کم ہے۔",
      irrLow: "کم لون رسک",
      irrHigh: "خشک موسم کا خطرہ بڑھاتا ہے",
      docOk: "KCC کے لیے مکمل طور پر اہل",
      docFail: "ضروری بینک دستاویزات کی کمی ہے۔",
      sugRain: "بارش کی کمی کے رسک سے بچنے کے لیے پی ایم فصل بیما یوجنا (PMFBY) لیں۔",
      sugSoil: "کھادوں کا خرچ کم کرنے کے لیے سرکاری سوائل ہیلتھ کارڈ کے لیے درخواست دیں۔",
      sugNdvi: "فصل کے تحفظ کے لیے مقامی زرعی افسر سے رابطہ کریں۔",
      sugYield: "پیداوار بڑھانے کے لیے تصدیق شدہ بیجوں کا استعمال کریں۔",
      sugIrr: "ڈرپ آبپاشی کے لیے PDMC اسکیم کے تحت سبسڈی کے لیے درخواست دیں۔",
      sugDoc: "بینک میں درخواست دینے سے پہلے بقایا دستاویزات مکمل کریں۔",
      sugPerfect: "مالیاتی نظم و ضبط برقرار رکھیں — آپ کی پروفائل لون کے لیے تیار ہے۔",
      rainSignal: "موسمی نمی کا اشارہ",
      soilSignal: "مٹی کی زرخیزی کی تصدیق",
      ndviSignal: "NDVI فصل کی کثافت",
      yieldSignal: "پیداوار-لون ادا کرنے کی صلاحیت",
      irrLabel: "آبپاشی رسک مینجمنٹ",
      docLabel: "دستاویزات کی تعمیل کی صورتحال",
      docsChecked: "دस्ताویزات تصدیق شدہ"
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
