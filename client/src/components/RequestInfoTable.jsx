import React, { useState, useEffect } from "react";
import { withStyles } from "@material-ui/styles";

import { formatDate } from "../Functions/Formatting.jsx";

import WriterActions from "./WriterAdminActions.jsx";
import VTActions from "../components/VTActions.jsx";
import BoxExplorer from "../components/BoxExplorer.jsx";
import { statuses } from "../Vars/Statuses.js";

import CheckIcon from "@material-ui/icons/Check";
import { Checkbox } from "@material-ui/core";

import Axios from "axios";

import {
  TableContainer,
  Table,
  TableBody,
  Paper,
  TableCell,
  MenuItem,
  TableRow,
  Link,
  TextField,
  Select,
  Input,
  InputAdornment,
} from "@material-ui/core";

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

export default function RequestInfoTable(props) {
  const edit = props.edit;
  const classes = props.classes;

  const data = props.data;
  const rows = props.rows;
  const role = props.role;
  const uid = props.uid;

  const [refresh, setRefresh] = useState("");
  const [changeData, setChangeData] = useState({});
  const [writers, setWriters] = useState([]);

  const [assignedStatus, setAssignedStatus] = useState("null");
  const [assignedWriter, setAssignedWriter] = useState("null");
  const [assignedReview, setAssignedReview] = useState("");
  const [assignedScriptType, setAssignedScriptType] = useState("oneToNine");
  const [assignedChaptersModules, setAssignedChaptersModules] = useState(0);
  const [assignedRush, setAssignedRush] = useState("null");
  const [assignedDate, setAssignedDate] = useState("null");
  const [assignedRate, setAssignedRate] = useState(0);

  useEffect(() => {
    props.passRefreshData(refresh);
    //the following code is to disable warning about including 'props' in dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  useEffect(() => {
    setChangeData(data);
    setAssignedStatus(data.status);
    setAssignedWriter(data.writer);
    setAssignedReview(data.reviewCycle);
    setAssignedScriptType(data.scriptType);
    setAssignedChaptersModules(data.chaptersModules);
    setAssignedDate(data.dueDate);
    setAssignedRush(data.rush);
    setAssignedRate(data.rate);
  }, [data, refresh]);

  useEffect(() => {
    setChangeData(changeData);
    if (edit) {
      props.passChildData(changeData);
    }
    //the following code is to disable warning about including 'props' in dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeData]);

  useEffect(() => {
    setChangeData({
      ...changeData,
      status: assignedStatus,
      writer: assignedWriter,
      reviewCycle: assignedReview,
      scriptType: assignedScriptType,
      chaptersModules: assignedChaptersModules,
      dueDate: assignedDate,
      rush: assignedRush,
      rate: assignedRate,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    assignedWriter,
    assignedReview,
    assignedStatus,
    assignedScriptType,
    assignedChaptersModules,
    assignedRush,
    assignedDate,
    assignedRate,
  ]);

  useEffect(() => {
    Axios.get("http://localhost:3001/allWriters").then((response) => {
      setWriters(response.data);
    });
    //the following code is to disable warning about including 'writers' in dependencies,
    //which will make an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e, type) => {
    const key = `${type}`;
    setChangeData({ ...changeData, [key]: e.value });
  };

  const scriptTypes = { oneToNine: "1-9 Modules", tenPlus: "10+ Modules" };

  const reformat = (type, string) => {
    let newString = string;
    if (type === "status") {
      let findStatus = statuses.find(({ id }) => id === string);
      if (findStatus) {
        newString = findStatus.title;
      }
    } else if (type === "reviewCycle") {
      newString = string.toUpperCase();
    } else if (type === "scriptType") {
      newString = scriptTypes[string];
    } else if (type === "dueDate") {
      newString = formatDate(string);
    } else if (type === "rate") {
      newString = "$" + string;
    } else if (type === "rush") {
      if (string === "y") {
        newString = <CheckIcon />;
      } else {
        newString = "";
      }
    } else if (type === "boxLink") {
      newString = <Link href={string}>{string}</Link>;
    } else if (type === "files") {
      //this part is kind of temporary until we build the box explorer button
      let link = data["boxLink"];
      let boxId;
      if (link) {
        boxId = link.split("/").pop();
      }
      newString = <BoxExplorer folder={boxId} />;
    } else if (type === "actions") {
      let status = data["status"];
      let id = data["id"];
      let username = uid;
      if (role !== "vt") {
        newString = (
          <WriterActions
            status={status}
            id={id}
            username={username}
            role={role}
            passChildData={setRefresh}
          />
        );
      } else if (role === "vt") {
        newString = (
          <VTActions
            status={status}
            id={id}
            username={username}
            role={role}
            passChildData={setRefresh}
          />
        );
      }
    } else {
      newString = string;
    }
    return newString;
  };

  const formFormat = (type, string) => {
    let newString = string;

    if (type === "status") {
      newString = (
        <Select
          labelid="statusLabel"
          id="status"
          value={assignedStatus || "null"}
          variant="outlined"
          onChange={(e) => {
            setAssignedStatus(e.target.value);
          }}
        >
          <MenuItem value="null">Select a status...</MenuItem>
          {statuses.map((status) => (
            <MenuItem value={status.id} key={status.title}>
              {status.title}
            </MenuItem>
          ))}
        </Select>
      );
    } else if (type === "writer") {
      newString = (
        <Select
          labelid="writerLabel"
          id="writer"
          value={assignedWriter || "null"}
          variant="outlined"
          onChange={(e) => {
            setAssignedWriter(e.target.value);
          }}
        >
          <MenuItem value="null">Select a writer...</MenuItem>
          {writers.map((writer) => (
            <MenuItem value={writer.nameUsers} key={writer.idUsers}>
              {writer.nameUsers}
            </MenuItem>
          ))}
        </Select>
      );
    } else if (type === "reviewCycle") {
      newString = (
        <Input
          labelid="reviewLabel"
          id="review"
          type="number"
          inputProps={{ min: 0, max: 5 }}
          startAdornment={<InputAdornment position="start">VD</InputAdornment>}
          value={assignedReview ? assignedReview.split("vd")[1] : 0 || 0}
          variant="outlined"
          onChange={(e) => {
            setAssignedReview("vd" + e.target.value);
          }}
        />
      );
    } else if (
      type === "wfID" ||
      type === "customer" ||
      type === "videoTitle" ||
      type === "boxLink" ||
      type === "jobDescription"
    ) {
      newString = (
        <TextField
          id={string}
          variant="outlined"
          value={changeData[`${type}`] || ""}
          onChange={(e) => {
            handleChange(e.target, type);
          }}
        />
      );
    } else if (type === "scriptType") {
      newString = (
        <Select
          labelid="scriptTypeLabel"
          id="scriptType"
          value={assignedScriptType || ""}
          className={classes.input}
          onChange={(e) => {
            setAssignedScriptType(e.target.value);
          }}
        >
          <MenuItem value="oneToNine">1-9 Modules</MenuItem>
          <MenuItem value="tenPlus">10+ Modules</MenuItem>
        </Select>
      );
    } else if (type === "chaptersModules") {
      newString = (
        <Input
          labelid="chaptersModulesLabel"
          id="chaptersModules"
          type="number"
          inputProps={{ min: 0, max: 10 }}
          value={assignedChaptersModules || "0"}
          variant="outlined"
          onChange={(e) => {
            setAssignedChaptersModules(e.target.value);
          }}
        />
      );
    } else if (type === "dueDate") {
      newString = (
        <Input
          id="dueDate"
          type="datetime"
          value={assignedDate || ""}
          fullWidth={false}
          onChange={(e) => {
            setAssignedDate(e.target.value);
          }}
        />
      );
    } else if (type === "rate") {
      newString = (
        <Input
          labelid="rateLabel"
          id="rate"
          type="number"
          startAdornment={<InputAdornment position="start">$</InputAdornment>}
          value={assignedRate || ""}
          variant="outlined"
          onChange={(e) => {
            setAssignedRate(e.target.value);
          }}
        />
      );
    } else if (type === "rush") {
      newString = (
        <Checkbox
          checked={changeData["rush"] === "y" ? true : false}
          onChange={(e) => {
            setAssignedRush(e.target.checked ? "y" : "n");
          }}
          value={assignedRush}
        />
      );
    }
    //id and voice talent are the two attributes that cannot be changed, even by admin
    else if (type === "id" || type === "talent") {
      newString = changeData[`${type}`];
    } else {
      newString = `edit me ${type} ${string}`;
    }
    return newString;
  };

  const findData = (key, format, editable, display) => {
    let info = data[key];
    if (edit === true && editable === true) {
      if (info) {
        info = formFormat(key, info);
      } else {
        info = formFormat(key, key);
      }
    } else {
      if (info && format === true) {
        info = reformat(key, info);
      } else if (!info && format === true) {
        info = reformat(key, key);
      }
    }
    return info;
  };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="request info table">
        <TableBody>
          {rows.map((row) => (
            <StyledTableRow key={row.key}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              {(role === "writer" || role === "vt") && (
                <TableCell align="right">
                  {(data &&
                    findData(
                      row.key,
                      row.reformat,
                      row.editable,
                      row.display
                    )) ||
                    row.display ||
                    ""}
                </TableCell>
              )}
              {role === "admin" && (
                <TableCell align="right">
                  {(data &&
                    findData(row.key, row.reformat, true, row.display)) ||
                    row.display ||
                    ""}
                </TableCell>
              )}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
