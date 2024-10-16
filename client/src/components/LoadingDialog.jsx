import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { CircularProgress } from "@material-ui/core";

//HEY IMPORTANT NOTE HERE!!!!
// running a dialog will show a findDOMNode Warning, which can be ignored.
// this is a documented issue with MaterialUi but will not affect app functionality
// https://stackoverflow.com/questions/63568669/dialog-with-transition-throwing-js-warning-finddomnode-is-deprecated-in-strictm

export default function LoadingDialog(props) {
  return (
    <div>
      <Dialog
        open={props.open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Please wait..."}</DialogTitle>
        <DialogContent style={{ margin: "auto" }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    </div>
  );
}
