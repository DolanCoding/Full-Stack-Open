// Service for fetching weather data from OpenWeatherMap
const api_key = import.meta.env.VITE_SOME_KEY; // <-- Insert your OpenWeatherMap API key here
const baseUrl = "https://api.openweathermap.org/data/2.5/weather";

const getWeatherByCity = (city) => {
  console.log("api_key =", api_key);
  const url = `${baseUrl}?q=${encodeURIComponent(
    city
  )}&appid=${api_key}&units=metric`;
  return fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Weather API error: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .catch((error) => {
      console.error("Weather fetch error:", error);
      return null;
    });
};

const weatherService = { getWeatherByCity };
export default weatherService;
