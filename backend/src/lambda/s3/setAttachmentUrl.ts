import 'source-map-support/register'

import { S3Event, S3Handler } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { setTodoItemAttachment } from '../../businessLogic/todo'

const logger = createLogger('SetAtt')

export const handler: S3Handler = async (event: S3Event) => {
  logger.info('Caller event', event)
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  await setTodoItemAttachment(key)
}
