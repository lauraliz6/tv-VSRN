import React, { useContext } from "react";
import { Grid } from "@material-ui/core";

import { ThemeProvider } from "@material-ui/styles";
import theme from "../StyleGuide.js";

import Header from "../components/Header";
import Login from "../components/Login.jsx";

import { UserContext } from "./Context.jsx";

// @function  UnauthApp
export default function UnauthApp() {
  const { login, error } = useContext(UserContext);

  const handleCallback = (childData) => {
    login(childData.username, childData.password);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Grid container direction="column" spacing={3}>
          <Grid item>
            <Header />
          </Grid>
          <Grid>
            <Login setLogin={handleCallback} error={error} />
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
}
