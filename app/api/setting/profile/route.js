// app/api/settings/profile/route.js
import { NextResponse } from "next/server";
import Workspace from "../../../../models/Workspace";

const GRAPH_API_VERSION = "v23.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Fetch the current WhatsApp Business Profile
 * GET /api/settings/profile
 */
export async function GET() {
  const phoneNumberId = process.env.whatsapp_phone_number_id;
  const accessToken = process.env.whatsapp_access_token;

  if (!phoneNumberId || !accessToken) {
    return NextResponse.json(
      { error: "WhatsApp credentials are not configured." },
      { status: 500 },
    );
  }

  try {
    const fields =
      "about,address,description,email,websites,vertical,profile_picture_url";
    const url = `${GRAPH_BASE}/${phoneNumberId}/whatsapp_business_profile?fields=${fields}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      // Don't cache — always fetch fresh profile data
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[Profile GET] Meta API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Failed to fetch profile from Meta." },
        { status: res.status },
      );
    }

    return NextResponse.json({ profile: data });
  } catch (err) {
    console.error("[Profile GET] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

/**
 * Update the WhatsApp Business Profile
 * POST /api/settings/profile
 * Body: multipart/form-data
 *   - picture?  (File)    — profile picture
 *   - name?     (string)  — display name (note: name changes require Meta review)
 *   - about?    (string)  — short tagline, max 139 chars
 *   - description? (string) — full description, max 512 chars
 *   - address?  (string)
 *   - email?    (string)
 *   - website?  (string)  — up to 2 allowed
 *   - vertical? (string)  — business category enum
 */
export async function POST(request) {
  const formData = await request.formData();

  const workspace_id = formData.get("workspace_id");
  console.log("in server workspace_id",workspace_id);
  const workspace = await Workspace.findOne({ _id: workspace_id });
  console.log("in server",workspace);

  const phoneNumberId =
    workspace?.whatsapp_phone_number_id || workspace?.whatsapp_number;
  const accessToken = workspace?.whatsapp_access_token;

  if (!phoneNumberId || !accessToken) {
    return NextResponse.json(
      { error: "WhatsApp credentials are not configured." },
      { status: 500 },
    );
  }
  try {
    const pictureFile = formData.get("picture");
    const name = formData.get("name") || null;
    const about = formData.get("about") || null;
    const description = formData.get("description") || null;
    const address = formData.get("address") || null;
    const email = formData.get("email") || null;
    const website = formData.get("website") || null;
    const vertical = formData.get("vertical") || null;

    // ── Step 1: Upload profile picture (if provided) ──────────────────────
    let profilePictureHandle = null;

    if (pictureFile && pictureFile.size > 0) {
      profilePictureHandle = await uploadProfilePicture(
        pictureFile,
        phoneNumberId,
        accessToken,
      );
    }

    // ── Step 2: Build profile payload ─────────────────────────────────────
    const profilePayload = {
      messaging_product: "whatsapp",
    };

    if (about) profilePayload.about = about.slice(0, 139);
    if (description) profilePayload.description = description.slice(0, 512);
    if (address) profilePayload.address = address;
    if (email) profilePayload.email = email;
    if (vertical) profilePayload.vertical = vertical;

    // Websites: Meta accepts up to 2 in an array
    if (website) profilePayload.websites = [website];

    // Profile picture — attach the uploaded media handle
    if (profilePictureHandle) {
      profilePayload.profile_picture_handle = profilePictureHandle;
    }

    // ── Step 3: POST to whatsapp_business_profile ─────────────────────────
    const profileRes = await fetch(
      `${GRAPH_BASE}/${phoneNumberId}/whatsapp_business_profile`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profilePayload),
      },
    );

    const profileData = await profileRes.json();

    if (!profileRes.ok) {
      console.error("[Profile POST] Meta API error:", profileData);
      return NextResponse.json(
        { error: profileData.error?.message || "Failed to update profile." },
        { status: profileRes.status },
      );
    }

    // ── Step 4: (Optional) update display name separately ─────────────────
    // Display name changes go through a separate endpoint and require
    // Meta review. Only attempt if name was provided.
    if (name) {
      const nameResult = await updateDisplayName(
        phoneNumberId,
        accessToken,
        name,
      );
      if (!nameResult.ok) {
        // Non-fatal: profile was saved, but name update failed
        return NextResponse.json({
          success: true,
          warning: `Profile saved, but display name update failed: ${nameResult.error}`,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Profile POST] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload a profile picture to the WhatsApp Media API.
 * Returns the media handle (h= value) needed for profile_picture_handle.
 *
 * Docs: POST /{phone-number-id}/media
 */
async function uploadProfilePicture(file, phoneNumberId, accessToken) {
  const uploadForm = new FormData();
  uploadForm.append("messaging_product", "whatsapp");
  uploadForm.append("type", file.type); // e.g. image/png
  uploadForm.append("file", file);

  const res = await fetch(`${GRAPH_BASE}/${phoneNumberId}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: uploadForm,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Failed to upload profile picture.");
  }

  // The API returns { id: "..." } — this id is used as profile_picture_handle
  return data.id;
}

/**
 * Update the WhatsApp Business display name.
 * Requires Meta review — result may be PENDING.
 *
 * Docs: POST /{phone-number-id}/  (using name_status field)
 */
async function updateDisplayName(phoneNumberId, accessToken, name) {
  try {
    const res = await fetch(`${GRAPH_BASE}/${phoneNumberId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error?.message || "Name update failed." };
    }

    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
