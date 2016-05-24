import UsersInjectorRoutesModule = require('../routes/userInjectorRoutes');
import UsersInjectorDALModule = require('../lib/dbServices/usersInjectorDAL');
import slci = require('@sealights/sl-cloud-infra');

export class routesFactory {
    public createUsersInjectorRoutes(injectorDAL: UsersInjectorDALModule.IDAL, logger: slci.ILowLevelLogger) : UsersInjectorRoutesModule.UserInjectorRouter {
        return new UsersInjectorRoutesModule.UserInjectorRouter(injectorDAL, logger);
    }
}