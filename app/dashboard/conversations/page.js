"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../component/AuthContext";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { setConversation, deleConversation, setAddConversation } from "@/app/component/MainSlice";
import {Trash2} from "lucide-react"
import {useWorkspaceSocket} from "@/lib/socket/client"
// import { useChartLayout } from "recharts/types/context/chartLayoutContext";

export default function ConversationsPage() {
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [error, setError] = useState("");
    const { user } = useAuth();
    const supabase_id = user?.id;

    const selectedWorkspace = useSelector((state)=> state.main.selectedWorkspace)
    const conversations = useSelector((state)=> state.main.conversations)
    const leads = useSelector((state)=> state.main.leads)
    const currentLead = leads.filter((lead)=>lead.workspace_id === selectedWorkspace?.workspace_id)
    console.log("currentLead", currentLead)
    console.log("conversations", conversations)
    const dispatch =  useDispatch()


    useEffect(()=>{
        if(conversations){
        setLoadingConversations(false)
    }
    },[conversations])
    const  handleDelete =async (id)=>{
        try{
            const response = await fetch(`/api/conversations/delete?id=${id}`,{
                method:"DELETE",
                headers:{
                    "Content-Type":"application/json"
                }
            })
            const data = await response.json()
            if(data.success){
                dispatch(deleConversation(id))
            }
        }catch(error){
            console.log(error)
        }
    }
    console.log("selected workspace,", selectedWorkspace)
    const handleConversationUpdate =  useCallback((conversation)=>{
        console.log("updating the conversation")
          dispatch(setAddConversation(conversation))
          console.log("converatino after updation", conversations)

    })
   
    const {} = useWorkspaceSocket(selectedWorkspace?.workspace_id, handleConversationUpdate)
   
    
    // Still loading auths
    if (!supabase_id) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[50vh] bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-black animate-spin" />
                    </div>
                    <p className="text-xs font-medium text-gray-400 tracking-wider uppercase">Loading</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">

            {/* Header */}
            <header className="px-6 py-4 border-b border-gray-200 bg-white flex items-center gap-4 flex-wrap shrink-0">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Conversations</h1>

                {selectedWorkspace && (
                    <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">
                        {selectedWorkspace.company_name}
                    </span>
                )}
            </header>

            {/* Body */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="max-w-3xl mx-auto w-full">

                    {/* No workspace selected */}
                    {!selectedWorkspace && (
                        <div className="text-center py-24">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🏢</span>
                            </div>
                            <p className="font-semibold text-gray-700">No workspace selected</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Choose a workspace from the sidebar to view its conversations.
                            </p>
                        </div>
                    )}

                    {/* Loading conversations */}
                    {selectedWorkspace && loadingConversations && (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
                                    <div className="h-3.5 bg-gray-200 rounded-lg w-1/3 mb-2" />
                                    <div className="h-2.5 bg-gray-100 rounded-lg w-1/4" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="text-center py-10 text-red-500 text-sm">{error}</div>
                    )}

                    {/* Conversations list */}
                    {selectedWorkspace && !loadingConversations && !error && (
                        conversations.length === 0 ? (
                            <div className="text-center py-24">
                                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">📭</span>
                                </div>
                                <p className="font-semibold text-gray-700">No conversations yet</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    When customers message your WhatsApp number, they'll appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {conversations.map((conv) => (
                                    <Link
                                        key={conv._id}
                                        href={`/dashboard/conversations/${conv._id}`}
                                        className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-150 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                                                {conv.name?.slice(0,1).toUpperCase() || conv.phone?.slice(-2)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm">{conv.name || conv.phone}</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Started {new Date(conv.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 shrink-0 ml-4">
                                            {new Date(conv.last_message_at).toLocaleString([], {
                                                month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                            <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDelete(conv._id);
                                            }}
                                            className="text-red-500 hover:text-red-700 ml-4 cursor-pointer"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                        </div>
                                        
                                    </Link>
                                ))}
                            </div>
                        )
                    )}

                </div>
            </div>
        </div>
    );
}

// "use client";

// import { useEffect, useState } from "react";
// import {useAuth} from "../../component/AuthContext"
// import Link from "next/link";

// export default function ConversationsPage() {
//  const [workspaces, setWorkspaces] = useState([]);
//  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
//  const [conversations, setConversations] = useState([]);
//  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
//  const [loadingConversations, setLoadingConversations] = useState(false);
//  const [error, setError] = useState("");
//  const {user} = useAuth();
//  const supabase_id = user?.id

//  // Fetch all workspaces on mount
//  useEffect(() => {
//  // waiting if supabase id is not avaiable
//  if(!supabase_id) {
//  return;
//  }
//  const fetchWorkspaces = async () => {
//  setLoadingWorkspaces(true);
//  try {
//  const res = await fetch(`/api/workspace/get?supabase_id=${supabase_id}`);
//  const data = await res.json();
//  if (data.success) {
//  setWorkspaces(data.workspaces);
//  } else {
//  setError("Failed to load workspaces.");
//  }
//  } catch (err) {
//  setError("Error fetching workspaces.");
//  } finally {
//  setLoadingWorkspaces(false);
//  }
//  };
//  fetchWorkspaces();
//  }, [supabase_id]);

//  // Fetch conversations when a workspace is selected
//  useEffect(() => {
//  if (!selectedWorkspace) return;

//  const fetchConversations = async () => {
//  setLoadingConversations(true);
//  setConversations([]);
//  setError("");
//  try {
//  const res = await fetch(
//  `/api/conversations/get?workspaceId=${selectedWorkspace.workspace_id}`
//  );
//  const data = await res.json();
//  console.log('data from conversations', data)
//  if (data.success) {
//  setConversations(data.conversations);
//  } else {
//  setError("Failed to load conversations.");
//  }
//  } catch (err) {
//  setError("Error fetching conversations.");
//  } finally {
//  setLoadingConversations(false);
//  }
//  };
//  fetchConversations();
//  }, [selectedWorkspace]);

//  if (!supabase_id) {
//  return (
//  <div className="flex-1 flex items-center justify-center min-h-[50vh] bg-gray-50 [#0a0a0a]">
//  <div className="flex flex-col items-center gap-4">
//  <div className="relative w-10 h-10">
//  <div className="absolute inset-0 rounded-full border-2 border-gray-200 " />
//  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-black animate-spin" />
//  </div>
//  <p className="text-xs font-medium text-gray-400 tracking-wider uppercase">
//  Loading
//  </p>
//  </div>
//  </div>
//  );
//  }

//  // ── No workspaces found ────────────────────────────────────────────────────
//  if (!loadingWorkspaces && workspaces.length === 0) {
//  return (
//  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
//  <div className="text-5xl mb-4">💬</div>
//  <h2 className="text-xl font-semibold text-gray-800 mb-2">No Workspaces Found</h2>
//  <p className="text-gray-500 mb-6 text-sm">
//  Please configure a workspace before viewing conversations.
//  </p>
//  <Link
//  href="/dashboard/settings/whatsapp"
//  className="bg-black text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
//  >
//  Go to Settings
//  </Link>
//  </div>
//  );
//  }
// // Paste this return() into your Conversations list component
//  return (
//  <div className="flex flex-col h-full bg-gray-50 [#0a0a0a]">

//  {/* Header */}
//  <header className="px-6 py-4 border-b border-gray-200 bg-white [#111] flex items-center gap-4 flex-wrap shrink-0">
//  <h1 className="text-xl font-bold text-gray-900 tracking-tight">
//  Conversations
//  </h1>

//  {/* Workspace Selector */}
//  <div className="flex items-center gap-2.5 ml-auto flex-wrap">
//  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
//  Workspace
//  </span>
//  {loadingWorkspaces ? (
//  <div className="h-9 w-44 bg-gray-100 rounded-xl animate-pulse" />
//  ) : (
//  <select
//  value={selectedWorkspace?.workspace_id || ""}
//  onChange={(e) => {
//  const ws = workspaces.find((w) => w.workspace_id === e.target.value);
//  setSelectedWorkspace(ws || null);
//  }}
//  className="h-9 px-3 rounded-xl border border-gray-200 bg-white [#0a0a0a] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-black :ring-white transition-all"
//  >
//  <option value="">Select workspace…</option>
//  {workspaces.map((ws) => (
//  <option key={ws.workspace_id} value={ws.workspace_id}>
//  {ws.company_name}
//  </option>
//  ))}
//  </select>
//  )}
//  </div>
//  </header>

//  {/* Body */}
//  <div className="flex-1 overflow-auto p-4 sm:p-6">
//  <div className="max-w-3xl mx-auto w-full">

//  {/* No workspace selected */}
//  {!selectedWorkspace && !loadingWorkspaces && (
//  <div className="text-center py-24">
//  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
//  <span className="text-2xl">🏢</span>
//  </div>
//  <p className="font-semibold text-gray-700 ">No workspace selected</p>
//  <p className="text-sm text-gray-400 mt-1">
//  Choose a workspace above to view its conversations.
//  </p>
//  </div>
//  )}

//  {/* Loading */}
//  {selectedWorkspace && loadingConversations && (
//  <div className="space-y-2">
//  {[...Array(5)].map((_, i) => (
//  <div key={i} className="bg-white [#111] rounded-2xl border border-gray-200 p-4 animate-pulse">
//  <div className="h-3.5 bg-gray-200 rounded-lg w-1/3 mb-2" />
//  <div className="h-2.5 bg-gray-100 rounded-lg w-1/4" />
//  </div>
//  ))}
//  </div>
//  )}

//  {/* Error */}
//  {error && (
//  <div className="text-center py-10 text-red-500 text-sm">{error}</div>
//  )}

//  {/* Conversations */}
//  {selectedWorkspace && !loadingConversations && !error && (
//  conversations.length === 0 ? (
//  <div className="text-center py-24">
//  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
//  <span className="text-2xl">📭</span>
//  </div>
//  <p className="font-semibold text-gray-700 ">No conversations yet</p>
//  <p className="text-sm text-gray-400 mt-1">
//  When customers message your WhatsApp number, they'll appear here.
//  </p>
//  </div>
//  ) : (
//  <div className="space-y-2">
//  {conversations.map((conv) => (
//  <Link
//  key={conv._id}
//  href={`/dashboard/conversations/${conv._id}`}
//  className="flex justify-between items-center bg-white [#111] border border-gray-200 rounded-2xl p-4 hover:border-gray-300 :border-gray-600 hover:shadow-sm transition-all duration-150 group"
//  >
//  <div className="flex items-center gap-3">
//  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
//  {conv.phone?.slice(-2)}
//  </div>
//  <div>
//  <h3 className="font-semibold text-gray-900 text-sm">{conv.phone}</h3>
//  <p className="text-xs text-gray-400 mt-0.5">
//  Started {new Date(conv.created_at).toLocaleDateString()}
//  </p>
//  </div>
//  </div>
//  <div className="text-xs text-gray-400 shrink-0 ml-4">
//  {new Date(conv.last_message_at).toLocaleString([], {
//  month: 'short', day: 'numeric',
//  hour: '2-digit', minute: '2-digit'
//  })}
//  </div>
//  </Link>
//  ))}
//  </div>
//  )
//  )}

//  </div>
//  </div>
//  </div>
//  );
 // return (
 // <div className="flex flex-col h-full">
 // {/* Header */}
 // <header className="p-4 border-b bg-white flex items-center gap-4 flex-wrap">
 // <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>

 // {/* Workspace Selector */}
 // <div className="flex items-center gap-2 ml-auto flex-wrap">
 // <span className="text-sm text-gray-500 font-medium">Workspace:</span>
 // {loadingWorkspaces ? (
 // <div className="h-9 w-48 bg-gray-100 rounded-md animate-pulse" />
 // ) : (
 // <select
 // value={selectedWorkspace?.workspace_id || ""}
 // onChange={(e) => {
 // const ws = workspaces.find(
 // (w) => w.workspace_id === e.target.value
 // );
 // setSelectedWorkspace(ws || null);
 // }}
 // className="border rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
 // >
 // <option value="">-- Select a Workspace --</option>
 // {workspaces.map((ws) => (
 // <option key={ws.workspace_id} value={ws.workspace_id}>
 // {ws.company_name}
 // </option>
 // ))}
 // </select>
 // )}
 // </div>
 // </header>

 // {/* Body */}
 // <div className="flex-1 overflow-auto p-4 max-w-5xl mx-auto w-full">
 // {/* No workspace selected yet */}
 // {!selectedWorkspace && !loadingWorkspaces && (
 // <div className="text-center py-20 text-gray-400">
 // <div className="text-5xl mb-4">🏢</div>
 // <p className="text-lg font-medium text-gray-600">Select a workspace above</p>
 // <p className="text-sm mt-1">to view its conversations.</p>
 // </div>
 // )}

 // {/* Loading conversations */}
 // {selectedWorkspace && loadingConversations && (
 // <div className="space-y-3">
 // {[...Array(4)].map((_, i) => (
 // <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
 // <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
 // <div className="h-3 bg-gray-100 rounded w-1/4" />
 // </div>
 // ))}
 // </div>
 // )}

 // {/* Error */}
 // {error && (
 // <div className="text-center py-10 text-red-500 text-sm">{error}</div>
 // )}

 // {/* Conversations list */}
 // {selectedWorkspace && !loadingConversations && !error && (
 // <>
 // {conversations.length === 0 ? (
 // <div className="text-center py-20 text-gray-500">
 // <div className="text-5xl mb-4">📭</div>
 // <p className="font-medium text-gray-600">No conversations yet.</p>
 // <p className="text-sm mt-2">
 // When customers message your WhatsApp number, they will appear here.
 // </p>
 // </div>
 // ) : (
 // <div className="bg-white rounded-lg shadow-sm border divide-y">
 // {conversations.map((conv) => (
 // <Link
 // key={conv._id}
 // href={`/dashboard/conversations/${conv._id}`}
 // className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
 // >
 // <div>
 // <h3 className="font-semibold text-gray-900">{conv.phone}</h3>
 // <p className="text-xs text-gray-400 mt-1">
 // Started: {new Date(conv.created_at).toLocaleDateString()}
 // </p>
 // </div>
 // <div className="text-sm text-gray-400">
 // {new Date(conv.last_message_at).toLocaleString()}
 // </div>
 // </Link>
 // ))}
 // </div>
 // )}
 // </>
 // )}
 // </div>
 // </div>
 // );
// }


// import dbConnect from '@/lib/mongodb';
// import Workspace from '@/models/Workspace';
// import Conversation from '@/models/Conversation';
// import Link from 'next/link';

// // Mock function to get the current user's workspace ID
// async function getCurrentWorkspaceId() {
// await dbConnect();
// const workspace = await Workspace.findOne();
// return workspace?._id;
// }

// export default async function ConversationsPage() {
// const workspaceId = await getCurrentWorkspaceId();

// if (!workspaceId) {
// return (
// <div className="p-8">
// <p>No workspace found. Please configure settings first.</p>
// <Link href="/dashboard/settings/whatsapp" className="text-blue-600 underline">Go to Settings</Link>
// </div>
// );
// }

// await dbConnect();
 
// // Find all conversations for this workspace, sorted by most recent
// const conversations = await Conversation.find({ workspace_id: workspaceId })
// .sort({ last_message_at: -1 })
// .lean();

// return (
// <div className="flex flex-col h-full">
// <header className="p-4 border-b bg-white">
// <h1 className="text-2xl font-bold">Inbox</h1>
// </header>

// <div className="flex-1 overflow-auto p-4 max-w-5xl mx-auto w-full">
// {conversations.length === 0 ? (
// <div className="text-center py-20 text-gray-500">
// <p>No conversations yet.</p>
// <p className="text-sm mt-2">When customers message your WhatsApp number, they will appear here.</p>
// </div>
// ) : (
// <div className="bg-white rounded-lg shadow-sm border divide-y">
// {conversations.map((conv) => (
// <Link 
// key={conv._id.toString()} 
// href={`/dashboard/conversations/${conv._id.toString()}`}
// className="block p-4 hover:bg-gray-50 transition-colors"
// >
// <div className="flex justify-between items-center bg-transparent">
// <div>
// <h3 className="font-semibold text-lg text-gray-900">{conv.phone}</h3>
// <p className="text-sm text-gray-500 mt-1">
// Started: {new Date(conv.created_at).toLocaleDateString()}
// </p>
// </div>
// <div className="text-sm text-gray-400">
// {new Date(conv.last_message_at).toLocaleString()}
// </div>
// </div>
// </Link>
// ))}
// </div>
// )}
// </div>
// </div>
// );
// }
