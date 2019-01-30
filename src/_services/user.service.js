import config from "config";
import { authHeader } from "../_helpers";

export const userService = {
  login,
  logout,
  getAll
};

async function login(username, password) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  };

  const response = await fetch(`${config.apiUrl}/authenticate`, requestOptions);
  const user = await handleResponse(response);
  // login successful if there's a jwt token in the response
  if (user.token) {
    // store user details and jwt token in local storage to keep user logged in between page refreshes
    localStorage.setItem("user", JSON.stringify(user));
  }

  return user;
}

function logout() {
  // remove user from local storage to log user out
  localStorage.removeItem("user");
}

function getAll() {
  const requestOptions = {
    method: "GET",
    headers: authHeader()
  };

  return fetch(`${config.apiUrl}/values`, requestOptions).then(handleResponse);
}

async function handleResponse(response) {
  const text = await response.text();

  const data = text && JSON.parse(text);
  if (!response.ok) {
    if (response.status === 401) {
      // auto logout if 401 response returned from api
      logout();
      location.reload(true);
    }

    throw (data && data.message) || response.statusText;
  }

  return data;
}
