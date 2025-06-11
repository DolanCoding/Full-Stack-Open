const mongoose = require("mongoose");

// Centralize connection logic here
function connectToDatabase(uri) {
  mongoose.set("strictQuery", false);
  return mongoose.connect(uri);
}

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

module.exports = { mongoose, Person, connectToDatabase };
