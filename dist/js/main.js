import { App } from './app.js';

// 配置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.min.js';

// 初始化应用当 DOM 准备就绪
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.init();
});
