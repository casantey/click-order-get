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
  console.log("Getting products...");
  dbConn.query("SELECT * FROM products ORDER BY productName", (error, rows) => {
    if (error) {
      saveError(error);
      return res.status(500).send(error);
    }
    return res.status(200).send(rows);
  });
});

router.post("/", (req, res) => {
  let data = req.body;
  let id = uuidv4();

  console.log("Adding product...", { data });

  dbConn.query(
    "INSERT INTO products (productId, productName, productCategory, productDescription, unitPrice, imageUrl, currency, vendorId, flavorsId) VALUES (TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?))",
    [
      id,
      data.productName,
      data.productCategory,
      data.productDescription,
      data.unitPrice,
      data.imageUrl,
      data.currency,
      data.vendorId,
      data.flavorsId,
    ],
    (error, rows) => {
      if (error) {
        saveError(error);
        return res.status(500).send(error);
      }
      dbConn.query(
        "SELECT * FROM products WHERE productId=TRIM(?)",
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

module.exports = router;
