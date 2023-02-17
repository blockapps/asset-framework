import RestStatus from 'http-status-codes'
import { rest } from 'blockapps-rest'

class RouteErrorCheck {
  // used to simulate error conditions by the caller
  static checkForError(req, res, next) {
    let error
    if (req.method === 'POST' || req.method === 'PUT') {
      const { body } = req
      error = body.error
    } else {
      const { query } = req
      error = query.error
    }
    if (error) {
      if (error === 400 || error === '400') {
        rest.response.status400(res, 'Error Occurred')
        return next()
      }
      rest.response.status(RestStatus.NOT_FOUND, res, 'Error Occurred')
    }
    return next()
  }
}

export default RouteErrorCheck
