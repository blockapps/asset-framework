
export const {{lower name}}Args = (uid) => {
  const args = {
    {{lower name}}Args: {
      {{#each attributes}}
        {{#ifeq type "text"}}
        {{field}}: `{{field}}_${uid}`,
        {{/ifeq}}
        {{#ifeq type "integer"}}
        {{field}}: uid,
        {{/ifeq}}
        {{#ifeq type "datetime"}}
        {{field}}: uid,
        {{/ifeq}}
        {{#ifeq type "boolean"}}
        {{field}}: true,
        {{/ifeq}}
        {{#ifeq type "reference"}}
        {{field}}: `${uid + 2}`.padStart(40, '0'),  // chainID
        {{/ifeq}}
        {{#ifeq type "references"}}
        {{field}}: [`${uid + 3}`.padStart(40, '0'), `${uid + 5}`.padStart(40, '0'), `${uid + 7}`.padStart(40, '0')],  // chain ids
        {{/ifeq}}
      {{/each}}
    },
    isPublic: false
  }

  return args
}

export const update{{name}}Args = (address, chainId, uid) => {
  const args = {
    address,
    chainId,
    updates: {
      {{#each attributes}}
        {{#ifeq type "text"}}
        {{field}}: `{{field}}_${uid}`,
        {{/ifeq}}
        {{#ifeq type "integer"}}
        {{field}}: uid,
        {{/ifeq}}
        {{#ifeq type "datetime"}}
        {{field}}: uid,
        {{/ifeq}}
        {{#ifeq type "boolean"}}
        {{field}}: true,
        {{/ifeq}}
        {{#ifeq type "reference"}}
        {{field}}: `${uid + 2}`.padStart(40, '0'),  // chainID
        {{/ifeq}}
        {{#ifeq type "references"}}
        {{field}}: [`${uid + 3}`.padStart(40, '0'), `${uid + 5}`.padStart(40, '0'), `${uid + 7}`.padStart(40, '0')],  // chain ids
        {{/ifeq}}
      {{/each}}
    }
  }

  return args
}