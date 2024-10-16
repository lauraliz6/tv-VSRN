import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import {
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@material-ui/core";

import { UserComment } from "../Functions/Actions";

const useStyles = makeStyles({
  item: {
    marginTop: 20,
  },
  paper: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
  },
  button: {
    marginTop: "5px",
    alignSelf: "flex-end",
  },
});

export default function AddComment(props) {
  const classes = useStyles();

  const id = props.id;
  const user = props.user;
  const role = props.role;
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const postComment = () => {
    setLoading(true);
    UserComment(id, user, comment, role)
      .then((response) => {
        if (response.success) {
          setComment("");
          softRefresh();
        } else {
          setError(
            "Error making a comment. Please contact the voice talent directly and log an error ticket."
          );
        }
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  const softRefresh = () => {
    //this passes data up to the request/requestinfo table
    //the intent is so the data is re-retrieved, showing the updated status upon a status change
    props.passRefreshData(comment);
  };

  return (
    <Grid item className={classes.item}>
      <Paper className={classes.paper}>
        <TextField
          id="comments"
          label="Add a comment"
          variant="outlined"
          multiline
          rows={2}
          fullWidth
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
          }}
        />
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={postComment}
          disabled={loading}
        >
          {loading && <CircularProgress size="25px" color="inherit" />}
          {!loading && "ADD"}
        </Button>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Paper>
    </Grid>
  );
}
