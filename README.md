# 英语单词学习 H5

一个面向移动端的英语单词学习应用，基于 Next.js App Router、PostgreSQL、Drizzle ORM 和 NextAuth。应用支持邮箱密码登录、单词书列表、最近学习、单词学习、单词详情、发音播放和服务端学习进度同步。

## 功能

- 首页展示全部单词书、可学习单词数量和学习进度。
- 登录后展示最近学习入口，并支持从上次进度继续。
- 学习页一次预取 50 个词，点击“下一个”会立即切换到本地队列里的下一个词。
- 学习记录在后台批量同步到数据库，避免逐词等待网络和数据库写入。
- 单词详情页展示释义、例句、短语、同近义词和同根词。
- 支持英式/美式发音播放。
- “我的”页展示当前账号和学习进度列表。

## 技术栈

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- NextAuth v5 beta
- Drizzle ORM
- PostgreSQL

## 本地开发

安装依赖：

```bash
npm install
```

创建 `.env` 文件：

```bash
POSTGRES_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"
AUTH_SECRET="your-random-secret"
```

运行数据库迁移：

```bash
npm run db:migrate
```

启动开发服务器：

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

## 数据库说明

应用依赖 `books` 和 `words` 两张词库表。当前迁移文件 [migrations/001_learning_progress.sql](migrations/001_learning_progress.sql) 会创建或补齐：

- `User`：邮箱密码登录用户。
- `user_book_progress`：用户单词书学习进度。
- `user_word_study_records`：用户单词学习记录。
- `words(book_id, word_rank)` 等查询索引。

学习页读取进度后会按 `book_id` 和 `word_rank` 查询下一批 50 个词：

```sql
where book_id = ?
and word_rank > current_word_rank
order by word_rank asc
limit 50
```

点击“下一个”时，客户端先立即切换 UI，并把已学词加入待同步队列。后台会批量写入 `user_word_study_records`，再更新 `user_book_progress`。

## 常用命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 生产构建
npm run start      # 启动生产服务
npm run lint       # 运行 Next.js lint
npm run db:migrate # 执行 SQL 迁移
```

## 主要目录

```text
app/
  actions/         # 登录、学习进度同步 Server Actions
  study/[bookId]/  # 学习页
  word/[wordId]/   # 单词详情页
  mine/            # 我的页
components/        # H5 页面和 UI 组件
lib/data/          # books、words、progress 数据访问
lib/db/schema.ts   # Drizzle schema
migrations/        # SQL 迁移
docs/              # PRD 和技术文档
```

## 注意事项

- `POSTGRES_URL` 是运行应用的必需环境变量。
- `AUTH_SECRET` 是 NextAuth 的必需密钥，生产环境必须使用稳定的随机字符串。
- 如果学习页没有单词，请确认 `words` 表存在对应的 `book_id` 数据。
- 如果进度表不存在，请先运行 `npm run db:migrate`。
