import { useState, useEffect } from "react";
import "./EmployeeDBGrid.css";
import { labels } from "../utils/language";
import {
  getBlocksByDistrict,
  getBranchesByBank,
} from "../services/mastersService";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import api from "../services/api";   // ✅ IMPORTANT – added axios instance with token

const EmployeeDBGrid = ({
  data,
  lang,
  setData,
  districts = [],
  departments = [],
  offices = [],
  designations = [],
  empTypes = [],
  acList = [],
  banks = [],
}) => {

  // Get user role from localStorage for conditional rendering
  const userRole = localStorage.getItem('role');
  const isAdmin = userRole === 'Admin' || userRole === 'SUPER_ADMIN';

  const [blocksByDistrict, setBlocksByDistrict] = useState({});
  const [branchesByBank, setBranchesByBank] = useState({});
  const [normalizedData, setNormalizedData] = useState([]);

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [gridData, setGridData] = useState([]);
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

  const [filteredData, setFilteredData] = useState([]);
  const startIndex = (page - 1) * pageSize;
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Normalize API data to PascalCase keys used in the grid
  useEffect(() => {
    const normalize = (rawData) => {
      return rawData.map((item) => ({
        ...item,
        EPIC_District_ID: item.epiC_District_ID ?? item.EPIC_District_ID,
        EPIC_Block_ID: item.epiC_Block_ID ?? item.EPIC_Block_ID,
        EPIC_Urban_Rural: item.epiC_Urban_Rural ?? item.EPIC_Urban_Rural,
        AC_No: item.aC_No ?? item.AC_No,
        Part_No: item.part_No ?? item.Part_No,
        Serial_No: item.serial_No ?? item.Serial_No,
        fieldAC: item.field_AC ?? item.fieldAC,
        fieldDistrict: item.field_District_ID ?? item.fieldDistrict,
        fieldBlock: item.field_Block_ID ?? item.fieldBlock,
        homeDistrictId: item.homeDistrictId,
        homeBlockId: item.homeBlockId,
        workDistrictId: item.workDistrictId,
        workBlockId: item.workBlockId,
        deptId: item.deptId,
        office_ID: item.office_ID,
        designation_Id: item.designation_Id,
        empTypeId: item.empTypeId,
        resAC: item.resAC,
        workAC: item.workAC,
        bankCode: item.bankCode,
        ifsCode: item.ifsCode,
        hasEPIC: item.hasEPIC === true || item.hasEPIC === "true",
        pwdType: item.pwdType || "N",
        isFieldDuty: item.isFieldDuty,
        experiencePolling: item.experiencePolling,
        experienceCounting: item.experienceCounting,
        vargId: item.vargId,
        reservationCategory: item.reservationCategory,
        salary: item.salary,
        accountNumber: item.accountNumber,
        epicNo: item.epicNo,
        mobileNo: item.mobileNo,
        dob: item.dob,
        sexId: item.sexId,
        empName: item.empName,
        empName_En: item.empName_En,
        surName: item.surName,
        surName_En: item.surName_En,
        urbanRural: item.urbanRural,
        workUrbanRural: item.workUrbanRural,
      }));
    };
    setNormalizedData(normalize(data));
  }, [data]);

  useEffect(() => {
    setGridData(normalizedData.map((d) => ({ ...d, _selected: false })));
  }, [normalizedData]);

  useEffect(() => {
    setFilteredData(gridData);
  }, [gridData]);

  const toggleSelectAll = (e) => {
    const checked = e.target.checked;
    setGridData(gridData.map((d) => ({ ...d, _selected: checked })));
  };

  const toggleRow = (index) => {
    const updated = [...gridData];
    updated[index]._selected = !updated[index]._selected;
    setGridData(updated);
  };

  const getSelectedRows = () => {
    return gridData.filter((d) => d._selected);
  };

  // ✅ Refresh function using api instance (attaches token automatically)
  const handleRefresh = async () => {
    try {
      const res = await api.get("/pollingpersonnel");
      const freshData = res.data;
      setData(freshData);
      const updated = freshData.map((d) => ({ ...d, _selected: false }));
      setGridData(updated);
      setFilteredData(updated);
      setPage(1);
      alert("Data refreshed ✅");
    } catch (err) {
      console.error(err);
      alert("Error refreshing data");
    }
  };

  // ✅ Delete function – only allowed for admin (frontend check) & uses api.delete
  const handleDeleteSelected = async () => {
    if (!isAdmin) {
      alert("You are not authorized to delete records.");
      return;
    }

    const selected = gridData.filter((d) => d._selected);
    if (selected.length === 0) {
      alert("Please select at least one record");
      return;
    }

    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      for (let emp of selected) {
        const id = emp.empCode;
        await api.delete(`/pollingpersonnel/${id}`);
      }

      // Refresh data after deletion
      const res = await api.get("/pollingpersonnel");
      const freshData = res.data;
      setData(freshData);
      setGridData(freshData.map((d) => ({ ...d, _selected: false })));
      setFilteredData(freshData.map((d) => ({ ...d, _selected: false })));

      alert("Deleted & refreshed successfully ✅");
    } catch (error) {
      console.error(error);
      alert("Error while deleting");
    }
  };

  const handleExportExcel = async () => {
    const selectedRows = gridData.filter((d) => d._selected);
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
        getDepartmentName(e.deptId),
        getOfficeName(e.office_ID),
        getDesignationName(e.designation_Id),
        e.vargId === "I" ? "Class I" : e.vargId === "II" ? "Class II" : e.vargId === "III" ? "Class III" : "-",
        e.reservationCategory,
        getEmpTypeName(e.empTypeId),
        e.salary ? `₹ ${Number(e.salary).toFixed(2)}` : "-",
        getACName(e.resAC),
        getACName(e.workAC),
        e.hasEPIC ? "Yes" : "No",
        e.hasEPIC ? e.epicNo : "-",
        getDistrictName(e.EPIC_District_ID),
        getBlockName(e.EPIC_District_ID, e.EPIC_Block_ID),
        e.EPIC_Urban_Rural === "U" ? "Urban" : e.EPIC_Urban_Rural === "R" ? "Rural" : "-",
        getBankName(e.bankCode),
        getBranchName(e.ifsCode, e.bankCode),
        e.ifsCode,
        e.accountNumber,
        e.AC_No || "-",
        e.Part_No || "-",
        e.Serial_No || "-",
        e.experiencePolling === "Y" ? "Yes" : "No",
        e.experienceCounting === "Y" ? "Yes" : "No",
        e.isFieldDuty === "Y" ? "Yes" : e.isFieldDuty === "N" ? "No" : "-",
        getACName(e.fieldAC),
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
    saveAs(file, "DB_Employees.xlsx");
  };

  // Load blocks for all districts
  useEffect(() => {
    const loadBlocks = async () => {
      const districtIds = new Set();
      normalizedData.forEach((row) => {
        if (row.homeDistrictId) districtIds.add(row.homeDistrictId);
        if (row.workDistrictId) districtIds.add(row.workDistrictId);
        if (row.EPIC_District_ID) districtIds.add(row.EPIC_District_ID);
        if (row.fieldDistrict) districtIds.add(row.fieldDistrict);
      });
      const newBlocks = { ...blocksByDistrict };
      for (const id of districtIds) {
        if (!newBlocks[id]) {
          try { const res = await getBlocksByDistrict(id); newBlocks[id] = res.data; } catch { newBlocks[id] = []; }
        }
      }
      setBlocksByDistrict(newBlocks);
    };
    if (normalizedData.length > 0) loadBlocks();
  }, [normalizedData]);

  // Load branches for all banks
  useEffect(() => {
    const loadBranches = async () => {
      const bankCodes = new Set();
      normalizedData.forEach((row) => { if (row.bankCode) bankCodes.add(row.bankCode); });
      const newBranches = { ...branchesByBank };
      for (const code of bankCodes) {
        if (!newBranches[code]) {
          try { const res = await getBranchesByBank(code); newBranches[code] = res.data; } catch { newBranches[code] = []; }
        }
      }
      setBranchesByBank(newBranches);
    };
    if (normalizedData.length > 0) loadBranches();
  }, [normalizedData]);

  // Helper functions for display names
  const getDistrictName = (id) => {
    const d = districts.find((x) => x.districtId == id);
    return d ? (lang === "en" ? d.districtNameEnglish : d.districtNameHindi) : "-";
  };

  const getBlockName = (districtId, blockId) => {
    if (!districtId || !blockId) return "-";
    const blocks = blocksByDistrict[districtId];
    if (!blocks) return "-";
    const b = blocks.find((x) => x.blockId == blockId);
    return b ? (lang === "en" ? b.blockNameEnglish : b.blockNameHindi) : "-";
  };

  const getDepartmentName = (id) => {
    const d = departments.find((x) => x.deptId == id);
    return d ? (lang === "en" ? d.deptEnglish : d.deptHindi) : "-";
  };

  const getOfficeName = (id) => {
    const o = offices.find((x) => x.officeId == id);
    return o ? (lang === "en" ? o.officeEnglish : o.officeHindi) : "-";
  };

  const getDesignationName = (id) => {
    const d = designations.find((x) => x.designationId == id);
    return d ? (lang === "en" ? d.designationEnglish : d.designationHindi) : "-";
  };

  const getEmpTypeName = (id) => {
    const t = empTypes.find((x) => x.empTypeId == id);
    return t ? (lang === "en" ? t.empTypeEnglish : t.empTypeHindi) : "-";
  };

  const getACName = (id) => {
    const a = acList.find((x) => x.acNo == id);
    return a ? (lang === "en" ? a.acNameEnglish : a.acNameHindi) : "-";
  };

  const getBankName = (code) => {
    const b = banks.find((x) => x.bankCode == code);
    return b ? (lang === "en" ? b.bankNameEnglish : b.bankNameHindi) : "-";
  };

  const getBranchName = (ifs, bankCode) => {
    const branches = branchesByBank[bankCode];
    if (!branches) return "-";
    const b = branches.find((x) => x.ifsCode === ifs);
    return b ? (lang === "en" ? b.branchNameEnglish : b.branchNameHindi) : "-";
  };

  const handleApplyFilter = () => {
    const isEmpty = Object.values(filters).every((v) => !v);
    if (isEmpty) {
      alert("Please select at least one filter");
      return;
    }
    const result = gridData.filter((emp) => {
      return (
        (!filters.name || emp.empName?.toLowerCase().includes(filters.name.toLowerCase()) || emp.empName_En?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.mobile || emp.mobileNo?.includes(filters.mobile)) &&
        (!filters.gender || emp.sexId === filters.gender) &&
        (!filters.epic || emp.epicNo?.toLowerCase().includes(filters.epic.toLowerCase())) &&
        (!filters.homeDistrict || emp.homeDistrictId == filters.homeDistrict) &&
        (!filters.workDistrict || emp.workDistrictId == filters.workDistrict) &&
        (!filters.department || emp.deptId == filters.department) &&
        (!filters.office || emp.office_ID == filters.office) &&
        (!filters.designation || emp.designation_Id == filters.designation) &&
        (!filters.polling || emp.experiencePolling == filters.polling) &&
        (!filters.counting || emp.experienceCounting == filters.counting)
      );
    });
    setFilteredData(result);
  };

  const handleClearFilter = () => {
    setFilters({
      name: "", mobile: "", gender: "", epic: "",
      homeDistrict: "", workDistrict: "", department: "",
      office: "", designation: "", polling: "", counting: "",
    });
    setFilteredData(gridData);
  };

  return (
    <div className="dbgrid-container">
      <div>
        <div className="top-header-bar">
          <h2>{labels.pageTitle[lang]}</h2>
        </div>

        <div className="filter-wrapper">
          <div className="filter-container">
            <div className="filter-header">{labels.filterTitle[lang]}</div>
            <div className="filter-grid">
              <input placeholder={labels.nameEnglish[lang]} value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
              <input placeholder={labels.mobile[lang]} value={filters.mobile} onChange={(e) => setFilters({ ...filters, mobile: e.target.value })} />
              <input placeholder="EPIC ID (Capital letters only)" value={filters.epic} onChange={(e) => setFilters({ ...filters, epic: e.target.value })} />
              <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })}>
                <option value="">{labels.gender[lang]}</option><option value="M">{labels.male[lang]}</option><option value="F">{labels.female[lang]}</option><option value="O">{labels.other[lang]}</option>
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
                <option value="">{labels.pollingExp[lang]}</option><option value="Y">{labels.yes[lang]}</option><option value="N">{labels.no[lang]}</option>
              </select>
              <select value={filters.counting} onChange={(e) => setFilters({ ...filters, counting: e.target.value })}>
                <option value="">{labels.countingExp[lang]}</option><option value="Y">{labels.yes[lang]}</option><option value="N">{labels.no[lang]}</option>
              </select>
            </div>
            <div className="filter-actions">
              <button className="btn-apply" onClick={handleApplyFilter}>🔍 {lang === "en" ? "Apply Filter" : "फ़िल्टर लागू करें"}</button>
              <button className="btn-clear" onClick={handleClearFilter}>❌ {lang === "en" ? "Clear Filter" : "फ़िल्टर साफ़ करें"}</button>
            </div>
          </div>
        </div>

        <div className="db-top-bar">
          <h2 className="grid-heading">{lang === "en" ? "Database Employee Records" : "डेटाबेस कर्मचारी रिकॉर्ड"}</h2>
          <div className="db-top-actions">
            <button className="btn-refresh" onClick={handleRefresh}>🔄 Refresh</button>
            <button className="btn-export" onClick={handleExportExcel}>📊 Export</button>
            {isAdmin && (
              <button className="btn-delete" onClick={handleDeleteSelected}>🗑️ Delete</button>
            )}
          </div>
        </div>

        <div className="table-scroll-area" style={{ overflowX: "auto" }}>
          <table className="db-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={toggleSelectAll} /></th>
                <th>#</th><th>{lang === "en" ? "Name (Hindi)" : "नाम (हिंदी)"}</th><th>{lang === "en" ? "Name (English)" : "नाम (अंग्रेज़ी)"}</th>
                <th>{lang === "en" ? "Surname (Hindi)" : "उपनाम (हिंदी)"}</th><th>{lang === "en" ? "Surname (English)" : "उपनाम (अंग्रेज़ी)"}</th>
                <th>{lang === "en" ? "DOB" : "जन्म तिथि"}</th><th>{lang === "en" ? "Gender" : "लिंग"}</th><th>{lang === "en" ? "Mobile" : "मोबाइल"}</th>
                <th>EPIC</th><th>{lang === "en" ? "EPIC No" : "EPIC नंबर"}</th><th>EPIC District</th><th>EPIC Block</th><th>EPIC Area</th>
                <th>{lang === "en" ? "Home District" : "गृह जिला"}</th><th>{lang === "en" ? "Block" : "ब्लॉक"}</th><th>{lang === "en" ? "Area" : "क्षेत्र"}</th>
                <th>{lang === "en" ? "Work District" : "कार्य जिला"}</th><th>{labels.workBlock[lang]}</th><th>{labels.workAreaType[lang]}</th>
                <th>{lang === "en" ? "Department" : "विभाग"}</th><th>{lang === "en" ? "Office" : "कार्यालय"}</th><th>{lang === "en" ? "Designation" : "पद"}</th>
                <th>{labels.varg[lang]}</th><th>{lang === "en" ? "Emp Type" : "कर्मचारी प्रकार"}</th><th>{labels.salary[lang]}</th>
                <th>{lang === "en" ? "Res AC" : "निवास AC"}</th><th>{lang === "en" ? "Work AC" : "कार्य AC"}</th><th>{lang === "en" ? "PWD" : "दिव्यांग"}</th>
                <th>{lang === "en" ? "Bank" : "बैंक"}</th><th>{lang === "en" ? "Branch" : "शाखा"}</th><th>{lang === "en" ? "IFSC" : "आईएफएससी"}</th>
                <th>{lang === "en" ? "Bank A/C" : "खाता संख्या"}</th><th>{labels.assemblyNo[lang]}</th><th>{labels.partNo[lang]}</th><th>{labels.serialNo[lang]}</th>
                <th>{lang === "en" ? "Polling" : "मतदान Exp."}</th><th>{lang === "en" ? "Counting" : "मतगणना Exp."}</th>
                <th>{lang === "en" ? "Field Duty" : "फील्ड ड्यूटी"}</th><th>{lang === "en" ? "Field AC" : "फील्ड विधानसभा"}</th>
                <th>{lang === "en" ? "Field District" : "फील्ड जिला"}</th><th>{lang === "en" ? "Field Block" : "फील्ड ब्लॉक"}</th>
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
                    <td>{e.dob ? e.dob.split("T")[0] : ""}</td>
                    <td>{e.sexId === "M" ? "Male" : e.sexId === "F" ? "Female" : "Other"}</td>
                    <td>{e.mobileNo}</td>
                    <td>{e.hasEPIC ? "Yes" : "No"}</td>
                    <td>{e.epicNo}</td>
                    <td>{getDistrictName(e.EPIC_District_ID)}</td>
                    <td>{getBlockName(e.EPIC_District_ID, e.EPIC_Block_ID)}</td>
                    <td>{e.EPIC_Urban_Rural === "U" ? (lang === "en" ? "Urban" : "शहरी") : (lang === "en" ? "Rural" : "ग्रामीण")}</td>
                    <td>{getDistrictName(e.homeDistrictId)}</td>
                    <td>{getBlockName(e.homeDistrictId, e.homeBlockId)}</td>
                    <td>{e.urbanRural === "U" ? (lang === "en" ? "Urban" : "शहरी") : (lang === "en" ? "Rural" : "ग्रामीण")}</td>
                    <td>{getDistrictName(e.workDistrictId)}</td>
                    <td>{getBlockName(e.workDistrictId, e.workBlockId)}</td>
                    <td>{e.workUrbanRural === "U" ? (lang === "en" ? "Urban" : "शहरी") : (lang === "en" ? "Rural" : "ग्रामीण")}</td>
                    <td>{getDepartmentName(e.deptId)}</td>
                    <td>{getOfficeName(e.office_ID)}</td>
                    <td>{getDesignationName(e.designation_Id)}</td>
                    <td>{e.vargId}</td>
                    <td>{getEmpTypeName(e.empTypeId)}</td>
                    <td>{e.salary}</td>
                    <td>{getACName(e.resAC)}</td>
                    <td>{getACName(e.workAC)}</td>
                    <td>{e.pwdType === "Y" ? "Yes" : "No"}</td>
                    <td>{getBankName(e.bankCode)}</td>
                    <td>{getBranchName(e.ifsCode, e.bankCode)}</td>
                    <td>{e.ifsCode}</td>
                    <td>{e.accountNumber}</td>
                    <td>{e.AC_No || "-"}</td>
                    <td>{e.Part_No || "-"}</td>
                    <td>{e.Serial_No || "-"}</td>
                    <td>{e.experiencePolling}</td>
                    <td>{e.experienceCounting}</td>
                    <td>{e.isFieldDuty === "Y" ? "Yes" : "No"}</td>
                    <td>{getACName(e.fieldAC)}</td>
                    <td>{getDistrictName(e.fieldDistrict)}</td>
                    <td>{getBlockName(e.fieldDistrict, e.fieldBlock)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <div className="record-count">{lang === "en" ? "Total Records" : "कुल रिकॉर्ड"}: <strong>{filteredData.length}</strong></div>
          <div className="pagination-right">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>◀ Prev</button>
            <span>{lang === "en" ? "Page" : "पृष्ठ"} {page} {lang === "en" ? "of" : "में से"} {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages || totalPages === 0}>Next ▶</button>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              <option value={10}>{lang === "en" ? "10 per page" : "प्रति पृष्ठ 10"}</option>
              <option value={25}>{lang === "en" ? "25 per page" : "प्रति पृष्ठ 25"}</option>
              <option value={50}>{lang === "en" ? "50 per page" : "प्रति पृष्ठ 50"}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDBGrid;