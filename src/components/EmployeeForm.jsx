import { useEffect, useState, useRef } from "react";
import "./EmployeeForm.css";
import { labels } from "../utils/language";
import {
  getDistricts,
  getBlocksByDistrict,
  getDepartments,
  getOfficesByDepartment,
  getDesignations,
  getEmpTypes,
  getACs,
  getBanks,
  getBranchesByBank,
  getVargs,
} from "../services/mastersService";
const EmployeeForm = ({ lang, onAdd, onUpdate, pwdTypes, editEmployee }) => {
  // ----- Masters Data -----
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]); // home blocks
  const [epicBlocks, setEpicBlocks] = useState([]);
  const [workBlocks, setWorkBlocks] = useState([]);
  const [fieldBlocks, setFieldBlocks] = useState([]); // new: dedicated for field duty
  const [departments, setDepartments] = useState([]);
  const [offices, setOffices] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [vargs, setVargs] = useState([]);
  const [empTypes, setEmpTypes] = useState([]);
  const [acList, setAcList] = useState([]);
  const [banks, setBanks] = useState([]);
  const [branches, setBranches] = useState([]);

  // ----- Form State -----
  const [form, setForm] = useState({
    empCode: null,
    empName: "",
    empName_En: "",
    surName: "",
    surName_En: "",
    dob: "",
    sexId: "",
    mobileNo: "",
    empImage: null,
    hasEPIC: false,
    epicNo: "",
    EPIC_District_ID: "",
    EPIC_Block_ID: "",
    EPIC_Urban_Rural: "",
    pwdType: "N",
    pwdPercentage: "",
    pwdCertificate: null,
    pwdTypeId: null,
    homeDistrictId: "",
    homeBlockId: "",
    urbanRural: "",
    workDistrictId: "",
    workBlockId: "",
    workUrbanRural: "",
    deptId: "",
    office_ID: "",
    designation_Id: "",
    vargId: "",
    reservationCategory: "",
    empTypeId: "",
    salary: "",
    resAC: "",
    workAC: "",
    bankCode: "",
    ifsCode: "",
    accountNumber: "",
    AC_No: "",
    Part_No: "",
    Serial_No: "",
    branchTemp: "",
    experiencePolling: "",
    experienceCounting: "",
    isFieldDuty: "",
    fieldAC: "",
    fieldDistrict: "",
    fieldBlock: "",
  });

  // ----- Refs for file inputs -----
  const photoRef = useRef(null);
  const pwdRef = useRef(null);

  // ----- Load Masters on Mount -----
  useEffect(() => {
    const loadMasters = async () => {
      const [d1, d2, d3, d4, d5, d6, d7] = await Promise.all([
        getDistricts(),
        getDepartments(),
        getDesignations(),
        getEmpTypes(),
        getACs(),
        getBanks(),
        getVargs(),
      ]);
      setDistricts(d1.data);
      setDepartments(d2.data);
      setDesignations(d3.data);
      setEmpTypes(d4.data);
      setAcList(d5.data);
      setBanks(d6.data);
      setVargs(d7.data);
    };
    loadMasters();
  }, []);

  // ----- Fill form when editing -----
  useEffect(() => {
    if (editEmployee) {
      setForm({
        ...editEmployee,
        branchTemp: editEmployee.ifsCode || "",
        EPICVerified: true,
        empImage: null,
        pwdCertificate: null,
        pwdType: editEmployee.pwdType || "N",
        pwdTypeId: editEmployee.pwdTypeId || null,
        isFieldDuty: editEmployee.isFieldDuty || "N",
      });
    }
  }, [editEmployee]);

  // ----- Dynamic Dependencies -----
  useEffect(() => {
    if (form.homeDistrictId) {
      getBlocksByDistrict(form.homeDistrictId)
        .then((res) => setBlocks(res.data))
        .catch(console.error);
    } else setBlocks([]);
  }, [form.homeDistrictId]);

  useEffect(() => {
    if (form.workDistrictId) {
      getBlocksByDistrict(form.workDistrictId)
        .then((res) => setWorkBlocks(res.data))
        .catch(console.error);
    } else setWorkBlocks([]);
  }, [form.workDistrictId]);

  useEffect(() => {
    if (form.EPIC_District_ID) {
      getBlocksByDistrict(form.EPIC_District_ID)
        .then((res) => setEpicBlocks(res.data))
        .catch(console.error);
    } else setEpicBlocks([]);
  }, [form.EPIC_District_ID]);

  useEffect(() => {
    if (form.bankCode) {
      getBranchesByBank(form.bankCode)
        .then((res) => setBranches(res.data))
        .catch(console.error);
    } else setBranches([]);
  }, [form.bankCode]);

  useEffect(() => {
    if (form.deptId) {
      getOfficesByDepartment(form.deptId)
        .then((res) => setOffices(res.data))
        .catch(console.error);
    } else setOffices([]);
  }, [form.deptId]);

  useEffect(() => {
    if (form.fieldDistrict) {
      getBlocksByDistrict(form.fieldDistrict)
        .then((res) => setFieldBlocks(res.data))
        .catch(console.error);
    } else setFieldBlocks([]);
  }, [form.fieldDistrict]);

  // ----- Handlers -----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: ["AC_No", "Part_No", "Serial_No"].includes(name)
        ? Number(value)
        : value,
    });
  };

  const handleDistrictChange = async (e) => {
    const id = e.target.value;
    setForm({ ...form, homeDistrictId: id, homeBlockId: "" });
    if (id) {
      const res = await getBlocksByDistrict(id);
      setBlocks(res.data);
    } else setBlocks([]);
  };

  const handleWorkDistrictChange = async (e) => {
    const id = e.target.value;
    setForm({
      ...form,
      workDistrictId: id,
      workBlockId: "",
      workUrbanRural: "",
    });
    if (id) {
      const res = await getBlocksByDistrict(id);
      setWorkBlocks(res.data);
    } else setWorkBlocks([]);
  };

  const handleEpicDistrictChange = async (e) => {
    const id = e.target.value;
    setForm({ ...form, EPIC_District_ID: id, EPIC_Block_ID: "" });
    if (id) {
      const res = await getBlocksByDistrict(id);
      setEpicBlocks(res.data);
    } else setEpicBlocks([]);
  };

  const handleFieldDistrictChange = async (e) => {
    const id = e.target.value;
    setForm({ ...form, fieldDistrict: id, fieldBlock: "" });
    if (id) {
      const res = await getBlocksByDistrict(id);
      setFieldBlocks(res.data);
    } else setFieldBlocks([]);
  };

  const handleDepartmentChange = async (e) => {
    const id = e.target.value;
    setForm({ ...form, deptId: id, office_ID: "" });
    if (id) {
      const res = await getOfficesByDepartment(id);
      setOffices(res.data);
    } else setOffices([]);
  };

  const handleBankChange = async (e) => {
    const code = e.target.value;
    setForm({ ...form, bankCode: code, ifsCode: "", accountNumber: "" });
    if (code) {
      const res = await getBranchesByBank(code);
      setBranches(res.data);
    } else setBranches([]);
  };

  const handleDesignationChange = (e) => {
    const id = e.target.value;
    const selected = designations.find(
      (d) => String(d.designationId) === String(id),
    );
    setForm({ ...form, designation_Id: id, vargId: selected?.vargId || "" });
  };

  const verifyEpic = async (epicNo) => {
    if (!epicNo) return;

    try {
      const res = await fetch(
        `http://localhost:5103/api/epic/verify/${epicNo}`,
      );
      const data = await res.json();

      // 🔥 ONLY SHOW ALERT IF USER MANUALLY VERIFY (NOT ON EDIT AUTO)
      if (!form.EPICVerified) {
        alert(
          data.valid
            ? lang === "en"
              ? "EPIC Verified ✅"
              : "EPIC सत्यापित✅"
            : lang === "en"
              ? "Invalid EPIC ❌"
              : "अमान्य EPIC❌",
        );
      }

      setForm((prev) => ({
        ...prev,
        EPICVerified: data.valid,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations
    if (form.pwdType === "Y" && !form.pwdTypeId) {
      alert("Please select PWD Type");
      return;
    }
    if (form.isFieldDuty === "Y") {
      if (!form.fieldAC || !form.fieldDistrict || !form.fieldBlock) {
        alert("Please fill all Field Duty details");
        return;
      }
    }
    if (form.hasEPIC && !form.EPICVerified) {
      alert(
        lang === "en"
          ? "Please verify EPIC first"
          : "कृपया पहले EPIC सत्यापित करें",
      );
      return;
    }
    if (!form.reservationCategory) {
      alert(
        lang === "en"
          ? "Please select Employee Category"
          : "कृपया कर्मचारी श्रेणी चुनें",
      );
      return;
    }

    // Enrich form with display names
    const homeDistrictObj = districts.find(
      (d) => d.districtId === form.homeDistrictId,
    );
    const blockObj = blocks.find((b) => b.blockId === form.homeBlockId);
    const workDistrictObj = districts.find(
      (d) => d.districtId === form.workDistrictId,
    );
    const deptObj = departments.find(
      (d) => String(d.deptId) === String(form.deptId),
    );
    const officeObj = offices.find(
      (o) => String(o.officeId) === String(form.office_ID),
    );
    const designationObj = designations.find(
      (d) => String(d.designationId) === String(form.designation_Id),
    );
    const empTypeObj = empTypes.find(
      (e) => String(e.empTypeId) === String(form.empTypeId),
    );
    const bankObj = banks.find(
      (b) => String(b.bankCode) === String(form.bankCode),
    );
    const resACObj = acList.find((a) => a.acNo == form.resAC);
    const workACObj = acList.find((a) => a.acNo == form.workAC);
    const branchObj = branches.find((b) => b.ifsCode === form.ifsCode);
    const workBlockObj = workBlocks.find((b) => b.blockId === form.workBlockId);
    const epicBlockObj = epicBlocks.find(
      (b) => b.blockId === form.EPIC_Block_ID,
    );
    const fieldBlockObj = fieldBlocks.find(
      (b) => b.blockId === form.fieldBlock,
    );

    const enrichedForm = {
      ...form,
      homeDistrictName:
        homeDistrictObj?.[
          lang === "en" ? "districtNameEnglish" : "districtNameHindi"
        ],
      homeBlockName:
        blockObj?.[lang === "en" ? "blockNameEnglish" : "blockNameHindi"],
      workDistrictName:
        workDistrictObj?.[
          lang === "en" ? "districtNameEnglish" : "districtNameHindi"
        ],
      workBlockName:
        workBlockObj?.[lang === "en" ? "blockNameEnglish" : "blockNameHindi"],
      deptName: deptObj?.deptEnglish || "",
      officeName: officeObj?.officeEnglish || "",
      designationName: designationObj?.designationEnglish || "",
      empTypeName: empTypeObj?.empTypeEnglish || "",
      resACName: resACObj?.acNameEnglish,
      workACName: workACObj?.acNameEnglish,
      bankName: bankObj?.bankNameEnglish || "",
      branchName: branchObj?.branchNameEnglish || "",
      empCode: form.empCode,
      fieldACName: acList.find((a) => a.acNo == form.fieldAC)?.acNameEnglish,
      EPIC_Block_Name:
        epicBlockObj?.[lang === "en" ? "blockNameEnglish" : "blockNameHindi"],
      EPIC_District_Name: districts.find(
        (d) => d.districtId === form.EPIC_District_ID,
      )?.[lang === "en" ? "districtNameEnglish" : "districtNameHindi"],
      Field_Block_Name:
        fieldBlockObj?.[lang === "en" ? "blockNameEnglish" : "blockNameHindi"],
      Field_District_Name: districts.find(
        (d) => d.districtId === form.fieldDistrict,
      )?.[lang === "en" ? "districtNameEnglish" : "districtNameHindi"],
      pwdTypeId:
        form.pwdType === "Y" && form.pwdTypeId ? Number(form.pwdTypeId) : null,
      pwdPercentage:
        form.pwdType === "Y" && form.pwdPercentage ? form.pwdPercentage : null,
    };

    if (editEmployee) onUpdate(enrichedForm);
    else onAdd(enrichedForm);
    alert(editEmployee ? labels.successUpdate[lang] : labels.successAdd[lang]);

    // Reset form
    setForm({
      empName: "",
      empName_En: "",
      surName: "",
      surName_En: "",
      dob: "",
      sexId: "",
      mobileNo: "",
      empImage: null,
      hasEPIC: false,
      epicNo: "",
      EPIC_District_ID: "",
      EPIC_Block_ID: "",
      EPIC_Urban_Rural: "",
      pwdType: "N",
      pwdPercentage: "",
      pwdCertificate: null,
      pwdTypeId: null,
      homeDistrictId: "",
      homeBlockId: "",
      urbanRural: "",
      workDistrictId: "",
      workBlockId: "",
      workUrbanRural: "",
      deptId: "",
      office_ID: "",
      designation_Id: "",
      vargId: "",
      reservationCategory: "",
      empTypeId: "",
      salary: "",
      resAC: "",
      workAC: "",
      bankCode: "",
      ifsCode: "",
      accountNumber: "",
      AC_No: "",
      Part_No: "",
      Serial_No: "",
      branchTemp: "",
      experiencePolling: "",
      experienceCounting: "",
      isFieldDuty: "",
      fieldAC: "",
      fieldDistrict: "",
      fieldBlock: "",
    });
    setBlocks([]);
    setOffices([]);
    setBranches([]);
    setEpicBlocks([]);
    setFieldBlocks([]);
    if (photoRef.current) photoRef.current.value = "";
    if (pwdRef.current) pwdRef.current.value = "";
  };

  const handleClear = () => {
    setForm({
      empName: "",
      empName_En: "",
      surName: "",
      surName_En: "",
      dob: "",
      sexId: "",
      mobileNo: "",
      empImage: null,
      hasEPIC: false,
      epicNo: "",
      EPIC_District_ID: "",
      EPIC_Block_ID: "",
      EPIC_Urban_Rural: "",
      pwdType: "N",
      pwdPercentage: "",
      pwdCertificate: null,
      pwdTypeId: null,
      homeDistrictId: "",
      homeBlockId: "",
      urbanRural: "",
      workDistrictId: "",
      workBlockId: "",
      workUrbanRural: "",
      deptId: "",
      office_ID: "",
      designation_Id: "",
      vargId: "",
      reservationCategory: "",
      empTypeId: "",
      salary: "",
      resAC: "",
      workAC: "",
      bankCode: "",
      ifsCode: "",
      accountNumber: "",
      AC_No: "",
      Part_No: "",
      Serial_No: "",
      branchTemp: "",
      experiencePolling: "",
      experienceCounting: "",
      isFieldDuty: "",
      fieldAC: "",
      fieldDistrict: "",
      fieldBlock: "",
    });
    setBlocks([]);
    setOffices([]);
    setBranches([]);
    setEpicBlocks([]);
    setFieldBlocks([]);
    if (photoRef.current) photoRef.current.value = "";
    if (pwdRef.current) pwdRef.current.value = "";
  };

  // ----- JSX (same as before, only handlers updated) -----
  return (
    <div className="form-container">
      <div className="form-header">{labels.title[lang]}</div>
      <form onSubmit={handleSubmit} className="nic-form">
        {/* Basic Details */}
        <fieldset>
          <legend>{labels.basicDetails[lang]}</legend>
          <div className="form-grid">
            {/* ... (same as original, just using handlers) ... */}
            {/* I'll keep it concise, but you can copy your existing JSX here */}
            <div className="field-group">
              <label>
                {labels.nameHindi[lang]} <span className="req">*</span>
              </label>
              <input
                name="empName"
                tabIndex="1"
                value={form.empName}
                onChange={handleChange}
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity(labels.required[lang])
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
            </div>
            <div className="field-group">
              <label>
                {labels.nameEnglish[lang]} <span className="req">*</span>
              </label>
              <input
                name="empName_En"
                tabIndex="2"
                value={form.empName_En}
                onChange={handleChange}
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity(labels.required[lang])
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
            </div>
            <div className="field-group">
              <label>{labels.surnameHindi[lang]}</label>
              <input
                name="surName"
                tabIndex="3"
                value={form.surName}
                onChange={handleChange}
              />
            </div>
            <div className="field-group">
              <label>{labels.surnameEnglish[lang]}</label>
              <input
                name="surName_En"
                tabIndex="4"
                value={form.surName_En}
                onChange={handleChange}
              />
            </div>
            <div className="field-group">
              <label>
                {labels.dob[lang]} <span className="req">*</span>
              </label>
              <input
                type="date"
                name="dob"
                tabIndex="5"
                value={form.dob}
                onChange={handleChange}
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity(labels.required[lang])
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
            </div>
            <div className="field-group">
              <label>
                {labels.gender[lang]} <span className="req">*</span>
              </label>
              <select
                name="sexId"
                tabIndex="6"
                value={form.sexId}
                onChange={handleChange}
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity(labels.required[lang])
                }
                onInput={(e) => e.target.setCustomValidity("")}
              >
                <option value="">{labels.select[lang]}</option>
                <option value="M">{labels.male[lang]}</option>
                <option value="F">{labels.female[lang]}</option>
                <option value="O">{labels.other[lang]}</option>
              </select>
            </div>
            <div className="field-group">
              <label>
                {labels.mobile[lang]} <span className="req">*</span>
              </label>
              <input
                name="mobileNo"
                tabIndex="7"
                value={form.mobileNo}
                onChange={handleChange}
                maxLength="10"
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity(labels.required[lang])
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
            </div>
            {/* <div className="field-group">
                <label>Photo</label>
                <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => setForm({ ...form, empImage: e.target.files[0] })} />
            </div> */}
            <div className="field-group photo-upload-container">
              <label>
                <label>{labels.uploadPhoto[lang]}</label>
                <span className="req">*</span>
              </label>
              <div className="photo-row">
                {/* Input area */}
                <div className="input-box">
                  <input
                    type="file"
                    tabIndex="8"
                    ref={photoRef}
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const allowedTypes = [
                        "image/jpeg",
                        "image/png",
                        "image/jpg",
                      ];
                      const maxSize = 2 * 1024 * 1024; // 2MB

                      if (!allowedTypes.includes(file.type)) {
                        alert(
                          lang === "en"
                            ? "Only JPG, JPEG or PNG formats are allowed!"
                            : "केवल JPG, JPEG या PNG फॉर्मेट ही अनुमति है!",
                        );
                        e.target.value = "";
                        setForm({ ...form, empImage: null });
                        return;
                      }

                      if (file.size > maxSize) {
                        alert(
                          lang === "en"
                            ? "Photo size must be less than 2MB!"
                            : "फोटो का आकार 2MB से कम होना चाहिए!",
                        );
                        e.target.value = "";
                        setForm({ ...form, empImage: null });
                        return;
                      }

                      setForm({ ...form, empImage: file });
                    }}
                    required
                    onInvalid={(e) =>
                      e.target.setCustomValidity(labels.required[lang])
                    }
                    onInput={(e) => e.target.setCustomValidity("")}
                  />
                </div>

                {/* Live Preview Box */}
                {/* <div className="live-preview-box">
            {form.empImage ? (
                <img 
                    src={URL.createObjectURL(form.empImage)} 
                    alt="Preview" 
                    onLoad={(e) => URL.revokeObjectURL(e.target.src)} // Memory cleanup
                />
            ) : (
                <span className="placeholder-text">{labels.PhotoPreview[lang]}</span>
            )}
        </div> */}
                <div className="live-preview-box">
                  {form.empImage instanceof File ? (
                    <img
                      src={URL.createObjectURL(form.empImage)}
                      alt="Preview"
                      onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                    />
                  ) : form.empImagePath ? (
                    <img
                      src={`http://localhost:5103/${form.empImagePath}`}
                      alt="Preview"
                    />
                  ) : (
                    <span className="placeholder-text">
                      {labels.PhotoPreview[lang]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </fieldset>

        {/* PWD Details */}
        <fieldset>
          <legend>{labels.pwdDetails[lang]}</legend>
          <div className="checkbox-group">
            <input
              type="checkbox"
              checked={form.pwdType === "Y"}
              onChange={(e) =>
                setForm({ ...form, pwdType: e.target.checked ? "Y" : "N" })
              }
            />
            <label>{labels.pwd[lang]}</label>
          </div>
          {form.pwdType === "Y" && (
            <div className="form-grid mt-10">
              <div className="field-group">
                <input
                  name="pwdPercentage"
                  type="number"
                  placeholder={labels.Percentage[lang]}
                  value={form.pwdPercentage}
                  onChange={handleChange}
                />
              </div>
              <div className="field-group">
                <label>
                  {lang === "en" ? "PWD Type" : "दिव्यांग प्रकार"}{" "}
                  <span className="req">*</span>
                </label>
                <select
                  name="pwdTypeId"
                  value={form.pwdTypeId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, pwdTypeId: val ? Number(val) : null });
                  }}
                >
                  <option value="">
                    {lang === "en" ? "Select Type" : "प्रकार चुनें"}
                  </option>
                  {pwdTypes?.map((p) => (
                    <option key={p.pwdTypeId} value={p.pwdTypeId}>
                      {lang === "en"
                        ? p.pwdTypeNameEnglish
                        : p.pwdTypeNameHindi}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label>
                  {lang === "en"
                    ? "Upload PWD Certificate (PDF, Max 2MB)"
                    : "दिव्यांग प्रमाण पत्र अपलोड करें (PDF, अधिकतम 2MB)"}{" "}
                  <span className="req">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  ref={pwdRef}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.type !== "application/pdf") {
                      alert(
                        lang === "en"
                          ? "Only PDF allowed"
                          : "केवल PDF मान्य है",
                      );
                      e.target.value = "";
                      return;
                    }
                    if (file.size > 2 * 1024 * 1024) {
                      alert(lang === "en" ? "Max size 2MB" : "अधिकतम आकार 2MB");
                      e.target.value = "";
                      return;
                    }
                    setForm({ ...form, pwdCertificate: file });
                  }}
                />
              </div>
            </div>
          )}
        </fieldset>

        {/* EPIC Details */}
        <fieldset>
          <legend>{labels.epicDetails[lang]}</legend>
          <div className="checkbox-group">
            <input
              type="checkbox"
              checked={form.hasEPIC}
              onChange={(e) => setForm({ ...form, hasEPIC: e.target.checked })}
            />
            <label>{labels.haveEpic[lang]}</label>
          </div>
          {form.hasEPIC && (
            <div className="form-grid mt-10">
              <div className="field-group">
                <input
                  name="epicNo"
                  placeholder={labels.enterepicnumber[lang]}
                  value={form.epicNo}
                  onChange={handleChange}
                  required
                  onBlur={(e) => {
                    if (!form.EPICVerified) {
                      verifyEpic(e.target.value);
                    }
                  }}
                />
              </div>
              <div className="field-group">
                <label>
                  {labels.district[lang]} <span className="req">*</span>
                </label>
                <select
                  value={form.EPIC_District_ID}
                  onChange={handleEpicDistrictChange}
                  required
                >
                  <option value="">{labels.select[lang]}</option>
                  {districts.map((d) => (
                    <option key={d.districtId} value={d.districtId}>
                      {lang === "en"
                        ? d.districtNameEnglish
                        : d.districtNameHindi}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label>
                  {labels.block[lang]} <span className="req">*</span>
                </label>
                <select
                  name="EPIC_Block_ID"
                  value={form.EPIC_Block_ID}
                  onChange={handleChange}
                  required
                  disabled={!epicBlocks.length}
                >
                  <option value="">{labels.select[lang]}</option>
                  {epicBlocks.map((b) => (
                    <option key={b.blockId} value={b.blockId}>
                      {lang === "en" ? b.blockNameEnglish : b.blockNameHindi}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label>
                  {labels.areaType[lang]} <span className="req">*</span>
                </label>
                <select
                  name="EPIC_Urban_Rural"
                  value={form.EPIC_Urban_Rural}
                  onChange={handleChange}
                  required
                >
                  <option value="">{labels.select[lang]}</option>
                  <option value="U">{labels.urban[lang]}</option>
                  <option value="R">{labels.rural[lang]}</option>
                </select>
              </div>
            </div>
          )}
        </fieldset>

        {/* Residential Address */}
        <fieldset>
          <legend>{labels.residentialAddress[lang]}</legend>
          <div className="form-grid">
            <div className="field-group">
              <label>
                {labels.district[lang]} <span className="req">*</span>
              </label>
              <select
                value={form.homeDistrictId}
                onChange={handleDistrictChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                {districts.map((d) => (
                  <option key={d.districtId} value={d.districtId}>
                    {lang === "en"
                      ? d.districtNameEnglish
                      : d.districtNameHindi}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>
                {labels.block[lang]} <span className="req">*</span>
              </label>
              <select
                name="homeBlockId"
                value={form.homeBlockId}
                onChange={handleChange}
                required
                disabled={!blocks.length}
              >
                <option value="">{labels.select[lang]}</option>
                {blocks.map((b) => (
                  <option key={b.blockId} value={b.blockId}>
                    {lang === "en" ? b.blockNameEnglish : b.blockNameHindi}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>
                {labels.areaType[lang]} <span className="req">*</span>
              </label>
              <select
                name="urbanRural"
                value={form.urbanRural}
                onChange={handleChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                <option value="U">{labels.urban[lang]}</option>
                <option value="R">{labels.rural[lang]}</option>
              </select>
            </div>
            <div className="field-group">
              <label>
                {labels.residentialAC[lang]} <span className="req">*</span>
              </label>
              <select
                name="resAC"
                value={form.resAC}
                onChange={handleChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                {acList.map((a) => (
                  <option key={a.acNo} value={a.acNo}>
                    {a.acNo} - {lang === "en" ? a.acNameEnglish : a.acNameHindi}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Office Details */}
        <fieldset>
          <legend>{labels.officeDetails[lang]}</legend>
          <div className="form-grid">
            <div className="field-group">
              <label>
                {labels.workDistrict[lang]} <span className="req">*</span>
              </label>
              <select
                name="workDistrictId"
                value={form.workDistrictId}
                onChange={handleWorkDistrictChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                {districts.map((d) => (
                  <option key={d.districtId} value={d.districtId}>
                    {lang === "en"
                      ? d.districtNameEnglish
                      : d.districtNameHindi}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>
                {labels.workBlock[lang]} <span className="req">*</span>
              </label>
              <select
                name="workBlockId"
                value={form.workBlockId}
                onChange={handleChange}
                required
                disabled={!workBlocks.length}
              >
                <option value="">{labels.select[lang]}</option>
                {workBlocks.map((b) => (
                  <option key={b.blockId} value={b.blockId}>
                    {lang === "en" ? b.blockNameEnglish : b.blockNameHindi}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>
                {labels.workAreaType[lang]} <span className="req">*</span>
              </label>
              <select
                name="workUrbanRural"
                value={form.workUrbanRural}
                onChange={handleChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                <option value="U">{labels.urban[lang]}</option>
                <option value="R">{labels.rural[lang]}</option>
              </select>
            </div>
            <div className="field-group">
              <label>
                {labels.department[lang]} <span className="req">*</span>
              </label>
              <select
                value={form.deptId}
                onChange={handleDepartmentChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                {departments.map((d) => (
                  <option key={d.deptId} value={d.deptId}>
                    {lang === "en" ? d.deptEnglish : d.deptHindi}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>
                {labels.office[lang]} <span className="req">*</span>
              </label>
              <select
                name="office_ID"
                value={form.office_ID}
                onChange={handleChange}
                required
                disabled={!offices.length}
              >
                <option value="">{labels.select[lang]}</option>
                {offices.map((o) => (
                  <option key={o.officeId} value={o.officeId}>
                    {lang === "en" ? o.officeEnglish : o.officeHindi}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>
                {labels.designation[lang]} <span className="req">*</span>
              </label>
              <select
                name="designation_Id"
                value={form.designation_Id}
                onChange={handleDesignationChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                {designations.map((d) => (
                  <option key={d.designationId} value={d.designationId}>
                    {lang === "en" ? d.designationEnglish : d.designationHindi}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>{labels.varg[lang]}</label>
              <input
                type="text"
                value={
                  form.vargId === "I"
                    ? labels.classI[lang]
                    : form.vargId === "II"
                      ? labels.classII[lang]
                      : form.vargId === "III"
                        ? labels.classIII[lang]
                        : ""
                }
                readOnly
                className="readonly-bg"
              />
            </div>
            <div className="field-group">
              <label>
                {labels.employeeCategory[lang]} <span className="req">*</span>
              </label>
              <div className="radio-box">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="reservationCategory"
                    value="Gazetted Officer"
                    checked={form.reservationCategory === "Gazetted Officer"}
                    onChange={handleChange}
                  />
                  {labels.gazetted[lang]}
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="reservationCategory"
                    value="Non-Gazetted & Executive Staff"
                    checked={
                      form.reservationCategory ===
                      "Non-Gazetted & Executive Staff"
                    }
                    onChange={handleChange}
                  />
                  {labels.nonGazettedExecutive[lang]}
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="reservationCategory"
                    value="Non-Gazetted & Non-Executive Staff"
                    checked={
                      form.reservationCategory ===
                      "Non-Gazetted & Non-Executive Staff"
                    }
                    onChange={handleChange}
                  />
                  {labels.nonGazettedNonExecutive[lang]}
                </label>
              </div>
            </div>
            <div className="field-group">
              <label>
                {labels.empType[lang]} <span className="req">*</span>
              </label>
              <select
                name="empTypeId"
                value={form.empTypeId}
                onChange={handleChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                {empTypes.map((e) => (
                  <option key={e.empTypeId} value={e.empTypeId}>
                    {lang === "en" ? e.empTypeEnglish : e.empTypeHindi}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>
                {labels.salary[lang]} <span className="req">*</span>
              </label>
              <input
                type="number"
                name="salary"
                value={form.salary}
                onChange={handleChange}
                placeholder={labels.salaryPlaceholder[lang]}
                required
              />
            </div>
            <div className="field-group">
              <label>
                {labels.workAC[lang]} <span className="req">*</span>
              </label>
              <select
                name="workAC"
                value={form.workAC}
                onChange={handleChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                {acList.map((a) => (
                  <option key={a.acNo} value={a.acNo}>
                    {a.acNo} - {lang === "en" ? a.acNameEnglish : a.acNameHindi}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Bank Details */}
        <fieldset>
          <legend>{labels.bankDetails[lang]}</legend>
          <div className="form-grid">
            <div className="field-group">
              <label>
                {labels.bank[lang]} <span className="req">*</span>
              </label>
              <select
                name="bankCode"
                value={form.bankCode}
                onChange={handleBankChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                {banks.map((b) => (
                  <option key={b.bankCode} value={b.bankCode}>
                    {lang === "en" ? b.bankNameEnglish : b.bankNameHindi}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>
                {labels.branch[lang]} <span className="req">*</span>
              </label>
              <select
                value={form.branchTemp || ""}
                onChange={(e) => {
                  const branch = branches.find(
                    (b) => b.ifsCode === e.target.value,
                  );
                  setForm({
                    ...form,
                    branchTemp: e.target.value,
                    ifsCode: branch?.ifsCode || "",
                  });
                }}
                required
                disabled={!branches.length}
              >
                <option value="">{labels.select[lang]}</option>
                {branches.map((br) => (
                  <option key={br.ifsCode} value={br.ifsCode}>
                    {lang === "en" ? br.branchNameEnglish : br.branchNameHindi}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>{labels.ifsc[lang]}</label>
              <input
                name="ifsCode"
                value={form.ifsCode}
                readOnly
                className="readonly-bg"
              />
            </div>
            <div className="field-group">
              <label>
                {labels.accountNo[lang]} <span className="req">*</span>
              </label>
              <input
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </fieldset>

        {/* Polling Station Details */}
        <fieldset>
          <legend>{labels.pollingStationDetails[lang]}</legend>
          <div className="form-grid">
            <div className="field-group">
              <label>
                {labels.assemblyNo[lang]} <span className="req">*</span>
              </label>
              <select
                name="AC_No"
                value={form.AC_No}
                onChange={handleChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                {acList.map((a) => (
                  <option key={a.acNo} value={a.acNo}>
                    {a.acNo}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>
                {labels.partNo[lang]} <span className="req">*</span>
              </label>
              <input
                type="number"
                name="Part_No"
                value={form.Part_No}
                onChange={handleChange}
                placeholder={labels.partNoPlaceholder[lang]}
                required
              />
            </div>
            <div className="field-group">
              <label>
                {labels.serialNo[lang]} <span className="req">*</span>
              </label>
              <input
                type="number"
                name="Serial_No"
                value={form.Serial_No}
                onChange={handleChange}
                placeholder={labels.serialNoPlaceholder[lang]}
                required
              />
            </div>
          </div>
        </fieldset>

        {/* Experience */}
        <fieldset>
          <legend>{labels.electionExperience[lang]}</legend>
          <div className="form-grid">
            <div className="field-group">
              <label>
                {labels.pollingExp[lang]} <span className="req">*</span>
              </label>
              <select
                name="experiencePolling"
                value={form.experiencePolling}
                onChange={handleChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                <option value="Y">{labels.yes[lang]}</option>
                <option value="N">{labels.no[lang]}</option>
              </select>
            </div>
            <div className="field-group">
              <label>
                {labels.countingExp[lang]} <span className="req">*</span>
              </label>
              <select
                name="experienceCounting"
                value={form.experienceCounting}
                onChange={handleChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                <option value="Y">{labels.yes[lang]}</option>
                <option value="N">{labels.no[lang]}</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Field Duty */}
        <fieldset>
          <legend>{labels.fieldDutyDetails[lang]}</legend>
          <div className="form-grid">
            <div className="field-group">
              <label>
                {labels.extraDutyField[lang]} <span className="req">*</span>
              </label>
              <select
                name="isFieldDuty"
                value={form.isFieldDuty}
                onChange={handleChange}
                required
              >
                <option value="">{labels.select[lang]}</option>
                <option value="Y">{labels.yes[lang]}</option>
                <option value="N">{labels.no[lang]}</option>
              </select>
            </div>
            {form.isFieldDuty === "Y" && (
              <>
                <div className="field-group">
                  <label>
                    {labels.assembly[lang]} <span className="req">*</span>
                  </label>
                  <select
                    name="fieldAC"
                    value={form.fieldAC}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{labels.selectAssembly[lang]}</option>
                    {acList.map((a) => (
                      <option key={a.acNo} value={a.acNo}>
                        {a.acNo} -{" "}
                        {lang === "en" ? a.acNameEnglish : a.acNameHindi}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field-group">
                  <label>
                    {labels.districtFieldDuty[lang]}{" "}
                    <span className="req">*</span>
                  </label>
                  <select
                    name="fieldDistrict"
                    value={form.fieldDistrict}
                    onChange={handleFieldDistrictChange}
                    required
                  >
                    <option value="">
                      {labels.selectDistrictFieldDuty[lang]}
                    </option>
                    {districts.map((d) => (
                      <option key={d.districtId} value={d.districtId}>
                        {lang === "en"
                          ? d.districtNameEnglish
                          : d.districtNameHindi}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field-group">
                  <label>
                    {labels.blockFieldDuty[lang]} <span className="req">*</span>
                  </label>
                  <select
                    name="fieldBlock"
                    value={form.fieldBlock}
                    onChange={handleChange}
                    required
                    disabled={!fieldBlocks.length}
                  >
                    <option value="">
                      {labels.selectBlockFieldDuty[lang]}
                    </option>
                    {fieldBlocks.map((b) => (
                      <option key={b.blockId} value={b.blockId}>
                        {lang === "en" ? b.blockNameEnglish : b.blockNameHindi}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </fieldset>

        <div className="button-container">
          <button type="submit" className="submit-btn">
            {editEmployee
              ? lang === "en"
                ? "Update"
                : "अपडेट करें"
              : labels.submit[lang]}
          </button>
          <button type="button" className="cancel-btn" onClick={handleClear}>
            {labels.cancel[lang]}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
