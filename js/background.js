// 后台脚本
// 用于处理来自悬浮窗的消息

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openPopup') {
        try {
            // 尝试使用chrome.action.openPopup()打开扩展的弹出页面
            chrome.action.openPopup().catch(error => {
                console.error('使用chrome.action.openPopup()打开失败:', error);
                
                // 备用方案：打开一个新的标签页显示popup.html
                chrome.tabs.create({
                    url: chrome.runtime.getURL('popup.html'),
                    active: true,
                    pinned: false
                });
            });
        } catch (error) {
            console.error('处理openPopup消息失败:', error);
            
            // 最终备用方案：打开一个新的标签页显示popup.html
            chrome.tabs.create({
                url: chrome.runtime.getURL('popup.html'),
                active: true,
                pinned: false
            });
        }
        
        sendResponse({ success: true });
        return true; // 保持消息通道打开，以便异步发送响应
    } else if (message.action === 'bookmarkPage') {
        // 处理收藏页面请求
        handleBookmarkPage(message, sender, sendResponse);
        return true; // 保持消息通道打开，以便异步发送响应
    }
});

// 处理收藏页面请求
async function handleBookmarkPage(message, sender, sendResponse) {
    console.log('收到收藏页面请求:', message);
    
    try {
        // 直接打开扩展的popup页面，让用户在popup中完成收藏操作
        // 这样可以避免在ServiceWorker中处理复杂的数据操作
        chrome.action.openPopup().catch(error => {
            console.error('使用chrome.action.openPopup()打开失败:', error);
            
            // 备用方案：打开一个新的标签页显示popup.html
            chrome.tabs.create({
                url: chrome.runtime.getURL('popup.html'),
                active: true,
                pinned: false
            });
        });
        
        sendResponse({ success: true });
    } catch (error) {
        console.error('处理收藏页面请求失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}