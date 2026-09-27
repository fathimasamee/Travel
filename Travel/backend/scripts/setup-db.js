const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const net = require('net');
require('dotenv').config();

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const sqliteSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.sqlite.prisma');

async function checkPostgres(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || '';
  console.log('--- TravelSphere Database Setup ---');
  console.log('Current DATABASE_URL:', dbUrl.replace(/:[^:]*@/, ':****@'));

  let useSqlite = false;

  if (dbUrl.startsWith('file:') || dbUrl.includes('.db')) {
    useSqlite = true;
  } else if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    try {
      // Parse host and port
      const url = new URL(dbUrl);
      const host = url.hostname || 'localhost';
      const port = parseInt(url.port || '5432', 10);
      console.log(`Checking connection to PostgreSQL at ${host}:${port}...`);
      const isReachable = await checkPostgres(host, port);
      if (!isReachable) {
        console.log(`⚠️ PostgreSQL server at ${host}:${port} is not reachable.`);
        console.log('Switching to local SQLite for seamless zero-config local run...');
        useSqlite = true;
      } else {
        console.log(`✅ Connected to PostgreSQL at ${host}:${port}!`);
      }
    } catch (err) {
      console.log('Could not parse PostgreSQL URL, checking reachable host failed:', err.message);
      useSqlite = true;
    }
  } else {
    useSqlite = true;
  }

  if (useSqlite) {
    console.log('Configuring Prisma for SQLite (local development)...');
    fs.copyFileSync(sqliteSchemaPath, schemaPath);
    process.env.DATABASE_URL = 'file:./dev.db';
    
    // update or set in .env
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('DATABASE_URL=')) {
        envContent = envContent.replace(/DATABASE_URL=.*/g, 'DATABASE_URL="file:./dev.db"');
      } else {
        envContent += '\nDATABASE_URL="file:./dev.db"\n';
      }
    } else {
      envContent = 'DATABASE_URL="file:./dev.db"\nPORT=5000\nNODE_ENV=development\n';
    }
    fs.writeFileSync(envPath, envContent);
  }

  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  console.log('Pushing database schema...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  console.log('Seeding demo data...');
  execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  console.log('🎉 Database setup and seeding completed successfully!');
}

main().catch((err) => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
