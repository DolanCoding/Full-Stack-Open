import { useEffect, useState } from "react";
import weatherService from "../services/weather";

// Displays detailed info for a single country
function CountryDetails({ country }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (country.capital && country.capital.length > 0) {
      weatherService
        .getWeatherByCity(country.capital[0])
        .then((data) => setWeather(data));
    }
  }, [country]);

  return (
    <div>
      <h2>{country.name.common}</h2>
      <div>Capital: {country.capital ? country.capital.join(", ") : "N/A"}</div>
      <div>Area: {country.area}</div>
      <h3>Languages:</h3>
      <ul>
        {country.languages &&
          Object.values(country.languages).map((lang) => (
            <li key={lang}>{lang}</li>
          ))}
      </ul>
      <img
        src={country.flags.png}
        alt={`Flag of ${country.name.common}`}
        width="150"
      />
      <h3>Weather in {country.capital ? country.capital[0] : ""}</h3>
      {weather ? (
        weather.main ? (
          <div>
            <div>Temperature: {weather.main.temp} °C</div>
            <div>Weather: {weather.weather[0].description}</div>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt="weather icon"
            />
            <div>Wind: {weather.wind.speed} m/s</div>
          </div>
        ) : (
          <div>Weather data not available</div>
        )
      ) : (
        <div>Loading weather...</div>
      )}
    </div>
  );
}

export default CountryDetails;
