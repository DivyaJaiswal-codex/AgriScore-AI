import React, { useState, useMemo, useEffect } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { STRINGS } from "../services/translationService";

/**
 * LoanCoach Component rendering the vertical milestone timeline roadmap and the interactive What-If simulator.
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

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24 }}>
      
      {/* Roadmap Timeline */}
      <div
        style={{
          background: "#FFFFFF", borderRadius: 16, border: "1px solid #E4E0D4",
          padding: 24, boxShadow: "0 2px 8px rgba(31,61,43,0.03)"
        }}
      >
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 15, color: "#1F3D2B", borderBottom: "1px solid #E4E0D4", paddingBottom: 10, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={16} /> {t.aiCoach}
        </div>
        <div style={{ color: "#3d3d34", fontSize: 13, marginBottom: 14 }}>{t.coachSub}</div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16, borderLeft: "2px solid #E4E0D4", paddingLeft: 16, marginLeft: 8 }}>
          
          {/* Milestone 1 */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: -22, top: 2, width: 10, height: 10, borderRadius: "50%", background: "#1F3D2B" }} />
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1B2B20" }}>{t.immediateAction}</div>
            <p style={{ fontSize: 11.5, color: "#6b6b60", margin: "4px 0 0 0", lineHeight: 1.4 }}>
              Obtain a Soil Health Card (SHC) and double check KYC credentials. Resolves bank compliance prerequisites.
            </p>
          </div>
          
          {/* Milestone 2 */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: -22, top: 2, width: 10, height: 10, borderRadius: "50%", background: "#D4A017" }} />
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1B2B20" }}>{t.mediumAction}</div>
            <p style={{ fontSize: 11.5, color: "#6b6b60", margin: "4px 0 0 0", lineHeight: 1.4 }}>
              Insure current crop using PMFBY. Banks verify crop security guarantees before issuing credit.
            </p>
          </div>

          {/* Milestone 3 */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: -22, top: 2, width: 10, height: 10, borderRadius: "50%", background: "#8a8a7c" }} />
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1B2B20" }}>{t.longAction}</div>
            <p style={{ fontSize: 11.5, color: "#6b6b60", margin: "4px 0 0 0", lineHeight: 1.4 }}>
              Upgrade irrigation to drip/sprinkler systems using the PDMC subsidy. Lowers crop drought default probability.
            </p>
          </div>
        </div>
      </div>

      {/* What-If Simulator Card */}
      <div
        style={{
          background: "#FCFBF8", borderRadius: 16, border: "1px solid #E4E0D4",
          padding: 24, boxShadow: "0 2px 8px rgba(31,61,43,0.03)"
        }}
      >
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 14.5, color: "#1B2B20", marginBottom: 6 }}>
          {t.whatIfSim}
        </div>
        <div style={{ color: "#6b6b60", fontSize: 12, marginBottom: 14, lineHeight: 1.4 }}>
          {t.whatIfSimSub}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ display: "flex", gap: 8, fontSize: 12.5, color: "#1B2B20", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={soilTicked}
              disabled={documents.soil}
              onChange={() => setSoilTicked(!soilTicked)}
              style={{ accentColor: "#1F3D2B" }}
            />
            <span>{t.verifySoilHypo}</span>
          </label>

          <label style={{ display: "flex", gap: 8, fontSize: 12.5, color: "#1B2B20", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={dripTicked}
              disabled={result.irrObj.id === "drip" || result.irrObj.id === "sprinkler"}
              onChange={() => setDripTicked(!dripTicked)}
              style={{ accentColor: "#1F3D2B" }}
            />
            <span>{t.setIrrigationHypo}</span>
          </label>

          <label style={{ display: "flex", gap: 8, fontSize: 12.5, color: "#1B2B20", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={insuranceTicked}
              onChange={() => setInsuranceTicked(!insuranceTicked)}
              style={{ accentColor: "#1F3D2B" }}
            />
            <span>{t.secureCropHypo}</span>
          </label>

          <label style={{ display: "flex", gap: 8, fontSize: 12.5, color: "#1B2B20", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={docsTicked}
              disabled={Object.values(documents).every(Boolean)}
              onChange={() => setDocsTicked(!docsTicked)}
              style={{ accentColor: "#1F3D2B" }}
            />
            <span>{t.tickAllDocsHypo}</span>
          </label>
        </div>

        {potentialScore > result.score && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px dashed #E4E0D4", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#6b6b60" }}>{t.potentialScoreTitle}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1F3D2B", fontFamily: "Space Grotesk, sans-serif" }}>
              {potentialScore} / 100
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
