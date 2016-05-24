import slci = require('@sealights/sl-cloud-infra');

export class userServiceProxy {
    private  classLogger:slci.IClassLogger;
    private baseUrl: string;
    constructor(userServiceHost: string, userServicePort: string, private request: any) {
        this.baseUrl = userServiceHost + ':' + userServicePort + '/api/v1/users';
    }

    public saveUser(user: Object, callback: Function) {
        this.request.post({
            url: this.baseUrl,
            json: true,
            body: {
               user: user
            }
        }, function (error, response, userId) {
            if (error)
                return callback(error);

            if (response.statusCode == 200) {
                callback(null, userId);
            }
            else {
                return callback(new Error('HTTP Status Code: ' + response.statusCode));
            }
        });
    };
};