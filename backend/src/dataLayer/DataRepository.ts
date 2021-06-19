import 'source-map-support/register'

import * as AWS  from 'aws-sdk'

import { TodoItem } from '../models/TodoItem'

const todosTable = process.env.TODOS_TABLE
const docClient = new AWS.DynamoDB.DocumentClient()

export async function createTodoItem(item: TodoItem) {
    await docClient.put({
        TableName: todosTable,
        Item: item
    }).promise()
}