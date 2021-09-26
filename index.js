const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const dbConn = require("./dbConn");
const config = require("./config/config.json");
const { saveError, getDateToday, verifyToken } = require("./functions");

const tempX = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, ".temp");
  },
  filename: function (req, file, cb) {
    var dtp = Date.now();
    cb(null, `${dtp}.xlsx`);
  },
});
const xlsxTemp = multer({ storage: tempX });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.imgPath);
  },
  filename: function (req, file, cb) {
    var datetimestamp = Date.now();
    cb(null, datetimestamp + ".jpg");
  },
});
const upload = multer({ storage: storage });

var logDirectory = path.join(__dirname, ".temp");

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var route = express();
route.use(bodyParser.json()); //parse all requests to JSON format
route.use(cors()); //for cross-origin access
var router = express.Router();

route.use("/orders", require("./routes/orders"));
route.use("/menu", require("./routes/menu"));
route.use("/institution", require("./routes/inst"));
route.use("/user", require("./routes/user"));
route.use("/staff", require("./routes/staff"));
route.use("/delivery", require("./routes/delivery"));
route.use("/util", require("./routes/util"));
route.use("/store", require("./routes/store"));
route.use("/vendor", require("./routes/vendor"));
route.use("/flavor", require("./routes/flavor"));
route.use("/product", require("./routes/product"));

route.get("/", verifyToken, (req, res) => {
  res.send(
    "<h1 class='text-center' style='font-family: Montserrat;'>" +
      rootMsg[0]["message"] +
      "</h1>"
  );
}); //END route
route.get("/api-z", verifyToken, (req, res) => {
  res.send(
    "<h1 class='text-center' style='font-family: Montserrat;'>" +
      apiZMsg[0]["message"] +
      "</h1>"
  );
}); //END route

/************************************************************************** */

/** Queries */

/** GET INSTITUTIONS */
route.post("/api-z/getInstitutions", verifyToken, (req, res) => {
  let deet = req.body;
  // console.log(deet, req.payload);
  let q = "";
  if (deet.userType != "Admin")
    q = `SELECT * FROM institution ORDER BY InstitutionName`;
  else
    q = `SELECT * FROM institution WHERE inst_head='${req.payload.inst_head}' ORDER BY InstitutionName`;
  let d = dbConn.query(q, (error, rows) => {
    // saveQuery(d.sql);
    if (!error) {
      // WHEN THERE IS NO ERROR
      res.send(rows);
    } else {
      // WHEN THERE IS AN ERROR
      saveError(error);
      res.send(error);
    }
  });
}); // END route

route.post("/api-z/newOrder", (req, res) => {
  let bod = req.body;
  let query = `INSERT INTO orders (orderNo,orderSource,phone,name,email,itemCategory,itemName,itemPrice,itemFlavors,item_quantity,deliveryAddress,orderLong,orderLat,clientReference,institution,dateCreated) VALUES`;

  for (let i = 0; i < bod.orders.length; i++) {
    let order = bod.orders[i];
    query += `(TRIM('${order.orderNo}'),TRIM('${order.orderSource}'),TRIM('${order.phone}'),TRIM('${order.name}'),TRIM('${order.email}'),TRIM('${order.itemCategory}'),TRIM('${order.itemName}'),TRIM('${order.itemPrice}'),TRIM('${order.itemFlavors}'),TRIM('${order.item_quantity}'),TRIM('${order.deliveryAddress}'),TRIM('${order.orderLong}'),TRIM('${order.orderLat}'),TRIM('${order.clientReference}'),TRIM('${order.institution}'),NOW())`;
    if (i != bod.orders.length - 1) query += ",";
  }
  dbConn.query(query, (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      functions.saveError(error);
      return res.send(error);
    }
    // WHEN THERE IS NO ERROR
    res.send({ code: 200, msg: "Order created successfully!" });
  });
});

route.get("/api-z/order/:id", (req, res) => {
  dbConn.query(
    `SELECT *,DATE_FORMAT(dateCreated, "%Y-%m-%d %H:%i:%s") date_time,b.orderStatus orderStatus FROM orders a INNER JOIN order_status_types b ON a.orderStatus=b.orderStatusId WHERE a.orderNo=TRIM(?) ORDER BY dateCreated DESC`,
    [req.params.id],
    (error, rows) => {
      if (!error) {
        // WHEN THERE IS NO ERROR
        // console.log({id: req.params.id, rows});
        res.send(rows);
      } else {
        //when there is an error
        saveError(error);
        res.send(error);
      }
    }
  );
}); //END route

route.post("/api-z/order", (req, res) => {
  let bod = req.body;
  dbConn.query(
    `INSERT INTO orders (orderNo,orderSource,phone,name,email,itemCategory,itemName,itemPrice,itemFlavors,item_quantity,deliveryAddress,orderLong,orderLat,clientReference,institution,delivery_price,orderStatus,itemFlavorsQty,dateCreated) VALUES
		(TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),NOW())`,
    [
      // bod.orderNo,
      bod.orderStatusId === 7 ? func.getDateToday("FULL-ID") : bod.orderNo,
      bod.orderSource,
      bod.phone,
      bod.name,
      bod.email,
      bod.itemCategory,
      bod.itemName,
      bod.itemPrice,
      bod.itemFlavors,
      bod.itemQuantity,
      bod.deliveryAddress,
      bod.orderLong,
      bod.orderLat,
      bod.clientReference,
      bod.institution,
      bod.delivery_price,
      bod.orderStatusId,
      bod.itemFlavorsQty,
    ],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        func.saveError(error);
        return res.send(error);
      }
      // WHEN THERE IS NO ERROR
      res.send({ code: 200, msg: "Order created successfully!" });
    }
  );
});

route.get("/api-z/menu/cate/:inst", verifyToken, (req, res) => {
  dbConn.query(
    `SELECT DISTINCT category,categoryPhoto,categoryDescription FROM MenuItems WHERE branch=TRIM(?) ORDER BY category`,
    [req.params.inst],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res.send(error);
      }
      res.send(rows);
    }
  );
});

route.get("/api-z/menu/categories/:inst", verifyToken, (req, res) => {
  dbConn.query(
    `SELECT DISTINCT category FROM MenuItems WHERE branch=TRIM(?) ORDER BY category`,
    [req.params.inst],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res.send(error);
      }
      res.send(rows);
    }
  );
});

route.get("/api-z/orders/:phone", (req, res) => {
  dbConn.query(
    `SELECT a.*,DATE_FORMAT(dateCreated, "%Y-%m-%d %H:%i:%s") date_time, b.orderStatus orderStatus,b.orderStatusId FROM orders a INNER JOIN order_status_types b ON a.orderStatus=b.orderStatusId WHERE phone=TRIM(?) ORDER BY dateCreated DESC`,
    [req.params.phone],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        functions.saveError(error);
        return res.send(error);
      }
      res.send(rows);
    }
  );
});

route.post("/api-z/savePic", upload.single("pic"), (req, res) => {
  try {
    if (!req.file.filename) return res.send("");
    let fp = `${config.repImgPath}/${req.file.filename}`;
    return res.send({ fp });
  } catch (e) {
    return res.send({ fp: "" });
  }
});

/** CREATE NEW STAFF */
route.post("/api-z/createNewStaff", verifyToken, (req, res) => {
  let newStaff = req.body;
  dbConn.query(
    "INSERT INTO restaurants.staff(ID,Surname,Firstname,email,Gender,Age,Phone,Supervisor,InstitutionCode,Picture,date_created) VALUES (TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),now())",
    [
      newStaff.staffID,
      newStaff.surname,
      newStaff.firstname,
      newStaff.email,
      newStaff.gender,
      newStaff.age,
      newStaff.phone,
      newStaff.supervisor,
      newStaff.inst,
      newStaff.picture,
    ],
    (error, rows) => {
      if (error) {
        //when there is an error
        func.saveError(error);
        return res.send(error);
      }
      // WHEN THERE IS NO ERROR
      dbConn.query(
        `INSERT INTO web_user (Username, Password, Fullname, UserType, InstitutionName, CreatedBy,country, user_id, DateCreated) VALUES (TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),CURDATE())`,
        [
          newStaff.email,
          newStaff.pin,
          `${newStaff.firstname} ${newStaff.surname}`,
          newStaff.staff_type,
          newStaff.inst,
          newStaff.supervisor,
          req.payload.country,
          newStaff.staffID,
        ],
        (error, rows) => {
          if (error) {
            // WHEN THERE IS AN ERROR
            func.saveError(error);
            return res.send(error);
          }
          res.send({ code: 200, msg: "Staff member created successfully!" });
        }
      );
    }
  );
}); //END SERVE

/** GET STAFF MEMBERS OF AN INSTITUTION */
route.get("/api-z/getAllStaffOf/:id", verifyToken, (req, res) => {
  let q = dbConn.query(
    "SELECT DISTINCT a.*,b.UserType staff_type FROM staff a INNER JOIN web_user b ON a.email=b.username WHERE institutionCode=TRIM(?) AND b.UserType NOT IN ('Admin', 'Super Admin')",
    [req.params.id],
    (error, rows) => {
      // saveQuery(q.sql);
      if (error) {
        //when there is an error
        saveError(error);
        res.send(error);
      }
      // WHEN THERE IS NO ERROR
      res.send(rows);
    }
  );
}); //END SERVE

route.get("/api-z/getStaffType/:inst/:type", (req, res) => {
  // console.log(req.params);
  dbConn.query(
    `SELECT DISTINCT a.*,b.UserType staff_type FROM staff a INNER JOIN web_user b ON  a.email=b.Username WHERE institutionCode=TRIM(?) AND b.UserType=TRIM(?)`,
    [req.params.inst, req.params.type],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res.send(error);
      }
      res.send(rows);
    }
  );
});

/** EDIT STAFF */
route.put("/api-z/editStaff", verifyToken, (req, res) => {
  let staff = req.body;
  dbConn.query(
    "UPDATE staff SET email=TRIM(?), surname=TRIM(?), firstname=TRIM(?), gender=TRIM(?), age=TRIM(?), phone=TRIM(?), supervisor=TRIM(?), institutionCode=TRIM(?) WHERE id=TRIM(?)",
    [
      staff.email,
      staff.Surname,
      staff.Firstname,
      staff.Gender,
      staff.Age,
      staff.Phone,
      staff.Supervisor,
      staff.InstitutionCode,
      staff.ID,
    ],
    (error, rows) => {
      if (error) {
        //when there is no error
        saveError(error);
        res.send(error);
      }
      //  WHEN THERE IS NO ERROR
      dbConn.query(
        `UPDATE web_user SET UserType=TRIM(?), Password=TRIM(?), InstitutionName=TRIM(?) WHERE Username=TRIM(?)`,
        [staff.staff_type, staff.Pin, staff.InstitutionCode, staff.email],
        (error, rows) => {
          if (error) {
            // WHEN THERE IS AN ERROR
            saveError(error);
            return res.send(error);
          }
          // WHEN THERE IS NO ERROR
          res.send({ code: 200, msg: "Staff details modified successfully" });
        }
      );
    }
  ); //end query
}); //END route

route.get("/api-z/getAdmins", verifyToken, (req, res) => {
  let deet = req.payload;
  // console.log(deet);
  let q = "";
  if (deet.userType != "Super Admin")
    if (deet.is_head != 1)
      q = `SELECT a.Username username, a.Username email, a.Fullname fullname, b.is_head, a.UserType userType, a.InstitutionName institutionName, a.DateCreated dateCreated, a.CreatedBy createdBy FROM web_user a INNER JOIN institution b ON a.InstitutionName=b.InstitutionName WHERE a.InstitutionName=TRIM('${deet.institutionName}') AND b.Category=TRIM('${deet.Category}') AND b.Country=TRIM('${deet.country}') AND a.UserType='Admin' AND b.inst_head=TRIM('${req.payload.inst_head}') ORDER BY a.Fullname`;
    else
      q = `SELECT a.Username username, a.Username email, a.Fullname fullname, b.is_head, a.UserType userType, a.InstitutionName institutionName, a.DateCreated dateCreated, a.CreatedBy createdBy FROM web_user a INNER JOIN institution b ON a.InstitutionName=b.InstitutionName WHERE b.Country=TRIM('${deet.country}') AND b.Category=TRIM('${deet.Category}') AND a.UserType='Admin' AND b.inst_head=TRIM('${req.payload.inst_head}') ORDER BY a.Fullname`;
  else
    q = `SELECT a.Username username, c.email, a.Fullname fullname, b.is_head, a.UserType userType, a.InstitutionName institutionName, a.DateCreated dateCreated, a.CreatedBy createdBy FROM web_user a INNER JOIN institution b ON a.InstitutionName=b.InstitutionName LEFT JOIN staff c ON a.username=c.email WHERE userType IN ('Admin','Super Admin') ORDER BY a.Fullname`;
  // saveError(q);
  dbConn.query(q, (error, rows) => {
    if (!error) {
      // WHEN THERE IS NO ERROR
      res.send(rows);
    } else {
      // WHEN THERE IS AN ERROR
      saveError(error);
      res.send(error);
    }
  });
}); // END METHOD

/** GET WEB USERS */
route.post("/api-z/webUsers", verifyToken, (req, res) => {
  let deet = req.body;
  // console.log(deet);
  let q = "";
  if (deet.userType != "Super Admin")
    if (deet.is_head != "true")
      q = `SELECT a.Username username, a.Username email, a.Fullname fullname, b.is_head, a.UserType userType, a.InstitutionName institutionName, a.DateCreated dateCreated, a.CreatedBy createdBy FROM web_user a INNER JOIN institution b ON a.InstitutionName=b.InstitutionName WHERE a.InstitutionName=TRIM('${deet.inst}') AND b.Category=TRIM('${deet.instCat}') AND b.Country=TRIM('${deet.country}') ORDER BY a.Fullname`;
    else
      q = `SELECT a.Username username, a.Username email, a.Fullname fullname, b.is_head, a.UserType userType, a.InstitutionName institutionName, a.DateCreated dateCreated, a.CreatedBy createdBy FROM web_user a INNER JOIN institution b ON a.InstitutionName=b.InstitutionName WHERE b.Country=TRIM('${deet.country}') AND b.Category=TRIM('${deet.instCat}') ORDER BY a.Fullname`;
  else
    q = `SELECT a.Username username, c.email, a.Fullname fullname, b.is_head, a.UserType userType, a.InstitutionName institutionName, a.DateCreated dateCreated, a.CreatedBy createdBy FROM web_user a INNER JOIN institution b ON a.InstitutionName=b.InstitutionName LEFT JOIN staff c ON a.username=c.email ORDER BY a.Fullname`;
  // saveError(q);
  dbConn.query(q, (error, rows) => {
    if (!error) {
      // WHEN THERE IS NO ERROR
      res.send(rows);
    } else {
      // WHEN THERE IS AN ERROR
      saveError(error);
      res.send(error);
    }
  });
}); // END route

/** NEW WEB USER */
route.post("/api-z/createWebUser", verifyToken, (req, res) => {
  let deet = req.body;
  // console.log(deet);
  dbConn.query(
    `INSERT INTO web_user (Username,Password,Fullname,UserType,InstitutionName,CreatedBy,DateCreated) 
		VALUES (TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),now())`,
    [
      deet.email,
      deet.password,
      `${deet.firstname} ${deet.surname}`,
      deet.userType,
      deet.institutionName,
      deet.createdBy,
    ],
    (error, rows) => {
      if (!error) {
        // WHEN THERE IS NO ERROR
        res.send(success);
      } else {
        // WHEN THERE IS AN ERROR
        if (error.code === "ER_DUP_ENTRY") res.send(error);
        else {
          saveError(error);
          res.send(error);
        }
      }
    }
  );
}); // END route

/** UPDATE INSTITUTION */
route.put("/api-z/updateInstitution", verifyToken, (req, res) => {
  let deet = req.body;
  // console.log(deet);
  let sql = deet.branchPhoto
    ? `UPDATE institution SET InstitutionName=TRIM('${
        deet.institutionName
      }'),Country=TRIM('${deet.country}'),Category=TRIM('${
        deet.category
      }'),districtcapital=TRIM('${deet.districtcapital}'),instLong=TRIM(${
        deet.long
      }),instLat=TRIM(${deet.lat}),ghPost=TRIM(${
        deet.ghPost ? "deet.ghPost" : null
      }),branchDescription=TRIM('${deet.branchDescription}'),is_head=TRIM('${
        deet.is_head
      }'),inst_head=TRIM('${deet.inst_head}'),branchPhoto=TRIM('${
        deet.branchPhoto
      }') WHERE InstitutionCode=TRIM('${deet.institutionCode}')`
    : `UPDATE institution SET InstitutionName=TRIM('${
        deet.institutionName
      }'),Country=TRIM('${deet.country}'),Category=TRIM('${
        deet.category
      }'),districtcapital=TRIM('${deet.districtcapital}'),instLong=TRIM(${
        deet.long
      }),instLat=TRIM(${deet.lat}),ghPost=TRIM(${
        deet.ghPost ? "deet.ghPost" : null
      }),branchDescription=TRIM('${deet.branchDescription}'),is_head=TRIM('${
        deet.is_head
      }'),inst_head=TRIM('${deet.inst_head}') WHERE InstitutionCode=TRIM('${
        deet.institutionCode
      }')`;
  let query = dbConn.query(sql, (error, rows) => {
    // saveQuery(query.sql);
    if (!error) {
      // WHEN THERE IS NO ERROR
      res.send(success);
    } else {
      // WHEN THERE IS AN ERROR
      saveError(error);
      res.send(error);
    }
  });
}); // END route

/** MODIFY WEB USER DETAILS */
route.put("/api-z/updateWebUser", verifyToken, (req, res) => {
  let deet = req.body;
  let sql = dbConn.query(
    `UPDATE web_user SET Fullname=TRIM(?),Password=TRIM(?),InstitutionName=TRIM(?),UserType=TRIM(?),Username=TRIM(?) WHERE Username=TRIM(?)`,
    [
      deet.fullname,
      deet.password,
      deet.institutionName,
      deet.userType,
      deet.email,
      deet.old_email,
    ],
    (error, rows) => {
      // saveQuery(sql.sql);
      if (!error) {
        // WHEN THERE IS NO ERROR
        res.send(success);
      } else {
        // WHEN THERE IS AN ERROR
        saveError(error);
        res.send(error);
      }
    }
  );
}); // END route

route.post("/loadMenu", xlsxTemp.single("xlsxFile"), (req, res) => {
  let data = functions.readExcelFile(req.file.filename.split(".")[0]);

  // return res.send(data);

  data.forEach((d) => {
    let bod = {
      category: d["Category "].trim(),
      categoryDescription: `Tasty and delicious ${d["Category "].trim()}`,
      categoryPhoto: d["pic"],
      institution: "Potbelly",
      itemDescription: d["Description"].trim(),
      itemFlavors: d["Description"].trim(),
      itemName: d["Item "].trim(),
      itemPhoto: d["pic"],
      itemPrice: d["Price (GHS)"],
      branch: d["branch"],
    };
    // console.log(bod);
    var options = {
      uri: "https://click-order-eat.bodacommunity.io/click-order-eat/api/createMenuItem",
      method: "POST",
      json: bod,
      headers: {
        Authorization: "cG90YmVsbHk6QDIwMjA=",
      },
    };

    request(options, function (error, r, body) {
      if (!error && r.statusCode == 200) {
        // res.send(response);
        console.log({ code: r.statusCode, body });
      } else {
        console.log({ error: error, code: r.statusCode });
      }
    });
  });

  return res.send(data);

  // let n = xlsx.utils.book_new();
  // let ws = xlsx.utils.json_to_sheet(rows);
  // xlsx.utils.book_append_sheet(n, ws, "Report");
  // xlsx.writeFile(n, `./reports/${inst}/${fname}.xlsx`);
}); // end route

route.get("/api-z/institutionDetails/:inst", (req, res) => {
  dbConn.query(
    `SELECT a.InstitutionCode,a.InstitutionName,a.districtcapital location,a.instLong longitude, a.instLat latitude, a.is_head,a.branchDescription,a.branchPhoto,a.inst_head branch_head_code, b.InstitutionName branch_head_name FROM institution a INNER JOIN institution b ON a.inst_head=b.InstitutionCode WHERE a.inst_head=TRIM(?)`,
    [req.params.inst],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res.send(error);
      }
      res.send(rows);
    }
  );
}); // END route

route.get("/api-z/getInstHead", verifyToken, (req, res) => {
  dbConn.query(
    `SELECT InstitutionCode,InstitutionName FROM institution WHERE is_head=true`,
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res.send(error);
      }
      res.send(rows);
    }
  );
});

route.get("/", (req, res) => {
  res.send({ res: "request complete" });
});

route.post("/loadMenu", xlsxTemp.single("xlsxFile"), (req, res) => {
  let data = functions.readExcelFile(req.file.filename.split(".")[0]);

  // return res.send(data);

  data.forEach((d) => {
    let bod = {
      category: d["Category "].trim(),
      categoryDescription: `Tasty and delicious ${d["Category "].trim()}`,
      categoryPhoto: d["pic"],
      institution: "Potbelly",
      itemDescription: d["Description"].trim(),
      itemFlavors: d["Description"].trim(),
      itemName: d["Item "].trim(),
      itemPhoto: d["pic"],
      itemPrice: d["Price (GHS)"],
      branch: d["branch"],
    };
    // console.log(bod);
    var options = {
      uri: "https://click-order-eat.bodacommunity.io/click-order-eat/api/createMenuItem",
      method: "POST",
      json: bod,
      headers: {
        Authorization: "cG90YmVsbHk6QDIwMjA=",
      },
    };

    request(options, function (error, r, body) {
      if (!error && r.statusCode == 200) {
        // res.send(response);
        console.log({ code: r.statusCode, body });
      } else {
        console.log({ error: error, code: r.statusCode });
      }
    });
  });

  return res.send(data);

  // let n = xlsx.utils.book_new();
  // let ws = xlsx.utils.json_to_sheet(rows);
  // xlsx.utils.book_append_sheet(n, ws, "Report");
  // xlsx.writeFile(n, `./reports/${inst}/${fname}.xlsx`);
}); // end route

/** Queries */

route.get("/api-z/institutionDetails/:inst", (req, res) => {
  dbConn.query(
    `SELECT a.InstitutionCode,a.InstitutionName,a.districtcapital location,a.instLong longitude, a.instLat latitude, a.is_head,a.branchDescription,a.branchPhoto,a.inst_head branch_head_code, b.InstitutionName branch_head_name FROM institution a INNER JOIN institution b ON a.inst_head=b.InstitutionCode WHERE a.inst_head=TRIM(?)`,
    [req.params.inst],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res.send(error);
      }
      res.send(rows);
    }
  );
}); // END route

route.get("/api-z/getInstHead", verifyToken, (req, res) => {
  dbConn.query(
    `SELECT InstitutionCode,InstitutionName FROM institution WHERE is_head=true`,
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res.send(error);
      }
      res.send(rows);
    }
  );
});

route.get("/api-z/order/all/today", (req, res) => {
  // console.log("here");
  dbConn.query(
    "SELECT a.*, b.orderStatus,b.orderStatusId FROM orders a INNER JOIN order_status_types b ON a.orderStatus=b.orderStatusId WHERE DATE(dateCreated)=CURDATE() ORDER BY dateCreated DESC",
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        functions.saveError(error);
        return res.send(error);
      }
      // WHEN THERE IS NO ERROR
      res.send(rows);
    }
  );
});

route.get("/api-z/orders", (req, res) => {
  dbConn.query(
    "SELECT a.*, b.orderStatus orderStatus, b.orderStatusId FROM orders a INNER JOIN order_status_types b ON a.orderStatus=b.orderStatusId ORDER BY dateCreated DESC",
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        functions.saveError(error);
        return res.send(error);
      }
      // WHEN THERE IS NO ERROR
      res.send(rows);
    }
  );
});

//Launch service
route.listen(10484, (error) => {
  if (!error) {
    //when there is no error
    console.log(
      `\n${chalk.hex("#ffae4e")(
        "-----------------------------------------------"
      )}`
    );
    console.log(
      chalk.hex("#4d9ebe")(
        `The router started running on port 10484 at ${chalk.bold(
          getDateToday()
        )}`
      )
    );
  } else {
    //when there is an error
    saveError(error);
    console.log(
      chalk.hex("#f44336")(
        chalk.underline.bold(
          "There was an error starting the router.\nError:"
        ) +
          " " +
          JSON.stringify(error, undefined, 2)
      )
    );
  }
});

module.exports = router;
