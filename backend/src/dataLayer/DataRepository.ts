import 'source-map-support/register'

import * as AWS  from 'aws-sdk'
import { TodoItem } from '../models/TodoItem'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const todosByUserIdx = process.env.TODOS_BY_USER_IDX
const todosIdx = process.env.TODO_IDX

export async function createTodoItem(item: TodoItem) {
    await docClient.put({
        TableName: todosTable,
        Item: item
    }).promise()
}

export async function getTodoItem(userId, todoId: string): Promise<TodoItem> {
    const result = await docClient.get({
        TableName: todosTable,
        Key: {
            userId, 
            todoId
        }
      }).promise()

    return result.Item as TodoItem
}

export async function getTodoItemById(todoId: string): Promise<TodoItem> {
    const result = await docClient.query({
        TableName: todosTable,
        IndexName: todosIdx,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
            ':todoId': todoId
          }
      }).promise()
    
    return result.Items[0] as TodoItem
}

export async function getTodosByUser(userId: string): Promise<TodoItem[]> {
    const result = await docClient.query({
        TableName: todosTable,
        IndexName: todosByUserIdx,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
    }).promise()

    return result.Items as TodoItem[]
}

export async function deleteTodoItem(userId, todoId: string) {
    await docClient.delete({
        TableName: todosTable,
        Key: {
          userId,
          todoId
        }
    }).promise()
}

export async function updateTodoItem(item: TodoItem) {
    const todoId = item.todoId
    const userId = item.userId
    await docClient.update({
        TableName: todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          "#name": "name"
        },
        ExpressionAttributeValues: {
          ":name": item.name,
          ":dueDate": item.dueDate,
          ":done": item.done
        }
      }).promise()
}