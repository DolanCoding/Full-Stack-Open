const mongoose = require("mongoose");

const url =
  process.env.MONGODB_URI ||
  "mongodb+srv://<your-username>:<your-password>@<your-cluster-url>/phonebook?retryWrites=true&w=majority";

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Remove all whitespace and check length
        return v && v.replace(/\s/g, "").length >= 3;
      },
      message: "Name must be at least 3 non-whitespace characters long.",
    },
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Must be at least 8 characters
        if (!v || v.length < 8) return false;
        // Must match the pattern: 1 to 4 digits, hyphen, then digits (no more hyphens)
        return /^\d{2,3}-\d+$/.test(v);
      },
      message:
        "Phone number must be at least 8 characters, contain a hyphen, start with 2 to 3 digits, and the rest must be digits.",
    },
  },
});

const Person = mongoose.model("Person", personSchema);

module.exports = Person;
