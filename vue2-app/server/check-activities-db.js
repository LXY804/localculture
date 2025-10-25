const mysql = require('mysql2/promise')
require('dotenv').config()

async function checkActivitiesDB() {
  let connection
  
  try {
    // 首先连接到MySQL服务器（不指定数据库）
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    })
    
    console.log('✅ MySQL服务器连接成功')
    
    // 创建数据库（如果不存在）
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'localculture'}\``)
    console.log('✅ 数据库创建/确认成功')
    
    // 切换到目标数据库
    await connection.execute(`USE \`${process.env.DB_NAME || 'localculture'}\``)
    
    console.log('✅ 数据库连接成功')
    
    // 检查activities表是否存在，如果不存在则创建
    const [tables] = await connection.execute("SHOW TABLES LIKE 'activities'")
    if (tables.length > 0) {
      console.log('✅ activities表存在')
    } else {
      console.log('❌ activities表不存在，正在创建...')
      
      // 创建activities表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS \`activities\` (
          \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          \`title\` VARCHAR(255) NOT NULL COMMENT '活动标题',
          \`description\` TEXT NULL COMMENT '活动描述',
          \`location\` VARCHAR(255) NOT NULL COMMENT '活动地点',
          \`start_time\` DATETIME NOT NULL COMMENT '活动开始时间',
          \`end_time\` DATETIME NOT NULL COMMENT '活动结束时间',
          \`max_participants\` INT DEFAULT NULL COMMENT '最大参与人数',
          \`current_participants\` INT DEFAULT 0 COMMENT '当前参与人数',
          \`cover\` VARCHAR(255) DEFAULT NULL COMMENT '活动封面图',
          \`status\` ENUM('draft','published','cancelled','completed') DEFAULT 'published' COMMENT '活动状态',
          \`visible\` TINYINT(1) DEFAULT 1 COMMENT '是否可见',
          \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_status\` (\`status\`),
          KEY \`idx_start_time\` (\`start_time\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `)
      
      // 插入示例数据
      await connection.execute(`
        INSERT INTO \`activities\` (\`title\`,\`description\`,\`location\`,\`start_time\`,\`end_time\`,\`max_participants\`,\`cover\`,\`status\`) VALUES
        ('非遗市集','展示传统手工艺品，体验非遗文化','市文化广场','2024-01-20 10:00:00','2024-01-20 18:00:00',100,'/assets/craft.jpg','published'),
        ('传统音乐节','传统乐器演奏，感受古典音乐魅力','音乐厅','2024-01-25 19:00:00','2024-01-25 21:00:00',200,'/assets/music.jpg','published'),
        ('民俗文化展','展示各地民俗文化，了解传统习俗','博物馆','2024-01-30 09:00:00','2024-01-30 17:00:00',150,'/assets/museum.jpg','published')
      `)
      
      console.log('✅ activities表创建成功并插入了示例数据')
    }
      
      // 查看表结构
      const [structure] = await connection.execute("DESCRIBE activities")
      console.log('📋 activities表结构:')
      structure.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`)
      })
      
      // 查看表中的数据
      const [activities] = await connection.execute("SELECT * FROM activities")
      console.log(`📊 activities表中有 ${activities.length} 条记录:`)
      activities.forEach(activity => {
        console.log(`  - ID: ${activity.id}, 标题: ${activity.title}, 地点: ${activity.location}`)
      })
    } else {
      console.log('❌ activities表不存在')
    }
    
    // 检查user_activities表是否存在，如果不存在则创建
    const [userTables] = await connection.execute("SHOW TABLES LIKE 'user_activities'")
    if (userTables.length > 0) {
      console.log('✅ user_activities表存在')
    } else {
      console.log('❌ user_activities表不存在，正在创建...')
      
      // 创建user_activities表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS \`user_activities\` (
          \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          \`user_id\` BIGINT UNSIGNED NOT NULL,
          \`activity_id\` BIGINT UNSIGNED NOT NULL,
          \`status\` ENUM('registered','confirmed','cancelled','completed') DEFAULT 'registered' COMMENT '报名状态',
          \`registration_time\` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
          \`notes\` TEXT NULL COMMENT '备注信息',
          \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`unique_user_activity\` (\`user_id\`, \`activity_id\`),
          KEY \`idx_user_id\` (\`user_id\`),
          KEY \`idx_activity_id\` (\`activity_id\`),
          KEY \`idx_status\` (\`status\`),
          FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
          FOREIGN KEY (\`activity_id\`) REFERENCES \`activities\`(\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `)
      
      console.log('✅ user_activities表创建成功')
    }
      
      // 查看表结构
      const [userStructure] = await connection.execute("DESCRIBE user_activities")
      console.log('📋 user_activities表结构:')
      userStructure.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`)
      })
      
      // 查看表中的数据
      const [userActivities] = await connection.execute("SELECT * FROM user_activities")
      console.log(`📊 user_activities表中有 ${userActivities.length} 条记录:`)
      userActivities.forEach(ua => {
        console.log(`  - 用户ID: ${ua.user_id}, 活动ID: ${ua.activity_id}, 状态: ${ua.status}`)
      })
    } else {
      console.log('❌ user_activities表不存在')
    }
    
    // 检查users表
    const [users] = await connection.execute("SELECT id, username, nickname FROM users")
    console.log(`👥 users表中有 ${users.length} 个用户:`)
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, 用户名: ${user.username}, 昵称: ${user.nickname || '无'}`)
    })
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

checkActivitiesDB()
