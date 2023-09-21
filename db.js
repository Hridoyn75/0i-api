import mysql from "mysql2";
import dotenv from 'dotenv';
dotenv.config(); // Load variables from .env into process.env


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port : process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database!');
});
export default db;