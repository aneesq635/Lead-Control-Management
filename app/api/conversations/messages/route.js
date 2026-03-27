//fetch all messages of all the conversations
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";

export async function GET(request) {
    try {
        await dbConnect();

        const messages = await Message.find({}).sort({ timestamp: 1 }).lean();

        // Serialize _id fields to strings
        const serialized = messages.map((msg) => ({
            ...msg,
            _id: msg._id.toString(),
            workspace_id: msg.workspace_id.toString(),
            conversation_id: msg.conversation_id.toString(),
        }));

        return NextResponse.json({ success: true, messages: serialized });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}