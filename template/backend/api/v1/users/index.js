import express from "express";
import UsersController from "./users.controller";
import { Users } from "../endpoints";
import authHandler from "../../middleware/authHandler";
import loadDapp from "../../middleware/loadDappHandler";

const router = express.Router();

router.get(
  Users.me,
  authHandler.authorizeRequest(),
  loadDapp,
  UsersController.me
);

router.get(
  Users.get,
  authHandler.authorizeRequest(), 
  loadDapp, 
  UsersController.get
);

router.get(
  Users.getAll,
  authHandler.authorizeRequest(), 
  loadDapp, 
  UsersController.getAll
);

export default router;
