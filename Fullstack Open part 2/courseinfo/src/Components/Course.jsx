import Header from "./Header";
import Content from "./Content";
import Total from "./Total";

import React from "react";

export default function Course({ course }) {
  return (
    <div>
      <Header course={course.name} />
      <Content parts={course.parts} />
      <Total parts={course.parts} />
    </div>
  );
}
