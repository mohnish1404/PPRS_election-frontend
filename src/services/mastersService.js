import api from "../services/api";

// District & Block
export const getDistricts = () => api.get("/masters/districts");
export const getBlocksByDistrict = (districtId) =>
  api.get(`/masters/blocks/${districtId}`);

// Department & Office
export const getDepartments = () => api.get("/masters/departments");
export const getOfficesByDepartment = (deptId) =>
  api.get(`/masters/offices/by-department/${deptId}`);

//pwd-type
export const getPWDTypes = () => api.get("/masters/pwd-types");

// Designation & Emp Type
export const getDesignations = () => api.get("/masters/designations");
export const getOffices = () => api.get("/masters/offices");
export const getEmpTypes = () => api.get("/masters/emp-types");
export const getVargs = () => api.get("/masters/vargs-from-designation");
// AC
export const getACs = () => api.get("/masters/ac-list");

// Bank & Branch
export const getBanks = () => api.get("/masters/banks");
export const getBranchesByBank = (bankCode) =>
  api.get(`/masters/branches/by-bank/${bankCode}`);
