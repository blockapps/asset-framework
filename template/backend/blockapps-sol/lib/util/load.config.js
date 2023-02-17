import { fsUtil } from "blockapps-rest";

let config;

if (!config) {
  config = fsUtil.getYaml(
    `config/${
      process.env.CONFIG ? process.env.CONFIG : "mercata"
    }.config.yaml`
  );
}

export default config;
