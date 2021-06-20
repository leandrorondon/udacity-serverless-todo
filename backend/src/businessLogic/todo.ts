import 'source-map-support/register'

import { getUploadUrl, buildAttachmentUrl, deleteFile } from '../dataLayer/FileRepository'
import { createTodoItem, getTodoItem, getTodosByUser, deleteTodoItem } from '../dataLayer/DataRepository'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'

const logger = createLogger('BL')

export async function generateUploadUrl(todoId: string): Promise<string> {
    logger.info('Generating Upload URL for ID: ', todoId)
    const url = await getUploadUrl(todoId)
    return url
}

export async function createTodo(userId, name, dueDate: string): Promise<TodoItem> {
    const createdAt = new Date().toISOString()
    const done = false
    const todoId = uuid.v4()

    const newItem: TodoItem = {
      userId,
      todoId,
      createdAt,
      name,
      dueDate,
      done
    }
    logger.info('Storing new item: ', newItem)

    await createTodoItem(newItem)

    return newItem
}

export async function setTodoItemAttachment(todoId: string) {
    const item = await getTodoItem(todoId)
    if (!item) {
        return
    }

    if (item.attachmentUrl) {
        return
    }

    const url = buildAttachmentUrl(todoId)
    item.attachmentUrl = url
    logger.info('Setting AttachmentUrl of ', todoId, ': ', url)
    await createTodoItem(item)
}

export async function listTodos(userId: string): Promise<TodoItem[]> {
    return await getTodosByUser(userId)
}

export async function deleteTodo(todoId: string) {
    const item = await getTodoItem(todoId)
    if (!item) {
        return
    }

    if (item.attachmentUrl) {
        await deleteFile(todoId)
    }

    await deleteTodoItem(todoId)
}