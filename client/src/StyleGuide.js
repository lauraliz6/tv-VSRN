import { createTheme } from "@material-ui/core/styles";

const theme = createTheme({
  palette: {
    primary: {
      dark: "#33173D",
      main: "#8876DE",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#8876DE",
      light: "#CED3FA",
      contrastText: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: ["Roboto Condensed", "sans-serif"].join(","),
    h1: {
      fontWeight: 500,
      fontSize: 38,
    },
    h6: {
      fontWeight: 300,
      fontSize: 24,
    },
  },
});

export default theme;
