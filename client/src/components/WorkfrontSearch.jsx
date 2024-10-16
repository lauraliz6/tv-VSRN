import React, { useState, useEffect } from "react";
import Axios from "axios";

import {
  Button,
  InputLabel,
  Input,
  Grid,
  FormHelperText,
  CircularProgress,
} from "@material-ui/core";

export default function WorkfrontSearch(props) {
  const [wfID, setWfID] = useState("");
  const [wfCust, setWfCust] = useState("");
  const [wfTitle, setWfTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultErr =
    "An error occured. Please ensure you are using the correct WorkFront ID or contact support.";

  useEffect(() => {
    if (props.id.data) {
      setWfID(props.id.id);
    }
  }, [props.id]);

  useEffect(() => {
    //pass to parent component
    props.passChildData({ wfid: wfID, cust: wfCust, title: wfTitle });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wfCust, wfTitle]);

  const handleError = () => {
    setError(defaultErr);
    setWfCust("");
    setWfTitle("");
  };

  const WfApiCall = (e) => {
    e.preventDefault();
    setLoading(true);
    Axios.get("http://localhost:3001/wfapi", {
      headers: { wfid: wfID },
    }).then((response) => {
      const resp = response.data;
      if (resp.success) {
        if (resp.video) {
          let cust = resp.video.split("-").shift();
          let vid = resp.video;
          setError("");
          setWfCust(cust);
          setWfTitle(vid);
        } else {
          handleError();
        }
      } else {
        handleError();
      }
      setLoading(false);
    });
  };

  return (
    <form
      onSubmit={(e) => {
        WfApiCall(e);
      }}
    >
      <Grid container direction="row" alignItems="center" spacing={1}>
        <Grid item xs={10}>
          <InputLabel htmlFor="wfID" required>
            Workfront ID
          </InputLabel>
          <Input
            error={error !== ""}
            id="wfID"
            fullWidth={true}
            value={wfID}
            onChange={(e) => {
              setWfID(e.target.value);
            }}
          />
          <FormHelperText error>{error}</FormHelperText>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            color="secondary"
            disabled={!wfID || loading}
            onClick={(e) => {
              WfApiCall(e);
            }}
          >
            {loading && <CircularProgress size="25px" color="inherit" />}
            {!loading && "Search"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
