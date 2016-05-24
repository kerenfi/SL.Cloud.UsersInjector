import restify = require('restify');
import slci = require('@sealights/sl-cloud-infra');
import RoutesFactoryModule = require("./lib/routesFactory");
import UsersInjectorDALModule = require('./lib/dbServices/usersInjectorDAL');

var request = require('request');

export class InjectorService {
    private server:restify.Server;

    constructor(private routesFactory:RoutesFactoryModule.routesFactory, private injectorDAL : UsersInjectorDALModule.IDAL, private logger:slci.ILowLevelLogger) {
        this.server = restify.createServer();
        this.server.name = "users injector service";
        this.setupRoutes();

    }

    private setupRoutes() {

        this.server.use(restify.queryParser());
        this.server.use(restify.bodyParser({ mapParams: false }));

        var userInjectorRouter = this.routesFactory.createUsersInjectorRoutes(this.injectorDAL, this.logger);
        this.server.get('/', (req, res, next) => userInjectorRouter.inject(req, res, next));
        this.server.post('/api/v1/tools/injector/user', (req, res, next) => userInjectorRouter.saveUser(req, res, next));
    }

    public start(port:number = 8089) {
        var server = this.server;
        server.listen(port, function () {
            console.log('%s listening at %s', server.name, server.url);
        });
    }

    public stop() {
        this.server.close();
        console.log("server stopped connection");
    }
}