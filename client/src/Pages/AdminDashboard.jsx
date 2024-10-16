import React, { useState, useContext } from "react";
import { UserContext } from "../AppAuth/Context.jsx";
import { makeStyles } from "@material-ui/core/styles";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import theme from "../StyleGuide.js";

import {
  Tabs,
  Tab,
  Toolbar,
  IconButton,
  Typography,
  Paper,
  Box,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import GroupIcon from "@material-ui/icons/Group";
import DescriptionIcon from "@material-ui/icons/Description";
import BuildIcon from "@material-ui/icons/Build";

import UserManagement from "./UserManagement";
import WriterData from "./WriterData";
import VTData from "../components/VTData";
import SystemReports from "./SystemReports.jsx";

const muitheme = createTheme({
  overrides: {
    MuiTabs: {
      indicator: {
        backgroundColor: "white",
        opacity: 0,
      },
      root: {
        borderRight: `1px solid ${theme.palette.divider}`,
        height: "100vh",
        transition: "width 300ms ease-in",
      },
    },
    MuiTab: {
      root: {
        fontFamily: theme.typography.fontFamily,
        textTransform: "none",
        "&:hover": {
          backgroundColor: theme.palette.secondary.light,
          opacity: 1,
        },
        minWidth: "240px !important",
        "&$selected": {
          backgroundColor: theme.palette.primary.main,
          color: "white",
        },
      },
      wrapper: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
      },
    },
    MuiSvgIcon: {
      root: {
        width: 50,
        paddingRight: 20,
      },
    },
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  toolbar: {
    backgroundColor: theme.palette.primary.main,
    color: "white",
  },
  menuButton: {
    marginRight: 36,
  },
  container: {
    display: "flex",
    flexDirection: "row",
  },
  content: {
    width: "100%",
  },
}));

export default function AdminDashboard() {
  const { user } = useContext(UserContext);
  const role = user.user.role;

  const classes = useStyles();

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const smallTabs = 75;
  const largeTabs = 240;
  const [tabWidth, setTabWidth] = useState(smallTabs);

  const expandTabs = () => {
    if (tabWidth === smallTabs) {
      setTabWidth(largeTabs);
    } else if (tabWidth === largeTabs) {
      setTabWidth(smallTabs);
    }
  };

  if (role === "admin") {
    return (
      <div>
        <Paper elevation={4}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              className={classes.menuButton}
              onClick={expandTabs}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Admin Dashboard
            </Typography>
          </Toolbar>
        </Paper>
        <div className={classes.container}>
          <div>
            <MuiThemeProvider theme={muitheme}>
              <Tabs
                orientation="vertical"
                variant="standard"
                value={value}
                aria-label="Admin drawer tabs"
                onChange={handleChange}
                style={{ width: tabWidth }}
              >
                <Tab
                  className={classes.tab}
                  label={"User Management"}
                  icon={<GroupIcon />}
                  id={"tab-0"}
                />
                <Tab
                  className={classes.tab}
                  label={"Writer Data"}
                  icon={<DescriptionIcon />}
                  id={"tab-1"}
                />
                <Tab
                  className={classes.tab}
                  label={"VT Data"}
                  icon={<DescriptionIcon />}
                  id={"tab-2"}
                />
                <Tab
                  className={classes.tab}
                  label={"System Reports"}
                  icon={<BuildIcon />}
                  id={"tab-3"}
                />
              </Tabs>
            </MuiThemeProvider>
          </div>
          <div className={classes.content}>
            <TabPanel value={value} index={0}>
              <UserManagement />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <WriterData />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <VTData />
            </TabPanel>
            <TabPanel value={value} index={3}>
              <SystemReports />
            </TabPanel>
          </div>
        </div>
      </div>
    );
  } else return <p>Permission denied.</p>;
}
