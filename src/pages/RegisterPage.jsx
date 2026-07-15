import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Phone, Mail, Globe, HelpCircle, Lock, RefreshCw, Loader } from 'lucide-react'
import { registerUser } from '../services/api'
import API from '../services/api'
import './RegisterPage.css'

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showPasswordRules, setShowPasswordRules] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    userId: '', fullName: '', mobile: '', email: '', password: '', confirmPassword: '', captchaInput: ''
  })
  const [errors, setErrors] = useState({})
  const [captcha, setCaptcha] = useState(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  })
  const [userIdStatus, setUserIdStatus] = useState(null)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)
  const [activeFooterModal, setActiveFooterModal] = useState(null)
  const [activeLegalModal, setActiveLegalModal] = useState(null)
  const navigate = useNavigate()

  const passwordRules = [
    { label: 'Minimum 8 characters', test: v => v.length >= 8 },
    { label: 'Maximum 10 characters', test: v => v.length <= 10 },
    { label: 'At least one uppercase', test: v => /[A-Z]/.test(v) },
    { label: 'At least one lowercase', test: v => /[a-z]/.test(v) },
    { label: 'At least one number', test: v => /[0-9]/.test(v) },
    { label: 'At least one special char', test: v => /[!@#$%^&*]/.test(v) },
  ]

  function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setErrors({ ...errors, [name]: '' })
    if (name === 'userId') checkUserId(value)
  }

  let userIdTimer = null
  const checkUserId = (value) => {
    clearTimeout(userIdTimer)
    if (!value || value.length < 3) { setUserIdStatus(null); return }
    setUserIdStatus('checking')
    userIdTimer = setTimeout(async () => {
      try {
        const res = await API.get(`/auth/check-userid?userId=${value}`)
        setUserIdStatus(res.data.available ? 'available' : 'taken')
      } catch { setUserIdStatus(null) }
    }, 600)
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.userId) newErrors.userId = 'User ID is required'
    if (!formData.fullName) newErrors.fullName = 'Full Name is required'
    if (!formData.mobile || !/^[0-9]{10}$/.test(formData.mobile))
      newErrors.mobile = 'Valid 10-digit mobile required'
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Valid email is required'
    if (passwordRules.filter(r => !r.test(formData.password)).length > 0)
      newErrors.password = 'Password does not meet requirements'
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.captchaInput)
      newErrors.captchaInput = 'Please enter captcha'
    else if (formData.captchaInput.toUpperCase() !== captcha.toUpperCase()) {
      newErrors.captchaInput = 'Invalid captcha'
      setCaptcha(generateCaptcha())
      setFormData(prev => ({ ...prev, captchaInput: '' }))
    }
    if (!agreedTerms) newErrors.terms = 'Please accept Terms & Conditions'
    if (!agreedPrivacy) newErrors.privacy = 'Please accept Privacy Policy'
    return newErrors
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    try {
      setLoading(true)
      await registerUser({
        userId: formData.userId, fullName: formData.fullName,
        mobileNumber: formData.mobile, email: formData.email,
        password: formData.password, confirmPassword: formData.confirmPassword
      })
      alert('✅ Registration successful!\nAdmin approval pending (12-24 hours).')
      navigate('/login')
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  const illustrationSrc = "/Young woman working at desk.png"

  return (
    <div className="rp-page">

      <div className="rp-tricolor">
        <div className="rp-tricolor-saffron" />
        <div className="rp-tricolor-white" />
        <div className="rp-tricolor-green" />
      </div>

      {/* Navbar */}
      <div className="rp-navbar">
        <div className="rp-navbar-left">
          <div className="rp-emblem-box">
            <img src="/emblem_v2_clean.png" alt="National Emblem" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <p className="rp-navbar-title">Government of India</p>
            <p className="rp-navbar-subtitle">National Informatics Centre | Chhattisgarh</p>
          </div>
        </div>
        <div className="rp-navbar-right">
          <button className="rp-navbar-link">
            <Globe size={14} /> English
          </button>
          <button className="rp-navbar-link">
            <HelpCircle size={14} /> Help
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="rp-main">
        <div className="rp-card-outer">

          {/* LEFT */}
          <div className="rp-left-panel">
            <img src="/ppsbg.png" alt="Logo" className="rp-portal-logo"
              onError={(e) => { e.target.style.display = 'none' }} />
            <h1 className="rp-hindi-title">कार्यालय मुख्य निर्वाचन पदाधिकारी, छत्तीसगढ़</h1>
            <p className="rp-english-title">OFFICE OF THE CHIEF ELECTORAL OFFICER, CHHATTISGARH</p>
            <p className="rp-system-name">मतदान दल गठन प्रणाली (संस्करण 1.0)</p>
            <div className="rp-illustration-wrap">
              <img src={illustrationSrc} alt="Young woman logging in" className="rp-illustration"
                onError={(e) => { e.target.style.display = 'none' }} />
            </div>
          </div>

          {/* RIGHT */}
          <div className="rp-right-panel">
            <div className="rp-form-card">
              <div className="rp-form-card-topbar" />

              <div className="rp-form-body">

                <div className="rp-form-header">
                  <img src="/Portallogo_239672214918b407e9c7d3e4312b8ac4.svg" alt="Logo" className="rp-form-logo"
                    onError={(e) => { e.target.style.display = 'none' }} />
                  <h2 className="rp-form-title">Register New User</h2>
                  <div className="rp-form-divider" />
                </div>

                {/* User ID */}
                <div className="rp-field-group">
                  <label className="rp-field-label">
                    User ID <span className="rp-field-required">*</span>
                  </label>
                  <div className={`rp-input-wrap ${errors.userId ? 'has-error' : ''}`}>
                    <input name="userId" type="text" placeholder="Enter User ID"
                      value={formData.userId} onChange={handleChange}
                      className="rp-input" />
                    <User size={15} color="#94a3b8" />
                  </div>
                  {errors.userId && <p className="rp-field-error">{errors.userId}</p>}
                </div>

                {/* Full Name */}
                <div className="rp-field-group">
                  <label className="rp-field-label">
                    Full Name <span className="rp-field-required">*</span>
                  </label>
                  <div className={`rp-input-wrap ${errors.fullName ? 'has-error' : ''}`}>
                    <input name="fullName" type="text" placeholder="Enter Full Name"
                      value={formData.fullName} onChange={handleChange}
                      className="rp-input" />
                    <User size={15} color="#94a3b8" />
                  </div>
                  {errors.fullName && <p className="rp-field-error">{errors.fullName}</p>}
                </div>

                {/* Mobile */}
                <div className="rp-field-group">
                  <label className="rp-field-label">
                    Mobile Number <span className="rp-field-required">*</span>
                  </label>
                  <div className={`rp-input-wrap ${errors.mobile ? 'has-error' : ''}`}>
                    <input name="mobile" type="text" placeholder="Enter Mobile Number"
                      value={formData.mobile} onChange={handleChange} maxLength={10}
                      className="rp-input" />
                    <Phone size={15} color="#94a3b8" />
                  </div>
                  {errors.mobile && <p className="rp-field-error">{errors.mobile}</p>}
                </div>

                {/* Email */}
                <div className="rp-field-group">
                  <label className="rp-field-label">
                    Email <span className="rp-field-required">*</span>
                  </label>
                  <div className={`rp-input-wrap ${errors.email ? 'has-error' : ''}`}>
                    <input name="email" type="email" placeholder="Enter Email"
                      value={formData.email} onChange={handleChange}
                      className="rp-input" />
                    <Mail size={15} color="#94a3b8" />
                  </div>
                  {errors.email && <p className="rp-field-error">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="rp-field-group">
                  <label className="rp-field-label">
                    Password <span className="rp-field-required">*</span>
                  </label>
                  <div className={`rp-input-wrap ${errors.password ? 'has-error' : ''}`}>
                    <input name="password" type={showPassword ? 'text' : 'password'}
                      placeholder="Enter Password"
                      value={formData.password} onChange={handleChange}
                      maxLength={10}
                      onFocus={() => setShowPasswordRules(true)}
                      onBlur={() => setShowPasswordRules(false)}
                      className="rp-input" />
                    <button onClick={() => setShowPassword(!showPassword)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                      {showPassword ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                    </button>
                  </div>
                  {errors.password && <p className="rp-field-error">{errors.password}</p>}
                </div>

                {/* Password Rules */}
                {(showPasswordRules || formData.password.length > 0) && (
                  <div className="rp-password-rules">
                    <div className="rp-password-rules-grid">
                      {passwordRules.map((rule, i) => {
                        const valid = rule.test(formData.password)
                        return (
                          <div key={i} className="rp-rule-item">
                            <span className={`rp-rule-check ${valid ? 'valid' : 'invalid'}`}>
                              {valid ? '✓' : '○'}
                            </span>
                            <span className={`rp-rule-text ${valid ? 'valid' : 'invalid'}`}>
                              {rule.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <div className="rp-field-group" style={{ marginBottom: '16px' }}>
                  <label className="rp-field-label">
                    Confirm Password <span className="rp-field-required">*</span>
                  </label>
                  <div className={`rp-input-wrap ${errors.confirmPassword ? 'has-error' : ''}`}>
                    <input name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword} onChange={handleChange}
                      className="rp-input" />
                    <button onClick={() => setShowConfirm(!showConfirm)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                      {showConfirm ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="rp-field-error">{errors.confirmPassword}</p>}
                </div>

                {/* Captcha */}
                <div className="rp-field-group">
                  <label className="rp-field-label">
                    Captcha <span className="rp-field-required">*</span>
                  </label>
                  <div className="rp-captcha-row">
                    <div className="rp-captcha-box-wrap">
                      <button type="button"
                        onClick={() => {
                          setCaptcha(generateCaptcha())
                          setFormData({ ...formData, captchaInput: '' })
                        }}
                        className="rp-captcha-refresh">
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
                        className="rp-captcha-canvas"
                      />
                    </div>
                    <div className="rp-captcha-input-wrap">
                      <input name="captchaInput" type="text" placeholder="Enter Captcha"
                        value={formData.captchaInput} onChange={handleChange}
                        className="rp-input" />
                    </div>
                  </div>
                </div>

                {/* Terms & Privacy */}
                <div className="rp-legal-block">
                  <div className="rp-legal-row">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedTerms}
                      onChange={e => { setAgreedTerms(e.target.checked); setErrors(p => ({ ...p, terms: '' })) }}
                      className="rp-checkbox"
                    />
                    <label htmlFor="terms" className="rp-legal-label">
                      I agree to the <button type="button" onClick={() => setActiveLegalModal('terms')} className="rp-legal-link">Terms & Conditions</button> <span className="rp-field-required">*</span>
                    </label>
                  </div>

                  <div className="rp-legal-row">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={agreedPrivacy}
                      onChange={e => { setAgreedPrivacy(e.target.checked); setErrors(p => ({ ...p, privacy: '' })) }}
                      className="rp-checkbox"
                    />
                    <label htmlFor="privacy" className="rp-legal-label">
                      I agree to the <button type="button" onClick={() => setActiveLegalModal('privacy')} className="rp-legal-link">Privacy Policy</button> <span className="rp-field-required">*</span>
                    </label>
                  </div>

                  <div className="rp-legal-row align-start">
                    <input
                      type="checkbox"
                      id="comms"
                      className="rp-checkbox with-margin"
                    />
                    <label htmlFor="comms" className="rp-legal-label">
                      I agree to receive communications, updates, and notifications from Chief Electoral Officer, Chhattisgarh. <span className="rp-field-required">*</span>
                    </label>
                  </div>

                  {(errors.terms || errors.privacy) && (
                    <p className="rp-legal-error">
                      ⚠️ Please accept the Terms & Conditions and Privacy Policy before proceeding.
                    </p>
                  )}
                </div>

                {/* Terms/Privacy Modal */}
                {activeLegalModal && (
                  <div className="rp-modal-overlay">
                    <div className="rp-modal-box">
                      <div className="rp-modal-topbar" />
                      <div className="rp-modal-body">
                        <div className="rp-modal-header">
                          <h3 className="rp-modal-title">
                            {activeLegalModal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                          </h3>
                          <button onClick={() => setActiveLegalModal(null)} className="rp-modal-close">✕</button>
                        </div>
                        <div className="rp-modal-text">
                          {activeLegalModal === 'terms' && (
                            <p>This portal is owned and maintained by the Office of the Chief Electoral Officer, Chhattisgarh. By registering, you agree to use this system only for lawful election duty management purposes. Sharing your credentials with others, attempting unauthorized access, or misusing official data may result in account suspension and legal action under applicable laws.</p>
                          )}
                          {activeLegalModal === 'privacy' && (
                            <p>We collect only the information necessary for managing election duty assignments, including your name, employee code, mobile number, and email address. This data is used solely for official election duty purposes, is stored securely, and is not shared with any third party except as required by law or election regulations.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button onClick={handleSubmit} disabled={loading || !agreedTerms || !agreedPrivacy} type="button"
                  className="rp-submit-btn">
                  {loading && <Loader size={15} className="animate-spin" />}
                  {loading ? 'Registering...' : 'REGISTER'}
                </button>

                <div className="rp-bottom-links">
                  <Link to="/login" className="rp-bottom-link">← Back to Login</Link>
                  <span className="rp-bottom-divider">|</span>
                  <Link to="/register" className="rp-bottom-link">New Registration →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="rp-footer">
        <div className="rp-footer-top">
          <div className="rp-footer-grid">
            <div>
              <p className="rp-footer-heading">About</p>
              <p className="rp-footer-text">
                Office of the Chief Electoral Officer, Chhattisgarh<br />
                Indravati Bhawan, Nava Raipur<br />
                Raipur - 492002, C.G.<br />
                📞 0771-XXXXXXX
              </p>
            </div>
            <div>
              <p className="rp-footer-heading">Quick Links</p>
              <div className="rp-footer-links">
                {[
                  { label: 'Terms of Use', key: 'terms' },
                  { label: 'Privacy Policy', key: 'privacy' },
                  { label: 'Accessibility', key: 'accessibility' },
                  { label: 'FAQ', key: 'faq' },
                  { label: 'Help Desk', key: 'helpdesk' },
                  { label: 'Contact Us', key: 'contact' },
                ].map(link => (
                  <button key={link.key} onClick={() => setActiveFooterModal(link.key)} className="rp-footer-link">
                    → {link.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="rp-footer-heading">Important Links</p>
              <div className="rp-footer-links">
                {[
                  { label: 'ECI - Election Commission of India', url: 'https://eci.gov.in' },
                  { label: 'CG Government Portal', url: 'https://cgstate.gov.in' },
                  { label: 'Digital India', url: 'https://digitalindia.gov.in' },
                  { label: 'RTI Portal', url: 'https://rtionline.gov.in' },
                ].map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="rp-footer-link">
                    → {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="rp-footer-bottom">
          <div className="rp-footer-copy">
            <span>© 2026 National Informatics Centre (NIC), Govt. of India</span>
            <span className="rp-footer-copy-divider">|</span>
            <span>Site designed and developed by NIC</span>
            <span className="rp-footer-copy-divider">|</span>
            <span>Best viewed in Chrome/Firefox at 1366×768</span>
          </div>
          <div className="rp-footer-meta">
            <div className="rp-footer-ssl">
              <Lock size={11} />
              <span>256-bit SSL Encrypted</span>
            </div>
            <div className="rp-footer-badge">🇮🇳 Digital India</div>
          </div>
        </div>
      </div>

      {/* Footer Links Modal */}
      {activeFooterModal && (
        <div className="rp-modal-overlay">
          <div className="rp-modal-box">
            <div className="rp-modal-topbar" />
            <div className="rp-modal-body">
              <div className="rp-modal-header">
                <h3 className="rp-modal-title">
                  {{
                    terms: 'Terms of Use',
                    privacy: 'Privacy Policy',
                    accessibility: 'Accessibility Statement',
                    faq: 'Frequently Asked Questions',
                    helpdesk: 'Help Desk',
                    contact: 'Contact Us'
                  }[activeFooterModal]}
                </h3>
                <button onClick={() => setActiveFooterModal(null)} className="rp-modal-close">✕</button>
              </div>
              <div className="rp-modal-text">
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

export default RegisterPage