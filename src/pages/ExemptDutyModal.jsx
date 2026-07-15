import { useState, useEffect, useRef } from 'react'
import API from '../services/api'

function ExemptDutyModal({ selectedMembers, duties, onClose, onSuccess }) {
  const [reasons, setReasons] = useState([])
  const [reasonId, setReasonId] = useState('')
  const [remarks, setRemarks] = useState('')
  const [document, setDocument] = useState(null)
  const [docError, setDocError] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
const [toast, setToast] = useState(null)
const [showConfirm, setShowConfirm] = useState(false)
const [charCount, setCharCount] = useState(0)
const document2Ref = useRef(null)

  useEffect(() => {
    API.get('/Admin/exemption-reasons').then(res => setReasons(res.data))
  }, [])

  const showToast = (message, type = 'success') => {
  setToast({ message, type })
  setTimeout(() => setToast(null), 3500)
}

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowed = ['.pdf', '.doc', '.docx']
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!allowed.includes(ext)) { setDocError('Only PDF, DOC, DOCX allowed'); return }
    if (file.size > 5 * 1024 * 1024) { setDocError('File must be under 5MB'); return }
    setDocError('')
    setDocument(file)
  }

  const handleSubmit = async () => {
  if (!reasonId) { showToast('Please select a reason', 'error'); return }
  if (!document) { setDocError('Supporting document is mandatory'); return }
  if (selectedMembers.length > 1) { setShowConfirm(true); return }
  await processExemptions()
}

const processExemptions = async () => {
  setShowConfirm(false)
  setLoading(true)
  setProgress(0)

  const results = await Promise.allSettled(
    selectedMembers.map(async (memberId, idx) => {
      const formData = new FormData()
      formData.append('memberId', memberId)
      formData.append('reasonId', reasonId)
      formData.append('remarks', remarks)
      formData.append('document', document)
      const res = await API.post('/Admin/exemptions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProgress(idx + 1)
      return res
    })
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected')

  if (failed.length === 0) {
    showToast(`✅ ${succeeded} duty(s) exempted successfully!`)
    onSuccess()
    onClose()
  } else {
    showToast(`⚠️ ${succeeded} succeeded, ${failed.length} failed. Check console.`, 'error')
    failed.forEach(f => console.error(f.reason))
    setLoading(false)
  }
}

  const selectedDuties = duties.filter(d => selectedMembers.includes(d.memberId))

  return (
    <div>
    {/* Toast */}
    {toast && (
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, padding: '12px 20px', borderRadius: '12px', background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4', border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`, color: toast.type === 'error' ? '#dc2626' : '#16a34a', fontWeight: 600, fontSize: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '350px' }}>
        {toast.message}
      </div>
    )}

    {/* Confirm Modal */}
    {showConfirm && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
        <div style={{ background: 'white', borderRadius: '16px', width: '380px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #f97316, #3b82f6, #06b6d4)' }} />
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px', color: '#1e3a8a', fontWeight: 800 }}>Confirm Bulk Exemption</h3>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#64748b' }}>
              You are about to exempt <strong>{selectedMembers.length} employees</strong> with reason:
            </p>
            <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', fontWeight: 700, color: '#1d4ed8' }}>
              {reasons.find(r => r.reasonId == reasonId)?.reasonText || 'Selected Reason'}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={processExemptions}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                ✅ Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', border: '2px solid #1e3a8a' }}>
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #f97316, #3b82f6, #06b6d4)' }} />

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px', fontWeight: 800 }}>🛡️ Exempt Duty</h3>
            <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>

          {/* Selected Employees */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px', marginBottom: '16px', maxHeight: '130px', overflowY: 'auto' }}>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#1d4ed8' }}>SELECTED EMPLOYEES ({selectedDuties.length})</p>
            {selectedDuties.map(d => (
              <div key={d.memberId} style={{ fontSize: '13px', color: '#374151', padding: '4px 0', borderBottom: '1px solid #dbeafe' }}>
                <strong>{d.empName}</strong> — {d.dutyPost} (Part {d.part_No})
              </div>
            ))}
          </div>

          {/* Reason */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
              Exemption Reason <span style={{ color: 'red' }}>*</span>
            </label>
            <select value={reasonId} onChange={e => setReasonId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}>
              <option value="">-- Select Reason --</option>
              {reasons.map(r => (
                <option key={r.reasonId} value={r.reasonId}>{r.reasonText}</option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
              Remarks (Optional)
            </label>
            <textarea value={remarks} onChange={e => { setRemarks(e.target.value); setCharCount(e.target.value.length) }}
              rows={3} placeholder="Additional notes..." maxLength={500}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'inherit', background: '#f8fafc', boxSizing: 'border-box' }} />
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: charCount > 450 ? '#ef4444' : '#94a3b8', textAlign: 'right' }}>{charCount}/500</p>
          </div>

          {/* Document Upload */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
              Supporting Document (PDF/DOC, Max 5MB) <span style={{ color: 'red' }}>*</span>
            </label>
            <div style={{ border: `1.5px dashed ${docError ? '#ef4444' : '#bfdbfe'}`, borderRadius: '12px', padding: '16px', background: '#f8fafc', textAlign: 'center', cursor: 'pointer' }}
              onClick={() => document2Ref.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile({ target: { files: [f] } }) }}>
              <input ref={document2Ref} type="file" accept=".pdf,.doc,.docx" onChange={handleFile} style={{ display: 'none' }} />
              {document ? (
                <p style={{ margin: 0, fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>✅ {document.name}</p>
              ) : (
                <>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#64748b' }}>📎 Drag & drop or <span style={{ color: '#1d4ed8', fontWeight: 700 }}>Browse</span></p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>PDF, DOC, DOCX — Max 5MB</p>
                </>
              )}
            </div>
            {selectedMembers.length > 1 && (
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#f97316' }}>⚠️ Note: This document will be attached to all selected exemptions.</p>
            )}
            {docError && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>⚠️ {docError}</p>}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading || !reasonId || !document}
              style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', background: loading || !reasonId || !document ? '#94a3b8' : '#1e3a8a', color: 'white', fontWeight: 700, cursor: loading || !reasonId || !document ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
              {loading ? `Processing ${progress} of ${selectedMembers.length}...` : '🛡️ Grant Exemption'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default ExemptDutyModal