import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Eye, EyeOff, RefreshCw, Lock, Phone } from 'lucide-react'
import { loginUser, sendOtp, verifyOtp } from '../services/api'
import { saveToken } from '../utils/auth'
import './LoginPage.css'

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function LoginPage() {
  const [loginType, setLoginType] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const [otpSent, setOtpSent] = useState(false)
  const [otpExpired, setOtpExpired] = useState(false)
  const [timer, setTimer] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeFooterModal, setActiveFooterModal] = useState(null)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    userId: '', password: '', captchaInput: '',
    mobileNumber: '', otpCode: ''
  })

  useEffect(() => {
    let interval
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000)
    } else if (timer === 0) {
      setOtpExpired(true)
    }
    return () => clearInterval(interval)
  }, [otpSent, timer])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSendOtp = async () => {
    if (!formData.userId || !formData.mobileNumber) {
      setError('Please enter User ID and Mobile Number')
      return
    }
    try {
      setLoading(true)
      const res = await sendOtp({ userId: formData.userId, mobileNumber: formData.mobileNumber })
      setOtpSent(true)
      setOtpExpired(false)
      setTimer(30)
      alert(`OTP (Development Only): ${res.data.otpCode}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setOtpExpired(false)
    setTimer(30)
    await handleSendOtp()
  }

  const handleLogin = async () => {
    if (!formData.userId || !formData.password) {
      setError('Please enter User ID and Password')
      return
    }
    if (!formData.captchaInput) {
      setError('Please enter Captcha')
      return
    }
    if (formData.captchaInput.toUpperCase() !== captcha.toUpperCase()) {
      setError('Invalid Captcha! Please try again')
      setCaptcha(generateCaptcha())
      setFormData({ ...formData, captchaInput: '' })
      return
    }
    try {
      setLoading(true)
      setError('')
      if (loginType === 'withOTP') {
        if (!formData.otpCode) { setError('Please enter OTP'); setLoading(false); return }
        const res = await verifyOtp({
          userId: formData.userId,
          mobileNumber: formData.mobileNumber,
          otpCode: formData.otpCode
        })
        saveToken(res.data.token, res.data.role)
      } else {
        const res = await loginUser({
          UserId: formData.userId,
          Password: formData.password,
          captcha: formData.captchaInput,
          loginWithOtp: false,
          mobileNumber: ''
        })
        saveToken(res.data.token, res.data.role)
      }
      const role = localStorage.getItem('role')
      navigate(role === 'Admin' ? '/admin' : '/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again')
      setCaptcha(generateCaptcha())
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!loginType) {
      setError('Please select a login method (With OTP or Without OTP)')
      return
    }
    await handleLogin()
  }

  return (
    <div className="login-page">

      {/* Tricolor Strip */}
      <div className="tricolor-strip">
        <div className="tricolor-saffron" />
        <div className="tricolor-white" />
        <div className="tricolor-green" />
      </div>

      {/* Top Navbar */}
      <div className="login-navbar">
        <div className="login-navbar-brand">
          <div className="login-navbar-emblem">
            <img src="/emblem_v2_clean.png" alt="National Emblem" />
          </div>
          <div>
            <p className="login-navbar-title">Government of India</p>
            <p className="login-navbar-subtitle">National Informatics Centre | Chhattisgarh</p>
          </div>
        </div>
        <div>
          <button onClick={() => navigate('/')} className="login-back-btn">
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="login-main">
        <div className="login-outer-box">

          {/* LEFT SIDE */}
          <div className="login-left">
            <img src="/ppsbg.png" alt="Portal Logo" className="login-logo"
              onError={(e) => { e.target.style.display = 'none' }} />

            <h1 className="login-title-hindi">
              कार्यालय मुख्य निर्वाचन पदाधिकारी, छत्तीसगढ़
            </h1>
            <p className="login-title-english">
              OFFICE OF THE CHIEF ELECTORAL OFFICER, CHHATTISGARH
            </p>
            <p className="login-subsystem-name">
              मतदान दल गठन प्रणाली (संस्करण 1.0)
            </p>

            <div className="login-illustration-wrap">
              <img src="/Young woman working at desk.png" alt="Young woman logging in"
                onError={(e) => { e.target.style.display = 'none' }} />
            </div>
          </div>

          {/* RIGHT SIDE — Login Card */}
          <div className="login-right">
            <div className="login-card">
              <div className="login-card-topline" />

              <form onSubmit={handleSubmit} className="login-form">

                {error && (
                  <div className="login-error-box">⚠️ {error}</div>
                )}

                {/* User ID */}
                <div className="login-field-group">
                  <label className="login-field-label">
                    User ID <span className="login-required">*</span>
                  </label>
                  <div className="login-input-wrap">
                    <input name="userId" type="text" placeholder="Enter User ID"
                      value={formData.userId} onChange={handleChange}
                      className="login-input" />
                    <User size={15} color="#94a3b8" />
                  </div>
                </div>

                {/* Password */}
                <div className="login-field-group">
                  <label className="login-field-label">
                    Password <span className="login-required">*</span>
                  </label>
                  <div className="login-input-wrap">
                    <input name="password" type={showPassword ? 'text' : 'password'}
                      placeholder="Enter Password"
                      value={formData.password} onChange={handleChange}
                      className="login-input" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="login-eye-btn">
                      {showPassword
                        ? <EyeOff size={15} color="#94a3b8" />
                        : <Eye size={15} color="#94a3b8" />}
                    </button>
                  </div>
                </div>

                {/* Captcha */}
                <div className="login-field-group">
                  <label className="login-field-label">
                    Captcha <span className="login-required">*</span>
                  </label>
                  <div className="login-captcha-row">
                    <div className="login-captcha-canvas-wrap">
                      <button type="button"
                        onClick={() => {
                          setCaptcha(generateCaptcha())
                          setFormData({ ...formData, captchaInput: '' })
                        }}
                        className="login-captcha-refresh">
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
                        className="login-captcha-canvas"
                      />
                    </div>
                    <div className="login-captcha-input-wrap">
                      <input name="captchaInput" type="text" placeholder="Enter Captcha"
                        value={formData.captchaInput} onChange={handleChange}
                        className="login-input" />
                    </div>
                  </div>
                </div>

                {/* OTP Toggle */}
                <div className="login-toggle-row">
                  <label className="login-radio-label">
                    <input type="radio" name="loginType" value="withOTP"
                      checked={loginType === 'withOTP'}
                      onChange={() => { setLoginType('withOTP'); setOtpSent(false); setError('') }}
                      className="login-radio-input" />
                    <span className={`login-radio-text ${loginType === 'withOTP' ? 'active' : ''}`}>
                      Login with OTP
                    </span>
                  </label>
                  <label className="login-radio-label">
                    <input type="radio" name="loginType" value="withoutOTP"
                      checked={loginType === 'withoutOTP'}
                      onChange={() => { setLoginType('withoutOTP'); setError('') }}
                      className="login-radio-input" />
                    <span className={`login-radio-text ${loginType === 'withoutOTP' ? 'active' : ''}`}>
                      Without OTP
                    </span>
                  </label>
                </div>

                {/* OTP Section */}
                {loginType === 'withOTP' && (
                  <div className="login-field-group">
                    <label className="login-field-label">
                      Mobile No. <span className="login-required">*</span>
                    </label>
                    <div className="login-otp-row">
                      <div className="login-otp-input-wrap">
                        <Phone size={13} color="#94a3b8" className="login-otp-icon" />
                        <input name="mobileNumber" type="text" placeholder="Mobile Number"
                          value={formData.mobileNumber} onChange={handleChange} maxLength={10}
                          className="login-input" />
                      </div>
                      {!otpSent ? (
                        <button type="button" onClick={handleSendOtp} disabled={loading}
                          className="login-send-otp-btn">
                          {loading ? '...' : 'Send OTP'}
                        </button>
                      ) : otpExpired ? (
                        <button type="button" onClick={handleResendOtp} className="login-resend-otp-btn">
                          Resend OTP
                        </button>
                      ) : (
                        <div className="login-otp-timer">{timer}s</div>
                      )}
                    </div>
                    {otpSent && (
                      <div className="login-otp-code-wrap">
                        <input name="otpCode" type="text" placeholder="Enter 6-digit OTP"
                          maxLength={6} value={formData.otpCode} onChange={handleChange}
                          className="login-otp-code-input" />
                      </div>
                    )}
                  </div>
                )}

                {/* Login Button */}
                <button type="submit" disabled={loading} className="login-submit-btn">
                  {loading ? 'Please wait...' : 'LOGIN'}
                </button>

                {/* Links */}
                <div className="login-links-section">
                  <div className="login-links-row">
                    <Link to="/forgot-password" className="login-link">Forgot Password?</Link>
                    <span className="login-link-separator">•</span>
                    <Link to="/activate-user" className="login-link">Activate User?</Link>
                  </div>
                  <p className="login-register-text">
                    Don't have an account?{' '}
                    <Link to="/register" className="login-link-bold">Register here</Link>
                  </p>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="login-footer">
        <div className="login-footer-main">
          <div className="login-footer-grid">
            <div>
              <p className="login-footer-heading">About</p>
              <p className="login-footer-about-text">
                Office of the Chief Electoral Officer, Chhattisgarh<br />
                Mahanadi Bhawan, Nava Raipur<br />
                Raipur - 492002, C.G.<br />
                📞 0771-XXXXXXX
              </p>
            </div>
            <div>
              <p className="login-footer-heading">Quick Links</p>
              <div className="login-footer-links-col">
                {[
                  { label: 'Terms of Use', key: 'terms' },
                  { label: 'Privacy Policy', key: 'privacy' },
                  { label: 'Accessibility', key: 'accessibility' },
                  { label: 'FAQ', key: 'faq' },
                  { label: 'Help Desk', key: 'helpdesk' },
                  { label: 'Contact Us', key: 'contact' },
                ].map(link => (
                  <button key={link.key} onClick={() => setActiveFooterModal(link.key)}
                    className="login-footer-link-btn">
                    → {link.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="login-footer-heading">Important Links</p>
              <div className="login-footer-links-col">
                {[
                  { label: 'ECI - Election Commission of India', url: 'https://eci.gov.in' },
                  { label: 'CG Government Portal', url: 'https://cgstate.gov.in' },
                  { label: 'Digital India', url: 'https://digitalindia.gov.in' },
                  { label: 'RTI Portal', url: 'https://rtionline.gov.in' },
                ].map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noreferrer"
                    className="login-footer-link-a">
                    → {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="login-footer-bottom">
          <div className="login-footer-copyright">
            <span>© 2026 National Informatics Centre (NIC), Govt. of India</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span>Site designed and developed by NIC</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span>Best viewed in Chrome/Firefox at 1366×768</span>
          </div>
          <div className="login-footer-badges">
            <div className="login-footer-ssl">
              <Lock size={11} />
              <span>256-bit SSL Encrypted</span>
            </div>
            <div className="login-footer-digital-india">🇮🇳 Digital India</div>
          </div>
        </div>
      </div>

      {/* Footer Links Modal */}
      {activeFooterModal && (
        <div className="login-modal-overlay">
          <div className="login-modal-box">
            <div className="login-modal-topline" />
            <div className="login-modal-content">
              <div className="login-modal-header">
                <h3 className="login-modal-title">
                  {{
                    terms: 'Terms of Use',
                    privacy: 'Privacy Policy',
                    accessibility: 'Accessibility Statement',
                    faq: 'Frequently Asked Questions',
                    helpdesk: 'Help Desk',
                    contact: 'Contact Us'
                  }[activeFooterModal]}
                </h3>
                <button onClick={() => setActiveFooterModal(null)} className="login-modal-close-btn">✕</button>
              </div>

              <div className="login-modal-body">
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

export default LoginPage