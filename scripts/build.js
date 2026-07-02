const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const srcDir = path.join(__dirname, '..', 'src');
const nodeModulesDir = path.join(__dirname, '..', 'node_modules');

// 递归删除目录
function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
}

// 复制文件
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

// 复制目录
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

console.log('Building PDF Toolkit...');

// 1. 清空 dist 目录
console.log('Cleaning dist directory...');
removeDir(distDir);
fs.mkdirSync(distDir, { recursive: true });

// 2. 复制 index.html
console.log('Copying index.html...');
copyFile(path.join(srcDir, 'index.html'), path.join(distDir, 'index.html'));

// 3. 复制 CSS 文件
console.log('Copying CSS files...');
copyDir(path.join(srcDir, 'css'), path.join(distDir, 'css'));

// 4. 复制 JS 文件
console.log('Copying JS files...');
fs.mkdirSync(path.join(distDir, 'js'), { recursive: true });
copyDir(path.join(srcDir, 'js'), path.join(distDir, 'js'));


// 5. 复制 node_modules 依赖
console.log('Copying dependencies from node_modules...');

// pdfjs-dist
const pdfjsDistFiles = [
  'pdf.worker.min.mjs',
  'pdf.worker.min.js',
  'pdf.js',
  'pdf.min.js'
];
for (const file of pdfjsDistFiles) {
  const srcPath = path.join(nodeModulesDir, 'pdfjs-dist', 'build', file);
  if (fs.existsSync(srcPath)) {
    copyFile(srcPath, path.join(distDir, 'js', file));
  }
}

// bootstrap
copyFile(
  path.join(nodeModulesDir, 'bootstrap', 'dist', 'css', 'bootstrap.min.css'),
  path.join(distDir, 'css', 'bootstrap.min.css')
);
copyFile(
  path.join(nodeModulesDir, 'bootstrap', 'dist', 'js', 'bootstrap.bundle.min.js'),
  path.join(distDir, 'js', 'bootstrap.bundle.min.js')
);

console.log('Build completed successfully!');
