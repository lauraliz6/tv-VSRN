import {
  Container,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import React, { useContext, useState } from "react";
import { UserContext } from "../AppAuth/Context.jsx";

import { makeStyles, withStyles } from "@material-ui/styles";
import theme from "../StyleGuide.js";

import RequestTable from "../components/RequestTable";

const useStyles = makeStyles({
  title: {
    fontSize: 20,
    fontWeight: 500,
    textTransform: "uppercase",
    color: theme.palette.secondary.contrastText,
  },
  paper: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: theme.palette.secondary.dark,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: theme.palette.secondary.contrastText,
  },
});

const PurpleSwitch = withStyles({
  switchBase: {
    color: "#ECE0F0",
    "&$checked": {
      color: "#FFFFFF",
    },
    "&$checked + $track": {
      backgroundColor: "#000000",
    },
  },
  checked: {},
  track: {},
})(Switch);

export default function Dashboard() {
  const classes = useStyles();

  const { user } = useContext(UserContext);
  const role = user.user.role;
  const roleCap = role.charAt(0).toUpperCase() + role.slice(1);

  const [writerOnlyCheck, setToggleWO] = useState(true);

  const toggleWriter = () => {
    setToggleWO(!writerOnlyCheck);
  };

  return (
    <Container maxWidth={false}>
      <Paper className={classes.paper}>
        <Typography variant="h2" className={classes.title} id="dashboard-title">
          {roleCap} Dashboard
        </Typography>
        {role === "writer" && (
          <FormControlLabel
            className={classes.label}
            control={
              <PurpleSwitch
                size="small"
                checked={writerOnlyCheck}
                onChange={toggleWriter}
              />
            }
            label="Show My Requests Only"
            labelPlacement="end"
          />
        )}
      </Paper>

      <RequestTable writerToggle={writerOnlyCheck} />
    </Container>
  );
}
