// 悬浮窗脚本
class FloatingWidget {
    constructor() {
        this.widget = null;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.originalX = 0;
        this.originalY = 0;
        this.isExpanded = false; // 收缩/伸展状态，默认收缩
        this.autoCollapseTimer = null; // 自动收缩定时器
        this.autoCollapseTime = 3000; // 默认3秒自动收缩
        this.init();
    }

    // 初始化悬浮窗
    init() {
        this.createWidget();
        this.loadPosition();
        this.loadAutoCollapseConfig(); // 加载自动收缩配置
        this.bindEvents();
        this.checkEdgeProximity();
        
        // 初始状态下立即吸附到屏幕边缘
        setTimeout(() => {
            this.snapToEdge();
        }, 100);
    }
    
    // 从存储中加载自动收缩配置
    loadAutoCollapseConfig() {
        // 先检查本地存储中的全局配置
        chrome.storage.local.get(['navData'], (result) => {
            if (result.navData) {
                try {
                    const navData = JSON.parse(result.navData);
                    const collapseTime = navData.config?.autoCollapseTime;
                    if (collapseTime && typeof collapseTime === 'number') {
                        this.autoCollapseTime = collapseTime * 1000; // 转换为毫秒
                    }
                } catch (error) {
                    console.error('解析navData失败:', error);
                }
            }
        });
    }

    // 创建悬浮窗元素
    createWidget() {
        console.log('开始创建悬浮窗...');
        
        // 检查是否已经存在悬浮窗
        if (document.getElementById('floating-widget')) {
            console.log('悬浮窗已存在');
            this.widget = document.getElementById('floating-widget');
            return;
        }
        
        try {
            // 动态引入Font Awesome图标库
            this.loadFontAwesome();
            
            // 创建悬浮窗容器
            this.widget = document.createElement('div');
            this.widget.id = 'floating-widget';
            this.widget.className = 'floating-widget';
            
            // 设置内联样式，确保悬浮窗可见（默认收缩状态，不吸附到边缘）
            this.widget.style.position = 'fixed';
            this.widget.style.top = '50%';
            this.widget.style.right = '20px'; // 默认收缩状态有边距，不吸附到边缘
            this.widget.style.transform = 'translateY(-50%)';
            this.widget.style.width = '15px'; // 调整为更窄的宽度，比文字稍微大一点
            this.widget.style.height = '50px'; // 调整为更合适的高度
            this.widget.style.backgroundColor = '#ffffff';
            this.widget.style.border = '1px solid #e0e0e0';
            this.widget.style.borderRadius = '25px 0 0 25px'; // 左侧椭圆，右侧平边
            this.widget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            this.widget.style.cursor = 'pointer';
            this.widget.style.zIndex = '9999';
            this.widget.style.transition = 'all 0.3s ease';
            this.widget.style.overflow = 'hidden';
            this.widget.style.display = 'flex';
            this.widget.style.alignItems = 'center';
            this.widget.style.justifyContent = 'center';
            this.widget.style.flexDirection = 'row';
            
            // 创建扩展内容容器（默认隐藏）
            const expandedContent = document.createElement('div');
            expandedContent.id = 'expanded-content';
            expandedContent.className = 'expanded-content';
            
            const contentText = document.createElement('div');
            contentText.className = 'content-text';
            contentText.textContent = '收藏网址';
            contentText.style.cssText = `
                font-size: 14px;
                font-weight: 500;
                color: #333333;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            `;
            
            expandedContent.appendChild(contentText);
            
            expandedContent.style.cssText = `
                display: none;
                padding: 0 10px;
                white-space: nowrap;
                align-items: center;
            `;
            
            // 创建展开/收缩按钮
            const toggleButton = document.createElement('div');
            toggleButton.id = 'toggle-button';
            toggleButton.className = 'toggle-button';
            
            // 使用纯CSS绘制的箭头图标（默认向右 >）
            const arrowIcon = document.createElement('div');
            arrowIcon.className = 'arrow-icon';
            arrowIcon.style.cssText = `
                width: 20px;
                height: 20px;
                position: relative;
                transition: all 0.3s ease;
            `;
            
            // 创建箭头的线条
            const arrowLine = document.createElement('div');
            arrowLine.style.cssText = `
                position: absolute;
                top: 50%;
                left: 20%;
                width: 12px;
                height: 3px;
                background-color: #4A90E2;
                transform: translateY(-50%);
                border-radius: 1.5px;
            `;
            
            const arrowHead = document.createElement('div');
            arrowHead.style.cssText = `
                position: absolute;
                top: 50%;
                right: 20%;
                width: 0;
                height: 0;
                border-top: 5px solid transparent;
                border-bottom: 5px solid transparent;
                border-left: 8px solid #4A90E2;
                transform: translateY(-50%);
            `;
            
            // 组合箭头图标
            arrowIcon.appendChild(arrowLine);
            arrowIcon.appendChild(arrowHead);
            toggleButton.appendChild(arrowIcon);
            
            toggleButton.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            // 组合元素 - 确保按钮在外侧
            this.widget.appendChild(expandedContent);
            this.widget.appendChild(toggleButton);
            
            // 添加到页面
            document.body.appendChild(this.widget);
            
            // 绑定切换按钮事件
            toggleButton.addEventListener('click', () => {
                this.toggleExpandedState();
            });
            
            console.log('悬浮窗创建成功，已添加到页面');
        } catch (error) {
            console.error('创建悬浮窗失败:', error);
        }
    }
    
    // 启动自动收缩定时器
    startAutoCollapseTimer() {
        // 清除之前的定时器
        this.clearAutoCollapseTimer();
        
        // 只有在展开状态下才启动定时器
        if (this.isExpanded) {
            this.autoCollapseTimer = setTimeout(() => {
                if (this.isExpanded) {
                    console.log('自动收缩悬浮窗...');
                    this.toggleExpandedState();
                }
            }, this.autoCollapseTime);
        }
    }
    
    // 清除自动收缩定时器
    clearAutoCollapseTimer() {
        if (this.autoCollapseTimer) {
            clearTimeout(this.autoCollapseTimer);
            this.autoCollapseTimer = null;
        }
    }
    
    // 重置自动收缩定时器
    resetAutoCollapseTimer() {
        this.startAutoCollapseTimer();
    }
    
    // 切换收缩/伸展状态
    toggleExpandedState() {
        console.log('切换展开/收缩状态:', this.isExpanded ? '收缩' : '伸展');
        
        this.isExpanded = !this.isExpanded;
        
        const toggleButton = this.widget.querySelector('#toggle-button');
        const expandedContent = this.widget.querySelector('#expanded-content');
        
        if (this.isExpanded) {
            // 切换到伸展状态
            this.widget.style.width = '80px';
            toggleButton.style.width = '20px';
            expandedContent.style.display = 'flex';
            expandedContent.style.alignItems = 'center';
            
            // 启动自动收缩定时器
            this.startAutoCollapseTimer();
        } else {
            // 切换到收缩状态
            this.widget.style.width = '15px'; // 调整为更窄的宽度，比文字稍微大一点
            toggleButton.style.width = '100%';
            expandedContent.style.display = 'none';
            
            // 清除自动收缩定时器
            this.clearAutoCollapseTimer();
        }
        
        // 无论收缩还是伸展状态，都吸附到屏幕边缘并应用正确的边框半径
        setTimeout(() => {
            this.snapToEdge();
        }, 100);
    }

    // 绑定事件
    bindEvents() {
        // 鼠标按下事件 - 开始拖拽
        this.widget.addEventListener('mousedown', (e) => {
            // 只允许左键拖拽
            if (e.button !== 0) return;
            
            this.isDragging = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            
            const rect = this.widget.getBoundingClientRect();
            this.originalX = rect.left;
            this.originalY = rect.top;
            
            // 添加拖拽样式
            this.widget.style.cursor = 'grabbing';
            this.widget.style.zIndex = '10000';
            
            // 绑定全局拖拽事件
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));
            
            // 阻止默认行为，防止文本选择
            e.preventDefault();
        });

        // 点击事件 - 只在伸展状态下打开扩展页面
        this.widget.addEventListener('click', (e) => {
            // 如果正在拖拽，不执行点击操作
            if (this.isDragging) return;
            
            // 检查点击目标是否是切换按钮
            const isToggleClick = e.target.closest('#toggle-button');
            
            if (isToggleClick) {
                // 点击的是切换按钮，已经在createWidget中绑定了事件，这里不需要处理
                return;
            }
            
            // 只有在伸展状态下才能打开扩展页面
            if (this.isExpanded) {
                this.openExtensionPopup();
            }
        });
        
        // 鼠标悬停在悬浮窗上时，重置自动收缩定时器
        this.widget.addEventListener('mouseenter', () => {
            this.clearAutoCollapseTimer();
        });
        
        // 鼠标离开悬浮窗时，重新启动自动收缩定时器
        this.widget.addEventListener('mouseleave', () => {
            this.startAutoCollapseTimer();
        });
        
        // 点击悬浮窗内部时，重置自动收缩定时器
        this.widget.addEventListener('mousedown', () => {
            this.clearAutoCollapseTimer();
        });
        
        // 鼠标释放时，重新启动自动收缩定时器
        this.widget.addEventListener('mouseup', () => {
            this.startAutoCollapseTimer();
        });

        // 鼠标移动事件 - 检查边缘 proximity
        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) {
                this.checkEdgeProximity();
            }
        });

        // 窗口大小变化事件 - 重新检查边缘 proximity
        window.addEventListener('resize', () => {
            this.checkEdgeProximity();
        });
    }

    // 处理鼠标移动事件
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        // 计算拖拽距离
        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;
        
        // 更新悬浮窗位置
        let newX = this.originalX + deltaX;
        let newY = this.originalY + deltaY;
        
        // 限制悬浮窗在可视区域内
        const maxX = window.innerWidth - this.widget.offsetWidth;
        const maxY = window.innerHeight - this.widget.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        // 设置悬浮窗位置
        this.widget.style.left = `${newX}px`;
        this.widget.style.top = `${newY}px`;
        this.widget.style.right = 'auto';
        this.widget.style.bottom = 'auto';
        this.widget.style.transform = 'none';
        
        // 取消边缘检测，拖拽时始终显示完整悬浮窗
        this.widget.classList.remove('hidden');
    }

    // 处理鼠标释放事件
    handleMouseUp() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.widget.style.cursor = 'pointer';
        
        // 将悬浮窗吸附到最近的屏幕边缘
        this.snapToEdge();
        
        // 保存位置
        this.savePosition();
        
        // 移除全局事件监听器
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // 恢复边缘检测
        this.checkEdgeProximity();
    }
    
    // 将悬浮窗吸附到最近的左右边缘
    snapToEdge() {
        const rect = this.widget.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        
        let newLeft = rect.left;
        let newTop = rect.top;
        let newRight = 'auto';
        
        // 计算到左右边缘的距离
        const distanceToLeft = rect.left;
        const distanceToRight = windowWidth - rect.right;
        
        // 获取元素
        const toggleButton = this.widget.querySelector('#toggle-button');
        const expandedContent = this.widget.querySelector('#expanded-content');
        const arrowLine = this.widget.querySelector('.arrow-icon div:first-child');
        const arrowHead = this.widget.querySelector('.arrow-icon div:last-child');
        
        // 找到最近的左右边缘
        if (distanceToLeft < distanceToRight) {
            // 吸附到左侧边缘：左边平，右边圆
            newLeft = 0;
            this.widget.style.left = `${newLeft}px`;
            this.widget.style.top = `${newTop}px`;
            this.widget.style.right = 'auto';
            this.widget.style.bottom = 'auto';
            this.widget.style.borderRadius = '0 25px 25px 0'; // 左边平，右边圆
            
            // 调整布局：按钮在右外侧，内容在左
            this.widget.style.flexDirection = 'row';
            toggleButton.style.order = '2';
            expandedContent.style.order = '1';
            
            // 调整箭头方向为向右（>）
            if (arrowLine && arrowHead) {
                arrowLine.style.left = '20%';
                arrowLine.style.right = 'auto';
                arrowHead.style.left = 'auto';
                arrowHead.style.right = '20%';
                arrowHead.style.borderLeft = '8px solid #4A90E2';
                arrowHead.style.borderRight = 'none';
            }
        } else {
            // 吸附到右侧边缘：右边平，左边圆
            newRight = 0;
            this.widget.style.left = 'auto';
            this.widget.style.top = `${newTop}px`;
            this.widget.style.right = `${newRight}px`;
            this.widget.style.bottom = 'auto';
            this.widget.style.borderRadius = '25px 0 0 25px'; // 右边平，左边圆
            
            // 调整布局：按钮在左外侧，内容在右
            this.widget.style.flexDirection = 'row';
            toggleButton.style.order = '1';
            expandedContent.style.order = '2';
            
            // 调整箭头方向为向左（<）
            if (arrowLine && arrowHead) {
                arrowLine.style.left = 'auto';
                arrowLine.style.right = '20%';
                arrowHead.style.left = '20%';
                arrowHead.style.right = 'auto';
                arrowHead.style.borderLeft = 'none';
                arrowHead.style.borderRight = '8px solid #4A90E2';
            }
        }
        
        // 移除transform属性，避免影响位置计算
        this.widget.style.transform = 'none';
    }

    // 检查边缘 proximity，保持固定在屏幕边缘
    checkEdgeProximity() {
        // 移除隐藏类，确保悬浮窗一直显示
        this.widget.classList.remove('hidden');
        
        // 持续检查并固定在屏幕边缘
        this.snapToEdge();
    }

    // 保存位置到本地存储
    savePosition() {
        const rect = this.widget.getBoundingClientRect();
        const position = {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom
        };
        
        chrome.storage.local.set({ floatingWidgetPosition: position });
    }
    
    // 不再需要动态引入Font Awesome，改为使用本地图标或纯CSS图标
    loadFontAwesome() {
        // 移除Font Awesome相关代码，改为使用本地图标
        console.log('使用本地图标，不再需要Font Awesome');
    }

    // 从本地存储加载位置
    loadPosition() {
        chrome.storage.local.get(['floatingWidgetPosition'], (result) => {
            if (result.floatingWidgetPosition) {
                const pos = result.floatingWidgetPosition;
                this.widget.style.left = `${pos.left}px`;
                this.widget.style.top = `${pos.top}px`;
                this.widget.style.right = 'auto';
                this.widget.style.transform = 'none';
            }
        });
    }

    // 收藏当前页面
    bookmarkCurrentPage() {
        console.log('开始收藏当前页面...');
        
        try {
            // 获取当前页面信息
            const currentPageInfo = {
                title: document.title,
                url: window.location.href
            };
            
            console.log('当前页面信息:', currentPageInfo);
            
            // 向扩展后台发送收藏请求
            chrome.runtime.sendMessage({
                action: 'bookmarkPage',
                pageInfo: currentPageInfo
            }, (response) => {
                if (response && response.success) {
                    console.log('页面收藏成功');
                    this.showNotification('页面收藏成功！');
                } else {
                    console.error('页面收藏失败:', response?.error || '未知错误');
                    this.showNotification('页面收藏失败，请重试', 'error');
                }
            });
        } catch (error) {
            console.error('收藏页面失败:', error);
            this.showNotification('页面收藏失败，请重试', 'error');
        }
    }
    
    // 打开扩展的弹出页面
    openExtensionPopup() {
        try {
            // 向background发送消息，让background打开扩展页面
            // 因为在Manifest V3中，content script不能直接调用chrome.tabs.create
            chrome.runtime.sendMessage({
                action: 'openPopup'
            });
        } catch (error) {
            console.error('打开扩展页面失败:', error);
        }
    }
    
    // 显示通知
    showNotification(message, type = 'success') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `floating-notification ${type}`;
        notification.textContent = message;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
            max-width: 300px;
        `;
        
        // 根据类型设置背景色
        if (type === 'success') {
            notification.style.backgroundColor = '#4caf50';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#f44336';
        } else if (type === 'warning') {
            notification.style.backgroundColor = '#ff9800';
        }
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            
            // 移除元素
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
}

// 初始化悬浮窗 - 直接执行，不等待DOMContentLoaded，确保能被正确注入
console.log('悬浮窗脚本开始执行...');

// 从存储中读取悬浮窗设置，只有启用时才创建悬浮窗
function initFloatingWidget() {
    // 先检查本地存储中的全局配置
    chrome.storage.local.get(['navData'], (result) => {
        let isEnabled = true;
        
        if (result.navData) {
            try {
                const navData = JSON.parse(result.navData);
                isEnabled = navData.config?.floatingWidgetEnabled !== false;
            } catch (error) {
                console.error('解析navData失败:', error);
            }
        }
        
        // 如果启用了悬浮窗，才创建悬浮窗
        if (isEnabled) {
            console.log('延迟执行悬浮窗初始化...');
            new FloatingWidget();
        } else {
            console.log('悬浮窗已被禁用，不创建悬浮窗');
        }
    });
}

// 延迟执行，确保页面DOM已经加载
setTimeout(() => {
    initFloatingWidget();
}, 100);