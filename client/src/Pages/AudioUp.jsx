import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import {
  Typography,
  Grid,
  Container,
  Button,
  CircularProgress,
} from "@material-ui/core";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

import BoxUploader from "../components/BoxUploader";
import { MarkAudioUp } from "../Functions/Actions";
import { UserContext } from "../AppAuth/Context.jsx";

export default function AudioUp() {
  const history = useHistory();
  const { id } = useParams();

  const [audioFolder, setAudioFolder] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [parentFolder, setParentFolder] = useState("");

  const { user } = useContext(UserContext);
  const role = user.user.role;
  const uid = user.user.user;

  const completeAudioUp = () => {
    setLoading(true);
    MarkAudioUp(id, role, uid).then((response) => {
      if (response.success) {
        redirect();
      } else if (response.err) {
        setError(response.err);
      }
    });
  };

  const redirect = () => {
    let path = `/`;
    history.push(path);
  };

  useEffect(() => {
    Axios.get("http://localhost:3001/audioFolder", {
      headers: {
        id: id,
      },
    }).then((response) => {
      if (response.data) {
        if (!response.data.err) {
          const audioFold = response.data.data;
          if (audioFold) {
            setAudioFolder(audioFold);
          }
        } else {
          const parentFold = response.data.data;
          if (parentFold) {
            setParentFolder(parentFold);
          }
        }
      }
      if (response.data.err) {
        setError(response.data.err);
      }
    });
  }, [id]);

  return (
    <Container>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h1">Upload Audio Files</Typography>
          <Typography variant="body1">
            Please use the Box Explorer UI to upload your audio files for
            request #{id}.
          </Typography>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Grid>
        <Grid item>
          <BoxUploader folder={audioFolder} />
        </Grid>
        <Grid item>
          <Typography variant="body1">
            If there is an error above, the "Open Box Uploader" button isn't
            working, or you get an error from the Box Uploader UI, please
            manually upload your audio files to the following link. If there is
            no link below, please contact support.
          </Typography>
          {audioFolder !== "" && (
            <Typography variant="body1">
              <a
                href={"https://[company].app.box.com/folder/" + audioFolder}
                target="_blank"
                rel="noreferrer"
              >
                {"https://[company].app.box.com/folder/" + audioFolder}
              </a>
              <OpenInNewIcon fontSize="small" />
            </Typography>
          )}
          {parentFolder !== "" && (
            <Typography variant="body1">
              {'Upload to the "Audio" subfolder of this folder: '}
              <a
                href={"https://[company].app.box.com/folder/" + parentFolder}
                target="_blank"
                rel="noreferrer"
              >
                {"https://[company].app.box.com/folder/" + parentFolder}
              </a>
              <OpenInNewIcon fontSize="small" />
            </Typography>
          )}
        </Grid>
        <Grid item container justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={completeAudioUp}
            disabled={loading}
          >
            {loading && <CircularProgress size="25px" color="inherit" />}
            {!loading && "Done"}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
