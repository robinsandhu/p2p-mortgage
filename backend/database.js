import dotenv from 'dotenv'
dotenv.config()
import mysql from 'mysql2'

export default mysql.createConnection({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});