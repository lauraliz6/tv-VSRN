import React, { useState, useEffect } from "react";
import {
  TableRow,
  TableCell,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableBody,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Axios from "axios";

import { generator } from "../Functions/Security";
import AuthCheck from "./AuthCheck";
import { SendSecurityEmail } from "../Functions/Emails";

export default function AddUserRow(props) {
  const useStyles = makeStyles({
    smallCell: {
      maxWidth: 50,
    },
  });

  const classes = useStyles();

  const [newUid, setNewUid] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("none");
  const [newRates, setNewRates] = useState({
    "1-9": 0,
    "10+": 0,
    "rush1-9": 0,
    "rush10+": 0,
  });

  const [saveBtnOn, setSaveBtnOn] = useState(false);

  const handleError = (text) => {
    props.passChildErrData(text);
    props.passChildErrOpen(true);
  };

  const handleSuccess = (text) => {
    props.passChildSuccessText(text);
    props.passChildSuccessOpen(true);
  };

  useEffect(() => {
    if (
      newUid !== "" &&
      newName !== "" &&
      newEmail !== "" &&
      newRole !== "none"
    ) {
      setSaveBtnOn(true);
    } else {
      setSaveBtnOn(false);
    }
  }, [newUid, newName, newEmail, newRole]);

  const handleComplete = () => {
    const infoObj = compileInfo();
    const pwd = generator(8);
    infoObj.pwdUsers = pwd;
    checkForUserOverlap(infoObj).then((response) => {
      if (response.err) {
        //show error dialog with error from response - either name or uid already use
        handleError(response.err);
      } else {
        writeNewUserToDb(infoObj).then((response) => {
          if (response.success) {
            const message = `Welcome ${infoObj.nameUsers} to VoiSpark! Your username is ${infoObj.uidUsers} and your password is ${infoObj.pwdUsers}. Please change your password as soon as possible. Thank you!`;
            const subj = "Welcome to VoiSpark!";
            SendSecurityEmail(infoObj.emailUsers, subj, message).then(
              (response) => {
                if (response.err) {
                  handleError(
                    "Email failed to send to new user. Please manually send email and contact sysadmin to reset password."
                  );
                } else {
                  //show success dialog
                  handleSuccess("Successfully added user " + infoObj.nameUsers);
                }
              }
            );
          } else {
            //show error dialog, no new user in system
          }
        });
      }
    });

    //this closes the row
    props.passChildData(false);
  };

  const checkForUserOverlap = (info) => {
    return new Promise((resolve, reject) => {
      Axios.get("http://localhost:3001/userCheck", {
        headers: {
          uid: info.uidUsers,
          name: info.nameUsers,
        },
      }).then((response) => {
        if (response.data.err) {
          resolve({ sucess: false, err: response.data.err });
        } else {
          resolve({ success: true });
        }
      });
    });
  };

  const writeNewUserToDb = (info) => {
    return new Promise((resolve, reject) => {
      AuthCheck().then(function (authResult) {
        const auth = authResult.auth;
        if (auth) {
          Axios.post("http://localhost:3001/addUser", {
            info: info,
          }).then((response) => {
            if (response.data.success) {
              resolve({ success: true });
            } else {
              resolve({ success: false });
            }
          });
        }
      });
    });
  };

  const compileInfo = () => {
    const newInfo = {};
    newInfo.uidUsers = newUid;
    newInfo.nameUsers = newName;
    newInfo.emailUsers = newEmail;
    newInfo.roles = newRole;
    if (newRole === "vt") {
      const ratesStr = JSON.stringify(newRates);
      newInfo.rates = ratesStr;
    } else {
      newInfo.rates = 0;
    }
    console.log(newInfo);
    return newInfo;
  };

  const handleRateEntry = (e) => {
    const val = e.target.value;
    const rateType = e.target.id;
    const rates = newRates;
    rates[rateType] = parseInt(val);
    setNewRates(rates);
  };

  return (
    <TableRow>
      <TableCell></TableCell>
      <TableCell>
        <TextField
          variant="outlined"
          onChange={(e) => {
            setNewUid(e.target.value);
          }}
        >
          uidUsers
        </TextField>
      </TableCell>
      <TableCell>
        <TextField
          variant="outlined"
          onChange={(e) => {
            setNewName(e.target.value);
          }}
        >
          nameUsers
        </TextField>
      </TableCell>
      <TableCell>
        <TextField
          variant="outlined"
          onChange={(e) => {
            setNewEmail(e.target.value);
          }}
        >
          emailUsers
        </TextField>
      </TableCell>
      <TableCell>
        <Select
          variant="outlined"
          value={newRole}
          onChange={(e) => {
            setNewRole(e.target.value);
          }}
        >
          <MenuItem value="none">Select</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="writer">Writer</MenuItem>
          <MenuItem value="vt">Voice Talent</MenuItem>
        </Select>
      </TableCell>
      <TableCell>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>1-9 (per)</TableCell>
              <TableCell>10+ (full)</TableCell>
              <TableCell>1-9 rush (per)</TableCell>
              <TableCell>10+ rush (full)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell className={classes.smallCell}>
                <TextField
                  size="small"
                  className={classes.smallCell}
                  variant="outlined"
                  id="1-9"
                  onChange={(e) => {
                    handleRateEntry(e);
                  }}
                ></TextField>
              </TableCell>
              <TableCell className={classes.smallCell}>
                <TextField
                  size="small"
                  className={classes.smallCell}
                  variant="outlined"
                  id="10+"
                  onChange={(e) => {
                    handleRateEntry(e);
                  }}
                ></TextField>
              </TableCell>
              <TableCell className={classes.smallCell}>
                <TextField
                  size="small"
                  className={classes.smallCell}
                  variant="outlined"
                  id="rush1-9"
                  onChange={(e) => {
                    handleRateEntry(e);
                  }}
                ></TextField>
              </TableCell>
              <TableCell className={classes.smallCell}>
                <TextField
                  size="small"
                  className={classes.smallCell}
                  variant="outlined"
                  id="rush10+"
                  onChange={(e) => {
                    handleRateEntry(e);
                  }}
                ></TextField>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" colSpan={4}>
                Leave rates blank for admin or writer
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableCell>
      <TableCell>
        <Button
          variant="contained"
          disabled={!saveBtnOn}
          onClick={handleComplete}
        >
          Save
        </Button>
      </TableCell>
    </TableRow>
  );
}
