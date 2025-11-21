class ImageUploader {
    constructor() {
        this.selectedFiles = [];
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
    }

    initializeElements() {
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.uploadArea = document.getElementById('uploadArea');
        this.previewContainer = document.getElementById('previewContainer');
        this.previewGrid = document.getElementById('previewGrid');
        this.confirmUploadBtn = document.getElementById('confirmUploadBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.progressModal = document.getElementById('progressModal');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.modalClose = document.getElementById('modalClose');
        this.successToast = document.getElementById('successToast');
        this.historyList = document.getElementById('historyList');
        this.targetDir = document.getElementById('targetDir');
        this.commitMsg = document.getElementById('commitMsg');
    }

    bindEvents() {
        // 按钮点击事件
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        
        // 文件选择变化事件
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 确认上传事件
        this.confirmUploadBtn.addEventListener('click', () => this.startUpload());
        
        // 取消上传事件
        this.cancelBtn.addEventListener('click', () => this.resetUpload());
        
        // 模态框关闭事件
        this.modalClose.addEventListener('click', () => this.hideModal());
        
        // 拖拽事件
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processSelectedFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.style.borderColor = '#0366d6';
        this.uploadArea.style.background = 'rgba(64, 120, 192, 0.1)';
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.style.borderColor = '#4078c0';
        this.uploadArea.style.background = 'transparent';
        
        const files = Array.from(event.dataTransfer.files);
        this.processSelectedFiles(files);
    }

    processSelectedFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            this.showError('请选择图片文件');
            return;
        }

        // 检查文件大小
        const oversizedFiles = imageFiles.filter(file => file.size > 25 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            this.showError('文件大小不能超过25MB');
            return;
        }

        this.selectedFiles = imageFiles;
        this.showPreview();
    }

    showPreview() {
        if (this.selectedFiles.length === 0) return;

        this.previewGrid.innerHTML = '';
        
        this.selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const previewItem = this.createPreviewItem(file, e.target.result, index);
                this.previewGrid.appendChild(previewItem);
            };
            
            reader.readAsDataURL(file);
        });

        this.previewContainer.style.display = 'block';
    }

    createPreviewItem(file, dataUrl, index) {
        const item = document.createElement('div');
        item.className = 'preview-item';
        
        const size = this.formatFileSize(file.size);
        
        item.innerHTML = `
            <img src="${dataUrl}" alt="${file.name}" class="preview-image">
            <div class="preview-info">
                <div class="preview-name">${file.name}</div>
                <div class="preview-size">${size}</div>
            </div>
        `;
        
        return item;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    startUpload() {
        if (this.selectedFiles.length === 0) {
            this.showError('请先选择文件');
            return;
        }

        const targetDir = this.targetDir.value.trim() || 'images/';
        const commitMsg = this.commitMsg.value.trim() || '添加图片文件';
        
        this.showModal();
        this.simulateUploadProcess();
    }

    simulateUploadProcess() {
        let progress = 0;
        const totalSteps = 100;
        const stepTime = 30;
        
        const uploadInterval = setInterval(() => {
            progress += 1;
            
            this.updateProgress(progress, '正在上传文件...');
            
            if (progress >= 25) {
                this.updateProgress(progress, '验证文件格式...');
            }
            
            if (progress >= 50) {
                this.updateProgress(progress, '创建GitHub提交...');
            }
            
            if (progress >= 75) {
                this.updateProgress(progress, '同步到远程仓库...');
            }
            
            if (progress >= totalSteps) {
                clearInterval(uploadInterval);
                this.uploadComplete();
            }
        }, stepTime);
    }

    updateProgress(progress, text) {
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${text} (${progress}%)';
    }

    uploadComplete() {
        this.updateProgress(100, '上传完成！');
        
        setTimeout(() => {
            this.hideModal();
            this.showSuccess();
            this.saveToHistory();
            this.resetUpload();
        }, 1000);
    }

    showModal() {
        this.progressModal.style.display = 'flex';
    }

    hideModal() {
        this.progressModal.style.display = 'none';
        this.updateProgress(0, '准备上传...');
    }

    showSuccess() {
        this.successToast.style.display = 'flex';
        
        setTimeout(() => {
            this.successToast.style.display = 'none';
        }, 3000);
    }

    showError(message) {
        alert(message);
    }

    saveToHistory() {
        const history = this.getHistory();
        const timestamp = new Date().toISOString();
        const targetDir = this.targetDir.value.trim() || 'images/';
        
        this.selectedFiles.forEach(file => {
            const historyItem = {
                name: file.name,
                size: file.size,
                type: file.type,
                targetDir: targetDir,
                timestamp: timestamp
            };
            
            history.unshift(historyItem);
        });
        
        // 只保留最近20条记录
        if (history.length > 20) {
            history.splice(20);
        }
        
        localStorage.setItem('githubUploadHistory', JSON.stringify(history));
        this.loadHistory();
    }

    getHistory() {
        const history = localStorage.getItem('githubUploadHistory');
        return history ? JSON.parse(history) : [];
    }

    loadHistory() {
        const history = this.getHistory();
        this.historyList.innerHTML = '';
        
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const date = new Date(item.timestamp);
            const timeString = date.toLocaleString('zh-CN');
            const size = this.formatFileSize(item.size);
            
            historyItem.innerHTML = `
                <div class="history-info">
                    <div class="history-name">${item.name}</div>
                    <div class="history-time">${timeString} - ${size}</div>
                </div>
                <div class="history-path">${item.targetDir}</div>
            `;
            
            this.historyList.appendChild(historyItem);
        });
    }

    resetUpload() {
        this.selectedFiles = [];
        this.fileInput.value = '';
        this.previewContainer.style.display = 'none';
        this.targetDir.value = 'images/';
        this.commitMsg.value = '';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ImageUploader();
});

// 添加一些工具函数
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k)));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 添加键盘快捷键支持
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        document.getElementById('fileInput').click();
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('发生错误:', e.error);
});
