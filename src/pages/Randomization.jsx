import { useNavigate } from 'react-router-dom'; 
import { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import "./Rando.css";

function Randomization({ acList }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let userRole = "";
  let userDistrict = "";
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] 
                 || payload['role'] 
                 || payload['Role'] 
                 || "";
      userDistrict = payload['District_ID'] || "";
    } catch (e) {
      console.error("Failed to parse token", e);
    }
  }

  const [acNo, setAcNo] = useState("");
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [pollingExp, setPollingExp] = useState(false);
  const [countingExp, setCountingExp] = useState(false);
  const [female, setFemale] = useState(false);
  const [pwd, setPwd] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCard, setShowCard] = useState(false);

  // Stats state
  const [totalRequirement, setTotalRequirement] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);     // from filtered summary
  const [totalAssigned, setTotalAssigned] = useState(0);
  const [boothsCount, setBoothsCount] = useState(0);
  const [totalEmployeesCount, setTotalEmployeesCount] = useState(0); // new: all employees for this AC

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  // Sum of counts from the summary data (filtered)
  const computeTotals = (dataArray) => {
    const available = dataArray.reduce((sum, item) => sum + item.count, 0);
    setTotalAvailable(available);
  };

  // Fetch booth count for selected AC
  const fetchBoothsCount = async () => {
    if (!acNo) return;
    try {
      const res = await fetch(`http://localhost:5103/api/randomization/booths?acNo=${acNo}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const count = await res.json();
      setBoothsCount(count);
      setTotalRequirement(count * 4);
    } catch (error) {
      console.error("Failed to fetch booths count", error);
    }
  };

  // Fetch total employees count (all, no filter) for this AC
  const fetchTotalEmployeesCount = async () => {
    if (!acNo) return;
    try {
      const res = await fetch(`http://localhost:5103/api/randomization/total-employees?acNo=${acNo}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const count = await res.json();
      setTotalEmployeesCount(count);
    } catch (error) {
      console.error("Failed to fetch total employees count", error);
    }
  };

  // Fetch how many employees are already assigned to this AC (unique emp codes)
  const fetchAssignedCount = async () => {
    if (!acNo) return;
    try {
      const res = await fetch(`http://localhost:5103/api/randomization/assigned-count?acNo=${acNo}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const count = await res.json();
      setTotalAssigned(count);
    } catch (error) {
      console.error("Failed to fetch assigned count", error);
    }
  };

  // Main function: load summary, booths count, assigned count, total employees, then show card
  const handleShowAvailability = async () => {
    if (!acNo) {
      setErrorMsg("⚠ Please select AC");
      return;
    }
    setErrorMsg("");
    try {
      const url = `http://localhost:5103/api/randomization/summary?acNo=${acNo}&pollingExp=${pollingExp}&countingExp=${countingExp}&female=${female}&pwd=${pwd}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setData(result);
      computeTotals(result);
      setPage(1);
      await Promise.all([
        fetchBoothsCount(),
        fetchAssignedCount(),
        fetchTotalEmployeesCount()
      ]);
      setShowCard(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // When AC changes, reset everything and fetch fresh data (without showing card)
  useEffect(() => {
    if (acNo) {
      fetchBoothsCount();
      fetchAssignedCount();
      fetchTotalEmployeesCount();
    } else {
      setBoothsCount(0);
      setTotalRequirement(0);
      setTotalAssigned(0);
      setTotalAvailable(0);
      setTotalEmployeesCount(0);
      setData([]);
      setShowCard(false);
    }
  }, [acNo]);

  const handleSelectAll = () => {
    if (!selectAll) {
      const allIds = data.map((_, index) => index);
      setSelected(allIds);
    } else {
      setSelected([]);
    }
    setSelectAll(!selectAll);
  };

  const handleSelect = (index) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
    } else {
      setSelected([...selected, index]);
    }
  };

  const getSelectedDesignations = () => {
    return selected.map((index) => data[index].designation);
  };

  const handleAssignDuty = async () => {
    const selectedDesignations = getSelectedDesignations();
    if (selectedDesignations.length === 0) {
      alert("Please select at least one designation");
      return;
    }
    try {
      const res = await fetch("http://localhost:5103/api/randomization/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          acNo: acNo,
          designations: selectedDesignations,
        }),
      });
      const result = await res.text();
      alert(result);
      if (res.ok) {
        // Refresh all counts and data
        await Promise.all([
          fetchAssignedCount(),
          fetchTotalEmployeesCount(),
          fetchBoothsCount(),
          (async () => {
            const url = `http://localhost:5103/api/randomization/summary?acNo=${acNo}&pollingExp=${pollingExp}&countingExp=${countingExp}&female=${female}&pwd=${pwd}`;
            const res2 = await fetch(url, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const newData = await res2.json();
            setData(newData);
            computeTotals(newData);
          })()
        ]);
        // Card will update automatically because state changed
      }
    } catch (err) {
      console.error(err);
      alert("Assignment failed. Please try again.");
    }
    setSelected([]);
    setSelectAll(false);
  };

  const handleClearFilters = () => {
    setPollingExp(false);
    setCountingExp(false);
    setFemale(false);
    setPwd(false);
    setSelected([]);
    setSelectAll(false);
    setAcNo("");
    setData([]);
    setErrorMsg("");
    setTotalRequirement(0);
    setTotalAvailable(0);
    setTotalAssigned(0);
    setBoothsCount(0);
    setTotalEmployeesCount(0);
    setShowCard(false);
  };

  const handleExportExcel = async () => {
    const selectedData = selected.map((index) => data[index]);
    if (selectedData.length === 0) {
      alert("Please select at least one row");
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Randomization");
    worksheet.mergeCells("A1:C1");
    const title = worksheet.getCell("A1");
    title.value = "Randomization Report";
    title.font = { size: 14, bold: true };
    title.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 15;
    const headerRow = worksheet.getRow(2);
    headerRow.values = ["Designation", "Avg Salary", "Count"];
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B5394" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });
    selectedData.forEach((item, index) => {
      const row = worksheet.addRow([item.designationName, item.avgSalary, item.count]);
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE3F2FD" } };
        });
      }
      row.eachCell((cell) => {
        cell.alignment = { horizontal: "center" };
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Randomization_Report.xlsx");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
    window.location.reload();
  };

  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const availableForDuty = Math.max(0, totalEmployeesCount - totalAssigned);
  const sufficient = totalAssigned >= totalRequirement;

  return (
    <div className="nic-page-wrapper">
      <div className="nic-header-banner" style={{ position: "relative" }}>
        <div style={{ textAlign: "center", fontWeight: "bold" }}>
          RANDOMIZATION PROCESS MANAGEMENT
        </div>
        <button
          style={{
            position: "absolute",
            right: "15px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#e74c3c",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* AC SELECTION */}
      <div className="nic-section">
        <span className="nic-section-title">Constituency Details</span>
        <label className="nic-label">
          Select Assembly Constituency (AC) <span className="req">*</span>
        </label>
        <select
          className="full-width-select"
          value={acNo}
          onChange={(e) => {
            setAcNo(e.target.value);
            setErrorMsg("");
          }}
          style={{ border: errorMsg ? "1px solid red" : "" }}
        >
          <option value="">-- Choose AC --</option>
          {acList && acList.length > 0 ? (
            acList
              .filter((ac) => isSuperAdmin || ac.districtId === userDistrict)
              .map((ac) => (
                <option key={ac.acNo} value={ac.acNo}>
                  {ac.acNo} - {ac.acNameEnglish}
                </option>
              ))
          ) : (
            <option>No AC Found</option>
          )}
        </select>
        {errorMsg && <div style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>⚠ {errorMsg}</div>}
      </div>

      {/* FILTERS */}
      <div className="nic-section">
        <span className="nic-section-title">Filter Criteria</span>
        <div className="checkbox-flex-row">
          <label className="nic-checkbox-item">
            <input type="checkbox" checked={pollingExp} onChange={(e) => setPollingExp(e.target.checked)} />
            Polling Experience
          </label>
          <label className="nic-checkbox-item">
            <input type="checkbox" checked={countingExp} onChange={(e) => setCountingExp(e.target.checked)} />
            Counting Experience
          </label>
          <label className="nic-checkbox-item">
            <input type="checkbox" checked={female} onChange={(e) => setFemale(e.target.checked)} />
            Include Female
          </label>
          <label className="nic-checkbox-item">
            <input type="checkbox" checked={pwd} onChange={(e) => setPwd(e.target.checked)} />
            Include PWD
          </label>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-primary" onClick={handleShowAvailability}>
            Show Availability
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/admin')}>⬅ Back</button>
          <button className="btn btn-danger" onClick={handleClearFilters}>Clear</button>
        </div>
        <button className="btn btn-success" onClick={handleExportExcel}>📊 Export Excel</button>
      </div>

      {/* CARD - only visible when showCard = true */}
      {showCard && (
        <div className="availability-card">
          <div className="card-header">
            <h3>📊 Availability Summary</h3>
            <button className="close-btn" onClick={() => setShowCard(false)}>✕</button>
          </div>
          <div className="stats-row">
            <div className="stat-block">
              <div className="stat-label">Total Booths</div>
              <div className="stat-number booths-number">{boothsCount}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">Requirement</div>
              <div className="stat-number requirement-number">{totalRequirement}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">Total Employees</div>
              <div className="stat-number booths-number">{totalEmployeesCount}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">Already Assigned</div>
              <div className="stat-number assigned-number">{totalAssigned}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">Available (Unassigned)</div>
              <div className="stat-number available-number">{availableForDuty}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">Status</div>
              <div className={`status-badge ${sufficient ? 'status-sufficient' : 'status-insufficient'}`}>
                {sufficient ? "✅ Duty Assignment Completed" : "❌ Duty Assignment Pending"}
              </div>
            </div>
          </div>
          <div className="card-footer">
            * Available = Total employees − Already Assigned
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="nic-section" style={{ paddingTop: "35px", overflow: "visible" }}>
        <span className="nic-section-title" style={{ top: "-12px", left: "15px" }}>
          Personnel Summary (Filtered)
        </span>
        <div className="nic-table-wrapper">
          <table className="nic-table">
            <thead>
              <tr>
                <th style={{ width: "50px", textAlign: "center" }}>
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                </th>
                <th>Designation</th>
                <th style={{ textAlign: "center" }}>Avg Salary</th>
                <th style={{ textAlign: "center" }}>Count</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                paginatedData.map((item, itemIndex) => {
                  const globalIndex = (page - 1) * pageSize + itemIndex;
                  return (
                    <tr key={globalIndex}>
                      <td align="center">
                        <input
                          type="checkbox"
                          checked={selected.includes(globalIndex)}
                          onChange={() => handleSelect(globalIndex)}
                        />
                      </td>
                      <td style={{ fontWeight: "500" }}>{item.designationName}</td>
                      <td align="center">₹ {item.avgSalary}</td>
                      <td align="center" style={{ fontWeight: "bold", color: "#3498db" }}>
                        {item.count}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" align="center" style={{ padding: "30px", color: "#94a3b8" }}>
                    No Records Found. Click 'Show Availability' to load summary.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="grid-footer-pagination">
          <div className="record-count">Total Records: <strong>{data.length}</strong></div>
          <div className="pagination-right">
            <button className="p-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>◀ Prev</button>
            <span className="p-info">Page {page} of {totalPages}</span>
            <button className="p-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next ▶</button>
            <select className="p-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* ASSIGN BUTTON */}
      {data.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
          <button className="btn btn-assign" onClick={handleAssignDuty}>
            Confirm & Assign Duty
          </button>
        </div>
      )}
    </div>
  );
}

export default Randomization;