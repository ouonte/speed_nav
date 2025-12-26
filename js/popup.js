// 弹出页面主脚本 - 组件化重构
import { DataManager } from './dataManager.js';

// 浏览器API兼容层 - 统一Promise接口
const browserAPI = {
    tabs: {
        query: (options) => {
            return new Promise((resolve) => {
                if (typeof chrome !== 'undefined' && chrome.tabs) {
                    chrome.tabs.query(options, (result) => {
                        resolve(result);
                    });
                } else if (typeof browser !== 'undefined' && browser.tabs) {
                    browser.tabs.query(options).then(resolve);
                } else {
                    resolve([]);
                }
            });
        },
        create: (options) => {
            return new Promise((resolve) => {
                if (typeof chrome !== 'undefined' && chrome.tabs) {
                    chrome.tabs.create(options, (tab) => {
                        resolve(tab);
                    });
                } else if (typeof browser !== 'undefined' && browser.tabs) {
                    browser.tabs.create(options).then(resolve);
                } else {
                    resolve(null);
                }
            });
        }
    },
    runtime: {
        openOptionsPage: () => {
            return new Promise((resolve) => {
                if (typeof chrome !== 'undefined' && chrome.runtime) {
                    chrome.runtime.openOptionsPage(resolve);
                } else if (typeof browser !== 'undefined' && browser.runtime) {
                    browser.runtime.openOptionsPage().then(resolve);
                } else {
                    resolve();
                }
            });
        }
    },
    storage: typeof chrome !== 'undefined' ? chrome.storage : (browser && browser.storage ? browser.storage : null)
};

// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 内存缓存，用于缓存已获取的图标，减少对localStorage的访问
let faviconMemoryCache = new Map();

// 获取网站图标URL - 主选通过官网链接加上/favicon.ico，备用使用API，默认使用小网络地球图标
async function getFaviconUrl(url) {
    try {
        if (!url) {
            console.error('获取favicon失败: URL为空');
            return '';
        }
        
        // 确保URL有协议头
        let processedUrl = url;
        if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            processedUrl = `https://${processedUrl}`;
        }
        
        // 移除URL中可能存在的空格和特殊字符
        const cleanUrl = processedUrl.replace(/[`\s]/g, '');
        
        // 生成缓存键
        const cacheKey = `favicon_${btoa(cleanUrl)}`;
        
        // 1. 首先检查内存缓存
        if (faviconMemoryCache.has(cacheKey)) {
            const cached = faviconMemoryCache.get(cacheKey);
            const now = Date.now();
            if (now < cached.expires) {
                console.log('从内存缓存获取favicon:', url, '→', cached.url);
                return cached.url;
            } else {
                // 内存缓存已过期，删除它
                faviconMemoryCache.delete(cacheKey);
                console.log('内存缓存已过期，删除它:', url);
            }
        }
        
        // 2. 检查localStorage缓存
        const cachedFavicon = localStorage.getItem(cacheKey);
        const cachedExpires = localStorage.getItem(`${cacheKey}_expires`);
        
        if (cachedFavicon && cachedExpires) {
            const now = Date.now();
            const expires = parseInt(cachedExpires);
            if (now < expires) {
                console.log('从localStorage获取favicon:', url, '→', cachedFavicon);
                // 同时更新到内存缓存
                faviconMemoryCache.set(cacheKey, { url: cachedFavicon, expires });
                return cachedFavicon;
            } else {
                // 缓存已过期，删除它
                localStorage.removeItem(cacheKey);
                localStorage.removeItem(`${cacheKey}_expires`);
                console.log('localStorage缓存已过期，删除它:', url);
            }
        }
        
        // 尝试加载图片，返回Promise
        function tryLoadImage(iconUrl, timeout = 5000) {
            // 根据URL类型调整超时时间
            // 本地favicon.ico使用较短超时时间
            if (iconUrl.includes('/favicon.ico')) {
                timeout = Math.min(timeout, 2000); // 最大2秒
            } else if (iconUrl.includes('google.com/s2/favicons')) {
                // Google服务使用中等超时时间
                timeout = Math.min(timeout, 3000); // 最大3秒
            }
            
            return new Promise((resolve, reject) => {
                const img = new Image();
                const timer = setTimeout(() => {
                    reject(new Error(`Image load timeout: ${iconUrl}`));
                }, timeout);
                
                img.onload = () => {
                    clearTimeout(timer);
                    resolve(iconUrl);
                };
                
                img.onerror = () => {
                    clearTimeout(timer);
                    reject(new Error(`Failed to load image: ${iconUrl}`));
                };
                
                // 添加crossOrigin属性，避免跨域问题
                img.crossOrigin = 'anonymous';
                img.src = iconUrl;
            });
        }
        
        // 使用正则表达式从网页中提取图标
        async function extractIconWithRegex(url, timeout = 5000) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    timeout: timeout,
                    headers: {
                        'Accept': 'text/html'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch page: ${response.status}`);
                }
                
                const html = await response.text();
                
                // 内置的正则表达式，用于匹配不同类型的图标
                const regexPatterns = [
                    // 标准link rel="icon"
                    /<link[^>]*rel=["']icon["'][^>]*href=["']([^"']+)["'][^>]*>/i,
                    // 苹果触摸图标
                    /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["'][^>]*>/i,
                    // 快捷图标
                    /<link[^>]*rel=["']shortcut icon["'][^>]*href=["']([^"']+)["'][^>]*>/i,
                    // 更大的图标
                    /<link[^>]*rel=["']apple-touch-icon-precomposed["'][^>]*href=["']([^"']+)["'][^>]*>/i
                ];
                
                let matchedUrl = null;
                
                // 尝试每个正则表达式
                for (const pattern of regexPatterns) {
                    const match = html.match(pattern);
                    if (match && match[1]) {
                        matchedUrl = match[1];
                        break;
                    }
                }
                
                if (matchedUrl) {
                    // 处理相对URL
                    if (!matchedUrl.startsWith('http://') && !matchedUrl.startsWith('https://')) {
                        const baseUrl = new URL(url);
                        matchedUrl = new URL(matchedUrl, baseUrl).href;
                    }
                    
                    console.log(`使用正则表达式提取图标: ${url} → ${matchedUrl}`);
                    return matchedUrl;
                }
            } catch (error) {
                console.error(`使用正则表达式提取图标失败: ${url}`, error.message);
            }
            return null;
        }
        
        let finalUrl = '';
        const urlObj = new URL(cleanUrl);
        const domain = urlObj.hostname;
        const protocol = urlObj.protocol;
        const data = await DataManager.getAllData();
        
        // 获取配置
        const faviconApi = data.config?.faviconApi || 'https://icon.bqb.cool?url=';
        const faviconApiBackup = data.config?.faviconApiBackup || 'https://icon.bqb.cool?url=';
        const apiTimeout = data.config?.apiTimeout || 5000;
        
        // 构建所有可能的图标获取方法，按照优先级排序
        const iconMethods = [];
        
        // 1. 首选：直接访问网站的/favicon.ico
        iconMethods.push({
            type: 'local',
            url: `${protocol}//${domain}/favicon.ico`,
            name: '本地favicon.ico'
        });
        
        // 2. 次选：尝试从网页HTML中提取图标
        iconMethods.push({
            type: 'html',
            name: 'HTML提取图标'
        });
        
        if (faviconApi) {
            // 3. 主选：使用主API获取
            iconMethods.push({
                type: 'api',
                url: `${faviconApi}${encodeURIComponent(cleanUrl)}`,
                name: '主API'
            });
        }
        
        if (faviconApiBackup) {
            // 4. 备选：使用备选API获取
            iconMethods.push({
                type: 'api',
                url: `${faviconApiBackup}${encodeURIComponent(cleanUrl)}`,
                name: '备选API'
            });
        }
        
        // 5. 最终备用：使用Google服务
        iconMethods.push({
            type: 'api',
            url: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            name: 'Google服务'
        });
        
        // 尝试每个方法，直到成功
        for (const method of iconMethods) {
            try {
                let iconUrl = '';
                
                if (method.type === 'html') {
                    // 处理HTML提取图标方法
                    console.log(`尝试获取图标 [${method.name}]: ${url}`);
                    iconUrl = await extractIconWithRegex(cleanUrl, apiTimeout);
                    if (iconUrl) {
                        // 验证提取的图标是否可访问
                        await tryLoadImage(iconUrl, apiTimeout);
                        console.log(`成功获取图标 [${method.name}]: ${url} → ${iconUrl}`);
                        finalUrl = iconUrl;
                        break; // 获取成功，跳出循环
                    }
                } else {
                    // 处理其他类型方法（local, api）
                    console.log(`尝试获取图标 [${method.name}]: ${url} → ${method.url}`);
                    
                    // 直接加载图标URL
                    await tryLoadImage(method.url, apiTimeout);
                    iconUrl = method.url;
                    
                    finalUrl = iconUrl;
                    console.log(`成功获取图标 [${method.name}]: ${url} → ${iconUrl}`);
                    break; // 获取成功，跳出循环
                }
            } catch (error) {
                console.error(`获取图标失败 [${method.name}]: ${url}`, error.message);
                // 继续尝试下一个方法
            }
        }
        
        if (finalUrl) {
            // 计算过期时间（7天）
            const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
            
            // 保存到内存缓存
            faviconMemoryCache.set(cacheKey, { url: finalUrl, expires });
            
            // 保存到本地缓存，有效期为7天
            localStorage.setItem(cacheKey, finalUrl);
            localStorage.setItem(`${cacheKey}_expires`, expires.toString());
            
            return finalUrl;
        } else {
            // 所有方法都失败，返回空字符串，让浏览器显示默认图标
            console.error(`所有方法获取favicon都失败: ${url}`);
            return '';
        }
    } catch (error) {
        console.error('获取favicon失败:', url, error.message);
        return '';
    }
}

// 添加默认图标样式
function addDefaultIconStyles() {
    // 检查是否已经添加过样式
    if (!document.getElementById('default-icon-styles')) {
        const style = document.createElement('style');
        style.id = 'default-icon-styles';
        style.textContent = `
            .website-icon {
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 8px;
                border-radius: 8px;
                background-color: var(--bg-secondary);
            }
            .website-icon i {
                font-size: 24px; /* 控制错误图标的大小 */
                color: var(--text-muted); /* 控制错误图标的颜色 */
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .website-icon img {
                width: 32px;
                height: 32px;
                object-fit: contain;
                border-radius: 4px;
            }
            .website-icon .text-icon {
                font-size: 24px;
                font-weight: bold;
                color: var(--text-primary);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
    }
}

// Toast通知组件
// 先移除旧的toast元素
const oldToast = document.getElementById('toast');
if (oldToast) {
    oldToast.remove();
}

// Toast通知组件 - 支持多个提示实例
class Toast {
    constructor() {
        this.toastContainer = null;
        this.init();
        this.activeToasts = new Set(); // 存储当前活跃的可撤销提示ID
        this.maxToasts = 3; // 最大可撤销提示数量
        this.toastElements = new Map(); // 存储toast元素和相关信息
    }

    init() {
        // 创建toast容器
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.className = 'toast-container';
        document.body.appendChild(this.toastContainer);
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .toast-container {
                position: fixed;
                top: 80px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                z-index: 1000;
                max-height: 300px;
                overflow: hidden;
            }
            
            .toast {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 20px;
                background-color: #4caf50;
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideInRight 0.3s ease;
                font-size: 14px;
                font-weight: 500;
                opacity: 1;
                transition: all 0.3s ease;
            }
            
            .toast.error {
                background-color: #f44336;
            }
            
            .toast.warning {
                background-color: #ff9800;
            }
            
            .toast.success {
                background-color: #4caf50;
            }
            
            .toast i {
                font-size: 18px;
            }
            
            .toast-actions {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-left: auto;
            }
            
            .toast-countdown {
                font-size: 12px;
                opacity: 0.8;
            }
            
            .toast-undo-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .toast-undo-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
            
            .toast.hide {
                animation: fadeOut 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        // 绑定撤销按钮点击事件
        this.toastElement.querySelector('.toast-undo-btn').addEventListener('click', () => {
            this.handleUndo();
        });
    }

    show(message, type = 'success', options = {}) {
        // 检查可撤销提示数量限制
        if (options.undoable) {
            if (this.activeToasts.size >= this.maxToasts) {
                return false; // 返回false表示无法显示更多可撤销提示
            }
        }
        
        // 创建新的toast元素
        const toastId = `toast_${Date.now()}`;
        const toastElement = document.createElement('div');
        toastElement.className = `toast ${type}`;
        toastElement.id = toastId;
        
        // 添加HTML结构
        toastElement.innerHTML = `
            <span class="toast-message">${message}</span>
            <div class="toast-actions">
                <span class="toast-countdown">3s</span>
                <button class="toast-undo-btn">撤销</button>
            </div>
        `;
        
        // 添加到容器
        this.toastContainer.appendChild(toastElement);
        
        // 显示/隐藏撤销操作区域
        const actionsElement = toastElement.querySelector('.toast-actions');
        const undoBtn = toastElement.querySelector('.toast-undo-btn');
        const countdownElement = toastElement.querySelector('.toast-countdown');
        
        if (options.undoable) {
            actionsElement.style.display = 'flex';
            
            // 添加到活跃列表
            this.activeToasts.add(toastId);
            
            // 开始倒计时
            this.startCountdown(toastId, countdownElement, options.onUndo);
        } else {
            actionsElement.style.display = 'none';
            
            // 非可撤销的toast 3秒后自动隐藏
            const hideTimeout = setTimeout(() => {
                this.hide(toastId);
            }, 3000);
            
            // 保存toast信息
            this.toastElements.set(toastId, {
                element: toastElement,
                hideTimeout: hideTimeout,
                undoable: false
            });
        }
        
        return true; // 返回true表示成功显示
    }
    
    startCountdown(toastId, countdownElement, onUndoCallback) {
        let countdown = 3;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = `${countdown}s`;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.hide(toastId);
            }
        }, 1000);
        
        // 3秒后自动隐藏
        const hideTimeout = setTimeout(() => {
            clearInterval(countdownInterval);
            this.hide(toastId);
        }, 3000);
        
        // 绑定撤销按钮点击事件
        const undoBtn = countdownElement.parentElement.querySelector('.toast-undo-btn');
        undoBtn.addEventListener('click', () => {
            if (onUndoCallback) {
                onUndoCallback();
            }
            this.hide(toastId, countdownInterval, hideTimeout);
        });
        
        // 保存toast信息
        this.toastElements.set(toastId, {
            element: document.getElementById(toastId),
            countdownInterval: countdownInterval,
            hideTimeout: hideTimeout,
            undoable: true
        });
    }
    
    hide(toastId, countdownInterval = null, hideTimeout = null) {
        const toastInfo = this.toastElements.get(toastId);
        if (!toastInfo) return;
        
        // 清除定时器
        if (countdownInterval) {
            clearInterval(countdownInterval);
        } else if (toastInfo.countdownInterval) {
            clearInterval(toastInfo.countdownInterval);
        }
        
        if (hideTimeout) {
            clearTimeout(hideTimeout);
        } else if (toastInfo.hideTimeout) {
            clearTimeout(toastInfo.hideTimeout);
        }
        
        // 从活跃列表中移除
        if (toastInfo.undoable) {
            this.activeToasts.delete(toastId);
        }
        
        // 隐藏元素
        const toastElement = toastInfo.element;
        toastElement.classList.add('hide');
        
        // 移除元素
        setTimeout(() => {
            toastElement.remove();
            this.toastElements.delete(toastId);
        }, 300);
    }
}

// 上下文菜单组件
class ContextMenu {
    constructor(onAction) {
        this.onAction = onAction;
        this.menuElement = null;
        this.currentTarget = null;
        this.currentTargetType = null;
        this.init();
    }

    init() {
        this.createElement();
        this.bindEvents();
    }

    createElement() {
        this.menuElement = document.createElement('div');
        this.menuElement.className = 'context-menu';
        this.menuElement.innerHTML = `
            <div class="menu-item" data-action="edit">
                <i class="fas fa-edit"></i>
                <span>编辑</span>
            </div>
            <div class="menu-item" data-action="update">
                <i class="fas fa-sync-alt"></i>
                <span>更新</span>
            </div>
            <div class="menu-item" data-action="delete">
                <i class="fas fa-trash"></i>
                <span>删除</span>
            </div>
        `;
        document.body.appendChild(this.menuElement);
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .context-menu {
                position: fixed;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                display: none;
                min-width: 150px;
                border: 1px solid var(--border-color);
            }
            
            .menu-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                cursor: pointer;
                transition: background-color var(--transition-fast);
                font-size: var(--font-size-sm);
            }
            
            .menu-item:hover {
                background-color: var(--primary-light);
                color: var(--primary-color);
            }
            
            .menu-item i {
                width: 16px;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        // 阻止默认右键菜单
        document.addEventListener('contextmenu', (e) => {
            // 检查是否是网站卡片
            const websiteCard = e.target.closest('.website-card');
            if (websiteCard) {
                e.preventDefault();
                this.showMenu(e.clientX, e.clientY, websiteCard, 'website');
                return;
            }
            
            // 检查是否是一级导航项
            const navItemPrimary = e.target.closest('.nav-item-primary');
            if (navItemPrimary) {
                e.preventDefault();
                this.showMenu(e.clientX, e.clientY, navItemPrimary, 'category');
                return;
            }
            
            // 检查是否是二级导航项
            const navItemSecondary = e.target.closest('.nav-item-secondary');
            if (navItemSecondary) {
                e.preventDefault();
                this.showMenu(e.clientX, e.clientY, navItemSecondary, 'subcategory');
                return;
            }
        });
        
        // 点击菜单项
        this.menuElement.addEventListener('click', async (e) => {
            const menuItem = e.target.closest('.menu-item');
            if (menuItem) {
                const action = menuItem.dataset.action;
                if (this.currentTarget && this.onAction) {
                    // 保存当前目标和类型，因为hideMenu会重置它们
                    const target = this.currentTarget;
                    const targetType = this.currentTargetType;
                    
                    // 先隐藏菜单，避免UI阻塞
                    this.hideMenu();
                    
                    // 然后执行异步操作
                    await this.onAction(action, target, targetType);
                } else {
                    this.hideMenu();
                }
            }
        });
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', () => {
            this.hideMenu();
        });
    }

    showMenu(x, y, target, targetType) {
        this.currentTarget = target;
        this.currentTargetType = targetType;
        this.menuElement.style.display = 'block';
        this.menuElement.style.left = `${x}px`;
        this.menuElement.style.top = `${y}px`;
        
        // 确保菜单不会超出屏幕
        const menuRect = this.menuElement.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            this.menuElement.style.left = `${x - menuRect.width}px`;
        }
        if (menuRect.bottom > window.innerHeight) {
            this.menuElement.style.top = `${y - menuRect.height}px`;
        }
    }

    hideMenu() {
        this.menuElement.style.display = 'none';
        this.currentTarget = null;
        this.currentTargetType = null;
    }
}

// 网站卡片组件
class WebsiteCard {
    constructor(website, onClick, defaultIconType = 'globe') {
        this.website = website;
        this.onClick = onClick;
        this.defaultIconType = defaultIconType;
        this.element = this.createElement();
    }

    createElement() {
        const card = document.createElement('div');
        card.className = 'website-card';
        card.dataset.websiteId = this.website.id;
        
        // 生成标签HTML
        const tagsHtml = this.website.tags && this.website.tags.length > 0 
            ? this.website.tags.map(tag => `<span class="website-tag">${escapeHtml(tag)}</span>`).join('')
            : '';
        
        // 生成网站详情
        const websiteDetail = this.website.detail || '';
        
        // 生成默认图标
        const defaultIconHtml = this.getDefaultIconHtml();
        
        // 先创建带有默认图标的卡片
        card.innerHTML = `
            <div class="website-icon">
                ${defaultIconHtml}
            </div>
            <h3 class="website-name">${escapeHtml(this.website.name)}</h3>
            <p class="website-desc">${this.website.desc ? escapeHtml(this.website.desc) : ''}</p>
            ${websiteDetail ? `<p class="website-detail">${escapeHtml(websiteDetail)}</p>` : ''}
            ${tagsHtml ? `<div class="website-tags">${tagsHtml}</div>` : ''}
        `;
        
        // 添加点击事件
        card.addEventListener('click', () => {
            this.onClick(this.website);
        });
        
        // 确保右键事件冒泡，以便上下文菜单可以触发
        card.addEventListener('contextmenu', (e) => {
            // 不阻止默认行为，让上下文菜单正常触发
            console.log('Right click on website card:', this.website.id);
        });
        
        // 添加悬停动画
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px) rotateX(2deg)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) rotateX(0deg)';
        });
        
        // 异步获取favicon并更新卡片
        this.updateFavicon(card);
        
        return card;
    }
    
    getDefaultIconHtml() {
        if (this.defaultIconType === 'text') {
            // 使用网站名称的首字母作为图标
            const firstChar = this.website.name && this.website.name.length > 0 
                ? this.website.name.charAt(0).toUpperCase() 
                : 'W';
            return `<div class="text-icon">${firstChar}</div>`;
        } else {
            // 默认使用小地球图标
            return '<i class="fas fa-globe"></i>';
        }
    }
    
    async updateFavicon(card) {
        try {
            const faviconUrl = await getFaviconUrl(this.website.url);
            const websiteIcon = card.querySelector('.website-icon');
            if (websiteIcon && faviconUrl) {
                websiteIcon.innerHTML = `<img src="${faviconUrl}" alt="${escapeHtml(this.website.name)} logo" loading="lazy">`;
            }
        } catch (error) {
            console.error('更新favicon失败:', error);
            // 如果获取图标失败，使用默认图标
            const websiteIcon = card.querySelector('.website-icon');
            if (websiteIcon) {
                websiteIcon.innerHTML = this.getDefaultIconHtml();
            }
        }
    }

    getElement() {
        return this.element;
    }
}

// 主应用组件
class PopupApp {
    constructor() {
        // 初始化组件
        this.toast = new Toast();
        this.contextMenu = new ContextMenu((action, target, targetType) => {
            this.handleAction(action, target, targetType);
        });
        
        // 全局状态
        this.currentData = null;
        this.currentMainCategory = null;
        this.currentCategory = null;
        this.currentSubCategory = null;
        
        // DOM元素
        this.mainCategorySelect = document.getElementById('mainCategorySelect');
        this.categoryNav = document.getElementById('categoryNav');
        this.subcategoryTabs = document.getElementById('subcategoryTabs');
        this.websiteList = document.getElementById('websiteList');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchSuggestions = document.getElementById('searchSuggestions');
        this.searchContainer = document.querySelector('.search-container');
        this.addWebsiteBtn = document.getElementById('addWebsiteBtn');
        this.addCategoryBtn = document.getElementById('addCategoryBtn');
        this.addSubcategoryBtn = document.getElementById('addSubcategoryBtn');
        
        // 初始化应用
        this.init();
    }

    async init() {
        // 加载数据 - 每次打开扩展都加载最新数据
        await this.loadData();
        
        // 添加默认图标样式
        addDefaultIconStyles();
        
        // 渲染主类导航
        this.renderMainNav();
        
        // 设置事件监听
        this.bindEvents();
    }

    async loadData() {
        try {
            const newData = await DataManager.getAllData();
            this.currentData = newData;
            
            // 确保当前选择的分类指向新数据对象
            // 设置当前主类（无论是否已有值）
            if (newData.mainCategories.length > 0) {
                // 如果当前主类存在，尝试更新它；否则设置为第一个主类
                this.currentMainCategory = newData.mainCategories.find(
                    mc => mc.id === this.currentMainCategory?.id
                ) || newData.mainCategories[0];
            } else {
                this.currentMainCategory = null;
            }
            
            // 设置当前一级分类（无论是否已有值）
            if (this.currentMainCategory && this.currentMainCategory.categories.length > 0) {
                // 如果当前一级分类存在，尝试更新它；否则设置为第一个一级分类
                this.currentCategory = this.currentMainCategory.categories.find(
                    cat => cat.id === this.currentCategory?.id
                ) || this.currentMainCategory.categories[0];
            } else {
                this.currentCategory = null;
            }
            
            // 设置当前二级分类（无论是否已有值）
            if (this.currentCategory && this.currentCategory.subCategories.length > 0) {
                // 如果当前二级分类存在，尝试更新它；否则设置为第一个二级分类
                this.currentSubCategory = this.currentCategory.subCategories.find(
                    subCat => subCat.id === this.currentSubCategory?.id
                ) || this.currentCategory.subCategories[0];
            } else {
                this.currentSubCategory = null;
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            this.toast.show('加载数据失败', 'error');
        }
    }

    bindEvents() {
        // 主类选择框变化事件
        this.mainCategorySelect.addEventListener('change', (e) => this.handleMainCategoryChange(e));
        
        // 设置按钮点击事件
        this.settingsBtn.addEventListener('click', () => {
            browserAPI.runtime.openOptionsPage();
        });
        
        // 新增网址按钮点击事件
        this.addWebsiteBtn.addEventListener('click', () => this.handleAddWebsite());
        
        // 添加一级分类按钮点击事件
        this.addCategoryBtn.addEventListener('click', () => this.handleAddCategory());
        
        // 添加二级分类按钮点击事件
        this.addSubcategoryBtn.addEventListener('click', () => this.handleAddSubcategory());
        
        // 搜索功能事件绑定
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(e.target.value);
            } else if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
        
        // 点击搜索建议
        this.searchSuggestions.addEventListener('click', (e) => {
            const suggestionItem = e.target.closest('.search-suggestion-item');
            if (suggestionItem) {
                const websiteId = suggestionItem.dataset.websiteId;
                if (websiteId) {
                    this.visitWebsite(websiteId);
                }
                this.clearSearch();
            }
        });
        
        // 添加鼠标滚轮水平滚动支持
        this.addHorizontalScrollSupport();
        
        // 添加拖拽功能支持
        this.addDragAndDropSupport();
    }
    
    // 添加鼠标滚轮水平滚动支持
    addHorizontalScrollSupport() {
        // 获取所有导航列表
        const navLists = document.querySelectorAll('.nav-list');
        
        navLists.forEach(navList => {
            navList.addEventListener('wheel', (e) => {
                // 阻止默认垂直滚动
                e.preventDefault();
                
                // 实现水平滚动
                navList.scrollLeft += e.deltaY;
            });
        });
    }
    
    // 添加拖拽功能支持
    addDragAndDropSupport() {
        let draggedItem = null;
        let startX, startY;
        let isDragging = false;
        let currentNavList = null;
        const self = this; // 保存当前实例的引用
        
        // 获取所有导航列表
        const navLists = document.querySelectorAll('.nav-list');
        
        navLists.forEach(navList => {
            // 为每个导航项添加拖拽支持
            navList.querySelectorAll('.nav-item.nav-item-primary, .nav-item.nav-item-secondary').forEach(item => {
                // 鼠标按下事件 - 开始拖拽
                item.addEventListener('mousedown', (e) => {
                    // 只允许左键拖拽
                    if (e.button !== 0) return;
                    
                    // 记录初始位置和当前导航列表
                    startX = e.clientX;
                    startY = e.clientY;
                    currentNavList = navList;
                    draggedItem = e.target.closest('.nav-item');
                    
                    // 添加拖拽样式
                    draggedItem.classList.add('dragging');
                    
                    // 阻止文本选择
                    document.body.style.userSelect = 'none';
                    
                    // 添加全局拖拽事件监听器
                    document.addEventListener('mousemove', drag);
                    document.addEventListener('mouseup', endDrag);
                    
                    // 阻止默认行为，防止文本选择
                    e.preventDefault();
                });
            });
            
            // 拖拽移动
            function drag(e) {
                if (!draggedItem) return;
                
                // 检查是否开始拖拽（移动超过阈值）
                if (!isDragging) {
                    if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
                        isDragging = true;
                    }
                }
                
                if (isDragging) {
                    // 更新拖拽项位置
                    const rect = draggedItem.getBoundingClientRect();
                    const x = e.clientX - rect.width / 2;
                    const y = e.clientY - rect.height / 2;
                    draggedItem.style.position = 'fixed';
                    draggedItem.style.left = `${x}px`;
                    draggedItem.style.top = `${y}px`;
                    draggedItem.style.zIndex = '1000';
                    draggedItem.style.pointerEvents = 'none';
                    
                    // 查找放置目标
                    const siblings = Array.from(currentNavList.querySelectorAll('.nav-item:not(.dragging)'));
                    siblings.forEach(sibling => {
                        sibling.classList.remove('drag-over');
                        sibling.classList.remove('drag-over-right');
                    });
                    
                    // 找到当前鼠标位置最接近的元素，并确定是放在左边还是右边
                    let targetItem = null;
                    let isRightSide = false;
                    let closestDistance = Infinity;
                    
                    siblings.forEach(sibling => {
                        const siblingRect = sibling.getBoundingClientRect();
                        const elementCenterX = siblingRect.left + siblingRect.width / 2;
                        const distance = Math.abs(e.clientX - elementCenterX);
                        
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            targetItem = sibling;
                            // 如果鼠标在元素中心右侧，标记为放在右边
                            isRightSide = e.clientX > elementCenterX;
                        }
                    });
                    
                    if (targetItem) {
                        if (isRightSide) {
                            targetItem.classList.add('drag-over-right');
                        } else {
                            targetItem.classList.add('drag-over');
                        }
                    }
                }
            }
            
            // 拖拽结束
            function endDrag(e) {
                if (!draggedItem) return;
                
                // 重置样式
                draggedItem.style.position = '';
                draggedItem.style.left = '';
                draggedItem.style.top = '';
                draggedItem.style.zIndex = '';
                draggedItem.style.pointerEvents = '';
                draggedItem.classList.remove('dragging');
                
                // 查找放置位置
                let dropTarget = document.querySelector('.drag-over');
                let isRightSide = false;
                
                // 如果没有左侧放置目标，检查右侧放置目标
                if (!dropTarget) {
                    dropTarget = document.querySelector('.drag-over-right');
                    isRightSide = true;
                }
                
                // 移除所有拖拽样式
                document.querySelectorAll('.drag-over, .drag-over-right').forEach(item => {
                    item.classList.remove('drag-over');
                    item.classList.remove('drag-over-right');
                });
                
                // 恢复文本选择
                document.body.style.userSelect = '';
                
                // 如果找到放置目标，执行拖拽排序
                if (dropTarget && isDragging) {
                    // 执行拖拽排序
                    handleDragSort(draggedItem, dropTarget, isRightSide);
                }
                
                // 重置状态
                isDragging = false;
                draggedItem = null;
                currentNavList = null;
                
                // 移除全局事件监听器
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', endDrag);
            }
        });
        
        // 处理拖拽排序
        async function handleDragSort(draggedItem, dropTarget, isRightSide = false) {
            const isPrimary = draggedItem.classList.contains('nav-item-primary');
            const isSecondary = draggedItem.classList.contains('nav-item-secondary');
            
            if (isPrimary || isSecondary) {
                // 获取分类ID和类型
                const draggedId = draggedItem.dataset.categoryId || draggedItem.dataset.subcategoryId;
                const dropId = dropTarget.dataset.categoryId || dropTarget.dataset.subcategoryId;
                const type = isPrimary ? 'category' : 'subcategory';
                
                // 获取当前主分类和一级分类信息
                const currentMainCatId = self.currentMainCategory.id;
                const currentCategoryId = self.currentCategory ? self.currentCategory.id : null;
                
                // 调试信息
                console.log('拖拽排序调试信息:');
                console.log('- 类型:', type);
                console.log('- 拖拽项ID:', draggedId);
                console.log('- 目标项ID:', dropId);
                console.log('- 是否右侧:', isRightSide);
                console.log('- 当前主分类ID:', currentMainCatId);
                console.log('- 当前一级分类ID:', currentCategoryId);
                
                try {
                    // 使用DataManager更新分类顺序
                    const result = await DataManager.updateCategoryOrder(
                        type,
                        draggedId,
                        dropId,
                        currentMainCatId,
                        currentCategoryId,
                        isRightSide
                    );
                    
                    if (result.success) {
                        // 重新加载数据
                        await self.loadData();
                        
                        // 重新渲染主类导航（会自动调用renderCategoryNav）
                        self.renderMainNav();
                        
                        // 显示成功提示
                        self.toast.show('分类顺序已更新', 'success');
                    } else {
                        self.toast.show(`更新失败: ${result.message}`, 'error');
                    }
                } catch (error) {
                    console.error('更新分类顺序失败:', error);
                    self.toast.show('更新分类顺序失败', 'error');
                }
            }
        }
    }

    // 渲染主类导航
    renderMainNav() {
        if (!this.currentData || !this.currentData.mainCategories) return;
        
        // 清空现有选项
        this.mainCategorySelect.innerHTML = '';
        
        // 添加默认提示选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '请选择主类';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        this.mainCategorySelect.appendChild(defaultOption);
        
        // 生成主类选项
        this.currentData.mainCategories.forEach(mainCat => {
            const option = document.createElement('option');
            option.value = mainCat.id;
            option.textContent = mainCat.name;
            // 主类导航不显示图标
            this.mainCategorySelect.appendChild(option);
        });
        
        // 添加新增主类导航选项
        const addOption = document.createElement('option');
        addOption.value = 'add';
        addOption.textContent = '+ 新增主类导航';
        this.mainCategorySelect.appendChild(addOption);
        
        // 默认选择第一个主类
        if (this.currentData.mainCategories.length > 0) {
            this.selectMainCategory(this.currentData.mainCategories[0]);
            // 更新下拉框选中状态
            this.mainCategorySelect.value = this.currentData.mainCategories[0].id;
        }
    }

    // 选择主类导航
    selectMainCategory(mainCategory) {
        // 更新状态
        this.currentMainCategory = mainCategory;
        
        // 渲染一级导航
        this.renderCategoryNav();
    }

    // 处理主类选择变化
    handleMainCategoryChange(e) {
        const mainCategoryId = e.target.value;
        
        // 如果选择的是新增选项
        if (mainCategoryId === 'add') {
            // 重新渲染主类导航，恢复之前的选择
            this.renderMainNav();
            // 显示添加主类导航对话框
            this.showAddMainCategoryDialog();
            return;
        }
        
        const mainCategory = this.currentData.mainCategories.find(cat => cat.id === mainCategoryId);
        if (mainCategory) {
            this.selectMainCategory(mainCategory);
        }
    }

    // 渲染一级导航
    renderCategoryNav() {
        if (!this.currentMainCategory || !this.currentMainCategory.categories) return;
        
        // 获取一级分类列表元素
        const ulElement = this.categoryNav.querySelector('.nav-list-primary');
        if (!ulElement) return;
        
        // 保存新增按钮元素
        const addBtnElement = ulElement.querySelector('.nav-item.nav-item-add');
        
        // 更新一级分类列表（不包括新增按钮）
        ulElement.innerHTML = this.currentMainCategory.categories.map(cat => `
            <li class="nav-item nav-item-primary" data-category-id="${cat.id}">
                ${cat.icon ? `<i class="${cat.icon}" style="margin-right: 8px;"></i>` : ''}${cat.name}
            </li>
        `).join('');
        
        // 重新添加新增按钮
        ulElement.appendChild(addBtnElement);
        
        // 添加点击事件
        ulElement.querySelectorAll('.nav-item-primary').forEach(item => {
            item.addEventListener('click', () => {
                const categoryId = item.dataset.categoryId;
                const category = this.currentMainCategory.categories.find(cat => cat.id === categoryId);
                if (category) {
                    this.selectCategory(category);
                }
            });
        });
        
        // 默认选择第一个一级分类
        if (this.currentMainCategory.categories.length > 0) {
            this.selectCategory(this.currentMainCategory.categories[0]);
        }
        
        // 重新添加水平滚动支持
        this.addHorizontalScrollSupport();
        // 重新添加拖拽功能支持
        this.addDragAndDropSupport();
    }

    // 选择一级分类
    selectCategory(category) {
        // 更新状态
        this.currentCategory = category;
        
        // 更新UI - 添加激活状态
        this.categoryNav.querySelectorAll('.nav-item-primary').forEach(item => {
            item.classList.remove('active');
        });
        const activeItem = this.categoryNav.querySelector(`[data-category-id="${category.id}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        // 渲染二级分类标签
        this.renderSubcategoryTabs();
    }

    // 渲染二级分类标签
    renderSubcategoryTabs() {
        if (!this.currentCategory || !this.currentCategory.subCategories) return;
        
        // 获取二级分类列表元素
        const ulElement = this.subcategoryTabs.querySelector('.nav-list-secondary');
        if (!ulElement) return;
        
        // 保存新增按钮元素
        const addBtnElement = ulElement.querySelector('.nav-item.nav-item-add');
        
        // 更新二级分类列表（不包括新增按钮）
        ulElement.innerHTML = this.currentCategory.subCategories.map(subCat => `
            <li class="nav-item nav-item-secondary" data-subcategory-id="${subCat.id}">
                ${subCat.icon ? `<i class="${subCat.icon}" style="margin-right: 8px;"></i>` : ''}${subCat.name}
            </li>
        `).join('');
        
        // 重新添加新增按钮
        ulElement.appendChild(addBtnElement);
        
        // 添加点击事件
        ulElement.querySelectorAll('.nav-item-secondary').forEach(item => {
            item.addEventListener('click', () => {
                const subCategoryId = item.dataset.subcategoryId;
                const subCategory = this.currentCategory.subCategories.find(subCat => subCat.id === subCategoryId);
                if (subCategory) {
                    this.selectSubcategory(subCategory);
                }
            });
        });
        
        // 默认选择第一个二级分类
        if (this.currentCategory.subCategories.length > 0) {
            this.selectSubcategory(this.currentCategory.subCategories[0]);
        }
        
        // 重新添加水平滚动支持
        this.addHorizontalScrollSupport();
        // 重新添加拖拽功能支持
        this.addDragAndDropSupport();
    }

    // 选择二级分类
    selectSubcategory(subCategory) {
        // 更新状态
        this.currentSubCategory = subCategory;
        
        // 更新UI - 添加激活状态
        this.subcategoryTabs.querySelectorAll('.nav-item-secondary').forEach(item => {
            item.classList.remove('active');
        });
        const activeItem = this.subcategoryTabs.querySelector(`[data-subcategory-id="${subCategory.id}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        // 渲染网站列表
        this.renderWebsiteList();
    }

    // 渲染网站列表
    renderWebsiteList() {
        if (!this.currentSubCategory || !this.currentSubCategory.websites) {
            this.websiteList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <div class="empty-state-text">该分类下暂无网站</div>
                </div>
            `;
            return;
        }
        
        // 清空现有内容并添加动画类
        this.websiteList.innerHTML = '';
        this.websiteList.classList.add('fade-in');
        
        // 从配置中获取默认图标类型
        const defaultIconType = this.currentData?.config?.defaultIconType || 'globe';
        
        // 渲染网站卡片
        this.currentSubCategory.websites.forEach(website => {
            const websiteCard = new WebsiteCard(website, (clickedWebsite) => {
                // 确保URL存在且有效
                if (clickedWebsite && clickedWebsite.url) {
                    console.log('Opening website:', clickedWebsite.url);
                    browserAPI.tabs.create({ url: clickedWebsite.url, active: true });
                } else {
                    console.error('Invalid website URL:', clickedWebsite);
                    this.toast.show('网站URL无效', 'error');
                }
            }, defaultIconType);
            this.websiteList.appendChild(websiteCard.getElement());
        });
        
        // 移除动画类以便下次使用
        setTimeout(() => {
            this.websiteList.classList.remove('fade-in');
        }, 300);
    }

    // 显示添加分类对话框
    // 添加图标选择器样式
    addIconSelectorStyles() {
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
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    background-color: var(--bg-secondary);
                }
                
                .icon-option {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: 2px solid transparent;
                    border-radius: var(--radius-sm);
                    background-color: var(--bg-primary);
                    transition: all 0.2s ease;
                    font-size: 18px;
                }
                
                .icon-option:hover {
                    border-color: var(--primary-color);
                    background-color: var(--primary-light);
                    transform: translateY(-2px);
                }
                
                .icon-option.selected {
                    border-color: var(--primary-color);
                    background-color: var(--primary-light);
                    box-shadow: var(--shadow-sm);
                }
                
                .icon-option i {
                    color: var(--text-primary);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 显示添加主类导航对话框
    showAddMainCategoryDialog() {
        // 先关闭所有现有对话框
        this.closeAllDialogs();
        
        // 常用Font Awesome图标列表
        const fontAwesomeIcons = [
            'fas fa-home', 'fas fa-building', 'fas fa-graduation-cap', 'fas fa-laptop',
            'fas fa-music', 'fas fa-video', 'fas fa-gamepad', 'fas fa-book',
            'fas fa-shopping-cart', 'fas fa-truck', 'fas fa-map-marker-alt', 'fas fa-plane',
            'fas fa-heartbeat', 'fas fa-medkit', 'fas fa-cutlery', 'fas fa-coffee',
            'fas fa-camera', 'fas fa-paint-brush', 'fas fa-code', 'fas fa-chart-line',
            'fas fa-briefcase', 'fas fa-users', 'fas fa-cog', 'fas fa-globe',
            'fas fa-folder', 'fas fa-file-alt', 'fas fa-image', 'fas fa-search',
            'fas fa-star', 'fas fa-heart', 'fas fa-bell', 'fas fa-envelope'
        ];
        
        // 创建添加主类导航对话框
        const dialogHtml = `
            <div class="dialog-overlay">
                <div class="dialog">
                    <div class="dialog-header">
                        <h3>添加主类导航</h3>
                        <button class="dialog-close" id="addMainCategoryDialogClose">&times;</button>
                    </div>
                    <div class="dialog-body">
                        <form id="addMainCategoryForm">
                            <div class="form-group">
                                <label for="addMainCategoryName">主类名称</label>
                                <input type="text" id="addMainCategoryName" class="form-control" placeholder="请输入主类名称" required>
                            </div>
                            <div class="form-group">
                                <label>选择图标</label>
                                <div class="icon-selector">
                                    ${fontAwesomeIcons.map(icon => `
                                        <div class="icon-option" data-icon="${icon}">
                                            <i class="${icon}"></i>
                                        </div>
                                    `).join('')}
                                </div>
                                <input type="hidden" id="addMainCategoryIcon" name="mainCategoryIcon" value="fas fa-folder">
                            </div>
                            <div class="dialog-footer">
                                <button type="button" id="addMainCategoryCancel" class="btn btn-secondary">取消</button>
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
        this.addIconSelectorStyles();
        
        // 获取元素
        const dialog = document.querySelector('.dialog-overlay');
        const form = document.getElementById('addMainCategoryForm');
        const closeBtn = document.getElementById('addMainCategoryDialogClose');
        const cancelBtn = document.getElementById('addMainCategoryCancel');
        const iconSelector = document.querySelector('.icon-selector');
        const mainCategoryIconInput = document.getElementById('addMainCategoryIcon');
        
        // 关闭对话框函数
        const closeDialog = () => {
            this.closeDialog(dialog);
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
        
        // 图标选择事件
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
                mainCategoryIconInput.value = iconOption.dataset.icon;
            }
        });
        
        // 保存表单
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 获取表单数据
            const name = document.getElementById('addMainCategoryName').value.trim();
            const icon = mainCategoryIconInput.value;
            if (name) {
                try {
                    // 使用DataManager添加主类导航
                    const result = await DataManager.createMainCategory(name, icon);
                    
                    if (result.success) {
                        // 重新加载数据
                        await this.loadData();
                        
                        // 重新渲染主类导航
                        this.renderMainNav();
                        
                        this.toast.show('主类导航创建成功', 'success');
                        closeDialog();
                    } else {
                        this.toast.show(`创建失败: ${result.message}`, 'error');
                    }
                } catch (error) {
                    console.error('创建主类导航失败:', error);
                    this.toast.show('创建主类导航失败', 'error');
                }
            } else {
                this.toast.show('主类名称不能为空', 'warning');
            }
        });
    }
    
    showAddCategoryDialog(title, onConfirm) {
        // 先关闭所有现有对话框
        this.closeAllDialogs();
        
        // 常用Font Awesome图标列表
        const fontAwesomeIcons = [
            'fas fa-home', 'fas fa-building', 'fas fa-graduation-cap', 'fas fa-laptop',
            'fas fa-music', 'fas fa-video', 'fas fa-gamepad', 'fas fa-book',
            'fas fa-shopping-cart', 'fas fa-truck', 'fas fa-map-marker-alt', 'fas fa-plane',
            'fas fa-heartbeat', 'fas fa-medkit', 'fas fa-cutlery', 'fas fa-coffee',
            'fas fa-camera', 'fas fa-paint-brush', 'fas fa-code', 'fas fa-chart-line',
            'fas fa-briefcase', 'fas fa-users', 'fas fa-cog', 'fas fa-globe',
            'fas fa-folder', 'fas fa-file-alt', 'fas fa-image', 'fas fa-search',
            'fas fa-star', 'fas fa-heart', 'fas fa-bell', 'fas fa-envelope'
        ];
        
        // 创建添加分类对话框
        const dialogHtml = `
            <div class="dialog-overlay">
                <div class="dialog">
                    <div class="dialog-header">
                        <h3>${title}</h3>
                        <button class="dialog-close" id="addCategoryDialogClose">&times;</button>
                    </div>
                    <div class="dialog-body">
                        <form id="addCategoryForm">
                            <div class="form-group">
                                <label for="addCategoryName">分类名称</label>
                                <input type="text" id="addCategoryName" class="form-control" placeholder="请输入分类名称" required>
                            </div>
                            <div class="form-group">
                                <label>选择图标</label>
                                <div class="icon-selector">
                                    ${fontAwesomeIcons.map(icon => `
                                        <div class="icon-option" data-icon="${icon}">
                                            <i class="${icon}"></i>
                                        </div>
                                    `).join('')}
                                </div>
                                <input type="hidden" id="addCategoryIcon" name="categoryIcon" value="fas fa-folder">
                            </div>
                            <div class="dialog-footer">
                                <button type="button" id="addCategoryCancel" class="btn btn-secondary">取消</button>
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
        this.addIconSelectorStyles();
        
        // 获取元素
        const dialog = document.querySelector('.dialog-overlay');
        const form = document.getElementById('addCategoryForm');
        const closeBtn = document.getElementById('addCategoryDialogClose');
        const cancelBtn = document.getElementById('addCategoryCancel');
        const iconSelector = document.querySelector('.icon-selector');
        const categoryIconInput = document.getElementById('addCategoryIcon');
        
        // 关闭对话框函数
        const closeDialog = () => {
            this.closeDialog(dialog);
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
        
        // 图标选择事件
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
                categoryIconInput.value = iconOption.dataset.icon;
            }
        });
        
        // 保存表单
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 获取表单数据
            const name = document.getElementById('addCategoryName').value.trim();
            const icon = categoryIconInput.value;
            if (name) {
                onConfirm(name, icon);
                closeDialog();
            } else {
                this.toast.show('分类名称不能为空', 'warning');
            }
        });
    }
    
    // 处理添加一级分类
    async handleAddCategory() {
        if (!this.currentMainCategory) {
            this.toast.show('请先选择一个主类导航', 'warning');
            return;
        }
        
        this.showAddCategoryDialog('添加一级分类', async (categoryName, icon) => {
            try {
                // 使用DataManager添加分类
                const result = await DataManager.createCategory(
                    this.currentMainCategory.id,
                    categoryName,
                    icon // 传递图标参数
                );
                
                if (result.success) {
                    // 重新加载数据
                    await this.loadData();
                    
                    // 重新渲染一级分类
                    this.renderCategoryNav();
                    
                    this.toast.show('一级分类创建成功', 'success');
                } else {
                    this.toast.show(`创建失败: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('创建一级分类失败:', error);
                this.toast.show('创建一级分类失败', 'error');
            }
        });
    }
    
    // 处理添加二级分类
    async handleAddSubcategory() {
        if (!this.currentCategory) {
            this.toast.show('请先选择一个一级分类', 'warning');
            return;
        }
        
        this.showAddCategoryDialog('添加二级分类', async (subcategoryName, icon) => {
            try {
                // 使用DataManager添加二级分类
                const result = await DataManager.createSubcategory(
                    this.currentMainCategory.id,
                    this.currentCategory.id,
                    subcategoryName,
                    icon // 传递图标参数
                );
                
                if (result.success) {
                    // 重新加载数据
                    await this.loadData();
                    
                    // 重新渲染二级分类
                    this.renderSubcategoryTabs();
                    
                    this.toast.show('二级分类创建成功', 'success');
                } else {
                    this.toast.show(`创建失败: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('创建二级分类失败:', error);
                this.toast.show('创建二级分类失败', 'error');
            }
        });
    }

    // 处理所有右键菜单操作
    async handleAction(action, target, targetType) {
        try {
            // 总是加载最新数据，确保操作基于最新状态
            await this.loadData();
            
            switch (targetType) {
                case 'website':
                    await this.handleWebsiteAction(action, target);
                    break;
                case 'category':
                case 'subcategory':
                    // 统一处理一级和二级分类
                    await this.handleCategoryAction(action, target, targetType);
                    break;
            }
        } catch (error) {
            console.error('处理右键菜单操作失败:', error);
            this.toast.show('操作失败', 'error');
        }
    }

    // 查找网站信息
    findWebsiteInfo(websiteId) {
        const latestData = this.currentData;
        
        // 确保latestData和latestData.mainCategories存在
        if (!latestData || !latestData.mainCategories) {
            return { found: false };
        }
        
        for (const mainCat of latestData.mainCategories) {
            for (const cat of mainCat.categories) {
                for (const subCat of cat.subCategories) {
                    const website = subCat.websites.find(web => web.id === websiteId);
                    if (website) {
                        return {
                            found: true,
                            website: website,
                            websiteName: website.name
                        };
                    }
                }
            }
        }
        
        return { found: false };
    }
    
    // 处理网站操作
    async handleWebsiteAction(action, websiteCard) {
        const websiteId = websiteCard.dataset.websiteId;
        
        // 查找网站信息
        const websiteInfo = this.findWebsiteInfo(websiteId);
        
        if (!websiteInfo.found) {
            this.toast.show('未找到对应的网站', 'error');
            return;
        }
        
        switch (action) {
            case 'edit':
                await this.showEditWebsiteDialog(websiteInfo.website);
                break;
            case 'update':
                await this.handleUpdateWebsite(websiteInfo.website);
                break;
            case 'delete':
                await this.handleDeleteWebsite(websiteInfo.website);
                break;
        }
    }

    // 处理网站更新（更新图标）
    async handleUpdateWebsite(website) {
        try {
            // 清除网站的缓存图标
            const cleanUrl = website.url.replace(/[`\s]/g, '');
            const cacheKey = `favicon_${btoa(cleanUrl)}`;
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(`${cacheKey}_expires`);
            
            // 重新渲染网站列表，更新图标
            this.renderWebsiteList();
            
            this.toast.show('网站图标已更新', 'success');
        } catch (error) {
            console.error('更新网站图标失败:', error);
            this.toast.show('更新失败', 'error');
        }
    }

    // 查找分类及其父级信息
    findCategoryInfo(categoryId, type) {
        const latestData = this.currentData;
        
        // 确保latestData和latestData.mainCategories存在
        if (!latestData || !latestData.mainCategories) {
            return { found: false };
        }
        
        for (const mainCat of latestData.mainCategories) {
            if (type === 'category') {
                // 查找一级分类
                const category = mainCat.categories.find(cat => cat.id === categoryId);
                if (category) {
                    return {
                        found: true,
                        category: category,
                        mainCategoryId: mainCat.id,
                        categoryId: category.id,
                        categoryName: category.name
                    };
                }
            } else if (type === 'subcategory') {
                // 查找二级分类
                for (const cat of mainCat.categories) {
                    const subcategory = cat.subCategories.find(subCat => subCat.id === categoryId);
                    if (subcategory) {
                        return {
                            found: true,
                            category: subcategory,
                            mainCategoryId: mainCat.id,
                            categoryId: cat.id,
                            subcategoryId: subcategory.id,
                            categoryName: subcategory.name
                        };
                    }
                }
            }
        }
        
        return { found: false };
    }
    
    // 处理分类操作（统一处理一级和二级分类）
    async handleCategoryAction(action, categoryElement, type) {
        const categoryId = categoryElement.dataset.categoryId || categoryElement.dataset.subcategoryId;
        
        // 查找分类信息
        const categoryInfo = this.findCategoryInfo(categoryId, type);
        
        if (!categoryInfo.found) {
            this.toast.show(`未找到对应的${type === 'category' ? '一级分类' : '二级分类'}`, 'error');
            return;
        }
        
        // 执行操作
        switch (action) {
            case 'edit':
                if (type === 'category') {
                    await this.showEditCategoryDialog(categoryInfo.category);
                } else {
                    await this.showEditSubcategoryDialog(categoryInfo.category);
                }
                break;
            case 'delete':
                if (type === 'category') {
                    await this.performDeleteCategory(
                        categoryInfo.mainCategoryId,
                        categoryInfo.categoryId,
                        categoryInfo.categoryName
                    );
                } else {
                    await this.performDeleteSubcategory(
                        categoryInfo.mainCategoryId,
                        categoryInfo.categoryId,
                        categoryInfo.subcategoryId,
                        categoryInfo.categoryName
                    );
                }
                break;
        }
    }

    // 根据ID查找网站
    findWebsiteById(websiteId) {
        for (const mainCat of this.currentData.mainCategories) {
            for (const cat of mainCat.categories) {
                for (const subCat of cat.subCategories) {
                    for (const website of subCat.websites) {
                        if (website.id === websiteId) {
                            return website;
                        }
                    }
                }
            }
        }
        return null;
    }

    // 显示编辑网站对话框
    async showEditWebsiteDialog(website) {
        // 先关闭所有现有对话框
        this.closeAllDialogs();
        
        // 创建编辑对话框
        const dialogHtml = `
            <div class="dialog-overlay">
                <div class="dialog">
                    <div class="dialog-header">
                        <h3>编辑网站</h3>
                        <button class="dialog-close" id="editDialogClose">&times;</button>
                    </div>
                    <div class="dialog-body">
                        <form id="editWebsiteForm">
                            <div class="form-group">
                                <label for="editWebsiteName">网站名称</label>
                                <input type="text" id="editWebsiteName" class="form-control" value="${escapeHtml(website.name)}" required>
                            </div>
                            <div class="form-group">
                                <label for="editWebsiteUrl">网站URL</label>
                                <input type="url" id="editWebsiteUrl" class="form-control" value="${escapeHtml(website.url)}" required>
                            </div>
                            <div class="form-group">
                                <label for="editWebsiteDesc">网站描述</label>
                                <textarea id="editWebsiteDesc" class="form-control" rows="3">${escapeHtml(website.desc || '')}</textarea>
                            </div>
                            <div class="form-group">
                                <label for="editWebsiteTags">网站标签（逗号分隔）</label>
                                <input type="text" id="editWebsiteTags" class="form-control" value="${escapeHtml(website.tags ? website.tags.join(', ') : '')}">
                            </div>
                            <div class="dialog-footer">
                                <button type="button" id="editWebsiteCancel" class="btn btn-secondary">取消</button>
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
        
        // 获取元素
        const dialog = document.querySelector('.dialog-overlay');
        const form = document.getElementById('editWebsiteForm');
        const closeBtn = document.getElementById('editDialogClose');
        const cancelBtn = document.getElementById('editWebsiteCancel');
        const tagsInput = document.getElementById('editWebsiteTags');
        
        // 关闭对话框函数
        const closeDialog = () => {
            this.closeDialog(dialog);
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
        
        // 标签输入处理：输入逗号时自动处理标签
        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === ',') {
                e.preventDefault();
                
                // 获取当前输入的标签
                const currentValue = tagsInput.value.trim();
                const tags = currentValue.split(',').map(tag => tag.trim()).filter(tag => tag);
                
                // 检查标签数量是否已达上限
                if (tags.length >= 5) {
                    this.toast.show('最多只能添加5个标签', 'warning');
                    return;
                }
                
                // 自动添加逗号并保留当前输入
                tagsInput.value = `${currentValue}, `;
            }
        });
        
        // 保存表单
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 获取表单数据
            const name = document.getElementById('editWebsiteName').value.trim();
            const url = document.getElementById('editWebsiteUrl').value.trim();
            const desc = document.getElementById('editWebsiteDesc').value.trim();
            const tags = document.getElementById('editWebsiteTags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);
            
            // 检查标签数量
            if (tags.length > 5) {
                this.toast.show('最多只能添加5个标签', 'warning');
                return;
            }
            
            try {
                // 更新网站
                const result = await DataManager.updateWebsite(website.id, {
                    name,
                    url,
                    desc,
                    tags
                });
                
                if (result.success) {
                    // 重新加载数据
                    await this.loadData();
                    
                    // 重新渲染网站列表
                    this.renderWebsiteList();
                    
                    this.toast.show('网站更新成功', 'success');
                    closeDialog();
                } else {
                    this.toast.show(`更新失败: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('更新网站失败:', error);
                this.toast.show('更新网站失败', 'error');
            }
        });
    }

    // 显示编辑一级分类对话框
    async showEditCategoryDialog(category) {
        // 先关闭所有现有对话框
        this.closeAllDialogs();
        
        // 常用Font Awesome图标列表
        const fontAwesomeIcons = [
            'fas fa-home', 'fas fa-building', 'fas fa-graduation-cap', 'fas fa-laptop',
            'fas fa-music', 'fas fa-video', 'fas fa-gamepad', 'fas fa-book',
            'fas fa-shopping-cart', 'fas fa-truck', 'fas fa-map-marker-alt', 'fas fa-plane',
            'fas fa-heartbeat', 'fas fa-medkit', 'fas fa-cutlery', 'fas fa-coffee',
            'fas fa-camera', 'fas fa-paint-brush', 'fas fa-code', 'fas fa-chart-line',
            'fas fa-briefcase', 'fas fa-users', 'fas fa-cog', 'fas fa-globe',
            'fas fa-folder', 'fas fa-file-alt', 'fas fa-image', 'fas fa-search',
            'fas fa-star', 'fas fa-heart', 'fas fa-bell', 'fas fa-envelope'
        ];
        
        // 创建编辑对话框
        const dialogHtml = `
            <div class="dialog-overlay">
                <div class="dialog">
                    <div class="dialog-header">
                        <h3>编辑一级分类</h3>
                        <button class="dialog-close" id="editCategoryDialogClose">&times;</button>
                    </div>
                    <div class="dialog-body">
                        <form id="editCategoryForm">
                            <div class="form-group">
                                <label for="editCategoryName">分类名称</label>
                                <input type="text" id="editCategoryName" class="form-control" value="${escapeHtml(category.name)}" required>
                            </div>
                            <div class="form-group">
                                <label>选择图标</label>
                                <div class="icon-selector">
                                    ${fontAwesomeIcons.map(icon => `
                                        <div class="icon-option ${category.icon === icon ? 'selected' : ''}" data-icon="${icon}">
                                            <i class="${icon}"></i>
                                        </div>
                                    `).join('')}
                                </div>
                                <input type="hidden" id="editCategoryIcon" name="categoryIcon" value="${category.icon || 'fas fa-folder'}">
                            </div>
                            <div class="dialog-footer">
                                <button type="button" id="editCategoryCancel" class="btn btn-secondary">取消</button>
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
        this.addIconSelectorStyles();
        
        // 获取元素
        const dialog = document.querySelector('.dialog-overlay');
        const form = document.getElementById('editCategoryForm');
        const closeBtn = document.getElementById('editCategoryDialogClose');
        const cancelBtn = document.getElementById('editCategoryCancel');
        const iconSelector = document.querySelector('.icon-selector');
        const categoryIconInput = document.getElementById('editCategoryIcon');
        
        // 关闭对话框函数
        const closeDialog = () => {
            this.closeDialog(dialog);
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
        
        // 图标选择事件
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
                categoryIconInput.value = iconOption.dataset.icon;
            }
        });
        
        // 保存表单
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 获取表单数据
            const name = document.getElementById('editCategoryName').value.trim();
            const icon = categoryIconInput.value;
            
            try {
                // 更新分类
                const result = await this.updateCategory(category.id, name, icon);
                
                if (result.success) {
                    // 重新加载数据
                    await this.loadData();
                    
                    // 重新渲染分类导航
                    this.renderCategoryNav();
                    
                    this.toast.show('分类更新成功', 'success');
                    closeDialog();
                } else {
                    this.toast.show(`更新失败: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('更新分类失败:', error);
                this.toast.show('更新分类失败', 'error');
            }
        });
    }
    
    // 显示编辑二级分类对话框
    async showEditSubcategoryDialog(subcategory) {
        // 先关闭所有现有对话框
        this.closeAllDialogs();
        
        // 常用Font Awesome图标列表
        const fontAwesomeIcons = [
            'fas fa-home', 'fas fa-building', 'fas fa-graduation-cap', 'fas fa-laptop',
            'fas fa-music', 'fas fa-video', 'fas fa-gamepad', 'fas fa-book',
            'fas fa-shopping-cart', 'fas fa-truck', 'fas fa-map-marker-alt', 'fas fa-plane',
            'fas fa-heartbeat', 'fas fa-medkit', 'fas fa-cutlery', 'fas fa-coffee',
            'fas fa-camera', 'fas fa-paint-brush', 'fas fa-code', 'fas fa-chart-line',
            'fas fa-briefcase', 'fas fa-users', 'fas fa-cog', 'fas fa-globe',
            'fas fa-folder', 'fas fa-file-alt', 'fas fa-image', 'fas fa-search',
            'fas fa-star', 'fas fa-heart', 'fas fa-bell', 'fas fa-envelope'
        ];
        
        // 创建编辑对话框
        const dialogHtml = `
            <div class="dialog-overlay">
                <div class="dialog">
                    <div class="dialog-header">
                        <h3>编辑二级分类</h3>
                        <button class="dialog-close" id="editSubcategoryDialogClose">&times;</button>
                    </div>
                    <div class="dialog-body">
                        <form id="editSubcategoryForm">
                            <div class="form-group">
                                <label for="editSubcategoryName">分类名称</label>
                                <input type="text" id="editSubcategoryName" class="form-control" value="${escapeHtml(subcategory.name)}" required>
                            </div>
                            <div class="form-group">
                                <label>选择图标</label>
                                <div class="icon-selector">
                                    ${fontAwesomeIcons.map(icon => `
                                        <div class="icon-option ${subcategory.icon === icon ? 'selected' : ''}" data-icon="${icon}">
                                            <i class="${icon}"></i>
                                        </div>
                                    `).join('')}
                                </div>
                                <input type="hidden" id="editSubcategoryIcon" name="subcategoryIcon" value="${subcategory.icon || 'fas fa-folder'}">
                            </div>
                            <div class="dialog-footer">
                                <button type="button" id="editSubcategoryCancel" class="btn btn-secondary">取消</button>
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
        this.addIconSelectorStyles();
        
        // 获取元素
        const dialog = document.querySelector('.dialog-overlay');
        const form = document.getElementById('editSubcategoryForm');
        const closeBtn = document.getElementById('editSubcategoryDialogClose');
        const cancelBtn = document.getElementById('editSubcategoryCancel');
        const iconSelector = document.querySelector('.icon-selector');
        const subcategoryIconInput = document.getElementById('editSubcategoryIcon');
        
        // 关闭对话框函数
        const closeDialog = () => {
            this.closeDialog(dialog);
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
        
        // 图标选择事件
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
                subcategoryIconInput.value = iconOption.dataset.icon;
            }
        });
        
        // 保存表单
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 获取表单数据
            const name = document.getElementById('editSubcategoryName').value.trim();
            const icon = subcategoryIconInput.value;
            
            try {
                // 更新子分类
                const result = await this.updateSubcategory(subcategory.id, name, icon);
                
                if (result.success) {
                    // 重新加载数据
                    await this.loadData();
                    
                    // 重新渲染二级分类标签
                    this.renderSubcategoryTabs();
                    
                    this.toast.show('子分类更新成功', 'success');
                    closeDialog();
                } else {
                    this.toast.show(`更新失败: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('更新子分类失败:', error);
                this.toast.show('更新子分类失败', 'error');
            }
        });
    }
    
    // 更新一级分类
    async updateCategory(categoryId, name, icon) {
        try {
            const data = await DataManager.getAllData();
            let categoryFound = false;
            
            // 查找并更新分类
            for (const mainCat of data.mainCategories) {
                for (const cat of mainCat.categories) {
                    if (cat.id === categoryId) {
                        cat.name = name;
                        if (icon) {
                            cat.icon = icon;
                        }
                        categoryFound = true;
                        break;
                    }
                }
                if (categoryFound) break;
            }
            
            if (!categoryFound) {
                return { success: false, message: '分类不存在' };
            }
            
            // 保存数据
            const saved = await DataManager.saveAllData(data);
            if (saved) {
                return { success: true, message: '分类更新成功' };
            } else {
                return { success: false, message: '保存失败' };
            }
        } catch (error) {
            console.error('更新分类失败:', error);
            return { success: false, message: error.message };
        }
    }
    
    // 更新二级分类
    async updateSubcategory(subcategoryId, name, icon) {
        try {
            const data = await DataManager.getAllData();
            let subcategoryFound = false;
            
            // 查找并更新子分类
            for (const mainCat of data.mainCategories) {
                for (const cat of mainCat.categories) {
                    for (const subCat of cat.subCategories) {
                        if (subCat.id === subcategoryId) {
                            subCat.name = name;
                            if (icon) {
                                subCat.icon = icon;
                            }
                            subcategoryFound = true;
                            break;
                        }
                    }
                    if (subcategoryFound) break;
                }
                if (subcategoryFound) break;
            }
            
            if (!subcategoryFound) {
                return { success: false, message: '子分类不存在' };
            }
            
            // 保存数据
            const saved = await DataManager.saveAllData(data);
            if (saved) {
                return { success: true, message: '子分类更新成功' };
            } else {
                return { success: false, message: '保存失败' };
            }
        } catch (error) {
            console.error('更新子分类失败:', error);
            return { success: false, message: error.message };
        }
    }
    
    // 处理搜索输入
    handleSearch(keyword) {
        if (!keyword.trim()) {
            this.clearSearch();
            return;
        }
        
        const results = this.searchWebsites(keyword);
        this.showSearchSuggestions(results);
    }
    
    // 搜索网站
    searchWebsites(keyword) {
        const lowerKeyword = keyword.toLowerCase();
        const results = [];
        
        for (const mainCat of this.currentData.mainCategories) {
            for (const cat of mainCat.categories) {
                for (const subCat of cat.subCategories) {
                    for (const website of subCat.websites) {
                        // 检查标题、描述和标签
                        const matchesName = website.name.toLowerCase().includes(lowerKeyword);
                        const matchesDesc = website.desc && website.desc.toLowerCase().includes(lowerKeyword);
                        const matchesTags = website.tags && website.tags.some(tag => tag.toLowerCase().includes(lowerKeyword));
                        
                        if (matchesName || matchesDesc || matchesTags) {
                            results.push({
                                ...website,
                                categoryName: cat.name,
                                subcategoryName: subCat.name
                            });
                        }
                    }
                }
            }
        }
        
        return results;
    }
    
    // 显示搜索建议
    showSearchSuggestions(results) {
        if (results.length === 0) {
            this.searchSuggestions.innerHTML = '<div class="search-suggestion-item no-results">没有找到匹配的结果</div>';
            this.searchSuggestions.style.display = 'block';
            return;
        }
        
        this.searchSuggestions.innerHTML = results.map(result => `
            <div class="search-suggestion-item" data-website-id="${result.id}">
                <div class="suggestion-title">${escapeHtml(result.name)}</div>
                <div class="suggestion-desc">${escapeHtml(result.desc || '')}</div>
                <div class="suggestion-type">${escapeHtml(result.categoryName)} > ${escapeHtml(result.subcategoryName)}</div>
                ${result.tags && result.tags.length > 0 ? `<div class="suggestion-tags">${result.tags.map(tag => `<span class="website-tag">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
            </div>
        `).join('');
        
        this.searchSuggestions.style.display = 'block';
    }
    
    // 执行搜索
    performSearch(keyword) {
        const results = this.searchWebsites(keyword);
        this.showSearchResults(results);
    }
    
    // 显示搜索结果
    showSearchResults(results) {
        // 清空当前网站列表
        this.websiteList.innerHTML = '';
        
        if (results.length === 0) {
            this.websiteList.innerHTML = '<div class="no-results">没有找到匹配的结果</div>';
            return;
        }
        
        // 显示搜索结果
        // 从配置中获取默认图标类型
        const defaultIconType = this.currentData?.config?.defaultIconType || 'globe';
        
        results.forEach(result => {
            const card = new WebsiteCard(result, (website) => {
                this.visitWebsite(website.id);
            }, defaultIconType);
            this.websiteList.appendChild(card.getElement());
        });
        
        // 隐藏搜索建议
        this.searchSuggestions.style.display = 'none';
    }
    
    // 清空搜索
    clearSearch() {
        this.searchInput.value = '';
        this.searchSuggestions.style.display = 'none';
        
        // 恢复显示当前分类的网站
        if (this.currentSubCategory) {
            this.renderWebsiteList();
        }
    }
    
    // 访问网站
    visitWebsite(websiteId) {
        const website = this.findWebsiteById(websiteId);
        if (website) {
            browserAPI.tabs.create({ url: website.url, active: true });
        }
    }
    
    // 添加对话框样式（复用）
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
                    width: 400px;
                    max-width: 90%;
                }
                
                .dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    border-bottom: 1px solid var(--border-color);
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
                    color: var(--text-muted);
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all var(--transition-fast);
                }
                
                .dialog-close:hover {
                    background-color: var(--primary-light);
                    color: var(--primary-color);
                }
                
                .dialog-body {
                    padding: 16px;
                }
                
                .form-group {
                    margin-bottom: 16px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                }
                
                .form-control {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    font-size: 14px;
                    transition: border-color var(--transition-fast);
                }
                
                .form-control:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                }
                
                textarea.form-control {
                    resize: vertical;
                    min-height: 80px;
                }
                
                .dialog-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    margin-top: 24px;
                }
                
                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                
                .btn-primary {
                    background-color: var(--primary-color);
                    color: white;
                }
                
                .btn-primary:hover {
                    background-color: var(--primary-hover);
                }
                
                .btn-secondary {
                    background-color: var(--secondary-light);
                    color: var(--text-primary);
                }
                
                .btn-secondary:hover {
                    background-color: var(--secondary-color);
                    color: white;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 关闭所有对话框
    closeAllDialogs() {
        // 关闭所有对话框覆盖层
        const dialogs = document.querySelectorAll('.dialog-overlay');
        dialogs.forEach(dialog => {
            try {
                if (dialog && dialog.parentNode === document.body) {
                    document.body.removeChild(dialog);
                }
            } catch (error) {
                console.error('关闭对话框失败:', error);
            }
        });
        
        // 移除所有临时样式
        const tempStyles = document.querySelectorAll('style[class="dialog-style"]');
        tempStyles.forEach(style => {
            try {
                if (style && style.parentNode === document.head) {
                    document.head.removeChild(style);
                }
            } catch (error) {
                console.error('移除样式失败:', error);
            }
        });
    }
    
    // 关闭单个对话框
    closeDialog(dialog) {
        try {
            if (dialog && dialog.parentNode === document.body) {
                document.body.removeChild(dialog);
            }
        } catch (error) {
            console.error('关闭对话框失败:', error);
        }
    }

    // 处理删除网站
    async handleDeleteWebsite(website) {
        try {
            // 检查是否已达到最大可撤销提示数量
            if (this.toast.activeToasts && this.toast.activeToasts.size >= 3) {
                this.toast.show('当前撤销提示已达上限，无法删除更多网站', 'warning');
                return;
            }
            
            // 保存网站信息，用于撤销操作
            const deletedWebsite = { ...website };
            const mainCategoryId = this.currentMainCategory.id;
            const categoryId = this.currentCategory.id;
            const subcategoryId = this.currentSubCategory.id;
            
            // 从UI中暂时隐藏网站（不立即删除数据）
            const websiteCard = document.querySelector(`[data-website-id="${website.id}"]`);
            if (websiteCard) {
                websiteCard.style.display = 'none';
            }
            
            // 创建真正删除操作的定时器引用
            let deleteTimeout = null;
            
            // 显示可撤销的删除提示
            const toastShown = this.toast.show('网站已删除', 'success', {
                undoable: true,
                onUndo: async () => {
                    // 撤销删除 - 清除定时器并恢复网站显示
                    if (deleteTimeout) {
                        clearTimeout(deleteTimeout);
                    }
                    if (websiteCard) {
                        websiteCard.style.display = '';
                    }
                    this.toast.show('删除已撤销', 'success');
                }
            });
            
            // 如果提示未显示成功（超过数量限制），恢复网站显示
            if (!toastShown) {
                if (websiteCard) {
                    websiteCard.style.display = '';
                }
                this.toast.show('当前撤销提示已达上限，无法删除更多网站', 'warning');
                return;
            }
            
            // 3秒后执行真正的删除操作
            deleteTimeout = setTimeout(async () => {
                try {
                    // 执行真正的删除
                    const result = await DataManager.deleteWebsite(website.id);
                    
                    if (result.success) {
                        // 删除成功后重新加载数据和渲染列表
                        await this.loadData();
                        this.renderWebsiteList();
                    } else {
                        // 删除失败，恢复网站显示
                        if (websiteCard) {
                            websiteCard.style.display = '';
                        }
                        this.toast.show(`删除失败: ${result.message}`, 'error');
                    }
                } catch (error) {
                    console.error('删除网站失败:', error);
                    // 出错时恢复网站显示
                    if (websiteCard) {
                        websiteCard.style.display = '';
                    }
                    this.toast.show('删除网站失败', 'error');
                }
            }, 3000);
            
        } catch (error) {
            console.error('删除网站失败:', error);
            this.toast.show('删除网站失败', 'error');
        }
    }
    
    // 执行一级分类删除
    async performDeleteCategory(mainCategoryId, categoryId, categoryName) {
        // 显示带有倒计时的二次确认对话框
        await this.showDeleteConfirmationDialog(
            `确定要删除一级分类 "${categoryName}" 吗？\n删除后该分类下的所有二级分类和网站也将被删除！`,
            async () => {
                try {
                    // 直接调用DataManager删除分类，不依赖内部状态
                    const result = await DataManager.deleteCategory(mainCategoryId, categoryId);
                    
                    if (result) {
                        // 重新加载数据
                        await this.loadData();
                        
                        // 重新渲染分类导航
                        this.renderCategoryNav();
                        
                        // 重新渲染网站列表
                        this.renderWebsiteList();
                        
                        this.toast.show('分类删除成功', 'success');
                    } else {
                        this.toast.show('删除失败', 'error');
                    }
                } catch (error) {
                    console.error('删除分类失败:', error);
                    this.toast.show('删除分类失败', 'error');
                }
            }
        );
    }
    
    // 处理删除一级分类
    async handleDeleteCategory(category) {
        // 兼容旧代码，调用新的performDeleteCategory方法
        // 直接从DataManager获取最新数据
        const latestData = await DataManager.getAllData();
        
        // 查找主类ID
        const mainCategoryId = latestData.mainCategories.find(
            mc => mc.categories.some(cat => cat.id === category.id)
        )?.id;
        
        if (!mainCategoryId) {
            this.toast.show('未找到对应的主类', 'error');
            return;
        }
        
        await this.performDeleteCategory(mainCategoryId, category.id, category.name);
    }
    
    // 执行二级分类删除
    async performDeleteSubcategory(mainCategoryId, categoryId, subcategoryId, subcategoryName) {
        // 显示带有倒计时的二次确认对话框
        await this.showDeleteConfirmationDialog(
            `确定要删除二级分类 "${subcategoryName}" 吗？\n删除后该分类下的所有网站也将被删除！`,
            async () => {
                try {
                    // 直接调用DataManager删除子分类，不依赖内部状态
                    const result = await DataManager.deleteSubcategory(mainCategoryId, categoryId, subcategoryId);
                    
                    if (result) {
                        // 重新加载数据
                        await this.loadData();
                        
                        // 重新渲染二级分类标签
                        this.renderSubcategoryTabs();
                        
                        // 重新渲染网站列表
                        this.renderWebsiteList();
                        
                        this.toast.show('子分类删除成功', 'success');
                    } else {
                        this.toast.show('删除失败', 'error');
                    }
                } catch (error) {
                    console.error('删除子分类失败:', error);
                    this.toast.show('删除子分类失败', 'error');
                }
            }
        );
    }
    
    // 处理删除二级分类
    async handleDeleteSubcategory(subcategory) {
        // 兼容旧代码，调用新的performDeleteSubcategory方法
        // 直接从DataManager获取最新数据
        const latestData = await DataManager.getAllData();
        
        // 查找主类ID和分类ID
        let mainCategoryId = null;
        let categoryId = null;
        
        for (const mainCat of latestData.mainCategories) {
            for (const cat of mainCat.categories) {
                if (cat.subCategories.some(subCat => subCat.id === subcategory.id)) {
                    mainCategoryId = mainCat.id;
                    categoryId = cat.id;
                    break;
                }
            }
            if (mainCategoryId) break;
        }
        
        if (!mainCategoryId || !categoryId) {
            this.toast.show('未找到对应的主类或分类', 'error');
            return;
        }
        
        await this.performDeleteSubcategory(mainCategoryId, categoryId, subcategory.id, subcategory.name);
    }
    
    // 显示带有倒计时的删除确认对话框
    async showDeleteConfirmationDialog(message, onConfirm) {
        return new Promise((resolve) => {
            // 先关闭所有现有对话框
            this.closeAllDialogs();
            
            // 创建删除确认对话框
            const dialogHtml = `
                <div class="dialog-overlay">
                    <div class="dialog">
                        <div class="dialog-header">
                            <h3>确认删除</h3>
                            <button class="dialog-close" id="deleteDialogClose">&times;</button>
                        </div>
                        <div class="dialog-body">
                            <div class="delete-message">${escapeHtml(message)}</div>
                            <div class="countdown-container">
                                <div class="countdown-text">请确认删除操作，倒计时：</div>
                                <div class="countdown-timer" id="countdownTimer">5</div>
                            </div>
                            <div class="dialog-footer">
                                <button type="button" id="deleteCancelBtn" class="btn btn-secondary">取消</button>
                                <button type="button" id="deleteConfirmBtn" class="btn btn-danger" disabled>删除</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // 插入对话框
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = dialogHtml;
            document.body.appendChild(tempDiv.firstElementChild);
            
            // 添加样式：先添加基础对话框样式，再添加删除对话框样式
            this.addDialogStyles();
            this.addDeleteDialogStyles();
            
            // 获取元素
            const dialog = document.querySelector('.dialog-overlay');
            const closeBtn = document.getElementById('deleteDialogClose');
            const cancelBtn = document.getElementById('deleteCancelBtn');
            const confirmBtn = document.getElementById('deleteConfirmBtn');
            const timerElement = document.getElementById('countdownTimer');
            
            // 倒计时逻辑
            let countdown = 5;
            timerElement.textContent = countdown;
            
            const countdownInterval = setInterval(() => {
                countdown--;
                timerElement.textContent = countdown;
                
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    confirmBtn.disabled = false;
                    confirmBtn.classList.add('active');
                }
            }, 1000);
            
            // 关闭对话框函数
            const closeDialog = () => {
                clearInterval(countdownInterval);
                // 检查对话框是否仍然是body的子节点，避免重复删除导致的错误
                if (dialog && dialog.parentNode === document.body) {
                    document.body.removeChild(dialog);
                }
                resolve();
            };
            
            // 绑定事件
            closeBtn.addEventListener('click', closeDialog);
            cancelBtn.addEventListener('click', closeDialog);
            
            // 确认删除
            confirmBtn.addEventListener('click', async () => {
                clearInterval(countdownInterval);
                await onConfirm();
                closeDialog();
            });
            
            // 点击外部关闭
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    closeDialog();
                }
            });
        });
    }
    
    // 删除一级分类
    async deleteCategory(categoryId) {
        try {
            const data = await DataManager.getAllData();
            let categoryFound = false;
            
            // 查找并删除分类
            for (const mainCat of data.mainCategories) {
                const categoryIndex = mainCat.categories.findIndex(cat => cat.id === categoryId);
                if (categoryIndex !== -1) {
                    mainCat.categories.splice(categoryIndex, 1);
                    categoryFound = true;
                    break;
                }
            }
            
            if (!categoryFound) {
                return { success: false, message: '分类不存在' };
            }
            
            // 保存数据
            const saved = await DataManager.saveAllData(data);
            if (saved) {
                return { success: true, message: '分类删除成功' };
            } else {
                return { success: false, message: '保存失败' };
            }
        } catch (error) {
            console.error('删除分类失败:', error);
            return { success: false, message: error.message };
        }
    }
    
    // 删除二级分类
    async deleteSubcategory(subcategoryId) {
        try {
            const data = await DataManager.getAllData();
            let subcategoryFound = false;
            
            // 查找并删除子分类
            for (const mainCat of data.mainCategories) {
                for (const cat of mainCat.categories) {
                    const subcategoryIndex = cat.subCategories.findIndex(subCat => subCat.id === subcategoryId);
                    if (subcategoryIndex !== -1) {
                        cat.subCategories.splice(subcategoryIndex, 1);
                        subcategoryFound = true;
                        break;
                    }
                }
                if (subcategoryFound) break;
            }
            
            if (!subcategoryFound) {
                return { success: false, message: '子分类不存在' };
            }
            
            // 保存数据
            const saved = await DataManager.saveAllData(data);
            if (saved) {
                return { success: true, message: '子分类删除成功' };
            } else {
                return { success: false, message: '保存失败' };
            }
        } catch (error) {
            console.error('删除子分类失败:', error);
            return { success: false, message: error.message };
        }
    }
    
    // 添加删除对话框样式
    addDeleteDialogStyles() {
        // 检查是否已经添加过样式
        if (!document.getElementById('delete-dialog-styles')) {
            const style = document.createElement('style');
            style.id = 'delete-dialog-styles';
            style.textContent = `
                .delete-message {
                    margin-bottom: 16px;
                    color: var(--text-primary);
                    line-height: 1.5;
                }
                
                .countdown-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin: 16px 0;
                    padding: 16px;
                    background-color: var(--bg-tertiary);
                    border-radius: var(--radius-md);
                }
                
                .countdown-text {
                    font-size: var(--font-size-sm);
                    color: var(--text-secondary);
                }
                
                .countdown-timer {
                    font-size: var(--font-size-2xl);
                    font-weight: bold;
                    color: var(--primary-color);
                }
                
                .btn-danger {
                    background-color: var(--error-color);
                    color: white;
                }
                
                .btn-danger:hover {
                    background-color: #dc2626;
                }
                
                .btn-danger:disabled {
                    background-color: var(--secondary-light);
                    color: var(--text-muted);
                    cursor: not-allowed;
                }
                
                .btn-danger.active {
                    animation: pulse 1s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 处理新增网址
    async handleAddWebsite() {
        if (!this.currentSubCategory) {
            this.toast.show('请先选择一个二级分类', 'warning');
            return;
        }
        
        try {
            // 获取当前活动标签页的URL和标题
            const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            
            if (!tab || !tab.url) {
                this.toast.show('无法获取当前标签页信息', 'error');
                return;
            }
            
            // 使用DataManager添加网站
            const result = await DataManager.createWebsite(
                this.currentMainCategory.id,
                this.currentCategory.id,
                this.currentSubCategory.id,
                tab.title || new URL(tab.url).hostname,
                tab.url,
                '',
                []
            );
            
            if (result.success) {
                // 重新加载数据
                await this.loadData();
                
                // 重新渲染网站列表
                this.renderWebsiteList();
                
                this.toast.show('网址添加成功', 'success');
            } else {
                this.toast.show(`添加失败: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('添加网址失败:', error);
            this.toast.show('添加网址失败', 'error');
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new PopupApp();
});