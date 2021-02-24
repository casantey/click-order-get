const express = require("express");
const async = require("async");
const fs = require("fs");
const xlsx = require("xlsx");
const multer = require("multer");
var router = express.Router();
var dbConn = require("../dbConn");
const {verifyToken, saveError, createInitials, readExcelFile} = require("../functions");
const {response} = require("express");

var success = {
	code: 200,
	msg: "Action completed successfully!"
};

const tempX = multer.diskStorage({
	destination(req, file, cb) {
		cb(null, ".temp");
	},
	filename: function(req, file, cb) {
		var dtp = Date.now();
		cb(null, `${dtp}.xlsx`);
	}
});

const xlsxTemp = multer({storage: tempX});

router.get("/all", (req, res) => {
	dbConn.query(
		`SELECT InstitutionCode inst_code, InstitutionName inst_name, Country country, is_head, branchDescription,branchPhoto, inst_head, instLong,instLat, Initials FROM institution WHERE Category='Restaurant'`,
		(error, rows) => {
			if (error) {
				// WHEN THERE IS AN ERROR
				saveError(error);
				return res.send(error);
			}
			// res.send(rows);
			async.map(rows, getInstitutionCategories, (err, response) => {
				async.map(response, getInstitutionDeliveryLocations, (err, response) => {
					return res.send(response);
				});
				// return res.send(response);
			});
		}
	);
});

router.get("/branches/all", verifyToken, (req, res) => {
	dbConn.query(
		`SELECT InstitutionCode inst_code, InstitutionName inst_name, Country country, is_head, districtcapital address, branchDescription,branchPhoto, inst_head, instLong,instLat, Initials FROM institution WHERE Category='Restaurant' AND inst_head=TRIM(?) AND InstitutionCode<>TRIM(?)`,
		[ req.payload.instCode, req.payload.instCode ],
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

router.get("/branches/:inst", (req, res) => {
	dbConn.query(
		`SELECT InstitutionCode inst_code, InstitutionName inst_name, Country country, is_head, districtcapital address, branchDescription,branchPhoto, inst_head, instLong,instLat, Initials FROM institution WHERE Category='Restaurant' AND inst_head=TRIM(?)`,
		[ req.params.inst ],
		(error, rows) => {
			if (error) {
				// WHEN THERE IS AN ERROR
				saveError(error);
				return res.send(error);
			}
			// res.send(rows);
			async.map(rows, getInstitutionCategories, (err, response) => {
				async.map(response, getInstitutionDeliveryLocations, (err, response) => {
					return res.send(response);
				});
				// return res.send(response);
			});
		}
	);
});

function getInstitutionDeliveryLocations(data, cb) {
	// console.log(data);
	let del_loc = `SELECT location_name,locationLong,locationLat,delivery_price,extra_notes FROM delivery_locations WHERE branch=TRIM('${data.inst_code}');`;
	let sql = dbConn.query(`${del_loc}`, (error, rows) => {
		if (error) {
			// WHEN THERE IS AN ERROR
			saveError(error);
			return cb(error);
		}
		async.map([ data ], getInstitutionDeliveryRange, (err, response) => {
			if (err) {
				console.log(err);
				throw err;
			}
			// console.log(response);
			return cb(null, {...data, delivery_range: response[0].delivery_range, delivery_locations: rows});
		});
	});
}

function getInstitutionDeliveryRange(data, cb) {
	// console.log(data);
	let del_range = `SELECT rangeFrom, rangeTo, rangeCost,branch FROM deliveryRange WHERE branch=TRIM('${data.inst_code}');`;
	let sql = dbConn.query(`${del_range}`, (error, rows) => {
		if (error) {
			// WHEN THERE IS AN ERROR
			saveError(error);
			return cb(error);
		}
		return cb(null, {delivery_range: rows});
	});
}

function getInstitutionCategories(data, cb) {
	dbConn.query(
		`SELECT DISTINCT id,category,categoryDescription,categoryPhoto,branch FROM menu_category WHERE branch=TRIM(?) ORDER BY category`,
		[ data.inst_code ],
		(error, rows) => {
			if (error) {
				// WHEN THERE IS AN ERROR
				saveError(error);
				return cb(error);
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
						branch: item.branch,
						menuItems: item.menuItems
					});
				});
				return cb(null, {...data, menuCategories: cate});
			});
		}
	);
}

function getCategoryItems(data, cb) {
	let id = data.id;
	dbConn.query(
		`SELECT itemName, itemDescription, itemPhoto, id, itemPrice FROM MenuItems WHERE category_id=TRIM(?) ORDER BY itemName`,
		[ id ],
		(error, rows) => {
			if (error) {
				// WHEN THERE IS AN ERROR
				saveError(error);
				return cb(error);
			}
			// WHEN THERE IS NO ERROR
			async.map(rows, getFlavorGroups, (err, response) => {
				if (err) {
					console.log(err);
					throw err;
				}
				// console.log(response);
				return cb(null, {
					...data,
					menuItems: response
				});
			});
		}
	);
}

function getFlavorGroups(data, cb) {
	let id = data.id;
	dbConn.query(
		`SELECT flavorGroup, itemFlavors,flavorQuantity,flavorLimit FROM MenuItemFlavors WHERE menu_id=TRIM(?)`,
		[ id ],
		(error, rows) => {
			if (error) {
				// WHEN THERE IS AN ERROR
				saveError(error);
				return cb(error);
			}
			// WHEN THERE IS NO ERROR
			// console.log(rows);
			return cb(null, {
				...data,
				flavorGroups: rows
			});
		}
	);
}

router.post("/delivery-location", xlsxTemp.single("xlsxFile"), (req, res) => {
	let data = readExcelFile(req.file.filename.split(".")[0]);
	let inst = "PBSA002";
	let query = "INSERT INTO delivery_locations (location_name,delivery_price,extra_notes,branch) VALUES \n";
	data.forEach((location, index) => {
		query += `(TRIM('${location["LOCATION "]}'),TRIM(${location.AMOUNT}), TRIM('${location["__EMPTY_4"]
			? location["__EMPTY_4"]
			: ""}'),'${inst}')`;
		if (index != data.length - 1) query += ",\n";
	});
	fs.appendFile(`./scripts/delivery_locations_${inst}.sql`, query, (err) => {
		// "Time: " + time+ "\n\nError: " + JSON.stringify(error, undefined, 2) + "\n\n/********************/\n\n", function (err) {
		if (err) throw err;
	});
	return res.send(data);
});

/** NEW INSTITUTION */
router.post("/", verifyToken, (req, res) => {
	let deet = req.body;
	let id = createInitials(deet.institutionName);
	// return res.send({id});
	if (!deet.branchPhoto)
		return res
			.status(406)
			.send({code: 406, msg: `A photo must be provided for the institution!`, title: "No photo provided"});
	if (!deet.is_head && !deet.inst_head)
		return res.status(406).send({
			code: 406,
			msg: `If institution is not headquaters, it's main branch should be provided!`,
			title: "Branch name required"
		});
	// console.log(deet);
	let sql = dbConn.query(
		`INSERT INTO institution (InstitutionCode, InstitutionName, Initials, districtcapital, Country, DateCreated, CreatedBy, Category, instLong, instLat, ghPost,is_head,branchDescription,branchPhoto,inst_head) 
		VALUES (TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?),TRIM(?))`,
		[
			deet.institutionCode,
			deet.institutionName,
			id,
			deet.initials,
			deet.country,
			deet.dateCreated,
			deet.createdBy,
			deet.category,
			deet.long,
			deet.lat,
			deet.ghPost,
			deet.is_head,
			deet.branchDescription,
			deet.branchPhoto,
			deet.is_head ? deet.institutionCode : deet.inst_head
		],
		(error, rows) => {
			// func.saveQuery(sql.sql);
			if (error) {
				// WHEN THERE IS AN ERROR
				saveError(error);
				return res.send(error);
			}
			if (!deet.is_head) {
				// IF NEW INSTITUTION IS NOT HQ, DUPICATE MENU ITEMS OF HQ
				// GET MENU ITEMS OF HQ
				dbConn.query(
					`SELECT a.category_id, b.category,b.categoryDescription,b.categoryPhoto,a.itemName,a.itemDescription,a.itemPhoto,a.itemPrice,a.itemFlavors,a.institution FROM MenuItems a INNER JOIN menu_category b ON a.category_id=b.id WHERE b.branch=TRIM(?) AND a.itemPhoto <> "" AND b.categoryPhoto <> "" ORDER BY itemName`,
					[ deet.inst_head ],
					(error, rows2) => {
						if (error) {
							// WHEN THERE IS AN ERROR
							saveError(error);
							return res.send(error);
						}
						// WHEN THERE IS NO ERROR
						// WHEN THERE ARE NO ITEMS TO DUPLICATE
						if (rows2.length === 0)
							return res.send({
								code: 201,
								msg: "The are no menu items available in the selected Branch Headquarters to duplicate"
							});
						// WHEN ITEMS ARE FOUND
						// DUPLICATE MENU ITEMS

						return res.send({code: 202, rows2});
					}
				);
			}
			else res.send(success);
		}
	);
}); //END SERVE

module.exports = router;
