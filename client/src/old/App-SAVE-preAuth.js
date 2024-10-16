import React, { useState, useLayoutEffect } from "react";
import Axios from "axios";
import { Grid } from "@material-ui/core";

import { ThemeProvider } from "@material-ui/styles";
import theme from "../StyleGuide.js";

import Header from "../components/Header";
import Login from "../components/Login.jsx";
import Pages from "../Pages/Pages.jsx";

function App() {
  const [loginStatus, setLoginStatus] = useState(false);
  const [loginUser, setLoginUser] = useState({
    user: "",
    role: "",
    userName: "",
  });

  const handleCallback = (childData) => {
    setLoginStatus(childData);
  };

  //using useLayoutEffect here to avoid flash of login per:
  //https://egghead.io/lessons/react-avoid-flashes-of-content-in-react-with-uselayouteffect
  useLayoutEffect(() => {
    Axios.get("http://localhost:3001/login").then((response) => {
      if (response.data.loggedIn === true) {
        setLoginStatus(response.data.user[0].uidUsers);
        setLoginUser({
          user: response.data.user[0].nameUsers,
          role: response.data.user[0].roles,
          userName: response.data.user[0].uidUsers,
        });
      }
    });
  }, [loginUser, loginStatus]);

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Grid container direction="column" spacing={3}>
          <Grid item>
            <Header
              login={loginStatus}
              user={loginUser.user}
              setLogin={handleCallback}
            />
          </Grid>
          <Grid item>
            {loginStatus && <Pages userN={loginUser.userName} />}
          </Grid>
          {!loginStatus && (
            <Grid item>
              <Login setLogin={handleCallback} />
            </Grid>
          )}
        </Grid>
      </div>
    </ThemeProvider>
  );
}

export default App;
