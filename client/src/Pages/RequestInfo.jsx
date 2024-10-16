import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import { UserContext } from "../AppAuth/Context.jsx";

import AuthCheck from "../components/AuthCheck";

import RequestInfoTable from "../components/RequestInfoTable.jsx";
import Comments from "../components/Comments.jsx";
import AddComment from "../components/AddComment.jsx";

import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";

const useStyles = makeStyles({
  table: {
    minWidth: 100,
  },
  headers: {
    paddingBottom: 20,
  },
});

const rows = [
  { name: "ID", key: "id", display: "", reformat: false, editable: false },
  {
    name: "Status",
    key: "status",
    display: "",
    reformat: true,
    editable: false,
  },
  {
    name: "Writer",
    key: "writer",
    display: "",
    reformat: false,
    editable: true,
  },
  {
    name: "Workfront ID",
    key: "wfID",
    display: "",
    reformat: false,
    editable: true,
  },
  {
    name: "Customer Name",
    key: "customer",
    display: "",
    reformat: false,
    editable: true,
  },
  {
    name: "Video Title",
    key: "videoTitle",
    display: "",
    reformat: false,
    editable: true,
  },
  {
    name: "Voice Talent",
    key: "talent",
    display: "",
    reformat: false,
    editable: false,
  },
  {
    name: "Job Description",
    key: "jobDescription",
    display: "",
    reformat: false,
    editable: false,
  },
  {
    name: "Review Cycle",
    key: "reviewCycle",
    display: "",
    reformat: true,
    editable: true,
  },
  {
    name: "Script Type",
    key: "scriptType",
    display: "",
    reformat: true,
    editable: false,
  },
  {
    name: "Chapters/Modules",
    key: "chaptersModules",
    display: "",
    reformat: false,
    editable: false,
  },
  {
    name: "Due Date",
    key: "dueDate",
    display: "",
    reformat: true,
    editable: false,
  },
  { name: "Rate", key: "rate", reformat: true, display: "", editable: false },
  { name: "Rush", key: "rush", reformat: true, display: "", editable: false },
  //this next entry - Box Files - can be removed for 'change details'
  {
    name: "Box Files",
    key: "files",
    display: "boxApi",
    reformat: true,
    editable: false,
  },
  {
    name: "Box Link to Files",
    key: "boxLink",
    display: "",
    reformat: true,
    editable: true,
  },
  //this next entry - Actions - can be removed for 'change details'
  {
    name: "Actions",
    key: "actions",
    display: "actions",
    reformat: true,
    editable: false,
  },
];

export default function RequestInfo() {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [error, setError] = useState("");

  const [refresh, setRefresh] = useState("");

  const { user } = useContext(UserContext);
  const role = user.user.role;
  const uid = user.user.user;

  const classes = useStyles();

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
  }, [id, role, uid, refresh]);

  return (
    <Grid
      container
      direction="row"
      justifyContent="center"
      alignItems="flex-start"
      spacing={3}
    >
      <Grid item xs={12} sm={5}>
        <Typography
          variant="h1"
          style={{
            fontSize: "38px",
            fontFamily: "Roboto COndensed, sans-serif",
            fontWeight: "500",
            lineHeight: "1.167",
          }}
        >
          Voice Request Info
        </Typography>
        <Typography variant="body1" color="error" className={classes.headers}>
          {error}
        </Typography>
        {data && (
          <RequestInfoTable
            edit={false}
            classes={classes}
            data={data}
            rows={rows}
            role={role}
            uid={uid}
            passRefreshData={setRefresh}
          />
        )}
      </Grid>
      {data && (
        <Grid item xs={12} sm={5}>
          <Comments comments={data["comments"]} classes={classes} />
          <AddComment
            id={id}
            user={uid}
            role={role}
            passRefreshData={setRefresh}
          />
        </Grid>
      )}
    </Grid>
  );
}
