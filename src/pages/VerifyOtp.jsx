import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Globe, HelpCircle, Lock } from 'lucide-react'

function VerifyOtp() {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleVerify = () => {
    if (!otp) {
      setError('Please enter OTP')
      return
    }
    if (otp.length !== 6) {
      setError('OTP must be 6 digits')
      return
    }
    setLoading(true)
    const savedOtp = localStorage.getItem('otp')
    setTimeout(() => {
      if (otp === savedOtp) {
        alert('OTP Verified ✅')
        navigate('/reset-password')
      } else {
        setError('Invalid OTP ❌ Please try again')
        setLoading(false)
      }
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
                    <ShieldCheck size={28} color="#1d4ed8" />
                  </div>
                  <h2 className="text-lg font-bold text-center" style={{ color: '#1e3a8a' }}>
                    Verify OTP
                  </h2>
                  <div className="mt-1 w-20 h-0.5" style={{ background: '#1e3a8a' }} />
                </div>

                {/* Info Box */}
                <div className="mb-4 p-3 rounded-xl text-xs text-blue-800"
                  style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  📱 OTP has been sent to your registered Mobile / Email.
                  Please enter the 6-digit OTP below. Valid for 30 seconds.
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-3 p-2.5 rounded-xl text-xs text-red-700"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* OTP Input */}
                <div className="mb-5">
                  <label className="text-xs font-bold text-gray-500 mb-1 block tracking-wider uppercase">
                    Enter OTP <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-xl px-3 py-3"
                    style={{ background: '#f0fdf4', border: '1.5px solid #86efac' }}>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/[^0-9]/g, ''))
                        setError('')
                      }}
                      maxLength={6}
                      className="flex-1 bg-transparent outline-none text-lg text-gray-700 placeholder-gray-400 tracking-widest text-center font-bold"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    Enter the 6-digit code sent to you
                  </p>
                </div>

                {/* Verify Button */}
                <button onClick={handleVerify} disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm tracking-wider transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
                  {loading ? 'Verifying...' : 'VERIFY OTP'}
                </button>

                {/* Links */}
                <div className="mt-4 text-center space-y-2">
                  <p className="text-base text-gray-500">
                    Didn't receive OTP?{' '}
                    <button
                      onClick={() => navigate('/forgot-password')}
                      className="font-bold hover:underline"
                      style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Resend OTP
                    </button>
                  </p>
                  <p className="text-base text-gray-500">
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
      </div>

      {/* Footer */}
      <div style={{ background: '#0f1e3d' }}>
        <div className="px-8 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            <div>
              <p style={{ color: '#f97316', fontWeight: 700, fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase' }}>About</p>
              <p style={{ color: '#93c5fd', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                Office of the Chief Electoral Officer, Chhattisgarh<br />
                Mahanadi Bhawan, Nava Raipur<br />
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

export default VerifyOtp