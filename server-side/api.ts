import { Client, Request } from '@pepperi-addons/debug-server'
import { PapiClient, InstalledAddon, Relation } from '@pepperi-addons/papi-sdk'
import { TasksService } from './services/tasks.service';

export async function test(client: Client, request: Request) {

    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        actionUUID: client.ActionUUID, 
        addonSecretKey: client.AddonSecretKey
    })
    const accounts = await papiClient.accounts.iter({
        fields: ['Name'],
        include_deleted: true
    }).toArray();

    const relations = await papiClient.addons.data.relations.iter({
        where: `RelationName='UsageMonitor'`
    }).toArray();

    return {
        Hello: 'World Gabi',
        WWW: 'rf',
        NameAllAccounts: accounts,
        Relations: relations
    }
    
};

export async function myTasks(client: Client, request: Request) {
    const taskService = new TasksService(client)

    if (request.method == 'GET') {
        return taskService.getTasks(request.query)
    }

    if (request.method == 'POST') {
        return taskService.upsertTask(request.body)
    }

    throw new Error(`${request.method} not allowed`)
}


