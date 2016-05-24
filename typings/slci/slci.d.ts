declare module "@sealights/sl-cloud-infra" {
    
    ///////////// Loggers /////////////////
    export interface ILowLevelLogger {
        error(className: string, methodName: string, message: string, obj?: any);
        warn(className: string, methodName: string, message: string, obj?: any);
        info(className: string, methodName: string, message: string, obj?: any);
        debug(className: string, methodName: string, message: string, obj?: any);

        createClassLogger(className: string): IClassLogger;
    }

    export interface IClassLogger {
        error(methodName: string, message: string, obj?: any);
        warn(methodName: string, message: string, obj?: any);
        info(methodName: string, message: string, obj?: any);
        debug(methodName: string, message: string, obj?: any);

        createMethodLogger(className: string): IMethodLogger;
    }

    export interface IMethodLogger {
        error(message: string, obj?: any);
        warn(message: string, obj?: any);
        info(message: string, obj?: any);
        debug(message: string, obj?: any);
    }

    export class Logger implements ILowLevelLogger {
        constructor(uniqueSignature: string, componentName: string);

        error(className: string, methodName: string, message: string, obj?: any);
        warn(className: string, methodName: string, message: string, obj?: any);
        info(className: string, methodName: string, message: string, obj?: any);
        debug(className: string, methodName: string, message: string, obj?: any);

        createClassLogger(className: string): IClassLogger;
    }

    export class ClassLogger implements IClassLogger {
        constructor(lowLoeverLogger: ILowLevelLogger, className: string);
        error(methodName: string, message: string, obj?: any);
        warn(methodName: string, message: string, obj?: any);
        info(methodName: string, message: string, obj?: any);
        debug(methodName: string, message: string, obj?: any);

        createMethodLogger(className: string): IMethodLogger;
    }

    export class MethodLogger implements IMethodLogger {
        constructor(classLogger: IClassLogger, methodName: string);
        error(message: string, obj?: any);
        warn(message: string, obj?: any);
        info(message: string, obj?: any);
        debug(message: string, obj?: any);
    }
    
    ///////////// Storage /////////////////
    
    export interface IStorage {
        putObject(bucket: string, key: string, object: string, callback?: Function);
        getObject(bucket: string, key: string, callback?: (err: any, body: string) => any);
        deleteObject(bucket: string, key: string, callback?: Function);
    }

    export class Storage2 implements IStorage {
        constructor(accessKey: string, secretKey: string, region: string);
        putObject(bucket: string, key: string, object: string, callback?: Function);
        getObject(bucket: string, key: string, callback?: (err: any, body: string) => any);
        deleteObject(bucket: string, key: string, callback?: Function);
    }
    
    ///////////// Message Queue /////////////////
    
    export interface IMessageQueue {
        sendMessage(message: string, options: any, callback?: Function);
        receiveMessage(options: any, callback?: (err: any, body: string, receiptHandle: string) => any);
        deleteMessage(messageHandle: string, callback?: Function);
        isEmpty(callback?: (err: any, isEmpty: boolean) => any);
        getQueueSize(callback?: (err: any, size: number) => any);
        //purgeQueue(callback?: Function);
    }

    export class MessageQueue2 implements IMessageQueue {
        constructor(queueName: string, accessKey: string, secretKey: string, region: string, awsAccount: string);
        sendMessage(message: string, options: any, callback?: Function);
        receiveMessage(options: any, callback?: (err: any, body: string, receiptHandle: string) => any);
        deleteMessage(messageHandle: string, callback?: Function);
        isEmpty(callback?: (err: any, isEmpty: boolean) => any);
        getQueueSize(callback?: (err: any, size: number) => any);
    }

    ///////////// DB Services /////////////////
    export class DbServices{
        constructor(host:string, port: number, dbName: string, logger: ILowLevelLogger);
    }

    export var StopWatch: any;
    export var nullLogger: ILowLevelLogger;

    export var QueueParserLoggerFactory: any;
    export var QueueProcessor: any;
}

