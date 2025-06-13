export const geocodeAddress = async (address: string, city: string): Promise<[number, number] | null> => {
  try {
    let fullAddress = address ? `${address}, ${city}` : city;
    
    if (!fullAddress.trim()) {
      return null;
    }

    // Handle specific city mappings for known exceptions
    const cityMappings: { [key: string]: string } = {
      'fort lee': 'Fort Lee, NJ',
      'ft. lee': 'Fort Lee, NJ', 
      'ft lee': 'Fort Lee, NJ',
      'paul smiths': 'Paul Smiths, NY',
    };

    const normalizedCity = city.toLowerCase().trim();
    
    // First, try with NY as default (most projects are in NY)
    if (!fullAddress.toLowerCase().includes(' ny') && 
        !fullAddress.toLowerCase().includes(' new york') &&
        !fullAddress.toLowerCase().includes(' nj') &&
        !fullAddress.toLowerCase().includes(' new jersey') &&
        !fullAddress.toLowerCase().includes(' va') &&
        !fullAddress.toLowerCase().includes(' virginia') &&
        !fullAddress.toLowerCase().includes(' md') &&
        !fullAddress.toLowerCase().includes(' maryland')) {
      
      // Check for known exceptions first
      if (cityMappings[normalizedCity]) {
        fullAddress = address ? `${address}, ${cityMappings[normalizedCity]}` : cityMappings[normalizedCity];
      } else {
        // Default to NY for most cities
        fullAddress += ', NY';
      }
    }

    // Try the geocoding request
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

    // If NY didn't work, try surrounding states
    if (!cityMappings[normalizedCity]) {
      const surroundingStates = ['NJ', 'PA', 'VT', 'MA', 'CT', 'VA', 'MD'];
      
      for (const state of surroundingStates) {
        const stateAddress = address ? `${address}, ${city}, ${state}` : `${city}, ${state}`;
        
        try {
          const stateResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(stateAddress)}`
          );

          if (stateResponse.ok) {
            const stateData = await stateResponse.json();
            if (stateData && stateData.length > 0) {
              const result = stateData[0];
              // Add some random variation to avoid exact overlaps
              const lat = parseFloat(result.lat) + (Math.random() - 0.5) * 0.01;
              const lon = parseFloat(result.lon) + (Math.random() - 0.5) * 0.01;
              return [lat, lon];
            }
          }
        } catch (error) {
          // Continue to next state if this one fails
          continue;
        }
      }
    }

    // Final fallback: try just the city name without state
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