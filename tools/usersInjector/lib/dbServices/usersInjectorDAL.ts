import mongooseModels = require('../mongooseModels/schema');
import slci = require('@sealights/sl-cloud-infra');
import {ObjectID} from "mongodb";

export interface IDAL {
    saveUser(userName: string, customerId: string,email: string, password: string, callback?: Function) : void
}

export class UsersInjectorServiceDAL implements IDAL {

    private classLogger: slci.ClassLogger;

    constructor(private logger: slci.ILowLevelLogger) {
        this.classLogger = logger.createClassLogger("UsersInjectorServiceDAL");
    }

    public saveUser(userName: string, customerId: string, email: string, password: string, callback?: Function) {
        var query = { userName: userName,customerId: customerId, email: email, password: password };
        mongooseModels.usersSchema.create(query,function(err, object) {
            if (err) {
                return callback(err);
            }

            return callback(null, object._id);
        });
    };
};
    