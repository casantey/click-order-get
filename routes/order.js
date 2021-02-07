const express = require("express");
var router = express.Router();
var dbConn = require("../dbConn");
const {verifyToken, saveError} = require("../functions");

var success = {
	code: 200,
	msg: "Action completed successfully!"
};

router.get("/today", verifyToken, (req, res) => {
	// console.log("here");
	// console.log(req.payload);
	let q = `SELECT a.*, b.orderStatus,b.orderStatusId FROM orders a INNER JOIN order_status_types b ON a.orderStatus=b.orderStatusId WHERE DATE(dateCreated)=CURDATE()`;
	if (req.payload.userType != "Super Admin") q += ` AND institution=TRIM('${req.payload.instCode}')`;
	dbConn.query(q + " ORDER BY dateCreated DESC", (error, rows) => {
		if (error) {
			// WHEN THERE IS AN ERROR
			saveError(error);
			return res.send(error);
		}
		// WHEN THERE IS NO ERROR
		res.send(rows);
	});
});

router.get("/all", verifyToken, (req, res) => {
	// console.log("here");
	// console.log(req.payload);
	let q = `SELECT a.*, b.orderStatus,b.orderStatusId FROM orders a INNER JOIN order_status_types b ON a.orderStatus=b.orderStatusId`;
	if (req.payload.userType != "Super Admin") q += ` WHERE institution=TRIM('${req.payload.instCode}')`;
	dbConn.query(q + " ORDER BY dateCreated DESC", (error, rows) => {
		if (error) {
			// WHEN THERE IS AN ERROR
			saveError(error);
			return res.send(error);
		}
		// WHEN THERE IS NO ERROR
		res.send(rows);
	});
});

router.get("/", (req, res) => {
	dbConn.query("SELECT * FROM res_orders", (error, rows) => {
		if (error) {
			saveError(error);
			return res.send(error);
		}
		res.send(rows);
	});
});

router.post("/", (req, res) => {
	let newOrder = req.body;

	dbConn.query(
		"INSERT INTO res_orders (user_id,item_id,item_quantity,order_long,order_lat,res_id) VALUES(TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?))",
		[
			newOrder.user_id,
			newOrder.item_id,
			newOrder.item_quantity,
			newOrder.order_long,
			newOrder.order_lat,
			newOrder.res_id
		],
		(error, rows) => {
			if (error) {
				saveError(error);
				return res.send(error);
			}
			res.send({code: 200, msg: "Order has been placed"});
		}
	);
});

module.exports = router;
