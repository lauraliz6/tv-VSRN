import React from "react";

// import { UserContext } from "./Context.jsx";

import { Grid } from "@material-ui/core";

import { ThemeProvider } from "@material-ui/styles";
import theme from "../StyleGuide.js";

import Header from "../components/Header";

// @function  AuthApp
export default function LoadingApp(props) {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Grid container direction="column" spacing={3}>
          <Grid item>
            <Header />
          </Grid>
          <Grid item></Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
}
