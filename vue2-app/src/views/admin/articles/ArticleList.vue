<template>
  <div class="article-list">
    <el-card>
      <div slot="header" class="card-header">
        <span>文章管理</span>
        <el-button type="primary" @click="createArticle">
          <i class="el-icon-plus"></i> 发布文章
        </el-button>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filter-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="标题">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入文章标题"
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
        <el-table-column prop="cover" label="封面" width="100">
          <template slot-scope="scope">
            <img :src="scope.row.cover" alt="封面" class="cover-image" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template slot-scope="scope">
            <el-tag :type="getCategoryType(scope.row.category)" size="small">
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" width="150">
          <template slot-scope="scope">
            <el-tag
              v-for="tag in scope.row.tags"
              :key="tag"
              size="mini"
              style="margin-right: 5px;"
            >
              {{ tag }}
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
        <el-table-column prop="likes" label="点赞" width="80" />
        <el-table-column prop="comments" label="评论" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewArticle(scope.row)">查看</el-button>
            <el-button size="mini" type="primary" @click="editArticle(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteArticle(scope.row)">删除</el-button>
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

    <!-- 创建/编辑文章对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="1000px"
      @close="handleDialogClose"
    >
      <el-form :model="articleForm" :rules="rules" ref="articleForm" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="标题" prop="title">
              <el-input v-model="articleForm.title" placeholder="请输入文章标题" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分类" prop="category">
              <el-select v-model="articleForm.category" placeholder="请选择分类">
                <el-option
                  v-for="category in categories"
                  :key="category"
                  :label="category"
                  :value="category"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标签" prop="tags">
              <el-select
                v-model="articleForm.tags"
                multiple
                filterable
                allow-create
                placeholder="请选择或输入标签"
              >
                <el-option
                  v-for="tag in tags"
                  :key="tag"
                  :label="tag"
                  :value="tag"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="articleForm.status">
                <el-radio label="draft">草稿</el-radio>
                <el-radio label="published">发布</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="封面" prop="cover">
          <el-upload
            class="cover-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
          >
            <img v-if="articleForm.cover" :src="articleForm.cover" class="cover-preview" />
            <i v-else class="el-icon-plus cover-uploader-icon"></i>
          </el-upload>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <div id="editor" style="height: 300px;"></div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="SEO标题">
              <el-input v-model="articleForm.seoTitle" placeholder="请输入SEO标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SEO关键词">
              <el-input v-model="articleForm.seoKeywords" placeholder="请输入SEO关键词" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="SEO描述">
          <el-input
            v-model="articleForm.seoDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入SEO描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 查看文章对话框 -->
    <el-dialog
      title="文章详情"
      :visible.sync="viewDialogVisible"
      width="800px"
    >
      <div v-if="currentArticle" class="article-detail">
        <h3>{{ currentArticle.title }}</h3>
        <div class="article-meta">
          <span>分类：{{ currentArticle.category }}</span>
          <span>作者：{{ currentArticle.author }}</span>
          <span>发布时间：{{ currentArticle.publishTime || '-' }}</span>
          <span>阅读量：{{ currentArticle.views }}</span>
          <span>点赞：{{ currentArticle.likes }}</span>
          <span>评论：{{ currentArticle.comments }}</span>
        </div>
        <div class="article-tags">
          <el-tag
            v-for="tag in currentArticle.tags"
            :key="tag"
            size="small"
            style="margin-right: 5px;"
          >
            {{ tag }}
          </el-tag>
        </div>
        <div class="article-content" v-html="currentArticle.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ArticleList',
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
      currentArticle: null,
      uploadUrl: '/api/upload', // 实际项目中应该是真实的上传接口
      articleForm: {
        title: '',
        category: '',
        tags: [],
        cover: '',
        content: '',
        status: 'draft',
        seoTitle: '',
        seoKeywords: '',
        seoDescription: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入文章标题', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入文章内容', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    list() {
      return this.$store.getters['articles/list']
    },
    categories() {
      return this.$store.getters['articles/categories']
    },
    tags() {
      return this.$store.getters['articles/tags']
    },
    pagination() {
      return this.$store.getters['articles/pagination']
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
      return this.isEdit ? '编辑文章' : '发布文章'
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      await this.$store.dispatch('articles/fetchArticles')
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
      this.$store.dispatch('articles/fetchArticles', {
        pageSize: val,
        current: 1
      })
    },
    handleCurrentChange(val) {
      this.$store.dispatch('articles/fetchArticles', {
        current: val
      })
    },
    createArticle() {
      this.isEdit = false
      this.articleForm = {
        title: '',
        category: '',
        tags: [],
        cover: '',
        content: '',
        status: 'draft',
        seoTitle: '',
        seoKeywords: '',
        seoDescription: ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.initEditor()
      })
    },
    editArticle(row) {
      this.isEdit = true
      this.articleForm = { ...row }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.initEditor()
      })
    },
    async viewArticle(row) {
      await this.$store.dispatch('articles/fetchArticleDetail', row.id)
      this.currentArticle = this.$store.getters['articles/detail']
      this.viewDialogVisible = true
    },
    async deleteArticle(row) {
      try {
        await this.$confirm('确定要删除这篇文章吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.$store.dispatch('articles/deleteArticle', row.id)
        this.$message.success('删除成功')
        this.fetchData()
      } catch (error) {
        // 用户取消删除
      }
    },
    async batchDelete() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请选择要删除的文章')
        return
      }
      
      try {
        await this.$confirm(`确定要删除选中的 ${this.selectedItems.length} 篇文章吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        for (const item of this.selectedItems) {
          await this.$store.dispatch('articles/deleteArticle', item.id)
        }
        
        this.$message.success('批量删除成功')
        this.fetchData()
      } catch (error) {
        // 用户取消删除
      }
    },
    submitForm() {
      this.$refs.articleForm.validate(async (valid) => {
        if (valid) {
          try {
            if (this.isEdit) {
              await this.$store.dispatch('articles/updateArticle', this.articleForm)
              this.$message.success('更新成功')
            } else {
              await this.$store.dispatch('articles/createArticle', this.articleForm)
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
      this.$refs.articleForm.resetFields()
    },
    initEditor() {
      // 这里应该初始化富文本编辑器
      // 由于没有安装具体的编辑器，这里只是占位
      console.log('初始化编辑器')
    },
    handleCoverSuccess(response, file) {
      this.articleForm.cover = URL.createObjectURL(file.raw)
    },
    beforeCoverUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!')
      }
      return isImage && isLt2M
    },
    getCategoryType(category) {
      const typeMap = {
        '传统文化': 'primary',
        '民俗节庆': 'success',
        '手工艺': 'warning',
        '古建筑': 'info',
        '音乐舞蹈': 'danger',
        '其他': ''
      }
      return typeMap[category] || ''
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
.article-list {
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

.cover-image {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 100px;
}

.cover-uploader:hover {
  border-color: #409EFF;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.cover-preview {
  width: 178px;
  height: 100px;
  object-fit: cover;
  display: block;
}

.article-detail h3 {
  margin: 0 0 15px 0;
  color: #303133;
}

.article-meta {
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.article-meta span {
  margin-right: 20px;
}

.article-tags {
  margin-bottom: 20px;
}

.article-content {
  line-height: 1.6;
  color: #303133;
}
</style>
