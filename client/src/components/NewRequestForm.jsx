import React, { useEffect, useState, useContext } from "react";
import Axios from "axios";
import { makeStyles } from "@material-ui/core";

import { UserContext } from "../AppAuth/Context.jsx";

import { SubmitNewRequest } from "../Functions/Actions";
import BoxScriptUpload from "./BoxScriptUpload.jsx";

import { useHistory } from "react-router-dom";

import { boxProcess } from "../Functions/BoxActions.jsx";
import {
  stableSort,
  getComparator,
} from "../Functions/UserManagementActions.jsx";

import WorkfrontSearch from "./WorkfrontSearch.jsx";

import {
  Grid,
  InputLabel,
  Input,
  //IMPORTANT NOTE: SELECT AND MENU ITEM RESULT IN A DOMNODE ERROR. THIS CAN BE IGNORED.
  Select,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Button,
  FormHelperText,
  Typography,
  CircularProgress,
} from "@material-ui/core";

const useStyles = makeStyles({
  input: {
    width: "100%",
  },
});

const listTimes = (start, end) => {
  const timeArray = [];
  const startTime = start;
  let startHour = parseInt(startTime.split(" ").shift());
  const startAmPm = startTime.split(" ").pop();
  if (startAmPm === "PM") {
    startHour = startHour + 12;
  }
  const endTime = end;
  let endHour = parseInt(endTime.split(" ").shift());
  const endAmPm = endTime.split(" ").pop();
  if (endAmPm === "PM") {
    endHour = endHour + 12;
  }
  for (let i = startHour; i <= endHour; i++) {
    let hour = i;
    let ampm = "AM";
    let timecode;
    let time;
    let hour12 = hour;
    if (hour > 12) {
      ampm = "PM";
      hour12 = hour - 12;
    } else if (hour === 12) {
      ampm = "PM";
    }
    time = hour12.toString() + ampm;
    timecode = hour + ":00:00";
    if (hour.toString().length < 2) {
      hour = "0" + hour;
    }
    let timeObj = { time: time, timecode: timecode };
    timeArray.push(timeObj);
  }
  return timeArray;
};

export default function NewRequestForm(props) {
  const [loading, setLoading] = useState(false);

  const { user } = useContext(UserContext);
  const history = useHistory();

  //job id
  //for some weird reason I can't redirect to jobNum, but jobId works
  //so that's why there's 2
  let jobId;
  const [jobNum, setJobNum] = useState(0);

  const [createdFolder, setCreatedFolder] = useState("");

  //script file info
  const [script, setScript] = useState(null);
  const [scriptName, setScriptName] = useState("");

  //box errors
  const [boxErr, setBoxErr] = useState("");
  const [boxErrOpen, setBoxErrOpen] = useState(false);

  //this writes the new request to the db, through Actions
  const addNewRequest = () => {
    if (required) {
      setEnable(false);
      setLoading(true);
      SubmitNewRequest(requestInfo, user.user).then((response) => {
        if (response.err) {
          setSubmitError(response.err);
          setLoading(false);
          setEnable(true);
        } else if (response.success) {
          jobId = response.id;
          setJobNum(response.id);
          boxProcess(
            scriptName,
            response.id,
            videoTitle,
            requestInfo.talent,
            script
          ).then((response) => {
            if (response.success) {
              setLoading(false);
              let path = `/request/${jobId}`;
              history.push(path);
            } else {
              if (response.error) {
                setLoading(false);
                setEnable(true);
                if (response.folder) {
                  setCreatedFolder(response.folder);
                }
                setBoxErr(response.error);
                setBoxErrOpen(true);
              } else {
                setLoading(false);
                setEnable(true);
                setSubmitError(
                  "Something went wrong. Please contact your admin."
                );
              }
            }
          });
        }
      });
    }
  };

  const classes = useStyles();

  const timeRange = { start: "8 AM", end: "8 PM" };
  const times = listTimes(timeRange.start, timeRange.end);

  const [vts, setVts] = useState([]);

  useEffect(() => {
    Axios.get("http://localhost:3001/vts").then((response) => {
      const vtResult = response.data;
      const sortedVts = stableSort(vtResult, getComparator("asc", "nameUsers"));
      setVts(sortedVts);
    });
    //the following code is to disable warning about including 'vts' in dependencies,
    //which will make an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //this is the possible input data
  const [wfID, setWfID] = useState("");
  const [customer, setCustomer] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("00:00:00");
  const [talent, setTalent] = useState("null");
  const [jobDescription, setJobDescription] = useState("");
  const [scriptType, setScriptType] = useState("oneToNine");
  const [chaptersModules, setChaptersModules] = useState(1);
  const [reviewCycle, setReviewCycle] = useState(1);
  const [rate, setRate] = useState("0");
  const [rush, setRush] = useState(false);
  const [boxFile, setBoxFile] = useState(false);

  const [wfInfo, setWfInfo] = useState({});
  //this useEffect gathers data from the workfront search
  useEffect(() => {
    const wfid = wfInfo.wfid;
    const cust = wfInfo.cust;
    const title = wfInfo.title;
    setWfID(wfid);
    setCustomer(cust);
    setVideoTitle(title);
  }, [wfInfo]);

  const [vtTimeOff, setVtTimeOff] = useState([]);

  const data = props.data;
  //this useEffect is to set info for a new rate request
  useEffect(() => {
    if (data) {
      setWfID(data.wfID);
      setCustomer(data.customer);
      setVideoTitle(data.videoTitle);
      if (data.dueDate) {
        const dataDate = data.dueDate.split(" ")[0];
        const dataTime = data.dueDate.split(" ")[1];
        setDate(dataDate);
        setTime(dataTime);
      }
      setJobDescription(data.jobDescription);
      setScriptType(data.scriptType);
      setChaptersModules(data.chaptersModules);
      if (data.reviewCycle) {
        setReviewCycle(data.reviewCycle.split("vd")[1]);
      }
      // NOT setting rate or rush here as it should auto-calculate
      //removing box set as we have upload component
      // setBoxFile(data.boxLink);
    }
  }, [data]);

  //this useEffect is specifically for the VT select (for new rate request)
  //so it doesn't reset EVERYTHING
  useEffect(() => {
    if (data) {
      const vtFind = vts.find((vt) => vt.nameUsers === data.talent);
      if (vtFind) {
        const vtUid = vtFind.uidUsers;
        setTalent(vtUid);
      }
    }
  }, [data, vts]);

  //this is the overall state for ALL info
  const [requestInfo, setRequestInfo] = useState({
    wfID: "",
    customer: "",
    videoTitle: "",
    dueDate: "",
    talent: "",
    jobDescription: "",
    scriptType: "",
    chaptersModules: "",
    reviewCycle: "",
    rate: "",
    rush: "",
    boxLink: "http://www.box.com/",
  });

  //this is states for the checks
  const [enable, setEnable] = useState(false);
  const [required, setRequired] = useState(false);
  const [dateOk, setDateOk] = useState(false);

  //this is states for error messages
  const [dateErr, setDateErr] = useState("");
  const [lengthErr, setLengthErr] = useState("");
  const [submitError, setSubmitError] = useState("");

  //this takes all the useStates and puts them into one object
  useEffect(() => {
    const getVtName = (talentUid) => {
      const find = vts.find((vt) => vt.uidUsers === talentUid);
      let fullName = "";
      if (find) {
        fullName = find.nameUsers;
      }
      return fullName;
    };

    const populateAll = () => {
      setRequestInfo({
        wfID: wfID,
        customer: customer,
        videoTitle: videoTitle,
        dueDate: date + " " + time,
        talent: getVtName(talent),
        jobDescription: jobDescription,
        scriptType: scriptType,
        chaptersModules: chaptersModules,
        reviewCycle: "vd" + reviewCycle,
        rate: rate,
        rush: rush === false ? "n" : "y",
        boxLink: boxFile === true ? "http://www.box.com/" : "",
      });
    };
    populateAll();
  }, [
    wfID,
    customer,
    videoTitle,
    date,
    time,
    talent,
    jobDescription,
    scriptType,
    chaptersModules,
    reviewCycle,
    rate,
    rush,
    vts,
    boxFile,
  ]);

  //this check looks to see if all conditions are met to enable the submit button
  useEffect(() => {
    if (required && dateOk) {
      setEnable(true);
    } else {
      setEnable(false);
    }
  }, [required, dateOk]);

  //this checks if all required fields are filled in
  useEffect(() => {
    const checkFilled = () => {
      //nullVals includes any value that is considered undefined for the form
      let nullVals = [
        "null",
        null,
        undefined,
        "undefined",
        0,
        "00:00:00",
        "",
        false,
      ];
      let count = 0;
      //required count is the number of fields that must be filled
      let requiredCount = 11;
      for (const prop in requestInfo) {
        if (prop !== "jobDescription") {
          if (!nullVals.includes(requestInfo[prop])) {
            count++;
          }
        }
      }
      if (count === requiredCount) {
        setRequired(true);
      } else {
        setRequired(false);
      }
    };
    checkFilled();
  }, [requestInfo]);

  //this checks the date
  //to make sure it's in the future & not on a weekend
  //and calculates 'rush' based on <24 hours
  useEffect(() => {
    const now = new Date();
    let time24 = time;
    //converting "any time" to "8pm" since that would be their deadline
    if (time24 === "00:00:00") {
      time24 = "20:00:00";
    }
    const due = new Date(date + " " + time24);
    const diff = due - now;
    const dayOfWeek = due.getDay();
    const weekday = dayOfWeek > 0 && dayOfWeek < 6;
    if (diff > 0 && weekday) {
      setDateOk(true);
      setDateErr("");
    } else {
      setDateOk(false);
      if (diff < 0) {
        setDateErr("Date is in the past.");
      }
      if (diff > 0 && !weekday) {
        setDateErr("Date is on a weekend.");
      }
    }
    //rush calculation here
    //dividing to get number of hours
    const hours = diff / 3600000;
    if (diff > 0 && hours < 24) {
      setRush(true);
    } else {
      setRush(false);
    }
  }, [date, time]);

  //this checks the modules/chapters and script type for a match
  useEffect(() => {
    if (scriptType === "oneToNine" && chaptersModules >= 10) {
      setLengthErr("Script type does not match number of chapters/modules.");
    } else if (scriptType === "tenPlus" && chaptersModules < 10) {
      setLengthErr("Script type does not match number of chapters/modules.");
    } else {
      setLengthErr("");
    }
  }, [chaptersModules, scriptType]);

  //this calculates the rate
  useEffect(() => {
    const voiceTalent = vts.find((vt) => vt.uidUsers === talent);
    if (voiceTalent) {
      let sType;
      if (scriptType === "oneToNine") {
        sType = "1-9";
      } else if (scriptType === "tenPlus") {
        sType = "10+";
      }
      let rush24 = "";
      if (rush) {
        rush24 = "rush";
      }
      const rateCat = rush24 + sType;
      const talentRates = JSON.parse(voiceTalent.rates);
      const cost = talentRates[rateCat];
      if (scriptType === "tenPlus") {
        setRate(cost);
      } else {
        const totalCost = chaptersModules * cost;
        setRate(totalCost);
      }
    }
  }, [chaptersModules, scriptType, talent, rush, rate, vts]);

  //this checks for VT availability
  useEffect(() => {
    const checkTimeOffs = () => {
      setLoading(true);
      if (user && date) {
        Axios.get("http://localhost:3001/timeOffSearch", {
          headers: {
            userType: user.user.role,
            dueDate: date,
          },
        }).then((response) => {
          if (!response.data.err) {
            const timeoffs = response.data.vts;
            if (timeoffs.length > 0) {
              setVtTimeOff(timeoffs);
            } else {
              setLoading(false);
              return;
            }
          }
        });
      } else {
        setLoading(false);
        return;
      }
    };
    checkTimeOffs();
  }, [user, date]);

  const hasTimeOff = (vt) => {
    if (vtTimeOff.includes(vt)) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <Grid
      container
      item
      direction="column"
      justifyContent="flex-start"
      spacing={3}
    >
      <Grid item>
        <Typography variant="body1" color="error">
          {submitError}
        </Typography>
      </Grid>

      <Grid item>
        <WorkfrontSearch
          passChildData={setWfInfo}
          id={{ data: data ? true : false, id: wfID }}
        />
      </Grid>

      <Grid item>
        <InputLabel htmlFor="customer" required>
          Customer Name
        </InputLabel>
        <Input
          id="customer"
          fullWidth={true}
          value={customer || ""}
          onChange={(e) => {
            setCustomer(e.target.value);
          }}
        />
      </Grid>

      <Grid item>
        <InputLabel htmlFor="videoTitle" required>
          Video Title
        </InputLabel>
        <Input
          id="videoTitle"
          fullWidth={true}
          value={videoTitle || ""}
          onChange={(e) => {
            setVideoTitle(e.target.value);
          }}
        />
      </Grid>

      <Grid item container spacing={2} direction="row">
        <Grid item xs={6}>
          <InputLabel htmlFor="dueDate" required>
            Due Date
          </InputLabel>
          <Input
            error={dateErr !== ""}
            id="dueDate"
            type="date"
            value={date || ""}
            fullWidth={true}
            onChange={(e) => {
              setDate(e.target.value);
            }}
          />
          <FormHelperText error>{dateErr}</FormHelperText>
        </Grid>

        <Grid item xs={6}>
          <InputLabel id="dueTimeLabel" required>
            Due Time
          </InputLabel>
          <Select
            labelid="dueTimeLabel"
            id="dueTime"
            value={time || ""}
            className={classes.input}
            onChange={(e) => {
              setTime(e.target.value);
            }}
          >
            <MenuItem value="00:00:00">Any Time</MenuItem>
            {times.map((time) => (
              <MenuItem value={time.timecode} key={time.timecode}>
                {time.time}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <InputLabel id="talentLabel" required>
          Voice Talent
        </InputLabel>
        <Select
          labelid="talentLabel"
          id="talent"
          value={talent}
          className={classes.input}
          onChange={(e) => {
            setTalent(e.target.value);
          }}
        >
          <MenuItem value="null">Select a voice talent...</MenuItem>
          {vts.map((vt) => (
            <MenuItem
              value={vt.uidUsers}
              key={vt.idUsers}
              disabled={hasTimeOff(vt.uidUsers)}
            >
              {vt.nameUsers}
            </MenuItem>
          ))}
        </Select>
      </Grid>

      <Grid item>
        <InputLabel htmlFor="jobDescription">Job Description</InputLabel>
        <Input
          id="jobDescription"
          multiline={true}
          fullWidth={true}
          value={jobDescription || ""}
          onChange={(e) => {
            setJobDescription(e.target.value);
          }}
        />
      </Grid>

      <Grid item container spacing={2} direction="row">
        <Grid item xs={6}>
          <InputLabel id="scriptTypeLabel" required>
            Script Type
          </InputLabel>
          <Select
            labelid="scriptTypeLabel"
            id="scriptType"
            value={scriptType || ""}
            className={classes.input}
            onChange={(e) => {
              setScriptType(e.target.value);
            }}
          >
            <MenuItem value="oneToNine">1-9 Modules</MenuItem>
            <MenuItem value="tenPlus">10+ Modules</MenuItem>
          </Select>
        </Grid>

        <Grid item xs={6}>
          <InputLabel htmlFor="chaptersModules" required>
            Chapters/Modules
          </InputLabel>
          <Input
            error={lengthErr !== ""}
            id="chaptersModules"
            type="number"
            inputProps={{ min: 1, max: 10 }}
            value={chaptersModules || 0}
            fullWidth={true}
            onChange={(e) => {
              setChaptersModules(e.target.value);
            }}
          />
          <FormHelperText error>{lengthErr}</FormHelperText>
        </Grid>
      </Grid>

      <Grid item container spacing={2} direction="row" alignItems="flex-end">
        <Grid item xs={4}>
          <InputLabel htmlFor="reviewCycle" required>
            Review Cycle
          </InputLabel>
          <Input
            id="reviewCycle"
            type="number"
            inputProps={{ min: 0, max: 5 }}
            startAdornment={
              <InputAdornment position="start">VD</InputAdornment>
            }
            fullWidth={true}
            value={reviewCycle || 1}
            onChange={(e) => {
              setReviewCycle(e.target.value);
            }}
          />
        </Grid>

        <Grid item xs={5}>
          <InputLabel htmlFor="rate" required>
            Rate
          </InputLabel>
          <Input
            id="rate"
            type="number"
            value={rate}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            fullWidth={true}
            onChange={(e) => {
              setRate(e.target.value);
            }}
          />
        </Grid>

        <Grid item xs={3}>
          <FormControlLabel
            value="rush"
            control={<Checkbox color="primary" />}
            label="<24 hrs"
            labelPlacement="end"
            checked={rush}
            onChange={(e) => {
              setRush(e.target.checked);
            }}
          />
        </Grid>
      </Grid>

      <BoxScriptUpload
        boxErr={boxErr}
        boxErrOpen={boxErrOpen}
        folder={createdFolder}
        passFileSelect={setBoxFile}
        passFile={setScript}
        passScriptName={setScriptName}
        id={jobNum}
      />
      <Grid item container justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          disabled={!enable}
          onClick={addNewRequest}
        >
          {!loading && "Submit"}
          {loading && <CircularProgress size="25px" color="inherit" />}
        </Button>
      </Grid>
      {}
    </Grid>
  );
}
