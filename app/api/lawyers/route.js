// app/api/lawyers/route.js
export async function POST(req) {
  try {
    const { city, category, lat, lng } = await req.json();
    const apiToken = process.env.APIFY_API_TOKEN;

    if (!apiToken || apiToken === '<YOUR_API_TOKEN>') {
      return new Response(JSON.stringify({ message: 'Missing APIFY_API_TOKEN in .env' }), { status: 500 });
    }

    // 🔥 THE FIX: Removed the hardcoded "Delhi" so it respects the user's actual city
    const searchTerm = `${category} lawyer advocate in ${city}`;
    const locationQuery = city ? `${city}, India` : "India";

    const input = {
      searchStringsArray: [searchTerm],
      locationQuery: locationQuery,
      countryCode: "in",
      maxCrawledPlacesPerSearch: 15, // Limit results slightly so it loads faster
      scrapePlaceDetailPage: false, // 🔥 FIX: Set to false! This makes the scraper 10x faster
      maxReviews: 0,
      language: "en",
      
      // Forces Indian residential proxy
      proxyConfiguration: {
        useApifyProxy: true,
        apifyProxyCountry: "IN",
        apifyProxyGroups: ["RESIDENTIAL"]
      }
    };

    console.log(`Scraping lawyers: "${searchTerm}" in location: "${locationQuery}"`);

    const apifyUrl = `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=${apiToken}`;

    const response = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Apify Error:", errorText);
      return new Response(JSON.stringify({ message: 'Apify failed. Check token or credits.' }), { status: 502 });
    }

    const items = await response.json();

    const allLawyers = items.map((place, index) => {
      // Safely calculate the review count
      let reviewCount = 0;
      if (typeof place.reviewsCount === 'number') {
          reviewCount = place.reviewsCount;
      } else if (typeof place.numberOfReviews === 'number') {
          reviewCount = place.numberOfReviews;
      } else if (Array.isArray(place.reviews)) {
          reviewCount = place.reviews.length;
      }

      // Safe fallback for Google Maps URL
      const fallbackMapUrl = `https://google.com/maps/search/?api=1&query=$${encodeURIComponent((place.title || place.name || '') + ' ' + (place.address || ''))}`;

      return {
        id: place.id || place.placeId || `lawyer_${index}`,
        name: place.title || place.name || 'Unnamed Lawyer',
        rating: place.totalScore || place.rating || place.stars || 'N/A',
        reviews: reviewCount,
        address: place.address || place.formattedAddress || 'Address not available',
        phone: place.phone || place.phoneNumber || place.phoneUnformatted || null,
        website: place.website || null,
        googleMapsUrl: place.url || place.googleMapsUrl || fallbackMapUrl
      };
    });

    console.log(`✅ Found ${allLawyers.length} lawyers for ${city || 'India'}`);
    
    return new Response(JSON.stringify({ lawyers: allLawyers }), { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      message: 'Server error while fetching lawyers',
      errorDetail: error.message 
    }), { status: 500 });
  }
}