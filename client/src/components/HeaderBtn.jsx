import { Button, Typography } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/styles";

import { Link } from "@material-ui/core";

const useStyles = makeStyles(() =>
  createStyles({
    custButton: {
      background: "#8876DE",
      color: "#FFFFFF",
      border: "none",
      borderRadius: 0,
      minHeight: 64,
      minWidth: "10vw",
      paddingTop: 10,
      "&:hover": {
        background: "#CED3FA",
      },
    },
    label: {
      flexDirection: "column",
    },
    text: {
      fontSize: 14,
      padding: "5px 10px",
      textDecoration: "none",
    },
  })
);

const HeaderBtn = (props) => {
  const classes = useStyles();

  return (
    <Link href={props.link || "/"}>
      <Button
        classes={{ root: classes.custButton, label: classes.label }}
        aria-label={props.text}
        onClick={props.onClick}
      >
        {props.icon}
        <Typography className={classes.text}>{props.text}</Typography>
      </Button>
    </Link>
  );
};

export default HeaderBtn;
