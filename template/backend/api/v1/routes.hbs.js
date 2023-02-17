import express from "express"
import dayjs from "dayjs"
import * as packageJson from "../../package.json"
import { deployParamName } from "../../helpers/constants"


{{#each assets}}
import {{lower name}} from './{{name}}'
{{/each}}
import authentication from './authentication'
import users from './users'

import {
  Authentication,
  Users,
  {{#each assets}}
  {{name}},
  {{/each}}
} from './endpoints'

const router = express.Router()

router.use(Authentication.prefix, authentication)
router.use(Users.prefix, users)
{{#each assets}}
router.use({{name}}.prefix, {{lower name}})
{{/each}}


router.get(`/health`, (req, res) => {
  const deployment = req.app.get(deployParamName);
  res.json({
    name: packageJson.name,
    description: packageJson.description,
    version: packageJson.version,
    timestamp: dayjs().unix(),
    deployment
  });
});


export default router;
