const fs = require('fs');
const path = require('path');

module.exports = async function(context) {
  // 处理语言包
  const localePath = path.join(context.appOutDir, 'locales');
  
  // 检查locales目录是否存在
  if (!fs.existsSync(localePath)) {
    console.log('locales directory not found:', localePath);
  } else {
    // 只保留这两个语言包
    const localesToKeep = ['en-US.pak', 'zh-CN.pak'];
    
    console.log('Cleaning locales directory:', localePath);
    console.log('Will keep only:', localesToKeep);
    
    // 读取目录下的所有文件
    fs.readdirSync(localePath).forEach(file => {
      // 只处理.pak文件，并且不在保留列表中的文件
      if (file.endsWith('.pak') && !localesToKeep.includes(file)) {
        const filePath = path.join(localePath, file);
        try {
          fs.unlinkSync(filePath);
          console.log('Deleted:', file);
        } catch (error) {
          console.error('Error deleting file:', file, error);
        }
      }
    });
  }

  // 清理 Electron Framework 中的多余语言包（只保留中文和英文）
  const appName = context.packager.appInfo.productFilename;
  const electronFrameworkResourcesPath = path.join(
    context.appOutDir,
    `${appName}.app`,
    'Contents',
    'Frameworks',
    'Electron Framework.framework',
    'Versions',
    'A',
    'Resources'
  );

  if (fs.existsSync(electronFrameworkResourcesPath)) {
    const localesToKeep = ['en-US.lproj', 'zh-CN.lproj', 'zh-Hans.lproj', 'zh-Hant.lproj','en_US.lproj', 'zh_CN.lproj', 'zh_Hans.lproj', 'zh_Hant.lproj'];
    
    console.log('\nCleaning Electron Framework resources:', electronFrameworkResourcesPath);
    console.log('Will keep only:', localesToKeep);
    
    fs.readdirSync(electronFrameworkResourcesPath).forEach(file => {
      const filePath = path.join(electronFrameworkResourcesPath, file);
      const stat = fs.statSync(filePath);
      
      // 只删除.lproj目录，且不在保留列表中
      if (stat.isDirectory() && file.endsWith('.lproj') && !localesToKeep.includes(file)) {
        try {
          // 递归删除目录
          deleteFolderRecursive(filePath);
          console.log('Deleted:', file);
        } catch (error) {
          console.error('Error deleting directory:', file, error);
        }
      }
    });
  } else {
    console.log('Electron Framework resources not found:', electronFrameworkResourcesPath);
  }
  
  // 只在Windows构建时删除d3dcompiler_47.dll
  // 通过检查appOutDir路径是否包含win来判断是否为Windows构建
  if (context.appOutDir.includes('win')) {
    const d3dFilePath = path.join(context.appOutDir, 'd3dcompiler_47.dll');
    
    if (fs.existsSync(d3dFilePath)) {
      try {
        fs.unlinkSync(d3dFilePath);
        console.log('Deleted:', 'd3dcompiler_47.dll');
      } catch (error) {
        console.error('Error deleting file:', 'd3dcompiler_47.dll', error);
      }
    } else {
      console.log('d3dcompiler_47.dll not found:', d3dFilePath);
    }
  }
};

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file) {
      const curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}
