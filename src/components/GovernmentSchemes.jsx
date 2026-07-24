import React, { useMemo } from "react";
import { FileText, Wheat, Cloud, Droplets } from "lucide-react";
import { STRINGS } from "../services/translationService";

/**
 * GovernmentSchemes Component evaluating land, yield, and risk profiles to suggest government assistance programs.
 */
export default function GovernmentSchemes({ result, lang }) {
  const t = STRINGS[lang] || STRINGS.en;

  const schemeRecommendations = useMemo(() => {
    const list = [];
    const landNum = parseFloat(result.land) || 0;
    
    // KCC crop loan (basic recommendation)
    list.push({
      title: t.kccTitle,
      desc: t.kccDesc,
      icon: <FileText size={20} color="#1F3D2B" />
    });

    // PM-KISAN (marginal farmers < 5 acres)
    if (landNum < 5) {
      list.push({
        title: t.pmKisanTitle,
        desc: t.pmKisanDesc,
        icon: <Wheat size={20} color="#D4A017" />
      });
    }

    // PMFBY (volatility hedge)
    if (result.risk === "High" || result.risk === "Medium" || result.irrObj.id === "rainfed") {
      list.push({
        title: t.pmfbyTitle,
        desc: t.pmfbyDesc,
        icon: <Cloud size={20} color="#3B7A57" />
      });
    }

    // PDMC (water system subsidy)
    if (result.irrObj.id === "canal" || result.irrObj.id === "rainfed") {
      list.push({
        title: t.pdmcTitle,
        desc: t.pdmcDesc,
        icon: <Droplets size={20} color="#2980B9" />
      });
    }

    return list;
  }, [result, lang, t]);

  return (
    <div
      style={{
        background: "#FFFFFF", borderRadius: 16, border: "1px solid #E4E0D4",
        padding: 24, boxShadow: "0 2px 8px rgba(31,61,43,0.03)"
      }}
    >
      <span style={{ fontSize: 14.5, fontWeight: 700, color: "#1B2B20", fontFamily: "Space Grotesk, sans-serif", display: "block", borderBottom: "1px solid #E4E0D4", paddingBottom: 10, marginBottom: 14 }}>
        {t.alignedSchemes}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: 220 }}>
        {schemeRecommendations.map((scheme, idx) => (
          <div key={idx} style={{ display: "flex", gap: 12, padding: 12, background: "#F7F5EF", borderRadius: 10, border: "1px solid #E4E0D4" }}>
            <div style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 8, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {scheme.icon}
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1F3D2B", fontFamily: "Space Grotesk, sans-serif" }}>{scheme.title}</div>
              <div style={{ fontSize: 11, color: "#6b6b60", marginTop: 4, lineHeight: 1.4 }}>{scheme.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
