import express = require('express');
import request = require('request-promise');
import bluebird = require('bluebird');
const jwt = require('jsonwebtoken');

const router = express.Router();
module.exports = router;

import { config } from '../config';
import { User, IUserSchema } from '../model/user';
/*
 |--------------------------------------------------------------------------
 | Login with Google
 |--------------------------------------------------------------------------
 */
router.post('/google', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const accessTokenUrl = 'https://www.googleapis.com/oauth2/v4/token';
        const peopleApiUrl = 'https://www.googleapis.com/oauth2/v2/userinfo?fields=email%2Cfamily_name%2Cgender%2Cgiven_name%2Chd%2Cid%2Clink%2Clocale%2Cname%2Cpicture%2Cverified_email';
        const params = {
            code: req.body.code,
            client_id: req.body.clientId,
            client_secret: config.GOOGLE.SECRET,
            redirect_uri: req.body.redirectUri,
            grant_type: 'authorization_code'
        };
        const token_request = 'code=' + req.body.code +
            '&client_id=' + req.body.clientId +
            '&client_secret=' + config.GOOGLE.SECRET +
            '&redirect_uri=' + req.body.redirectUri +
            '&grant_type=authorization_code';
        const request_length = token_request.length;
        // Step 1. Exchange authorization code for access token.
        const tokenResponse = await request.post(accessTokenUrl, {
            body: token_request,
            headers: { 'Content-type': 'application/x-www-form-urlencoded' }
        });
        const accessToken = JSON.parse(tokenResponse).access_token;
        const headers = { Authorization: 'Bearer ' + accessToken };
        // Step 2. Retrieve profile information about the current user.
        const profile = await request.get({ url: peopleApiUrl, headers: headers, json: true });
        if (profile.error) {
            return res.status(500).send({ message: profile.error.message });
        }
        let existingUser = await User.findOne({ 'google.id': profile.id });
        if (existingUser) {
            if (!existingUser.google.token) {
                existingUser.google.token = accessToken;
                existingUser.google.name = profile.displayName;
                existingUser.google.email = profile.email;
                await existingUser.save();
            }
        } else {
            existingUser = new User();
            existingUser.google = {
                id: profile.id,
                email: profile.email,
                name: profile.name,
                token: accessToken
            };
            await existingUser.save();
        }
        const token = createJWT(existingUser);
        res.send({ access_token: token });
    } catch (error) {
        return next(error);
    }
});


/*
 |--------------------------------------------------------------------------
 | Login with Facebook
 |--------------------------------------------------------------------------
 */
router.post('/facebook', async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {
        const fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name', 'picture.type(large)'];
        const accessTokenUrl = 'https://graph.facebook.com/v2,8/oauth/access_token';
        const graphApiUrl = 'https://graph.facebook.com/v2,8/me?fields=' + fields.join(',');
        const params = {
            code: req.body.code,
            client_id: req.body.clientId,
            client_secret: config.FACEBOOK.SECRET,
            redirect_uri: req.body.redirectUri
        };

        // Step 1. Exchange authorization code for access token.
        const accessToken = await request.get({ url: accessTokenUrl, qs: params, json: true });
        // if (response.statusCode !== 200) {
        //     return res.status(500).send({ message: accessToken.error.message });
        // }
        // Step 2. Retrieve profile information about the current user.
        const profile = await request.get({ url: graphApiUrl, qs: accessToken, json: true });
        // if (response.statusCode !== 200) {
        //     return res.status(500).send({ message: profile.error.message });
        // }
        let existingUser = await User.findOne({ 'facebook.id': profile.id });
        if (existingUser) {
            // if (!existingUser.facebook.token) {
            //     existingUser.facebook.token = accessToken;
            //     existingUser.facebook.name = profile.displayName;
            //     existingUser.facebook.email = profile.email;
            //     await existingUser.save();
            // }
        } else {
            existingUser = new User();
            existingUser.facebook = {
                id: profile.id,
                email: profile.email,
                name: profile.name,
                token: accessToken,
                // picture = profile.picture.data.url;
            };
            await existingUser.save();
        }
        const token = createJWT(existingUser);
        res.send({ access_token: token });
    } catch (error) {
        return next(error);
    }
});

function createJWT(user: IUserSchema) {
    return jwt.sign({ id: user.id }, config.jwt_secret, { expiresIn: '30m' });
}
