<template>
  <div class="category-management">
    <el-card class="main-card">
      <div slot="header" class="card-header">
        <span>分类管理</span>
        <el-button type="primary" @click="createCategory">
          <i class="el-icon-plus"></i>
          新增分类
        </el-button>
      </div>

      <!-- 分类列表 -->
      <div class="category-grid">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          @click="editCategory(category)"
        >
          <div class="category-icon" :style="{ backgroundColor: category.color }">
            <i :class="category.icon"></i>
          </div>
          <div class="category-content">
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-desc">{{ category.description }}</p>
            <div class="category-meta">
              <span class="article-count">{{ category.count }} 篇文章</span>
              <span class="sort-order">排序: {{ category.sort }}</span>
            </div>
          </div>
          <div class="category-actions" @click.stop>
            <el-button size="mini" @click="editCategory(category)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteCategory(category)">删除</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 创建/编辑分类对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="categoryForm" :rules="rules" ref="categoryForm" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="categoryForm.color" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="categoryForm.icon" placeholder="选择图标">
            <el-option
              v-for="icon in iconOptions"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
            >
              <i :class="icon.value" style="margin-right: 8px;"></i>
              {{ icon.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="1" :max="999" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CategoryManagement',
  data() {
    return {
      dialogVisible: false,
      isEdit: false,
      categoryForm: {
        name: '',
        description: '',
        color: '#409EFF',
        icon: 'el-icon-star-on',
        sort: 1
      },
      rules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入分类描述', trigger: 'blur' }
        ],
        color: [
          { required: true, message: '请选择颜色', trigger: 'change' }
        ],
        icon: [
          { required: true, message: '请选择图标', trigger: 'change' }
        ]
      },
      iconOptions: [
        { label: '星星', value: 'el-icon-star-on' },
        { label: '礼物', value: 'el-icon-present' },
        { label: '工具', value: 'el-icon-tools' },
        { label: '房子', value: 'el-icon-house' },
        { label: '视频', value: 'el-icon-video-play' },
        { label: '更多', value: 'el-icon-more' },
        { label: '文档', value: 'el-icon-document' },
        { label: '图片', value: 'el-icon-picture' },
        { label: '音乐', value: 'el-icon-headset' },
        { label: '相机', value: 'el-icon-camera' }
      ]
    }
  },
  computed: {
    categories() {
      return this.$store.state.categories.list || []
    },
    dialogTitle() {
      return this.isEdit ? '编辑分类' : '新增分类'
    }
  },
  created() {
    this.fetchCategories()
  },
  methods: {
    async fetchCategories() {
      await this.$store.dispatch('categories/fetchCategories')
    },
    createCategory() {
      this.isEdit = false
      this.categoryForm = {
        name: '',
        description: '',
        color: '#409EFF',
        icon: 'el-icon-star-on',
        sort: this.categories.length + 1
      }
      this.dialogVisible = true
    },
    editCategory(category) {
      this.isEdit = true
      this.categoryForm = { ...category }
      this.dialogVisible = true
    },
    async deleteCategory(category) {
      try {
        await this.$confirm(`确定要删除分类"${category.name}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.$store.dispatch('categories/deleteCategory', category.id)
        this.$message.success('删除成功')
      } catch (error) {
        // 用户取消删除
      }
    },
    submitForm() {
      this.$refs.categoryForm.validate(async (valid) => {
        if (valid) {
          try {
            if (this.isEdit) {
              await this.$store.dispatch('categories/updateCategory', this.categoryForm)
              this.$message.success('更新成功')
            } else {
              await this.$store.dispatch('categories/createCategory', this.categoryForm)
              this.$message.success('创建成功')
            }
            this.dialogVisible = false
          } catch (error) {
            this.$message.error('操作失败')
          }
        }
      })
    },
    resetForm() {
      this.$refs.categoryForm.resetFields()
    }
  }
}
</script>

<style scoped>
.category-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.main-card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid #EBEEF5;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #409EFF;
}

.category-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  font-size: 24px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.category-content {
  margin-bottom: 15px;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.category-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin: 0 0 10px 0;
}

.category-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.category-actions {
  position: absolute;
  top: 15px;
  right: 15px;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  gap: 5px;
}

.category-card:hover .category-actions {
  opacity: 1;
}

.category-actions .el-button {
  padding: 5px 10px;
  font-size: 12px;
}

.dialog-footer {
  text-align: right;
}
</style>
