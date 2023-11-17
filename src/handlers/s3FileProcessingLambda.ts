import { DynamoDBDocumentClient, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
let dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const  client = DynamoDBDocumentClient.from(dynamoDBClient);

export const handler = async (event: any, context: any) => {
    console.log('event---->', event);
    try {
        for (const record of event.Records) {
            if (record.eventName === 'ObjectCreated:Put') {
                const fileName: any = record.s3.object.key;
                await uploadFileEntry(fileName);
            } else if (record.eventName === 'ObjectRemoved:Delete') {
                const fileName: any = record.s3.object.key;
                await updateFileEntry(fileName);
            }
        }
    } catch (error) {
        console.log('error---->', error);
    }
   
};

async function uploadFileEntry(fileName: any) {
    try {
        const params: any = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: {
                FileName: fileName,
                createdAt: Date.now(),
                deletedAt:  null
            },
        };
        console.log('params--->', params);
        await client.send(new PutCommand(params));
        console.log('File Uploaded Successfully.');
    } catch (error: any) {
        console.log('error--->', error);
    }
}

async function updateFileEntry(fileName: any) {
    try {
        const updateExpression: string = 'SET deletedAt = :deletedAt';
        const expressionAttributeValues: any = { ':deletedAt': Date.now() };
    
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: { FileName: fileName },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
        };
        console.log('params--->', params);
        await client.send(new UpdateCommand(params));
        console.log('File Deleted Successfully.');
    } catch (error: any) {
        console.log('error--->', error);
    }
}
