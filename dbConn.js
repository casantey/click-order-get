const config = require("./config/config.json");
const mysql = require("mysql");
const chalk = require("chalk");
const functions = require("./functions");

var dbConn;

function connectDatabase() {
  if (!dbConn) {
    dbConn = mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.pwd,
      database: config.db,
      multipleStatements: true,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    dbConn.connect((error) => {
      if (!error) {
        //when there is no error
        console.log(
          chalk.hex("#03A847")(
            `Database connected to ${chalk.bold(config.host)} at ${chalk.bold(
              functions.getDateToday()
            )}!`
          )
        );
        console.log(
          `${chalk.hex("#ffae4e")(
            "-----------------------------------------------"
          )}\n`
        );
      } else {
        //when there is an error
        functions.saveError(error);
        console.log(
          chalk.hex("#f44336")(
            chalk.underline.bold("Database Connection failed!\nError:")
          ) +
            " " +
            JSON.stringify(error, undefined, 2)
        );
      }
    }); //END dbConn
  }
  return dbConn;
}

module.exports = connectDatabase();

setInterval(function () {
  dbConn.query("SELECT 1");
}, 5000);
