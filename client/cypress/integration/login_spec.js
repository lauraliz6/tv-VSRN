describe("Login Page", () => {
  const username = "laura";
  const password = "123";
  const invalidUserPass = "invalid";

  const users = [
    { username: "laura", password: "123", type: "Admin", role: "admin" },
    { username: "test2", password: "123", type: "Writer", role: "writer" },
    { username: "vtalent", password: "123", type: "Vt", role: "vt" },
  ];

  //login via UI
  it("Shows dashboard on login and sets auth token via form submission", () => {
    cy.uilogin(username, password);

    //ASSERT: dashboard title should say 'dashboard'
    cy.get("#dashboard-title").should("contain", "Dashboard");
    //ASSERT: local storage token should exist
    cy.window().then((win) => {
      return expect(win.localStorage.getItem("token")).to.exist;
    });
  });

  //invalid username/password
  it("Shows error message on login with invalid username", () => {
    cy.uilogin(invalidUserPass, invalidUserPass);

    //ASSERT: should get error message
    cy.get("p[name=error]").should(
      "contain",
      "No user with this username exists."
    );

    //ASSERT: local storage token should NOT exist
    cy.window().then((win) => {
      return expect(win.localStorage.getItem("token")).to.not.exist;
    });
  });

  it("Shows error message on login with invalid password", () => {
    cy.uilogin(username, invalidUserPass);

    //ASSERT: should get error message
    cy.get("p[name=error]").should(
      "contain",
      "Wrong username/password combination."
    );

    //ASSERT: local storage token should NOT exist
    cy.window().then((win) => {
      return expect(win.localStorage.getItem("token")).to.not.exist;
    });
  });

  //login as different user types
  it("Shows appropriate dashboard for each user login", () => {
    users.forEach((user) => {
      cy.uilogin(user.username, user.password);
      cy.get("#dashboard-title").should("contain", user.type);
      cy.window().then((win) => {
        return expect(win.localStorage.getItem("token")).to.exist;
      });
    });
  });

  //send to api and get correct credentials
  it("Fetches authentication from api after UI login", () => {
    cy.uilogin(username, password);
    cy.intercept("http://localhost:3001/isUserAuth").as("userauth");
    cy.wait("@userauth");
    cy.request("GET", "http://localhost:3001/login").then((response) => {
      expect(response.body).to.have.property("loggedIn", true);
      expect(response.body.user[0]).to.have.property("uidUsers", username);
      expect(response.body.user[0]).to.have.property("roles", "admin");
    });
  });

  //programmatic login request
  it("Logs in programatically without using the UI and shows dashboard", () => {
    cy.login(username, password);
    cy.visit("/");
    //ASSERT: dashboard title should say 'dashboard'
    cy.get("#dashboard-title").should("contain", "Dashboard");
    //ASSERT: local storage token should exist
    cy.window().then((win) => {
      return expect(win.localStorage.getItem("token")).to.exist;
    });
  });
});
