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



  return (
    <div className="p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] max-w-4xl mx-auto w-full ">
      <h1 className="text-3xl text-black font-bold mb-8">WhatsApp Integration Settings</h1>
      {/* already present workspaces */}
      {avaiableWorkspace && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-black mb-4">Existing Workspaces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-black mb-2">{ws.company_name}</h3>
                {/* delete button */}
                <button
                  onClick={() => handleDeleteWorkspace(ws._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <p className="text-sm text-gray-500">{ws.workspace_id}</p>
                {ws.whatsapp_access_token && (
                  <p className="text-xs text-green-600 mt-2">✓ Configured</p>
                )}

              </div>
            ))}
          </div>
        </div>

      )}
      {/* adding back button to move from configure to create workspace */}

      {/* ── Step 1: Create Workspace ─────────────────────────────────────── */}
      {step === "create" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl text-black font-semibold mb-2">Create a Workspace</h2>
          <p className="text-gray-500 text-sm mb-6">
            First, create a workspace for your company. A unique ID will be
            generated automatically.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2 border rounded-md text-sm text-black"
                placeholder="e.g. Acme Corp"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              onClick={handleCreateWorkspace}
              disabled={creating}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Configure WhatsApp ───────────────────────────────────── */}
      {step === "configure" && workspace && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="mb-6">
            <h2 className="text-xl text-black font-semibold mb-1">
              Workspace: {workspace.company_name}
            </h2>
            <p className="text-gray-800 text-xs font-mono">
              ID: {workspace.workspace_id}
            </p>
            <p className="text-gray-800 text-sm mt-2">
              Configure your WhatsApp Cloud API credentials to enable messaging.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <input
                type="password"
                value={form.whatsapp_access_token}
                onChange={(e) =>
                  setForm({ ...form, whatsapp_access_token: e.target.value })
                }
                className="w-full p-2 text-black border rounded-md font-mono text-sm"
                placeholder="EAA..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Permanent or temporary access token from Meta App Dashboard.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number ID
              </label>
              <input
                type="text"
                value={form.whatsapp_phone_number_id}
                onChange={(e) =>
                  setForm({ ...form, whatsapp_phone_number_id: e.target.value })
                }
                className="w-full p-2 text-black border rounded-md font-mono text-sm"
                placeholder="e.g. 102938475610293"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verify Token
              </label>
              <input
                type="text"
                value={form.whatsapp_verify_token}
                onChange={(e) =>
                  setForm({ ...form, whatsapp_verify_token: e.target.value })
                }
                className="w-full p-2 text-black border rounded-md font-mono text-sm"
                placeholder="Custom secret string"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used to verify the webhook URL in Meta App Dashboard.
              </p>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Configuration"}
              </button>
              <button
                onClick={() => setStep("create")}
                className="bg-black text-white px-6 py-2 ml-2 rounded-md hover:bg-gray-800 transition-colors mb-8"
              >
                Back to Workspace Selection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Webhook Info ─────────────────────────────────────────────────── */}
      {step === "configure" && (
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2">
            Webhook Configuration
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            In your Meta App Dashboard, set your Webhook URL to:
            <br />
            <code className="bg-blue-100 px-2 py-1 rounded select-all block mt-2">
              https://your-domain.com/api/webhook/whatsapp
            </code>
          </p>
          <p className="text-sm text-blue-800">
            Use the <strong>Verify Token</strong> you configured above.
          </p>
        </div>
      )}
    </div>
  );
}