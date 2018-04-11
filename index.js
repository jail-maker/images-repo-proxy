#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');

const Koa = require('koa');
const KoaProxy = require('koa-proxy');
const KoaBasicAuth = require('koa-basic-auth');
const KoaConvert = require('koa-convert');
const jwt = require('jsonwebtoken');

const parseToken = require('./lib/parse-bearer-token.js')

let args = yargs
    .option('config', {
        default: 'config.yml',
    })
    .option('port', {
        demandOption: true,
        alias: 'p'
    })
    .option('redirect-socket', {
        demandOption: true,
        alias: 's',
    })
    .option('public-key', {
        demandOption: true,
        alias: 'k',
    })
    .strict(true)
    .wrap(null)
    .config('config', function(configFile) {

        let content = fs.readFileSync(configFile, 'utf-8');
        let obj = yaml.safeLoad(content);

        return obj;

    })
    .version(`0.0.1`)   
    .parse();

let app = new Koa();

let pk = fs.readFileSync(path.resolve(args['public-key']));

let protectedEPs = [

    {method: 'POST', url: '/images/:user/.*'},
    {method: 'POST', url: '/image-importer'},

];

async function isProtected({method: method, url: url}) {

    for(let ep of protectedEPs) {

        if(ep.method == method && ep.url == url) {

            return true;

        }

    }

    return false;

}


// name: user/image
// fullname: http://repo.ru/images/user/image

// import: POST ${fullname}

app.use(async (ctx, next) => {

    let passed = false;

    if(await isProtected({method: ctx.request.method, url: ctx.request.url})) {

        let auth = ctx.request.headers['authorization'];
        let token = await parseToken(auth);

        if(token) {

            try {

                passed = jwt.verify(token, pk);

            } catch(e) {

                if(e.name != 'JsonWebTokenError' && e.name != 'TokenExpiredError')
                    throw e;

            }

        }

    } else {

        passed = true;

    }

    if(passed) {

        await next();

    } else {

        ctx.response.status = 401;
        ctx.response.body = 'authorization required';

    }

});

app.use(KoaConvert(KoaProxy({

    host: `${args['redirect-protocol']}://${args['redirect-socket']}`,
    map: path => { return path; },

})));

app.listen(args['port']);
