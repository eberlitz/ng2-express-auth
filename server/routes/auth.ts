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
// router.post('/auth/facebook', (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     const fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name', 'picture.type(large)'];
//     const accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
//     const graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
//     const params = {
//         code: req.body.code,
//         client_id: req.body.clientId,
//         client_secret: config.FACEBOOK_SECRET,
//         redirect_uri: req.body.redirectUri
//     };

//     // Step 1. Exchange authorization code for access token.
//     request.get({ url: accessTokenUrl, qs: params, json: true }, function (err, response, accessToken) {
//         if (response.statusCode !== 200) {
//             return res.status(500).send({ message: accessToken.error.message });
//         }

//         // Step 2. Retrieve profile information about the current user.
//         request.get({ url: graphApiUrl, qs: accessToken, json: true }, function (err, response, profile) {
//             if (response.statusCode !== 200) {
//                 return res.status(500).send({ message: profile.error.message });
//             }
//             User.findOne({ email: profile.email }, function (err, existingUser) {
//                 if (existingUser && existingUser.provider == 'facebook') {
//                     const token = createJWT(existingUser);
//                     res.send({ token: token });
//                 }
//                 else if (existingUser && existingUser.provider != 'facebook') {
//                     const user = {};
//                     user.provider_id = profile.id;
//                     user.provider = 'facebook';
//                     user.email = profile.email;
//                     user.picture = profile.picture.data.url;
//                     user.displayName = profile.name;
//                     User.findOneAndUpdate({ email: existingUser.email }, user, function (err) {
//                         const token = createJWT(existingUser);
//                         res.send({ token: token });
//                     });
//                 }
//                 else {
//                     const user = new User();
//                     user.provider_id = profile.id;
//                     user.provider = 'facebook';
//                     user.email = profile.email;
//                     user.picture = profile.picture.data.url;
//                     user.displayName = profile.name;
//                     user.save(function (err) {
//                         const token = createJWT(user);
//                         res.send({ token: token });
//                     });
//                 }
//                 // var token = req.header('Authorization').split(' ')[1];
//                 // var payload = jwt.decode(token, config.TOKEN_SECRET);
//             });
//         });
//     });
// });

function createJWT(user: IUserSchema) {
    return jwt.sign({ id: user.id }, config.jwt_secret, { expiresIn: '30m' });
}
