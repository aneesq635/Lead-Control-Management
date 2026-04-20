'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setLeads } from '../../component/MainSlice';

function ScoreBar({ score }) {
    const pct = Math.min(100, Math.max(0, score || 0));
    // tertiary = #ffb2b7, primary = #c0c1ff, secondary = #b9c7df
    const colorClass = pct >= 70 ? 'bg-tertiary' : pct >= 40 ? 'bg-primary' : 'bg-secondary';
    const textClass = pct >= 70 ? 'text-tertiary' : pct >= 40 ? 'text-primary' : 'text-secondary';
    
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className={`h-full ${colorClass} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
            </div>
            <span className={`text-xs font-black ${textClass}`}>{score || 0}</span>
        </div>
    );
}

function StatusBadge({ status }) {
    if (status === 'hot') {
        return <span className="px-3 py-1 bg-tertiary-container text-tertiary text-[10px] font-black rounded-full hot-glow uppercase tracking-wider">Hot Lead</span>;
    } else if (status === 'warm') {
        return <span className="px-3 py-1 bg-primary-container text-primary text-[10px] font-black rounded-full uppercase tracking-wider">Warm</span>;
    } else if (status === 'cold') {
        return <span className="px-3 py-1 bg-secondary-container text-secondary text-[10px] font-black rounded-full uppercase tracking-wider">Cold</span>;
    }
    return <span className="px-3 py-1 bg-surface-bright text-on-surface text-[10px] font-black rounded-full uppercase tracking-wider">New</span>;
}

export default function LeadsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const leads = useSelector(state => state.main.leads);
    const dispatch = useDispatch();

    useEffect(() => {
        if (leads) setLoading(false);
    }, [leads]);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/dashboard/stats');
            if (!res.ok) throw new Error('Failed to fetch leads');
            const data = await res.json();
            dispatch(setLeads(data.leads || []));
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!leads || leads.length === 0) fetchLeads();
    }, []);

    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const filtered = useMemo(() => {
        if (!leads) return [];
        return leads.filter(l => {
            const name = l.name?.toLowerCase() || l.lead_data?.name?.toLowerCase() || '';
            const phone = l.phone?.toLowerCase() || '';
            const q = query.toLowerCase();
            const matchQ = !q || name.includes(q) || phone.includes(q);
            const matchS = statusFilter === 'all' || l.lead_status === statusFilter;
            return matchQ && matchS;
        });
    }, [leads, query, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-on-surface-variant">Loading intelligence...</p>
            </div>
        </div>
    );

    return (
        <div>
            {/* Page Header */}
            <div className="grid grid-cols-12 gap-6 mb-8">
                <div className="col-span-8">
                    <h1 className="text-4xl font-black text-on-surface tracking-tight mb-2 uppercase">Lead Pipeline</h1>
                    <p className="text-on-surface-variant text-sm max-w-xl">Deep-cycle intelligence tracking for high-intent real estate assets. Synchronized with real-time architectural valuations.</p>
                </div>
                <div className="col-span-4 flex items-end justify-end">
                    <button className="flex items-center gap-2 px-6 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>add</span>
                        ADD NEW LEAD
                    </button>
                </div>
            </div>

            {/* Lead Management Controls */}
            <div className="glass-panel rounded-t-3xl border-t border-x border-outline-variant/10 p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                        <input value={query} onChange={(e) => {setQuery(e.target.value); setPage(1);}} className="w-64 bg-surface-container-highest border-0 border flex items-center border border-outline-variant/20 rounded-lg focus:border-primary focus:ring-0 text-xs pl-10 h-9 transition-all text-on-surface" placeholder="Search identity..." type="text"/>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <select value={statusFilter} onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}} className="bg-surface-container-highest border-0 text-xs font-bold text-on-surface focus:ring-0 rounded-lg py-2 pl-3 pr-8 appearance-none cursor-pointer border border-outline-variant/20">
                        <option value="all">All Classifications</option>
                        <option value="hot">Hot Leads</option>
                        <option value="warm">Warm Leads</option>
                        <option value="cold">Cold Leads</option>
                        <option value="new">New</option>
                    </select>
                </div>
            </div>

            {/* High-Density Data Grid (Glassmorphism Table) */}
            <div className="glass-panel rounded-b-3xl border-b border-x border-outline-variant/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-surface-container-highest/50">
                                <th className="py-4 px-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Lead Identity</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Finance & Scope</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Territory</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Classification</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em] w-48">Lead Integrity</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                            {slice.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-sm text-on-surface-variant">No intelligence profiles matched parameters.</td>
                                </tr>
                            ) : slice.map((lead) => {
                                const initials = (lead.name || lead.lead_data?.name || '?').substring(0, 2).toUpperCase();
                                
                                return (
                                    <tr key={lead._id} className="group hover:bg-surface-bright/20 transition-all cursor-pointer">
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surface-container-highest to-surface flex items-center justify-center font-black text-on-surface text-xs border border-outline-variant/20">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-on-surface">{lead.name || lead.lead_data?.name || "Unknown Identity"}</div>
                                                    <div className="text-xs text-on-surface-variant opacity-70">{lead.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="text-sm font-black text-on-surface">{lead.lead_data?.budget || '—'}</div>
                                            <div className="text-[10px] text-primary uppercase font-bold tracking-tight">{lead.lead_data?.property_type || '—'}</div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="text-sm text-on-surface">{lead.lead_data?.area || '—'}</div>
                                            <div className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{new Date(lead.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <StatusBadge status={lead.lead_status} />
                                            {lead.needs_human_followup && (
                                                <div className="text-[9px] text-error mt-1 uppercase font-bold tracking-widest">Follow-up Required</div>
                                            )}
                                        </td>
                                        <td className="py-5 px-6">
                                            <ScoreBar score={lead.lead_score} />
                                        </td>
                                        <td className="py-5 px-6 text-right w-16">
                                            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">more_vert</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-surface-container-lowest/30 flex flex-wrap justify-between items-center gap-4">
                    <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        Showing {slice.length} of {filtered.length} intelligence profiles
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-primary transition-all disabled:opacity-30 disabled:hover:text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <button className="p-2 bg-primary rounded-lg text-on-primary font-black text-xs px-4">
                            {page} / {totalPages}
                        </button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-primary transition-all disabled:opacity-30 disabled:hover:text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="pb-16" />
        </div>
    );
}
