export const Authentication = {
  prefix: '/authentication',
  callback: '/callback',
  logout: '/logout',
}

export const Users = {
  prefix: '/users',
  me: '/me',
  get: '/:address',
  getAll: '',
}


{{#each assets}}
export const {{name}} = {
  prefix: '/{{lower name}}',
  get: '/:address/:chainId/',
  getAll: '/',
  create: '/',
  update: '/update',
  audit: '/:address/:chainId/audit',
  transferOwnership: '/transferOwnership',
}
{{/each}}