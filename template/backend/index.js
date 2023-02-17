import express from "express";
import helmet from "helmet";
import bodyParser from "body-parser";
import expressWinston from "express-winston";
import winston from "winston";
import constants from "./helpers/constants";
import routes from "./api/v1/routes";
import cors from "cors";
import cookieParser from 'cookie-parser'
import { fsUtil } from "blockapps-rest";
import ErrorHandlers from './api/middleware/errorHandler';
import config from "./load.config";
import authHandler from './api/middleware/authHandler'
import swaggerUi from "swagger-ui-express";
import swaggerSpecs from "./swaggerspecs";

const app = express();

const { baseUrl, deployParamName } = constants;

// Load deploy file
const deploy = fsUtil.getYaml(`${config.configDirPath}/${config.deployFilename}`);
if (!deploy) {
  throw new Error(`Deploy file '${config.configDirPath}/${config.deployFilename}' not found`);
}

app.set(deployParamName, deploy);

// Setup middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser())

// Setup logging
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    meta: true,
    expressFormat: true
  })
);

app.oauth = authHandler.initOauth()

// Setup routes
app.use(`${baseUrl}`, routes);

app.use(ErrorHandlers.clientErrorHandler);
app.use(ErrorHandlers.commonErrorHandler);

// Start the server
const port = process.env.PORT || 3030;
const server = app.listen(port, () => console.log(`Listening on ${port}`));

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs)
);

export default server;
