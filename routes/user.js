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

/** AUTHENTICATE WEB USER */
router.post("/authenticate", (req, res) => {
  let body = req.body;
  console.info("Logging in: ", { body });
  if (!body.username) {
    console.log("No username");
    return res.status(400).send({
      data: null,
      "Request Body": body,
      message: "Username does not appear to be in data sent.",
    });
  }
  if (!body.password) {
    console.log("No password");
    return res.status(400).send({
      data: null,
      "Request Body": body,
      message: "Password does not appear to be in data sent.",
    });
  }
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  // console.log({ip});
  dbConn.query(
    `SELECT a.Username username, a.Fullname fullname, b.inst_head, a.user_id, d.Phone, c.InstitutionName inst_head_name, b.InstitutionCode instCode, b.districtcapital instLoc, a.UserType userType, a.InstitutionName institutionName, b.Country country, d.Picture, b.is_head, b.Category FROM web_user a INNER JOIN institution b ON a.InstitutionName=b.InstitutionName LEFT JOIN institution c ON b.inst_head=c.InstitutionCode LEFT JOIN staff d ON a.user_id=d.ID WHERE a.Username=TRIM(?) AND a.Password=TRIM(?)`,
    [req.body.username, req.body.password],
    (error, rows) => {
      if (!error) {
        // WHEN THERE IS NO ERROR
        // console.log(rows);
        if (rows.length === 0)
          return res.status(404).send({
            data: null,
            message: "User does not exist",
          });
        let r = rows[0];
        let payload = {
          ...r,
        };
        // console.log(payload);
        let token = jwt.sign(payload, config.jwtKey, { algorithm: "HS384" });
        // console.log({token});
        const data = {
          ...payload,
          token,
        };
        // STORE LOG DATA
        // console.log(d);
        dbConn.query(
          `INSERT INTO web_logins (username,ip_add,inst_code,log_date,access_token) VALUES (TRIM(?),TRIM(?),TRIM(?), NOW(),TRIM(?))`,
          [data.username, ip, data.instCode, data.token],
          (error, rows) => {
            if (!error) {
              // WHEN THERE IS NO ERROR
              res.send({ data, message: "Logged in" });
            } else {
              // WHEN THERE IS AN ERROR
              saveError(error);
              res
                .status(400)
                .send({ error, message: "Could not complete Action" });
            }
          }
        );
      } else {
        // WHEN THERE IS AN ERROR
        saveError(error);
        res.status(400).send({ error, message: "Could not complete Action" });
      }
    }
  );
}); // END METHOD

module.exports = router;
