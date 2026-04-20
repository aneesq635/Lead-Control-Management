const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API || 'http://localhost:5000';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspace_id = searchParams.get('workspace_id');

    if (!workspace_id) {
      return Response.json(
        { success: false, error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    // Fetch inventory rows from the Python backend
    const res = await fetch(
      `${PYTHON_API}/api/rag/inventory?workspace_id=${workspace_id}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      return Response.json(
        { success: false, error: 'Failed to fetch inventory from Python backend' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const inventory = data.inventory || [];

    // ── Property type distribution ───────────────────────────────
    const typeCounts = {};
    inventory.forEach(item => {
      const t = (item.property_type || 'Unknown').trim();
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    const propertyTypeData = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

    // ── Area distribution ────────────────────────────────────────
    const areaCounts = {};
    inventory.forEach(item => {
      const a = (item.area || 'Unknown').trim();
      areaCounts[a] = (areaCounts[a] || 0) + 1;
    });
    const areaData = Object.entries(areaCounts)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // ── Price range distribution ─────────────────────────────────
    const parsePriceToLakhs = (str) => {
      if (!str) return null;
      const s = str.toLowerCase().replace(/,/g, '').trim();
      const num = parseFloat(s);
      if (isNaN(num)) return null;
      if (s.includes('cr') || s.includes('crore')) return num * 100;
      if (s.includes('l') || s.includes('lakh')) return num;
      if (num >= 100000) return num / 100000;
      return num;
    };

    const priceRanges = {
      'Under 50L': 0,
      '50L – 1Cr': 0,
      '1Cr – 2Cr': 0,
      '2Cr – 5Cr': 0,
      '5Cr+': 0,
      'Unknown': 0,
    };
    inventory.forEach(item => {
      const lakhs = parsePriceToLakhs(item.price);
      if (lakhs === null) { priceRanges['Unknown']++; return; }
      if (lakhs < 50) priceRanges['Under 50L']++;
      else if (lakhs < 100) priceRanges['50L – 1Cr']++;
      else if (lakhs < 200) priceRanges['1Cr – 2Cr']++;
      else if (lakhs < 500) priceRanges['2Cr – 5Cr']++;
      else priceRanges['5Cr+']++;
    });
    const priceData = Object.entries(priceRanges)
      .filter(([, v]) => v > 0)
      .map(([range, count]) => ({ range, count }));

    // ── Size distribution ────────────────────────────────────────
    const sizeCounts = {};
    inventory.forEach(item => {
      const s = (item.size || 'Unknown').trim();
      sizeCounts[s] = (sizeCounts[s] || 0) + 1;
    });
    const sizeData = Object.entries(sizeCounts)
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // ── Summary KPIs ─────────────────────────────────────────────
    const totalListings = inventory.length;
    const uniqueAreas = Object.keys(areaCounts).filter(a => a !== 'Unknown').length;
    const uniqueTypes = Object.keys(typeCounts).filter(t => t !== 'Unknown').length;
    const withOwner = inventory.filter(i => i.owner_name && i.owner_name.trim()).length;

    return Response.json({
      success: true,
      stats: {
        totalListings,
        uniqueAreas,
        uniqueTypes,
        withOwner,
      },
      propertyTypeData,
      areaData,
      priceData,
      sizeData,
      inventory,
    });
  } catch (err) {
    console.error('[GET /api/dashboard/inventory]', err);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
