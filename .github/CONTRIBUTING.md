# 贡献指南

感谢你对 TrendMonitor (热搜哨兵) 项目的关注！我们欢迎任何形式的贡献。

## 🤝 如何贡献

### 报告 Bug

如果你发现了 bug，请：

1. 检查 [Issues](https://github.com/your-username/hotsearch-monitor/issues) 是否已有相同问题
2. 如果没有，创建一个新的 Issue，使用 [Bug 反馈模板](.github/ISSUE_TEMPLATE/bug_report.md)
3. 提供详细的问题描述、复现步骤和环境信息

### 提出新功能

1. 先在 [Discussions](https://github.com/your-username/hotsearch-monitor/discussions) 中讨论你的想法
2. 创建 Issue，使用 [功能请求模板](.github/ISSUE_TEMPLATE/feature_request.md)
3. 等待维护者反馈

### 提交代码

1. **Fork 项目**
   ```bash
   git clone https://github.com/your-username/hotsearch-monitor.git
   ```

2. **创建特性分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **进行更改**
   - 遵循现有的代码风格
   - 添加必要的测试
   - 更新相关文档

4. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add some feature"
   ```

   提交信息格式参考：[约定式提交](https://www.conventionalcommits.org/zh-hans/)
   - `feat:` 新功能
   - `fix:` Bug 修复
   - `docs:` 文档更新
   - `style:` 代码格式调整
   - `refactor:` 代码重构
   - `perf:` 性能优化
   - `test:` 测试相关
   - `chore:` 构建/工具更新

5. **推送到分支**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **创建 Pull Request**
   - 访问 GitHub 上的项目页面
   - 点击 "New Pull Request"
   - 使用 [PR 模板](.github/pull_request_template.md) 描述你的更改

## 📋 代码规范

### TypeScript

- 使用类型注解
- 避免使用 `any` 类型
- 接口优先于类型别名

### React 组件

```typescript
// ✅ 好的做法
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // ...
};

// ❌ 不好的做法
function MyComponent({ prop1, prop2 }) {
  // ...
}
```

### 样式规范

- 优先使用 Tailwind CSS 工具类
- 避免内联样式
- 使用 CSS 变量定义全局样式

### 命名规范

- 组件文件使用 PascalCase: `MyComponent.tsx`
- 工具函数使用 camelCase: `myFunction.ts`
- 常量使用 UPPER_SNAKE_CASE: `MY_CONSTANT`
- 接口/类型使用 PascalCase: `MyType`

## 🧪 测试

在提交 PR 之前，请确保：

- [ ] 前端代码通过 `npm run lint` 检查
- [ ] 后端代码通过 `npm run lint` 检查
- [ ] 新功能有相应的测试覆盖
- [ ] 现有测试全部通过

## 📝 文档

如果你的更改影响了用户使用方式，请确保：

- [ ] 更新了 README.md
- [ ] 更新了相关组件的注释
- [ ] 更新了 API 文档（如适用）

## 💬 讨论

对于需要讨论的问题，请使用 GitHub Discussions 而不是 Issue。

## 📧 联系方式

如有任何问题，请通过以下方式联系：

- 创建 [GitHub Issue](https://github.com/your-username/hotsearch-monitor/issues)
- 发送邮件至：[项目维护者邮箱]

再次感谢你的贡献！🎉
