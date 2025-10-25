const mysql = require('mysql2/promise')
require('dotenv').config()

async function setupActivitiesDB() {
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
    
    // 创建activities表
    console.log('📋 创建activities表...')
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
    console.log('✅ activities表创建成功')
    
    // 创建user_activities表
    console.log('📋 创建user_activities表...')
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
        KEY \`idx_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    console.log('✅ user_activities表创建成功')
    
    // 检查是否有示例数据，如果没有则插入
    const [existingActivities] = await connection.execute("SELECT COUNT(*) as count FROM activities")
    if (existingActivities[0].count === 0) {
      console.log('📊 插入示例活动数据...')
      await connection.execute(`
        INSERT INTO \`activities\` (\`title\`,\`description\`,\`location\`,\`start_time\`,\`end_time\`,\`max_participants\`,\`cover\`,\`status\`) VALUES
        ('非遗市集','展示传统手工艺品，体验非遗文化','市文化广场','2024-01-20 10:00:00','2024-01-20 18:00:00',100,'/assets/craft.jpg','published'),
        ('传统音乐节','传统乐器演奏，感受古典音乐魅力','音乐厅','2024-01-25 19:00:00','2024-01-25 21:00:00',200,'/assets/music.jpg','published'),
        ('民俗文化展','展示各地民俗文化，了解传统习俗','博物馆','2024-01-30 09:00:00','2024-01-30 17:00:00',150,'/assets/museum.jpg','published')
      `)
      console.log('✅ 示例活动数据插入成功')
    } else {
      console.log('✅ 活动数据已存在，跳过插入')
    }
    
    // 检查users表是否存在，如果不存在则创建
    const [userTables] = await connection.execute("SHOW TABLES LIKE 'users'")
    if (userTables.length === 0) {
      console.log('📋 创建users表...')
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS \`users\` (
          \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          \`username\` VARCHAR(64) NOT NULL UNIQUE,
          \`nickname\` VARCHAR(64) DEFAULT NULL,
          \`email\` VARCHAR(128) DEFAULT NULL,
          \`phone\` VARCHAR(20) DEFAULT NULL,
          \`password\` VARCHAR(255) NOT NULL,
          \`role\` ENUM('user','admin') DEFAULT 'user',
          \`status\` ENUM('active','inactive','banned') DEFAULT 'active',
          \`avatar\` VARCHAR(255) DEFAULT NULL,
          \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`username\` (\`username\`),
          UNIQUE KEY \`phone\` (\`phone\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `)
      
      // 插入示例用户
      await connection.execute(`
        INSERT INTO \`users\` (\`username\`,\`nickname\`,\`email\`,\`password\`,\`role\`) VALUES
        ('admin','管理员','admin@example.com','admin123','admin'),
        ('user1','普通用户','user1@example.com','user123','user')
      `)
      console.log('✅ users表创建成功并插入了示例用户')
    } else {
      console.log('✅ users表已存在')
    }
    
    // 显示最终状态
    console.log('\n🎉 数据库设置完成！')
    console.log('📊 当前状态:')
    
    const [activities] = await connection.execute("SELECT * FROM activities")
    console.log(`  - activities表: ${activities.length} 条记录`)
    
    const [userActivities] = await connection.execute("SELECT * FROM user_activities")
    console.log(`  - user_activities表: ${userActivities.length} 条记录`)
    
    const [users] = await connection.execute("SELECT * FROM users")
    console.log(`  - users表: ${users.length} 条记录`)
    
    console.log('\n📋 活动列表:')
    activities.forEach(activity => {
      console.log(`  - ${activity.title} (${activity.location})`)
    })
    
  } catch (error) {
    console.error('❌ 数据库设置失败:', error.message)
    console.error('详细错误:', error)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

setupActivitiesDB()


