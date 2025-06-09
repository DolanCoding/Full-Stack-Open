import React from "react";
import StatisticsLine from "./StatisticsLine";

export default function Statistics({ good, neutral, bad }) {
  const total = good + neutral + bad;
  const average = (good * 1 + neutral * 0 + bad * -1) / total || 0;

  if (total > 0) {
    return (
      <>
        <h1>Statistics</h1>
        <table>
          <tbody>
            <tr>
              <StatisticsLine text="good" value={good} />
            </tr>
            <tr>
              <StatisticsLine text="neutral" value={neutral} />
            </tr>
            <tr>
              <StatisticsLine text="bad" value={bad} />
            </tr>
            <tr>
              <StatisticsLine text="all" value={total} />
            </tr>
            <tr>
              <StatisticsLine
                text="positive"
                value={(good / total) * 100 + "%"}
              />
            </tr>
            <tr>
              <StatisticsLine
                text="negative"
                value={(bad / total) * 100 + "%"}
              />
            </tr>
            <tr>
              <StatisticsLine text="average" value={average} />
            </tr>
          </tbody>
        </table>
      </>
    );
  } else {
    return (
      <>
        <h1>Statistics</h1>
        <p>No feedback given</p>
      </>
    );
  }
}
