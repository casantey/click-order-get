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

router.get("/statistics/:id", (req, res) => {
  let user_id = req.params.id;
  let assignedStat = `SELECT COUNT(*) assigned FROM orders WHERE orderStatus='4' AND delivery_agent='${user_id}';`;
  let deliveringStat = `SELECT COUNT(*) delivering FROM orders WHERE orderStatus='5' AND delivery_agent='${user_id}';`;
  let deliveredStat = `SELECT COUNT(*) delivered FROM orders WHERE orderStatus='6' AND delivery_agent='${user_id}';`;
  dbConn.query(
    `${assignedStat}${deliveringStat}${deliveredStat}`,
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res.send(error);
      }
      let returnBody = {};
      returnBody.assigned = rows[0][0].assigned;
      returnBody.delivering = rows[1][0].delivering;
      returnBody.delivered = rows[2][0].delivered;
      res.send(returnBody);
    }
  );
  // GET USER ID
  // dbConn.query("SELECT ID FROM staff WHERE Phone=TRIM(?)", [ req.params.phone ], (error, rows) => {
  // 	if (error) {
  // 		// WHEN THERE'S AND ERROR
  // 		saveError(error);
  // 		return res.send(error);
  // 	}
  // 	if (rows.length === 0) return res.send({code: 404, msg: "Could not find any drivers matching this phone number"});
  // 	// GET STATISTICS
  // });
});

router.get("/pending/:id", (req, res) => {
  let user_id = req.params.id;
  let assignedStat = `SELECT * FROM orders WHERE orderStatus='4' AND delivery_agent='${user_id}';`;
  dbConn.query(assignedStat, (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res.send(error);
    }
    res.send(rows);
  });
});

router.get("/locations", verifyToken, (req, res) => {
  dbConn.query(
    `SELECT * FROM delivery_locations WHERE branch=TRIM(?) ORDER BY location_name`,
    [req.payload.instCode],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res.send(error);
      }
      return res.send(rows);
    }
  );
});

router.get("/range", verifyToken, (req, res) => {
  dbConn.query(
    `SELECT * FROM deliveryRange WHERE branch=TRIM(?) ORDER BY rangeFrom`,
    [req.payload.instCode],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res.send(error);
      }
      return res.send(rows);
    }
  );
});

router.delete("/location/:id", verifyToken, (req, res) => {
  // console.log(req.params);
  let query = `DELETE FROM delivery_locations WHERE id = TRIM('${req.params.id}');`;
  // return res.send({query});
  dbConn.query(query, (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res.send(error);
    }
    return res.send(success);
  });
});

router.delete("/range/:id", verifyToken, (req, res) => {
  // console.log(req.params);
  let query = `DELETE FROM deliveryRange WHERE rangeID = TRIM('${req.params.id}');`;
  // return res.send({query});
  dbConn.query(query, (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res.send(error);
    }
    return res.send(success);
  });
});

router.put("/location/:id", verifyToken, (req, res) => {
  let bod = req.body;
  let query = `UPDATE delivery_locations SET
  location_name = TRIM('${bod.location_name}'),
  locationLong = TRIM('${bod.locationLong}'),
  locationLat = TRIM(${bod.locationLat}),
  extra_notes = TRIM('${bod.extra_notes}'),
  date_added = NOW()
  WHERE id = TRIM('${bod.id}');`;
  // return res.send({query});
  dbConn.query(query, (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res.send(error);
    }
    return res.send(success);
  });
});

router.put("/range/:id", verifyToken, (req, res) => {
  let bod = req.body;
  let query = `UPDATE deliveryRange SET
  rangeFrom = TRIM('${bod.rangeFrom}'),
  rangeTo = TRIM('${bod.rangeTo}'),
  rangeCost = TRIM(${bod.rangeCost}),
  dateAdded = NOW()
  WHERE rangeID = TRIM('${bod.rangeID}');`;
  // return res.send({query});
  dbConn.query(query, (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res.send(error);
    }
    return res.send(success);
  });
});

router.post("/location", verifyToken, (req, res) => {
  let bod = req.body;
  let query = `INSERT INTO delivery_locations (location_name,extra_notes,branch,added_by,locationLong,locationLat,date_added)
	VALUES (
		TRIM('${bod.location_name}'),
		TRIM('${bod.extra_notes}'),
		TRIM('${req.payload.instCode}'),
		TRIM('${req.payload.username}'),
		TRIM('${bod.locationLong}'),
		TRIM('${bod.locationLat}'),
		NOW()
	)`;
  dbConn.query(query, (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res.send(error);
    }
    return res.send(success);
  });
});

router.post("/range", verifyToken, (req, res) => {
  let bod = req.body;
  let query = `INSERT INTO deliveryRange(rangeFrom,rangeTo,rangeCost,branch,addedBy,dateAdded)
  VALUES (TRIM('${bod.rangeFrom}'),TRIM('${bod.rangeTo}'),TRIM(${bod.rangeCost}),TRIM('${req.payload.instCode}'),TRIM('${req.payload.username}'),NOW())`;
  dbConn.query(query, (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res.send(error);
    }
    return res.send(success);
  });
});

router.post("/duplicate", verifyToken, (req, res) => {
  let items = req.body.items;
  let type = req.body.type;
  let head = req.body.inst;
  let branches = req.body.branches;
  let delQuery =
    type === "location"
      ? `DELETE FROM delivery_locations WHERE branch=`
      : `DELETE FROM deliveryRange WHERE branch=`;
  let query =
    type === "location"
      ? "INSERT INTO delivery_locations (location_name,extra_notes,branch,added_by,locationLong,locationLat,date_added) VALUES "
      : "INSERT INTO deliveryRange(rangeFrom,rangeTo,rangeCost,branch,addedBy,dateAdded) VALUES ";
  for (let j = 0; j < branches.length; j++) {
    let inst = branches[j];
    delQuery += `TRIM('${inst}');`;
    for (let i = 0; i < items.length; i++) {
      let bod = items[i];
      query +=
        type === "location"
          ? `(
						TRIM('${bod.location_name}'),
						TRIM('${bod.extra_notes}'),
						TRIM('${inst}'),
						TRIM('${req.payload.username}'),
						TRIM('${bod.locationLong}'),
						TRIM('${bod.locationLat}'),
						NOW()
					)`
          : `(TRIM('${bod.rangeFrom}'),TRIM('${bod.rangeTo}'),TRIM(${bod.rangeCost}),TRIM('${inst}'),TRIM('${req.payload.username}'),NOW())`;
      if (i != items.length - 1) query += ",";
    }
  }
  dbConn.query(delQuery + query, (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res.send(error);
    }
    res.send(success);
  });
});

router.post("/update", (req, res) => {
  let bod = req.body;
  let query = `INSERT INTO order_delivery (orderNo,orderStatus,driver,locationLong,locationLat,notes)
  VALUES (TRIM('${bod.orderNo}'),TRIM('${bod.orderStatus}'),TRIM('${bod.driver}'),TRIM(${bod.locationLong}),TRIM(${bod.locationLat}),TRIM("${bod.notes}"));`;
  dbConn.query(query, (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res.send(error);
    }
    dbConn.query(
      `UPDATE orders SET orderStatus=TRIM(?) WHERE orderNo=TRIM(?)`,
      [bod.orderStatus, bod.orderNo],
      (error, rows) => {
        if (error) {
          // WHEN THERE IS AN ERROR
          saveError(error);
          return res.send(error);
        }
        res.send({ code: 200, msg: "Order updated" });
      }
    );
  });
});

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
        return res.status(500).send(error);
      }
      dbConn.query(
        "SELECT * FROM applications WHERE id=TRIM(?)",
        [id],
        (error, rows) => {
          if (error) {
            saveError(error);
            return res.status(500).send(error);
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

module.exports = router;
