import { fsUtil } from "blockapps-rest";

let config;

if (!config) {
  config = fsUtil.getYaml(
    process.env.CONFIG
      ? `config/${process.env.CONFIG}.config.yaml`
        : `${process.env.CONFIG_DIR_PATH || '.'}/config.yaml`,
  );
}

export default config;
