import React, { useState } from "react";

import { TextField, Button, Typography, Grid } from "@material-ui/core";

export default function Login(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const error = props.error;

  const passCreds = (e) => {
    e.preventDefault();
    const creds = { username: username, password: password };
    props.setLogin(creds);
  };

  return (
    <form
      onSubmit={(e) => {
        passCreds(e);
      }}
    >
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        className="login"
        spacing={2}
      >
        <Grid item>
          <Typography variant="h1">Log In</Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1" color="error" name="error">
            {error}
          </Typography>
        </Grid>

        <Grid item>
          <TextField
            label="Username"
            name="username"
            variant="outlined"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
        </Grid>
        <Grid item>
          <TextField
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </Grid>
        <Grid item>
          <Button type="submit" variant="contained" color="primary">
            Login
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
