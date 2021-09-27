const express = require("express");
const cors = require("cors");
const dbConn = require("../dbConn");
const async = require("async");
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
  let groupId = uuidv4();

  console.log("Adding attributes...", { groupId, data });

  let q1 = `INSERT INTO productFlavorGroup (groupId,flavorTitle,vendorId,allowMultiple) VALUES (TRIM('${groupId}'),TRIM('${data.groupName}'),TRIM('${data.vendorId}'),TRIM(${data.allowMultiple}));`;
  let q2 =
    "INSERT INTO productFlavors(flavorId,itemName,itemPrice,flavorGroupId) VALUES ";

  for (let i = 0; i < data.attributes.length; i++) {
    let item = data.attributes[i];
    if (i != 0) q2 += ", ";
    q2 += `(TRIM('${uuidv4()}'),TRIM('${item.attributeName}'),TRIM('${
      item.price
    }'),TRIM('${groupId}'))`;
  }

  dbConn.query(q1 + q2, (error, rows) => {
    if (error) {
      saveError(error);
      return res.status(500).send(error);
    }
    dbConn.query(
      "SELECT * FROM productFlavorGroup WHERE groupId=TRIM(?)",
      [groupId],
      (error, rows) => {
        if (error) {
          saveError(error);
          return res.status(500).send(error);
        }
        async.map(rows, getAttributes, (error, response) => {
          if (error) {
            saveError(error);
            return res.status(500).send(error);
          }
          res.status(201).send({ data: response[0], message: success.msg });
        });
      }
    );
  });
});

module.exports = router;

function getAttributes(data, cb) {
  dbConn.query(
    "SELECT * FROM productFlavors WHERE flavorGroupId=TRIM(?) ORDER BY itemName",
    [data.groupId],
    (error, rows) => {
      if (error) return cb(error);
      return cb(null, { ...data, attributes: rows });
    }
  );
}
