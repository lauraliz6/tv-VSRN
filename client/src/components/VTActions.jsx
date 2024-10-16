import React, { useEffect, useState } from "react";
import { Reject, Accept } from "../Functions/Actions";
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

export default function VTActions(props) {
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
    audioUp: [],
    canceled: [],
    complete: [],
    rejected: [],
    progress: ["audioUp"],
    sent: ["accept", "reject"],
    incomplete: [],
  };

  const allActions = [
    { key: "accept", name: "Accept Job" },
    { key: "audioUp", name: "Audio Up" },
    { key: "reject", name: "Reject Job" },
  ];

  const checkStatusActions = (action) => {
    const statusOps = statusActions[status];
    const findAction = statusOps.includes(action);
    return findAction;
  };

  useEffect(() => {
    const softRefresh = () => {
      //this passes data up to the request/requestinfo table
      //the intent is so the data is re-retrieved, showing the updated status upon a status change
      props.passChildData(select);
    };
    softRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertOpen, errorOpen]);

  //this is triggered from the arrow (go) button's onclick
  //takes action based on the state of 'select'
  const buttonHandler = () => {
    //allowed checks the status of the current request to make sure this action is available
    const allowed = checkStatusActions(select);
    if (select === "reject") {
      if (allowed) {
        confirm(`Are you sure you want to reject request #${id}?`).then(
          (response) => {
            if (response) {
              setLoadingOpen(true);
              //this action is in Actions.jsx
              Reject(id, role, userName).then((response) => {
                if (response.success) {
                  setAlertText("Job successfully rejected.");
                  doneDialog();
                } else {
                  if (response.err) {
                    setErrorText(response.err);
                    errorDialog();
                  }
                }
                //whether the acton is taken or not, the actions drop-down will be cleared back to 'none'
                setSelect("none");
              });
            }
          }
        );
      }
    } else if (select === "accept") {
      setLoadingOpen(true);
      Accept(id, role, userName).then((response) => {
        if (response.success) {
          setAlertText("Job is accepted");
          doneDialog();
        } else {
          if (response.err) {
            setErrorText(response.err);
            errorDialog();
          }
        }
        setSelect("none");
      });
    } else if (select === "audioUp") {
      routeChange();
    } else {
      console.log(select + " is not linked to an existing function");
    }
  };

  const doneDialog = () => {
    setLoadingOpen(false);
    setAlertOpen(true);
  };

  const errorDialog = () => {
    setLoadingOpen(false);
    setErrorOpen(true);
  };

  const history = useHistory();

  const routeChange = () => {
    let path = `/audioUp/${id}`;
    history.push(path);
  };

  const setDisable = (action) => {
    const actionArr = statusActions[status];
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
