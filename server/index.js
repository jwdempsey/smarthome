require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const PubSub = require("./PubSub");
const types = require("./types");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app
  .route("/api/devices")
  .get((req, res) => {
    try {
      PubSub.notify("get", req).then((response) => res.send(response));
    } catch (e) {
      res.send([]);
    }
  })
  .post((req, res) => {
    try {
      PubSub.notify("post", req).then((response) => res.send(response));
    } catch (e) {
      res.send([]);
    }
  });

app.get("/api/devices/:manufacturer/:key", (req, res) => {
  try {
    PubSub.notify("getById", req).then((response) => res.send(response));
  } catch (e) {
    res.send([]);
  }
});

app.get("/api/devices/types", (req, res) => {
  try {
    res.send(types);
  } catch (e) {
    res.send([]);
  }
});

app.listen(3000, () => {
  console.log(`Listening at http://localhost:3000`);
});
