// 网站分类数据 - 按主类划分
const mainCategoryData = {
    general: {
        name: '综合导航',
        categories: {
            daily: {
                name: '日常办公',
                subCategories: [
                    { id: 'office', name: 'Office 在线' },
                    { id: 'cloud', name: '云盘存储' },
                    { id: 'collab', name: '企业协作' },
                    { id: 'email', name: '邮件工具' },
                    { id: 'meeting', name: '会议软件' }
                ],
                websites: {
                    office: [
                        { name: 'Google Docs', url: 'https://docs.google.com', desc: '在线文档编辑工具', tags: ['文档', '在线', '办公'], detail: 'Google推出的免费在线文档编辑工具，支持多人协作编辑。', logo: '' },
                        { name: 'Microsoft 365', url: 'https://office.com', desc: '微软办公套件', tags: ['办公', '套件', '云服务'], detail: '微软推出的云端办公套件，包含Word、Excel、PowerPoint等工具。', logo: '' },
                        { name: 'WPS 在线', url: 'https://wps.cn', desc: '国产在线办公软件', tags: ['国产', '办公', '在线'], detail: '金山软件推出的国产在线办公软件，支持多种文档格式。', logo: '' }
                    ],
                    cloud: [
                        { name: '百度网盘', url: 'https://pan.baidu.com', desc: '大容量云存储服务', tags: ['云存储', '百度', '大容量'], detail: '百度推出的云存储服务，提供大容量存储空间和文件分享功能。', logo: '' },
                        { name: '阿里云盘', url: 'https://www.aliyundrive.com', desc: '阿里云旗下云存储', tags: ['云存储', '阿里', '高速'], detail: '阿里云推出的云存储服务，以高速下载和大存储空间著称。', logo: '' },
                        { name: '腾讯微云', url: 'https://www.weiyun.com', desc: '腾讯旗下云存储', tags: ['云存储', '腾讯', '便捷'], detail: '腾讯推出的云存储服务，与QQ、微信深度集成。', logo: '' }
                    ],
                    collab: [
                        { name: '飞书', url: 'https://www.feishu.cn', desc: '字节跳动企业协作平台', tags: ['协作', '企业', '字节'], detail: '字节跳动推出的企业协作平台，包含即时通讯、日历、文档等功能。', logo: '' },
                        { name: '企业微信', url: 'https://work.weixin.qq.com', desc: '微信企业版', tags: ['协作', '企业', '微信'], detail: '腾讯推出的企业微信，与微信生态深度融合。', logo: '' },
                        { name: '钉钉', url: 'https://www.dingtalk.com', desc: '阿里巴巴企业协作平台', tags: ['协作', '企业', '阿里'], detail: '阿里巴巴推出的企业协作平台，提供考勤、审批、会议等功能。', logo: '' }
                    ],
                    email: [
                        { name: 'Gmail', url: 'https://mail.google.com', desc: '谷歌邮箱', tags: ['邮箱', '谷歌', '国际'], detail: '谷歌推出的免费邮箱服务，提供大容量存储空间和强大的搜索功能。', logo: '' },
                        { name: '网易邮箱', url: 'https://mail.163.com', desc: '网易免费邮箱', tags: ['邮箱', '网易', '国内'], detail: '网易推出的免费邮箱服务，国内用户广泛使用。', logo: '' },
                        { name: 'QQ邮箱', url: 'https://mail.qq.com', desc: '腾讯QQ邮箱', tags: ['邮箱', '腾讯', 'QQ'], detail: '腾讯推出的邮箱服务，与QQ账号绑定，使用便捷。', logo: '' }
                    ],
                    meeting: [
                        { name: '腾讯会议', url: 'https://meeting.tencent.com', desc: '腾讯视频会议', tags: ['会议', '视频', '腾讯'], detail: '腾讯推出的视频会议软件，支持多人在线会议和屏幕共享。', logo: '' },
                        { name: 'Zoom', url: 'https://zoom.us', desc: '高清视频会议平台', tags: ['会议', '视频', '国际'], detail: '全球知名的视频会议平台，以高清画质和稳定性能著称。', logo: '' },
                        { name: '飞书会议', url: 'https://www.feishu.cn/hc/zh-CN/articles/360045545453', desc: '飞书视频会议', tags: ['会议', '视频', '字节'], detail: '飞书旗下的视频会议功能，与飞书生态深度集成。', logo: '' }
                    ]
                }
            },
            education: {
                name: '学习教育',
                subCategories: [
                    { id: 'online', name: '网课平台' },
                    { id: 'academic', name: '学术文献' },
                    { id: 'language', name: '外语学习' },
                    { id: 'exam', name: '考证题库' },
                    { id: 'kids', name: '少儿教育' }
                ],
                websites: {
                    online: [
                        { name: 'Coursera', url: 'https://www.coursera.org', desc: '全球在线课程平台', tags: ['网课', '国际', '名校'], detail: '提供来自全球顶尖大学的在线课程，涵盖多个学科领域。', logo: '' },
                        { name: '网易云课堂', url: 'https://study.163.com', desc: '网易在线学习平台', tags: ['网课', '国内', '职业'], detail: '网易推出的在线学习平台，提供职业技能和兴趣爱好课程。', logo: '' },
                        { name: '中国大学MOOC', url: 'https://www.icourse163.org', desc: '国内高校在线课程', tags: ['网课', '国内', '大学'], detail: '由教育部主导的在线课程平台，汇聚国内顶尖高校课程。', logo: '' }
                    ],
                    academic: [
                        { name: 'CNKI', url: 'https://www.cnki.net', desc: '中国知网', tags: ['文献', '学术', '国内'], detail: '中国最大的学术文献数据库，涵盖多种学科领域。', logo: '' },
                        { name: '万方数据', url: 'https://www.wanfangdata.com.cn', desc: '万方学术资源', tags: ['文献', '学术', '国内'], detail: '提供学术期刊、学位论文、会议论文等资源。', logo: '' },
                        { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', desc: '医学文献数据库', tags: ['文献', '医学', '国际'], detail: '美国国家医学图书馆的免费生物医学文献数据库。', logo: '' }
                    ],
                    language: [
                        { name: '扇贝单词', url: 'https://www.shanbay.com', desc: '英语单词学习', tags: ['英语', '单词', '学习'], detail: '专注于英语单词学习的应用，提供多种学习模式。', logo: '' },
                        { name: 'Duolingo', url: 'https://www.duolingo.com', desc: '多语言学习平台', tags: ['语言', '多语种', '游戏化'], detail: '采用游戏化方式学习多种语言，轻松有趣。', logo: '' },
                        { name: '沪江网校', url: 'https://class.hujiang.com', desc: '沪江外语学习', tags: ['外语', '网校', '国内'], detail: '沪江旗下的在线外语学习平台，提供多种语言课程。', logo: '' }
                    ],
                    exam: [
                        { name: '粉笔公考', url: 'https://www.fenbi.com', desc: '公务员考试题库', tags: ['公考', '题库', '培训'], detail: '专注于公务员考试的在线学习平台，提供题库和培训课程。', logo: '' },
                        { name: '考研帮', url: 'https://www.kaoyan.com', desc: '考研资讯平台', tags: ['考研', '资讯', '社区'], detail: '提供考研资讯、复习资料和交流社区。', logo: '' },
                        { name: '驾考宝典', url: 'https://www.jiakaobaodian.com', desc: '驾照考试题库', tags: ['驾考', '题库', '学习'], detail: '提供驾照考试题库和学习资料，帮助考生顺利通过考试。', logo: '' }
                    ],
                    kids: [
                        { name: '猿辅导', url: 'https://www.yuanfudao.com', desc: '中小学在线教育', tags: ['中小学', '在线', '辅导'], detail: '专注于中小学在线教育的平台，提供直播课程和辅导服务。', logo: '' },
                        { name: '学而思', url: 'https://www.xueersi.com', desc: '学而思网校', tags: ['中小学', '在线', '知名'], detail: '国内知名的中小学在线教育平台，提供多种学科课程。', logo: '' },
                        { name: 'VIPKID', url: 'https://www.vipkid.com.cn', desc: '少儿英语教育', tags: ['少儿', '英语', '外教'], detail: '提供一对一少儿英语外教课程，专注于口语教学。', logo: '' }
                    ]
                }
            },
            entertainment: {
                name: '娱乐休闲',
                subCategories: [
                    { id: 'video', name: '视频平台' },
                    { id: 'music', name: '音乐网站' },
                    { id: 'game', name: '游戏专区' },
                    { id: 'novel', name: '小说阅读' },
                    { id: 'social', name: '社交社区' }
                ],
                websites: {
                    video: [
                        { name: 'B站', url: 'https://www.bilibili.com', desc: '哔哩哔哩弹幕视频', tags: ['视频', '弹幕', '年轻'], detail: '年轻人喜爱的弹幕视频网站，涵盖动画、游戏、生活等内容。', logo: '' },
                        { name: '优酷', url: 'https://www.youku.com', desc: '优酷视频', tags: ['视频', '剧集', '综艺'], detail: '国内知名的视频网站，提供大量剧集、综艺和电影资源。', logo: '' },
                        { name: '腾讯视频', url: 'https://v.qq.com', desc: '腾讯视频', tags: ['视频', '腾讯', '独家'], detail: '腾讯旗下的视频网站，拥有大量独家内容和热门剧集。', logo: '' }
                    ],
                    music: [
                        { name: '网易云音乐', url: 'https://music.163.com', desc: '网易云音乐', tags: ['音乐', '社区', '个性化'], detail: '网易旗下的音乐平台，以个性化推荐和活跃社区著称。', logo: '' },
                        { name: 'QQ音乐', url: 'https://y.qq.com', desc: 'QQ音乐', tags: ['音乐', '腾讯', '海量'], detail: '腾讯旗下的音乐平台，拥有海量音乐资源和独家版权。', logo: '' },
                        { name: '酷狗音乐', url: 'https://www.kugou.com', desc: '酷狗音乐', tags: ['音乐', '老牌', '下载'], detail: '国内老牌音乐平台，支持音乐下载和在线播放。', logo: '' }
                    ],
                    game: [
                        { name: 'Steam', url: 'https://store.steampowered.com', desc: 'Steam游戏平台', tags: ['游戏', '国际', 'PC'], detail: '全球最大的PC游戏平台，提供大量游戏购买和下载服务。', logo: '' },
                        { name: 'Epic Games', url: 'https://www.epicgames.com', desc: 'Epic游戏商店', tags: ['游戏', '国际', '免费'], detail: '提供免费游戏领取和游戏购买服务，经常赠送大作。', logo: '' },
                        { name: '游民星空', url: 'https://www.gamersky.com', desc: '游戏资讯平台', tags: ['游戏', '资讯', '下载'], detail: '国内知名的游戏资讯网站，提供游戏新闻和下载资源。', logo: '' }
                    ],
                    novel: [
                        { name: '起点中文网', url: 'https://www.qidian.com', desc: '起点中文网', tags: ['小说', '原创', '网文'], detail: '国内最大的原创网络小说平台，汇聚大量优秀作者。', logo: '' },
                        { name: '晋江文学城', url: 'https://www.jjwxc.net', desc: '晋江文学城', tags: ['小说', '女性', '原创'], detail: '专注于女性向原创小说的平台，拥有大量热门作品。', logo: '' },
                        { name: '阅文集团', url: 'https://www.yuewen.com', desc: '阅文集团', tags: ['小说', '巨头', '综合'], detail: '国内最大的网络文学集团，拥有多个知名小说平台。', logo: '' }
                    ],
                    social: [
                        { name: '微博', url: 'https://weibo.com', desc: '新浪微博', tags: ['社交', '资讯', '热点'], detail: '国内最大的社交媒体平台之一，是获取热点资讯的重要渠道。', logo: '' },
                        { name: '知乎', url: 'https://www.zhihu.com', desc: '知乎问答平台', tags: ['问答', '知识', '社区'], detail: '高质量的问答社区，汇聚各领域专业人士。', logo: '' },
                        { name: '小红书', url: 'https://www.xiaohongshu.com', desc: '小红书', tags: ['社交', '生活', '分享'], detail: '生活方式分享平台，涵盖美妆、穿搭、旅行等内容。', logo: '' }
                    ]
                }
            },
            life: {
                name: '生活服务',
                subCategories: [
                    { id: 'food', name: '外卖订餐' },
                    { id: 'travel', name: '出行打车' },
                    { id: 'express', name: '快递查询' },
                    { id: 'gov', name: '政务服务' },
                    { id: 'medical', name: '医疗挂号' }
                ],
                websites: {
                    food: [
                        { name: '美团外卖', url: 'https://waimai.meituan.com', desc: '美团外卖', tags: ['外卖', '餐饮', '美团'], detail: '美团旗下的外卖平台，覆盖全国多个城市，提供便捷的餐饮配送服务。', logo: '' },
                        { name: '饿了么', url: 'https://www.ele.me', desc: '饿了么外卖', tags: ['外卖', '餐饮', '阿里'], detail: '阿里巴巴旗下的外卖平台，与支付宝深度集成。', logo: '' },
                        { name: '大众点评', url: 'https://www.dianping.com', desc: '大众点评', tags: ['餐饮', '点评', '生活'], detail: '提供餐饮、酒店、休闲娱乐等生活服务的点评和推荐。', logo: '' }
                    ],
                    travel: [
                        { name: '滴滴出行', url: 'https://www.didiglobal.com', desc: '滴滴出行', tags: ['出行', '打车', '网约车'], detail: '国内最大的网约车平台，提供快车、专车、顺风车等服务。', logo: '' },
                        { name: '高德地图', url: 'https://ditu.amap.com', desc: '高德地图', tags: ['地图', '导航', '出行'], detail: '国内知名的地图导航应用，提供精准的定位和导航服务。', logo: '' },
                        { name: '携程旅行', url: 'https://www.ctrip.com', desc: '携程旅行网', tags: ['旅行', '预订', '综合'], detail: '国内领先的在线旅行服务平台，提供机票、酒店、旅游等预订服务。', logo: '' }
                    ],
                    express: [
                        { name: '快递100', url: 'https://www.kuaidi100.com', desc: '快递查询', tags: ['快递', '查询', '综合'], detail: '提供多家快递公司的快递单号查询服务，方便快捷。', logo: '' },
                        { name: '顺丰速运', url: 'https://www.sf-express.com', desc: '顺丰快递', tags: ['快递', '物流', '高端'], detail: '国内高端快递品牌，以快速、安全的服务著称。', logo: '' },
                        { name: '中通快递', url: 'https://www.zto.com', desc: '中通快递', tags: ['快递', '物流', '经济'], detail: '国内知名的经济型快递品牌，覆盖全国多个地区。', logo: '' }
                    ],
                    gov: [
                        { name: '国家政务服务平台', url: 'https://www.gjzwfw.gov.cn', desc: '政务服务', tags: ['政务', '服务', '官方'], detail: '国家推出的政务服务平台，提供多种在线政务服务。', logo: '' },
                        { name: '12306', url: 'https://www.12306.cn', desc: '铁路购票', tags: ['铁路', '购票', '官方'], detail: '中国铁路官方购票网站，提供火车票预订和查询服务。', logo: '' },
                        { name: '个税APP', url: 'https://etax.chinatax.gov.cn', desc: '个人所得税', tags: ['税务', '个税', '官方'], detail: '官方个人所得税申报和查询平台，方便纳税人办理税务业务。', logo: '' }
                    ],
                    medical: [
                        { name: '好大夫在线', url: 'https://www.haodf.com', desc: '在线问诊平台', tags: ['医疗', '问诊', '在线'], detail: '提供在线问诊、预约挂号等医疗服务，汇聚众多医生资源。', logo: '' },
                        { name: '丁香医生', url: 'https://www.dxy.cn', desc: '丁香医生', tags: ['医疗', '健康', '科普'], detail: '提供专业的医疗健康科普和在线问诊服务。', logo: '' },
                        { name: '微医', url: 'https://www.guahao.com', desc: '在线挂号平台', tags: ['医疗', '挂号', '综合'], detail: '提供在线预约挂号服务，覆盖全国多家医院。', logo: '' }
                    ]
                }
            },
            tools: {
                name: '工具资源',
                subCategories: [
                    { id: 'design', name: '在线制图' },
                    { id: 'convert', name: '文件转换' },
                    { id: 'query', name: '实用查询' },
                    { id: 'material', name: '素材网站' },
                    { id: 'coding', name: '编程工具' }
                ],
                websites: {
                    design: [
                        { name: 'Canva', url: 'https://www.canva.cn', desc: '在线设计工具', tags: ['设计', '在线', '易用'], detail: '简单易用的在线设计工具，提供大量模板和素材。', logo: '' },
                        { name: 'Figma', url: 'https://www.figma.com', desc: '协作设计工具', tags: ['设计', '协作', '专业'], detail: '专业的协作设计工具，支持多人实时协作编辑。', logo: '' },
                        { name: '创客贴', url: 'https://www.chuangkit.com', desc: '创客贴设计', tags: ['设计', '在线', '模板'], detail: '提供大量设计模板，适合快速制作各种设计作品。', logo: '' }
                    ],
                    convert: [
                        { name: 'SmallPDF', url: 'https://smallpdf.com', desc: 'PDF转换工具', tags: ['PDF', '转换', '在线'], detail: '在线PDF转换工具，支持多种格式之间的转换。', logo: '' },
                        { name: '格式工厂', url: 'https://www.pcfreetime.com', desc: '多媒体格式转换', tags: ['转换', '多媒体', '桌面'], detail: '功能强大的多媒体格式转换工具，支持多种格式转换。', logo: '' },
                        { name: '在线转换', url: 'https://www.zamzar.com', desc: '在线文件转换', tags: ['转换', '在线', '多种'], detail: '支持多种文件格式的在线转换服务。', logo: '' }
                    ],
                    query: [
                        { name: '天眼查', url: 'https://www.tianyancha.com', desc: '企业信息查询', tags: ['企业', '查询', '信用'], detail: '提供企业信息查询和信用评估服务，方便了解企业背景。', logo: '' },
                        { name: '企查查', url: 'https://www.qcc.com', desc: '企业信用查询', tags: ['企业', '查询', '信用'], detail: '提供企业信用信息查询服务，支持多种查询维度。', logo: '' },
                        { name: 'IP查询', url: 'https://www.ip138.com', desc: 'IP地址查询', tags: ['IP', '查询', '工具'], detail: '提供IP地址查询服务，支持地理位置和归属地查询。', logo: '' }
                    ],
                    material: [
                        { name: '花瓣网', url: 'https://huaban.com', desc: '图片素材分享', tags: ['素材', '图片', '分享'], detail: '图片素材分享社区，汇聚大量优质图片资源。', logo: '' },
                        { name: '千图网', url: 'https://www.58pic.com', desc: '设计素材下载', tags: ['素材', '设计', '下载'], detail: '提供大量设计素材下载，涵盖多种设计领域。', logo: '' },
                        { name: 'Unsplash', url: 'https://unsplash.com', desc: '免费高清图片', tags: ['图片', '高清', '免费'], detail: '提供免费高清图片下载，可用于商业用途。', logo: '' }
                    ],
                    coding: [
                        { name: 'GitHub', url: 'https://github.com', desc: '代码托管平台', tags: ['代码', '托管', '开源'], detail: '全球最大的代码托管平台，是开源项目的重要聚集地。', logo: '' },
                        { name: 'Stack Overflow', url: 'https://stackoverflow.com', desc: '编程问答', tags: ['编程', '问答', '技术'], detail: '全球最大的编程问答社区，程序员解决问题的重要资源。', logo: '' },
                        { name: 'CSDN', url: 'https://www.csdn.net', desc: '开发者社区', tags: ['编程', '社区', '国内'], detail: '国内知名的开发者社区，提供技术文章、博客和资源下载。', logo: '' }
                    ]
                }
            },
            industry: {
                name: '行业网站',
                subCategories: [
                    { id: 'ecommerce', name: '电商平台' },
                    { id: 'finance', name: '金融财经' },
                    { id: 'media', name: '新媒体运营' },
                    { id: 'creative', name: '设计创意' },
                    { id: 'construction', name: '建筑工程' }
                ],
                websites: {
                    ecommerce: [
                        { name: '淘宝', url: 'https://www.taobao.com', desc: '淘宝网', tags: ['电商', '购物', '综合'], detail: '国内最大的综合性电商平台，商品种类丰富。', logo: '' },
                        { name: '京东', url: 'https://www.jd.com', desc: '京东商城', tags: ['电商', '购物', '自营'], detail: '以自营物流和正品保障著称的电商平台。', logo: '' },
                        { name: '拼多多', url: 'https://www.pinduoduo.com', desc: '拼多多', tags: ['电商', '购物', '低价'], detail: '以拼团模式和低价商品著称的电商平台。', logo: '' }
                    ],
                    finance: [
                        { name: '雪球', url: 'https://xueqiu.com', desc: '股票投资社区', tags: ['金融', '股票', '社区'], detail: '股票投资者的交流社区，提供股票资讯和分析。', logo: '' },
                        { name: '东方财富', url: 'https://www.eastmoney.com', desc: '金融财经门户', tags: ['金融', '财经', '资讯'], detail: '国内知名的金融财经门户网站，提供全面的财经资讯。', logo: '' },
                        { name: '同花顺', url: 'https://www.10jqka.com.cn', desc: '炒股软件', tags: ['金融', '股票', '软件'], detail: '功能强大的炒股软件，提供实时行情和分析工具。', logo: '' }
                    ],
                    media: [
                        { name: '新榜', url: 'https://www.newrank.cn', desc: '新媒体排行榜', tags: ['新媒体', '排行榜', '数据'], detail: '提供新媒体账号排行榜和数据分析服务。', logo: '' },
                        { name: '微小宝', url: 'https://www.wxb.com', desc: '公众号管理工具', tags: ['新媒体', '公众号', '管理'], detail: '公众号管理工具，提供数据统计和内容分析。', logo: '' },
                        { name: '抖音创作者服务中心', url: 'https://creator.douyin.com', desc: '抖音创作平台', tags: ['新媒体', '抖音', '创作'], detail: '抖音创作者的管理平台，提供作品发布和数据分析。', logo: '' }
                    ],
                    creative: [
                        { name: '站酷', url: 'https://www.zcool.com.cn', desc: '设计师社区', tags: ['设计', '创意', '社区'], detail: '国内知名的设计师社区，汇聚大量优秀设计作品。', logo: '' },
                        { name: 'UI中国', url: 'https://www.ui.cn', desc: 'UI设计平台', tags: ['设计', 'UI', '专业'], detail: '专注于UI设计的平台，提供作品展示和交流。', logo: '' },
                        { name: 'Behance', url: 'https://www.behance.net', desc: '创意作品展示', tags: ['设计', '创意', '国际'], detail: '全球创意作品展示平台，汇聚各领域优秀设计师。', logo: '' }
                    ],
                    construction: [
                        { name: '建筑英才网', url: 'https://www.buildhr.com', desc: '建筑人才招聘', tags: ['建筑', '招聘', '行业'], detail: '专注于建筑行业的人才招聘网站。', logo: '' },
                        { name: '中国建筑网', url: 'https://www.chinajianzhu.com', desc: '建筑行业门户', tags: ['建筑', '行业', '资讯'], detail: '提供建筑行业资讯、政策和技术资料。', logo: '' },
                        { name: '土木在线', url: 'https://www.co188.com', desc: '土木工程论坛', tags: ['土木', '工程', '论坛'], detail: '土木工程专业人士的交流论坛，提供技术讨论和资源分享。', logo: '' }
                    ]
                }
            }
        }
    },
    ai: {
        name: 'AI类导航',
        categories: {
            ai_tools: {
                name: 'AI工具',
                subCategories: [
                    { id: 'chat', name: 'AI聊天' },
                    { id: 'image', name: 'AI绘画' },
                    { id: 'video', name: 'AI视频' },
                    { id: 'code', name: 'AI编程' },
                    { id: 'audio', name: 'AI音频' }
                ],
                websites: {
                    chat: [
                        { name: 'ChatGPT', url: 'https://chat.openai.com', desc: 'OpenAI聊天机器人', tags: ['AI', '聊天', 'OpenAI'], detail: 'OpenAI开发的先进聊天机器人，能够生成自然语言回复。', logo: '' },
                        { name: '文心一言', url: 'https://yiyan.baidu.com', desc: '百度文心一言', tags: ['AI', '聊天', '百度'], detail: '百度开发的AI聊天机器人，支持多种语言和任务。', logo: '' },
                        { name: '豆包', url: 'https://www.doubao.com', desc: '字节跳动豆包', tags: ['AI', '聊天', '字节'], detail: '字节跳动开发的AI聊天机器人，提供智能对话服务。', logo: '' }
                    ],
                    image: [
                        { name: 'MidJourney', url: 'https://www.midjourney.com', desc: 'AI绘画工具', tags: ['AI', '绘画', '图像'], detail: '生成高质量AI图像的工具，支持多种风格。', logo: '' },
                        { name: 'Stable Diffusion', url: 'https://stability.ai/stable-diffusion', desc: '开源AI绘画', tags: ['AI', '绘画', '开源'], detail: '开源的AI绘画模型，支持本地部署和自定义训练。', logo: '' },
                        { name: 'DALL-E', url: 'https://openai.com/dall-e-3', desc: 'OpenAI图像生成', tags: ['AI', '绘画', 'OpenAI'], detail: 'OpenAI开发的AI图像生成模型，能够根据文字描述生成图像。', logo: '' }
                    ],
                    video: [
                        { name: 'Runway ML', url: 'https://runwayml.com', desc: 'AI视频编辑', tags: ['AI', '视频', '编辑'], detail: 'AI驱动的视频编辑工具，提供多种智能视频生成功能。', logo: '' },
                        { name: 'Pika Labs', url: 'https://pika.art', desc: 'AI视频生成', tags: ['AI', '视频', '生成'], detail: '能够根据文字或图像生成视频内容的AI工具。', logo: '' },
                        { name: 'Synthesia', url: 'https://www.synthesia.io', desc: 'AI数字人', tags: ['AI', '视频', '数字人'], detail: '生成AI数字人视频的工具，支持多种语言和场景。', logo: '' }
                    ],
                    code: [
                        { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', desc: 'AI编程助手', tags: ['AI', '编程', 'GitHub'], detail: 'GitHub推出的AI编程助手，能够自动生成代码。', logo: '' },
                        { name: 'Codeium', url: 'https://codeium.com', desc: 'AI代码生成', tags: ['AI', '编程', '生成'], detail: '支持多种编程语言的AI代码生成工具。', logo: '' },
                        { name: 'Tabnine', url: 'https://www.tabnine.com', desc: 'AI代码补全', tags: ['AI', '编程', '补全'], detail: '智能代码补全工具，提高编程效率。', logo: '' }
                    ],
                    audio: [
                        { name: 'Descript', url: 'https://www.descript.com', desc: 'AI音频编辑', tags: ['AI', '音频', '编辑'], detail: 'AI驱动的音频编辑工具，支持语音转文字和智能编辑。', logo: '' },
                        { name: 'ElevenLabs', url: 'https://elevenlabs.io', desc: 'AI语音生成', tags: ['AI', '音频', '语音'], detail: '生成高质量AI语音的工具，支持多种语言和音色。', logo: '' },
                        { name: 'Adobe Podcast', url: 'https://podcast.adobe.com', desc: 'AI podcast工具', tags: ['AI', '音频', '播客'], detail: 'Adobe推出的AI播客制作工具，提供智能音频处理功能。', logo: '' }
                    ]
                }
            },
            ai_platforms: {
                name: 'AI平台',
                subCategories: [
                    { id: 'cloud', name: '云AI服务' },
                    { id: 'open', name: '开源框架' },
                    { id: 'research', name: 'AI研究' },
                    { id: 'education', name: 'AI教育' },
                    { id: 'community', name: 'AI社区' }
                ],
                websites: {
                    cloud: [
                        { name: 'Azure AI', url: 'https://azure.microsoft.com/en-us/services/ai', desc: '微软Azure AI', tags: ['AI', '云服务', '微软'], detail: '微软Azure云平台提供的AI服务，包括机器学习、计算机视觉等。', logo: '' },
                        { name: 'Google AI', url: 'https://ai.google', desc: '谷歌AI平台', tags: ['AI', '云服务', '谷歌'], detail: '谷歌云平台提供的AI服务和工具。', logo: '' },
                        { name: '阿里云AI', url: 'https://ai.aliyun.com', desc: '阿里云AI', tags: ['AI', '云服务', '阿里'], detail: '阿里云提供的AI服务，包括语音识别、自然语言处理等。', logo: '' }
                    ],
                    open: [
                        { name: 'TensorFlow', url: 'https://www.tensorflow.org', desc: 'Google开源框架', tags: ['AI', '开源', '框架'], detail: 'Google开发的开源机器学习框架，广泛用于AI开发。', logo: '' },
                        { name: 'PyTorch', url: 'https://pytorch.org', desc: 'Facebook开源框架', tags: ['AI', '开源', '框架'], detail: 'Facebook开发的开源机器学习框架，深受研究者喜爱。', logo: '' },
                        { name: 'Hugging Face', url: 'https://huggingface.co', desc: 'AI模型库', tags: ['AI', '开源', '模型'], detail: '提供大量预训练AI模型的平台，支持多种任务。', logo: '' }
                    ],
                    research: [
                        { name: 'arXiv', url: 'https://arxiv.org', desc: '预印本平台', tags: ['AI', '研究', '学术'], detail: '发布AI和计算机科学领域预印本论文的平台。', logo: '' },
                        { name: 'OpenAI Research', url: 'https://openai.com/research', desc: 'OpenAI研究', tags: ['AI', '研究', 'OpenAI'], detail: 'OpenAI发布的最新研究成果和论文。', logo: '' },
                        { name: 'DeepMind Research', url: 'https://deepmind.com/research', desc: 'DeepMind研究', tags: ['AI', '研究', 'DeepMind'], detail: 'DeepMind发布的AI研究成果和论文。', logo: '' }
                    ],
                    education: [
                        { name: 'Fast.ai', url: 'https://www.fast.ai', desc: 'AI速成课程', tags: ['AI', '教育', '课程'], detail: '提供实用AI课程的平台，适合快速入门。', logo: '' },
                        { name: 'Coursera AI', url: 'https://www.coursera.org/courses?query=ai', desc: 'Coursera AI课程', tags: ['AI', '教育', 'Coursera'], detail: 'Coursera平台上的AI相关课程，来自全球顶尖大学。', logo: '' },
                        { name: 'Stanford CS229', url: 'https://cs229.stanford.edu', desc: '机器学习课程', tags: ['AI', '教育', '斯坦福'], detail: '斯坦福大学经典的机器学习课程，由Andrew Ng教授主讲。', logo: '' }
                    ],
                    community: [
                        { name: 'Reddit AI', url: 'https://www.reddit.com/r/artificial/', desc: 'AI社区', tags: ['AI', '社区', '讨论'], detail: 'Reddit上的AI讨论社区，涵盖最新AI资讯和研究。', logo: '' },
                        { name: 'AI Hub', url: 'https://aihub.cloud.google.com', desc: 'AI资源中心', tags: ['AI', '社区', '资源'], detail: '谷歌AI资源中心，提供数据集、模型和教程。', logo: '' },
                        { name: '机器之心', url: 'https://www.jiqizhixin.com', desc: 'AI媒体', tags: ['AI', '社区', '资讯'], detail: '国内知名的AI媒体平台，提供最新AI资讯和深度报道。', logo: '' }
                    ]
                }
            }
        }
    },
    design: {
        name: '设计类导航',
        categories: {
            graphic: {
                name: '平面设计',
                subCategories: [
                    { id: 'tools', name: '设计工具' },
                    { id: 'materials', name: '设计素材' },
                    { id: 'templates', name: '设计模板' },
                    { id: 'fonts', name: '字体资源' },
                    { id: 'colors', name: '色彩工具' }
                ],
                websites: {
                    tools: [
                        { name: 'Adobe Photoshop', url: 'https://www.adobe.com/products/photoshop.html', desc: '专业图像处理', tags: ['设计', '平面', 'Adobe'], detail: 'Adobe推出的专业图像处理软件，是平面设计的行业标准。', logo: '' },
                        { name: 'Adobe Illustrator', url: 'https://www.adobe.com/products/illustrator.html', desc: '矢量图形设计', tags: ['设计', '矢量', 'Adobe'], detail: 'Adobe推出的专业矢量图形设计软件。', logo: '' },
                        { name: 'CorelDRAW', url: 'https://www.coreldraw.com', desc: '图形设计软件', tags: ['设计', '平面', 'Corel'], detail: 'Corel推出的图形设计软件，支持矢量和位图编辑。', logo: '' }
                    ],
                    materials: [
                        { name: 'Freepik', url: 'https://www.freepik.com', desc: '免费设计素材', tags: ['设计', '素材', '免费'], detail: '提供大量免费设计素材的网站，包括矢量图、图片和模板。', logo: '' },
                        { name: 'Pexels', url: 'https://www.pexels.com', desc: '免费图片素材', tags: ['设计', '素材', '图片'], detail: '提供高质量免费图片素材的网站，支持商业使用。', logo: '' },
                        { name: 'Pixabay', url: 'https://pixabay.com', desc: '免费素材平台', tags: ['设计', '素材', '综合'], detail: '提供免费图片、矢量图、插画和视频素材的平台。', logo: '' }
                    ],
                    templates: [
                        { name: 'Canva Templates', url: 'https://www.canva.com/templates/', desc: '设计模板', tags: ['设计', '模板', 'Canva'], detail: 'Canva平台上的大量设计模板，适合快速制作设计作品。', logo: '' },
                        { name: 'TemplateMonster', url: 'https://www.templatemonster.com', desc: '网站模板', tags: ['设计', '模板', '网站'], detail: '提供网站模板和设计素材的平台，适合快速搭建网站。', logo: '' },
                        { name: 'Envato Elements', url: 'https://elements.envato.com', desc: '设计模板库', tags: ['设计', '模板', '订阅'], detail: '订阅制设计模板库，提供大量高质量设计资源。', logo: '' }
                    ],
                    fonts: [
                        { name: 'Google Fonts', url: 'https://fonts.google.com', desc: '免费字体库', tags: ['设计', '字体', '免费'], detail: 'Google提供的免费字体库，支持网页和桌面使用。', logo: '' },
                        { name: 'Adobe Fonts', url: 'https://fonts.adobe.com', desc: 'Adobe字体库', tags: ['设计', '字体', 'Adobe'], detail: 'Adobe提供的字体库，与Adobe软件深度集成。', logo: '' },
                        { name: 'Font Squirrel', url: 'https://www.fontsquirrel.com', desc: '免费商用字体', tags: ['设计', '字体', '商用'], detail: '提供免费商用字体的网站，适合商业项目使用。', logo: '' }
                    ],
                    colors: [
                        { name: 'Coolors', url: 'https://coolors.co', desc: '配色方案生成', tags: ['设计', '色彩', '工具'], detail: '生成配色方案的在线工具，支持多种配色规则。', logo: '' },
                        { name: 'Adobe Color', url: 'https://color.adobe.com', desc: 'Adobe配色工具', tags: ['设计', '色彩', 'Adobe'], detail: 'Adobe推出的配色工具，支持多种配色模式。', logo: '' },
                        { name: 'Paletton', url: 'https://paletton.com', desc: '配色方案设计', tags: ['设计', '色彩', '工具'], detail: '专业的配色方案设计工具，支持色彩理论。', logo: '' }
                    ]
                }
            },
            uiux: {
                name: 'UI/UX设计',
                subCategories: [
                    { id: 'tools', name: '设计工具' },
                    { id: 'inspiration', name: '设计灵感' },
                    { id: 'components', name: '组件库' },
                    { id: 'prototyping', name: '原型设计' },
                    { id: 'testing', name: '用户测试' }
                ],
                websites: {
                    tools: [
                        { name: 'Figma', url: 'https://www.figma.com', desc: 'UI设计工具', tags: ['设计', 'UI', '协作'], detail: '基于云的UI设计和协作工具，支持多人实时编辑。', logo: '' },
                        { name: 'Adobe XD', url: 'https://www.adobe.com/products/xd.html', desc: 'UI/UX设计', tags: ['设计', 'UI', 'Adobe'], detail: 'Adobe推出的UI/UX设计和原型工具。', logo: '' },
                        { name: 'Sketch', url: 'https://www.sketch.com', desc: 'Mac设计工具', tags: ['设计', 'UI', 'Mac'], detail: 'Mac平台上流行的UI设计工具，专为UI设计优化。', logo: '' }
                    ],
                    inspiration: [
                        { name: 'Dribbble', url: 'https://dribbble.com', desc: '设计灵感', tags: ['设计', 'UI', '灵感'], detail: '设计师分享作品的平台，是获取设计灵感的重要渠道。', logo: '' },
                        { name: 'Behance', url: 'https://www.behance.net', desc: '创意作品', tags: ['设计', 'UI', '创意'], detail: '展示创意作品的平台，涵盖多种设计领域。', logo: '' },
                        { name: 'UI8', url: 'https://ui8.net', desc: 'UI设计资源', tags: ['设计', 'UI', '资源'], detail: '提供高品质UI设计资源和灵感的平台。', logo: '' }
                    ],
                    components: [
                        { name: 'Material UI', url: 'https://mui.com', desc: 'React组件库', tags: ['设计', 'UI', '组件'], detail: '基于Material Design的React组件库，适合快速构建UI界面。', logo: '' },
                        { name: 'Ant Design', url: 'https://ant.design', desc: '企业级组件库', tags: ['设计', 'UI', '组件'], detail: '阿里推出的企业级UI组件库，支持React、Vue等框架。', logo: '' },
                        { name: 'Tailwind CSS', url: 'https://tailwindcss.com', desc: '实用优先CSS', tags: ['设计', 'UI', 'CSS'], detail: '实用优先的CSS框架，提供大量预定义样式类。', logo: '' }
                    ],
                    prototyping: [
                        { name: 'InVision', url: 'https://www.invisionapp.com', desc: '原型设计工具', tags: ['设计', '原型', '协作'], detail: '专业的原型设计和协作工具，支持多种交互效果。', logo: '' },
                        { name: 'Axure RP', url: 'https://www.axure.com', desc: '专业原型设计', tags: ['设计', '原型', '专业'], detail: '功能强大的专业原型设计工具，适合复杂交互设计。', logo: '' },
                        { name: 'Proto.io', url: 'https://proto.io', desc: '在线原型设计', tags: ['设计', '原型', '在线'], detail: '在线原型设计工具，支持多种设备和交互效果。', logo: '' }
                    ],
                    testing: [
                        { name: 'UserTesting', url: 'https://www.usertesting.com', desc: '用户测试平台', tags: ['设计', '测试', '用户'], detail: '提供真实用户测试服务的平台，帮助优化产品设计。', logo: '' },
                        { name: 'Hotjar', url: 'https://www.hotjar.com', desc: '网站行为分析', tags: ['设计', '测试', '分析'], detail: '分析网站用户行为的工具，提供热图和录屏功能。', logo: '' },
                        { name: 'Optimizely', url: 'https://www.optimizely.com', desc: 'A/B测试工具', tags: ['设计', '测试', '优化'], detail: '提供A/B测试和优化服务的平台，帮助提升转化率。', logo: '' }
                    ]
                }
            }
        }
    }
};

// 全局状态管理
let currentMainCategory = 'general';
let currentCategory = 'daily';
let currentSubCategory = 'office';

// DOM元素
const sidebar = document.querySelector('.sidebar');
const topNavItems = document.querySelectorAll('.top-nav-item');
const navItemsContainer = document.querySelector('.main-nav ul');
const subNavList = document.getElementById('subNavList');
const websiteGrid = document.getElementById('websiteGrid');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const themeToggle = document.getElementById('themeToggle');

// 获取网站图标URL
function getFaviconUrl(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (error) {
        return '';
    }
}

// 初始化页面
function init() {
    // 初始化主题
    initTheme();
    
    // 加载默认主类
    switchMainCategory('general');
    
    // 绑定事件
    bindEvents();
}

// 绑定事件
function bindEvents() {
    // 顶部主类导航点击事件
    topNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const mainCategory = item.dataset.mainCategory;
            switchMainCategory(mainCategory);
        });
    });
    
    // 移动端汉堡菜单事件
    hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    
    // 点击侧边栏外部关闭菜单
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
    
    // 键盘事件支持
    document.addEventListener('keydown', (e) => {
        // 全局快捷键
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'k':
                    e.preventDefault();
                    // 聚焦搜索框
                    document.querySelector('.search-box input').focus();
                    break;
            }
        } else {
            switch(e.key) {
                case '/':
                    e.preventDefault();
                    // 聚焦搜索框
                    document.querySelector('.search-box input').focus();
                    break;
                case 'Escape':
                    // 清空搜索或关闭侧边栏
                    if (document.querySelector('.search-box input').value) {
                        document.querySelector('.search-box input').value = '';
                        loadWebsites(currentCategory, currentSubCategory);
                    } else {
                        sidebar.classList.remove('open');
                    }
                    break;
                case 'ArrowLeft':
                    // 向左切换一级分类
                    switchCategoryByIndex(-1);
                    break;
                case 'ArrowRight':
                    // 向右切换一级分类
                    switchCategoryByIndex(1);
                    break;
                case 'ArrowUp':
                    // 向上切换二级分类
                    switchSubCategoryByIndex(-1);
                    break;
                case 'ArrowDown':
                    // 向下切换二级分类
                    switchSubCategoryByIndex(1);
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    // 数字键切换一级分类
                    e.preventDefault();
                    const categoryIndex = parseInt(e.key) - 1;
                    const categories = mainCategoryData[currentMainCategory].categories;
                    const categoryKeys = Object.keys(categories);
                    if (categoryIndex < categoryKeys.length) {
                        switchCategory(categoryKeys[categoryIndex]);
                    }
                    break;
            }
        }
    });
    
    // 主题切换按钮事件
    themeToggle.addEventListener('click', () => {
        toggleTheme();
    });
    
    // 搜索框键盘事件
    const searchInput = document.querySelector('.search-box input');
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // 清空搜索框内容并失去焦点
            searchInput.value = '';
            searchInput.blur();
            loadWebsites(currentCategory, currentSubCategory);
        }
    });
    
    // 添加无障碍支持，确保所有可交互元素可通过键盘访问
    document.querySelectorAll('button, [role="button"]').forEach(element => {
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'button');
    });
    
    // 搜索功能
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        if (keyword.trim()) {
            performSearch(keyword);
        } else {
            // 清空搜索，恢复正常显示
            loadWebsites(currentCategory, currentSubCategory);
        }
    });
    
    // 搜索功能实现
    function performSearch(keyword) {
        const allWebsites = [];
        
        // 遍历所有主类、一级分类和二级分类，收集所有网站
        const mainCategories = Object.keys(mainCategoryData);
        mainCategories.forEach(mainCat => {
            const categories = mainCategoryData[mainCat].categories;
            const categoryKeys = Object.keys(categories);
            categoryKeys.forEach(cat => {
                const subCategories = categories[cat].subCategories;
                subCategories.forEach(subCat => {
                    const websites = categories[cat].websites[subCat.id] || [];
                    websites.forEach(website => {
                        // 添加分类信息，方便搜索结果展示
                        allWebsites.push({
                            ...website,
                            mainCategory: mainCat,
                            category: cat,
                            subCategory: subCat.id
                        });
                    });
                });
            });
        });
        
        // 搜索匹配
        const results = allWebsites.filter(website => {
            return (
                website.name.toLowerCase().includes(keyword) ||
                website.desc.toLowerCase().includes(keyword) ||
                website.url.toLowerCase().includes(keyword) ||
                (website.tags && website.tags.some(tag => tag.toLowerCase().includes(keyword))) ||
                (website.detail && website.detail.toLowerCase().includes(keyword))
            );
        });
        
        // 显示搜索结果
        displaySearchResults(results, keyword);
    }
    
    // 显示搜索结果
    function displaySearchResults(results, keyword) {
        // 清空现有内容
        websiteGrid.innerHTML = '';
        
        if (results.length === 0) {
            // 显示无结果提示
            const noResults = document.createElement('div');
            noResults.style.textAlign = 'center';
            noResults.style.padding = '40px 0';
            noResults.innerHTML = `
                <i class="fas fa-search" style="font-size: 48px; color: #9ca3af; margin-bottom: 16px;"></i>
                <p style="font-size: 16px; color: #6b7280;">未找到匹配的网站</p>
                <p style="font-size: 14px; color: #9ca3af; margin-top: 8px;">请尝试其他关键词</p>
            `;
            websiteGrid.appendChild(noResults);
            return;
        }
        
        // 生成搜索结果卡片
        results.forEach(website => {
            const card = document.createElement('div');
            card.className = 'website-card';
            
            // 获取网站图标
            const faviconUrl = getFaviconUrl(website.url);
            
            // 生成标签HTML
            const tagsHtml = website.tags ? website.tags.map(tag => `<span class="website-tag">${tag}</span>`).join('') : '';
            
            card.innerHTML = `
                <div class="website-header">
                    <div class="website-logo">
                        ${faviconUrl ? `<img src="${faviconUrl}" alt="${website.name} logo">` : website.logo || '🌐'}
                    </div>
                    <div class="website-info">
                        <h4>${highlightKeyword(website.name, keyword)}</h4>
                        <p>${website.url}</p>
                    </div>
                </div>
                ${tagsHtml ? `<div class="website-tags">${tagsHtml}</div>` : ''}
                <p class="website-desc">${highlightKeyword(website.desc, keyword)}</p>
                ${website.detail ? `<p class="website-detail">${highlightKeyword(website.detail, keyword)}</p>` : ''}
            `;
            
            // 卡片点击事件
            card.addEventListener('click', () => {
                window.open(website.url, '_blank');
            });
            
            websiteGrid.appendChild(card);
        });
    }
    
    // 关键词高亮
    function highlightKeyword(text, keyword) {
        if (!keyword) return text;
        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.replace(regex, '<span style="background-color: #fef3c7; color: #92400e; font-weight: 500;">$1</span>');
    }
}

// 切换主类导航
function switchMainCategory(mainCategory) {
    // 更新顶部主类导航状态
    topNavItems.forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-main-category="${mainCategory}"]`).classList.add('active');
    
    // 更新当前主类
    currentMainCategory = mainCategory;
    
    // 重新生成左侧一级导航
    generateMainNav(mainCategory);
    
    // 关闭移动端菜单
    sidebar.classList.remove('open');
}

// 生成左侧一级导航
function generateMainNav(mainCategory) {
    const categories = mainCategoryData[mainCategory].categories;
    const categoryKeys = Object.keys(categories);
    
    // 清空现有导航
    navItemsContainer.innerHTML = '';
    
    // 生成新的一级导航
    categoryKeys.forEach(categoryKey => {
        const category = categories[categoryKey];
        const li = document.createElement('li');
        li.className = `nav-item ${categoryKey === currentCategory ? 'active' : ''}`;
        li.dataset.category = categoryKey;
        li.innerHTML = `
            <i class="fas fa-chevron-right"></i>
            <span>${category.name}</span>
        `;
        
        // 绑定点击事件
        li.addEventListener('click', () => {
            switchCategory(categoryKey);
        });
        
        navItemsContainer.appendChild(li);
    });
    
    // 加载默认分类的二级导航和网站
    const firstCategory = categoryKeys[0];
    switchCategory(firstCategory);
}

// 切换一级分类
function switchCategory(category) {
    // 更新一级导航状态
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // 更新当前分类
    currentCategory = category;
    
    // 加载对应二级分类
    const categories = mainCategoryData[currentMainCategory].categories;
    const firstSubCategory = categories[category].subCategories[0].id;
    loadSubCategories(category);
    loadWebsites(category, firstSubCategory);
    
    // 关闭移动端菜单
    sidebar.classList.remove('open');
}

// 加载二级分类
function loadSubCategories(category) {
    const categories = mainCategoryData[currentMainCategory].categories;
    const subCategories = categories[category].subCategories;
    
    // 清空现有二级导航
    subNavList.innerHTML = '';
    
    // 生成新的二级导航
    subCategories.forEach(subCat => {
        const li = document.createElement('li');
        li.className = `sub-nav-item ${subCat.id === currentSubCategory ? 'active' : ''}`;
        li.dataset.subCategory = subCat.id;
        li.textContent = subCat.name;
        
        // 绑定点击事件
        li.addEventListener('click', () => {
            loadWebsites(category, subCat.id);
            updateSubNavActive(subCat.id);
        });
        
        subNavList.appendChild(li);
    });
}

// 更新二级导航激活状态
function updateSubNavActive(subCategory) {
    const subNavItems = document.querySelectorAll('.sub-nav-item');
    subNavItems.forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-sub-category="${subCategory}"]`).classList.add('active');
    currentSubCategory = subCategory;
}

// 加载网址列表
function loadWebsites(category, subCategory) {
    // 显示加载状态
    showLoadingState();
    
    // 模拟网络请求延迟，增强加载体验
    setTimeout(() => {
        const categories = mainCategoryData[currentMainCategory].categories;
        const websites = categories[category].websites[subCategory];
        
        // 清空现有内容
        websiteGrid.innerHTML = '';
        
        // 生成新的网址卡片
        websites.forEach(website => {
            const card = document.createElement('div');
            card.className = 'website-card';
            
            // 获取网站图标
            const faviconUrl = getFaviconUrl(website.url);
            
            // 生成标签HTML
            const tagsHtml = website.tags ? website.tags.map(tag => `<span class="website-tag">${tag}</span>`).join('') : '';
            
            card.innerHTML = `
                <div class="website-header">
                    <div class="website-logo">
                        ${faviconUrl ? `<img src="${faviconUrl}" alt="${website.name} logo">` : website.logo || '🌐'}
                    </div>
                    <div class="website-info">
                        <h4>${website.name}</h4>
                        <p>${website.url}</p>
                    </div>
                </div>
                ${tagsHtml ? `<div class="website-tags">${tagsHtml}</div>` : ''}
                <p class="website-desc">${website.desc}</p>
                ${website.detail ? `<p class="website-detail">${website.detail}</p>` : ''}
            `;
            
            // 卡片点击事件
            card.addEventListener('click', () => {
                window.open(website.url, '_blank');
            });
            
            websiteGrid.appendChild(card);
        });
        
        // 更新当前二级分类
        currentSubCategory = subCategory;
    }, 300);
}

// 显示加载状态
function showLoadingState() {
    websiteGrid.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">加载中...</p>
        </div>
    `;
}

// 通过索引切换一级分类
function switchCategoryByIndex(direction) {
    const categories = mainCategoryData[currentMainCategory].categories;
    const categoryKeys = Object.keys(categories);
    const currentIndex = categoryKeys.indexOf(currentCategory);
    let newIndex = (currentIndex + direction + categoryKeys.length) % categoryKeys.length;
    switchCategory(categoryKeys[newIndex]);
}

// 通过索引切换二级分类
function switchSubCategoryByIndex(direction) {
    const categories = mainCategoryData[currentMainCategory].categories;
    const subCategories = categories[currentCategory].subCategories;
    const currentIndex = subCategories.findIndex(sub => sub.id === currentSubCategory);
    let newIndex = (currentIndex + direction + subCategories.length) % subCategories.length;
    const newSubCategory = subCategories[newIndex].id;
    loadWebsites(currentCategory, newSubCategory);
    updateSubNavActive(newSubCategory);
}

// 主题切换功能

// 初始化主题
function initTheme() {
    // 从本地存储获取主题偏好，默认为浅色主题
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    document.body.setAttribute('data-theme', initialTheme);
    updateThemeIcon(initialTheme);
}

// 切换主题
function toggleTheme() {
    // 获取当前主题
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // 更新主题属性
    document.body.setAttribute('data-theme', newTheme);
    
    // 更新主题图标
    updateThemeIcon(newTheme);
    
    // 保存主题偏好到本地存储
    localStorage.setItem('theme', newTheme);
}

// 更新主题图标
function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        // 夜间模式显示太阳图标
        icon.className = 'fas fa-sun';
        themeToggle.setAttribute('aria-label', '切换到浅色模式');
    } else {
        // 浅色模式显示月亮图标
        icon.className = 'fas fa-moon';
        themeToggle.setAttribute('aria-label', '切换到深色模式');
    }
}

// 初始化
init();