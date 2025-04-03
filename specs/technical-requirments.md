# 划词翻译插件技术需求文档

## 1. 技术栈选择

- **前端框架**：Vue 3 (使用 Composition API)
- **CSS 框架**：Tailwind CSS
- **图标库**：Heroicons
- **浏览器扩展框架**：WXT
- **构建工具**：Vite (通过 WXT 集成)
- **语言**：TypeScript
- **API 调用**：Fetch API / Axios
- **存储**：IndexedDB (本地存储)

## 2. 架构设计

### 2.1 扩展组件

1. **Background Script**
   - 处理扩展生命周期
   - 管理翻译服务配置
   - 处理跨组件通信

2. **Content Script**
   - 监听用户选中文本事件
   - 注入划词图标和翻译弹窗
   - 处理网页内生词高亮
   - 实现视口优先的高亮逻辑

3. **Popup**
   - 提供设置界面
   - 展示生词本
   - 提供翻译服务配置

4. **Options Page**
   - 高级设置和配置
   - 生词本管理
   - 翻译服务管理

### 2.2 数据结构

1. **生词存储结构**
```typescript
interface Vocabulary {
  id: string;             // 唯一标识
  word: string;           // 原单词/短语
  translation: string;    // 翻译结果
  context?: string;       // 上下文
  sourceUrl?: string;     // 来源网页
  createdAt: number;      // 添加时间戳
  reviewCount?: number;   // 复习次数
  notes?: string;         // 用户笔记
}
```

2. **翻译服务配置**
```typescript
interface TranslationService {
  id: string;             // 服务标识
  name: string;           // 显示名称
  type: 'api' | 'custom'; // 服务类型
  apiEndpoint?: string;   // API 端点
  apiKey?: string;        // API 密钥
  isDefault: boolean;     // 是否默认
  requestTemplate: string;// 请求模板
  responseParser: string; // 响应解析器
}
```

3. **用户设置**
```typescript
interface UserSettings {
  highlightEnabled: boolean;    // 是否启用高亮
  highlightColor: string;       // 高亮颜色
  defaultTranslationService: string;  // 默认翻译服务ID
  showTranslationIcon: boolean; // 是否显示翻译图标
  autoTranslate: boolean;       // 选中后自动翻译
  fontSize: string;             // 弹窗字体大小
  theme: 'light' | 'dark' | 'system'; // 界面主题
}
```

## 3. 模块实现规范

### 3.1 文本选择与图标展示

- 使用 `window.getSelection()` 监听文本选择事件
- 计算选中文本的位置，在附近创建浮动图标
- 图标使用 Lucide Icons，保持极简风格
- 图标应具有合适的触发区域，避免误触

### 3.2 翻译服务实现

- 创建统一的翻译服务接口
- 默认集成 DeepSeek API
- 支持用户通过配置添加自定义 API
- 实现翻译服务切换机制
- 处理 API 调用错误和超时

```typescript
// 翻译服务接口
interface TranslationProvider {
  translate(text: string, from?: string, to?: string): Promise<string>;
  name: string;
  icon: string;
}
```

### 3.3 生词本功能

- 使用 IndexedDB 实现本地存储生词数据
- 实现增删改查基本操作
- 支持数据导入/导出功能(JSON格式)
- 实现生词检索和过滤功能
- 使用索引优化生词查询性能

```typescript
// IndexedDB 数据库结构
interface VocabularyDB {
  name: string; // 数据库名称
  version: number; // 数据库版本
  stores: {
    vocabulary: { // 词汇表存储
      keyPath: 'id',
      indexes: ['word', 'createdAt'] // 建立索引以优化查询
    },
    settings: { // 设置存储
      keyPath: 'id'
    }
  }
}
```

### 3.4 网页生词高亮

- 使用 IntersectionObserver 监控视口内元素
- 实现视口优先的高亮策略，先处理可见区域的文本
- 使用 TreeWalker API 高效扫描文本节点
- 使用 Trie 数据结构存储生词，实现高效匹配
- 使用 CSS 自定义属性+虚拟DOM分批处理高亮渲染
- 使用 Web Workers 在后台线程处理文本匹配计算
- MutationObserver 监听DOM变化，动态更新高亮

```typescript
// 高亮管理器核心逻辑伪代码
class HighlightManager {
  constructor(vocabularyTrie, options) {
    this.vocabularyTrie = vocabularyTrie; // 生词Trie树
    this.options = options;
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
    this.mutationObserver = new MutationObserver(this.handleMutation.bind(this));
    this.worker = new Worker('highlight-worker.js'); // Web Worker处理文本匹配
  }

  // 初始化页面，设置观察器
  initialize(rootNode) {
    // 设置视口观察
    this.setupViewportObserver(rootNode);
    // 监听DOM变化
    this.setupMutationObserver(rootNode);
  }

  // 处理元素进入/离开视口
  handleIntersection(entries) {
    // 优先处理进入视口的元素
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.highlightElement(entry.target);
      }
    }
  }

  // 高亮特定元素中的生词
  highlightElement(element) {
    // 获取所有文本节点
    const textNodes = this.getTextNodes(element);

    // 将文本节点分批发送给Worker处理
    this.processTextNodesInBatches(textNodes);
  }

  // 分批处理文本节点，避免阻塞主线程
  processTextNodesInBatches(textNodes, batchSize = 10) {
    // 实现分批处理逻辑
  }
}
```

### 3.5 UI 设计实现

- 使用 Tailwind CSS 实现所有样式
- 不使用任何组件库，纯自定义实现
- 遵循极简设计原则
- 确保界面响应式，适应不同尺寸
- 实现浅色/深色模式切换

## 4. 性能与优化要求

- 内容脚本体积控制在 100KB 以内
- 翻译请求应实现缓存机制，避免重复请求
- 生词高亮使用分层渲染策略：
  1. 第一层：仅处理视口内元素(100ms内完成)
  2. 第二层：处理视口外但在可滚动范围内的元素(在用户空闲时)
  3. 第三层：处理初始未加载的动态内容(监听DOM变化)
- 使用 requestIdleCallback 和 requestAnimationFrame 调度非紧急任务
- 实现虚拟化列表展示大量生词
- 使用 Web Workers 并行处理文本匹配和高亮计算
- 使用节流(Throttle)和防抖(Debounce)优化滚动和选择事件

## 5. 安全性考虑

- API 密钥应使用安全的存储方式
- 实现 Content Security Policy
- 最小权限原则申请浏览器权限
- 避免使用 innerHTML 等可能导致 XSS 的方法
- 所有用户输入必须经过验证和清洁
- IndexedDB 数据应使用结构化克隆算法处理，避免原型污染

## 6. 测试要求

- 单元测试：覆盖核心功能和工具函数
- 组件测试：针对 Vue 组件
- 端到端测试：模拟用户操作
- 性能测试：确保不影响网页加载速度
  - 高亮性能基准：1000个生词在包含5000个文本节点的页面上，视口内高亮时间不超过100ms
  - 内存使用基准：处理大型页面时内存增长不超过50MB
- 兼容性测试：支持 Chrome 最近三个主要版本

## 7. 部署与发布流程

- 使用 GitHub Actions 实现 CI/CD
- 版本号遵循语义化版本规范
- 生成详细的变更日志
- 打包生成 Chrome 商店发布格式
- 实现自动化测试和构建流程