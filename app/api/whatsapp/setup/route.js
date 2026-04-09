import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Workspace from "@/models/Workspace";

// POST /api/whatsapp/setup
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const {
            workspaceId, // this is now the UUID string
            whatsapp_access_token,
            whatsapp_phone_number_id,
            whatsapp_verify_token,
        } = body;

        if (!workspaceId) {
            return NextResponse.json(
                { success: false, error: "workspaceId is required" },
                { status: 400 }
            );
        }

        const workspace = await Workspace.findOneAndUpdate(
            { workspace_id: workspaceId }, // query by UUID field
            { whatsapp_access_token, whatsapp_phone_number_id, whatsapp_verify_token },
            { new: true }
        );

        if (!workspace) {
            return NextResponse.json(
                { success: false, error: "Workspace not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, workspace });
    } catch (error) {
        console.error("Error setting up WhatsApp:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}