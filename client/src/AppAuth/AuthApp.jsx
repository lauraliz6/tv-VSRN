import React from "react";

// import { UserContext } from "./Context.jsx";

import { SkipNavLink, SkipNavContent } from "@reach/skip-nav";
import "@reach/skip-nav/styles.css";

import { Grid } from "@material-ui/core";

import { ThemeProvider } from "@material-ui/styles";
import theme from "../StyleGuide.js";

import Header from "../components/Header";
import Pages from "../Pages/Pages.jsx";

// @function  AuthApp
export default function AuthApp(props) {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <SkipNavLink />
        <Grid container direction="column" spacing={3}>
          <Grid item>
            <Header />
          </Grid>
          <SkipNavContent />
          <Grid item>
            <Pages />
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
}
