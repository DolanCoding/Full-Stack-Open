import { useState, useEffect } from "react";
import AddPersonForm from "./Components/AddPersonForm";
import NumberList from "./Components/NumberList";
import FilterInput from "./Components/FilterInput";
import personService from "./personService";
import "./styles.css";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [filter, setFilter] = useState("");
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    personService.getAll().then((data) => setPersons(data));
  }, []);

  const addPerson = (event) => {
    event.preventDefault();
    // Prevent duplicate names
    if (persons.some((person) => person.name === newName)) {
      alert(`${newName} is already added to phonebook`);
      return;
    }
    const personObject = {
      name: newName,
      number: newNumber,
      // id will be assigned by the server
    };
    personService.create(personObject).then((returnedPerson) => {
      setPersons(persons.concat(returnedPerson));
      setSuccessMessage(`Added ${returnedPerson.name} to phonebook!`);
      setTimeout(() => setSuccessMessage(""), 2000);
      setNewName("");
      setNewNumber("");
    });
  };

  const deletePerson = (id) => {
    if (window.confirm("Delete this person?")) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter((person) => person.id !== id));
        })
        .catch((error) => {
          alert("This person was already removed from the server.");
          setPersons(persons.filter((person) => person.id !== id));
        });
    }
  };

  const updatePerson = (id, updatedPerson) => {
    personService
      .update(id, updatedPerson)
      .then((returnedPerson) => {
        setPersons(persons.map((p) => (p.id !== id ? p : returnedPerson)));
      })
      .catch((error) => {
        setSuccessMessage("");
        alert(
          `Information of ${updatedPerson.name} has already been removed from server`
        );
        setPersons(persons.filter((p) => p.id !== id));
      });
  };

  const handleFilterChange = (event) => setFilter(event.target.value);
  const handleNameChange = (event) => setNewName(event.target.value);
  const handleNumberChange = (event) => setNewNumber(event.target.value);

  const filteredPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook</h2>
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      <AddPersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      <NumberList
        numbers={filteredPersons}
        delete={deletePerson}
        update={updatePerson}
      />
      <br />
      <FilterInput filter={filter} handleFilterChange={handleFilterChange} />
    </div>
  );
};

export default App;
