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
    PubSub.notify("get", req).then((response) => res.send(response));
  })
  .post((req, res) => {
    PubSub.notify("post", req).then((response) => res.send(response));
  });

app.get("/api/devices/:manufacturer/:key", (req, res) => {
  PubSub.notify("getById", req).then((response) => res.send(response));
});

app.get("/api/devices/types", (req, res) => {
  res.send(types);
});

app.listen(3000, () => {
  console.log(`Listening at http://localhost:3000`);
});
