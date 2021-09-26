const express = require("express");
const cors = require("cors");
const dbConn = require("../dbConn");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const config = require("../config/config.json");
var router = express.Router();
const { verifyToken, saveError, getDateToday } = require("../functions");

var success = {
  code: 200,
  msg: "Action completed successfully!",
};

router.get("/all", (req, res) => {
  console.log("Getting flavors...");
  dbConn.query(
    "SELECT * FROM productFlavors,productFlavorGroup",
    (error, rows) => {
      if (error) {
        saveError(error);
        return res.status(500).send(error);
      }
      return res.status(200).send(rows);
    }
  );
});

router.get("/group", (req, res) => {
  console.log("Getting flavor groups...");
  dbConn.query("SELECT * FROM productFlavorGroup", (error, rows) => {
    if (error) {
      saveError(error);
      return res.status(500).send(error);
    }
    return res.status(200).send(rows);
  });
});

router.post("/group", (req, res) => {
  let data = req.body;
  let id = uuidv4();
  console.log("adding flavor group...", { data });

  dbConn.query(
    "INSERT INTO productFlavorGroup (groupId,flavorTitle) VALUES (TRIM(?),TRIM(?))",
    [id, data.flavorTitle],
    (error, rows) => {
      if (error) {
        saveError(error);
        return res.status(500).send(error);
      }
      dbConn.query(
        "SELECT * FROM productFlavorGroup WHERE groupId=TRIM(?)",
        [id],
        (error, rows) => {
          if (error) {
            saveError(error);
            return res.status(500).send(error);
          }

          return res.status(201).send({ data: rows[0], message: success.msg });
        }
      );
    }
  );
});

router.post("/", (req, res) => {
  let data = req.body;

  dbConn.query(
    "INSERT INTO productFlavors(flavorId,itemName,flavorGroupId) VALUES (TRIM(?),TRIM(?),TRIM(?))",
    [uuidv4(), data.itemName, data.flavorGroupId],
    (error, rows) => {
      if (error) {
        saveError(error);
        return res.status(500).send(error);
      }
      return res.status(201).send(success);
    }
  );
});

module.exports = router;
