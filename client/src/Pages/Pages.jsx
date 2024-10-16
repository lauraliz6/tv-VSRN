import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Dashboard from "./Dashboard";
import ChangePass from "./ChangePass";
import Help from "./Help";
import RequestInfo from "./RequestInfo";
import ChangeDetails from "./ChangeDetails";
import NewRequest from "./NewRequest";
import NewRate from "./NewRate";
import AudioUp from "./AudioUp";
import WfTest from "./WfTest";
import BoxTest from "./BoxTest";
import Error from "./Error";
import TimeOff from "./TimeOff";
import UserManagement from "./UserManagement";
import AdminDashboard from "./AdminDashboard";

export default function Pages() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Dashboard />
        </Route>
        <Route path="/password">
          <ChangePass />
        </Route>
        <Route path="/help">
          <Help />
        </Route>
        <Route path="/request/:id">
          <RequestInfo />
        </Route>
        <Route path="/changeDetails/:id">
          <ChangeDetails />
        </Route>
        <Route path="/newRequest">
          <NewRequest />
        </Route>
        <Route path="/newRate/:id">
          <NewRate />
        </Route>
        <Route path="/audioUp/:id">
          <AudioUp />
        </Route>
        <Route path="/wfapitest">
          <WfTest />
        </Route>
        <Route path="/boxtest">
          <BoxTest />
        </Route>
        <Route path="/error">
          <Error />
        </Route>
        <Route path="/timeoff">
          <TimeOff />
        </Route>
        <Route path="/usermgmt">
          <UserManagement />
        </Route>
        <Route path="/admindashboard">
          <AdminDashboard />
        </Route>
      </Switch>
    </Router>
  );
}

//example component
// function Home() {
//   return <h2>Home</h2>;
// }
