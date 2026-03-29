import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Workspace from "@/models/Workspace";
import Conversation from "@/models/Conversation";

// GET /api/conversations/get?workspaceId=<uuid>
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get("workspaceId"); // UUID string

        if (!workspaceId) {
            return NextResponse.json(
                { success: false, error: "workspaceId is required" },
                { status: 400 }
            );
        }

        // Resolve UUID → MongoDB _id
        const workspace = await Workspace.findOne({ workspace_id: workspaceId });
        if (!workspace) {
            return NextResponse.json(
                { success: false, error: "Workspace not found" },
                { status: 404 }
            );
        }

        const conversations = await Conversation.find({ workspace_id: workspace.workspace_id })
            .sort({ last_message_at: -1 })
            .lean();

        // Serialize _id fields to strings
        const serialized = conversations.map((conv) => ({
            ...conv,
            _id: conv._id.toString(),
            workspace_id: conv.workspace_id.toString(),
        }));

        return NextResponse.json({ success: true, conversations: serialized });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}