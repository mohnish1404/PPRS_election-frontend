import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, LogOut, User, Settings, Lock,
  ChevronDown, Calendar, Clock, X, Home,
  FileText, Bell, HelpCircle, CheckCircle,
  AlertCircle, Clock3, KeyRound, PhoneCall, XCircle
} from 'lucide-react'
import { removeToken, disableBackButton } from '../utils/auth'
import { getMyApprovalStatus, getMyProfile, updateMyProfile } from '../services/api'

const noScrollbarCss = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`


function UserDashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [approvalStatus, setApprovalStatus] = useState(null)
  const [userData, setUserData] = useState(null)
  const [readNotifications, setReadNotifications] = useState([])
  const [notifFilter, setNotifFilter] = useState('all')
  const [fullProfile, setFullProfile] = useState(null)
   const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ mobileNumber: '', email: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const navigate = useNavigate()

  const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

  useEffect(() => {
    disableBackButton()
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUserData({
          userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 'User',
          fullName: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User',
          role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User',
          email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '—'
        })
      } catch (e) { console.log('Token parse error:', e) }
    }
  }, [])

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const res = await getMyApprovalStatus()
        setApprovalStatus(res.data.data)
      } catch (err) {
        console.log('Error:', err.response?.status, err.response?.data)
      }
    }
    fetchStatus()
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const res = await getMyProfile()
        setFullProfile(res.data.data)
      } catch (err) {
        console.log('Profile fetch error:', err.response?.status, err.response?.data)
      }
    }
    fetchProfile()
  }, [])

  const confirmLogout = () => { removeToken(); navigate('/') }

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  })

  const navItems = [
    { key: 'home', label: 'Home', icon: <Home size={18} /> },
    { key: 'status', label: 'Application Status', icon: <FileText size={18} /> },
    { key: 'profile', label: 'My Profile', icon: <User size={18} /> },
    { key: 'employeeform', label: 'Employee Form', icon: <FileText size={18} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { key: 'help', label: 'Help & Support', icon: <HelpCircle size={18} /> },

  ]

  const allNotifications = [
    approvalStatus && {
      id: 'status-update',
      title: `Application ${approvalStatus.status}`,
      desc: `Your registration request is ${approvalStatus.status.toLowerCase()}.`,
      time: approvalStatus.approvedAt ? new Date(approvalStatus.approvedAt).toLocaleString('en-IN') : `Today, ${currentTime}`,
      icon: approvalStatus.status === 'Approved' ? <CheckCircle size={20} className="text-emerald-400" /> : approvalStatus.status === 'Rejected' ? <XCircle size={20} className="text-red-400" /> : <Clock3 size={20} className="text-yellow-400" />,
      color: approvalStatus.status === 'Approved' ? 'emerald' : approvalStatus.status === 'Rejected' ? 'red' : 'yellow',
    },
    {
      id: 'welcome',
      title: 'Welcome to the Portal!',
      desc: 'You have successfully logged in.',
      time: `Today, ${currentTime}`,
      icon: '🔔',
      color: 'blue',
    },
  ].filter(Boolean)

  const unreadCount = allNotifications.filter(n => !readNotifications.includes(n.id)).length
  const visibleNotifications = notifFilter === 'unread'
    ? allNotifications.filter(n => !readNotifications.includes(n.id))
    : allNotifications

  const statusColor = approvalStatus?.status === 'Approved'
    ? 'text-emerald-400' : approvalStatus?.status === 'Rejected'
    ? 'text-red-400' : 'text-yellow-400'

  return (
<div className="flex min-h-screen font-sans bg-slate-100 relative">
      <style>{noScrollbarCss}</style>
{/* ===== SIDEBAR ===== */}
      <aside className={`w-72 min-h-screen bg-linear-to-b from-[#0a1228] via-[#0f1b3d] to-[#0a1228] flex flex-col fixed left-0 top-0 bottom-0 shadow-2xl z-40 border-r border-white/6 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

{/* Mobile Close Button */}
        <button onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <X size={16} className="text-white" />
        </button>

        {/* 1. Portal Identity Section */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-linear-to-brrom-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/30 shrink-0">
              <ShieldCheck size={22} color="white" />
            </div>
            <div>
              <p className="text-white font-bold text-[15px] leading-tight tracking-tight">Govt. of Chhattisgarh</p>
              <p className="text-blue-300/70 text-[11px] font-medium mt-0.5 tracking-wide">SECURE PORTAL</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/6 mx-6" />

        {/* 2. User Profile Section — Glassmorphism Card */}
        <div className="px-5 pt-3 pb-1">
          <div className="bg-white/4drop-blur-sm rounded-2xl p-3.5 border border-white/8ow-lg shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 ring-2 ring-white/10">
  <span className="text-white font-bold text-sm">{getInitials(userData?.fullName)}</span>
</div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{userData?.fullName || 'User'}</p>
                <p className="text-blue-300/70 text-[11px] truncate font-medium">ID: {userData?.userId || ''}</p>
              </div>
            </div>
<div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/6">
              <CheckCircle size={12} className="text-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-400">Verified User</span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 pt-4 pb-2 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] px-2 mb-3">Navigation</p>
          <div className="space-y-0.5">
            {navItems.map(item => (
              <button key={item.key}
                onClick={() => item.key === 'employeeform' ? navigate('/employee-entry') : setActiveTab(item.key)}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all duration-200 group ${
                  activeTab === item.key
                    ? 'bg-blue-500/12 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-0.5'
                }`}>
                {activeTab === item.key && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-full bg-blue-400" />
                )}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  activeTab === item.key ? 'bg-blue-500/20 text-blue-300' : 'bg-white/4 text-slate-400 group-hover:bg-white/8 group-hover:text-white'
                }`}>
                  {item.icon}
                </div>
                <span className="flex-1 text-left">{item.label}</span>
                {item.key === 'notifications' && unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-4.5 text-center shrink-0">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer Section */}
        <div className="px-4 pb-5 pt-3 border-t border-white/6 space-y-1">
          <button onClick={() => setShowSettingsModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 group">
            <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center shrink-0 group-hover:bg-white/8 transition-colors">
              <Settings size={15} />
            </div>
            Settings
          </button>
          <button onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-red-400/90 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group">
            <div className="w-8 h-8 rounded-lg bg-red-500/8 flex items-center justify-center shrink-0 group-hover:bg-red-500/15 transition-colors">
              <LogOut size={15} />
            </div>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ===== MAIN ===== */}
        <main className="flex-1 min-h-screen transition-all duration-300" style={{ marginLeft: window.innerWidth >= 1024 ? '288px' : '0' }}>

        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          <div>
            <h2 className="font-bold text-slate-800">
              {navItems.find(n => n.key === activeTab)?.label}
            </h2>
            <p className="text-xs text-slate-500">Election Commission — Chhattisgarh</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar size={12} />
              <span>{currentDate}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={12} />
              <span>{currentTime}</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">Online</span>
          </div>
          </div>
        </div>

        

        <div className="p-4 lg:p-8">

          {/* ===== HOME TAB ===== */}
          {activeTab === 'home' && (
            <div className="space-y-6">

              {/* Welcome Hero Card */}
              <div className="rounded-2xl shadow-lg overflow-hidden relative bg-linear-to-br from-slate-900 via-blue-950 to-slate-900">
                {/* Decorative pattern */}
                <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.06] pointer-events-none">
                  <ShieldCheck size={320} className="text-white -mr-16 -mt-12" />
                </div>
                <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-blue-500/10 pointer-events-none" />

                <div className="p-8 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                        {(() => {
                          const h = new Date().getHours();
                          return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
                        })()}
                      </p>
                      <h2 className="text-3xl font-black text-white mb-2">
                        Welcome, {userData?.fullName || 'User'}! 👋
                      </h2>
                      <p className="text-slate-300 text-sm mb-4">
                        You have successfully logged in to the secure government portal.
                      </p>
                    </div>
                    <div className="hidden sm:flex flex-col items-center gap-2">
                      <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 backdrop-blur-sm flex items-center justify-center">
                        <ShieldCheck size={44} className="text-cyan-300" />
                      </div>
                      <span className="text-[11px] font-bold text-cyan-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                        Verified Account
                      </span>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-center gap-2.5 mt-4 px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm w-fit max-w-full">
                    <ShieldCheck size={14} className="text-cyan-300 shrink-0" />
                    <p className="text-xs text-slate-300">
                      <span className="font-bold text-white">Security Notice:</span>{' '}
                      Never share your User ID, Password or OTP. Helpline:{' '}
                      <span className="font-semibold text-orange-400">1800-XXX-XXXX</span>
                    </p>
                  </div>
                </div>
                <div className="h-1.5 bg-linear-to-r from-orange-500 via-blue-500 to-cyan-400" />
              </div>

{/* Quick Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: 'Account Status', value: approvalStatus?.status || 'Loading...', icon: <CheckCircle size={22}/>, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-600', trend: approvalStatus?.status === 'Approved' ? 'Full access granted' : approvalStatus?.status === 'Rejected' ? 'Action needed' : 'Awaiting review' },
                  { label: 'Role', value: userData?.role || '—', icon: <User size={22}/>, color: 'from-blue-500 to-blue-700', bg: 'bg-blue-50', text: 'text-blue-600', trend: 'No changes' },
                  { label: 'Last Login', value: 'Today ' + currentTime, icon: <Clock3 size={22}/>, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50', text: 'text-orange-600', trend: 'Active session' },
                ].map((card, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className={`h-1 bg-linear-to-r ${card.color}`} />
                    <div className="p-5">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-11 h-11 rounded-xl ${card.bg} ${card.text} flex items-center justify-center shrink-0`}>
                          {card.icon}
                        </div>
                        
                        <div>
                          <p className="text-xs text-slate-400 font-medium">{card.label}</p>
                          <p className="text-base font-black text-slate-800">{card.value}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${card.text} ${card.bg} rounded-full px-2.5 py-1 w-fit`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                        {card.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'View Application Status', icon: <FileText size={18} />, tab: 'status' },
                  { label: 'Update Profile', icon: <User size={18} />, tab: 'profile' },
                  { label: 'Contact Support', icon: <HelpCircle size={18} />, tab: 'help' },
                ].map((link, i) => (
                  <button key={i} onClick={() => setActiveTab(link.tab)}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-left">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      {link.icon}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{link.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== APPLICATION STATUS TAB ===== */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                {/* Header Banner */}
<div className="h-24 relative bg-linear-to-br from-slate-900 via-blue-950 to-slate-900">
  <div className="absolute -bottom-9 left-8">
    <div className={`w-18 h-18 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 ${
      approvalStatus?.status === 'Approved' ? 'border-emerald-400' :
      approvalStatus?.status === 'Rejected' ? 'border-red-400' : 'border-amber-400'
    }`}>
      <span className="text-3xl">
        {approvalStatus?.status === 'Approved' ? '✅' :
         approvalStatus?.status === 'Rejected' ? '❌' : '⏳'}
      </span>
    </div>
  </div>
</div>

                <div className="pt-14 pb-8 px-8">
                  {!approvalStatus ? (
                    <div className="text-center py-10 text-slate-400">Loading...</div>
                  ) : (
                    <div className="space-y-6">

                      <div>
                        <h2 className={`text-xl font-black ${
                          approvalStatus.status === 'Approved' ? 'text-emerald-700' :
                          approvalStatus.status === 'Rejected' ? 'text-red-700' : 'text-amber-700'
                        }`}>
                          {approvalStatus.status === 'Approved' ? 'Account Approved!' :
                           approvalStatus.status === 'Rejected' ? 'Request Rejected' : 'Approval Pending'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                          {approvalStatus.status === 'Approved' ? 'You have full access to the system.' :
                           approvalStatus.status === 'Rejected' ? 'Your application has been rejected by admin.' :
                           'Your request is under review by admin.'}
                        </p>
                      </div>

                      {/* Progress Stepper */}
                      <div className="flex items-center justify-between px-2 pt-2">
                        {[
                          { label: 'Registered', done: true },
                          { label: 'Under Review', done: approvalStatus.status !== undefined },
                          { label: approvalStatus.status === 'Rejected' ? 'Rejected' : 'Approved', done: approvalStatus.status === 'Approved' || approvalStatus.status === 'Rejected' },
                        ].map((step, i, arr) => (
                          <div key={i} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                                step.done
                                  ? (i === 2 && approvalStatus.status === 'Rejected' ? 'bg-red-500 border-red-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white')
                                  : 'bg-white border-slate-300 text-slate-400'
                              }`}>
                                {step.done ? '✓' : i + 1}
                              </div>
                              <p className={`text-[11px] font-semibold mt-1.5 text-center whitespace-nowrap ${step.done ? 'text-slate-700' : 'text-slate-400'}`}>
                                {step.label}
                              </p>
                            </div>
                            {i !== arr.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-2 mb-5 ${step.done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { label: 'User ID', value: userData?.userId, icon: <User size={16} />, bg: 'bg-blue-50', color: 'text-blue-500' },
                          { label: 'Full Name', value: userData?.fullName, icon: <User size={16} />, bg: 'bg-blue-50', color: 'text-blue-500' },
                          { label: 'Requested At', value: approvalStatus.requestedAt ? new Date(approvalStatus.requestedAt).toLocaleString('en-IN') : '—', icon: <Calendar size={16} />, bg: 'bg-orange-50', color: 'text-orange-500' },
                          { label: 'Last Updated', value: approvalStatus.approvedAt ? new Date(approvalStatus.approvedAt).toLocaleString('en-IN') : '—', icon: <Clock size={16} />, bg: 'bg-purple-50', color: 'text-purple-500' },
                        ].map((item, i) => (
                          <div key={i} className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-7 h-7 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                                {item.icon}
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.label}</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700 truncate">{item.value || '—'}</p>
                          </div>
                        ))}
                      </div>

                      {/* Rejection Reason */}
                      {approvalStatus.status === 'Rejected' && approvalStatus.remarks && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">❌ Rejection Reason</p>
                          <p className="text-sm text-red-700 font-medium">{approvalStatus.remarks}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== PROFILE TAB ===== */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Cover Banner */}
              <div className="h-28 bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 relative">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 border-4 border-white shadow-lg flex items-center justify-center relative">
  <span className="text-white font-black text-2xl">{getInitials(fullProfile?.fullName || userData?.fullName)}</span>
  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
    <CheckCircle size={12} color="white" />
  </div>
</div>
                </div>
              </div>

              <div className="pt-16 pb-8 px-8">
                <div className="flex flex-col items-center mb-6">
                  <h2 className="text-2xl font-black text-slate-800">{fullProfile?.fullName || userData?.fullName}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{fullProfile?.userId || userData?.userId}</p>
                  <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    {fullProfile?.role || userData?.role}
                  </span>
                </div>

                {/* Stat Chips */}
                <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-8">
                  {[
                    { label: 'Status', value: fullProfile?.isActive ? 'Active' : 'Inactive', color: fullProfile?.isActive ? 'text-emerald-600' : 'text-red-600', bg: fullProfile?.isActive ? 'bg-emerald-50' : 'bg-red-50' },
                    { label: 'Role', value: fullProfile?.role || '—', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Member Since', value: fullProfile?.createdAt ? new Date(fullProfile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—', color: 'text-orange-600', bg: 'bg-orange-50' },
                  ].map((chip, i) => (
                    <div key={i} className={`${chip.bg} rounded-xl p-3 text-center`}>
                      <p className={`text-sm font-black ${chip.color}`}>{chip.value}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{chip.label}</p>
                    </div>
                  ))}
                </div>

                {/* Profile Completion */}
                {(() => {
                  const fields = [fullProfile?.userId, fullProfile?.fullName, fullProfile?.mobileNumber, fullProfile?.email, fullProfile?.role];
                  const filled = fields.filter(Boolean).length;
                  const percent = Math.round((filled / fields.length) * 100);
                  return percent < 100 ? (
                    <div className="max-w-lg mx-auto mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-600">Profile Completion</p>
                        <p className="text-xs font-black text-blue-600">{percent}%</p>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-blue-500 to-cyan-400 rounded-full transition-all" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {[
                    { label: 'User ID', value: fullProfile?.userId, icon: <User size={16} />, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Full Name', value: fullProfile?.fullName, icon: <User size={16} />, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Mobile Number', value: fullProfile?.mobileNumber, icon: <span className="text-sm">📱</span>, color: '', bg: 'bg-green-50' },
                    { label: 'Email', value: fullProfile?.email, icon: <span className="text-sm">✉️</span>, color: '', bg: 'bg-purple-50' },
                    { label: 'Role', value: fullProfile?.role, icon: <ShieldCheck size={16} />, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Account Status', value: fullProfile?.isApproved ? 'Approved' : 'Pending', icon: <CheckCircle size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  ].map((item, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                          {item.icon}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.label}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 truncate">{item.value || '—'}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setEditForm({
                      mobileNumber: fullProfile?.mobileNumber || '',
                      email: fullProfile?.email || ''
                    });
                    setEditError('');
                    setEditSuccess('');
                    setShowEditModal(true);
                  }}
                  className="mt-6 w-full max-w-lg mx-auto flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors">
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
          )}

          {/* ===== NOTIFICATIONS TAB ===== */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              {/* Summary Banner */}
             <div className="rounded-2xl shadow-sm overflow-hidden p-6 flex flex-col items-center text-center gap-2 bg-linear-to-br from-slate-900 via-blue-950 to-slate-900">
  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 relative mb-1">
    <Bell size={26} className="text-cyan-300" />
    {unreadCount > 0 && (
      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900">
        {unreadCount}
      </span>
    )}
  </div>
  <p className="text-xs font-bold text-blue-300 uppercase tracking-wide">
    {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
  </p>
  <p className="text-2xl font-black text-white">
    {allNotifications.length} Notification{allNotifications.length !== 1 ? 's' : ''}
  </p>
  <p className="text-xs text-slate-300">
    {unreadCount > 0 ? `${unreadCount} alert(s) need your attention` : 'No unread alerts pending'}
  </p>
</div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-1.5 bg-linear-to-r from-orange-500 via-blue-500 to-cyan-400" />
                <div className="p-8">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-black text-slate-800">Recent Notifications</h2>
                    <div className="flex gap-2">
                 <button
  onClick={() => setNotifFilter('all')}
  className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors border ${
    notifFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
  }`}>
  All
</button>
<button
  onClick={() => setNotifFilter('unread')}
  className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors border ${
    notifFilter === 'unread' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
  }`}>
  Unread {unreadCount > 0 && `(${unreadCount})`}
</button>
                    </div>
                  </div>

                <div className="space-y-3">
                  {visibleNotifications.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-slate-400">No unread notifications 🎉</p>
                    </div>
                  ) : (
                    visibleNotifications.map((n) => {
                      const isRead = readNotifications.includes(n.id);
                      return (
                        <div
                          key={n.id}
                          onClick={() => !isRead && setReadNotifications(prev => [...prev, n.id])}
                          className={`relative pl-4 p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                            isRead ? 'bg-white border-slate-100 opacity-60' :
                            n.color === 'emerald' ? 'bg-emerald-50/60 border-emerald-100 hover:bg-emerald-50' :
                            n.color === 'red' ? 'bg-red-50/60 border-red-100 hover:bg-red-50' :
                            n.color === 'yellow' ? 'bg-yellow-50/60 border-yellow-100 hover:bg-yellow-50' :
                            'bg-blue-50/60 border-blue-100 hover:bg-blue-50'
                          }`}
                        >
                          <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${
                            isRead ? 'bg-slate-200' :
                            n.color === 'emerald' ? 'bg-emerald-500' :
                            n.color === 'red' ? 'bg-red-500' :
                            n.color === 'yellow' ? 'bg-yellow-500' : 'bg-blue-400'
                          }`} />
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${
                            n.color === 'emerald' ? 'bg-emerald-100' :
                            n.color === 'red' ? 'bg-red-100' :
                            n.color === 'yellow' ? 'bg-yellow-100' : 'bg-blue-100'
                          }`}>
                            {n.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-bold text-slate-800">{n.title}</p>
                              {!isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{n.time}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
  onClick={() => setReadNotifications(allNotifications.map(n => n.id))}
  disabled={unreadCount === 0}
  className={`mt-5 w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
    unreadCount === 0
      ? 'border border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50'
      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer'
  }`}
>
  {unreadCount === 0 ? 'All caught up ✓' : `Mark all ${unreadCount} as read`}
</button>
                </div>
              </div>
            </div>
          )}

          {/* ===== HELP TAB ===== */}
          {activeTab === 'help' && (
            <div className="space-y-5">
              {/* Helpline Hero Card */}
<div className="rounded-2xl shadow-sm overflow-hidden bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 p-6 flex flex-col items-center text-center gap-2">
 <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 mb-1">
  <PhoneCall size={28} className="text-orange-400" />
</div>
  <p className="text-xs font-bold text-orange-400 uppercase tracking-wide">24x7 Helpline Support</p>
  <p className="text-2xl font-black text-white">1800-XXX-XXXX</p>
  <p className="text-xs text-slate-300">Mon–Fri, 9:00 AM – 6:00 PM</p>
</div>

              {/* FAQ Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-1.5 bg-linear-to-r from-orange-500 via-blue-500 to-cyan-400" />
                <div className="p-8">
                  <h2 className="text-xl font-black text-slate-800 mb-1">Frequently Asked Questions</h2>
                  <p className="text-xs text-slate-400 mb-6">Quick answers to common questions</p>

                  <div className="space-y-3">
                    {[
  { q: 'How to reset my password?', a: 'Go to Login page and click "Forgot Password". Enter your User ID or Email to get OTP.', icon: <KeyRound size={18} />, color: 'text-amber-500', bg: 'bg-amber-50' },
  { q: 'My account is not approved yet?', a: 'Please wait for admin to review your request. You can check status in "Application Status" tab.', icon: <Clock3 size={18} />, color: 'text-orange-500', bg: 'bg-orange-50' },
  { q: 'How to contact support?', a: 'Call helpline: 1800-XXX-XXXX (Mon-Fri, 9AM-6PM)', icon: <PhoneCall size={18} />, color: 'text-blue-500', bg: 'bg-blue-50' },
  { q: 'My account was rejected?', a: 'Check rejection reason in "Application Status" tab. You can re-register if needed.', icon: <XCircle size={18} />, color: 'text-red-500', bg: 'bg-red-50' },
].map((item, i) => (
  <details key={i} className="group rounded-xl border border-slate-200 overflow-hidden">
    <summary className="flex items-center gap-3 p-4 cursor-pointer list-none hover:bg-slate-50 transition-colors">
      <div className={`w-9 h-9 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
        {item.icon}
      </div>
                          <p className="text-sm font-bold text-slate-800 flex-1">{item.q}</p>
                          <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180 shrink-0" />
                        </summary>
                        <div className="px-4 pb-4 pl-15">
                          <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
    

      {/* ===== EDIT PROFILE MODAL ===== */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden border-2 border-blue-900">
            <div className="h-1.5 bg-linear-to-r from-orange-500 via-blue-500 to-cyan-400" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">✏️</span>
                <h3 className="font-bold text-slate-800">Edit Profile</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition">
                <X size={18} color="#6b7280" />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">

              {/* Read-only info */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">User ID (cannot be changed)</p>
                <p className="text-sm font-semibold text-slate-600">{fullProfile?.userId}</p>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={editForm.mobileNumber}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, mobileNumber: e.target.value }));
                    setEditError('');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                  placeholder="Enter 10-digit mobile number"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, email: e.target.value }));
                    setEditError('');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                  placeholder="Enter email address"
                />
              </div>

              {/* Error / Success */}
              {editError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-xs font-semibold text-red-600">⚠️ {editError}</p>
                </div>
              )}
              {editSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-600">✅ {editSuccess}</p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                <p className="text-xs text-orange-600 font-semibold">⚠️ Only Mobile Number and Email can be updated.</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editForm.mobileNumber || editForm.mobileNumber.length !== 10) {
                    setEditError('Please enter a valid 10-digit mobile number');
                    return;
                  }
                  if (!editForm.email || !editForm.email.includes('@')) {
                    setEditError('Please enter a valid email address');
                    return;
                  }
                  setEditLoading(true);
                  setEditError('');
                  try {
                    await updateMyProfile(editForm);
                    setEditSuccess('Profile updated successfully!');
                    const res = await getMyProfile();
                    setFullProfile(res.data.data);
                    setTimeout(() => setShowEditModal(false), 1500);
                  } catch (err) {
                    setEditError(err.response?.data?.message || 'Failed to update profile');
                  } finally {
                    setEditLoading(false);
                  }
                }}
                disabled={editLoading}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50"
              >
                {editLoading ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
        </main>

  {/* ===== SETTINGS MODAL ===== */}
      {showSettingsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            
            {/* Header - Dark Navy */}
            <div className="bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 px-6 py-5 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <Settings size={20} className="text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Settings</h3>
                    <p className="text-xs text-blue-300">Manage your account preferences</p>
                  </div>
                </div>
                <button onClick={() => setShowSettingsModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                  <X size={16} className="text-white" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-orange-500 via-blue-500 to-cyan-400" />
            </div>

            {/* Settings Options */}
            <div className="px-5 py-5 space-y-2.5">
              {[
                { label: 'Change Password', desc: 'Update your account password', icon: <Lock size={18} />, color: 'text-red-500', bg: 'bg-red-50' },
                { label: 'Update Mobile Number', desc: 'Change registered mobile number', icon: <span className="text-base">📱</span>, color: '', bg: 'bg-green-50' },
                { label: 'Update Email', desc: 'Change registered email address', icon: <span className="text-base">📧</span>, color: '', bg: 'bg-purple-50' },
              ].map((item, i) => (
                <button key={i} className="w-full flex items-center justify-between p-3.5 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-200 transition-all border border-slate-200 group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" style={{ transform: 'rotate(-90deg)' }} />
                </button>
              ))}

              {/* Notice */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-orange-50 border border-orange-200 mt-3">
                <span className="text-base shrink-0">⚠️</span>
                <p className="text-xs text-orange-700 font-semibold leading-relaxed">
                  Settings changes require admin approval before taking effect.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5">
              <button onClick={() => setShowSettingsModal(false)}
                className="w-full py-3 rounded-xl text-white font-bold text-sm bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 hover:opacity-90 transition shadow-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== LOGOUT MODAL ===== */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border-2 border-blue-900">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full p-3 mb-3 bg-red-100">
                <LogOut size={28} color="#dc2626" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Confirm Logout</h3>
              <p className="text-sm text-gray-500 mb-5">Are you sure you want to logout from the system?</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2 rounded-lg font-semibold text-sm border-2 border-blue-900 text-blue-900 hover:bg-blue-50 transition">
                  Cancel
                </button>
                <button onClick={confirmLogout}
                  className="flex-1 py-2 rounded-lg font-semibold text-sm text-white bg-red-500 hover:bg-red-600 transition">
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default UserDashboard