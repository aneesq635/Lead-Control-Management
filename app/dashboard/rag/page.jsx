'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, FileText, Upload, Database, RefreshCw,
  Eye, Download, Loader2, CheckCircle, AlertCircle, X, File, Save, RotateCcw, Search
} from 'lucide-react';
import { useAuth } from '@/app/component/AuthContext';
import { useSelector } from 'react-redux';

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API || 'http://localhost:5000';
const PROPERTY_TYPES = ['House', 'Plot', 'Shop', 'Apartment', 'Commercial', 'Farmhouse'];

// ★ Canonical field list
const INVENTORY_DEFAULTS = {
  property_type: 'House',
  area: '',
  size: '',
  price: '',
  description: '',
  owner_name: '',
  owner_phone: '',
};

const emptyRow = () => ({ id: crypto.randomUUID(), ...INVENTORY_DEFAULTS });

// ─── Toast ──────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  const colors = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-blue-500' };
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${colors[type]} animate-slide-up`}>
      {type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
      {type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
      {type === 'info' && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}
      <span>{msg}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

// ─── Auto-Regen / Confirm Modal ──────────────────────────────────
function AutoRegenModal({ hasInventory, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slide-up border border-gray-200 dark:border-white/5">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Inventory PDF?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">This will affect the AI knowledge base</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {hasInventory ? (
            <>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Your inventory data is still saved in the database.
                <br />
                <span className="font-semibold text-gray-900 dark:text-white">The PDF will be automatically regenerated</span> from your existing inventory so the AI agent always has an up-to-date knowledge base.
              </p>
              <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl px-4 py-3">
                <RotateCcw className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  A fresh PDF will be generated from your saved inventory and immediately available to the AI agent.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                You have <span className="font-semibold text-gray-900 dark:text-white">no inventory rows saved</span> in the database.
                <br />
                Deleting this PDF will leave the AI knowledge base empty until you add inventory and generate a new PDF.
              </p>
              <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                  Customers querying the AI agent will receive no property information until you add inventory and regenerate the PDF.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-60
              ${hasInventory ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{hasInventory ? 'Regenerating…' : 'Deleting…'}</>
              : hasInventory ? <><RotateCcw className="w-3.5 h-3.5" />Delete & Auto-Regenerate</> : <><Trash2 className="w-3.5 h-3.5" />Delete Anyway</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function RAGPage() {
  const { user } = useAuth();
  const selectedWorkspace = useSelector((state) => state.main.selectedWorkspace);
  const workspaceId = selectedWorkspace?.workspace_id || 'default';

  // ─── Toast ────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  // ─── Inventory table ──────────────────────────────────────────
  const [rows, setRows] = useState([emptyRow()]);
  const [inventoryLoading, setInvLoading] = useState(false);
  const [isDirty, setDirty] = useState(false);

  const addRow = () => { setRows(r => [...r, emptyRow()]); setDirty(true); };
  const deleteRow = (id) => { setRows(r => r.filter(x => x.id !== id)); setDirty(true); };
  const updateCell = (id, field, value) => {
    setRows(r => r.map(x => x.id === id ? { ...x, [field]: value } : x));
    setDirty(true);
  };

  // ─── Load inventory from MongoDB ──────────────────────────────
  const loadInventory = useCallback(async () => {
    setInvLoading(true);
    try {
      const res = await fetch(`${PYTHON_API}/api/rag/inventory?workspace_id=${workspaceId}`);
      const data = await res.json();
      if (data.success && data.inventory?.length > 0) {
        setRows(data.inventory.map(row => ({
          id: crypto.randomUUID(),
          ...INVENTORY_DEFAULTS,
          ...row,
        })));
        setDirty(false);
      }
    } catch { /* server may not be running */ }
    finally { setInvLoading(false); }
  }, [workspaceId]);

  // ─── PDF state ────────────────────────────────────────────────
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfTs, setPdfTs] = useState(() => Date.now());

  const refreshPdfTs = () => setPdfTs(Date.now());

  // ─── Load existing PDF doc metadata on mount ──────────────────
  const loadExistingPdf = useCallback(async () => {
    try {
      const res = await fetch(`${PYTHON_API}/api/rag/documents?workspace_id=${workspaceId}`);
      const data = await res.json();
      if (data.success) {
        const invDoc = data.documents.find(d => d.type === 'inventory');
        if (invDoc) { setPdfDoc(invDoc); setShowPreview(true); refreshPdfTs(); }
      }
    } catch { }
  }, [workspaceId]);

  useEffect(() => {
    loadInventory();
    loadExistingPdf();
    fetchDocuments();
  }, [workspaceId]); // eslint-disable-line

  // ─── Generate / Update PDF ────────────────────────────────────
  const handleGeneratePDF = async (customRows) => {
    const sourceRows = customRows ?? rows;
    const validRows = sourceRows.filter(r => r.area || r.size || r.price || r.owner_name || r.owner_phone);
    if (!validRows.length) { showToast('Add at least one row with data', 'error'); return; }
    setPdfLoading(true);
    try {
      const res = await fetch(`${PYTHON_API}/api/rag/pdf/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId,
          inventory: validRows.map(({ id, ...rest }) => ({ ...INVENTORY_DEFAULTS, ...rest })),
          user_id: user?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPdfDoc(data.document);
        setShowPreview(true);
        setDirty(false);
        refreshPdfTs();
        showToast('PDF generated & knowledge ingested ✓', 'success');
        await fetchDocuments();
      } else {
        showToast(data.error || 'Failed to generate PDF', 'error');
      }
    } catch {
      showToast('Cannot reach Python server', 'error');
    } finally {
      setPdfLoading(false);
    }
  };

  // ─── Delete inventory row (sold-out) ──────────────────────────
  const handleDeleteInventoryRow = (_idx, rowId) => {
    setRows(r => r.filter(x => x.id !== rowId));
    setDirty(true);
    showToast('Row removed — click "Save & Generate PDF" to apply changes', 'info');
  };

  // ─── Upload ───────────────────────────────────────────────────
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowed.includes(file.type)) { showToast('Only PDF or DOC files allowed', 'error'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('workspace_id', workspaceId);
    fd.append('user_id', user?.id || '');
    try {
      const res = await fetch(`${PYTHON_API}/api/rag/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        showToast('File uploaded & ingested ✓', 'success');
        await fetchDocuments();
      } else {
        showToast(data.error || 'Upload failed', 'error');
      }
    } catch {
      showToast('Cannot reach Python server', 'error');
    } finally {
      setUploading(false);
    }
  };

  const onFileDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  // ─── Documents list ───────────────────────────────────────────
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const fetchDocuments = async () => {
    setDocsLoading(true);
    try {
      const res = await fetch(`${PYTHON_API}/api/rag/documents?workspace_id=${workspaceId}`);
      const data = await res.json();
      if (data.success) setDocuments(data.documents);
    } catch { }
    finally { setDocsLoading(false); }
  };

  // ─── Delete document — smart handling for inventory PDF ───────
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const initiateDeleteDocument = async (doc) => {
    if (doc.type !== 'inventory') {
      try {
        await fetch(`${PYTHON_API}/api/rag/documents/${doc.id}`, { method: 'DELETE' });
        setDocuments(d => d.filter(x => x.id !== doc.id));
        showToast('Document removed', 'success');
      } catch {
        showToast('Failed to delete document', 'error');
      }
      return;
    }

    let hasInventory = false;
    try {
      const res = await fetch(`${PYTHON_API}/api/rag/inventory?workspace_id=${workspaceId}`);
      const data = await res.json();
      hasInventory = data.success && data.inventory?.length > 0;
    } catch { }

    setDeleteModal({ doc, hasInventory });
  };

  const confirmDeleteInventoryPdf = async () => {
    const { doc, hasInventory } = deleteModal;
    setDeleteLoading(true);
    try {
      await fetch(`${PYTHON_API}/api/rag/documents/${doc.id}`, { method: 'DELETE' });
      setDocuments(d => d.filter(x => x.id !== doc.id));

      if (hasInventory) {
        showToast('Regenerating PDF from saved inventory…', 'info');
        const invRes = await fetch(`${PYTHON_API}/api/rag/inventory?workspace_id=${workspaceId}`);
        const invData = await invRes.json();
        const invRows = (invData.inventory || []).map(row => ({ id: crypto.randomUUID(), ...row }));

        if (invRows.length > 0) {
          const genRes = await fetch(`${PYTHON_API}/api/rag/pdf/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workspace_id: workspaceId,
              inventory: invRows.map(({ id, ...rest }) => rest),
              user_id: user?.id,
            }),
          });
          const genData = await genRes.json();
          if (genData.success) {
            setPdfDoc(genData.document);
            setShowPreview(true);
            refreshPdfTs();
            showToast('PDF auto-regenerated from inventory ✓', 'success');
          } else {
            showToast('Auto-regeneration failed: ' + (genData.error || ''), 'error');
          }
        }
        await fetchDocuments();
      } else {
        setPdfDoc(null);
        setShowPreview(false);
        showToast('PDF deleted. Add inventory and generate a new PDF.', 'info');
        await fetchDocuments();
      }
    } catch {
      showToast('Operation failed', 'error');
    } finally {
      setDeleteLoading(false);
      setDeleteModal(null);
    }
  };

  // ─── Columns ──────────────────────────────────────────────────
  const columns = [
    { key: 'property_type', label: 'Type',        width: 'w-32' },
    { key: 'area',          label: 'Area',         width: 'w-36' },
    { key: 'size',          label: 'Size',         width: 'w-28' },
    { key: 'price',         label: 'Price (PKR)',  width: 'w-36' },
    { key: 'description',   label: 'Description',  width: 'flex-1' },
    { key: 'owner_name',    label: 'Owner Name',   width: 'w-36' },
    { key: 'owner_phone',   label: 'Owner Phone',  width: 'w-36' },
  ];

  // ─── Search & Filter ──────────────────────────────────────────
  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [showFilters,  setShowFilters]  = useState(false);

  const parsePriceToLakhs = (str) => {
    if (!str) return null;
    const s = str.toLowerCase().replace(/,/g, '').trim();
    const num = parseFloat(s);
    if (isNaN(num)) return null;
    if (s.includes('cr') || s.includes('crore')) return num * 100;
    if (s.includes('l')  || s.includes('lakh'))  return num;
    if (num >= 100000) return num / 100000;
    return num;
  };

  const FILTER_PRESETS = [
    { id: 'house',       label: 'Houses Only',   test: r => r.property_type?.toLowerCase() === 'house' },
    { id: 'plot',        label: 'Plots Only',    test: r => r.property_type?.toLowerCase() === 'plot' },
    { id: 'shop',        label: 'Shops Only',    test: r => r.property_type?.toLowerCase() === 'shop' },
    { id: 'apartment',   label: 'Apartments',    test: r => r.property_type?.toLowerCase() === 'apartment' },
    { id: '5marla',      label: '5 Marla',       test: r => /\b5\b.*marla|marla.*\b5\b/i.test(r.size) },
    { id: '10marla',     label: '10 Marla',      test: r => /\b10\b.*marla|marla.*\b10\b/i.test(r.size) },
    { id: '1kanal',      label: '1 Kanal',       test: r => /\b1\b.*kanal|kanal.*\b1\b/i.test(r.size) },
    { id: 'under1cr',    label: 'Under 1 Crore', test: r => { const p = parsePriceToLakhs(r.price); return p !== null && p < 100; } },
    { id: 'under2cr',    label: 'Under 2 Crore', test: r => { const p = parsePriceToLakhs(r.price); return p !== null && p < 200; } },
    { id: '2to5cr',      label: '2–5 Crore',     test: r => { const p = parsePriceToLakhs(r.price); return p !== null && p >= 200 && p <= 500; } },
  ];

  const FILTER_GROUPS = [
    { label: 'Property Type', ids: ['house', 'plot', 'shop', 'apartment'] },
    { label: 'Size',          ids: ['5marla', '10marla', '1kanal'] },
    { label: 'Price Range',   ids: ['under1cr', 'under2cr', '2to5cr'] },
  ];

  const visibleRows = rows.filter(row => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const hit = Object.values(row).some(v => String(v).toLowerCase().includes(q));
      if (!hit) return false;
    }
    if (activeFilter) {
      const preset = FILTER_PRESETS.find(p => p.id === activeFilter);
      if (preset && !preset.test(row)) return false;
    }
    return true;
  });

  const clearSearch = () => { setSearchQuery(''); setActiveFilter(null); };
  const hasActiveSearch = searchQuery.trim() || activeFilter;

  const pdfSrc = pdfDoc ? `${PYTHON_API}/api/rag/pdf/${pdfDoc.id}?t=${pdfTs}` : null;

  // ══════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0a] overflow-y-auto transition-colors">

      {/* ── Confirm Delete Modal ── */}
      {deleteModal && (
        <AutoRegenModal
          hasInventory={deleteModal.hasInventory}
          loading={deleteLoading}
          onCancel={() => { if (!deleteLoading) setDeleteModal(null); }}
          onConfirm={confirmDeleteInventoryPdf}
        />
      )}

      {/* ── Header ── */}
      <div className="bg-white dark:bg-[#111] border-b border-gray-200 dark:border-white/5 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black dark:bg-white rounded-xl flex items-center justify-center">
              <Database className="w-4.5 h-4.5 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">RAG Knowledge Base</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Workspace: <span className="font-semibold text-gray-700 dark:text-gray-200">{selectedWorkspace?.company_name || workspaceId}</span>
                {isDirty && <span className="ml-2 text-amber-500 font-medium">● Unsaved changes</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { loadInventory(); fetchDocuments(); loadExistingPdf(); }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${(docsLoading || inventoryLoading || pdfLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => handleGeneratePDF()}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-60 transition-all"
            >
              {pdfLoading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating…</>
                : <><Save className="w-3.5 h-3.5" />{isDirty ? 'Save & Generate PDF' : 'Re-generate PDF'}</>
              }
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 max-w-screen-xl mx-auto w-full">

        {/* ══ SECTION 1: Inventory Table ══ */}
        <section className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
          {/* ── Section header ── */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Property Inventory</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {inventoryLoading ? 'Loading from database…'
                    : hasActiveSearch
                      ? `Showing ${visibleRows.length} of ${rows.length} listings`
                      : `${rows.length} listing${rows.length !== 1 ? 's' : ''} — edit & generate PDF to update AI knowledge`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                    ${showFilters || activeFilter ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
                  </svg>
                  Filters{activeFilter && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-white dark:bg-black inline-block" />}
                </button>
                <button
                  onClick={addRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by area, size, price, owner name…"
                className="w-full pl-9 pr-8 py-2 text-xs text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-[#111] transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="space-y-2 pt-1">
                {FILTER_GROUPS.map(group => (
                  <div key={group.label}>
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">{group.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.ids.map(id => {
                        const preset = FILTER_PRESETS.find(p => p.id === id);
                        const isActive = activeFilter === id;
                        return (
                          <button
                            key={id}
                            onClick={() => setActiveFilter(isActive ? null : id)}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all
                              ${isActive
                                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                : 'bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {hasActiveSearch && (
                  <button onClick={clearSearch}
                    className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium mt-1">
                    <X className="w-3 h-3" /> Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {inventoryLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-gray-300 dark:text-gray-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-8">#</th>
                      {columns.map(c => (
                        <th key={c.key} className={`px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide ${c.width}`}>
                          {c.label}
                        </th>
                      ))}
                      <th className="px-4 py-2.5 w-10 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {visibleRows.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length + 2} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No listings match your search</p>
                            <button onClick={clearSearch} className="text-xs text-black dark:text-white underline">Clear search</button>
                          </div>
                        </td>
                      </tr>
                    ) : visibleRows.map((row, idx) => (
                      <tr key={row.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5 text-xs text-gray-400 dark:text-gray-500 font-mono">{idx + 1}</td>
                        {columns.map(col => (
                          <td key={col.key} className={`px-2 py-1.5 ${col.width}`}>
                            {col.key === 'property_type' ? (
                              <select
                                value={row.property_type}
                                onChange={e => updateCell(row.id, 'property_type', e.target.value)}
                                className="w-full px-2 py-1.5 text-xs text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-[#0a0a0a]"
                              >
                                {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={row[col.key]}
                                placeholder={col.label}
                                onChange={e => updateCell(row.id, col.key, e.target.value)}
                                className="w-full px-2 py-1.5 text-xs text-gray-700 dark:text-gray-200 border border-transparent rounded-lg focus:outline-none focus:border-gray-300 dark:focus:border-white/20 focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent hover:bg-white dark:hover:bg-[#0a0a0a] hover:border-gray-200 dark:hover:border-white/10 transition-all placeholder-gray-400 dark:placeholder-gray-600"
                              />
                            )}
                          </td>
                        ))}
                        <td className="px-2 py-1.5 text-center">
                          <button
                            onClick={() => handleDeleteInventoryRow(idx, row.id)}
                            title="Remove from inventory (sold out)"
                            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100 dark:divide-white/5">
                {visibleRows.map((row, idx) => (
                  <div key={row.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Row {idx + 1}</span>
                      <button onClick={() => handleDeleteInventoryRow(idx, row.id)}
                        className="p-1 rounded text-red-400 hover:text-red-600 dark:hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {columns.map(col => (
                      <div key={col.key} className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">{col.label}</label>
                        {col.key === 'property_type' ? (
                          <select value={row.property_type}
                            onChange={e => updateCell(row.id, 'property_type', e.target.value)}
                            className="px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                            {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        ) : (
                          <input type="text" value={row[col.key]} placeholder={col.label}
                            onChange={e => updateCell(row.id, col.key, e.target.value)}
                            className="px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white placeholder-gray-400 dark:placeholder-gray-600" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Unsaved changes banner */}
          {isDirty && !inventoryLoading && (
            <div className="flex items-center justify-between px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-100 dark:border-amber-900/30">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                Unsaved changes — Generate PDF to update inventory & AI knowledge base.
              </p>
              <button
                onClick={() => handleGeneratePDF()}
                disabled={pdfLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-60 transition-colors"
              >
                {pdfLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save & Generate
              </button>
            </div>
          )}
        </section>

        {/* ══ SECTION 2: PDF Preview ══ */}
        {showPreview && pdfDoc && pdfSrc && (
          <section className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 flex-wrap">
                <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Current Inventory PDF</h2>
                <span className="text-xs text-gray-400 dark:text-gray-500">{pdfDoc.file_name}</span>
                {pdfDoc.updated_at && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">· Updated {new Date(pdfDoc.updated_at).toLocaleString()}</span>
                )}
              </div>
              <div className="flex gap-2">
                <a
                  href={pdfSrc}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button onClick={() => setShowPreview(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <iframe
                key={pdfTs}
                src={pdfSrc}
                className="w-full h-96 rounded-xl border border-gray-200 dark:border-white/10"
                title="Inventory PDF Preview"
              />
            </div>
          </section>
        )}

        {/* ══ SECTION 3: Upload Documents ══ */}
        <section className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Upload Documents</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Upload PDFs or DOC files — rules, restrictions, policies</p>
          </div>
          <div className="p-5">
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onFileDrop}
              onClick={() => !uploading && fileRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 w-full h-40 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200
                ${dragOver ? 'border-black dark:border-white bg-gray-50 dark:bg-white/5 scale-[1.01]' : 'border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/[0.02]'}
                ${uploading ? 'pointer-events-none opacity-70' : ''}
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Uploading & ingesting…</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Drop your file here or <span className="text-black dark:text-white underline">browse</span></p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Supports: PDF, DOC, DOCX — Rules · Restrictions · Policies</p>
                  </div>
                </>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={e => handleUpload(e.target.files?.[0])} />
            </div>
          </div>
        </section>

        {/* ══ SECTION 4: Knowledge Base Documents ══ */}
        <section className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Knowledge Base Documents</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">All documents currently embedded in the RAG system</p>
            </div>
            <span className="text-xs font-semibold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full">
              {documents.length} file{documents.length !== 1 ? 's' : ''}
            </span>
          </div>

          {docsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-gray-300 dark:text-gray-600 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                <Database className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No documents yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Generate a PDF from inventory or upload a document</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${doc.type === 'inventory' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400'}`}>
                    {doc.type === 'inventory' ? <FileText className="w-4 h-4" /> : <File className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{doc.file_name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold mr-2 ${doc.type === 'inventory' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'}`}>
                        {doc.type}
                      </span>
                      {doc.updated_at
                        ? `Updated ${new Date(doc.updated_at).toLocaleString()}`
                        : new Date(doc.created_at).toLocaleString()
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.type === 'inventory' && (
                      <button
                        onClick={() => { setPdfDoc(doc); setShowPreview(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        title="Preview PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => initiateDeleteDocument(doc)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      title={doc.type === 'inventory' ? 'Delete inventory PDF' : 'Delete document'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
        .animate-fade-in  { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}
