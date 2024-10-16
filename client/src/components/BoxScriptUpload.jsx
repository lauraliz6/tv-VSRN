import React, { useState, useEffect } from "react";
import Axios from "axios";

import { Input, Grid, InputLabel } from "@material-ui/core";

import ErrorIcon from "@material-ui/icons/Error";

import BoxErrorDialog from "./BoxErrorDialog";
import ErrorDialog from "./ErrorDialog";

Axios.defaults.withCredentials = false;

export default function BoxScriptUpload(props) {
  const [script, setScript] = useState(null);
  const [scriptName, setScriptName] = useState("");

  const [boxErrOpen, setBoxErrOpen] = useState(false);

  useEffect(() => {
    if (props.boxErrOpen === true) {
      setBoxErrOpen(true);
    }
  }, [props.boxErrOpen]);

  const [plainErr, setPlainErr] = useState("");
  const [plainErrOpen, setPlainErrOpen] = useState(false);

  const reqId = props.id;

  const folderCreateErr = `Unable to create folder for request ${reqId}. Please follow the manual script process and enter the link to the main folder in the form field. Then click OK to continue to the Request Info page.`;
  const uploadErr = `Unable to upload file for ${reqId}. Please upload the file to the "Scripts" subfolder of the box folder linked below, then click OK to continue to the Request Info page.`;

  const allowedTypes = ["pdf", "doc", "docx"];

  const checkFileType = () => {
    const ext = scriptName.toString().split(".").pop();
    if (!allowedTypes.includes(ext) && scriptName !== "") {
      setScript("");
      setPlainErr("File must be a pdf or Word document.");
      setPlainErrOpen(true);
      props.passFileSelect(false);
    } else {
      setPlainErr("");
      if (scriptName !== "") {
        props.passFileSelect(true);
        props.passFile(script);
        props.passScriptName(scriptName);
      }
    }
  };

  useEffect(() => {
    checkFileType();
    //the following code is to disable warning about including the checkFileType function in dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptName]);

  //for testing - checking that we have the box folder id
  // useEffect(() => {
  //   console.log(createdFolder);
  // }, [createdFolder]);

  return (
    <Grid item xs={12}>
      <InputLabel htmlFor="boxScript" required>
        Box Link to Files
      </InputLabel>
      <Input
        type="file"
        id="boxScript"
        onChange={(e) => {
          setScript(e.target.files[0]);
          setScriptName(e.target.value);
        }}
        fullWidth={true}
        endAdornment={plainErr !== "" && <ErrorIcon color="error"></ErrorIcon>}
      />
      <BoxErrorDialog
        open={boxErrOpen}
        text={props.boxErr === "folder" ? folderCreateErr : uploadErr}
        passChildData={setBoxErrOpen}
        folder={props.folder}
        jobId={reqId}
      />
      <ErrorDialog
        open={plainErrOpen}
        text={plainErr}
        passChildData={setPlainErrOpen}
      />
    </Grid>
  );
}
