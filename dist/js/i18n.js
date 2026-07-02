// 国际化语言文件
const i18n = {
  zh: {
    appDescription: 'PDF-to-Image-PDF - 开源PDF处理工具：转换、提取、合并一站式解决方案',
    localOnly: '🔒 纯本地运行，不上传PDF到互联网',
    coreFeatures: 'PDF转换成图片/图片PDF',
    extractFeatures: '页面提取',
    mergeFeatures: 'PDF合并',
    feature1: 'PDF转图片',
    feature2: 'PDF转图片版 PDF',
    feature3: '支持批量处理',
    extract1: '提取指定页码',
    extract2: '支持范围选择',
    extract3: '保持原格式',
    merge1: '多文件合并',
    merge2: '调整顺序',
    merge3: '保留书签',
    selectFiles: '1. 选择文件',
    selectFilesBtn: '📁 选择文件',
    noFiles: '未选择文件',
    conversionSettings: '2. 转换设置',
    outputFormat: '输出格式',
    selectOutputFormat: '选择输出格式',
    outputFormatPdf: '生成图片版 PDF',
    outputFormatImages: '仅生成图片',
    watermarkSettings: '水印设置',
    enableWatermark: '启用水印',
    watermarkText: '水印文字',
    watermarkTextPlaceholder: '输入水印文字',
    watermarkTextNote: '注：只支持英文和数字，不支持中文',
    watermarkPosition: '水印位置',
    watermarkFontSize: '字体大小',
    watermarkAngle: '倾斜角度',
    watermarkOpacity: '水印透明度',
    dpiSettings: 'DPI 设置',
    dpi: 'DPI',
    dpi72: '72 (屏幕显示)',
    dpi150: '150 (低质量)',
    dpi300: '300 (标准质量)',
    dpi600: '600 (高质量)',
    dpiNote: 'DPI ( dots per inch ) 是指每英寸的像素点数，影响图片的清晰度和文件大小。DPI 越高，图片质量越好，但文件也越大。',
    startConversion: '🚀 开始转换',
    versionInfo: '版本信息',
    freeVersion: '完全免费',
    contactUs: '📞 贡献与反馈',
    wechat: '欢迎在 GitHub 提交 issue 或 PR',
    close: '关闭',
    copied: '已复制',
    copy: '复制',
    watermarkTextError: '水印文字只能包含英文和数字！',
    unsupportedFileFormat: '不支持的文件格式: ',
    onlyPdfFiles: '\n仅支持 .pdf 文件',
    pdfRenderingFailed: 'PDF 渲染失败: ',
    conversionFailed: '转换失败: ',
    conversionCompleted: '转换完成！',
    filesSavedTo: '文件已保存到: ',
    filesInSameFolder: '\n\n注意：文件与原文件在同一文件夹下',
    selectedFiles: '已选择 ',
    files: ' 个文件',
    startingConversion: '开始转换: ',
    startingProcessing: '开始处理: ',
    renderingPdf: '正在渲染 PDF 页面...',
    renderingCompleted: '渲染完成 ',
    pages: ' 页',
    conversionCompletedFile: '转换完成: ',
    processingCompletedFile: '处理完成: ',
    allFilesConverted: '所有文件转换完成！',
    selectFilesFailed: '选择文件失败: ',
    language: '语言',
    chinese: '中文',
    english: 'English',
    termsNotice: '使用本应用即表示您同意',
    serviceAgreement: '服务协议',
    privacyPolicy: '隐私声明',
    // 新功能标签页
    tabConvert: '📄 PDF转换',
    tabExtract: '📑 提取页面',
    tabMerge: '📚 合并PDF',
    progress: '进度日志',
    // 提取页面功能
    extractPages: '1. 选择PDF文件',
    selectExtractFileBtn: '📁 选择PDF文件',
    noExtractFile: '未选择文件',
    clearFile: '清除',
    pageRange: '2. 设置提取页码',
    pageRangeInput: '输入页码范围',
    pageRangePlaceholder: '例如: 1-5, 8, 10-15',
    pageRangeNote: '支持格式：单个页码(如 5)、连续范围(如 1-5)、多个范围用逗号分隔(如 1-5, 8, 10-15)',
    extractPagesBtn: '📑 提取页面',
    totalPages: '共 ',
    extractSingleFile: '提取页面功能一次只能选择一个PDF文件！',
    invalidPageRange: '无效的页码范围，请检查输入格式！',
    invalidPages: '无效的页码: ',
    validRange: '，有效范围是 ',
    extractingPages: '正在提取页面...',
    extractCompleted: '提取完成！',
    extractFailed: '提取失败: ',
    // 合并PDF功能
    selectMergeFiles: '1. 选择要合并的PDF文件',
    selectMergeFilesBtn: '📁 添加PDF文件',
    clearAllFiles: '清空列表',
    noMergeFiles: '未选择文件',
    mergeOptions: '2. 合并选项',
    retainBookmarks: '保留书签',
    retainMetadata: '保留元数据',
    mergeFilesBtn: '📚 合并PDF',
    mergingFiles: '正在合并文件...',
    mergeCompleted: '合并完成！',
    mergeFailed: '合并失败: ',
    mergedFileCount: '已合并 ',
    totalPageCount: ' 个文件'
  },
  en: {
    appDescription: 'PDF-to-Image-PDF - Open Source PDF Processing: Convert, Extract, and Merge',
    localOnly: '🔒 Runs locally, no PDF upload to internet',
    coreFeatures: 'PDF Convert to Images/Image-based PDF',
    extractFeatures: 'Page Extract',
    mergeFeatures: 'PDF Merge',
    feature1: 'PDF to Images',
    feature2: 'PDF to Image-based PDF',
    feature3: 'Batch Processing',
    extract1: 'Extract specific pages',
    extract2: 'Range selection',
    extract3: 'Keep original format',
    merge1: 'Multiple files merge',
    merge2: 'Adjust order',
    merge3: 'Retain bookmarks',
    selectFiles: '1. Select Files',
    selectFilesBtn: '📁 Select Files',
    noFiles: 'No files selected',
    conversionSettings: '2. Conversion Settings',
    outputFormat: 'Output Format',
    selectOutputFormat: 'Select Output Format',
    outputFormatPdf: 'Generate Image-based PDF',
    outputFormatImages: 'Generate Only Images',
    watermarkSettings: 'Watermark Settings',
    enableWatermark: 'Enable Watermark',
    watermarkText: 'Watermark Text',
    watermarkTextPlaceholder: 'Enter watermark text',
    watermarkTextNote: 'Note: Only English and numbers are supported',
    watermarkPosition: 'Watermark Position',
    watermarkFontSize: 'Font Size',
    watermarkAngle: 'Rotation Angle',
    watermarkOpacity: 'Watermark Opacity',
    dpiSettings: 'DPI Settings',
    dpi: 'DPI',
    dpi72: '72 (Screen Display)',
    dpi150: '150 (Low Quality)',
    dpi300: '300 (Standard Quality)',
    dpi600: '600 (High Quality)',
    dpiNote: 'DPI (dots per inch) refers to the number of pixels per inch, which affects the clarity and file size of the image. The higher the DPI, the better the image quality, but the larger the file size.',
    startConversion: '🚀 Start Conversion',
    conversionProgress: '3. Conversion Progress',
    versionInfo: 'Version Information',
    freeVersion: 'Completely Free',
    contactUs: '📞 Contribute & Feedback',
    wechat: 'Welcome to submit issues or PRs on GitHub',
    close: 'Close',
    copied: 'Copied',
    copy: 'Copy',
    watermarkTextError: 'Watermark text can only contain English and numbers!',
    unsupportedFileFormat: 'Unsupported file format: ', 
    onlyPdfFiles: '\nOnly .pdf files are supported',
    pdfRenderingFailed: 'PDF rendering failed: ',
    conversionFailed: 'Conversion failed: ',
    conversionCompleted: 'Conversion completed!',
    filesSavedTo: 'Files saved to: ',
    filesInSameFolder: '\n\nNote: Files are in the same folder as the original files',
    selectedFiles: 'Selected ',
    files: ' files',
    startingConversion: 'Starting conversion: ',
    startingProcessing: 'Starting processing: ',
    renderingPdf: 'Rendering PDF pages...',
    renderingCompleted: 'Rendering completed ',
    pages: ' pages',
    conversionCompletedFile: 'Conversion completed: ',
    processingCompletedFile: 'Processing completed: ',
    allFilesConverted: 'All files converted!',
    selectFilesFailed: 'Failed to select files: ',
    language: 'Language',
    chinese: '中文',
    english: 'English',
    termsNotice: 'By using this application, you agree to the',
    serviceAgreement: 'Service Agreement',
    privacyPolicy: 'Privacy Policy',
    // New feature tabs
    tabConvert: '📄 PDF Convert',
    tabExtract: '📑 Extract Pages',
    tabMerge: '📚 Merge PDFs',
    progress: 'Progress Log',
    // Extract pages feature
    extractPages: '1. Select PDF File',
    selectExtractFileBtn: '📁 Select PDF File',
    noExtractFile: 'No file selected',
    clearFile: 'Clear',
    pageRange: '2. Set Page Range',
    pageRangeInput: 'Enter page range',
    pageRangePlaceholder: 'e.g., 1-5, 8, 10-15',
    pageRangeNote: 'Supported formats: single page (e.g., 5), range (e.g., 1-5), multiple ranges separated by comma (e.g., 1-5, 8, 10-15)',
    extractPagesBtn: '📑 Extract Pages',
    totalPages: 'Total ',
    extractSingleFile: 'Extract feature only supports one PDF file at a time!',
    invalidPageRange: 'Invalid page range, please check the input format!',
    invalidPages: 'Invalid pages: ',
    validRange: ', valid range is ',
    extractingPages: 'Extracting pages...',
    extractCompleted: 'Extraction completed!',
    extractFailed: 'Extraction failed: ',
    // Merge PDFs feature
    selectMergeFiles: '1. Select PDFs to Merge',
    selectMergeFilesBtn: '📁 Add PDF Files',
    clearAllFiles: 'Clear All',
    noMergeFiles: 'No files selected',
    mergeOptions: '2. Merge Options',
    retainBookmarks: 'Retain Bookmarks',
    retainMetadata: 'Retain Metadata',
    mergeFilesBtn: '📚 Merge PDFs',
    mergingFiles: 'Merging files...',
    mergeCompleted: 'Merge completed!',
    mergeFailed: 'Merge failed: ',
    mergedFileCount: 'Merged ',
    totalPageCount: ' files'
  }
};

// 检测用户系统语言
function detectLanguage() {
  const userLang = navigator.language || navigator.userLanguage;
  if (userLang && userLang.startsWith('zh')) {
    return 'zh';
  } else {
    return 'en';
  }
}

// 存储当前语言
let currentLanguage = null;

// 获取当前语言
function getCurrentLanguage() {
  if (currentLanguage) {
    return currentLanguage;
  }
  return detectLanguage();
}

// 设置语言
function setLanguage(lang) {
  currentLanguage = lang;
  updateUI(lang);
}

// 更新UI
function updateUI(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (i18n[lang][key]) {
      if (element.placeholder) {
        element.placeholder = i18n[lang][key];
      } else {
        element.textContent = i18n[lang][key];
      }
    }
  });
  
  // 更新水印位置选项
  const positionSelect = document.getElementById('watermark-position');
  if (positionSelect) {
    positionSelect.options[0].text = lang === 'zh' ? '中心' : 'Center';
    positionSelect.options[1].text = lang === 'zh' ? '左上角' : 'Top Left';
    positionSelect.options[2].text = lang === 'zh' ? '右上角' : 'Top Right';
    positionSelect.options[3].text = lang === 'zh' ? '左下角' : 'Bottom Left';
    positionSelect.options[4].text = lang === 'zh' ? '右下角' : 'Bottom Right';
  }
  
  // 更新输出格式选项
  const formatSelect = document.getElementById('output-format');
  if (formatSelect && i18n[lang] && i18n[lang].outputFormatPdf && i18n[lang].outputFormatImages) {
    formatSelect.options[0].text = i18n[lang].outputFormatPdf;
    formatSelect.options[1].text = i18n[lang].outputFormatImages;
  }
  
  // 更新DPI选项
  const dpiSelect = document.getElementById('dpi-setting');
  if (dpiSelect && i18n[lang]) {
    if (i18n[lang].dpi72) dpiSelect.options[0].text = i18n[lang].dpi72;
    if (i18n[lang].dpi150) dpiSelect.options[1].text = i18n[lang].dpi150;
    if (i18n[lang].dpi300) dpiSelect.options[2].text = i18n[lang].dpi300;
    if (i18n[lang].dpi600) dpiSelect.options[3].text = i18n[lang].dpi600;
  }
  
}

export { i18n, getCurrentLanguage, setLanguage, updateUI };