const fs = require("fs");
const config = require("./config/config.json");
const jwt = require("jsonwebtoken");
const jwtKey = config.jwtKey;
const xlsx = require("xlsx");

module.exports = {
  createInitials: function (text) {
    let bd = text
      .trim()
      .replace(/\//g, " ")
      .replace(/-/g, " ")
      .replace(/&/g, " ")
      .split(" ");
    let initials = "";
    for (let i = 0; i < bd.length; i++) initials += bd[i].substr(0, 1);
    return initials;
  },
  saveError: function (error) {
    let today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    var tt = today.getHours().toString().padStart(2, "0");
    var m = today.getMinutes().toString().padStart(2, "0");
    var ss = today.getSeconds().toString().padStart(2, "0");
    var dayNight = tt < 12 ? "AM" : "PM";
    let dateToday = dd + "_" + mm + "_" + yyyy;
    let time = today.getHours() + ":" + m + ":" + ss + " " + dayNight;
    // let dateToday = this.getDateToday("DATE");
    // let time = this.getDateToday("TIME");
    console.log(
      "Query failed! \n  " +
        dateToday +
        " at " +
        time +
        " \n Error: " +
        JSON.stringify(error, undefined, 2)
    );
    fs.appendFile(
      "./error_logs/error_" + dateToday + ".log",
      `Time: ${time}\n\nError: ${JSON.stringify(
        error,
        undefined,
        2
      )} \n\n/********************/\n\n`,
      function (err) {
        // "Time: " + time+ "\n\nError: " + JSON.stringify(error, undefined, 2) + "\n\n/********************/\n\n", function (err) {
        if (err) throw err;
      }
    );
  },
  rmvLastComma: function (text) {
    return text.substring(0, text.length - 1);
  },
  getDateToday: function (type) {
    let today = new Date();
    let hh = today.getHours().toString().padStart(2, "0");
    let mms = today.getMilliseconds().toString().padStart(3, "0");
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    var tt = today.getHours().toString().padStart(2, "0");
    var m = today.getMinutes().toString().padStart(2, "0");
    var ss = today.getSeconds().toString().padStart(2, "0");
    var dayNight = tt < 12 ? "AM" : "PM";
    let dateToday = dd + "_" + mm + "_" + yyyy;
    let time = today.getHours() + ":" + m + ":" + ss + " " + dayNight;
    let t = today.getHours() + "_" + m + "_" + ss + "_" + dayNight;
    let dateID = dd + mm + yyyy;
    let dID = yyyy + mm + dd + hh + m + ss + mms;
    switch (type) {
      case "DATE":
        return dateToday;
        break;
      case "TIME":
        return time;
        break;
      case "TIME_ALT":
        return t;
      case "ID":
        return dateID;
      case "FULL-ID":
        return dID;
        break;
      default:
        return dateToday + " at " + time;
        break;
    } //END SWITCH
  },
  saveQuery: function (q) {
    let dateToday = this.getDateToday("DATE");
    let time = this.getDateToday("TIME");
    fs.appendFile(
      "./error_logs/query_" + dateToday + ".sql",
      q + ";\n",
      function (err) {
        // "Time: " + time+ "\n\nError: " + JSON.stringify(error, undefined, 2) + "\n\n/********************/\n\n", function (err) {
        if (err) throw err;
      }
    );
  }, //END FUNCTION
  verifyToken: function (req, res, next) {
    // return console.log(req.headers);
    if (!req.headers["x-auth"]) {
      return res.status(401).send("Unauthorized Request");
    }
    let token = req.headers["x-auth"].split(" ")[1];
    if (token === "null") {
      return res.status(401).send("Unauthorized Request");
    }
    let payload = jwt.verify(token, jwtKey, (err, decode) => {
      if (!err) {
        // WHEN THERE IS NO ERROR
        req.payload = decode;
        // console.log(decode);
        next();
      } else {
        // WHEN THERE IS AN ERROR
        console.log({ err });
        switch (err.name) {
          case "TokenExpiredError":
            return res.status(401).send("Unauthorized Request");
            break;
          default:
            return res.status(401).send("Unauthorized Request");
            break;
        }
      }
    });
    // console.log(payload);
  },
  saveCors: function (ip) {
    let dateToday = this.getDateToday("DATE");
    let time = this.getDateToday("TIME");
    console.log(
      `${ip} was blocked from accessing the server\n\tDate: ${this.getDateToday(
        "DATE"
      )}\n\tTime: ${this.getDateToday("TIME")} \n\n/********************/\n\n`
    );
    fs.appendFile(
      "./error_logs/error_" + dateToday + ".log",
      `Time: ${time}\n\nError: ${ip} was blocked from accessing the server\n\tDate: ${this.getDateToday(
        "DATE"
      )}\n\tTime: ${this.getDateToday("TIME")} \n\n/********************/\n\n`,
      function (err) {
        // "Time: " + time+ "\n\nError: " + JSON.stringify(error, undefined, 2) + "\n\n/********************/\n\n", function (err) {
        if (err) throw err;
      }
    );
  },
  getQueryString: (arr) => {
    let ns = "";
    for (let i = 0; i < arr.length; i++) {
      ns += `"${arr[i].toString()}"`;
      if (i != arr.length - 1) ns += ",";
    }
    return ns;
  },
  readExcelFile: function (file) {
    let filePath = `./.temp/${file}.xlsx`;
    let wb = xlsx.readFile(filePath);
    let ws = wb.Sheets[wb.SheetNames[0]];
    let data = xlsx.utils.sheet_to_json(ws);

    return data;
  },
};
