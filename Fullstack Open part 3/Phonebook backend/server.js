require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const fs = require("fs").promises;
const path = require("path");
const app = express();
const Person = require("./Database/models/person");

morgan.token("post-data", (req) =>
  req.method === "POST" ? JSON.stringify(req.body) : ""
);
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :post-data"
  )
);

const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

app.get("/api/persons", async (req, res) => {
  const persons = await Person.find({});
  res.json(
    persons.map((person) => ({
      id: person._id.toString(),
      name: person.name,
      number: person.number,
    }))
  );
});

app.get("/api/persons/:id", async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);
    if (person) {
      res.json({
        id: person._id.toString(),
        name: person.name,
        number: person.number,
      });
    } else {
      res.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

app.get("/info", async (req, res, next) => {
  try {
    const persons = await Person.find({});
    const count = persons.length;
    const date = new Date();
    const personList = persons
      .map(
        (person) => `${person._id.toString()} ${person.name} ${person.number}`
      )
      .join("<br>");
    res.send(
      `<div>Phonebook has info for ${count} people</div><div>${date}</div><br><div>${personList}</div>`
    );
  } catch (error) {
    next(error);
  }
});

app.delete("/api/persons/:id", async (req, res, next) => {
  try {
    const result = await Person.findByIdAndDelete(req.params.id);
    if (result) {
      res.status(204).end(); // No Content
    } else {
      res.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

app.post("/api/persons", async (req, res, next) => {
  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({ error: "name or number missing" });
  }
  try {
    // Check if a person with the same name exists
    const existing = await Person.findOne({ name: body.name });
    if (existing) {
      // If exists, update the number and return the updated person
      existing.number = body.number;
      const updatedPerson = await existing.save();
      return res.json({
        id: updatedPerson._id.toString(),
        name: updatedPerson.name,
        number: updatedPerson.number,
      });
    }
    // If not exists, create a new person
    const person = new Person({
      name: body.name,
      number: body.number,
    });
    const savedPerson = await person.save();
    res.json({
      id: savedPerson._id.toString(),
      name: savedPerson.name,
      number: savedPerson.number,
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/persons/:id", async (req, res, next) => {
  const { name, number } = req.body;
  try {
    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      { name, number },
      { new: true, runValidators: true, context: "query" }
    );
    if (updatedPerson) {
      res.json({
        id: updatedPerson._id.toString(),
        name: updatedPerson.name,
        number: updatedPerson.number,
      });
    } else {
      res.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

// SPA fallback for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Error handler middleware
const errorHandler = (error, req, res, next) => {
  if (error.name === "CastError") {
    return res.status(400).json({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }
  console.error(error.message);
  res.status(500).json({ error: "internal server error" });
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
