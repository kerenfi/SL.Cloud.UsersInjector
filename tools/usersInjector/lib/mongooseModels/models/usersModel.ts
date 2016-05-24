import mongoose = require('mongoose');

export interface IUser extends mongoose.Document {
    customerId: string;
    userName: string;
    email: string;
    password: string;
}

export class SchemaBuilder {
    createSchema() {
        var userSchema = new mongoose.Schema({
            customerId: { type: String},
            userName: { type: String },
            email: { type: String, index: true },
            password: { type: String, index: true },
        });
        
        //Optimized for quick lookups
        userSchema.index({ email: 1, password: 1}, { unique: true });

        return mongoose.model<IUser>("users", userSchema);
    }
}