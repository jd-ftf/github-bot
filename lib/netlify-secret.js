const secret = process.env.NETLIFY_WEBHOOK_SECRET || 'hush-hush'
const jwt = require('jsonwebtoken')

/**
 * @ description 基于JWT的验证机制
 * @param req
 * @return {boolean}
 */
exports.isValid = function isValid (req) {
  const signature = req.headers['x-webhook-signature']
  // Can't find signature in Request Header
  if (!signature) return false
  // Use JWT to get signature
  // More see http://www.rfcreader.com/#rfc7519
  try {
    jwt.verify(signature, secret)
    return true
  } catch (e) {
    return false
  }
}
