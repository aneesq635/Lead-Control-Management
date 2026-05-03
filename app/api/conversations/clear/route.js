import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";


export async function POST(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get("id");

        if (!conversationId) {
            return NextResponse.json(
                { success: false, error: "Conversation ID is required" },
                { status: 400 }
            );
        }

        // Delete all messages for this conversation
        await Message.deleteMany({ conversation_id: conversationId });

        // Reset last_message_at if needed, or leave it. 
        // Usually, clearing chat means starting fresh but keeping the contact.
        
        return NextResponse.json(
            { success: true, message: "Chat cleared successfully" },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
