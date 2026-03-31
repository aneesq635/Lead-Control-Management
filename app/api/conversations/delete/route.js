import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import Lead from "@/models/Lead";

export async function DELETE(req) {
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

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return NextResponse.json(
                { success: false, error: "Conversation not found" },
                { status: 404 }
            );
        }

        // delete messages
        await Message.deleteMany({ conversation_id: conversationId });

        // delete lead
        const leadDoc = await Lead.findOne({ conversation_id: conversationId });
        if (leadDoc) {
            await leadDoc.deleteOne();
        }

        // delete conversation
        await conversation.deleteOne();

        return NextResponse.json(
            { success: true, message: "Conversation deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}