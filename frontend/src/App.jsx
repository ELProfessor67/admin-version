import "@/App.css";
import "@/assets/css/style.css";
import "@/assets/css/custom-vc.css";
import "@/assets/css/custom.css";
import "@/assets/css/custom-login.css";
import "sweetalert2/dist/sweetalert2.min.css";

import React from 'react'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import LoginPage from "@/pages/loginPage";
import EventLobbyPage from "@/pages/EventLobbyPage";
import EventEditorPage from "@/pages/EventEditorPage";
import LoginWithUrlPage from "@/pages/loginWithUrlPage";
import LogoutPage from "@/pages/LogoutPage";
import ParticipantLobby from "@/pages/ParticipantLobby";


const App = () => {
  return (
    <Router>
        <Switch>
            <Route path="/" exact component={LoginPage} />
            <Route path="/events" exact component={EventLobbyPage} />
            <Route path="/participant" exact component={ParticipantLobby} />
            <Route path="/events/:id" exact component={EventEditorPage} />
            <Route path="/schedule" exact component={EventEditorPage} />
            <Route path="/logout" exact component={LogoutPage} />
            <Route path="/:id" exact component={LoginWithUrlPage} />
        </Switch>
      </Router>
  )
}

export default App
