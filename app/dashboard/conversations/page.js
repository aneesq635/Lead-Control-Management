import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import Conversation from '@/models/Conversation';
import Link from 'next/link';

// Mock function to get the current user's workspace ID
async function getCurrentWorkspaceId() {
  await dbConnect();
  const workspace = await Workspace.findOne();
  return workspace?._id;
}

export default async function ConversationsPage() {
  const workspaceId = await getCurrentWorkspaceId();

  if (!workspaceId) {
    return (
      <div className="p-8">
        <p>No workspace found. Please configure settings first.</p>
        <Link href="/dashboard/settings/whatsapp" className="text-blue-600 underline">Go to Settings</Link>
      </div>
    );
  }

  await dbConnect();
  
  // Find all conversations for this workspace, sorted by most recent
  const conversations = await Conversation.find({ workspace_id: workspaceId })
    .sort({ last_message_at: -1 })
    .lean();

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b bg-white">
        <h1 className="text-2xl font-bold">Inbox</h1>
      </header>

      <div className="flex-1 overflow-auto p-4 max-w-5xl mx-auto w-full">
        {conversations.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>No conversations yet.</p>
            <p className="text-sm mt-2">When customers message your WhatsApp number, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border divide-y">
            {conversations.map((conv) => (
              <Link 
                key={conv._id.toString()} 
                href={`/dashboard/conversations/${conv._id.toString()}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center bg-transparent">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{conv.phone}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Started: {new Date(conv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(conv.last_message_at).toLocaleString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
