import React, { useState, useEffect } from "react";
import { Pill, CheckCircle, Clock, Plus, Trash2, Bell, AlertCircle, Sun, Sunset, Moon } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import "./MedicineTracker.css";

const DEFAULT_MEDICINES = [
  {
    id: "med-1",
    name: "Cetirizine 10mg",
    purpose: "Skin Allergy & Itching Relief",
    doctor: "Poorvi (Dermatology)",
    dosage: "1 Tablet",
    timing: "night",
    notes: "Take after dinner with a full glass of water",
    taken: false,
  },
  {
    id: "med-2",
    name: "Atorvastatin 10mg",
    purpose: "Cardiovascular Health",
    doctor: "Dr. Suresh (Cardiology)",
    dosage: "1 Tablet",
    timing: "night",
    notes: "Take at bedtime regularly",
    taken: true,
  },
  {
    id: "med-3",
    name: "Vitamin C + Zinc 500mg",
    purpose: "Immunity & Wellness",
    doctor: "Dr. Vani (Pediatrics)",
    dosage: "1 Chewable",
    timing: "morning",
    notes: "Take after morning breakfast",
    taken: true,
  },
];

export default function MedicineTracker() {
  const { language, t } = useLanguage();
  const [medicines, setMedicines] = useState([]);
  const [timingFilter, setTimingFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    name: "",
    purpose: "",
    dosage: "1 Tablet",
    timing: "morning",
    notes: "",
  });

  // Load from localStorage or defaults
  useEffect(() => {
    try {
      const saved = localStorage.getItem("medibook_medicines");
      if (saved) {
        setMedicines(JSON.parse(saved));
      } else {
        setMedicines(DEFAULT_MEDICINES);
        localStorage.setItem("medibook_medicines", JSON.stringify(DEFAULT_MEDICINES));
      }
    } catch {
      setMedicines(DEFAULT_MEDICINES);
    }
  }, []);

  const saveMeds = (updated) => {
    setMedicines(updated);
    try {
      localStorage.setItem("medibook_medicines", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save medicines:", err);
    }
  };

  const toggleTaken = (id) => {
    const updated = medicines.map((m) =>
      m.id === id ? { ...m, taken: !m.taken } : m
    );
    saveMeds(updated);
  };

  const deleteMed = (id) => {
    const updated = medicines.filter((m) => m.id !== id);
    saveMeds(updated);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newMed.name.trim()) return;

    const medToAdd = {
      id: `med-${Date.now()}`,
      name: newMed.name.trim(),
      purpose: newMed.purpose.trim() || "General Health",
      doctor: "Prescribed / Self Care",
      dosage: newMed.dosage.trim(),
      timing: newMed.timing,
      notes: newMed.notes.trim() || "Take as directed",
      taken: false,
    };

    saveMeds([...medicines, medToAdd]);
    setNewMed({ name: "", purpose: "", dosage: "1 Tablet", timing: "morning", notes: "" });
    setShowAddModal(false);
  };

  const takenCount = medicines.filter((m) => m.taken).length;
  const progressPercent = medicines.length > 0 ? Math.round((takenCount / medicines.length) * 100) : 0;
  const visibleMeds = timingFilter === "all" ? medicines : medicines.filter((m) => m.timing === timingFilter);

  return (
    <div className="medicine-tracker-container">
      {/* Header Bar */}
      <div className="tracker-header">
        <div>
          <div className="tracker-badge">
            <Pill size={14} />
            <span>{t("digitalMedicineCabinet")}</span>
          </div>
          <h2>{t("medCabinetTitle")}</h2>
          <p>{t("medCabinetSub")}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="add-med-btn"
        >
          <Plus size={16} />
          <span>{t("addMedicine")}</span>
        </button>
      </div>

      {/* Daily Compliance Progress Card */}
      <div className="compliance-card">
        <div className="compliance-text">
          <div className="compliance-left">
            <strong>{t("dailyAdherence")}</strong>
            <span className="compliance-sub">{takenCount} of {medicines.length} {t("taken").toLowerCase()}</span>
          </div>
          <span className="compliance-pct-pill">{progressPercent}% Completed</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Time-of-Day Filter Pills */}
      <div className="med-timing-filters">
        <button type="button" onClick={() => setTimingFilter("all")} className={`med-filter-pill ${timingFilter === "all" ? "active" : ""}`}>
          All Schedule ({medicines.length})
        </button>
        <button type="button" onClick={() => setTimingFilter("morning")} className={`med-filter-pill ${timingFilter === "morning" ? "active" : ""}`}>
          <Sun size={13} /> {t("morning")}
        </button>
        <button type="button" onClick={() => setTimingFilter("afternoon")} className={`med-filter-pill ${timingFilter === "afternoon" ? "active" : ""}`}>
          <Sunset size={13} /> {t("afternoon")}
        </button>
        <button type="button" onClick={() => setTimingFilter("night")} className={`med-filter-pill ${timingFilter === "night" ? "active" : ""}`}>
          <Moon size={13} /> {t("night")}
        </button>
      </div>

      {/* Medicine Cards Grid */}
      <div className="medicines-grid">
        {visibleMeds.map((med) => (
          <div key={med.id} className={`med-card ${med.taken ? "completed" : ""}`}>
            <div className="med-card-top">
              <div className={`med-timing-badge timing-${med.timing}`}>
                {med.timing === "morning" && <><Sun size={13} /> {t("morning")}</>}
                {med.timing === "afternoon" && <><Sunset size={13} /> {t("afternoon")}</>}
                {med.timing === "night" && <><Moon size={13} /> {t("night")}</>}
              </div>
              <button
                type="button"
                onClick={() => deleteMed(med.id)}
                className="med-del-btn"
                title="Remove reminder"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="med-info">
              <h3>{med.name}</h3>
              <span className="med-purpose">{med.purpose}</span>
              <span className="med-dosage">{language === "kn" ? "ಡೋಸೇಜ್:" : language === "hi" ? "खुराक:" : "Dosage:"} <strong>{med.dosage}</strong></span>
              {med.doctor && <span className="med-doctor">Dr: {med.doctor}</span>}
              {med.notes && <p className="med-notes">💡 {med.notes}</p>}
            </div>

            <button
              type="button"
              onClick={() => toggleTaken(med.id)}
              className={`take-toggle-btn ${med.taken ? "taken" : ""}`}
            >
              <CheckCircle size={16} />
              <span>{med.taken ? `${t("taken")} ✓` : t("markTaken")}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Add Custom Medicine Modal */}
      {showAddModal && (
        <div className="add-med-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-med-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Medication Reminder</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="add-med-form">
              <div className="form-group">
                <label>Medicine Name *</label>
                <input
                  type="text"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  placeholder="e.g. Paracetamol 500mg"
                  required
                />
              </div>

              <div className="form-group">
                <label>Health Purpose</label>
                <input
                  type="text"
                  value={newMed.purpose}
                  onChange={(e) => setNewMed({ ...newMed, purpose: e.target.value })}
                  placeholder="e.g. Fever, Blood Pressure, Allergy"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    type="text"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    placeholder="e.g. 1 Tablet"
                  />
                </div>

                <div className="form-group">
                  <label>Timing</label>
                  <select
                    value={newMed.timing}
                    onChange={(e) => setNewMed({ ...newMed, timing: e.target.value })}
                  >
                    <option value="morning">Morning ☀️</option>
                    <option value="afternoon">Afternoon 🌤️</option>
                    <option value="night">Night 🌙</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Doctor's Instructions</label>
                <input
                  type="text"
                  value={newMed.notes}
                  onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
                  placeholder="e.g. Take after food with warm water"
                />
              </div>

              <button type="submit" className="save-med-btn">
                Save Medicine Reminder 💊
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
