import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Workspace from "@/models/Workspace";

export async function POST(request) {
    try {
        await dbConnect();
        const { workspaceId } = await request.json();
        console.log("workspaceId", workspaceId);
        const workspace = await Workspace.findByIdAndDelete(workspaceId);
        return NextResponse.json({ success: true, workspace });
    } catch (error) {
        console.log("error", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}