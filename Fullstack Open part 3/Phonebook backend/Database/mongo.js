// mongo.js
// Usage:
// node mongo.js <password> [<name> <number>]
// If <name> and <number> are provided, adds a new entry. Otherwise, lists all entries.

const { mongoose, Person, connectToDatabase } = require("./Database");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://Dolan:${password}@fullstackopenphonebook.pq2eclk.mongodb.net/?retryWrites=true&w=majority&appName=FullstackOpenPhonebook`;

connectToDatabase(url).catch((err) => console.log(err));

if (process.argv.length === 3) {
  // List all entries
  Person.find({}).then((result) => {
    console.log("phonebook:");
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  // Add a new entry
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });
  person.save().then(() => {
    console.log(`added ${person.name} number ${person.number} to phonebook`);
    mongoose.connection.close();
  });
} else {
  console.log("Usage: node mongo.js <password> [<name> <number>]");
  mongoose.connection.close();
}
