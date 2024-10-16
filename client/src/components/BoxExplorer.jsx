import React, { useState, useEffect } from "react";
import { IntlProvider } from "react-intl";
import ContentExplorer from "box-ui-elements/es/elements/content-explorer/ContentExplorer";
import {
  Dialog,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Slide,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

import { accessToken } from "../Functions/BoxActions";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function BoxExplorer(props) {
  const [token, setToken] = useState("");
  const [shown, setShown] = useState(false);
  const [folder, setFolder] = useState("");

  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    if (props.folder && props.folder > 0) {
      setFolder(props.folder);
    }
  }, [props.folder]);

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

  const handleClose = () => {
    setShown(false);
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={openExplorer}>
        Open Box Explorer
      </Button>
      <Dialog
        fullScreen
        open={shown}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Box Explorer
            </Typography>
          </Toolbar>
        </AppBar>
        {shown && (
          <IntlProvider locale="en">
            <ContentExplorer rootFolderId={folder} token={token} />
          </IntlProvider>
        )}
      </Dialog>
    </div>
  );
}
