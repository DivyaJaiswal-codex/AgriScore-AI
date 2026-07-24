import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Sprout, Cloud, Droplets, TrendingUp, LogOut, User as UserIcon,
  History as HistoryIcon, LayoutDashboard, CheckCircle2, AlertTriangle,
  XCircle, ArrowRight, MapPin, Wheat, Lock, Mail, Plus,
  Volume2, Mic, FileText, Download, CheckSquare, Sparkles, Thermometer, Info, Menu, X
} from "lucide-react";

// Services & Utils
import { STRINGS, CROPS_I18N, IRRIGATION_I18N } from "./services/translationService";
import { fetchWeatherData } from "./services/weatherService";
import { speak, useSpeechInput } from "./services/voiceService";
import { downloadReport } from "./services/pdfService";
import { computeScore } from "./utils/loanCalculator";

// Components
import LoanScoreCard from "./components/LoanScoreCard";
import WeatherCard from "./components/WeatherCard";
import VoiceAssistant from "./components/VoiceAssistant";
import LoanCoach from "./components/LoanCoach";
import GovernmentSchemes from "./components/GovernmentSchemes";
import HistoryChart from "./components/HistoryChart";
import ScoreDial from "./components/ScoreDial";

// ---------- Reusable Card & Button components ----------
function Card({ children, style, className = "" }) {
  const lineCol = "#E4E0D4";
  return (
    <div
      className={className}
      style={{
        background: "#FFFFFF", borderRadius: 16, border: `1px solid ${lineCol}`,
        padding: 24, boxShadow: "0 2px 8px rgba(31,61,43,0.03)", transition: "all 0.2s ease-in-out", ...style
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, style, type = "button", disabled = false }) {
  const forest = "#1F3D2B";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#A8B8AD" : forest, color: "#fff", border: "none", borderRadius: 10,
        padding: "12px 20px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600,
        fontSize: 14.5, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex",
        alignItems: "center", justifyContent: "center", gap: 8, transition: "transform 0.1s ease, opacity 0.2s",
        boxShadow: "0 2px 4px rgba(31,61,43,0.1)", ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = 0.9; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = 1; }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

function IconButton({ onClick, title, active, children, style }) {
  const lineCol = "#E4E0D4";
  const forest = "#1F3D2B";
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 36, height: 36, borderRadius: 8, border: `1px solid ${lineCol}`,
        background: active ? "#EAF2EC" : "#fff", color: active ? forest : "#6b6b60",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s", ...style
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, icon, children }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#5c5c52", marginBottom: 6, fontFamily: "Inter, sans-serif", letterSpacing: 0.3 }}>
        {icon}{label}
      </div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: 8,
  border: "1px solid #E4E0D4", fontSize: 14.5, fontFamily: "Inter, sans-serif",
  background: "#FCFBF8", color: "#1B2B20", outline: "none", transition: "border-color 0.2s",
};

// ---------- Language Switcher (EN, HI, BN) ----------
function LanguageToggle({ lang, setLang }) {
  const forest = "#1F3D2B";
  const card = "#FFFFFF";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#F1EFE6", borderRadius: 8, padding: 3 }}>
      {[
        { code: "en", label: "EN" },
        { code: "hi", label: "हिं" },
        { code: "bn", label: "বাংলা" }
      ].map((item) => (
        <button
          key={item.code}
          onClick={() => setLang(item.code)}
          style={{
            padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer",
            fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 12.5,
            background: lang === item.code ? forest : "transparent",
            color: lang === item.code ? card : "#8a8a7c",
            boxShadow: lang === item.code ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
            transition: "all 0.2s"
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Auth Screen ----------
function AuthScreen({ onAuth, lang, setLang }) {
  const t = STRINGS[lang] || STRINGS.en;
  const forest = "#1F3D2B";
  const gold = "#D4A017";
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!email || !password || (mode === "register" && !name)) {
      setError(lang === "hi" ? "कृपया सभी फ़ील्ड भरें।" : lang === "bn" ? "দয়া করে সব ঘর পূরণ করুন।" : "Please fill all fields.");
      return;
    }
    setError("");
    onAuth({ name: name || email.split("@")[0], email });
  };

  return (
    <div style={{ minHeight: "100vh", background: forest, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: 20, position: "relative" }}>
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <LanguageToggle lang={lang} setLang={setLang} />
      </div>
      <div style={{ width: "100%", maxWidth: 390, transform: "translateY(-10px)", transition: "all 0.3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: gold, marginBottom: 12, boxShadow: "0 4px 12px rgba(212,160,23,0.3)" }}>
            <Sprout color={forest} size={30} />
          </div>
          <div style={{ color: "#fff", fontFamily: "Space Grotesk, sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{t.appName}</div>
          <div style={{ color: "#BFD3C4", fontSize: 13.5, marginTop: 4, fontFamily: "Inter, sans-serif" }}>{t.tagline}</div>
        </div>
        <Card style={{ padding: 28, borderRadius: 20 }}>
          <div style={{ display: "flex", marginBottom: 20, background: "#F1EFE6", borderRadius: 10, padding: 4 }}>
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer",
                  fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 13.5,
                  background: mode === m ? "#FFFFFF" : "transparent",
                  color: mode === m ? forest : "#8a8a7c",
                  boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s"
                }}
              >
                {m === "login" ? t.login : t.register}
              </button>
            ))}
          </div>
          <form onSubmit={submit}>
            {mode === "register" && (
              <Field label={t.fullName} icon={<UserIcon size={14} />}>
                <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Divya Sharma" />
              </Field>
            )}
            <Field label={t.email} icon={<Mail size={14} />}>
              <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="farmer@village.com" />
            </Field>
            <Field label={t.password} icon={<Lock size={14} />}>
              <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </Field>
            {error && <div style={{ color: "#B4483B", fontSize: 13, marginBottom: 12, fontWeight: 500 }}>{error}</div>}
            <PrimaryButton type="submit" style={{ width: "100%", justifyContent: "center" }}>
              {mode === "login" ? t.login : t.createAccount} <ArrowRight size={16} />
            </PrimaryButton>
          </form>
        </Card>
        <div style={{ textAlign: "center", color: "#8FA898", fontSize: 12, marginTop: 16 }}>
          {t.demoNote}
        </div>
      </div>
    </div>
  );
}

// ---------- Sidebar ----------
function Sidebar({ page, setPage, user, onLogout, lang, setLang, fontScale, setFontScale, mobileOpen }) {
  const t = STRINGS[lang] || STRINGS.en;
  const forest = "#1F3D2B";
  const gold = "#D4A017";
  const items = [
    { id: "dashboard", label: t.dashboard, icon: <LayoutDashboard size={17} /> },
    { id: "check", label: t.checkScore, icon: <TrendingUp size={17} /> },
    { id: "history", label: t.historyNav, icon: <HistoryIcon size={17} /> },
  ];

  return (
    <div className={`app-sidebar ${mobileOpen ? "active" : ""}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "0 8px" }}>
        <Sprout color={gold} size={24} />
        <span style={{ color: "#fff", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 17.5, letterSpacing: -0.3 }}>{t.appName}</span>
      </div>
      
      <div style={{ padding: "0 8px", marginBottom: 20 }}>
        <LanguageToggle lang={lang} setLang={setLang} />
      </div>

      {/* Accessibility Controller */}
      <div style={{ padding: "0 8px", marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>
        <div style={{ color: "#8FA898", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
          {t.fontSize}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "A-", scale: 0.9 },
            { label: "A", scale: 1.0 },
            { label: "A+", scale: 1.2 }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setFontScale(item.scale)}
              style={{
                flex: 1, padding: "4px 0", borderRadius: 6, border: "none", cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 11,
                background: fontScale === item.scale ? gold : "rgba(255,255,255,0.08)",
                color: fontScale === item.scale ? forest : "#CBD9CF",
                transition: "all 0.2s"
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => setPage(it.id)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 12px",
              borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 6,
              background: page === it.id ? "rgba(212,160,23,0.14)" : "transparent",
              color: page === it.id ? gold : "#CBD9CF",
              fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 13.5, textAlign: "left",
              transition: "all 0.2s"
            }}
          >
            {it.icon} {it.label}
          </button>
        ))}
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "0 8px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: forest, fontSize: 14 }}>
            {(user.name || "F")[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#fff", fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
            <div style={{ color: "#8FA898", fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", color: "#CBD9CF", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 13, transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#fff"} onMouseLeave={(e) => e.currentTarget.style.color = "#CBD9CF"}>
          <LogOut size={15} /> {t.logout}
        </button>
      </div>
    </div>
  );
}

// ---------- Dashboard ----------
function Dashboard({ user, history, goCheck, lang, documents, setDocuments, apiKey, onSaveApiKey }) {
  const t = STRINGS[lang] || STRINGS.en;
  const last = history[0];
  const ink = "#1B2B20";
  const forest = "#1F3D2B";
  const gold = "#D4A017";

  const riskLabel = (r) => (r === "Low" ? t.low : r === "Medium" ? t.medium : t.high);
  
  // Calculate Document Readiness
  const tickedDocs = Object.values(documents).filter(Boolean).length;
  const docPercentage = Math.round((tickedDocs / 5) * 100);

  // Toggle checklist status
  const toggleDoc = (key) => {
    setDocuments(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="app-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 28, fontWeight: 700, color: ink, letterSpacing: -0.5 }}>
            {t.welcome}, {user.name.split(" ")[0]}
          </div>
          <div style={{ color: "#6b6b60", fontSize: 14.5, marginTop: 4 }}>
            {t.welcomeSub}
          </div>
        </div>
        <div style={{ background: "#EAF2EC", padding: "8px 16px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles color={forest} size={18} />
          <span style={{ fontSize: 13, fontWeight: 700, color: forest, fontFamily: "Space Grotesk, sans-serif" }}>BRAINWAVE 2026</span>
        </div>
      </div>

      <div className="grid-2col" style={{ marginBottom: 24 }}>
        <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 17, color: ink, marginBottom: 6 }}>
                {last ? t.latestScore : t.noScoreYet}
              </div>
              <div style={{ color: "#6b6b60", fontSize: 13.5, marginBottom: 20, lineHeight: 1.5 }}>
                {last
                  ? `${t.checkedOn} ${last.date} ${t.forCrop} ${last.crop} (${last.land} ${t.acres}).`
                  : t.runFirstCheck}
              </div>
              <PrimaryButton onClick={goCheck}>
                <Plus size={16} /> {last ? t.runNewCheck : t.checkMyScore}
              </PrimaryButton>
            </div>
            {last && (
              <div style={{ width: 220, textAlign: "center", margin: "0 auto" }}>
                <ScoreDial score={last.score} risk={last.risk} lang={lang} />
              </div>
            )}
          </div>
        </Card>

        {/* Dashboard Stat Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="grid-2col-equal">
            <Card style={{ padding: 18, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "#EAF2EC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HistoryIcon size={20} color={forest} />
              </div>
              <div>
                <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 22, color: ink, lineHeight: 1 }}>{history.length}</div>
                <div style={{ color: "#6b6b60", fontSize: 12.5, marginTop: 4 }}>{t.totalChecks}</div>
              </div>
            </Card>

            <Card style={{ padding: 18, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "#FBF1DD", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wheat size={20} color={gold} />
              </div>
              <div>
                <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 19, color: ink, lineHeight: 1 }}>
                  {last ? riskLabel(last.risk) : "—"}
                </div>
                <div style={{ color: "#6b6b60", fontSize: 12.5, marginTop: 4 }}>{t.currentRisk}</div>
              </div>
            </Card>
          </div>

          {/* Compliance meter card */}
          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: ink, fontFamily: "Space Grotesk, sans-serif" }}>{t.progressTitle}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: forest }}>{docPercentage}%</span>
            </div>
            <div style={{ width: "100%", height: 8, background: "#EAF0EC", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ width: `${docPercentage}%`, height: "100%", background: forest, borderRadius: 4, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ fontSize: 11.5, color: "#7a7a6c" }}>
              {tickedDocs} of 5 bank criteria satisfied. Update checklist below to sync.
            </div>
          </Card>
          
          {/* Weather telemetry card */}
          <WeatherCard weatherData={last?.weatherData} apiKey={apiKey} onSaveApiKey={onSaveApiKey} lang={lang} />
        </div>
      </div>

      <div className="grid-1-2">
        {/* Prerequisite checklist */}
        <Card>
          <div style={{ borderBottom: "1px solid #E4E0D4", paddingBottom: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 16, color: ink }}>
              <CheckSquare size={18} color={forest} /> {t.docChecklist}
            </div>
            <div style={{ color: "#6b6b60", fontSize: 12.5, marginTop: 4 }}>{t.docChecklistSub}</div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { key: "land", label: t.landRecord },
              { key: "id", label: t.idProof },
              { key: "nodues", label: t.noDueCert },
              { key: "soil", label: t.soilCard },
              { key: "bank", label: t.bankAccount }
            ].map((item) => (
              <label key={item.key} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13.5, color: "#3d3d34", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={documents[item.key]}
                  onChange={() => toggleDoc(item.key)}
                  style={{ marginTop: 3, cursor: "pointer", accentColor: forest }}
                />
                <span style={{ fontWeight: documents[item.key] ? 600 : 400 }}>{item.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Previous score trend */}
        <HistoryChart history={history} user={user} documents={documents} lang={lang} />
      </div>
    </div>
  );
}

// ---------- Assessment Form (Inputs + Voice Parsing) ----------
function CheckForm({ onSubmit, lang, documents, apiKey }) {
  const t = STRINGS[lang] || STRINGS.en;
  const crops = CROPS_I18N[lang] || CROPS_I18N.en;
  const irrigationList = IRRIGATION_I18N[lang] || IRRIGATION_I18N.en;
  const ink = "#1B2B20";
  const forest = "#1F3D2B";
  const gold = "#D4A017";

  const [location, setLocation] = useState("");
  const [crop, setCrop] = useState(crops[0]);
  const [land, setLand] = useState("");
  const [harvest, setHarvest] = useState("");
  const [irrigation, setIrrigation] = useState(irrigationList[2].id);

  // Weather Geocode & Fetch Loading States
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  // Sync crop value if language updates crop lists
  useEffect(() => {
    setCrop(crops[0]);
  }, [lang]);

  // Voice command assistant payload callback
  const handleVoiceUpdate = (data) => {
    if (data.crop) setCrop(data.crop);
    if (data.land) setLand(data.land);
    if (data.harvest) setHarvest(data.harvest);
    if (data.irrigation) setIrrigation(data.irrigation);
    if (data.location) setLocation(data.location);
    if (data.rawNumber) {
      if (!land) setLand(data.rawNumber);
      else setHarvest(data.rawNumber);
    }
  };

  // Dedicated Mic for Village input only
  const { start: startLocMic, listening: locListening } = useSpeechInput(lang, (text) => {
    setLocation(text);
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!location || !land || !harvest) return;

    setWeatherLoading(true);
    setLoadingText(t.fetchingWeather);

    let weatherResult = { success: false };
    try {
      setLoadingText(t.linkedToRegion.replace("{region}", location));
      weatherResult = await fetchWeatherData(location, apiKey);
      // Simulate delay to display premium credit analysis telemetry
      await new Promise(resolve => setTimeout(resolve, 1200));
    } catch (err) {
      console.warn("Weather integration failed", err);
    }

    setWeatherLoading(false);
    onSubmit({ location, crop, land, harvest, irrigation, weather: weatherResult });
  };

  if (weatherLoading) {
    return (
      <div className="app-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", fontFamily: "Inter, sans-serif" }}>
        <div style={{ position: "relative", width: 80, height: 80, marginBottom: 24 }}>
          <div className="animate-spin" style={{ position: "absolute", width: "100%", height: "100%", border: `4px solid #EAF0EC`, borderTop: `4px solid ${forest}`, borderRadius: "50%" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <Sprout color={gold} size={28} />
          </div>
        </div>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700, color: ink, marginBottom: 8, textAlign: "center" }}>
          Analyzing Agricultural Credit Readiness...
        </div>
        <div style={{ color: "#7a7a6c", fontSize: 13.5, maxWidth: 380, textAlign: "center", lineHeight: 1.6 }}>
          {loadingText}
        </div>
        
        {/* Loading Skeleton */}
        <div style={{ width: "100%", maxWidth: 440, marginTop: 24, padding: 16, border: "1px solid #E4E0D4", borderRadius: 12, background: "#FFFFFF" }}>
          <div style={{ height: 12, background: "#F1EFE6", borderRadius: 4, width: "70%", marginBottom: 12 }} className="animate-pulse" />
          <div style={{ height: 10, background: "#F1EFE6", borderRadius: 4, width: "90%", marginBottom: 8 }} className="animate-pulse" />
          <div style={{ height: 10, background: "#F1EFE6", borderRadius: 4, width: "50%" }} className="animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-content">
      <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 26, fontWeight: 700, color: ink, marginBottom: 4, letterSpacing: -0.5 }}>
        {t.checkTitle}
      </div>
      <div style={{ color: "#6b6b60", fontSize: 14, marginBottom: 24, maxWidth: 640 }}>
        {t.checkSub}
      </div>

      <div className="grid-1-2">
        <Card>
          <form onSubmit={submit}>
            <Field label={t.village} icon={<MapPin size={13} />}>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={inputStyle} required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Ludhiana, Punjab" />
                <IconButton type="button" onClick={startLocMic} title={t.speak} active={locListening}>
                  <Mic size={16} />
                </IconButton>
              </div>
            </Field>
            <Field label={t.cropType} icon={<Sprout size={13} />}>
              <select style={inputStyle} value={crop} onChange={(e) => setCrop(e.target.value)}>
                {crops.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <div className="grid-2col-equal">
              <Field label={t.landSize} icon={<Wheat size={13} />}>
                <input style={inputStyle} required type="number" step="any" min="0.1" value={land} onChange={(e) => setLand(e.target.value)} placeholder="3" />
              </Field>
              <Field label={t.lastHarvest} icon={<TrendingUp size={13} />}>
                <input style={inputStyle} required type="number" min="0" value={harvest} onChange={(e) => setHarvest(e.target.value)} placeholder="75" />
              </Field>
            </div>
            <Field label={t.irrigationMethod} icon={<Droplets size={13} />}>
              <select style={inputStyle} value={irrigation} onChange={(e) => setIrrigation(e.target.value)}>
                {irrigationList.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
              </select>
            </Field>
            <PrimaryButton type="submit" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
              <Cloud size={16} /> {t.fetchGenerate}
            </PrimaryButton>
          </form>
        </Card>

        {/* Voice Assistant Hub */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <VoiceAssistant lang={lang} onVoiceUpdate={handleVoiceUpdate} />

          {/* Compliance notice */}
          <Card style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Info size={20} color={gold} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: ink, display: "block" }}>{t.complianceSyncActive}</span>
              <span style={{ fontSize: 12.5, color: "#6b6b60", display: "block", marginTop: 4, lineHeight: 1.5 }}>
                {t.complianceSyncSub.replace("{count}", Object.values(documents).filter(Boolean).length)}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------- Results Display (XAI Breakdown + AI Coach Simulator) ----------
function ResultView({ result, onBack, onSave, lang, documents }) {
  const t = STRINGS[lang] || STRINGS.en;
  const ink = "#1B2B20";
  const forest = "#1F3D2B";

  const [potentialScore, setPotentialScore] = useState(result.score);

  // TTS Readout Trigger
  const speakAll = () => {
    let text = "";
    if (lang === "en") {
      text = `Your credit readiness score is ${result.score} out of 100, indicating a ${result.risk} risk profile. Data confidence is high. Key analysis: ${result.reasons.map(r => r.text).join(". ")}. Key suggestions: ${result.suggestions.join(". ")}`;
    } else if (lang === "hi") {
      const rLabel = result.risk === "Low" ? "कम" : result.risk === "Medium" ? "मध्यम" : "अधिक";
      text = `आपका ऋण तैयारी स्कोर 100 में से ${result.score} है, जो ${rLabel} ऋण जोखिम श्रेणी दिखाता है। मुख्य विश्लेषण: ${result.reasons.map(r => r.text).join(". ")}. मुख्य सुझाव: ${result.suggestions.join(". ")}`;
    } else if (lang === "bn") {
      const rLabel = result.risk === "Low" ? "কম" : result.risk === "Medium" ? "মাঝারি" : "উচ্চ";
      text = `আপনার কৃষি ঋণ যোগ্যতা স্কোর ১০০ এর মধ্যে ${result.score}, যা একটি ${rLabel} ঋণ ঝুঁকি নির্দেশ করে। মূল কারণসমূহ: ${result.reasons.map(r => r.text).join(". ")}. মূল সুপারিশ: ${result.suggestions.join(". ")}`;
    }
    speak(text, lang);
  };

  return (
    <div className="app-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 26, fontWeight: 700, color: ink, letterSpacing: -0.5 }}>
          {t.resultTitle}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <IconButton onClick={speakAll} title={t.listen}>
            <Volume2 size={16} />
          </IconButton>
          <PrimaryButton onClick={() => downloadReport(result, { name: "Farmer" }, documents, lang)} style={{ background: "transparent", color: forest, border: `1px solid #E4E0D4` }}>
            <Download size={16} /> {t.downloadPdf}
          </PrimaryButton>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 24 }}>
        <LoanScoreCard result={result} potentialScore={potentialScore} lang={lang} />
        
        <div className="grid-2col">
          <LoanCoach
            result={result}
            documents={documents}
            lang={lang}
            onChangePotentialScore={setPotentialScore}
          />
          <GovernmentSchemes result={result} lang={lang} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <PrimaryButton onClick={onSave}>{t.saveHistory}</PrimaryButton>
        <PrimaryButton onClick={onBack} style={{ background: "transparent", color: forest, border: `1px solid #E4E0D4` }}>
          {t.backDashboard}
        </PrimaryButton>
      </div>
    </div>
  );
}

// ---------- Assessment History ----------
function HistoryView({ history, goCheck, lang, documents }) {
  const t = STRINGS[lang] || STRINGS.en;
  const ink = "#1B2B20";
  const forest = "#1F3D2B";

  const riskLabel = (r) => (r === "Low" ? t.low : r === "Medium" ? t.medium : r === "High" ? t.high : t.high);

  return (
    <div className="app-content">
      <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 26, fontWeight: 700, color: ink, marginBottom: 4, letterSpacing: -0.5 }}>
        {t.historyTitle}
      </div>
      <div style={{ color: "#6b6b60", fontSize: 14, marginBottom: 24 }}>
        {t.historySub}
      </div>

      {history.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 48 }}>
          <div style={{ color: "#6b6b60", fontSize: 14, marginBottom: 16 }}>{t.noChecksYet}</div>
          <PrimaryButton onClick={goCheck} style={{ margin: "0 auto" }}>
            <Plus size={16} /> {t.checkMyScore}
          </PrimaryButton>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {history.map((h, i) => {
            const riskColor = h.risk === "Low" ? "#3B7A57" : h.risk === "Medium" ? "#C98A2B" : "#B4483B";
            return (
              <Card key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 18, transition: "transform 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 10, background: "#F7F5EF", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: forest, fontSize: 16, border: "1px solid #E4E0D4" }}>
                    {h.score}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: ink, fontFamily: "Space Grotesk, sans-serif" }}>{h.crop} · {h.location}</div>
                    <div style={{ color: "#8a8a7c", fontSize: 12, marginTop: 2 }}>{h.date} · {h.land} {t.acres} · {h.harvest} quintals</div>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ color: riskColor, fontWeight: 700, fontSize: 13, fontFamily: "Space Grotesk, sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {riskLabel(h.risk)} {t.risk}
                  </div>
                  <IconButton
                    onClick={() => downloadReport(h, { name: "Farmer" }, documents, lang)}
                    title="Download PDF"
                    style={{ border: "1px solid #E4E0D4" }}
                  >
                    <Download size={15} />
                  </IconButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Main App Wrapper ----------
export default function App() {
  const [lang, setLang] = useState("hi");
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  
  // Mobile responsive sidebar toggle
  const [mobileOpen, setMobileOpen] = useState(false);

  // OpenWeather API key
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem("agriscore_openweather_key") || import.meta.env.VITE_OPENWEATHER_API_KEY || "";
  });

  // Global Compliance checklist state loaded from localstorage
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem("agriscore_documents");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      land: true,
      id: true,
      nodues: false,
      soil: false,
      bank: true
    };
  });

  // Previous checks loaded from localstorage
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("agriscore_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Seed mock data for new users to demonstrate the trend sparkline chart immediately
    const mockHistory = [
      {
        score: 78,
        risk: "Low",
        location: "Bathinda, Punjab",
        crop: "Cotton",
        land: "5",
        harvest: "85",
        irrigation: "drip",
        irrObj: { id: "drip", label: "Drip irrigation", bonus: 12 },
        rainfall: 72,
        soilQuality: 82,
        ndvi: 76,
        yieldScore: 80,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        reasons: [],
        suggestions: [],
        weatherData: {
          success: true,
          temp: 29.5,
          humidity: 65,
          rain: 12.0,
          locationName: "Bathinda, Punjab",
          source: "Historical Sensors"
        }
      },
      {
        score: 55,
        risk: "Medium",
        location: "Bathinda, Punjab",
        crop: "Wheat",
        land: "5",
        harvest: "55",
        irrigation: "canal",
        irrObj: { id: "canal", label: "Canal / Tube well", bonus: 0 },
        rainfall: 48,
        soilQuality: 56,
        ndvi: 60,
        yieldScore: 40,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        reasons: [],
        suggestions: [],
        weatherData: {
          success: true,
          temp: 34.0,
          humidity: 45,
          rain: 0,
          locationName: "Bathinda, Punjab",
          source: "Historical Sensors"
        }
      }
    ];

    // Hydrate reasons and suggestions inside seed data
    mockHistory.forEach(item => {
      const computed = computeScore({
        location: item.location,
        crop: item.crop,
        land: item.land,
        harvest: item.harvest,
        irrigation: item.irrigation,
        tickedCount: 3, // docs ticked
        weather: item.weatherData,
        lang: "hi" // Seed in current default language
      });
      item.reasons = computed.reasons;
      item.suggestions = computed.suggestions;
    });

    localStorage.setItem("agriscore_history", JSON.stringify(mockHistory));
    return mockHistory;
  });

  const [pendingResult, setPendingResult] = useState(null);

  // Global Accessibility Font Scale
  const [fontScale, setFontScale] = useState(1); // 0.9, 1.0, 1.2

  // Sync state modifications to localstorage
  useEffect(() => {
    localStorage.setItem("agriscore_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("agriscore_documents", JSON.stringify(documents));
  }, [documents]);

  const handleCheckSubmit = (form) => {
    const tickedCount = Object.values(documents).filter(Boolean).length;
    const scoreResult = computeScore({ ...form, tickedCount, lang });
    
    setPendingResult({
      ...scoreResult,
      ...form,
      weatherData: form.weather && form.weather.success ? form.weather : null,
      date: new Date().toLocaleDateString()
    });
    setPage("result");
  };

  const saveToHistory = () => {
    if (pendingResult) {
      setHistory((h) => [pendingResult, ...h]);
    }
    setPage("dashboard");
  };

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem("agriscore_openweather_key", key);
  };

  if (!user) {
    return <AuthScreen onAuth={setUser} lang={lang} setLang={setLang} />;
  }

  const bg = "#F7F5EF";

  return (
    <div className="app-layout" style={{ background: bg, fontSize: `${14 * fontScale}px`, transition: "font-size 0.2s ease" }}>
      
      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Sprout color="#D4A017" size={20} />
          <span style={{ color: "#fff", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 16.5 }}>{STRINGS[lang]?.appName || "AgriScore AI"}</span>
        </div>
        <div style={{ width: 24 }} /> {/* Spacer */}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} style={{ display: "none" }} />
      )}

      <Sidebar
        page={page === "result" ? "check" : page}
        setPage={(p) => { setPage(p); setMobileOpen(false); }}
        user={user}
        onLogout={() => setUser(null)}
        lang={lang}
        setLang={setLang}
        fontScale={fontScale}
        setFontScale={setFontScale}
        mobileOpen={mobileOpen}
      />
      {page === "dashboard" && (
        <Dashboard
          user={user}
          history={history}
          goCheck={() => setPage("check")}
          lang={lang}
          documents={documents}
          setDocuments={setDocuments}
          apiKey={apiKey}
          onSaveApiKey={handleSaveApiKey}
        />
      )}
      {page === "check" && (
        <CheckForm
          onSubmit={handleCheckSubmit}
          lang={lang}
          documents={documents}
          apiKey={apiKey}
        />
      )}
      {page === "result" && pendingResult && (
        <ResultView
          result={pendingResult}
          onBack={() => setPage("dashboard")}
          onSave={saveToHistory}
          lang={lang}
          documents={documents}
        />
      )}
      {page === "history" && (
        <HistoryView
          history={history}
          goCheck={() => setPage("check")}
          lang={lang}
          documents={documents}
        />
      )}
    </div>
  );
}
