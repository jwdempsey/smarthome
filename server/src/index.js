require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const types = require("./types");
const PubSub = require("./PubSub");
const HTTPError = require("./HTTPError");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const handleError = (e) => {
  if (e instanceof HTTPError) {
    res.status(e.status);
  } else {
    res.status(400);
  }

  res.send({ message: e.message });
};

app
  .route("/api/devices")
  .get((req, res) => {
    PubSub.notify("get", req)
      .then((response) => res.send(response))
      .catch((e) => {
        handleError(e);
      });
  })
  .post((req, res) => {
    PubSub.notify("post", req)
      .then((response) => res.send(response))
      .catch((e) => {
        handleError(e);
      });
  });

app.get("/api/devices/:manufacturer/:key", (req, res) => {
  PubSub.notify("getById", req)
    .then((response) => res.send(response))
    .catch((e) => {
      handleError(e);
    });
});

app.get("/api/devices/types", (req, res) => {
  res.send(types);
});

app.listen(3000, () => {
  console.log(`Listening at http://localhost:3000`);
});
