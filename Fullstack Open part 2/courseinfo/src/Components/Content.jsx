import React from "react";
import Part from "./Part";

export default function Content({ parts }) {
  return (
    <>
      {parts.map((item, index) => (
        <Part key={index} part={item.name} exercises={item.exercises} />
      ))}
    </>
  );
}
