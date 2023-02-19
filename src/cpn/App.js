import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import "../css/index.scss";

import { Login, SignUp, SignOut } from './auth';
import { Home, Projects } from './client';

function App() {
    const dispatch = useDispatch()

    useEffect(() => {
        const specialURLs = [ "/login", "/signup", "/signout" ]
        const url = window.location.pathname;

        if( specialURLs.indexOf(url) === -1 ){
            fetch("/api/auth/session").then( res => res.json() ).then( data => {
                const { session } = data;

                if( session ){
                    dispatch({
                        type: "sessionInitialize",
                        payload: { auth: session },
                    })
                }else{
                    window.location = "/login"
                }
            })
        }
    }, [])



  return (
      <React.StrictMode>
        <Router>
            <Routes>
                <Route exac path="/login" element={ <Login /> } />
                <Route exac path="/signup" element={ <SignUp /> } />
                <Route exac path="/signout" element={ <SignOut /> } />
                <Route exac path="/" element = { <Home /> } />
                <Route exac path="/projects" element = { <Projects /> } />
            </Routes>
        </Router>
    </React.StrictMode>
  );
}

export default App;
