const fs = require('fs');
const path = require('path');

function fixParamsInFile(filePath) {
  console.log(`🔄 Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Заменяем { params }: { params: { id: string } } 
  // на { params }: { params: Promise<{ id: string }> }
  content = content.replace(
    /{ params }: { params: { id: string } }/g,
    '{ params }: { params: Promise<{ id: string }> }'
  );
  
  // Заменяем const { id } = params; 
  // на const { id } = await params;
  content = content.replace(
    /const { id } = params;/g,
    'const { id } = await params;'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filePath}`);
}

// Находим все route.ts с [id]
function findRouteFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    console.log(`❌ Directory not found: ${dir}`);
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (item === '[id]') {
          const routeFile = path.join(fullPath, 'route.ts');
          if (fs.existsSync(routeFile)) {
            files.push(routeFile);
          }
        } else {
          files.push(...findRouteFiles(fullPath));
        }
      }
    } catch (err) {
      console.log(`⚠️ Skip: ${fullPath}`);
    }
  }
  
  return files;
}

console.log('🔍 Searching for route files with [id]...');
const routeFiles = findRouteFiles('apps/web/app/api');

if (routeFiles.length === 0) {
  console.log('❌ No route files with [id] found!');
  console.log('📁 Checking if directory exists: apps/web/app/api');
  const exists = fs.existsSync('apps/web/app/api');
  console.log(`Directory exists: ${exists}`);
  if (exists) {
    const items = fs.readdirSync('apps/web/app/api');
    console.log('📁 Contents:', items);
  }
  process.exit(1);
}

console.log(`📁 Found ${routeFiles.length} files:`);
routeFiles.forEach(f => console.log(`  - ${f}`));

console.log('\n🔄 Starting fixes...\n');

for (const file of routeFiles) {
  try {
    fixParamsInFile(file);
  } catch (err) {
    console.log(`❌ Error fixing ${file}:`, err.message);
  }
}

console.log('\n✅ All files processed!');
console.log('📝 Now run:');
console.log('  git add .');
console.log('  git commit -m "fix: update params for Next.js 16"');
console.log('  git push origin main');