import { useEffect, useState, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ActivateUserPage from "./pages/ActivateUserPage";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import AdminPanel from "./pages/AdminPanel";
import UserDashboard from "./pages/UserDashboard";

// Your existing components
import Home_dev1 from "./pages/Home_dev1";
import Randomization_dev1 from "./pages/Randomization";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeTempGrid from "./components/EmployeeTempGrid";
import EmployeeDBGrid from "./components/EmployeeDBGrid";

// Master data services
import {
  getDistricts,
  getDepartments,
  getOffices,
  getDesignations,
  getEmpTypes,
  getACs,
  getBanks,
  getPWDTypes,
} from "./services/mastersService";

import api from "./services/api";

function AppContent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });
  const [isLoading, setIsLoading] = useState(true);

  // Master data states
  const [lang, setLang] = useState("en");
  const [districts, setDistricts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [empTypes, setEmpTypes] = useState([]);
  const [acList, setAcList] = useState([]);
  const [banks, setBanks] = useState([]);
  const [pwdTypes, setPwdTypes] = useState([]);
  const [offices, setOffices] = useState([]);

  // Form & grid states
  const [showForm, setShowForm] = useState(false);
  const [dbEmployees, setDbEmployees] = useState([]);
  const [editEmployee, setEditEmployee] = useState(null);
  const [tempEmployees, setTempEmployees] = useState(() => {
    const saved = localStorage.getItem("tempEmployees");
    return saved ? JSON.parse(saved) : [];
  });
  const formRef = useRef(null);

  // 🔥 Page refresh par token clear karo (auto logout)
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // 🔥 Listen for storage events (login in same tab via dispatch)
  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // 🔥 Also listen to focus events (extra safety)
  useEffect(() => {
    const handleFocus = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const loadMasterData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const [d1, d2, d3, d4, d5, d6, d7, d8] = await Promise.all([
        getDistricts().catch(() => ({ data: [] })),
        getDepartments().catch(() => ({ data: [] })),
        getDesignations().catch(() => ({ data: [] })),
        getEmpTypes().catch(() => ({ data: [] })),
        getACs().catch(() => ({ data: [] })),
        getBanks().catch(() => ({ data: [] })),
        getPWDTypes().catch(() => ({ data: [] })),
        getOffices().catch(() => ({ data: [] })),
      ]);
      setDistricts(d1.data);
      setDepartments(d2.data);
      setDesignations(d3.data);
      setEmpTypes(d4.data);
      setAcList(d5.data);
      setBanks(d6.data);
      setPwdTypes(d7.data);
      setOffices(d8.data);
    } catch (err) {
      console.error("Master data load error", err);
    }
  };

  const loadEmployees = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get("/pollingpersonnel");
      setDbEmployees(res.data);
    } catch (err) {
      console.error("Employee load error", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setIsAuthenticated(false);
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      Promise.all([loadMasterData(), loadEmployees()]).finally(() =>
        setIsLoading(false),
      );
    } else {
      // Clear data when logged out
      setDistricts([]);
      setDepartments([]);
      setDesignations([]);
      setEmpTypes([]);
      setAcList([]);
      setBanks([]);
      setPwdTypes([]);
      setOffices([]);
      setDbEmployees([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Save temp employees
  useEffect(() => {
    localStorage.setItem("tempEmployees", JSON.stringify(tempEmployees));
  }, [tempEmployees]);

  const addEmployee = (emp) => {
    setTempEmployees((prev) => [...prev, { ...emp, _selected: true }]);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  const updateEmployee = (updatedEmp) => {
    setTempEmployees((prev) =>
      prev.map((emp) =>
        emp === editEmployee ? { ...updatedEmp, _selected: true } : emp,
      ),
    );
    setEditEmployee(null);
    setShowForm(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home_dev1 lang={lang} setLang={setLang} />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/activate-user" element={<ActivateUserPage />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/employee-entry"
        element={
          <ProtectedRoute>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 15px",
                }}
              >
                <button
                  onClick={() => navigate("/home")}
                  style={{
                    margin: "15px",
                    padding: "10px 20px",
                    background: "linear-gradient(135deg, #0b5394, #3c78d8)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  ⬅ {lang === "en" ? "Back to Home" : "होम पर वापस जाएं"}
                </button>
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
              </div>

              <div
                style={{ width: "100%", textAlign: "center", margin: "30px 0" }}
              >
                <EmployeeDBGrid
                  data={dbEmployees}
                  setData={setDbEmployees}
                  lang={lang}
                  districts={districts}
                  departments={departments}
                  offices={offices}
                  designations={designations}
                  empTypes={empTypes}
                  acList={acList}
                  banks={banks}
                />
                <button
                  className="btn-add-form"
                  onClick={() => {
                    setShowForm(true);
                    setTimeout(() => {
                      formRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 100);
                  }}
                  style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg, #0b5394, #3c78d8)",
                    color: "#fff",
                    padding: "12px 28px",
                    fontSize: "15px",
                    fontWeight: "600",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    letterSpacing: "0.5px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  }}
                >
                  ➕{" "}
                  {lang === "en"
                    ? "Add New Employee Form"
                    : "नया कर्मचारी फॉर्म जोड़ें"}
                </button>
              </div>

              <div ref={formRef}>
                {showForm && (
                  <>
                    <EmployeeForm
                      lang={lang}
                      onAdd={addEmployee}
                      onUpdate={updateEmployee}
                      pwdTypes={pwdTypes}
                      editEmployee={editEmployee}
                    />
                    <EmployeeTempGrid
                      lang={lang}
                      data={tempEmployees}
                      setData={setTempEmployees}
                      districts={districts}
                      departments={departments}
                      designations={designations}
                      empTypes={empTypes}
                      offices={offices}
                      acList={acList}
                      banks={banks}
                      onCloseForm={() => setShowForm(false)}
                      onEdit={(emp) => {
                        setEditEmployee(emp);
                        setShowForm(true);
                        setTimeout(() => {
                          formRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }, 100);
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/randomization"
        element={
          <ProtectedRoute adminOnly={true}>
            <Randomization_dev1 acList={acList} designations={designations} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Home_dev1 lang={lang} setLang={setLang} />
          </ProtectedRoute>
        } 
      />
<Route
  path="/home"
  element={
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/application-status"
  element={
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  }
/>

      <Route path="/" element={<Home_dev1 lang={lang} setLang={setLang} />} />
      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
