import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "../api";
import config from "../config";
import morgan from "morgan";
import { Container } from "typedi";

export default ({ app }: { app: express.Application }) => {
  /**
   * Health Check endpoints
   * @TODO Explain why they are here
   */
  app.get("/status", (req, res) => {
    res.status(200).end("OK");
  });
  app.head("/status", (req, res) => {
    res.status(200).end();
  });

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable("trust proxy");

  // logs the incoming requests
  app.use(morgan("dev"));

  // serve static files under the directory public
  app.use(express.static("public"));

  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // Some sauce that always add since 2014
  // "Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it."
  // Maybe not needed anymore ?
  app.use(require("method-override")());

  // Middleware that transforms the raw string of req.body into json
  app.use(bodyParser.json());

  // inject chainId and models to req
  app.use('/', (req, res, next) => {
    const url: string = req.url;
    const network = url.split('/')[1];

    if(!(network in config.NetworkMap)) {
      const err = new Error("Network not valid");
      err["status"] = 404;
      next(err);
    }

    req.constants = Container.get("constantLoader")[network];
    req.models = Container.get('connections')[network];
    // rewrite url to actual process function
    req.url = url.replace(`/${network}`, '');
    next();
  })

  // Load API routes
  app.use(config.api.prefix, routes());

  /// catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err["status"] = 404;
    next(err);
  });

  /// error handlers
  app.use((err, req, res, next) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (err.name === "UnauthorizedError") {
      return res.status(err.status).send({ message: err.message }).end();
    }
    return next(err);
  });
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
      },
    });
  });
};
