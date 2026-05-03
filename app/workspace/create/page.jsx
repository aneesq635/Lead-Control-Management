"use client";

import { useState } from "react";
import { useAuth } from "../../component/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setWorkspace, setSelectedWorkspace } from "../../component/MainSlice";

export default function CreateWorkspacePage() {
    const [companyName, setCompanyName] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuth();
    const router = useRouter();
    const supabase_id = user?.id;
    const workspaces = useSelector((state) => state.main.workspace); // Redux se current workspaces lo
    console.log("workspace ka data ", workspaces);
    const dispatch = useDispatch();

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

            console.log("data after workspace creation", data);
            if (!data.success) throw new Error(data.error);
            // ✅ Naya workspace Redux mein add karo - real time update
            const newWorkspace = data.workspace; // API se naya workspace aata hai
            console.log("before Workspace", workspaces);
            const updatedWorkspaces = [newWorkspace, ...workspaces];
            dispatch(setWorkspace(updatedWorkspaces));
            dispatch(setSelectedWorkspace(newWorkspace)); // auto-select new one
            console.log("updatedWorkspaces", updatedWorkspaces);
            console.log("newWorkspace", newWorkspace);

            // go back to whatsapp settings after creation
            router.push("/dashboard/settings/whatsapp");
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="flex-1 p-6 sm:p-8 bg-gray-50 [#0a0a0a] min-h-screen overflow-y-hidden">
            <div className="max-w-xl mx-auto w-full">

                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 :text-white mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Create Workspace
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        A unique workspace ID will be generated automatically.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white [#111] border border-gray-200 rounded-2xl p-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
                                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 [#0a0a0a] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black :ring-white focus:border-transparent transition-all text-sm"
                                placeholder="e.g. Acme Corp"
                                autoFocus
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={handleCreateWorkspace}
                                disabled={creating}
                                className="h-11 px-6 bg-black hover:bg-gray-800 :bg-gray-100 text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
                            >
                                {creating ? "Creating..." : "Create Workspace"}
                            </button>
                            <button
                                onClick={() => router.back()}
                                className="h-11 px-6 border border-gray-200 hover:border-gray-300 :border-gray-600 text-gray-700 bg-white [#0a0a0a] hover:bg-gray-50 :bg-[#111] rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98]"
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