const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'DOAN-TN', 'Do_An_Fe');
const destDir = path.join(__dirname, 'HocPhan', 'Fe');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (src.endsWith('node_modules') || src.endsWith('.git')) {
      return;
    }
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Đang sao chép mã nguồn từ DOAN-TN/Do_An_Fe sang HocPhan/Fe (bỏ qua node_modules và .git)...');
try {
  copyRecursiveSync(srcDir, destDir);
  console.log('Sao chép thành công!');
} catch (error) {
  console.error('Lỗi khi sao chép:', error);
}
