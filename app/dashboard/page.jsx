'use client'
import { useEffect, useState, useMemo } from 'react'
import {
  Users, Flame, Thermometer, Snowflake, Bell,
  Search, ChevronLeft, ChevronRight, TrendingUp, RefreshCw,
  Package, MapPin, Home, DollarSign, Loader2
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, AreaChart, Area
} from 'recharts'
import { useSelector, useDispatch } from 'react-redux'
import { setLeads } from '../component/MainSlice'
import { useTheme } from 'next-themes'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META = {
  hot:  { color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', label: 'Hot' },
  warm: { color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', label: 'Warm' },
  cold: { color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', label: 'Cold' },
  new:  { color: '#8b5cf6', bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400', label: 'New' },
}

const PIE_COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899']
const INV_PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.new
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  )
}

function ScoreBar({ score }) {
  const pct = Math.min(100, Math.max(0, score))
  const color = pct >= 70 ? '#ef4444' : pct >= 40 ? '#f59e0b' : '#3b82f6'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-6 text-right">{score}</span>
    </div>
  )
}

function KpiCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md dark:hover:shadow-none transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <TrendingUp className="w-4 h-4 text-green-400" />
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

// Custom Tooltip for dark mode
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Lead Chart Components ──────────────────────────────────────────────────

function LeadsStatusChart({ data, isDark }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Leads by Status</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            paddingAngle={3} dataKey="value" nameKey="name">
            {data.map((entry, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function LeadsOverTimeChart({ data, isDark }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Leads Over Time</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#222' : '#f0f0f0'} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} />
          <YAxis tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2}
            fill="url(#leadGrad)" dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function BudgetChart({ data, isDark }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Budget Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#222' : '#f0f0f0'} />
          <XAxis dataKey="budget" tick={{ fontSize: 10, fill: isDark ? '#666' : '#999' }} />
          <YAxis tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function PropertyTypeChart({ data, isDark }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Property Types</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#222' : '#f0f0f0'} />
          <XAxis dataKey="type" tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} />
          <YAxis tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Inventory Chart Components ─────────────────────────────────────────────

function InvPropertyTypePie({ data, isDark }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Property Types</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            paddingAngle={3} dataKey="count" nameKey="type">
            {data.map((_, i) => (
              <Cell key={i} fill={INV_PIE_COLORS[i % INV_PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function InvAreaChart({ data, isDark }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Listings by Area</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#222' : '#f0f0f0'} />
          <XAxis type="number" tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} />
          <YAxis type="category" dataKey="area" tick={{ fontSize: 10, fill: isDark ? '#888' : '#666' }} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function InvPriceChart({ data, isDark }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Price Range Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#222' : '#f0f0f0'} />
          <XAxis dataKey="range" tick={{ fontSize: 10, fill: isDark ? '#666' : '#999' }} />
          <YAxis tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function InvSizeChart({ data, isDark }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Size Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#222' : '#f0f0f0'} />
          <XAxis dataKey="size" tick={{ fontSize: 10, fill: isDark ? '#666' : '#999' }} />
          <YAxis tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Leads Table ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 8

function LeadsTable({ leads }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const name = l.lead_data?.name?.toLowerCase() || ''
      const phone = l.phone?.toLowerCase() || ''
      const q = query.toLowerCase()
      const matchQ = !q || name.includes(q) || phone.includes(q)
      const matchS = status === 'all' || l.lead_status === status
      return matchQ && matchS
    })
  }, [leads, query, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-gray-100 dark:border-white/5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 self-center mr-auto">Recent Leads</h3>
        <div className="relative">
          <Search className="absolute text-gray-400 dark:text-gray-500 left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <input
            value={query} onChange={e => { setQuery(e.target.value); setPage(1) }}
            placeholder="Search name or phone…"
            className="pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-white/20 w-56"
          />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-white/20">
          <option value="all">All Statuses</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
          <option value="new">New</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-white/[0.03] text-left">
              {['Name', 'Phone', 'Area', 'Budget', 'Property', 'Status', 'Score', 'Follow-up', 'Created'].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5">
            {slice.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">No leads found.</td></tr>
            ) : slice.map(lead => (
              <tr key={lead._id} className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{lead.name || '—'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{lead.phone}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{lead.lead_data?.area || '—'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{lead.lead_data?.budget || '—'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{lead.lead_data?.property_type || '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={lead.lead_status} /></td>
                <td className="px-4 py-3 w-28"><ScoreBar score={lead.lead_score} /></td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${lead.needs_human_followup ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    {lead.needs_human_followup ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-white/5">
        <p className="text-xs text-gray-400 dark:text-gray-500">{filtered.length} leads · page {page} of {totalPages}</p>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors text-gray-600 dark:text-gray-400">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors text-gray-600 dark:text-gray-400">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Inventory Table ──────────────────────────────────────────────────────────

function InventoryTable({ inventory }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!query.trim()) return inventory
    const q = query.toLowerCase()
    return inventory.filter(item => 
      Object.values(item).some(v => String(v).toLowerCase().includes(q))
    )
  }, [inventory, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-gray-100 dark:border-white/5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 self-center mr-auto">Inventory Listings</h3>
        <div className="relative">
          <Search className="absolute text-gray-400 dark:text-gray-500 left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <input
            value={query} onChange={e => { setQuery(e.target.value); setPage(1) }}
            placeholder="Search inventory…"
            className="pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-white/20 w-56"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-white/[0.03] text-left">
              {['Type', 'Area', 'Size', 'Price', 'Description', 'Owner', 'Phone'].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5">
            {slice.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">No listings found.</td></tr>
            ) : slice.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">{item.property_type || '—'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.area || '—'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.size || '—'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.price || '—'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">{item.description || '—'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.owner_name || '—'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.owner_phone || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-white/5">
        <p className="text-xs text-gray-400 dark:text-gray-500">{filtered.length} listings · page {page} of {totalPages}</p>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors text-gray-600 dark:text-gray-400">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors text-gray-600 dark:text-gray-400">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('leads')

  // Inventory state
  const [invLoading, setInvLoading] = useState(false)
  const [invData, setInvData] = useState(null)

  const leads = useSelector(state => state.main.leads)
  const selectedWorkspace = useSelector(state => state.main.selectedWorkspace)
  const dispatch = useDispatch()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    if (leads) setLoading(false)
  }, [leads])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error('Failed to fetch leads')
      const data = await res.json()
      dispatch(setLeads(data.leads || []))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchInventory = async () => {
    if (!selectedWorkspace?.workspace_id) return
    setInvLoading(true)
    try {
      const res = await fetch(`/api/dashboard/inventory?workspace_id=${selectedWorkspace.workspace_id}`)
      if (!res.ok) throw new Error('Failed to fetch inventory')
      const data = await res.json()
      if (data.success) setInvData(data)
    } catch (e) {
      console.error('Inventory fetch error:', e)
    } finally {
      setInvLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'inventory' && !invData) {
      fetchInventory()
    }
  }, [activeTab, selectedWorkspace]) // eslint-disable-line

  // ── Derived stats ──
  const stats = useMemo(() => {
    const total = leads.length
    const hot = leads.filter(l => l.lead_status === 'hot').length
    const warm = leads.filter(l => l.lead_status === 'warm').length
    const cold = leads.filter(l => l.lead_status === 'cold').length
    const followup = leads.filter(l => l.needs_human_followup).length
    return { total, hot, warm, cold, followup }
  }, [leads])

  const pieData = useMemo(() => {
    const map = {}
    leads.forEach(l => { map[l.lead_status] = (map[l.lead_status] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [leads])

  const timeData = useMemo(() => {
    const map = {}
    leads.forEach(l => {
      const d = new Date(l.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      map[d] = (map[d] || 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-14)
      .map(([date, count]) => ({ date, count }))
  }, [leads])

  const budgetData = useMemo(() => {
    const map = {}
    leads.forEach(l => {
      const b = l.lead_data?.budget || 'Unknown'
      map[b] = (map[b] || 0) + 1
    })
    return Object.entries(map).map(([budget, count]) => ({ budget, count }))
  }, [leads])

  const propertyData = useMemo(() => {
    const map = {}
    leads.forEach(l => {
      const t = l.lead_data?.property_type || 'Unknown'
      map[t] = (map[t] || 0) + 1
    })
    return Object.entries(map).map(([type, count]) => ({ type, count }))
  }, [leads])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900/50 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="text-center">
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={fetchLeads} className="mt-3 text-sm text-indigo-500 hover:underline">Retry</button>
      </div>
    </div>
  )

  return (
    <div className="flex-1 p-6 lg:p-8 bg-gray-50 dark:bg-[#0a0a0a] min-h-screen overflow-y-auto transition-colors">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">CRM Dashboard</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">AI-powered WhatsApp lead management</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 border border-gray-200 dark:border-white/5">
            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'leads'
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Users className="w-4 h-4" /> Leads
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'inventory'
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Package className="w-4 h-4" /> Inventory
            </button>
          </div>

          <button
            onClick={activeTab === 'leads' ? fetchLeads : fetchInventory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${(invLoading || loading) ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* ═══ LEADS TAB ═══ */}
      {activeTab === 'leads' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <KpiCard label="Total Leads" value={stats.total} icon={Users} color="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500" />
            <KpiCard label="Hot Leads" value={stats.hot} icon={Flame} color="bg-red-50 dark:bg-red-950/30 text-red-500" />
            <KpiCard label="Warm Leads" value={stats.warm} icon={Thermometer} color="bg-amber-50 dark:bg-amber-950/30 text-amber-500" />
            <KpiCard label="Cold Leads" value={stats.cold} icon={Snowflake} color="bg-blue-50 dark:bg-blue-950/30 text-blue-500" />
            <KpiCard label="Need Follow-up" value={stats.followup} icon={Bell} color="bg-rose-50 dark:bg-rose-950/30 text-rose-500" sub="Needs human review" />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <LeadsStatusChart data={pieData} isDark={isDark} />
            <LeadsOverTimeChart data={timeData} isDark={isDark} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <BudgetChart data={budgetData} isDark={isDark} />
            <PropertyTypeChart data={propertyData} isDark={isDark} />
          </div>

          {/* Table */}
          <LeadsTable leads={leads} />
        </>
      )}

      {/* ═══ INVENTORY TAB ═══ */}
      {activeTab === 'inventory' && (
        <>
          {invLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Loading inventory analytics…</p>
              </div>
            </div>
          ) : !invData || !invData.inventory?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <Package className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">No inventory data</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm">
                {selectedWorkspace 
                  ? 'Add property listings in the Knowledge Base section to see inventory analytics here.'
                  : 'Select a workspace from the sidebar to view inventory analytics.'}
              </p>
            </div>
          ) : (
            <>
              {/* Inventory KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KpiCard label="Total Listings" value={invData.stats.totalListings} icon={Package} color="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500" />
                <KpiCard label="Unique Areas" value={invData.stats.uniqueAreas} icon={MapPin} color="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500" />
                <KpiCard label="Property Types" value={invData.stats.uniqueTypes} icon={Home} color="bg-amber-50 dark:bg-amber-950/30 text-amber-500" />
                <KpiCard label="With Owner Info" value={invData.stats.withOwner} icon={Users} color="bg-blue-50 dark:bg-blue-950/30 text-blue-500" />
              </div>

              {/* Inventory Charts Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <InvPropertyTypePie data={invData.propertyTypeData} isDark={isDark} />
                <InvAreaChart data={invData.areaData} isDark={isDark} />
              </div>

              {/* Inventory Charts Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <InvPriceChart data={invData.priceData} isDark={isDark} />
                <InvSizeChart data={invData.sizeData} isDark={isDark} />
              </div>

              {/* Inventory Table */}
              <InventoryTable inventory={invData.inventory} />
            </>
          )}
        </>
      )}
    </div>
  )
}