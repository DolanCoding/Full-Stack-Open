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
  const [errorMessage, setErrorMessage] = useState("");
  const [filteredPersons, setFilteredPersons] = useState([]);

  useEffect(() => {
    personService.getAll().then((data) => {
      console.log("Fetched persons:", data);
      setPersons(Array.isArray(data) ? data : []);
    });
  }, []);

  useEffect(() => {
    setFilteredPersons(
      Array.isArray(persons)
        ? persons.filter(
            (person) =>
              person &&
              person.name &&
              person.name.toLowerCase().includes(filter.toLowerCase())
          )
        : []
    );
  }, [persons, filter]);

  const addPerson = (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    const existingPerson = persons.find((person) => person.name === newName);
    const personObject = {
      name: newName,
      number: newNumber,
    };
    if (existingPerson) {
      // Update number in the database and update the entry in the frontend
      personService
        .update(existingPerson.id, { ...existingPerson, number: newNumber })
        .then((returnedPerson) => {
          setPersons(
            persons.map((p) =>
              p.id !== existingPerson.id ? p : returnedPerson
            )
          );
          setSuccessMessage(`Updated ${returnedPerson.name}'s number!`);
          setTimeout(() => setSuccessMessage(""), 2000);
          setNewName("");
          setNewNumber("");
        })
        .catch(() => {
          setErrorMessage("Validation error");
          setTimeout(() => setErrorMessage(""), 3000);
        });
    } else {
      // Create new entry in the database and add to the frontend
      personService
        .create(personObject)
        .then((returnedPerson) => {
          if (!returnedPerson || !returnedPerson.name) {
            setErrorMessage(
              "Could not add person - name has to be 3 chars at minimum!"
            );
            setTimeout(() => setErrorMessage(""), 3000);
            return;
          }
          setPersons(persons.concat(returnedPerson));
          setSuccessMessage(`Added ${returnedPerson.name} to phonebook!`);
          setTimeout(() => setSuccessMessage(""), 2000);
          setNewName("");
          setNewNumber("");
        })
        .catch(() => {
          setErrorMessage("Validation error");
          setTimeout(() => setErrorMessage(""), 3000);
        });
    }
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

  return (
    <div>
      <h2>Phonebook</h2>
      {errorMessage && (
        <div className="error-message" style={{ color: "red" }}>
          {errorMessage}
        </div>
      )}
      {successMessage && !errorMessage && (
        <div className="success-message" style={{ color: "green" }}>
          {successMessage}
        </div>
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
