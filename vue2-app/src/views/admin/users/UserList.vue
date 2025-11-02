<template>
  <div class="user-list">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <el-button type="primary" @click="createUser" class="add-btn">
        <i class="el-icon-plus"></i> 添加用户
      </el-button>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <div slot="header" class="filter-header">
        <span class="filter-title">筛选条件</span>
        <el-button 
          type="text" 
          @click="filterCollapsed = !filterCollapsed"
          class="collapse-btn"
        >
          <i :class="filterCollapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
          {{ filterCollapsed ? '展开' : '收起' }}
        </el-button>
      </div>
      
      <el-collapse-transition>
        <div v-show="!filterCollapsed" class="filter-content">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <div class="filter-fields">
              <el-form-item label="用户名">
                <el-input
                  v-model="searchForm.username"
                  placeholder="请输入用户名"
                  clearable
                  @keyup.enter.native="handleSearch"
                  class="search-input"
                />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input
                  v-model="searchForm.email"
                  placeholder="请输入邮箱"
                  clearable
                  @keyup.enter.native="handleSearch"
                  class="search-input"
                />
              </el-form-item>
              <el-form-item label="角色">
                <el-select v-model="searchForm.role" placeholder="请选择角色" clearable class="search-select">
                  <el-option
                    v-for="role in roles"
                    :key="role"
                    :label="getRoleText(role)"
                    :value="role"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="searchForm.status" placeholder="请选择状态" clearable class="search-select">
                  <el-option label="正常" value="active" />
                  <el-option label="禁用" value="inactive" />
                </el-select>
              </el-form-item>
            </div>
            <div class="search-actions">
              <el-button type="primary" @click="handleSearch" class="search-btn">
                <i class="el-icon-search"></i>
                <span>搜索</span>
              </el-button>
            </div>
          </el-form>
        </div>
      </el-collapse-transition>
    </el-card>

    <!-- 表格容器 -->
    <el-card class="table-card" shadow="never">
      <!-- 批量操作栏 -->
      <div v-if="selectedItems.length > 0" class="batch-actions-bar">
        <div class="batch-info">
          <i class="el-icon-info"></i>
          <span>已选择 <strong>{{ selectedItems.length }}</strong> 项</span>
        </div>
        <div class="batch-buttons">
          <el-button type="warning" size="small" @click="batchDisable" class="batch-btn">
            <i class="el-icon-remove-outline"></i> 批量禁用
          </el-button>
          <el-button type="success" size="small" @click="batchEnable" class="batch-btn">
            <i class="el-icon-check"></i> 批量启用
          </el-button>
          <el-button type="danger" size="small" @click="batchDelete" class="batch-btn">
            <i class="el-icon-delete"></i> 批量删除
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="filteredList"
        @selection-change="handleSelectionChange"
        class="user-table"
        :row-class-name="tableRowClassName"
        :header-cell-style="{ background: '#fafafa', color: '#606266', fontWeight: '500' }"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="60" align="center">
          <template slot-scope="scope">
            <span class="user-id">{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="avatar" label="头像" width="80" align="center">
          <template slot-scope="scope">
            <div class="avatar-container" @mouseenter="showUserCard(scope.row)" @mouseleave="hideUserCard">
              <img 
                v-if="scope.row.avatar && scope.row.avatar !== 'avatar'" 
                :src="getAvatarUrl(scope.row.avatar)" 
                alt="头像" 
                class="avatar-image"
                @error="handleAvatarError"
              />
              <i v-else class="el-icon-user avatar-placeholder"></i>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="120" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="username-text" :title="scope.row.username">{{ scope.row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="120" show-overflow-tooltip />
        <el-table-column prop="role" label="角色" width="100" align="center">
          <template slot-scope="scope">
            <el-tag 
              :class="['role-tag', `role-${scope.row.role}`]" 
              size="small"
              effect="light"
            >
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag 
              :class="['status-tag', `status-${scope.row.status}`]" 
              size="small"
              effect="light"
              @click.native="toggleUserStatus(scope.row)"
            >
              <i :class="scope.row.status === 'active' ? 'el-icon-check' : 'el-icon-close'"></i>
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="160" show-overflow-tooltip />
        <el-table-column prop="lastLoginTime" label="最后登录" width="160" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.lastLoginTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="loginCount" label="登录次数" width="100" align="center" />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-button size="mini" type="primary" @click="editUser(scope.row)" class="action-btn edit-btn">
                <i class="el-icon-edit"></i>
              </el-button>
              <el-dropdown @command="(command) => handleDropdownCommand(command, scope.row)" trigger="click">
                <el-button size="mini" class="action-btn more-btn">
                  <i class="el-icon-more"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="view">
                    <i class="el-icon-view"></i> 查看
                  </el-dropdown-item>
                  <el-dropdown-item 
                    :command="scope.row.status === 'active' ? 'disable' : 'enable'"
                    :class="scope.row.status === 'active' ? 'danger-item' : 'success-item'"
                  >
                    <i :class="scope.row.status === 'active' ? 'el-icon-remove-outline' : 'el-icon-check'"></i>
                    {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" class="danger-item">
                    <i class="el-icon-delete"></i> 删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页信息 -->
      <div class="pagination-info">
        <span class="total-info">共 <strong>{{ pagination.total }}</strong> 条用户记录</span>
      </div>
    </el-card>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination-component"
      />
    </div>

    <!-- 用户卡片悬浮提示 -->
    <div v-if="showUserCardTooltip" class="user-card-tooltip" :style="tooltipStyle">
      <div class="user-card-content">
        <img :src="getAvatarUrl(hoveredUser.avatar)" alt="头像" class="tooltip-avatar" v-if="hoveredUser.avatar && hoveredUser.avatar !== 'avatar'" />
        <i v-else class="el-icon-user tooltip-avatar-placeholder"></i>
        <div class="tooltip-info">
          <div class="tooltip-username">{{ hoveredUser.username }}</div>
          <div class="tooltip-email">{{ hoveredUser.email }}</div>
          <div class="tooltip-role">
            <el-tag :class="['tooltip-role-tag', `role-${hoveredUser.role}`]" size="mini">
              {{ getRoleText(hoveredUser.role) }}
            </el-tag>
            <el-tag :class="['tooltip-status-tag', `status-${hoveredUser.status}`]" size="mini">
              {{ getStatusText(hoveredUser.status) }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="userForm" :rules="rules" ref="userForm" label-width="80px">
        <!-- 头像上传 -->
        <el-form-item label="头像">
          <div class="avatar-upload-section">
            <div class="avatar-preview-wrapper">
              <img 
                v-if="userForm.avatar && userForm.avatar !== 'avatar'" 
                :src="getAvatarUrl(userForm.avatar)" 
                class="avatar-preview"
                alt="头像预览"
              />
              <i v-else class="el-icon-user avatar-placeholder-large"></i>
            </div>
            <div class="avatar-upload-buttons">
              <el-upload
                :action="getAvatarUploadAction()"
                :headers="getUploadHeaders()"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :on-success="handleAvatarUploadSuccess"
                :on-error="handleAvatarUploadError"
              >
                <el-button size="small" type="primary">上传头像</el-button>
              </el-upload>
              <el-button 
                v-if="userForm.avatar" 
                size="small" 
                type="danger" 
                @click="removeAvatar"
              >
                移除头像
              </el-button>
            </div>
          </div>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="userForm.role" placeholder="请选择角色">
                <el-option
                  v-for="role in roles"
                  :key="role"
                  :label="getRoleText(role)"
                  :value="role"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.profile.realName" placeholder="请输入真实姓名" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="userForm.profile.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="userForm.profile.birthday"
                type="date"
                placeholder="选择生日"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="地址" prop="address">
          <el-input v-model="userForm.profile.address" placeholder="请输入地址" />
        </el-form-item>

        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="userForm.profile.bio"
            type="textarea"
            :rows="3"
            placeholder="请输入个人简介"
          />
        </el-form-item>

        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 查看用户对话框 -->
    <el-dialog
      title="用户详情"
      :visible.sync="viewDialogVisible"
      width="800px"
    >
      <div v-if="currentUser" class="user-detail">
        <div class="user-header">
          <img :src="getAvatarUrl(currentUser.avatar)" alt="头像" class="user-avatar" />
          <div class="user-info">
            <h3>{{ currentUser.username }}</h3>
            <p>{{ currentUser.profile.realName }}</p>
            <el-tag :type="getRoleType(currentUser.role)" size="medium">
              {{ getRoleText(currentUser.role) }}
            </el-tag>
          </div>
        </div>
        
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
              <el-descriptions-item label="角色">{{ getRoleText(currentUser.role) }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{ getStatusText(currentUser.status) }}</el-descriptions-item>
              <el-descriptions-item label="注册时间">{{ currentUser.createTime }}</el-descriptions-item>
              <el-descriptions-item label="最后登录">{{ currentUser.lastLoginTime || '-' }}</el-descriptions-item>
              <el-descriptions-item label="登录次数">{{ currentUser.loginCount }}</el-descriptions-item>
              <el-descriptions-item label="性别">{{ currentUser.profile.gender === 'male' ? '男' : '女' }}</el-descriptions-item>
              <el-descriptions-item label="生日">{{ currentUser.profile.birthday }}</el-descriptions-item>
              <el-descriptions-item label="地址" :span="2">{{ currentUser.profile.address }}</el-descriptions-item>
              <el-descriptions-item label="个人简介" :span="2">{{ currentUser.profile.bio }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          
          <el-tab-pane label="活动日志" name="activity">
            <el-timeline>
              <el-timeline-item
                v-for="log in currentUser.activityLog"
                :key="log.id"
                :timestamp="log.time"
              >
                <p>{{ log.action }}</p>
                <p v-if="log.ip" class="log-ip">IP: {{ log.ip }}</p>
              </el-timeline-item>
            </el-timeline>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  data() {
    return {
      loading: false,
      filterCollapsed: false,
      searchForm: {
        username: '',
        email: '',
        role: '',
        status: ''
      },
      selectedItems: [],
      dialogVisible: false,
      viewDialogVisible: false,
      isEdit: false,
      currentUser: null,
      activeTab: 'basic',
      showUserCardTooltip: false,
      hoveredUser: {},
      tooltipStyle: {},
      userForm: {
        username: '',
        email: '',
        phone: '',
        role: 'user',
        password: '',
        avatar: '',
        profile: {
          realName: '',
          gender: 'male',
          birthday: '',
          address: '',
          bio: ''
        }
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    list() {
      return this.$store.getters['users/list']
    },
    roles() {
      return this.$store.getters['users/roles']
    },
    pagination() {
      return this.$store.getters['users/pagination']
    },
    filteredList() {
      let filtered = this.list
      
      if (this.searchForm.username) {
        filtered = filtered.filter(item => 
          item.username.toLowerCase().includes(this.searchForm.username.toLowerCase())
        )
      }
      
      if (this.searchForm.email) {
        filtered = filtered.filter(item => 
          item.email.toLowerCase().includes(this.searchForm.email.toLowerCase())
        )
      }
      
      if (this.searchForm.role) {
        filtered = filtered.filter(item => item.role === this.searchForm.role)
      }
      
      if (this.searchForm.status) {
        filtered = filtered.filter(item => item.status === this.searchForm.status)
      }
      
      return filtered
    },
    dialogTitle() {
      return this.isEdit ? '编辑用户' : '添加用户'
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      await this.$store.dispatch('users/fetchUsers')
      this.loading = false
    },
    handleSearch() {
      // 搜索逻辑在computed中实现
    },
    handleReset() {
      this.searchForm = {
        username: '',
        email: '',
        role: '',
        status: ''
      }
    },
    handleSelectionChange(selection) {
      this.selectedItems = selection
    },
    handleSizeChange(val) {
      this.$store.dispatch('users/fetchUsers', {
        pageSize: val,
        current: 1
      })
    },
    handleCurrentChange(val) {
      this.$store.dispatch('users/fetchUsers', {
        current: val
      })
    },
    createUser() {
      this.isEdit = false
      this.userForm = {
        username: '',
        email: '',
        phone: '',
        role: 'user',
        password: '',
        profile: {
          realName: '',
          gender: 'male',
          birthday: '',
          address: '',
          bio: ''
        }
      }
      this.dialogVisible = true
    },
    editUser(row) {
      this.isEdit = true
      this.userForm = {
        ...row,
        avatar: row.avatar || '',
        profile: { ...row.profile }
      }
      this.dialogVisible = true
    },
    async viewUser(row) {
      await this.$store.dispatch('users/fetchUserDetail', row.id)
      this.currentUser = this.$store.getters['users/detail']
      this.viewDialogVisible = true
    },
    async toggleUserStatus(row) {
      const newStatus = row.status === 'active' ? 'inactive' : 'active'
      const action = newStatus === 'active' ? '启用' : '禁用'
      
      try {
        await this.$confirm(`确定要${action}用户"${row.username}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await this.$store.dispatch('users/updateUserStatus', {
          id: row.id,
          status: newStatus
        })
        
        this.$message.success(`${action}成功`)
        this.fetchData()
      } catch (error) {
        // 用户取消操作
      }
    },
    async deleteUser(row) {
      try {
        await this.$confirm('确定要删除这个用户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.$store.dispatch('users/deleteUser', row.id)
        this.$message.success('删除成功')
        this.fetchData()
      } catch (error) {
        // 用户取消删除
      }
    },
    async batchDisable() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请选择要禁用的用户')
        return
      }
      
      try {
        await this.$confirm(`确定要禁用选中的 ${this.selectedItems.length} 个用户吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        for (const item of this.selectedItems) {
          await this.$store.dispatch('users/updateUserStatus', {
            id: item.id,
            status: 'inactive'
          })
        }
        
        this.$message.success('批量禁用成功')
        this.fetchData()
      } catch (error) {
        // 用户取消操作
      }
    },
    async batchEnable() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请选择要启用的用户')
        return
      }
      
      try {
        await this.$confirm(`确定要启用选中的 ${this.selectedItems.length} 个用户吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        for (const item of this.selectedItems) {
          await this.$store.dispatch('users/updateUserStatus', {
            id: item.id,
            status: 'active'
          })
        }
        
        this.$message.success('批量启用成功')
        this.fetchData()
      } catch (error) {
        // 用户取消操作
      }
    },
    async batchDelete() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请选择要删除的用户')
        return
      }
      
      try {
        await this.$confirm(`确定要删除选中的 ${this.selectedItems.length} 个用户吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        for (const item of this.selectedItems) {
          await this.$store.dispatch('users/deleteUser', item.id)
        }
        
        this.$message.success('批量删除成功')
        this.fetchData()
      } catch (error) {
        // 用户取消删除
      }
    },
    submitForm() {
      this.$refs.userForm.validate(async (valid) => {
        if (valid) {
          try {
            if (this.isEdit) {
              await this.$store.dispatch('users/updateUser', this.userForm)
              this.$message.success('更新成功')
            } else {
              await this.$store.dispatch('users/createUser', this.userForm)
              this.$message.success('创建成功')
            }
            this.dialogVisible = false
            // 刷新列表以显示更新的头像
            await this.fetchData()
          } catch (error) {
            console.error('[用户管理] 保存失败:', error)
            this.$message.error(error?.response?.data?.message || '操作失败')
          }
        }
      })
    },
    async handleDialogClose() {
      this.$refs.userForm.resetFields()
      // 关闭对话框后刷新列表，确保显示最新的头像（即使没有点击确定保存）
      // 因为头像上传接口已经直接更新了数据库
      await this.fetchData()
    },
    getRoleType(role) {
      const typeMap = {
        'admin': 'danger',
        'editor': 'warning',
        'user': 'success'
      }
      return typeMap[role] || 'info'
    },
    getRoleText(role) {
      const textMap = {
        'admin': '管理员',
        'editor': '编辑',
        'user': '用户'
      }
      return textMap[role] || role
    },
    getStatusType(status) {
      const typeMap = {
        'active': 'success',
        'inactive': 'danger'
      }
      return typeMap[status] || 'info'
    },
    getStatusText(status) {
      const textMap = {
        'active': '正常',
        'inactive': '禁用'
      }
      return textMap[status] || status
    },
    // 新增方法
    tableRowClassName({ rowIndex }) {
      return rowIndex % 2 === 1 ? 'even-row' : 'odd-row'
    },
    handleAvatarError(event) {
      console.error('[用户管理] 头像加载失败:', event.target.src)
      // 隐藏失败的图片，显示占位符
      event.target.style.display = 'none'
      // 查找并显示占位符图标
      const container = event.target.closest('.avatar-container')
      if (container) {
        const placeholder = container.querySelector('.avatar-placeholder')
        if (placeholder) {
          placeholder.style.display = 'inline-block'
        }
      }
    },
    getUploadHeaders() {
      // 使用与http.js相同的token key
      const token = localStorage.getItem('authToken') || this.$store.state.authToken
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
    getAvatarUploadAction() {
      // 如果正在编辑用户（有id），使用管理员接口为指定用户上传
      // 如果是创建新用户（没有id），使用个人接口（会上传到当前登录用户）
      if (this.isEdit && this.userForm && this.userForm.id) {
        return `/api/users/${this.userForm.id}/avatar`
      }
      return '/api/upload/avatar'
    },
    getAvatarUrl(avatar) {
      if (!avatar || avatar === 'avatar') return ''
      
      // 如果是DataURL(base64)，直接返回
      if (avatar.startsWith('data:image')) {
        return avatar
      }
      
      // 如果已经是完整URL，直接返回
      if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
        return avatar
      }
      
      // 如果是相对路径（如 /uploads/xxx），转换为完整URL
      if (avatar.startsWith('/uploads/')) {
        // 静态资源直接访问后端服务器
        return `http://localhost:3001${avatar}`
      }
      
      // 如果是其他以 / 开头的路径
      if (avatar.startsWith('/')) {
        return `http://localhost:3001${avatar}`
      }
      
      // 其他情况，尝试添加 /uploads 前缀
      return `http://localhost:3001/uploads/${avatar}`
    },
    beforeAvatarUpload(file) {
      const uploadAction = this.getAvatarUploadAction()
      console.log('[头像上传] 准备上传文件:', file.name)
      console.log('[头像上传] 文件大小:', (file.size / 1024 / 1024).toFixed(2) + 'MB')
      console.log('[头像上传] 上传接口:', uploadAction)
      console.log('[头像上传] 是否编辑模式:', this.isEdit)
      console.log('[头像上传] 用户ID:', this.userForm?.id)
      console.log('[头像上传] 请求头:', this.getUploadHeaders())
      
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件！')
        return false
      }
      if (!isLt5M) {
        this.$message.error('头像大小不能超过 5MB！')
        return false
      }
      return true
    },
    async handleAvatarUploadSuccess(response) {
      console.log('上传成功，响应数据:', response)
      // el-upload 会自动解析响应，response 已经是对象了
      if (response && response.success && response.avatarUrl) {
        this.userForm.avatar = response.avatarUrl
        console.log('设置头像URL:', response.avatarUrl)
        
        // 如果返回了完整的用户信息，同步更新表单
        if (response.user) {
          this.userForm = { ...this.userForm, ...response.user }
        }
        
        // 强制更新视图以确保头像预览立即显示
        this.$forceUpdate()
        
        // 注意：头像已经通过上传接口更新到数据库了
        // 所以即使不点击"确定"保存，头像也已经保存了
        // 这里只需要刷新列表即可显示新头像
        this.$message.success('头像上传成功！')
        
        // 如果是编辑模式，上传接口已经更新了数据库，立即刷新列表显示新头像
        if (this.isEdit && this.userForm.id) {
          console.log('[头像上传] 上传接口已更新数据库，刷新用户列表...')
          // 延迟一小段时间后刷新，确保数据库更新已完成
          setTimeout(async () => {
            await this.fetchData()
          }, 500)
        }
      } else {
        console.error('上传响应格式错误:', response)
        this.$message.error(response.message || '头像上传失败')
      }
    },
    handleAvatarUploadProgress(event) {
      console.log('[头像上传] 上传进度:', event.percent + '%')
    },
    handleAvatarUploadError(err) {
      console.error('[头像上传] 失败错误对象:', err)
      console.error('[头像上传] 错误响应:', err?.response)
      
      // el-upload 的错误处理
      // 注意：el-upload 的 on-error 接收的错误对象格式可能不同
      let errorMessage = '头像上传失败，请重试'
      
      // el-upload 可能返回 XMLHttpRequest 错误或字符串
      if (typeof err === 'string') {
        errorMessage = err
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.response) {
        // 如果有响应对象，说明是 HTTP 错误
        const status = err.response.status
        const data = err.response.data
        
        console.error('[头像上传] HTTP状态码:', status)
        console.error('[头像上传] 错误数据:', data)
        
        if (data?.message) {
          errorMessage = data.message
        } else if (status === 403) {
          errorMessage = '没有权限上传头像'
        } else if (status === 401) {
          errorMessage = '未登录或登录已过期，请重新登录'
        } else if (status === 404) {
          errorMessage = '用户不存在或接口不存在'
        } else if (status === 400) {
          errorMessage = data?.message || '请求参数错误'
        } else if (status === 500) {
          errorMessage = '服务器错误，请稍后重试'
        } else {
          errorMessage = `上传失败 (错误代码: ${status})`
        }
      }
      
      // 检查是否是网络错误
      if (!err) {
        errorMessage = '网络连接失败，请检查网络'
      }
      
      console.error('[头像上传] 最终错误消息:', errorMessage)
      console.error('[头像上传] 当前上传接口:', this.getAvatarUploadAction())
      console.error('[头像上传] 当前用户ID:', this.userForm?.id)
      
      this.$message.error(errorMessage)
    },
    async removeAvatar() {
      try {
        // 如果是编辑模式，需要立即更新数据库
        if (this.isEdit && this.userForm && this.userForm.id) {
          // 调用更新用户API，将头像设置为null
          const updateData = {
            ...this.userForm,
            avatar: null
          }
          
          console.log('[移除头像] 更新用户头像为null，用户ID:', this.userForm.id)
          await this.$store.dispatch('users/updateUser', updateData)
          
          // 更新表单数据
          this.userForm.avatar = null
          
          // 强制更新视图
          this.$forceUpdate()
          
          // 刷新列表显示
          setTimeout(async () => {
            await this.fetchData()
          }, 300)
          
          this.$message.success('头像已移除')
        } else {
          // 如果是创建新用户模式，只需清空表单字段
          this.userForm.avatar = ''
          this.$forceUpdate()
          this.$message.info('头像已移除')
        }
      } catch (error) {
        console.error('[移除头像] 移除失败:', error)
        this.$message.error(error?.response?.data?.message || '移除头像失败，请重试')
      }
    },
    showUserCard(user) {
      this.hoveredUser = user
      this.showUserCardTooltip = true
      // 简单的定位逻辑，实际项目中可以使用更精确的定位
      this.tooltipStyle = {
        position: 'fixed',
        top: '100px',
        right: '20px',
        zIndex: 9999
      }
    },
    hideUserCard() {
      this.showUserCardTooltip = false
      this.hoveredUser = {}
    },
    handleDropdownCommand(command, row) {
      switch (command) {
        case 'view':
          this.viewUser(row)
          break
        case 'enable':
          this.toggleUserStatus(row)
          break
        case 'disable':
          this.toggleUserStatus(row)
          break
        case 'delete':
          this.deleteUser(row)
          break
      }
    }
  }
}
</script>

<style scoped>
/* 页面整体布局 */
.user-list {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面标题区域 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.add-btn {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 筛选区域 */
.filter-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.collapse-btn {
  color: #909399;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background: #f5f7fa;
  color: #409eff;
}

.filter-content {
  padding: 8px 0;
}

.search-form {
  margin: 0;
  position: relative;
  padding-bottom: 50px; /* 为底部按钮留出空间 */
}

.filter-fields {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.search-form .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
}

.search-input,
.search-select {
  width: 200px;
  border-radius: 8px;
}

.search-actions {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 0;
}

.button-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}

.search-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 80px;
  gap: 6px;
}

.search-btn i {
  line-height: 1;
  vertical-align: middle;
}

.search-btn span {
  line-height: 1;
  vertical-align: middle;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(64, 158, 255, 0.3);
}

/* 重置按钮已移除 */

/* 表格容器 */
.table-card {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* 批量操作栏 */
.batch-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border-bottom: 1px solid #b3d8ff;
  margin: 0;
}

.batch-info {
  display: flex;
  align-items: center;
  color: #1890ff;
  font-size: 14px;
}

.batch-info i {
  margin-right: 8px;
  font-size: 16px;
}

.batch-buttons {
  display: flex;
  gap: 12px;
}

.batch-btn {
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.batch-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 表格样式 */
.user-table {
  font-size: 14px;
}

.user-table .el-table__row {
  height: 50px;
  transition: all 0.3s ease;
}

.user-table .el-table__row:hover {
  background: #f8f9fa !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-table .even-row {
  background: #fafafa;
}

.user-table .odd-row {
  background: #ffffff;
}

/* 用户ID样式 */
.user-id {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

/* 头像上传区域样式 */
.avatar-upload-section {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.avatar-preview-wrapper {
  flex-shrink: 0;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e4e7ed;
  display: block;
}

.avatar-placeholder-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e4e7ed;
}

.avatar-upload-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 20px;
}

/* 头像样式 */
.avatar-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.avatar-image:hover {
  border-color: #409eff;
  transform: scale(1.05);
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e4e7ed;
}

/* 用户名样式 */
.username-text {
  font-weight: 600;
  color: #303133;
  cursor: pointer;
  transition: color 0.3s ease;
}

.username-text:hover {
  color: #409eff;
}

/* 角色标签样式 */
.role-tag {
  border-radius: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border: none;
}

.role-admin {
  background: #fef2f2;
  color: #dc2626;
}

.role-editor {
  background: #fffbeb;
  color: #d97706;
}

.role-user {
  background: #f0fdf4;
  color: #16a34a;
}

/* 状态标签样式 */
.status-tag {
  border-radius: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-active {
  background: #f0fdf4;
  color: #16a34a;
}

.status-inactive {
  background: #f5f5f5;
  color: #6b7280;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  border-radius: 8px;
  padding: 6px 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  background: #409eff;
  color: white;
}

.edit-btn:hover {
  background: #337ecc;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
}

.more-btn {
  background: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.more-btn:hover {
  background: #ecf5ff;
  color: #409eff;
  border-color: #b3d8ff;
  transform: translateY(-1px);
}

/* 下拉菜单样式 */
.danger-item {
  color: #f56c6c !important;
}

.success-item {
  color: #67c23a !important;
}

/* 分页信息 */
.pagination-info {
  padding: 16px 20px;
  background: #fafafa;
  border-top: 1px solid #e4e7ed;
  text-align: left;
}

.total-info {
  color: #606266;
  font-size: 14px;
}

.total-info strong {
  color: #303133;
  font-weight: 600;
}

/* 分页组件 */
.pagination {
  margin-top: 24px;
  text-align: right;
  padding: 0 4px;
}

.pagination-component {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 用户卡片悬浮提示 */
.user-card-tooltip {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #e4e7ed;
  padding: 16px;
  min-width: 200px;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-card-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tooltip-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}

.tooltip-avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e4e7ed;
}

.tooltip-info {
  flex: 1;
}

.tooltip-username {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.tooltip-email {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.tooltip-role {
  display: flex;
  gap: 6px;
}

.tooltip-role-tag,
.tooltip-status-tag {
  border-radius: 8px;
  font-size: 10px;
  padding: 2px 6px;
  border: none;
}

/* 用户详情对话框样式 */
.user-detail .user-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
  border: 3px solid #f0f0f0;
}

.user-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.user-info p {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
}

.log-ip {
  color: #909399;
  font-size: 12px;
  margin: 5px 0 0 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-form .el-form-item {
    margin-right: 16px;
  }
  
  .search-input,
  .search-select {
    width: 180px;
  }
}

@media (max-width: 768px) {
  .user-list {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .filter-fields {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
  }
  
  .search-input,
  .search-select {
    width: 100%;
  }
  
  .search-actions {
    position: static;
    margin-top: 16px;
    text-align: left;
  }
  
  .button-group {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .batch-actions-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .batch-buttons {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .button-group {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .search-btn,
  .reset-btn {
    width: 100%;
    min-width: auto;
  }
}
</style>
