import 'source-map-support/register'

import * as AWS  from 'aws-sdk'

import { TodoItem } from '../models/TodoItem'

const todosTable = process.env.TODOS_TABLE
const todosByUserIdx = process.env.TODOS_BY_USER_IDX
const docClient = new AWS.DynamoDB.DocumentClient()

export async function createTodoItem(item: TodoItem) {
    await docClient.put({
        TableName: todosTable,
        Item: item
    }).promise()
}

export async function getTodoItem(todoId: string): Promise<TodoItem> {
    const result = await docClient.get({
        TableName: todosTable,
        Key: {
          todoId
        }
      }).promise()

    return result.Item as TodoItem
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

export async function deleteTodoItem(todoId: string) {
    await docClient.delete({
        TableName: todosTable,
        Key: {
          todoId
        }
    }).promise()
}

export async function updateTodoItem(item: TodoItem) {
    const todoId = item.todoId
    await docClient.update({
        TableName: todosTable,
        Key: {
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