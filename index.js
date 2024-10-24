const NUMBER_OF_ROWS = 2000;

const { spawn } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

async function main() {
  const _totalRemoved = await prisma.alert.deleteMany();

  console.time('출력 시간')
  const bin = spawn('./dummysensor/bin/dummysensor', [NUMBER_OF_ROWS]);

  bin.stdout.on('data', processStdout);

  bin.on('close', (code) => {
    console.timeLog('출력 시간', `동안 출력한 JSON: ${NUMBER_OF_ROWS}개`)
    console.log(`binary exited with code ${code}`)
  });
}

async function processStdout(data) {
  const jsons = data.toString().split('\n').filter(isJSON).map(str => JSON.parse(str));
  const totalInserted = await prisma.alert.createMany({
    data: jsons,
    skipDuplicates: true
  });

  console.log("inserted:", totalInserted);
}

function isJSON(str) {
  try {
    var o = JSON.parse(str);

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns null, and typeof null === "object", 
    // so we must check for that, too. Thankfully, null is falsey, so this suffices:
    if (o && typeof o === "object") {
      return true;
    }
  }
  catch (e) { }

  return false;
};

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
