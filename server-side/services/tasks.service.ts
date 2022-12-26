import { Client, Request } from '@pepperi-addons/debug-server'
import { PapiClient, InstalledAddon, Relation } from '@pepperi-addons/papi-sdk'
import {v4 as uuid} from 'uuid'

export interface Task{
    Key: string;
    Title: string;
    Description: string;
    EstimatedDuration: number;
    StartDateTime: string;
    EndDateTime: string;
}

export class TasksService {

    MT_TASK_SCHEMA_NAME = 'my tasks'
    papiClient: PapiClient

    constructor(private client: Client) {

        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonUUID: client.AddonUUID,
            actionUUID: client.ActionUUID, 
            addonSecretKey: client.AddonSecretKey
        })
    }

    async createTaskSchema() {

        await this.papiClient.addons.data.schemes.post({
            Name: this.MT_TASK_SCHEMA_NAME,
            Type: 'data',
            Fields: {
                Title: {Type: 'String'},
                Description: {Type: 'String'},
                EstimatedDuration: {Type: 'Integer'},
                StartDateTime: {Type: 'DateTime'},
                EndDateTime: {Type: 'DateTime'},

            }
        })
    }

    async getTasks(query) {
        return this.papiClient.addons.data.uuid(this.client.AddonUUID).table(this.MT_TASK_SCHEMA_NAME)
        .iter(query).toArray();
    }

    async upsertTask(task: Task): Promise<Task>{
        if (!task.Key) {
            task.Key = uuid()
        }

        if (!task.StartDateTime && task.EndDateTime) {
            task.EstimatedDuration = 30
            task.StartDateTime = new Date().toISOString()
            task.EndDateTime = new Date(new Date().getTime() + 30*24*60*60*1000).toISOString()
        }

        if (!task.Title) {
            throw new Error('Title is required')
        }

        return await this.papiClient.addons.data.uuid(this.client.AddonUUID).table(this.MT_TASK_SCHEMA_NAME).upsert(task) as Task;
    }
    
}