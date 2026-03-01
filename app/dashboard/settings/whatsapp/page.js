import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import { revalidatePath } from 'next/cache';

// Mock function to get the current user's workspace ID
// In a real multi-tenant app, this would come from the auth session (e.g. NextAuth)
async function getCurrentWorkspaceId() {
  await dbConnect();
  // For demonstration, we'll just grab the first workspace, or auto-create one
  let workspace = await Workspace.findOne();
  if (!workspace) {
    workspace = await Workspace.create({ company_name: 'Demo Company' });
  }
  return workspace._id;
}

export default async function WhatsAppSettingsPage() {
  const workspaceId = await getCurrentWorkspaceId();
  await dbConnect();
  const workspace = await Workspace.findById(workspaceId);

  async function saveSettings(formData) {
    'use server';
    await dbConnect();
    const wId = formData.get('workspaceId');
    const token = formData.get('whatsapp_access_token');
    const phoneId = formData.get('whatsapp_phone_number_id');
    const verifyToken = formData.get('whatsapp_verify_token');

    await Workspace.findByIdAndUpdate(wId, {
      whatsapp_access_token: token,
      whatsapp_phone_number_id: phoneId,
      whatsapp_verify_token: verifyToken,
    });

    revalidatePath('/dashboard/settings/whatsapp');
  }

  return (
    <div className="p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8">WhatsApp Integration Settings</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Workspace: {workspace.company_name}</h2>
          <p className="text-gray-500 text-sm">Configure your WhatsApp Cloud API credentials to enable messaging.</p>
        </div>

        <form action={saveSettings} className="space-y-6">
          <input type="hidden" name="workspaceId" value={workspace._id.toString()} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
            <input 
              type="password" 
              name="whatsapp_access_token"
              defaultValue={workspace.whatsapp_access_token}
              className="w-full p-2 border rounded-md font-mono text-sm"
              placeholder="EAA..."
            />
            <p className="text-xs text-gray-500 mt-1">Permanent or temporary access token from Meta App Dashboard.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
            <input 
              type="text" 
              name="whatsapp_phone_number_id"
              defaultValue={workspace.whatsapp_phone_number_id}
              className="w-full p-2 border rounded-md font-mono text-sm"
              placeholder="e.g. 102938475610293"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verify Token</label>
            <input 
              type="text" 
              name="whatsapp_verify_token"
              defaultValue={workspace.whatsapp_verify_token}
              className="w-full p-2 border rounded-md font-mono text-sm"
              placeholder="Custom secret string"
            />
            <p className="text-xs text-gray-500 mt-1">Used to verify the webhook URL in Meta App Dashboard.</p>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-2">Webhook Configuration</h3>
        <p className="text-sm text-blue-800 mb-4">
          In your Meta App Dashboard, set your Webhook URL to: <br/>
          <code className="bg-blue-100 px-2 py-1 rounded select-all block mt-2">https://your-domain.com/api/webhook/whatsapp</code>
        </p>
        <p className="text-sm text-blue-800">
          Use the <strong>Verify Token</strong> you configured above.
        </p>
      </div>
    </div>
  );
}
