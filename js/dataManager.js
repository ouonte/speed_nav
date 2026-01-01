/**
 * 数据管理模块
 * 提供完整的数据管理功能，支持跨浏览器兼容性
 * 支持本地存储和数据库存储切换
 */

import { DatabaseManager } from './db.js';

// 浏览器API兼容层 - 导出以便在其他模块中使用
export class BrowserAPI {
  static get storage() {
    return window.browser?.storage || window.chrome?.storage || null;
  }

  static get runtime() {
    return window.browser?.runtime || window.chrome?.runtime || null;
  }

  static get tabs() {
    return window.browser?.tabs || window.chrome?.tabs || null;
  }

  static get downloads() {
    return window.browser?.downloads || window.chrome?.downloads || null;
  }
  
  // 统一Promise接口的tabs.query方法
  static async tabsQuery(options) {
    return new Promise((resolve) => {
      if (this.tabs?.query) {
        const result = this.tabs.query(options);
        if (result && typeof result.then === 'function') {
          result.then(resolve);
        } else {
          this.tabs.query(options, resolve);
        }
      } else {
        resolve([]);
      }
    });
  }
  
  // 统一Promise接口的tabs.create方法
  static async tabsCreate(options) {
    return new Promise((resolve) => {
      if (this.tabs?.create) {
        const result = this.tabs.create(options);
        if (result && typeof result.then === 'function') {
          result.then(resolve);
        } else {
          this.tabs.create(options, resolve);
        }
      } else {
        resolve(null);
      }
    });
  }
  
  // 统一Promise接口的runtime.openOptionsPage方法
  static async runtimeOpenOptionsPage() {
    return new Promise((resolve) => {
      if (this.runtime?.openOptionsPage) {
        const result = this.runtime.openOptionsPage();
        if (result && typeof result.then === 'function') {
          result.then(resolve);
        } else {
          this.runtime.openOptionsPage(resolve);
        }
      } else {
        resolve();
      }
    });
  }
}

/**
 * 默认数据结构
 */
const defaultData = {
  config: {
    useFaviconIco: true, // 是否使用/favicon.ico获取图标
    faviconApi: 'https://icon.bqb.cool?url=', // 主API
    faviconApiBackup: 'https://icon.bqb.cool?url=', // 备选API
    useRegex: true, // 是否使用正则表达式匹配
    faviconRegex: '', // 自定义正则表达式
    faviconApis: [], // 多个API配置，支持自定义优先级
    apiTimeout: 5000, // API请求超时时间（毫秒）
    defaultIconType: 'globe', // 默认图标类型：globe（小地球）或 text（文字图标）
    // WebDAV备份配置
    webdavConfig: {
      url: '', // WebDAV服务器地址
      username: '', // WebDAV用户名
      password: '', // WebDAV密码
      autoBackupEnabled: false, // 是否启用自动备份
      autoBackupInterval: 'daily', // 自动备份间隔：daily（每日）、weekly（每周）、monthly（每月）
      backupTime: 0 // 备份时间（小时，0-23）
    }
  },
  mainCategories: [
    {
      id: "general",
      name: "综合导航",
      icon: "fas fa-compass",
      categories: [
        {
          id: "daily",
          name: "日常办公",
          subCategories: [
            {
              id: "office",
              name: "Office 在线",
              websites: [
                { id: "1", name: "Google Docs", url: "https://docs.google.com", desc: "在线文档编辑工具", tags: ["文档", "在线", "办公"], detail: "Google推出的免费在线文档编辑工具，支持多人协作编辑。" },
                { id: "2", name: "Microsoft 365", url: "https://office.com", desc: "微软办公套件", tags: ["办公", "套件", "云服务"], detail: "微软推出的云端办公套件，包含Word、Excel、PowerPoint等工具。" },
                { id: "3", name: "WPS 在线", url: "https://wps.cn", desc: "国产在线办公软件", tags: ["国产", "办公", "在线"], detail: "金山软件推出的国产在线办公软件，支持多种文档格式。" }
              ]
            },
            {
              id: "cloud",
              name: "云盘存储",
              websites: [
                { id: "4", name: "百度网盘", url: "https://pan.baidu.com", desc: "大容量云存储服务", tags: ["云存储", "百度", "大容量"], detail: "百度推出的云存储服务，提供大容量存储空间和文件分享功能。" },
                { id: "5", name: "阿里云盘", url: "https://www.aliyundrive.com", desc: "阿里云旗下云存储", tags: ["云存储", "阿里", "高速"], detail: "阿里云推出的云存储服务，以高速下载和大存储空间著称。" },
                { id: "6", name: "腾讯微云", url: "https://www.weiyun.com", desc: "腾讯旗下云存储", tags: ["云存储", "腾讯", "便捷"], detail: "腾讯推出的云存储服务，与QQ、微信深度集成。" }
              ]
            }
          ]
        },
        {
          id: "entertainment",
          name: "娱乐休闲",
          subCategories: [
            {
              id: "video",
              name: "视频平台",
              websites: [
                { id: "6", name: "B站", url: "https://www.bilibili.com", desc: "哔哩哔哩弹幕视频", tags: ["视频", "弹幕", "年轻"], detail: "中国年轻一代高度聚集的文化社区和视频平台。" },
                { id: "7", name: "优酷", url: "https://www.youku.com", desc: "优酷视频", tags: ["视频", "剧集", "综艺"], detail: "阿里巴巴旗下的视频平台，提供海量视频内容。" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "ai",
      name: "AI类导航",
      icon: "fas fa-robot",
      categories: [
        {
          id: "ai_tools",
          name: "AI工具",
          subCategories: [
            {
              id: "chat",
              name: "AI聊天",
              websites: [
                { id: "8", name: "ChatGPT", url: "https://chat.openai.com", desc: "OpenAI聊天机器人", tags: ["AI", "聊天", "OpenAI"], detail: "OpenAI开发的先进聊天机器人，能够进行自然语言对话。" },
                { id: "9", name: "文心一言", url: "https://yiyan.baidu.com", desc: "百度文心一言", tags: ["AI", "聊天", "百度"], detail: "百度开发的大语言模型，提供多种AI服务。" }
              ]
            },
            {
              id: "image",
              name: "AI绘画",
              websites: [
                { id: "10", name: "MidJourney", url: "https://www.midjourney.com", desc: "AI绘画工具", tags: ["AI", "绘画", "图像"], detail: "能够根据文字描述生成高质量图像的AI工具。" }
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * 生成唯一ID
 * @param {string} prefix - ID前缀
 * @returns {string} 唯一ID
 */
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 数据验证工具类
 */
export class DataValidator {
  /**
   * 检查字符串中是否包含特殊字符
   * @param {string} str - 要检查的字符串
   * @param {string} fieldName - 字段名称
   * @returns {Object} 检查结果
   */
  static checkSpecialCharacters(str, fieldName) {
    // 定义禁止使用的特殊字符正则表达式（去掉了|和?）
    const specialCharRegex = /[<>'"/\\\*:;]/g;
    
    if (specialCharRegex.test(str)) {
      return { 
        valid: false, 
        message: `${fieldName} 不能包含 <>'"'/\\*:; 等特殊字符` 
      };
    }
    
    return { valid: true };
  }

  /**
   * 验证数据结构
   * @param {Object} data - 要验证的数据
   * @returns {Object} 验证结果
   */
  static validateDataStructure(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, message: '数据格式无效' };
    }

    if (!Array.isArray(data.mainCategories)) {
      return { valid: false, message: '缺少主类导航数组' };
    }

    // 验证主类导航
    for (const mainCat of data.mainCategories) {
      const mainCatValidation = this.validateMainCategory(mainCat);
      if (!mainCatValidation.valid) {
        return mainCatValidation;
      }
    }

    return { valid: true, message: '数据格式验证通过' };
  }

  /**
   * 验证主类导航
   * @param {Object} mainCat - 主类导航数据
   * @returns {Object} 验证结果
   */
  static validateMainCategory(mainCat) {
    if (!mainCat || typeof mainCat !== 'object') {
      return { valid: false, message: '主类导航数据无效' };
    }

    if (!mainCat.id || !mainCat.name || !Array.isArray(mainCat.categories)) {
      return { valid: false, message: `主类导航 "${mainCat.name || '未知'}" 格式无效` };
    }

    // 验证主类名称
    const nameCheck = this.checkSpecialCharacters(mainCat.name, '主类名称');
    if (!nameCheck.valid) {
      return nameCheck;
    }

    // 验证一级分类
    for (const cat of mainCat.categories) {
      const catValidation = this.validateCategory(cat);
      if (!catValidation.valid) {
        return catValidation;
      }
    }

    return { valid: true };
  }

  /**
   * 验证一级分类
   * @param {Object} cat - 一级分类数据
   * @returns {Object} 验证结果
   */
  static validateCategory(cat) {
    if (!cat || typeof cat !== 'object') {
      return { valid: false, message: '一级分类数据无效' };
    }

    if (!cat.id || !cat.name || !Array.isArray(cat.subCategories)) {
      return { valid: false, message: `一级分类 "${cat.name || '未知'}" 格式无效` };
    }

    // 验证一级分类名称
    const nameCheck = this.checkSpecialCharacters(cat.name, '一级分类名称');
    if (!nameCheck.valid) {
      return nameCheck;
    }

    // 验证二级分类
    for (const subCat of cat.subCategories) {
      const subCatValidation = this.validateSubCategory(subCat);
      if (!subCatValidation.valid) {
        return subCatValidation;
      }
    }

    return { valid: true };
  }

  /**
   * 验证二级分类
   * @param {Object} subCat - 二级分类数据
   * @returns {Object} 验证结果
   */
  static validateSubCategory(subCat) {
    if (!subCat || typeof subCat !== 'object') {
      return { valid: false, message: '二级分类数据无效' };
    }

    if (!subCat.id || !subCat.name || !Array.isArray(subCat.websites)) {
      return { valid: false, message: `二级分类 "${subCat.name || '未知'}" 格式无效` };
    }

    // 验证二级分类名称
    const nameCheck = this.checkSpecialCharacters(subCat.name, '二级分类名称');
    if (!nameCheck.valid) {
      return nameCheck;
    }

    // 验证网站数据
    for (const website of subCat.websites) {
      const websiteValidation = this.validateWebsite(website);
      if (!websiteValidation.valid) {
        return websiteValidation;
      }
    }

    return { valid: true };
  }

  /**
   * 验证网站数据
   * @param {Object} website - 网站数据
   * @returns {Object} 验证结果
   */
  static validateWebsite(website) {
    if (!website || typeof website !== 'object') {
      return { valid: false, message: '网站数据无效' };
    }

    if (!website.id || !website.name || !website.url) {
      return { valid: false, message: `网站 "${website.name || '未知'}" 缺少必要字段` };
    }

    // 验证网站名称
    const nameCheck = this.checkSpecialCharacters(website.name, '网站名称');
    if (!nameCheck.valid) {
      return nameCheck;
    }

    // 验证URL格式
    try {
      new URL(website.url);
    } catch {
      return { valid: false, message: `网站 "${website.name}" URL格式无效` };
    }

    // 验证网站描述（如果存在）
    if (website.desc && typeof website.desc === 'string') {
      const descCheck = this.checkSpecialCharacters(website.desc, '网站描述');
      if (!descCheck.valid) {
        return descCheck;
      }
    }

    // 验证网站标签（如果存在）
    if (website.tags && Array.isArray(website.tags)) {
      for (const tag of website.tags) {
        if (typeof tag === 'string') {
          const tagCheck = this.checkSpecialCharacters(tag, '网站标签');
          if (!tagCheck.valid) {
            return tagCheck;
          }
        }
      }
    }

    return { valid: true };
  }
}

/**
 * 数据操作工具类
 */
export class DataManager {
  // 内部缓存配置
  static CACHE_CONFIG = {
    EXPIRY: 10 * 60 * 1000, // 缓存过期时间（10分钟，延长缓存时间减少存储访问）
    KEY: 'navData' // 主存储键名
  };
  
  // 存储配置
  static STORAGE_CONFIG = {
    USE_COMPRESSION: true, // 启用数据压缩
    VERSION_KEY: 'navDataVersion', // 数据版本键名
    HASH_KEY: 'navDataHash', // 数据哈希键名
    LAST_UPDATE_KEY: 'navDataLastUpdate', // 最后更新时间键名
    STORAGE_TYPE_KEY: 'storageType', // 存储类型键名
    DEFAULT_STORAGE_TYPE: 'local' // 默认存储类型: 'local' 或 'database'
  };
  
  // 内部缓存，减少不必要的存储读取
  static _cache = {
    data: null,          // 缓存的数据
    lastUpdated: 0,      // 最后更新时间
    hash: null           // 数据哈希值，用于检测数据变化
  };
  
  /**
   * 数据压缩
   * @param {string} data - 要压缩的数据
   * @returns {string} 压缩后的数据
   */
  static compressData(data) {
    try {
      // 使用LZString压缩算法（如果可用）
      if (typeof LZString !== 'undefined' && LZString.compress) {
        return LZString.compress(data);
      }
      // 否则返回原始数据
      return data;
    } catch (error) {
      console.error('数据压缩失败:', error);
      return data;
    }
  }
  
  /**
   * 数据解压缩
   * @param {string} compressedData - 压缩的数据
   * @returns {string} 解压缩后的数据
   */
  static decompressData(compressedData) {
    try {
      // 使用LZString解压缩算法（如果可用）
      if (typeof LZString !== 'undefined' && LZString.decompress) {
        return LZString.decompress(compressedData);
      }
      // 否则返回原始数据
      return compressedData;
    } catch (error) {
      console.error('数据解压缩失败:', error);
      return compressedData;
    }
  }
  
  /**
   * 生成数据的简单哈希值，用于检测数据变化
   * @param {Object} data - 要生成哈希值的数据
   * @returns {string} 数据的哈希值
   */
  static _generateDataHash(data) {
    try {
      const jsonStr = JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < jsonStr.length; i++) {
        const char = jsonStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
      }
      return hash.toString();
    } catch (error) {
      console.error('生成数据哈希值失败:', error);
      return Date.now().toString();
    }
  }
  
  /**
   * 清除内部缓存
   * @param {string} reason - 清除缓存的原因
   */
  static clearCache(reason = 'unknown') {
    console.debug(`清除缓存: ${reason}`);
    this._cache = {
      data: null,
      lastUpdated: 0,
      hash: null
    };
  }
  
  /**
   * 获取当前存储类型
   * @returns {Promise<string>} 存储类型: 'local', 'indexeddb' 或 'mysql'
   */
  static async getStorageType() {
    try {
      let storageType = this.STORAGE_CONFIG.DEFAULT_STORAGE_TYPE;
      
      if (BrowserAPI.storage?.local?.get) {
        const result = await BrowserAPI.storage.local.get([this.STORAGE_CONFIG.STORAGE_TYPE_KEY]);
        if (result[this.STORAGE_CONFIG.STORAGE_TYPE_KEY]) {
          storageType = result[this.STORAGE_CONFIG.STORAGE_TYPE_KEY];
        }
      }
      
      // 更新数据库管理器的存储类型
      DatabaseManager.setStorageType(storageType);
      return storageType;
    } catch (error) {
      console.error('获取存储类型失败:', error);
      return this.STORAGE_CONFIG.DEFAULT_STORAGE_TYPE;
    }
  }

  /**
   * 设置存储类型
   * @param {string} type - 存储类型: 'local', 'indexeddb' 或 'mysql'
   * @returns {Promise<boolean>} 设置结果
   */
  static async setStorageType(type) {
    try {
      // 验证存储类型是否有效
      const validTypes = ['local', 'indexeddb', 'mysql'];
      const storageType = validTypes.includes(type) ? type : this.STORAGE_CONFIG.DEFAULT_STORAGE_TYPE;
      
      if (BrowserAPI.storage?.local?.set) {
        await BrowserAPI.storage.local.set({
          [this.STORAGE_CONFIG.STORAGE_TYPE_KEY]: storageType
        });
      }
      
      // 更新数据库管理器的存储类型
      DatabaseManager.setStorageType(storageType);
      // 清除缓存，确保下次获取最新数据
      this.clearCache('存储类型已更改');
      
      return true;
    } catch (error) {
      console.error('设置存储类型失败:', error);
      return false;
    }
  }

  /**
   * 配置MySQL数据库连接
   * @param {Object} config - MySQL连接配置
   * @returns {Promise<boolean>} 配置结果
   */
  static async configureMySQL(config) {
    try {
      // 设置MySQL配置
      DatabaseManager.setMySQLConfig(config);
      
      // 保存配置到本地存储
      if (BrowserAPI.storage?.local?.set) {
        await BrowserAPI.storage.local.set({
          'mysqlConfig': config
        });
      }
      
      return true;
    } catch (error) {
      console.error('配置MySQL数据库失败:', error);
      return false;
    }
  }

  /**
   * 获取MySQL数据库配置
   * @returns {Promise<Object|null>} MySQL连接配置
   */
  static async getMySQLConfig() {
    try {
      if (BrowserAPI.storage?.local?.get) {
        const result = await BrowserAPI.storage.local.get(['mysqlConfig']);
        if (result.mysqlConfig) {
          return result.mysqlConfig;
        }
      }
      return DatabaseManager.getMySQLConfig();
    } catch (error) {
      console.error('获取MySQL配置失败:', error);
      return null;
    }
  }

  /**
   * 获取所有数据
   * @returns {Promise<Object>} 所有数据
   */
  static async getAllData() {
    try {
      // 检查缓存是否有效
      const now = Date.now();
      const isCacheValid = this._cache.data && 
                         (now - this._cache.lastUpdated < this.CACHE_CONFIG.EXPIRY);
      
      if (isCacheValid) {
        console.debug('使用缓存数据');
        return this._cache.data;
      }
      
      console.debug('缓存已过期或无效，从存储获取数据');
      
      // 获取当前存储类型
      const storageType = await this.getStorageType();
      
      let navData;
      if (storageType === 'mysql') {
        // 从MySQL数据库获取数据
        console.debug('从MySQL数据库获取数据');
        navData = await this._getAllDataFromDatabase();
      } else {
        // 从本地存储获取数据
        console.debug('从本地存储获取数据');
        navData = await this._getAllDataFromLocalStorage();
      }
      
      // 更新缓存
      const newHash = this._generateDataHash(navData);
      if (newHash !== this._cache.hash) {
        console.debug('数据发生变化，更新缓存');
        this._cache = {
          data: navData,
          lastUpdated: now,
          hash: newHash
        };
      } else {
        console.debug('数据未发生变化，仅更新缓存时间');
        this._cache.lastUpdated = now;
      }
      
      return navData;
    } catch (error) {
      console.error('获取数据失败:', error);
      
      // 如果缓存存在，返回缓存数据；否则返回默认数据
      if (this._cache.data) {
        console.debug('获取数据失败，返回缓存数据');
        return this._cache.data;
      }
      
      console.debug('获取数据失败，返回默认数据');
      return defaultData;
    }
  }

  /**
   * 从本地存储获取所有数据
   * @returns {Promise<Object>} 所有数据
   */
  static async _getAllDataFromLocalStorage() {
    try {
      // 统一处理Promise和回调模式
      let dataResult;
      if (BrowserAPI.storage?.local?.get) {
        // 获取所有相关存储项
        const keys = [this.CACHE_CONFIG.KEY, this.STORAGE_CONFIG.HASH_KEY];
        const result = BrowserAPI.storage.local.get(keys);
        
        // 检查是否是Promise
        if (result && typeof result.then === 'function') {
          dataResult = await result;
        } else {
          // 回调模式
          dataResult = await new Promise((resolve) => {
            BrowserAPI.storage.local.get(keys, (data) => {
              resolve(data);
            });
          });
        }
      }
      
      let rawData = dataResult?.[this.CACHE_CONFIG.KEY];
      
      let navData;
      if (!rawData) {
        console.debug('本地存储中无数据，使用默认数据');
        navData = defaultData;
      } else {
        try {
          // 检查数据是否需要解压缩（字符串形式的压缩数据或直接的对象）
          if (typeof rawData === 'string') {
            // 解压缩数据（如果启用）
            const decompressedData = this.STORAGE_CONFIG.USE_COMPRESSION ? this.decompressData(rawData) : rawData;
            navData = JSON.parse(decompressedData);
            console.debug('成功解析压缩数据');
          } else {
            // 直接使用对象数据（兼容旧版本）
            navData = rawData;
            console.debug('使用直接对象数据（兼容旧版本）');
          }
        } catch (parseError) {
          console.error('解析本地存储数据失败，使用默认数据:', parseError);
          navData = defaultData;
        }
      }
      
      return navData;
    } catch (error) {
      console.error('从本地存储获取数据失败:', error);
      return defaultData;
    }
  }

  /**
   * 从数据库获取所有数据
   * @returns {Promise<Object>} 所有数据
   */
  static async _getAllDataFromDatabase() {
    try {
      // 目前数据库只存储网站数据，所以需要从数据库获取网站数据并构建完整数据结构
      // 这里需要根据实际需求调整，可能需要更复杂的数据结构映射
      const websites = await DatabaseManager.getWebsites();
      
      // 如果数据库中没有数据，返回默认数据
      if (!websites || websites.length === 0) {
        console.debug('数据库中无数据，使用默认数据');
        return defaultData;
      }
      
      // 这里需要根据实际需求，将数据库中的网站数据映射到完整的数据结构
      // 暂时返回默认数据结构，后续可以扩展为从数据库构建完整结构
      return defaultData;
    } catch (error) {
      console.error('从数据库获取数据失败:', error);
      return defaultData;
    }
  }

  /**
   * 保存所有数据
   * @param {Object} data - 要保存的数据
   * @returns {Promise<Object>} 保存结果，包含success和message字段
   */
  static async saveAllData(data) {
    try {
      console.debug('开始保存数据');
      
      // 验证数据结构
      const validation = DataValidator.validateDataStructure(data);
      if (!validation.valid) {
        console.error('数据验证失败:', validation.message);
        return { 
          success: false, 
          message: `数据验证失败: ${validation.message}` 
        };
      }

      // 获取当前存储类型
      const storageType = await this.getStorageType();
      
      let result;
      if (storageType === 'mysql') {
        // 保存到MySQL数据库
        console.debug('保存数据到MySQL数据库');
        result = await this._saveAllDataToDatabase(data);
      } else {
        // 保存到本地存储
        console.debug('保存数据到本地存储');
        result = await this._saveAllDataToLocalStorage(data);
      }
      
      return result;
    } catch (error) {
      console.error('保存数据失败:', error);
      return { 
        success: false, 
        message: `保存数据失败: ${error.message}` 
      };
    }
  }

  /**
   * 保存所有数据到本地存储
   * @param {Object} data - 要保存的数据
   * @returns {Promise<Object>} 保存结果，包含success和message字段
   */
  static async _saveAllDataToLocalStorage(data) {
    try {
      // 检查存储API是否可用
      if (!BrowserAPI.storage?.local?.set) {
        console.error('存储API不可用');
        return { 
          success: false, 
          message: '存储API不可用' 
        };
      }

      // 生成数据哈希值
      const dataHash = this._generateDataHash(data);
      
      // 检查数据是否有变化
      const currentHash = await this._getStoredHash();
      if (dataHash === currentHash) {
        console.debug('数据未变化，跳过保存');
        return { success: true, message: '数据未变化，跳过保存' };
      }

      // 序列化数据
      const jsonStr = JSON.stringify(data);
      
      // 压缩数据（如果启用）
      const finalData = this.STORAGE_CONFIG.USE_COMPRESSION ? this.compressData(jsonStr) : jsonStr;
      
      // 准备存储数据
      const saveData = {};
      saveData[this.CACHE_CONFIG.KEY] = finalData;
      saveData[this.STORAGE_CONFIG.HASH_KEY] = dataHash;
      saveData[this.STORAGE_CONFIG.LAST_UPDATE_KEY] = Date.now();
      
      console.debug(`数据保存详情: 原始大小 ${jsonStr.length} 字节, 压缩后大小 ${finalData.length} 字节, 压缩率 ${Math.round((1 - finalData.length / jsonStr.length) * 100)}%`);

      // 统一处理Promise和回调模式
      if (BrowserAPI.storage.local.set.length === 1) {
        // Promise模式
        await BrowserAPI.storage.local.set(saveData);
      } else {
        // 回调模式
        await new Promise((resolve, reject) => {
          BrowserAPI.storage.local.set(saveData, () => {
            if (BrowserAPI.runtime?.lastError) {
              reject(new Error(BrowserAPI.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        });
      }
      
      // 清除缓存，确保下次获取最新数据
      this.clearCache('数据已更新');
      
      console.debug('数据保存到本地存储成功');
      return { success: true, message: '数据保存成功' };
    } catch (error) {
      console.error('保存数据到本地存储失败:', error);
      return { 
        success: false, 
        message: `保存数据失败: ${error.message}` 
      };
    }
  }

  /**
   * 保存所有数据到数据库
   * @param {Object} data - 要保存的数据
   * @returns {Promise<Object>} 保存结果，包含success和message字段
   */
  static async _saveAllDataToDatabase(data) {
    try {
      // 提取所有网站数据
      const allWebsites = [];
      
      // 遍历主分类、一级分类、二级分类，收集所有网站
      data.mainCategories.forEach(mainCat => {
        mainCat.categories.forEach(cat => {
          cat.subCategories.forEach(subCat => {
            subCat.websites.forEach(website => {
              // 添加分类信息到网站数据中，方便数据库查询
              const websiteWithCategory = {
                ...website,
                mainCategoryId: mainCat.id,
                categoryId: cat.id,
                subCategoryId: subCat.id
              };
              allWebsites.push(websiteWithCategory);
            });
          });
        });
      });
      
      // 保存网站数据到数据库
      await DatabaseManager.saveWebsites(allWebsites);
      
      // 清除缓存，确保下次获取最新数据
      this.clearCache('数据已更新到数据库');
      
      console.debug('数据保存到数据库成功');
      return { success: true, message: '数据保存到数据库成功' };
    } catch (error) {
      console.error('保存数据到数据库失败:', error);
      return { 
        success: false, 
        message: `保存数据到数据库失败: ${error.message}` 
      };
    }
  }
  
  /**
   * 获取存储的哈希值
   * @returns {Promise<string>} 存储的哈希值
   */
  static async _getStoredHash() {
    try {
      if (!BrowserAPI.storage?.local?.get) {
        return null;
      }
      
      const result = BrowserAPI.storage.local.get([this.STORAGE_CONFIG.HASH_KEY]);
      let storedHash = null;
      
      if (result && typeof result.then === 'function') {
        const data = await result;
        storedHash = data[this.STORAGE_CONFIG.HASH_KEY];
      } else {
        storedHash = await new Promise((resolve) => {
          BrowserAPI.storage.local.get([this.STORAGE_CONFIG.HASH_KEY], (data) => {
            resolve(data[this.STORAGE_CONFIG.HASH_KEY]);
          });
        });
      }
      
      return storedHash;
    } catch (error) {
      console.error('获取存储哈希值失败:', error);
      return null;
    }
  }

  /**
   * 重置数据为默认值
   * @returns {Promise<boolean>} 重置结果
   */
  static async resetToDefault() {
    try {
      console.debug('开始重置数据为默认值');
      
      // 直接使用saveAllData方法，复用其逻辑
      const result = await this.saveAllData(defaultData);
      
      console.debug('数据重置成功');
      return result.success;
    } catch (error) {
      console.error('重置数据失败:', error);
      return false;
    }
  }

  /**
   * 导入数据
   * @param {string|Object} jsonData - 要导入的数据
   * @returns {Promise<Object>} 导入结果
   */
  static async importData(jsonData) {
    try {
      console.debug('开始导入数据');
      
      let data;
      if (typeof jsonData === 'string') {
        console.debug('解析JSON字符串');
        data = JSON.parse(jsonData);
      } else {
        console.debug('使用已有数据对象');
        data = jsonData;
      }

      // 验证数据结构
      console.debug('验证数据结构');
      const validation = DataValidator.validateDataStructure(data);
      if (!validation.valid) {
        console.error('数据结构验证失败:', validation.message);
        return { 
          valid: false, 
          message: `数据结构验证失败: ${validation.message}` 
        };
      }

      // 保存数据
      console.debug('保存导入的数据');
      const result = await this.saveAllData(data);
      
      // 如果导入的数据包含存储配置，应用存储配置
      if (data.storageConfig) {
        console.debug('导入存储配置');
        
        // 设置存储类型
        if (data.storageConfig.storageType) {
          await this.setStorageType(data.storageConfig.storageType);
        }
        
        // 设置MySQL配置
        if (data.storageConfig.mysqlConfig) {
          await this.configureMySQL(data.storageConfig.mysqlConfig);
        }
      }
      
      if (result.success) {
        console.debug('数据导入成功');
        return { 
          valid: true, 
          message: '数据导入成功' 
        };
      } else {
        console.error('数据保存失败:', result.message);
        return { 
          valid: false, 
          message: `数据保存失败: ${result.message}` 
        };
      }
    } catch (error) {
      console.error('导入数据失败:', error);
      let errorMessage = '导入失败';
      
      if (error instanceof SyntaxError) {
        errorMessage = 'JSON格式错误，请检查文件内容';
      } else if (error.message) {
        errorMessage = `导入失败: ${error.message}`;
      }
      
      return { 
        valid: false, 
        message: errorMessage 
      };
    }
  }

  /**
   * 导出数据
   * @param {string} exportType - 导出类型: 'json' 或 'database' 或 'sql'
   * @param {string} sourceType - 源存储类型: 'local', 'indexeddb' 或 'mysql'
   * @returns {Promise<string|null>} 导出的JSON字符串或数据库SQL
   */
  static async exportData(exportType = 'json', sourceType = null) {
    try {
      console.debug('开始导出数据，导出类型:', exportType, '源存储类型:', sourceType);
      
      // 直接获取数据，不切换存储类型
      // 这样可以确保始终使用当前配置的数据，避免切换存储类型导致的问题
      const data = await this.getAllData();
      
      // 获取存储配置
      const storageType = await this.getStorageType();
      const mysqlConfig = await this.getMySQLConfig();
      
      let result;
      // 确保导出类型匹配，支持多种可能的输入值
      const isDatabaseExport = exportType === 'database' || exportType === 'sql';
      if (isDatabaseExport) {
        // 导出为数据库SQL
        console.debug('开始生成SQL导出数据');
        result = this._exportToSQL(data);
        console.debug('SQL数据生成成功，长度:', result.length, '字符');
        console.debug('SQL数据示例:', result.substring(0, 200) + '...');
      } else {
        // 导出为JSON
        console.debug('开始生成JSON导出数据');
        const exportData = {
          ...data,
          storageConfig: {
            storageType: storageType,
            mysqlConfig: mysqlConfig
          }
        };
        
        // 导出时始终使用格式化的JSON，不压缩，方便用户查看和编辑
        result = JSON.stringify(exportData, null, 2);
        console.debug('JSON数据生成成功，长度:', result.length, '字符');
      }
      
      console.debug('数据导出成功，导出类型:', exportType, '实际生成:', isDatabaseExport ? 'SQL' : 'JSON');
      return result;
    } catch (error) {
      console.error('导出数据失败:', error);
      return null;
    }
  }
  
  /**
   * 导出为SQL语句
   * @param {Object} data - 要导出的数据
   * @returns {string} SQL语句
   */
  static _exportToSQL(data) {
    console.debug('开始生成SQL语句，输入数据结构:', JSON.stringify(Object.keys(data), null, 2));
    
    let sql = '-- CloudHut 导航数据导出\n';
    sql += `-- 导出时间: ${new Date().toISOString()}\n\n`;
    
    // 确保data和data.mainCategories存在
    if (!data || !Array.isArray(data.mainCategories)) {
      console.error('导出为SQL失败: 数据结构无效，缺少mainCategories数组');
      sql += '-- 错误: 数据结构无效，缺少mainCategories数组\n';
      return sql;
    }
    
    console.debug('主分类数量:', data.mainCategories.length);
    
    // 导出主分类
    sql += '-- 主分类数据\n';
    data.mainCategories.forEach((mainCat, mainCatIndex) => {
      console.debug(`处理主分类 ${mainCatIndex + 1}: ${mainCat.name}`);
      
      sql += `INSERT INTO main_categories (id, name, icon, orderIndex) VALUES (`;
      sql += `'${mainCat.id}', '${mainCat.name.replace(/'/g, "''")}', '${mainCat.icon}', ${mainCat.orderIndex || 0});\n`;
      
      // 导出一级分类
      if (Array.isArray(mainCat.categories)) {
        console.debug(`  一级分类数量: ${mainCat.categories.length}`);
        
        mainCat.categories.forEach((cat, catIndex) => {
          console.debug(`  处理一级分类 ${catIndex + 1}: ${cat.name}`);
          
          sql += `INSERT INTO categories (id, name, mainCategoryId, orderIndex) VALUES (`;
          sql += `'${cat.id}', '${cat.name.replace(/'/g, "''")}', '${mainCat.id}', ${cat.orderIndex || 0});\n`;
          
          // 导出二级分类
          if (Array.isArray(cat.subCategories)) {
            console.debug(`    二级分类数量: ${cat.subCategories.length}`);
            
            cat.subCategories.forEach((subCat, subCatIndex) => {
              console.debug(`    处理二级分类 ${subCatIndex + 1}: ${subCat.name}`);
              
              sql += `INSERT INTO sub_categories (id, name, categoryId, orderIndex) VALUES (`;
              sql += `'${subCat.id}', '${subCat.name.replace(/'/g, "''")}', '${cat.id}', ${subCat.orderIndex || 0});\n`;
              
              // 导出网站
              if (Array.isArray(subCat.websites)) {
                console.debug(`      网站数量: ${subCat.websites.length}`);
                
                subCat.websites.forEach((website, websiteIndex) => {
                  console.debug(`      处理网站 ${websiteIndex + 1}: ${website.name}`);
                  
                  sql += `INSERT INTO websites (id, name, url, \`desc\`, tags, detail, mainCategoryId, categoryId, subCategoryId) VALUES (`;
                  sql += `'${website.id}', '${website.name.replace(/'/g, "''")}', '${website.url}', `;
                  sql += `'${(website.desc || '').replace(/'/g, "''")}', `;
                  sql += `'${JSON.stringify(website.tags || []).replace(/'/g, "''")}', `;
                  sql += `'${(website.detail || '').replace(/'/g, "''")}', `;
                  sql += `'${mainCat.id}', '${cat.id}', '${subCat.id}');\n`;
                });
              } else {
                console.debug(`      没有网站数据`);
              }
            });
          } else {
            console.debug(`    没有二级分类数据`);
          }
        });
      } else {
        console.debug(`  没有一级分类数据`);
      }
    });
    
    console.debug('SQL生成完成，总长度:', sql.length, '字符');
    return sql;
  }
  
  /**
   * 同步数据从一种存储类型到另一种存储类型
   * @param {string} sourceType - 源存储类型: 'local', 'indexeddb' 或 'mysql'
   * @param {string} targetType - 目标存储类型: 'local', 'indexeddb' 或 'mysql'
   * @returns {Promise<Object>} 同步结果
   */
  static async syncData(sourceType, targetType) {
    try {
      console.debug('开始同步数据，从', sourceType, '到', targetType);
      
      // 保存原始存储类型
      const originalType = await this.getStorageType();
      
      // 从源存储类型获取数据
      await this.setStorageType(sourceType);
      const sourceData = await this.getAllData();
      
      // 切换到目标存储类型并保存数据
      await this.setStorageType(targetType);
      const result = await this.saveAllData(sourceData);
      
      // 恢复原始存储类型
      await this.setStorageType(originalType);
      
      console.debug('数据同步成功，从', sourceType, '到', targetType);
      return {
        success: result.success,
        message: `数据从 ${sourceType} 同步到 ${targetType} 成功`
      };
    } catch (error) {
      console.error('同步数据失败:', error);
      return {
        success: false,
        message: `数据同步失败: ${error.message}`
      };
    }
  }
  
  /**
   * 导出压缩数据（用于WebDAV备份）
   * @returns {Promise<string|null>} 压缩后的JSON字符串
   */
  static async exportCompressedData() {
    try {
      console.debug('开始导出压缩数据');
      
      const data = await this.getAllData();
      
      // 获取存储类型
      const storageType = await this.getStorageType();
      
      // 获取MySQL配置
      const mysqlConfig = await this.getMySQLConfig();
      
      // 确保备份数据不包含敏感信息
      const backupData = {
        ...data,
        config: {
          ...data.config,
          webdavConfig: {
            url: '',
            username: '',
            password: '',
            autoBackupEnabled: false,
            autoBackupInterval: 'daily',
            backupTime: 0
          }
        },
        storageConfig: {
          storageType: storageType,
          mysqlConfig: {
            ...mysqlConfig,
            password: '' // 移除密码等敏感信息
          }
        }
      };
      
      console.debug('获取数据成功，开始序列化和压缩');
      
      // 序列化并压缩数据
      const jsonStr = JSON.stringify(backupData);
      const compressedData = this.compressData(jsonStr);
      
      console.debug('数据压缩成功，压缩率:', Math.round((1 - compressedData.length / jsonStr.length) * 100) + '%');
      
      return compressedData;
    } catch (error) {
      console.error('导出压缩数据失败:', error);
      return null;
    }
  }

  /**
   * 过滤文件名中的特殊字符
   * @param {string} filename - 原始文件名
   * @returns {string} 过滤后的安全文件名
   */
  static sanitizeFilename(filename) {
    // 移除或替换文件名中的特殊字符
    const sanitized = filename
      // 移除禁止的特殊字符
      .replace(/[<>"'/\\|?*:;]/g, '_')
      // 移除多余的空格
      .replace(/\s+/g, '_')
      // 确保文件名长度不超过255个字符
      .substring(0, 255);
    
    // 确保文件名以.json结尾
    if (!sanitized.endsWith('.json')) {
      return `${sanitized}.json`;
    }
    
    return sanitized;
  }

  /**
   * 下载JSON文件
   * @param {string} data - 要下载的数据
   * @param {string} filename - 文件名
   */
  static downloadJSON(data, filename = 'navData.json') {
    try {
      console.debug('开始下载JSON文件');
      
      // 过滤文件名中的特殊字符
      const safeFilename = this.sanitizeFilename(filename);
      console.debug(`使用安全文件名: ${safeFilename}`);
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = safeFilename;
      
      // 使用requestAnimationFrame确保DOM已准备好
      requestAnimationFrame(() => {
        try {
          // 不需要将元素添加到DOM中也能触发下载
          a.click();
          console.debug('文件下载已触发');
          
          // 立即释放URL对象，避免内存泄漏
          setTimeout(() => {
            URL.revokeObjectURL(url);
            console.debug('已释放URL对象');
          }, 100);
        } catch (clickError) {
          console.error('触发下载失败:', clickError);
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('下载文件失败:', error);
    }
  }

  /**
   * 从文件对象导入数据（Promise版本）
   * @param {File} file - 文件对象
   * @returns {Promise<Object>} 导入结果
   */
  static async importFromFile(file) {
    try {
      console.debug('开始从文件导入数据');
      
      if (!file) {
        console.debug('未选择文件');
        return { valid: false, message: '未选择文件' };
      }

      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        console.debug('文件格式错误，必须是JSON文件');
        return { valid: false, message: '请选择JSON格式文件' };
      }

      console.debug(`开始读取文件: ${file.name}`);
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsText(file);
      });
      
      console.debug('文件读取成功，开始导入数据');
      const result = await this.importData(fileContent);
      console.debug('数据导入成功');
      
      return result;
    } catch (error) {
      console.error('从文件导入数据失败:', error);
      return { 
        valid: false, 
        message: `文件读取失败: ${error.message}` 
      };
    }
  }
  
  /**
   * 从文件选择器导入数据（回调版本）
   * @param {HTMLInputElement} inputElement - 文件输入元素
   * @param {Function} callback - 回调函数
   */
  static importFromFileWithCallback(inputElement, callback) {
    const file = inputElement.files[0];
    
    // 使用Promise版本的importFromFile，然后调用回调
    this.importFromFile(file)
      .then(result => {
        callback(result);
      })
      .catch(error => {
        console.error('从文件选择器导入数据失败:', error);
        callback({ 
          valid: false, 
          message: `文件导入失败: ${error.message}` 
        });
      });
  }

  // 主类导航操作
    /**
     * 创建主类导航
     * @param {string} name - 主类名称
     * @param {string} icon - 图标类名
     * @returns {Promise<Object>} 创建结果
     */
    static async createMainCategory(name, icon = 'fas fa-compass') {
        try {
            const data = await this.getAllData();
            
            // 创建默认的二级分类，包含百度网站
            const defaultSubCategory = {
                id: generateId('sub'),
                name: '未命名分类',
                websites: [
                    {
                        id: generateId('web'),
                        name: '百度',
                        url: 'https://www.baidu.com',
                        desc: '百度搜索',
                        tags: ['搜索', '百度']
                    }
                ]
            };
            
            // 创建默认的一级分类，包含默认二级分类
            const defaultCategory = {
                id: generateId('cat'),
                name: '未命名分类',
                subCategories: [defaultSubCategory]
            };
            
            // 创建新的主类导航
            const newMainCategory = {
                id: generateId('main'),
                name,
                icon,
                categories: [defaultCategory]
            };

            data.mainCategories.push(newMainCategory);
            const saved = await this.saveAllData(data);
            
            if (saved.success) {
                return { success: true, data: newMainCategory };
            } else {
                return saved; // 返回具体的错误信息
            }
        } catch (error) {
            console.error('创建主类导航失败:', error);
            return { success: false, message: error.message };
        }
    }

  // 一级分类操作
  /**
   * 创建一级分类
   * @param {string} mainCategoryId - 主类ID
   * @param {string} name - 分类名称
   * @returns {Promise<Object>} 创建结果
   */
  static async createCategory(mainCategoryId, name, icon = 'fas fa-folder') {
    try {
      const data = await this.getAllData();
      const mainCategory = data.mainCategories.find(mc => mc.id === mainCategoryId);
      if (!mainCategory) {
        return { success: false, message: '主类导航不存在' };
      }

      // 创建默认的二级分类，包含百度网站
      const defaultSubCategory = {
        id: generateId('sub'),
        name: '未命名分类',
        icon: 'fas fa-folder',
        websites: [
          {
            id: generateId('web'),
            name: '百度',
            url: 'https://www.baidu.com',
            desc: '百度搜索',
            tags: ['搜索', '百度']
          }
        ]
      };

      const newCategory = {
        id: generateId('cat'),
        name,
        icon,
        subCategories: [defaultSubCategory]
      };

      mainCategory.categories.push(newCategory);
      const saved = await this.saveAllData(data);
      
      if (saved.success) {
        return { success: true, data: newCategory };
      } else {
        return saved; // 返回具体的错误信息
      }
    } catch (error) {
      console.error('创建一级分类失败:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 删除一级分类
   * @param {string} mainCategoryId - 主类ID
   * @param {string} categoryId - 分类ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteCategory(mainCategoryId, categoryId) {
    try {
      const data = await this.getAllData();
      const mainCategory = data.mainCategories.find(mc => mc.id === mainCategoryId);
      if (!mainCategory) return false;

      const index = mainCategory.categories.findIndex(cat => cat.id === categoryId);
      if (index === -1) return false;

      mainCategory.categories.splice(index, 1);
      const result = await this.saveAllData(data);
      return result.success;
    } catch (error) {
      console.error('删除一级分类失败:', error);
      return false;
    }
  }

  // 二级分类操作
  /**
   * 创建二级分类
   * @param {string} mainCategoryId - 主类ID
   * @param {string} categoryId - 一级分类ID
   * @param {string} name - 二级分类名称
   * @returns {Promise<Object>} 创建结果
   */
  static async createSubcategory(mainCategoryId, categoryId, name, icon = 'fas fa-folder') {
    try {
      const data = await this.getAllData();
      const mainCategory = data.mainCategories.find(mc => mc.id === mainCategoryId);
      if (!mainCategory) {
        return { success: false, message: '主类导航不存在' };
      }

      const category = mainCategory.categories.find(cat => cat.id === categoryId);
      if (!category) {
        return { success: false, message: '一级分类不存在' };
      }

      const newSubcategory = {
        id: generateId('sub'),
        name,
        icon,
        websites: []
      };

      category.subCategories.push(newSubcategory);
      const saved = await this.saveAllData(data);
      
      if (saved.success) {
        return { success: true, data: newSubcategory };
      } else {
        return saved; // 返回具体的错误信息
      }
    } catch (error) {
      console.error('创建二级分类失败:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 删除二级分类
   * @param {string} mainCategoryId - 主类ID
   * @param {string} categoryId - 一级分类ID
   * @param {string} subcategoryId - 二级分类ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteSubcategory(mainCategoryId, categoryId, subcategoryId) {
    try {
      const data = await this.getAllData();
      const mainCategory = data.mainCategories.find(mc => mc.id === mainCategoryId);
      if (!mainCategory) return false;

      const category = mainCategory.categories.find(cat => cat.id === categoryId);
      if (!category) return false;

      const index = category.subCategories.findIndex(sc => sc.id === subcategoryId);
      if (index === -1) return false;

      category.subCategories.splice(index, 1);
      const result = await this.saveAllData(data);
      return result.success;
    } catch (error) {
      console.error('删除二级分类失败:', error);
      return false;
    }
  }

  // 网站操作
  /**
   * 清理网站描述，去除或替换特殊符号
   * @param {string} description - 原始描述
   * @returns {string} 清理后的描述
   */
  static cleanWebsiteDescription(description) {
    if (!description) {
      return '';
    }

    return description
      // 移除或替换禁止的特殊字符（保留|和?）
      .replace(/[<>'"'\/\\\*:;]/g, '')
      // 移除HTML标签（如果有）
      .replace(/<[^>]*>/g, '')
      // 移除多余的空格
      .replace(/\s+/g, ' ')
      // 移除多余的标点符号
      .replace(/([，。！？；：])+/g, '$1')
      // 去除首尾空格
      .trim();
  }

  /**
   * 获取网站描述
   * @param {string} url - 网站URL
   * @returns {Promise<string>} 网站描述
   */
  static async getWebsiteDescription(url) {
    try {
      // 发送请求到网站
      const response = await fetch(url, {
        method: 'GET',
        timeout: 5000,
        headers: {
          'Accept': 'text/html'
        }
      });
      
      if (!response.ok) {
        return '';
      }
      
      const html = await response.text();
      
      // 解析HTML，提取描述
      // 尝试从meta标签中提取描述
      const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                               html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      
      if (descriptionMatch && descriptionMatch[1]) {
        let description = descriptionMatch[1].trim();
        // 清理描述
        description = this.cleanWebsiteDescription(description);
        return description.substring(0, 150); // 限制最大长度
      }
      
      // 如果没有meta描述，尝试从h1标签中提取
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match && h1Match[1]) {
        let h1Text = h1Match[1].replace(/<[^>]*>/g, '').trim();
        // 清理描述
        h1Text = this.cleanWebsiteDescription(h1Text);
        return h1Text.substring(0, 150); // 限制最大长度
      }
      
      // 如果没有h1，尝试从title标签中提取
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        let titleText = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        // 清理描述
        titleText = this.cleanWebsiteDescription(titleText);
        return titleText.substring(0, 150); // 限制最大长度
      }
      
      return '';
    } catch (error) {
      console.error('获取网站描述失败:', error);
      return '';
    }
  }

  /**
   * 创建网站
   * @param {string} mainCategoryId - 主类ID
   * @param {string} categoryId - 一级分类ID
   * @param {string} subcategoryId - 二级分类ID
   * @param {string} name - 网站名称
   * @param {string} url - 网站URL
   * @param {string} desc - 网站描述
   * @param {Array} tags - 网站标签
   * @returns {Promise<Object>} 创建结果
   */
  static async createWebsite(mainCategoryId, categoryId, subcategoryId, name, url, desc = '', tags = []) {
    try {
      const data = await this.getAllData();
      const mainCategory = data.mainCategories.find(mc => mc.id === mainCategoryId);
      if (!mainCategory) {
        return { success: false, message: '主类导航不存在' };
      }

      const category = mainCategory.categories.find(cat => cat.id === categoryId);
      if (!category) {
        return { success: false, message: '一级分类不存在' };
      }

      const subcategory = category.subCategories.find(sc => sc.id === subcategoryId);
      if (!subcategory) {
        return { success: false, message: '二级分类不存在' };
      }

      let websiteName, websiteUrl, websiteDesc, websiteTags;

    if (typeof name === 'object') {
      // 如果传入的是对象，则直接使用
      const websiteData = name;
      websiteName = websiteData.name;
      websiteUrl = websiteData.url;
      websiteDesc = websiteData.desc || '';
      websiteTags = websiteData.tags || [];
    } else {
      // 否则，使用传入的独立参数
      websiteName = name;
      websiteUrl = url;
      websiteDesc = desc || '';
      websiteTags = tags || [];
    }

    // 如果没有提供描述，尝试自动获取
    if (!websiteDesc) {
      websiteDesc = await this.getWebsiteDescription(websiteUrl);
    } else {
      // 清理用户提供的描述
      websiteDesc = this.cleanWebsiteDescription(websiteDesc);
    }

    // 确保最终描述经过清理
    websiteDesc = this.cleanWebsiteDescription(websiteDesc);

      const newWebsite = {
        id: generateId('web'),
        name: websiteName,
        url: websiteUrl,
        desc: websiteDesc,
        tags: websiteTags
      };

      subcategory.websites.push(newWebsite);
      const saved = await this.saveAllData(data);
      
      if (saved.success) {
        return { success: true, data: newWebsite };
      } else {
        return saved; // 返回具体的错误信息
      }
    } catch (error) {
      console.error('创建网站失败:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 更新网站
   * @param {string} websiteId - 网站ID
   * @param {Object} updates - 更新的字段
   * @returns {Promise<Object>} 更新结果
   */
  static async updateWebsite(websiteId, updates) {
    try {
      const data = await this.getAllData();
      let websiteFound = false;

      // 遍历查找网站
      for (const mainCat of data.mainCategories) {
        for (const cat of mainCat.categories) {
          for (const subCat of cat.subCategories) {
            const website = subCat.websites.find(w => w.id === websiteId);
            if (website) {
              // 更新网站字段
              Object.assign(website, updates);
              websiteFound = true;
              break;
            }
          }
          if (websiteFound) break;
        }
        if (websiteFound) break;
      }

      if (!websiteFound) {
        return { success: false, message: '未找到该网站' };
      }

      const saved = await this.saveAllData(data);
      if (saved.success) {
        return { success: true, message: '网站更新成功' };
      } else {
        return { success: false, message: saved.message }; // 返回具体的错误信息
      }
    } catch (error) {
      console.error('更新网站失败:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 删除网站
   * @param {string} websiteId - 网站ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteWebsite(websiteId) {
    try {
      const data = await this.getAllData();
      let websiteFound = false;

      // 遍历查找网站
      for (const mainCat of data.mainCategories) {
        for (const cat of mainCat.categories) {
          for (const subCat of cat.subCategories) {
            const index = subCat.websites.findIndex(w => w.id === websiteId);
            if (index !== -1) {
              subCat.websites.splice(index, 1);
              websiteFound = true;
              break;
            }
          }
          if (websiteFound) break;
        }
        if (websiteFound) break;
      }

      if (!websiteFound) {
        return { success: false, message: '未找到该网站' };
      }

      const saved = await this.saveAllData(data);
      if (saved.success) {
        return { success: true, message: '网站删除成功' };
      } else {
        return { success: false, message: saved.message }; // 返回具体的错误信息
      }
    } catch (error) {
      console.error('删除网站失败:', error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * 更新分类顺序
   * @param {string} type - 分类类型 ('category' 或 'subcategory')
   * @param {string} draggedId - 被拖拽分类的ID
   * @param {string} dropId - 放置目标分类的ID
   * @param {string} mainCategoryId - 当前主分类ID
   * @param {string} categoryId - 当前一级分类ID（仅用于二级分类拖拽）
   * @param {boolean} isRightSide - 是否放在目标项右侧
   * @returns {Promise<Object>} 更新结果
   */
  static async updateCategoryOrder(type, draggedId, dropId, mainCategoryId, categoryId, isRightSide = false) {
    try {
      console.log('DataManager.updateCategoryOrder 被调用:');
      console.log('- 类型:', type);
      console.log('- 拖拽项ID:', draggedId);
      console.log('- 目标项ID:', dropId);
      console.log('- 主分类ID:', mainCategoryId);
      console.log('- 一级分类ID:', categoryId);
      console.log('- 是否右侧:', isRightSide);
      
      const data = await this.getAllData();
      
      // 查找当前主分类
      const currentMainCat = data.mainCategories.find(mc => mc.id === mainCategoryId);
      
      if (!currentMainCat) {
        console.log('未找到主分类:', mainCategoryId);
        return { success: false, message: '未找到主分类' };
      }
      
      console.log('找到主分类:', currentMainCat.name);
      
      if (type === 'category') {
        // 处理一级分类拖拽
        const categories = currentMainCat.categories;
        
        console.log('处理一级分类拖拽:');
        console.log('- 当前分类顺序:', categories.map(cat => ({ id: cat.id, name: cat.name })));
        
        // 找到拖拽项和目标项的索引
        const draggedIndex = categories.findIndex(cat => cat.id === draggedId);
        const dropIndex = categories.findIndex(cat => cat.id === dropId);
        
        console.log('- 拖拽项索引:', draggedIndex, '目标项索引:', dropIndex);
        
        if (draggedIndex === -1 || dropIndex === -1) {
          console.log('未找到分类:', draggedId, dropId);
          return { success: false, message: '分类未找到' };
        }
        
        // 移除拖拽项
        const [draggedItem] = categories.splice(draggedIndex, 1);
        
        console.log('- 移除拖拽项后的顺序:', categories.map(cat => ({ id: cat.id, name: cat.name })));
        
        // 根据isRightSide决定插入位置
        // 如果放在右侧，插入到dropIndex + 1位置
        // 如果放在左侧或相同位置，插入到dropIndex位置
        const insertIndex = isRightSide ? (dropIndex + 1) : dropIndex;
        
        console.log('- 插入位置:', insertIndex);
        
        // 插入到新位置
        categories.splice(insertIndex, 0, draggedItem);
        
        console.log('- 更新后的顺序:', categories.map(cat => ({ id: cat.id, name: cat.name })));
      } else if (type === 'subcategory') {
        // 处理二级分类拖拽
        // 查找当前一级分类
        const currentCategory = currentMainCat.categories.find(cat => cat.id === categoryId);
        
        if (!currentCategory) {
          console.log('未找到一级分类:', categoryId);
          return { success: false, message: '未找到一级分类' };
        }
        
        console.log('找到一级分类:', currentCategory.name);
        
        const subCategories = currentCategory.subCategories;
        
        console.log('处理二级分类拖拽:');
        console.log('- 当前分类顺序:', subCategories.map(subCat => ({ id: subCat.id, name: subCat.name })));
        
        // 找到拖拽项和目标项的索引
        const draggedIndex = subCategories.findIndex(subCat => subCat.id === draggedId);
        const dropIndex = subCategories.findIndex(subCat => subCat.id === dropId);
        
        console.log('- 拖拽项索引:', draggedIndex, '目标项索引:', dropIndex);
        
        if (draggedIndex === -1 || dropIndex === -1) {
          console.log('未找到二级分类:', draggedId, dropId);
          return { success: false, message: '二级分类未找到' };
        }
        
        // 移除拖拽项
        const [draggedItem] = subCategories.splice(draggedIndex, 1);
        
        console.log('- 移除拖拽项后的顺序:', subCategories.map(subCat => ({ id: subCat.id, name: subCat.name })));
        
        // 根据isRightSide决定插入位置
        // 如果放在右侧，插入到dropIndex + 1位置
        // 如果放在左侧或相同位置，插入到dropIndex位置
        const insertIndex = isRightSide ? (dropIndex + 1) : dropIndex;
        
        console.log('- 插入位置:', insertIndex);
        
        // 插入到新位置
        subCategories.splice(insertIndex, 0, draggedItem);
        
        console.log('- 更新后的顺序:', subCategories.map(subCat => ({ id: subCat.id, name: subCat.name })));
      } else {
        console.log('无效的分类类型:', type);
        return { success: false, message: '无效的分类类型' };
      }
      
      // 保存更新后的数据
      console.log('准备保存更新后的数据');
      const saved = await this.saveAllData(data);
      
      console.log('保存结果:', saved);
      
      if (saved.success) {
        return { success: true, message: '分类顺序已更新' };
      } else {
        return { success: false, message: saved.message }; // 返回具体的错误信息
      }
    } catch (error) {
      console.error('更新分类顺序失败:', error);
      return { success: false, message: error.message };
    }
  }

  // WebDAV备份相关方法
  
  /**
   * 检查WebDAV目录是否存在
   * @param {string} url - WebDAV目录URL
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<boolean>} 目录是否存在
   */
  static async checkWebDAVDirectoryExists(url, username, password) {
    try {
      const response = await fetch(url, {
        method: 'PROPFIND',
        headers: {
          'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
          'Depth': '0'
        },
        timeout: 5000
      });
      
      console.log('目录检查结果:', url, '状态:', response.status, response.statusText);
      
      // 有些服务器可能返回207 Multi-Status表示成功，而不是200 OK
      return response.ok || response.status === 207;
    } catch (error) {
      console.log('目录检查失败:', error.message);
      return false;
    }
  }

  /**
   * 创建WebDAV目录
   * @param {string} url - 目录URL
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<boolean>} 目录是否创建成功
   */
  static async createWebDAVDirectory(url, username, password) {
    try {
      const response = await fetch(url, {
        method: 'MKCOL',
        headers: {
          'Authorization': `Basic ${btoa(`${username}:${password}`)}`
        },
        timeout: 5000
      });
      
      console.log('目录创建结果:', url, '状态:', response.status, response.statusText);
      
      // MKCOL方法成功返回201 Created或204 No Content
      return response.status === 201 || response.status === 204;
    } catch (error) {
      console.log('目录创建失败:', error.message);
      return false;
    }
  }

  /**
   * 测试WebDAV连接
   * @param {Object} webdavConfig - WebDAV配置
   * @returns {Promise<Object>} 测试结果
   */
  static async testWebDAVConnection(webdavConfig) {
    try {
      const { url, username, password } = webdavConfig;
      
      if (!url) {
        return { success: false, message: 'WebDAV服务器地址不能为空' };
      }
      
      // 发送OPTIONS请求测试连接
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Basic ${btoa(`${username}:${password}`)}`
        },
        timeout: 5000
      });
      
      if (response.ok) {
        return { success: true, message: 'WebDAV连接测试成功' };
      } else {
        // 根据不同状态码提供更详细的提示
        let errorMessage = `WebDAV连接测试失败: ${response.status} ${response.statusText}`;
        
        if (response.status === 404) {
          errorMessage += '。请检查WebDAV URL是否包含完整路径，例如/dav/或类似路径。';
        } else if (response.status === 401) {
          errorMessage += '。请检查用户名和密码是否正确。';
        } else if (response.status === 403) {
          errorMessage += '。您没有权限访问该服务器。';
        }
        
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('WebDAV连接测试失败:', error);
      
      // 提供更明确的错误信息
      let errorMessage = 'WebDAV连接测试失败';
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage += '。连接超时，请检查服务器地址是否正确或网络连接是否正常。';
      } else if (error.name === 'TypeError') {
        errorMessage += '。无效的URL格式，请检查服务器地址是否正确。';
      } else {
        errorMessage += `。${error.message}`;
      }
      
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * 手动备份数据到WebDAV
   * @param {Object} webdavConfig - WebDAV配置
   * @returns {Promise<Object>} 备份结果
   */
  static async backupToWebDAV(webdavConfig) {
    try {
      // 获取当前数据
      const data = await this.getAllData();
      
      // 确保备份数据不包含敏感信息（WebDAV配置）
      const backupData = {
        ...data,
        config: {
          ...data.config,
          webdavConfig: {
            // 清空敏感信息，只保留非敏感配置
            url: '',
            username: '',
            password: '',
            autoBackupEnabled: false,
            autoBackupInterval: 'daily',
            backupTime: 0
          }
        }
      };
      
      const jsonData = JSON.stringify(backupData, null, 2);
      
      const { url, username, password } = webdavConfig;
      
      if (!url) {
        return { success: false, message: 'WebDAV服务器地址不能为空' };
      }
      
      // 定义备份文件路径
      let backupUrl;
      let directoryUrl;
      
      // 生成WebDAV备份路径策略列表
    const generateBackupStrategies = (baseUrl) => [
        // 策略1: 直接使用用户配置的URL + 文件名
        () => {
            backupUrl = baseUrl.endsWith('/') 
              ? `${baseUrl}cloudhut-backup.json`
              : `${baseUrl}/cloudhut-backup.json`;
            directoryUrl = backupUrl.substring(0, backupUrl.lastIndexOf('/') + 1);
        },
        
        // 策略2: 用户配置的URL + /cloudhut/子目录 + 文件名
        () => {
            const normalizedUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
            backupUrl = `${normalizedUrl}cloudhut/cloudhut-backup.json`;
            directoryUrl = `${normalizedUrl}cloudhut/`;
        },
        
        // 策略3: 针对坚果云的特殊路径
        () => {
            if (baseUrl.includes('jianguoyun.com')) {
                if (baseUrl.endsWith('/dav/')) {
                    backupUrl = `${baseUrl}cloudhut/cloudhut-backup.json`;
                    directoryUrl = `${baseUrl}cloudhut/`;
                } else if (baseUrl.endsWith('/')) {
                    backupUrl = `${baseUrl}dav/cloudhut/cloudhut-backup.json`;
                    directoryUrl = `${baseUrl}dav/cloudhut/`;
                } else {
                    backupUrl = `${baseUrl}/dav/cloudhut/cloudhut-backup.json`;
                    directoryUrl = `${baseUrl}/dav/cloudhut/`;
                }
            } else {
                return false;
            }
        }
    ];
    
    const backupStrategies = generateBackupStrategies(url);
      
      let currentStrategy = 0;
      let lastError = null;
      
      // 尝试不同的备份策略
      while (currentStrategy < backupStrategies.length) {
        // 执行当前策略
        const skip = backupStrategies[currentStrategy]();
        
        if (skip === false) {
          // 跳过当前策略
          currentStrategy++;
          continue;
        }
        
        console.log(`\nWebDAV备份调试信息 (策略 ${currentStrategy + 1}):`);
        console.log('  目录URL:', directoryUrl);
        console.log('  文件URL:', backupUrl);
        console.log('  用户名:', username);
        
        // 首先检查目录是否存在
        const directoryExists = await this.checkWebDAVDirectoryExists(directoryUrl, username, password);
        
        if (!directoryExists) {
          // 尝试创建目录
          console.log('目录不存在，尝试创建目录...');
          const createDirSuccess = await this.createWebDAVDirectory(directoryUrl, username, password);
          
          if (!createDirSuccess) {
            console.log('目录创建失败，尝试直接上传文件...');
          } else {
            console.log('目录创建成功');
          }
        }
        
        // 发送PUT请求上传数据
        console.log('发送PUT请求到:', backupUrl);
        
        try {
          const response = await fetch(backupUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
              'Content-Length': jsonData.length,
              // 添加一些WebDAV兼容性头部
              'Depth': '0',
              'Overwrite': 'T'
            },
            body: jsonData,
            timeout: 10000
          });
          
          console.log('响应状态:', response.status, response.statusText);
          
          if (response.ok) {
            return { success: true, message: '数据备份成功' };
          } else {
            // 获取响应文本以获取更详细的错误信息
            let responseText = '';
            try {
              responseText = await response.text();
              console.log('响应内容:', responseText);
            } catch (e) {
              console.log('无法获取响应内容:', e);
            }
            
            lastError = {
              status: response.status,
              statusText: response.statusText,
              responseText: responseText,
              backupUrl: backupUrl,
              directoryUrl: directoryUrl,
              directoryExists: directoryExists
            };
            
            console.log(`策略 ${currentStrategy + 1} 失败，尝试下一个策略...`);
          }
        } catch (fetchError) {
          lastError = {
            status: 0,
            statusText: fetchError.message,
            responseText: '',
            backupUrl: backupUrl,
            directoryUrl: directoryUrl,
            directoryExists: directoryExists
          };
          
          console.log(`策略 ${currentStrategy + 1} 网络错误，尝试下一个策略...`);
        }
        
        currentStrategy++;
      }
      
      // 所有策略都失败了，返回最详细的错误信息
      if (lastError) {
        let errorMessage = `数据备份失败: ${lastError.status} ${lastError.statusText}`;
        
        // 根据不同状态码提供更具体的建议
        if (lastError.status === 401) {
          errorMessage += '。请检查用户名和密码是否正确。';
        } else if (lastError.status === 403) {
          errorMessage += '。您没有权限在该路径写入文件。';
        } else if (lastError.status === 404) {
          errorMessage += '。服务器找不到请求的资源。';
          
          // 针对坚果云的特殊提示
          if (lastError.backupUrl.includes('jianguoyun.com')) {
            errorMessage += '\n\n坚果云注意事项：';
            errorMessage += '\n  1. 确保WebDAV URL格式正确，例如：https://dav.jianguoyun.com/dav/';
            errorMessage += '\n  2. 确保您已在坚果云控制台启用WebDAV服务';
            errorMessage += '\n  3. 确保您使用的是正确的WebDAV密码（不是登录密码）';
            errorMessage += '\n  4. 尝试在坚果云WebDAV目录下手动创建一个cloudhut子目录';
            errorMessage += '\n  5. 确保您有足够的存储空间';
          } else {
            errorMessage += '\n\n请检查：';
            errorMessage += '\n  1. WebDAV URL是否正确，确保包含完整路径';
            errorMessage += '\n  2. 您是否有写入该路径的权限';
            errorMessage += '\n  3. 目标目录是否存在';
          }
        } else if (lastError.status === 405) {
          errorMessage += '。服务器不支持PUT方法，请检查WebDAV服务配置。';
        } else if (lastError.status === 410) {
          errorMessage += '。请求的资源已不存在。';
          
          if (lastError.backupUrl.includes('jianguoyun.com')) {
            errorMessage += '\n\n坚果云注意事项：';
            errorMessage += '\n  1. 坚果云可能已更改WebDAV服务地址或路径';
            errorMessage += '\n  2. 请检查并更新WebDAV URL配置';
            errorMessage += '\n  3. 尝试重新生成WebDAV密码';
          }
        } else if (lastError.status === 422) {
          errorMessage += '。服务器无法处理请求的实体。请检查数据格式是否正确。';
        } else if (lastError.status === 500) {
          errorMessage += '。服务器内部错误，请稍后重试或检查服务器配置。';
        } else if (lastError.status === 0) {
          errorMessage += `。网络错误：${lastError.statusText}`;
        }
        
        // 添加调试信息
        errorMessage += '\n\n调试信息：';
        errorMessage += `\n  目录URL: ${lastError.directoryUrl}`;
        errorMessage += `\n  文件URL: ${lastError.backupUrl}`;
        errorMessage += `\n  目录是否存在: ${lastError.directoryExists}`;
        
        // 添加响应内容到错误信息
        if (lastError.responseText) {
          errorMessage += `\n服务器响应：${lastError.responseText}`;
        }
        
        return { success: false, message: errorMessage };
      }
      
      return { success: false, message: '所有备份策略都失败了，请检查WebDAV配置' };
    } catch (error) {
      console.error('数据备份失败:', error);
      return { success: false, message: `数据备份失败: ${error.message}` };
    }
  }
  
  /**
   * 从WebDAV恢复数据
   * @param {Object} webdavConfig - WebDAV配置
   * @returns {Promise<Object>} 恢复结果
   */
  static async restoreFromWebDAV(webdavConfig) {
    try {
      const { url, username, password } = webdavConfig;
      
      if (!url) {
        return { success: false, message: 'WebDAV服务器地址不能为空' };
      }
      
      // 定义备份文件路径
      let backupUrl;
      
      // 生成WebDAV恢复路径策略列表
      const generateRestoreStrategies = (baseUrl) => [
        // 策略1: 直接使用用户配置的URL + 文件名
        () => {
          backupUrl = baseUrl.endsWith('/') 
            ? `${baseUrl}cloudhut-backup.json`
            : `${baseUrl}/cloudhut-backup.json`;
        },
        
        // 策略2: 用户配置的URL + /cloudhut/子目录 + 文件名
        () => {
          const normalizedUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
          backupUrl = `${normalizedUrl}cloudhut/cloudhut-backup.json`;
        },
        
        // 策略3: 针对坚果云的特殊路径
        () => {
          if (baseUrl.includes('jianguoyun.com')) {
            if (baseUrl.endsWith('/dav/')) {
              backupUrl = `${baseUrl}cloudhut/cloudhut-backup.json`;
            } else if (baseUrl.endsWith('/')) {
              backupUrl = `${baseUrl}dav/cloudhut/cloudhut-backup.json`;
            } else {
              backupUrl = `${baseUrl}/dav/cloudhut/cloudhut-backup.json`;
            }
          } else {
            return false;
          }
        },
        
        // 策略4: 直接尝试/dav/路径
        () => {
          backupUrl = `${baseUrl.replace(/\/$/, '')}/dav/cloudhut-backup.json`;
        },
        
        // 策略5: 尝试/dav/cloudhut/路径
        () => {
          backupUrl = `${baseUrl.replace(/\/$/, '')}/dav/cloudhut/cloudhut-backup.json`;
        }
      ];
      
      const restoreStrategies = generateRestoreStrategies(url);
      
      let currentStrategy = 0;
      let lastError = null;
      
      // 尝试不同的恢复策略
      while (currentStrategy < restoreStrategies.length) {
        // 执行当前策略
        const skip = restoreStrategies[currentStrategy]();
        
        if (skip === false) {
          // 跳过当前策略
          currentStrategy++;
          continue;
        }
        
        console.log(`\nWebDAV恢复调试信息 (策略 ${currentStrategy + 1}):`);
        console.log('  文件URL:', backupUrl);
        console.log('  用户名:', username);
        
        // 发送GET请求获取数据
        try {
          const response = await fetch(backupUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${btoa(`${username}:${password}`)}`
            },
            timeout: 10000
          });
          
          console.log('响应状态:', response.status, response.statusText);
          
          if (response.ok) {
            const jsonData = await response.text();
            const restoredData = JSON.parse(jsonData);
            
            // 验证数据结构
            const validation = DataValidator.validateDataStructure(restoredData);
            if (!validation.valid) {
              return { success: false, message: `备份数据无效: ${validation.message}` };
            }
            
            // 保留本地的WebDAV配置（敏感信息不被覆盖）
            const currentData = await this.getAllData();
            
            // 合并数据，保留本地的WebDAV配置
            const mergedData = {
              ...restoredData,
              config: {
                ...restoredData.config,
                // 保留本地的WebDAV配置，包括敏感信息
                webdavConfig: currentData.config?.webdavConfig || {
                  url: '',
                  username: '',
                  password: '',
                  autoBackupEnabled: false,
                  autoBackupInterval: 'daily',
                  backupTime: 0
                }
              }
            };
            
            // 保存恢复的数据
            const saved = await this.saveAllData(mergedData);
            if (saved.success) {
              return { success: true, message: '数据恢复成功' };
            } else {
              return { success: false, message: `数据恢复失败: ${saved.message}` };
            }
          } else {
            lastError = {
              status: response.status,
              statusText: response.statusText,
              backupUrl: backupUrl
            };
            
            console.log(`策略 ${currentStrategy + 1} 失败，尝试下一个策略...`);
          }
        } catch (fetchError) {
          lastError = {
            status: 0,
            statusText: fetchError.message,
            backupUrl: backupUrl
          };
          
          console.log(`策略 ${currentStrategy + 1} 网络错误，尝试下一个策略...`);
        }
        
        currentStrategy++;
      }
      
      // 所有策略都失败了，返回最详细的错误信息
      if (lastError) {
        let errorMessage = `数据恢复失败: ${lastError.status} ${lastError.statusText}`;
        
        // 根据不同状态码提供更具体的建议
        if (lastError.status === 401) {
          errorMessage += '。请检查用户名和密码是否正确。';
        } else if (lastError.status === 403) {
          errorMessage += '。您没有权限访问该文件。';
        } else if (lastError.status === 404) {
          errorMessage += '。备份文件不存在。';
          
          // 针对坚果云的特殊提示
          if (lastError.backupUrl.includes('jianguoyun.com')) {
            errorMessage += '\n\n坚果云注意事项：';
            errorMessage += '\n  1. 确保备份文件已成功上传到坚果云';
            errorMessage += '\n  2. 确保备份文件路径与恢复路径一致';
            errorMessage += '\n  3. 尝试手动检查坚果云WebDAV目录下是否存在cloudhut-backup.json文件';
          } else {
            errorMessage += '\n\n请检查：';
            errorMessage += '\n  1. 备份文件是否已成功上传';
            errorMessage += '\n  2. WebDAV URL是否正确';
            errorMessage += '\n  3. 备份文件是否存在于预期路径';
          }
        } else if (lastError.status === 405) {
          errorMessage += '。服务器不支持GET方法，请检查WebDAV服务配置。';
        } else if (lastError.status === 0) {
          errorMessage += `。网络错误：${lastError.statusText}`;
        }
        
        // 添加调试信息
        errorMessage += '\n\n调试信息：';
        errorMessage += `\n  最后尝试的URL: ${lastError.backupUrl}`;
        errorMessage += `\n  尝试的策略数量: ${restoreStrategies.length}`;
        
        return { success: false, message: errorMessage };
      }
      
      return { success: false, message: '所有恢复策略都失败了，请检查WebDAV配置和备份文件' };
    } catch (error) {
      console.error('数据恢复失败:', error);
      return { success: false, message: `数据恢复失败: ${error.message}` };
    }
  }
  
  /**
   * 保存WebDAV配置
   * @param {Object} webdavConfig - WebDAV配置
   * @returns {Promise<boolean>} 保存结果
   */
  static async saveWebDAVConfig(webdavConfig) {
    try {
      const data = await this.getAllData();
      data.config.webdavConfig = { ...data.config.webdavConfig, ...webdavConfig };
      const result = await this.saveAllData(data);
      return result.success;
    } catch (error) {
      console.error('保存WebDAV配置失败:', error);
      return false;
    }
  }
  
  /**
   * 获取WebDAV配置
   * @returns {Promise<Object>} WebDAV配置
   */
  static async getWebDAVConfig() {
    try {
      const data = await this.getAllData();
      return data.config.webdavConfig || {
        url: '',
        username: '',
        password: '',
        autoBackupEnabled: false,
        autoBackupInterval: 'daily',
        backupTime: 0
      };
    } catch (error) {
      console.error('获取WebDAV配置失败:', error);
      return {
        url: '',
        username: '',
        password: '',
        autoBackupEnabled: false,
        autoBackupInterval: 'daily',
        backupTime: 0
      };
    }
  }
}