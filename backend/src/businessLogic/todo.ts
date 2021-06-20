
import 'source-map-support/register'

import { getUploadUrl, buildAttachmentUrl } from '../dataLayer/FileRepository'
import { createTodoItem, getTodoItem } from '../dataLayer/DataRepository'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'

const logger = createLogger('BL')

export async function generateUploadUrl(id: string): Promise<string> {
    logger.info('Generating Upload URL for ID: ', id)
    const url = await getUploadUrl(id)
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

export async function setTodoItemAttachment(itemId: string) {
    const item = await getTodoItem(itemId)
    if (!item) {
        return
    }

    if (item.attachmentUrl) {
        return
    }

    const url = buildAttachmentUrl(itemId)
    item.attachmentUrl = url
    logger.info('Setting AttachmentUrl of ', itemId, ': ', url)
    await createTodoItem(item)
}

