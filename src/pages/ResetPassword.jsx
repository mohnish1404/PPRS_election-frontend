import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Globe, HelpCircle, Lock, Eye, EyeOff } from 'lucide-react'
import { resetPassword } from '../services/api'

function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const passwordRules = [
    { label: 'Min 8 characters', test: v => v.length >= 8 },
    { label: 'Max 10 characters', test: v => v.length <= 10 },
    { label: 'One uppercase letter', test: v => /[A-Z]/.test(v) },
    { label: 'One lowercase letter', test: v => /[a-z]/.test(v) },
    { label: 'One number', test: v => /[0-9]/.test(v) },
    { label: 'One special character', test: v => /[!@#$%^&*]/.test(v) },
  ]

  const handleReset = () => {
    if (!password) { setError('Please enter new password'); return }
    const failedRules = passwordRules.filter(r => !r.test(password))
    if (failedRules.length > 0) { setError('Password does not meet requirements'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    setTimeout(() => {
      alert('✅ Password Updated Successfully!')
      localStorage.removeItem('otp')
      navigate('/login')
    }, 500)
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #2196f3 0%, #ffffff 50%, #ffcc99 100%)' }}>

        <div style={{ display: 'flex', height: '4px' }}>
        <div style={{ flex: 1, background: '#FF9933' }} />
        <div style={{ flex: 1, background: '#FFFFFF' }} />
        <div style={{ flex: 1, background: '#138808' }} />
      </div>

{/* Navbar */}
      <div className="flex items-center justify-between px-8 py-3"
        style={{ background: 'rgba(30,60,140,0.95)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 flex items-center justify-center shrink-0">
            <img src="/emblem_v2_clean.png" alt="National Emblem" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Government of India</p>
            <p className="text-xs" style={{ color: '#93c5fd' }}>National Informatics Centre | Chhattisgarh</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-90"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
            🏠 Home
          </button>
          <button className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition">
            <Globe size={14} /> English
          </button>
          <button className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition">
            <HelpCircle size={14} /> Help
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        <div className="w-[85%] rounded-3xl overflow-hidden"
          style={{
            background: 'white',
            boxShadow: '0 30px 80px rgba(0,0,0,0.18)',
            display: 'flex',
            minHeight: '75vh',
            padding: '30px'
          }}>

          {/* LEFT */}
          <div className="flex flex-col items-center justify-center text-center px-12 py-10"
            style={{ flex: 1, background: 'white' }}>

            <img src="/ppsbg.png"
              alt="Logo" style={{ width: '95px', height: '95px', marginBottom: '18px' }}
              onError={(e) => { e.target.style.display = 'none' }} />

            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#000000', fontFamily: 'serif', marginBottom: '4px', lineHeight: '1.3' }}>
              कार्यालय मुख्य निर्वाचन पदाधिकारी, छत्तीसगढ़
            </h1>
            <p style={{ fontSize: '22px', fontWeight: '700', color: '#000000', marginBottom: '2px' }}>
              OFFICE OF THE CHIEF ELECTORAL OFFICER, CHHATTISGARH
            </p>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#b45309', marginBottom: '20px', marginTop: '4px' }}>
              मतदान दल गठन प्रणाली (संस्करण 1.0)
            </p>

            <div style={{ width: '100%', maxWidth: '340px', display: 'flex', justifyContent: 'center' }}>
              <img
                src="/Young woman working at desk.png"
                alt="Illustration"
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-center h-full px-8"
            style={{ width: '500px', minWidth: '440px' }}>

            <div className="w-full rounded-2xl overflow-hidden"
              style={{
                background: 'white',
                boxShadow: '0 30px 70px rgba(0,0,0,0.25)',
                border: '1px solid rgba(200,215,255,0.6)'
              }}>

              <div className="h-1.5 w-full"
                style={{ background: 'linear-gradient(90deg, #f97316, #3b82f6, #06b6d4)' }} />

              <div className="px-8 py-8">

                {/* Header */}
                <div className="flex flex-col items-center mb-5">
                  <div className="rounded-full p-3 mb-3"
                    style={{ background: '#eff6ff', border: '2px solid #bfdbfe' }}>
                    <Lock size={28} color="#1d4ed8" />
                  </div>
                  <h2 className="text-lg font-bold text-center" style={{ color: '#1e3a8a' }}>
                    Set New Password
                  </h2>
                  <div className="mt-1 w-24 h-0.5" style={{ background: '#1e3a8a' }} />
                </div>

                {/* Info Box */}
                <div className="mb-4 p-3 rounded-xl text-xs text-blue-800"
                  style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  🔒 Please set a strong new password for your account.
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-3 p-2.5 rounded-xl text-xs text-red-700"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* New Password */}
                <div className="mb-2">
                  <label className="text-xs font-bold text-gray-500 mb-1 block tracking-wider uppercase">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-xl px-3 py-3"
                    style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter New Password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      onFocus={() => setShowRules(true)}
                      onBlur={() => setShowRules(false)}
                      maxLength={10}
                      className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                    <button onClick={() => setShowPassword(!showPassword)}>
                      {showPassword
                        ? <EyeOff size={15} color="#94a3b8" />
                        : <Eye size={15} color="#94a3b8" />}
                    </button>
                  </div>
                </div>

                {/* Password Rules */}
                {(showRules || password.length > 0) && (
                  <div className="mb-3 rounded-xl p-2.5"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="grid grid-cols-2 gap-x-2">
                      {passwordRules.map((rule, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className={`text-xs font-bold ${rule.test(password) ? 'text-green-500' : 'text-gray-300'}`}>
                            {rule.test(password) ? '✓' : '○'}
                          </span>
                          <span className={`text-xs ${rule.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <div className="mb-5">
                  <label className="text-xs font-bold text-gray-500 mb-1 block tracking-wider uppercase">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-xl px-3 py-3"
                    style={{
                      background: '#f8fafc',
                      border: `1.5px solid ${confirmPassword && password !== confirmPassword ? '#ef4444' : '#e2e8f0'}`
                    }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                      className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                    <button onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm
                        ? <EyeOff size={15} color="#94a3b8" />
                        : <Eye size={15} color="#94a3b8" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Submit */}
                <button onClick={handleReset} disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm tracking-wider transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
                  {loading ? 'Updating...' : 'UPDATE PASSWORD'}
                </button>

                <p className="text-center text-base mt-4 text-gray-500">
                  Back to{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="font-bold hover:underline"
                    style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Login
                  </button>
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#0f1e3d' }}>
        <div className="px-8 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            <div>
              <p style={{ color: '#f97316', fontWeight: 700, fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase' }}>About</p>
              <p style={{ color: '#93c5fd', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                Office of the Chief Electoral Officer, Chhattisgarh<br />
                Indravati Bhawan, Nava Raipur<br />
                Raipur - 492002, C.G.<br />
                📞 0771-XXXXXXX
              </p>
            </div>
            <div>
              <p style={{ color: '#f97316', fontWeight: 700, fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase' }}>Quick Links</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['Terms of Use', 'Privacy Policy', 'Accessibility', 'FAQ', 'Help Desk', 'Contact Us'].map(link => (
                  <a key={link} href="#" style={{ color: '#93c5fd', fontSize: '12px', textDecoration: 'none' }}
                    onMouseOver={e => e.target.style.color = 'white'}
                    onMouseOut={e => e.target.style.color = '#93c5fd'}>
                    → {link}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: '#f97316', fontWeight: 700, fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase' }}>Important Links</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { label: 'ECI - Election Commission of India', url: 'https://eci.gov.in' },
                  { label: 'CG Government Portal', url: 'https://cgstate.gov.in' },
                  { label: 'Digital India', url: 'https://digitalindia.gov.in' },
                  { label: 'RTI Portal', url: 'https://rtionline.gov.in' },
                ].map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noreferrer"
                    style={{ color: '#93c5fd', fontSize: '12px', textDecoration: 'none' }}
                    onMouseOver={e => e.target.style.color = 'white'}
                    onMouseOut={e => e.target.style.color = '#93c5fd'}>
                    → {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 py-3 flex flex-wrap items-center justify-between gap-2">
          <div style={{ color: '#64748b', fontSize: '11px' }}>
            <span>© 2026 National Informatics Centre (NIC), Govt. of India</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span>Site designed and developed by NIC</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span>Best viewed in Chrome/Firefox at 1366×768</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" style={{ color: '#64748b', fontSize: '11px' }}>
              <Lock size={11} />
              <span>256-bit SSL Encrypted</span>
            </div>
            <div style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontSize: '11px' }}>
              🇮🇳 Digital India
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default ResetPassword