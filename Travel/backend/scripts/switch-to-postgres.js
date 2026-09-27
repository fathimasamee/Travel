const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const postgresTemplate = path.join(__dirname, '..', 'prisma', 'schema.postgres.prisma');
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

// If schema.postgres.prisma doesn't exist, we save current or create it
if (fs.existsSync(schemaPath)) {
  const content = fs.readFileSync(schemaPath, 'utf8');
  const pgContent = content.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, pgContent);
  console.log('✅ Updated prisma/schema.prisma datasource provider to "postgresql"');
  console.log('Generating Prisma Client for PostgreSQL...');
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
}
