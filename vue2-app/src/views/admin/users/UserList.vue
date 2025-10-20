<template>
  <div class="user-list">
    <el-card>
      <div slot="header" class="card-header">
        <span>用户管理</span>
        <el-button type="primary" @click="createUser">
          <i class="el-icon-plus"></i> 添加用户
        </el-button>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filter-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              @keyup.enter.native="handleSearch"
            />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input
              v-model="searchForm.email"
              placeholder="请输入邮箱"
              clearable
              @keyup.enter.native="handleSearch"
            />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
              <el-option
                v-for="role in roles"
                :key="role"
                :label="getRoleText(role)"
                :value="role"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="正常" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="filteredList"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template slot-scope="scope">
            <img :src="scope.row.avatar" alt="头像" class="avatar-image" />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template slot-scope="scope">
            <el-tag :type="getRoleType(scope.row.role)" size="small">
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="160" />
        <el-table-column prop="lastLoginTime" label="最后登录" width="160">
          <template slot-scope="scope">
            {{ scope.row.lastLoginTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="loginCount" label="登录次数" width="100" />
        <el-table-column label="操作" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewUser(scope.row)">查看</el-button>
            <el-button size="mini" type="primary" @click="editUser(scope.row)">编辑</el-button>
            <el-button 
              size="mini" 
              :type="scope.row.status === 'active' ? 'warning' : 'success'"
              @click="toggleUserStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="mini" type="danger" @click="deleteUser(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div v-if="selectedItems.length > 0" class="batch-actions">
        <span>已选择 {{ selectedItems.length }} 项</span>
        <el-button type="warning" size="small" @click="batchDisable">批量禁用</el-button>
        <el-button type="success" size="small" @click="batchEnable">批量启用</el-button>
        <el-button type="danger" size="small" @click="batchDelete">批量删除</el-button>
      </div>

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
        />
      </div>
    </el-card>

    <!-- 创建/编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="userForm" :rules="rules" ref="userForm" label-width="80px">
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
          <img :src="currentUser.avatar" alt="头像" class="user-avatar" />
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
      userForm: {
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
            this.fetchData()
          } catch (error) {
            this.$message.error('操作失败')
          }
        }
      })
    },
    handleDialogClose() {
      this.$refs.userForm.resetFields()
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
    }
  }
}
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.search-form {
  margin: 0;
}

.batch-actions {
  margin: 20px 0;
  padding: 10px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-detail .user-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
}

.user-info h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.user-info p {
  margin: 0 0 10px 0;
  color: #606266;
}

.log-ip {
  color: #909399;
  font-size: 12px;
  margin: 5px 0 0 0;
}
</style>
