// fetch all messages of all conversation based on workspace id
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";

export async function GET(req){
    try {
        await dbConnect();
        const {searchParams} = new URL(req.url);
        const workspaceId = searchParams.get("workspaceId");
        const messages = await Message.find({workspace_id:workspaceId});
        return NextResponse.json({success:true,messages});
    } catch (error) {
        return NextResponse.json({success:false,error:error.message});
    }
}
