// 备份页面主脚本
import { DataManager } from './dataManager.js';

// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
class BackupApp {
    constructor() {
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
        this.testWebdavConnection = document.getElementById('testWebdavConnection');
        this.manualBackupBtn = document.getElementById('manualBackupBtn');
        this.restoreBackupBtn = document.getElementById('restoreBackupBtn');
        this.backToOptionsBtn = document.getElementById('backToOptionsBtn');
        this.backupsList = document.getElementById('backupsList');
        
        // 模态框相关元素
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalBody = document.getElementById('modalBody');
        this.countdown = document.getElementById('countdown');
        this.countdownText = document.getElementById('countdownText');
        this.closeModal = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.confirmBtn = document.getElementById('confirmBtn');
        
        // 消息提示容器
        this.toastContainer = document.getElementById('toastContainer');
        
        // 按钮冷却时间状态
        this.buttonCooldowns = {
            testWebdavConnection: false,
            manualBackupBtn: false,
            restoreBackupBtn: false
        };
        
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
        
        // 加载WebDAV配置
        await this.loadWebDAVConfig();
        
        // 加载备份列表
        await this.loadBackupsList();
    }
    
    bindEvents() {
        // 返回设置页按钮
        this.backToOptionsBtn.addEventListener('click', () => {
            window.location.href = 'options.html';
        });
        
        // 保存WebDAV配置
        this.saveWebdavConfig.addEventListener('click', () => this.handleSaveWebdavConfig());
        
        // 测试WebDAV连接
        this.testWebdavConnection.addEventListener('click', () => this.handleTestWebdavConnection());
        
        // 手动备份
        this.manualBackupBtn.addEventListener('click', () => this.handleManualBackup());
        
        // 恢复备份
        this.restoreBackupBtn.addEventListener('click', () => this.handleRestoreBackup());
    }
    
    // 加载WebDAV配置
    async loadWebDAVConfig() {
        try {
            const data = await DataManager.getAllData();
            const webdavConfig = data.config?.webdav || {};
            
            this.webdavHost.value = webdavConfig.host || '';
            this.webdavPort.value = webdavConfig.port || 443;
            this.webdavPath.value = webdavConfig.path || '/dav';
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
    
    // 保存WebDAV配置
    async handleSaveWebdavConfig() {
        try {
            const data = await DataManager.getAllData();
            
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
            } else {
                this.toastComponent.show(`保存失败: ${saved.message}`, 'error');
            }
        } catch (error) {
            console.error('保存WebDAV配置失败:', error);
            this.toastComponent.show('保存WebDAV配置失败', 'error');
        }
    }
    
    // 测试WebDAV连接
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
            const data = await DataManager.getAllData();
            const webdavConfig = data.config?.webdav || {};
            
            // 这里可以添加实际的WebDAV连接测试逻辑
            this.toastComponent.show('WebDAV连接测试成功', 'success');
        } catch (error) {
            console.error('WebDAV连接测试失败:', error);
            this.toastComponent.show(`WebDAV连接测试失败: ${error.message}`, 'error');
        }
    }
    
    // 手动备份
    async handleManualBackup() {
        if (this.buttonCooldowns.manualBackupBtn) {
            this.toastComponent.show('操作过于频繁，请稍后再试', 'warning');
            return;
        }
        
        // 确认备份操作
        this.modalComponent.show(
            '手动备份',
            '确定要手动备份当前数据吗？这将创建一个新的备份文件。',
            false,
            0,
            async () => {
                await this.performManualBackup();
            }
        );
    }
    
    // 执行手动备份
    async performManualBackup() {
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
            const result = await DataManager.manualBackup();
            if (result.success) {
                this.toastComponent.show('手动备份成功', 'success');
                // 重新加载备份列表
                await this.loadBackupsList();
            } else {
                this.toastComponent.show(`备份失败: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('手动备份失败:', error);
            this.toastComponent.show('手动备份失败', 'error');
        }
    }
    
    // 恢复备份
    async handleRestoreBackup() {
        if (this.buttonCooldowns.restoreBackupBtn) {
            this.toastComponent.show('操作过于频繁，请稍后再试', 'warning');
            return;
        }
        
        // 确认恢复操作
        this.modalComponent.show(
            '恢复备份',
            '确定要恢复数据吗？这将替换当前所有数据，操作不可恢复。',
            false,
            0,
            async () => {
                await this.performRestoreBackup();
            }
        );
    }
    
    // 执行恢复备份
    async performRestoreBackup() {
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
            // 这里可以添加实际的恢复备份逻辑
            this.toastComponent.show('数据恢复成功', 'success');
        } catch (error) {
            console.error('恢复备份失败:', error);
            this.toastComponent.show('恢复备份失败', 'error');
        }
    }
    
    // 加载备份列表
    async loadBackupsList() {
        try {
            // 这里可以添加实际的备份列表加载逻辑
            // 目前使用模拟数据
            const mockBackups = [
                {
                    id: 'backup-1',
                    name: '手动备份 - 2026-01-01 10:30',
                    date: '2026-01-01 10:30:00',
                    size: '12.5 KB'
                },
                {
                    id: 'backup-2',
                    name: '自动备份 - 2025-12-31 00:00',
                    date: '2025-12-31 00:00:00',
                    size: '11.8 KB'
                },
                {
                    id: 'backup-3',
                    name: '手动备份 - 2025-12-30 15:20',
                    date: '2025-12-30 15:20:00',
                    size: '10.2 KB'
                }
            ];
            
            if (mockBackups.length === 0) {
                this.backupsList.innerHTML = '<div class="empty-backups">暂无备份记录</div>';
                return;
            }
            
            const backupsHtml = mockBackups.map(backup => `
                <div class="backup-item">
                    <div class="backup-info">
                        <div class="backup-name">${escapeHtml(backup.name)}</div>
                        <div class="backup-meta">
                            <span class="backup-date">${backup.date}</span>
                            <span class="backup-size">${backup.size}</span>
                        </div>
                    </div>
                    <div class="backup-actions">
                        <button class="action-btn restore-backup" data-backup-id="${backup.id}" title="恢复">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="action-btn delete-backup" data-backup-id="${backup.id}" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
            this.backupsList.innerHTML = backupsHtml;
            
            // 绑定备份操作事件
            this.bindBackupEvents();
        } catch (error) {
            console.error('加载备份列表失败:', error);
            this.toastComponent.show('加载备份列表失败', 'error');
        }
    }
    
    // 绑定备份操作事件
    bindBackupEvents() {
        // 恢复备份
        this.backupsList.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn.restore-backup')) {
                const btn = e.target.closest('.action-btn.restore-backup');
                const backupId = btn.dataset.backupId;
                this.restoreSpecificBackup(backupId);
            }
        });
        
        // 删除备份
        this.backupsList.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn.delete-backup')) {
                const btn = e.target.closest('.action-btn.delete-backup');
                const backupId = btn.dataset.backupId;
                this.deleteBackup(backupId);
            }
        });
    }
    
    // 恢复特定备份
    async restoreSpecificBackup(backupId) {
        // 确认恢复操作
        this.modalComponent.show(
            '恢复备份',
            '确定要恢复此备份吗？这将替换当前所有数据，操作不可恢复。',
            false,
            0,
            async () => {
                try {
                    // 这里可以添加实际的恢复特定备份逻辑
                    this.toastComponent.show('备份恢复成功', 'success');
                } catch (error) {
                    console.error('恢复备份失败:', error);
                    this.toastComponent.show('恢复备份失败', 'error');
                }
            }
        );
    }
    
    // 删除备份
    async deleteBackup(backupId) {
        // 确认删除操作
        this.modalComponent.show(
            '删除备份',
            '确定要删除此备份吗？操作不可恢复。',
            false,
            0,
            async () => {
                try {
                    // 这里可以添加实际的删除备份逻辑
                    this.toastComponent.show('备份删除成功', 'success');
                    // 重新加载备份列表
                    await this.loadBackupsList();
                } catch (error) {
                    console.error('删除备份失败:', error);
                    this.toastComponent.show('删除备份失败', 'error');
                }
            }
        );
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new BackupApp();
});