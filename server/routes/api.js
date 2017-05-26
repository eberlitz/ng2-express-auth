"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
router.get('/', (req, res, next) => {
    res.json({
        message: 'ok',
        user: req.user
    });
});
module.exports = router;
//# sourceMappingURL=api.js.map