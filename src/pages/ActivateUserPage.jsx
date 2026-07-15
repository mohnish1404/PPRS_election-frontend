import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Eye, EyeOff, Globe, HelpCircle, Lock, RefreshCw, Loader, CheckCircle } from 'lucide-react'
import { activateUser } from '../services/api'
import './ActivateUserPage.css'

function ActivateUserPage() {
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showPasswordRules, setShowPasswordRules] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    userId: '', oldPassword: '', newPassword: '', confirmPassword: '', captchaInput: ''
  })
  const [errors, setErrors] = useState({})
  const [captcha, setCaptcha] = useState(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [refId] = useState(() => 'ACT-2026-' + Math.floor(100000 + Math.random() * 900000))
  const [activeFooterModal, setActiveFooterModal] = useState(null)
  const navigate = useNavigate()

  const passwordRules = [
    { label: 'Min 8 characters',       test: v => v.length >= 8 },
    { label: 'Max 10 characters',      test: v => v.length <= 10 },
    { label: 'One uppercase letter',   test: v => /[A-Z]/.test(v) },
    { label: 'One lowercase letter',   test: v => /[a-z]/.test(v) },
    { label: 'One number',             test: v => /[0-9]/.test(v) },
    { label: 'One special character',  test: v => /[!@#$%^&*]/.test(v) },
  ]

  function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.userId) newErrors.userId = 'User ID is required'
    if (!formData.oldPassword) newErrors.oldPassword = 'Old password is required'
    if (passwordRules.filter(r => !r.test(formData.newPassword)).length > 0)
      newErrors.newPassword = 'Password does not meet requirements'
    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.captchaInput)
      newErrors.captchaInput = 'Please enter CAPTCHA'
    else if (formData.captchaInput.toUpperCase() !== captcha.toUpperCase()) {
      newErrors.captchaInput = 'Invalid CAPTCHA. Please try again.'
      setCaptcha(generateCaptcha())
      setFormData(prev => ({ ...prev, captchaInput: '' }))
    }
    return newErrors
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    try {
      setLoading(true)
      await activateUser({
        userId: formData.userId,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })
      setShowSuccess(true)
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Request failed'))
    } finally {
      setLoading(false)
    }
  }

  const footerModalTitles = {
    terms: 'Terms of Use', privacy: 'Privacy Policy',
    accessibility: 'Accessibility Statement', faq: 'Frequently Asked Questions',
    helpdesk: 'Help Desk', contact: 'Contact Us'
  }

  return (
    <div className="aup-page">

      {/* Tricolor */}
      <div className="aup-tricolor">
        <div className="aup-tricolor-saffron" />
        <div className="aup-tricolor-white" />
        <div className="aup-tricolor-green" />
      </div>

      {/* Navbar */}
      <div className="aup-navbar">
        <div className="aup-navbar-left">
          <div className="aup-emblem-box">
            <img src="/emblem_v2_clean.png" alt="National Emblem" />
          </div>
          <div>
            <p className="aup-nav-title">Government of India</p>
            <p className="aup-nav-sub">National Informatics Centre | Chhattisgarh</p>
          </div>
        </div>
        <div className="aup-navbar-right">
          <button className="aup-nav-btn"><Globe size={14} /> English</button>
          <button className="aup-nav-btn"><HelpCircle size={14} /> Help</button>
        </div>
      </div>

      {/* Main */}
      <div className="aup-main">
        <div className="aup-card-outer">

          {/* LEFT */}
          <div className="aup-left">
            <img src="/ppsbg.png" alt="Logo" className="aup-portal-logo"
              onError={e => { e.target.style.display = 'none' }} />
            <h1 className="aup-hindi-title">कार्यालय मुख्य निर्वाचन पदाधिकारी, छत्तीसगढ़</h1>
            <p className="aup-english-title">OFFICE OF THE CHIEF ELECTORAL OFFICER, CHHATTISGARH</p>
            <p className="aup-system-name">मतदान दल गठन प्रणाली (संस्करण 1.0)</p>
            <div className="aup-illustration-wrap">
              <img src="/Young woman working at desk.png" alt="Illustration" className="aup-illustration"
                onError={e => { e.target.style.display = 'none' }} />
            </div>
          </div>

          {/* RIGHT */}
          <div className="aup-right">
            <div className="aup-form-card">
              <div className="aup-form-card-bar" />

              {/* Success State */}
              {showSuccess && (
                <div className="aup-success">
                  <div className="aup-success-icon">
                    <CheckCircle size={44} color="#16a34a" />
                  </div>
                  <h2 className="aup-success-title">✅ Password Updated Successfully</h2>
                  <p className="aup-success-sub">Your account has been activated successfully.</p>
                  <p className="aup-success-sub">You can now log in using your new password.</p>
                  <div className="aup-success-refid">Reference ID: {refId}</div>
                  <p className="aup-success-note">
                    A confirmation notification has been sent to your registered contact details.
                  </p>
                  <button className="aup-go-login-btn" onClick={() => navigate('/login')}>Go to Login</button>
                  <button className="aup-go-home-btn" onClick={() => navigate('/')}>Return to Home</button>
                </div>
              )}

              {/* Form State */}
              {!showSuccess && (
                <div className="aup-form-body">

                  {/* Header */}
                  <div className="aup-form-header">
                    <img src="/Portallogo_239672214918b407e9c7d3e4312b8ac4.svg"
                      alt="Logo" className="aup-form-logo"
                      onError={e => { e.target.style.display = 'none' }} />
                    <h2 className="aup-form-title">Activate User Account</h2>
                    <div className="aup-form-divider" />
                  </div>

                  {/* Warning */}
                  <div className="aup-warning">
                    ⚠️ Your password has expired. Please set a new password.
                  </div>

                  {/* User ID */}
                  <div className="aup-field">
                    <label className="aup-field-label">User ID <span className="aup-field-required">*</span></label>
                    <div className={`aup-input-wrap ${errors.userId ? 'error' : ''}`}>
                      <input name="userId" type="text" placeholder="Enter User ID"
                        value={formData.userId} onChange={handleChange} className="aup-input" />
                      <User size={15} color="#94a3b8" />
                    </div>
                    {errors.userId && <p className="aup-field-error">{errors.userId}</p>}
                  </div>

                  {/* Old Password */}
                  <div className="aup-field">
                    <label className="aup-field-label">Old Password <span className="aup-field-required">*</span></label>
                    <div className={`aup-input-wrap ${errors.oldPassword ? 'error' : ''}`}>
                      <input name="oldPassword" type={showOld ? 'text' : 'password'}
                        placeholder="Enter Old Password"
                        value={formData.oldPassword} onChange={handleChange} className="aup-input" />
                      <button className="aup-eye-btn" onClick={() => setShowOld(!showOld)} type="button">
                        {showOld ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                      </button>
                    </div>
                    {errors.oldPassword && <p className="aup-field-error">{errors.oldPassword}</p>}
                  </div>

                  {/* New Password */}
                  <div className="aup-field">
                    <label className="aup-field-label">New Password <span className="aup-field-required">*</span></label>
                    <div className={`aup-input-wrap ${errors.newPassword ? 'error' : ''}`}>
                      <input name="newPassword" type={showNew ? 'text' : 'password'}
                        placeholder="Enter New Password"
                        value={formData.newPassword} onChange={handleChange}
                        maxLength={10}
                        onFocus={() => setShowPasswordRules(true)}
                        onBlur={() => setShowPasswordRules(false)}
                        className="aup-input" />
                      <button className="aup-eye-btn" onClick={() => setShowNew(!showNew)} type="button">
                        {showNew ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="aup-field-error">{errors.newPassword}</p>}
                  </div>

                  {/* Password Rules */}
                  {(showPasswordRules || formData.newPassword.length > 0) && (
                    <div className="aup-pw-rules">
                      <div className="aup-pw-rules-grid">
                        {passwordRules.map((rule, i) => {
                          const valid = rule.test(formData.newPassword)
                          return (
                            <div key={i} className="aup-rule-item">
                              <span className={`aup-rule-check ${valid ? 'valid' : 'invalid'}`}>
                                {valid ? '✓' : '○'}
                              </span>
                              <span className={`aup-rule-text ${valid ? 'valid' : 'invalid'}`}>
                                {rule.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div className="aup-field" style={{ marginBottom: '16px' }}>
                    <label className="aup-field-label">Confirm Password <span className="aup-field-required">*</span></label>
                    <div className={`aup-input-wrap ${errors.confirmPassword ? 'error' : ''}`}>
                      <input name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                        placeholder="Confirm New Password"
                        value={formData.confirmPassword} onChange={handleChange} className="aup-input" />
                      <button className="aup-eye-btn" onClick={() => setShowConfirm(!showConfirm)} type="button">
                        {showConfirm ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="aup-field-error">{errors.confirmPassword}</p>}
                  </div>

                  {/* Captcha */}
                  <div className="aup-field">
                    <label className="aup-field-label">Captcha <span className="aup-field-required">*</span></label>
                    <div className="aup-captcha-row">
                      <div className="aup-captcha-box-wrap">
                        <button type="button" className="aup-captcha-refresh"
                          onClick={() => { setCaptcha(generateCaptcha()); setFormData({ ...formData, captchaInput: '' }) }}>
                          <RefreshCw size={11} color="#3b82f6" />
                        </button>
                        <canvas
                          className="aup-captcha-canvas"
                          width={155} height={44}
                          ref={canvas => {
                            if (!canvas) return
                            const ctx = canvas.getContext('2d')
                            ctx.clearRect(0, 0, canvas.width, canvas.height)
                            ctx.fillStyle = '#f0f4ff'
                            ctx.fillRect(0, 0, canvas.width, canvas.height)
                            for (let i = 0; i < 6; i++) {
                              ctx.strokeStyle = `rgba(${Math.random()*150},${Math.random()*150},${Math.random()*200},0.4)`
                              ctx.lineWidth = 1; ctx.beginPath()
                              ctx.moveTo(Math.random()*canvas.width, Math.random()*canvas.height)
                              ctx.lineTo(Math.random()*canvas.width, Math.random()*canvas.height)
                              ctx.stroke()
                            }
                            for (let i = 0; i < 40; i++) {
                              ctx.fillStyle = `rgba(${Math.random()*150},${Math.random()*150},${Math.random()*200},0.3)`
                              ctx.beginPath()
                              ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, 1, 0, Math.PI*2)
                              ctx.fill()
                            }
                            captcha.split('').forEach((char, i) => {
                              ctx.save()
                              ctx.font = `bold ${22 + Math.random()*8}px serif`
                              ctx.fillStyle = '#000000'
                              ctx.translate(18 + i*22, 28)
                              ctx.rotate((Math.random()-0.5)*0.6)
                              ctx.fillText(char, 0, 0)
                              ctx.restore()
                            })
                          }}
                        />
                      </div>
                      <div className="aup-input-wrap" style={{ flex: 1 }}>
                        <input name="captchaInput" type="text" placeholder="Enter Captcha"
                          value={formData.captchaInput} onChange={handleChange} className="aup-input" />
                      </div>
                    </div>
                    {errors.captchaInput && <p className="aup-field-error">{errors.captchaInput}</p>}
                  </div>

                  {/* Submit */}
                  <button className="aup-submit-btn" onClick={handleSubmit} disabled={loading}>
                    {loading && <Loader size={15} className="animate-spin" />}
                    {loading ? 'Activating...' : 'ACTIVATE ACCOUNT'}
                  </button>

                  {/* Bottom links */}
                  <div className="aup-bottom-links">
                    <Link to="/login" className="aup-bottom-link">← Back to Login</Link>
                    <span className="aup-bottom-divider">|</span>
                    <Link to="/register" className="aup-bottom-link">New Registration →</Link>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="aup-footer">
        <div className="aup-footer-top">
          <div className="aup-footer-grid">
            <div>
              <p className="aup-footer-heading">About</p>
              <p className="aup-footer-text">
                Office of the Chief Electoral Officer, Chhattisgarh<br />
                Mahanadi Bhawan, Nava Raipur<br />
                Raipur - 492002, C.G.<br />
                📞 0771-XXXXXXX
              </p>
            </div>
            <div>
              <p className="aup-footer-heading">Quick Links</p>
              <div className="aup-footer-links">
                {[
                  { label: 'Terms of Use', key: 'terms' },
                  { label: 'Privacy Policy', key: 'privacy' },
                  { label: 'Accessibility', key: 'accessibility' },
                  { label: 'FAQ', key: 'faq' },
                  { label: 'Help Desk', key: 'helpdesk' },
                  { label: 'Contact Us', key: 'contact' },
                ].map(link => (
                  <button key={link.key} className="aup-footer-link" onClick={() => setActiveFooterModal(link.key)}>
                    → {link.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="aup-footer-heading">Important Links</p>
              <div className="aup-footer-links">
                {[
                  { label: 'ECI - Election Commission of India', url: 'https://eci.gov.in' },
                  { label: 'CG Government Portal', url: 'https://cgstate.gov.in' },
                  { label: 'Digital India', url: 'https://digitalindia.gov.in' },
                  { label: 'RTI Portal', url: 'https://rtionline.gov.in' },
                ].map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="aup-footer-link">
                    → {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="aup-footer-bottom">
          <div className="aup-footer-copy">
            <span>© 2026 National Informatics Centre (NIC), Govt. of India</span>
            <span className="aup-footer-copy-divider">|</span>
            <span>Site designed and developed by NIC</span>
            <span className="aup-footer-copy-divider">|</span>
            <span>Best viewed in Chrome/Firefox at 1366×768</span>
          </div>
          <div className="aup-footer-meta">
            <div className="aup-footer-ssl">
              <Lock size={11} />
              <span>256-bit SSL Encrypted</span>
            </div>
            <div className="aup-footer-badge">🇮🇳 Digital India</div>
          </div>
        </div>
      </div>

      {/* Footer Modal */}
      {activeFooterModal && (
        <div className="aup-modal-overlay">
          <div className="aup-modal-box">
            <div className="aup-modal-bar" />
            <div className="aup-modal-body">
              <div className="aup-modal-header">
                <h3 className="aup-modal-title">{footerModalTitles[activeFooterModal]}</h3>
                <button className="aup-modal-close" onClick={() => setActiveFooterModal(null)}>✕</button>
              </div>
              <div className="aup-modal-text">
                {activeFooterModal === 'terms' && <p>This portal is owned and maintained by the Office of the Chief Electoral Officer, Chhattisgarh. By using this site, you agree to use it only for lawful election duty management purposes. Unauthorized access or misuse may result in legal action.</p>}
                {activeFooterModal === 'privacy' && <p>We collect only the information necessary for managing election duty assignments. Your personal data (name, employee code, contact details) is used solely for official purposes and is not shared with third parties.</p>}
                {activeFooterModal === 'accessibility' && <p>This portal is designed to be accessible to all users, including those with disabilities, in compliance with GIGW (Guidelines for Indian Government Websites) accessibility standards.</p>}
                {activeFooterModal === 'faq' && (
                  <div>
                    <p><strong>Q: How do I register?</strong><br />Click "Register here" on the login page and fill in your details.</p>
                    <p><strong>Q: My account is pending approval?</strong><br />Please wait for admin approval. Check status after login.</p>
                    <p><strong>Q: Forgot password?</strong><br />Use the "Forgot Password" link on the login page.</p>
                  </div>
                )}
                {activeFooterModal === 'helpdesk' && <p>For technical assistance, contact our Help Desk at <strong>1800-XXX-XXXX</strong> (Mon–Fri, 9 AM – 6 PM) or email <strong>support@cgceo.gov.in</strong>.</p>}
                {activeFooterModal === 'contact' && (
                  <p>
                    Office of the Chief Electoral Officer, Chhattisgarh<br />
                    Mahanadi Bhawan, Nava Raipur<br />
                    Raipur - 492002, C.G.<br />
                    📞 0771-XXXXXXX<br />
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

export default ActivateUserPage