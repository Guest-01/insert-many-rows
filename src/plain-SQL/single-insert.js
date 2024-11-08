// imports
const { stdin: input } = require('node:process');
const readline = require('node:readline');
const { Client } = require('pg');

require('dotenv').config();

// Pg client
const db = new Client({ connectionString: process.env.DATABASE_URL })

// total rows inserted
let total = 0;

// main
async function main() {
  await db.connect();
  await db.query(`CREATE TABLE IF NOT EXISTS "AlertPlainSQL" (
  	"id" SERIAL NOT NULL,
  	"result" VARCHAR(100) NULL DEFAULT NULL,
  	"timestamp" VARCHAR(100) NULL DEFAULT NULL,
  	"inserted_at" TIMESTAMP NULL DEFAULT now(),
  	PRIMARY KEY ("id")
  )`)

  const _totalRemoved = await db.query(`DELETE FROM "AlertPlainSQL"`);
  await db.query(`ALTER SEQUENCE "AlertPlainSQL_id_seq" RESTART WITH 1`);
  console.log(`${_totalRemoved.rowCount} 개의 이전 레코드를 지웠습니다.`);

  const rl = readline.createInterface({ input });

  rl.on('line', async (line) => {
    const json = JSON.parse(line);
    total++;
    await db.query({
      text: `INSERT INTO "AlertPlainSQL"(result, timestamp) VALUES($1, $2)`,
      values: [json.result, json.timestamp]
    });
  })

  return new Promise((resolve) => rl.on('close', () => resolve()));
}

// run main
main()
  .then(async () => {
    console.log(`새로 INSERT하는 레코드 개수: ${total}`);
  })
  .catch(async (e) => {
    console.error(e)
    await db.end();
    process.exit(1)
  })
