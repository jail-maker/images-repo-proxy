#!/usr/bin/env node

'use strict';

const config = require('./lib/Config');
const Koa = require('koa');
const Router = require('koa-better-router');

let app = new Koa();
let route = Router().loadMethods();

// route.get('/auth-token', async ctx => {

//     try {

//         let data = { permissions: ['write'] };
//         let secret = fs.readFileSync(path.resolve(config.privateKeyPath));
//         let params = { algorithm: 'RS512', expiresIn: config.tokenExpiresIn };

//         let token = jwt.sign(data, secret, params);
//         ctx.body = { token: token };

//     } catch (e) {

//         ctx.response.status(500);

//     }

// });

let apiRoute = Router({ prefix: '/api/v1' });
apiRoute.extend(route);

app.use(route.middleware());
app.use(apiRoute.middleware());
app.listen(config.port);
