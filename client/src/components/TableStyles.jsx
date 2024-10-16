import { makeStyles } from "@material-ui/styles";
import theme from "../StyleGuide.js";
import { withStyles } from "@material-ui/core";

import { TableSortLabel, TableCell } from "@material-ui/core";

export const useTableStyles = makeStyles({
  title: {
    fontSize: 20,
    fontWeight: 500,
    textTransform: "uppercase",
    color: theme.palette.secondary.contrastText,
  },
  paper: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: theme.palette.secondary.dark,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: theme.palette.secondary.contrastText,
  },
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

export const StyledTableSortLabel = withStyles(() => ({
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

export const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
    fontWeight: 800,
  },
}))(TableCell);
