const express = require("express");
const cors = require("cors");
const dbConn = require("../dbConn");
const jwt = require("jsonwebtoken");
const config = require("../config/config.json");
var router = express.Router();
const {verifyToken, saveError, getDateToday} = require("../functions");

var success = {
	code: 200,
	msg: "Action completed successfully!"
};

/** AUTHENTICATE WEB USER */
router.post("/authenticate", (req, res) => {
	// console.log(req.headers["x-forwarded-for"]);
	// console.log(req.connection.remoteAddress);
	const ip =
		(req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
	// console.log({ip});
	dbConn.query(
		`SELECT a.Username username, a.Fullname fullname, b.inst_head, c.InstitutionName inst_head_name, b.InstitutionCode instCode, b.districtcapital instLoc, a.UserType userType, a.InstitutionName institutionName, b.Country country, b.is_head, b.Category FROM web_user a INNER JOIN institution b ON a.InstitutionName=b.InstitutionName LEFT JOIN institution c ON b.inst_head=c.InstitutionCode WHERE a.Username=TRIM(?) AND a.Password=TRIM(?)`,
		[ req.body.username, req.body.password ],
		(error, rows) => {
			if (!error) {
				// WHEN THERE IS NO ERROR
				// console.log(rows);
				if (rows.length === 0) return res.send(null);
				let r = rows[0];
				let payload = {
					username: r.username,
					fullname: r.fullname,
					userType: r.userType,
					institutionName: r.institutionName,
					country: r.country,
					is_head: r.is_head,
					Category: r.Category,
					instCode: r.instCode,
					instLoc: r.instLoc,
					inst_head: r.inst_head,
					inst_head_name: r.inst_head_name
				};
				// console.log(payload);
				let token = jwt.sign(payload, config.jwtKey, {algorithm: "HS384"});
				// console.log({token});
				const d = {
					...payload,
					token
				};
				// STORE LOG DATA
				// console.log(d);
				dbConn.query(
					`INSERT INTO web_logins (username,ip_add,inst_code,log_date,access_token) VALUES (TRIM(?),TRIM(?),TRIM(?), NOW(),TRIM(?))`,
					[ d.username, ip, d.instCode, d.token ],
					(error, rows) => {
						if (!error) {
							// WHEN THERE IS NO ERROR
							res.send(d);
						}
						else {
							// WHEN THERE IS AN ERROR
							saveError(error);
							res.send(error);
						}
					}
				);
			}
			else {
				// WHEN THERE IS AN ERROR
				saveError(error);
				res.send(error);
			}
		}
	);
}); // END METHOD

module.exports = router;
