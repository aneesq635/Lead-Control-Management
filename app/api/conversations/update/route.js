import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

export async function POST(request) {
    try {
        const body = await request.json();
        const { id, agent_run } = body;

        if (!id) {
            return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
        }

        await dbConnect();

        const updateData = {};
        if (agent_run !== undefined) updateData.agent_run = agent_run;


        const conversation = await Conversation.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, conversation });

    } catch (error) {
        console.error('Error updating conversation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
