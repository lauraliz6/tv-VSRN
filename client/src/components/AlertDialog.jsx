import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

//HEY IMPORTANT NOTE HERE!!!!
// running a dialog will show a findDOMNode Warning, which can be ignored.
// this is a documented issue with MaterialUi but will not affect app functionality
// https://stackoverflow.com/questions/63568669/dialog-with-transition-throwing-js-warning-finddomnode-is-deprecated-in-strictm

export default function AlertDialog(props) {
  const handleClose = () => {
    props.passChildData(false);
  };

  return (
    <div>
      <Dialog
        open={props.open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Success!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="primary"
            //this ref attribute forces the focus on the "OK" button
            //so when user presses enter, it activates the button (and closes the dialog)
            ref={(input) => input && input.focus()}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
