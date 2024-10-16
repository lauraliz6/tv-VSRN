import React from "react";

import TimeOffCalendar from "../components/TimeOffCalendar";

import { Typography, Grid, Container } from "@material-ui/core";

export default function TimeOff() {
  return (
    <Container>
      <Grid container direction="column" justifyContent="center" spacing={2}>
        <Grid item>
          <Typography variant="h1">Time Off Calendar</Typography>
        </Grid>
        <Grid item>
          <TimeOffCalendar />
        </Grid>
      </Grid>
    </Container>
  );
}
