import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  FlaskConical,
  Microscope,
  ShieldCheck,
  Plus,
  X,
  Search,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import "./LabReports.css";

const DEFAULT_LAB_REPORTS = [
  {
    id: "LAB-8491",
    testName: "Complete Blood Count (CBC) with Differential",
    category: "Hematology",
    categoryKey: "catHematology",
    specimen: "EDTA Whole Blood",
    collectedDate: "2026-11-18",
    reportedDate: "2026-11-19",
    prescribedBy: "Dr. Vani (Pediatrics)",
    labName: "MediBook Central Diagnostics & Pathology Lab",
    accreditation: "NABL & CAP Certified",
    status: "Normal",
    summary: "All hematological indices within biological reference intervals.",
    parameters: [
      { name: "Hemoglobin", value: "14.2", unit: "g/dL", range: "12.0 - 16.0", status: "normal" },
      { name: "Total WBC Count", value: "6,800", unit: "/mcL", range: "4,500 - 11,000", status: "normal" },
      { name: "Platelet Count", value: "250,000", unit: "/mcL", range: "150,000 - 450,000", status: "normal" },
      { name: "RBC Count", value: "4.8", unit: "million/mcL", range: "4.2 - 5.4", status: "normal" },
      { name: "Hematocrit (PCV)", value: "42.5", unit: "%", range: "37.0 - 48.0", status: "normal" },
    ],
  },
  {
    id: "LAB-7204",
    testName: "Comprehensive Lipid & Cardiovascular Profile",
    category: "Cardiology",
    categoryKey: "catCardiology",
    specimen: "Serum (Fasting 12 Hrs)",
    collectedDate: "2026-11-15",
    reportedDate: "2026-11-16",
    prescribedBy: "Dr. Suresh (Cardiologist)",
    labName: "MediBook Heart & Vascular Biomarker Laboratory",
    accreditation: "NABL Certified",
    status: "Optimal",
    summary: "Favorable lipid profile with optimal cardiovascular risk ratio.",
    parameters: [
      { name: "Total Cholesterol", value: "182", unit: "mg/dL", range: "< 200", status: "optimal" },
      { name: "HDL (Good Cholesterol)", value: "54", unit: "mg/dL", range: "> 40", status: "optimal" },
      { name: "LDL (Bad Cholesterol)", value: "108", unit: "mg/dL", range: "< 130", status: "optimal" },
      { name: "Triglycerides", value: "125", unit: "mg/dL", range: "< 150", status: "optimal" },
      { name: "Chol / HDL Ratio", value: "3.37", unit: "Ratio", range: "< 4.5", status: "optimal" },
    ],
  },
  {
    id: "LAB-6192",
    testName: "Total Serum IgE & Allergen Sensitivity Profile",
    category: "Dermatology",
    categoryKey: "catDermatology",
    specimen: "Serum",
    collectedDate: "2026-11-10",
    reportedDate: "2026-11-11",
    prescribedBy: "Dr. Poorvi (Dermatologist)",
    labName: "MediBook Immuno-Dermatology Reference Center",
    accreditation: "NABL & CAP Certified",
    status: "Attention",
    summary: "Mild elevation in Serum IgE consistent with allergic dermatitis or environmental sensitivity.",
    parameters: [
      { name: "Total Serum IgE", value: "210.5", unit: "IU/mL", range: "< 100", status: "attention" },
      { name: "Absolute Eosinophil Count (AEC)", value: "420", unit: "/mcL", range: "40 - 400", status: "attention" },
      { name: "C-Reactive Protein (hs-CRP)", value: "1.1", unit: "mg/L", range: "< 3.0", status: "normal" },
    ],
  },
  {
    id: "LAB-5531",
    testName: "Glycated Hemoglobin (HbA1c) & Fasting Plasma Glucose",
    category: "Endocrinology",
    categoryKey: "catEndocrinology",
    specimen: "Fluoride Plasma & Whole Blood",
    collectedDate: "2026-11-05",
    reportedDate: "2026-11-06",
    prescribedBy: "Dr. Suresh (Internal Medicine)",
    labName: "MediBook Diabetes & Metabolic Clinical Lab",
    accreditation: "NABL Certified",
    status: "Normal",
    summary: "Normal glycemic control maintained over past 90 days with excellent metabolic index.",
    parameters: [
      { name: "HbA1c (Glycated Hb)", value: "5.4", unit: "%", range: "< 5.7 (Normal)", status: "normal" },
      { name: "Estimated Avg Glucose (eAG)", value: "108", unit: "mg/dL", range: "90 - 120", status: "normal" },
      { name: "Fasting Blood Sugar (FBS)", value: "88", unit: "mg/dL", range: "70 - 99", status: "normal" },
    ],
  },
  {
    id: "LAB-4920",
    testName: "Vitamin D3 (25-Hydroxy) & Vitamin B12 Panel",
    category: "Wellness",
    categoryKey: "catWellness",
    specimen: "Serum",
    collectedDate: "2026-10-28",
    reportedDate: "2026-10-29",
    prescribedBy: "Dr. Arjun Mehta (Neurology)",
    labName: "MediBook Wellness Biomarker Center",
    accreditation: "NABL Certified",
    status: "Normal",
    summary: "Adequate vitamin stores supporting musculoskeletal and neurological health.",
    parameters: [
      { name: "25-OH Vitamin D3", value: "34.8", unit: "ng/mL", range: "30.0 - 100.0", status: "normal" },
      { name: "Vitamin B12 (Cyanocobalamin)", value: "465", unit: "pg/mL", range: "200 - 900", status: "normal" },
    ],
  },
];

const LOCALIZED_REPORTS = {
  "LAB-8491": {
    kn: {
      testName: "ಕಂಪ್ಲೀಟ್ ಬ್ಲಡ್ ಕೌಂಟ್ (CBC) - ಸಂಪೂರ್ಣ ರಕ್ತ ಪರೀಕ್ಷೆ",
      summary: "ಎಲ್ಲಾ ರಕ್ತದ ಅಂಶಗಳು ಸಾಮಾನ್ಯ ಜೈವಿಕ ಉಲ್ಲೇಖ ಮಿತಿಗಳೊಳಗೆ ಇವೆ.",
      specimen: "EDTA ಸಂಪೂರ್ಣ ರಕ್ತ",
      category: "ಹೆಮಟಾಲಜಿ",
      prescribedBy: "ಡಾ. ವಾಣಿ (ಪೀಡಿಯಾಟ್ರಿಕ್ಸ್)",
    },
    hi: {
      testName: "कम्प्लीट ब्लड काउंट (CBC) - पूर्ण रक्त परीक्षण",
      summary: "सभी हेमेटोलॉजिकल सूचकांक सामान्य संदर्भ सीमा के भीतर हैं।",
      specimen: "EDTA सम्पूर्ण रक्त",
      category: "हेमेटोलॉजी",
      prescribedBy: "डॉ. वाणी (पीडियाट्रिक्स)",
    },
  },
  "LAB-7204": {
    kn: {
      testName: "ಸಮಗ್ರ ಲಿಪಿಡ್ ಮತ್ತು ಹೃದಯ ಸಂಬಂಧಿ ಪ್ರೊಫೈಲ್",
      summary: "ಉತ್ತಮ ಲಿಪಿಡ್ ಮಟ್ಟಗಳು ಮತ್ತು ಅತ್ಯುತ್ತಮ ಹೃದಯದ ಆರೋಗ್ಯ ಸೂಚ್ಯಂಕ.",
      specimen: "ಸೀರಮ್ (12 ಗಂಟೆಗಳ ಉಪವಾಸ)",
      category: "ಕಾರ್ಡಿಯಾಲಜಿ",
      prescribedBy: "ಡಾ. ಸುರೇಶ್ (ಕಾರ್ಡಿಯಾಲಜಿ)",
    },
    hi: {
      testName: "व्यापक लिपिड एवं हृदय संबंधी प्रोफाइल",
      summary: "अनुकूल लिपिड प्रोफाइल एवं आदर्श हृदय जोखिम अनुपात।",
      specimen: "सीरम (12 घंटे उपवास)",
      category: "कार्डियोलॉजी",
      prescribedBy: "डॉ. सुरेश (कार्डियोलॉजी)",
    },
  },
  "LAB-6192": {
    kn: {
      testName: "ಟೋಟಲ್ ಸೀರಮ್ IgE ಮತ್ತು ಚರ್ಮದ ಅಲರ್ಜಿ ಪ್ರೊಫೈಲ್",
      summary: "ಚರ್ಮದ ಅಲರ್ಜಿ ಅಥವಾ ಸೂಕ್ಷ್ಮತೆಯ ಕಾರಣ ಸೀರಮ್ IgE ಮಟ್ಟದಲ್ಲಿ ಸ್ವಲ್ಪ ಹೆಚ್ಚಳ.",
      specimen: "ಸೀರಮ್ ರಕ್ತ",
      category: "ಡರ್ಮಟಾಲಜಿ",
      prescribedBy: "ಪೂರ್ವಿ (ಡರ್ಮಟಾಲಜಿ)",
    },
    hi: {
      testName: "टोटल सीरम IgE एवं त्वचा एलर्जी संवेदनशीलता प्रोफाइल",
      summary: "हल्की एलर्जी संवेदनशीलता के कारण सीरम IgE स्तर में मामूली वृद्धि।",
      specimen: "सीरम (रक्त)",
      category: "डर्मेटोलॉजी",
      prescribedBy: "पूर्वी (डर्मेटोलॉजी)",
    },
  },
  "LAB-5531": {
    kn: {
      testName: "ಗ್ಲೈಕೇಟೆಡ್ ಹಿಮೋಗ್ಲೋಬಿನ್ (HbA1c) ಮತ್ತು ರಕ್ತದಲ್ಲಿನ ಗ್ಲೂಕೋಸ್",
      summary: "ಕಳೆದ 90 ದಿನಗಳಲ್ಲಿ ಅತ್ಯುತ್ತಮ ರಕ್ತದ ಸಕ್ಕರೆ ಮಟ್ಟ ನಿಯಂತ್ರಣದಲ್ಲಿದೆ.",
      specimen: "ಫ್ಲೋರೈಡ್ ಪ್ಲಾಸ್ಮಾ / EDTA ರಕ್ತ",
      category: "ಎಂಡೋಕ್ರೈನಾಲಜಿ",
      prescribedBy: "ಡಾ. ಸುರೇಶ್ (ಇಂಟರ್ನಲ್ ಮೆಡಿಸಿನ್)",
    },
    hi: {
      testName: "ग्लाइकेटेड हीमोग्लोबिन (HbA1c) एवं ग्लूकोज जांच",
      summary: "पिछले 3 महीनों में सामान्य ग्लाइसेमिक नियंत्रण।",
      specimen: "फ्लोराइड प्लाज्मा एवं EDTA रक्त",
      category: "एंडोक्रिनोलॉजी",
      prescribedBy: "डॉ. सुरेश (इंटरनल मेडिसिन)",
    },
  },
  "LAB-4920": {
    kn: {
      testName: "ವಿಟಮಿನ್ D3 (25-OH) ಮತ್ತು ವಿಟಮಿನ್ B12 ಪ್ಯಾನಲ್",
      summary: "ಮೂಳೆಗಳು ಮತ್ತು ನರಗಳ ಆರೋಗ್ಯಕ್ಕೆ ಅಗತ್ಯವಾದ ಸೂಕ್ತ ವಿಟಮಿನ್ ಮಟ್ಟಗಳು.",
      specimen: "ಸೀರಮ್",
      category: "ವೆಲ್‌ನೆಸ್",
      prescribedBy: "ಡಾ. ಅರ್ಜುನ್ ಮೆಹ್ತಾ (ನ್ಯೂರಾಲಜಿ)",
    },
    hi: {
      testName: "विटामिन D3 (25-OH) एवं विटामिन B12 स्वास्थ्य पैनल",
      summary: "हड्डियों और तंत्रिका तंत्र के लिए पर्याप्त विटामिन स्तर।",
      specimen: "सीरम",
      category: "वेलनेस",
      prescribedBy: "डॉ. अर्जुन मेहता (न्यूरोलॉजी)",
    },
  },
};

export default function LabReports() {
  const { language, t } = useLanguage();
  const [reports] = useState(DEFAULT_LAB_REPORTS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeReport, setActiveReport] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookSuccessMsg, setBookSuccessMsg] = useState("");

  const [bookingForm, setBookingForm] = useState({
    testName: "Full Body Essential Health Checkup (64 Parameters)",
    patientName: "",
    phone: "",
    address: "",
    date: new Date().toLocaleDateString("en-CA"),
    slot: "07:30 AM - 09:30 AM (Fasting Sample)",
  });

  const categories = [
    { key: "All", labelKey: "catAll" },
    { key: "Hematology", labelKey: "catHematology" },
    { key: "Cardiology", labelKey: "catCardiology" },
    { key: "Dermatology", labelKey: "catDermatology" },
    { key: "Endocrinology", labelKey: "catEndocrinology" },
    { key: "Wellness", labelKey: "catWellness" },
  ];

  const getReportDetails = (report) => {
    const loc = LOCALIZED_REPORTS[report.id]?.[language];
    return {
      ...report,
      testName: loc?.testName || report.testName,
      summary: loc?.summary || report.summary,
      specimen: loc?.specimen || report.specimen,
      prescribedBy: loc?.prescribedBy || report.prescribedBy,
      categoryDisplay: loc?.category || t(report.categoryKey) || report.category,
      statusDisplay:
        report.status === "Normal"
          ? t("statusNormal")
          : report.status === "Optimal"
          ? t("statusOptimal")
          : t("statusAttention"),
    };
  };

  const filteredReports = reports
    .filter((r) => (selectedCategory === "All" ? true : r.category === selectedCategory))
    .map(getReportDetails);

  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.patientName || !bookingForm.phone) return;

    setBookSuccessMsg(
      `Appointment booked for ${bookingForm.patientName}! A certified phlebotomist will arrive on ${bookingForm.date} between ${bookingForm.slot}.`
    );

    setTimeout(() => {
      setShowBookModal(false);
      setBookSuccessMsg("");
    }, 2800);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeLocalized = activeReport ? getReportDetails(activeReport) : null;

  return (
    <div className="lab-reports-container">
      {/* Header */}
      <div className="lab-header">
        <div>
          <div className="lab-badge">
            <FlaskConical size={14} />
            <span>{t("certifiedPathology")}</span>
          </div>
          <h2>{t("labPortalTitle")}</h2>
          <p>{t("labPortalSub")}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowBookModal(true)}
          className="book-test-btn"
        >
          <Plus size={16} />
          <span>{t("bookHomeSample")}</span>
        </button>
      </div>

      {/* Summary Stats Row */}
      <div className="lab-stats-row">
        <div className="lab-stat-card">
          <span className="stat-label">{t("totalCompletedTests")}</span>
          <strong className="stat-val">{reports.length} {t("reportsCount")}</strong>
        </div>
        <div className="lab-stat-card">
          <span className="stat-label">{t("optimalAndNormal")}</span>
          <strong className="stat-val green">
            {reports.filter((r) => r.status === "Normal" || r.status === "Optimal").length} {t("testsCount")} ✓
          </strong>
        </div>
        <div className="lab-stat-card">
          <span className="stat-label">{t("attentionReview")}</span>
          <strong className="stat-val amber">
            {reports.filter((r) => r.status === "Attention").length} {t("testsCount")}
          </strong>
        </div>
        <div className="lab-stat-card">
          <span className="stat-label">{t("accreditation")}</span>
          <strong className="stat-val">{t("nablCapCertified")}</strong>
        </div>
      </div>

      {/* Category Pills */}
      <div className="lab-category-pills">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`cat-pill ${selectedCategory === cat.key ? "active" : ""}`}
          >
            {t(cat.labelKey)} {cat.key === "All" ? `(${reports.length})` : ""}
          </button>
        ))}
      </div>

      {/* Report Cards Grid */}
      <div className="reports-grid">
        {filteredReports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-card-top">
              <div className="report-card-meta">
                <span className="ref-tag">{report.id}</span>
                <span className="cat-tag">{report.categoryDisplay}</span>
              </div>
              <span className={`status-pill ${report.status.toLowerCase()}`}>
                {report.status === "Normal" && <CheckCircle2 size={12} />}
                {report.status === "Optimal" && <CheckCircle2 size={12} />}
                {report.status === "Attention" && <AlertCircle size={12} />}
                <span>{report.statusDisplay}</span>
              </span>
            </div>

            <div className="report-card-body">
              <h3>{report.testName}</h3>
              <p className="report-summary">{report.summary}</p>

              <div className="report-details-list">
                <div className="detail-row">
                  <span className="dt-lbl">{t("doctorLabel")}:</span>
                  <span className="dt-val">{report.prescribedBy}</span>
                </div>
                <div className="detail-row">
                  <span className="dt-lbl">{t("sampleDate")}:</span>
                  <span className="dt-val">{report.collectedDate}</span>
                </div>
                <div className="detail-row">
                  <span className="dt-lbl">{t("specimen")}:</span>
                  <span className="dt-val">{report.specimen}</span>
                </div>
              </div>

              {/* Sample Parameter Chips Preview */}
              <div className="params-preview">
                {report.parameters.slice(0, 3).map((param, idx) => (
                  <span key={idx} className="param-chip">
                    {param.name}: <strong>{param.value} {param.unit}</strong>
                  </span>
                ))}
              </div>
            </div>

            <div className="report-card-actions">
              <button
                type="button"
                onClick={() => setActiveReport(report)}
                className="view-report-btn"
              >
                <FileText size={14} />
                <span>{t("viewFullReport")}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Official Lab Report Modal */}
      {activeLocalized && (
        <div className="lab-modal-overlay" onClick={() => setActiveReport(null)}>
          <div className="lab-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Header Actions */}
            <div className="modal-bar-actions no-print">
              <div className="actions-left">
                <ShieldCheck size={18} color="#087f8c" />
                <span>{t("verifiedPathologyReport")}</span>
              </div>
              <div className="actions-right">
                <button type="button" onClick={handlePrint} className="print-btn">
                  <Printer size={15} />
                  <span>{t("printSavePdf")}</span>
                </button>
                <button type="button" onClick={() => setActiveReport(null)} className="close-btn">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Printable Pathology Letterhead */}
            <div className="lab-printable-paper">
              <div className="lab-letterhead">
                <div className="lab-brand">
                  <Microscope size={32} color="#087f8c" />
                  <div>
                    <h2>{activeLocalized.labName}</h2>
                    <p>Department of Clinical Pathology & Molecular Diagnostics</p>
                    <span className="accred-badge">🏥 {activeLocalized.accreditation} • ISO 15189:2022</span>
                  </div>
                </div>
                <div className="lab-report-ref">
                  <strong>ACCESSION: {activeLocalized.id}</strong>
                  <span>Collected: {activeLocalized.collectedDate}</span>
                  <span>Reported: {activeLocalized.reportedDate}</span>
                </div>
              </div>

              <div className="lab-patient-box">
                <div className="patient-col">
                  <div><span className="lbl">{t("patientName")}:</span> <strong>John Doe</strong></div>
                  <div><span className="lbl">Age / Gender:</span> 34 Yrs / Male</div>
                  <div><span className="lbl">Ref. {t("doctorLabel")}:</span> {activeLocalized.prescribedBy}</div>
                </div>
                <div className="patient-col">
                  <div><span className="lbl">{t("specimen")}:</span> {activeLocalized.specimen}</div>
                  <div><span className="lbl">Test Category:</span> {activeLocalized.categoryDisplay}</div>
                  <div><span className="lbl">Status:</span> <strong>{activeLocalized.statusDisplay}</strong></div>
                </div>
              </div>

              <h3 className="section-title">{activeLocalized.testName}</h3>

              {/* Biomarkers Table */}
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>Test / Biomarker Parameter</th>
                    <th>Observed Result</th>
                    <th>Biological Reference Interval</th>
                    <th>Unit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLocalized.parameters.map((p, i) => (
                    <tr key={i} className={p.status === "attention" ? "row-attention" : ""}>
                      <td className="param-name">{p.name}</td>
                      <td className="param-value"><strong>{p.value}</strong></td>
                      <td className="param-range">{p.range}</td>
                      <td className="param-unit">{p.unit}</td>
                      <td>
                        <span className={`param-status-tag ${p.status}`}>
                          {p.status === "normal" && `${t("statusNormal")} ✓`}
                          {p.status === "optimal" && `${t("statusOptimal")} ✓`}
                          {p.status === "attention" && `${t("statusAttention")} ⚠`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="lab-interpretation-box">
                <strong>Clinical Interpretation & Notes:</strong>
                <p>{activeLocalized.summary}</p>
                <p className="disclaimer">
                  * Clinical correlation with patient's medical history is recommended. All laboratory investigations are subjected to pre-analytical and biological variations.
                </p>
              </div>

              {/* Signatures */}
              <div className="lab-signatures">
                <div className="sig-block">
                  <span className="sig-line">Dr. Sunita Sharma, MD</span>
                  <span>Consultant Pathologist</span>
                  <span className="reg">Reg No: KMC-74102</span>
                </div>
                <div className="sig-block">
                  <span className="sig-line">Dr. Rajesh Patel, MD, FRCPath</span>
                  <span>Chief of Laboratory Medicine</span>
                  <span className="reg">Reg No: MCI-55291</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Home Sample Collection Modal */}
      {showBookModal && (
        <div className="lab-modal-overlay" onClick={() => setShowBookModal(false)}>
          <div className="book-sample-card" onClick={(e) => e.stopPropagation()}>
            <div className="book-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#087f8c" }}>
                <FlaskConical size={22} />
                <h3 style={{ margin: 0, fontSize: "17px", color: "#172b4d" }}>{t("bookPhlebotomistModalTitle")}</h3>
              </div>
              <button type="button" onClick={() => setShowBookModal(false)} className="close-btn">
                ✕
              </button>
            </div>

            {bookSuccessMsg ? (
              <div className="book-success-box">
                <CheckCircle2 size={44} color="#10b981" />
                <h4>Sample Collection Scheduled!</h4>
                <p>{bookSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="book-sample-form">
                <div className="form-group">
                  <label>{t("testPackage")}</label>
                  <select
                    value={bookingForm.testName}
                    onChange={(e) => setBookingForm({ ...bookingForm, testName: e.target.value })}
                  >
                    <option value="Full Body Essential Health Checkup (64 Parameters)">
                      Full Body Essential Health Checkup (64 Parameters) - ₹999
                    </option>
                    <option value="Advanced Cardiac Lipid & CRP Profile">
                      Advanced Cardiac Lipid & CRP Profile - ₹799
                    </option>
                    <option value="Complete Allergy & IgE Dermatology Panel">
                      Complete Allergy & IgE Dermatology Panel - ₹899
                    </option>
                    <option value="Diabetes HbA1c & Fasting Insulin Package">
                      Diabetes HbA1c & Fasting Insulin Package - ₹599
                    </option>
                    <option value="Complete Vitamin D3 & B12 Vitality Panel">
                      Complete Vitamin D3 & B12 Vitality Panel - ₹699
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t("patientName")} *</label>
                  <input
                    type="text"
                    value={bookingForm.patientName}
                    onChange={(e) => setBookingForm({ ...bookingForm, patientName: e.target.value })}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t("phoneNum")} *</label>
                    <input
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("preferredDate")}</label>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t("timeSlot")}</label>
                  <select
                    value={bookingForm.slot}
                    onChange={(e) => setBookingForm({ ...bookingForm, slot: e.target.value })}
                  >
                    <option value="07:00 AM - 08:30 AM (Fasting Sample)">07:00 AM - 08:30 AM (Fasting Sample)</option>
                    <option value="08:30 AM - 10:00 AM (Fasting Sample)">08:30 AM - 10:00 AM (Fasting Sample)</option>
                    <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t("homeAddress")}</label>
                  <textarea
                    rows={2}
                    value={bookingForm.address}
                    onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                    placeholder="Enter complete residential address, flat/house number, landmark..."
                    required
                  />
                </div>

                <button type="submit" className="confirm-book-btn">
                  {t("confirmVisitBtn")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
