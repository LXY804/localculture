<template>
  <div class="tag-management">
    <el-card class="main-card">
      <div slot="header" class="card-header">
        <span>标签管理</span>
        <el-button type="primary" @click="createTag">
          <i class="el-icon-plus"></i>
          新增标签
        </el-button>
      </div>

      <!-- 标签云 -->
      <div class="tag-cloud">
        <div
          v-for="tag in tags"
          :key="tag.id"
          class="tag-item"
          :style="{ backgroundColor: tag.color }"
          @click="editTag(tag)"
        >
          <span class="tag-name">{{ tag.name }}</span>
          <span class="tag-count">{{ tag.count }}</span>
          <div class="tag-actions" @click.stop>
            <el-button size="mini" @click="editTag(tag)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteTag(tag)">删除</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 创建/编辑标签对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="tagForm" :rules="rules" ref="tagForm" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="tagForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入标签描述"
          />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="tagForm.color" />
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
  name: 'TagManagement',
  data() {
    return {
      dialogVisible: false,
      isEdit: false,
      tagForm: {
        name: '',
        description: '',
        color: '#409EFF'
      },
      rules: {
        name: [
          { required: true, message: '请输入标签名称', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入标签描述', trigger: 'blur' }
        ],
        color: [
          { required: true, message: '请选择颜色', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    tags() {
      return this.$store.state.tags.list || []
    },
    dialogTitle() {
      return this.isEdit ? '编辑标签' : '新增标签'
    }
  },
  created() {
    this.fetchTags()
  },
  methods: {
    async fetchTags() {
      await this.$store.dispatch('tags/fetchTags')
    },
    createTag() {
      this.isEdit = false
      this.tagForm = {
        name: '',
        description: '',
        color: '#409EFF'
      }
      this.dialogVisible = true
    },
    editTag(tag) {
      this.isEdit = true
      this.tagForm = { ...tag }
      this.dialogVisible = true
    },
    async deleteTag(tag) {
      try {
        await this.$confirm(`确定要删除标签"${tag.name}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.$store.dispatch('tags/deleteTag', tag.id)
        this.$message.success('删除成功')
      } catch (error) {
        // 用户取消删除
      }
    },
    submitForm() {
      this.$refs.tagForm.validate(async (valid) => {
        if (valid) {
          try {
            if (this.isEdit) {
              await this.$store.dispatch('tags/updateTag', this.tagForm)
              this.$message.success('更新成功')
            } else {
              await this.$store.dispatch('tags/createTag', this.tagForm)
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
      this.$refs.tagForm.resetFields()
    }
  }
}
</script>

<style scoped>
.tag-management {
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

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 20px;
}

.tag-item {
  position: relative;
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  justify-content: center;
}

.tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tag-name {
  font-weight: 500;
  font-size: 14px;
}

.tag-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.tag-actions {
  position: absolute;
  top: -5px;
  right: -5px;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  gap: 2px;
}

.tag-item:hover .tag-actions {
  opacity: 1;
}

.tag-actions .el-button {
  padding: 2px 6px;
  font-size: 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #333;
}

.dialog-footer {
  text-align: right;
}
</style>
