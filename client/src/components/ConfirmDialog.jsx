import React from "react";
import PropTypes from "prop-types";
import theme from "../StyleGuide.js";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@material-ui/core";
import { Button } from "@material-ui/core";
import { confirmable, createConfirmation } from "react-confirm";

class Confirmation extends React.Component {
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
    const { proceedLabel, cancelLabel, confirmation, show, proceed } =
      this.props;
    return (
      <div>
        <Dialog
          open={show}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            <span style={style.head}>Are you sure?</span>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <span style={style.body}>{confirmation}</span>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => proceed(false)}>
              <span style={style.buttons}>{cancelLabel}</span>
            </Button>
            <Button onClick={() => proceed(true)}>
              <span style={style.buttons}>{proceedLabel}</span>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

Confirmation.propTypes = {
  okLabbel: PropTypes.string,
  cancelLabel: PropTypes.string,
  title: PropTypes.string,
  confirmation: PropTypes.string,
  show: PropTypes.bool,
  proceed: PropTypes.func, // called when ok button is clicked.
  enableEscape: PropTypes.bool,
};

export function confirm(
  confirmation,
  proceedLabel = "Yes",
  cancelLabel = "No",
  options = {}
) {
  return createConfirmation(confirmable(Confirmation))({
    confirmation,
    proceedLabel,
    cancelLabel,
    ...options,
  });
}
