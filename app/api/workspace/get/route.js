import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Workspace from "@/models/Workspace";

export async function GET() {
    try {
        await dbConnect();
        const workspaces = await Workspace.find();
        return NextResponse.json({ success: true, workspaces });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}