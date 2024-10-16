import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Input } from "@material-ui/core";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { writeFolderToDb } from "../Functions/BoxActions";
import { useHistory } from "react-router-dom";

//HEY IMPORTANT NOTE HERE!!!!
// running a dialog will show a findDOMNode Warning, which can be ignored.
// this is a documented issue with MaterialUi but will not affect app functionality
// https://stackoverflow.com/questions/63568669/dialog-with-transition-throwing-js-warning-finddomnode-is-deprecated-in-strictm

export default function BoxErrorDialog(props) {
  const history = useHistory();

  const handleClose = async () => {
    if (!props.folder) {
      try {
        const db = await writeFolderToDb(props.jobId, enteredFolder);
        if (db) {
          redirect();
        }
      } catch (error) {
        errRedirect();
      }
    } else {
      redirect();
    }
    props.passChildData(false);
  };

  const redirect = () => {
    let path = `/request/${props.jobId}`;
    history.push(path);
  };

  const errRedirect = () => {
    let path = "/error";
    history.push(path);
  };

  const [enteredFolder, setEnteredFolder] = useState("");
  const [okDisable, setOkDisable] = useState(true);

  useEffect(() => {
    if (props.folder || enteredFolder !== "") {
      setOkDisable(false);
    } else {
      setOkDisable(true);
    }
  }, [props.folder, enteredFolder]);

  return (
    <div>
      <Dialog
        open={props.open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"ERROR"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.text}
          </DialogContentText>
          {props.folder && (
            <DialogContentText>
              <a
                href={`https://[company].app.box.com/folder/${props.folder}`}
                target="_blank"
                rel="noreferrer"
              >
                {`https://[company].app.box.com/folder/${props.folder}`}
              </a>
              <OpenInNewIcon fontSize="small" />
            </DialogContentText>
          )}
          {!props.folder && (
            <Input
              type="text"
              fullWidth={true}
              onChange={(e) => {
                setEnteredFolder(e.target.value);
              }}
            >
              {enteredFolder}
            </Input>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="primary"
            variant="contained"
            disabled={okDisable}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
