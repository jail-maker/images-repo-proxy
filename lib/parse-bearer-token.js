'use strict';


module.exports = auth => {

    if(auth) {

        let parts = auth.split(' ');

        if (parts.length === 2) {

            const scheme = parts[0];
            const token = parts[1];

            if (/^Bearer$/i.test(scheme)) {

                return token;

            }

        }

    }

}

