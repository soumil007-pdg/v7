'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin, Star, ArrowLeft, ExternalLink, Phone, AlertTriangle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DirectoryClient({ initialCity = 'Pitampura' }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get('category') || 'legal';

  const [city, setCity] = useState(initialCity);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Fetch lawyers
  const fetchLawyers = async (searchCity) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/lawyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: searchCity, category })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch');

      setLawyers(data.lawyers || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect location
  const detectMyLocation = () => {
    setDetectingLocation(true);
    if (!navigator.geolocation) {
      alert("Your browser doesn't support location");
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );
          const data = await res.json();

          const detectedCity = data.address?.suburb ||
                              data.address?.city ||
                              data.address?.town ||
                              'Delhi';

          setCity(detectedCity);
          await fetchLawyers(detectedCity);
        } catch (e) {
          console.log("Reverse geocode failed, using Delhi");
          setCity('Delhi');
          await fetchLawyers('Delhi');
        }
        setDetectingLocation(false);
      },
      (err) => {
        alert("Location access denied. Please type city manually.");
        setDetectingLocation(false);
      }
    );
  };

  // Initial load
  useEffect(() => {
    fetchLawyers(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white py-20 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Legal Directory</h1>
            <p className="text-gray-400 text-lg mt-1">
              {category} lawyers in <span className="font-semibold text-white">{city}</span>
            </p>
          </div>

          <Button
            variant="brand"
            size="md"
            onClick={detectMyLocation}
            disabled={detectingLocation}
          >
            <Navigation size={20} />
            {detectingLocation ? 'Detecting...' : 'Use My Current Location'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="text-center">
            <AlertTriangle className="mx-auto mb-4" size={48} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-[#1E1E1E] h-64 rounded-xl animate-pulse" />)}
          </div>
        ) : lawyers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No lawyers found. Try another area.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.map((lawyer) => (
              <div key={lawyer.id} className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 hover:border-[#FF5B33] transition-all">
                <h2 className="text-xl font-bold mb-2 line-clamp-2">{lawyer.name}</h2>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="directory">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    {lawyer.rating}
                  </Badge>
                  <span className="text-gray-400">({lawyer.reviews} reviews)</span>
                </div>

                <div className="flex items-start gap-2 text-gray-400 text-sm mb-6">
                  <MapPin size={18} className="mt-0.5" />
                  <p className="line-clamp-3">{lawyer.address}</p>
                </div>

                <div className="flex flex-col gap-3">
                  {lawyer.phone && (
                    <a href={`tel:${lawyer.phone}`} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-semibold transition">
                      <Phone size={18} /> Call {lawyer.phone}
                    </a>
                  )}

                  <a href={lawyer.googleMapsUrl} target="_blank" rel="noreferrer"
                     className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl font-semibold transition">
                    <ExternalLink size={18} /> Get Directions
                  </a>

                  {lawyer.website && (
                    <a href={lawyer.website} target="_blank" rel="noreferrer"
                       className="text-center text-sm text-blue-400 hover:underline">Visit Website</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
