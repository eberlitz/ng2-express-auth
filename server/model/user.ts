import mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

export interface IUserSchema extends mongoose.Document {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    local: {
        email: string;
        password: string;
    };
    facebook: {
        id: string;
        token: string;
        email: string;
        name: string;
    };
    twitter: {
        id: string;
        token: string;
        displayName: string;
        username: string;
    };
    google: {
        id: string;
        token: string;
        email: string;
        name: string;
    };
    generateHash(password: string): string;
    validPassword(password: string): boolean;
}

const userSchema = new mongoose.Schema({
    local: {
        email: String,
        password: String
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    }

}, { timestamps: true });

// generating a hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

export const User = mongoose.model<IUserSchema>('User', userSchema);
