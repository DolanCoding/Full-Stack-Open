// Service for fetching country data
const baseUrl = "https://studies.cs.helsinki.fi/restcountries/api";

const getAll = () => {
  return fetch(`${baseUrl}/all`).then((res) => res.json());
};

const countriesService = { getAll };
export default countriesService;
