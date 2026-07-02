

import { i18n, getCurrentLanguage, setLanguage, updateUI } from './i18n.js';

export class App {
    constructor() {
        this.pdfjsLib = pdfjsLib;
        
        this.selectedFiles = [];
        this.currentOutputPath = '';
        
        // 提取页面功能相关
        this.extractFilePath = '';
        this.extractPageCount = 0;
        
        // 合并PDF功能相关
        this.mergeFiles = [];
        
        // 初始化标志，防止重复绑定事件
        this.eventsBound = false;
    }

    async init() {
        // 初始化语言
        await this.initLanguage();
        
        // 确保事件只绑定一次
        if (!this.eventsBound) {
            this.bindEvents();
            this.eventsBound = true;
        }
        
        this.updateUI();
    }

    // 初始化语言
    async initLanguage() {
        try {
            // 从userdata中获取语言设置
            const savedLang = await window.electronAPI.getLanguage();
            let currentLang;
            
            if (savedLang) {
                // 使用保存的语言设置
                currentLang = savedLang;
            } else {
                // 检测浏览器语言
                currentLang = getCurrentLanguage();
            }
            
            updateUI(currentLang);
            // 设置语言按钮的激活状态
            const langZhBtn = document.getElementById('lang-zh');
            const langEnBtn = document.getElementById('lang-en');
            if (langZhBtn && langEnBtn) {
                if (currentLang === 'zh') {
                    langZhBtn.classList.add('active');
                    langEnBtn.classList.remove('active');
                } else {
                    langEnBtn.classList.add('active');
                    langZhBtn.classList.remove('active');
                }
            }
        } catch (error) {
            console.error('Failed to initialize language:', error);
            // 出错时使用默认语言
            const currentLang = getCurrentLanguage();
            updateUI(currentLang);
        }
    }

    bindEvents() {
        // 标签页切换
        document.getElementById('tab-convert').addEventListener('click', () => this.switchTab('convert'));
        document.getElementById('tab-extract').addEventListener('click', () => this.switchTab('extract'));
        document.getElementById('tab-merge').addEventListener('click', () => this.switchTab('merge'));
        
        // 文件选择
        document.getElementById('select-files-btn').addEventListener('click', () => this.selectFiles());
        
        // 水印开关
        const watermarkToggle = document.getElementById('watermark-toggle');
        const watermarkSettings = document.getElementById('watermark-settings');
        
        watermarkToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                watermarkSettings.style.display = 'block';
            } else {
                watermarkSettings.style.display = 'none';
            }
        });
        
        // 水印透明度滑块
        document.getElementById('watermark-opacity').addEventListener('input', (e) => {
            document.getElementById('opacity-value').textContent = e.target.value;
        });
        
        // 水印字体大小滑块
        document.getElementById('watermark-font-size').addEventListener('input', (e) => {
            document.getElementById('font-size-value').textContent = e.target.value;
        });
        
        // 水印角度滑块
        document.getElementById('watermark-angle').addEventListener('input', (e) => {
            document.getElementById('angle-value').textContent = e.target.value;
        });
        
        // 初始化水印设置显示状态
        if (!watermarkToggle.checked) {
            watermarkSettings.style.display = 'none';
        }
        
        // 输出格式选择
        const outputFormat = document.getElementById('output-format');
        const watermarkSettingsContainer = document.getElementById('watermark-settings-container');
        
        // 当输出格式改变时，显示或隐藏水印设置
        outputFormat.addEventListener('change', (e) => {
            if (e.target.value === 'pdf') {
                watermarkSettingsContainer.style.display = 'block';
            } else {
                watermarkSettingsContainer.style.display = 'none';
            }
        });
        
        // 转换按钮
        document.getElementById('convert-btn').addEventListener('click', () => this.startConversion());
        
        // 提取页面功能
        const self = this;
        document.getElementById('select-extract-file-btn').addEventListener('click', function() {
            self.selectExtractFile();
        });
        document.getElementById('clear-extract-file-btn').addEventListener('click', function() {
            self.clearExtractFile();
        });
        document.getElementById('extract-btn').addEventListener('click', function() {
            self.startExtract();
        });
        document.getElementById('page-range-input').addEventListener('input', function(e) {
            console.log('page-range-input changed:', e.target.value);
        });
        
        // 合并PDF功能
        document.getElementById('select-merge-files-btn').addEventListener('click', () => this.selectMergeFiles());
        document.getElementById('clear-merge-files-btn').addEventListener('click', () => this.clearMergeFiles());
        document.getElementById('merge-btn').addEventListener('click', () => this.startMerge());
        
        // 语言切换
        const langZhBtn = document.getElementById('lang-zh');
        const langEnBtn = document.getElementById('lang-en');
        if (langZhBtn) {
            langZhBtn.addEventListener('click', async () => {
                setLanguage('zh');
                langZhBtn.classList.add('active');
                langEnBtn.classList.remove('active');
                await window.electronAPI.saveLanguage({ language: 'zh' });
                window.electronAPI.send('language-changed', 'zh');
            });
        }
        if (langEnBtn) {
            langEnBtn.addEventListener('click', async () => {
                setLanguage('en');
                langEnBtn.classList.add('active');
                langZhBtn.classList.remove('active');
                await window.electronAPI.saveLanguage({ language: 'en' });
                window.electronAPI.send('language-changed', 'en');
            });
        }
        
        // 右键菜单
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            window.electronAPI.showContextMenu();
        });
        
        // 监听获取当前语言的请求
        window.electronAPI.on('get-current-language', (callback) => {
            const currentLang = getCurrentLanguage();
            callback(currentLang);
        });
    }

    updateUI() {
        this.updateFileList();
        this.updateConvertButton();
        this.updateExtractButton();
        this.updateMergeButton();
    }

    async selectFiles() {
        try {
            const files = await window.electronAPI.selectFiles();

            if (!files || files.length === 0) return;

            // 验证文件扩展名
            for (const file of files) {
                const ext = file.toLowerCase().split('.').pop();
                if (ext !== 'pdf') {
                    alert(i18n[getCurrentLanguage()].unsupportedFileFormat + file + i18n[getCurrentLanguage()].onlyPdfFiles);
                    return;
                }
            }

            this.selectedFiles = files;
            this.updateFileList();
            this.updateConvertButton();
            this.log(i18n[getCurrentLanguage()].selectedFiles + files.length + i18n[getCurrentLanguage()].files, 'info');
        } catch (error) {
            console.error('Failed to select files:', error);
            this.log(i18n[getCurrentLanguage()].selectFilesFailed + error.message, 'error');
        }
    }

    updateFileList() {
        const listContainer = document.getElementById('file-list');
        const noFilesMsg = document.getElementById('no-files');
        
        listContainer.innerHTML = '';
        
        if (this.selectedFiles.length === 0) {
            noFilesMsg.style.display = 'block';
            return;
        }
        
        noFilesMsg.style.display = 'none';
        
        this.selectedFiles.forEach((file, index) => {
            const fileName = file.split(/[\\/]/).pop();
            const ext = fileName.split('.').pop().toLowerCase();
            const icon = '📄';
            
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span class="file-icon">${icon}</span>
                <div class="file-info">
                    <div class="file-name">${fileName}</div>
                    <div class="file-path">${file}</div>
                </div>
                <span class="file-remove" data-index="${index}">✕</span>
            `;
            
            fileItem.querySelector('.file-remove').addEventListener('click', () => {
                this.selectedFiles.splice(index, 1);
                this.updateFileList();
                this.updateConvertButton();
            });
            
            listContainer.appendChild(fileItem);
        });
    }

    updateConvertButton() {
        const btn = document.getElementById('convert-btn');
        btn.disabled = this.selectedFiles.length === 0;
    }

    async startConversion() {
        if (this.selectedFiles.length === 0) return;
        const watermarkToggle = document.getElementById('watermark-toggle');
        let watermark = null;
        
        if (watermarkToggle.checked) {
            const watermarkText = document.getElementById('watermark-text').value || '';
            
            // 验证水印文字是否只包含英文和数字
            if (watermarkText) {
                const regex = /^[a-zA-Z0-9\s]+$/;
                if (!regex.test(watermarkText)) {
                    alert(i18n[getCurrentLanguage()].watermarkTextError);
                    return;
                }
            }
            
            watermark = {
                text: watermarkText,
                opacity: parseInt(document.getElementById('watermark-opacity').value) / 100,
                position: document.getElementById('watermark-position').value,
                fontSize: parseInt(document.getElementById('watermark-font-size').value),
                angle: parseInt(document.getElementById('watermark-angle').value)
            };
        }
        
        // 检查所有选中的文件是否仍然存在
        const missingFiles = [];
        for (const file of this.selectedFiles) {
            const exists = await window.electronAPI.checkFileExists({ filePath: file });
            if (!exists) {
                missingFiles.push(file);
            }
        }
        
        if (missingFiles.length > 0) {
            const fileNameList = missingFiles.map(f => f.split(/[\\/]/).pop()).join('\n');
            alert(`以下文件不存在或已被删除：\n${fileNameList}\n\n请重新选择文件。`);
            this.selectedFiles = this.selectedFiles.filter(f => !missingFiles.includes(f));
            this.updateFileList();
            this.updateConvertButton();
            return;
        }
        
        const btn = document.getElementById('convert-btn');
        btn.disabled = true;
            btn.textContent = '⏳ ' + i18n[getCurrentLanguage()].startingConversion;
        
        this.resetProgress();
        
        
        
        const dpi = parseInt(document.getElementById('dpi-setting').value);
        const outputFormat = document.getElementById('output-format').value;
        
        try {
            for (let i = 0; i < this.selectedFiles.length; i++) {
                const file = this.selectedFiles[i];
                const fileName = file.split(/[\\/]/).pop();
                
                this.log(i18n[getCurrentLanguage()].startingConversion + fileName, 'info');
                this.updateProgress(((i / this.selectedFiles.length) * 50).toFixed(0));
                
                // 读取 PDF 文件
                const pdfData = await window.electronAPI.readPdf({ filePath: file });
                
                // 渲染 PDF 页面为图片
                this.log(i18n[getCurrentLanguage()].renderingPdf, 'info');
                const imageDataList = await this.renderPdfToImages(pdfData, dpi);
                this.log(i18n[getCurrentLanguage()].renderingCompleted + imageDataList.length + i18n[getCurrentLanguage()].pages, 'info');
                
                this.updateProgress(((i / this.selectedFiles.length) * 50 + 50).toFixed(0));
                
                const result = await window.electronAPI.convertFile({
                    filePath: file,
                    watermark: watermark,
                    dpi: dpi,
                    imageDataList: imageDataList,
                    outputFormat: outputFormat
                });
                
                this.currentOutputPath = result.outputPath;
                this.log(i18n[getCurrentLanguage()].conversionCompletedFile + result.outputPath, 'success');
            }
            
            this.updateProgress(100);
            this.log(i18n[getCurrentLanguage()].allFilesConverted, 'success');
            
            // 显示完成消息（延迟执行，确保进度条更新完成）
            setTimeout(() => {
                const outputDir = this.currentOutputPath.substring(0, this.currentOutputPath.lastIndexOf('/')) ||
                                 this.currentOutputPath.substring(0, this.currentOutputPath.lastIndexOf('\\'));
                
                let message = i18n[getCurrentLanguage()].conversionCompleted + '\n' + 
                             i18n[getCurrentLanguage()].filesSavedTo + outputDir + '\n' + 
                             i18n[getCurrentLanguage()].filesInSameFolder;
                
                alert(message);
            }, 100);
            
        } catch (error) {
            console.error('Conversion failed:', error);
            this.log(i18n[getCurrentLanguage()].conversionFailed + error.message, 'error');
            alert(i18n[getCurrentLanguage()].conversionFailed + error.message);
        } finally {
            btn.disabled = false;
            btn.textContent = '🚀 ' + i18n[getCurrentLanguage()].startConversion;
        }
    }
    
    async renderPdfToImages(pdfData, dpi) {
        try {
            const loadingTask = this.pdfjsLib.getDocument({ data: pdfData });
            const pdfDocument = await loadingTask.promise;
            
            const imageDataList = [];
            
            // 处理所有页面
            const maxPages = pdfDocument.numPages;
            
            for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
                const page = await pdfDocument.getPage(pageNum);
                
                // 设置缩放比例（基于 DPI）
                const scale = dpi / 72; // 72 是默认 DPI
                const viewport = page.getViewport({ scale });
                
                // 创建 canvas 元素
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                // 渲染页面
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                
                await page.render(renderContext).promise;
                
                // 转换为 base64 图片数据
                const imageData = canvas.toDataURL('image/png');
                imageDataList.push(imageData);
            }
            
            return imageDataList;
        } catch (error) {
            console.error('Failed to render PDF to images:', error);
            throw new Error(i18n[getCurrentLanguage()].pdfRenderingFailed + error.message);
        }
    }

    resetProgress() {
        document.getElementById('progress-bar').style.width = '0%';
        document.getElementById('progress-bar').textContent = '0%';
        document.getElementById('log-container').innerHTML = '';
    }

    updateProgress(percent) {
        const bar = document.getElementById('progress-bar');
        bar.style.width = percent + '%';
        bar.textContent = percent + '%';
    }

    log(message, type = 'info') {
        const container = document.getElementById('log-container');
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        const time = new Date().toLocaleTimeString();
        entry.textContent = `[${time}] ${message}`;
        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;
    }



    async openInFolder() {
        if (!this.currentOutputPath) return;
        
        try {
            await window.electronAPI.showInFolder({ filePath: this.currentOutputPath });
        } catch (error) {
            console.error('Failed to open folder:', error);
        }
    }

    // 切换功能标签页
    switchTab(tabName) {
        // 更新标签状态
        document.querySelectorAll('#function-tabs .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        // 显示/隐藏面板
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        document.getElementById(`panel-${tabName}`).style.display = 'block';
        
        // 更新按钮状态
        this.updateUI();
        
        // 重置进度
        this.resetProgress();
    }

    // 提取页面功能

    async selectExtractFile() {
        try {
            const files = await window.electronAPI.selectFiles();
            
            if (!files || files.length === 0) return;
            if (files.length > 1) {
                alert(i18n[getCurrentLanguage()].extractSingleFile);
                return;
            }
            
            const file = files[0];
            const ext = file.toLowerCase().split('.').pop();
            if (ext !== 'pdf') {
                alert(i18n[getCurrentLanguage()].unsupportedFileFormat + file + i18n[getCurrentLanguage()].onlyPdfFiles);
                return;
            }
            
            this.extractFilePath = file;
            this.extractPageCount = await window.electronAPI.getPdfPageCount({ filePath: file });
            
            console.log('File selected:', this.extractFilePath, ', pageCount:', this.extractPageCount);
            
            document.getElementById('no-extract-file').style.display = 'none';
            document.getElementById('extract-file-info').style.display = 'block';
            document.getElementById('extract-file-name').textContent = file.split(/[\\/]/).pop();
            document.getElementById('extract-file-page-count').textContent = i18n[getCurrentLanguage()].totalPages + this.extractPageCount;
            
            this.updateExtractButton();
        } catch (error) {
            console.error('Failed to select extract file:', error);
            this.log(i18n[getCurrentLanguage()].selectFilesFailed + error.message, 'error');
        }
    }

    clearExtractFile() {
        this.extractFilePath = '';
        this.extractPageCount = 0;
        document.getElementById('extract-file-info').style.display = 'none';
        document.getElementById('no-extract-file').style.display = 'block';
        document.getElementById('page-range-input').value = '';
        this.updateExtractButton();
    }

    updateExtractButton() {
        // 按钮现在始终可用，验证在点击时进行
    }

    parsePageRange(input) {
        const pageNumbers = [];
        const parts = input.split(',');
        
        for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) continue;
            
            if (trimmed.includes('-')) {
                const [start, end] = trimmed.split('-').map(s => parseInt(s.trim()));
                if (!isNaN(start) && !isNaN(end) && start <= end) {
                    for (let i = start; i <= end; i++) {
                        if (!pageNumbers.includes(i)) {
                            pageNumbers.push(i);
                        }
                    }
                }
            } else {
                const num = parseInt(trimmed);
                if (!isNaN(num) && !pageNumbers.includes(num)) {
                    pageNumbers.push(num);
                }
            }
        }
        
        return pageNumbers.sort((a, b) => a - b);
    }

    async startExtract() {
        // 验证是否选择了文件
        if (!this.extractFilePath) {
            alert(i18n[getCurrentLanguage()].extractSingleFile);
            return;
        }
        
        // 验证是否输入了页码范围
        const pageRangeInput = document.getElementById('page-range-input').value.trim();
        if (!pageRangeInput) {
            alert(i18n[getCurrentLanguage()].invalidPageRange);
            return;
        }
        
        // 解析页码范围
        const pageNumbers = this.parsePageRange(pageRangeInput);
        
        if (pageNumbers.length === 0) {
            alert(i18n[getCurrentLanguage()].invalidPageRange);
            return;
        }
        
        // 验证页码范围是否有效
        const invalidPages = pageNumbers.filter(num => num < 1 || num > this.extractPageCount);
        if (invalidPages.length > 0) {
            alert(i18n[getCurrentLanguage()].invalidPages + invalidPages.join(', ') + i18n[getCurrentLanguage()].validRange + `1-${this.extractPageCount}`);
            return;
        }
        
        const btn = document.getElementById('extract-btn');
        btn.disabled = true;
        btn.textContent = '⏳ ' + i18n[getCurrentLanguage()].extractingPages;
        
        this.resetProgress();
        
        try {
            this.log(i18n[getCurrentLanguage()].extractingPages + pageNumbers.join(', '), 'info');
            
            const result = await window.electronAPI.extractPages({
                filePath: this.extractFilePath,
                pageNumbers: pageNumbers
            });
            
            this.currentOutputPath = result.outputPath;
            this.updateProgress(100);
            this.log(i18n[getCurrentLanguage()].extractCompleted + result.outputPath, 'success');
            
            setTimeout(() => {
                const outputDir = this.currentOutputPath.substring(0, this.currentOutputPath.lastIndexOf('/')) ||
                                 this.currentOutputPath.substring(0, this.currentOutputPath.lastIndexOf('\\'));
                alert(i18n[getCurrentLanguage()].extractCompleted + '\n' + 
                      i18n[getCurrentLanguage()].filesSavedTo + outputDir);
            }, 100);
            
        } catch (error) {
            console.error('Extract failed:', error);
            this.log(i18n[getCurrentLanguage()].extractFailed + error.message, 'error');
            alert(i18n[getCurrentLanguage()].extractFailed + error.message);
        } finally {
            btn.disabled = false;
            btn.textContent = '📑 ' + i18n[getCurrentLanguage()].extractPagesBtn;
        }
    }

    // 合并PDF功能

    async selectMergeFiles() {
        try {
            const files = await window.electronAPI.selectFiles();
            
            if (!files || files.length === 0) return;
            
            // 验证文件扩展名
            for (const file of files) {
                const ext = file.toLowerCase().split('.').pop();
                if (ext !== 'pdf') {
                    alert(i18n[getCurrentLanguage()].unsupportedFileFormat + file + i18n[getCurrentLanguage()].onlyPdfFiles);
                    return;
                }
            }
            
            // 添加新文件（避免重复）
            for (const file of files) {
                if (!this.mergeFiles.includes(file)) {
                    this.mergeFiles.push(file);
                }
            }
            
            this.updateMergeFileList();
            this.updateMergeButton();
        } catch (error) {
            console.error('Failed to select merge files:', error);
            this.log(i18n[getCurrentLanguage()].selectFilesFailed + error.message, 'error');
        }
    }

    clearMergeFiles() {
        this.mergeFiles = [];
        this.updateMergeFileList();
        this.updateMergeButton();
    }

    updateMergeFileList() {
        const listContainer = document.getElementById('merge-file-list');
        const noFilesMsg = document.getElementById('no-merge-files');
        
        listContainer.innerHTML = '';
        
        if (this.mergeFiles.length === 0) {
            noFilesMsg.style.display = 'block';
            return;
        }
        
        noFilesMsg.style.display = 'none';
        
        this.mergeFiles.forEach((file, index) => {
            const fileName = file.split(/[\\/]/).pop();
            const icon = '📄';
            
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item d-flex align-items-center justify-content-between';
            fileItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <span class="file-icon mr-2">${icon}</span>
                    <div class="file-info">
                        <div class="file-name">${fileName}</div>
                        <div class="file-path text-sm text-muted">${file}</div>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <button class="move-up-btn btn btn-sm btn-outline-secondary mr-1" data-index="${index}">↑</button>
                    <button class="move-down-btn btn btn-sm btn-outline-secondary mr-1" data-index="${index}">↓</button>
                    <span class="file-remove" data-index="${index}">✕</span>
                </div>
            `;
            
            fileItem.querySelector('.file-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                this.mergeFiles.splice(index, 1);
                this.updateMergeFileList();
                this.updateMergeButton();
            });
            
            fileItem.querySelector('.move-up-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (index > 0) {
                    [this.mergeFiles[index], this.mergeFiles[index - 1]] = [this.mergeFiles[index - 1], this.mergeFiles[index]];
                    this.updateMergeFileList();
                }
            });
            
            fileItem.querySelector('.move-down-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (index < this.mergeFiles.length - 1) {
                    [this.mergeFiles[index], this.mergeFiles[index + 1]] = [this.mergeFiles[index + 1], this.mergeFiles[index]];
                    this.updateMergeFileList();
                }
            });
            
            listContainer.appendChild(fileItem);
        });
    }

    updateMergeButton() {
        const btn = document.getElementById('merge-btn');
        btn.disabled = this.mergeFiles.length < 2;
    }

    async startMerge() {
        if (this.mergeFiles.length < 2) return;
        
        const btn = document.getElementById('merge-btn');
        btn.disabled = true;
        btn.textContent = '⏳ ' + i18n[getCurrentLanguage()].mergingFiles;
        
        this.resetProgress();
        
        try {
            this.log(i18n[getCurrentLanguage()].mergingFiles, 'info');
            
            const result = await window.electronAPI.mergePdfs({
                filePaths: this.mergeFiles
            });
            
            this.currentOutputPath = result.outputPath;
            this.updateProgress(100);
            this.log(i18n[getCurrentLanguage()].mergeCompleted + result.outputPath, 'success');
            
            setTimeout(() => {
                const outputDir = this.currentOutputPath.substring(0, this.currentOutputPath.lastIndexOf('/')) ||
                                 this.currentOutputPath.substring(0, this.currentOutputPath.lastIndexOf('\\'));
                alert(i18n[getCurrentLanguage()].mergeCompleted + '\n' + 
                      i18n[getCurrentLanguage()].filesSavedTo + outputDir + '\n' +
                      i18n[getCurrentLanguage()].mergedFileCount + result.fileCount);
            }, 100);
            
        } catch (error) {
            console.error('Merge failed:', error);
            this.log(i18n[getCurrentLanguage()].mergeFailed + error.message, 'error');
            alert(i18n[getCurrentLanguage()].mergeFailed + error.message);
        } finally {
            btn.disabled = false;
            btn.textContent = '📚 ' + i18n[getCurrentLanguage()].mergeFilesBtn;
        }
    }
}
