require('dotenv').config({ silent: true });

export const config = {
    GOOGLE: {
        SECRET: process.env.GOOGLE_SECRET
    },
    db: {
        connection: process.env.DATABASE
    }
};
