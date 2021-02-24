const express = require("express");
const cors = require("cors");
const dbConn = require("../dbConn");
const config = require("../config/config.json");
var router = express.Router();
const {verifyToken, saveError, getDateToday} = require("../functions");

var success = {
	code: 200,
	msg: "Action completed successfully!"
};

/** GET ALL STAFF OF AN INSTITUTION */
router.get("/supervisors/:id", verifyToken, (req, res) => {
	dbConn.query(
		`SELECT CONCAT(firstname, ' ', surname) AS supervisor FROM staff WHERE institutionCode=TRIM(?) ORDER BY firstname`,
		[ req.params.id ],
		(error, rows) => {
			if (error) {
				//when there is an error
				saveError(error);
				return res.send(error);
			}
			res.send(rows);
		}
	);
}); //END SERVE

router.get("/type/:inst/:type", verifyToken, (req, res) => {
	// console.log(req.params);
	dbConn.query(
		`SELECT DISTINCT a.*,b.UserType staff_type FROM staff a INNER JOIN web_user b ON  a.email=b.Username WHERE institutionCode=TRIM(?) AND b.UserType=TRIM(?)`,
		[ req.params.inst, req.params.type ],
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

/** GET STAFF MEMBERS OF AN INSTITUTION */
router.get("/institution/:id", verifyToken, (req, res) => {
	let q = dbConn.query(
		"SELECT DISTINCT a.*,b.UserType staff_type FROM staff a INNER JOIN web_user b ON a.email=b.username WHERE institutionCode=TRIM(?) AND b.UserType NOT IN ('Admin', 'Super Admin')",
		[ req.params.id ],
		(error, rows) => {
			// func.saveQuery(q.sql);
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

/** GET ALL STAFF DETAILS */
router.get("/", verifyToken, (req, res) => {
	dbConn.query("SELECT * FROM staff", (error, rows) => {
		if (error) {
			//when there is an error
			saveError(error);
			return res.send(error);
		}
		return res.send(rows);
	});
}); //END SERVE

/** CREATE NEW STAFF */
router.post("/", verifyToken, (req, res) => {
	let newStaff = req.body;
	// console.log(newStaff);
	dbConn.query(
		"INSERT INTO staff(ID,Surname,Firstname,email,Gender,Age,Phone,Supervisor,InstitutionCode,Picture,date_created) VALUES (TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),now())",
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
			newStaff.picture
		],
		(error, rows) => {
			if (error) {
				//when there is an error
				func.saveError(error);
				return res.send(error);
			}
			// WHEN THERE IS NO ERROR
			dbConn.query(
				`INSERT INTO web_user (Username, Password, Fullname, UserType, InstitutionName, CreatedBy,country, user_id, DateCreated) VALUES (TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),CURDATE())`,
				[
					newStaff.email,
					newStaff.pin,
					`${newStaff.firstname} ${newStaff.surname}`,
					newStaff.staff_type,
					newStaff.inst,
					req.payload.username,
					req.payload.country,
					newStaff.staffID
				],
				(error, rows) => {
					if (error) {
						// WHEN THERE IS AN ERROR
						func.saveError(error);
						return res.send(error);
					}
					res.send({code: 200, msg: "Staff member created successfully!"});
				}
			);
		}
	);
}); //END SERVE

/** EDIT STAFF */
router.put("/:id", verifyToken, (req, res) => {
	let staff = req.body;
	// console.log(staff);
	dbConn.query(
		"UPDATE staff SET email=TRIM(?), surname=TRIM(?), firstname=TRIM(?), gender=TRIM(?), age=TRIM(?), phone=TRIM(?), supervisor=TRIM(?), institutionCode=TRIM(?),Picture=TRIM(?) WHERE id=TRIM(?)",
		[
			staff.email,
			staff.Surname,
			staff.Firstname,
			staff.Gender,
			staff.Age,
			staff.Phone,
			staff.Supervisor,
			staff.InstitutionCode,
			staff.Picture,
			req.params.id
		],
		(error, rows) => {
			if (error) {
				//when there is no error
				func.saveError(error);
				res.send(error);
			}
			//  WHEN THERE IS NO ERROR
			dbConn.query(
				`UPDATE web_user SET UserType=TRIM(?), Fullname=TRIM(?), Password=TRIM(?), InstitutionName=TRIM(?) WHERE Username=TRIM(?)`,
				[ staff.staff_type, `${staff.Firstname} ${staff.Surname}`, staff.Pin, staff.InstitutionCode, req.params.id ],
				(error, rows) => {
					if (error) {
						// WHEN THERE IS AN ERROR
						func.saveError(error);
						return res.send(error);
					}
					// WHEN THERE IS NO ERROR
					res.send({code: 200, msg: "Staff details modified successfully"});
				}
			);
		}
	); //end query
}); //END SERVE

//DELETE staff
router.delete("/:id", verifyToken, (req, res) => {
	dbConn.query("DELETE FROM staff WHERE ID=TRIM(?)", [ req.params.id ], (error, rows) => {
		if (error) {
			//when there is an error
			saveError(error);
			res.send(error);
		}
		// console.log(rows);
		if (rows.affectedRows === 0)
			return res.send({code: 404, msg: "Could not find any staff members matching ID provided"});
		dbConn.query(`DELETE FROM web_user WHERE user_id=TRIM(?)`, [ req.params.id ], (error, rows) => {
			if (error) {
				//when there is an error
				saveError(error);
				res.send(error);
			}
			res.send(success);
		});
	});
}); //END SERVE

module.exports = router;
