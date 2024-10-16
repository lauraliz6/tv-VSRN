const express = require("express");
const mysql2 = require("mysql2");
const cors = require("cors");
let nodemailer = require("nodemailer");

const dotenv = require("dotenv");
dotenv.config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt = require("jsonwebtoken");
const { response } = require("express");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    //this secret should be rotated periodically
    //we could also store the session vars in a db like on this article: https://blog.jscrambler.com/best-practices-for-secure-session-management-in-node
    secret: process.env.DB_JWTSECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      //expires in 24 hours
      expires: 24 * 60 * 60 * 1000,
    },
  })
);

// const db = mysql2.createConnection({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// });

//variables are stored in .env, which is ignored by git
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

let db;

const dbConnect = () => {
  return new Promise((resolve, reject) => {
    try {
      db = mysql2.createConnection(dbConfig);
      db.connect(function (err) {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });
};

dbConnect();

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.send("We need a token.");
  } else {
    jwt.verify(token, process.env.DB_JWTSECRET, (err, decoded) => {
      if (err) {
        res.json({
          auth: false,
          message: "Authentication failed.",
        });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};

app.get("/isUserAuth", verifyJWT, (req, res) => {
  res.json({ auth: true, message: "Authentication successful." });
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.get("/logout", (req, res) => {
  res.status(200).clearCookie("userId", {
    path: "/",
  });
  req.session.destroy();
  delete req.headers["x-access-token"];
  res.send({ loggedIn: false });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  db.query(
    "SELECT * from users WHERE uidUsers = ?;",
    username,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }
      if (result.length > 0) {
        bcrypt.compare(password, result[0].pwdUsers, (error, response) => {
          if (response) {
            const id = result[0].id;
            const token = jwt.sign({ id }, process.env.DB_JWTSECRET, {
              //the expiration date here is set to 5 days, but should really be using a refresh token as in:
              //https://ahorasomos.izertis.com/solidgear/refresh-token-autenticacion-jwt-implementacion-nodejs/
              expiresIn: "5d",
            });
            req.session.user = result;
            res.json({ auth: true, token: token });
          } else {
            res.json({
              auth: false,
              message: "Wrong username/password combination.",
            });
          }
        });
      } else {
        res.json({
          auth: false,
          message: "No user with this username exists.",
        });
      }
    }
  );
});

app.post("/changePassword", (req, res) => {
  const username = req.body.username;
  const oldPass = req.body.old;
  const newPass = req.body.new;

  db.query(
    "SELECT * from users WHERE uidUsers =?;",
    username,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }
      if (result.length > 0) {
        bcrypt.compare(oldPass, result[0].pwdUsers, (error, response) => {
          if (response) {
            bcrypt.hash(newPass, saltRounds, (err, hash) => {
              if (err) {
                console.log(err);
              }
              db.query(
                "UPDATE users SET pwdUsers = ? WHERE uidUsers = ?",
                [hash, username],
                (err, result) => {
                  console.log(err);
                  res.send("success");
                }
              );
            });
          } else {
            res.json({ err: true, message: "Old password incorrect." });
          }
        });
      } else {
        res.json({ err: true, message: "An error has occured." });
      }
    }
  );
});

app.listen(3001, () => {
  console.log("running server");
});

//table of voice requests
app.get("/voiceRequests", (req, res) => {
  const rows = req.headers.rows;
  const page = req.headers.page;
  const orderBy = req.headers.orderby;
  const order = req.headers.order;

  let sqlFilter = "";
  const role = req.headers.userrole;
  const name = req.headers.username;
  const toggle = req.headers.toggle;

  let searchFilter = "";
  const search = req.headers.search;
  const keys = req.headers.searchby.split(",");
  if (search !== "") {
    searchFilter += "AND (";
    keys.forEach((key, index) => {
      searchFilter += "INSTR(" + key + ", '" + search + "') > 0 ";
      if (index < keys.length - 1) {
        searchFilter += "OR ";
      }
    });
    searchFilter += ")";
  }

  if (role === "vt") {
    sqlFilter = `AND talent="${name}" AND status != "incomplete"`;
  }
  if (role === "writer" && toggle === "true") {
    sqlFilter = `AND writer="${name}"`;
  }

  //this initial filter makes it so that a user without an assigned role cannot see any info
  //if role is empty (passed from frontend) the second part will be included, so no entries will show as no entries have an id of 1
  let initFilter = "WHERE id = 1";
  //if role is not empty, all roles with an id bigger than 1 (which is all of them) will show
  if (role != "") {
    initFilter = "WHERE id > 1";
  }

  const query = `SELECT * FROM voiceRequests ${initFilter} ${sqlFilter} ${searchFilter} ORDER BY ${orderBy} ${order} LIMIT ${rows} OFFSET ${
    rows * page
  };`;

  db.query(query, (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.send(result);
    }
  });
});

app.get("/numVoiceRequests", (req, res) => {
  const role = req.headers.role;
  const user = req.headers.name;
  const toggle = req.headers.toggle;
  let sqlFilter = "";
  // WHERE talent =
  if (role === "writer" && toggle === "true") {
    sqlFilter = `WHERE writer = "${user}"`;
  }
  if (role === "vt") {
    sqlFilter = `WHERE talent = "${user}" AND status != "incomplete"`;
  }

  let searchFilter = "";
  const search = req.headers.search;
  const keys = req.headers.searchby.split(",");
  if (search !== "") {
    if (sqlFilter) {
      searchFilter += "AND (";
    } else {
      searchFilter += "WHERE (";
    }

    keys.forEach((key, index) => {
      searchFilter += "INSTR(" + key + ", '" + search + "') > 0 ";
      if (index < keys.length - 1) {
        searchFilter += "OR ";
      }
    });
    searchFilter += ")";
  }

  db.query(
    `SELECT COUNT(id) AS Length FROM voiceRequests ${sqlFilter} ${searchFilter};`,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.send(result);
      }
    }
  );
});

app.get("/vts", (req, res) => {
  db.query(
    `SELECT idUsers, uidUsers, nameUsers, emailUsers, roles, rates FROM users WHERE roles = 'vt';`,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.send(result);
      }
    }
  );
});

//posts to comments
app.post("/comment", (req, res) => {
  const id = req.body.id;
  const comment = req.body.comment;
  db.query(
    `SELECT comments FROM voicerequests WHERE id=${id}`,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else if (result.length <= 0) {
        res.send({ err: err });
      } else {
        const existComments = result[0].comments;
        let commQuery = "";
        if (existComments === null) {
          commQuery = "UPDATE voicerequests SET comments = ? WHERE id=?;";
        } else {
          commQuery =
            "UPDATE voicerequests SET comments = concat(comments,?) WHERE id=?;";
        }
        db.query(commQuery, [comment, id], (err, result) => {
          if (err) {
            res.send({ err: err });
          } else {
            res.send({ success: true });
          }
        });
      }
    }
  );
});

//changes status
app.post("/status", (req, res) => {
  const id = req.body.id;
  const status = req.body.status;
  db.query(
    "UPDATE voicerequests SET status = ? WHERE id= ?;",
    [status, id],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.send({ success: true });
      }
    }
  );
});

//fetches info for individual request
app.get("/requestInfo", (req, res) => {
  const id = req.headers.id;
  const role = req.headers.userrole;
  const user = req.headers.username;

  const query = `SELECT * FROM voiceRequests WHERE id = ${id};`;

  db.query(query, (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      if (result.length > 0) {
        if (role === "vt" && result[0].talent != user) {
          res.send({ err: "Permission denied." });
        } else {
          res.send(result);
        }
      } else {
        res.send({ err: "No info found for this ID number." });
      }
    }
  });
});

//alldata
app.get("/allData", (req, res) => {
  db.query(`SELECT * FROM voiceRequests`, (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.send(result);
    }
  });
});

//allWriters
app.get("/allWriters", (req, res) => {
  db.query(
    `SELECT idUsers, uidUsers, nameUsers, emailUsers, roles, rates FROM users WHERE roles = 'writer';`,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.send(result);
      }
    }
  );
});

//post change details
app.post("/postDetails", (req, res) => {
  const id = req.body.id;
  const status = req.body.status;
  const cName = req.body.customer;
  const vTitle = req.body.videoTitle;
  const writer = req.body.writer;
  const wfid = req.body.wfID;
  const vd = req.body.reviewCycle;
  const boxLink = req.body.boxLink;
  const rush = req.body.rush;
  const scriptType = req.body.scriptType;
  const chaptersModules = req.body.chaptersModules;
  const dueDate = req.body.dueDate;
  const rate = req.body.rate;

  db.query(
    "UPDATE voicerequests SET status = ?, customer = ?, videoTitle = ?, writer = ?, wfID = ?, reviewCycle = ?, boxLink = ?, rush = ?, scriptType = ?, chaptersModules = ?, dueDate = ?, rate = ? WHERE id =?;",
    [
      status,
      cName,
      vTitle,
      writer,
      wfid,
      vd,
      boxLink,
      rush,
      scriptType,
      chaptersModules,
      dueDate,
      rate,
      id,
    ],
    (err) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.send({ success: true });
      }
    }
  );
});

//adding a NEW request
app.post("/newRequest", (req, res) => {
  const reqInfo = req.body.info;
  const user = req.body.user;
  const date = req.body.date;

  const status = "sent";

  db.query(
    "INSERT INTO voiceRequests (status, writer, wfID, customer, videoTitle, talent, jobDescription, reviewCycle, scriptType, chaptersModules, sentDate, dueDate, rate, rush, boxLink) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
    [
      status,
      user,
      reqInfo.wfID,
      reqInfo.customer,
      reqInfo.videoTitle,
      reqInfo.talent,
      reqInfo.jobDescription,
      reqInfo.reviewCycle,
      reqInfo.scriptType,
      reqInfo.chaptersModules,
      date,
      reqInfo.dueDate,
      reqInfo.rate,
      reqInfo.rush,
      reqInfo.boxLink,
    ],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.send(result);
      }
    }
  );
});

//getting box folder for audio upload
app.get("/audioFolder", (req, res) => {
  const id = req.headers.id;
  db.query(
    `SELECT boxLink FROM voiceRequests WHERE id = ${id};`,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        const folder = result[0].boxLink;
        if (folder && folder.includes("box.com")) {
          const folderId = folder.split("/").pop();
          if (folderId && folderId > 0) {
            getTokens().then((response) => {
              if (response.success) {
                const token = response.data;
                getAudioFolder(token, folderId).then((response) => {
                  if (response.success) {
                    res.send({ data: response.data });
                  } else {
                    res.send({ err: "No folder found" });
                  }
                });
              } else {
                res.send({
                  data: folderId,
                  err: "Lost Box database connection.",
                });
              }
            });
          } else {
            res.send({ err: "No folder found" });
          }
        } else {
          res.send({ err: "No folder found" });
        }
      }
    }
  );
});

//getting folder info to fetch audio folder
function getAudioFolder(token, parentFolder) {
  return new Promise((resolve, reject) => {
    var axios = require("axios");

    var config = {
      method: "get",
      url: `https://api.box.com/2.0/folders/${parentFolder}/items`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(config)
      .then(function (response) {
        const data = response.data;
        const items = data.entries;
        const audioFolder = items.find(
          (item) => item.type === "folder" && item.name === "Audio"
        );
        if (audioFolder) {
          const audioFolderId = audioFolder.id;
          resolve({ success: true, data: audioFolderId });
        } else {
          resolve({ success: false });
        }
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

//
//
//
//fetches email address
app.get("/emailAddress", (req, res) => {
  const role = req.headers.role;
  const id = req.headers.id;
  db.query(
    `SELECT ${role} FROM voiceRequests WHERE id = ${id};`,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        const userN = result[0][`${role}`];
        db.query(
          `SELECT emailUsers FROM users WHERE nameUsers = "${userN}"`,
          (err, result) => {
            if (err) {
              res.send({ err: err });
            } else {
              res.send(result);
            }
          }
        );
      }
    }
  );
});

//EMAIL STUFF
let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PWD,
  },
  //added per this forum answer: https://stackoverflow.com/questions/66317125/node-js-nodemailer-error-wrong-version-number-invalid-greeting
  tls: {
    ciphers: "SSLv3",
  },
});

// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

app.post("/email", (req, res, next) => {
  var from = '"VoiSpark Service" <[voispark email]>';
  var to = req.body.email;
  var subject = req.body.subject;
  var msgExtras = req.body.extra;
  let plain;
  let formatted;
  if (msgExtras) {
    let plainArr = msgExtras.map((msg) => {
      return msg.title + ": " + msg.data;
    });
    let plainExtras = plainArr.join("\n");
    plain =
      req.body.message + "\n" + plainExtras + "\nVoice Request #" + req.body.id;
    let formatArr = msgExtras.map((msg) => {
      return `<p><b>${msg.title}</b>: ${msg.data}</p>`;
    });
    let formatExtras = formatArr.join("");
    formatted = `<p>${req.body.message}</p>${formatExtras}<p><a href='http://localhost:3000/request/${req.body.id}'>Voice Request #${req.body.id}</a></p>`;
  } else {
    plain = req.body.message + "\nVoice Request #" + req.body.id;
    formatted = `<p>${req.body.message}</p><p><a href='http://localhost:3000/request/${req.body.id}'>Voice Request #${req.body.id}</a></p>`;
  }
  var mail = {
    from: from,
    to: to,
    subject: subject,
    text: plain,
    html: formatted,
  };

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      console.log(err);
      res.json({
        status: "error",
      });
    } else {
      res.json({
        status: "success",
      });
    }
  });
});

//write box folder to db
app.post("/writeBoxFolder", (req, res) => {
  const id = req.body.id;
  const folder = req.body.folder;

  db.query(
    "UPDATE voicerequests SET boxLink = ? WHERE id =?;",
    [folder, id],
    (err) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.send({ success: true });
      }
    }
  );
});

//TIME OFF
app.get("/timeOff", (req, res) => {
  const usertype = req.headers.usertype;
  const user = req.headers.username;
  const calstart = req.headers.start.split("T").shift();
  const calend = req.headers.end.split("T").shift();
  let monthLimit = `WHERE ((startTimeOff BETWEEN '${calstart}' AND '${calend}') OR (endTimeOff BETWEEN '${calstart}' AND '${calend}'))`;
  let sqlLimit = "";
  if (!usertype || usertype === "vt") {
    sqlLimit = `AND vtUser = "${user}"`;
  }
  const query = `SELECT * FROM timeOff ${monthLimit} ${sqlLimit};`;
  db.query(query, (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      let timeoffs = [];
      let entriesProcessed = 0;
      if (result.length > 0) {
        result.forEach((row) => {
          let talent = row.vtUser;
          db.query(
            `SELECT nameUsers FROM users WHERE uidUsers = "${talent}";`,
            (err, result2) => {
              if (err || result2.length < 0) {
                res.send({ err: err });
              } else {
                if (result2.length > 0) {
                  let name = result2[0].nameUsers;
                  let timeoff = {
                    id: row.idTimeOff,
                    start: row.startTimeOff,
                    end: row.endTimeOff,
                    talent: name,
                    reqDate: row.curDate,
                    comment: row.toComment,
                  };
                  timeoffs.push(timeoff);
                  entriesProcessed++;
                  if (entriesProcessed === result.length) {
                    finalStep(timeoffs);
                  }
                }
              }
            }
          );
        });
      } else {
        finalStep(timeoffs);
      }
    }
  });
  function finalStep(timeoffs) {
    res.send(timeoffs);
  }
});

//ADD/REQUEST TIME OFF
app.post("/addTimeOff", (req, res) => {
  const user = req.body.uid;
  const start = req.body.start;
  const end = req.body.end;
  const comment = req.body.comment;
  const date = new Date();
  //first look for any overlaps
  db.query(
    `SELECT * FROM timeOff WHERE vtUser = "${user}" AND ((startTimeOff BETWEEN "${start}" AND "${end}") OR (endTimeOff BETWEEN "${start}" AND "${end}"));`,
    (err, result) => {
      if (err) {
        res.send({
          success: false,
          err: "Database error, please contact admin.",
        });
      } else {
        if (result.length > 0) {
          res.send({
            success: false,
            err: "Found overlap in requested time-off dates. Please contact admin or select new dates.",
          });
        } else {
          db.query(
            "INSERT INTO timeOff (vtUser, curDate, startTimeOff, endTimeOff, toComment) VALUES (?, ?, ?, ?, ?);",
            [user, date, start, end, comment],
            (err, result) => {
              if (err) {
                res.send({ success: false, err: err });
              } else {
                res.send({ success: true });
              }
            }
          );
        }
      }
    }
  );
});

//REMOVE TIMEOFF
app.post("/removeTimeOff", (req, res) => {
  const id = req.body.id;
  db.query("DELETE FROM timeOff WHERE idTimeOff = ?;", [id], (err) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.send({ success: true });
    }
  });
});

//LOOK FOR TIME OFF ON SPECIFIC DUE DATE
app.get("/timeOffSearch", (req, res) => {
  const usertype = req.headers.usertype;
  const date = req.headers.duedate;
  if (usertype || usertype !== "vt") {
    const query = `SELECT vtUser FROM timeOff WHERE startTimeOff <= "${date}" AND endTimeOff >= "${date}";`;
    db.query(query, (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        if (result.length > 0) {
          const vtarr = [];
          result.forEach((row) => {
            vtarr.push(row.vtUser);
          });
          res.send({ vts: vtarr });
        } else {
          res.send({ vts: [] });
        }
      }
    });
  }
});

//BOX API
//variables are stored in .env, which is ignored by git

//CURRENTLY USING LOCAL DB, NEED TO CONFIGURE TO STORE ELSEWHERE FOR PROD
const boxDbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.BOXDB_DATABASE,
};

let box_db;

const boxDbConnect = () => {
  return new Promise((resolve, reject) => {
    try {
      box_db = mysql2.createConnection(boxDbConfig);
      box_db.connect(function (err) {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });
};

function testAccess(token) {
  return new Promise((resolve) => {
    var axios = require("axios");

    var config = {
      method: "get",
      url: "https://api.box.com/2.0/folders/[sample folder]",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(config)
      .then(function (response) {
        resolve({ success: true });
      })
      .catch(function (error) {
        resolve({ success: false });
      });
  });
}

function refreshTokens(refresh) {
  return new Promise((resolve) => {
    var axios = require("axios");
    var qs = require("qs");
    var data = qs.stringify({
      grant_type: "refresh_token",
      client_id: process.env.BOX_CLIENTID,
      client_secret: process.env.BOX_CLIENTSECRET,
      refresh_token: refresh,
    });
    var config = {
      method: "post",
      url: "https://api.box.com/oauth2/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        resolve({ success: true, data: JSON.stringify(response.data) });
      })
      .catch(function (error) {
        resolve({ success: false, data: error });
      });
  });
}

app.get("/boxaccess", (req, res) => {
  getTokens().then((response) => {
    if (response.success) {
      res.send(response.data);
    } else {
      res.send("error");
    }
  });
});

function getTokens() {
  return new Promise((resolve, reject) => {
    try {
      fetchTokensFromDb().then((response) => {
        if (response.err) {
          resolve({ success: false });
        } else {
          const access = response[0].access_token;
          const refresh = response[0].refresh_token;
          testAccess(access).then((response) => {
            if (response.success) {
              resolve({ success: true, data: access });
            } else {
              refreshTokens(refresh).then((response) => {
                if (response.success) {
                  var data = JSON.parse(response.data);
                  const newAccess = data.access_token;
                  const newRefresh = data.refresh_token;
                  const exp = data.expires_in;
                  writeTokensToDb(newAccess, newRefresh, exp).then(
                    (response) => {
                      if (response.success) {
                        resolve({ success: true, data: newAccess });
                      } else {
                        resolve({ success: false });
                      }
                      box_db.end();
                    }
                  );
                } else {
                  console.log("failure to refresh tokens");
                }
              });
            }
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

function fetchTokensFromDb() {
  return new Promise((resolve, reject) => {
    try {
      boxDbConnect().then((response) => {
        if (!response) {
          resolve({ err: "no connection" });
        } else {
          box_db.query(`SELECT * FROM boxApiTokens`, (err, result) => {
            if (err) {
              resolve({ err: err });
            } else {
              resolve(result);
            }
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

function writeTokensToDb(access, refresh, exp) {
  return new Promise((resolve, reject) => {
    const expAt = exp * 1000;
    try {
      box_db.query(
        "UPDATE boxApiTokens SET access_token = ?, refresh_token = ?, expires_at = ? WHERE conn_num =?;",
        [access, refresh, expAt, 1],
        (err) => {
          if (err) {
            resolve({ success: false });
          } else {
            resolve({ success: true });
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

app.get("/boxaccess", (req, res) => {
  getTokens().then((response) => {
    if (response.success) {
      res.send(response.data);
    } else {
      console.log("box err");
      res.send("error");
    }
  });
});

//EXAMPLE FOR CALLING ANOTHER FUNCTION IN ANOTHER FILE
// const lib = require("./lib");

// const result = lib.add(4, 4);
// console.log(`The result is: ${result}`);

//CORS
app.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get("/", function (req, res, next) {
  // Handle the get for this route
});

app.post("/", function (req, res, next) {
  // Handle the post for this route
});

//WORKFRONT
app.get("/wfapi", (req, res) => {
  const axios = require("axios");
  const wfid = req.headers.wfid;
  const apiKey = process.env.WF_APIKEY;

  let config = {
    method: "get",
    url:
      //NEEDS TO BE UPDATED TO PROD ENVIRONMENT
      "https://[company].workfront.com/attask/api/v9.0/project/" +
      wfid +
      "?apiKey=" +
      apiKey,
  };

  axios(config)
    .then((response) => {
      const vidName = response.data.data.name;
      res.send(JSON.stringify({ success: true, video: vidName }));
    })
    .catch((error) => {
      res.send(JSON.stringify({ success: false, error: error }));
    });
});

app.post("/wfpost", function (req, res) {
  var axios = require("axios");

  const apiKey = process.env.WF_APIKEY;
  const id = req.body.id;
  const note = req.body.note;

  var config = {
    method: "post",
    url:
      //NEEDS TO BE UPDATED TO PRODUCTION ENVIRONMENT
      "https://[company].workfront.com/attask/api/v9.0/note?noteText=" +
      note +
      "&projectID=" +
      id +
      "&topNoteObjCode=PROJ&topObjID=" +
      id +
      "&apiKey=" +
      apiKey,
  };

  axios(config)
    .then(function (response) {
      res.send(JSON.stringify({ success: true, data: response.data.data }));
    })
    .catch(function (error) {
      res.send(JSON.stringify({ success: false, error: error }));
    });
});

///
//
///
//
//USER MANAGEMENT
//
//fetch all users
app.get("/allUsers", (req, res) => {
  db.query(
    `SELECT idUsers, uidUsers, nameUsers, emailUsers, roles, rates FROM users;`,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.send(result);
      }
    }
  );
});

//change user info - from admin User Management
app.post("/updateUserInfo", (req, res) => {
  const changes = req.body.changes;
  const user = changes.userId;
  const props = changes.props;
  let queryStr = "UPDATE users SET ";
  let changesStrArr = [];
  let changesArr = [];
  props.forEach((prop) => {
    changesStrArr.push(prop.id + "=?");
    changesArr.push(prop.new);
  });
  const changesStr = changesStrArr.join(", ");
  queryStr += changesStr;
  queryStr += " WHERE uidUsers = ?";
  changesArr.push(user);
  queryStr += ";";
  db.query(queryStr, changesArr, (err) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.send({ success: true });
    }
  });
});

app.post("/changeNamesVRDB", (req, res) => {
  const changes = req.body.changes;
  //first replace where name is writer
  // UPDATE tutorial_db.voicerequests SET writer = "Laura Brown" WHERE writer = "Joe Chung";
  let queryStr = "UPDATE voicerequests SET writer = ? WHERE writer = ?;";
  let queryParams = [changes.new, changes.old];
  db.query(queryStr, queryParams, (err) => {
    if (err) {
      res.send({ err: err });
    } else {
      //then replace where name is talent
      let secondQueryStr =
        "UPDATE voicerequests SET talent = ? WHERE talent = ?;";
      db.query(secondQueryStr, queryParams, (err) => {
        if (err) {
          res.send({ err: err });
        } else {
          res.send({ success: true });
        }
      });
    }
  });
});

//adding a new user
app.post("/addUser", (req, res) => {
  const newUserInfo = req.body.info;
  const uid = newUserInfo.uidUsers;
  const name = newUserInfo.nameUsers;
  const email = newUserInfo.emailUsers;
  const role = newUserInfo.roles;
  const rate = newUserInfo.rates;
  const pwd = newUserInfo.pwdUsers;
  //encrypting password
  bcrypt.hash(pwd, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }
    db.query(
      "INSERT INTO users (uidUsers, nameUsers, emailUsers, pwdUsers, roles, rates) VALUES (?, ?, ?, ?, ?, ?);",
      [uid, name, email, hash, role, rate],
      (err, result) => {
        if (err) {
          console.log(err);
          res.send({ success: false });
        } else {
          res.send({ success: true });
        }
      }
    );
  });
});

//checking for user exists
app.get("/userCheck", (req, res) => {
  const uid = req.headers.uid;
  const name = req.headers.name;
  db.query(
    `SELECT idUsers FROM users WHERE uidUsers = "${uid}";`,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        if (result.length > 0) {
          res.send({ err: "UID already in use in database." });
        } else {
          db.query(
            `SELECT idUsers FROM users WHERE nameUsers = "${name}";`,
            (err, result) => {
              if (err) {
                res.send({ err: err });
              } else {
                if (result.length > 0) {
                  res.send({ err: "Name already in use in database." });
                } else {
                  res.send({ okay: true });
                }
              }
            }
          );
        }
      }
    }
  );
});

app.post("/securityEmail", (req, res, next) => {
  var from = '"VoiSpark Service" <[email address]>';
  var to = req.body.email;
  var subject = req.body.subject;
  let plain;
  let formatted;
  plain = req.body.message;
  formatted = `<p>${req.body.message}</p>`;
  var mail = {
    from: from,
    to: to,
    subject: subject,
    text: plain,
    html: formatted,
  };

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      console.log(err);
      res.json({
        status: "error",
      });
    } else {
      res.json({
        status: "success",
      });
    }
  });
});

//
//dashboard data
app.get("/sqlData", (req, res) => {
  const status = req.headers.status;
  db.query(
    `SELECT COUNT(id) AS Length FROM voiceRequests WHERE status = '${status}'`,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.send(result);
      }
    }
  );
});

app.get("/vtRequestsList", (req, res) => {
  const user = req.headers.user;
  let query = `SELECT id FROM voiceRequests`;
  if (user !== "all") {
    query += ` WHERE talent = '${user}'`;
  }
  db.query(query, (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.send(result);
    }
  });
});

app.get("/wtRequestsList", (req, res) => {
  const user = req.headers.user;
  let query = `SELECT id FROM voiceRequests`;
  if (user !== "all") {
    query += ` WHERE writer = '${user}'`;
  }
  db.query(query, (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.send(result);
    }
  });
});

app.get("/vtDashData", (req, res) => {
  const vt = req.headers.vt;
  let query = `SELECT COUNT(id) AS Length, SUM(rate) AS Cost FROM voiceRequests`;
  if (vt !== "all") {
    query += ` WHERE talent = '${vt}'`;
  }
  db.query(query, (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.send(result);
    }
  });
});

app.get("/wtDashData", (req, res) => {
  const writer = req.headers.writer;
  let query = `SELECT COUNT(id) AS Length, SUM(rate) AS Cost FROM voiceRequests`;
  if (writer !== "all") {
    query += ` WHERE writer = '${writer}'`;
  }
  db.query(query, (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.send(result);
    }
  });
});

app.get("/vtDashDataGroup", (req, res) => {
  const vt = req.headers.vt;
  let querySel = `SELECT MONTHNAME(dueDate) As Month, YEAR(dueDate) AS Year, COUNT(id) AS Length, SUM(rate) AS Cost FROM voiceRequests`;
  let queryWhere = ``;
  if (vt !== "all") {
    queryWhere = ` WHERE talent = '${vt}'`;
  }
  let queryGroup = ` GROUP BY YEAR(dueDate), MONTHNAME(dueDate);`;
  let query = querySel + queryWhere + queryGroup;
  db.query(query, (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.send(result);
    }
  });
});

app.get("/wtDashDataGroup", (req, res) => {
  const writer = req.headers.writer;
  let querySel = `SELECT MONTHNAME(dueDate) As Month, YEAR(dueDate) AS Year, COUNT(id) AS Length, SUM(rate) AS Cost FROM voiceRequests`;
  let queryWhere = ``;
  if (writer !== "all") {
    queryWhere = ` WHERE writer = '${writer}'`;
  }
  let queryGroup = ` GROUP BY YEAR(dueDate), MONTHNAME(dueDate);`;
  let query = querySel + queryWhere + queryGroup;
  db.query(query, (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.send(result);
    }
  });
});

app.get("/vtDashDataByGroup", (req, res) => {
  const vt = req.headers.vt;
  const group = req.headers.group;
  let querySel = `SELECT COUNT(id) as Length, ${group} FROM voiceRequests`;
  let queryWhere = ``;
  if (vt !== "all") {
    queryWhere = ` WHERE talent = '${vt}'`;
  }
  let queryGroup = ` GROUP BY ${group};`;
  let query = querySel + queryWhere + queryGroup;
  db.query(query, (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.send(result);
    }
  });
});

app.get("/wtDashDataByGroup", (req, res) => {
  const writer = req.headers.writer;
  const group = req.headers.group;
  let querySel = `SELECT COUNT(id) as Length, ${group} FROM voiceRequests`;
  let queryWhere = ``;
  if (writer !== "all") {
    queryWhere = ` WHERE writer = '${writer}'`;
  }
  let queryGroup = ` GROUP BY ${group};`;
  let query = querySel + queryWhere + queryGroup;
  db.query(query, (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.send(result);
    }
  });
});
