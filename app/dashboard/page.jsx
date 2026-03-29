'use client'
import { useEffect, useState, useMemo } from 'react'
import {
  Users, Flame, Thermometer, Snowflake, Bell,
  Search, ChevronLeft, ChevronRight, TrendingUp, RefreshCw
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts'
import { useSelector, useDispatch } from 'react-redux'
import { setLeads } from '../component/MainSlice'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META = {
  hot: { color: '#ef4444', bg: 'bg-red-50', text: 'text-red-600', label: 'Hot' },
  warm: { color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600', label: 'Warm' },
  cold: { color: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-600', label: 'Cold' },
  new: { color: '#8b5cf6', bg: 'bg-violet-50', text: 'text-violet-600', label: 'New' },
}

const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981']

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
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium text-gray-500 w-6 text-right">{score}</span>
    </div>
  )
}

function KpiCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <TrendingUp className="w-4 h-4 text-green-400" />
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// ─── Chart Components ──────────────────────────────────────────────────────────

function LeadsStatusChart({ data }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Leads by Status</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            paddingAngle={3} dataKey="value" nameKey="name">
            {data.map((entry, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [v, n]} />
          <Legend iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function LeadsOverTimeChart({ data }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Leads Over Time</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2}
            dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function BudgetChart({ data }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Budget Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="budget" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function PropertyTypeChart({ data }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Property Types</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="type" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
  console.log("leads", leads)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 self-center mr-auto">Recent Leads</h3>
        <div className="relative ">
          <Search className="absolute text-gray-600 left-3 top-1/2 -translate-y-1/2 w-4 h-4 " />
          <input
            value={query} onChange={e => { setQuery(e.target.value); setPage(1) }}
            placeholder="Search name or phone…"
            className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56"
          />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="text-sm border text-black border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300">
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
            <tr className="bg-gray-50 text-left">
              {['Name', 'Phone', 'Area', 'Budget', 'Property', 'Status', 'Score', 'Follow-up', 'Created'].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {slice.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No leads found.</td></tr>
            ) : slice.map(lead => (
              <tr key={lead._id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{ lead.name|| '—'}</td>
                <td className="px-4 py-3 text-gray-500">{lead.phone}</td>
                <td className="px-4 py-3 text-gray-500">{lead.lead_data?.area || '—'}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{lead.lead_data?.budget || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{lead.lead_data?.property_type || '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={lead.lead_status} /></td>
                <td className="px-4 py-3 w-28"><ScoreBar score={lead.lead_score} /></td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${lead.needs_human_followup ? 'text-red-500' : 'text-gray-400'}`}>
                    {lead.needs_human_followup ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">{filtered.length} leads · page {page} of {totalPages}</p>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // const [leads, setLeads]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const leads = useSelector(state => state.main.leads)
  const dispatch = useDispatch()

  useEffect(() => {
    // If leads exist, we stop loading. Even if they are empty, DataLoader sets it to [] which is truthy.
    if (leads) {
      setLoading(false)
    }
  }, [leads])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error('Failed to fetch leads')
      const data = await res.json()
      dispatch(setLeads(data.leads || []))
    } catch (e) {
      console.log("error while fetching lead", e.message)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading leads…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={fetchLeads} className="mt-3 text-sm text-indigo-500 hover:underline">Retry</button>
      </div>
    </div>
  )

  return (
    <div className="flex-1 p-6 lg:p-8 bg-gray-50 min-h-screen overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CRM Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">AI-powered WhatsApp lead management</p>
        </div>
        <button onClick={fetchLeads}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KpiCard label="Total Leads" value={stats.total} icon={Users} color="bg-indigo-50 text-indigo-500" />
        <KpiCard label="Hot Leads" value={stats.hot} icon={Flame} color="bg-red-50 text-red-500" />
        <KpiCard label="Warm Leads" value={stats.warm} icon={Thermometer} color="bg-amber-50 text-amber-500" />
        <KpiCard label="Cold Leads" value={stats.cold} icon={Snowflake} color="bg-blue-50 text-blue-500" />
        <KpiCard label="Need Follow-up" value={stats.followup} icon={Bell} color="bg-rose-50 text-rose-500" sub="Needs human review" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <LeadsStatusChart data={pieData} />
        <LeadsOverTimeChart data={timeData} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <BudgetChart data={budgetData} />
        <PropertyTypeChart data={propertyData} />
      </div>

      {/* Table */}
      <LeadsTable leads={leads} />

    </div>
  )
}