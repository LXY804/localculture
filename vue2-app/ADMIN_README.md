# 后台管理系统使用说明

## 功能概述

本后台管理系统基于Vue 2 + Element UI构建，包含以下主要功能模块：

### 1. 仪表盘 (Dashboard)
- 数据概览统计
- 图表分析（公告趋势、用户增长等）
- 最新通知
- 待办事项

### 2. 内容管理
#### 公告管理
- 公告列表查看
- 发布新公告
- 编辑现有公告
- 删除公告

#### 文章管理
- 文章列表查看
- 发布新文章
- 编辑现有文章
- 文章审核（通过/驳回）
- 批量删除文章
- 按状态筛选文章

### 3. 用户管理
- 用户列表查看
- 新增用户
- 编辑用户信息
- 删除用户
- 按角色筛选用户
- 批量删除用户

### 4. 系统设置
#### 系统配置
- 网站名称设置
- Logo上传
- ICP备案号配置
- 外部链接管理
- 功能模块开关

#### 个人设置
- 头像管理
- 昵称设置
- 邮箱配置
- 两步验证开关
- 操作日志查看

## 技术架构

- **前端框架**: Vue 2.6.11
- **UI组件库**: Element UI
- **状态管理**: Vuex
- **路由管理**: Vue Router
- **构建工具**: Vue CLI

## 访问方式

1. 启动开发服务器：
   ```bash
   npm run serve
   ```

2. 访问地址：
   - 前台页面：http://localhost:8080
   - 后台管理：http://localhost:8080/#/admin

3. 登录要求：
   - 需要管理员权限（role: 'admin'）
   - 当前默认用户：admin/admin

## 目录结构

```
src/
├── components/
│   └── layout/
│       └── AdminLayout.vue          # 后台管理布局组件
├── views/
│   └── admin/
│       ├── dashboard/
│       │   └── Dashboard.vue        # 仪表盘
│       ├── announcements/
│       │   └── AnnouncementList.vue # 公告管理
│       ├── articles/
│       │   └── ArticleList.vue      # 文章管理
│       ├── users/
│       │   └── UserList.vue         # 用户管理
│       └── settings/
│           ├── SystemConfig.vue     # 系统配置
│           └── PersonalSettings.vue # 个人设置
├── store/
│   └── modules/
│       ├── dashboard.js             # 仪表盘状态管理
│       ├── announcements.js         # 公告状态管理
│       ├── articles.js              # 文章状态管理
│       ├── users.js                 # 用户状态管理
│       └── settings.js              # 设置状态管理
└── router/
    └── index.js                     # 路由配置
```

## 主要特性

1. **响应式设计**: 适配不同屏幕尺寸
2. **权限控制**: 基于角色的访问控制
3. **数据管理**: 完整的CRUD操作
4. **状态管理**: 集中式状态管理
5. **组件化**: 可复用的UI组件
6. **路由守卫**: 自动权限验证

## 开发说明

### 添加新功能模块

1. 在 `src/store/modules/` 下创建对应的Vuex模块
2. 在 `src/views/admin/` 下创建对应的页面组件
3. 在 `src/router/index.js` 中添加路由配置
4. 在 `AdminLayout.vue` 中添加菜单项

### 数据模拟

当前使用模拟数据进行开发，所有API调用都返回模拟数据。在实际项目中，需要替换为真实的API接口。

## 注意事项

1. 确保已安装所有依赖：`npm install`
2. 确保Node.js版本 >= 12
3. 开发时建议使用Chrome浏览器
4. 生产环境部署前请运行 `npm run build`
