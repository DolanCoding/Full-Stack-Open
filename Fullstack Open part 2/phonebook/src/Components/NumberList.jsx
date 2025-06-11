import React from "react";

export default function NumberList(props) {
  return props.numbers.map((person) => (
    <p key={person.id}>
      {person.name} {person.number}{" "}
      <button onClick={() => props.delete(person.id)}>delete</button>{" "}
      <button
        onClick={() => {
          const newNumber = prompt(
            `Enter new number for ${person.name}:`,
            person.number
          );
          if (newNumber && newNumber !== person.number) {
            props.update(person.id, { ...person, number: newNumber });
          }
        }}
      >
        update
      </button>
    </p>
  ));
}
