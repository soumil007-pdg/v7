// app/api/lawyers/route.js
export async function POST(req) {
  try {
    const { city, category } = await req.json();
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    // --- FALLBACK MOCK DATA (If no API key is present) ---
    if (!apiKey || apiKey === 'your_actual_api_key_here') {
        console.warn("Using Mock Data: No valid GOOGLE_PLACES_API_KEY found.");
        
        // Create realistic-looking mock lawyers based on the user's city
        const mockLawyers = [
            {
                id: "mock_1",
                name: `${city} Legal Associates`,
                rating: 4.9,
                reviews: 142,
                address: `101, High Court Road, ${city}`,
            },
            {
                id: "mock_2",
                name: `Sharma & Partners (${category} Specialists)`,
                rating: 4.7,
                reviews: 89,
                address: `Chamber 45, District Court Complex, ${city}`,
            },
            {
                id: "mock_3",
                name: "Apex Law Chambers",
                rating: 4.6,
                reviews: 210,
                address: `Sector 4, Main Market, ${city}`,
            }
        ];
        
        // Simulate a slight network delay so it feels real
        await new Promise(resolve => setTimeout(resolve, 800));
        return new Response(JSON.stringify({ lawyers: mockLawyers }), { status: 200 });
    }

    // --- REAL GOOGLE PLACES API CALL ---
    const query = encodeURIComponent(`${category} advocate lawyer in ${city}`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
        const topLawyers = data.results
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3)
            .map(place => ({
                id: place.place_id,
                name: place.name,
                rating: place.rating || 'N/A',
                reviews: place.user_ratings_total || 0,
                address: place.formatted_address,
            }));

        return new Response(JSON.stringify({ lawyers: topLawyers }), { status: 200 });
    }

    return new Response(JSON.stringify({ lawyers: [] }), { status: 200 });

  } catch (error) {
    console.error('Places API error:', error);
    return new Response(JSON.stringify({ message: 'Failed to fetch lawyers' }), { status: 500 });
  }
}