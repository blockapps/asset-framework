/** Factory creation for {{name}} arguments. */
const factory = {
    /** Sample arguments for creating a {{name}} contract. Use util.uid() to generate a uid. */
    get{{name}}Args(uid) {
        const args = {
            appChainId: `${uid}`,
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
        };
        return args;
    },
};

export default factory;
