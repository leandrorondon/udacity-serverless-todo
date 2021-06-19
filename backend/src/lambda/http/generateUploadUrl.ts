import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'


const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const url = getUploadUrl(todoId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      url
    })
  }
}

function getUploadUrl(itemId: string): string {
  console.log("expiration:", urlExpiration)
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: itemId,
    Expires: parseInt(urlExpiration)
  })
}