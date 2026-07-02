const { app, BrowserWindow, ipcMain, dialog, shell, Menu, MenuItem } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');


// 动态导入 Jimp
let Jimp;
async function loadJimp() {
  if (!Jimp) {
    const module = await import('jimp');
    Jimp = module.Jimp;
  }
  return Jimp;
}
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');



// 判断是否为开发模式
const isDev = process.env.NODE_ENV === 'development';

// 全局主窗口引用
let mainWindow = null;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  // 加载本地构建的HTML文件
  mainWindow.loadFile('dist/index.html');

  // 开发模式下打开开发者工具
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

 

  // 添加右键菜单
  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = new Menu();

    // 只保留关闭功能
    menu.append(new MenuItem({
      label: '关闭/Close',
      click: () => {
        mainWindow.close();
      }
    }));

    menu.popup();
  }); 
}

// 应用就绪后创建窗口
app.whenReady().then(() => {
  createWindow();
  createContextMenu();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      createContextMenu();
    }
  });
});

// 关闭所有窗口时退出应用
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC 通信处理

// 防止重复打开文件选择对话框
let isDialogOpen = false;

// 存储当前语言
let currentLanguage = 'zh';

// 监听语言变化
ipcMain.on('language-changed', (event, lang) => {
  currentLanguage = lang;
});

// 创建右键菜单
function createContextMenu() {
  // 监听右键事件
  ipcMain.on('show-context-menu', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    
    // 根据语言创建菜单
    const template = [
      {
        label: currentLanguage === 'zh' ? '复制' : 'Copy',
        role: 'copy'
      },
      {
        label: currentLanguage === 'zh' ? '粘贴' : 'Paste',
        role: 'paste'
      },
      {
        type: 'separator'
      },
      {
        label: currentLanguage === 'zh' ? '刷新' : 'Refresh',
        role: 'reload'
      }
    ];
    
    const contextMenu = Menu.buildFromTemplate(template);
    contextMenu.popup(win);
  });
}

// 选择文件
ipcMain.handle('selectFiles', async () => {
  if (isDialogOpen) {
    console.log('Dialog is already open, skipping...');
    return [];
  }
  
  isDialogOpen = true;
  console.log('Opening file dialog...');
  console.log('Main window exists:', !!mainWindow);
  
  // 使用主窗口作为父窗口，确保对话框正确关闭
  const browserWindow = mainWindow || BrowserWindow.getFocusedWindow();
  
  try {
    const result = await dialog.showOpenDialog(browserWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'PDF Documents',
          extensions: ['pdf']
        }
      ],
      modal: true
    });

    console.log('Dialog result:', result);
    
    if (result.canceled) {
      console.log('Dialog was canceled');
      return [];
    }
    console.log('Selected files:', result.filePaths);
    return result.filePaths;
  } finally {
    isDialogOpen = false;
  }
});

// 读取 PDF 文件（用于转换）
ipcMain.handle('readPdf', async (event, { filePath }) => {
  try {
    const data = fs.readFileSync(filePath);
    return data.buffer;
  } catch (error) {
    console.error('Failed to read PDF:', error);
    throw error;
  }
});

// 开始转换
ipcMain.handle('convertFile', async (event, { filePath, watermark, dpi = 300, imageDataList, outputFormat = 'pdf' }) => {
  try {
    // 1. 将渲染进程传来的 base64 图片数据保存为临时文件
    const imagePaths = await saveImageDataToFiles(imageDataList);

    // 2. 在图片上添加水印
    const watermarkedImagePaths = await addWatermarkToImages(imagePaths, watermark);

    let outputPath;

    if (outputFormat === 'pdf') {
      // 3. 将图片合成新 PDF
      outputPath = await imagesToPdf(watermarkedImagePaths, filePath, watermark);
    } else {
      // 3. 仅保存图片
      outputPath = await saveImagesOnly(watermarkedImagePaths, filePath);
    }

    // 4. 清理临时文件
    cleanupTempFiles([...imagePaths, ...watermarkedImagePaths]);

    return {
      outputPath,
      pageCount: watermarkedImagePaths.length
    };
  } catch (error) {
    throw error;
  }
});

// 提取PDF页面
ipcMain.handle('extractPages', async (event, { filePath, pageNumbers }) => {
  try {
    console.log('Extracting pages:', pageNumbers, 'from:', filePath);
    
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();
    
    // 验证页码
    const validPages = pageNumbers.filter(num => num >= 1 && num <= totalPages);
    if (validPages.length === 0) {
      throw new Error('No valid pages specified');
    }
    
    // 创建新PDF
    const newPdfDoc = await PDFDocument.create();
    
    // 复制指定页面
    for (const pageNum of validPages) {
      const [page] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
      newPdfDoc.addPage(page);
    }
    
    // 生成输出路径
    const outputDir = path.dirname(filePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    let outputPath = path.join(outputDir, `${fileName}_extracted.pdf`);
    
    // 检查文件是否存在
    let counter = 1;
    while (fs.existsSync(outputPath)) {
      outputPath = path.join(outputDir, `${fileName}_extracted_${counter}.pdf`);
      counter++;
    }
    
    const newPdfBytes = await newPdfDoc.save();
    fs.writeFileSync(outputPath, newPdfBytes);
    
    console.log('Extracted pages saved to:', outputPath);
    return {
      outputPath,
      pageCount: validPages.length
    };
  } catch (error) {
    console.error('Failed to extract pages:', error);
    throw error;
  }
});

// 合并PDF文件
ipcMain.handle('mergePdfs', async (event, { filePaths }) => {
  try {
    console.log('Merging PDFs:', filePaths);
    
    if (filePaths.length < 2) {
      throw new Error('至少需要选择2个PDF文件进行合并');
    }
    
    // 创建新PDF
    const mergedPdf = await PDFDocument.create();
    
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      console.log('Processing file:', filePath);
      
      const pdfBytes = fs.readFileSync(filePath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // 复制所有页面
      const pageCount = pdfDoc.getPageCount();
      const pages = await mergedPdf.copyPages(pdfDoc, Array.from({ length: pageCount }, (_, i) => i));
      pages.forEach(page => mergedPdf.addPage(page));
      
      console.log(`Copied ${pageCount} pages from ${filePath}`);
    }
    
    // 生成输出路径（使用第一个文件的目录）
    const outputDir = path.dirname(filePaths[0]);
    let outputPath = path.join(outputDir, 'merged_output.pdf');
    
    // 检查文件是否存在
    let counter = 1;
    while (fs.existsSync(outputPath)) {
      outputPath = path.join(outputDir, `merged_output_${counter}.pdf`);
      counter++;
    }
    
    const mergedBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, mergedBytes);
    
    console.log('Merged PDF saved to:', outputPath);
    return {
      outputPath,
      fileCount: filePaths.length
    };
  } catch (error) {
    console.error('Failed to merge PDFs:', error);
    throw error;
  }
});

// 获取PDF页数
ipcMain.handle('getPdfPageCount', async (event, { filePath }) => {
  try {
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error('Failed to get page count:', error);
    throw error;
  }
});


// 设置文件路径
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// 获取设置
ipcMain.handle('getSettings', async () => {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      console.log('Read settings:', data);
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Failed to get settings:', error);
    return {};
  }
});

// 保存设置
ipcMain.handle('saveSettings', async (event, settings) => {
  try {
    console.log('Saving settings to:', settingsPath);
    console.log('Settings to save:', settings);
    // 读取现有设置
    let existingSettings = {};
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      existingSettings = JSON.parse(data);
      console.log('Existing settings:', existingSettings);
    }
    // 合并新设置
    const newSettings = { ...existingSettings, ...settings };
    console.log('Merged settings:', newSettings);
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
    console.log('Settings saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
});

// 检查文件是否存在
ipcMain.handle('checkFileExists', async (event, { filePath }) => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
});

// 获取语言设置
ipcMain.handle('getLanguage', async () => {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(data);
      console.log('Read settings:', settings);
      return settings?.language;
    }
    return null;
  } catch (error) {
    console.error('Failed to get language:', error);
    return null;
  }
});

// 保存语言设置
ipcMain.handle('saveLanguage', async (event, { language }) => {
  try {
    // 读取现有设置
    let existingSettings = {};
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      existingSettings = JSON.parse(data);
    }
    // 合并新设置
    const newSettings = { ...existingSettings, language };
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save language:', error);
    return false;
  }
});




// 将渲染进程传来的 base64 图片数据保存为临时文件
async function saveImageDataToFiles(imageDataList) {
  const tempDir = os.tmpdir();
  console.log('Saving image data to files...');
  console.log('Temp directory:', tempDir);

  const imagePaths = [];

  try {
    // 处理所有页面
    const processList = imageDataList;

    for (let i = 0; i < processList.length; i++) {
      const imageData = processList[i];
      const imagePath = path.join(tempDir, `page${i + 1}.png`);

      // 移除 base64 前缀
      const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

      // 解码并保存文件
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(imagePath, buffer);

      imagePaths.push(imagePath);
      console.log('Saved page', i + 1, 'to', imagePath);
    }

    console.log('Generated images:', imagePaths.length);

    if (imagePaths.length === 0) {
      console.error('No images were generated!');
      throw new Error('No images were generated from PDF');
    }

    return imagePaths;
  } catch (error) {
    console.error('Error saving image data:', error);
    console.error('Error stack:', error.stack);
    throw new Error('Failed to save image data: ' + error.message);
  }
}

// 在图片上添加水印（现在在 PDF 层面添加水印，此函数仅复制图片）
async function addWatermarkToImages(imagePaths, watermark) {
  console.log('Step 2: Processing images...');
  const watermarkedImagePaths = [];

  for (const imagePath of imagePaths) {
    const outputPath = imagePath.replace('.png', '_watermarked.png');

    try {
      // 直接复制文件，因为我们现在在 PDF 层面添加水印
      fs.copyFileSync(imagePath, outputPath);
      watermarkedImagePaths.push(outputPath);
    } catch (error) {
      console.error('Failed to process image:', error);
      // 如果处理失败，使用原始图片
      watermarkedImagePaths.push(imagePath);
    }
  }

  console.log('Processed images:', watermarkedImagePaths.length);
  return watermarkedImagePaths;
}

// 将图片合成新 PDF
async function imagesToPdf(imagePaths, originalFilePath, watermark = null) {
  const pdfDoc = await PDFDocument.create();
  
  for (const imagePath of imagePaths) {
    const imageBytes = fs.readFileSync(imagePath);
    const image = await pdfDoc.embedPng(imageBytes);
    const imageDims = image.scale(1);
    
    const page = pdfDoc.addPage([imageDims.width, imageDims.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: imageDims.width,
      height: imageDims.height
    });

    // 在 PDF 页面上添加水印
    if (watermark && watermark.text) {
      const { width, height } = page.getSize();
      
      // 计算水印位置
      let x, y;
      const padding = 50; // 边距
      
      switch (watermark.position) {
        case 'top-left':
          x = padding;
          y = height - padding;
          break;
        case 'top-right':
          x = width - padding;
          y = height - padding;
          break;
        case 'bottom-left':
          x = padding;
          y = padding;
          break;
        case 'bottom-right':
          x = width - padding;
          y = padding;
          break;
        case 'center':
        default:
          x = width / 2;
          y = height / 2;
          break;
      }
      
      // 使用用户指定的字体大小或默认值
      const fontSize = watermark.fontSize || Math.min(width, height) / 10;
      
      // 使用用户指定的角度或默认值
      const angle = watermark.angle || 45;
      
      try {
        // 尝试添加文字水印
        page.drawText(watermark.text, {
          x: x,
          y: y,
          size: fontSize,
          color: rgb(0.5, 0.5, 0.5), // 灰色
          rotate: degrees(angle),
          opacity: watermark.opacity || 0.5,
          center: watermark.position === 'center' // 只有中心位置才使用center选项
        });
      } catch (error) {
        console.error('Error adding watermark:', error);
        // 如果遇到编码错误，使用一个简单的替代方案
        console.log('Using fallback for watermark');
        // 这里我们可以考虑使用其他方法来添加水印，比如创建一个包含文字的图片
        // 但为了简单起见，我们暂时跳过水印添加
      }
    }
  }

  // 保存 PDF（不包含元数据）
  const saveOptions = { embedFonts: false, updateMetadata: false };
  const pdfBytes = await pdfDoc.save(saveOptions);

  // 生成输出路径
  const outputDir = path.dirname(originalFilePath);
  const fileName = path.basename(originalFilePath, path.extname(originalFilePath));
  let outputPath = path.join(outputDir, `${fileName}_image.pdf`);

  // 检查文件是否存在，如果存在则添加序号
  let counter = 1;
  while (fs.existsSync(outputPath)) {
    outputPath = path.join(outputDir, `${fileName}_image_${counter}.pdf`);
    counter++;
  }

  fs.writeFileSync(outputPath, pdfBytes);
  return outputPath;
}

// 仅保存图片
async function saveImagesOnly(imagePaths, originalFilePath) {
  console.log('Step 2: Saving images...');

  // 生成输出目录
  const outputDir = path.dirname(originalFilePath);
  const fileName = path.basename(originalFilePath, path.extname(originalFilePath));
  const imagesDir = path.join(outputDir, `${fileName}_images`);

  console.log('Creating output directory:', imagesDir);

  // 创建输出目录
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('Output directory created');
  }

  console.log(`Saving ${imagePaths.length} images...`);

  // 复制图片到输出目录
  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i];
    const outputPath = path.join(imagesDir, `page_${i + 1}.png`);
    fs.copyFileSync(imagePath, outputPath);
  }

  console.log('Images saved successfully:', imagesDir);
  return imagesDir;
}

// 清理临时文件
function cleanupTempFiles(filePaths) {
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Failed to cleanup temp file:', error);
    }
  }
}
