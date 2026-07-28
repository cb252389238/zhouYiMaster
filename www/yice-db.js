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
                    verifyStatus TEXT,
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

        await sqlite.execute({
            database: DB_NAME,
            statements: "ALTER TABLE yice_records ADD COLUMN verifyStatus TEXT DEFAULT 'pending';"
        }).catch(() => {})

        yiceDB = sqlite
        dbInitialized = true
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
    const accuracy = record.accuracy ?? 70
    const verifyStatus = normalizeYiceVerifyStatus(record.verifyStatus)

    return "INSERT INTO yice_records (id, category, content, person, upper, lower, dongyao, analysis, createTime, updateTime, accuracy, verifyStatus, replays) VALUES ('" +
        escapeSqlString(record.id) + "', '" + escapeSqlString(record.category) + "', '" + escapeSqlString(record.content) + "', '" + escapeSqlString(record.person) + "', '" + escapeSqlString(record.upper) + "', '" + escapeSqlString(record.lower) + "', '" + escapeSqlString(JSON.stringify(record.dongyao || [])) + "', '" + escapeSqlString(record.analysis) + "', '" + escapeSqlString(record.createTime) + "', '" + escapeSqlString(record.updateTime) + "', " + accuracy + ", '" + escapeSqlString(verifyStatus) + "', '" + escapeSqlString(JSON.stringify(record.replays || [])) + "')"
}

async function saveYiceDataToDB() {
    await initYiceDB()

    try {
        const recordSqls = ycRecords.map(r => buildYiceRecordInsertSql(r))
        const uniqueCategories = [...new Set(ycCategories)]
        const categorySqls = uniqueCategories.map(cat =>
            "INSERT OR IGNORE INTO yice_categories (name) VALUES ('" + escapeSqlString(cat) + "')"
        )

        await yiceDB.execute({
            database: DB_NAME,
            statements: 'DELETE FROM yice_records; DELETE FROM yice_categories;' +
                (recordSqls.length ? ' ' + recordSqls.join('; ') : '') +
                (categorySqls.length ? '; ' + categorySqls.join('; ') : '')
        })

        showAppToast('数据保存成功')
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

    const accuracy = record.accuracy ?? 70
    const verifyStatus = normalizeYiceVerifyStatus(record.verifyStatus)

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
        "accuracy=" + accuracy + ", " +
        "verifyStatus='" + escapeSqlString(verifyStatus) + "', " +
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

    const uniqueCategories = [...new Set(ycCategories)]
    const categorySqls = uniqueCategories.map(cat =>
        "INSERT OR IGNORE INTO yice_categories (name) VALUES ('" + escapeSqlString(cat) + "')"
    )

    await yiceDB.execute({
        database: DB_NAME,
        statements: 'DELETE FROM yice_categories;' +
            (categorySqls.length ? ' ' + categorySqls.join('; ') : '')
    })
}

async function replaceAllYiceDataInDB(records, categories) {
    await initYiceDB()

    const recordSqls = records.map(r => buildYiceRecordInsertSql(r))
    const allCategories = Array.isArray(categories) && categories.length > 0
        ? [...new Set(categories)]
        : [...DEFAULT_YICE_CATEGORIES]
    const categorySqls = allCategories.map(cat =>
        "INSERT OR IGNORE INTO yice_categories (name) VALUES ('" + escapeSqlString(cat) + "')"
    )

    await yiceDB.execute({
        database: DB_NAME,
        statements: 'DELETE FROM yice_records; DELETE FROM yice_categories;' +
            (recordSqls.length ? ' ' + recordSqls.join('; ') : '') +
            (categorySqls.length ? '; ' + categorySqls.join('; ') : '')
    })

    ycCategories = allCategories
}

async function loadYiceData() {
    try {
        const data = await loadYiceDataFromDB()

        if (data && data.records && data.records.length > 0) {
            ycRecords = data.records.map(normalizeYiceRecord)
            ycCategories = data.categories && data.categories.length > 0
                ? [...new Set(data.categories.map(normalizeYiceText).filter(Boolean))]
                : [...DEFAULT_YICE_CATEGORIES]
        } else {
            ycRecords = []
            ycCategories = [...DEFAULT_YICE_CATEGORIES]
        }
    } catch (e) {
        console.error('加载数据失败:', e)
        ycRecords = []
        ycCategories = [...DEFAULT_YICE_CATEGORIES]
    }
}

async function saveYiceData() {
    try {
        await saveYiceDataToDB()
    } catch (e) {
        console.error('保存数据失败:', e)
    }
}
