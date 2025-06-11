const express = require("express");
const morgan = require("morgan");
const fs = require("fs").promises;
const path = require("path");
const app = express();

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

const DB_PATH = path.join(__dirname, "db.json");

async function readPersons() {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

async function writePersons(persons) {
  await fs.writeFile(DB_PATH, JSON.stringify(persons, null, 2));
}

app.get("/api/persons", async (req, res) => {
  const persons = await readPersons();
  res.json(persons);
});

app.get("/info", async (req, res) => {
  const persons = await readPersons();
  const count = persons.length;
  const date = new Date();
  res.send(
    `<div>Phonebook has info for ${count} people</div><div>${date}</div>`
  );
});

app.get("/api/persons/:id", async (req, res) => {
  const persons = await readPersons();
  const id = req.params.id;
  const person = persons.find((p) => p.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", async (req, res) => {
  const id = req.params.id;
  let persons = await readPersons();
  const index = persons.findIndex((p) => p.id === id);
  if (index !== -1) {
    persons.splice(index, 1);
    await writePersons(persons);
    res.status(204).end();
  } else {
    res.status(404).end();
  }
});

app.post("/api/persons", async (req, res) => {
  const body = req.body;
  let persons = await readPersons();
  if (!body.name || !body.number) {
    return res.status(400).json({ error: "name or number missing" });
  }
  if (persons.some((p) => p.name === body.name)) {
    return res.status(400).json({ error: "name must be unique" });
  }
  const person = {
    id: Date.now().toString(),
    name: body.name,
    number: body.number,
  };
  persons.push(person);
  await writePersons(persons);
  res.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
