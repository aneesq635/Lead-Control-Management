import dbConnect from './mongodb';
import Workspace from '../models/Workspace';

/**
 * Sends a WhatsApp text message using the Cloud API for a specific workspace.
 * 
 * @param {string} workspace_id - The ID of the workspace sending the message.
 * @param {string} to_phone - The recipient's phone number with country code.
 * @param {string} message_text - The text message to send.
 * @returns {Record<string, any>} The API response from Facebook/WhatsApp.
 */
export async function send_whatsapp_message(workspace_id, to_phone, message_text) {
  await dbConnect();

  // Retrieve the workspace to get its access token and Phone Number ID
  const workspace = await Workspace.findOne({ workspace_id });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  if (!workspace.whatsapp_access_token || !workspace.whatsapp_phone_number_id) {
    throw new Error('Workspace WhatsApp credentials are not fully configured');
  }

  const url = `https://graph.facebook.com/v19.0/${workspace.whatsapp_phone_number_id}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to_phone,
    type: 'text',
    text: {
      preview_url: false,
      body: message_text,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${workspace.whatsapp_access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('WhatsApp API Error Response:', data);
    throw new Error(`WhatsApp API error: ${data.error?.message || 'Unknown error'}`);
  }

  return data;
}
