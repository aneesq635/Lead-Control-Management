"use client";

import { useState } from "react";
import { useAuth } from "../../component/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CreateWorkspacePage() {
  const [companyName, setCompanyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const router = useRouter();
  const supabase_id = user?.id;

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
        body: JSON.stringify({ company_name: companyName, supabase_id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      // go back to whatsapp settings after creation
      router.push("/dashboard/settings/whatsapp");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex-1 p-6 sm:p-8 bg-gray-50 dark:bg-[#0a0a0a] min-h-full">
      <div className="max-w-xl mx-auto w-full">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Create Workspace
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            A unique workspace ID will be generated automatically.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all text-sm"
                placeholder="e.g. Acme Corp"
                autoFocus
              />
            </div>

            {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleCreateWorkspace}
                disabled={creating}
                className="h-11 px-6 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
              >
                {creating ? "Creating..." : "Create Workspace"}
              </button>
              <button
                onClick={() => router.back()}
                className="h-11 px-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}