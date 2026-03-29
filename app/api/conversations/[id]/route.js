import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
        }

        await dbConnect();

        const conversation = await Conversation.findById(id).lean();

        if (!conversation) {
            return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
        }

        const messages = await Message.find({ conversation_id: id })
            .sort({ timestamp: 1 })
            .lean();

        const workspace = await Workspace.findOne({ workspace_id: conversation.workspace_id }).lean();

        // Serialize _id to strings
        const serializedConversation = {
            ...conversation,
            _id: conversation._id.toString(),
            workspace_id: conversation.workspace_id.toString(),
        };

        const serializedMessages = messages.map(msg => ({
            ...msg,
            _id: msg._id.toString(),
            workspace_id: msg.workspace_id.toString(),
            conversation_id: msg.conversation_id.toString(),
        }));

        const serializedWorkspace = workspace ? {
            ...workspace,
            _id: workspace._id.toString(),
        } : null;

        return NextResponse.json({
            success: true,
            conversation: serializedConversation,
            messages: serializedMessages,
            workspace: serializedWorkspace
        });

    } catch (error) {
        console.error("Error fetching conversation details:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
