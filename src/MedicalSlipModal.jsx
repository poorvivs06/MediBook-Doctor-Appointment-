import React from "react";
import { Printer, Download, X, HeartPulse, ShieldCheck, CheckCircle2 } from "lucide-react";
import "./MedicalSlip.css";

export default function MedicalSlipModal({ appointment, onClose }) {
  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const refCode = appointment.referenceCode || appointment.reference_code || "MED-" + Math.floor(1000 + Math.random() * 9000);
  const doctorName = appointment.doctorName || appointment.doctor_name || "Specialist Doctor";
  const specialty = appointment.doctorSpecialty || appointment.doctor_specialty || "Medical Specialist";
  const hospital = appointment.doctorHospital || appointment.doctor_hospital || "MediBook Healthcare Center";
  const fee = appointment.doctorFee || appointment.doctor_fee || "₹500";
  const patientName = appointment.patientName || appointment.patient_name || "Patient";
  const email = appointment.patientEmail || appointment.patient_email || "N/A";
  const phone = appointment.patientPhone || appointment.patient_phone || "N/A";
  const date = appointment.appointmentDate || appointment.appointment_date || new Date().toISOString().split("T")[0];
  const time = appointment.appointmentTime || appointment.appointment_time || "10:00 AM";
  const reason = appointment.reason || "General Medical Consultation & Examination";
  const createdAt = appointment.createdAt || appointment.created_at || new Date().toLocaleDateString();

  return (
    <div className="medical-slip-overlay" onClick={onClose}>
      <div className="medical-slip-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Action Header (Hidden in Print) */}
        <div className="modal-actions-bar no-print">
          <div className="actions-left">
            <span className="slip-modal-title">Official Medical Appointment Slip</span>
          </div>
          <div className="actions-right">
            <button type="button" onClick={handlePrint} className="print-btn">
              <Printer size={16} />
              <span>Print / Save as PDF</span>
            </button>
            <button type="button" onClick={onClose} className="close-btn" aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Paper Slip */}
        <div className="slip-paper" id="printable-medical-slip">
          
          {/* Slip Header */}
          <div className="slip-header">
            <div className="slip-brand">
              <div className="slip-logo-icon">
                <HeartPulse size={26} color="#087f8c" />
              </div>
              <div>
                <h2>MediBook Healthcare System</h2>
                <p>NABH & HIPAA Accredited Digital Health Network</p>
              </div>
            </div>
            <div className="slip-ref-box">
              <span className="ref-tag">APPOINTMENT TOKEN</span>
              <strong className="ref-number">{refCode}</strong>
              <span className="issued-date">Date Issued: {createdAt}</span>
            </div>
          </div>

          <div className="slip-divider"></div>

          {/* Status Ribbon */}
          <div className="slip-status-ribbon">
            <div className="status-indicator">
              <CheckCircle2 size={16} color="#16a34a" />
              <span>STATUS: <strong>CONFIRMED & SCHEDULED</strong></span>
            </div>
            <div className="security-tag">
              <ShieldCheck size={14} color="#087f8c" />
              <span>Digital Verification ID: #{refCode.replace("MED-", "")}-V26</span>
            </div>
          </div>

          {/* 2-Column Information Grid */}
          <div className="slip-info-grid">
            
            {/* Doctor Column */}
            <div className="slip-info-col">
              <h4 className="col-title">CONSULTING PHYSICIAN</h4>
              <div className="info-row">
                <span className="label">Doctor Name:</span>
                <span className="value strong-val">{doctorName}</span>
              </div>
              <div className="info-row">
                <span className="label">Specialization:</span>
                <span className="value text-teal">{specialty}</span>
              </div>
              <div className="info-row">
                <span className="label">Clinic / Hospital:</span>
                <span className="value">{hospital}</span>
              </div>
              <div className="info-row">
                <span className="label">Consultation Fee:</span>
                <span className="value fee-highlight">{fee}</span>
              </div>
            </div>

            {/* Patient Column */}
            <div className="slip-info-col">
              <h4 className="col-title">PATIENT DETAILS</h4>
              <div className="info-row">
                <span className="label">Patient Name:</span>
                <span className="value strong-val">{patientName}</span>
              </div>
              <div className="info-row">
                <span className="label">Appointment Date:</span>
                <span className="value strong-val">{date}</span>
              </div>
              <div className="info-row">
                <span className="label">Scheduled Time:</span>
                <span className="value text-teal">{time}</span>
              </div>
              <div className="info-row">
                <span className="label">Contact Email:</span>
                <span className="value">{email}</span>
              </div>
              <div className="info-row">
                <span className="label">Contact Phone:</span>
                <span className="value">{phone}</span>
              </div>
            </div>

          </div>

          {/* Visit Reason & Clinical Notes */}
          <div className="slip-clinical-section">
            <h4 className="col-title">CLINICAL PURPOSE & SYMPTOMS</h4>
            <div className="reason-content-box">
              <p>{reason}</p>
            </div>
          </div>

          {/* Pre-Consultation Instructions & Rx */}
          <div className="slip-guidelines">
            <h4 className="col-title">IMPORTANT PATIENT INSTRUCTIONS</h4>
            <ul className="guidelines-list">
              <li>Please arrive at the clinic <strong>15 minutes prior</strong> to your scheduled time slot.</li>
              <li>Present this printed slip or show the digital token <strong>({refCode})</strong> at the reception desk.</li>
              <li>Bring previous medical prescriptions, laboratory reports, or diagnostic records for review.</li>
              <li>For teleconsultations, an encrypted video link will be activated in your portal 10 minutes prior.</li>
            </ul>
          </div>

          {/* Signature & Seal Footer */}
          <div className="slip-footer">
            <div className="footer-left">
              <p className="help-text">MediBook 24/7 Helpline: <strong>+91 98765 43210</strong></p>
              <p className="help-text">Email: <strong>support@medibook.com</strong> • Web: <strong>www.medibook.health</strong></p>
            </div>
            <div className="footer-right">
              <div className="digital-stamp">
                <span className="stamp-title">MEDIBOOK VERIFIED</span>
                <span className="stamp-sub">CLINICAL NETWORK</span>
              </div>
              <span className="signature-line">Authorized Medical Registrar</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
