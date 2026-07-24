import { jsPDF } from "jspdf";

/**
 * Generates and downloads a clean, professional, bank-ready PDF report.
 * Generated in English to ensure compatibility with standard bank processing and PDF readers.
 */
export function downloadReport(result, user, documents, lang) {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const forest = "#1F3D2B";
    const gold = "#D4A017";
    const ink = "#1B2B20";
    const lightBg = "#F7F5EF";
    const borderCol = "#E4E0D4";

    // Helper: Hex color to RGB arrays
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    const rForest = hexToRgb(forest);
    const rInk = hexToRgb(ink);
    const rLight = hexToRgb(lightBg);
    const rBorder = hexToRgb(borderCol);

    // --- Page Header Banner ---
    doc.setFillColor(rForest[0], rForest[1], rForest[2]);
    doc.rect(15, 15, 180, 22, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("AGRISCORE AI", 22, 24);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Farmer Credit & Loan Readiness Evaluation Report", 22, 29);

    doc.setFont("helvetica", "bold");
    doc.text("BRAINWAVE 2026", 158, 24);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${result.date || new Date().toLocaleDateString()}`, 154, 29);

    // --- Section 1: Farmer & Crop Profile ---
    let y = 48;
    doc.setTextColor(rInk[0], rInk[1], rInk[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("1. FARMER & LAND PROFILE", 15, y);
    doc.line(15, y + 2, 195, y + 2);

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("Farmer Name:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(user.name || "N/A", 42, y);

    doc.setFont("helvetica", "bold");
    doc.text("Location / District:", 110, y);
    doc.setFont("helvetica", "normal");
    doc.text(result.location || "N/A", 145, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Farmer Email:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(user.email || "N/A", 42, y);

    doc.setFont("helvetica", "bold");
    doc.text("Cultivated Crop:", 110, y);
    doc.setFont("helvetica", "normal");
    doc.text(result.crop || "N/A", 145, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Cultivated Area:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${result.land || "N/A"} Acres`, 42, y);

    doc.setFont("helvetica", "bold");
    doc.text("Irrigation System:", 110, y);
    doc.setFont("helvetica", "normal");
    const irrLabel = result.irrObj?.label || (result.irrigation === "drip" ? "Drip Irrigation" : "Canal / Tube well");
    doc.text(irrLabel, 145, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Recent Harvest:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${result.harvest || "0"} Quintals`, 42, y);

    // --- Section 2: Credit Score Summary ---
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2. CREDIT ASSESSMENTS & RISK PROFILE", 15, y);
    doc.line(15, y + 2, 195, y + 2);

    y += 8;
    // Score box
    doc.setFillColor(rLight[0], rLight[1], rLight[2]);
    doc.setDrawColor(rBorder[0], rBorder[1], rBorder[2]);
    doc.rect(15, y, 65, 24, "FD");

    doc.setTextColor(rInk[0], rInk[1], rInk[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("LOAN READINESS SCORE", 20, y + 6);
    doc.setFontSize(22);
    doc.text(`${result.score} / 100`, 20, y + 16);

    // Risk card
    let riskColor = [59, 122, 87]; // Low (Green)
    if (result.risk === "Medium") riskColor = [201, 138, 43]; // Medium (Orange)
    if (result.risk === "High") riskColor = [180, 72, 59]; // High (Red)

    doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.rect(88, y, 107, 24, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("CREDIT SUITABILITY STATUS", 94, y + 6);
    doc.setFontSize(15);
    doc.text(`${result.risk.toUpperCase()} DEFAULT RISK`, 94, y + 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const statusNote = result.score >= 72
      ? "Strong baseline. Recommended for fast-track credit approval."
      : result.score >= 48
      ? "Moderate credit metrics. Approvals subject to micro-irrigation/crop insurance verification."
      : "High production volatility. Credit enhancement required.";
    doc.text(statusNote, 94, y + 20);

    // --- Weather parameters ---
    if (result.weatherData) {
      y += 28;
      doc.setFillColor(rLight[0], rLight[1], rLight[2]);
      doc.rect(15, y, 180, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(rForest[0], rForest[1], rForest[2]);
      const wSource = result.weatherData.source || "OpenWeather";
      doc.text(
        `Linked Weather Geocoding Telemetry (${wSource}): Temperature: ${result.weatherData.temp}°C | Humidity: ${result.weatherData.humidity}% | Rain: ${result.weatherData.rain}mm`,
        18,
        y + 6.5
      );
    }

    // --- Section 3: Explainable AI Diagnoses ---
    y += (result.weatherData ? 16 : 30);
    doc.setTextColor(rInk[0], rInk[1], rInk[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("3. EXPLAINABLE AI (XAI) CREDIT SIGNALS DIAGNOSTICS", 15, y);
    doc.line(15, y + 2, 195, y + 2);

    y += 8;
    doc.setFontSize(8.5);
    result.reasons.forEach((reason) => {
      doc.setFont("helvetica", "bold");
      if (reason.ok) {
        doc.setTextColor(59, 122, 87); // Green ok
        doc.text("[PASS]", 15, y);
      } else {
        doc.setTextColor(201, 138, 43); // Orange warning
        doc.text("[WARN]", 15, y);
      }
      doc.setTextColor(rInk[0], rInk[1], rInk[2]);
      doc.setFont("helvetica", "normal");
      
      // Clean string (remove Hindi/Bengali scripts if mixed, or just output text nicely)
      let cleanText = reason.text;
      // Extract English text portion if separated by hyphen/slash
      if (cleanText.includes(" - ")) {
        const parts = cleanText.split(" - ");
        // Ensure we fetch parts that contain English characters
        cleanText = parts[0] + " - " + parts[1];
      }
      
      // Split text if it exceeds page boundary
      const textLines = doc.splitTextToSize(cleanText, 168);
      doc.text(textLines, 29, y);
      y += 5.5 * textLines.length;
    });

    // --- Section 4: Bank Document Verification Checklist ---
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("4. REGIONAL BANK DOCUMENT & COMPLIANCE COMPLIANCE STATS", 15, y);
    doc.line(15, y + 2, 195, y + 2);

    y += 8;
    doc.setFontSize(8.5);
    const docsList = [
      { key: "land", label: "Land Ownership Record / Jamabandi Passbook" },
      { key: "id", label: "KYC Verification (Aadhaar / Voter Card)" },
      { key: "nodues", label: "No-Dues NOC Certificate from local banks" },
      { key: "soil", label: "Verified Soil Health Card (SHC)" },
      { key: "bank", label: "Active Regional Bank Savings Account (6-month ledger)" }
    ];

    docsList.forEach((item) => {
      const isTicked = documents[item.key];
      doc.setFont("helvetica", "bold");
      if (isTicked) {
        doc.setTextColor(59, 122, 87);
        doc.text("[VERIFIED]", 15, y);
      } else {
        doc.setTextColor(180, 72, 59);
        doc.text("[PENDING]", 15, y);
      }
      doc.setTextColor(rInk[0], rInk[1], rInk[2]);
      doc.setFont("helvetica", "normal");
      doc.text(item.label, 36, y);
      y += 5.5;
    });

    // --- Section 5: Improvement Roadmap Suggestions ---
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("5. PERSONALIZED CREDIT SCORE IMPROVEMENT ROADMAP", 15, y);
    doc.line(15, y + 2, 195, y + 2);

    y += 8;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    
    result.suggestions.forEach((sug, idx) => {
      const bulletText = `${idx + 1}. ${sug}`;
      const textLines = doc.splitTextToSize(bulletText, 175);
      doc.text(textLines, 15, y);
      y += 5 * textLines.length;
    });

    // --- Footer metadata ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 110);
    doc.text(
      "Disclaimer: AgriScore AI acts as an advisory underwriting assistant. Final loan sanctioning remains at the sole discretion of the partnering bank.",
      15,
      282
    );
    doc.text("AgriScore AI · Developed for BRAINWAVE 2026 National Hackathon", 15, 286);

    // Save report
    const sanitizedCrop = result.crop.replace(/[^a-zA-Z]/g, "");
    const sanitizedLoc = result.location.split(",")[0].trim().replace(/[^a-zA-Z]/g, "");
    doc.save(`AgriScore_Report_${sanitizedCrop}_${sanitizedLoc}.pdf`);
  } catch (err) {
    console.error("PDF generation failed", err);
    alert("Could not generate PDF report. Check browser console logs.");
  }
}
