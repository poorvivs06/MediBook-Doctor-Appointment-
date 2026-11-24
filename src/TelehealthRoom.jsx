import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  FileText,
  ShieldCheck,
  Signal,
  Sparkles,
  Send,
  X,
  Volume2,
} from "lucide-react";
import DoctorDoll from "./DoctorDoll";
import "./TelehealthRoom.css";

export default function TelehealthRoom({
  appointment,
  onClose,
  onCompleteConsultation,
}) {
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [activeTab, setActiveTab] = useState(null); // "chat", "notes", or null
  const [seconds, setSeconds] = useState(14); // start slightly elapsed for realism
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "doctor",
      text: `Hello ${appointment?.patientName || "there"}! I'm ${appointment?.doctorName || "your doctor"}. I have reviewed your visit notes. How can I help you today?`,
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [
      ...prev,
      { sender: "patient", text: userText, time: "Just now" },
    ]);
    setChatInput("");

    // Simulated doctor live response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "doctor",
          text: `Thank you for sharing that. I am adding this to your official consultation chart and prescription summary.`,
          time: "Just now",
        },
      ]);
    }, 1200);
  };

  const handleEndCall = () => {
    const confirmEnd = window.confirm("Are you ready to conclude this telehealth consultation?");
    if (confirmEnd) {
      if (onCompleteConsultation) {
        onCompleteConsultation(appointment);
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="telehealth-overlay">
      <div className="telehealth-modal">
        {/* Top Header Bar */}
        <header className="telehealth-header">
          <div className="header-left">
            <span className="live-pill">
              <span className="live-dot"></span> LIVE TELEHEALTH
            </span>
            <div className="doctor-meta">
              <strong>{appointment?.doctorName || "Doctor Consultation"}</strong>
              <span>{appointment?.doctorSpecialty || "Medical Specialist"} • {appointment?.doctorHospital || "MediBook Hospital"}</span>
            </div>
          </div>

          <div className="header-center">
            <div className="timer-badge">
              <span>{formatTimer(seconds)}</span>
            </div>
          </div>

          <div className="header-right">
            <span className="security-tag" title="HIPAA Compliant WebRTC Stream">
              <ShieldCheck size={14} />
              <span>256-Bit Encrypted</span>
            </span>
            <span className="network-tag" title="HD Connection Stable">
              <Signal size={14} color="#10b981" />
              <span>HD 1080p</span>
            </span>
            <button type="button" onClick={onClose} className="telehealth-close-x" aria-label="Minimize">
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Video Area Grid */}
        <div className="telehealth-body">
          {/* Main Stage: Doctor Screen */}
          <div className="doctor-screen-stage">
            <div className="doctor-stream-view">
              {/* Doctor Avatar / Visualizer */}
              <div className="doctor-visual-center">
                <DoctorDoll
                  size={140}
                  speechText={`Consulting with ${appointment?.patientName || "Patient"}`}
                  showBadge={true}
                  interactive={false}
                />
                
                {/* Audio Wave Visualizer */}
                <div className="audio-wave-bar">
                  <Volume2 size={16} color="#087f8c" />
                  <span className="wave-bar wb-1"></span>
                  <span className="wave-bar wb-2"></span>
                  <span className="wave-bar wb-3"></span>
                  <span className="wave-bar wb-4"></span>
                  <span className="wave-bar wb-5"></span>
                  <span className="audio-label">Doctor Audio Connected</span>
                </div>
              </div>

              {/* Doctor Name Overlay */}
              <div className="stream-overlay-label">
                <span>👨‍⚕️ {appointment?.doctorName || "Specialist"} (Consulting Room #1)</span>
              </div>
            </div>

            {/* Patient Self Picture-in-Picture Camera */}
            <div className="patient-pip-window">
              <div className="pip-content">
                {cameraActive ? (
                  <div className="pip-video-placeholder">
                    <span className="pip-avatar-face">👤</span>
                    <span className="pip-label">{appointment?.patientName || "You"} (Camera On)</span>
                  </div>
                ) : (
                  <div className="pip-video-off">
                    <VideoOff size={24} color="#94a3b8" />
                    <span>Camera Muted</span>
                  </div>
                )}
                {!micActive && (
                  <div className="pip-mic-off-badge">
                    <MicOff size={12} color="#ef4444" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Drawer: Chat or Clinical Notes */}
          {activeTab && (
            <aside className="telehealth-side-drawer">
              <div className="drawer-header">
                <h3>{activeTab === "chat" ? "Consultation Chat" : "Clinical Summary & Notes"}</h3>
                <button type="button" onClick={() => setActiveTab(null)} className="drawer-close-btn">
                  <X size={16} />
                </button>
              </div>

              {activeTab === "chat" && (
                <div className="drawer-chat-area">
                  <div className="chat-msg-list">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`chat-bubble-wrap ${msg.sender}`}>
                        <div className="chat-bubble-content">
                          <span className="chat-sender-name">
                            {msg.sender === "doctor" ? appointment?.doctorName : "You"}
                          </span>
                          <p>{msg.text}</p>
                          <span className="chat-time">{msg.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendChat} className="chat-input-form">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message to your doctor..."
                    />
                    <button type="submit" aria-label="Send">
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="drawer-notes-area">
                  <div className="notes-card">
                    <h4>📋 Doctor's In-Call Charting</h4>
                    <p><strong>Primary Concern:</strong> {appointment?.reason || "General Medical Review"}</p>
                    <p><strong>Clinical Advice:</strong> Vitals discussed and documented. Follow medication guidance as prescribed.</p>
                    <div className="prescription-box">
                      <strong>Rx Recommendations:</strong>
                      <ul>
                        <li>Continue hydration and rest.</li>
                        <li>Follow-up review in 7 days if symptoms persist.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>

        {/* Bottom Control Actions Bar */}
        <footer className="telehealth-controls-bar">
          <div className="controls-left">
            <span className="ref-pill">Ref: {appointment?.referenceCode || appointment?.reference_code || "MED-LIVE"}</span>
          </div>

          <div className="controls-center">
            {/* Mic Toggle */}
            <button
              type="button"
              className={`ctrl-btn ${micActive ? "active" : "muted"}`}
              onClick={() => setMicActive(!micActive)}
              title={micActive ? "Mute Microphone" : "Unmute Microphone"}
            >
              {micActive ? <Mic size={20} /> : <MicOff size={20} />}
              <span>{micActive ? "Mute" : "Unmuted"}</span>
            </button>

            {/* Video Toggle */}
            <button
              type="button"
              className={`ctrl-btn ${cameraActive ? "active" : "muted"}`}
              onClick={() => setCameraActive(!cameraActive)}
              title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
            >
              {cameraActive ? <Video size={20} /> : <VideoOff size={20} />}
              <span>{cameraActive ? "Stop Video" : "Start Video"}</span>
            </button>

            {/* Chat Drawer Toggle */}
            <button
              type="button"
              className={`ctrl-btn ${activeTab === "chat" ? "highlight" : ""}`}
              onClick={() => setActiveTab(activeTab === "chat" ? null : "chat")}
              title="Open Chat"
            >
              <MessageSquare size={20} />
              <span>Chat</span>
            </button>

            {/* Clinical Notes Toggle */}
            <button
              type="button"
              className={`ctrl-btn ${activeTab === "notes" ? "highlight" : ""}`}
              onClick={() => setActiveTab(activeTab === "notes" ? null : "notes")}
              title="View Doctor Notes"
            >
              <FileText size={20} />
              <span>Notes</span>
            </button>

            {/* End Call Button */}
            <button
              type="button"
              className="ctrl-btn end-call"
              onClick={handleEndCall}
              title="End Telehealth Consultation"
            >
              <PhoneOff size={20} />
              <span>End Call</span>
            </button>
          </div>

          <div className="controls-right">
            <span className="telehealth-hospital-label">
              🏥 {appointment?.doctorHospital || "MediBook Hospital"}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
