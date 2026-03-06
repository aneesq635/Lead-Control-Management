"use client";

import { useEffect, useState } from "react";

export default function WhatsAppSettingsPage() {
  const [step, setStep] = useState("create"); // "create" | "configure"
  const [workspace, setWorkspace] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avaiableWorkspace, setAvaiableWorkspace] = useState([]);

  const [form, setForm] = useState({
    whatsapp_access_token: "",
    whatsapp_phone_number_id: "",
    whatsapp_verify_token: "",
  });

  // fetch already present workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      const res = await fetch("/api/workspace/get");
      const data = await res.json();
      if (data.success) {
        setAvaiableWorkspace(data.workspaces);
      }
    };
    fetchWorkspaces();
  }, [workspace])

  // ── Step 1: Create workspace ──────────────────────────────────────────────
  async function handleCreateWorkspace() {
    setError("");
    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/workspace/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setWorkspace(data.workspace);
      setStep("configure");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  // ── Step 2: Save WhatsApp credentials ────────────────────────────────────
  async function handleSaveSettings(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await fetch("/api/whatsapp/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.workspace_id,   // UUID
          ...form,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSuccess("WhatsApp configuration saved successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

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
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }


// Paste this return() into your WhatsApp settings component
  return (
    <div className="flex-1 p-6 sm:p-8 bg-gray-50 dark:bg-[#0a0a0a] min-h-full">
      <div className="max-w-3xl mx-auto w-full">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            WhatsApp Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage workspaces and configure your WhatsApp Cloud API credentials.
          </p>
        </div>

        {/* Existing Workspaces */}
        {avaiableWorkspace && avaiableWorkspace.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Existing Workspaces
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {avaiableWorkspace.map((ws) => (
                <div
                  key={ws.workspace_id}
                  onClick={() => {
                    setWorkspace(ws);
                    setStep("configure");
                    setForm({
                      whatsapp_access_token: ws.whatsapp_access_token || "",
                      whatsapp_phone_number_id: ws.whatsapp_phone_number_id || "",
                      whatsapp_verify_token: ws.whatsapp_verify_token
                    });
                  }}
                  className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all duration-150 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {ws.company_name}
                      </h3>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                        {ws.workspace_id}
                      </p>
                    </div>
                    {ws.whatsapp_access_token && (
                      <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full">
                        ✓ Configured
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteWorkspace(ws._id); }}
                    className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Create Workspace */}
        {step === "create" && (
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Create a Workspace
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                First, create a workspace for your company. A unique ID will be generated automatically.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all text-sm"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

              <button
                onClick={handleCreateWorkspace}
                disabled={creating}
                className="h-11 px-6 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
              >
                {creating ? "Creating..." : "Create Workspace"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Configure WhatsApp */}
        {step === "configure" && workspace && (
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {workspace.company_name}
                </h2>
              </div>
              <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                ID: {workspace.workspace_id}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Configure your WhatsApp Cloud API credentials to enable messaging.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              {[
                {
                  label: "Access Token",
                  field: "whatsapp_access_token",
                  type: "password",
                  placeholder: "EAA...",
                  hint: "Permanent or temporary access token from Meta App Dashboard."
                },
                {
                  label: "Phone Number ID",
                  field: "whatsapp_phone_number_id",
                  type: "text",
                  placeholder: "e.g. 102938475610293",
                  hint: null
                },
                {
                  label: "Verify Token",
                  field: "whatsapp_verify_token",
                  type: "text",
                  placeholder: "Custom secret string",
                  hint: "Used to verify the webhook URL in Meta App Dashboard."
                }
              ].map(({ label, field, type, placeholder, hint }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
                    placeholder={placeholder}
                  />
                  {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{hint}</p>}
                </div>
              ))}

              {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
              {success && <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-6 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
                >
                  {saving ? "Saving..." : "Save Configuration"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("create")}
                  className="h-11 px-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98]"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Webhook Info */}
        {step === "configure" && (
          <div className="mt-5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Webhook Configuration
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              In your Meta App Dashboard, set your Webhook URL to:
            </p>
            <code className="block text-xs font-mono bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl select-all break-all">
              https://your-domain.com/api/webhook/whatsapp
            </code>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Use the <span className="font-semibold text-gray-700 dark:text-gray-300">Verify Token</span> you configured above.
            </p>
          </div>
        )}

      </div>
    </div>
  );
  // return (
  //   <div className="p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] max-w-4xl mx-auto w-full ">
  //     <h1 className="text-3xl text-black font-bold mb-8">WhatsApp Integration Settings</h1>
  //     {/* already present workspaces */}
  //     {avaiableWorkspace && (
  //       <div className="mb-8">
  //         <h2 className="text-lg font-semibold text-black mb-4">Existing Workspaces</h2>
  //         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  //           {avaiableWorkspace.map((ws) => (
  //             <div
  //               key={ws.workspace_id}
  //               onClick={() => {
  //                 setWorkspace(ws);
  //                 setStep("configure");
  //                 setForm({
  //                   whatsapp_access_token: ws.whatsapp_access_token || "",
  //                   whatsapp_phone_number_id: ws.whatsapp_phone_number_id || "",
  //                   whatsapp_verify_token: ws.whatsapp_verify_token
  //                 });
  //               }}
  //               className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
  //             >
  //               <h3 className="font-semibold text-black mb-2">{ws.company_name}</h3>
  //               {/* delete button */}
  //               <button
  //                 onClick={() => handleDeleteWorkspace(ws._id)}
  //                 className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors"
  //               >
  //                 Delete
  //               </button>
  //               <p className="text-sm text-gray-500">{ws.workspace_id}</p>
  //               {ws.whatsapp_access_token && (
  //                 <p className="text-xs text-green-600 mt-2">✓ Configured</p>
  //               )}

  //             </div>
  //           ))}
  //         </div>
  //       </div>

  //     )}
  //     {/* adding back button to move from configure to create workspace */}

  //     {/* ── Step 1: Create Workspace ─────────────────────────────────────── */}
  //     {step === "create" && (
  //       <div className="bg-white p-6 rounded-lg shadow-sm border">
  //         <h2 className="text-xl text-black font-semibold mb-2">Create a Workspace</h2>
  //         <p className="text-gray-500 text-sm mb-6">
  //           First, create a workspace for your company. A unique ID will be
  //           generated automatically.
  //         </p>

  //         <div className="space-y-4">
  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-1">
  //               Company Name
  //             </label>
  //             <input
  //               type="text"
  //               value={companyName}
  //               onChange={(e) => setCompanyName(e.target.value)}
  //               className="w-full p-2 border rounded-md text-sm text-black"
  //               placeholder="e.g. Acme Corp"
  //             />
  //           </div>

  //           {error && <p className="text-red-600 text-sm">{error}</p>}

  //           <button
  //             onClick={handleCreateWorkspace}
  //             disabled={creating}
  //             className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
  //           >
  //             {creating ? "Creating..." : "Create Workspace"}
  //           </button>
  //         </div>
  //       </div>
  //     )}

  //     {/* ── Step 2: Configure WhatsApp ───────────────────────────────────── */}
  //     {step === "configure" && workspace && (
  //       <div className="bg-white p-6 rounded-lg shadow-sm border">
  //         <div className="mb-6">
  //           <h2 className="text-xl text-black font-semibold mb-1">
  //             Workspace: {workspace.company_name}
  //           </h2>
  //           <p className="text-gray-800 text-xs font-mono">
  //             ID: {workspace.workspace_id}
  //           </p>
  //           <p className="text-gray-800 text-sm mt-2">
  //             Configure your WhatsApp Cloud API credentials to enable messaging.
  //           </p>
  //         </div>

  //         <form onSubmit={handleSaveSettings} className="space-y-6">
  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-1">
  //               Access Token
  //             </label>
  //             <input
  //               type="password"
  //               value={form.whatsapp_access_token}
  //               onChange={(e) =>
  //                 setForm({ ...form, whatsapp_access_token: e.target.value })
  //               }
  //               className="w-full p-2 text-black border rounded-md font-mono text-sm"
  //               placeholder="EAA..."
  //             />
  //             <p className="text-xs text-gray-500 mt-1">
  //               Permanent or temporary access token from Meta App Dashboard.
  //             </p>
  //           </div>

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-1">
  //               Phone Number ID
  //             </label>
  //             <input
  //               type="text"
  //               value={form.whatsapp_phone_number_id}
  //               onChange={(e) =>
  //                 setForm({ ...form, whatsapp_phone_number_id: e.target.value })
  //               }
  //               className="w-full p-2 text-black border rounded-md font-mono text-sm"
  //               placeholder="e.g. 102938475610293"
  //             />
  //           </div>

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-1">
  //               Verify Token
  //             </label>
  //             <input
  //               type="text"
  //               value={form.whatsapp_verify_token}
  //               onChange={(e) =>
  //                 setForm({ ...form, whatsapp_verify_token: e.target.value })
  //               }
  //               className="w-full p-2 text-black border rounded-md font-mono text-sm"
  //               placeholder="Custom secret string"
  //             />
  //             <p className="text-xs text-gray-500 mt-1">
  //               Used to verify the webhook URL in Meta App Dashboard.
  //             </p>
  //           </div>

  //           {error && <p className="text-red-600 text-sm">{error}</p>}
  //           {success && <p className="text-green-600 text-sm">{success}</p>}

  //           <div className="pt-4">
  //             <button
  //               type="submit"
  //               disabled={saving}
  //               className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
  //             >
  //               {saving ? "Saving..." : "Save Configuration"}
  //             </button>
  //             <button
  //               onClick={() => setStep("create")}
  //               className="bg-black text-white px-6 py-2 ml-2 rounded-md hover:bg-gray-800 transition-colors mb-8"
  //             >
  //               Back to Workspace Selection
  //             </button>
  //           </div>
  //         </form>
  //       </div>
  //     )}

  //     {/* ── Webhook Info ─────────────────────────────────────────────────── */}
  //     {step === "configure" && (
  //       <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
  //         <h3 className="font-semibold text-blue-900 mb-2">
  //           Webhook Configuration
  //         </h3>
  //         <p className="text-sm text-blue-800 mb-4">
  //           In your Meta App Dashboard, set your Webhook URL to:
  //           <br />
  //           <code className="bg-blue-100 px-2 py-1 rounded select-all block mt-2">
  //             https://your-domain.com/api/webhook/whatsapp
  //           </code>
  //         </p>
  //         <p className="text-sm text-blue-800">
  //           Use the <strong>Verify Token</strong> you configured above.
  //         </p>
  //       </div>
  //     )}
  //   </div>
  // );
}