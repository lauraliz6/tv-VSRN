import React, { useContext } from "react";

import { UserContext } from "../AppAuth/Context.jsx";

import NewRequestForm from "../components/NewRequestForm";
import RateTable from "../components/RateTable.jsx";
import Error from "./Error.jsx";

import { Container, Typography, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  head: {
    marginBottom: 20,
  },
});

export default function NewRequest() {
  const { user } = useContext(UserContext);
  const role = user.user.role;

  const classes = useStyles();

  if (role !== "writer" && role !== "admin") {
    return <Error />;
  } else {
    return (
      <Grid container>
        <Grid item xs={6}>
          <Container>
            <Typography variant="h1" className={classes.head}>
              New Voice Request
            </Typography>
            <NewRequestForm />
          </Container>
        </Grid>
        <Grid item xs={6}>
          <RateTable />
        </Grid>
      </Grid>
    );
  }
}
