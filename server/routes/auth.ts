import express = require('express');
import request = require('request');
const router = express.Router();
module.exports = router;

import { config } from '../config';

/*
 |--------------------------------------------------------------------------
 | Login with Google
 |--------------------------------------------------------------------------
 */
router.post('/google', (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    request.post(accessTokenUrl, { body: token_request, headers: { 'Content-type': 'application/x-www-form-urlencoded' } }, function (err, response, token) {
        const accessToken = JSON.parse(token).access_token;
        const headers = { Authorization: 'Bearer ' + accessToken };
        // Step 2. Retrieve profile information about the current user.
        request.get({ url: peopleApiUrl, headers: headers, json: true }, function (err, response, profile) {
            if (profile.error) {
                return res.status(500).send({ message: profile.error.message });
            }
            User.findOne({ email: profile.email }, function (err, existingUser) {
                if (existingUser && existingUser.provider == 'google') {
                    const token = createJWT(existingUser);
                    res.send({ token: token });
                }
                else if (existingUser && existingUser.provider != 'google') {
                    const user = {};
                    user.provider_id = profile.id;
                    user.provider = 'google';
                    user.email = profile.email;
                    user.picture = profile.picture.replace('sz=50', 'sz=200');
                    user.displayName = profile.name;
                    User.findOneAndUpdate({ email: existingUser.email }, user, function (err) {
                        const token = createJWT(existingUser);
                        res.send({ token: token });
                    });
                }
                else {
                    const user = new User();
                    user.provider_id = profile.id;
                    user.provider = 'google';
                    user.email = profile.email;
                    user.picture = profile.picture.replace('sz=50', 'sz=200');
                    user.displayName = profile.name;
                    user.save(function (err) {
                        const token = createJWT(user);
                        res.send({ token: token });
                    });
                }
                // var token = req.header('Authorization').split(' ')[1];
                // var payload = jwt.decode(token, config.TOKEN_SECRET);
            });
        });
    });
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

