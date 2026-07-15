import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LogOut,
  User,
  FileText,
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Lock,
  ChevronDown,
  LayoutDashboard,
  Vote,
} from "lucide-react";
import {
  getPendingApprovals,
  approveRequest,
  rejectRequest,
  getAllUsers,
  toggleUser,
} from "../services/api";
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
// सबसे ऊपर imports में Randomization component add करें
import Randomization from "./Randomization"; // अपने path के अनुसार बदलें
import { getACs, getDesignations } from "../services/mastersService"; // master data fetch के लिए
import DutyReport from "../pages/DutyReport";
import { removeToken, disableBackButton } from "../utils/auth";
import api from "../services/api";

const pulseKeyframes = `
@keyframes pulseDot {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.3); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes slideInToast {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
`;

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("approvals");
  const [approvals, setApprovals] = useState([]);
  const [acList, setAcList] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [remark, setRemark] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({
  total: 0, pending: 0, active: 0, inactive: 0
})
const [currentPage, setCurrentPage] = useState(1)
const [pageSize] = useState(10)
const [searchQuery, setSearchQuery] = useState('')
const [userSearchQuery, setUserSearchQuery] = useState('')
const [selectedUsers, setSelectedUsers] = useState([])
const [openMenuUserId, setOpenMenuUserId] = useState(null)
const [auditLogs, setAuditLogs] = useState([])
const [loadingLogs, setLoadingLogs] = useState(false)
const [drawerTab, setDrawerTab] = useState('profile')
const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
const [sidebarOpen, setSidebarOpen] = useState(false)
const [usersLoading, setUsersLoading] = useState(false)
const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'inactive'
const [toast, setToast] = useState(null) // { message, type: 'success' | 'error' }
const [selectedApprovals, setSelectedApprovals] = useState([])
const [bulkRejectModal, setBulkRejectModal] = useState(false)
const [bulkRemark, setBulkRemark] = useState('')
const [bulkRemarkError, setBulkRemarkError] = useState('')
const [bulkProcessing, setBulkProcessing] = useState(false)


useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 768)
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])

  const navigate = useNavigate();
const [sortOrder, setSortOrder] = useState('newest')
const filteredApprovals = approvals
  .filter(a =>
    a.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.requestType.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .sort((a, b) => {
    const dateA = new Date(a.requestedAt);
    const dateB = new Date(b.requestedAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  })
const filteredUsers = users
  .filter(u =>
    u.userId.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.mobileNumber.includes(userSearchQuery) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  )
  .filter(u =>
    statusFilter === 'all' ? true :
    statusFilter === 'active' ? u.isActive :
    !u.isActive
  )
const totalPages = Math.ceil(filteredUsers.length / pageSize)
const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    disableBackButton();
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role =
          payload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];
        if (role !== "Admin") {
          navigate("/");
          return;
        }
        setAdminData({
          userId:
            payload[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ] || "Admin",
          fullName:
            payload[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ] || "Admin",
          role: role,
          email:
            payload[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
            ] || "—",
        });
      } catch (e) {
        navigate("/");
      }
    }
    fetchApprovals();
    fetchUsers();
    loadMasterData();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await getPendingApprovals();
      setApprovals(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await getAllUsers();
      const data = res.data.data;
      setUsers(data);
      setStats({
        total: data.length,
        pending: data.filter(u => !u.isApproved).length,
        active: data.filter(u => u.isActive).length,
        inactive: data.filter(u => !u.isActive).length,
      })
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadMasterData = async () => {
    try {
      const [acRes, desRes] = await Promise.all([getACs(), getDesignations()]);
      setAcList(acRes.data);
      setDesignations(desRes.data);
    } catch (err) {
      console.error("Failed to load master data for randomization", err);
    }
  };

  const handleApproveClick = (approval) => {
    setActionModal({ type: "approve", approval });
    setRemark("");
    setRemarkError("");
  };

  const handleRejectClick = (approval) => {
    setActionModal({ type: "reject", approval });
    setRemark("");
    setRemarkError("");
  };

  const handleActionConfirm = async () => {
    if (actionModal.type === "reject" && !remark.trim()) {
      setRemarkError("Rejection reason is required!");
      return;
    }
    try {
      if (actionModal.type === "approve") {
        await approveRequest(actionModal.approval.id);
        showToast("Request approved successfully!", "success");
      } else {
        await rejectRequest(actionModal.approval.id, JSON.stringify(remark));
        showToast("Request rejected!", "success");
      }
      setActionModal(null);
      setRemark("");
      fetchApprovals();
      fetchUsers();
    } catch (err) {
      showToast("Failed to process request", "error");
    }
  };

const handleToggleUser = async (userId) => {
    try {
      await toggleUser(userId);
      fetchUsers();
      showToast("User status updated!", "success");
    } catch (err) {
      showToast("Failed to update user status", "error");
    }
  };

  const fetchAuditLogs = async (userId) => {
    setLoadingLogs(true);
    try {
      const res = await api.get(`/Admin/audit-logs/${userId}`);
      setAuditLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
      setAuditLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const exportExcel = () => {
  const sourceUsers = selectedUsers.length > 0
    ? users.filter(u => selectedUsers.includes(u.userId))
    : users;
  const data = sourceUsers.map((u, i) => ({
    '#': i + 1,
    'User ID': u.userId,
    'Full Name': u.fullName,
    'Mobile': u.mobileNumber,
    'Email': u.email,
    'Role': u.role,
    'Status': u.isActive ? 'Active' : 'Inactive',
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Users')
  XLSX.writeFile(wb, selectedUsers.length > 0 ? 'Selected_Users.xlsx' : 'Users_Report.xlsx')
}

const handleSelectUser = (userId) => {
  setSelectedUsers(prev =>
    prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
  )
}

const handleSelectAll = () => {
  if (selectedUsers.length === paginatedUsers.length) {
    setSelectedUsers([])
  } else {
    setSelectedUsers(paginatedUsers.map(u => u.userId))
  }
}

const exportSelectedExcel = () => {
  const data = users
    .filter(u => selectedUsers.includes(u.userId))
    .map((u, i) => ({
      '#': i + 1,
      'User ID': u.userId,
      'Full Name': u.fullName,
      'Mobile': u.mobileNumber,
      'Email': u.email,
      'Role': u.role,
      'Status': u.isActive ? 'Active' : 'Inactive',
    }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Selected Users')
  XLSX.writeFile(wb, 'Selected_Users.xlsx')
}

const exportSelectedPDF = () => {
  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text('Election Portal - Selected Users Report', 14, 15)
  autoTable(doc, {
    head: [['#', 'User ID', 'Full Name', 'Mobile', 'Email', 'Role', 'Status']],
    body: users
      .filter(u => selectedUsers.includes(u.userId))
      .map((u, i) => [i + 1, u.userId, u.fullName, u.mobileNumber, u.email, u.role, u.isActive ? 'Active' : 'Inactive']),
    startY: 25,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 138] }
  })
  doc.save('Selected_Users.pdf')
}

const exportPDF = () => {
  const sourceUsers = selectedUsers.length > 0
    ? users.filter(u => selectedUsers.includes(u.userId))
    : users;
  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text(selectedUsers.length > 0 ? 'Election Portal - Selected Users Report' : 'Election Portal - User Report', 14, 15)
  autoTable(doc, {
    head: [['#', 'User ID', 'Full Name', 'Mobile', 'Email', 'Role', 'Status']],
    body: sourceUsers.map((u, i) => [
      i + 1, u.userId, u.fullName, u.mobileNumber, u.email, u.role,
      u.isActive ? 'Active' : 'Inactive'
    ]),
    startY: 25,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 138] }
  })
  doc.save(selectedUsers.length > 0 ? 'Selected_Users.pdf' : 'Users_Report.pdf')
}

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    removeToken();
    navigate("/");
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return past.toLocaleDateString("en-IN");
  };

  const getRequestTypeBadge = (type) => {
    const styles = {
      Register: { bg: "#dbeafe", color: "#1d4ed8", label: "Register" },
      ForgotPassword: {
        bg: "#fef3c7",
        color: "#d97706",
        label: "Forgot Password",
      },
      ActivateUser: { bg: "#d1fae5", color: "#065f46", label: "Activate User" },
    };
    return styles[type] || { bg: "#f3f4f6", color: "#374151", label: type };
  };


  const navItems = [
    {
      key: "approvals",
      label: "Pending Approvals",
      icon: <FileText size={18} />,
      count: approvals.length,
    },
    {
      key: "users",
      label: "Manage Users",
      icon: <Users size={18} />,
      count: users.length,
    },
  ];

  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
      {/* ===== SIDEBAR ===== */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }}
        />
      )}
      <aside
        style={{
          width: "260px",
          minHeight: "100vh",
          background: "linear-gradient(180deg, #0f172a 100%, #1e3a8a 100%, #0f172a 100%)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: isMobile ? (sidebarOpen ? 0 : "-260px") : 0,
          top: 0,
          bottom: 0,
          boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
          zIndex: 100,
          transition: "left 0.3s ease",
        }}
      >
        {/* Sidebar Logo */}
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
  style={{
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }}
>
  <img src="/emblem_v2_clean.png" alt="National Emblem" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
</div>
            <div>
              <p
                style={{
                  margin: 0,
                  color: "white",
                  fontWeight: 800,
                  fontSize: "14px",
                  lineHeight: 1.2,
                }}
              >
                Government of
                <br />
                Chhattisgarh
              </p>
              <p style={{ margin: 0, color: "#93c5fd", fontSize: "11px" }}>
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Admin Profile Card */}
        <div
          style={{
            margin: "16px 12px",
            padding: "14px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User size={20} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  color: "white",
                  fontWeight: 700,
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {adminData?.fullName || "Admin"}
              </p>
              <p style={{ margin: 0, color: "#93c5fd", fontSize: "11px" }}>
                {adminData?.userId || ""}
              </p>
            </div>
          </div>
          <div
            style={{
              marginTop: "10px",
              paddingTop: "10px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {[
              { label: "Email", value: adminData?.email },
              { label: "Role", value: adminData?.role },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span style={{ fontSize: "10px", color: "#64748b" }}>
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "#cbd5e1",
                    fontWeight: 600,
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "8px 12px" }}>
          <p
            style={{
              fontSize: "10px",
              color: "#475569",
              fontWeight: 700,
              letterSpacing: "1px",
              padding: "0 8px",
              marginBottom: "8px",
            }}
          >
            NAVIGATION
          </p>

          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                marginBottom: "4px",
                background:
                  activeTab === item.key
                    ? "rgba(59,130,246,0.25)"
                    : "transparent",
                color: activeTab === item.key ? "white" : "#94a3b8",
                fontWeight: activeTab === item.key ? 700 : 400,
                fontSize: "14px",
                transition: "all 0.2s",
                borderLeft:
                  activeTab === item.key
                    ? "3px solid #3b82f6"
                    : "3px solid transparent",
                textAlign: "left",
              }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count > 0 && (
                <span
                  style={{
                    background:
                      activeTab === item.key
                        ? "#3b82f6"
                        : "rgba(255,255,255,0.15)",
                    color: "white",
                    borderRadius: "20px",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}

          <div
            style={{
              margin: "16px 0 8px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: "16px",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                color: "#475569",
                fontWeight: 700,
                letterSpacing: "1px",
                padding: "0 8px",
                marginBottom: "8px",
              }}
            >
              QUICK ACTIONS
            </p>

            {/* Election Duty Button */}
            <button
              onClick={() => setActiveTab("randomization")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                marginBottom: "4px",
                background:
                  activeTab === "randomization"
                    ? "rgba(59,130,246,0.25)"
                    : "transparent",
                color: activeTab === "randomization" ? "white" : "#94a3b8",
                fontWeight: activeTab === "randomization" ? 700 : 400,
                fontSize: "14px",
                transition: "all 0.2s",
                borderLeft:
                  activeTab === "randomization"
                    ? "3px solid #f97316"
                    : "3px solid transparent",
                textAlign: "left",
              }}
            >
              <Vote size={18} />
              <span>Election Randomization</span>
            </button>

            <button
              onClick={() => setActiveTab("dutyReport")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                marginBottom: "4px",
                background:
                  activeTab === "dutyReport"
                    ? "rgba(59,130,246,0.25)"
                    : "transparent",
                color: activeTab === "dutyReport" ? "white" : "#94a3b8",
                fontWeight: activeTab === "dutyReport" ? 700 : 400,
                fontSize: "14px",
                transition: "all 0.2s",
                borderLeft:
                  activeTab === "dutyReport"
                    ? "3px solid #f97316"
                    : "3px solid transparent",
                textAlign: "left",
              }}
            >
              <LayoutDashboard size={18} />
              <span>Randomization Report</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => {
                fetchApprovals();
                fetchUsers();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                marginBottom: "4px",
                background: "transparent",
                color: "#94a3b8",
                fontWeight: 400,
                fontSize: "14px",
                transition: "all 0.2s",
                borderLeft: "3px solid transparent",
                textAlign: "left",
              }}
            >
              <RefreshCw size={18} />
              <span>Refresh Data</span>
            </button>
          </div>
         </nav>


        {/* Sidebar Bottom — Logout */}
        <div
          style={{
            padding: "16px 12px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "11px 14px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              background: "rgba(239,68,68,0.15)",
              color: "#f87171",
              fontWeight: 600,
              fontSize: "14px",
              transition: "all 0.2s",
              textAlign: "left",
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

          {/* Footer */}
          <div style={{ marginTop: "12px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "10px", color: "#334155" }}>
              © 2026 NIC, Govt. of India
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                marginTop: "4px",
              }}
            >
              <Lock size={10} color="#475569" />
              <span style={{ fontSize: "10px", color: "#475569" }}>
                256-bit SSL Encrypted
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
     <main
  style={{
    marginLeft: isMobile ? 0 : "260px",
    flex: 1,
background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #eef2ff 100%)",
    minHeight: "100vh",
  }}
>
        {/* Top Bar */}
        <div
          style={{
            background: "linear-gradient(180deg, #0f172a 0%, #1e3a8a 100%)",
            padding: isMobile ? "12px 16px" : "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            gap: "12px",
          }}
        >
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "#1e3a8a",
                border: "none",
                borderRadius: "8px",
                padding: "8px 12px",
                cursor: "pointer",
                color: "white",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              ☰
            </button>
          )}
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? "16px" : "22px",
                fontWeight: 800,
                color: "white",
              }}
            >
              {activeTab === "approvals" && "Pending Approvals"}
              {activeTab === "users" && "Manage Users"}
              {activeTab === "dutyReport" && "Randomization Report"}
              {activeTab === "randomization" && "Election Randomization"}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#93c5fd",
                marginTop: "2px",
              }}
            >
              {activeTab === "approvals" &&
                `${approvals.length} request(s) awaiting review`}
              {activeTab === "users" &&
                `${users.length} total registered users`}
              {activeTab === "dutyReport" &&
                "Current duty assignments across all booths"}
                 {activeTab === "randomization" && "Assign duties to polling personnel"}
            </p>
          </div>
        </div>

      {/* Page Content */}
<div style={{ padding: isMobile ? "16px 12px" : "28px 32px" }}>

  {(activeTab === 'approvals' || activeTab === 'users') && (
    <>
      {/* ===== STATS CARDS ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '10px' : '16px', marginBottom: '24px', width: '100%' }}>
        {[
          { label: 'Total Users', value: stats.total, icon: '👥', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8', iconBg: '#dbeafe', onClick: () => { setActiveTab('users'); setStatusFilter('all'); } },
          { label: 'Pending Requests', value: approvals.length, icon: '⏳', bg: '#fff7ed', border: '#fed7aa', color: '#ea580c', iconBg: '#ffedd5', onClick: () => setActiveTab('approvals') },
          { label: 'Active Users', value: stats.active, icon: '✅', bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a', iconBg: '#dcfce7', onClick: () => { setActiveTab('users'); setStatusFilter('active'); } },
          { label: 'Inactive Users', value: stats.inactive, icon: '❌', bg: '#fef2f2', border: '#fecaca', color: '#dc2626', iconBg: '#fee2e2', onClick: () => { setActiveTab('users'); setStatusFilter('inactive'); } },
        ].map((card, i) => (
          <div key={i} onClick={card.onClick} style={{
            background: card.bg,
            border: `1px solid ${card.border}`,
            borderRadius: '16px',
            padding: isMobile ? '12px' : '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <div style={{ width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px', borderRadius: '14px', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '16px' : '22px', flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: isMobile ? '20px' : '28px', fontWeight: 900, color: card.color, lineHeight: 1 }}>
                {card.value}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: isMobile ? '10px' : '12px', fontWeight: 600, color: '#64748b' }}>
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  )}

          {/* ===== PENDING APPROVALS ===== */}

         {activeTab === "approvals" && (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                overflowX: "auto",
              }}
            >
              <div
                style={{
                  height: "4px",
                  width: "100%",
                  background:
                    "linear-gradient(90deg, #f97316, #3b82f6, #06b6d4)",
                }}
              />

              <div
                style={{
                  padding: isMobile ? "12px 16px" : "18px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #f1f5f9",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FileText size={18} />
                  Pending Approvals
                </h2>
                {approvals.length > 0 && (
                  <span
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {approvals.length} Pending
                  </span>
                )}
              </div>

              <div style={{ padding: '14px 24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ position: 'relative' }}>
                  <input
      type="text"
      placeholder="🔍 Search by User ID, Name, Mobile, Email..."
      value={userSearchQuery}
      onChange={e => { setUserSearchQuery(e.target.value); setCurrentPage(1) }}
      style={{ padding: '8px 36px 8px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', width: isMobile ? '100%' : '300px', background: '#f8fafc', boxSizing: 'border-box' }}
    />
                  {userSearchQuery && (
                    <button onClick={() => setUserSearchQuery('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {selectedApprovals.length > 0 && (
                <div style={{ padding: isMobile ? '10px 12px' : '12px 24px', background: '#eff6ff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1d4ed8' }}>
                    {selectedApprovals.length} selected
                  </span>
                  <button
                    onClick={async () => {
                      if (!window.confirm(`Approve ${selectedApprovals.length} request(s)?`)) return;
                      setBulkProcessing(true);
                      try {
                        for (const id of selectedApprovals) {
                          await approveRequest(id);
                        }
                        showToast(`${selectedApprovals.length} request(s) approved!`, 'success');
                        setSelectedApprovals([]);
                        fetchApprovals();
                        fetchUsers();
                      } catch (err) {
                        showToast('Bulk approve failed', 'error');
                      } finally {
                        setBulkProcessing(false);
                      }
                    }}
                    disabled={bulkProcessing}
                    style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: '#16a34a', color: 'white', fontWeight: 600, fontSize: '12px', cursor: bulkProcessing ? 'not-allowed' : 'pointer' }}
                  >
                    ✅ Bulk Approve
                  </button>
                  <button
                    onClick={() => setBulkRejectModal(true)}
                    disabled={bulkProcessing}
                    style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 600, fontSize: '12px', cursor: bulkProcessing ? 'not-allowed' : 'pointer' }}
                  >
                    ❌ Bulk Reject
                  </button>
                  <button
                    onClick={() => setSelectedApprovals([])}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', background: 'white', color: '#64748b', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                  >
                    ✕ Clear
                  </button>
                </div>
              )}

              {loading ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["#", "USER ID", "REQUEST TYPE", "REQUESTED AT", "ACTIONS"].map((h) => (
                          <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#475569", letterSpacing: "0.5px", borderBottom: "1px solid #e2e8f0" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <tr key={`approval-skeleton-${idx}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          {Array.from({ length: 5 }).map((__, colIdx) => (
                            <td key={colIdx} style={{ padding: "16px 20px" }}>
                              <div style={{ height: "14px", width: colIdx === 4 ? "120px" : "80%", borderRadius: "4px", background: "#e2e8f0", animation: "pulseDot 1.2s infinite ease-in-out" }} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : approvals.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px",
                    color: "#94a3b8",
                  }}
                >
                  <CheckCircle
                    size={48}
                    style={{ margin: "0 auto 12px", color: "#16a34a" }}
                  />
                  <p
                    style={{
                      fontWeight: 600,
                      color: "#16a34a",
                      margin: "0 0 4px",
                    }}
                  >
                    No pending approvals!
                  </p>
                  <p style={{ fontSize: "13px", margin: 0 }}>
                    All requests have been processed.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "14px",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                          <input
                            type="checkbox"
                            checked={selectedApprovals.length === filteredApprovals.length && filteredApprovals.length > 0}
                            onChange={() => {
                              if (selectedApprovals.length === filteredApprovals.length) {
                                setSelectedApprovals([]);
                              } else {
                                setSelectedApprovals(filteredApprovals.map(a => a.id));
                              }
                            }}
                            style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#1e3a8a" }}
                          />
                        </th>
                        {[
                          "#",
                          "USER ID",
                          "REQUEST TYPE",
                          "REQUESTED AT",
                          "ACTIONS",
                        ].map((h) => (
                          <th
                            key={h}
                            onClick={h === "REQUESTED AT" ? () => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest') : undefined}
                            style={{
                              padding: "12px 20px",
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#475569",
                              letterSpacing: "0.5px",
                              borderBottom: "1px solid #e2e8f0",
                              cursor: h === "REQUESTED AT" ? "pointer" : "default",
                              userSelect: "none",
                            }}
                          >
                            {h}
                            {h === "REQUESTED AT" && (
                              <span style={{ marginLeft: "4px" }}>
                                {sortOrder === 'newest' ? '↓' : '↑'}
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApprovals.map((item, i) => {
                        const badge = getRequestTypeBadge(item.requestType);
                        return (
<tr
  key={item.id}
  style={{ borderBottom: "1px solid #f1f5f9" }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = "#f8fafc")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background = "white")
  }
    >
                            <td style={{ padding: "16px 20px" }}>
                              <input
                                type="checkbox"
                                checked={selectedApprovals.includes(item.id)}
                                onChange={() => {
                                  setSelectedApprovals(prev =>
                                    prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                                  );
                                }}
                                style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#1e3a8a" }}
                              />
                            </td>
                            <td
                              style={{
                                padding: "16px 20px",
                                color: "#94a3b8",
                                fontWeight: 600,
                              }}
                            >
                              {i + 1}
                            </td>
                            <td style={{ padding: "16px 20px" }}>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "#1e3a8a",
                                  fontSize: "15px",
                                }}
                              >
                                {item.userId}
                              </span>
                            </td>
                            <td style={{ padding: "16px 20px" }}>
                              <span
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  background: badge.bg,
                                  color: badge.color,
                                }}
                              >
                                {badge.label}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "16px 20px",
                                color: "#64748b",
                                fontSize: "13px",
                              }}
                            >
                              <div>{new Date(item.requestedAt).toLocaleString("en-IN")}</div>
                              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                                {getRelativeTime(item.requestedAt)}
                              </div>
                            </td>
                            <td style={{ padding: "16px 20px" }}>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  onClick={() => setSelectedApproval(item)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    padding: "7px 14px",
                                    borderRadius: "8px",
                                    border: "1px solid #bfdbfe",
                                    background: "#eff6ff",
                                    color: "#1d4ed8",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                  }}
                                >
                                  <Eye size={13} /> Preview
                                </button>
                                <button
                                  onClick={() => handleApproveClick(item)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    padding: "7px 14px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: "#16a34a",
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                  }}
                                >
                                  <CheckCircle size={13} /> Approve
                                </button>
                                <button
                                  onClick={() => handleRejectClick(item)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    padding: "7px 14px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: "#dc2626",
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                  }}
                                >
                                  <XCircle size={13} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredApprovals.length > 0 && (
                <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Showing <strong>1</strong> – <strong>{filteredApprovals.length}</strong> of <strong>{filteredApprovals.length}</strong> Request(s)
                  </p>
                </div>
              )}

            </div>
          )}

          {/* ===== MANAGE USERS ===== */}
          {activeTab === "users" && (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                overflowX: "auto",
              }}
            >
              <div
                style={{
                  height: "4px",
                  width: "100%",
                  background:
                    "linear-gradient(90deg, #f97316, #3b82f6, #06b6d4)",
                }}
              />

             <div style={{ padding: isMobile ? '12px 16px' : '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
  <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
    <Users size={18} />
    All Users ({users.length})
  </h2>
  <div style={{ position: 'relative' }}>
  <input
    type="text"
    placeholder="🔍 Search by User ID, Name, Mobile, Email..."
    value={userSearchQuery}
    onChange={e => { setUserSearchQuery(e.target.value); setCurrentPage(1) }}
    style={{ padding: '8px 36px 8px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', width: '300px', background: '#f8fafc' }}
  />
  {userSearchQuery && (
    <button onClick={() => setUserSearchQuery('')}
      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>
      ✕
    </button>
  )}
</div>

{selectedUsers.length > 0 && (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1d4ed8' }}>
      {selectedUsers.length} Selected
    </span>
    <button onClick={() => setSelectedUsers([])}
      style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', background: 'white', color: '#64748b', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
      ✕ Clear
    </button>
  </div>
)}

  <div style={{ display: 'flex', gap: '8px' }}>
    <button onClick={exportExcel} title="Download as Excel file"
      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: isMobile ? '6px 10px' : '8px 16px', borderRadius: '10px', border: 'none', background: '#16a34a', color: 'white', fontWeight: 600, fontSize: isMobile ? '11px' : '13px', cursor: 'pointer' }}>
      📊 {isMobile ? 'Excel' : 'Export Excel'}
    </button>
    <button onClick={exportPDF} title="Download as PDF file"
      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: isMobile ? '6px 10px' : '8px 16px', borderRadius: '10px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 600, fontSize: isMobile ? '11px' : '13px', cursor: 'pointer' }}>
      📄 {isMobile ? 'PDF' : 'Export PDF'}
    </button>
  </div>
</div>

          {isMobile && (
                <div style={{ padding: "12px" }}>
                  {usersLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <div key={`mskel-${idx}`} style={{ background: "#fafbfc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px", marginBottom: "10px" }}>
                        <div style={{ height: "14px", width: "60%", borderRadius: "4px", background: "#e2e8f0", marginBottom: "8px", animation: "pulseDot 1.2s infinite ease-in-out" }} />
                        <div style={{ height: "12px", width: "40%", borderRadius: "4px", background: "#e2e8f0", animation: "pulseDot 1.2s infinite ease-in-out" }} />
                      </div>
                    ))
                  ) : paginatedUsers.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "50px 20px" }}>
                      <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔍</div>
                      <p style={{ margin: 0, fontWeight: 700, color: "#374151", fontSize: "14px" }}>No users found</p>
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    paginatedUsers.map((user, i) => (
                    <div
                      key={user.id}
                      style={{
                        background: i % 2 === 0 ? "#ffffff" : "#fafbfc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "14px",
                        marginBottom: "10px",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: "#1e3a8a", fontSize: "14px" }}>{user.fullName}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>{user.userId}</p>
                        </div>
                        <button
                          onClick={() => setOpenMenuUserId(openMenuUserId === user.userId ? null : user.userId)}
                          style={{
                            width: "30px", height: "30px", borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: openMenuUserId === user.userId ? "#eff6ff" : "white",
                            cursor: "pointer", fontSize: "16px", fontWeight: 700,
                          }}
                        >
                          ⋮
                        </button>
                      </div>

                      <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "12px", color: "#64748b" }}>
                        <span>📱 {user.mobileNumber}</span>
                        <span>✉️ {user.email}</span>
                      </div>

                      <div style={{ marginTop: "10px", display: "flex", gap: "6px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: user.role === "Admin" ? "#dbeafe" : "#d1fae5", color: user.role === "Admin" ? "#1d4ed8" : "#065f46" }}>
                          {user.role}
                        </span>
                        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: user.isActive ? "#d1fae5" : "#fee2e2", color: user.isActive ? "#065f46" : "#dc2626" }}>
                          {user.isActive ? "● Active" : "● Inactive"}
                        </span>
                      </div>

                      {openMenuUserId === user.userId && (
                        <div style={{ marginTop: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "10px", display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => { setSelectedUser(user); setOpenMenuUserId(null); fetchAuditLogs(user.userId); }}
                            style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", fontWeight: 600, fontSize: "12px" }}
                          >
                            View
                          </button>
                          {user.role !== "Admin" && (
                            <button
                              onClick={() => { handleToggleUser(user.userId); setOpenMenuUserId(null); }}
                              style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", background: user.isActive ? "#dc2626" : "#16a34a", color: "white", fontWeight: 600, fontSize: "12px" }}
                            >
                              {user.isActive ? "Deactivate" : "Activate"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    ))
                  )}
                </div>
              )}

              {!isMobile && (
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table
                  style={{
                    width: isMobile ? "650px" : "100%",
                    minWidth: isMobile ? "650px" : "auto",
                    borderCollapse: "collapse",
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 0 #e2e8f0" }}>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                        <input type="checkbox"
                          checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                          onChange={handleSelectAll}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1e3a8a' }}
                        />
                      </th>
                     {[
  "#",
  "USER ID",
  "FULL NAME",
  "MOBILE",
  "EMAIL",
  "ROLE",
  "STATUS",
  "ACTIONS",
].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "12px 16px",
                            textAlign: "left",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#475569",
                            letterSpacing: "0.5px",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={`skeleton-${idx}`}>
                          {Array.from({ length: 9 }).map((__, colIdx) => (
                            <td key={colIdx} style={{ padding: "14px 16px" }}>
                              <div style={{ height: "14px", borderRadius: "4px", background: "#e2e8f0", animation: "pulseDot 1.2s infinite ease-in-out" }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ padding: "60px 20px", textAlign: "center" }}>
                          <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔍</div>
                          <p style={{ margin: 0, fontWeight: 700, color: "#374151", fontSize: "14px" }}>No users found</p>
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>Try adjusting your search or filters</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user, i) => (
                      <tr
  key={user.id}
  style={{
    borderBottom: "1px solid #f1f5f9",
    background: i % 2 === 0 ? "#ffffff" : "#fafbfc",
    transition: "background 0.15s ease",
  }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = "#eff6ff")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background = i % 2 === 0 ? "#ffffff" : "#fafbfc")
  }
>

                    <td style={{ padding: '14px 16px' }}>
  <input type="checkbox"
    checked={selectedUsers.includes(user.userId)}
    onChange={() => handleSelectUser(user.userId)}
    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1e3a8a' }}
  />
</td>

                        <td style={{ padding: "14px 16px", color: "#94a3b8" }}>
                          {i + 1}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontWeight: 700,
                            color: "#1e3a8a",
                          }}
                        >
                          {user.userId}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            color: "#374151",
                            fontWeight: 600,
                          }}
                        >
                          {user.fullName}
                        </td>
                        <td style={{ padding: "14px 16px", color: "#64748b" }}>
                          {user.mobileNumber}
                        </td>
                        <td style={{ padding: "14px 16px", color: "#64748b" }}>
                          {user.email}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 600,
                              background:
                                user.role === "Admin" ? "#dbeafe" : "#d1fae5",
                              color:
                                user.role === "Admin" ? "#1d4ed8" : "#065f46",
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: user.isActive ? "#d1fae5" : "#fee2e2",
                              color: user.isActive ? "#065f46" : "#dc2626",
                              boxShadow: user.isActive
                                ? "0 1px 3px rgba(22,163,74,0.25)"
                                : "0 1px 3px rgba(220,38,38,0.15)",
                            }}
                          >
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: user.isActive ? "#16a34a" : "#dc2626",
                                animation: user.isActive ? "pulseDot 1.5s infinite" : "none",
                              }}
                            />
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", position: "relative" }}>
                          <button
                            onClick={() => setOpenMenuUserId(openMenuUserId === user.userId ? null : user.userId)}
                            title="More actions"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              background: openMenuUserId === user.userId ? "#eff6ff" : "white",
                              color: "#475569",
                              cursor: "pointer",
                              fontSize: "16px",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ⋮
                          </button>

                          {openMenuUserId === user.userId && (
                            <>
                              <div
                                onClick={() => setOpenMenuUserId(null)}
                                style={{ position: "fixed", inset: 0, zIndex: 40 }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  right: "16px",
                                  top: "38px",
                                  background: "white",
                                  borderRadius: "10px",
                                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                                  border: "1px solid #e2e8f0",
                                  zIndex: 50,
                                  minWidth: "160px",
                                  overflow: "hidden",
                                }}
                              >
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setOpenMenuUserId(null);
                                    fetchAuditLogs(user.userId);
                                  }}
                                  style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "10px 14px",
                                    border: "none",
                                    background: "white",
                                    color: "#1d4ed8",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    textAlign: "left",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                                >
                                  <Eye size={14} /> View
                                </button>

                                {user.role !== "Admin" && (
                                  <button
                                    onClick={() => {
                                      handleToggleUser(user.userId);
                                      setOpenMenuUserId(null);
                                    }}
                                    style={{
                                      width: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      padding: "10px 14px",
                                      border: "none",
                                      borderTop: "1px solid #f1f5f9",
                                      background: "white",
                                      color: user.isActive ? "#dc2626" : "#16a34a",
                                      cursor: "pointer",
                                      fontSize: "13px",
                                      fontWeight: 600,
                                      textAlign: "left",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = user.isActive ? "#fef2f2" : "#f0fdf4")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                                  >
                                    {user.isActive ? "🔴 Deactivate" : "🟢 Activate"}
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
               </table>
              </div>
              )}
            </div>
          )}

          {/* Pagination */}
{activeTab === "users" && (
<div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
    Showing <strong>{((currentPage - 1) * pageSize) + 1}</strong> – <strong>{Math.min(currentPage * pageSize, users.length)}</strong> of <strong>{users.length}</strong> Users
  </p>
  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
    <button
      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      disabled={currentPage === 1}
      style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#94a3b8' : '#1e3a8a', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px' }}>
      ← Prev
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map((p, idx, arr) => (
      <React.Fragment key={p}>
        {idx > 0 && arr[idx - 1] !== p - 1 && <span key={`dots-${p}`} style={{ color: '#94a3b8', fontSize: '13px' }}>...</span>}
        <button key={p} onClick={() => setCurrentPage(p)}
          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === p ? '#1e3a8a' : 'white', color: currentPage === p ? 'white' : '#374151', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
          {p}
    </button>
      </React.Fragment>
    ))}
    <button
      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      disabled={currentPage === totalPages}
      style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', color: currentPage === totalPages ? '#94a3b8' : '#1e3a8a', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px' }}>
      Next →
    </button>
  </div>
</div>
)}

          {activeTab === "randomization" && (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: isMobile ? "12px" : "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                border: "1px solid #e2e8f0",
                overflowX: "auto",
              }}
            >
              <Randomization acList={acList} designations={designations} />
            </div>
          )}

          {/* ===== DUTY REPORT ===== */}
          {activeTab === "dutyReport" && (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: isMobile ? "12px" : "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                border: "1px solid #e2e8f0",
                overflowX: "auto",
              }}
            >
              <DutyReport />
            </div>
          )}
        </div>
      </main>

      {/* ===== APPROVAL PREVIEW MODAL ===== */}
      {selectedApproval && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: isMobile ? "16px 16px 0 0" : "20px",
              width: isMobile ? "100%" : "460px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              border: "2px solid #1e3a8a",
            }}
          >
            <div style={{ height: "4px", background: "linear-gradient(90deg, #f97316, #3b82f6, #06b6d4)" }} />

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: "#1e3a8a", display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={16} /> Registration Request
              </h3>
              <button
                onClick={() => setSelectedApproval(null)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* Avatar / Identity block */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", background: "#eff6ff", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                <User size={26} color="white" />
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: "#1e3a8a" }}>
                {selectedApproval.fullName || "—"}
              </p>
              <span style={{ marginTop: "6px", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", background: getRequestTypeBadge(selectedApproval.requestType).bg, color: getRequestTypeBadge(selectedApproval.requestType).color, fontWeight: 600 }}>
                {getRequestTypeBadge(selectedApproval.requestType).label}
              </span>
            </div>

            {/* Account Info Section */}
            <div style={{ padding: "16px 24px" }}>
              <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Account Information
              </p>
              {[
                { label: "User ID", value: selectedApproval.userId },
                { label: "Full Name", value: selectedApproval.fullName || "—" },
                { label: "Mobile Number", value: selectedApproval.mobileNumber || "—" },
                { label: "Email", value: selectedApproval.email || "—" },
                { label: "Requested Role", value: selectedApproval.role || "—" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{item.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Request Info Section */}
            <div style={{ padding: "4px 24px 16px" }}>
              <p style={{ margin: "8px 0 8px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Request Details
              </p>
              {[
                { label: "Status", value: selectedApproval.status },
                { label: "Requested At", value: `${new Date(selectedApproval.requestedAt).toLocaleString("en-IN")} (${getRelativeTime(selectedApproval.requestedAt)})` },
                { label: "Remarks", value: selectedApproval.remarks || "No remarks" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f1f5f9", gap: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", flexShrink: 0 }}>{item.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151", textAlign: "right" }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: "16px 24px", display: "flex", gap: "10px", borderTop: "1px solid #f1f5f9" }}>
              <button
                onClick={() => { setSelectedApproval(null); handleApproveClick(selectedApproval); }}
                style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: "#16a34a", color: "white", fontWeight: 700, cursor: "pointer" }}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => { setSelectedApproval(null); handleRejectClick(selectedApproval); }}
                style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: "#dc2626", color: "white", fontWeight: 700, cursor: "pointer" }}
              >
                ❌ Reject
              </button>
            </div>
          </div>
        </div>
      )}

{/* ===== USER DETAIL DRAWER ===== */}
      {selectedUser && (
        <>
          <div
            onClick={() => { setSelectedUser(null); setDrawerTab('profile'); }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000 }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: isMobile ? "100vw" : "420px",
              maxWidth: isMobile ? "100vw" : "90vw",
              background: "white",
              boxShadow: "-8px 0 30px rgba(0,0,0,0.2)",
              zIndex: 1001,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ height: "4px", background: "linear-gradient(90deg, #f97316, #3b82f6, #06b6d4)" }} />

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px", background: "#eff6ff", borderBottom: "1px solid #e2e8f0", position: "relative" }}>
              <button
                onClick={() => { setSelectedUser(null); setDrawerTab('profile'); }}
                style={{ position: "absolute", top: "16px", right: "16px", background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}
              >
                <X size={18} color="#64748b" />
              </button>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                <User size={28} color="white" />
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: "#1e3a8a" }}>{selectedUser.fullName}</p>
              <span style={{ marginTop: "6px", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", background: "#dbeafe", color: "#1d4ed8", fontWeight: 600 }}>
                {selectedUser.role}
              </span>
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
              <button
                onClick={() => setDrawerTab('profile')}
                style={{ flex: 1, padding: "12px", border: "none", background: "white", cursor: "pointer", fontWeight: 700, fontSize: "13px", color: drawerTab === 'profile' ? "#1e3a8a" : "#94a3b8", borderBottom: drawerTab === 'profile' ? "2px solid #1e3a8a" : "2px solid transparent" }}
              >
                Profile
              </button>
              <button
                onClick={() => setDrawerTab('audit')}
                style={{ flex: 1, padding: "12px", border: "none", background: "white", cursor: "pointer", fontWeight: 700, fontSize: "13px", color: drawerTab === 'audit' ? "#1e3a8a" : "#94a3b8", borderBottom: drawerTab === 'audit' ? "2px solid #1e3a8a" : "2px solid transparent" }}
              >
                Audit Logs
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {drawerTab === 'profile' && (
                <>
                  {[
                    { label: "User ID", value: selectedUser.userId },
                    { label: "Full Name", value: selectedUser.fullName },
                    { label: "Mobile", value: selectedUser.mobileNumber },
                    { label: "Email", value: selectedUser.email },
                    { label: "Status", value: selectedUser.isActive ? "Active ✅" : "Inactive ❌" },
                    { label: "Approved", value: selectedUser.isApproved ? "Yes ✅" : "No ❌" },
                    { label: "Password Expired", value: selectedUser.isPasswordExpired ? "Yes ⚠️" : "No ✅" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{item.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{item.value}</span>
                    </div>
                  ))}
                </>
              )}

              {drawerTab === 'audit' && (
                <>
                  {loadingLogs ? (
                    <p style={{ textAlign: "center", color: "#94a3b8", padding: "30px 0" }}>Loading logs...</p>
                  ) : auditLogs.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#94a3b8", padding: "30px 0" }}>No audit logs found.</p>
                  ) : (
                    <div style={{ position: "relative", paddingLeft: "16px" }}>
                      {auditLogs.map((log, i) => (
                        <div key={log.logId || i} style={{ position: "relative", paddingBottom: "20px", borderLeft: i === auditLogs.length - 1 ? "none" : "2px solid #e2e8f0", marginLeft: "4px", paddingLeft: "20px" }}>
                          <div style={{ position: "absolute", left: "-7px", top: "2px", width: "12px", height: "12px", borderRadius: "50%", background: log.actionType === "Activated" ? "#16a34a" : "#dc2626" }} />
                          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#1e3a8a" }}>{log.actionType}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>by {log.performedBy}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{new Date(log.performedAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ padding: "16px 24px", display: "flex", gap: "10px", borderTop: "1px solid #e2e8f0" }}>
              {selectedUser.role !== "Admin" && (
                <button
                  onClick={() => {
                    handleToggleUser(selectedUser.userId);
                    setSelectedUser(null);
                    setDrawerTab('profile');
                  }}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: selectedUser.isActive ? "#dc2626" : "#16a34a", color: "white", fontWeight: 700, cursor: "pointer" }}
                >
                  {selectedUser.isActive ? "Deactivate User" : "Activate User"}
                </button>
              )}
              <button
                onClick={() => { setSelectedUser(null); setDrawerTab('profile'); }}
                style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "2px solid #1e3a8a", background: "white", color: "#1e3a8a", fontWeight: 700, cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* ===== ACTION MODAL ===== */}
      {actionModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: isMobile ? "16px 16px 0 0" : "20px",
              width: isMobile ? "100%" : "420px",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              border: `2px solid ${actionModal.type === "approve" ? "#16a34a" : "#dc2626"}`,
            }}
          >
            <div
              style={{
                height: "4px",
                background:
                  actionModal.type === "approve" ? "#16a34a" : "#dc2626",
              }}
            />
            <div style={{ padding: "28px 24px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    borderRadius: "50%",
                    padding: "14px",
                    marginBottom: "12px",
                    background:
                      actionModal.type === "approve" ? "#d1fae5" : "#fee2e2",
                  }}
                >
                  {actionModal.type === "approve" ? (
                    <CheckCircle size={32} color="#16a34a" />
                  ) : (
                    <XCircle size={32} color="#dc2626" />
                  )}
                </div>
                <h3
                  style={{
                    margin: "0 0 6px",
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  {actionModal.type === "approve"
                    ? "Approve Request"
                    : "Reject Request"}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  User ID:{" "}
                  <strong style={{ color: "#1e3a8a" }}>
                    {actionModal.approval.userId}
                  </strong>
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "12px",
                    color: "#94a3b8",
                  }}
                >
                  Type: {actionModal.approval.requestType}
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {actionModal.type === "approve"
                    ? "Remark (Optional)"
                    : "Rejection Reason *"}
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => {
                    setRemark(e.target.value);
                    setRemarkError("");
                  }}
                  placeholder={
                    actionModal.type === "approve"
                      ? "Add a remark (optional)..."
                      : "Enter reason for rejection..."
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    background: "#f8fafc",
                    border: `1.5px solid ${remarkError ? "#ef4444" : "#e2e8f0"}`,
                  }}
                />
                {remarkError && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      margin: "4px 0 0",
                    }}
                  >
                    ⚠️ {remarkError}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setActionModal(null)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    background: "white",
                    color: "#64748b",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleActionConfirm}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: "10px",
                    border: "none",
                    background:
                      actionModal.type === "approve" ? "#16a34a" : "#dc2626",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  {actionModal.type === "approve"
                    ? "✅ Confirm Approve"
                    : "❌ Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== BULK REJECT MODAL ===== */}
      {bulkRejectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: isMobile ? "16px 16px 0 0" : "20px",
              width: isMobile ? "100%" : "400px",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              border: "2px solid #dc2626",
            }}
          >
            <div style={{ height: "4px", background: "#dc2626" }} />
            <div style={{ padding: "28px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "20px" }}>
                <div style={{ borderRadius: "50%", padding: "14px", marginBottom: "12px", background: "#fee2e2" }}>
                  <XCircle size={32} color="#dc2626" />
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                  Bulk Reject Requests
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  Rejecting <strong style={{ color: "#dc2626" }}>{selectedApprovals.length}</strong> request(s)
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Rejection Reason *
                </label>
                <textarea
                  value={bulkRemark}
                  onChange={(e) => { setBulkRemark(e.target.value); setBulkRemarkError(""); }}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    background: "#f8fafc",
                    border: `1.5px solid ${bulkRemarkError ? "#ef4444" : "#e2e8f0"}`,
                  }}
                />
                {bulkRemarkError && (
                  <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0" }}>⚠️ {bulkRemarkError}</p>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => { setBulkRejectModal(false); setBulkRemark(""); setBulkRemarkError(""); }}
                  disabled={bulkProcessing}
                  style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!bulkRemark.trim()) {
                      setBulkRemarkError("Rejection reason is required!");
                      return;
                    }
                    setBulkProcessing(true);
                    try {
                      for (const id of selectedApprovals) {
                        await rejectRequest(id, JSON.stringify(bulkRemark));
                      }
                      showToast(`${selectedApprovals.length} request(s) rejected!`, 'success');
                      setSelectedApprovals([]);
                      setBulkRejectModal(false);
                      setBulkRemark("");
                      fetchApprovals();
                      fetchUsers();
                    } catch (err) {
                      showToast('Bulk reject failed', 'error');
                    } finally {
                      setBulkProcessing(false);
                    }
                  }}
                  disabled={bulkProcessing}
                  style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", background: "#dc2626", color: "white", fontWeight: 700, cursor: bulkProcessing ? "not-allowed" : "pointer", fontSize: "14px" }}
                >
                  {bulkProcessing ? "Processing..." : "❌ Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    
    {/* ===== TOAST NOTIFICATION ===== */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 2000,
            background: toast.type === "success" ? "#16a34a" : "#dc2626",
            color: "white",
            padding: "14px 20px",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "slideInToast 0.3s ease",
          }}
        >
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}


      {/* ===== LOGOUT MODAL ===== */}
      {showLogoutModal && (
        <div
         style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
         <div
            style={{
              background: "white",
              borderRadius: isMobile ? "16px 16px 0 0" : "20px",
              width: isMobile ? "100%" : "380px",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              border: "2px solid #1e3a8a",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <LogOut size={28} color="#dc2626" />
            </div>
            <h3
              style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 800 }}
            >
              Confirm Logout
            </h3>
            <p
              style={{ margin: "0 0 24px", color: "#64748b", fontSize: "14px" }}
            >
              Are you sure you want to logout?
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "2px solid #1e3a8a",
                  background: "white",
                  color: "#1e3a8a",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#dc2626",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default AdminPanel;
