import users = require('./models/usersModel');

export var usersSchema = new users.SchemaBuilder().createSchema();
