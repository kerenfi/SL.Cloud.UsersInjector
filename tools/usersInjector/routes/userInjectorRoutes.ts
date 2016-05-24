import restify = require('restify');
import slci = require('@sealights/sl-cloud-infra');
import {ClassLogger} from "@sealights/sl-cloud-infra";
import UsersInjectorDALModule = require('../lib/dbServices/usersInjectorDAL');
var fs = require('fs');
var path = require('path');

var bcrypt = require('bcrypt-nodejs');


export class UserInjectorRouter {
    private  classLogger:slci.IClassLogger;

    constructor(private injectorDAL: UsersInjectorDALModule.IDAL, Logger: slci.ILowLevelLogger) {
        this.classLogger = Logger.createClassLogger("UserInjectorRouter");
    }

    public saveUser(req:restify.Request, res:restify.Response, next:restify.Next) {
        var requestBody = req.body;


        if (!requestBody) {
            res.send(400, "expected req.body");
            return next();
        }
        var userName = requestBody.userName.toLowerCase();
        var customerId = requestBody.customerId.toLowerCase();
        var email = requestBody.email.toLowerCase();
        var password = customerId.toLowerCase() + "2016";

        if (!userName || userName.trim() == "") {
            res.send(400, "expected userName");
            return next();
        }

        if (!customerId || customerId.trim() == "") {
            res.send(400, "expected customerId");
            return next();
        }

        if (!email || email.trim() == "") {
            res.send(400, "expected email");
            return next();
        }

        if (!password || password.trim() == "") {
            res.send(400, "expected password");
            return next();
        }

        var user = {
            userName: userName,
            customerId: customerId,
            email: email,
            password: password
        };

        password = this.encryptPassword(user["password"]);

        this.injectorDAL.saveUser(userName, customerId, email, password, (err: Error, userId: string) => {
            if (err) {
                this.classLogger.error("saveUser", "error in saveUser: " + JSON.stringify(err, null, '\t'));
                res.send(500, err);
                return next();
            }

            else {
                this.classLogger.info("saveUser", "user was added successfully");
                delete user["password"];
                res.send(200, user);
            }
        });
    };

    public inject(req, res, next) {
        var pagePath = path.join('tools','usersInjector','views','index.html');
        fs.readFile(pagePath, function (err, data) {
            if (err) {
                next(err);
                return;
            }
            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(data);
            next();
        });
    }

    private encryptPassword(password) {
        return bcrypt.hashSync(password);
    };
}