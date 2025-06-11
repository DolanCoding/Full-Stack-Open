const baseUrl = "http://localhost:3001/persons";

const getAll = () => {
  return fetch(baseUrl).then((response) => response.json());
};

const create = (newPerson) => {
  return fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPerson),
  }).then((response) => response.json());
};

const remove = (id) => {
  return fetch(`${baseUrl}/${id}`, {
    method: "DELETE",
  });
};

const update = (id, updatedPerson) => {
  return fetch(`${baseUrl}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedPerson),
  }).then((response) => response.json());
};

const personService = { getAll, create, remove, update };
export default personService;
