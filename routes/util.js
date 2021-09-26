const express = require("express");
const cors = require("cors");
const dbConn = require("../dbConn");
const jwt = require("jsonwebtoken");
const config = require("../config/config.json");
var router = express.Router();
const { verifyToken, saveError, getDateToday } = require("../functions");

var success = {
  code: 200,
  msg: "Action completed successfully!",
};

router.get("/countries", (req, res) => {
  console.log("Getting countries...");
  dbConn.query("SELECT * FROM country", (error, rows) => {
    if (error) {
      saveError(error);
      return res.status(500).send(error);
    }
    return res.status(200).send(rows);
  });
});

module.exports = router;
