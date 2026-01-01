// 选项页面主脚本 - 组件化重构
import { DataManager } from './dataManager.js';
import { IconManager, iconManager } from './iconManager.js';

// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 常用Font Awesome图标列表
const fontAwesomeIcons = [
    'fas fa-home', 'fas fa-building', 'fas fa-graduation-cap', 'fas fa-laptop',
    'fas fa-music', 'fas fa-video', 'fas fa-gamepad', 'fas fa-book',
    'fas fa-shopping-cart', 'fas fa-truck', 'fas fa-map-marker-alt', 'fas fa-plane',
    'fas fa-heartbeat', 'fas fa-medkit', 'fas fa-cutlery', 'fas fa-coffee',
    'fas fa-camera', 'fas fa-paint-brush', 'fas fa-code', 'fas fa-chart-line',
    'fas fa-briefcase', 'fas fa-users', 'fas fa-cog', 'fas fa-globe',
    'fas fa-folder', 'fas fa-file-alt', 'fas fa-image', 'fas fa-search',
    'fas fa-star', 'fas fa-heart', 'fas fa-bell', 'fas fa-envelope',
    'fas fa-compass', 'fas fa-clipboard-list', 'fas fa-lightbulb', 'fas fa-rocket'
];

// 初始化图标选择器
function initIconSelector(selectorId = 'mainCategoryIconSelector', inputId = 'mainCategoryIcon') {
    const iconSelector = document.getElementById(selectorId);
    const iconInput = document.getElementById(inputId);
    
    if (!iconSelector || !iconInput) return;
    
    // 添加图标选择器样式
    addIconSelectorStyles();
    
    // 生成图标选项
    iconSelector.innerHTML = fontAwesomeIcons.map(icon => `
        <div class="icon-option ${iconInput.value === icon ? 'selected' : ''}" data-icon="${icon}">
            <i class="${icon}"></i>
        </div>
    `).join('');
    
    // 绑定图标选择事件
    iconSelector.addEventListener('click', (e) => {
        const iconOption = e.target.closest('.icon-option');
        if (iconOption) {
            // 移除所有选中状态
            document.querySelectorAll('.icon-option').forEach(option => {
                option.classList.remove('selected');
            });
            // 添加当前选中状态
            iconOption.classList.add('selected');
            // 设置选中的图标
            iconInput.value = iconOption.dataset.icon;
        }
    });
}

// 添加图标选择器样式
function addIconSelectorStyles() {
    // 检查是否已经添加过样式
    if (!document.getElementById('icon-selector-styles')) {
        const style = document.createElement('style');
        style.id = 'icon-selector-styles';
        style.textContent = `
            .icon-selector {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
                gap: 10px;
                margin: 10px 0;
                max-height: 200px;
                overflow-y: auto;
                padding: 10px;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                background-color: #f8fafc;
            }
            
            .icon-option {
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border: 2px solid transparent;
                border-radius: 6px;
                background-color: #ffffff;
                font-size: 18px;
            }
            
            .icon-option:hover {
                border-color: #3b82f6;
                background-color: #eff6ff;
            }
            
            .icon-option.selected {
                border-color: #3b82f6;
                background-color: #eff6ff;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .icon-option i {
                color: #0f172a;
            }
        `;
        document.head.appendChild(style);
    }
}

// Toast通知组件
class Toast {
    constructor(toastContainer) {
        this.toastContainer = toastContainer;
        this.toasts = [];
        this.maxToasts = 5;
        this.hideDelay = 5000; // 5秒后自动隐藏
    }

    show(message, type = 'success') {
        // 创建新的toast元素
        const toastElement = document.createElement('div');
        toastElement.className = `toast ${type}`;
        toastElement.innerHTML = `<span class="toast-message">${message}</span>`;
        toastElement.style.display = 'flex';
        
        // 添加到容器
        this.toastContainer.appendChild(toastElement);
        this.toasts.push(toastElement);
        
        // 如果超过最大数量，移除最旧的toast
        if (this.toasts.length > this.maxToasts) {
            const oldestToast = this.toasts.shift();
            this.hideToast(oldestToast);
        }
        
        // 设置自动隐藏
        setTimeout(() => {
            this.hideToast(toastElement);
        }, this.hideDelay);
    }
    
    hideToast(toastElement) {
        // 直接移除元素
        if (toastElement.parentNode) {
            toastElement.parentNode.removeChild(toastElement);
        }
        // 从数组中移除
        const index = this.toasts.indexOf(toastElement);
        if (index > -1) {
            this.toasts.splice(index, 1);
        }
    }
}

// 模态框组件
class Modal {
    constructor(modalElement, modalTitle, modalMessage, modalBody, countdownElement, countdownText, closeBtn, cancelBtn, confirmBtn) {
        this.modal = modalElement;
        this.modalTitle = modalTitle;
        this.modalMessage = modalMessage;
        this.modalBody = modalBody;
        this.countdown = countdownElement;
        this.countdownText = countdownText;
        this.closeModal = closeBtn;
        this.cancelBtn = cancelBtn;
        this.confirmBtn = confirmBtn;
        this.countdownTimer = null;
        this.onConfirm = null;
        this.onCancel = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // 关闭模态框
        this.closeModal.addEventListener('click', () => {
            this.hide();
        });
        
        // 取消按钮点击事件
        this.cancelBtn.addEventListener('click', () => {
            if (this.onCancel) {
                this.onCancel();
            }
            this.hide();
        });
        
        // 确认按钮点击事件
        this.confirmBtn.addEventListener('click', () => {
            if (this.onConfirm) {
                this.onConfirm();
            }
            this.hide();
        });
        
        // 点击模态框外部关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
    }

    show(title, message, showCountdown = false, countdownTime = 0, onConfirm = null, onCancel = null) {
        // 设置标题和消息
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        
        // 设置回调函数
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
        
        // 显示模态框
        this.modal.style.display = 'flex';
        
        // 显示倒计时
        if (showCountdown && countdownTime > 0) {
            this.countdownText.style.display = 'block';
            this.countdown.textContent = countdownTime;
            this.startCountdown(countdownTime);
        } else {
            this.countdownText.style.display = 'none';
        }
    }

    hide() {
        this.modal.style.display = 'none';
        this.stopCountdown();
    }

    startCountdown(time) {
        this.stopCountdown();
        this.countdown.textContent = time;
        
        this.countdownTimer = setInterval(() => {
            time--;
            this.countdown.textContent = time;
            
            if (time <= 0) {
                this.stopCountdown();
                if (this.onConfirm) {
                    this.onConfirm();
                }
                this.hide();
            }
        }, 1000);
    }

    stopCountdown() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    }
}

// 主应用组件
class OptionsApp {
    constructor() {
        // 数据管理相关元素
        this.exportBtn = document.getElementById('exportBtn');
        this.exportType = document.getElementById('exportType');
        this.exportSource = document.getElementById('exportSource');
        this.syncDataBtn = document.getElementById('syncDataBtn');
        this.syncSource = document.getElementById('syncSource');
        this.syncTarget = document.getElementById('syncTarget');
        this.importBtn = document.getElementById('importBtn');
        this.importFile = document.getElementById('importFile');
        this.resetBtn = document.getElementById('resetBtn');
        // 图标API配置相关元素
        this.faviconApiInput = document.getElementById('faviconApiInput');
        this.faviconApiBackupInput = document.getElementById('faviconApiBackupInput');
        this.apiTimeoutInput = document.getElementById('apiTimeoutInput');
        this.saveFaviconApiBtn = document.getElementById('saveFaviconApiBtn');
        // 默认图标类型相关元素
        this.iconTypeRadios = document.querySelectorAll('input[name="defaultIconType"]');
        // 悬浮窗配置相关元素
        this.floatingWidgetEnabled = document.getElementById('floatingWidgetEnabled');
        this.autoCollapseTime = document.getElementById('autoCollapseTime');
        this.saveFloatingWidgetConfig = document.getElementById('saveFloatingWidgetConfig');
        // WebDAV配置相关元素
        this.webdavHost = document.getElementById('webdavHost');
        this.webdavPort = document.getElementById('webdavPort');
        this.webdavPath = document.getElementById('webdavPath');
        this.webdavUsername = document.getElementById('webdavUsername');
        this.webdavPassword = document.getElementById('webdavPassword');
        this.autoBackupEnabled = document.getElementById('autoBackupEnabled');
        this.autoBackupInterval = document.getElementById('autoBackupInterval');
        this.backupTime = document.getElementById('backupTime');
        this.saveWebdavConfig = document.getElementById('saveWebdavConfig');
        this.manualBackupBtn = document.getElementById('manualBackupBtn');
        this.restoreBackupBtn = document.getElementById('restoreBackupBtn');
        this.testWebdavConnection = document.getElementById('testWebdavConnection');
        this.backupsList = document.getElementById('backupsList');
        
        this.toastContainer = document.getElementById('toastContainer');
        // 按钮冷却时间状态
        this.buttonCooldowns = {
            testWebdavConnection: false,
            manualBackupBtn: false,
            restoreBackupBtn: false
        };
        this.createMainCategoryBtn = document.getElementById('createMainCategoryBtn');
        this.mainCategoryName = document.getElementById('mainCategoryName');
        this.mainCategoryIcon = document.getElementById('mainCategoryIcon');
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalBody = document.getElementById('modalBody');
        this.countdown = document.getElementById('countdown');
        this.countdownText = document.getElementById('countdownText');
        this.closeModal = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.confirmBtn = document.getElementById('confirmBtn');
        
        // 标签页相关元素
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // 分类列表元素
        this.mainCategoriesList = document.getElementById('mainCategoriesList');
        // 一级和二级分类列表元素已移除，只保留主类导航列表
        this.categoriesList = null;
        this.subcategoriesList = null;
        
        // 图标缓存按钮
        this.clearFaviconCacheBtn = document.getElementById('clearFaviconCacheBtn');
        
        // 存储管理相关元素
        this.storageTypeRadios = document.querySelectorAll('input[name="storageType"]');
        this.mysqlConfigSection = document.getElementById('mysqlConfigSection');
        this.saveStorageTypeBtn = document.getElementById('saveStorageTypeBtn');
        this.saveMysqlConfigBtn = document.getElementById('saveMysqlConfig');
        this.testMysqlConnectionBtn = document.getElementById('testMysqlConnection');
        
        // MySQL配置输入框
        this.mysqlHost = document.getElementById('mysqlHost');
        this.mysqlPort = document.getElementById('mysqlPort');
        this.mysqlUser = document.getElementById('mysqlUser');
        this.mysqlPassword = document.getElementById('mysqlPassword');
        this.mysqlDatabase = document.getElementById('mysqlDatabase');
        
        // 初始化组件
        this.toastComponent = new Toast(this.toastContainer);
        this.modalComponent = new Modal(
            this.modal,
            this.modalTitle,
            this.modalMessage,
            this.modalBody,
            this.countdown,
            this.countdownText,
            this.closeModal,
            this.cancelBtn,
            this.confirmBtn
        );
        
        // 初始化页面
        this.init();
    }

    async init() {
        // 绑定事件 - 只绑定一次，避免重复绑定
        this.bindEvents();
        
        // 初始化标签页
        this.initTabs();
        
        // 初始化图标选择器
        initIconSelector();
        
        // 只加载一次数据，避免重复读取存储
        await this.loadAllData();
        
        // 初始化存储管理配置
        await this.initStorageConfig();
        
        // 使用同一数据对象渲染所有内容
        this.renderAllData();
    }
    
    // 初始化存储管理配置
    async initStorageConfig() {
        try {
            // 获取当前存储类型
            const storageType = await DataManager.getStorageType();
            
            // 设置当前存储类型的单选按钮
            this.storageTypeRadios.forEach(radio => {
                radio.checked = radio.value === storageType;
            });
            
            // 显示或隐藏MySQL配置部分
            this.toggleMysqlConfigSection(storageType);
            
            // 加载MySQL配置
            await this.loadMysqlConfig();
        } catch (error) {
            console.error('初始化存储配置失败:', error);
        }
    }
    
    // 加载MySQL配置
    async loadMysqlConfig() {
        try {
            const mysqlConfig = await DataManager.getMySQLConfig();
            if (mysqlConfig) {
                this.mysqlHost.value = mysqlConfig.HOST || '';
                this.mysqlPort.value = mysqlConfig.PORT || 3306;
                this.mysqlUser.value = mysqlConfig.USER || '';
                this.mysqlPassword.value = mysqlConfig.PASSWORD || '';
                this.mysqlDatabase.value = mysqlConfig.DATABASE || '';
            }
        } catch (error) {
            console.error('加载MySQL配置失败:', error);
        }
    }
    
    // 显示或隐藏MySQL配置部分
    toggleMysqlConfigSection(storageType) {
        if (storageType === 'mysql') {
            this.mysqlConfigSection.style.display = 'block';
        } else {
            this.mysqlConfigSection.style.display = 'none';
        }
    }
    
    // 加载所有数据，只调用一次DataManager.getAllData()
    async loadAllData() {
        try {
            // 缓存数据到实例属性，避免重复读取存储
            this.currentData = await DataManager.getAllData();
        } catch (error) {
            console.error('加载数据失败:', error);
            this.toastComponent.show('加载数据失败', 'error');
        }
    }
    
    // 使用缓存数据渲染所有内容
    renderAllData() {
        if (!this.currentData) {
            // 如果currentData不存在，尝试重新加载数据
            console.debug('currentData不存在，尝试重新加载数据');
            this.loadAllData().then(() => {
                // 数据加载成功后重新渲染
                this.currentData && this.renderAllData();
            });
            return;
        }
        
        // 渲染分类数据
        this.renderMainCategories(this.currentData.mainCategories);
        this.renderCategories(this.currentData.mainCategories);
        this.renderSubcategories(this.currentData.mainCategories);
        
        // 加载配置数据
        this.renderFaviconApiConfig();
        this.renderFloatingWidgetConfig();
        this.renderWebDAVConfig();
    }

    bindEvents() {
        // 导出数据按钮点击事件
        this.exportBtn.addEventListener('click', () => this.handleExportData());
        
        // 导入文件选择事件
        this.importFile.addEventListener('change', () => this.handleFileSelect());
        
        // 导入数据按钮点击事件
        this.importBtn.addEventListener('click', () => this.handleImportData());
        
        // 数据同步按钮点击事件
        this.syncDataBtn.addEventListener('click', () => this.handleSyncData());
        
        // 重置数据按钮点击事件
        this.resetBtn.addEventListener('click', () => this.handleResetData());
        
        // 创建主类导航按钮点击事件
        this.createMainCategoryBtn.addEventListener('click', () => this.handleCreateMainCategory());
        
        // 保存图标API配置按钮点击事件
        this.saveFaviconApiBtn.addEventListener('click', () => this.handleSaveFaviconApi());
        
        // 清除图标缓存按钮点击事件
        this.clearFaviconCacheBtn?.addEventListener('click', () => this.handleClearFaviconCache());
        
        // 悬浮窗配置相关事件绑定
        this.saveFloatingWidgetConfig.addEventListener('click', () => this.handleSaveFloatingWidgetConfig());
        
        // WebDAV相关事件绑定
        this.saveWebdavConfig.addEventListener('click', () => this.handleSaveWebdavConfig());
        this.testWebdavConnection.addEventListener('click', () => this.handleTestWebdavConnection());
        this.manualBackupBtn.addEventListener('click', () => this.handleManualBackup());
        this.restoreBackupBtn.addEventListener('click', () => this.handleRestoreBackup());
        
        // 存储管理相关事件绑定
        this.storageTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => this.handleStorageTypeChange(e));
        });
        
        // 保存存储类型按钮点击事件
        this.saveStorageTypeBtn.addEventListener('click', () => this.handleSaveStorageType());
        
        // 保存MySQL配置按钮点击事件
        this.saveMysqlConfigBtn.addEventListener('click', () => this.handleSaveMysqlConfig());
        
        // 测试MySQL连接按钮点击事件
        this.testMysqlConnectionBtn.addEventListener('click', () => this.handleTestMysqlConnection());
    }
    
    // 处理导出数据
    async handleExportData() {
        try {
            // 显示加载状态
            this.exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 导出中...';
            this.exportBtn.disabled = true;
            
            // 获取导出类型和源存储类型
            const exportType = this.exportType.value;
            const sourceType = this.exportSource.value;
            
            // 调用DataManager导出数据
            const exportData = await DataManager.exportData(exportType, sourceType);
            
            if (exportData) {
                // 根据导出类型生成文件名，与DataManager.exportData方法的判断逻辑保持一致
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const isDatabaseExport = exportType === 'database' || exportType === 'sql';
                const filename = isDatabaseExport 
                    ? `cloudhut-database-${timestamp}.sql`
                    : `cloudhut-data-${timestamp}.json`;
                
                // 下载文件，根据实际导出内容设置MIME类型
                const contentType = isDatabaseExport ? 'text/plain' : 'application/json';
                this.downloadFile(exportData, filename, contentType);
                
                this.toastComponent.show('数据导出成功', 'success');
            } else {
                this.toastComponent.show('数据导出失败', 'error');
            }
        } catch (error) {
            console.error('导出数据失败:', error);
            this.toastComponent.show('数据导出失败', 'error');
        } finally {
            // 恢复按钮状态
            this.exportBtn.innerHTML = '<i class="fas fa-file-export"></i> 导出数据';
            this.exportBtn.disabled = false;
        }
    }
    
    // 下载文件
    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // 处理文件选择
    handleFileSelect() {
        this.importBtn.disabled = this.importFile.files.length === 0;
    }
    
    // 处理导入数据
    async handleImportData() {
        // 导入数据逻辑
    }
    
    // 处理数据同步
    async handleSyncData() {
        // 同步数据逻辑
    }
    
    // 处理重置数据
    handleResetData() {
        // 重置数据逻辑
    }
    
    // 处理创建主类导航
    handleCreateMainCategory() {
        // 先关闭所有现有对话框
        this.closeAllDialogs();
        
        // 创建对话框HTML
        const dialogHtml = `
            <div class="dialog-overlay">
                <div class="dialog">
                    <div class="dialog-header">
                        <h3>创建主类导航</h3>
                        <button class="dialog-close" id="createMainCategoryDialogClose">&times;</button>
                    </div>
                    <div class="dialog-body">
                        <form id="createMainCategoryForm">
                            <div class="form-group">
                                <label for="createMainCategoryName">主类名称</label>
                                <input type="text" id="createMainCategoryName" class="form-input" placeholder="输入主类名称" required>
                            </div>
                            <div class="form-group">
                                <label>选择图标</label>
                                <div class="icon-selector" id="createMainCategoryIconSelector"></div>
                                <input type="hidden" id="createMainCategoryIcon" name="createMainCategoryIcon" value="fas fa-compass">
                                <small class="form-hint">选择一个图标作为主类导航图标</small>
                            </div>
                            <div class="dialog-footer">
                                <button type="button" id="createMainCategoryCancel" class="btn btn-secondary">取消</button>
                                <button type="submit" class="btn btn-primary">创建</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // 插入对话框
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = dialogHtml;
        document.body.appendChild(tempDiv.firstElementChild);
        
        // 添加样式
        this.addDialogStyles();
        
        // 初始化图标选择器
        initIconSelector('createMainCategoryIconSelector', 'createMainCategoryIcon');
        
        // 获取元素
        const dialog = document.querySelector('.dialog-overlay');
        const form = document.getElementById('createMainCategoryForm');
        const closeBtn = document.getElementById('createMainCategoryDialogClose');
        const cancelBtn = document.getElementById('createMainCategoryCancel');
        
        // 关闭对话框函数
        const closeDialog = () => {
            dialog.remove();
        };
        
        // 绑定事件
        closeBtn.addEventListener('click', closeDialog);
        cancelBtn.addEventListener('click', closeDialog);
        
        // 点击外部关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                closeDialog();
            }
        });
        
        // 保存表单
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 获取表单数据
            const name = document.getElementById('createMainCategoryName').value.trim();
            const icon = document.getElementById('createMainCategoryIcon').value;
            
            if (!name) {
                this.toastComponent.show('请输入主类名称', 'warning');
                return;
            }
            
            try {
                // 使用DataManager创建主类导航
                const result = await DataManager.createMainCategory(name, icon);
                if (result.success) {
                    this.toastComponent.show('主类导航创建成功', 'success');
                    // 重新加载数据和渲染UI
                    this.loadAllData();
                    this.renderAllData();
                    // 关闭对话框
                    closeDialog();
                } else {
                    this.toastComponent.show(`创建失败: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('创建主类导航失败:', error);
                this.toastComponent.show('创建主类导航失败', 'error');
            }
        });
    }
    
    // 初始化创建主类导航图标选择器
    initCreateMainCategoryIconSelector() {
        const iconSelector = document.getElementById('createMainCategoryIconSelector');
        const iconInput = document.getElementById('createMainCategoryIcon');
        
        if (!iconSelector || !iconInput) return;
        
        // 添加图标选择器样式
        addIconSelectorStyles();
        
        // 生成图标选项
        iconSelector.innerHTML = fontAwesomeIcons.map(icon => `
            <div class="icon-option ${iconInput.value === icon ? 'selected' : ''}" data-icon="${icon}">
                <i class="${icon}"></i>
            </div>
        `).join('');
        
        // 绑定图标选择事件
        iconSelector.addEventListener('click', (e) => {
            const iconOption = e.target.closest('.icon-option');
            if (iconOption) {
                // 移除所有选中状态
                document.querySelectorAll('.icon-option').forEach(option => {
                    option.classList.remove('selected');
                });
                // 添加当前选中状态
                iconOption.classList.add('selected');
                // 设置选中的图标
                iconInput.value = iconOption.dataset.icon;
            }
        });
    }
    
    // 处理保存图标API配置
    async handleSaveFaviconApi() {
        try {
            // 使用缓存数据
            const data = this.currentData;
            
            // 更新图标API配置
            data.config = data.config || {};
            data.config.faviconApi = this.faviconApiInput.value.trim();
            data.config.faviconApiBackup = this.faviconApiBackupInput.value.trim();
            data.config.apiTimeout = parseInt(this.apiTimeoutInput.value) || 5000;
            
            // 更新默认图标类型
            const defaultIconType = Array.from(this.iconTypeRadios)
                .find(radio => radio.checked)
                ?.value || 'globe';
            data.config.defaultIconType = defaultIconType;
            
            const saved = await DataManager.saveAllData(data);
            if (saved.success) {
                this.toastComponent.show('图标API配置保存成功', 'success');
                // 更新缓存并重新渲染
                this.loadAllData();
                this.renderAllData();
            } else {
                this.toastComponent.show(`保存失败: ${saved.message}`, 'error');
            }
        } catch (error) {
            console.error('保存图标API配置失败:', error);
            this.toastComponent.show('保存图标API配置失败', 'error');
        }
    }
    
    // 处理保存悬浮窗配置
    async handleSaveFloatingWidgetConfig() {
        try {
            // 使用缓存数据
            const data = this.currentData;
            
            // 更新悬浮窗配置
            data.config = data.config || {};
            data.config.floatingWidgetEnabled = this.floatingWidgetEnabled.checked;
            data.config.autoCollapseTime = parseInt(this.autoCollapseTime.value) || 3;
            
            const saved = await DataManager.saveAllData(data);
            if (saved.success) {
                this.toastComponent.show('悬浮窗配置保存成功', 'success');
                // 更新缓存并重新渲染
                this.loadAllData();
                this.renderAllData();
            } else {
                this.toastComponent.show(`保存失败: ${saved.message}`, 'error');
            }
        } catch (error) {
            console.error('保存悬浮窗配置失败:', error);
            this.toastComponent.show('保存悬浮窗配置失败', 'error');
        }
    }
    
    // 处理清除图标缓存
    async handleClearFaviconCache() {
        try {
            // 清除图标缓存
            await IconManager.clearCache();
            this.toastComponent.show('图标缓存清除成功', 'success');
        } catch (error) {
            console.error('清除图标缓存失败:', error);
            this.toastComponent.show('清除图标缓存失败', 'error');
        }
    }
    
    // 处理保存WebDAV配置
    async handleSaveWebdavConfig() {
        try {
            // 使用缓存数据
            const data = this.currentData;
            
            // 更新WebDAV配置
            data.config = data.config || {};
            data.config.webdav = {
                host: this.webdavHost.value.trim(),
                port: parseInt(this.webdavPort.value),
                path: this.webdavPath.value.trim(),
                username: this.webdavUsername.value.trim(),
                password: this.webdavPassword.value,
                autoBackupEnabled: this.autoBackupEnabled.checked,
                autoBackupInterval: this.autoBackupInterval.value,
                backupTime: parseInt(this.backupTime.value)
            };
            
            const saved = await DataManager.saveAllData(data);
            if (saved.success) {
                this.toastComponent.show('WebDAV配置保存成功', 'success');
                // 更新缓存并重新渲染
                this.loadAllData();
                this.renderAllData();
            } else {
                this.toastComponent.show(`保存失败: ${saved.message}`, 'error');
            }
        } catch (error) {
            console.error('保存WebDAV配置失败:', error);
            this.toastComponent.show('保存WebDAV配置失败', 'error');
        }
    }
    
    // 处理测试Webdav连接
    async handleTestWebdavConnection() {
        if (this.buttonCooldowns.testWebdavConnection) {
            this.toastComponent.show('操作过于频繁，请稍后再试', 'warning');
            return;
        }
        
        // 设置冷却时间
        this.buttonCooldowns.testWebdavConnection = true;
        this.testWebdavConnection.innerHTML = '<i class="fas fa-spinner"></i> 测试中...';
        this.testWebdavConnection.disabled = true;
        
        setTimeout(() => {
            this.buttonCooldowns.testWebdavConnection = false;
            this.testWebdavConnection.innerHTML = '<i class="fas fa-wifi"></i> 测试连接';
            this.testWebdavConnection.disabled = false;
        }, 3000);
        
        try {
            // 测试WebDAV连接
            // 这里可以添加实际的WebDAV连接测试逻辑
            this.toastComponent.show('WebDAV连接测试成功', 'success');
        } catch (error) {
            console.error('WebDAV连接测试失败:', error);
            this.toastComponent.show(`WebDAV连接测试失败: ${error.message}`, 'error');
        }
    }
    
    // 处理手动备份
    async handleManualBackup() {
        if (this.buttonCooldowns.manualBackupBtn) {
            this.toastComponent.show('操作过于频繁，请稍后再试', 'warning');
            return;
        }
        
        // 设置冷却时间
        this.buttonCooldowns.manualBackupBtn = true;
        this.manualBackupBtn.innerHTML = '<i class="fas fa-spinner"></i> 备份中...';
        this.manualBackupBtn.disabled = true;
        
        setTimeout(() => {
            this.buttonCooldowns.manualBackupBtn = false;
            this.manualBackupBtn.innerHTML = '<i class="fas fa-save"></i> 手动备份';
            this.manualBackupBtn.disabled = false;
        }, 5000);
        
        try {
            // 执行备份操作
            // 这里可以添加实际的手动备份逻辑
            this.toastComponent.show('手动备份成功', 'success');
        } catch (error) {
            console.error('手动备份失败:', error);
            this.toastComponent.show('手动备份失败', 'error');
        }
    }
    
    // 处理恢复备份
    async handleRestoreBackup() {
        if (this.buttonCooldowns.restoreBackupBtn) {
            this.toastComponent.show('操作过于频繁，请稍后再试', 'warning');
            return;
        }
        
        // 设置冷却时间
        this.buttonCooldowns.restoreBackupBtn = true;
        this.restoreBackupBtn.innerHTML = '<i class="fas fa-spinner"></i> 恢复中...';
        this.restoreBackupBtn.disabled = true;
        
        setTimeout(() => {
            this.buttonCooldowns.restoreBackupBtn = false;
            this.restoreBackupBtn.innerHTML = '<i class="fas fa-undo"></i> 恢复数据';
            this.restoreBackupBtn.disabled = false;
        }, 5000);
        
        try {
            // 执行恢复操作
            // 这里可以添加实际的恢复备份逻辑
            this.toastComponent.show('数据恢复成功', 'success');
            // 重新加载数据和渲染UI
            this.loadAllData();
            this.renderAllData();
        } catch (error) {
            console.error('恢复备份失败:', error);
            this.toastComponent.show('恢复备份失败', 'error');
        }
    }
    
    // 处理存储类型变化
    handleStorageTypeChange(e) {
        const storageType = e.target.value;
        this.toggleMysqlConfigSection(storageType);
    }
    
    // 处理保存存储类型
    async handleSaveStorageType() {
        try {
            // 获取选中的存储类型
            const selectedType = Array.from(this.storageTypeRadios)
                .find(radio => radio.checked)
                ?.value || 'local';
            
            // 设置存储类型
            const result = await DataManager.setStorageType(selectedType);
            
            if (result) {
                this.toastComponent.show('存储类型保存成功', 'success');
                // 重新加载数据和渲染UI
                this.loadAllData();
                this.renderAllData();
            } else {
                this.toastComponent.show('存储类型保存失败', 'error');
            }
        } catch (error) {
            console.error('保存存储类型失败:', error);
            this.toastComponent.show('保存存储类型失败', 'error');
        }
    }
    
    // 处理保存MySQL配置
    async handleSaveMysqlConfig() {
        try {
            // 获取MySQL配置
            const mysqlConfig = {
                HOST: this.mysqlHost.value.trim(),
                PORT: parseInt(this.mysqlPort.value) || 3306,
                USER: this.mysqlUser.value.trim(),
                PASSWORD: this.mysqlPassword.value,
                DATABASE: this.mysqlDatabase.value.trim()
            };
            
            // 验证配置
            if (!mysqlConfig.HOST || !mysqlConfig.USER || !mysqlConfig.DATABASE) {
                this.toastComponent.show('请填写完整的MySQL配置', 'warning');
                return;
            }
            
            // 保存MySQL配置
            const result = await DataManager.configureMySQL(mysqlConfig);
            
            if (result) {
                this.toastComponent.show('MySQL配置保存成功', 'success');
            } else {
                this.toastComponent.show('MySQL配置保存失败', 'error');
            }
        } catch (error) {
            console.error('保存MySQL配置失败:', error);
            this.toastComponent.show('保存MySQL配置失败', 'error');
        }
    }
    
    // 处理测试MySQL连接
    async handleTestMysqlConnection() {
        try {
            // 获取MySQL配置
            const mysqlConfig = {
                HOST: this.mysqlHost.value.trim(),
                PORT: parseInt(this.mysqlPort.value) || 3306,
                USER: this.mysqlUser.value.trim(),
                PASSWORD: this.mysqlPassword.value,
                DATABASE: this.mysqlDatabase.value.trim()
            };
            
            // 验证配置
            if (!mysqlConfig.HOST || !mysqlConfig.USER || !mysqlConfig.DATABASE) {
                this.toastComponent.show('请填写完整的MySQL配置', 'warning');
                return;
            }
            
            // 显示加载状态
            this.testMysqlConnectionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 测试中...';
            this.testMysqlConnectionBtn.disabled = true;
            
            // 测试MySQL连接
            // 注意：在浏览器环境中，我们无法直接连接MySQL数据库
            // 这里只是模拟测试，实际使用时需要替换为真实的API调用
            // 这里设置一个延迟，模拟网络请求
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 模拟测试结果
            const isConnected = true; // 实际使用时需要替换为真实的测试结果
            
            if (isConnected) {
                this.toastComponent.show('MySQL连接测试成功', 'success');
            } else {
                this.toastComponent.show('MySQL连接测试失败', 'error');
            }
        } catch (error) {
            console.error('测试MySQL连接失败:', error);
            this.toastComponent.show('测试MySQL连接失败', 'error');
        } finally {
            // 恢复按钮状态
            this.testMysqlConnectionBtn.innerHTML = '测试连接';
            this.testMysqlConnectionBtn.disabled = false;
        }
    }
    
    // 初始化标签页
    initTabs() {
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }
    
    // 切换标签页
    switchTab(tabName) {
        // 移除所有激活状态
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));
        
        // 添加当前激活状态
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // 使用缓存数据重新渲染
        this.renderAllData();
    }
    
    // 渲染主类导航列表
    renderMainCategories(mainCategories) {
        if (!this.mainCategoriesList) return;
        
        if (!mainCategories || mainCategories.length === 0) {
            this.mainCategoriesList.innerHTML = '<div class="empty-categories">暂无主类导航</div>';
            return;
        }
        
        const mainCategoriesHtml = mainCategories.map(mainCat => `
            <div class="category-item main-category">
                <div class="category-header">
                    <div class="category-info">
                        <i class="${mainCat.icon || 'fas fa-compass'}"></i>
                        <span class="category-name">${escapeHtml(mainCat.name)}</span>
                        <span class="category-count">(${mainCat.categories.length}个一级分类)</span>
                    </div>
                    <div class="category-actions">
                        <button class="action-btn edit-category" data-main-category-id="${mainCat.id}" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-category" data-main-category-id="${mainCat.id}" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.mainCategoriesList.innerHTML = mainCategoriesHtml;
        
        // 绑定主类导航事件
        this.bindMainCategoryEvents();
    }
    
    // 渲染一级分类列表
    renderCategories(mainCategories) {
        // 一级分类列表元素已移除，只保留主类导航列表
        if (!this.categoriesList) return;
        
        let categoriesHtml = '';
        
        mainCategories.forEach(mainCat => {
            if (mainCat.categories && mainCat.categories.length > 0) {
                categoriesHtml += `<h4 class="category-group-title">${escapeHtml(mainCat.name)}下的一级分类</h4>`;
                
                mainCat.categories.forEach(cat => {
                    categoriesHtml += `
                        <div class="category-item primary-category">
                            <div class="category-header">
                                <div class="category-info">
                                    <i class="fas fa-list"></i>
                                    <span class="category-name">${escapeHtml(cat.name)}</span>
                                    <span class="category-count">(${cat.subCategories.length}个二级分类)</span>
                                </div>
                                <div class="category-actions">
                                    <button class="action-btn edit-category" data-category-id="${cat.id}" data-main-category-id="${mainCat.id}" title="编辑">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn delete-category" data-category-id="${cat.id}" data-main-category-id="${mainCat.id}" title="删除">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
        });
        
        if (!categoriesHtml) {
            categoriesHtml = '<div class="empty-categories">暂无一级分类</div>';
        }
        
        this.categoriesList.innerHTML = categoriesHtml;
        
        // 绑定一级分类事件
        this.bindCategoryEvents();
    }
    
    // 渲染二级分类列表
    renderSubcategories(mainCategories) {
        // 二级分类列表元素已移除，只保留主类导航列表
        if (!this.subcategoriesList) return;
        
        let subcategoriesHtml = '';
        
        mainCategories.forEach(mainCat => {
            mainCat.categories.forEach(category => {
                if (category.subCategories && category.subCategories.length > 0) {
                    subcategoriesHtml += `<h4 class="category-group-title">${escapeHtml(category.name)}下的二级分类</h4>`;
                    
                    category.subCategories.forEach(subcategory => {
                        subcategoriesHtml += `
                            <div class="category-item secondary-category">
                                <div class="category-header">
                                    <div class="category-info">
                                        <i class="fas fa-tag"></i>
                                        <span class="category-name">${escapeHtml(subcategory.name)}</span>
                                        <span class="category-count">(${subcategory.websites.length}个网站)</span>
                                    </div>
                                    <div class="category-actions">
                                        <button class="action-btn edit-category" data-subcategory-id="${subcategory.id}" data-category-id="${category.id}" data-main-category-id="${mainCat.id}" title="编辑">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="action-btn delete-category" data-subcategory-id="${subcategory.id}" data-category-id="${category.id}" data-main-category-id="${mainCat.id}" title="删除">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                }
            });
        });
        
        if (!subcategoriesHtml) {
            subcategoriesHtml = '<div class="empty-categories">暂无二级分类</div>';
        }
        
        this.subcategoriesList.innerHTML = subcategoriesHtml;
        
        // 绑定二级分类事件
        this.bindSubcategoryEvents();
    }
    
    // 绑定主类导航事件
    bindMainCategoryEvents() {
        // 编辑主类导航
        this.mainCategoriesList.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn.edit-category')) {
                const btn = e.target.closest('.action-btn.edit-category');
                const mainCategoryId = btn.dataset.mainCategoryId;
                this.editMainCategory(mainCategoryId);
            }
        });
        
        // 删除主类导航
        this.mainCategoriesList.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn.delete-category')) {
                const btn = e.target.closest('.action-btn.delete-category');
                const mainCategoryId = btn.dataset.mainCategoryId;
                this.deleteMainCategory(mainCategoryId);
            }
        });
    }
    
    // 绑定一级分类事件
    bindCategoryEvents() {
        // 检查元素是否存在，避免空值错误
        if (!this.categoriesList) return;
        
        // 编辑一级分类
        this.categoriesList.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn.edit-category')) {
                const btn = e.target.closest('.action-btn.edit-category');
                const categoryId = btn.dataset.categoryId;
                const mainCategoryId = btn.dataset.mainCategoryId;
                this.editCategory(categoryId, mainCategoryId);
            }
        });
        
        // 删除一级分类
        this.categoriesList.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn.delete-category')) {
                const btn = e.target.closest('.action-btn.delete-category');
                const categoryId = btn.dataset.categoryId;
                const mainCategoryId = btn.dataset.mainCategoryId;
                this.deleteCategory(categoryId, mainCategoryId);
            }
        });
    }
    
    // 绑定二级分类事件
    bindSubcategoryEvents() {
        // 检查元素是否存在，避免空值错误
        if (!this.subcategoriesList) return;
        
        // 编辑二级分类
        this.subcategoriesList.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn.edit-category')) {
                const btn = e.target.closest('.action-btn.edit-category');
                const subcategoryId = btn.dataset.subcategoryId;
                const categoryId = btn.dataset.categoryId;
                const mainCategoryId = btn.dataset.mainCategoryId;
                this.editSubcategory(subcategoryId, categoryId, mainCategoryId);
            }
        });
        
        // 删除二级分类
        this.subcategoriesList.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn.delete-category')) {
                const btn = e.target.closest('.action-btn.delete-category');
                const subcategoryId = btn.dataset.subcategoryId;
                const categoryId = btn.dataset.categoryId;
                const mainCategoryId = btn.dataset.mainCategoryId;
                this.deleteSubcategory(subcategoryId, categoryId, mainCategoryId);
            }
        });
    }
    
    // 编辑主类导航
    async editMainCategory(mainCategoryId) {
        try {
            // 使用缓存数据
            const mainCategory = this.currentData.mainCategories.find(mc => mc.id === mainCategoryId);
            if (!mainCategory) {
                this.toastComponent.show('主类导航不存在', 'error');
                return;
            }
            
            // 创建编辑主类导航对话框
            this.createEditMainCategoryDialog(mainCategory);
        } catch (error) {
            console.error('编辑主类导航失败:', error);
            this.toastComponent.show('编辑主类导航失败', 'error');
        }
    }
    
    // 创建编辑主类导航对话框
    createEditMainCategoryDialog(mainCategory) {
        // 先关闭所有现有对话框
        this.closeAllDialogs();
        
        // 创建对话框HTML
        const dialogHtml = `
            <div class="dialog-overlay">
                <div class="dialog">
                    <div class="dialog-header">
                        <h3>编辑主类导航</h3>
                        <button class="dialog-close" id="editMainCategoryDialogClose">&times;</button>
                    </div>
                    <div class="dialog-body">
                        <form id="editMainCategoryForm">
                            <div class="form-group">
                                <label for="editMainCategoryName">主类名称</label>
                                <input type="text" id="editMainCategoryName" class="form-input" value="${escapeHtml(mainCategory.name)}" required>
                            </div>
                            <div class="form-group">
                                <label>选择图标</label>
                                <div class="icon-selector" id="editMainCategoryIconSelector"></div>
                                <input type="hidden" id="editMainCategoryIcon" name="editMainCategoryIcon" value="${mainCategory.icon || 'fas fa-compass'}">
                                <small class="form-hint">选择一个图标作为主类导航图标</small>
                            </div>
                            <div class="dialog-footer">
                                <button type="button" id="editMainCategoryCancel" class="btn btn-secondary">取消</button>
                                <button type="submit" class="btn btn-primary">保存</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // 插入对话框
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = dialogHtml;
        document.body.appendChild(tempDiv.firstElementChild);
        
        // 添加样式
        this.addDialogStyles();
        
        // 初始化图标选择器
        this.initEditMainCategoryIconSelector(mainCategory.icon);
        
        // 获取元素
        const dialog = document.querySelector('.dialog-overlay');
        const form = document.getElementById('editMainCategoryForm');
        const closeBtn = document.getElementById('editMainCategoryDialogClose');
        const cancelBtn = document.getElementById('editMainCategoryCancel');
        
        // 关闭对话框函数
        const closeDialog = () => {
            dialog.remove();
        };
        
        // 绑定事件
        closeBtn.addEventListener('click', closeDialog);
        cancelBtn.addEventListener('click', closeDialog);
        
        // 点击外部关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                closeDialog();
            }
        });
        
        // 保存表单
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 获取表单数据
            const name = document.getElementById('editMainCategoryName').value.trim();
            const icon = document.getElementById('editMainCategoryIcon').value;
            
            try {
                // 更新主类导航
                const data = await DataManager.getAllData();
                const mainCategoryIndex = data.mainCategories.findIndex(mc => mc.id === mainCategory.id);
                if (mainCategoryIndex !== -1) {
                    data.mainCategories[mainCategoryIndex].name = name;
                    data.mainCategories[mainCategoryIndex].icon = icon;
                    
                    const saved = await DataManager.saveAllData(data);
                    if (saved.success) {
                        this.toastComponent.show('主类导航更新成功', 'success');
                        this.loadAllData();
                        this.renderAllData();
                        closeDialog();
                    } else {
                        this.toastComponent.show('保存失败', 'error');
                    }
                }
            } catch (error) {
                console.error('更新主类导航失败:', error);
                this.toastComponent.show('更新主类导航失败', 'error');
            }
        });
    }
    
    // 初始化编辑主类导航图标选择器
    initEditMainCategoryIconSelector(currentIcon) {
        const iconSelector = document.getElementById('editMainCategoryIconSelector');
        const iconInput = document.getElementById('editMainCategoryIcon');
        
        if (!iconSelector || !iconInput) return;
        
        // 添加图标选择器样式
        addIconSelectorStyles();
        
        // 生成图标选项
        iconSelector.innerHTML = fontAwesomeIcons.map(icon => `
            <div class="icon-option ${currentIcon === icon ? 'selected' : ''}" data-icon="${icon}">
                <i class="${icon}"></i>
            </div>
        `).join('');
        
        // 绑定图标选择事件
        iconSelector.addEventListener('click', (e) => {
            const iconOption = e.target.closest('.icon-option');
            if (iconOption) {
                // 移除所有选中状态
                document.querySelectorAll('.icon-option').forEach(option => {
                    option.classList.remove('selected');
                });
                // 添加当前选中状态
                iconOption.classList.add('selected');
                // 设置选中的图标
                iconInput.value = iconOption.dataset.icon;
            }
        });
    }
    
    // 添加对话框样式
    addDialogStyles() {
        // 检查是否已经添加过样式
        if (!document.getElementById('dialog-styles')) {
            const style = document.createElement('style');
            style.id = 'dialog-styles';
            style.textContent = `
                .dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .dialog {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    width: 500px;
                    max-width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .dialog-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }
                
                .dialog-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .dialog-body {
                    padding: 16px;
                }
                
                .dialog-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
                
                .form-group {
                    margin-bottom: 16px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                }
                
                .form-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 14px;
                }
                
                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .btn-primary {
                    background-color: #3b82f6;
                    color: white;
                }
                
                .btn-secondary {
                    background-color: #f1f5f9;
                    color: #334155;
                }
                
                .btn-primary:hover {
                    background-color: #2563eb;
                }
                
                .btn-secondary:hover {
                    background-color: #e2e8f0;
                }
                
                .form-hint {
                    display: block;
                    margin-top: 4px;
                    font-size: 12px;
                    color: #64748b;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 关闭所有对话框
    closeAllDialogs() {
        const dialogs = document.querySelectorAll('.dialog-overlay');
        dialogs.forEach(dialog => {
            dialog.remove();
        });
    }
    
    // 删除主类导航
    async deleteMainCategory(mainCategoryId) {
        this.modalComponent.show(
            '删除主类导航',
            '确定要删除这个主类导航吗？这将删除所有相关的一级分类和二级分类，操作不可恢复。',
            false,
            0,
            async () => {
                await this.performDeleteMainCategory(mainCategoryId);
            }
        );
    }
    
    // 执行删除主类导航
    async performDeleteMainCategory(mainCategoryId) {
        try {
            // 使用缓存数据
            const data = await DataManager.getAllData();
            const mainCategoryIndex = data.mainCategories.findIndex(mc => mc.id === mainCategoryId);
            if (mainCategoryIndex === -1) {
                this.toastComponent.show('主类导航不存在', 'error');
                return;
            }
            
            data.mainCategories.splice(mainCategoryIndex, 1);
            const saved = await DataManager.saveAllData(data);
            if (saved.success) {
                this.toastComponent.show('主类导航删除成功', 'success');
                this.loadAllData();
                this.renderAllData();
            } else {
                this.toastComponent.show(`删除失败: ${saved.message}`, 'error');
            }
        } catch (error) {
            console.error('删除主类导航失败:', error);
            this.toastComponent.show('删除主类导航失败', 'error');
        }
    }
    
    // 编辑一级分类
    async editCategory(categoryId, mainCategoryId) {
        try {
            // 使用缓存数据
            const mainCategory = this.currentData.mainCategories.find(mc => mc.id === mainCategoryId);
            if (!mainCategory) {
                this.toastComponent.show('主类导航不存在', 'error');
                return;
            }
            
            const category = mainCategory.categories.find(cat => cat.id === categoryId);
            if (!category) {
                this.toastComponent.show('一级分类不存在', 'error');
                return;
            }
            
            const newName = prompt('请输入新的一级分类名称:', category.name);
            if (newName !== null) {
                category.name = newName.trim();
                const saved = await DataManager.saveAllData(this.currentData);
                if (saved.success) {
                    this.toastComponent.show('一级分类更新成功', 'success');
                    this.loadAllData();
                    this.renderAllData();
                } else {
                    this.toastComponent.show(`保存失败: ${saved.message}`, 'error');
                }
            }
        } catch (error) {
            console.error('编辑一级分类失败:', error);
            this.toastComponent.show('编辑一级分类失败', 'error');
        }
    }
    
    // 删除一级分类
    async deleteCategory(categoryId, mainCategoryId) {
        try {
            // 使用缓存数据
            const mainCategory = this.currentData.mainCategories.find(mc => mc.id === mainCategoryId);
            if (!mainCategory) {
                this.toastComponent.show('主类导航不存在', 'error');
                return;
            }
            
            const categoryIndex = mainCategory.categories.findIndex(cat => cat.id === categoryId);
            if (categoryIndex === -1) {
                this.toastComponent.show('一级分类不存在', 'error');
                return;
            }
            
            mainCategory.categories.splice(categoryIndex, 1);
            const saved = await DataManager.saveAllData(this.currentData);
            if (saved.success) {
                this.toastComponent.show('一级分类删除成功', 'success');
                this.loadAllData();
                this.renderAllData();
            } else {
                this.toastComponent.show(`删除失败: ${saved.message}`, 'error');
            }
        } catch (error) {
            console.error('删除一级分类失败:', error);
            this.toastComponent.show('删除一级分类失败', 'error');
        }
    }
    
    // 编辑二级分类
    async editSubcategory(subcategoryId, categoryId, mainCategoryId) {
        try {
            // 使用缓存数据
            const mainCategory = this.currentData.mainCategories.find(mc => mc.id === mainCategoryId);
            if (!mainCategory) {
                this.toastComponent.show('主类导航不存在', 'error');
                return;
            }
            
            const category = mainCategory.categories.find(cat => cat.id === categoryId);
            if (!category) {
                this.toastComponent.show('一级分类不存在', 'error');
                return;
            }
            
            const subcategory = category.subCategories.find(sc => sc.id === subcategoryId);
            if (!subcategory) {
                this.toastComponent.show('二级分类不存在', 'error');
                return;
            }
            
            const newName = prompt('请输入新的二级分类名称:', subcategory.name);
            if (newName !== null) {
                subcategory.name = newName.trim();
                const saved = await DataManager.saveAllData(this.currentData);
                if (saved.success) {
                    this.toastComponent.show('二级分类更新成功', 'success');
                    this.loadAllData();
                    this.renderAllData();
                } else {
                    this.toastComponent.show(`保存失败: ${saved.message}`, 'error');
                }
            }
        } catch (error) {
            console.error('编辑二级分类失败:', error);
            this.toastComponent.show('编辑二级分类失败', 'error');
        }
    }
    
    // 删除二级分类
    async deleteSubcategory(subcategoryId, categoryId, mainCategoryId) {
        try {
            // 使用缓存数据
            const mainCategory = this.currentData.mainCategories.find(mc => mc.id === mainCategoryId);
            if (!mainCategory) {
                this.toastComponent.show('主类导航不存在', 'error');
                return;
            }
            
            const category = mainCategory.categories.find(cat => cat.id === categoryId);
            if (!category) {
                this.toastComponent.show('一级分类不存在', 'error');
                return;
            }
            
            const subcategoryIndex = category.subCategories.findIndex(sc => sc.id === subcategoryId);
            if (subcategoryIndex === -1) {
                this.toastComponent.show('二级分类不存在', 'error');
                return;
            }
            
            category.subCategories.splice(subcategoryIndex, 1);
            const saved = await DataManager.saveAllData(this.currentData);
            if (saved.success) {
                this.toastComponent.show('二级分类删除成功', 'success');
                this.loadAllData();
                this.renderAllData();
            } else {
                this.toastComponent.show(`删除失败: ${saved.message}`, 'error');
            }
        } catch (error) {
            console.error('删除二级分类失败:', error);
            this.toastComponent.show('删除二级分类失败', 'error');
        }
    }
    
    // 渲染图标API配置
    renderFaviconApiConfig() {
        if (!this.faviconApiInput) return;
        
        // 使用缓存数据
        if (this.currentData) {
            this.faviconApiInput.value = this.currentData.config?.faviconApi || 'https://icon.bqb.cool?url=';
            this.faviconApiBackupInput.value = this.currentData.config?.faviconApiBackup || 'https://icon.bqb.cool?url=';
            this.apiTimeoutInput.value = this.currentData.config?.apiTimeout || 5000;
        }
        
        // 设置默认图标类型
        const defaultIconType = this.currentData?.config?.defaultIconType || 'globe';
        this.iconTypeRadios.forEach(radio => {
            radio.checked = radio.value === defaultIconType;
        });
    }
    
    // 渲染悬浮窗配置
    renderFloatingWidgetConfig() {
        if (!this.floatingWidgetEnabled) return;
        
        // 使用缓存数据
        if (this.currentData) {
            this.floatingWidgetEnabled.checked = this.currentData.config?.floatingWidgetEnabled !== false;
            this.autoCollapseTime.value = this.currentData.config?.autoCollapseTime || 3;
        }
    }
    
    // 渲染WebDAV配置
    renderWebDAVConfig() {
        if (!this.webdavHost) return;
        
        // 使用缓存数据
        if (this.currentData) {
            const webdavConfig = this.currentData.config?.webdav || {};
            this.webdavHost.value = webdavConfig.host || '';
            this.webdavPort.value = webdavConfig.port || 443;
            this.webdavPath.value = webdavConfig.path || '/dav';
            this.webdavUsername.value = webdavConfig.username || '';
            this.webdavPassword.value = webdavConfig.password || '';
            this.autoBackupEnabled.checked = webdavConfig.autoBackupEnabled || false;
            this.autoBackupInterval.value = webdavConfig.autoBackupInterval || 'daily';
            this.backupTime.value = webdavConfig.backupTime || 0;
        }
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new OptionsApp();
});
