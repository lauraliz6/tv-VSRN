import React from "react";
import PropTypes from "prop-types";
import theme from "../StyleGuide.js";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@material-ui/core";
import { Button } from "@material-ui/core";
import { confirmable, createConfirmation } from "react-confirm";

class CorrectionsDlg extends React.Component {
  constructor(props) {
    super(props);
    this.state = { correction: "" };
  }

  render() {
    //IMPORTANT NOTE!
    //I had to define style here since this can't use the makeStyles hook
    //and this confirm is technically outside of the theme wrapper
    const style = {
      head: {
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.h6.fontSize,
        fontWeight: theme.typography.h6.fontWeight,
      },
      body: {
        fontFamily: theme.typography.fontFamily,
        fontSize: "1rem",
        fontWeight: 400,
      },
      buttons: {
        fontFamily: theme.typography.fontFamily,
        fontSize: "0.875rem",
        fontWeight: 500,
      },
    };
    const { proceedLabel, cancelLabel, show, proceed } = this.props;
    return (
      <div>
        <Dialog
          open={show}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            <span style={style.head}>Send a Correction Comment</span>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <span style={style.body}>
                Type in your correction to create a comment and send email
                notification.
              </span>
            </DialogContentText>
            <TextField
              id="correctionComment"
              label="correction comment"
              variant="outlined"
              multiline
              rows={2}
              fullWidth
              value={this.state.correction}
              onChange={(e) => {
                this.setState({ correction: e.target.value });
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => proceed({ continue: false })}>
              <span style={style.buttons}>{cancelLabel}</span>
            </Button>
            <Button
              onClick={() =>
                proceed({ continue: true, comment: this.state.correction })
              }
            >
              <span style={style.buttons}>{proceedLabel}</span>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CorrectionsDlg.propTypes = {
  okLabbel: PropTypes.string,
  cancelLabel: PropTypes.string,
  title: PropTypes.string,
  confirmation: PropTypes.string,
  show: PropTypes.bool,
  proceed: PropTypes.func, // called when ok button is clicked.
  enableEscape: PropTypes.bool,
};

export function correct(
  confirmation,
  proceedLabel = "Submit",
  cancelLabel = "Cancel",
  options = {}
) {
  return createConfirmation(confirmable(CorrectionsDlg))({
    confirmation,
    proceedLabel,
    cancelLabel,
    ...options,
  });
}
