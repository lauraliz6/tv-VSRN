import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Axios from "axios";
import {
  Select,
  MenuItem,
  Paper,
  Typography,
  Container,
  Grid,
} from "@material-ui/core";
import RequestsCostsLine from "../components/charts/RequestsCostsLine";
import PieChartWt from "../components/charts/PieChartWt";
import RequestsListWt from "../components/charts/RequestsListWt";
import theme from "../StyleGuide";
import { useTableStyles } from "../components/TableStyles";

const useStyles = makeStyles((theme) => ({
  datapaper: {
    marginTop: theme.spacing(2),
    display: "block",
    padding: theme.spacing(2),
    textAlign: "center",
  },
  select: {
    backgroundColor: "white",
  },
}));

export default function WriterData() {
  const classes = useTableStyles();
  const subclasses = useStyles();
  const [writers, setWriters] = useState([]);
  const [selectedWT, setSelectedWT] = useState("all");
  const [loadedWT, setLoadedWT] = useState("all");
  //total # displays
  const [totalReq, setTotalReq] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  //line chart
  const [MYLabels, setMYLabels] = useState([]);
  const [costData, setCostData] = useState([]);
  const [countData, setCountData] = useState([]);

  useEffect(() => {
    Axios.get("http://localhost:3001/allWriters").then((response) => {
      setWriters(response.data);
    });
    //the following code is to disable warning about including 'writers' in dependencies,
    //which will make an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchData = () => {
      Axios.get("http://localhost:3001/wtDashData", {
        headers: {
          writer: selectedWT,
        },
      }).then((response) => {
        const length = response.data[0].Length;
        setTotalReq(length);
        const cost = response.data[0].Cost;
        const moneyCost = new Intl.NumberFormat("en-US", {
          maximumSignificantDigits: 3,
        }).format(cost);
        setTotalCost(moneyCost);
      });

      Axios.get("http://localhost:3001/wtDashDataGroup", {
        headers: {
          writer: selectedWT,
        },
      }).then((response) => {
        const data = response.data;
        const tempMY = [];
        const tempCosts = [];
        const tempCounts = [];
        data.forEach((el) => {
          tempMY.push(el.Month + " " + el.Year);
          tempCosts.push(el.Cost);
          tempCounts.push(el.Length);
        });
        setMYLabels(tempMY);
        setCostData(tempCosts);
        setCountData(tempCounts);
      });
      setLoadedWT(selectedWT);
    };
    fetchData();
  }, [selectedWT]);

  return (
    <Container>
      <Paper className={classes.paper}>
        <Typography variant="h2" className={classes.title}>
          Writer Data
        </Typography>
        <Typography variant="h2" className={classes.title}>
          Data for Writer{loadedWT === "all" ? "s" : ` ${loadedWT}`}
        </Typography>
        <div>
          <Select
            labelid="writerLabel"
            id="writer"
            value={selectedWT || "all"}
            variant="outlined"
            onChange={(e) => {
              setSelectedWT(e.target.value);
            }}
            className={subclasses.select}
          >
            <MenuItem value="all">All Writers</MenuItem>
            {writers.map((writer) => (
              <MenuItem value={writer.nameUsers} key={writer.idUsers}>
                {writer.nameUsers}
              </MenuItem>
            ))}
          </Select>
        </div>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={2}>
          <Paper className={subclasses.datapaper}>
            <Typography variant="h5">Total Requests</Typography>
            <RequestsListWt total={totalReq} user={selectedWT} />
          </Paper>
        </Grid>
        <Grid item xs={2}>
          <Paper className={subclasses.datapaper}>
            <Typography variant="h5">Total Cost</Typography>
            <Typography>${totalCost}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <Paper className={subclasses.datapaper}>
            <Typography variant="h5">Costs and Requests Over Time</Typography>
            <RequestsCostsLine
              labels={MYLabels}
              costdata={costData}
              countdata={countData}
            />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={subclasses.datapaper}>
            <Typography variant="h5">Requests By Status</Typography>
            <PieChartWt
              group="status"
              selectedWT={selectedWT}
              label={"# of Requests"}
              colors={[
                "#9E65B4",
                "#004D4E",
                "#BF4300",
                "#833409",
                "#000000",
                "#426024",
                "#B46B03",
              ]}
            />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={subclasses.datapaper}>
            <Typography variant="h5">Requests By Rush</Typography>
            <PieChartWt
              group="rush"
              selectedWT={selectedWT}
              label={"# of Requests"}
              colors={[theme.palette.primary.dark, theme.palette.primary.main]}
            />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={subclasses.datapaper}>
            <Typography variant="h5">
              Requests By Length (Script Type)
            </Typography>
            <PieChartWt
              group="scriptType"
              selectedWT={selectedWT}
              label={"# of Requests"}
              colors={[theme.palette.primary.dark, theme.palette.primary.main]}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
