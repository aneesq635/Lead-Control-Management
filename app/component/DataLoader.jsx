"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "./AuthContext";
import {
    setLeads,
    setWorkspace,
    setSelectedWorkspace,
    setConversation,
    setAllMessages,
} from "./MainSlice";

export function DataLoader() {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const supabase_id = user?.id;
    const selectedWorkspace = useSelector((state) => state.main.selectedWorkspace);
    const workspaces = useSelector((state) => state.main.workspaces);   

    // Fetch leads
    useEffect(() => {
        if (!supabase_id || !selectedWorkspace) return; // Optional: Only fetch leads if user is logged in
        
        const fetchLeads = async () => {
            try {
                const res = await fetch(`/api/dashboard/stats?workspace_id=${selectedWorkspace?.workspace_id}`);
                if (!res.ok) throw new Error('Failed to fetch leads');
                const data = await res.json();
                dispatch(setLeads(data.leads || []));
            } catch (e) {
                console.log("error while fetching lead", e.message);
            }
        };
        fetchLeads();
    }, [supabase_id, dispatch, selectedWorkspace]);

    // Fetch workspaces
    useEffect(() => {
        if (!supabase_id) return;
        const fetchWorkspaces = async () => {
            try {
                const res = await fetch(`/api/workspace/get?supabase_id=${supabase_id}`);
                const data = await res.json();
                if (data.success) {
                    dispatch(setWorkspace(data.workspaces));
                    if (data.workspaces.length > 0) {
                        // Only set if none is currently selected to prevent overriding
                        dispatch(setSelectedWorkspace(data.workspaces[0]));
                    }
                }
            } catch (err) {
                console.error('Error fetching workspaces:', err);
            }
        };
        fetchWorkspaces();
    }, [supabase_id, dispatch]);

    // Fetch conversations when a workspace is selected
    useEffect(() => {
        if (!selectedWorkspace) return;

        const fetchConversations = async () => {
            try {
                const res = await fetch(
                    `/api/conversations/get?workspaceId=${selectedWorkspace.workspace_id}`
                );
                const data = await res.json();
                if (data.success) {
                    dispatch(setConversation(data.conversations));
                } else {
                    console.log("Failed to get conversations");
                }
            } catch (err) {
                console.log("Error fetching conversations:", err);
            }
        };
        fetchConversations();
    }, [selectedWorkspace, dispatch]);

    // Fetch all messages when a workspace is selected
    useEffect(() => {
        if (!selectedWorkspace) return;
        
        const fetchMessages = async () => {
            try {
                const res = await fetch(
                    `/api/messages/get?workspaceId=${selectedWorkspace.workspace_id}`
                );
                const data = await res.json();
                if (data.success) {
                    dispatch(setAllMessages(data.messages));
                } else {
                    console.log("Failed to get messages");
                }
            } catch (err) {
                console.log("Error fetching messages:", err);
            }
        };
        fetchMessages();
    }, [selectedWorkspace, dispatch]);

    return null; // This is purely a logic component
}
