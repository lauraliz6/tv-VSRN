import { AppBar, Avatar, Toolbar } from "@material-ui/core";
import React, { useContext } from "react";
import Link from "@material-ui/core/Link";

import { makeStyles, createStyles } from "@material-ui/styles";

import whiteLogo from "../img/tivianlogo_small.png";

import ExitToAppIcon from "@material-ui/icons/ExitToApp";

import { UserContext } from "../AppAuth/Context.jsx";

import HeaderLinks from "./HeaderLinks";
import HeaderBtn from "./HeaderBtn";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    logo: {
      height: "65px",
      maxWidth: "auto",
      margin: "5px 15px 5px 20px",
    },
    title: {
      flexGrow: 1,
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
    },
    avatar: {
      background: "#FFFFFF",
      color: "#8876DE",
      margin: "0 20px",
    },
  })
);

const Header = () => {
  const { user, logout } = useContext(UserContext);
  const login = user.auth;
  const name = user.user.user;
  const fulluser = user.user;

  const getInitials = (name) => {
    if (!name) {
      return;
    }
    const split = name.split(" ");
    const first = split[0].charAt(0).toUpperCase();
    const second = split[1].charAt(0).toUpperCase();
    const combo = first + second;
    return combo;
  };

  const classes = useStyles();

  return (
    <AppBar position="static">
      <Toolbar disableGutters={true}>
        <Link href="/" variant="h6" className={classes.title}>
          <img src={whiteLogo} alt="logo" className={classes.logo} />
          VoiSpark
        </Link>

        {login && <HeaderLinks user={fulluser} />}
        {login && (
          <HeaderBtn icon={<ExitToAppIcon />} text="log out" onClick={logout} />
        )}
        {login && (
          <Avatar className={classes.avatar}>{getInitials(name)}</Avatar>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
