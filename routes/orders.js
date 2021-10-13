const express = require("express");
var router = express.Router();
var dbConn = require("../dbConn");
const async = require("async");
const { v4: uuidv4 } = require("uuid");
let incrementer = require("number-sequence");
let numsys = "0123456789ABCDEF";
let padChar = "res-";
let length = 2;
const {
  verifyToken,
  saveError,
  getDateToday,
  saveQuery,
} = require("../functions");

// let result = incrementer.increment(
//   numsys,
//   incrementer.padNumberToLength("E", length, padChar)
// );

var success = {
  code: 200,
  msg: "Action completed successfully!",
};

/** CHECK CASE ASSIGNMENT */
router.get("/assignment/:id", verifyToken, (req, res) => {
  dbConn.query(
    `SELECT assign_flag FROM assignments WHERE case_id=TRIM(?)`,
    [req.params.id],
    (error, rows) => {
      if (!error) {
        // WHEN THERE IS NO ERROR
        if (rows.length > 0) {
          let eq1 = `SELECT CONCAT(b.Firstname, ' ', b.Surname) Fullname, b.InstitutionCode InstitutionName, a.status, a.assigned_to FROM assignments a INNER JOIN staff b ON a.assigned_to=b.ID WHERE a.case_id= TRIM(?)`;
          let eq2 = `SELECT b.InstitutionName, a.status, a.assigned_to FROM assignments a INNER JOIN institution b ON a.assigned_to=b.InstitutionCode WHERE a.case_id=TRIM(?)`;
          dbConn.query(
            rows[0].assign_flag === "staff" ? eq1 : eq2,
            [req.params.id],
            (error, rows) => {
              if (!error) {
                // WHEN THERE IS NO ERROR
                res.send(rows);
              } else {
                // WHEN THERE IS AN ERROR
                func.saveError(error);
                res
                  .status(400)
                  .send({ error, message: "Could not complete Action" });
              }
            }
          );
        } else res.send(rows);
      } else {
        // WHEN THERE IS AN ERROR
        func.saveError(error);
        res.status(400).send({ error, message: "Could not complete Action" });
      }
    }
  );
}); // END SERVE

router.get("/phone/:phone", (req, res) => {
  dbConn.query(
    `SELECT a.*,DATE_FORMAT(dateCreated, "%Y-%m-%d %H:%i:%s") date_time, b.orderStatus orderStatus,b.orderStatusId FROM orders a INNER JOIN order_status_types b ON a.orderStatus=b.orderStatusId WHERE phone=TRIM(?) ORDER BY dateCreated DESC`,
    [req.params.phone],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      res.send(rows);
    }
  );
});

router.get("/today", verifyToken, (req, res) => {
  // console.log("here");
  // console.log(req.payload);
  let q = `SELECT a.*, b.orderStatus,b.orderStatusId FROM orders a INNER JOIN order_status_types b ON a.orderStatus=b.orderStatusId WHERE DATE(dateCreated)=CURDATE() AND a.orderStatus<>7`;
  if (req.payload.userType != "Super Admin")
    q += ` AND institution=TRIM('${req.payload.instCode}')`;
  dbConn.query(q + " ORDER BY dateCreated DESC", (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res
        .status(400)
        .send({ error, message: "Could not complete Action" });
    }
    // WHEN THERE IS NO ERROR
    res.send(rows);
  });
});

router.get("/all", verifyToken, (req, res) => {
  // console.log("here");
  // console.log(req.payload);
  let q = `SELECT a.*, b.orderStatus,b.orderStatusId FROM orders a INNER JOIN order_status_types b ON a.orderStatus=b.orderStatusId WHERE a.orderStatus<>7`;
  if (req.payload.userType != "Super Admin")
    q += ` AND institution=TRIM('${req.payload.instCode}')`;
  dbConn.query(q + " ORDER BY dateCreated DESC", (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res
        .status(400)
        .send({ error, message: "Could not complete Action" });
    }
    // WHEN THERE IS NO ERROR
    res.send(rows);
  });
});

router.get("/order/:id", verifyToken, (req, res) => {
  let id = req.params.id;
  console.log("Getting order details...", { id });

  dbConn.query(
    `SELECT a.*,DATE_FORMAT(a.dateCreated, "%Y-%m-%d %H:%i:%s") date_time,b.orderStatusId, c.Fullname deliveryAgent_name,b.orderStatus orderStatus FROM orders a INNER JOIN order_status_types b ON a.orderStatus=b.orderStatusId LEFT JOIN web_user c ON a.deliveryAgent=c.user_id WHERE a.orderNo=TRIM(?) ORDER BY dateCreated DESC`,
    [req.params.id],
    (error, rows) => {
      if (error) {
        //when there is an error
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      return res.send(rows[0]);
    }
  );
}); //END SERVE

/** ASSIGN CASE */
router.post("/assign", verifyToken, (req, res) => {
  let assign = req.body;
  dbConn.query(
    "INSERT INTO assignments (case_id,assigned_to,assigned_by,status,assign_flag) VALUES (TRIM(?),TRIM(?),TRIM(?), true,TRIM(?))",
    [
      assign.case_id,
      assign.assigned_to,
      assign.assigned_by,
      assign.assign_flag,
    ],
    (error, rows) => {
      if (!error) {
        //when there is no error
        dbConn.query(
          'UPDATE orders SET orderStatus="4", deliveryAgent=TRIM(?) WHERE orderNo=TRIM(?)',
          [assign.assigned_to, assign.case_id],
          (error, rows) => {
            if (error) {
              functions.saveError(error);
            }
          }
        );
        let q1 = `SELECT CONCAT(Firstname, " ", Surname) AS name FROM staff WHERE id= TRIM(?)`;
        let q2 = `SELECT InstitutionName AS name FROM institution WHERE InstitutionCode= TRIM(?)`;
        dbConn.query(
          assign.assign_flag[0] === "staff" ? q1 : q2,
          [assign.assigned_to],
          (error, rows) => {
            if (!error) {
              //when there is no error
              res.send({
                code: 200,
                name: rows[0].name,
              });
            } else {
              //when there is an error
              func.saveError(error);
              res
                .status(400)
                .send({ error, message: "Could not complete Action" });
            }
          }
        );
      } else {
        // WHEN THERE IS AN ERROR INSERTING VALUES
        if (error.code === "ER_DUP_ENTRY") {
          dbConn.query(
            `SELECT assign_flag FROM assignments WHERE case_id=TRIM(?)`,
            [assign.case_id],
            (error, rows) => {
              if (!error) {
                // WHEN THERE IS NO ERROR
                let eq1 = `SELECT a.*, CONCAT(b.Firstname, ' ', b.Surname, ' of ', b.InstitutionCode) name FROM assignments a INNER JOIN staff b ON a.assigned_to=b.ID WHERE a.case_id= TRIM(?)`;
                let eq2 = `SELECT a.*, b.InstitutionName name FROM assignments a INNER JOIN institution b ON a.assigned_to=b.InstitutionCode WHERE a.case_id=TRIM(?)`;
                dbConn.query(
                  rows[0].assign_flag === "staff" ? eq1 : eq2,
                  [assign.case_id],
                  (error, rows) => {
                    if (!error) {
                      // WHEN THERE IS NO ERROR
                      res.send({ code: "ER_DUP_ENTRY", name: rows[0].name });
                    } else {
                      // WHEN THERE IS AN ERROR
                      func.saveError(error);
                      res
                        .status(400)
                        .send({ error, message: "Could not complete Action" });
                    }
                  }
                );
              } else {
                // WHEN THERE IS AN ERROR
                func.saveError(error);
                res
                  .status(400)
                  .send({ error, message: "Could not complete Action" });
              }
            }
          );
        } else {
          // WHEN THERE IS AN ERROR
          func.saveError(error);
          res.status(400).send({ error, message: "Could not complete Action" });
        }
      }
    }
  );
}); //END SERVE

router.post("/done", (req, res) => {
  dbConn.query(
    "UPDATE orders SET orderStatus='3' WHERE orderNo=TRIM(?)",
    [req.body.orderNo],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        functions.saveError(error);
        res.status(400).send({ error, message: "Could not complete Action" });
      }
      // WHEN THERE IS NO ERROR
      res.send({ code: 200, msg: "Order status updated successfully" });
    }
  ); // END SERVE
});

let testOrderNumber = 0;
console.log({ testOrderNumber });

router.post("/order", (req, res) => {
  let data = req.body;
  console.log((testOrderNumber += 1));
  console.log("New order: ", { data });
  // let orderNo= bod.orderStatusId === 7 ? getDateToday("FULL-ID") : bod.orderNo;

  let orderNo = getDateToday("FULL-ID");

  // console.log({ bod });
  let query = "";
  for (let i = 0; i < data.length; i++) {
    let bod = data[i];
    let id = uuidv4();
    query += `INSERT INTO orders (id,orderNo,itemId,orderSource,phone,name,email,itemCategory,itemName,itemPrice,itemFlavors,itemQuantity,deliveryAddress,orderLong,orderLat,clientReference,vendorId,deliveryAmount,orderStatus,dateCreated) VALUES
    (TRIM('${id}'),TRIM('${orderNo}'),TRIM('${bod.itemId}'),TRIM('${
      bod.orderSource
    }'),TRIM('${bod.phone}'),TRIM('${bod.name}'),TRIM('${bod.email}'),TRIM('${
      bod.itemCategory
    }'),TRIM('${bod.itemName}'),TRIM(${bod.itemPrice}),
    TRIM('${JSON.stringify(bod.itemFlavors)}')
    ,TRIM(${bod.itemQuantity}),TRIM('${bod.deliveryAddress}'),TRIM(${
      bod.orderLong
    }),TRIM(${bod.orderLat}),TRIM('${bod.clientReference}'),TRIM('${
      bod.vendorId
    }'),TRIM(${bod.deliveryAmount}),TRIM('${
      bod.orderStatus
    }'),NOW()) ON DUPLICATE KEY UPDATE orderSource=TRIM('${
      bod.orderSource
    }'),phone=TRIM('${bod.phone}'),name=TRIM('${bod.name}'),email=TRIM('${
      bod.email
    }'),itemCategory=TRIM('${bod.itemCategory}'),itemName=TRIM('${
      bod.itemName
    }'),itemPrice=TRIM(${bod.itemPrice}),itemId=TRIM('${
      bod.itemId
    }'),itemFlavors=TRIM('${JSON.stringify(
      bod.itemFlavors
    )}'),itemQuantity=TRIM(${bod.itemQuantity}),deliveryAddress=TRIM('${
      bod.deliveryAddress
    }'),orderLong=TRIM(${bod.orderLong}),orderLat=TRIM(${
      bod.orderLat
    }),clientReference=TRIM('${bod.clientReference}'),vendorId=TRIM('${
      bod.vendorId
    }'),deliveryAmount=TRIM(${bod.deliveryAmount}),orderStatus=TRIM('${
      bod.orderStatus
    }'),dateCreated=NOW();`;
  }
  dbConn.query(query, (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res.status(400).send({ error, message: "Could not add order(s)" });
    }
    // WHEN THERE IS NO ERROR
    dbConn.query(
      "SELECT a.*, b.orderStatus,b.orderStatusId FROM orders a INNER JOIN order_status_types b ON a.orderStatus=b.orderStatusId WHERE orderNo=TRIM(?)",
      [orderNo],
      (error, rows) => {
        if (error) {
          // WHEN THERE IS AN ERROR
          saveError(error);
          return res
            .status(400)
            .send({ error, message: "Could not get order(s)" });
        }
        async.map(rows, getVendorDetails, (error, response) => {
          if (error) {
            saveError(error);
            return res
              .status(500)
              .send({ error, message: "Could not get vendor details" });
          }
          async.map(response, getProductDetails, (error, response) => {
            if (error) {
              saveError(error);
              return res
                .status(500)
                .send({ error, message: "Could not get product details" });
            }
            return res
              .status(201)
              .send({ data: response, message: "Order(s) created" });
          });
        });
      }
    );
  });
});

router.post("/", verifyToken, (req, res) => {
  let bod = req.body;
  console.log("Getting orders...", { bod });
  let q = `SELECT a.*, b.orderStatus,b.orderStatusId FROM orders a INNER JOIN order_status_types b ON a.orderStatus=b.orderStatusId WHERE a.orderStatus<>7`;
  if (req.payload.userType != "Super Admin")
    q += ` AND institution=TRIM("${req.payload.instCode}")`;
  if (bod.report == "2") {
    q += ` AND a.orderStatus=6 `;
  }
  if (bod.report == "1") {
    q += ` AND a.orderStatus<>6 `;
  }
  if (bod.timePeriod == "today") {
    q += ` AND DATE(a.dateCreated)=CURDATE() `;
  }
  if (bod.timePeriod == "yesterday") {
    q += ` AND DATE(a.dateCreated)=CURDATE()-INTERVAL 1 DAY `;
  }
  if (bod.timePeriod == "week") {
    q += ` AND DATE(a.dateCreated) BETWEEN CURDATE()-INTERVAL 1 WEEK AND CURDATE() `;
  }
  if (bod.timePeriod == "month") {
    q += ` AND DATE(a.dateCreated) BETWEEN CURDATE()-INTERVAL 1 MONTH AND CURDATE() `;
  }
  if (bod.timePeriod == "year") {
    q += ` AND DATE(a.dateCreated) BETWEEN CURDATE()-INTERVAL 1 YEAR AND CURDATE() `;
  }
  // if(bod.report=="2"){
  // 	q+=`AND `;
  // }
  // if(bod.report=="2"){
  // 	q+=`AND `;
  // }
  // if(bod.report=="2"){
  // 	q+=`AND `;
  // }
  dbConn.query(q + " ORDER BY dateCreated DESC", (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      console.log({ error });
      saveError(error);
      return res
        .status(400)
        .send({ error, message: "Could not complete Action" });
    }
    // WHEN THERE IS NO ERROR
    res.send(rows);
  });
});

router.delete("/:id", (req, res) => {
  dbConn.query(
    "DELETE FROM orders WHERE orderNo=TRIM(?)",
    [req.params.id],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      if (rows.affectedRows === 0)
        return res.send({
          code: 204,
          msg: "No matching records found; Order not removed",
        });
      return res.send({ code: 200, msg: "Order removed" });
    }
  );
});

module.exports = router;

function getVendorDetails(data, cb) {
  console.log("Getting vendor details...", { vendor: data.vendorId });

  dbConn.query(
    "SELECT * FROM vendors WHERE vendorId=TRIM(?);",
    [data.vendorId],
    (error, rows) => {
      if (error) return cb(error);
      return cb(null, { ...data, vendor: rows[0] });
    }
  );
}

function getProductDetails(data, cb) {
  console.log("Getting product details", { product: data.itemId });

  dbConn.query(
    "SELECT * FROM products WHERE productId = TRIM(?)",
    [data.itemId],
    (error, rows) => {
      if (error) return cb(error);
      return cb(null, { ...data, product: rows[0] });
    }
  );
}
