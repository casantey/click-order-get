const express = require("express");
var router = express.Router();
const async = require("async");
const { v4: uuidv4 } = require("uuid");
var dbConn = require("../dbConn");
const { verifyToken, saveError, getDateToday } = require("../functions");

var success = {
  code: 200,
  msg: "Action completed successfully!",
};

router.get("/flavor-list", verifyToken, (req, res) => {
  dbConn.query(
    `SELECT * FROM flavorList WHERE branch=TRIM(?) ORDER BY groupName`,
    [req.payload.instCode],
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

router.get("/items/:inst", (req, res) => {
  dbConn.query(
    `SELECT DISTINCT id,category,categoryDescription,categoryPhoto,branch FROM menu_category WHERE branch=TRIM(?) ORDER BY category`,
    [req.params.inst],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      // res.send(rows);
      async.map(rows, getCategoryItems, (err, response) => {
        if (err) return console.error(err);
        let cate = [];
        response.forEach((item) => {
          cate.push({
            category_id: item.id,
            category: item.category,
            categoryDescription: item.categoryDescription,
            categoryPhoto: item.categoryPhoto,
            menuItems: item.menuItems,
            branch: item.branch,
          });
        });
        res.send(cate);
      });
    }
  );
});

function getCategoryItems(data, cb) {
  let id = data.id;
  dbConn.query(
    `SELECT * FROM MenuItems WHERE category_id=TRIM(?) ORDER BY itemName`,
    [id],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return cb(error);
      }
      // WHEN THERE IS NO ERROR
      return cb(null, {
        ...data,
        menuItems: rows,
      });
    }
  );
}

router.get("/:cate/items/:inst", verifyToken, (req, res) => {
  // console.log(req.params);
  dbConn.query(
    `SELECT DISTINCT itemName, flavorGroup, itemPrice,itemFlavors,flavorQuantity,flavorLimit FROM MenuItems a INNER JOIN menu_category b ON a.category_id=b.id WHERE b.category=TRIM(?) AND a.branch=TRIM(?) ORDER BY a.itemName`,
    [req.params.cate, req.params.inst],
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

router.get("/flavor/:id", verifyToken, (req, res) => {
  dbConn.query(
    "SELECT * FROM flavorList WHERE flavor_list_id=TRIM(?)",
    [req.params.id],
    (error, rows) => {
      if (error) {
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      return res.send(rows);
    }
  );
});

router.get("/all", verifyToken, (req, res) => {
  let query =
    "SELECT a.*, c.category, d.groupName flavorGroupName, c.categoryDescription, c.categoryPhoto, b.institutionName inst_name FROM MenuItems a INNER JOIN institution b ON a.branch=b.institutionCode INNER JOIN menu_category c ON a.category_id=c.id LEFT JOIN flavorList d ON a.flavorGroup=d.flavor_list_id WHERE a.branch=TRIM(?) ORDER BY itemName";
  if (req.payload.userType === "Super Admin")
    query = `SELECT a.*, c.category, d.groupName flavorGroupName, c.categoryDescription, c.categoryPhoto, b.institutionName inst_name FROM MenuItems a INNER JOIN institution b ON a.branch=b.institutionCode INNER JOIN menu_category c ON a.category_id=c.id LEFT JOIN flavorList d ON a.flavorGroup=d.flavor_list_id ORDER BY itemName`;
  dbConn.query(query, [req.payload.instCode], (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res
        .status(400)
        .send({ error, message: "Could not complete Action" });
    }
    res.send(rows);
  });
});

router.get("/categories/:inst", verifyToken, (req, res) => {
  dbConn.query(
    `SELECT DISTINCT * FROM menu_category WHERE branch=TRIM(?) ORDER BY category`,
    [req.params.inst],
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

router.get("/list/:inst", verifyToken, (req, res) => {
  dbConn.query(
    `SELECT a.category_id,a.flavorQuantity, a.flavorGroup, a.flavorLimit, b.category,b.categoryDescription,b.categoryPhoto,a.itemName,a.itemDescription,a.itemPhoto,a.itemPrice,a.itemFlavors,a.institution FROM MenuItems a INNER JOIN menu_category b ON a.category_id=b.id WHERE b.branch=TRIM(?) AND a.itemPhoto <> "" AND b.categoryPhoto <> "" ORDER BY itemName`,
    [req.params.inst],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      // WHEN THERE IS NO ERROR
      // WHEN THERE ARE NO ITEMS TO DUPLICATE
      if (rows.length === 0)
        return res.send({
          code: 201,
          msg: "The are no menu items available to duplicate",
        });
      // WHEN ITEMS ARE FOUND
      // DUPLICATE MENU ITEMS

      return res.send({ code: 200, rows });
    }
  );
});

router.put("/item/:id", verifyToken, (req, res) => {
  let item = req.body;
  // console.log(item);
  let q = ``;
  if (item.view === "menu") {
    q = `UPDATE MenuItems SET category_id="${item.category_id.trim()}",flavorLimit=${
      item.flavorLimit
    },flavorQuantity="${item.flavorQuantity.trim()}",flavorGroup="${
      item.flavorGroup
    }",itemDescription="${item.itemDescription.trim()}",itemFlavors="${item.itemFlavors.trim()}",itemName="${item.itemName.trim()}",itemPrice=${
      item.itemPrice
    }`;

    if (item.itemPhoto != "") q += `,itemPhoto=TRIM("${item.itemPhoto}")`;
  } else if (item.view === "category") {
    q = `UPDATE menu_category SET category="${item.category.trim()}",categoryDescription="${item.categoryDescription.trim()}"`;
    if (item.categoryPhoto != "")
      q += `,categoryPhoto=TRIM("${item.categoryPhoto}")`;
  }
  let query = dbConn.query(
    `${q} WHERE id=TRIM(?)`,
    [req.params.id],
    (error, rows) => {
      // functions.saveQuery(query.sql);
      if (error) {
        // WHEN THERE IS AN ERROR
        // saveError(error);
        console.log(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      // console.log(rows);
      if (rows.changedRows === 0)
        return res.send({ code: 204, msg: "No Items were updated" });
      res.send(success);
    }
  );
});

router.put("/flavor-list/:id", verifyToken, (req, res) => {
  let bod = req.body;
  dbConn.query(
    `UPDATE flavorList SET groupName=TRIM(?), flavorLimit=TRIM(?), flavors=TRIM(?), flavorQty=TRIM(?),date_added=NOW() WHERE flavor_list_id=TRIM(?)`,
    [bod.groupName, bod.flavorLimit, bod.flavors, bod.flavorQty, bod.id],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      return res.send(success);
    }
  );
});

router.delete("/flavor-list/:id", verifyToken, (req, res) => {
  dbConn.query(
    `DELETE FROM flavorList WHERE flavor_list_id=TRIM(?)`,
    [req.params.id],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      return res.send(success);
    }
  );
});

router.delete("/item/:id/:view", verifyToken, (req, res) => {
  let q = `DELETE FROM ${
    req.params.view === "menu" ? "MenuItems" : "menu_category"
  } WHERE id=TRIM(?)`;
  dbConn.query(q, [req.params.id], (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      functions.saveError(error);
      return res
        .status(400)
        .send({ error, message: "Could not complete Action" });
    }
    res.send(success);
  });
});

router.post("/flavor-list", verifyToken, (req, res) => {
  let bod = req.body;
  dbConn.query(
    `INSERT INTO flavorList (groupName, flavors, flavorQty, flavorLimit, branch, added_by, date_added) VALUES (TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),NOW())`,
    [
      bod.groupName,
      bod.flavors,
      bod.flavorQty,
      bod.flavorLimit,
      req.payload.instCode,
      req.payload.username,
      bod.id,
    ],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      res.send(success);
    }
  );
});

router.post("/duplicate-list", verifyToken, (req, res) => {
  // console.log(req.body);
  let ent = null;
  let head = req.body.inst;
  let bod = req.body.menuItems;
  // GET ALL INSTITUTIONS TO DUPLICATE FOR
  let s = dbConn.query(
    `SELECT DISTINCT InstitutionCode branch FROM institution WHERE inst_head=TRIM(?) AND InstitutionCode<>TRIM(?)`,
    [head, head],
    (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      // console.log(s.sql);
      let categoryQuery = `INSERT INTO menu_category(id,category,categoryDescription,categoryPhoto,institution,branch,added_by,dateAdded) VALUES `;
      let menuQuery = `INSERT INTO MenuItems (category_id,flavorGroup,flavorLimit,flavorQuantity,institution,itemDescription,itemFlavors,itemName,itemPhoto,itemPrice,branch,dateCreated,added_by)
			VALUES `;
      async.map(rows, getInstCategoryCount, (err, response) => {
        if (err) {
          ent = err;
          throw new Error(err);
          return console.error(err);
        }
        // console.log("response is: ", response);
        response.forEach((det, int) => {
          let categoryId = `${det.id}`;
          let newSet = [];
          dbConn.query(
            `DELETE FROM menu_category WHERE branch=TRIM(?)`,
            [det.branch],
            (error, rows) => {
              if (error) {
                // WHEN THERE IS AN ERROR
                ent = error;
                saveError(error);
                throw new Error(error);
              }
              for (let i = 0; i < bod.length; i++) {
                let item = bod[i];
                let cateDeet = {
                  // id: `${categoryId}-${(det.count + (i + 1)).toString().padStart(3, "0")}-A`,
                  id: `${categoryId}-${uuidv4()}`,
                  category: item.category,
                  categoryDescription: item.categoryDescription,
                  categoryPhoto: item.categoryPhoto,
                  institution: item.institution,
                  branch: head,
                };
                if (!newSet.some((n) => n.category === cateDeet.category))
                  newSet.push(cateDeet);
              }
              // console.log(newSet);

              for (let i = 0; i < newSet.length; i++) {
                let item = newSet[i];
                categoryQuery += `("${item.id}","${item.category}", "${item.categoryDescription}", "${item.categoryPhoto}", "${item.institution}", "${det.branch}", "${req.payload.username}", NOW())`;
                if (i != newSet.length - 1) categoryQuery += ",";
              }
              dbConn.query(categoryQuery, (error, rows) => {
                if (error) {
                  // WHEN THERE IS AN ERROR
                  ent = error;
                  saveError(error);
                  throw new Error(error);
                  // return res.status(400).send({error,message:"Could not complete Action"});
                }
                // WHEN THERE IS NO ERROR
                for (let i = 0; i < bod.length; i++) {
                  uid = newSet.filter(
                    (cate) => cate.category === bod[i].category
                  )[0].id;
                  // console.log(bod[i]);
                  menuQuery += `("${uid}","${bod[i].flavorGroup}","${bod[i].flavorLimit}","${bod[i].flavorQuantity}","${bod[i].institution}","${bod[i].itemDescription}","${bod[i].itemFlavors}","${bod[i].itemName}","${bod[i].itemPhoto}","${bod[i].itemPrice}","${det.branch}", NOW(),"${req.payload.username}")`;
                  if (i != bod.length - 1) menuQuery += ",";
                }
                let q = dbConn.query(menuQuery, (error, rows) => {
                  // func.saveQuery(q.sql);
                  if (error) {
                    // WHEN THERE IS AN ERROR
                    ent = error;
                    saveError(error);
                    throw new Error(error);
                    // return res.status(400).send({error,message:"Could not complete Action"});
                  }
                  if (ent) res.send(ent);
                  else res.send(success);
                });
              });
            }
          );
        });
      });
    }
  );
});

function getInstCategoryCount(data, cb) {
  // console.log(data);
  let id = `C${data.branch}`;
  let sql = `SELECT COUNT(*) currentNumber FROM menu_category WHERE id LIKE "${id}%"`;
  dbConn.query(sql, (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return cb(error);
    }
    // WHEN THERE IS NO ERROR
    // console.log("here", rows);
    return cb(null, {
      ...data,
      id,
      count: rows[0].currentNumber,
    });
  });
}

router.post("/duplicate", verifyToken, (req, res) => {
  let bod = req.body.menuItems;
  // console.log(bod);
  // GET CURRENT NUMBER OF CATEGORIES FOR INSTITUTION
  let id = `C${req.body.inst}`;
  let sql = `SELECT COUNT(*) currentNumber FROM menu_category WHERE id LIKE "${id}%"`;
  dbConn.query(sql, [req.body.inst], (error, rows) => {
    if (error) {
      // WHEN THERE IS AN ERROR
      saveError(error);
      return res
        .status(400)
        .send({ error, message: "Could not complete Action" });
    }
    let val = rows[0].currentNumber;
    let q1 = `INSERT INTO menu_category(id,category,categoryDescription,categoryPhoto,institution,branch,added_by,dateAdded)
	VALUES`;
    let newSet = [];
    for (let i = 0; i < bod.length; i++) {
      let item = bod[i];
      let cateDeet = {
        // id: `${id}-${(val + (i + 1)).toString().padStart(3, "0")}`,
        id: `${id}-${uuidv4()}`,
        category: item.category,
        categoryDescription: item.categoryDescription,
        categoryPhoto: item.categoryPhoto,
        institution: item.institution,
      };
      if (!newSet.some((n) => n.category === cateDeet.category))
        newSet.push(cateDeet);
    }
    // console.log(newSet);

    for (let i = 0; i < newSet.length; i++) {
      let item = newSet[i];
      q1 += `("${item.id}","${item.category}", "${item.categoryDescription}", "${item.categoryPhoto}", "${item.institution}", "${req.body.inst}", "${req.payload.username}", NOW())`;
      if (i != newSet.length - 1) q1 += ",";
    }
    dbConn.query(q1, (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      // WHEN THERE IS NO ERROR
      let query = `INSERT INTO MenuItems (category_id,flavorGroup,flavorLimit,flavorQuantity,institution,itemDescription,itemFlavors,itemName,itemPhoto,itemPrice,branch,dateCreated,added_by)
	VALUES `;
      for (let i = 0; i < bod.length; i++) {
        uid = newSet.filter((cate) => cate.category === bod[i].category)[0].id;
        // return console.log(uid);
        query += `("${uid}","${bod[i].flavorGroup}","${bod[i].flavorLimit}","${bod[i].flavorQuantity}","${bod[i].institution}","${bod[i].itemDescription}","${bod[i].itemFlavors}","${bod[i].itemName}","${bod[i].itemPhoto}","${bod[i].itemPrice}","${req.body.inst}", NOW(),"${req.payload.username}")`;
        if (i != bod.length - 1) query += ",";
      }
      let q = dbConn.query(query, (error, rows) => {
        // func.saveQuery(q.sql);
        if (error) {
          // WHEN THERE IS AN ERROR
          saveError(error);
          return res
            .status(400)
            .send({ error, message: "Could not complete Action" });
        }
        // UPDATE CATEGORY IDs
        // dbConn.query(
        // 	`UPDATE MenuItems a INNER JOIN menu_category b ON a.branch=b.branch SET a.category_id=b.id WHERE a.branch=TRIM(?)`,
        // 	[ req.body.inst ],
        // 	(error, rows) => {
        // 		if (error) {
        // 			// WHEN THERE IS AN ERROR
        // 			saveError(error);
        // 			return res.status(400).send({error,message:"Could not complete Action"});
        // 		}
        // 	}
        // 	);
        res.send(success);
      });
    });
  });
}); // END SERVE

router.post("/item", verifyToken, (req, res) => {
  // console.log(req.payload);
  let bod = req.body;
  // return res.send(req.body);
  if (bod.view === "menu")
    dbConn.query(
      `INSERT INTO MenuItems (category_id,flavorGroup,flavorLimit,flavorQuantity,institution,branch,itemName,itemDescription,itemFlavors,itemPhoto,itemPrice,added_by,dateCreated)
    VALUES (TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),NOW())`,
      [
        bod.category_id,
        bod.flavorGroup,
        bod.flavorLimit,
        bod.flavorQuantity,
        bod.institution,
        bod.branch,
        bod.itemName,
        bod.itemDescription,
        bod.itemFlavors,
        bod.itemPhoto,
        bod.itemPrice,
        req.payload.username,
      ],
      (error, rows) => {
        if (error) {
          // WHEN THERE IS AN ERROR
          saveError(error);
          return res
            .status(400)
            .send({ error, message: "Could not complete Action" });
        }
        res.send(success);
      }
    );
  else if (bod.view === "category") {
    // GET CURRENT NUMBER OF CATEGORIES FOR INSTITUTION
    let id = `C${bod.branch}`;
    let sql = `SELECT COUNT(*) currentNumber FROM menu_category WHERE id LIKE "${id}%"`;
    dbConn.query(sql, (error, rows) => {
      if (error) {
        // WHEN THERE IS AN ERROR
        saveError(error);
        return res
          .status(400)
          .send({ error, message: "Could not complete Action" });
      }
      let val = rows[0].currentNumber;
      // let uid = `${id}-${(val + 1).toString().padStart(3, "0")}`;
      let uid = `C${bod.branch}-${uuidv4()}`;
      dbConn.query(
        `INSERT INTO menu_category(id,category,categoryDescription,categoryPhoto,institution,branch,added_by,dateAdded)
					VALUES (TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),NOW())`,
        [
          uid,
          bod.category,
          bod.categoryDescription,
          bod.categoryPhoto,
          bod.institution,
          bod.branch,
          req.payload.username,
        ],
        (error, rows) => {
          if (error) {
            // WHEN THERE IS AN ERROR
            saveError(error);
            return res
              .status(400)
              .send({ error, message: "Could not complete Action" });
          }
          res.send(success);
        }
      );
    });
  }
});

module.exports = router;
