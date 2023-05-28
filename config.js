require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  dbhost: process.env.DBHOST,
  dbport: process.env.DBPORT,
  dbname: process.env.DBNAME,
};
