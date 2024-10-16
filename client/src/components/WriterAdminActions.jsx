import React, { useState } from "react";
import {
  Reminder,
  Cancel,
  MarkComplete,
  RequestNewRate,
  Corrections,
} from "../Functions/Actions";
import { useHistory } from "react-router-dom";

//IMPORTANT NOTE: SELECT AND MENU ITEM RESULT IN A DOMNODE ERROR. THIS CAN BE IGNORED.
import { Select, IconButton, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import AlertDialog from "./AlertDialog.jsx";
import ErrorDialog from "./ErrorDialog.jsx";
import LoadingDialog from "./LoadingDialog";
import { confirm } from "./ConfirmDialog";

const useStyles = makeStyles({
  div: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  btn: {
    borderRadius: 0,
  },
});

export default function WriterAdminActions(props) {
  const status = props.status;
  const id = props.id;
  const userName = props.username;
  const role = props.role;

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [loadingOpen, setLoadingOpen] = useState(false);

  const classes = useStyles();

  //select is which ACTION is selected from the dropdown
  const [select, setSelect] = useState("none");
  const handleSelect = (value) => {
    setSelect(value);
  };

  const statusActions = {
    writer: {
      audioUp: ["complete", "correction"],
      canceled: [],
      complete: [],
      rejected: ["detailChange", "newRate", "cancel"],
      progress: ["reminder", "detailChange", "newRate"],
      sent: ["reminder", "detailChange", "newRate", "cancel"],
      incomplete: ["cancel"],
    },
    admin: {
      audioUp: ["complete", "correction", "cancel", "detailChange"],
      canceled: ["detailChange"],
      complete: ["cancel", "detailChange"],
      rejected: ["detailChange", "newRate", "cancel", "detailChange"],
      progress: ["reminder", "detailChange", "newRate", "cancel"],
      sent: ["reminder", "detailChange", "newRate", "cancel"],
      incomplete: ["cancel", "detailChange"],
    },
  };

  const allActions = [
    { key: "reminder", name: "Send a Reminder" },
    { key: "detailChange", name: "Change Details" },
    { key: "newRate", name: "Request New Rate" },
    { key: "complete", name: "Mark Job Complete" },
    { key: "cancel", name: "Cancel Job" },
    { key: "correction", name: "Corrections" },
  ];

  const checkStatusActions = (action) => {
    const roleActions = statusActions[role];
    const statusOps = roleActions[status];
    const findAction = statusOps.includes(action);
    return findAction;
  };

  const softRefresh = () => {
    //this passes data up to the request/requestinfo table
    //the intent is so the data is re-retrieved, showing the updated status upon a status change or action
    props.passChildData(select);
  };

  //this is triggered from the arrow (go) button's onclick
  //takes action based on the state of 'select'
  const buttonHandler = () => {
    //allowed checks the status of the current request to make sure this action is available
    const allowed = checkStatusActions(select, role);
    if (select === "reminder") {
      if (allowed) {
        setLoadingOpen(true);
        //this action is in Actions.jsx
        Reminder(id, userName).then((response) => {
          if (response.success) {
            setAlertText("Reminder successfully sent to voice talent.");
            doneDialog();
            softRefresh();
          } else if (response.err) {
            setErrorText(response.err);
            errorDialog();
          } else {
            console.log(response);
          }
          setSelect("none");
          setLoadingOpen(false);
        });
      }
    } else if (select === "detailChange") {
      routeChange("changeDetails");
    } else if (select === "complete") {
      MarkComplete(id, role, userName).then((response) => {
        if (response.success) {
          setAlertText("Job is marked complete");
          doneDialog();
        } else {
          if (response.err) {
            setErrorText(response.err);
            errorDialog();
          }
        }
        setSelect("none");
        softRefresh();
      });
    } else if (select === "cancel") {
      if (allowed) {
        confirm(`Are you sure you want to cancel request #${id}?`).then(
          (response) => {
            if (response) {
              setLoadingOpen(true);
              //this action is in Actions.jsx
              Cancel(id, role, userName).then((response) => {
                if (response.success) {
                  setAlertText("Job successfully canceled.");
                  doneDialog();
                } else {
                  if (response.err) {
                    setErrorText(response.err);
                    errorDialog();
                  }
                }
                //whether the acton is taken or not, the actions drop-down will be cleared back to 'none'
                //and a "soft refresh" will happen
                setSelect("none");
                softRefresh();
                setLoadingOpen(false);
              });
            }
          }
        );
      }
    } else if (select === "newRate") {
      if (allowed) {
        RequestNewRate(id, role, userName).then((response) => {
          if (response.success) {
            routeChange("newRate");
          } else {
            if (response.err) {
              setErrorText(response.err);
              errorDialog();
              setSelect("none");
              softRefresh();
            }
          }
        });
      }
    } else if (select === "correction") {
      setLoadingOpen(true);
      Corrections(id, role, userName).then((response) => {
        if (response.success) {
          //next action is based on where the user initiated action for
          //in order to avoid memory leak error
          const pathname = window.location.pathname;
          if (pathname.includes("request")) {
            softRefresh();
          } else {
            routeChange("request");
          }
        } else {
          if (response.err) {
            setErrorText(response.err);
            errorDialog();
          }
          setSelect("none");
        }
        setLoadingOpen(false);
      });
    } else {
      console.log(select + " is not linked to an existing function");
    }
  };

  const doneDialog = () => {
    setAlertOpen(true);
  };

  const errorDialog = () => {
    setErrorOpen(true);
  };

  const history = useHistory();

  const routeChange = (page) => {
    let path = `/${page}/${id}`;
    history.push(path);
  };

  const setDisable = (action) => {
    const roleActions = statusActions[role];
    const actionArr = roleActions[status];
    if (actionArr && actionArr.includes(action)) {
      return false;
    } else {
      return true;
    }
  };

  return (
    <div className={classes.div}>
      <AlertDialog
        open={alertOpen}
        text={alertText}
        passChildData={setAlertOpen}
      />
      <ErrorDialog
        open={errorOpen}
        text={errorText}
        passChildData={setErrorOpen}
      />
      <LoadingDialog open={loadingOpen} passChildData={setLoadingOpen} />
      <Select
        value={select}
        label="Actions"
        onChange={(e) => handleSelect(e.target.value)}
      >
        <MenuItem value={"none"}>Select...</MenuItem>
        {allActions.map((action) => (
          <MenuItem
            key={action.key}
            value={action.key}
            disabled={setDisable(action.key)}
          >
            {action.name}
          </MenuItem>
        ))}
      </Select>
      <IconButton
        aria-label="delete"
        size="small"
        className={classes.btn}
        onClick={buttonHandler}
      >
        <ArrowForwardIcon fontSize="inherit" />
      </IconButton>
    </div>
  );
}
