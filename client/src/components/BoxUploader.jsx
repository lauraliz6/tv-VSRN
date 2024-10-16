import React, { useState, useEffect } from "react";
import { IntlProvider } from "react-intl";
import ContentUploader from "box-ui-elements/es/elements/content-uploader/ContentUploader";
import { Button, Grid } from "@material-ui/core/";
import { CircularProgress } from "@material-ui/core";

import { accessToken } from "../Functions/BoxActions";

export default function BoxUploader(props) {
  const [token, setToken] = useState("");
  const [shown, setShown] = useState(false);
  const [btnDisable, setBtnDisable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (props.folder !== "") {
      setBtnDisable(false);
      setLoading(false);
    }
  }, [props.folder]);

  useEffect(() => {
    getToken();
  }, []);

  async function getToken() {
    const apiToken = await accessToken();
    if (apiToken) {
      setToken(apiToken);
    } else {
      return "error";
    }
  }

  const openExplorer = () => {
    setShown(true);
  };

  return (
    <Grid container>
      <Button
        variant="contained"
        color="secondary"
        disabled={btnDisable}
        onClick={openExplorer}
      >
        Open Box Uploader
      </Button>
      {loading && <CircularProgress color="secondary" />}
      {shown && (
        <IntlProvider locale="en">
          <ContentUploader rootFolderId={props.folder} token={token} />
        </IntlProvider>
      )}
    </Grid>
  );
}
