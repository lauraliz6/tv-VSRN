import React, { useState, useEffect, useContext } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { InputLabel, Input, Typography } from "@material-ui/core";

import { UserContext } from "../AppAuth/Context.jsx";

import { RequestTimeOff } from "../Functions/TimeOffActions";

//HEY IMPORTANT NOTE HERE!!!!
// running a dialog will show a findDOMNode Warning, which can be ignored.
// this is a documented issue with MaterialUi but will not affect app functionality
// https://stackoverflow.com/questions/63568669/dialog-with-transition-throwing-js-warning-finddomnode-is-deprecated-in-strictm

export default function TimeOffRequestDlg(props) {
  const handleClose = () => {
    setError("");
    setTimeOffStart("");
    setTimeOffEnd("");
    setTimeOffComment("");
    props.passChildData(false);
  };

  const { user } = useContext(UserContext);
  const usern = user.user.userName;

  const [timeOffStart, setTimeOffStart] = useState("");
  const [timeOffEnd, setTimeOffEnd] = useState("");
  const [timeOffComment, setTimeOffComment] = useState("");
  const [error, setError] = useState("");
  const [buttonOn, setButtonOn] = useState(false);

  const handleSubmit = () => {
    RequestTimeOff(usern, timeOffStart, timeOffEnd, timeOffComment).then(
      (response) => {
        if (response.success) {
          //refresh and close
          handleClose();
        } else {
          setError(response.err);
        }
      }
    );
  };

  useEffect(() => {
    setTimeOffStart(props.range.start);
    setTimeOffEnd(props.range.end);
  }, [props.range]);

  //verifies selected dates, enables btn if verified
  useEffect(() => {
    const today = new Date().toISOString().split("T").shift();
    if (timeOffStart === "" && timeOffEnd === "") {
      setError("");
      setButtonOn(false);
    } else if (timeOffEnd !== "" && timeOffStart > timeOffEnd) {
      setError("Selected start date occurs before selected end date.");
      setButtonOn(false);
    } else if (timeOffStart < today) {
      setError("Selected start date occurs before today.");
      setButtonOn(false);
    } else {
      setError("");
      setButtonOn(true);
    }
  }, [timeOffStart, timeOffEnd]);

  return (
    <div>
      <Dialog
        open={props.open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Request Time Off</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </DialogContent>
        <DialogContent>
          <InputLabel htmlFor="startDate" required>
            Start Date
          </InputLabel>
          <Input
            id="startDate"
            type="date"
            value={timeOffStart || ""}
            fullWidth={true}
            onChange={(e) => {
              setTimeOffStart(e.target.value);
            }}
          />
        </DialogContent>
        <DialogContent>
          <InputLabel htmlFor="endDate" required>
            End Date
          </InputLabel>
          <Input
            id="endDate"
            type="date"
            value={timeOffEnd || ""}
            fullWidth={true}
            onChange={(e) => {
              setTimeOffEnd(e.target.value);
            }}
          />
        </DialogContent>
        <DialogContent>
          <InputLabel htmlFor="comment">Comment</InputLabel>
          <Input
            id="comment"
            type="text"
            value={timeOffComment || ""}
            fullWidth={true}
            onChange={(e) => {
              setTimeOffComment(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="outlined">
            CANCEL
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={!buttonOn}
          >
            SUBMIT
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
