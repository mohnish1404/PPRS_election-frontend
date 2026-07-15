import { useState, useEffect } from 'react';
import api from '../services/api';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import ExemptDutyModal from './ExemptDutyModal'
import ExemptionHistoryModal from './ExemptionHistoryModal'

const DutyReport = () => {
  const [duties, setDuties] = useState([]);
  const [filteredDuties, setFilteredDuties] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [acNoFilter, setAcNoFilter] = useState('');
  const [acList, setAcList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRemovalModal, setShowRemovalModal] = useState(false);
  const [showExemptModal, setShowExemptModal] = useState(false)
const [showExemptionHistoryModal, setShowExemptionHistoryModal] = useState(false)
  const [removalRemark, setRemovalRemark] = useState('');
  const [recentRemovals, setRecentRemovals] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  

  useEffect(() => {
    fetchDuties();
    fetchACList();
  }, []);

  useEffect(() => {
    if (acNoFilter) {
      setFilteredDuties(duties.filter(d => d.aC_No === parseInt(acNoFilter)));
    } else {
      setFilteredDuties(duties);
    }
  }, [acNoFilter, duties]);

  const fetchACList = async () => {
    try {
      const res = await api.get('/masters/ac-list');
      setAcList(res.data);
    } catch (err) {
      console.error('Failed to load AC list', err);
    }
  };

  const fetchDuties = async () => {
    setLoading(true);
    try {
   const res = await api.get('/Admin/assigned-duties');
      setDuties(res.data);
      setFilteredDuties(res.data);
    } catch (err) {
      console.error('Failed to fetch duties', err);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredDuties.map(d => d.memberId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (memberId) => {
    if (selectedIds.includes(memberId)) {
      setSelectedIds(selectedIds.filter(id => id !== memberId));
    } else {
      setSelectedIds([...selectedIds, memberId]);
    }
  };

  const handleRemoveDuty = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one duty to remove.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${selectedIds.length} duty assignment(s)?`)) return;

    try {
      const res = await api.post('/Admin/remove-duty', {
        memberIds: selectedIds,
        remarks: removalRemark || 'Removed by admin'
      });
      alert(res.data.message);
      setSelectedIds([]);
      setRemovalRemark('');
      setShowRemovalModal(false);
      fetchDuties();
    } catch (err) {
      alert('Failed to remove duty: ' + (err.response?.data || err.message));
    }
  };

  const fetchRecentRemovals = async () => {
    try {
      const res = await api.get('/Admin/recent-removals', { params: { days: 30 } });
      setRecentRemovals(res.data);
      setShowHistoryModal(true);
    } catch (err) {
      alert('Failed to fetch removal history');
    }
  };

  const exportToExcel = async () => {
    if (filteredDuties.length === 0) {
      alert('No data to export.');
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assigned Duties');
    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = 'CURRENT DUTY ASSIGNMENTS';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    const headers = ['S.No', 'Employee Name', 'Emp Code', 'AC No', 'Part No', 'Duty Post', 'Assigned Date'];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B5394' } };
    });

    filteredDuties.forEach((d, idx) => {
      worksheet.addRow([
        idx + 1,
        d.empName,
        d.empCode,
        d.aC_No,
        d.part_No,
        d.dutyPost,
        new Date(d.dutyDateTime).toLocaleString()
      ]);
    });
    worksheet.columns.forEach(col => col.width = 20);
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Assigned_Duties.xlsx');
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#1e3a8a' }}>🗳️ Randomization Report (Current Duties)</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select value={acNoFilter} onChange={(e) => setAcNoFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc' }}>
            <option value="">All ACs</option>
            {acList.map(ac => (
              <option key={ac.acNo} value={ac.acNo}>{ac.acNo} - {ac.acNameEnglish}</option>
            ))}
          </select>
          <button onClick={exportToExcel} style={{ background: '#28a745', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>📊 Export Excel</button>
          <button onClick={fetchRecentRemovals} style={{ background: '#17a2b8', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>📜 Recent Removals</button>
<button onClick={() => setShowExemptModal(true)} disabled={selectedIds.length === 0} style={{ background: selectedIds.length === 0 ? '#94a3b8' : '#7c3aed', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer' }}>🛡️ Exempt Duty ({selectedIds.length})</button>
<button onClick={() => setShowRemovalModal(true)} disabled={selectedIds.length === 0} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer' }}>🗑️ Remove Randomization ({selectedIds.length})</button>
<button onClick={() => setShowExemptionHistoryModal(true)} style={{ background: 'white', color: '#1e3a8a', border: '1.5px solid #1e3a8a', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>📋 Exemption History</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading duties...</div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#2c3e50', color: 'white' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'center', width: '40px' }}>
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredDuties.length && filteredDuties.length > 0} />
                </th>
                <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Employee Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Emp Code</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>AC No</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Part No</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Duty Post</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Assigned Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredDuties.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                  No duty assignments found. <button onClick={fetchDuties} style={{ marginLeft: '10px', padding: '4px 12px', cursor: 'pointer' }}>Refresh</button>
                </td></tr>
              ) : (
                filteredDuties.map((duty, idx) => (
                  <tr key={duty.memberId} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <input type="checkbox" checked={selectedIds.includes(duty.memberId)} onChange={() => handleSelectRow(duty.memberId)} />
                    </td>
                    <td style={{ padding: '10px' }}>{idx + 1}</td>
                    <td style={{ padding: '10px' }}>{duty.empName} {duty.empName_En ? `(${duty.empName_En})` : ''}</td>
                    <td style={{ padding: '10px' }}>{duty.empCode}</td>
                    <td style={{ padding: '10px' }}>{duty.aC_No}</td>
                    <td style={{ padding: '10px' }}>{duty.part_No}</td>
                    <td style={{ padding: '10px' }}>{duty.dutyPost}</td>
                    <td style={{ padding: '10px' }}>{new Date(duty.dutyDateTime).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div style={{ padding: '12px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <strong>Total Assigned: {filteredDuties.length}</strong>
          </div>
        </div>
      )}

      {/* Removal Modal */}
      {showRemovalModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '400px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#dc3545' }}>Confirm Duty Removal</h3>
            <p>Are you sure you want to remove <strong>{selectedIds.length}</strong> assigned duty/ies?</p>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Remark (optional):</label>
            <textarea value={removalRemark} onChange={(e) => setRemovalRemark(e.target.value)} rows="3" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '20px' }} placeholder="Reason for removal..."></textarea>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRemovalModal(false)} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleRemoveDuty} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Confirm Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Removals Modal */}
      {showHistoryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflow: 'auto' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '80%', maxWidth: '1000px', maxHeight: '80%', overflow: 'auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1e3a8a' }}>📋 Recently Removed Duties (Last 30 days)</h3>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            {recentRemovals.length === 0 ? (
              <p>No recent removals.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#2c3e50', color: 'white' }}>
                  <tr>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Employee</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>AC No</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Part No</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Removed At</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRemovals.map(rem => (
                    <tr key={rem.id}>
                      <td style={{ padding: '10px' }}>{rem.employeeName}</td>
                      <td style={{ padding: '10px' }}>{rem.aC_No ?? '-'}</td>
                      <td style={{ padding: '10px' }}>{rem.part_No ?? '-'}</td>
                      <td style={{ padding: '10px' }}>{new Date(rem.removedAt).toLocaleString()}</td>
                      <td style={{ padding: '10px' }}>{rem.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={() => setShowHistoryModal(false)} style={{ padding: '8px 20px', background: '#0b5394', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

   {showExemptModal && (
  <ExemptDutyModal
    selectedMembers={selectedIds}
    duties={filteredDuties}
    onClose={() => setShowExemptModal(false)}
    onSuccess={() => { fetchDuties(); setSelectedIds([]) }}
  />
)}

{showExemptionHistoryModal && (
  <ExemptionHistoryModal
    onClose={() => setShowExemptionHistoryModal(false)}
  />
)}

    </div>
  );
};

export default DutyReport;