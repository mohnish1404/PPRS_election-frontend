import { useState, useEffect, useRef } from 'react'
import API from '../services/api'

function ExemptionHistoryModal({ onClose }) {
  const [exemptions, setExemptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(null)
  const [search, setSearch] = useState('')
const [statusFilter, setStatusFilter] = useState('All')
const [currentPage, setCurrentPage] = useState(1)
const [sortOrder, setSortOrder] = useState('newest')
const pageSize = 5

  useEffect(() => { fetchExemptions() }, [])

  const searchRef = useRef(null)

useEffect(() => {
  const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
  window.addEventListener('keydown', handleEsc)
  return () => window.removeEventListener('keydown', handleEsc)
}, [])

useEffect(() => {
  if (!loading) setTimeout(() => searchRef.current?.focus(), 100)
}, [loading])

  const fetchExemptions = async () => {
    try {
      setLoading(true)
      const res = await API.get('/Admin/exemptions')
      setExemptions(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = exemptions
  .filter(ex => {
    const matchSearch = ex.empCode?.toString().includes(search) || ex.reasonText?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || ex.status === statusFilter
    return matchSearch && matchStatus
  })
  .sort((a, b) => sortOrder === 'newest'
    ? new Date(b.exemptionDateTime) - new Date(a.exemptionDateTime)
    : new Date(a.exemptionDateTime) - new Date(b.exemptionDateTime)
  )

const totalPages = Math.ceil(filtered.length / pageSize)
const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleRestore = async (id) => {
    if (!window.confirm('Restore this exemption? Employee will return to available pool.')) return
    try {
      setRestoring(id)
      await API.post(`/Admin/exemptions/${id}/restore`)
      alert('✅ Exemption restored successfully!')
      fetchExemptions()
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Failed to restore'))
    } finally {
      setRestoring(null)
    }
  }
  return (
    <>
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '95%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
        
        {/* Top bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #f97316, #3b82f6, #06b6d4)', borderRadius: '20px 20px 0 0' }} />

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px', fontWeight: 800 }}>📋 Exemption History</h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
  {filtered.length === exemptions.length
    ? `${exemptions.length} total exemption record(s)`
    : `${filtered.length} of ${exemptions.length} shown`}
</p>
          </div>
          <button onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            ✕
          </button>
        </div>

        {/* Search + Filter + Sort */}
<div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'nowrap' }}>
  <input
    ref={searchRef}
    type="text"
    placeholder="🔍 Search by Emp Code or Reason..."
    value={search}
    onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
    style={{ flex: 1, minWidth: '200px', padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', background: '#f8fafc' }}
  />
  <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}
    style={{ padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', background: '#f8fafc', width: 'auto' }}>
    <option value="All">All Status</option>
    <option value="Active">Active</option>
    <option value="Restored">Restored</option>
  </select>

  {/* Sort toggle button (replaces Newest/Oldest dropdown) */}
  <button
    type="button"
    onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
    style={{
      padding: '8px 14px',
      borderRadius: '10px',
      border: '1.5px solid #e2e8f0',
      background: '#f8fafc',
      fontSize: '13px',
      fontWeight: 600,
      color: '#374151',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      whiteSpace: 'nowrap'
    }}
    title="Click to toggle sort order"
  >
    📅 {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
    <span style={{ fontSize: '14px' }}>{sortOrder === 'newest' ? '↓' : '↑'}</span>
  </button>
</div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '15px' }}>
              ⏳ Loading exemptions...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <p style={{ fontWeight: 600, fontSize: '15px' }}>No exemption records found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {paginated.map(ex => (
                <div key={ex.exemptionId} style={{
                  border: `1px solid ${ex.status === 'Active' ? '#bbf7d0' : '#e2e8f0'}`,
                  borderRadius: '14px',
                  padding: '16px 20px',
                  background: ex.status === 'Active' ? '#f0fdf4' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  {/* Status Badge */}
                  <div style={{ flexShrink: 0 }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                      background: ex.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                      color: ex.status === 'Active' ? '#16a34a' : '#6b7280'
                    }}>
                      {ex.status === 'Active' ? '🟢 Active' : '⚪ Restored'}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                      {[
                        { label: 'Emp Code', value: ex.empCode },
                        { label: 'AC / Part', value: `${ex.aC_No} / ${ex.part_No}` },
                        { label: 'Duty Post', value: ex.dutyPost || '—' },
                        { label: 'Exempted By', value: ex.exemptedBy },
                        { label: 'Date', value: new Date(ex.exemptionDateTime + 'Z').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
                      ].map((item, i) => (
                        <div key={i}>
                          <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 600, color: '#374151' }}>{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '8px' }}>
  <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</p>
  <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 600, color: '#374151' }}>{ex.reasonText}</p>
</div>

                    {ex.status === 'Restored' && ex.restoredDateTime && (
                      <div style={{ marginTop: '8px', padding: '6px 10px', background: '#f3f4f6', borderRadius: '8px', fontSize: '12px', color: '#6b7280' }}>
                        ↩ Restored by <strong>{ex.restoredBy}</strong> on {new Date(ex.restoredDateTime + 'Z').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                    {ex.documentPath && (
                      <a href={`http://localhost:5103${ex.documentPath}`} target="_blank" rel="noreferrer"
                        style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                        📄 Document
                      </a>
                    )}
                    {ex.status === 'Active' && (
                      <button onClick={() => handleRestore(ex.exemptionId)} disabled={restoring === ex.exemptionId}
                        style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: restoring === ex.exemptionId ? '#94a3b8' : '#f97316', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                        {restoring === ex.exemptionId ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                            Restoring...
                          </span>
                        ) : '↩ Restore'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#94a3b8' : '#1e3a8a', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px' }}>
              ← Prev
            </button>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === totalPages || totalPages === 0 ? '#f8fafc' : 'white', color: currentPage === totalPages || totalPages === 0 ? '#94a3b8' : '#1e3a8a', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px' }}>
              Next →
            </button>
          </div>
          <button onClick={onClose}
            style={{ padding: '10px 24px', borderRadius: '10px', border: '2px solid #1e3a8a', background: 'white', color: '#1e3a8a', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
    </>
  )
}

export default ExemptionHistoryModal