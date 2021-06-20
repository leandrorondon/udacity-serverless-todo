import 'source-map-support/register'

import * as AWS from 'aws-sdk'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const bucketName = process.env.S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export async function getUploadUrl(itemId: string): Promise<string> {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: itemId,
        Expires: parseInt(urlExpiration)
    })
}

export async function deleteFile(itemId: string) {
    await s3.deleteObject({
        Bucket: bucketName,
        Key: itemId
    }).promise()
}

export function buildAttachmentUrl(itemId: string): string {
    return `https://${bucketName}.s3.amazonaws.com/${itemId}`
}