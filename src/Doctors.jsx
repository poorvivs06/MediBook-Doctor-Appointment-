import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { doctors as defaultDoctors, getLocalizedDoctor } from "./doctorsData";
import { fetchDoctorsList } from "./supabase";
import { useLanguage } from "./LanguageContext";
import Navbar from "./Navbar";
import "./Doctors.css";

function Doctors() {
  const { language, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctorList, setDoctorList] = useState(defaultDoctors);

  // Read initial query from URL (e.g. ?search=Poorvi or ?specialty=Dermatology)
  const initialSearch = searchParams.get("search") || "";
  const initialSpecialty = searchParams.get("specialty") || "All Specializations";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);

  // Load doctors from Supabase if connected
  useEffect(() => {
    let mounted = true;
    fetchDoctorsList().then((res) => {
      if (mounted && Array.isArray(res) && res.length > 0) {
        setDoctorList(res);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Sync state if URL changes
  useEffect(() => {
    const q = searchParams.get("search") || "";
    const s = searchParams.get("specialty") || "All Specializations";
    setSearchTerm(q);
    setSelectedSpecialty(s);
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    if (selectedSpecialty && selectedSpecialty !== "All Specializations") {
      params.specialty = selectedSpecialty;
    }
    setSearchParams(params);
  };

  const handleSpecialtyChange = (e) => {
    const value = e.target.value;
    setSelectedSpecialty(value);
    const params = {};
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    if (value !== "All Specializations") {
      params.specialty = value;
    }
    setSearchParams(params);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedSpecialty("All Specializations");
    setSearchParams({});
  };

  // Localize and filter doctors
  const localizedList = doctorList.map((doc) => getLocalizedDoctor(doc, language));

  const filteredDoctors = localizedList.filter((doctor) => {
    const term = searchTerm.trim().toLowerCase();

    // Specialty filter match
    const matchesSpecialty =
      selectedSpecialty === "All Specializations" ||
      doctor.category?.toLowerCase() === selectedSpecialty.toLowerCase() ||
      doctor.specialty?.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
      (selectedSpecialty.toLowerCase().includes("derma") && (doctor.specialty?.toLowerCase().includes("derma") || doctor.category?.toLowerCase().includes("derma"))) ||
      (selectedSpecialty.toLowerCase().includes("cardio") && (doctor.specialty?.toLowerCase().includes("cardio") || doctor.category?.toLowerCase().includes("cardio"))) ||
      (selectedSpecialty.toLowerCase().includes("pediatr") && (doctor.specialty?.toLowerCase().includes("pediatr") || doctor.category?.toLowerCase().includes("pediatr")));

    // Keyword match across both English and translated fields
    const origDoctor = defaultDoctors.find((d) => d.id === doctor.id) || {};
    const matchesTerm =
      !term ||
      doctor.name.toLowerCase().includes(term) ||
      doctor.specialty.toLowerCase().includes(term) ||
      (doctor.about && doctor.about.toLowerCase().includes(term)) ||
      (origDoctor.name && origDoctor.name.toLowerCase().includes(term)) ||
      (origDoctor.specialty && origDoctor.specialty.toLowerCase().includes(term));

    return matchesSpecialty && matchesTerm;
  });

  const isFiltered = Boolean(searchTerm.trim() || selectedSpecialty !== "All Specializations");

  return (
    <div className="doctors-page">
      <Navbar />

      <section className="doctors-header">
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "#eaf8f8",
          padding: "6px 16px",
          borderRadius: "20px",
          color: "#087f8c",
          fontSize: "13px",
          fontWeight: "700",
          marginBottom: "10px",
        }}>
          <span className="wave-emoji" style={{ fontSize: "16px" }}>👋</span>
          <span>{t("topBannerWelcome")}</span>
        </div>
        <p>{t("findYourDoctor")}</p>
        <h1>{t("ourMedicalExperts")}</h1>
        <span>{t("ourExpertsSub")}</span>
      </section>

      {/* Working Search Form */}
      <form onSubmit={handleSearchSubmit} className="doctor-search" noValidate>
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={selectedSpecialty} onChange={handleSpecialtyChange}>
          <option value="All Specializations">{t("allSpecializations")}</option>
          <option value="Cardiology">{t("specialtyCardiology")}</option>
          <option value="Dermatology">{t("specialtyDermatology")}</option>
          <option value="Pediatrics">{t("specialtyPediatrics")}</option>
          <option value="Neurology">{t("specialtyNeurology")}</option>
          <option value="Dentistry">{t("specialtyDentistry")}</option>
          <option value="Ophthalmology">{t("specialtyOphthalmology")}</option>
        </select>

        <button type="submit">{t("searchBtn")}</button>
      </form>

      {/* Active filter status */}
      {isFiltered && (
        <div className="search-status-bar">
          <span>
            {t("showingResultsFor")}{" "}
            <strong>
              {searchTerm ? `"${searchTerm}"` : ""}
              {searchTerm && selectedSpecialty !== "All Specializations" ? " in " : ""}
              {selectedSpecialty !== "All Specializations" ? selectedSpecialty : ""}
            </strong>{" "}
            ({filteredDoctors.length} {t("doctorsFound")})
          </span>
          <button type="button" onClick={handleClearSearch} className="reset-inline-btn">
            {t("clearFilters")}
          </button>
        </div>
      )}

      {/* Doctor Cards Listing */}
      <section className="doctors-list">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <div className="doctor-box" key={doctor.id}>
              <div className="doctor-image">
                {doctor.photo}
              </div>

              <h2>{doctor.name}</h2>

              <p className="specialty">
                {doctor.specialty}
              </p>

              <p>{doctor.experience}</p>

              <div className="doctor-info">
                <span>⭐ {doctor.rating}</span>
                <span>{doctor.fee}</span>
              </div>

              {/* Working View Profile and Book Appointment buttons */}
              <div className="card-buttons">
                <Link to={`/doctor-profile/${doctor.id}`} className="view-profile-btn">
                  {t("viewProfile")}
                </Link>
                <Link to={`/appointment?doctor=${doctor.id}`} className="book-btn">
                  {t("book")}
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-doctors-container">
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
            <div className="no-doctors-title">{t("noDoctorsFound")}</div>
            <button type="button" onClick={handleClearSearch} className="clear-search-btn">
              {t("clearSearchShowAll")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Doctors;
