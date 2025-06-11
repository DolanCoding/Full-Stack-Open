import React from "react";

export default function FilterInput(props) {
  return (
    <div>
      filter list by name:{" "}
      <input value={props.filter} onChange={props.handleFilterChange} />
    </div>
  );
}
