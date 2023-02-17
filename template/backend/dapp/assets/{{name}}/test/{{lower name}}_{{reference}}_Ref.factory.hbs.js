/** 
 * Factory creation for {{name}}_{{reference}}_Ref arguments. 
 * NB Does not create an instance of {{name}} or an {{lower reference}}
 */
 const factory = {
    /** Sample arguments for creating a {{name}}_{{reference}}_Ref contract. Use util.uid() to generate a uid. */
    get{{name}}_{{reference}}_RefArgs(uid) {
        const args = {
            {{lower reference}}ChainId: `{{lower reference}}ChainId_${uid}`,
        };
        return args;
    },
};

export default factory;
