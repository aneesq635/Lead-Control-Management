import dbConnect from '@/lib/mongodb'   // your existing DB connection helper
import Lead from '@/models/Lead'           // your existing Lead model

export async function GET(request) {
  try {
    
    await dbConnect()

    const { searchParams } = new URL(request.url)
   

    // Optional query params for filtering
    const workspace_id = searchParams.get('workspace_id')
    const status       = searchParams.get('status')       // hot | warm | cold | new
    const followup     = searchParams.get('followup')     // "true"
    const limit        = parseInt(searchParams.get('limit') || '200', 10)

    // Build filter
    const filter = {}
    if (workspace_id) filter.workspace_id = workspace_id
    if (status)       filter.lead_status  = status
    if (followup === 'true') filter.needs_human_followup = true

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()   // plain JS objects, faster serialisation

    return Response.json(
      { success: true, count: leads.length, leads },
      { status: 200 }
    )
  } catch (err) {
    console.error('[GET /api/leads]', err)
    return Response.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}