const { Client } = require("pg");
const config = require("../../config.js");

// const client = new Client({
//   user: "postgres",
//   password: "postgrespass",
//   host: "54.165.184.12",
//   port: 5432,
//   database: "reviews",
// });

const client = new Client({
  user: config.username,
  password: config.password,
  host: config.dbhost,
  port: config.dbport,
  database: config.dbname,
});

client.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to PostgreSQL database: 'reviews'");
});

module.exports = client;
