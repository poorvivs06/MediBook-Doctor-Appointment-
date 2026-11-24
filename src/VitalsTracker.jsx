import React, { useState, useEffect } from "react";
import {
  Activity,
  Heart,
  Droplet,
  Plus,
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  X,
  Gauge,
  Scale,
  Wind,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import "./VitalsTracker.css";

const INITIAL_VITALS = [
  {
    id: "vital-1",
    date: "2026-11-24",
    time: "08:15 AM",
    bpSystolic: 118,
    bpDiastolic: 76,
    bpStatus: "optimal", // optimal | normal | attention
    bloodSugar: 92,
    sugarType: "Fasting", // Fasting | Post-Meal
    sugarStatus: "normal",
    pulse: 72,
    pulseStatus: "normal",
    spo2: 99,
    spo2Status: "optimal",
    weight: 64.5,
    notes: "Felt refreshed, recorded before morning breakfast.",
  },
  {
    id: "vital-2",
    date: "2026-11-22",
    time: "07:45 AM",
    bpSystolic: 122,
    bpDiastolic: 79,
    bpStatus: "normal",
    bloodSugar: 96,
    sugarType: "Fasting",
    sugarStatus: "normal",
    pulse: 74,
    pulseStatus: "normal",
    spo2: 98,
    spo2Status: "optimal",
    weight: 64.8,
    notes: "Normal morning reading.",
  },
  {
    id: "vital-3",
    date: "2026-11-19",
    time: "02:30 PM",
    bpSystolic: 128,
    bpDiastolic: 84,
    bpStatus: "attention",
    bloodSugar: 135,
    sugarType: "Post-Meal",
    sugarStatus: "normal",
    pulse: 82,
    pulseStatus: "normal",
    spo2: 98,
    spo2Status: "optimal",
    weight: 65.0,
    notes: "Post-lunch checkup after short walk.",
  },
];

export default function VitalsTracker() {
  const { language, t } = useLanguage();

  const [vitalsList, setVitalsList] = useState(() => {
    try {
      const saved = localStorage.getItem("medibook_patient_vitals");
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_VITALS;
  });

  const [showLogModal, setShowLogModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    bpSystolic: 120,
    bpDiastolic: 80,
    bloodSugar: 95,
    sugarType: "Fasting",
    pulse: 72,
    spo2: 98,
    weight: 65,
    notes: "",
  });

  const saveVitals = (newList) => {
    setVitalsList(newList);
    try {
      localStorage.setItem("medibook_patient_vitals", JSON.stringify(newList));
    } catch {}
  };

  const calculateBpStatus = (sys, dia) => {
    if (sys < 120 && dia < 80) return "optimal";
    if (sys <= 129 && dia < 80) return "normal";
    return "attention";
  };

  const calculateSugarStatus = (val, type) => {
    if (type === "Fasting") {
      if (val < 100) return "normal";
      if (val <= 125) return "attention";
      return "attention";
    }
    // Post-Meal
    if (val < 140) return "normal";
    return "attention";
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    const sys = Number(form.bpSystolic);
    const dia = Number(form.bpDiastolic);
    const sugar = Number(form.bloodSugar);
    const pulse = Number(form.pulse);
    const spo2 = Number(form.spo2);
    const weight = Number(form.weight);

    const now = new Date();
    const newEntry = {
      id: `vital-${Date.now()}`,
      date: now.toLocaleDateString("en-CA"),
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      bpSystolic: sys,
      bpDiastolic: dia,
      bpStatus: calculateBpStatus(sys, dia),
      bloodSugar: sugar,
      sugarType: form.sugarType,
      sugarStatus: calculateSugarStatus(sugar, form.sugarType),
      pulse: pulse,
      pulseStatus: pulse >= 60 && pulse <= 100 ? "normal" : "attention",
      spo2: spo2,
      spo2Status: spo2 >= 95 ? "optimal" : "attention",
      weight: weight,
      notes: form.notes.trim() || "Daily log entry",
    };

    const updated = [newEntry, ...vitalsList];
    saveVitals(updated);
    setShowLogModal(false);
    setSuccessMsg(language === "kn" ? "ಹೊಸ ವೈಟಲ್ಸ್ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ!" : language === "hi" ? "नए वाइटल्स सफलतापूर्वक दर्ज किए गए!" : "New vitals entry logged successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleDelete = (id) => {
    const updated = vitalsList.filter((v) => v.id !== id);
    saveVitals(updated);
  };

  // Latest reading
  const latest = vitalsList[0] || INITIAL_VITALS[0];

  const getStatusText = (status) => {
    if (status === "optimal") return t("statusOptimal");
    if (status === "normal") return t("statusNormal");
    return t("statusAttention");
  };

  return (
    <div className="vitals-tracker-container">
      {/* Header */}
      <div className="vitals-header-bar">
        <div>
          <div className="vitals-badge">
            <Activity size={14} />
            <span>DAILY CLINICAL BIOMARKERS</span>
          </div>
          <h2>{t("vitalsTitle")}</h2>
          <p>{t("vitalsSub")}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogModal(true)}
          className="log-vitals-btn"
        >
          <Plus size={16} />
          <span>{t("logVitalsBtn")}</span>
        </button>
      </div>

      {successMsg && (
        <div className="vitals-success-banner">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Latest Vitals Metric Cards Grid */}
      <div className="vitals-metric-grid">
        {/* 1. Blood Pressure Card */}
        <div className="vital-card">
          <div className="vital-card-top">
            <div className="vital-icon bp">
              <Activity size={20} />
            </div>
            <span className={`vital-status-pill ${latest.bpStatus}`}>
              {getStatusText(latest.bpStatus)}
            </span>
          </div>
          <span className="vital-title">{t("bloodPressure")}</span>
          <div className="vital-value-row">
            <strong>{latest.bpSystolic} / {latest.bpDiastolic}</strong>
            <span className="vital-unit">mmHg</span>
          </div>
          <div className="vital-guide-text">
            <span>Standard Target: &lt; 120/80 mmHg</span>
          </div>
        </div>

        {/* 2. Blood Sugar / Glucose Card */}
        <div className="vital-card">
          <div className="vital-card-top">
            <div className="vital-icon sugar">
              <Droplet size={20} />
            </div>
            <span className={`vital-status-pill ${latest.sugarStatus}`}>
              {getStatusText(latest.sugarStatus)}
            </span>
          </div>
          <span className="vital-title">{t("bloodSugar")}</span>
          <div className="vital-value-row">
            <strong>{latest.bloodSugar}</strong>
            <span className="vital-unit">mg/dL</span>
          </div>
          <div className="vital-guide-text">
            <span>{latest.sugarType} (Target: &lt; 100 Fasting)</span>
          </div>
        </div>

        {/* 3. Heart Rate / Pulse Card */}
        <div className="vital-card">
          <div className="vital-card-top">
            <div className="vital-icon heart">
              <Heart size={20} />
            </div>
            <span className={`vital-status-pill ${latest.pulseStatus}`}>
              {getStatusText(latest.pulseStatus)}
            </span>
          </div>
          <span className="vital-title">{t("heartRate")}</span>
          <div className="vital-value-row">
            <strong>{latest.pulse}</strong>
            <span className="vital-unit">bpm</span>
          </div>
          <div className="vital-guide-text">
            <span>Resting Target: 60 - 100 bpm</span>
          </div>
        </div>

        {/* 4. Oxygen Saturation (SpO2) Card */}
        <div className="vital-card">
          <div className="vital-card-top">
            <div className="vital-icon spo2">
              <Wind size={20} />
            </div>
            <span className={`vital-status-pill ${latest.spo2Status}`}>
              {getStatusText(latest.spo2Status)}
            </span>
          </div>
          <span className="vital-title">{t("oxygenLevel")}</span>
          <div className="vital-value-row">
            <strong>{latest.spo2}%</strong>
            <span className="vital-unit">SpO2</span>
          </div>
          <div className="vital-guide-text">
            <span>Optimal Range: 95% - 100%</span>
          </div>
        </div>

        {/* 5. Body Weight Card */}
        <div className="vital-card">
          <div className="vital-card-top">
            <div className="vital-icon weight">
              <Scale size={20} />
            </div>
            <span className="vital-status-pill normal">
              {t("statusNormal")}
            </span>
          </div>
          <span className="vital-title">{t("bodyWeight")}</span>
          <div className="vital-value-row">
            <strong>{latest.weight}</strong>
            <span className="vital-unit">kg</span>
          </div>
          <div className="vital-guide-text">
            <span>Est. BMI: ~22.4 (Healthy Index)</span>
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="vitals-history-card">
        <div className="vitals-history-header">
          <h3>{t("vitalsHistory")}</h3>
          <span className="total-logs-tag">{vitalsList.length} Entries Recorded</span>
        </div>

        <div className="vitals-table-wrapper">
          <table className="vitals-table">
            <thead>
              <tr>
                <th>{language === "kn" ? "ದಿನಾಂಕ & ಸಮಯ" : language === "hi" ? "तारीख एवं समय" : "Date & Time"}</th>
                <th>{t("bloodPressure")}</th>
                <th>{t("bloodSugar")}</th>
                <th>{t("heartRate")}</th>
                <th>{t("oxygenLevel")}</th>
                <th>{t("bodyWeight")}</th>
                <th>{language === "kn" ? "ಟಿಪ್ಪಣಿಗಳು" : language === "hi" ? "नोट्स" : "Notes"}</th>
                <th>{language === "kn" ? "ಕ್ರಮ" : language === "hi" ? "कार्रवाई" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {vitalsList.map((entry) => (
                <tr key={entry.id}>
                  <td className="time-col">
                    <strong>{entry.date}</strong>
                    <span>{entry.time}</span>
                  </td>
                  <td>
                    <span className="bold-val">{entry.bpSystolic}/{entry.bpDiastolic} mmHg</span>
                    <span className={`micro-status ${entry.bpStatus}`}>{getStatusText(entry.bpStatus)}</span>
                  </td>
                  <td>
                    <span className="bold-val">{entry.bloodSugar} mg/dL</span>
                    <span className="sugar-badge">{entry.sugarType}</span>
                  </td>
                  <td>
                    <span className="bold-val">{entry.pulse} bpm</span>
                  </td>
                  <td>
                    <span className="bold-val">{entry.spo2}%</span>
                  </td>
                  <td>
                    <span className="bold-val">{entry.weight} kg</span>
                  </td>
                  <td className="notes-col">
                    <span>{entry.notes || "—"}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="delete-vital-btn"
                      title="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log New Vitals Modal */}
      {showLogModal && (
        <div className="modal-overlay-card" onClick={() => setShowLogModal(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card-header">
              <h3>{t("logVitalsBtn")}</h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="close-modal-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="vitals-form">
              <div className="form-row">
                <div className="form-group">
                  <label>{t("systolicBp")} (mmHg)</label>
                  <input
                    type="number"
                    required
                    min="70"
                    max="220"
                    value={form.bpSystolic}
                    onChange={(e) => setForm({ ...form, bpSystolic: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t("diastolicBp")} (mmHg)</label>
                  <input
                    type="number"
                    required
                    min="40"
                    max="140"
                    value={form.bpDiastolic}
                    onChange={(e) => setForm({ ...form, bpDiastolic: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t("bloodSugar")} (mg/dL)</label>
                  <input
                    type="number"
                    required
                    min="40"
                    max="450"
                    value={form.bloodSugar}
                    onChange={(e) => setForm({ ...form, bloodSugar: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{language === "kn" ? "ಪರೀಕ್ಷಾ ಪ್ರಕಾರ" : language === "hi" ? "टेस्ट प्रकार" : "Test Type"}</label>
                  <select
                    value={form.sugarType}
                    onChange={(e) => setForm({ ...form, sugarType: e.target.value })}
                  >
                    <option value="Fasting">{t("fastingSugar")}</option>
                    <option value="Post-Meal">{t("postMealSugar")}</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t("heartRate")} (bpm)</label>
                  <input
                    type="number"
                    required
                    min="40"
                    max="180"
                    value={form.pulse}
                    onChange={(e) => setForm({ ...form, pulse: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t("oxygenLevel")} (%)</label>
                  <input
                    type="number"
                    required
                    min="80"
                    max="100"
                    value={form.spo2}
                    onChange={(e) => setForm({ ...form, spo2: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group full">
                <label>{t("bodyWeight")} (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="20"
                  max="250"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <label>{language === "kn" ? "ಕ್ಲಿನಿಕಲ್ ಟಿಪ್ಪಣಿಗಳು / ಲಕ್ಷಣಗಳು" : language === "hi" ? "क्लिनिकल नोट्स / लक्षण" : "Clinical Notes / Symptoms"}</label>
                <input
                  type="text"
                  placeholder="e.g. Normal morning reading, no dizziness..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="cancel-modal-btn"
                >
                  {t("cancelBtn")}
                </button>
                <button type="submit" className="save-modal-btn">
                  {t("saveVitals")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
