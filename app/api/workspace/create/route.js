import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Workspace from "@/models/Workspace";
import { v4 as uuidv4 } from "uuid";

// POST /api/workspace/create
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { company_name, supabase_id } = body;

    if (!company_name || !company_name.trim()) {
      return NextResponse.json(
        { success: false, error: "company_name is required" },
        { status: 400 }
      );
    }

    const workspace = await Workspace.create({
      workspace_id: uuidv4(),   // human-readable UUID stored as a field
      company_name: company_name.trim(),
      supabase_id,
    });

    return NextResponse.json({ success: true, workspace }, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/workspace/create  →  list all workspaces (useful for dev/demo)
export async function GET() {
  try {
    await dbConnect();
    const workspaces = await Workspace.find({}, "-whatsapp_access_token"); // hide token
    return NextResponse.json({ success: true, workspaces });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}