"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../component/AuthContext";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function WhatsAppSettingsPage() {
    const [step, setStep] = useState("list"); // "list" | "configure"
    const [workspace, setWorkspace] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [avaiableWorkspace, setAvaiableWorkspace] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();
    const supabase_id = user?.id;
    const [isEditing, setIsEditing] = useState(false);
    const [originalForm, setOriginalForm] = useState({});
    const [visibleFields, setVisibleFields] = useState({});


    const [form, setForm] = useState({
        whatsapp_access_token: "",
        whatsapp_phone_number_id: "",
        whatsapp_verify_token: "",
    });

    // fetch workspaces
    useEffect(() => {
        if (!supabase_id) return;
        const fetchWorkspaces = async () => {
            setLoading(true);
            const res = await fetch(`/api/workspace/get?supabase_id=${supabase_id}`);
            const data = await res.json();
            if (data.success) setAvaiableWorkspace(data.workspaces);
            setLoading(false);
        };
        fetchWorkspaces();
    }, [supabase_id]);

    // Save WhatsApp credentials
    async function handleSaveSettings(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);
        try {
            const res = await fetch("/api/whatsapp/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workspaceId: workspace.workspace_id, ...form }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setSuccess("WhatsApp configuration saved successfully!");
            // update local list
            setAvaiableWorkspace((prev) =>
                prev.map((ws) =>
                    ws.workspace_id === workspace.workspace_id ? { ...ws, ...form } : ws
                )
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
            setIsEditing(false);
            setOriginalForm({ ...form });
        }
    }

    // Delete workspace
    async function handleDeleteWorkspace(workspaceId) {
        setError("");
        setSuccess("");
        setSaving(true);
        try {
            const res = await fetch("/api/workspace/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workspaceId }),
            });
            const data = await res.json();
            setAvaiableWorkspace(avaiableWorkspace.filter((ws) => ws._id !== workspaceId));
            if (!data.success) throw new Error(data.error);
            setSuccess("Workspace deleted successfully!");
            if (workspace?._id === workspaceId) {
                setStep("list");
                setWorkspace(null);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="flex-1 p-6 sm:p-8 bg-gray-50 [#0a0a0a] min-h-full">
            <div className="max-w-3xl mx-auto w-full">

                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            WhatsApp Settings
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage workspaces and configure your WhatsApp Cloud API credentials.
                        </p>
                    </div>
                    
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="relative w-8 h-8">
                            <div className="absolute inset-0 rounded-full border-2 border-gray-200 " />
                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-black animate-spin" />
                        </div>
                    </div>
                )}

                {/* Workspace List */}
                {!loading && step === "list" && (
                    <>
                        {avaiableWorkspace.length === 0 ? (
                            <div className="text-center py-20 bg-white [#111] border border-gray-200 rounded-2xl">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-xl">📱</span>
                                </div>
                                <p className="font-semibold text-gray-700 ">No workspaces yet</p>
                                <p className="text-sm text-gray-400 mt-1 mb-5">
                                    Create your first workspace to get started.
                                </p>
                                <button
                                    onClick={() => router.push("/workspace/create")}
                                    className="h-10 px-5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 :bg-gray-100 transition-all"
                                >
                                    Create Workspace
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {avaiableWorkspace.map((ws) => (
                                    <div
                                        key={ws.workspace_id}
                                        onClick={() => {
                                            setWorkspace(ws);
                                            setStep("configure");
                                            setIsEditing(false);
                                            setVisibleFields({});
                                            setError("");
                                            setSuccess("");
                                            setForm({
                                                whatsapp_access_token: ws.whatsapp_access_token || "",
                                                whatsapp_phone_number_id: ws.whatsapp_phone_number_id || "",
                                                whatsapp_verify_token: ws.whatsapp_verify_token || "",
                                            });
                                        }}
                                        className="bg-white [#111] border border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-gray-300 :border-gray-600 hover:shadow-sm transition-all duration-150 group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm">
                                                    {ws.company_name}
                                                </h3>
                                                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                                                    {ws.workspace_id}
                                                </p>
                                            </div>
                                            {ws.whatsapp_access_token && (
                                                <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                                                    ✓ Configured
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteWorkspace(ws._id); }}
                                            className="text-xs text-red-500 hover:text-red-700 :text-red-300 transition-colors px-2.5 py-1 rounded-lg hover:bg-red-50 :bg-red-950/30"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Configure Step */}
                {!loading && step === "configure" && workspace && (() => {
                    const hasToken = !!workspace.whatsapp_access_token;
                    const isViewMode = hasToken && !isEditing;
                    const isDirty = isEditing && Object.keys(form).some(k => form[k] !== originalForm[k]);

                    const fields = [
                        { label: "Access Token", field: "whatsapp_access_token", isPassword: true, placeholder: "EAA...", hint: "Permanent or temporary access token from Meta App Dashboard." },
                        { label: "Phone Number ID", field: "whatsapp_phone_number_id", isPassword: false, placeholder: "e.g. 102938475610293", hint: null },
                        { label: "Verify Token", field: "whatsapp_verify_token", isPassword: true, placeholder: "Custom secret string", hint: "Used to verify the webhook URL in Meta App Dashboard." },
                    ];

                    return (
                        <>
                            <div className="bg-white [#111] border border-gray-200 rounded-2xl p-6">
                                <div className="mb-6">
                                    <h2 className="text-base font-semibold text-gray-900 ">
                                        {workspace.company_name}
                                    </h2>
                                    <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                                        ID: {workspace.workspace_id}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Configure your WhatsApp Cloud API credentials to enable messaging.
                                    </p>
                                </div>

                                <form onSubmit={(e) => { if (!isDirty && hasToken) { e.preventDefault(); return; } handleSaveSettings(e); }} className="space-y-5">
                                    {fields.map(({ label, field, isPassword, placeholder, hint }) => {
                                        const showText = visibleFields[field];
                                        return (
                                            <div key={field}>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                    {label}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={isPassword && !showText ? "password" : "text"}
                                                        value={form[field] || ""}
                                                        onChange={(e) => {
                                                            if (isViewMode) return;
                                                            setForm({ ...form, [field]: e.target.value });
                                                        }}
                                                        readOnly={isViewMode}
                                                        className={`w-full h-11 px-4 ${isPassword ? "pr-11" : "pr-4"} rounded-xl border border-gray-200 bg-gray-50 [#0a0a0a] text-gray-900 placeholder-gray-400 font-mono text-sm focus:outline-none transition-all
 ${isViewMode
                                                                ? "opacity-60 cursor-default select-none focus:ring-0"
                                                                : "focus:ring-2 focus:ring-black :ring-white focus:border-transparent"
                                                            }`}
                                                        placeholder={placeholder}
                                                    />
                                                    {isPassword && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }))}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 :text-gray-300 transition-colors"
                                                            tabIndex={-1}
                                                        >
                                                            {showText ? (
                                                                // Eye Off
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                                    <line x1="1" y1="1" x2="23" y2="23" />
                                                                </svg>
                                                            ) : (
                                                                // Eye On
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                                    <circle cx="12" cy="12" r="3" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                                {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
                                            </div>
                                        );
                                    })}

                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    {success && <p className="text-green-600 text-sm">{success}</p>}

                                    <div className="flex gap-3 pt-2">
                                        {/* CASE 1: No token yet → always show Save */}
                                        {!hasToken && (
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="h-11 px-6 bg-black hover:bg-gray-800 :bg-gray-100 text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
                                            >
                                                {saving ? "Saving..." : "Save Configuration"}
                                            </button>
                                        )}

                                        {/* CASE 2: Token exists, not editing → show Edit */}
                                        {hasToken && !isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setOriginalForm({ ...form });
                                                    setIsEditing(true);
                                                    setSuccess("");
                                                    setError("");
                                                }}
                                                className="h-11 px-6 bg-black hover:bg-gray-800 :bg-gray-100 text-white rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                                            >
                                                Edit Configuration
                                            </button>
                                        )}

                                        {/* CASE 3: Editing → show Save (only enabled if changed) + Cancel */}
                                        {hasToken && isEditing && (
                                            <>
                                                <button
                                                    type="submit"
                                                    disabled={saving || !isDirty}
                                                    className="h-11 px-6 bg-black hover:bg-gray-800 :bg-gray-100 text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
                                                >
                                                    {saving ? "Saving..." : "Save Configuration"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setForm({ ...originalForm });
                                                        setIsEditing(false);
                                                        setError("");
                                                        setSuccess("");
                                                    }}
                                                    className="h-11 px-6 border border-gray-200 hover:border-gray-300 :border-gray-600 text-gray-700 bg-white [#0a0a0a] hover:bg-gray-50 :bg-[#111] rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98]"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep("list");
                                                setWorkspace(null);
                                                setError("");
                                                setSuccess("");
                                                setIsEditing(false);
                                                setOriginalForm({});
                                                setVisibleFields({});
                                            }}
                                            className="h-11 px-6 border border-gray-200 hover:border-gray-300 :border-gray-600 text-gray-700 bg-white [#0a0a0a] hover:bg-gray-50 :bg-[#111] rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98]"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Webhook Info */}
                            <div className="mt-5 bg-gray-50 [#111] border border-gray-200 rounded-2xl p-5">
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                    Webhook Configuration
                                </h3>
                                <p className="text-sm text-gray-500 mb-3">
                                    In your Meta App Dashboard, set your Webhook URL to:
                                </p>
                                <code className="block text-xs font-mono bg-gray-100 [#0a0a0a] border border-gray-200 text-gray-700 px-4 py-3 rounded-xl select-all break-all">
                                    https://your-domain.com/api/webhook/whatsapp
                                </code>
                                <p className="text-sm text-gray-500 mt-3">
                                    Use the <span className="font-semibold text-gray-700 ">Verify Token</span> you configured above.
                                </p>
                            </div>
                        </>
                    );
                })()}

            </div>
        </div>
    );
}

// "use client";

// import { useEffect, useState } from "react";
// import { useAuth } from "../../../component/AuthContext";

// export default function WhatsAppSettingsPage() {
// const [step, setStep] = useState("create"); // "create" | "configure"
// const [workspace, setWorkspace] = useState(null);
// const [companyName, setCompanyName] = useState("");
// const [creating, setCreating] = useState(false);
// const [saving, setSaving] = useState(false);
// const [error, setError] = useState("");
// const [success, setSuccess] = useState("");
// const [avaiableWorkspace, setAvaiableWorkspace] = useState([]);
// const {user} = useAuth();
// console.log("user from supabase", user)
// const supabase_id = user?.id;
// console.log("supabase id ", supabase_id)

// const [form, setForm] = useState({
// whatsapp_access_token: "",
// whatsapp_phone_number_id: "",
// whatsapp_verify_token: "",
// });

// // fetch already present workspaces
// useEffect(() => {
// if(!supabase_id) return;
// const fetchWorkspaces = async () => {
// const res = await fetch(`/api/workspace/get?supabase_id=${supabase_id}`);
// const data = await res.json();
// console.log("data from api", data)
// if (data.success) {
// setAvaiableWorkspace(data.workspaces);
// }
// };
// fetchWorkspaces();
// }, [workspace, supabase_id])

// // ── Step 1: Create workspace ──────────────────────────────────────────────
// async function handleCreateWorkspace() {
// setError("");
// if (!companyName.trim()) {
// setError("Company name is required.");
// return;
// }
// setCreating(true);
// try {
// const res = await fetch("/api/workspace/create", {
// method: "POST",
// headers: { "Content-Type": "application/json" },
// body: JSON.stringify({ company_name: companyName, supabase_id }),
// });
// const data = await res.json();
// console.log("after createion", data)
// if (!data.success) throw new Error(data.error);
// setWorkspace(data.workspace);
// setStep("configure");
// } catch (err) {
// setError(err.message);
// } finally {
// setCreating(false);
// }
// }

// // ── Step 2: Save WhatsApp credentials ────────────────────────────────────
// async function handleSaveSettings(e) {
// e.preventDefault();
// setError("");
// setSuccess("");
// setSaving(true);
// try {
// const res = await fetch("/api/whatsapp/setup", {
// method: "POST",
// headers: { "Content-Type": "application/json" },
// body: JSON.stringify({
// workspaceId: workspace.workspace_id, // UUID
// ...form,
// }),
// });
// const data = await res.json();
// if (!data.success) throw new Error(data.error);
// setSuccess("WhatsApp configuration saved successfully!");
// } catch (err) {
// setError(err.message);
// } finally {
// setSaving(false);
// }
// }

// async function handleDeleteWorkspace(workspaceId) {
// setError("");
// setSuccess("");
// setSaving(true);
// try {
// const res = await fetch("/api/workspace/delete", {
// method: "POST",
// headers: { "Content-Type": "application/json" },
// body: JSON.stringify({ workspaceId }),
// });
// const data = await res.json();

// setAvaiableWorkspace(avaiableWorkspace.filter((ws) => ws._id !== workspaceId));
// if (!data.success) throw new Error(data.error);
// setSuccess("Workspace deleted successfully!");
// } catch (err) {
// setError(err.message);
// } finally {
// setSaving(false);
// }
// }


// // Paste this return() into your WhatsApp settings component
// return (
// <div className="flex-1 p-6 sm:p-8 bg-gray-50 [#0a0a0a] min-h-full">
// <div className="max-w-3xl mx-auto w-full">

// {/* Page Header */}
// <div className="mb-8">
// <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
// WhatsApp Settings
// </h1>
// <p className="text-sm text-gray-500 mt-1">
// Manage workspaces and configure your WhatsApp Cloud API credentials.
// </p>
// </div>

// {/* Existing Workspaces */}
// {avaiableWorkspace && avaiableWorkspace.length > 0 && (
// <div className="mb-8">
// <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
// Existing Workspaces
// </h2>
// <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
// {avaiableWorkspace.map((ws) => (
// <div
// key={ws.workspace_id}
// onClick={() => {
// setWorkspace(ws);
// setStep("configure");
// setForm({
// whatsapp_access_token: ws.whatsapp_access_token || "",
// whatsapp_phone_number_id: ws.whatsapp_phone_number_id || "",
// whatsapp_verify_token: ws.whatsapp_verify_token
// });
// }}
// className="bg-white [#111] border border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-gray-300 :border-gray-600 hover:shadow-sm transition-all duration-150 group"
// >
// <div className="flex items-start justify-between mb-3">
// <div>
// <h3 className="font-semibold text-gray-900 text-sm">
// {ws.company_name}
// </h3>
// <p className="text-[11px] text-gray-400 font-mono mt-0.5">
// {ws.workspace_id}
// </p>
// </div>
// {ws.whatsapp_access_token && (
// <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
// ✓ Configured
// </span>
// )}
// </div>
// <button
// onClick={(e) => { e.stopPropagation(); handleDeleteWorkspace(ws._id); }}
// className="text-xs text-red-500 hover:text-red-700 :text-red-300 transition-colors px-2.5 py-1 rounded-lg hover:bg-red-50 :bg-red-950/30"
// >
// Delete
// </button>
// </div>
// ))}
// </div>
// </div>
// )}

// {/* Step 1: Create Workspace */}
// {step === "create" && (
// <div className="bg-white [#111] border border-gray-200 rounded-2xl p-6">
// <div className="mb-6">
// <h2 className="text-base font-semibold text-gray-900 ">
// Create a Workspace
// </h2>
// <p className="text-sm text-gray-500 mt-1">
// First, create a workspace for your company. A unique ID will be generated automatically.
// </p>
// </div>

// <div className="space-y-4">
// <div>
// <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
// Company Name
// </label>
// <input
// type="text"
// value={companyName}
// onChange={(e) => setCompanyName(e.target.value)}
// className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 [#0a0a0a] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black :ring-white focus:border-transparent transition-all text-sm"
// placeholder="e.g. Acme Corp"
// />
// </div>

// {error && <p className="text-red-500 text-sm">{error}</p>}

// <button
// onClick={handleCreateWorkspace}
// disabled={creating}
// className="h-11 px-6 bg-black hover:bg-gray-800 :bg-gray-100 text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
// >
// {creating ? "Creating..." : "Create Workspace"}
// </button>
// </div>
// </div>
// )}

// {/* Step 2: Configure WhatsApp */}
// {step === "configure" && workspace && (
// <div className="bg-white [#111] border border-gray-200 rounded-2xl p-6">
// <div className="mb-6">
// <div className="flex items-center gap-2 mb-1">
// <h2 className="text-base font-semibold text-gray-900 ">
// {workspace.company_name}
// </h2>
// </div>
// <p className="text-[11px] font-mono text-gray-400 ">
// ID: {workspace.workspace_id}
// </p>
// <p className="text-sm text-gray-500 mt-2">
// Configure your WhatsApp Cloud API credentials to enable messaging.
// </p>
// </div>

// <form onSubmit={handleSaveSettings} className="space-y-5">
// {[
// {
// label: "Access Token",
// field: "whatsapp_access_token",
// type: "password",
// placeholder: "EAA...",
// hint: "Permanent or temporary access token from Meta App Dashboard."
// },
// {
// label: "Phone Number ID",
// field: "whatsapp_phone_number_id",
// type: "text",
// placeholder: "e.g. 102938475610293",
// hint: null
// },
// {
// label: "Verify Token",
// field: "whatsapp_verify_token",
// type: "text",
// placeholder: "Custom secret string",
// hint: "Used to verify the webhook URL in Meta App Dashboard."
// }
// ].map(({ label, field, type, placeholder, hint }) => (
// <div key={field}>
// <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
// {label}
// </label>
// <input
// type={type}
// value={form[field]}
// onChange={(e) => setForm({ ...form, [field]: e.target.value })}
// className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 [#0a0a0a] text-gray-900 placeholder-gray-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black :ring-white focus:border-transparent transition-all"
// placeholder={placeholder}
// />
// {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
// </div>
// ))}

// {error && <p className="text-red-500 text-sm">{error}</p>}
// {success && <p className="text-green-600 text-sm">{success}</p>}

// <div className="flex gap-3 pt-2">
// <button
// type="submit"
// disabled={saving}
// className="h-11 px-6 bg-black hover:bg-gray-800 :bg-gray-100 text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
// >
// {saving ? "Saving..." : "Save Configuration"}
// </button>
// <button
// type="button"
// onClick={() => setStep("create")}
// className="h-11 px-6 border border-gray-200 hover:border-gray-300 :border-gray-600 text-gray-700 bg-white [#0a0a0a] hover:bg-gray-50 :bg-[#111] rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98]"
// >
// Back
// </button>
// </div>
// </form>
// </div>
// )}

// {/* Webhook Info */}
// {step === "configure" && (
// <div className="mt-5 bg-gray-50 [#111] border border-gray-200 rounded-2xl p-5">
// <h3 className="text-sm font-semibold text-gray-900 mb-1">
// Webhook Configuration
// </h3>
// <p className="text-sm text-gray-500 mb-3">
// In your Meta App Dashboard, set your Webhook URL to:
// </p>
// <code className="block text-xs font-mono bg-gray-100 [#0a0a0a] border border-gray-200 text-gray-700 px-4 py-3 rounded-xl select-all break-all">
// https://your-domain.com/api/webhook/whatsapp
// </code>
// <p className="text-sm text-gray-500 mt-3">
// Use the <span className="font-semibold text-gray-700 ">Verify Token</span> you configured above.
// </p>
// </div>
// )}

// </div>
// </div>
// );
// // return (
// // <div className="p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] max-w-4xl mx-auto w-full ">
// // <h1 className="text-3xl text-black font-bold mb-8">WhatsApp Integration Settings</h1>
// // {/* already present workspaces */}
// // {avaiableWorkspace && (
// // <div className="mb-8">
// // <h2 className="text-lg font-semibold text-black mb-4">Existing Workspaces</h2>
// // <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// // {avaiableWorkspace.map((ws) => (
// // <div
// // key={ws.workspace_id}
// // onClick={() => {
// // setWorkspace(ws);
// // setStep("configure");
// // setForm({
// // whatsapp_access_token: ws.whatsapp_access_token || "",
// // whatsapp_phone_number_id: ws.whatsapp_phone_number_id || "",
// // whatsapp_verify_token: ws.whatsapp_verify_token
// // });
// // }}
// // className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
// // >
// // <h3 className="font-semibold text-black mb-2">{ws.company_name}</h3>
// // {/* delete button */}
// // <button
// // onClick={() => handleDeleteWorkspace(ws._id)}
// // className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors"
// // >
// // Delete
// // </button>
// // <p className="text-sm text-gray-500">{ws.workspace_id}</p>
// // {ws.whatsapp_access_token && (
// // <p className="text-xs text-green-600 mt-2">✓ Configured</p>
// // )}

// // </div>
// // ))}
// // </div>
// // </div>

// // )}
// // {/* adding back button to move from configure to create workspace */}

// // {/* ── Step 1: Create Workspace ─────────────────────────────────────── */}
// // {step === "create" && (
// // <div className="bg-white p-6 rounded-lg shadow-sm border">
// // <h2 className="text-xl text-black font-semibold mb-2">Create a Workspace</h2>
// // <p className="text-gray-500 text-sm mb-6">
// // First, create a workspace for your company. A unique ID will be
// // generated automatically.
// // </p>

// // <div className="space-y-4">
// // <div>
// // <label className="block text-sm font-medium text-gray-700 mb-1">
// // Company Name
// // </label>
// // <input
// // type="text"
// // value={companyName}
// // onChange={(e) => setCompanyName(e.target.value)}
// // className="w-full p-2 border rounded-md text-sm text-black"
// // placeholder="e.g. Acme Corp"
// // />
// // </div>

// // {error && <p className="text-red-600 text-sm">{error}</p>}

// // <button
// // onClick={handleCreateWorkspace}
// // disabled={creating}
// // className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
// // >
// // {creating ? "Creating..." : "Create Workspace"}
// // </button>
// // </div>
// // </div>
// // )}

// // {/* ── Step 2: Configure WhatsApp ───────────────────────────────────── */}
// // {step === "configure" && workspace && (
// // <div className="bg-white p-6 rounded-lg shadow-sm border">
// // <div className="mb-6">
// // <h2 className="text-xl text-black font-semibold mb-1">
// // Workspace: {workspace.company_name}
// // </h2>
// // <p className="text-gray-800 text-xs font-mono">
// // ID: {workspace.workspace_id}
// // </p>
// // <p className="text-gray-800 text-sm mt-2">
// // Configure your WhatsApp Cloud API credentials to enable messaging.
// // </p>
// // </div>

// // <form onSubmit={handleSaveSettings} className="space-y-6">
// // <div>
// // <label className="block text-sm font-medium text-gray-700 mb-1">
// // Access Token
// // </label>
// // <input
// // type="password"
// // value={form.whatsapp_access_token}
// // onChange={(e) =>
// // setForm({ ...form, whatsapp_access_token: e.target.value })
// // }
// // className="w-full p-2 text-black border rounded-md font-mono text-sm"
// // placeholder="EAA..."
// // />
// // <p className="text-xs text-gray-500 mt-1">
// // Permanent or temporary access token from Meta App Dashboard.
// // </p>
// // </div>

// // <div>
// // <label className="block text-sm font-medium text-gray-700 mb-1">
// // Phone Number ID
// // </label>
// // <input
// // type="text"
// // value={form.whatsapp_phone_number_id}
// // onChange={(e) =>
// // setForm({ ...form, whatsapp_phone_number_id: e.target.value })
// // }
// // className="w-full p-2 text-black border rounded-md font-mono text-sm"
// // placeholder="e.g. 102938475610293"
// // />
// // </div>

// // <div>
// // <label className="block text-sm font-medium text-gray-700 mb-1">
// // Verify Token
// // </label>
// // <input
// // type="text"
// // value={form.whatsapp_verify_token}
// // onChange={(e) =>
// // setForm({ ...form, whatsapp_verify_token: e.target.value })
// // }
// // className="w-full p-2 text-black border rounded-md font-mono text-sm"
// // placeholder="Custom secret string"
// // />
// // <p className="text-xs text-gray-500 mt-1">
// // Used to verify the webhook URL in Meta App Dashboard.
// // </p>
// // </div>

// // {error && <p className="text-red-600 text-sm">{error}</p>}
// // {success && <p className="text-green-600 text-sm">{success}</p>}

// // <div className="pt-4">
// // <button
// // type="submit"
// // disabled={saving}
// // className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
// // >
// // {saving ? "Saving..." : "Save Configuration"}
// // </button>
// // <button
// // onClick={() => setStep("create")}
// // className="bg-black text-white px-6 py-2 ml-2 rounded-md hover:bg-gray-800 transition-colors mb-8"
// // >
// // Back to Workspace Selection
// // </button>
// // </div>
// // </form>
// // </div>
// // )}

// // {/* ── Webhook Info ─────────────────────────────────────────────────── */}
// // {step === "configure" && (
// // <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
// // <h3 className="font-semibold text-blue-900 mb-2">
// // Webhook Configuration
// // </h3>
// // <p className="text-sm text-blue-800 mb-4">
// // In your Meta App Dashboard, set your Webhook URL to:
// // <br />
// // <code className="bg-blue-100 px-2 py-1 rounded select-all block mt-2">
// // https://your-domain.com/api/webhook/whatsapp
// // </code>
// // </p>
// // <p className="text-sm text-blue-800">
// // Use the <strong>Verify Token</strong> you configured above.
// // </p>
// // </div>
// // )}
// // </div>
// // );
// }