import React, { createContext, useState, useLayoutEffect } from "react";
import Axios from "axios";

// the user context here comes from this example (modified): https://codepen.io/danielcurtis/pen/pogbEdz?editors=0011
// @function  UserContext
export const UserContext = createContext({
  user: { user: "", role: "", userName: "" },
  auth: false,
});

// @function  UserProvider
// Create function to provide UserContext
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    user: { user: "", role: "", userName: "" },
    auth: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  Axios.defaults.withCredentials = false;

  useLayoutEffect(() => {
    Axios.get("http://localhost:3001/login", { withCredentials: true }).then(
      (response) => {
        if (response.data.loggedIn === true) {
          setUser({
            user: {
              user: response.data.user[0].nameUsers,
              role: response.data.user[0].roles,
              userName: response.data.user[0].uidUsers,
            },
            auth: true,
          });
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    );
  }, [user.auth]);

  const login = (user, password) => {
    Axios.post(
      "http://localhost:3001/login",
      {
        username: user,
        password: password,
      },
      { withCredentials: true }
    ).then((response) => {
      if (!response.data.auth) {
        setUser({
          user: {
            user: "",
            role: "",
            userName: "",
          },
          auth: false,
        });
        setError(response.data.message);
      } else {
        localStorage.setItem("token", response.data.token);
        setUser({
          user: {
            user: "",
            role: "",
            userName: "",
          },
          auth: true,
        });
      }
    });
  };

  const logout = () => {
    Axios.get("http://localhost:3001/logout", { withCredentials: true }).then(
      () => {
        setUser({
          user: {
            user: "",
            role: "",
            userName: "",
          },
          auth: false,
        });
        localStorage.removeItem("token");
      }
    );
  };

  return (
    <UserContext.Provider value={{ user, login, logout, error, loading }}>
      {children}
    </UserContext.Provider>
  );
};
