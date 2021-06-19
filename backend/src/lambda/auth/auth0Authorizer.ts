import { APIGatewayTokenAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// to verify JWT token signature.
const jwksUrl = process.env.JWKS_URL

let cache: string
let cacheTime: Date
const cacheExpiryInSeconds = 60

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
    const token = getToken(authHeader)
    const cert = await getCertificate()

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')

    const split = authHeader.split(' ')
    const token = split[1]

    return token
}

async function getCertificate(): Promise<string> {
    const now = new Date();
    if (cache && cacheTime && (now.getTime() - cacheTime.getTime() < cacheExpiryInSeconds))
        return cache

    const resp = await Axios.get(jwksUrl)
    const keys = resp.data.keys

    if (!keys || keys.length == 0) throw new Error('JWKS keys not found')

    const sigKeys = keys.filter(
        key => key.use === 'sig'
            && key.kty === 'RSA'
            && key.alg === 'RS256'
            && (key.x5c && key.x5c.length)
    )

    if (sigKeys.length == 0) throw new Error('Signing keys not found')

    const key = sigKeys[0]
    const pub = key.x5c[0]
    cache = certToPEM(pub)
    cacheTime = new Date()

    return cache
}

function certToPEM(cert: string): string {
    cert = cert.match(/.{1,64}/g).join('\n')
    cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
    return cert
}