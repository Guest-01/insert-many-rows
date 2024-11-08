// imports
const { stdin: input } = require('node:process');
const readline = require('node:readline');
const { PrismaClient } = require('@prisma/client');

// ORM client
const prisma = new PrismaClient()

// total rows inserted
let total = 0;

// main
async function main() {
  const _totalRemoved = await prisma.alertORM.deleteMany();
  console.log(`${_totalRemoved.count} 개의 이전 레코드를 지웠습니다.`);

  const rl = readline.createInterface({ input });

  rl.on('line', async (line) => {
    const json = JSON.parse(line);
    total++;
    await prisma.alertORM.create({ data: json });
  })

  return new Promise((resolve) => rl.on('close', () => resolve()));
}

// run main
main()
  .then(async () => {
    console.log(`새로 INSERT한 레코드 개수: ${total}`);
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
