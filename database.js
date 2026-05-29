import Database from 'better-sqlite3';

const db = new Database('database.db');

db.exec(`
 
CREATE TABLE IF NOT EXISTS users (

telegram_id TEXT PRIMARY KEY,

nickname TEXT,

updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bets ( 
    
 id INTEGER PRIMARY KEY AUTOINCREMENT,  
    
round_id TEXT, 
     
telegram_id TEXT, 
     
nickname TEXT, 
     
bet_content TEXT,
      
amount REAL,
      
currency TEXT,
      
created_at DATETIME DEFAULT CURRENT_TIMESTAMP 
);  

CREATE TABLE IF NOT EXISTS results (

id INTEGER PRIMARY KEY AUTOINCREMENT,

round_id TEXT,
      
telegram_id TEXT,
      
nickname TEXT,
      
payout REAL,
      
net_profit REAL,
      
currency TEXT,
      
created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);

`);

export default db;