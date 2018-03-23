#!/usr/bin/env node

'use strict';

const config = require('./lib/Config');
const Koa = require('koa');
const Proxy = require('koa-proxy');

let app = new Koa();

app.use(async ctx => {

    // check token here

});

app.use(Proxy({
    host: config.host + ':' + config.port,
    map: {

        // redirect here
    
    
    }
}));

app.listen(config.port);
