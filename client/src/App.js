import React, { useContext } from "react";

import { UserContext, UserProvider } from "./AppAuth/Context.jsx";

import UnauthApp from "./AppAuth/UnAuthApp.jsx";
import AuthApp from "./AppAuth/AuthApp.jsx";
import LoadingApp from "./AppAuth/LoadingApp.jsx";

// @function  App
function AppWrap() {
  const { user } = useContext(UserContext);
  const auth = user.auth;
  const { loading } = useContext(UserContext);
  if (auth && !loading) {
    return <AuthApp />;
  } else if (!auth && !loading) {
    return <UnauthApp />;
  } else {
    return <LoadingApp />;
  }
}

export default function App() {
  return (
    <UserProvider>
      <AppWrap />
    </UserProvider>
  );
}
