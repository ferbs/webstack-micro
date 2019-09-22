import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import errorHandler from "errorhandler";
import {Config} from "../passportjs-auth-app";


export default function setupFormsAndBasics(app: express.Application, config: Config) {
  if (config.UseDebugErrorHandler) {
    app.use(errorHandler());
  }
  app.set("port", config.port);
  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
}

