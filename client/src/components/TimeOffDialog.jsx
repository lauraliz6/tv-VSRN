import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import { RemoveTimeOff } from "../Functions/TimeOffActions";
//HEY IMPORTANT NOTE HERE!!!!
// running a dialog will show a findDOMNode Warning, which can be ignored.
// this is a documented issue with MaterialUi but will not affect app functionality
// https://stackoverflow.com/questions/63568669/dialog-with-transition-throwing-js-warning-finddomnode-is-deprecated-in-strictm

export default function TimeOffDialog(props) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    props.passChildData(false);
  };

  const handleConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCancel = () => {
    setOpenConfirm(false);
  };

  const handleRemove = () => {
    RemoveTimeOff(props.id, props.userfulln, props.title).then((response) => {
      if (response.success) {
        setOpenConfirm(false);
        handleClose();
      } else {
        setError("Error removing Time Off Request");
      }
    });
  };

  return (
    <div>
      <Dialog
        open={props.open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="start-date">
            Starts: {props.start}
          </DialogContentText>
          <DialogContentText id="end-date">Ends: {props.end}</DialogContentText>
          {props.comment && (
            <DialogContentText id="comment">
              Comment: {props.comment}
            </DialogContentText>
          )}
          <DialogContentText id="request-date">
            Requested On: {props.requested}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {props.usertype === "vt" && (
            <Button
              color="secondary"
              variant="contained"
              onClick={handleConfirm}
            >
              REMOVE TIME OFF
            </Button>
          )}
          <Button
            onClick={handleClose}
            color="primary"
            variant="contained"
            //this ref attribute forces the focus on the "OK" button
            //so when user presses enter, it activates the button (and closes the dialog)
            ref={(input) => input && input.focus()}
          >
            OK
          </Button>
        </DialogActions>
        {openConfirm && (
          <div>
            <DialogContent>
              {" "}
              <DialogContentText>
                Are you sure you want to remove this time-off request?
              </DialogContentText>
              {error !== "" && <DialogContentText>{error}</DialogContentText>}
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" onClick={handleRemove}>
                YES, REMOVE
              </Button>
              <Button variant="outlined" onClick={handleCancel}>
                NO, DON'T REMOVE
              </Button>
            </DialogActions>
          </div>
        )}
      </Dialog>
    </div>
  );
}
