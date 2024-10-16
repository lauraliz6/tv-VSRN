import React, { useEffect, useState } from "react";
import Axios from "axios";

import AuthCheck from "./AuthCheck";

import {
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  Table,
  TableCell,
  TableBody,
  Typography,
  IconButton,
  Collapse,
} from "@material-ui/core";

//HEY IMPORTANT NOTE HERE!!!!
// the Collapse will show a findDOMNode Warning, which can be ignored.
// this is a documented issue with MaterialUi but will not affect app functionality
// https://stackoverflow.com/questions/63568669/dialog-with-transition-throwing-js-warning-finddomnode-is-deprecated-in-strictm

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

import { withStyles, makeStyles } from "@material-ui/core/styles";

import { stableSort, getComparator } from "../Functions/UserManagementActions";

const useStyles = makeStyles({
  icon: {
    color: "#FFFFFF",
  },
});

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
    fontWeight: 800,
  },
}))(TableCell);

export default function RateTable() {
  const classes = useStyles();

  const [ratesOpen, setRatesOpen] = useState(false);

  const toggleRateTable = () => {
    setRatesOpen(!ratesOpen);
  };

  const [vtRows, setVtRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const getTalentRates = () => {
      AuthCheck().then(function (authResult) {
        const auth = authResult.auth;
        if (auth) {
          Axios.get("http://localhost:3001/vts").then((response) => {
            const vtResult = response.data;
            const sortedVts = stableSort(
              vtResult,
              getComparator("asc", "nameUsers")
            );
            setVtRows(sortedVts);
          });
        } else {
          setError("Authorization denied");
        }
      });
    };
    getTalentRates();
  }, []);

  const headCellsRT = [
    { id: "talent", label: "Voice Talent", wide: true },
    { id: "oneToNine", label: "1-9 Modules (per)" },
    { id: "tenPlus", label: "10+ Modules" },
    { id: "oneToNineRush", label: "Rush 1-9 Modules (per)" },
    { id: "tenPlusRush", label: "Rush 10+ Modules" },
  ];

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell style={{ padding: "8px 16px" }}>
                <Typography variant="h5">
                  Voice Talent Rate Table
                  <IconButton
                    aria-label="delete"
                    className={classes.icon}
                    onClick={toggleRateTable}
                  >
                    {ratesOpen && <ExpandLessIcon />}
                    {!ratesOpen && <ExpandMoreIcon />}
                  </IconButton>
                </Typography>
              </StyledTableCell>
            </TableRow>
            {error !== "" && (
              <TableRow>
                <TableCell>{error}</TableCell>
              </TableRow>
            )}
          </TableHead>
        </Table>
      </TableContainer>
      <Collapse in={ratesOpen}>
        <TableContainer component={Paper}>
          <Table stickyHeader aria-label="Voice Talent Rate Table">
            <TableHead>
              <TableRow>
                {headCellsRT.map((headCell) => (
                  <StyledTableCell
                    key={headCell.id}
                    style={{ minWidth: headCell.wide ? 125 : 0 }}
                  >
                    {headCell.label}
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {vtRows.map((row) => (
                <TableRow key={row.uidUsers}>
                  <TableCell>{row.nameUsers}</TableCell>
                  <TableCell>${JSON.parse(row.rates)["1-9"]}</TableCell>
                  <TableCell>${JSON.parse(row.rates)["10+"]}</TableCell>
                  <TableCell>${JSON.parse(row.rates)["rush1-9"]}</TableCell>
                  <TableCell>${JSON.parse(row.rates)["rush10+"]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </div>
  );
}
