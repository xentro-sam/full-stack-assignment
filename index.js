const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = 3001;

const USERS = [];

const QUESTIONS = [
  {
    id: "1",
    title: "Two states",
    description: "Given an array , return the maximum of the array?",
    testCases: [
      {
        input: "[1,2,3,4,5]",
        output: "5",
      },
    ],
  },
];

let authToken = "";
let isCurrentUserAdmin = false;

const SUBMISSION = [];

app.use(express.json());

app.post("/signup", function (req, res) {
  // Add logic to decode body
  // body should have email and password
  const { email, password, isAdmin } = req.body;

  //Store email and password (as is for now) in the USERS array above (only if the user with the given email doesnt exist)
  const isUserExists = USERS.some((user) => user.email === email);

  // return back 200 status code to the client
  if (isUserExists === false) {
    USERS.push({
      email: email,
      password: password,
      isAdmin: isAdmin === "true" ? true : false,
    });
    res.status(200).json({ message: "User Created" });
  } else {
    res.status(400).json({ message: "User already exists" });
  }
});

app.post("/login", function (req, res) {
  // Add logic to decode body
  // body should have email and password
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email or password is missing" });
  }

  // Check if the user with the given email exists in the USERS array
  // Also ensure that the password is the same
  const user = USERS.find(
    (user) => user.email === email && user.password === password
  );

  // If the password is the same, return back 200 status code to the client
  // Also send back a token (any random string will do for now)
  if (user) {
    res.status(200).json({
      message: "User Logged In",
      token: "randomString" + email,
    });
    authToken = "randomString" + email;
    isCurrentUserAdmin = user.isAdmin;
  }
  // If the password is not the same, return back 401 status code to the client
  else {
    res.status(401).json({ message: "User not found" });
    authToken = "";
    isCurrentUserAdmin = false;
  }
});

app.get("/questions", function (req, res) {
  const token = req.headers.authorization;
  //return the user all the questions in the QUESTIONS array
  if (token === "Bearer " + authToken) {
    res.status(200).json({ questions: QUESTIONS });
  } else {
    res.status(401).json({ message: "User not logged in" });
  }
});

app.get("/submissions", function (req, res) {
  const token = req.headers.authorization;
  // return the users submissions for this problem
  if (token === "Bearer " + authToken) {
    res.status(200).json({ submissions: SUBMISSION });
  } else {
    res.status(401).json({ message: "User not logged in" });
  }
});

app.post("/submissions", function (req, res) {
  // let the user submit a problem, randomly accept or reject the solution
  // Store the submission in the SUBMISSION array above
  const token = req.headers.authorization;
  if (token === "Bearer " + authToken) {
    const { questionId, code } = req.body;
    if (!questionId || !code) {
      res.status(400).json({ message: "QuestionId or code is missing" });
    }
    const isQuestionExists = QUESTIONS.some(
      (question) => question.id === questionId
    );
    if (isQuestionExists === true) {
      const isAccepted = Math.random() > 0.5 ? true : false;
      SUBMISSION.push({
        questionId: questionId,
        code: code,
        isAccepted: isAccepted,
      });
      res.status(200).json({ message: "Submission created" });
    } else {
      res.status(400).json({ message: "Question not found" });
    }
  }
  else {
    res.status(401).json({ message: "User not logged in" });
  }
});

// leaving as hard todos
// Create a route that lets an admin add a new problem
// ensure that only admins can do that.

app.post("/questions", function (req, res) {
  const token = req.headers.authorization;
  if (token !== "Bearer " + authToken) {
    res.status(401).json({ message: "User not logged in" });
  } else if (isCurrentUserAdmin === true) {
    const { title, description, testCases } = req.body;
    if (!title || !description || !testCases) {
      res
        .status(400)
        .json({ message: "Title or description or testCases is missing" });
    }
    const isQuestionExists = QUESTIONS.some(
      (question) => question.title === title
    );
    if (isQuestionExists === false) {
      QUESTIONS.push({
        id: uuidv4(),
        title: title,
        description: description,
        testCases: testCases,
      });
      res.status(200).json({ message: "Question created" });
    } else {
      res.status(400).json({ message: "Question already exists" });
    }
  } else {
    res.status(401).json({ message: "Current User not an admin" });
  }
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}`);
});
