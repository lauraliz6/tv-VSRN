import { Container, Typography, Paper, IconButton } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";

import { UserContext } from "../AppAuth/Context.jsx";

import Axios from "axios";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  LinearProgress,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  Button,
  DialogContentText,
} from "@material-ui/core";

import EditIcon from "@material-ui/icons/Edit";

import FilterDropDown from "../components/FilterDropDown.jsx";
import {
  useTableStyles,
  StyledTableSortLabel,
  StyledTableCell,
} from "../components/TableStyles.jsx";
import { confirmChanges } from "../components/ConfirmChangesDialog";
import ErrorDialog from "../components/ErrorDialog.jsx";
import AlertDialog from "../components/AlertDialog.jsx";
import AddUserRow from "../components/AddUserRow.jsx";

import {
  getComparator,
  stableSort,
  filterUsers,
  writeUserChangesDb,
  checkForNameChange,
  checkForChanges,
  findEditRows,
  formatRates,
} from "../Functions/UserManagementActions.jsx";

//IDEALLY THIS WOULD BE A DATA TABLE ONCE WE CAN UPDATE TO NEW MUI
export default function UserManagement() {
  const classes = useTableStyles();

  const { user } = useContext(UserContext);
  const role = user.user.role;

  const [loading, setLoading] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");

  const [allUsers, setAllUsers] = useState([]);

  const [orderBy, setOrderBy] = React.useState("uidUsers");
  const [order, setOrder] = React.useState("asc");
  const [tableFilters, setTableFilters] = useState(["admin", "writer", "vt"]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [changes, setChanges] = useState([]);
  const [editRows, setEditRows] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [addUserMode, setAddUserMode] = useState(false);
  const [singleEdit, setSingleEdit] = useState(false);
  const [userRows, setUserRows] = useState([]);

  //refresh on user mode change
  useEffect(() => {
    if (errorOpen === false && alertOpen === false) {
      fetchData();
    }
  }, [errorOpen, alertOpen]);

  //sorting
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const createSortHandler = (property) => (event) => {
    handleRequestSort(event, property);
  };

  //
  //selecting
  const handleSelect = (e) => {
    const rowSelected = e.target.value;
    const rowChecked = e.target.checked;
    const newSelectArr = [...selectedRows];
    if (rowChecked) {
      newSelectArr.push(rowSelected);
    } else {
      const arrPos = newSelectArr.indexOf(rowSelected);
      newSelectArr.splice(arrPos, 1);
    }
    setSelectedRows(newSelectArr);
  };

  const handleGlobalSelect = (e) => {
    const globalChecked = e.target.checked;
    if (globalChecked) {
      const userSelectArr = [];
      userRows.forEach((user) => {
        userSelectArr.push(user.uidUsers);
      });
      setSelectedRows(userSelectArr);
    } else {
      setSelectedRows([]);
    }
  };

  //
  //adding a user
  const handleAddUser = () => {
    setAddUserMode(true);
  };

  //
  //editing
  const handleSingleEdit = (e) => {
    const newEditArr = [];
    if (newEditArr.indexOf(e) <= -1) {
      newEditArr.push(e);
    }
    setSingleEdit(true);
    setEditMode(true);
    setEditRows(newEditArr);
  };

  const handleEditMultiple = () => {
    let newEditArr = [];
    if (selectedRows.length === 0 || selectedRows.length === allUsers.length) {
      //edit all
      //disable filters
      setTableFilters(["admin", "writer", "vt", "inactive"]);
      allUsers.forEach((row) => {
        newEditArr.push(row.uidUsers);
      });
    } else {
      //edit selected
      newEditArr = selectedRows;
    }
    setEditMode(true);
    setEditRows(newEditArr);
  };

  const handleEditOff = () => {
    confirmNewChanges();
    setEditRows([]);
    setEditMode(false);
    setSingleEdit(false);
    setSelectedRows([]);
    setErrorText("");
    setErrorOpen(false);
    setChanges([]);
  };

  const handleAddUserOff = () => {
    setAddUserMode(false);
  };

  async function confirmNewChanges() {
    const newChanges = checkForChanges(changes);
    const changesStr = newChanges.str;
    const changesObjs = newChanges.obj;
    if (changesStr.length === 0) {
      //if no changes, return
      return;
    }
    //putting the changes array into a confirmation dialog box
    if (
      await confirmChanges(
        <div>
          {changesStr.map((changeEl, index) => {
            return (
              <DialogContentText key={index}>{changeEl}</DialogContentText>
            );
          })}
        </div>
      )
    ) {
      writeUserChangesDb(changesObjs).then((response) => {
        if (response.success) {
          //this is success
          //check to see if there was a name change
          const nameChangesArr = checkForNameChange(changesObjs);
          if (nameChangesArr.length === 0) {
            //if none, right to refresh
            fetchData();
          } else {
            //if there are changes, ask the user if they want to update in db
            //if they say no, will refresh
            confirmDbNameChange(nameChangesArr);
          }
        } else {
          setErrorText(
            "Error writing to database. Please refresh the page and try again, or contact support."
          );
          setErrorOpen(true);
        }
      });
    } else {
      console.log("cancelled changes");
    }
  }

  async function confirmDbNameChange(dbNameChanges) {
    if (
      await confirmChanges(
        <div>
          <DialogContentText>
            Do you want to update the changed Names across the Voice Request
            database?
          </DialogContentText>
          <DialogContentText>This is a recommended action.</DialogContentText>
        </div>
      )
    ) {
      rewriteUserName(dbNameChanges);
    } else {
      //if no change, go to refresh
      fetchData();
    }
  }

  async function rewriteUserName(dbNameChanges) {
    for (let n = 0; n < dbNameChanges.length; n++) {
      const nameUpdate = dbNameChanges[n];
      Axios.post("http://localhost:3001/changeNamesVRDB", {
        changes: nameUpdate,
      }).then((response) => {
        if (response.data.success) {
          //success, now refresh
          fetchData();
        } else {
          setErrorText(
            "Error writing to database. Please refresh the page and try again, or contact support."
          );
          setErrorOpen(true);
        }
      });
    }
  }

  //
  //creating sorted + filtered list of rows w/ edit properties
  useEffect(() => {
    const filteredUsers = filterUsers(tableFilters, allUsers);
    const userRes = stableSort(filteredUsers, getComparator(order, orderBy));
    const editRes = findEditRows(userRes, editRows);
    setUserRows(editRes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUsers, order, orderBy, tableFilters, editRows]);

  //unselecting when filter changes so user can see what they're doing
  useEffect(() => {
    setSelectedRows([]);
  }, [tableFilters]);

  //
  //fetching the data
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fetchData() {
    setLoading(true);
    Axios.get("http://localhost:3001/allUsers").then((response) => {
      setAllUsers(response.data);
      setLoading(false);
    });
  }

  //
  //handling changes
  function trackChanges(targetId, initInfo) {
    const newChangeArr = [...changes];
    const userUid = targetId.split("-").shift();
    const changeObj = {
      id: targetId.split("-").pop(),
      initial: initInfo,
      new: "",
    };
    //1 - see if user is in list of tracked changes
    const findUser = newChangeArr.findIndex((e) => e.userId === userUid);
    //2a - if user IS NOT in list - add as object with array with single object of tracked changes
    if (findUser <= -1) {
      const newUserObj = { userId: userUid, props: [changeObj] };
      newChangeArr.push(newUserObj);
    }
    //2b - if user IS in list - see if change is being tracked already
    else if (findUser > -1) {
      const foundUserObjProps = newChangeArr[findUser].props;
      const findProp = foundUserObjProps.findIndex(
        (e) => e.id === changeObj.id
      );
      //2b1 - if change is NOT being tracked, add to user object's array of props
      if (findProp <= -1) {
        foundUserObjProps.push(changeObj);
      }
    }
    setChanges(newChangeArr);
  }

  //
  //reformat
  function formFormat(edit, format, info, userId) {
    let newString = "";
    if (edit) {
      const formatType = headCells.find((e) => e.id === format).formFormat;
      if (formatType === "textfield") {
        newString = (
          <TextField
            variant="outlined"
            id={userId + "-" + format}
            defaultValue={info}
            onBlur={(e) => {
              trackChanges(e.target.id, info);
            }}
            helperText={
              format === "rates" &&
              'Example format: {"1-9":8, "10+":80, "rush1-9":12, "rush10+":80}'
            }
          ></TextField>
        );
      } else if (formatType === "dropdown") {
        const options = headCells.find((e) => e.id === format).filters;
        newString = (
          <Select
            variant="outlined"
            defaultValue={info}
            inputProps={{
              id: userId + "-" + format,
            }}
            name={userId + "-" + format}
            onChange={(e) => {
              trackChanges(e.target.name, info);
            }}
          >
            {options.map((option, index) => {
              return (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              );
            })}
          </Select>
        );
      } else if (formatType === "none") {
        newString = info;
      }
    } else if (format === "rates") {
      newString = formatRates(info);
    } else {
      newString = info;
    }
    return newString;
  }

  //declaring header cells
  const headCells = [
    {
      id: "uidUsers",
      label: "Username",
      sort: true,
      filter: false,
      formFormat: "none",
    },
    {
      id: "nameUsers",
      label: "Name",
      sort: true,
      filer: false,
      formFormat: "textfield",
    },
    {
      id: "emailUsers",
      label: "Email Address",
      sort: true,
      filter: false,
      formFormat: "textfield",
    },
    {
      id: "roles",
      label: "Role",
      sort: true,
      filter: true,
      filters: ["admin", "writer", "vt", "inactive"],
      formFormat: "dropdown",
    },
    {
      id: "rates",
      label: "Rates",
      sort: false,
      filter: false,
      formFormat: "textfield",
    },
  ];

  //
  //ACTUAL RENDER OF PAGE
  if (role === "admin") {
    return (
      <Container maxWidth={false}>
        <ErrorDialog
          open={errorOpen}
          text={errorText}
          passChildData={setErrorOpen}
        />
        <AlertDialog
          open={alertOpen}
          text={alertText}
          passChildData={setAlertOpen}
        />
        <Paper className={classes.paper}>
          <Typography variant="h2" className={classes.title}>
            User Management
          </Typography>
          {!editMode && !addUserMode && (
            <div>
              <Button
                variant="contained"
                style={{ marginRight: "1rem" }}
                onClick={handleAddUser}
              >
                Add User
              </Button>
              <Button variant="contained" onClick={handleEditMultiple}>
                Edit{" "}
                {selectedRows.length === 0 ||
                selectedRows.length === allUsers.length
                  ? "All"
                  : "Selected"}
              </Button>
            </div>
          )}
          {editMode && (
            <Button variant="contained" onClick={handleEditOff}>
              Done
            </Button>
          )}
          {addUserMode && (
            <Button variant="contained" onClick={handleAddUserOff}>
              Cancel
            </Button>
          )}
        </Paper>
        <TableContainer component={Paper} className={classes.container}>
          {loading && <LinearProgress />}
          <Table
            stickyHeader
            aria-label="User Table"
            className={loading ? classes.loading : ""}
          >
            <TableHead>
              <TableRow>
                <StyledTableCell>
                  {!editMode && (
                    <Checkbox
                      style={{ color: "white" }}
                      onChange={(e) => {
                        handleGlobalSelect(e);
                      }}
                      checked={
                        selectedRows.length === userRows.length ? true : false
                      }
                    />
                  )}
                </StyledTableCell>
                {headCells.map((headCell) => (
                  <StyledTableCell
                    key={headCell.id}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    <div style={{ display: "flex" }}>
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
                      {headCell.filter && !editMode && !addUserMode && (
                        <FilterDropDown
                          filters={headCell.filters}
                          passChildData={setTableFilters}
                          checked={tableFilters}
                        />
                      )}
                    </div>
                  </StyledTableCell>
                ))}
                <StyledTableCell>Edit</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {addUserMode && (
                <AddUserRow
                  passChildData={setAddUserMode}
                  passChildErrData={setErrorText}
                  passChildErrOpen={setErrorOpen}
                  passChildSuccessText={setAlertText}
                  passChildSuccessOpen={setAlertOpen}
                />
              )}
              {userRows.map((row, index) => {
                return (
                  <TableRow hover role="checkbox" key={row.uidUsers}>
                    <TableCell>
                      {!editMode && !addUserMode && (
                        <Checkbox
                          value={row.uidUsers}
                          onChange={(e) => {
                            handleSelect(e);
                          }}
                          checked={
                            selectedRows.indexOf(row.uidUsers) > -1
                              ? true
                              : false
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {formFormat(
                        row.edit,
                        "uidUsers",
                        row.uidUsers,
                        row.uidUsers
                      )}
                    </TableCell>
                    <TableCell>
                      {formFormat(
                        row.edit,
                        "nameUsers",
                        row.nameUsers,
                        row.uidUsers
                      )}
                    </TableCell>
                    <TableCell>
                      {formFormat(
                        row.edit,
                        "emailUsers",
                        row.emailUsers,
                        row.uidUsers
                      )}
                    </TableCell>
                    <TableCell>
                      {formFormat(row.edit, "roles", row.roles, row.uidUsers)}
                    </TableCell>
                    <TableCell>
                      {formFormat(row.edit, "rates", row.rates, row.uidUsers)}
                    </TableCell>
                    <TableCell>
                      {!editMode && !addUserMode && (
                        <IconButton
                          onClick={() => handleSingleEdit(row.uidUsers)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {editMode && singleEdit && row.edit && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleEditOff}
                        >
                          DONE
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    );
  } else return <p>Permission denied.</p>;
}
