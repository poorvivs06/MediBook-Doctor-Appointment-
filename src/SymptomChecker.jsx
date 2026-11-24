import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bot, X, Send, Sparkles, User, RefreshCw, ArrowRight, HeartPulse, Clock, MapPin, Phone, HelpCircle } from "lucide-react";
import { doctors, getDoctorById, getLocalizedDoctor } from "./doctorsData";
import { useLanguage } from "./LanguageContext";
import DoctorDoll from "./DoctorDoll";
import "./SymptomChecker.css";

const QUICK_SUGGESTIONS_BY_LANG = {
  en: [
    "🕒 What are clinic opening & closing timings?",
    "🪪 Digital Health Card & Emergency Pass",
    "📈 Track Daily Vitals (BP & Sugar)",
    "💰 Consultation fees & doctors?",
    "📍 Where is the clinic located?",
    "Acne, pimples & skin rash",
    "Chest tightness & high BP",
    "Child has fever and coughing",
    "🧪 How to book a Lab Test at home?",
    "📹 How does Video Consultation work?",
  ],
  kn: [
    "🕒 ಕ್ಲಿನಿಕ್ ತೆರೆಯುವ ಮತ್ತು ಮುಚ್ಚುವ ಸಮಯವೇನು?",
    "🪪 ಡಿಜಿಟಲ್ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಮತ್ತು ತುರ್ತು ಪಾಸ್",
    "📈 ದೈನಂದಿನ ವೈಟಲ್ಸ್ (BP & Sugar) ದಾಖಲಿಸಿ",
    "💰 ವೈದ್ಯರ ಸಮಾಲೋಚನೆ ಶುಲ್ಕ ಎಷ್ಟು?",
    "📍 ಆಸ್ಪತ್ರೆ / ಕ್ಲಿನಿಕ್ ಎಲ್ಲಿದೆ?",
    "ಚರ್ಮದ ಅಲರ್ಜಿ ಮತ್ತು ಮೊಡವೆ ಸಮಸ್ಯೆ",
    "ಎದೆ ಬಿಗಿತ ಮತ್ತು ಅಧಿಕ ಬಿಪಿ",
    "ಮಗುವಿಗೆ ಜ್ವರ ಮತ್ತು ಕೆಮ್ಮು",
    "🧪 ಮನೆಯಲ್ಲೇ ಲ್ಯಾಬ್ ಟೆಸ್ಟ್ ಬುಕ್ ಮಾಡುವುದು ಹೇಗೆ?",
    "📹 ವೀಡಿಯೊ ಕರೆ ಸಮಾಲೋಚನೆ ಹೇಗೆ ನಡೆಯುತ್ತದೆ?",
  ],
  hi: [
    "🕒 क्लिनिक खुलने और बंद होने का समय क्या है?",
    "🪪 डिजिटल हेल्थ कार्ड एवं इमरजेंसी पास",
    "📈 दैनिक वाइटल्स (BP और शुगर) दर्ज करें",
    "💰 डॉक्टरों की परामर्श फीस क्या है?",
    "📍 क्लिनिक / अस्पताल कहाँ स्थित है?",
    "त्वचा में एलर्जी, मुंहासे और दाने",
    "सीने में जकड़न और हाई बीपी",
    "बच्चे को बुखार और खांसी",
    "🧪 घर पर लैब टेस्ट कैसे बुक करें?",
    "📹 वीडियो कॉल परामर्श कैसे काम करता है?",
  ],
};

export default function SymptomChecker() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const getWelcomeMessage = (lang) => {
    if (lang === "kn") {
      return "ನಮಸ್ಕಾರ! ನಾನು **ಡಾ. ಮೇಡಿ (Dr. Medi)**, ನಿಮ್ಮ ಕ್ಲಿನಿಕಲ್ ಅಸಿಸ್ಟೆಂಟ್ ಡಾಲ್! 🩺 ನೀವು ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳು, **ಕ್ಲಿನಿಕ್ ಸಮಯ (Timings)**, ಶುಲ್ಕಗಳು, ವೈದ್ಯರ ಮಾಹಿತಿ ಅಥವಾ ಲ್ಯಾಬ್ ಟೆಸ್ಟ್‌ಗಳ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು. ನಾನು ನಿಮಗೆ ಸಂತೋಷದಿಂದ ಉತ್ತರಿಸುತ್ತೇನೆ!";
    }
    if (lang === "hi") {
      return "नमस्ते! मैं **डॉ. मेडी (Dr. Medi)**, आपकी स्वास्थ्य सहायक डॉल! 🩺 आप मुझसे अपनी बीमारी के लक्षण, **क्लिनिक का समय (Timings)**, डॉक्टरों की फीस, अस्पताल का पता या लैब टेस्ट के बारे में कुछ भी पूछ सकते हैं। मैं आपकी पूरी मदद करूँगी!";
    }
    return "Hello! I'm **Dr. Medi**, your clinical assistant doll! 🩺 Ask me anything about your symptoms, **clinic open/close timings**, consultation fees, clinic address, or lab tests, and I'll assist you immediately!";
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: getWelcomeMessage(language || "en"),
      doctor: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Comprehensive AI Assistant Knowledge Engine
  const analyzeQuery = (query, currentLang) => {
    const q = query.toLowerCase();

    // Detect user query language if written in Kannada / Hindi characters
    let targetLang = currentLang || "en";
    if (/[\u0C80-\u0CFF]/.test(query)) {
      targetLang = "kn";
    } else if (/[\u0900-\u097F]/.test(query)) {
      targetLang = "hi";
    }

    // ==========================================
    // 1. HOSPITAL / CLINIC OPEN & CLOSE TIMINGS
    // ==========================================
    if (
      q.includes("timing") ||
      q.includes("time") ||
      q.includes("open") ||
      q.includes("close") ||
      q.includes("hour") ||
      q.includes("schedule") ||
      q.includes("working day") ||
      q.includes("sunday") ||
      q.includes("weekend") ||
      q.includes("ಸಮಯ") ||
      q.includes("ತೆರೆಯುವ") ||
      q.includes("ಮುಚ್ಚುವ") ||
      q.includes("ಯಾವಾಗ") ||
      q.includes("समय") ||
      q.includes("कब खुल") ||
      q.includes("कब बंद") ||
      q.includes("घंटे")
    ) {
      if (targetLang === "kn") {
        return {
          text: `🕒 **ಮೆಡಿಬುಕ್ ಕ್ಲಿನಿಕ್ ಮತ್ತು ಆಸ್ಪತ್ರೆಯ ತೆರೆಯುವ ಹಾಗೂ ಮುಚ್ಚುವ ಸಮಯ:**\n\n` +
            `• **ಸೋಮವಾರದಿಂದ ಶುಕ್ರವಾರ:** ಬೆಳಿಗ್ಗೆ 08:00 AM ರಿಂದ ರಾತ್ರಿ 08:00 PM ರವರೆಗೆ\n` +
            `• **ಶನಿವಾರ ಮತ್ತು ಭಾನುವಾರ:** ಬೆಳಿಗ್ಗೆ 09:00 AM ರಿಂದ ಸಂಜೆ 05:00 PM ರವರೆಗೆ\n` +
            `• 🚨 **ತುರ್ತು ಚಿಕಿತ್ಸೆ (Emergency) & ವೀಡಿಯೊ ಸಮಾಲೋಚನೆ:** ದಿನದ 24 ಗಂಟೆಯೂ ಲಭ್ಯ (24/7)\n` +
            `• 🧪 **ಲ್ಯಾಬ್ ಸ್ಯಾಂಪಲ್ ಕಲೆಕ್ಷನ್:** ಬೆಳಿಗ್ಗೆ 07:00 AM ರಿಂದ ಪ್ರಾರಂಭ\n\n` +
            `**ಪ್ರಮುಖ ವೈದ್ಯರ ಒಪಿಡಿ (OPD) ಸಮಯ:**\n` +
            `• ಪೂರ್ವಿ (ಚರ್ಮರೋಗ): ಸೋಮ, ಬುಧ, ಶುಕ್ರ (10:00 AM - 04:00 PM)\n` +
            `• ಡಾ. ಸುರೇಶ್ (ಹೃದ್ರೋಗ): ಸೋಮ - ಶನಿ (09:00 AM - 02:00 PM)\n` +
            `• ಡಾ. ವಾಣಿ (ಮಕ್ಕಳ ತಜ್ಞರು): ಮಂಗಳ, ಗುರು, ಶನಿ (10:00 AM - 05:00 PM)`,
          doctor: null,
        };
      }
      if (targetLang === "hi") {
        return {
          text: `🕒 **मेडीबुक क्लिनिक एवं अस्पताल के खुलने और बंद होने का समय:**\n\n` +
            `• **सोमवार से शुक्रवार:** सुबह 08:00 AM से रात 08:00 PM तक\n` +
            `• **शनिवार एवं रविवार:** सुबह 09:00 AM से शाम 05:00 PM तक\n` +
            `• 🚨 **आपातकालीन सेवा (Emergency) एवं वीडियो कॉल:** 24 घंटे सातों दिन उपलब्ध (24/7)\n` +
            `• 🧪 **डायग्नोस्टिक लैब एवं होम सैंपल:** सुबह 07:00 AM से शाम 07:00 PM\n\n` +
            `**प्रमुख डॉक्टरों का OPD समय:**\n` +
            `• पूर्वी (त्वचा रोग): सोम, बुध, शुक्र (10:00 AM - 04:00 PM)\n` +
            `• डॉ. सुरेश (हृदय रोग): सोम - शनि (09:00 AM - 02:00 PM)\n` +
            `• डॉ. वाणी (बाल रोग): मंगल, गुरु, शनि (10:00 AM - 05:00 PM)`,
          doctor: null,
        };
      }
      return {
        text: `🕒 **MediBook Clinic & Hospital Opening & Closing Timings:**\n\n` +
          `• **Monday to Friday:** 08:00 AM – 08:00 PM (Full OPD Services)\n` +
          `• **Saturday & Sunday:** 09:00 AM – 05:00 PM (Weekend Clinic)\n` +
          `• 🚨 **Emergency Casualty & Telehealth Video Calls:** Open 24/7 Round-the-clock\n` +
          `• 🧪 **Diagnostic Pathology & Home Sample Collection:** 07:00 AM – 07:00 PM\n\n` +
          `**Doctor Consultation Hours:**\n` +
          `• Poorvi (Dermatology): Mon, Wed, Fri (10:00 AM – 04:00 PM)\n` +
          `• Dr. Suresh (Cardiology): Mon – Sat (09:00 AM – 02:00 PM)\n` +
          `• Dr. Vani (Pediatrics): Tue, Thu, Sat (10:00 AM – 05:00 PM)\n` +
          `• Dr. Arjun (Neurology): Mon, Tue, Thu (10:00 AM – 03:00 PM)\n` +
          `• Dr. Sneha (Dentistry): Mon – Fri (09:00 AM – 05:00 PM)\n` +
          `• Dr. Kiran (Ophthalmology): Mon, Wed, Thu, Sat (09:30 AM – 03:30 PM)`,
        doctor: null,
      };
    }

    // ==========================================
    // 2. LOCATION / ADDRESS / WHERE IS CLINIC
    // ==========================================
    if (
      q.includes("address") ||
      q.includes("location") ||
      q.includes("where") ||
      q.includes("place") ||
      q.includes("map") ||
      q.includes("reach") ||
      q.includes("landmark") ||
      q.includes("ವಿಳಾಸ") ||
      q.includes("ಎಲ್ಲಿದೆ") ||
      q.includes("ಸ್ಥಳ") ||
      q.includes("कहाँ") ||
      q.includes("पता") ||
      q.includes("स्थान")
    ) {
      if (targetLang === "kn") {
        return {
          text: `📍 **ಮೆಡಿಬುಕ್ ಸೆಂಟ್ರಲ್ ಹೆಲ್ತ್‌ಕೇರ್ ಸೆಂಟರ್ ವಿಳಾಸ:**\n\n` +
            `• **ವಿಳಾಸ:** #12, 12ನೇ ಮುಖ್ಯ ರಸ್ತೆ, ಇಂದಿರಾನಗರ, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ 560038\n` +
            `• **ಪ್ರಮುಖ ಗುರುತು:** ಇಂದಿರಾನಗರ ಮೆಟ್ರೋ ನಿಲ್ದಾಣದ ಎದುರು (ಪಿಲ್ಲರ್ #142)\n` +
            `• 🚗 **ವಾಹನ ನಿಲುಗಡೆ:** ರೋಗಿಗಳಿಗೆ ಉಚಿತ ವ್ಯಾಲೆಟ್ ಪಾರ್ಕಿಂಗ್ ಮತ್ತು ವ್ಹೀಲ್‌ಚೇರ್ ಸೌಲಭ್ಯ ಲಭ್ಯವಿದೆ.\n` +
            `• 📞 **ದೂರವಾಣಿ:** +91 98765 43210 | support@medibook.com`,
          doctor: null,
        };
      }
      if (targetLang === "hi") {
        return {
          text: `📍 **मेडीबुक सेंट्रल हेल्थकेयर सेंटर का पता:**\n\n` +
            `• **पता:** #12, 12वीं मेन रोड, इंदिरानगर, बेंगलुरु, कर्नाटक 560038\n` +
            `• **लैंडमार्क:** इंदिरानगर मेट्रो स्टेशन के ठीक सामने (पिलर #142)\n` +
            `• 🚗 **पार्किंग:** मरीजों के लिए मुफ्त वैले पार्किंग और व्हीलचेयर सुविधा उपलब्ध है।\n` +
            `• 📞 **हेल्पलाइन:** +91 98765 43210 | support@medibook.com`,
          doctor: null,
        };
      }
      return {
        text: `📍 **MediBook Central Healthcare Center Location:**\n\n` +
          `• **Address:** #12, 12th Main Road, Indiranagar, Bengaluru, Karnataka 560038\n` +
          `• **Landmark:** Directly opposite Indiranagar Metro Station (Metro Pillar #142)\n` +
          `• 🚗 **Parking & Accessibility:** Dedicated free patient valet parking and 24/7 wheelchair ramp access.\n` +
          `• 📞 **Helpline:** +91 98765 43210 | support@medibook.com`,
        doctor: null,
      };
    }

    // ==========================================
    // 3. CONSULTATION FEES & CHARGES
    // ==========================================
    if (
      q.includes("fee") ||
      q.includes("cost") ||
      q.includes("charge") ||
      q.includes("price") ||
      q.includes("rate") ||
      q.includes("how much") ||
      q.includes("expensive") ||
      q.includes("ಶುಲ್ಕ") ||
      q.includes("ದರ") ||
      q.includes("ವೆಚ್ಚ") ||
      q.includes("ಎಷ್ಟು") ||
      q.includes("फीस") ||
      q.includes("खर्च") ||
      q.includes("दाम") ||
      q.includes("कीमत") ||
      q.includes("कितना")
    ) {
      if (targetLang === "kn") {
        return {
          text: `💰 **ವೈದ್ಯರ ಸಮಾಲೋಚನೆ ಶುಲ್ಕ ವಿವರಗಳು (Consultation Fees):**\n\n` +
            `• 🧴 **ಪೂರ್ವಿ** (ಚರ್ಮರೋಗ ತಜ್ಞರು): ₹500\n` +
            `• ❤️ **ಡಾ. ಸುರೇಶ್** (ಹೃದ್ರೋಗ ತಜ್ಞರು): ₹700\n` +
            `• 👶 **ಡಾ. ವಾಣಿ** (ಮಕ್ಕಳ ತಜ್ಞರು): ₹400\n` +
            `• 🧠 **ಡಾ. ಅರ್ಜುನ್ ಮೆಹ್ತಾ** (ನರರೋಗ ತಜ್ಞರು): ₹600\n` +
            `• 🦷 **ಡಾ. ಸ್ನೇಹಾ ಪಟೇಲ್** (ದಂತ ವೈದ್ಯರು): ₹350\n` +
            `• 👁️ **ಡಾ. ಕಿರಣ್ ರಾವ್** (ನೇತ್ರ ತಜ್ಞರು): ₹550\n\n` +
            `✨ ಕ್ಲಿನಿಕ್ ಭೇಟಿ ಮತ್ತು ವೀಡಿಯೊ ಕರೆ ಎರಡಕ್ಕೂ ಒಂದೇ ಶುಲ್ಕ ಅನ್ವಯಿಸುತ್ತದೆ. ತಕ್ಷಣದ ಡಿಜಿಟಲ್ ಮೆಡಿಕಲ್ ಸ್ಲಿಪ್ ಉಚಿತವಾಗಿ ದೊರೆಯುತ್ತದೆ.`,
          doctor: null,
        };
      }
      if (targetLang === "hi") {
        return {
          text: `💰 **डॉक्टरों की परामर्श फीस (Consultation Fees):**\n\n` +
            `• 🧴 **पूर्वी** (त्वचा रोग विशेषज्ञ): ₹500\n` +
            `• ❤️ **डॉ. सुरेश** (हृदय रोग विशेषज्ञ): ₹700\n` +
            `• 👶 **डॉ. वाणी** (बाल रोग विशेषज्ञ): ₹400\n` +
            `• 🧠 **डॉ. अर्जुन मेहता** (न्यूरोलॉजिस्ट): ₹600\n` +
            `• 🦷 **डॉ. स्नेहा पटेल** (दंत चिकित्सक): ₹350\n` +
            `• 👁️ **डॉ. किरण राव** (नेत्र रोग विशेषज्ञ): ₹550\n\n` +
            `✨ क्लिनिक परामर्श और वीडियो कॉल दोनों के लिए एक समान फीस है। प्रत्येक बुकिंग के साथ डिजिटल मेडिकल पर्ची निःशुल्क दी जाती है।`,
          doctor: null,
        };
      }
      return {
        text: `💰 **MediBook Specialist Consultation Fees:**\n\n` +
          `• 🧴 **Poorvi** (Dermatologist): ₹500\n` +
          `• ❤️ **Dr. Suresh** (Cardiologist): ₹700\n` +
          `• 👶 **Dr. Vani** (Pediatrician): ₹400\n` +
          `• 🧠 **Dr. Arjun Mehta** (Neurologist): ₹600\n` +
          `• 🦷 **Dr. Sneha Patel** (Dentist): ₹350\n` +
          `• 👁️ **Dr. Kiran Rao** (Ophthalmologist): ₹550\n\n` +
          `✨ Both In-Clinic and HD Video Consultation include a validated digital clinical prescription and reception QR pass with zero extra platform fees.`,
        doctor: null,
      };
    }

    // ==========================================
    // 4. HOW TO BOOK / APPOINTMENT PROCESS
    // ==========================================
    if (
      q.includes("how to book") ||
      q.includes("booking process") ||
      q.includes("how can i book") ||
      q.includes("appointment step") ||
      q.includes("ಬುಕ್ ಮಾಡುವುದು ಹೇಗೆ") ||
      q.includes("ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ವಿಧಾನ") ||
      q.includes("बुक कैसे करें") ||
      q.includes("बुकिंग कैसे")
    ) {
      if (targetLang === "kn") {
        return {
          text: `📝 **ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡುವ ಸರಳ ವಿಧಾನ:**\n\n` +
            `1. **ವೈದ್ಯರನ್ನು ಆಯ್ಕೆಮಾಡಿ:** ಮೆನುನಲ್ಲಿ 'ವೈದ್ಯರು' ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಮುಖಪುಟದಲ್ಲಿ ಹುಡುಕಿ.\n` +
            `2. **ಸಮಾಲೋಚನೆ ವಿಧಾನ:** 🏥 ಕ್ಲಿನಿಕ್ ಭೇಟಿ ಅಥವಾ 📹 ವೀಡಿಯೊ ಕರೆ ಆಯ್ಕೆಮಾಡಿ.\n` +
            `3. **ಸಮಯ ಮತ್ತು ದಿನಾಂಕ:** ಲಭ್ಯವಿರುವ ದಿನಾಂಕ ಮತ್ತು ಸಮಯದ ಸ್ಲಾಟ್ ಆರಿಸಿ.\n` +
            `4. **ದೃಢೀಕರಣ:** ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಫೋನ್ ನಂಬರ್ ನಮೂದಿಸಿ 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದೃಢೀಕರಿಸಿ' ಕ್ಲಿಕ್ ಮಾಡಿ.\n\n` +
            `ತಕ್ಷಣವೇ ನಿಮಗೆ ಆಸ್ಪತ್ರೆಯ QR ಪಾಸ್ ಮತ್ತು ಪ್ರಿಂಟ್ ಮಾಡಬಹುದಾದ ವೈದ್ಯಕೀಯ ಚೀಟಿ ಸಿಗುತ್ತದೆ!`,
          doctor: null,
        };
      }
      if (targetLang === "hi") {
        return {
          text: `📝 **अपॉइंटमेंट बुक करने की आसान प्रक्रिया:**\n\n` +
            `1. **डॉक्टर चुनें:** नेविगेशन बार में 'डॉक्टर्स' पर क्लिक करें या होम पेज से चुनें।\n` +
            `2. **परामर्श का तरीका:** 🏥 क्लिनिक विजिट या 📹 वीडियो कॉल चुनें।\n` +
            `3. **तारीख और समय:** अपनी पसंद का उपलब्ध समय स्लॉट चुनें।\n` +
            `4. **बुकिंग पूरी करें:** मरीज का नाम और फोन नंबर डालकर 'कन्फर्म' करें।\n\n` +
            `तुरंत आपको अस्पताल का QR फास्ट-ट्रैक पास और डिजिटल मेडिकल पर्ची मिल जाएगी!`,
          doctor: null,
        };
      }
      return {
        text: `📝 **How to Book an Appointment in 30 Seconds:**\n\n` +
          `1. **Choose Doctor:** Click 'Doctors' in the navbar or select from our verified specialists.\n` +
          `2. **Select Mode:** Choose between 🏥 In-Clinic Visit or 📹 HD Video Call (Telehealth).\n` +
          `3. **Pick Date & Time:** Select your preferred consultation date and available slot.\n` +
          `4. **Confirm:** Enter patient details and reserve. You instantly get your Hospital QR Fast-Track Pass, Google Calendar invite, and official printable medical slip!`,
        doctor: null,
      };
    }

    // ==========================================
    // 5. CANCELLATION / RESCHEDULING
    // ==========================================
    if (
      q.includes("cancel") ||
      q.includes("reschedule") ||
      q.includes("refund") ||
      q.includes("change slot") ||
      q.includes("ರದ್ದು") ||
      q.includes("ಬದಲಾಯಿಸ") ||
      q.includes("रद्द") ||
      q.includes("कैंसिल")
    ) {
      if (targetLang === "kn") {
        return {
          text: `🔄 **ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ರದ್ದುಮಾಡುವುದು ಹೇಗೆ?**\n\n` +
            `• ಮೆನುನಲ್ಲಿ **'ನನ್ನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು'** ಗೆ ಹೋಗಿ.\n` +
            `• ನಿಮ್ಮ ಬುಕ್ಕಿಂಗ್ ಕಾರ್ಡ್‌ನಲ್ಲಿರುವ **'ರದ್ದುಮಾಡಿ' (Cancel)** ಬಟನ್ ಒತ್ತಿರಿ.\n` +
            `• ಯಾವುದೇ ರದ್ದತಿ ಶುಲ್ಕವಿಲ್ಲ (Zero Cancellation Fee). ನೀವು ತಕ್ಷಣವೇ ಬೇರೆ ಸಮಯಕ್ಕೆ ಹೊಸ ಬುಕ್ಕಿಂಗ್ ಮಾಡಬಹುದು!`,
          doctor: null,
        };
      }
      if (targetLang === "hi") {
        return {
          text: `🔄 **अपॉइंटमेंट रद्द या रीशेड्यूल कैसे करें?**\n\n` +
            `• ऊपर नेविगेशन में **'मेरी नियुक्तियां' (My Appointments)** पर जाएं।\n` +
            `• अपने अपॉइंटमेंट कार्ड पर **'रद्द करें' (Cancel)** बटन दबाएं।\n` +
            `• कोई रद्दीकरण शुल्क नहीं है। आप जब चाहें किसी अन्य तारीख या समय के लिए पुनः बुक कर सकते हैं!`,
          doctor: null,
        };
      }
      return {
        text: `🔄 **How to Cancel or Reschedule:**\n\n` +
          `• Navigate to **'My Appointments'** in the top menu.\n` +
          `• Locate your consultation card and click **'Cancel'**.\n` +
          `• There is zero cancellation fee. You can immediately reserve another slot that fits your schedule!`,
        doctor: null,
      };
    }

    // ==========================================
    // 6. LAB TESTS & DIAGNOSTIC PATHOLOGY
    // ==========================================
    if (
      q.includes("lab") ||
      q.includes("blood test") ||
      q.includes("test") ||
      q.includes("sample") ||
      q.includes("pathology") ||
      q.includes("cbc") ||
      q.includes("lipid") ||
      q.includes("sugar") ||
      q.includes("diabetes") ||
      q.includes("vitamin") ||
      q.includes("ಲ್ಯಾಬ್") ||
      q.includes("ರಕ್ತ ಪರೀಕ್ಷೆ") ||
      q.includes("ಸ್ಯಾಂಪಲ್") ||
      q.includes("ಪರೀಕ್ಷೆ") ||
      q.includes("लैब") ||
      q.includes("खून की जांच") ||
      q.includes("ब्लड टेस्ट") ||
      q.includes("सैंपल")
    ) {
      if (targetLang === "kn") {
        return {
          text: `🧪 **ಮೆಡಿಬುಕ್ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ಲ್ಯಾಬ್ ಮತ್ತು ಮನೆ ಬಾಗಿಲಿಗೆ ಸ್ಯಾಂಪಲ್ ಕಲೆಕ್ಷನ್:**\n\n` +
            `• **ಉಪಲಬ್ಧ ಪರೀಕ್ಷೆಗಳು:** ಕಂಪ್ಲೀಟ್ ಬ್ಲಡ್ ಕೌಂಟ್ (CBC), ಲಿಪಿಡ್ ಪ್ರೊಫೈಲ್, ಅಲರ್ಜಿ IgE, HbA1c ಶುಗರ್ ಪರೀಕ್ಷೆ, ವಿಟಮಿನ್ D3 & B12.\n` +
            `• 🏠 **ಮನೆಯಲ್ಲೇ ಸ್ಯಾಂಪಲ್ ಕಲೆಕ್ಷನ್:** ನಮ್ಮ ಪ್ರಮಾಣೀಕೃತ ಲ್ಯಾಬ್ ತಜ್ಞರು ಬೆಳಿಗ್ಗೆ 07:00 AM ರಿಂದ ನಿಮ್ಮ ಮನೆಗೆ ಬಂದು ರಕ್ತದ ಮಾದರಿ ಸಂಗ್ರಹಿಸುತ್ತಾರೆ.\n` +
            `• 📄 **ವರದಿಗಳು:** NABL & CAP ಪ್ರಮಾಣೀಕೃತ ವರದಿಗಳು 24 ಗಂಟೆಗಳಲ್ಲಿ ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲೇ ಲಭ್ಯವಾಗುತ್ತವೆ.\n\n` +
            `ಬುಕ್ ಮಾಡಲು ಮೇಲಿನ ಮೆನುವಿನಲ್ಲಿ **'🧪 ಲ್ಯಾಬ್ ಪರೀಕ್ಷೆಗಳು'** ಕ್ಲಿಕ್ ಮಾಡಿ!`,
          doctor: null,
        };
      }
      if (targetLang === "hi") {
        return {
          text: `🧪 **मेडीबुक डायग्नोस्टिक लैब एवं होम ब्लड सैंपल सेवा:**\n\n` +
            `• **उपलब्ध टेस्ट:** सीबीसी (CBC), लिपिड प्रोफाइल, एलर्जी IgE, HbA1c डायबिटीज, विटामिन D3 एवं B12 पैनल।\n` +
            `• 🏠 **घर पर सैंपल कलेक्शन:** हमारे प्रमाणित लैब तकनीशियन सुबह 07:00 AM से आपके घर आकर सैंपल एकत्र करते हैं।\n` +
            `• 📄 **रिपोर्ट्स:** NABL एवं CAP प्रमाणित लैब रिपोर्ट्स 24 घंटे में आपके पोर्टल पर उपलब्ध हो जाती हैं।\n\n` +
            `बुकिंग के लिए ऊपर नेवबार में **'🧪 लैब टेस्ट'** पर क्लिक करें!`,
          doctor: null,
        };
      }
      return {
        text: `🧪 **MediLab Diagnostic Pathology & Home Sample Collection:**\n\n` +
          `• **Available Panels:** Complete Blood Count (CBC), Lipid Cardiovascular Profile, Allergy IgE, HbA1c Diabetes, Vitamin D3 & B12 Vitality.\n` +
          `• 🏠 **Home Sample Collection:** Certified phlebotomists arrive at your doorstep with sterile equipment starting at 07:00 AM.\n` +
          `• 📄 **Accreditation:** NABL & CAP certified diagnostic findings with printable A4 official pathology letterheads within 24 hours.\n\n` +
          `To view existing reports or book a home phlebotomy visit, click **'🧪 Lab Tests'** in the top navigation bar!`,
        doctor: null,
      };
    }

    // ==========================================
    // 7. VIDEO CALL (TELEHEALTH) INFORMATION
    // ==========================================
    if (
      q.includes("video") ||
      q.includes("telehealth") ||
      q.includes("call") ||
      q.includes("online consultation") ||
      q.includes("virtual") ||
      q.includes("ವೀಡಿಯೊ") ||
      q.includes("ವೀಡಿಯೋ") ||
      q.includes("ವಿಡಿಯೋ") ||
      q.includes("कॉल") ||
      q.includes("वीडियो")
    ) {
      if (targetLang === "kn") {
        return {
          text: `📹 **ವೀಡಿಯೊ ಕರೆ (ಟೆಲಿಹೆಲ್ತ್) ಸಮಾಲೋಚನೆ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?**\n\n` +
            `• ಬುಕ್ ಮಾಡುವಾಗ 'ವೀಡಿಯೊ ಕರೆ (Telehealth)' ಆಯ್ಕೆಮಾಡಿ.\n` +
            `• ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಸಮಯದಲ್ಲಿ **'ನನ್ನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು'** ಗೆ ಹೋಗಿ **'ವೀಡಿಯೊ ಕರೆಗೆ ಸೇರಿ' (Join Video Call Room)** ಕ್ಲಿಕ್ ಮಾಡಿ.\n` +
            `• ಸುರಕ್ಷಿತ 256-ಬಿಟ್ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ ಎಚ್‌ಡಿ ವೀಡಿಯೊ, ಆಡಿಯೋ ವೇವ್, ಚಾಟ್ ಮತ್ತು ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ನೇರವಾಗಿ ದೊರೆಯುತ್ತದೆ!`,
          doctor: null,
        };
      }
      if (targetLang === "hi") {
        return {
          text: `📹 **वीडियो कॉल (टेलीहेल्थ) परामर्श कैसे काम करता है?**\n\n` +
            `• बुकिंग करते समय 'वीडियो कॉल (Telehealth)' चुनें।\n` +
            `• परामर्श के समय **'मेरी नियुक्तियां'** में जाकर **'वीडियो कॉल से जुड़ें'** पर क्लिक करें।\n` +
            `• सीधे ब्राउज़र में सुरक्षित 256-बिट एचडी वीडियो कॉल, ऑडियो वेव विज़ुअलाइज़र, चैट और डॉक्टर की डिजिटल पर्ची उपलब्ध होगी!`,
          doctor: null,
        };
      }
      return {
        text: `📹 **How Virtual Video Consultations Work:**\n\n` +
          `• Choose 'Video Call (Telehealth)' when reserving your appointment.\n` +
          `• When your appointment time arrives, open **'My Appointments'** and tap **'Join Video Call Room'**.\n` +
          `• Enjoy 256-bit encrypted HD video, live audio waveform visualizer, in-call clinical chat, and immediate digital medical slips right in your browser!`,
        doctor: null,
      };
    }

    // ==========================================
    // 8. EMERGENCY & CONTACT
    // ==========================================
    if (
      q.includes("emergency") ||
      q.includes("urgent") ||
      q.includes("ambulance") ||
      q.includes("phone") ||
      q.includes("contact") ||
      q.includes("help") ||
      q.includes("ತುರ್ತು") ||
      q.includes("ಸಂಪರ್ಕ") ||
      q.includes("ಆಪತ್ಕಾಲ") ||
      q.includes("आपातकालीन") ||
      q.includes("संपर्क") ||
      q.includes("हेल्पलाइन")
    ) {
      if (targetLang === "kn") {
        return {
          text: `🚨 **ತುರ್ತು ಸಹಾಯವಾಣಿ & ಸಂಪರ್ಕ ವಿವರಗಳು:**\n\n` +
            `• **24/7 ತುರ್ತು ಹಾಟ್‌ಲೈನ್:** +91 98765 43210\n` +
            `• **ಆಂಬ್ಯುಲೆನ್ಸ್ ಮತ್ತು ಕ್ಯಾಶುಯಲ್ಟಿ:** ತಕ್ಷಣದ ನೆರವಿಗೆ ಲಭ್ಯವಿದೆ.\n` +
            `• **ಇಮೇಲ್ ಸಹಾಯ:** support@medibook.com\n` +
            `• ಗಂಭೀರ ಆರೋಗ್ಯ ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ತಕ್ಷಣವೇ 112 ಗೆ ಕರೆ ಮಾಡಿ.`,
          doctor: null,
        };
      }
      if (targetLang === "hi") {
        return {
          text: `🚨 **आपातकालीन हेल्पलाइन एवं संपर्क:**\n\n` +
            `• **24/7 आपातकालीन नंबर:** +91 98765 43210\n` +
            `• **एम्बुलेंस एवं कैजुअल्टी:** राउंड-द-क्लॉक उपलब्ध।\n` +
            `• **ईमेल सहायता:** support@medibook.com\n` +
            `• अत्यंत गंभीर आपात स्थिति में तुरंत 112 डायल करें।`,
          doctor: null,
        };
      }
      return {
        text: `🚨 **MediBook Emergency & Contact Information:**\n\n` +
          `• **24/7 Emergency Line:** +91 98765 43210\n` +
          `• **Casualty Triage:** Open 24 hours a day, 365 days a year.\n` +
          `• **Support Email:** support@medibook.com\n` +
          `• For critical life-threatening emergencies, please dial 112 immediately.`,
        doctor: null,
      };
    }

    // ==========================================
    // 8A. DIGITAL HEALTH CARD & EMERGENCY PASS
    // ==========================================
    if (
      q.includes("health card") ||
      q.includes("id card") ||
      q.includes("emergency pass") ||
      q.includes("member id") ||
      q.includes("blood group") ||
      q.includes("ಆರೋಗ್ಯ ಕಾರ್ಡ್") ||
      q.includes("ಕಾರ್ಡ್") ||
      q.includes("ರಕ್ತದ ಗುಂಪು") ||
      q.includes("ಹೆಲ್ತ್ ಕಾರ್ಡ್") ||
      q.includes("कार्ड") ||
      q.includes("ब्लड ग्रुप")
    ) {
      if (targetLang === "kn") {
        return {
          text: `🪪 **ನಿಮ್ಮ ಅಧಿಕೃತ ಡಿಜಿಟಲ್ ಆರೋಗ್ಯ ಕಾರ್ಡ್ & ತುರ್ತು ಪಾಸ್:**\n\n` +
            `• ನಿಮ್ಮ ಸದಸ್ಯತ್ವ ಐಡಿ, ರಕ್ತದ ಗುಂಪು, ಅಲರ್ಜಿಗಳು ಮತ್ತು ತುರ್ತು ಸಂಪರ್ಕ ವಿವರಗಳನ್ನು ಒಳಗೊಂಡ ಡಿಜಿಟಲ್ ವ್ಯಾಲೆಟ್ ಕಾರ್ಡ್ ಲಭ್ಯವಿದೆ!\n` +
            `• ಆಸ್ಪತ್ರೆಯ ಫಾಸ್ಟ್-ಟ್ರ್ಯಾಕ್ ಚೆಕ್-ಇನ್‌ಗಾಗಿ QR ಕೋಡ್ ಅನ್ನು ಒಳಗೊಂಡಿದೆ.\n` +
            `• ವೀಕ್ಷಿಸಲು ಅಥವಾ ಪ್ರಿಂಟ್ ಮಾಡಲು: **'ನನ್ನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು' ➔ 'ಡಿಜಿಟಲ್ ಆರೋಗ್ಯ ಕಾರ್ಡ್'** ಟ್ಯಾಬ್‌ಗೆ ಭೇಟಿ ನೀಡಿ (ಅಥವಾ /health-card ಗೆ ಹೋಗಿ).`,
          doctor: null,
        };
      }
      if (targetLang === "hi") {
        return {
          text: `🪪 **आपका आधिकारिक डिजिटल हेल्थ कार्ड एवं इमरजेंसी पास:**\n\n` +
            `• आपका सदस्य आईडी, रक्त समूह, एलर्जी और आपातकालीन संपर्क विवरण युक्त डिजिटल वॉलेट कार्ड तैयार है!\n` +
            `• अस्पताल में तुरंत चेक-इन के लिए इसमें सुरक्षित QR कोड भी शामिल है।\n` +
            `• इसे देखने, संपादित करने या प्रिंट करने के लिए: **'मेरी नियुक्तियां' ➔ 'डिजिटल हेल्थ कार्ड'** टैब पर जाएं (या /health-card पर जाएं)।`,
          doctor: null,
        };
      }
      return {
        text: `🪪 **Your Official Digital Health Card & Emergency Pass:**\n\n` +
          `• Access your encrypted digital wallet health card containing your Member ID, Blood Group, Emergency Contact, and known allergies.\n` +
          `• Features an embedded Fast-Track Triage QR code for 1-second hospital check-in.\n` +
          `• To view, edit, or download as PDF: Open **'My Appointments' ➔ 'Digital Health Card'** tab or visit /health-card!`,
        doctor: null,
      };
    }

    // ==========================================
    // 8B. DAILY VITALS & BIOMARKER TRACKER
    // ==========================================
    if (
      q.includes("vital") ||
      q.includes("bp") ||
      q.includes("blood pressure") ||
      q.includes("sugar") ||
      q.includes("glucose") ||
      q.includes("pulse") ||
      q.includes("heart rate") ||
      q.includes("spo2") ||
      q.includes("oxygen") ||
      q.includes("weight") ||
      q.includes("ವೈಟಲ್ಸ್") ||
      q.includes("ರಕ್ತದೊತ್ತಡ") ||
      q.includes("ಗ್ಲೂಕೋಸ್") ||
      q.includes("ನಾಡಿಮಿಡಿತ") ||
      q.includes("ಆಮ್ಲಜನಕ") ||
      q.includes("ತೂಕ") ||
      q.includes("वाइटल्स") ||
      q.includes("रक्तचाप") ||
      q.includes("बीपी") ||
      q.includes("शुगर") ||
      q.includes("नाड़ी") ||
      q.includes("ऑक्सीजन") ||
      q.includes("वजन")
    ) {
      if (targetLang === "kn") {
        return {
          text: `📈 **ದೈನಂದಿನ ಹೆಲ್ತ್ ವೈಟಲ್ಸ್ & ಬಯೋಮಾರ್ಕರ್ ಟ್ರ್ಯಾಕರ್:**\n\n` +
            `• **ರಕ್ತದೊತ್ತಡ (BP):** ಸಾಮಾನ್ಯ ಮಿತಿ < 120/80 mmHg\n` +
            `• **ರಕ್ತದ ಸಕ್ಕರೆ (Fasting Sugar):** ಸಾಮಾನ್ಯ ಮಿತಿ < 100 mg/dL\n` +
            `• **ಹೃದಯ ಬಡಿತ (Pulse):** 60 - 100 bpm\n` +
            `• **ಆಮ್ಲಜನಕ (SpO2):** 95% - 100%\n\n` +
            `ಇಂದಿನ ರೀಡಿಂಗ್‌ಗಳನ್ನು ದಾಖಲಿಸಲು ಮತ್ತು ನಿಮ್ಮ ವೈದ್ಯರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಲು: **'ನನ್ನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು' ➔ 'ದೈನಂದಿನ ವೈಟಲ್ಸ್ ಟ್ರ್ಯಾಕರ್'** ಟ್ಯಾಬ್‌ಗೆ ಭೇಟಿ ನೀಡಿ (ಅಥವಾ /vitals ಗೆ ಹೋಗಿ)!`,
          doctor: null,
        };
      }
      if (targetLang === "hi") {
        return {
          text: `📈 **दैनिक स्वास्थ्य वाइटल्स एवं बायोमार्कर ट्रैकर:**\n\n` +
            `• **रक्तचाप (BP):** सामान्य लक्ष्य < 120/80 mmHg\n` +
            `• **ब्लड शुगर (फास्टिंग):** सामान्य लक्ष्य < 100 mg/dL\n` +
            `• **हृदय गति (पल्स):** 60 - 100 bpm\n` +
            `• **ऑक्सीजन (SpO2):** 95% - 100%\n\n` +
            `अपने दैनिक वाइटल्स दर्ज करने और डॉक्टर के साथ साझा करने के लिए: **'मेरी नियुक्तियां' ➔ 'दैनिक वाइटल्स ट्रैकर'** टैब पर जाएं (या /vitals पर जाएं)!`,
          doctor: null,
        };
      }
      return {
        text: `📈 **Daily Health Vitals & Biomarker Tracker:**\n\n` +
          `• **Blood Pressure (BP):** Normal target < 120/80 mmHg\n` +
          `• **Fasting Blood Glucose:** Normal target < 100 mg/dL\n` +
          `• **Resting Heart Rate / Pulse:** 60 - 100 bpm\n` +
          `• **Oxygen Saturation (SpO2):** 95% - 100%\n\n` +
          `Track your daily readings, observe health trends, and share data with your consulting doctor in **'My Appointments' ➔ 'Daily Vitals Tracker'** (or visit /vitals)!`,
        doctor: null,
      };
    }

    // ==========================================
    // 9. GREETINGS & CASUAL HELLOS
    // ==========================================
    if (
      q === "hi" ||
      q === "hello" ||
      q === "hey" ||
      q === "namaste" ||
      q === "namaskara" ||
      q === "good morning" ||
      q === "good afternoon" ||
      q === "good evening" ||
      q.includes("ನಮಸ್ಕಾರ") ||
      q.includes("ಹಲೋ") ||
      q.includes("नमस्ते") ||
      q.includes("हेलो")
    ) {
      if (targetLang === "kn") {
        return {
          text: `👋 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ನೆಚ್ಚಿನ ಕ್ಲಿನಿಕಲ್ ಡಾಲ್ **ಡಾ. ಮೇಡಿ (Dr. Medi)**! 🩺\n\n` +
            `ನಾನು ನಿಮಗೆ ಈ ಕೆಳಗಿನವುಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n` +
            `• 🕒 ಕ್ಲಿನಿಕ್ ತೆರೆಯುವ ಮತ್ತು ಮುಚ್ಚುವ ಸಮಯ (Timings)\n` +
            `• 💰 ವೈದ್ಯರ ಸಮಾಲೋಚನೆ ಶುಲ್ಕಗಳು (Fees)\n` +
            `• 📍 ಕ್ಲಿನಿಕ್ ವಿಳಾಸ ಮತ್ತು ಸ್ಥಳ (Address)\n` +
            `• 🩺 ರೋಗಲಕ್ಷಣಗಳ ಆಧಾರದ ಮೇಲೆ ಸೂಕ್ತ ವೈದ್ಯರ ಆಯ್ಕೆ\n` +
            `• 🧪 ಮನೆಯಲ್ಲೇ ರಕ್ತ ಪರೀಕ್ಷೆ ಬುಕ್ಕಿಂಗ್ (Lab Tests)\n\n` +
            `ನಿಮಗೆ ಏನು ಬೇಕು ಎಂದು ಕೇಳಿ!`,
          doctor: null,
        };
      }
      if (targetLang === "hi") {
        return {
          text: `👋 नमस्ते! मैं आपकी क्लिनिकल डॉल **डॉ. मेडी (Dr. Medi)**! 🩺\n\n` +
            `मैं आपकी इन विषयों में सहायता कर सकती हूँ:\n` +
            `• 🕒 क्लिनिक खुलने और बंद होने का समय (Timings)\n` +
            `• 💰 डॉक्टरों की परामर्श फीस (Fees)\n` +
            `• 📍 क्लिनिक का पता और लोकेशन (Address)\n` +
            `• 🩺 बीमारी के लक्षणों के अनुसार सही डॉक्टर की सिफारिश\n` +
            `• 🧪 घर पर ब्लड सैंपल कलेक्शन (Lab Tests)\n\n` +
            `आप क्या जानना चाहते हैं, बेझिझक पूछें!`,
          doctor: null,
        };
      }
      return {
        text: `👋 Hello! I'm **Dr. Medi**, your clinical assistant doll! 🩺\n\n` +
          `I can help you with:\n` +
          `• 🕒 Hospital & Clinic open / close timings\n` +
          `• 💰 Doctor consultation fees & qualifications\n` +
          `• 📍 Clinic address and parking location\n` +
          `• 🩺 Matching your symptoms to the right specialist\n` +
          `• 🧪 Booking home blood sample collection\n\n` +
          `How can I help you today?`,
        doctor: null,
      };
    }

    // ==========================================
    // 10. CLINICAL SYMPTOMS & DOCTOR MATCHING
    // ==========================================

    // Dermatology -> Poorvi
    if (
      q.includes("skin") ||
      q.includes("acne") ||
      q.includes("pimple") ||
      q.includes("rash") ||
      q.includes("itch") ||
      q.includes("eczema") ||
      q.includes("psoriasis") ||
      q.includes("hair") ||
      q.includes("dermat") ||
      q.includes("face") ||
      q.includes("ಚರ್ಮ") ||
      q.includes("ಮೊಡವೆ") ||
      q.includes("ತುರಿಕೆ") ||
      q.includes("ಕೂದಲು") ||
      q.includes("ತ್ವಚಾ") ||
      q.includes("मुंहासे") ||
      q.includes("खुजली") ||
      q.includes("दाने")
    ) {
      const doc = getLocalizedDoctor(getDoctorById("poorvi"), targetLang);
      const expl = targetLang === "kn"
        ? "ನಿಮ್ಮ ಲಕ್ಷಣಗಳು ಚರ್ಮ, ಕೂದಲು ಅಥವಾ ಅಲರ್ಜಿಯ ಸಮಸ್ಯೆಯನ್ನು ಸೂಚಿಸುತ್ತವೆ. ನಮ್ಮ ಚರ್ಮರೋಗ ತಜ್ಞರೊಂದಿಗೆ ಸಮಾಲೋಚನೆ ನಡೆಸಲು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ."
        : targetLang === "hi"
        ? "आपके लक्षण त्वचा, बाल या एलर्जी से संबंधित हैं। हम त्वचा रोग विशेषज्ञ से परामर्श लेने की सलाह देते हैं।"
        : "Your symptoms point toward dermatological skin, hair, or allergic conditions. We recommend consulting our specialist in Clinical Dermatology.";
      return {
        specialty: doc.specialty,
        doctor: doc,
        explanation: expl,
      };
    }

    // Cardiology -> Dr. Suresh
    if (
      q.includes("heart") ||
      q.includes("chest") ||
      q.includes("bp") ||
      q.includes("blood pressure") ||
      q.includes("palpitation") ||
      q.includes("breath") ||
      q.includes("cardio") ||
      q.includes("cholesterol") ||
      q.includes("ಹೃದಯ") ||
      q.includes("ಎದೆ") ||
      q.includes("ರಕ್ತದೊತ್ತಡ") ||
      q.includes("ಉಸಿರಾಟ") ||
      q.includes("हृदय") ||
      q.includes("सीने") ||
      q.includes("बीपी") ||
      q.includes("धड़कन") ||
      q.includes("सांस")
    ) {
      const doc = getLocalizedDoctor(getDoctorById("dr-suresh"), targetLang);
      const expl = targetLang === "kn"
        ? "ನಿಮ್ಮ ಲಕ್ಷಣಗಳು ಹೃದಯ ಅಥವಾ ರಕ್ತದೊತ್ತಡದ ಕಾಳಜಿಯನ್ನು ಸೂಚಿಸುತ್ತವೆ. ನಮ್ಮ ಹಿರಿಯ ಹೃದ್ರೋಗ ತಜ್ಞರನ್ನು ತಕ್ಷಣ ಭೇಟಿ ಮಾಡಲು ಸಲಹೆ ನೀಡುತ್ತೇವೆ."
        : targetLang === "hi"
        ? "आपके लक्षण संभावित हृदय या रक्तचाप संबंधी समस्या का संकेत देते हैं। हम वरिष्ठ हृदय रोग विशेषज्ञ से तुरंत मिलने की सलाह देते हैं।"
        : "Your symptoms indicate potential cardiovascular or blood pressure concerns. We advise seeing our Senior Consultant Cardiologist promptly.";
      return {
        specialty: doc.specialty,
        doctor: doc,
        explanation: expl,
      };
    }

    // Pediatrics -> Dr. Vani
    if (
      q.includes("child") ||
      q.includes("baby") ||
      q.includes("infant") ||
      q.includes("kid") ||
      q.includes("pediatric") ||
      q.includes("vaccin") ||
      q.includes("fever") ||
      q.includes("ಮಗು") ||
      q.includes("ಮಕ್ಕಳ") ||
      q.includes("ಜ್ವರ") ||
      q.includes("ಲಸಿಕೆ") ||
      q.includes("बच्चा") ||
      q.includes("शिशु") ||
      q.includes("बुखार") ||
      q.includes("टीका")
    ) {
      const doc = getLocalizedDoctor(getDoctorById("dr-vani"), targetLang);
      const expl = targetLang === "kn"
        ? "ಶಿಶುಗಳು ಮತ್ತು ಮಕ್ಕಳ ಆರೋಗ್ಯ, ಜ್ವರ ಹಾಗೂ ಲಸಿಕೆಗಳ ಆರೈಕೆಗಾಗಿ ನಮ್ಮ ಮಕ್ಕಳ ತಜ್ಞರೊಂದಿಗೆ ಸಮಾಲೋಚನೆ ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ."
        : targetLang === "hi"
        ? "शिशुओं और बच्चों के स्वास्थ्य, बुखार एवं टीकाकरण के लिए बाल रोग विशेषज्ञ से परामर्श अनुशंसित है।"
        : "For infants, children, and developmental health concerns, specialized pediatric care is recommended.";
      return {
        specialty: doc.specialty,
        doctor: doc,
        explanation: expl,
      };
    }

    // Neurology -> Dr. Arjun Mehta
    if (
      q.includes("migraine") ||
      q.includes("headache") ||
      q.includes("brain") ||
      q.includes("nerve") ||
      q.includes("numb") ||
      q.includes("seizure") ||
      q.includes("dizzy") ||
      q.includes("ತಲೆನೋವು") ||
      q.includes("ಮಿದುಳು") ||
      q.includes("ನರ") ||
      q.includes("ತಲೆಸುತ್ತು") ||
      q.includes("सिरदर्द") ||
      q.includes("माइग्रेन") ||
      q.includes("चक्कर") ||
      q.includes("नसों")
    ) {
      const doc = getLocalizedDoctor(getDoctorById("dr-arjun"), targetLang);
      const expl = targetLang === "kn"
        ? "ತಲೆನೋವು, ಮೈಗ್ರೇನ್ ಮತ್ತು ನರಗಳ ದೌರ್ಬಲ್ಯಕ್ಕೆ ನರರೋಗ ತಜ್ಞರ (Neurologist) ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿದೆ."
        : targetLang === "hi"
        ? "सिरदर्द, माइग्रेन और तंत्रिका संबंधी लक्षणों के लिए न्यूरोलॉजिस्ट से जांच कराना आवश्यक है।"
        : "Headache patterns, nerve sensation, and cognitive symptoms fall under neurology.";
      return {
        specialty: doc.specialty,
        doctor: doc,
        explanation: expl,
      };
    }

    // Dentistry -> Dr. Sneha Patel
    if (
      q.includes("tooth") ||
      q.includes("teeth") ||
      q.includes("cavity") ||
      q.includes("gum") ||
      q.includes("dental") ||
      q.includes("mouth") ||
      q.includes("root canal") ||
      q.includes("ಹಲ್ಲು") ||
      q.includes("ದಂತ") ||
      q.includes("ಕಿರಿಕಿರಿ") ||
      q.includes("ಬಾಯಿ") ||
      q.includes("दांत") ||
      q.includes("मसूड़ों") ||
      q.includes("दांत दर्द")
    ) {
      const doc = getLocalizedDoctor(getDoctorById("dr-sneha"), targetLang);
      const expl = targetLang === "kn"
        ? "ಹಲ್ಲುನೋವು, ರೂಟ್ ಕೆನಾಲ್ ಮತ್ತು ಬಾಯಿಯ ಆರೈಕೆಗೆ ನಮ್ಮ ದಂತ ವೈದ್ಯರ ತಪಾಸಣೆ ಅಗತ್ಯವಿದೆ."
        : targetLang === "hi"
        ? "दांत दर्द, कैविटी और मसूड़ों की समस्या के लिए दंत चिकित्सक द्वारा जांच जरूरी है।"
        : "Oral and dental pain requires assessment by our dental surgeon.";
      return {
        specialty: doc.specialty,
        doctor: doc,
        explanation: expl,
      };
    }

    // Ophthalmology -> Dr. Kiran Rao
    if (
      q.includes("eye") ||
      q.includes("vision") ||
      q.includes("blur") ||
      q.includes("sight") ||
      q.includes("optical") ||
      q.includes("ಕಣ್ಣು") ||
      q.includes("ದೃಷ್ಟಿ") ||
      q.includes("ಮಂಜು") ||
      q.includes("आंख") ||
      q.includes("दृष्टि") ||
      q.includes("धुंधला")
    ) {
      const doc = getLocalizedDoctor(getDoctorById("dr-kiran"), targetLang);
      const expl = targetLang === "kn"
        ? "ಕಣ್ಣಿನ ಆಯಾಸ ಮತ್ತು ದೃಷ್ಟಿ ದೋಷಗಳ ಪರಿಶೀಲನೆಗೆ ನಮ್ಮ ನೇತ್ರ ತಜ್ಞರೊಂದಿಗೆ ಸಮಾಲೋಚನೆ ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ."
        : targetLang === "hi"
        ? "आंखों में खिंचाव, धुंधलापन और दृष्टि संबंधी समस्याओं के लिए नेत्र विशेषज्ञ से जांच कराएं।"
        : "Visual discomfort and eyesight changes should be reviewed by an ophthalmologist.";
      return {
        specialty: doc.specialty,
        doctor: doc,
        explanation: expl,
      };
    }

    // Fallback General Response
    if (targetLang === "kn") {
      return {
        text: "ನಿಮ್ಮ ವಿವರಣೆಯನ್ನು ಪರಿಶೀಲಿಸಿದೆ. ನೀವು ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಲಕ್ಷಣಗಳು (ಉದಾ: ಚರ್ಮ, ಹೃದಯ, ಜ್ವರ, ತಲೆನೋವು, ಹಲ್ಲು, ಕಣ್ಣು), ಕ್ಲಿನಿಕ್ ಸಮಯಗಳು (Timings), ಶುಲ್ಕಗಳು ಅಥವಾ ಲ್ಯಾಬ್ ಟೆಸ್ಟ್‌ಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು. ನಾನು ನಿಮಗೆ ನಿಖರ ಮಾಹಿತಿ ನೀಡುತ್ತೇನೆ!",
        doctor: null,
      };
    }
    if (targetLang === "hi") {
      return {
        text: "मैंने आपका संदेश देखा। आप मुझसे बीमारी के लक्षण (जैसे त्वचा, दिल, बुखार, सिरदर्द, दांत, आंखें), क्लिनिक खुलने/बंद होने का समय (Timings), फीस या लैब टेस्ट के बारे में पूछ सकते हैं। मैं पूरी जानकारी दूंगी!",
        doctor: null,
      };
    }
    return {
      text: "Thank you for asking! I can answer questions about our hospital & clinic timings, consultation fees, clinic address, lab tests, or recommend the right doctor for symptoms like fever, skin allergy, chest pain, headache, toothache, or vision problems.",
      doctor: null,
    };
  };

  const handleSend = (textToSend) => {
    const messageText = typeof textToSend === "string" ? textToSend : input;
    if (!messageText.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: messageText.trim(),
      doctor: null,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Realistic smart response delay
    setTimeout(() => {
      const result = analyzeQuery(messageText, language);

      const botReply = {
        id: Date.now() + 1,
        sender: "bot",
        text: result.text || result.explanation,
        doctor: result.doctor || null,
        specialty: result.specialty || null,
      };

      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 1,
        sender: "bot",
        text: getWelcomeMessage(language || "en"),
        doctor: null,
      },
    ]);
  };

  const activeQuickSuggestions = QUICK_SUGGESTIONS_BY_LANG[language] || QUICK_SUGGESTIONS_BY_LANG.en;

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        className={`symptom-checker-launcher ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Clinical Assistant"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="launcher-content">
            <span style={{ fontSize: "20px" }}>🩺</span>
            <span className="launcher-text">Dr. Medi AI</span>
            <span className="online-dot"></span>
          </div>
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="symptom-checker-window">
          {/* Header */}
          <div className="checker-header">
            <div className="checker-header-left">
              <div className="checker-avatar" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DoctorDoll size={34} showBadge={false} interactive={false} />
              </div>
              <div>
                <h3>Dr. Medi AI</h3>
                <span className="ai-badge">
                  <Sparkles size={11} />
                  <span>Clinical & Hospital Assistant</span>
                </span>
              </div>
            </div>
            <div className="checker-header-actions">
              <button
                type="button"
                onClick={handleResetChat}
                className="header-icon-btn"
                title="Restart chat"
              >
                <RefreshCw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="header-icon-btn"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="checker-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`checker-msg-wrap ${
                  msg.sender === "user" ? "user-msg" : "bot-msg"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="msg-avatar bot">
                    <HeartPulse size={16} />
                  </div>
                )}

                <div className="msg-bubble">
                  <p className="msg-text" style={{ whiteSpace: "pre-line" }}>{msg.text}</p>

                  {/* Doctor Recommendation Card embedded inside bot response */}
                  {msg.doctor && (
                    <div className="recommended-doctor-card">
                      <span className="recommend-badge">
                        {language === "kn" ? "ಶಿಫಾರಸು ಮಾಡಿದ ತಜ್ಞರು" : language === "hi" ? "अनुशंसित विशेषज्ञ" : "RECOMMENDED SPECIALIST"}
                      </span>
                      <div className="recommend-doctor-row">
                        <div className="doc-avatar-small">
                          {msg.doctor.photo}
                        </div>
                        <div className="doc-meta-small">
                          <h4>{msg.doctor.name}</h4>
                          <span className="doc-spec">{msg.doctor.specialty}</span>
                          <span className="doc-exp">⭐ {msg.doctor.rating} • {msg.doctor.experience}</span>
                        </div>
                      </div>
                      <div className="recommend-footer">
                        <span className="doc-fee">Fee: <strong>{msg.doctor.fee}</strong></span>
                        <Link
                          to={`/appointment?doctor=${msg.doctor.id}`}
                          onClick={() => setIsOpen(false)}
                          className="book-recommend-btn"
                        >
                          <span>{language === "kn" ? "ಬುಕ್ ಮಾಡಿ" : language === "hi" ? "बुक करें" : "Book Now"}</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="msg-avatar user">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="checker-msg-wrap bot-msg">
                <div className="msg-avatar bot">
                  <HeartPulse size={16} />
                </div>
                <div className="msg-bubble typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="quick-suggestions-row">
            <span className="quick-title">
              {language === "kn" ? "ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳು:" : language === "hi" ? "त्वरित प्रश्न:" : "Quick Questions:"}
            </span>
            <div className="chips-scroll">
              {activeQuickSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(item)}
                  className="suggestion-chip"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="checker-input-form"
          >
            <input
              type="text"
              placeholder={
                language === "kn"
                  ? "ಸಮಯ, ಶುಲ್ಕ, ವಿಳಾಸ ಅಥವಾ ರೋಗಲಕ್ಷಣಗಳ ಬಗ್ಗೆ ಕೇಳಿ..."
                  : language === "hi"
                  ? "समय, फीस, पता या बीमारी के लक्षणों के बारे में पूछें..."
                  : "Ask about clinic timings, fees, address, or symptoms..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="checker-send-btn"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>

          {/* Clinical Disclaimer */}
          <div className="checker-disclaimer">
            <span>
              {language === "kn"
                ? "ℹ️ ಡಾ. ಮೇಡಿ ಕ್ಲಿನಿಕಲ್ ಮಾಹಿತಿ ಮತ್ತು ವೈದ್ಯರ ಶಿಫಾರಸು ನೀಡುತ್ತದೆ. ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ 112 ಗೆ ಕರೆ ಮಾಡಿ."
                : language === "hi"
                ? "ℹ️ डॉ. मेडी क्लिनिकल जानकारी और डॉक्टर सिफारिश प्रदान करती हैं। आपात स्थिति में तुरंत 112 डायल करें।"
                : "ℹ️ Dr. Medi provides clinic information and doctor matching. For severe medical emergencies, dial 112 immediately."}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
