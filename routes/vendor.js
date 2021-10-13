const express = require("express");
const cors = require("cors");
const dbConn = require("../dbConn");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const async = require("async");
const config = require("../config/config.json");
var router = express.Router();
const { verifyToken, saveError, getDateToday } = require("../functions");

var success = {
  code: 200,
  msg: "Action completed successfully!",
};

router.get("/all", (req, res) => {
  console.log("Getting vendors...");
  dbConn.query("SELECT * FROM vendors ORDER BY vendorName", (error, rows) => {
    if (error) {
      saveError(error);
      return res
        .status(400)
        .send({ error, message: "Could not complete Action" });
    }
    return res.status(200).send(rows);
  });
});

router.put("/:id", (req, res) => {
  let id = req.params.id;
  let body = req.body;
  console.log("Modifying details...", { id, body });

  dbConn.query(
    "UPDATE vendors SET vendorName = TRIM(?),vendorPhone = TRIM(?),vendorEmail = TRIM(?),vendorDescription = TRIM(?),latitude = TRIM(?),longitude = TRIM(?)WHERE vendorId = TRIM(?)",
    [
      body.vendorName,
      body.vendorPhone,
      body.vendorEmail,
      body.vendorDescription,
      body.latitude,
      body.longitude,
      id,
    ],
    (error, rows) => {
      if (error) {
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not update vendor details" });
      }
      dbConn.query(
        "SELECT * FROM vendors WHERE vendorId=TRIM(?)",
        [id],
        (error, rows) => {
          if (error) {
            saveError(error);
            return res
              .status(400)
              .send({ error, message: "Could not complete Action" });
          }
          async.map([{ ...rows[0] }], getVendorProducts, (error, response) => {
            if (error) {
              saveError({ error });
            }
            console.log({ response });
            return res.send(response[0]);
          });
        }
      );
    }
  );
});

router.get("/:id", (req, res) => {
  let id = req.params.id;

  console.log("getting vendor details", { id });

  dbConn.query(
    "SELECT * FROM vendors WHERE vendorId=TRIM(?)",
    [id],
    (error, rows) => {
      if (error) {
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not get vendor details" });
      }

      // return res.status(200).send({ data: rows[0], message: success.msg });
      async.map([{ ...rows[0] }], getVendorProducts, (error, response) => {
        if (error) {
          saveError({ error });
        }
        console.log({ response });
        return res
          .status(200)
          .send({ data: response[0], message: success.msg });
      });
    }
  );
});

router.post("/", (req, res) => {
  let data = req.body;
  let id = uuidv4();

  console.log("Adding vendor...", { data });

  dbConn.query(
    "INSERT INTO vendors (vendorId,vendorLogo, vendorName,vendorDescription,vendorPhone,vendorEmail, latitude,longitude) VALUES (TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?))",
    [
      id,
      data.vendorLogo,
      data.vendorName,
      data.vendorDescription,
      data.vendorPhone,
      data.vendorEmail,
      data.latitude,
      data.longitude,
    ],
    (error, rows) => {
      if (error) {
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      dbConn.query(
        "SELECT * FROM vendors WHERE vendorId=TRIM(?)",
        [id],
        (error, rows) => {
          if (error) {
            saveError(error);
            return res
              .status(400)
              .send({ error, message: "Could not complete Action" });
          }

          return res.status(201).send({ data: rows[0], message: success.msg });
        }
      );
    }
  );
});

module.exports = router;

function getVendorProducts(data, cb) {
  console.log("Getting vendor products...", { data });
  dbConn.query(
    "SELECT * FROM products WHERE vendorId=TRIM(?)",
    [data.vendorId],
    (error, rows) => {
      if (error) {
        cb(error);
      }
      // return res.status(200).send(rows);
      let send = { ...data, products: rows };
      async.map([send], getVendorAttributes, (error, response) => {
        if (error) throw error;
        cb(null, response[0]);
      });
    }
  );
}

function getVendorAttributes(data, cb) {
  dbConn.query(
    "SELECT * FROM productFlavorGroup WHERE vendorId=TRIM(?)",
    [data.vendorId],
    (error, rows) => {
      if (error) {
        cb(error);
      }
      async.map(rows, getAttributes, (error, response) => {
        if (error) {
          saveError(error);
          return res
            .status(400)
            .send({ error, message: "Could not complete Action" });
        }
        cb(null, { ...data, attributes: response });
      });
    }
  );
}

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
