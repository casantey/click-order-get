const express = require("express");
const cors = require("cors");
const dbConn = require("../dbConn");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const config = require("../config/config.json");
var router = express.Router();
const { verifyToken, saveError, getDateToday } = require("../functions");

var success = {
  code: 200,
  msg: "Action completed successfully!",
};

router.post("/register", (req, res) => {
  let data = req.body;
  console.log("New delivery application...", { data });

  let id = uuidv4();

  dbConn.query(
    "INSERT INTO restaurants.applications (id,applicantFirstName,applicantLastName,applicantMiddleName,gender,dateOfBirth,contactEmail,contactPhone,image) VALUES (TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?));",
    [
      id,
      data.applicantFirstName,
      data.applicantLastName,
      data.applicantMiddlename,
      data.gender,
      data.dateOfBirth,
      data.contactEmail,
      data.contactPhone,
      data.image,
    ],
    (error, rows) => {
      if (error) {
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      dbConn.query(
        "SELECT *, RPAD(IF(type='Rider','RD-','VD-'),8,LPAD(applicationNumber, 5, '0')) applicationNumber FROM applications WHERE id=TRIM(?)",
        [id],
        (error, rows) => {
          if (error) {
            saveError(error);
            return res
              .status(400)
              .send({ error, message: "Could not complete Action" });
          }
          return res.status(201).send({
            data: rows[0],
            message: "Application created successfully",
          });
        }
      );
    }
  );
});

router.put("/:id", (req, res) => {
  let id = req.params.id;
  let data = req.body;
  console.log("Application reviewed...", { id, data });

  dbConn.query(
    `INSERT INTO web_user (Username, Password, Fullname, UserType, InstitutionName, CreatedBy,country, user_id, DateCreated) VALUES (TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),CURDATE())`,
    [
      data.applicationDetails.contactEmail,
      pin,
      data.applicationDetails.applicantName,
      data.applicationDetails.type,
      data.applicationDetails.type == "Rider"
        ? "Independent"
        : data.applicationDetails.vendorName,
      data.reviewedBy.name,
      data.applicationDetails.country,
      data.applicationDetails.applicationNumber,
    ],
    (error, rows) => {
      if (error) {
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not update application status" });
      }

      dbConn.query(
        "SELECT *, RPAD(IF(type='Rider','RD-','VD-'),8,LPAD(applicationNumber, 5, '0')) applicationNumber FROM applications WHERE id=TRIM(?) ORDER BY applicationDate DESC",
        [id],
        (error, rows) => {
          if (error) {
            saveError(error);
            return res.status(400).send({ error });
          }
          if (data.status == "Approved") {
            let userData = rows[0];
            let pin = "1234";
            let staff = rows[0];
            let staffInsert = `INSERT INTO staff (ID,Surname,Firstname,middleName,email,Gender,Age,Phone,Picture) VALUES (TRIM("${
              staff.applicationNumber
            }"),TRIM("${staff.applicantLastName}"),TRIM("${
              staff.applicantFirstName
            }"),TRIM("${
              staff.applicantMiddlename ? staff.applicantMiddlename : ""
            }"),TRIM("${staff.contactEmail}"),TRIM("${
              staff.gender
            }"),YEAR(CURDATE())-YEAR("${staff.dateOfBirth}"),TRIM("${
              staff.contactPhone
            }"),TRIM("${staff.image}"));`;
            dbConn.query(
              "UPDATE applications SET status=TRIM(?), reviewedBy=TRIM(?), reviewDate=NOW() WHERE id=TRIM(?)",
              [data.status, JSON.stringify(data.reviewedBy), id],
              (error, rows) => {
                if (error) {
                  // WHEN THERE IS AN ERROR
                  saveError(error);
                  return res
                    .status(400)
                    .send({ error, message: "Could not complete Action" });
                }
                console.log("User login details created");
                dbConn.query(staffInsert, (error, rows) => {
                  if (error) {
                    saveError(error);
                    return res
                      .status(400)
                      .send({ error, message: "Could not complete Action" });
                  }
                  console.log("Staff details created");
                  return res.send({
                    data: userData,
                    message: "Application status updated",
                  });
                });
              }
            );
          } else
            return res
              .status(200)
              .send({ data: rows[0], message: "Application status updated" });
        }
      );
    }
  );
});

router.get("/:id", (req, res) => {
  let id = req.params.id;
  console.log("Getting application...", { id });

  dbConn.query(
    "SELECT *, RPAD(IF(type='Rider','RD-','VD-'),8,LPAD(applicationNumber, 5, '0')) applicationNumber FROM applications WHERE id=TRIM(?) ORDER BY applicationDate DESC",
    [id],
    (error, rows) => {
      if (error) {
        saveError(error);
        return res.status(400).send({ error });
      }
      return res.status(200).send({ data: rows[0], message: "Ok" });
    }
  );
});

router.get("/", (req, res) => {
  console.log("Getting applications...");

  dbConn.query(
    "SELECT *, RPAD(IF(type='Rider','RD-','VD-'),8,LPAD(applicationNumber, 5, '0')) applicationNumber FROM applications ORDER BY applicationDate DESC",
    (error, rows) => {
      if (error) {
        saveError(error);
        return res.status(400).send({ error });
      }
      return res.status(200).send({ data: rows, message: "Ok" });
    }
  );
});

module.exports = router;
