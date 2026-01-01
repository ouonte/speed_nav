// 图标管理模块 - 统一管理和获取图标资源
import { DatabaseManager } from './db.js';

// 内存缓存，用于缓存已获取的图标，减少对localStorage的访问
let faviconMemoryCache = new Map();

// 图标缓存配置
const FAVICON_CACHE_CONFIG = {
  MEMORY_TTL: 24 * 60 * 60 * 1000, // 内存缓存24小时
  LOCAL_STORAGE_TTL: 7 * 24 * 60 * 60 * 1000, // 本地存储缓存7天
  MAX_RETRIES: 1, // 重试次数
  TIMEOUTS: {
    LOCAL: 2000, // 本地favicon.ico超时2秒
    HTML: 3000, // HTML提取超时3秒
    API: 4000, // API请求超时4秒
    GOOGLE: 3000 // Google服务超时3秒
  }
};

// 颜色映射，用于生成文字图标的背景色
const COLOR_MAP = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#0ABDE3', '#1DD1A1',
  '#F368E0', '#FF9F43', '#EE5A24', '#009432', '#0652DD'
];

/**
 * 图标管理器类 - 统一管理和获取图标资源
 * 支持标准图标资源和文字图标（首字母图标和文字内容图标）
 */
export class IconManager {
  /**
   * 初始化图标管理器
   * @param {Object} config - 图标配置
   */
  constructor(config = {}) {
    this.config = {
      faviconApi: config.faviconApi || 'https://icon.bqb.cool?url=',
      faviconApiBackup: config.faviconApiBackup || 'https://icon.bqb.cool?url=',
      apiTimeout: config.apiTimeout || 5000,
      defaultIconType: config.defaultIconType || 'globe', // globe或text
      useFaviconIco: config.useFaviconIco !== false, // 是否使用/favicon.ico
      useRegex: config.useRegex !== false, // 是否使用正则表达式提取
      ...config
    };
  }

  /**
   * 生成缓存键
   * @param {string} url - 网站URL
   * @returns {string} 缓存键
   */
  static generateCacheKey(url) {
    let processedUrl = url;
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = `https://${processedUrl}`;
    }
    const cleanUrl = processedUrl.replace(/[`\s]/g, '');
    return `favicon_${btoa(cleanUrl)}`;
  }

  /**
   * 获取缓存的图标
   * @param {string} url - 网站URL
   * @returns {Promise<string|null>} 缓存的图标URL或null
   */
  static async getCachedIcon(url) {
    try {
      const cacheKey = this.generateCacheKey(url);
      
      // 1. 检查内存缓存
      if (faviconMemoryCache.has(cacheKey)) {
        const cached = faviconMemoryCache.get(cacheKey);
        const now = Date.now();
        if (now < cached.expires) {
          return cached.url;
        } else {
          faviconMemoryCache.delete(cacheKey);
        }
      }
      
      // 2. 检查数据库缓存
      const dbCachedFavicon = await DatabaseManager.getFavicon(url);
      if (dbCachedFavicon) {
        const now = Date.now();
        const memoryExpires = now + FAVICON_CACHE_CONFIG.MEMORY_TTL;
        const localStorageExpires = now + FAVICON_CACHE_CONFIG.LOCAL_STORAGE_TTL;
        
        faviconMemoryCache.set(cacheKey, { url: dbCachedFavicon, expires: memoryExpires });
        localStorage.setItem(cacheKey, dbCachedFavicon);
        localStorage.setItem(`${cacheKey}_expires`, localStorageExpires.toString());
        
        return dbCachedFavicon;
      }
      
      // 3. 检查localStorage缓存
      const cachedFavicon = localStorage.getItem(cacheKey);
      const cachedExpires = localStorage.getItem(`${cacheKey}_expires`);
      
      if (cachedFavicon && cachedExpires) {
        const now = Date.now();
        const expires = parseInt(cachedExpires);
        if (now < expires) {
          faviconMemoryCache.set(cacheKey, { url: cachedFavicon, expires: now + FAVICON_CACHE_CONFIG.MEMORY_TTL });
          await DatabaseManager.saveFavicon(url, cachedFavicon);
          return cachedFavicon;
        } else {
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(`${cacheKey}_expires`);
        }
      }
      
      return null;
    } catch (error) {
      console.error('获取缓存图标失败:', error);
      return null;
    }
  }

  /**
   * 保存图标到缓存
   * @param {string} url - 网站URL
   * @param {string} iconUrl - 图标URL
   */
  static async saveIconToCache(url, iconUrl) {
    try {
      const cacheKey = this.generateCacheKey(url);
      const now = Date.now();
      const memoryExpires = now + FAVICON_CACHE_CONFIG.MEMORY_TTL;
      const localStorageExpires = now + FAVICON_CACHE_CONFIG.LOCAL_STORAGE_TTL;
      
      // 保存到内存缓存
      faviconMemoryCache.set(cacheKey, { url: iconUrl, expires: memoryExpires });
      
      // 保存到localStorage
      localStorage.setItem(cacheKey, iconUrl);
      localStorage.setItem(`${cacheKey}_expires`, localStorageExpires.toString());
      
      // 保存到数据库
      await DatabaseManager.saveFavicon(url, iconUrl);
    } catch (error) {
      console.error('保存图标到缓存失败:', error);
    }
  }

  /**
   * 尝试加载图片
   * @param {string} iconUrl - 图标URL
   * @param {number} timeout - 超时时间
   * @returns {Promise<string>} 成功的图标URL
   */
  static tryLoadImage(iconUrl, timeout = 5000) {
    // 根据URL类型调整超时时间
    if (iconUrl.includes('/favicon.ico')) {
      timeout = Math.min(timeout, FAVICON_CACHE_CONFIG.TIMEOUTS.LOCAL);
    } else if (iconUrl.includes('google.com/s2/favicons')) {
      timeout = Math.min(timeout, FAVICON_CACHE_CONFIG.TIMEOUTS.GOOGLE);
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
      
      img.crossOrigin = 'anonymous';
      img.src = iconUrl;
    });
  }

  /**
   * 使用正则表达式从网页中提取图标
   * @param {string} url - 网站URL
   * @param {number} timeout - 超时时间
   * @returns {Promise<string|null>} 提取到的图标URL或null
   */
  static async extractIconWithRegex(url, timeout = 5000) {
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
        /<link[^>]*rel=["']icon["'][^>]*href=["']([^"']+)["'][^>]*>/i,
        /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["'][^>]*>/i,
        /<link[^>]*rel=["']shortcut icon["'][^>]*href=["']([^"']+)["'][^>]*>/i,
        /<link[^>]*rel=["']apple-touch-icon-precomposed["'][^>]*href=["']([^"']+)["'][^>]*>/i
      ];
      
      let matchedUrl = null;
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

  /**
   * 生成文字图标
   * @param {string} text - 文字内容
   * @param {Object} options - 选项
   * @returns {string} SVG格式的文字图标
   */
  static generateTextIcon(text, options = {}) {
    const {
      type = 'first', // first（首字母）或 full（完整文字）
      size = 48,
      backgroundColor = null,
      textColor = '#ffffff'
    } = options;

    // 根据类型获取显示文本
    const displayText = type === 'full' 
      ? text.length > 4 ? text.substring(0, 4) : text 
      : text.charAt(0).toUpperCase();

    // 生成背景色（如果未提供）
    const bgColor = backgroundColor || this.generateBackgroundColor(text);

    // 创建SVG
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="${bgColor}" rx="8" ry="8"/>
        <text x="50%" y="50%" font-size="${size * 0.45}" fill="${textColor}" text-anchor="middle" dominant-baseline="middle" font-weight="bold">
          ${displayText}
        </text>
      </svg>
    `;

    // 转换为data URL
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
  }

  /**
   * 生成背景色（基于文本的哈希值）
   * @param {string} text - 文本
   * @returns {string} 背景色
   */
  static generateBackgroundColor(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    const index = Math.abs(hash) % COLOR_MAP.length;
    return COLOR_MAP[index];
  }

  /**
   * 获取默认图标HTML
   * @param {string} name - 网站名称
   * @param {string} type - 图标类型
   * @returns {string} 默认图标HTML
   */
  static getDefaultIconHtml(name, type = 'globe') {
    if (type === 'text') {
      // 使用文字图标
      const firstChar = name && name.length > 0 
        ? name.charAt(0).toUpperCase() 
        : 'W';
      return `<div class="text-icon">${firstChar}</div>`;
    } else {
      // 默认使用小地球图标
      return '<i class="fas fa-globe"></i>';
    }
  }

  /**
   * 获取网站图标URL
   * @param {string} url - 网站URL
   * @param {Object} options - 选项
   * @returns {Promise<string>} 图标URL
   */
  async getFaviconUrl(url, options = {}) {
    try {
      if (!url) {
        console.error('获取favicon失败: URL为空');
        return '';
      }
      
      // 跳过特殊协议，这些协议不受Fetch API支持
      const specialProtocols = ['chrome://', 'chrome-extension://', 'about://', 'moz-extension://', 'edge://'];
      for (const protocol of specialProtocols) {
        if (url.startsWith(protocol)) {
          console.debug(`跳过特殊协议图标获取: ${url}`);
          return '';
        }
      }
      
      // 合并配置
      const opts = {
        ...this.config,
        ...options
      };
      
      // 首先检查缓存
      const cachedIcon = await IconManager.getCachedIcon(url);
      if (cachedIcon) {
        return cachedIcon;
      }
      
      let finalUrl = '';
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = urlObj.hostname;
      const protocol = urlObj.protocol;
      
      // 构建所有可能的图标获取方法，按照优先级排序
      const iconMethods = [];
      
      // 1. 首选：直接访问网站的/favicon.ico（如果启用）
      if (opts.useFaviconIco) {
        iconMethods.push({
          type: 'local',
          url: `${protocol}//${domain}/favicon.ico`,
          name: '本地favicon.ico'
        });
      }
      
      // 2. 次选：尝试从网页HTML中提取图标（如果启用）
      if (opts.useRegex) {
        iconMethods.push({
          type: 'html',
          name: 'HTML提取图标'
        });
      }
      
      // 3. 主选：使用主API获取
      if (opts.faviconApi) {
        iconMethods.push({
          type: 'api',
          url: `${opts.faviconApi}${encodeURIComponent(url)}`,
          name: '主API'
        });
      }
      
      // 4. 备选：使用备选API获取
      if (opts.faviconApiBackup) {
        iconMethods.push({
          type: 'api',
          url: `${opts.faviconApiBackup}${encodeURIComponent(url)}`,
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
            console.log(`尝试获取图标 [${method.name}]: ${url}`);
            iconUrl = await IconManager.extractIconWithRegex(url, opts.apiTimeout);
            if (iconUrl) {
              await IconManager.tryLoadImage(iconUrl, opts.apiTimeout);
              console.log(`成功获取图标 [${method.name}]: ${url} → ${iconUrl}`);
              finalUrl = iconUrl;
              break;
            }
          } else {
            console.log(`尝试获取图标 [${method.name}]: ${url} → ${method.url}`);
            await IconManager.tryLoadImage(method.url, opts.apiTimeout);
            iconUrl = method.url;
            
            finalUrl = iconUrl;
            console.log(`成功获取图标 [${method.name}]: ${url} → ${iconUrl}`);
            break;
          }
        } catch (error) {
          console.error(`获取图标失败 [${method.name}]: ${url}`, error.message);
          // 继续尝试下一个方法
        }
      }
      
      if (finalUrl) {
        // 保存到缓存
        await IconManager.saveIconToCache(url, finalUrl);
        return finalUrl;
      } else {
        console.error(`所有方法获取favicon都失败: ${url}`);
        return '';
      }
    } catch (error) {
      console.error('获取favicon失败:', url, error.message);
      return '';
    }
  }

  /**
   * 获取网站图标HTML
   * @param {string} url - 网站URL
   * @param {string} name - 网站名称
   * @param {Object} options - 选项
   * @returns {Promise<string>} 图标HTML
   */
  async getFaviconHtml(url, name, options = {}) {
    try {
      // 跳过特殊协议，这些协议不受Fetch API支持
      const specialProtocols = ['chrome://', 'chrome-extension://', 'about://', 'moz-extension://', 'edge://'];
      for (const protocol of specialProtocols) {
        if (url.startsWith(protocol)) {
          console.debug(`跳过特殊协议图标HTML生成: ${url}`);
          // 直接返回默认图标，不尝试获取
          const opts = {
            ...this.config,
            ...options
          };
          return IconManager.getDefaultIconHtml(name, opts.defaultIconType);
        }
      }
      
      const opts = {
        ...this.config,
        ...options
      };
      
      // 首先检查缓存
      const cachedIcon = await IconManager.getCachedIcon(url);
      if (cachedIcon) {
        return `<img src="${cachedIcon}" alt="${name} logo" loading="lazy">`;
      }
      
      // 异步获取图标并更新缓存（不阻塞UI）
      this.getFaviconUrl(url, opts).catch(error => {
        console.error('异步获取图标失败:', error);
      });
      
      // 返回默认图标
      return IconManager.getDefaultIconHtml(name, opts.defaultIconType);
    } catch (error) {
      console.error('获取favicon HTML失败:', error);
      return IconManager.getDefaultIconHtml(name, options.defaultIconType || this.config.defaultIconType);
    }
  }

  /**
   * 更新图标管理器配置
   * @param {Object} config - 新配置
   */
  updateConfig(config) {
    this.config = {
      ...this.config,
      ...config
    };
  }

  /**
   * 清除图标缓存
   * @param {string} url - 可选，指定要清除的URL缓存
   */
  static async clearCache(url = null) {
    if (url) {
      // 清除指定URL的缓存
      const cacheKey = this.generateCacheKey(url);
      faviconMemoryCache.delete(cacheKey);
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_expires`);
      await DatabaseManager.deleteFavicon(url);
    } else {
      // 清除所有缓存
      faviconMemoryCache.clear();
      
      // 清除localStorage中所有favicon相关缓存
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('favicon_')) {
          localStorage.removeItem(key);
          i--; // 索引调整
        }
      }
      
      // 清除数据库中的所有favicon
      await DatabaseManager.clearFavicons();
    }
  }
}

// 创建默认实例
export const iconManager = new IconManager();
