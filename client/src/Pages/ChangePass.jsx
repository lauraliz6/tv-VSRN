import React, { useState, useContext } from "react";
import Axios from "axios";

import AuthCheck from "../components/AuthCheck";
import { UserContext } from "../AppAuth/Context.jsx";

import { TextField, Button, Typography, Grid } from "@material-ui/core";

export default function ChangePass() {
  const { user } = useContext(UserContext);
  const userN = user.user.userName;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNew, setRepeatNew] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  Axios.defaults.withCredentials = true;

  const changePwd = (e) => {
    e.preventDefault();
    if (newPassword !== repeatNew) {
      setError("New Password and Repeat Password must be the same.");
      return;
    }
    setError("");
    AuthCheck().then(function (authResult) {
      const auth = authResult.auth;
      if (auth) {
        Axios.post("http://localhost:3001/changePassword", {
          username: userN,
          old: oldPassword,
          new: newPassword,
        }).then((response) => {
          if (response.data.err) {
            setError(response.data.message);
          } else {
            if (response.data === "success") {
              setSuccess("Password successfully changed!");
              setOldPassword("");
              setNewPassword("");
              setRepeatNew("");
            }
          }
        });
      } else {
        setError("Something went wrong.");
      }
    });
  };

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
        <Typography variant="h1">Change Password</Typography>
      </Grid>
      <Grid item>
        <Typography variant="body1" color="error">
          {error}
        </Typography>
        <Typography variant="body1">{success}</Typography>
      </Grid>
      <form onSubmit={(e) => changePwd(e)}>
        <Grid
          item
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item>
            <TextField
              label="Old Password"
              type="password"
              variant="outlined"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                setSuccess("");
              }}
            />
          </Grid>
          <Grid item>
            <TextField
              label="New Password"
              type="password"
              variant="outlined"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setSuccess("");
              }}
            />
          </Grid>
          <Grid item>
            <TextField
              label="Repeat New Password"
              type="password"
              variant="outlined"
              value={repeatNew}
              onChange={(e) => {
                setRepeatNew(e.target.value);
                setSuccess("");
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!oldPassword || !newPassword || !repeatNew}
            >
              Change
            </Button>
          </Grid>
        </Grid>
      </form>
    </Grid>
  );
}
