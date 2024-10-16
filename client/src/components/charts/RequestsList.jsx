import React, { useState, useEffect } from "react";
import Axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

export default function RequestsList(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    Axios.get("http://localhost:3001/vtRequestsList", {
      headers: {
        user: props.user,
      },
    }).then((response) => {
      setRequests(response.data);
    });
  }, [props.user]);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List component="nav" className={classes.root}>
      <ListItem button onClick={handleClick}>
        <ListItemText primary={props.total} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse
        in={open}
        timeout="auto"
        unmountOnExit
        style={{ maxHeight: 330, overflow: "auto" }}
      >
        <List component="div" disablePadding>
          {requests.map((request) => {
            return (
              <ListItem key={request.id} className={classes.nested}>
                <Link to={`/request/${request.id}`}>
                  <ListItemText primary={`#${request.id}`} />
                </Link>
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </List>
  );
}
