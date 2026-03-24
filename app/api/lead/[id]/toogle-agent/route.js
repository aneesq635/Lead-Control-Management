// app/api/leads/[id]/toggle-agent/route.js  (naya file banao)

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';

// Admin agent ko on/off kar sakta hai
export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params; // Lead _id

        const body = await request.json();
        const { needs_human_followup } = body; // true = agent off, false = agent on

        const lead = await Lead.findByIdAndUpdate(
            id,
            { needs_human_followup },
            { new: true }
        );

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: needs_human_followup
                ? 'Agent band kar diya — Admin handle karega'
                : 'Agent dobara on kar diya',
            lead
        });

    } catch (error) {
        console.error('Toggle agent error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}