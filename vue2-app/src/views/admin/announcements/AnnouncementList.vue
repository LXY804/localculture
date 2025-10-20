<template>
  <div class="announcement-list">
    <el-card>
      <div slot="header" class="card-header">
        <span>公告管理</span>
        <el-button type="primary" @click="createAnnouncement">
          <i class="el-icon-plus"></i> 发布公告
        </el-button>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filter-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="标题">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入公告标题"
              clearable
              @keyup.enter.native="handleSearch"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
              <el-option
                v-for="category in categories"
                :key="category"
                :label="category"
                :value="category"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
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
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template slot-scope="scope">
            <el-tag :type="getCategoryType(scope.row.category)" size="small">
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="100" />
        <el-table-column prop="publishTime" label="发布时间" width="160">
          <template slot-scope="scope">
            {{ scope.row.publishTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="views" label="阅读量" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewAnnouncement(scope.row)">查看</el-button>
            <el-button size="mini" type="primary" @click="editAnnouncement(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteAnnouncement(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div v-if="selectedItems.length > 0" class="batch-actions">
        <span>已选择 {{ selectedItems.length }} 项</span>
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

    <!-- 创建/编辑公告对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form :model="announcementForm" :rules="rules" ref="announcementForm" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="announcementForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="announcementForm.category" placeholder="请选择分类">
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="announcementForm.priority">
            <el-radio label="normal">普通</el-radio>
            <el-radio label="high">重要</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="announcementForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="announcementForm.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 查看公告对话框 -->
    <el-dialog
      title="公告详情"
      :visible.sync="viewDialogVisible"
      width="600px"
    >
      <div v-if="currentAnnouncement" class="announcement-detail">
        <h3>{{ currentAnnouncement.title }}</h3>
        <div class="announcement-meta">
          <span>分类：{{ currentAnnouncement.category }}</span>
          <span>作者：{{ currentAnnouncement.author }}</span>
          <span>发布时间：{{ currentAnnouncement.publishTime || '-' }}</span>
          <span>阅读量：{{ currentAnnouncement.views }}</span>
        </div>
        <div class="announcement-content">
          {{ currentAnnouncement.content }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AnnouncementList',
  data() {
    return {
      loading: false,
      searchForm: {
        title: '',
        category: '',
        status: ''
      },
      selectedItems: [],
      dialogVisible: false,
      viewDialogVisible: false,
      isEdit: false,
      currentAnnouncement: null,
      announcementForm: {
        title: '',
        category: '',
        priority: 'normal',
        content: '',
        status: 'draft'
      },
      rules: {
        title: [
          { required: true, message: '请输入公告标题', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入公告内容', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    list() {
      return this.$store.getters['announcements/list']
    },
    categories() {
      return this.$store.getters['announcements/categories']
    },
    pagination() {
      return this.$store.getters['announcements/pagination']
    },
    filteredList() {
      let filtered = this.list
      
      if (this.searchForm.title) {
        filtered = filtered.filter(item => 
          item.title.toLowerCase().includes(this.searchForm.title.toLowerCase())
        )
      }
      
      if (this.searchForm.category) {
        filtered = filtered.filter(item => item.category === this.searchForm.category)
      }
      
      if (this.searchForm.status) {
        filtered = filtered.filter(item => item.status === this.searchForm.status)
      }
      
      return filtered
    },
    dialogTitle() {
      return this.isEdit ? '编辑公告' : '发布公告'
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      await this.$store.dispatch('announcements/fetchAnnouncements')
      this.loading = false
    },
    handleSearch() {
      // 搜索逻辑在computed中实现
    },
    handleReset() {
      this.searchForm = {
        title: '',
        category: '',
        status: ''
      }
    },
    handleSelectionChange(selection) {
      this.selectedItems = selection
    },
    handleSizeChange(val) {
      this.$store.dispatch('announcements/fetchAnnouncements', {
        pageSize: val,
        current: 1
      })
    },
    handleCurrentChange(val) {
      this.$store.dispatch('announcements/fetchAnnouncements', {
        current: val
      })
    },
    createAnnouncement() {
      this.isEdit = false
      this.announcementForm = {
        title: '',
        category: '',
        priority: 'normal',
        content: '',
        status: 'draft'
      }
      this.dialogVisible = true
    },
    editAnnouncement(row) {
      this.isEdit = true
      this.announcementForm = { ...row }
      this.dialogVisible = true
    },
    async viewAnnouncement(row) {
      await this.$store.dispatch('announcements/fetchAnnouncementDetail', row.id)
      this.currentAnnouncement = this.$store.getters['announcements/detail']
      this.viewDialogVisible = true
    },
    async deleteAnnouncement(row) {
      try {
        await this.$confirm('确定要删除这条公告吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.$store.dispatch('announcements/deleteAnnouncement', row.id)
        this.$message.success('删除成功')
        this.fetchData()
      } catch (error) {
        // 用户取消删除
      }
    },
    async batchDelete() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请选择要删除的公告')
        return
      }
      
      try {
        await this.$confirm(`确定要删除选中的 ${this.selectedItems.length} 条公告吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        for (const item of this.selectedItems) {
          await this.$store.dispatch('announcements/deleteAnnouncement', item.id)
        }
        
        this.$message.success('批量删除成功')
        this.fetchData()
      } catch (error) {
        // 用户取消删除
      }
    },
    submitForm() {
      this.$refs.announcementForm.validate(async (valid) => {
        if (valid) {
          try {
            if (this.isEdit) {
              await this.$store.dispatch('announcements/updateAnnouncement', this.announcementForm)
              this.$message.success('更新成功')
            } else {
              await this.$store.dispatch('announcements/createAnnouncement', this.announcementForm)
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
      this.$refs.announcementForm.resetFields()
    },
    getCategoryType(category) {
      const typeMap = {
        '系统公告': 'primary',
        '活动通知': 'success',
        '维护通知': 'warning',
        '其他': 'info'
      }
      return typeMap[category] || 'info'
    },
    getStatusType(status) {
      const typeMap = {
        'published': 'success',
        'draft': 'info'
      }
      return typeMap[status] || 'info'
    },
    getStatusText(status) {
      const textMap = {
        'published': '已发布',
        'draft': '草稿'
      }
      return textMap[status] || status
    }
  }
}
</script>

<style scoped>
.announcement-list {
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

.announcement-detail h3 {
  margin: 0 0 15px 0;
  color: #303133;
}

.announcement-meta {
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.announcement-meta span {
  margin-right: 20px;
}

.announcement-content {
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
}
</style>
