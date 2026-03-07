import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Workspace from "@/models/Workspace";

export async function GET(request) {
    try {
        const {searchParams} = new URL(request.url);
        const supabase_id = searchParams.get("supabase_id")
        await dbConnect();
        const workspaces = await Workspace.find({supabase_id});
        return NextResponse.json({ success: true, workspaces });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}