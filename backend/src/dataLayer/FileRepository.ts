import 'source-map-support/register'

import * as AWS from 'aws-sdk'

const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

const bucketName = process.env.S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export async function getUploadUrl(itemId: string): Promise<string> {
    console.log("expiration:", urlExpiration)
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: itemId,
        Expires: parseInt(urlExpiration)
    })
}