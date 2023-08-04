//Author: Divyashree Bangalore Subbaraya (B00875916)
const bodyParser = require("body-parser");

const express = require("express");

const app = express();

const expressPinoLogger = require('express-pino-logger');

const logger = require('../Backend/gcpml/middleware/pinoService');

const cors = require("cors");

const uploadRoute = require("../Backend/gcpml/routes/mlroutes");
const messagingRouter = require('../Backend/src/routes/messagingRoute');

app.use(cors());

app.use(express.json());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

const loggerMidlleware = expressPinoLogger({
    logger: logger,
    autoLogging: false,
  });
  
app.use(loggerMidlleware);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-type,Authorization");
  next();
});

//Route user
app.use("/gcp", uploadRoute);
app.use('/gcppubsubmessage', messagingRouter);

module.exports = app;
