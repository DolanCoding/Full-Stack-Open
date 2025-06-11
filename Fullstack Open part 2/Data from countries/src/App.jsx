import { useState, useEffect } from "react";
import CountryDetails from "./Components/CountryDetails";
import CountryList from "./Components/CountryList";
import SearchInput from "./Components/SearchInput";
import countriesService from "./services/countries";

function App() {
  const [countries, setCountries] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    countriesService.getAll().then((data) => {
      setCountries(data);
      setLoading(false);
    });
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setSelectedCountry(null);
  };

  const handleShowCountry = (name) => {
    const country = countries.find(
      (c) => c.name.common.toLowerCase() === name.toLowerCase()
    );
    setSelectedCountry(country);
  };

  const filtered = countries.filter((country) =>
    country.name.common.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h1>Country Data</h1>
      <SearchInput value={filter} onChange={handleFilterChange} />
      {loading ? (
        <p>Loading...</p>
      ) : filter === "" ? (
        <p>Type to search for countries</p>
      ) : selectedCountry ? (
        <CountryDetails country={selectedCountry} />
      ) : filtered.length > 10 ? (
        <p>Too many matches, specify another filter</p>
      ) : filtered.length > 1 ? (
        <CountryList countries={filtered} onShow={handleShowCountry} />
      ) : filtered.length === 1 ? (
        <CountryDetails country={filtered[0]} />
      ) : (
        <p>No matches</p>
      )}
    </div>
  );
}

export default App;
