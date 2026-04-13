// ==================== 易策数据层 ====================
const DB_NAME = 'yishi.db'
let yiceDB = null
let dbInitialized = false

function getSQLitePlugin() {
    if (window.CapacitorSQLite) {
        return window.CapacitorSQLite
    }
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorSQLite) {
        return window.Capacitor.Plugins.CapacitorSQLite
    }
    const err = 'CapacitorSQLite 插件未加载，请确保已执行 npx cap sync'
    alert('【错误】' + err)
    throw new Error(err)
}

async function initYiceDB() {
    if (dbInitialized && yiceDB) return

    try {
        const sqlite = getSQLitePlugin()
        await sqlite.createConnection({ database: DB_NAME })
        await sqlite.open({ database: DB_NAME })

        await sqlite.execute({
            database: DB_NAME,
            statements: `
                CREATE TABLE IF NOT EXISTS yice_records (
                    id TEXT PRIMARY KEY,
                    category TEXT,
                    content TEXT,
                    person TEXT,
                    upper TEXT,
                    lower TEXT,
                    dongyao TEXT,
                    analysis TEXT,
                    createTime TEXT,
                    updateTime TEXT,
                    accuracy INTEGER,
                    replays TEXT
                );

                CREATE TABLE IF NOT EXISTS yice_categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL
                );

                CREATE TABLE IF NOT EXISTS yice_meta (
                    key TEXT PRIMARY KEY,
                    value TEXT
                );
            `
        })

        yiceDB = sqlite
        dbInitialized = true
        console.log('SQLite 数据库初始化成功')
    } catch (e) {
        alert('【错误】SQLite 初始化失败: ' + e.message)
        throw e
    }
}

async function loadYiceDataFromDB() {
    await initYiceDB()

    try {
        const recordsResult = await yiceDB.query({
            database: DB_NAME,
            statement: 'SELECT * FROM yice_records ORDER BY datetime(createTime) DESC, id DESC',
            values: []
        })

        const categoriesResult = await yiceDB.query({
            database: DB_NAME,
            statement: 'SELECT * FROM yice_categories',
            values: []
        })

        return {
            records: recordsResult.values || [],
            categories: categoriesResult.values ? categoriesResult.values.map(c => c.name) : []
        }
    } catch (e) {
        alert('【错误】从 SQLite 加载数据失败: ' + e.message)
        throw e
    }
}

function escapeSqlString(value) {
    return String(value ?? '').replace(/'/g, "''")
}

function buildYiceRecordInsertSql(record) {
    return "INSERT INTO yice_records (id, category, content, person, upper, lower, dongyao, analysis, createTime, updateTime, accuracy, replays) VALUES ('" +
        escapeSqlString(record.id) + "', '" + escapeSqlString(record.category) + "', '" + escapeSqlString(record.content) + "', '" + escapeSqlString(record.person) + "', '" + escapeSqlString(record.upper) + "', '" + escapeSqlString(record.lower) + "', '" + escapeSqlString(JSON.stringify(record.dongyao || [])) + "', '" + escapeSqlString(record.analysis) + "', '" + escapeSqlString(record.createTime) + "', '" + escapeSqlString(record.updateTime) + "', " + (record.accuracy || 70) + ", '" + escapeSqlString(JSON.stringify(record.replays || [])) + "')"
}

async function saveYiceDataToDB() {
    await initYiceDB()

    try {
        await yiceDB.execute({
            database: DB_NAME,
            statements: 'DELETE FROM yice_records; DELETE FROM yice_categories;'
        })

        for (const record of ycRecords) {
            await yiceDB.execute({
                database: DB_NAME,
                statements: buildYiceRecordInsertSql(record)
            })
        }

        const uniqueCategories = [...new Set(ycCategories)]
        for (const cat of uniqueCategories) {
            await yiceDB.execute({
                database: DB_NAME,
                statements: "INSERT OR IGNORE INTO yice_categories (name) VALUES ('" + cat.replace(/'/g, "''") + "')"
            })
        }

        console.log('数据保存到 SQLite 成功')
    } catch (e) {
        alert('【错误】保存数据到 SQLite 失败: ' + e.message)
        throw e
    }
}

async function insertYiceRecordToDB(record) {
    await initYiceDB()
    await yiceDB.execute({
        database: DB_NAME,
        statements: buildYiceRecordInsertSql(record)
    })
}

async function updateYiceRecordInDB(record) {
    await initYiceDB()

    const sql = "UPDATE yice_records SET " +
        "category='" + escapeSqlString(record.category) + "', " +
        "content='" + escapeSqlString(record.content) + "', " +
        "person='" + escapeSqlString(record.person) + "', " +
        "upper='" + escapeSqlString(record.upper) + "', " +
        "lower='" + escapeSqlString(record.lower) + "', " +
        "dongyao='" + escapeSqlString(JSON.stringify(record.dongyao || [])) + "', " +
        "analysis='" + escapeSqlString(record.analysis) + "', " +
        "createTime='" + escapeSqlString(record.createTime) + "', " +
        "updateTime='" + escapeSqlString(record.updateTime) + "', " +
        "accuracy=" + (record.accuracy || 70) + ", " +
        "replays='" + escapeSqlString(JSON.stringify(record.replays || [])) + "' " +
        "WHERE id='" + escapeSqlString(record.id) + "'"

    await yiceDB.execute({ database: DB_NAME, statements: sql })
}

async function deleteYiceRecordFromDB(recordId) {
    await initYiceDB()
    await yiceDB.execute({
        database: DB_NAME,
        statements: "DELETE FROM yice_records WHERE id='" + escapeSqlString(recordId) + "'"
    })
}

async function saveYiceCategoriesToDB() {
    await initYiceDB()
    await yiceDB.execute({ database: DB_NAME, statements: 'DELETE FROM yice_categories;' })

    const uniqueCategories = [...new Set(ycCategories)]
    for (const cat of uniqueCategories) {
        await yiceDB.execute({
            database: DB_NAME,
            statements: "INSERT OR IGNORE INTO yice_categories (name) VALUES ('" + escapeSqlString(cat) + "')"
        })
    }
}

async function replaceAllYiceDataInDB(records, categories) {
    await initYiceDB()
    await yiceDB.execute({
        database: DB_NAME,
        statements: 'DELETE FROM yice_records; DELETE FROM yice_categories;'
    })

    for (const record of records) {
        await insertYiceRecordToDB(record)
    }

    ycCategories = Array.isArray(categories) && categories.length > 0
        ? [...new Set(categories)]
        : ['事业', '感情', '财运', '学业', '健康', '其他']

    await saveYiceCategoriesToDB()
}

async function loadYiceData() {
    try {
        const data = await loadYiceDataFromDB()

        if (data && data.records && data.records.length > 0) {
            ycRecords = data.records.map(normalizeYiceRecord)
            ycCategories = data.categories && data.categories.length > 0
                ? [...new Set(data.categories.map(normalizeYiceText).filter(Boolean))]
                : ['事业', '感情', '财运', '学业', '健康', '其他']
        } else {
            ycRecords = []
            ycCategories = ['事业', '感情', '财运', '学业', '健康', '其他']
        }
    } catch (e) {
        console.error('加载数据失败:', e)
        ycRecords = []
        ycCategories = ['事业', '感情', '财运', '学业', '健康', '其他']
    }
}

async function saveYiceData() {
    try {
        await saveYiceDataToDB()
    } catch (e) {
        console.error('保存数据失败:', e)
    }
}
