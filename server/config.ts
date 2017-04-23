export const config = {
    jwt_secret: process.env.JWT_SECRET,
    GOOGLE: {
        SECRET: process.env.GOOGLE_SECRET
    },
    db: {
        connection: process.env.DATABASE
    }
};
