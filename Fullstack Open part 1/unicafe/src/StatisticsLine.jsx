import React from "react";

export default function StatisticsLine(props) {
  return (
    <>
      <td>{props.text}</td>
      <td>{props.value}</td>
    </>
  );
}
