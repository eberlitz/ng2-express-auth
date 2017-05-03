export const config = {
    jwt_secret: process.env.JWT_SECRET,
    GOOGLE: {
        SECRET: process.env.GOOGLE_SECRET
    },
    FACEBOOK: {
        SECRET: process.env.FACEBOOK_SECRET
    },
    db: {
        connection: process.env.DATABASE
    }
};
