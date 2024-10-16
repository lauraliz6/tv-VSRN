// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("uilogin", (username, password) => {
  //clear local token
  cy.clearLocalStorage("token");
  //visit homepage
  cy.visit("/");
  cy.get("input[name=username]").type(username);
  cy.get("input[name=password]").type(password);
  cy.get("form").submit();
});

Cypress.Commands.add("login", (username, password) => {
  cy.clearLocalStorage("token");
  cy.visit("/");
  cy.request("POST", "http://localhost:3001/login", {
    username: username,
    password: password,
    withCredentials: true,
  }).then((response) => {
    let token = response.body.token;
    console.log(token);
    window.localStorage.setItem("token", token);
  });
});
