import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";

import { UserContext } from "../AppAuth/Context.jsx";
import AuthCheck from "../components/AuthCheck";

import NewRequestForm from "../components/NewRequestForm";
import Error from "./Error.jsx";

import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  head: {
    marginBottom: 20,
  },
});

export default function NewRate() {
  const { id } = useParams();

  const { user } = useContext(UserContext);
  const role = user.user.role;
  const uid = user.user.user;

  const [data, setData] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const getReqInfo = () => {
      AuthCheck().then(function (authResult) {
        if (mounted) {
          const auth = authResult.auth;
          if (auth) {
            Axios.get("http://localhost:3001/requestInfo", {
              headers: {
                id: id,
                userrole: role,
                username: uid,
              },
            }).then((response) => {
              if (response.data.err) {
                setError(response.data.err);
              }
              setData(response.data[0]);
            });
          } else {
            console.log("error");
          }
        }
      });
    };
    getReqInfo();
    return () => (mounted = false);
  }, [id, role, uid]);

  const classes = useStyles();

  if (role !== "writer" && role !== "admin") {
    return <Error />;
  } else {
    return (
      <Container maxWidth={false}>
        <Typography variant="h1" className={classes.head}>
          Request New Rate for #{id}
        </Typography>
        <Typography variant="body1" color="error">
          {error}
        </Typography>
        <NewRequestForm data={data} />
      </Container>
    );
  }
}
