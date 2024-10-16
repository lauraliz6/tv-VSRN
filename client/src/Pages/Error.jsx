import React from "react";

import { Container, Typography, Link } from "@material-ui/core";

export default function Error() {
  return (
    <Container>
      <Typography variant="h1">Oops!</Typography>
      <Typography variant="body1">
        You either don't have permission to see this page, or reached this page
        in error. Please navigate back to your{" "}
        <Link variant="body1" href="/">
          dashboard!
        </Link>
      </Typography>
    </Container>
  );
}
