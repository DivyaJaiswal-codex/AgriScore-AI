/**
 * Weather Service for AgriScore AI
 * Integrates OpenWeather API with a fallback to Open-Meteo API.
 */
export async function fetchWeatherData(location, apiKey = null) {
  // 1. Try OpenWeather API if API key is provided
  if (apiKey && apiKey.trim() !== "") {
    try {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      
      if (geoData && geoData.length > 0) {
        const { lat, lon, name, state, country } = geoData[0];
        
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const weatherRes = await fetch(weatherUrl);
        const wData = await weatherRes.json();
        
        if (wData.main) {
          // OpenWeather rain may be in rain['1h'] or rain['3h']
          let rainAmount = 0;
          if (wData.rain) {
            rainAmount = wData.rain['1h'] || wData.rain['3h'] || 0;
          }
          
          return {
            success: true,
            temp: wData.main.temp,
            humidity: wData.main.humidity,
            rain: rainAmount,
            locationName: `${name}, ${state || country || ""}`,
            source: "OpenWeather"
          };
        }
      }
    } catch (err) {
      console.warn("OpenWeather API call failed. Falling back to Open-Meteo...", err);
    }
  }

  // 2. Fallback to free Open-Meteo API
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    
    if (geoData.results && geoData.results.length > 0) {
      const { latitude, longitude, name, admin1 } = geoData.results[0];
      
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      const wData = await weatherRes.json();
      
      if (wData.current) {
        return {
          success: true,
          temp: wData.current.temperature_2m,
          humidity: wData.current.relative_humidity_2m,
          rain: wData.current.rain || 0,
          locationName: `${name}, ${admin1 || ""}`,
          source: "Open-Meteo"
        };
      }
    }
  } catch (err) {
    console.warn("Open-Meteo backup lookup failed", err);
  }

  return { success: false };
}
