import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
import { UserContext } from "../AppAuth/Context.jsx";

import AuthCheck from "../components/AuthCheck";
import StatusChip from "./StatusChip";
import WriterAdminActions from "./WriterAdminActions.jsx";
import VTActions from "./VTActions.jsx";
import SearchBar from "./SearchBar.jsx";

import { formatDate } from "../Functions/Formatting.jsx";

import { withStyles, makeStyles } from "@material-ui/core/styles";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Link,
  TablePagination,
  TableContainer,
  TableSortLabel,
  LinearProgress,
} from "@material-ui/core";

import CheckIcon from "@material-ui/icons/Check";
import OpenInBrowserIcon from "@material-ui/icons/OpenInBrowser";

const useStyles = makeStyles({
  container: {
    maxHeight: "80vh",
  },
  loading: {
    opacity: "50%",
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
  wideCell: {
    minWidth: 100,
  },
});

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
    fontWeight: 800,
  },
}))(TableCell);

const StyledTableSortLabel = withStyles(() => ({
  root: {
    color: "white",
    "&:hover": {
      color: "white",
    },
    "&$active": {
      color: "white",
    },
  },
  active: {},
  icon: {
    color: "inherit !important",
  },
}))(TableSortLabel);

export default function RequestTable(props) {
  const writerTog = props.writerToggle;

  const { user, logout } = useContext(UserContext);
  const role = user.user.role;

  const classes = useStyles();

  const [tableRows, setTableRows] = useState([]);

  const [refresh, setRefresh] = useState("");

  //pagination & sorting
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [page, setPage] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);
  const [orderBy, setOrderBy] = React.useState("id");
  const [order, setOrder] = React.useState("desc");
  const [loading, setLoading] = React.useState(false);

  //search
  const [searchParam, setSearchParam] = useState("");
  //this list is the columns that can be searched on
  const searchKeys = ["writer", "wfID", "customer", "videoTitle", "talent"];
  //reset page number on search
  useEffect(() => {
    setPage(0);
  }, [searchParam]);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const createSortHandler = (property) => (event) => {
    if (property === orderBy) {
      if (order === "desc") {
        setOrder("asc");
      } else {
        setOrder("desc");
      }
    } else {
      setOrderBy(property);
      setOrder("desc");
    }
  };

  useEffect(() => {
    const getVoiceReqs = () => {
      setLoading(true);
      AuthCheck().then(function (authResult) {
        const role = user.user.role;
        const name = user.user.user;
        const auth = authResult.auth;
        if (auth) {
          Axios.get("http://localhost:3001/voiceRequests", {
            headers: {
              rows: rowsPerPage,
              page: page,
              orderby: orderBy,
              order: order,
              userrole: role,
              username: name,
              toggle: writerTog,
              search: searchParam,
              searchby: searchKeys,
            },
          }).then((response) => {
            setLoading(false);
            setTableRows(response.data);
          });
        } else {
          setLoading(false);
          logout();
        }
      });
    };
    getVoiceReqs();
    //the following code is to disable warning about including 'logout' in dependencies.
    //putting 'logout' in dependencies so will result in infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rowsPerPage,
    page,
    orderBy,
    order,
    user.user.user,
    user.user.role,
    writerTog,
    refresh,
    searchParam,
  ]);

  useEffect(() => {
    const getReqCount = () => {
      AuthCheck().then(function (authResult) {
        const role = user.user.role;
        const name = user.user.user;
        const toggle = writerTog;
        const auth = authResult.auth;
        if (auth) {
          Axios.get("http://localhost:3001/numVoiceRequests", {
            headers: {
              role: role,
              name: name,
              toggle: toggle,
              search: searchParam,
              searchby: searchKeys,
            },
          }).then((response) => {
            setTotalCount(response.data[0].Length);
          });
        }
      });
    };
    getReqCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.user.role, user.user.user, writerTog, searchParam]);

  const headCells = [
    { id: "id", label: "ID", sort: true },
    { id: "status", label: "Status", sort: true },
    { id: "talent", label: "Talent", sort: true },
    { id: "writer", label: "Writer", sort: true },
    { id: "customer", label: "Customer", sort: true },
    { id: "videoTitle", label: "Video Title", sort: true },
    { id: "sentDate", label: "Sent Date", sort: true },
    { id: "dueDate", label: "Due Date", sort: true },
    { id: "rush", label: "Rush", sort: true },
    { id: "rate", label: "Rate", sort: true },
    { id: "files", label: "Files", sort: false },
    { id: "actions", label: "Actions", sort: false },
  ];

  return (
    <div>
      <TableContainer component={Paper} className={classes.container}>
        {loading && <LinearProgress />}
        <Table
          stickyHeader
          aria-label="Voice Requests Table"
          className={loading ? classes.loading : ""}
        >
          <TableHead>
            <TableRow>
              <TableCell colSpan={12} style={{ padding: "5px 10px" }}>
                <SearchBar passChildData={setSearchParam} />
              </TableCell>
            </TableRow>
            <TableRow>
              {headCells.map((headCell) => (
                <StyledTableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell.sort && (
                    <StyledTableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "desc"}
                      onClick={createSortHandler(headCell.id)}
                    >
                      {headCell.label}
                      {orderBy === headCell.id ? (
                        <span className={classes.visuallyHidden}>
                          {order === "desc"
                            ? "sorted descending"
                            : "sorted ascending"}
                        </span>
                      ) : null}
                    </StyledTableSortLabel>
                  )}
                  {!headCell.sort && <span>{headCell.label}</span>}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">
                  <Link href={`/request/${row.id}`}>{row.id}</Link>
                </TableCell>
                <TableCell>
                  <StatusChip label={row.status} />
                </TableCell>
                <TableCell>{row.talent}</TableCell>
                <TableCell>{row.writer}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.videoTitle}</TableCell>
                <TableCell>{formatDate(row.sentDate)}</TableCell>
                <TableCell>{formatDate(row.dueDate)}</TableCell>
                <TableCell>{row.rush === "y" && <CheckIcon />}</TableCell>
                <TableCell>${row.rate}</TableCell>
                <TableCell>
                  <Link href={row.boxLink}>
                    <OpenInBrowserIcon />
                  </Link>
                </TableCell>
                <TableCell align="right" className={classes.wideCell}>
                  {role !== "vt" && (
                    <WriterAdminActions
                      status={row.status}
                      id={row.id}
                      username={user.user.user}
                      role={user.user.role}
                      passChildData={setRefresh}
                    />
                  )}
                  {role === "vt" && (
                    <VTActions
                      status={row.status}
                      id={row.id}
                      username={user.user.user}
                      role={user.user.role}
                      passChildData={setRefresh}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </div>
  );
}
