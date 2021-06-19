
import 'source-map-support/register'

import { getUploadUrl } from '../dataLayer/FileRepository'
import { createLogger } from '../utils/logger'

const logger = createLogger('BL')

export async function generateUploadUrl(id: string): Promise<string> {
    logger.info('Generating Upload URL for ID: ', id)
    const url = await getUploadUrl(id)
    return url
}