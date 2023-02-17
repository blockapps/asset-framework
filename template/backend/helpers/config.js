import fs from "fs";
import yaml from "js-yaml";

// read a yaml or die
function getYamlFile(yamlFilename) {
  return yaml.load(fs.readFileSync(yamlFilename, "utf8"));
}

function yamlSafeDumpSync(object) {
  return yaml.dump(object);
}

function yamlWrite(object, filename) {
  const yaml = yamlSafeDumpSync(object);
  writeFileSync(filename, yaml, "utf8");
}

function writeFileSync(file, data, options) {
  fs.writeFileSync(file, data, options);
}

export { getYamlFile, yamlSafeDumpSync, yamlWrite, writeFileSync };
