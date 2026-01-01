/**
 * 数据库管理模块
 * 提供多种存储方式支持：本地存储、IndexedDB和MySQL数据库
 */

export class DatabaseManager {
  // 数据库类型枚举
  static DB_TYPES = {
    LOCAL: 'local',      // 本地存储
    INDEXEDDB: 'indexeddb', // IndexedDB
    MYSQL: 'mysql'       // MySQL数据库
  };

  // IndexedDB配置
  static INDEXEDDB_CONFIG = {
    NAME: 'cloudhut',
    VERSION: 1,
    STORES: {
      WEBSITES: 'websites',
      FAVICONS: 'favicons',
      SYNC: 'sync_metadata'
    }
  };

  // MySQL数据库配置
  static MYSQL_CONFIG = {
    HOST: 'localhost',
    PORT: 3306,
    USER: 'root',
    PASSWORD: '',
    DATABASE: 'cloudhut',
    CONNECTION_TIMEOUT: 5000,
    POOL_SIZE: 10
  };

  // 云同步配置
  static CLOUD_CONFIG = {
    ENABLED: false,
    SYNC_INTERVAL: 5 * 60 * 1000, // 5分钟
    LAST_SYNC_KEY: 'last_cloud_sync'
  };

  // 图标缓存配置
  static FAVICON_CACHE = {
    EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7天
    MAX_ITEMS: 1000
  };

  // 内部数据库实例
  static _indexedDb = null;
  // MySQL数据库连接配置
  static _mysqlConfig = { ...this.MYSQL_CONFIG };
  // MySQL连接状态
  static _mysqlConnected = false;
  // 云同步定时器
  static _syncTimer = null;
  // 存储类型：'local', 'indexeddb' 或 'mysql'
  static _storageType = 'local';
  // 后台配置的MySQL连接信息
  static _mysqlConnectionInfo = null;

  /**
   * 配置MySQL数据库连接信息
   * @param {Object} config - MySQL连接配置
   */
  static setMySQLConfig(config) {
    this._mysqlConfig = {
      ...this.MYSQL_CONFIG,
      ...config
    };
    this._mysqlConnectionInfo = config;
    console.debug('MySQL数据库配置已更新:', this._mysqlConfig);
  }

  /**
   * 获取MySQL数据库配置
   * @returns {Object} MySQL连接配置
   */
  static getMySQLConfig() {
    return this._mysqlConfig;
  }

  /**
   * 初始化数据库
   * @param {string} type - 可选，数据库类型
   * @returns {Promise<any>} 数据库实例或连接结果
   */
  static async initDatabase(type = null) {
    const dbType = type || this._storageType;
    
    if (dbType === this.DB_TYPES.INDEXEDDB) {
      return this._initIndexedDB();
    } else if (dbType === this.DB_TYPES.MYSQL) {
      return this._initMySQL();
    }
    
    // 本地存储不需要初始化
    return Promise.resolve(null);
  }

  /**
   * 初始化IndexedDB数据库
   * @returns {Promise<IDBDatabase>} IndexedDB实例
   */
  static async _initIndexedDB() {
    if (this._indexedDb) {
      return this._indexedDb;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.INDEXEDDB_CONFIG.NAME, this.INDEXEDDB_CONFIG.VERSION);

      request.onerror = (event) => {
        console.error('IndexedDB打开失败:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this._indexedDb = event.target.result;
        console.debug('IndexedDB打开成功');
        resolve(this._indexedDb);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 创建网站存储
        if (!db.objectStoreNames.contains(this.INDEXEDDB_CONFIG.STORES.WEBSITES)) {
          const websiteStore = db.createObjectStore(this.INDEXEDDB_CONFIG.STORES.WEBSITES, {
            keyPath: 'id'
          });
          websiteStore.createIndex('url', 'url', { unique: true });
          websiteStore.createIndex('category', 'categoryId');
        }

        // 创建图标缓存存储
        if (!db.objectStoreNames.contains(this.INDEXEDDB_CONFIG.STORES.FAVICONS)) {
          const faviconStore = db.createObjectStore(this.INDEXEDDB_CONFIG.STORES.FAVICONS, {
            keyPath: 'url'
          });
          faviconStore.createIndex('timestamp', 'timestamp');
        }

        // 创建同步元数据存储
        if (!db.objectStoreNames.contains(this.INDEXEDDB_CONFIG.STORES.SYNC)) {
          const syncStore = db.createObjectStore(this.INDEXEDDB_CONFIG.STORES.SYNC, {
            keyPath: 'key'
          });
        }

        console.debug('IndexedDB升级成功');
      };
    });
  }

  /**
   * 初始化MySQL数据库连接
   * @returns {Promise<boolean>} 连接结果
   */
  static async _initMySQL() {
    try {
      // 在浏览器环境中，我们无法直接连接MySQL数据库
      // 需要通过API接口进行连接和操作
      console.debug('MySQL数据库初始化 - 浏览器环境下通过API接口操作');
      
      // 检查MySQL配置是否完整
      if (!this._mysqlConfig.HOST || !this._mysqlConfig.USER || !this._mysqlConfig.DATABASE) {
        throw new Error('MySQL配置不完整');
      }
      
      this._mysqlConnected = true;
      console.debug('MySQL数据库连接配置已就绪');
      return true;
    } catch (error) {
      console.error('MySQL数据库初始化失败:', error);
      this._mysqlConnected = false;
      return false;
    }
  }

  /**
   * 设置存储类型
   * @param {string} type - 存储类型：'local', 'indexeddb' 或 'mysql'
   */
  static setStorageType(type) {
    if (Object.values(this.DB_TYPES).includes(type)) {
      this._storageType = type;
    } else {
      this._storageType = this.DB_TYPES.LOCAL;
    }
    console.debug(`存储类型已设置为: ${this._storageType}`);
  }

  /**
   * 获取当前存储类型
   * @returns {string} 当前存储类型
   */
  static getStorageType() {
    return this._storageType;
  }

  /**
   * 执行MySQL查询（通过API接口）
   * @param {string} sql - SQL查询语句
   * @param {Array} params - 查询参数
   * @returns {Promise<any>} 查询结果
   */
  static async _executeMySQLQuery(sql, params = []) {
    try {
      if (!this._mysqlConnected) {
        await this._initMySQL();
      }
      
      // 在浏览器环境中，我们需要通过API接口来执行MySQL查询
      // 这里模拟API调用，实际使用时需要替换为真实的API接口
      const response = await fetch('/api/mysql/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this._mysqlConfig,
          sql: sql,
          params: params
        })
      });
      
      if (!response.ok) {
        throw new Error(`MySQL查询失败: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('执行MySQL查询失败:', error);
      throw error;
    }
  }

  /**
   * 执行数据库事务
   * @param {string} storeName - 存储名称
   * @param {string} mode - 事务模式：'readonly' 或 'readwrite'
   * @param {Function} callback - 回调函数，接收objectStore作为参数
   * @returns {Promise<any>} 事务结果
   */
  static async executeTransaction(storeName, mode, callback) {
    const currentType = this.getStorageType();
    
    if (currentType === this.DB_TYPES.INDEXEDDB) {
      return this._executeIndexedDBTransaction(storeName, mode, callback);
    } else if (currentType === this.DB_TYPES.MYSQL) {
      // MySQL不使用事务回调模式，直接执行相应的SQL操作
      // 这里返回null，实际操作在各个方法中单独实现
      return null;
    }
    
    // 本地存储不需要事务
    return null;
  }

  /**
   * 执行IndexedDB事务
   * @param {string} storeName - 存储名称
   * @param {string} mode - 事务模式：'readonly' 或 'readwrite'
   * @param {Function} callback - 回调函数，接收objectStore作为参数
   * @returns {Promise<any>} 事务结果
   */
  static async _executeIndexedDBTransaction(storeName, mode, callback) {
    const db = await this._initIndexedDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      try {
        const result = callback(store);
        if (result instanceof IDBRequest) {
          result.onsuccess = (event) => resolve(event.target.result);
          result.onerror = (event) => reject(event.target.error);
        } else {
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }

      transaction.oncomplete = () => {
        console.debug(`IndexedDB事务完成: ${storeName} - ${mode}`);
      };

      transaction.onerror = (event) => {
        console.error('IndexedDB事务失败:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // ========================== 图标缓存功能 ==========================

  /**
   * 保存网站图标到缓存
   * @param {string} url - 网站URL
   * @param {string} iconUrl - 图标URL
   * @returns {Promise<void>}
   */
  static async saveFavicon(url, iconUrl) {
    const currentType = this.getStorageType();
    const timestamp = Date.now();
    
    if (currentType === this.DB_TYPES.INDEXEDDB) {
      // 使用IndexedDB存储
      const faviconData = {
        url,
        iconUrl,
        timestamp
      };

      await this.executeTransaction(this.INDEXEDDB_CONFIG.STORES.FAVICONS, 'readwrite', (store) => {
        return store.put(faviconData);
      });
    } else if (currentType === this.DB_TYPES.MYSQL) {
      // 使用MySQL存储
      const sql = `
        INSERT INTO favicons (url, iconUrl, timestamp, createdAt)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
        iconUrl = VALUES(iconUrl),
        timestamp = VALUES(timestamp),
        createdAt = NOW()
      `;
      await this._executeMySQLQuery(sql, [url, iconUrl, timestamp]);
    }

    // 清理过期图标
    await this.cleanupExpiredFavicons();
  }

  /**
   * 获取缓存的网站图标
   * @param {string} url - 网站URL
   * @returns {Promise<string|null>} 图标URL，若不存在或已过期则返回null
   */
  static async getFavicon(url) {
    try {
      const currentType = this.getStorageType();
      
      if (currentType === this.DB_TYPES.INDEXEDDB) {
        // 从IndexedDB获取
        const faviconData = await this.executeTransaction(this.INDEXEDDB_CONFIG.STORES.FAVICONS, 'readonly', (store) => {
          return store.get(url);
        });

        if (faviconData) {
          // 检查是否过期
          const isExpired = Date.now() - faviconData.timestamp > this.FAVICON_CACHE.EXPIRY;
          if (!isExpired) {
            return faviconData.iconUrl;
          } else {
            // 删除过期图标
            await this.executeTransaction(this.INDEXEDDB_CONFIG.STORES.FAVICONS, 'readwrite', (store) => {
              return store.delete(url);
            });
          }
        }
      } else if (currentType === this.DB_TYPES.MYSQL) {
        // 从MySQL获取
        const sql = `SELECT iconUrl, timestamp FROM favicons WHERE url = ?`;
        const result = await this._executeMySQLQuery(sql, [url]);
        
        if (result && result.length > 0) {
          const faviconData = result[0];
          // 检查是否过期
          const isExpired = Date.now() - faviconData.timestamp > this.FAVICON_CACHE.EXPIRY;
          if (!isExpired) {
            return faviconData.iconUrl;
          } else {
            // 删除过期图标
            const deleteSql = `DELETE FROM favicons WHERE url = ?`;
            await this._executeMySQLQuery(deleteSql, [url]);
          }
        }
      }

      return null;
    } catch (error) {
      console.error('获取图标缓存失败:', error);
      return null;
    }
  }

  /**
   * 清理过期图标
   * @returns {Promise<void>}
   */
  static async cleanupExpiredFavicons() {
    try {
      const currentType = this.getStorageType();
      const now = Date.now();
      const expiredTime = now - this.FAVICON_CACHE.EXPIRY;

      if (currentType === this.DB_TYPES.INDEXEDDB) {
        // 清理IndexedDB中的过期图标
        await this.executeTransaction(this.INDEXEDDB_CONFIG.STORES.FAVICONS, 'readwrite', (store) => {
          const index = store.index('timestamp');
          const request = index.openCursor(IDBKeyRange.upperBound(expiredTime));

          request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            }
          };
        });

        // 检查并清理超过最大数量的图标
        const count = await this.executeTransaction(this.INDEXEDDB_CONFIG.STORES.FAVICONS, 'readonly', (store) => {
          return store.count();
        });

        if (count > this.FAVICON_CACHE.MAX_ITEMS) {
          await this.executeTransaction(this.INDEXEDDB_CONFIG.STORES.FAVICONS, 'readwrite', (store) => {
            const index = store.index('timestamp');
            const request = index.openCursor();
            let deletedCount = 0;
            const toDelete = count - this.FAVICON_CACHE.MAX_ITEMS;

            request.onsuccess = (event) => {
              const cursor = event.target.result;
              if (cursor && deletedCount < toDelete) {
                cursor.delete();
                deletedCount++;
                cursor.continue();
              }
            };
          });
        }
      } else if (currentType === this.DB_TYPES.MYSQL) {
        // 清理MySQL中的过期图标
        const deleteExpiredSql = `DELETE FROM favicons WHERE timestamp < ?`;
        await this._executeMySQLQuery(deleteExpiredSql, [expiredTime]);
        
        // 检查并清理超过最大数量的图标
        const countSql = `SELECT COUNT(*) as count FROM favicons`;
        const countResult = await this._executeMySQLQuery(countSql);
        const count = countResult[0].count;
        
        if (count > this.FAVICON_CACHE.MAX_ITEMS) {
          const toDelete = count - this.FAVICON_CACHE.MAX_ITEMS;
          // 删除最旧的图标
          const deleteOldSql = `
            DELETE FROM favicons 
            WHERE url IN (
              SELECT url FROM (
                SELECT url FROM favicons ORDER BY timestamp ASC LIMIT ?
              ) as old_favicons
            )
          `;
          await this._executeMySQLQuery(deleteOldSql, [toDelete]);
        }
      }
    } catch (error) {
      console.error('清理过期图标失败:', error);
    }
  }

  // ========================== 网站数据管理 ==========================

  /**
   * 保存网站数据到数据库
   * @param {Array} websites - 网站数据数组
   * @returns {Promise<void>}
   */
  static async saveWebsites(websites) {
    const currentType = this.getStorageType();
    
    if (currentType === this.DB_TYPES.INDEXEDDB) {
      // 使用IndexedDB存储
      await this.executeTransaction(this.INDEXEDDB_CONFIG.STORES.WEBSITES, 'readwrite', (store) => {
        websites.forEach(website => {
          store.put(website);
        });
      });
    } else if (currentType === this.DB_TYPES.MYSQL) {
      // 使用MySQL存储
      for (const website of websites) {
        const sql = `
          INSERT INTO websites (
            id, name, url, \`desc\`, tags, detail, 
            mainCategoryId, categoryId, subCategoryId,
            createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          url = VALUES(url),
          \`desc\` = VALUES(\`desc\`),
          tags = VALUES(tags),
          detail = VALUES(detail),
          mainCategoryId = VALUES(mainCategoryId),
          categoryId = VALUES(categoryId),
          subCategoryId = VALUES(subCategoryId),
          updatedAt = NOW()
        `;
        await this._executeMySQLQuery(sql, [
          website.id, website.name, website.url, 
          website.desc, JSON.stringify(website.tags), website.detail, 
          website.mainCategoryId, website.categoryId, website.subCategoryId
        ]);
      }
    }

    // 如果启用了云同步，触发同步
    if (this.CLOUD_CONFIG.ENABLED) {
      await this.syncWithCloud();
    }
  }

  /**
   * 获取所有网站数据
   * @returns {Promise<Array>} 网站数据数组
   */
  static async getWebsites() {
    const currentType = this.getStorageType();
    
    if (currentType === this.DB_TYPES.INDEXEDDB) {
      // 从IndexedDB获取
      return this.executeTransaction(this.INDEXEDDB_CONFIG.STORES.WEBSITES, 'readonly', (store) => {
        const request = store.getAll();
        return request;
      });
    } else if (currentType === this.DB_TYPES.MYSQL) {
      // 从MySQL获取
      const sql = `SELECT * FROM websites`;
      const result = await this._executeMySQLQuery(sql);
      return result;
    }
    
    return [];
  }

  /**
   * 根据条件查询网站数据
   * @param {Object} conditions - 查询条件
   * @returns {Promise<Array>} 网站数据数组
   */
  static async getWebsitesByConditions(conditions) {
    const currentType = this.getStorageType();
    
    if (currentType === this.DB_TYPES.MYSQL) {
      // 从MySQL查询
      let sql = `SELECT * FROM websites WHERE 1=1`;
      const params = [];
      
      // 构建查询条件
      if (conditions.mainCategoryId) {
        sql += ` AND mainCategoryId = ?`;
        params.push(conditions.mainCategoryId);
      }
      
      if (conditions.categoryId) {
        sql += ` AND categoryId = ?`;
        params.push(conditions.categoryId);
      }
      
      if (conditions.subCategoryId) {
        sql += ` AND subCategoryId = ?`;
        params.push(conditions.subCategoryId);
      }
      
      const result = await this._executeMySQLQuery(sql, params);
      return result;
    } else if (currentType === this.DB_TYPES.INDEXEDDB) {
      // 从IndexedDB获取所有数据后过滤
      const allWebsites = await this.getWebsites();
      return allWebsites.filter(website => {
        let match = true;
        if (conditions.mainCategoryId && website.mainCategoryId !== conditions.mainCategoryId) {
          match = false;
        }
        if (conditions.categoryId && website.categoryId !== conditions.categoryId) {
          match = false;
        }
        if (conditions.subCategoryId && website.subCategoryId !== conditions.subCategoryId) {
          match = false;
        }
        return match;
      });
    }
    
    return [];
  }

  // ========================== 云同步功能 ==========================

  /**
   * 启用云同步
   * @param {Object} config - 云同步配置
   */
  static enableCloudSync(config) {
    this.CLOUD_CONFIG.ENABLED = true;
    Object.assign(this.CLOUD_CONFIG, config);
    
    // 启动定时同步
    this.startSyncTimer();
    console.debug('云同步已启用');
  }

  /**
   * 禁用云同步
   */
  static disableCloudSync() {
    this.CLOUD_CONFIG.ENABLED = false;
    this.stopSyncTimer();
    console.debug('云同步已禁用');
  }

  /**
   * 启动同步定时器
   */
  static startSyncTimer() {
    if (this._syncTimer) {
      clearInterval(this._syncTimer);
    }

    this._syncTimer = setInterval(async () => {
      await this.syncWithCloud();
    }, this.CLOUD_CONFIG.SYNC_INTERVAL);

    console.debug(`同步定时器已启动，间隔: ${this.CLOUD_CONFIG.SYNC_INTERVAL}ms`);
  }

  /**
   * 停止同步定时器
   */
  static stopSyncTimer() {
    if (this._syncTimer) {
      clearInterval(this._syncTimer);
      this._syncTimer = null;
      console.debug('同步定时器已停止');
    }
  }

  /**
   * 与云端同步数据
   * @returns {Promise<void>}
   */
  static async syncWithCloud() {
    if (!this.CLOUD_CONFIG.ENABLED) {
      return;
    }

    try {
      console.debug('开始云同步...');
      
      // 获取本地数据
      const localWebsites = await this.getWebsites();
      
      // 获取最后同步时间
      const lastSync = await this.executeTransaction(this.DB_CONFIG.STORES.SYNC, 'readonly', (store) => {
        return store.get(this.CLOUD_CONFIG.LAST_SYNC_KEY);
      });
      
      const lastSyncTime = lastSync?.value || 0;
      
      // 这里应该实现与云端的实际同步逻辑
      // 示例：发送数据到云端API
      // const response = await fetch('https://api.cloudhut.com/sync', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.CLOUD_CONFIG.API_KEY}`
      //   },
      //   body: JSON.stringify({
      //     websites: localWebsites,
      //     lastSyncTime
      //   })
      // });
      
      // if (response.ok) {
      //   const syncResult = await response.json();
      //   // 处理同步结果，如更新本地数据
      //   if (syncResult.updatedWebsites) {
      //     await this.saveWebsites(syncResult.updatedWebsites);
      //   }
      // }
      
      // 更新最后同步时间
      await this.executeTransaction(this.DB_CONFIG.STORES.SYNC, 'readwrite', (store) => {
        store.put({
          key: this.CLOUD_CONFIG.LAST_SYNC_KEY,
          value: Date.now()
        });
      });
      
      console.debug('云同步完成');
    } catch (error) {
      console.error('云同步失败:', error);
    }
  }

  /**
   * 手动触发云同步
   * @returns {Promise<void>}
   */
  static async manualSync() {
    if (this.CLOUD_CONFIG.ENABLED) {
      await this.syncWithCloud();
    }
  }

  // ========================== 数据库连接状态 ==========================

  /**
   * 检查数据库连接状态
   * @returns {Promise<boolean>} 连接状态
   */
  static async checkConnection() {
    try {
      await this.initDatabase();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 关闭数据库连接
   */
  static closeDatabase() {
    if (this._db) {
      this._db.close();
      this._db = null;
      console.debug('数据库连接已关闭');
    }
  }
}

// 导出默认实例
export const dbManager = new DatabaseManager();
