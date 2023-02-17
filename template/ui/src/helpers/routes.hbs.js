// eslint-disable-next-line import/no-anonymous-default-export
export default {
  {{#each assets}}
  '{{name}}s': { label: "{{name}}", url: "/{{lower name}}s" },
  '{{name}}Detail': { label: "{{name}} Detail", url: "/{{lower name}}s/:id" },
  {{/each}}
};
