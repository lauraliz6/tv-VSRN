import React from "react";
import { withStyles } from "@material-ui/styles";
import { formatDate } from "../Functions/Formatting.jsx";

import {
  Grid,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  Paper,
  TableCell,
  TableBody,
} from "@material-ui/core";

const CommentHeadCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const CommentTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

export default function Comments(props) {
  const comments = props.comments;
  const classes = props.classes;

  const parseComments = (items) => {
    const trim = items.replace("/", "");
    const comms = trim.split("/");
    const commArr = [];
    const commObj = [];
    comms.forEach((comm) => {
      commArr.push(comm);
    });
    commArr.forEach((item) => {
      let user = item.split("p: ")[1].split(" d:")[0];
      let date = item.split("d: ")[1].split(" c:")[0];
      date = formatDate(date);
      let comment = item.split("c: ")[1];
      commObj.push({ u: user, d: date, c: comment });
    });
    const commentData = commObj.map((item, key) => (
      <CommentTableRow key={key}>
        <TableCell>{item.u}</TableCell>
        <TableCell>{item.d}</TableCell>
        <TableCell>{item.c}</TableCell>
      </CommentTableRow>
    ));
    return commentData;
  };

  return (
    <Grid item>
      <Typography
        variant="h1"
        style={{
          fontSize: "38px",
          fontFamily: "Roboto COndensed, sans-serif",
          fontWeight: "500",
          lineHeight: "1.167",
        }}
        className={classes.headers}
      >
        Comments
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <CommentHeadCell>User</CommentHeadCell>
              <CommentHeadCell>Date</CommentHeadCell>
              <CommentHeadCell>Comment</CommentHeadCell>
            </TableRow>
          </TableHead>
          {comments !== "" && (
            <TableBody>{comments && parseComments(comments)}</TableBody>
          )}
        </Table>
      </TableContainer>
    </Grid>
  );
}
