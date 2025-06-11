export const geocodeAddress = async (address: string, city: string): Promise<[number, number] | null> => {
  try {
    const fullAddress = address ? `${address}, ${city}` : city;
    
    if (!fullAddress.trim()) {
      return null;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(fullAddress)}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return [parseFloat(result.lat), parseFloat(result.lon)];
    }

    if (address && city) {
      const cityResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(city)}`
      );

      if (cityResponse.ok) {
        const cityData = await cityResponse.json();
        if (cityData && cityData.length > 0) {
          const result = cityData[0];
          // Add some random variation to avoid exact overlaps
          const lat = parseFloat(result.lat) + (Math.random() - 0.5) * 0.01;
          const lon = parseFloat(result.lon) + (Math.random() - 0.5) * 0.01;
          return [lat, lon];
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

export const isValidCoordinates = (lat: number, lon: number): boolean => {
  return (
    typeof lat === 'number' && 
    typeof lon === 'number' &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180 &&
    !isNaN(lat) && !isNaN(lon)
  );
};