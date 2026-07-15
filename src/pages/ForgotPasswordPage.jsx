import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Phone, Mail, Globe, HelpCircle, Lock, RefreshCw, Loader } from 'lucide-react'
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import { auth } from "../firebase"
import emailjs from 'emailjs-com'
import './ForgotPasswordPage.css'

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function ForgotPasswordPage() {
  const [contactType, setContactType] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ userId: '', contact: '', captchaInput: '' })
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const [errors, setErrors] = useState({})
  const [activeFooterModal, setActiveFooterModal] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.userId) newErrors.userId = 'User ID is required'

    if (!contactType) {
      newErrors.contact = 'Please select Email or Mobile Number'
    } else if (!formData.contact) {
      newErrors.contact = contactType === 'mobile' ? 'Mobile number is required' : 'Email is required'
    } else if (contactType === 'mobile' && !/^[0-9]{10}$/.test(formData.contact)) {
      newErrors.contact = 'Valid 10-digit mobile number required'
    } else if (contactType === 'email' && !/\S+@\S+\.\S+/.test(formData.contact)) {
      newErrors.contact = 'Valid email is required'
    }

    if (!formData.captchaInput) {
      newErrors.captchaInput = 'Please enter CAPTCHA'
    } else if (formData.captchaInput.toUpperCase() !== captcha.toUpperCase()) {
      newErrors.captchaInput = 'Invalid CAPTCHA. Please try again.'
      setCaptcha(generateCaptcha())
      setFormData(prev => ({ ...prev, captchaInput: '' }))
    }
    return newErrors
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    try {
      setLoading(true)
      if (contactType === 'mobile') {
        alert("❌ Mobile OTP currently disabled (Firebase billing required)")
      } else {
        await sendEmailOtp(formData.contact)
      }
    } catch (err) {
      console.log("SUBMIT ERROR:", err)
      alert(err.message || "Something went wrong ❌")
    } finally {
      setLoading(false)
    }
  }

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
    }
  }

  const sendOtp = async (phone) => {
    setupRecaptcha()
    const appVerifier = window.recaptchaVerifier
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, "+91" + phone, appVerifier)
      window.confirmationResult = confirmationResult
      alert("OTP sent ✅")
      navigate('/verify-otp')
    } catch (error) {
      console.log(error)
      alert(error.message)
    }
  }

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

  const sendEmailOtp = async (email) => {
    const otp = generateOtp()
    localStorage.setItem("otp", otp)
    console.log("sendEmailOtp called for:", email)
    console.log("generated otp:", otp)
    try {
      await emailjs.send("service_d6f4diq", "template_gnvcdct", { to_email: email, otp: otp }, "N_su8cAnzcSze_X96")
      alert("✅ OTP sent to your Email")
      navigate('/verify-otp')
    } catch (error) {
      console.error("EmailJS send failed:", error)
      const message = error?.text || error?.message || "Failed to send OTP"
      alert(`❌ Failed to send OTP: ${message}`)
    }
  }

  return (
    <div className="fp-page">

      {/* Tricolor Strip */}
      <div className="tricolor-strip">
        <div className="tricolor-saffron" />
        <div className="tricolor-white" />
        <div className="tricolor-green" />
      </div>

      {/* Navbar */}
      <div className="fp-navbar">
        <div className="fp-navbar-brand">
          <div className="fp-navbar-emblem">
            <img src="/emblem_v2_clean.png" alt="National Emblem" />
          </div>
          <div>
            <p className="fp-navbar-title">Government of India</p>
            <p className="fp-navbar-subtitle">National Informatics Centre | Chhattisgarh</p>
          </div>
        </div>
        <div className="fp-navbar-actions">
          <button className="fp-navbar-link-btn">
            <Globe size={14} /> English
          </button>
          <button className="fp-navbar-link-btn">
            <HelpCircle size={14} /> Help
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="fp-main">
        <div className="fp-outer-box">

          {/* LEFT */}
          <div className="fp-left">
            <img src="/ppsbg.png" alt="Logo" className="fp-logo"
              onError={(e) => { e.target.style.display = 'none' }} />

            <h1 className="fp-title-hindi">
              कार्यालय मुख्य निर्वाचन पदाधिकारी, छत्तीसगढ़
            </h1>
            <p className="fp-title-english">
              OFFICE OF THE CHIEF ELECTORAL OFFICER, CHHATTISGARH
            </p>
            <p className="fp-subsystem-name">
              मतदान दल गठन प्रणाली (संस्करण 1.0)
            </p>

            <div className="fp-illustration-wrap">
              <img src="/Contemplating reset on the sofa.png" alt="Illustration"
                onError={(e) => { e.target.style.display = 'none' }} />
            </div>
          </div>

          {/* RIGHT */}
          <div className="fp-right">
            <div className="fp-card">
              <div className="fp-card-topline" />

              <div className="fp-form-body">

                <div className="fp-header">
                  <img src="/Portallogo_239672214918b407e9c7d3e4312b8ac4.svg" alt="Logo" className="fp-header-logo"
                    onError={(e) => { e.target.style.display = 'none' }} />
                  <div className="fp-header-icon-wrap">
                    <span className="fp-header-icon">🔐</span>
                  </div>
                  <h2 className="fp-header-title">Forgot Your Password?</h2>
                  <p className="fp-header-subtitle">Enter your details to reset your password</p>
                  <div className="fp-header-divider" />
                </div>

                {/* User ID */}
                <div className="fp-field-group">
                  <label className="fp-field-label">
                    User ID <span className="fp-required">*</span>
                  </label>
                  <div className={`fp-input-wrap ${errors.userId ? 'error' : ''}`}>
                    <input name="userId" type="text" placeholder="Enter User ID"
                      value={formData.userId} onChange={handleChange}
                      className="fp-input" />
                    <User size={15} color="#94a3b8" />
                  </div>
                  {errors.userId && <p className="fp-error-text">{errors.userId}</p>}
                </div>

                {/* Captcha */}
                <div className="fp-field-group">
                  <label className="fp-field-label">
                    Captcha <span className="fp-required">*</span>
                  </label>
                  <div className="fp-captcha-row">
                    <div className="fp-captcha-canvas-wrap">
                      <button type="button"
                        onClick={() => {
                          setCaptcha(generateCaptcha())
                          setFormData({ ...formData, captchaInput: '' })
                        }}
                        className="fp-captcha-refresh">
                        <RefreshCw size={11} color="#3b82f6" />
                      </button>
                      <canvas
                        ref={(canvas) => {
                          if (!canvas) return
                          const ctx = canvas.getContext('2d')
                          ctx.clearRect(0, 0, canvas.width, canvas.height)
                          ctx.fillStyle = '#f0f4ff'
                          ctx.fillRect(0, 0, canvas.width, canvas.height)
                          for (let i = 0; i < 6; i++) {
                            ctx.strokeStyle = `rgba(${Math.random()*150},${Math.random()*150},${Math.random()*200},0.4)`
                            ctx.lineWidth = 1
                            ctx.beginPath()
                            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
                            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
                            ctx.stroke()
                          }
                          for (let i = 0; i < 40; i++) {
                            ctx.fillStyle = `rgba(${Math.random()*150},${Math.random()*150},${Math.random()*200},0.3)`
                            ctx.beginPath()
                            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2)
                            ctx.fill()
                          }
                          captcha.split('').forEach((char, i) => {
                            ctx.save()
                            ctx.font = `bold ${22 + Math.random() * 8}px serif`
                            ctx.fillStyle = '#000000'
                            ctx.translate(18 + i * 22, 28)
                            ctx.rotate((Math.random() - 0.5) * 0.6)
                            ctx.fillText(char, 0, 0)
                            ctx.restore()
                          })
                        }}
                        width={155}
                        height={44}
                        className="fp-captcha-canvas"
                      />
                    </div>
                    <div className="fp-captcha-input-wrap">
                      <input name="captchaInput" type="text" placeholder="Enter Captcha"
                        value={formData.captchaInput} onChange={handleChange}
                        className="fp-input" />
                    </div>
                  </div>
                </div>

                {/* Contact Type */}
                <div className="fp-contact-type-group">
                  <div className="fp-radio-row">
                    <label className="fp-radio-label">
                      <input type="radio" name="contactType" value="email"
                        checked={contactType === 'email'}
                        onChange={() => { setContactType('email'); setFormData({ ...formData, contact: '' }) }}
                        className="fp-radio-input" />
                      <span className={`fp-radio-text ${contactType === 'email' ? 'active' : ''}`}>Email</span>
                    </label>
                    <label className="fp-radio-label">
                      <input type="radio" name="contactType" value="mobile"
                        checked={contactType === 'mobile'}
                        onChange={() => { setContactType('mobile'); setFormData({ ...formData, contact: '' }) }}
                        className="fp-radio-input" />
                      <span className={`fp-radio-text ${contactType === 'mobile' ? 'active' : ''}`}>Mobile Number</span>
                    </label>
                  </div>

                  {contactType && (
                    <div className={`fp-input-wrap ${errors.contact ? 'error' : ''}`}>
                      <input name="contact" type={contactType === 'email' ? 'email' : 'text'}
                        placeholder={contactType === 'mobile' ? 'Enter 10-digit Mobile Number' : 'Enter Registered Email'}
                        value={formData.contact} onChange={handleChange}
                        maxLength={contactType === 'mobile' ? 10 : undefined}
                        className="fp-input" />
                      {contactType === 'mobile' ? <Phone size={15} color="#94a3b8" /> : <Mail size={15} color="#94a3b8" />}
                    </div>
                  )}
                  {errors.contact && <p className="fp-error-text">{errors.contact}</p>}
                </div>

                {/* Submit */}
                <button onClick={handleSubmit} disabled={loading} className="fp-submit-btn">
                  {loading && <Loader size={15} className="animate-spin" />}
                  {loading ? 'Please wait...' : 'Send OTP'}
                </button>
                <div id="recaptcha-container"></div>

                <div className="fp-links-row">
                  <Link to="/login" className="fp-link">← Back to Login</Link>
                  <span className="fp-link-separator">|</span>
                  <Link to="/register" className="fp-link">New Registration →</Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fp-footer">
        <div className="fp-footer-main">
          <div className="fp-footer-grid">
            <div>
              <p className="fp-footer-heading">About</p>
              <p className="fp-footer-about-text">
                Office of the Chief Electoral Officer, Chhattisgarh<br />
                Mahanadi Bhawan, Nava Raipur<br />
                Raipur - 492002, C.G.<br />
                📞 0771-XXXXXXX
              </p>
            </div>
            <div>
              <p className="fp-footer-heading">Quick Links</p>
              <div className="fp-footer-links-col">
                {[
                  { label: 'Terms of Use', key: 'terms' },
                  { label: 'Privacy Policy', key: 'privacy' },
                  { label: 'Accessibility', key: 'accessibility' },
                  { label: 'FAQ', key: 'faq' },
                  { label: 'Help Desk', key: 'helpdesk' },
                  { label: 'Contact Us', key: 'contact' },
                ].map(link => (
                  <button key={link.key} onClick={() => setActiveFooterModal(link.key)} className="fp-footer-link-btn">
                    → {link.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="fp-footer-heading">Important Links</p>
              <div className="fp-footer-links-col">
                {[
                  { label: 'ECI - Election Commission of India', url: 'https://eci.gov.in' },
                  { label: 'CG Government Portal', url: 'https://cgstate.gov.in' },
                  { label: 'Digital India', url: 'https://digitalindia.gov.in' },
                  { label: 'RTI Portal', url: 'https://rtionline.gov.in' },
                ].map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="fp-footer-link-a">
                    → {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="fp-footer-bottom">
          <div className="fp-footer-copyright">
            <span>© 2026 National Informatics Centre (NIC), Govt. of India</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span>Site designed and developed by NIC</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span>Best viewed in Chrome/Firefox at 1366×768</span>
          </div>
          <div className="fp-footer-badges">
            <div className="fp-footer-ssl">
              <Lock size={11} />
              <span>256-bit SSL Encrypted</span>
            </div>
            <div className="fp-footer-digital-india">🇮🇳 Digital India</div>
          </div>
        </div>
      </div>

      {/* Footer Links Modal */}
      {activeFooterModal && (
        <div className="fp-modal-overlay">
          <div className="fp-modal-box">
            <div className="fp-modal-topline" />
            <div className="fp-modal-content">
              <div className="fp-modal-header">
                <h3 className="fp-modal-title">
                  {{
                    terms: 'Terms of Use',
                    privacy: 'Privacy Policy',
                    accessibility: 'Accessibility Statement',
                    faq: 'Frequently Asked Questions',
                    helpdesk: 'Help Desk',
                    contact: 'Contact Us'
                  }[activeFooterModal]}
                </h3>
                <button onClick={() => setActiveFooterModal(null)} className="fp-modal-close-btn">✕</button>
              </div>

              <div className="fp-modal-body">
                {activeFooterModal === 'terms' && (
                  <p>This portal is owned and maintained by the Office of the Chief Electoral Officer, Chhattisgarh. By using this site, you agree to use it only for lawful election duty management purposes. Unauthorized access or misuse may result in legal action.</p>
                )}
                {activeFooterModal === 'privacy' && (
                  <p>We collect only the information necessary for managing election duty assignments. Your personal data (name, employee code, contact details) is used solely for official purposes and is not shared with third parties.</p>
                )}
                {activeFooterModal === 'accessibility' && (
                  <p>This portal is designed to be accessible to all users, including those with disabilities, in compliance with GIGW (Guidelines for Indian Government Websites) accessibility standards.</p>
                )}
                {activeFooterModal === 'faq' && (
                  <div>
                    <p><strong>Q: How do I register?</strong><br/>Click "Register here" on the login page and fill in your details.</p>
                    <p><strong>Q: My account is pending approval?</strong><br/>Please wait for admin approval. Check status after login.</p>
                    <p><strong>Q: Forgot password?</strong><br/>Use the "Forgot Password" link on the login page.</p>
                  </div>
                )}
                {activeFooterModal === 'helpdesk' && (
                  <p>For technical assistance, contact our Help Desk at <strong>1800-XXX-XXXX</strong> (Mon–Fri, 9 AM – 6 PM) or email <strong>support@cgceo.gov.in</strong>.</p>
                )}
                {activeFooterModal === 'contact' && (
                  <p>
                    Office of the Chief Electoral Officer, Chhattisgarh<br/>
                    Mahanadi Bhawan, Nava Raipur<br/>
                    Raipur - 492002, C.G.<br/>
                    📞 0771-XXXXXXX<br/>
                    📧 ceo-chhattisgarh@eci.gov.in
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ForgotPasswordPage