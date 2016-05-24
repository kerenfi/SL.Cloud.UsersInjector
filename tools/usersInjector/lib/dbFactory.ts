import mongoose = require("mongoose");
import slci = require('@sealights/sl-cloud-infra');

export class DbFactory {
    private classLogger: slci.ClassLogger;

    constructor(private host: string, private port: number, private dbName: string, private logger: slci.ILowLevelLogger) {
        this.classLogger = logger.createClassLogger("DbFactory");
        if (!mongoose.connection.readyState) {
            var options = {
                server: {
                    socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 }
                    //server: {poolSize: 25 }
                }
            };

            var connectionString = <string>'mongodb://' + this.host + ':' + this.port + '/' + this.dbName;
            mongoose.connect(connectionString, options, (err) => {
                if (err)
                    this.classLogger.error("mongoose failed onConnect", "mongoose failed to connect");
                else
                    this.classLogger.info("mongoose onConnect", "sucessfully connected to: " + connectionString);
            });
     
            // When successfully connected
            mongoose.connection.on('connected', () => {
                this.classLogger.info('mongoose.connected', 'Mongoose connection connected to ' + dbName);
            });

            // If the connection throws an error
            mongoose.connection.on('error', (err) => {
                this.classLogger.error('mongoose.error', 'Mongoose connection error: ' + err);

            });

            // When the connection is disconnected
            mongoose.connection.on('disconnected', () => {
                this.classLogger.warn('mongoose.disconnected', 'Mongoose connection disconnected');
            });

            // When the connection is reconnected
            mongoose.connection.on('reconnected', () => {
                this.classLogger.warn('mongoose.reconnected', 'MongoDB connection reconnected!');
            });
        }
    }
}
