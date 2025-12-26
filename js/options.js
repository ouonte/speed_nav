// 选项页面主脚本 - 组件化重构
import { DataManager } from './dataManager.js';

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
function initIconSelector() {
    const iconSelector = document.getElementById('mainCategoryIconSelector');
    const iconInput = document.getElementById('mainCategoryIcon');
    
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
                transition: all 0.2s ease;
                font-size: 18px;
            }
            
            .icon-option:hover {
                border-color: #3b82f6;
                background-color: #eff6ff;
                transform: translateY(-2px);
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
        
        // 添加到容器
        this.toastContainer.appendChild(toastElement);
        this.toasts.push(toastElement);
        
        // 显示toast
        setTimeout(() => {
            toastElement.style.display = 'flex';
            toastElement.classList.add('show');
        }, 10);
        
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
        toastElement.classList.remove('show');
        toastElement.classList.add('hide');
        
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
            // 从数组中移除
            const index = this.toasts.indexOf(toastElement);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
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
        this.categoriesList = document.getElementById('categoriesList');
        this.subcategoriesList = document.getElementById('subcategoriesList');
        
        // 图标缓存按钮
        this.clearFaviconCacheBtn = document.getElementById('clearFaviconCacheBtn');
        
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
        // 绑定事件
        this.bindEvents();
        
        // 初始化标签页
        this.initTabs();
        
        // 初始化图标选择器
        initIconSelector();
        
        // 加载分类数据
        await this.loadCategories();
        
        // 加载图标API配置
        await this.loadFaviconApiConfig();
        
        // 加载WebDAV配置
        await this.loadWebDAVConfig();
    }

    bindEvents() {
        // 导出数据按钮点击事件
        this.exportBtn.addEventListener('click', () => this.handleExportData());
        
        // 导入文件选择事件
        this.importFile.addEventListener('change', () => this.handleFileSelect());
        
        // 导入数据按钮点击事件
        this.importBtn.addEventListener('click', () => this.handleImportData());
        
        // 重置数据按钮点击事件
        this.resetBtn.addEventListener('click', () => this.handleResetData());
        
        // 创建主类导航按钮点击事件
        this.createMainCategoryBtn.addEventListener('click', () => this.handleCreateMainCategory());
        
        // 保存图标API配置按钮点击事件
        this.saveFaviconApiBtn.addEventListener('click', () => this.handleSaveFaviconApi());
        
        // 清除图标缓存按钮点击事件
        this.clearFaviconCacheBtn?.addEventListener('click', () => this.handleClearFaviconCache());
        
        // WebDAV相关事件绑定
        this.saveWebdavConfig.addEventListener('click', () => this.handleSaveWebdavConfig());
        this.testWebdavConnection.addEventListener('click', () => this.handleTestWebdavConnection());
        this.manualBackupBtn.addEventListener('click', () => this.handleManualBackup());
        this.restoreBackupBtn.addEventListener('click', () => this.handleRestoreBackup());
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
        
        // 如果切换到分类管理标签页，重新加载分类数据
        if (tabName === 'categories') {
            this.loadCategories();
        }
    }
    
    // 加载分类数据
    async loadCategories() {
        try {
            const data = await DataManager.getAllData();
            this.renderMainCategories(data.mainCategories);
            this.renderCategories(data.mainCategories);
            this.renderSubcategories(data.mainCategories);
        } catch (error) {
            console.error('加载分类数据失败:', error);
            this.toastComponent.show('加载分类数据失败', 'error');
        }
    }
    
    // 渲染主类导航列表
    renderMainCategories(mainCategories) {
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
        
        // 绑定事件
        this.bindMainCategoryEvents();
    }
    
    // 渲染一级分类列表
    renderCategories(mainCategories) {
        let categoriesHtml = '';
        
        mainCategories.forEach(mainCat => {
            if (mainCat.categories && mainCat.categories.length > 0) {
                categoriesHtml += `<h4 class="category-group-title">${escapeHtml(mainCat.name)}下的一级分类</h4>`;
                
                mainCat.categories.forEach(category => {
                    categoriesHtml += `
                        <div class="category-item primary-category">
                            <div class="category-header">
                                <div class="category-info">
                                    <i class="fas fa-list"></i>
                                    <span class="category-name">${escapeHtml(category.name)}</span>
                                    <span class="category-count">(${category.subCategories.length}个二级分类)</span>
                                </div>
                                <div class="category-actions">
                                    <button class="action-btn edit-category" data-category-id="${category.id}" data-main-category-id="${mainCat.id}" title="编辑">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn delete-category" data-category-id="${category.id}" data-main-category-id="${mainCat.id}" title="删除">
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
        
        // 绑定事件
        this.bindCategoryEvents();
    }
    
    // 渲染二级分类列表
    renderSubcategories(mainCategories) {
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
        
        // 绑定事件
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
            const data = await DataManager.getAllData();
            const mainCategory = data.mainCategories.find(mc => mc.id === mainCategoryId);
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
                    if (saved) {
                        this.toastComponent.show('主类导航更新成功', 'success');
                        this.loadCategories();
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
            true,
            5,
            async () => {
                await this.performDeleteMainCategory(mainCategoryId);
            }
        );
    }
    
    // 执行删除主类导航
    async performDeleteMainCategory(mainCategoryId) {
        try {
            const data = await DataManager.getAllData();
            const mainCategoryIndex = data.mainCategories.findIndex(mc => mc.id === mainCategoryId);
            if (mainCategoryIndex === -1) {
                this.toastComponent.show('主类导航不存在', 'error');
                return;
            }
            
            data.mainCategories.splice(mainCategoryIndex, 1);
            const saved = await DataManager.saveAllData(data);
            if (saved) {
                this.toastComponent.show('主类导航删除成功', 'success');
                this.loadCategories();
            } else {
                this.toastComponent.show('删除失败', 'error');
            }
        } catch (error) {
            console.error('删除主类导航失败:', error);
            this.toastComponent.show('删除主类导航失败', 'error');
        }
    }
    
    // 编辑一级分类
    async editCategory(categoryId, mainCategoryId) {
        try {
            const data = await DataManager.getAllData();
            const mainCategory = data.mainCategories.find(mc => mc.id === mainCategoryId);
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
                const saved = await DataManager.saveAllData(data);
                if (saved) {
                    this.toastComponent.show('一级分类更新成功', 'success');
                    this.loadCategories();
                } else {
                    this.toastComponent.show('保存失败', 'error');
                }
            }
        } catch (error) {
            console.error('编辑一级分类失败:', error);
            this.toastComponent.show('编辑一级分类失败', 'error');
        }
    }
    
    // 删除一级分类
    async deleteCategory(categoryId, mainCategoryId) {
        this.modalComponent.show(
            '删除一级分类',
            '确定要删除这个一级分类吗？这将删除所有相关的二级分类和网站，操作不可恢复。',
            true,
            5,
            async () => {
                await this.performDeleteCategory(categoryId, mainCategoryId);
            }
        );
    }
    
    // 执行删除一级分类
    async performDeleteCategory(categoryId, mainCategoryId) {
        try {
            const data = await DataManager.getAllData();
            const mainCategory = data.mainCategories.find(mc => mc.id === mainCategoryId);
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
            const saved = await DataManager.saveAllData(data);
            if (saved) {
                this.toastComponent.show('一级分类删除成功', 'success');
                this.loadCategories();
            } else {
                this.toastComponent.show('删除失败', 'error');
            }
        } catch (error) {
            console.error('删除一级分类失败:', error);
            this.toastComponent.show('删除一级分类失败', 'error');
        }
    }
    
    // 编辑二级分类
    async editSubcategory(subcategoryId, categoryId, mainCategoryId) {
        try {
            const data = await DataManager.getAllData();
            const mainCategory = data.mainCategories.find(mc => mc.id === mainCategoryId);
            if (!mainCategory) {
                this.toastComponent.show('主类导航不存在', 'error');
                return;
            }
            
            const category = mainCategory.categories.find(cat => cat.id === categoryId);
            if (!category) {
                this.toastComponent.show('一级分类不存在', 'error');
                return;
            }
            
            const subcategory = category.subCategories.find(subCat => subCat.id === subcategoryId);
            if (!subcategory) {
                this.toastComponent.show('二级分类不存在', 'error');
                return;
            }
            
            const newName = prompt('请输入新的二级分类名称:', subcategory.name);
            if (newName !== null) {
                subcategory.name = newName.trim();
                const saved = await DataManager.saveAllData(data);
                if (saved) {
                    this.toastComponent.show('二级分类更新成功', 'success');
                    this.loadCategories();
                } else {
                    this.toastComponent.show('保存失败', 'error');
                }
            }
        } catch (error) {
            console.error('编辑二级分类失败:', error);
            this.toastComponent.show('编辑二级分类失败', 'error');
        }
    }
    
    // 删除二级分类
    async deleteSubcategory(subcategoryId, categoryId, mainCategoryId) {
        this.modalComponent.show(
            '删除二级分类',
            '确定要删除这个二级分类吗？这将删除所有相关的网站，操作不可恢复。',
            true,
            5,
            async () => {
                await this.performDeleteSubcategory(subcategoryId, categoryId, mainCategoryId);
            }
        );
    }
    
    // 执行删除二级分类
    async performDeleteSubcategory(subcategoryId, categoryId, mainCategoryId) {
        try {
            const data = await DataManager.getAllData();
            const mainCategory = data.mainCategories.find(mc => mc.id === mainCategoryId);
            if (!mainCategory) {
                this.toastComponent.show('主类导航不存在', 'error');
                return;
            }
            
            const category = mainCategory.categories.find(cat => cat.id === categoryId);
            if (!category) {
                this.toastComponent.show('一级分类不存在', 'error');
                return;
            }
            
            const subcategoryIndex = category.subCategories.findIndex(subCat => subCat.id === subcategoryId);
            if (subcategoryIndex === -1) {
                this.toastComponent.show('二级分类不存在', 'error');
                return;
            }
            
            category.subCategories.splice(subcategoryIndex, 1);
            const saved = await DataManager.saveAllData(data);
            if (saved) {
                this.toastComponent.show('二级分类删除成功', 'success');
                this.loadCategories();
            } else {
                this.toastComponent.show('删除失败', 'error');
            }
        } catch (error) {
            console.error('删除二级分类失败:', error);
            this.toastComponent.show('删除二级分类失败', 'error');
        }
    }

    // 处理导出数据
    async handleExportData() {
        try {
            // 显示加载状态
            this.exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 导出中...';
            this.exportBtn.disabled = true;
            
            // 导出数据
            const data = await DataManager.exportData();
            if (data) {
                // 下载JSON文件
                DataManager.downloadJSON(data);
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

    // 处理文件选择
    handleFileSelect() {
        this.importBtn.disabled = this.importFile.files.length === 0;
    }

    // 处理导入数据
    handleImportData() {
        if (!this.importFile.files.length) {
            this.toastComponent.show('请选择要导入的JSON文件', 'warning');
            return;
        }
        
        // 确认导入操作
        this.modalComponent.show(
            '导入数据确认',
            '确定要导入数据吗？这将替换当前所有数据，操作不可恢复。',
            false,
            0,
            async () => {
                await this.performImport();
            }
        );
    }

    // 执行导入操作
    async performImport() {
        // 显示加载状态
        this.importBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 导入中...';
        this.importBtn.disabled = true;
        
        try {
            const file = this.importFile.files[0];
            const result = await DataManager.importFromFile(file);
            
            if (result.valid) {
                this.toastComponent.show('数据导入成功', 'success');
            } else {
                this.toastComponent.show(`导入失败: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('导入数据失败:', error);
            this.toastComponent.show('导入数据失败', 'error');
        } finally {
            // 恢复按钮状态
            this.importBtn.innerHTML = '<i class="fas fa-file-import"></i> 导入数据';
            this.importBtn.disabled = false;
        }
    }

    // 处理重置数据
    handleResetData() {
        // 确认重置操作
        this.modalComponent.show(
            '重置数据确认',
            '确定要将数据重置为默认值吗？这将清除所有自定义数据，操作不可恢复。',
            true,
            3,
            async () => {
                await this.performReset();
            }
        );
    }

    // 执行重置操作
    async performReset() {
        // 显示加载状态
        this.resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 重置中...';
        this.resetBtn.disabled = true;
        
        try {
            const result = await DataManager.resetToDefault();
            
            if (result) {
                this.toastComponent.show('数据重置成功', 'success');
            } else {
                this.toastComponent.show('数据重置失败', 'error');
            }
        } catch (error) {
            console.error('重置数据失败:', error);
            this.toastComponent.show('数据重置失败', 'error');
        } finally {
            // 恢复按钮状态
            this.resetBtn.innerHTML = '<i class="fas fa-redo"></i> 重置数据';
            this.resetBtn.disabled = false;
        }
    }

    // 处理创建主类导航
    async handleCreateMainCategory() {
        const name = this.mainCategoryName.value.trim();
        const icon = this.mainCategoryIcon.value.trim();
        
        if (!name) {
            this.toastComponent.show('主类名称不能为空', 'warning');
            return;
        }
        
        try {
            // 使用DataManager创建主类导航
            const result = await DataManager.createMainCategory(name, icon);
            
            if (result.success) {
                this.toastComponent.show('主类导航创建成功', 'success');
                // 清空表单
                this.mainCategoryName.value = '';
                this.mainCategoryIcon.value = '';
            } else {
                this.toastComponent.show(`创建失败: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('创建主类导航失败:', error);
            this.toastComponent.show('创建主类导航失败', 'error');
        }
    }
    
    // 加载图标API配置
    async loadFaviconApiConfig() {
        try {
            const data = await DataManager.getAllData();
            const faviconApi = data.config?.faviconApi || 'https://icon.bqb.cool?url=';
            const faviconApiBackup = data.config?.faviconApiBackup || 'https://icon.bqb.cool?url=';
            const apiTimeout = data.config?.apiTimeout || 5000;
            const defaultIconType = data.config?.defaultIconType || 'globe';
            
            this.faviconApiInput.value = faviconApi;
            this.faviconApiBackupInput.value = faviconApiBackup;
            this.apiTimeoutInput.value = apiTimeout;
            
            // 设置默认图标类型单选框
            this.iconTypeRadios.forEach(radio => {
                radio.checked = radio.value === defaultIconType;
            });
        } catch (error) {
            console.error('加载图标API配置失败:', error);
            this.toastComponent.show('加载图标API配置失败', 'error');
        }
    }
    
    // 清除图标缓存
    handleClearFaviconCache() {
        try {
            let cacheCount = 0;
            
            // 遍历localStorage中的所有键
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                // 检查是否为图标缓存项
                if (key.startsWith('favicon_') || key.endsWith('_expires')) {
                    localStorage.removeItem(key);
                    cacheCount++;
                    
                    // 重新计算索引，因为localStorage的长度会变化
                    i--;
                }
            }
            
            // 显示成功消息
            this.toastComponent.show(`已清除 ${cacheCount} 个图标缓存项`, 'success');
        } catch (error) {
            console.error('清除图标缓存失败:', error);
            this.toastComponent.show('清除图标缓存失败', 'error');
        }
    }
    
    async handleSaveFaviconApi() {
        try {
            const faviconApi = this.faviconApiInput.value.trim();
            const faviconApiBackup = this.faviconApiBackupInput.value.trim();
            const apiTimeout = parseInt(this.apiTimeoutInput.value);
            
            // 获取选中的默认图标类型
            const selectedIconType = Array.from(this.iconTypeRadios).find(radio => radio.checked).value;
            
            // 验证API URL格式
            for (const apiUrl of [faviconApi, faviconApiBackup]) {
                if (apiUrl && !apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
                    this.toastComponent.show('图标API地址必须以http://或https://开头', 'warning');
                    return;
                }
            }
            
            // 验证超时时间
            if (isNaN(apiTimeout) || apiTimeout < 1000 || apiTimeout > 30000) {
                this.toastComponent.show('超时时间必须在1000-30000毫秒之间', 'warning');
                return;
            }
            
            // 获取当前数据
            const data = await DataManager.getAllData();
            
            // 更新配置
            if (!data.config) {
                data.config = {};
            }
            data.config.faviconApi = faviconApi;
            data.config.faviconApiBackup = faviconApiBackup;
            data.config.apiTimeout = apiTimeout;
            data.config.defaultIconType = selectedIconType;
            
            // 保存数据
            const saved = await DataManager.saveAllData(data);
            
            if (saved) {
                this.toastComponent.show('图标API配置保存成功', 'success');
            } else {
                this.toastComponent.show('图标API配置保存失败', 'error');
            }
        } catch (error) {
            console.error('保存图标API配置失败:', error);
            this.toastComponent.show('保存图标API配置失败', 'error');
        }
    }
    
    // WebDAV相关方法
    
    /**
     * 解析URL为host、port、path
     * @param {string} url - 完整URL
     * @returns {Object} 解析后的配置
     */
    parseUrl(url) {
        try {
            if (!url) {
                return { host: '', port: 443, path: '/dav' };
            }
            
            // 确保URL有协议
            let fullUrl = url;
            if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
                fullUrl = `https://${fullUrl}`;
            }
            
            const urlObj = new URL(fullUrl);
            return {
                host: urlObj.hostname,
                port: parseInt(urlObj.port) || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname || '/dav'
            };
        } catch (error) {
            return { host: '', port: 443, path: '/dav' };
        }
    }
    
    /**
     * 构建完整URL
     * @param {Object} config - 配置对象
     * @returns {string} 完整URL
     */
    buildUrl(config) {
        const { host, port, path } = config;
        if (!host) {
            return '';
        }
        
        const protocol = port === 443 ? 'https' : 'http';
        // 确保路径以/开头
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        
        // 只在端口不是默认端口时添加端口
        const portStr = (port === 443 || port === 80) ? '' : `:${port}`;
        
        return `${protocol}://${host}${portStr}${normalizedPath}`;
    }
    
    /**
     * 加载WebDAV配置
     */
    async loadWebDAVConfig() {
        try {
            const webdavConfig = await DataManager.getWebDAVConfig();
            
            // 解析URL为host、port、path
            const parsed = this.parseUrl(webdavConfig.url);
            
            this.webdavHost.value = parsed.host || '';
            this.webdavPort.value = parsed.port || 443;
            this.webdavPath.value = parsed.path || '/dav';
            this.webdavUsername.value = webdavConfig.username || '';
            this.webdavPassword.value = webdavConfig.password || '';
            this.autoBackupEnabled.checked = webdavConfig.autoBackupEnabled || false;
            this.autoBackupInterval.value = webdavConfig.autoBackupInterval || 'daily';
            this.backupTime.value = webdavConfig.backupTime || 0;
        } catch (error) {
            console.error('加载WebDAV配置失败:', error);
            this.toastComponent.show('加载WebDAV配置失败', 'error');
        }
    }
    
    /**
     * 保存WebDAV配置
     */
    async handleSaveWebdavConfig() {
        try {
            const webdavHost = this.webdavHost.value.trim();
            const webdavPort = parseInt(this.webdavPort.value);
            const webdavPath = this.webdavPath.value.trim();
            const webdavUsername = this.webdavUsername.value.trim();
            const webdavPassword = this.webdavPassword.value.trim();
            const autoBackupEnabled = this.autoBackupEnabled.checked;
            const autoBackupInterval = this.autoBackupInterval.value;
            const backupTime = parseInt(this.backupTime.value);
            
            // 验证主机地址
            if (!webdavHost) {
                this.toastComponent.show('请输入WebDAV服务器地址', 'warning');
                return;
            }
            
            // 验证端口
            if (isNaN(webdavPort) || webdavPort < 1 || webdavPort > 65535) {
                this.toastComponent.show('端口必须在1-65535之间', 'warning');
                return;
            }
            
            // 验证备份时间
            if (isNaN(backupTime) || backupTime < 0 || backupTime > 23) {
                this.toastComponent.show('备份时间必须在0-23小时之间', 'warning');
                return;
            }
            
            // 构建完整URL
            const url = this.buildUrl({ host: webdavHost, port: webdavPort, path: webdavPath });
            
            const webdavConfig = {
                url,
                username: webdavUsername,
                password: webdavPassword,
                autoBackupEnabled,
                autoBackupInterval,
                backupTime
            };
            
            const saved = await DataManager.saveWebDAVConfig(webdavConfig);
            
            if (saved) {
                this.toastComponent.show('WebDAV配置保存成功', 'success');
            } else {
                this.toastComponent.show('WebDAV配置保存失败', 'error');
            }
        } catch (error) {
            console.error('保存WebDAV配置失败:', error);
            this.toastComponent.show('保存WebDAV配置失败', 'error');
        }
    }
    
    /**
     * 测试WebDAV连接
     */
    async handleTestWebdavConnection() {
        // 检查冷却时间
        if (this.buttonCooldowns.testWebdavConnection) {
            this.toastComponent.show('操作过于频繁，请稍后再试', 'warning');
            return;
        }
        
        try {
            const webdavHost = this.webdavHost.value.trim();
            const webdavPort = parseInt(this.webdavPort.value);
            const webdavPath = this.webdavPath.value.trim();
            const webdavUsername = this.webdavUsername.value.trim();
            const webdavPassword = this.webdavPassword.value.trim();
            
            if (!webdavHost) {
                this.toastComponent.show('请输入WebDAV服务器地址', 'warning');
                return;
            }
            
            // 构建完整URL
            const url = this.buildUrl({ host: webdavHost, port: webdavPort, path: webdavPath });
            
            // 显示加载状态
            const originalText = this.testWebdavConnection.innerHTML;
            this.testWebdavConnection.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 测试中...';
            this.testWebdavConnection.disabled = true;
            
            // 设置冷却时间
            this.buttonCooldowns.testWebdavConnection = true;
            setTimeout(() => {
                this.buttonCooldowns.testWebdavConnection = false;
            }, 2000);
            
            const result = await DataManager.testWebDAVConnection({
                url,
                username: webdavUsername,
                password: webdavPassword
            });
            
            if (result.success) {
                this.toastComponent.show(result.message, 'success');
            } else {
                this.toastComponent.show(result.message, 'error');
            }
        } catch (error) {
            console.error('测试WebDAV连接失败:', error);
            this.toastComponent.show(`测试连接失败: ${error.message}`, 'error');
        } finally {
            // 恢复按钮状态
            this.testWebdavConnection.innerHTML = '<i class="fas fa-check"></i> 测试连接';
            this.testWebdavConnection.disabled = false;
        }
    }
    
    /**
     * 手动备份数据到WebDAV
     */
    async handleManualBackup() {
        // 检查冷却时间
        if (this.buttonCooldowns.manualBackupBtn) {
            this.toastComponent.show('操作过于频繁，请稍后再试', 'warning');
            return;
        }
        
        try {
            const webdavHost = this.webdavHost.value.trim();
            const webdavPort = parseInt(this.webdavPort.value);
            const webdavPath = this.webdavPath.value.trim();
            const webdavUsername = this.webdavUsername.value.trim();
            const webdavPassword = this.webdavPassword.value.trim();
            
            if (!webdavHost) {
                this.toastComponent.show('请配置WebDAV服务器地址', 'warning');
                return;
            }
            
            // 构建完整URL
            const url = this.buildUrl({ host: webdavHost, port: webdavPort, path: webdavPath });
            
            // 显示加载状态
            const originalText = this.manualBackupBtn.innerHTML;
            this.manualBackupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 备份中...';
            this.manualBackupBtn.disabled = true;
            
            // 设置冷却时间
            this.buttonCooldowns.manualBackupBtn = true;
            setTimeout(() => {
                this.buttonCooldowns.manualBackupBtn = false;
            }, 2000);
            
            const result = await DataManager.backupToWebDAV({
                url,
                username: webdavUsername,
                password: webdavPassword
            });
            
            if (result.success) {
                this.toastComponent.show(result.message, 'success');
            } else {
                this.toastComponent.show(result.message, 'error');
            }
        } catch (error) {
            console.error('手动备份失败:', error);
            this.toastComponent.show(`手动备份失败: ${error.message}`, 'error');
        } finally {
            // 恢复按钮状态
            this.manualBackupBtn.innerHTML = '<i class="fas fa-save"></i> 手动备份';
            this.manualBackupBtn.disabled = false;
        }
    }
    
    /**
     * 从WebDAV恢复数据
     */
    async handleRestoreBackup() {
        try {
            const webdavHost = this.webdavHost.value.trim();
            const webdavPort = parseInt(this.webdavPort.value);
            const webdavPath = this.webdavPath.value.trim();
            const webdavUsername = this.webdavUsername.value.trim();
            const webdavPassword = this.webdavPassword.value.trim();
            
            if (!webdavHost) {
                this.toastComponent.show('请配置WebDAV服务器地址', 'warning');
                return;
            }
            
            // 构建完整URL
            const url = this.buildUrl({ host: webdavHost, port: webdavPort, path: webdavPath });
            
            // 确认恢复操作
            this.modalComponent.show(
                '恢复数据确认',
                '确定要从WebDAV恢复数据吗？这将替换当前所有数据，操作不可恢复。',
                false,
                0,
                async () => {
                    await this.performRestoreBackup(url, webdavUsername, webdavPassword);
                }
            );
        } catch (error) {
            console.error('恢复数据失败:', error);
            this.toastComponent.show(`恢复数据失败: ${error.message}`, 'error');
        }
    }
    
    /**
     * 执行从WebDAV恢复数据
     */
    async performRestoreBackup(webdavUrl, webdavUsername, webdavPassword) {
        // 检查冷却时间
        if (this.buttonCooldowns.restoreBackupBtn) {
            this.toastComponent.show('操作过于频繁，请稍后再试', 'warning');
            return;
        }
        
        try {
            // 显示加载状态
            const originalText = this.restoreBackupBtn.innerHTML;
            this.restoreBackupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 恢复中...';
            this.restoreBackupBtn.disabled = true;
            
            // 设置冷却时间
            this.buttonCooldowns.restoreBackupBtn = true;
            setTimeout(() => {
                this.buttonCooldowns.restoreBackupBtn = false;
            }, 2000);
            
            const result = await DataManager.restoreFromWebDAV({
                url: webdavUrl,
                username: webdavUsername,
                password: webdavPassword
            });
            
            if (result.success) {
                this.toastComponent.show(result.message, 'success');
                // 重新加载分类数据
                await this.loadCategories();
            } else {
                this.toastComponent.show(result.message, 'error');
            }
        } catch (error) {
            console.error('执行恢复数据失败:', error);
            this.toastComponent.show(`恢复数据失败: ${error.message}`, 'error');
        } finally {
            // 恢复按钮状态
            this.restoreBackupBtn.innerHTML = '<i class="fas fa-cloud-download-alt"></i> 恢复数据';
            this.restoreBackupBtn.disabled = false;
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new OptionsApp();
});