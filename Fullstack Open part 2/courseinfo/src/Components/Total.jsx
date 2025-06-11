import React from "react";

export default function Total(props) {
  return (
    <p>
      Number of exercises{" "}
      {props.parts.reduce((sum, part) => sum + part.exercises, 0)}
    </p>
  );
}
