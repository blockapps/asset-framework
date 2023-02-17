import { rest } from 'blockapps-rest'
import Joi from '@hapi/joi'
import RestStatus from 'http-status-codes'
import config from '../../../load.config'

const options = { config, cacheNonce: true }

class {{name}}Controller {

  static async get(req, res, next) {
    try {
      const { dapp, params } = req
      const { address, chainId } = params 
     
      let args
      let chainOptions = options
      
      if (address) {
        args = { address }
        if (chainId) {
          chainOptions = { ...options, chainIds: [chainId] }
        }
      }

      const result = await dapp.get{{name}}(args, chainOptions)
      rest.response.status200(res, result)

      return next()
    } catch (e) {
      return next(e)
    }
  }

  static async getAll(req, res, next) {
    try {
      const { dapp, query } = req
      
      const {{lower name}}s = await dapp.get{{name}}s({ ...query })
      rest.response.status200(res, {{lower name}}s)
     
      return next()
    } catch (e) {
      return next(e)
    }
  }

  static async create(req, res, next) {
    try {
      const { dapp, body } = req

      {{name}}Controller.validateCreate{{name}}Args(body)
    
      const result = await dapp.create{{name}}(body)
      rest.response.status200(res, result)
      
      return next()
    } catch (e) {
      return next(e)
    }
  }

  static async update(req, res, next) {
    try {
      const { dapp, body } = req

      {{name}}Controller.validateUpdate{{name}}Args(body)

      const result = await dapp.update{{name}}(body, options)

      rest.response.status200(res, result)
      return next()
    } catch (e) {
      return next(e)
    }
  }

  static async audit(req, res, next) {
    try {
      const { dapp, params } = req
      const { address, chainId } = params 

      const result = await dapp.audit{{name}}( { address, chainId }, options)
      rest.response.status200(res, result)
    } catch (e) {
      return next(e)
    }
  }

  static async transferOwnership(req, res, next) {
    try {
      const { dapp, body } = req

      {{name}}Controller.validateTransferOwnershipArgs(body)
      const result = await dapp.transferOwnership{{name}}(body, options)
      rest.response.status200(res, result)
    } catch (e) {
      return next(e)
    }
  }


  // ----------------------- ARG VALIDATION ------------------------
  
  static validateCreate{{name}}Args(args) {
    const create{{name}}Schema = Joi.object({
      {{lower name}}Args: Joi.object({
        {{#each attributes}}
        {{#ifeq type "text"}}
        {{field}}: Joi.string().required(),
        {{/ifeq}}
        {{#ifeq type "integer"}}
        {{field}}: Joi.number().required(),
        {{/ifeq}}
        {{#ifeq type "datetime"}}
        {{field}}: Joi.number().required(),
        {{/ifeq}}
        {{#ifeq type "boolean"}}
        {{field}}: Joi.boolean().required(),
        {{/ifeq}}
        {{#ifeq type "reference"}}
        {{field}}: Joi.string().required(),
        {{/ifeq}}
        {{#ifeq type "references"}}
        {{field}}: Joi.array().required(),
        {{/ifeq}}
        {{/each}}
      }),
      isPublic: Joi.boolean().required(),
    });

    const validation = create{{name}}Schema.validate(args);

    if (validation.error) {
      throw new rest.RestError(RestStatus.BAD_REQUEST, 'Create {{name}} Argument Validation Error', {
        message: `Missing args or bad format: ${validation.error.message}`,
      })
    }
  }

  static validateUpdate{{name}}Args(args) {
    const update{{name}}Schema = Joi.object({
      address: Joi.string().required(),
      chainId: Joi.string().required(),
      updates: Joi.object({
        {{#each attributes}}
        {{#ifeq type "text"}}
        {{field}}: Joi.string(),
        {{/ifeq}}
        {{#ifeq type "integer"}}
        {{field}}: Joi.number(),
        {{/ifeq}}
        {{#ifeq type "datetime"}}
        {{field}}: Joi.number(),
        {{/ifeq}}
        {{#ifeq type "boolean"}}
        {{field}}: Joi.boolean(),
        {{/ifeq}}
        {{#ifeq type "reference"}}
        {{field}}: Joi.string(),
        {{/ifeq}}
        {{#ifeq type "references"}}
        {{field}}: Joi.array(),
        {{/ifeq}}
        {{/each}}
      }).required(),
    });

    const validation = update{{name}}Schema.validate(args);

    if (validation.error) {
      throw new rest.RestError(RestStatus.BAD_REQUEST, 'Update {{name}} Argument Validation Error', {
        message: `Missing args or bad format: ${validation.error.message}`,
      })
    }
  }

  static validateTransferOwnershipArgs(args) {
    const transferOwnership{{name}}Schema = Joi.object({
      address: Joi.string().required(),
      chainId: Joi.string().required(),
      newOwner: Joi.string().required(),
    })

    const validation = transferOwnership{{name}}Schema.validate(args);

    if (validation.error) {
      throw new rest.RestError(RestStatus.BAD_REQUEST, 'Transfer Ownership {{name}} Argument Validation Error', {
        message: `Missing args or bad format: ${validation.error.message}`,
      })
    }
  }
}

export default {{name}}Controller
