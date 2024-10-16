import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import { UserContext } from "../AppAuth/Context.jsx";
import { useHistory } from "react-router-dom";

import AuthCheck from "../components/AuthCheck";

import RequestInfoTable from "../components/RequestInfoTable.jsx";
import Comments from "../components/Comments.jsx";

import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import { Button } from "@material-ui/core";
import { SystemComment } from "../Functions/Actions.jsx";
import { ChangeDetailsEmail } from "../Functions/Emails";

import { CircularProgress } from "@material-ui/core";

import { statuses } from "../Vars/Statuses.js";

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
  {
    name: "Box Link",
    key: "boxLink",
    reformat: true,
    display: "",
    editable: true,
  },
];

export default function ChangeDetails() {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [refresh, setRefresh] = useState("");

  const { user } = useContext(UserContext);
  const role = user.user.role;
  const uid = user.user.user;

  const [newDetails, setNewDetails] = useState({});

  const classes = useStyles();

  const history = useHistory();

  const routeChange = () => {
    let path = `/request/${id}`;
    history.push(path);
  };

  // useEffect(() => {
  //   console.log(newDetails);
  // }, [newDetails]);

  useEffect(() => {
    const getReqInfo = () => {
      AuthCheck().then(function (authResult) {
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
      });
    };
    getReqInfo();
  }, [id, role, uid, refresh]);

  const postChangeDetails = (info) => {
    const status = info.status;
    const cName = info.customer;
    const id = info.id;
    const vTitle = info.videoTitle;
    const writerN = info.writer;
    const rCycle = info.reviewCycle;
    const wfid = info.wfID;
    const boxLink = info.boxLink;
    const rush = info.rush;
    const scriptType = info.scriptType;
    const chaptersModules = info.chaptersModules;
    const dueDate = info.dueDate;
    const rate = info.rate;

    const oldStatus = data.status;
    const oldName = data.customer;
    const oldVidoT = data.videoTitle;
    const oldWriter = data.writer;
    const oldReview = data.reviewCycle;
    const oldWfid = data.wfID;
    const oldBoxLink = data.boxLink;
    const oldRush = data.rush;
    const oldScriptType = data.scriptType;
    const oldChaptersModules = data.chaptersModules;
    const oldDueDate = data.dueDate;
    const oldRate = data.rate;

    Axios.post("http://localhost:3001/postDetails", {
      id: id,
      status: status,
      customer: cName,
      videoTitle: vTitle,
      writer: writerN,
      reviewCycle: rCycle,
      wfID: wfid,
      boxLink: boxLink,
      rush: rush,
      scriptType: scriptType,
      chaptersModules: chaptersModules,
      dueDate: dueDate,
      rate: rate,
    });

    let string = " changed the";
    let stringArr = [];

    if (oldStatus !== status) {
      stringArr.push(
        "Status from " +
          statuses.find(({ id }) => id === oldStatus).title +
          " to " +
          statuses.find(({ id }) => id === status).title
      );
    }
    if (oldName !== cName) {
      stringArr.push("Customer from " + oldName + " to " + cName);
    }
    if (oldWfid !== wfid) {
      stringArr.push("Workfront ID from " + oldWfid + " to " + wfid);
    }
    if (oldWriter !== writerN) {
      stringArr.push("Writer from " + oldWriter + " to " + writerN);
    }
    if (oldVidoT !== vTitle) {
      stringArr.push("Video Title from " + oldVidoT + " to " + vTitle);
    }
    if (oldReview !== rCycle) {
      stringArr.push("Cycle Number from " + oldReview + " to " + rCycle);
    }
    if (oldScriptType !== scriptType) {
      const capitalize = (s) => {
        if (typeof s !== "string") return "";
        return s.charAt(0).toUpperCase() + s.slice(1);
      };
      stringArr.push(
        "Script Type from " +
          capitalize(oldScriptType.split(/(?=[A-Z])/).join(" ")) +
          " to " +
          capitalize(scriptType.split(/(?=[A-Z])/).join(" "))
      );
    }
    if (oldChaptersModules !== chaptersModules) {
      stringArr.push(
        "Number of Modules from " +
          oldChaptersModules +
          " to " +
          chaptersModules
      );
    }
    if (oldDueDate !== dueDate) {
      stringArr.push("Due Date from " + oldDueDate + " to " + dueDate);
    }
    if (oldRush !== rush) {
      stringArr.push("Rush status from " + oldRush + " to " + rush);
    }
    if (oldRate !== rate) {
      stringArr.push("Rate from $" + oldRate + " to $" + rate);
    }
    if (oldBoxLink !== boxLink) {
      stringArr.push("Box Link");
    }

    if (stringArr.length > 1) {
      const lastVal = stringArr[stringArr.length - 1];
      stringArr[stringArr.length - 1] = "and " + lastVal;
    }
    const midString = stringArr.join(", ");

    string += " ";
    string += midString;
    string += ".";

    setLoading(true);
    SystemComment(id, uid, string).then((response) => {
      if (response.success) {
        ChangeDetailsEmail(id).then((response) => {
          if (response.success) {
            routeChange();
          } else {
            setError(
              "Details changed, but unable to send email alert to voice talent. Please redirect to your dashboard and manually send alert of detail change to voice talent if needed."
            );
          }
        });
      } else {
        setError(
          "Details changed, but unable to post comment indicating change. Please redirect to your dashboard."
        );
      }
    });
  };

  return (
    role !== "vt" && (
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="flex-start"
        spacing={3}
      >
        <Grid item xs={12} sm={5}>
          <Typography variant="h1">Change Details Request</Typography>
          <Typography variant="body1" color="error" className={classes.headers}>
            {error}
          </Typography>
          {data && (
            <RequestInfoTable
              edit={true}
              classes={classes}
              data={data}
              rows={rows}
              role={role}
              uid={uid}
              passChildData={setNewDetails}
              passRefreshData={setRefresh}
            />
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => postChangeDetails(newDetails)}
            style={{
              marginTop: "10px",
            }}
            disabled={loading}
          >
            {loading && <CircularProgress size="25px" color="inherit" />}
            {!loading && "Submit"}
          </Button>
        </Grid>
        {data && (
          <Grid item xs={12} sm={5}>
            <Comments comments={data["comments"]} classes={classes} />
          </Grid>
        )}
      </Grid>
    )
  );
}
