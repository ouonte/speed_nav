/**
 * 数据管理模块
 * 提供完整的数据管理功能，支持跨浏览器兼容性
 */

// 使用webextension-polyfill提供跨浏览器兼容性支持
// @ts-ignore - webextension-polyfill类型定义可能需要额外安装
const browserAPI = window.browser || window.chrome || {};

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

    // 验证URL格式
    try {
      new URL(website.url);
    } catch {
      return { valid: false, message: `网站 "${website.name}" URL格式无效` };
    }

    return { valid: true };
  }
}

/**
 * 数据操作工具类
 */
export class DataManager {
  /**
   * 获取所有数据
   * @returns {Promise<Object>} 所有数据
   */
  static async getAllData() {
    try {
      // 使用兼容的存储API，处理Chrome的回调模式和Firefox的Promise模式
      return new Promise((resolve) => {
        // 如果浏览器支持Promise版本的storage API（Firefox）
        if (browserAPI.storage?.local?.get && typeof browserAPI.storage.local.get === 'function') {
          const result = browserAPI.storage.local.get(['navData']);
          
          // 检查是否是Promise
          if (result && typeof result.then === 'function') {
            // Promise模式
            result.then(data => {
              resolve(data.navData || defaultData);
            }).catch(() => {
              resolve(defaultData);
            });
          } else {
            // 回调模式（Chrome）
            browserAPI.storage.local.get(['navData'], (data) => {
              if (browserAPI.runtime?.lastError) {
                resolve(defaultData);
              } else {
                resolve(data.navData || defaultData);
              }
            });
          }
        } else {
          // 如果storage API不可用，返回默认数据
          resolve(defaultData);
        }
      });
    } catch (error) {
      console.error('获取数据失败:', error);
      return defaultData;
    }
  }

  /**
   * 保存所有数据
   * @param {Object} data - 要保存的数据
   * @returns {Promise<boolean>} 保存结果
   */
  static async saveAllData(data) {
    try {
      // 验证数据结构
      const validation = DataValidator.validateDataStructure(data);
      if (!validation.valid) {
        console.error('数据验证失败:', validation.message);
        return false;
      }

      // 使用兼容的存储API，处理Chrome的回调模式和Firefox的Promise模式
      return new Promise((resolve) => {
        // 如果浏览器支持Promise版本的storage API（Firefox）
        if (browserAPI.storage?.local?.set && typeof browserAPI.storage.local.set === 'function') {
          const result = browserAPI.storage.local.set({ navData: data });
          
          // 检查是否是Promise
          if (result && typeof result.then === 'function') {
            // Promise模式
            result.then(() => {
              resolve(true);
            }).catch(() => {
              console.error('保存数据失败（Promise模式）');
              resolve(false);
            });
          } else {
            // 回调模式（Chrome）
            browserAPI.storage.local.set({ navData: data }, () => {
              if (browserAPI.runtime?.lastError) {
                console.error('保存数据失败（回调模式）:', browserAPI.runtime.lastError);
                resolve(false);
              } else {
                resolve(true);
              }
            });
          }
        } else {
          // 如果storage API不可用，保存失败
          console.error('storage API不可用');
          resolve(false);
        }
      });
    } catch (error) {
      console.error('保存数据失败:', error);
      return false;
    }
  }

  /**
   * 重置数据为默认值
   * @returns {Promise<boolean>} 重置结果
   */
  static async resetToDefault() {
    try {
      // 使用兼容的存储API，处理Chrome的回调模式和Firefox的Promise模式
      return new Promise((resolve) => {
        // 如果浏览器支持Promise版本的storage API（Firefox）
        if (browserAPI.storage?.local?.set && typeof browserAPI.storage.local.set === 'function') {
          const result = browserAPI.storage.local.set({ navData: defaultData });
          
          // 检查是否是Promise
          if (result && typeof result.then === 'function') {
            // Promise模式
            result.then(() => {
              resolve(true);
            }).catch(() => {
              console.error('重置数据失败（Promise模式）');
              resolve(false);
            });
          } else {
            // 回调模式（Chrome）
            browserAPI.storage.local.set({ navData: defaultData }, () => {
              if (browserAPI.runtime?.lastError) {
                console.error('重置数据失败（回调模式）:', browserAPI.runtime.lastError);
                resolve(false);
              } else {
                resolve(true);
              }
            });
          }
        } else {
          // 如果storage API不可用，重置失败
          console.error('storage API不可用');
          resolve(false);
        }
      });
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
      let data;
      if (typeof jsonData === 'string') {
        data = JSON.parse(jsonData);
      } else {
        data = jsonData;
      }

      // 验证数据结构
      const validation = DataValidator.validateDataStructure(data);
      if (!validation.valid) {
        return validation;
      }

      // 保存数据
      const result = await this.saveAllData(data);
      if (result) {
        return { valid: true, message: '数据导入成功' };
      } else {
        return { valid: false, message: '数据保存失败' };
      }
    } catch (error) {
      console.error('导入数据失败:', error);
      return { valid: false, message: `导入失败: ${error.message}` };
    }
  }

  /**
   * 导出数据
   * @returns {Promise<string|null>} 导出的JSON字符串
   */
  static async exportData() {
    try {
      const data = await this.getAllData();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('导出数据失败:', error);
      return null;
    }
  }

  /**
   * 下载JSON文件
   * @param {string} data - 要下载的数据
   * @param {string} filename - 文件名
   */
  static downloadJSON(data, filename = 'navData.json') {
    try {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载文件失败:', error);
    }
  }

  /**
   * 从文件选择器导入数据
   * @param {HTMLInputElement} inputElement - 文件输入元素
   * @param {Function} callback - 回调函数
   */
  static importFromFile(inputElement, callback) {
    const file = inputElement.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      callback({ valid: false, message: '请选择JSON格式文件' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = await this.importData(e.target.result);
        callback(result);
      } catch (error) {
        callback({ valid: false, message: `文件读取失败: ${error.message}` });
      }
    };
    reader.onerror = () => {
      callback({ valid: false, message: '文件读取失败' });
    };
    reader.readAsText(file);
  }

  /**
   * 从文件对象导入数据（Promise版本）
   * @param {File} file - 文件对象
   * @returns {Promise<Object>} 导入结果
   */
  static async importFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve({ valid: false, message: '未选择文件' });
        return;
      }

      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        resolve({ valid: false, message: '请选择JSON格式文件' });
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = await this.importData(e.target.result);
          resolve(result);
        } catch (error) {
          resolve({ valid: false, message: `文件读取失败: ${error.message}` });
        }
      };
      reader.onerror = () => {
        resolve({ valid: false, message: '文件读取失败' });
      };
      reader.readAsText(file);
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
            
            if (saved) {
                return { success: true, data: newMainCategory };
            } else {
                return { success: false, message: '保存失败' };
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
      
      if (saved) {
        return { success: true, data: newCategory };
      } else {
        return { success: false, message: '保存失败' };
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
      return await this.saveAllData(data);
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
      
      if (saved) {
        return { success: true, data: newSubcategory };
      } else {
        return { success: false, message: '保存失败' };
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
      return await this.saveAllData(data);
    } catch (error) {
      console.error('删除二级分类失败:', error);
      return false;
    }
  }

  // 网站操作
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

      const newWebsite = {
        id: generateId('web'),
        name: websiteName,
        url: websiteUrl,
        desc: websiteDesc,
        tags: websiteTags
      };

      subcategory.websites.push(newWebsite);
      const saved = await this.saveAllData(data);
      
      if (saved) {
        return { success: true, data: newWebsite };
      } else {
        return { success: false, message: '保存失败' };
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
      if (saved) {
        return { success: true, message: '网站更新成功' };
      } else {
        return { success: false, message: '保存失败' };
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
      if (saved) {
        return { success: true, message: '网站删除成功' };
      } else {
        return { success: false, message: '保存失败' };
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
      
      if (saved) {
        return { success: true, message: '分类顺序已更新' };
      } else {
        return { success: false, message: '保存失败' };
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
      
      // 针对不同WebDAV服务器的备份路径策略
      const backupStrategies = [
        // 策略1: 直接使用用户配置的URL + 文件名
        () => {
          backupUrl = url.endsWith('/') 
            ? `${url}cloudhut-backup.json`
            : `${url}/cloudhut-backup.json`;
          directoryUrl = backupUrl.substring(0, backupUrl.lastIndexOf('/') + 1);
        },
        
        // 策略2: 用户配置的URL + /cloudhut/子目录 + 文件名
        () => {
          const baseUrl = url.endsWith('/') ? url : `${url}/`;
          backupUrl = `${baseUrl}cloudhut/cloudhut-backup.json`;
          directoryUrl = `${baseUrl}cloudhut/`;
        },
        
        // 策略3: 针对坚果云的特殊路径
        () => {
          if (url.includes('jianguoyun.com')) {
            // 坚果云可能需要特定的路径格式
            if (url.endsWith('/dav/')) {
              // 如果已经包含/dav/，尝试添加一个子目录
              backupUrl = `${url}cloudhut/cloudhut-backup.json`;
              directoryUrl = `${url}cloudhut/`;
            } else if (url.endsWith('/')) {
              // 如果以/结尾，尝试添加/dav/cloudhut/
              backupUrl = `${url}dav/cloudhut/cloudhut-backup.json`;
              directoryUrl = `${url}dav/cloudhut/`;
            } else {
              // 其他情况，尝试添加/dav/cloudhut/
              backupUrl = `${url}/dav/cloudhut/cloudhut-backup.json`;
              directoryUrl = `${url}/dav/cloudhut/`;
            }
          } else {
            // 非坚果云，跳过此策略
            return false;
          }
        }
      ];
      
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
      
      // 针对不同WebDAV服务器的恢复路径策略（与备份策略对应）
      const restoreStrategies = [
        // 策略1: 直接使用用户配置的URL + 文件名
        () => {
          backupUrl = url.endsWith('/') 
            ? `${url}cloudhut-backup.json`
            : `${url}/cloudhut-backup.json`;
        },
        
        // 策略2: 用户配置的URL + /cloudhut/子目录 + 文件名
        () => {
          const baseUrl = url.endsWith('/') ? url : `${url}/`;
          backupUrl = `${baseUrl}cloudhut/cloudhut-backup.json`;
        },
        
        // 策略3: 针对坚果云的特殊路径
        () => {
          if (url.includes('jianguoyun.com')) {
            // 坚果云可能需要特定的路径格式
            if (url.endsWith('/dav/')) {
              // 如果已经包含/dav/，尝试添加一个子目录
              backupUrl = `${url}cloudhut/cloudhut-backup.json`;
            } else if (url.endsWith('/')) {
              // 如果以/结尾，尝试添加/dav/cloudhut/
              backupUrl = `${url}dav/cloudhut/cloudhut-backup.json`;
            } else {
              // 其他情况，尝试添加/dav/cloudhut/
              backupUrl = `${url}/dav/cloudhut/cloudhut-backup.json`;
            }
          } else {
            // 非坚果云，跳过此策略
            return false;
          }
        },
        
        // 策略4: 直接尝试/dav/路径
        () => {
          backupUrl = `${url.replace(/\/$/, '')}/dav/cloudhut-backup.json`;
        },
        
        // 策略5: 尝试/dav/cloudhut/路径
        () => {
          backupUrl = `${url.replace(/\/$/, '')}/dav/cloudhut/cloudhut-backup.json`;
        }
      ];
      
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
            if (saved) {
              return { success: true, message: '数据恢复成功' };
            } else {
              return { success: false, message: '数据恢复失败: 保存数据失败' };
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
      return await this.saveAllData(data);
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