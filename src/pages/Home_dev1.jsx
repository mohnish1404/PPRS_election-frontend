import "./Home_dev1.css";
import { useNavigate } from 'react-router-dom';
import { labels } from "../utils/language";
import homeBg from "../assets/Home_bg.png";
import homeBg2 from "../assets/Home_bg2.png";
import homeBg3 from "../assets/Home_bg3.png";
import homeBg4 from "../assets/Home_bg4.png";
import { useState, useEffect } from "react";
import ppsimg from "../assets/ppsbg.png";

const Home_dev1 = ({ lang, setLang }) => {
  const navigate = useNavigate();
  const heroImages = [homeBg, homeBg2, homeBg3, homeBg4];
const [currentImageIndex, setCurrentImageIndex] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  }, 5000); // 5 second pe switch hoga
  return () => clearInterval(interval);
}, []);

  // Employee Login button handler
  const handleEmployeeLogin = () => {
    navigate('/login');
  };

  // Fill Form button handler
  const handleFillForm = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/employee-entry');
    } else {
      alert(lang === 'en' ? 'Please login first' : 'कृपया पहले लॉगिन करें');
      navigate('/login');
    }
  };

  // Dashboard Overview button handler
  const handleDashboard = () => {
    const role = localStorage.getItem('role');
    if (role === 'Admin' || role === 'SUPER_ADMIN') {
      navigate('/randomization');
    } else {
      alert(lang === 'en' ? 'Admin access only' : 'केवल प्रशासक पहुंच');
       navigate('/login');
    }
  };

  // Admin Login from nav
  const handleAdminLogin = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="pps-container">
      {/* --- TOP HEADER --- */}
      <header className="pps-header">
        <div className="header-left">
          <div className="pps-brand">
            <img src={ppsimg} alt="ECI Logo" className="eci-logo" />
            <div className="brand-text">
              <h1>PPRS</h1>
              <p>| {labels.pps[lang]}</p>
            </div>
          </div>
        </div>

        <nav className="header-nav">
          <a href="#" className="active">
            {labels.home[lang]}
          </a>
          <a href="#">{labels.about[lang]}</a>
          <a
            href="#"
            onClick={handleAdminLogin}
          >
            {labels.Adminlogin[lang]}
          </a>
          <a href="#">{labels.contact[lang]}</a>
          <div className="lang-toggle-container">
            <div
              className={`lang-option ${lang === "hi" ? "active" : ""}`}
              onClick={() => setLang("hi")}
            >
              हिंदी
            </div>
            <div
              className={`lang-option ${lang === "en" ? "active" : ""}`}
              onClick={() => setLang("en")}
            >
              English
            </div>
          </div>
        </nav>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-text-area">
            <h1 className="main-title">
              {" "}
              {labels.ppstitle[lang]} <br /> {labels.ppsrss[lang]}
            </h1>

            <p className="hero-desc">{labels.polling[lang]}</p>
          </div>
         <div className="hero-image-area">
  {heroImages.map((img, index) => (
    <img
      key={index}
      src={img}
      alt="Election Personnel"
      className="banner-img"
      style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        opacity: index === currentImageIndex ? 1 : 0,
        transition: 'opacity 1.2s ease-in-out',
      }}
    />
  ))}
  {/* Dots indicator */}
  <div style={{
    position: 'absolute', bottom: '20px', left: '50%',
    transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 5
  }}>
    {heroImages.map((_, index) => (
      <div key={index}
        onClick={() => setCurrentImageIndex(index)}
        style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.4)',
          cursor: 'pointer', transition: 'background 0.3s'
        }}
      />
    ))}
  </div>
</div>
        </div>

        {/* --- CARDS SECTION --- */}
        <div className="cards-wrapper">
          <div className="info-card">
            <div className="card-icon">🔑</div>
            <h3> {labels.emplog[lang]} </h3>
            <p>{labels.emplogdesc[lang]}</p>
            <button className="card-btn blue-btn" onClick={handleEmployeeLogin}>
              {labels.log[lang]}
            </button>
          </div>

          <div className="info-card">
            <div className="card-icon">👤</div>
            <h3> {labels.employeeEntry[lang]} </h3>
            <p>{labels.employeeDesc[lang]}</p>
            <button className="card-btn dark-blue-btn" onClick={handleFillForm}>
              {labels.fillForm[lang]}
            </button>
          </div>

          <div className="info-card">
            <div className="card-icon">📊</div>
            <h3> {labels.dashboard[lang]} </h3>
            <p>{labels.dashboardDesc[lang]}</p>
            <button className="card-btn dark-blue-btn" onClick={handleDashboard}>
              {labels.viewDashboard[lang]}
            </button>
          </div>
        </div>
      </main>

      {/* --- FOOTER SECTION --- */}
      <footer className="pps-footer">
        <div className="footer-left">
          <p>{labels.footerCopy[lang]}</p>
          <p className="hi-footer-text"> {labels.ppsText[lang]} </p>
        </div>

        <div className="footer-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
            alt="GOI"
          />
          <div className="gov-text-footer">
            <p>GOVERNMENT OF INDIA</p>
            <span>भारत सरकार</span>
          </div>
        </div>

        <div className="footer-contact">
          <p>{labels.contact[lang]}</p>
          <strong>+91-934-372-3622</strong>
        </div>

        <div className="footer-right">
          <div className="nic-logo">
            <p>{labels.designedBy[lang]}</p>
            <div className="nic-flex">
              <span className="nic-text">NIC</span>
              <div className="nic-full">{labels.nicFull[lang]}</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home_dev1;