// EmployeeTempGrid.jsx
import { useState, useEffect } from "react";
import "./EmployeeTempGrid.css";
import { labels } from "../utils/language";
import {
  getBlocksByDistrict,
  getBranchesByBank,
} from "../services/mastersService";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import api from "../services/api";  // ✅ added – ensures token is sent

const EmployeeTempGrid = ({
  data,
  setData,
  lang,
  onCloseForm,
  districts = [],
  departments = [],
  offices = [],
  designations = [],
  empTypes = [],
  acList = [],
  banks = [],
  onEdit,
}) => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [blocksByDistrict, setBlocksByDistrict] = useState({});
  const [branchesByBank, setBranchesByBank] = useState({});

  const [filters, setFilters] = useState({
    name: "",
    mobile: "",
    gender: "",
    epic: "",
    homeDistrict: "",
    workDistrict: "",
    department: "",
    office: "",
    designation: "",
    polling: "",
    counting: "",
  });

  const filteredData = data.filter((emp) => {
    return (
      (!filters.name ||
        emp.empName?.toLowerCase().includes(filters.name.toLowerCase()) ||
        emp.empName_En?.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.mobile || emp.mobileNo?.includes(filters.mobile)) &&
      (!filters.gender || emp.sexId === filters.gender) &&
      (!filters.epic ||
        emp.epicNo?.toLowerCase().includes(filters.epic.toLowerCase())) &&
      (!filters.homeDistrict || emp.homeDistrictId == filters.homeDistrict) &&
      (!filters.workDistrict || emp.workDistrictId == filters.workDistrict) &&
      (!filters.department || emp.deptId == filters.department) &&
      (!filters.office || emp.office_ID == filters.office) &&
      (!filters.designation || emp.designation_Id == filters.designation) &&
      (!filters.polling || emp.experiencePolling == filters.polling) &&
      (!filters.counting || emp.experienceCounting == filters.counting)
    );
  });

  const startIndex = (page - 1) * pageSize;
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice(startIndex, startIndex + pageSize);

  // ----- Helpers with fallback to stored names -----
  const getDistrictName = (id) => {
    if (!id) return "-";
    const district = districts.find((d) => d.districtId == id);
    return district
      ? lang === "en"
        ? district.districtNameEnglish
        : district.districtNameHindi
      : "-";
  };

  const getDepartmentName = (id, storedName) => {
    if (!id) return storedName || "-";
    const dept = departments.find((d) => d.deptId == id);
    return dept
      ? lang === "en"
        ? dept.deptEnglish
        : dept.deptHindi
      : storedName || "-";
  };

  const getOfficeName = (id, storedName) => {
    if (!id) return storedName || "-";
    const office = offices.find((o) => o.officeId == id);
    return office
      ? lang === "en"
        ? office.officeEnglish
        : office.officeHindi
      : storedName || "-";
  };

  const getDesignationName = (id, storedName) => {
    if (!id) return storedName || "-";
    const desig = designations.find((d) => d.designationId == id);
    return desig
      ? lang === "en"
        ? desig.designationEnglish
        : desig.designationHindi
      : storedName || "-";
  };

  const getEmpTypeName = (id, storedName) => {
    if (!id) return storedName || "-";
    const type = empTypes.find((t) => t.empTypeId == id);
    return type
      ? lang === "en"
        ? type.empTypeEnglish
        : type.empTypeHindi
      : storedName || "-";
  };

  const getACName = (id, storedName) => {
    if (!id) return storedName || "-";
    const ac = acList.find((a) => a.acNo == id);
    return ac
      ? lang === "en"
        ? ac.acNameEnglish
        : ac.acNameHindi
      : storedName || "-";
  };

  const getBankName = (code, storedName) => {
    if (!code) return storedName || "-";
    const bank = banks.find((b) => b.bankCode == code);
    return bank
      ? lang === "en"
        ? bank.bankNameEnglish
        : bank.bankNameHindi
      : storedName || "-";
  };

  const getBranchName = (ifsCode, bankCode, storedName) => {
    if (!ifsCode) return storedName || "-";
    const bankBranches = branchesByBank[bankCode];
    if (!bankBranches) return storedName || "-";
    const branch = bankBranches.find((b) => b.ifsCode === ifsCode);
    if (!branch) return storedName || "-";
    return lang === "en" ? branch.branchNameEnglish : branch.branchNameHindi;
  };

  const getBlockName = (districtId, blockId) => {
    if (!districtId || !blockId) return "-";
    const blocks = blocksByDistrict[districtId];
    if (!blocks) return "-";
    const block = blocks.find((b) => b.blockId == blockId);
    return block
      ? lang === "en"
        ? block.blockNameEnglish
        : block.blockNameHindi
      : "-";
  };

  // ----- Load blocks & branches (same as original) -----
  useEffect(() => {
    const loadBlocks = async () => {
      const districtIds = new Set();
      data.forEach((row) => {
        if (row.homeDistrictId) districtIds.add(row.homeDistrictId);
        if (row.workDistrictId) districtIds.add(row.workDistrictId);
        if (row.EPIC_District_ID) districtIds.add(row.EPIC_District_ID);
        if (row.fieldDistrict) districtIds.add(row.fieldDistrict);
      });
      const newBlocks = { ...blocksByDistrict };
      for (const id of districtIds) {
        if (!newBlocks[id]) {
          try {
            const res = await getBlocksByDistrict(id);
            newBlocks[id] = res.data;
          } catch (err) {
            console.error(`Failed to load blocks for district ${id}`, err);
            newBlocks[id] = [];
          }
        }
      }
      setBlocksByDistrict(newBlocks);
    };
    if (data.length > 0) loadBlocks();
  }, [data]);

  useEffect(() => {
    const loadBranches = async () => {
      const bankCodes = new Set();
      data.forEach((row) => {
        if (row.bankCode) bankCodes.add(row.bankCode);
      });
      const newBranches = { ...branchesByBank };
      for (const code of bankCodes) {
        if (!newBranches[code]) {
          try {
            const res = await getBranchesByBank(code);
            newBranches[code] = res.data;
          } catch (err) {
            console.error(`Failed to load branches for bank ${code}`, err);
            newBranches[code] = [];
          }
        }
      }
      setBranchesByBank(newBranches);
    };
    if (data.length > 0) loadBranches();
  }, [data]);

  // ----- Handlers -----
  const toggleSelectAll = (e) => {
    const checked = e.target.checked;
    setData(data.map((d) => ({ ...d, _selected: checked })));
  };

  const toggleRow = (index) => {
    const updated = [...data];
    updated[index]._selected = !updated[index]._selected;
    setData(updated);
  };

  const handleEditSelected = () => {
    const selected = data.filter((d) => d._selected);
    if (selected.length === 0) {
      alert(labels.edit[lang]);
      return;
    }
    if (selected.length > 1) {
      alert(labels.editmu[lang]);
      return;
    }
    if (onEdit) onEdit(selected[0]);
  };

  const handleExportExcel = async () => {
    const selectedRows = data.filter((d) => d._selected);
    if (selectedRows.length === 0) {
      alert(labels.exl[lang]);
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Employees");
    worksheet.mergeCells("A1:AN1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "EMPLOYEE REPORT";
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: "center" };

    const headers = [
      "S.No", "Emp Name", "Emp Name (En)", "Surname", "Surname (En)",
      "DOB", "Gender", "Mobile", "Home District", "Home Block", "Home Area",
      "Work District", "Work Block", "Work Area", "Department", "Office",
      "Designation", "Class", "Category", "Emp Type", "Salary",
      "Residential AC", "Work AC", "Has EPIC", "EPIC No", "EPIC District",
      "EPIC Block", "EPIC Area", "Bank", "Branch", "IFSC", "Account No",
      "AC No", "Part No", "Serial No", "Polling Exp", "Counting Exp",
      "Field Duty", "Field AC", "Field District", "Field Block",
    ];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F81BD" } };
      cell.alignment = { horizontal: "center" };
      cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    });

    selectedRows.forEach((e, index) => {
      const row = worksheet.addRow([
        index + 1, e.empName, e.empName_En, e.surName, e.surName_En, e.dob,
        e.sexId === "M" ? "Male" : e.sexId === "F" ? "Female" : "Other",
        e.mobileNo,
        getDistrictName(e.homeDistrictId),
        getBlockName(e.homeDistrictId, e.homeBlockId),
        e.urbanRural === "U" ? "Urban" : "Rural",
        getDistrictName(e.workDistrictId),
        getBlockName(e.workDistrictId, e.workBlockId),
        e.workUrbanRural === "U" ? "Urban" : e.workUrbanRural === "R" ? "Rural" : "-",
        getDepartmentName(e.deptId, e.deptName),
        getOfficeName(e.office_ID, e.officeName),
        getDesignationName(e.designation_Id, e.designationName),
        e.vargId === "I" ? "Class I" : e.vargId === "II" ? "Class II" : e.vargId === "III" ? "Class III" : "-",
        e.reservationCategory,
        getEmpTypeName(e.empTypeId, e.empTypeName),
        e.salary ? `₹ ${Number(e.salary).toFixed(2)}` : "-",
        getACName(e.resAC, e.resACName),
        getACName(e.workAC, e.workACName),
        e.hasEPIC ? "Yes" : "No",
        e.hasEPIC ? e.epicNo : "-",
        getDistrictName(e.EPIC_District_ID),
        getBlockName(e.EPIC_District_ID, e.EPIC_Block_ID),
        e.EPIC_Urban_Rural === "U" ? "Urban" : e.EPIC_Urban_Rural === "R" ? "Rural" : "-",
        getBankName(e.bankCode, e.bankName),
        getBranchName(e.ifsCode, e.bankCode, e.branchName),
        e.ifsCode,
        e.accountNumber,
        e.AC_No || "-",
        e.Part_No || "-",
        e.Serial_No || "-",
        e.experiencePolling === "Y" ? "Yes" : "No",
        e.experienceCounting === "Y" ? "Yes" : "No",
        e.isFieldDuty === "Y" ? "Yes" : e.isFieldDuty === "N" ? "No" : "-",
        getACName(e.fieldAC, e.fieldACName),
        getDistrictName(e.fieldDistrict),
        getBlockName(e.fieldDistrict, e.fieldBlock),
      ]);
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: index % 2 === 0 ? "FFF2F2F2" : "FFFFFFFF" } };
        cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
      });
    });
    worksheet.columns.forEach((col) => { col.width = 18; });
    const buffer = await workbook.xlsx.writeBuffer();
    const file = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(file, "Employees.xlsx");
  };

  const handleDeleteSelected = () => {
    const selected = data.filter((d) => d._selected);
    if (selected.length === 0) {
      alert("Please select at least one employee");
      return;
    }
    if (!window.confirm("Are you sure?")) return;
    const remaining = data.filter((d) => !d._selected);
    setData(remaining);
    alert(lang === "en" ? "Removed from temporary list ✅" : "अस्थायी सूची से हटाया गया ✅");
  };

  // ✅ CORRECTED FINAL SAVE – uses api for all backend calls
  const handleFinalSave = async () => {
    const selected = data.filter((d) => d._selected);
    if (selected.length === 0) {
      alert(labels.selectemp[lang]);
      return;
    }
    const confirmSave = window.confirm(
      labels.final[lang].replace("${selected.length}", selected.length)
    );
    if (!confirmSave) return;

    try {
      const updatedEmployees = [];

      for (let emp of selected) {
        let imagePathResult = null;
        let pwdPathResult = null;

        if (emp.empImage || emp.pwdCertificate) {
          const formData = new FormData();
          if (emp.empImage) formData.append("EmpImagePath", emp.empImage);
          if (emp.pwdCertificate)
            formData.append("PWDCertificatePath", emp.pwdCertificate);

          // ✅ use api.post for upload
          const uploadRes = await api.post("/pollingpersonnel/upload-files", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          imagePathResult = uploadRes.data.imagePath;
          pwdPathResult = uploadRes.data.pwdPath;
        }

        const { empImage, pwdCertificate, _selected, ...cleanEmployee } = emp;
        updatedEmployees.push({
          ...cleanEmployee,
          DeptId: Number(cleanEmployee.deptId),
          Office_ID: Number(cleanEmployee.office_ID),
          Designation_Id: cleanEmployee.designation_Id ? Number(cleanEmployee.designation_Id) : null,
          EmpTypeId: cleanEmployee.empTypeId ? Number(cleanEmployee.empTypeId) : null,
          ResAC: cleanEmployee.resAC ? Number(cleanEmployee.resAC) : null,
          WorkAC: cleanEmployee.workAC ? Number(cleanEmployee.workAC) : null,
          BankCode: cleanEmployee.bankCode ? Number(cleanEmployee.bankCode) : null,
          EPIC_District_ID: cleanEmployee.EPIC_District_ID || null,
          EPIC_Block_ID: cleanEmployee.EPIC_Block_ID || null,
          EPIC_Urban_Rural: cleanEmployee.EPIC_Urban_Rural || null,
          Field_AC: cleanEmployee.fieldAC ? Number(cleanEmployee.fieldAC) : null,
          Field_District_ID: cleanEmployee.fieldDistrict || null,
          Field_Block_ID: cleanEmployee.fieldBlock || null,
          IsFieldDuty: cleanEmployee.isFieldDuty || null,
          EmpCode: cleanEmployee.empCode ? parseInt(cleanEmployee.empCode) : 0,
          PWDTypeId: (cleanEmployee.pwdType === "Y" && cleanEmployee.pwdTypeId) ? Number(cleanEmployee.pwdTypeId) : null,
          PWDPercentage: (cleanEmployee.pwdType === "Y" && cleanEmployee.pwdPercentage) ? String(cleanEmployee.pwdPercentage) : null,
          EmpImagePath: imagePathResult,
          PWDCertificatePath: pwdPathResult,
        });
      }

      // ✅ use api.post for bulk-save
      const saveRes = await api.post("/pollingpersonnel/bulk-save", { Employees: updatedEmployees });
      if (saveRes.status !== 200) {
        alert("Error: " + (saveRes.data?.message || "Unknown error"));
        return;
      }
      alert(labels.Saved[lang]);

      // ✅ use api.get to refresh data
      const dbRes = await api.get("/pollingpersonnel");
      const dbData = dbRes.data;

      // merge empCode back
      const mergedData = data.map((tempRow) => {
        const match = dbData.find((d) => d.mobileNo === tempRow.mobileNo);
        return { ...tempRow, empCode: match?.empCode };
      });
      setData(mergedData.map((d) => ({ ...d, _selected: false })));

      if (onCloseForm) onCloseForm();
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Save Error:", error);
      alert("Error while saving: " + (error.response?.data || error.message));
    }
  };

  // ----- JSX -----
  return (
    <div className="grid-main-wrapper">
      <div className="grid-card-container">
        <div className="grid-top-bar">
          <div className="filter-wrapper">
            <div className="filter-container">
              <div className="filter-header">{labels.filterTitle[lang]}</div>
              <div className="filter-grid">
                <input placeholder={labels.nameEnglish[lang]} value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
                <input placeholder={labels.mobile[lang]} value={filters.mobile} onChange={(e) => setFilters({ ...filters, mobile: e.target.value })} />
                <input placeholder="EPIC ID (Capital letters only)" value={filters.epic} onChange={(e) => setFilters({ ...filters, epic: e.target.value })} />
                <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })}>
                  <option value="">{labels.gender[lang]}</option>
                  <option value="M">{labels.male[lang]}</option>
                  <option value="F">{labels.female[lang]}</option>
                  <option value="O">{labels.other[lang]}</option>
                </select>
                <select value={filters.homeDistrict} onChange={(e) => setFilters({ ...filters, homeDistrict: e.target.value })}>
                  <option value="">{labels.district[lang]}</option>
                  {districts.map((d) => (<option key={d.districtId} value={d.districtId}>{lang === "en" ? d.districtNameEnglish : d.districtNameHindi}</option>))}
                </select>
                <select value={filters.workDistrict} onChange={(e) => setFilters({ ...filters, workDistrict: e.target.value })}>
                  <option value="">{labels.workDistrict[lang]}</option>
                  {districts.map((d) => (<option key={d.districtId} value={d.districtId}>{lang === "en" ? d.districtNameEnglish : d.districtNameHindi}</option>))}
                </select>
                <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
                  <option value="">{labels.department[lang]}</option>
                  {departments.map((d) => (<option key={d.deptId} value={d.deptId}>{lang === "en" ? d.deptEnglish : d.deptHindi}</option>))}
                </select>
                <select value={filters.office} onChange={(e) => setFilters({ ...filters, office: e.target.value })}>
                  <option value="">{labels.office[lang]}</option>
                  {offices.map((o) => (<option key={o.officeId} value={o.officeId}>{lang === "en" ? o.officeEnglish : o.officeHindi}</option>))}
                </select>
                <select value={filters.designation} onChange={(e) => setFilters({ ...filters, designation: e.target.value })}>
                  <option value="">{labels.designation[lang]}</option>
                  {designations.map((d) => (<option key={d.designationId} value={d.designationId}>{lang === "en" ? d.designationEnglish : d.designationHindi}</option>))}
                </select>
                <select value={filters.polling} onChange={(e) => setFilters({ ...filters, polling: e.target.value })}>
                  <option value="">{labels.pollingExp[lang]}</option>
                  <option value="Y">{labels.yes[lang]}</option>
                  <option value="N">{labels.no[lang]}</option>
                </select>
                <select value={filters.counting} onChange={(e) => setFilters({ ...filters, counting: e.target.value })}>
                  <option value="">{labels.countingExp[lang]}</option>
                  <option value="Y">{labels.yes[lang]}</option>
                  <option value="N">{labels.no[lang]}</option>
                </select>
              </div>
              <div className="filter-actions">
                <button className="btn-apply" onClick={() => { const isEmpty = Object.values(filters).every(v => !v); if (isEmpty) alert(labels.applyFilterMsg[lang]); }}>🔍 {lang === "en" ? "Apply Filter" : "फ़िल्टर लागू करें"}</button>
                <button className="btn-clear" onClick={() => setFilters({ name: "", mobile: "", gender: "", epic: "", homeDistrict: "", workDistrict: "", department: "", office: "", designation: "", polling: "", counting: "" })}>❌ {labels.clearFilter[lang]}</button>
              </div>
            </div>
          </div>
          <h2 className="grid-heading">{lang === "en" ? "Final Personnel Register" : "अंतिम कार्मिक रजिस्टर"}</h2>
          <div className="top-action-btns">
            <button className="btn-light" onClick={() => window.location.reload()}>🔄 {lang === "en" ? "Refresh" : "रीफ्रेश"}</button>
            <button className="btn-green" onClick={handleExportExcel}>📊 {lang === "en" ? "Export Excel" : "एक्सेल निर्यात"}</button>
            <button className="btn-warning" onClick={handleEditSelected}>✏️ {lang === "en" ? "Edit Selected" : "चयन संपादित करें"}</button>
            <button className="btn-red" onClick={handleDeleteSelected}>🗑️ {lang === "en" ? "Delete Selected" : "चयन हटाएं"}</button>
            <button className="btn-primary-gov" onClick={handleFinalSave}>💾 {lang === "en" ? "FINAL SAVE" : "अंतिम सेव"}</button>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="empty-state">{lang === "en" ? "No employee data found in temporary list." : "कोई कर्मचारी डेटा उपलब्ध नहीं है"}</div>
        ) : (
          <>
            <div className="table-scroll-area">
              <table className="gov-styled-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" onChange={toggleSelectAll} /></th>
                    <th>#</th><th>{lang === "en" ? "Name (Hindi)" : "नाम (हिंदी)"}</th><th>{lang === "en" ? "Name (English)" : "नाम (अंग्रेज़ी)"}</th>
                    <th>{lang === "en" ? "Surname (Hindi)" : "उपनाम (हिंदी)"}</th><th>{lang === "en" ? "Surname (English)" : "उपनाम (अंग्रेज़ी)"}</th>
                    <th>{lang === "en" ? "DOB" : "जन्म तिथि"}</th><th>{lang === "en" ? "Gender" : "लिंग"}</th><th>{lang === "en" ? "Mobile" : "मोबाइल"}</th>
                    <th>{lang === "en" ? "Home District" : "गृह जिला"}</th><th>{lang === "en" ? "Block" : "ब्लॉक"}</th><th>{lang === "en" ? "Area" : "क्षेत्र"}</th>
                    <th>{lang === "en" ? "Work District" : "कार्य जिला"}</th><th>{labels.workBlock[lang]}</th><th>{labels.workAreaType[lang]}</th>
                    <th>{lang === "en" ? "Department" : "विभाग"}</th><th>{lang === "en" ? "Office" : "कार्यालय"}</th><th>{lang === "en" ? "Designation" : "पद"}</th>
                    <th>{labels.varg[lang]}</th><th>{labels.employeeCategory[lang]}</th><th>{lang === "en" ? "Emp Type" : "कर्मचारी प्रकार"}</th>
                    <th>{labels.salary[lang]}</th><th>{lang === "en" ? "Res AC" : "निवास AC"}</th><th>{lang === "en" ? "Work AC" : "कार्य AC"}</th>
                    <th>{lang === "en" ? "EPIC" : "EPIC"}</th><th>{lang === "en" ? "EPIC No" : "EPIC नंबर"}</th><th>EPIC District</th><th>EPIC Block</th><th>EPIC Area</th>
                    <th>{lang === "en" ? "PWD" : "दिव्यांग"}</th><th>{lang === "en" ? "Bank" : "बैंक"}</th><th>{lang === "en" ? "Branch" : "शाखा"}</th>
                    <th>{lang === "en" ? "IFSC" : "आईएफएससी"}</th><th>{lang === "en" ? "Bank A/C" : "खाता संख्या"}</th>
                    <th>{labels.assemblyNo[lang]}</th><th>{labels.partNo[lang]}</th><th>{labels.serialNo[lang]}</th>
                    <th>{lang === "en" ? "Polling" : "मतदान Exp."}</th><th>{lang === "en" ? "Counting" : "मतगणना Exp."}</th>
                    <th>{lang === "en" ? "Field Duty" : "फील्ड ड्यूटी"}</th><th>{lang === "en" ? "Field AC" : "फील्ड विधानसभा"}</th>
                    <th>{lang === "en" ? "Field District" : "फील्ड जिला"}</th><th>{lang === "en" ? "Field Block" : "फील्ड ब्लॉक"}</th>
                    <th>{lang === "en" ? "Photo" : "फोटो"}</th><th>{lang === "en" ? "PWD Certificate" : "दिव्यांग प्रमाण पत्र"}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedData.map((e, i) => {
                    const actualIndex = startIndex + i;
                    return (
                      <tr key={actualIndex} className={e._selected ? "row-selected" : ""}>
                        <td><input type="checkbox" checked={e._selected || false} onChange={() => toggleRow(actualIndex)} /></td>
                        <td>{actualIndex + 1}</td>
                        <td>{e.empName}</td>
                        <td>{e.empName_En}</td>
                        <td>{e.surName}</td>
                        <td>{e.surName_En}</td>
                        <td>{e.dob}</td>
                        <td>{e.sexId === "M" ? labels.male[lang] : e.sexId === "F" ? labels.female[lang] : labels.other[lang]}</td>
                        <td>{e.mobileNo}</td>
                        <td>{getDistrictName(e.homeDistrictId)}</td>
                        <td>{getBlockName(e.homeDistrictId, e.homeBlockId)}</td>
                        <td>{e.urbanRural === "U" ? labels.urban[lang] : labels.rural[lang]}</td>
                        <td>{getDistrictName(e.workDistrictId)}</td>
                        <td>{getBlockName(e.workDistrictId, e.workBlockId)}</td>
                        <td>{e.workUrbanRural === "U" ? labels.urban[lang] : e.workUrbanRural === "R" ? labels.rural[lang] : "-"}</td>
                        <td>{getDepartmentName(e.deptId, e.deptName)}</td>
                        <td>{getOfficeName(e.office_ID, e.officeName)}</td>
                        <td>{getDesignationName(e.designation_Id, e.designationName)}</td>
                        <td>{e.vargId === "I" ? labels.classI[lang] : e.vargId === "II" ? labels.classII[lang] : e.vargId === "III" ? labels.classIII[lang] : "-"}</td>
                        <td>{e.reservationCategory === "Gazetted Officer" ? labels.gazetted[lang] : e.reservationCategory === "Non-Gazetted & Executive Staff" ? labels.nonGazettedExecutive[lang] : e.reservationCategory === "Non-Gazetted & Non-Executive Staff" ? labels.nonGazettedNonExecutive[lang] : "-"}</td>
                        <td>{getEmpTypeName(e.empTypeId, e.empTypeName)}</td>
                        <td>{e.salary ? `₹ ${Number(e.salary).toFixed(2)}` : "-"}</td>
                        <td>{getACName(e.resAC, e.resACName)}</td>
                        <td>{getACName(e.workAC, e.workACName)}</td>
                        <td>{e.hasEPIC ? labels.yes[lang] : labels.no[lang]}</td>
                        <td>{e.hasEPIC ? e.epicNo : "-"}</td>
                        <td>{getDistrictName(e.EPIC_District_ID)}</td>
                        <td>{getBlockName(e.EPIC_District_ID, e.EPIC_Block_ID)}</td>
                        <td>{e.EPIC_Urban_Rural === "U" ? labels.urban[lang] : e.EPIC_Urban_Rural === "R" ? labels.rural[lang] : "-"}</td>
                        <td>{e.pwdType === "Y" ? labels.yes[lang] : labels.no[lang]}</td>
                        <td>{getBankName(e.bankCode, e.bankName)}</td>
                        <td>{getBranchName(e.ifsCode, e.bankCode, e.branchName)}</td>
                        <td>{e.ifsCode}</td>
                        <td>{e.accountNumber}</td>
                        <td>{e.AC_No || "-"}</td>
                        <td>{e.Part_No || "-"}</td>
                        <td>{e.Serial_No || "-"}</td>
                        <td>{e.experiencePolling === "Y" ? labels.yes[lang] : labels.no[lang]}</td>
                        <td>{e.experienceCounting === "Y" ? labels.yes[lang] : labels.no[lang]}</td>
                        <td>{e.isFieldDuty === "Y" ? labels.yes[lang] : e.isFieldDuty === "N" ? labels.no[lang] : "-"}</td>
                        <td>{getACName(e.fieldAC, e.fieldACName)}</td>
                        <td>{getDistrictName(e.fieldDistrict)}</td>
                        <td>{getBlockName(e.fieldDistrict, e.fieldBlock)}</td>
                        <td>{e.empImage || e.empImagePath ? <button className="view-btn" onClick={() => window.open(e.empImage ? URL.createObjectURL(e.empImage) : `http://localhost:5103/${e.empImagePath}`)}>View</button> : "-"}</td>
                        <td>{e.pwdCertificate || e.pwdCertificatePath ? <button className="view-btn" onClick={() => window.open(e.pwdCertificate ? URL.createObjectURL(e.pwdCertificate) : `http://localhost:5103/${e.pwdCertificatePath}`)}>View</button> : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="grid-footer-pagination">
              <div className="record-count">{lang === "en" ? "Total Records" : "कुल रिकॉर्ड"}: <strong>{data.length}</strong></div>
              <div className="pagination-right">
                <button className="p-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>◀ Prev</button>
                <span className="p-info">{lang === "en" ? "Page" : "पृष्ठ"} {page} {lang === "en" ? "of" : "में से"} {totalPages}</span>
                <button className="p-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next ▶</button>
                <select className="p-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                  <option value={10}>{lang === "en" ? "10 per page" : "प्रति पृष्ठ 10"}</option>
                  <option value={25}>{lang === "en" ? "25 per page" : "प्रति पृष्ठ 25"}</option>
                  <option value={50}>{lang === "en" ? "50 per page" : "प्रति पृष्ठ 50"}</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeTempGrid;