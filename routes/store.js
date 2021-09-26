const express = require("express");
const cors = require("cors");
const dbConn = require("../dbConn");
const async = require("async");
const jwt = require("jsonwebtoken");
const config = require("../config/config.json");
var router = express.Router();
const { verifyToken, saveError, getDateToday } = require("../functions");

var success = {
  code: 200,
  msg: "Action completed successfully!",
};

router.get("/products", (req, res) => {
  console.log("Getting all products in store...");
  dbConn.query("SELECT * FROM products", (error, rows) => {
    if (error) {
      saveError(error);
      return res.status(500).send(error);
    }
    // return res.status(200).send(rows);
    async.map(rows, getFlavorGroups, (err, response) => {
      if (err) throw err;
      return res.status(200).send(response);
    });
  });
});

function getVendor(data, cb) {
  console.log({ data });
  dbConn.query(
    "SELECT * FROM productFlavorGroup WHERE groupId=TRIM(?); SELECT itemName FROM productFlavors WHERE flavorGroupId=TRIM(?); SELECT * FROM vendors WHERE vendorId=TRIM(?)",
    [data.flavorsId, data.flavorsId, data.vendorId],
    (error, rows) => {
      if (error) {
        saveError({ error });
        cb(error);
      }
      let vendor = rows[2][0];
      cb(null, {
        productName: data.productName,
        productCategory: data.productCategory,
        productDescription: data.productDescription,
        unitPrice: data.unitPrice,
        imageUrl: data.imageUrl,
        currency: data.currency,
        vendor: {
          vendorId: vendor.vendorId,
          vendorName: vendor.vendorName,
          longitude: vendor.longitude,
          latitude: vendor.latitude,
        },
        flavors: [
          { flavorTitle: rows[0][0].flavorTitle, flavorItems: rows[1] },
        ],
      });
    }
  );
}

function getFlavorGroups(data, cb) {
  console.log({ data });
  dbConn.query(
    "SELECT * FROM productFlavorGroup WHERE groupId=TRIM(?); SELECT itemName FROM productFlavors WHERE flavorGroupId=TRIM(?); SELECT * FROM vendors WHERE vendorId=TRIM(?)",
    [data.flavorsId, data.flavorsId, data.vendorId],
    (error, rows) => {
      if (error) {
        saveError({ error });
        cb(error);
      }
      let vendor = rows[2][0];
      cb(null, {
        productName: data.productName,
        productCategory: data.productCategory,
        productDescription: data.productDescription,
        unitPrice: data.unitPrice,
        imageUrl: data.imageUrl,
        currency: data.currency,
        vendor: {
          vendorId: vendor.vendorId,
          vendorName: vendor.vendorName,
          longitude: vendor.longitude,
          latitude: vendor.latitude,
        },
        flavors: [
          { flavorTitle: rows[0][0].flavorTitle, flavorItems: rows[1] },
        ],
      });
    }
  );
}

module.exports = router;
