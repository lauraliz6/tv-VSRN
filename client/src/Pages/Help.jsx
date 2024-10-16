import React from "react";

import {
  Typography,
  Grid,
  Card,
  CardContent,
  Link,
  makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles({
  cardTitle: {
    marginBottom: 10,
  },
});

export default function Help() {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      className="login"
      spacing={2}
    >
      <Grid item>
        <Typography variant="h1">Help Page</Typography>
      </Grid>
      <Grid
        item
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        className="login"
        spacing={2}
      >
        <Grid item>
          <Card>
            <CardContent>
              <Typography
                variant="h5"
                component="h2"
                className={classes.cardTitle}
              >
                Resources for Writers & Admins
              </Typography>
              <Link
                variant="body1"
                href="[user guide]"
              >
                Writer User Guide
              </Link>
            </CardContent>
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardContent>
              <Typography
                variant="h5"
                component="h2"
                className={classes.cardTitle}
              >
                Resources for Voice Talents
              </Typography>
              <Link
                variant="body1"
                href="[user guide]"
              >
                Quick Start Guide
              </Link>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}
