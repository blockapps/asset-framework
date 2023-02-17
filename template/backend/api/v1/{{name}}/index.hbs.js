import express from "express";
import {{name}}Controller from "./{{lower name}}.controller";
import { {{name}} } from "../endpoints";
import authHandler from "../../middleware/authHandler";
import loadDapp from "../../middleware/loadDappHandler";

const router = express.Router();

router.get(
  {{name}}.get,
  authHandler.authorizeRequest(),
  loadDapp,
  {{name}}Controller.get
);

router.get(
  {{name}}.getAll,
  authHandler.authorizeRequest(),
  loadDapp,
  {{name}}Controller.getAll
);

router.post(
  {{name}}.create,
  authHandler.authorizeRequest(),
  loadDapp,
  {{name}}Controller.create
);

router.post(
  {{name}}.transferOwnership,
  authHandler.authorizeRequest(),
  loadDapp,
  {{name}}Controller.transferOwnership
)

router.put(
  {{name}}.update,
  authHandler.authorizeRequest(),
  loadDapp,
  {{name}}Controller.update
)

router.get(
  {{name}}.audit,
  authHandler.authorizeRequest(),
  loadDapp,
  {{name}}Controller.audit
)

export default router;
