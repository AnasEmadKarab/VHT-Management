import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

// دالة ذكية للبحث عن ملف قاعدة بيانات Cloudflare D1 المحلية تلقائياً
function getLocalD1DB() {
  try {
    const basePath = path.resolve(
      ".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
    );
    const dbFile = fs.readdirSync(basePath).find((f) => f.endsWith(".sqlite"));
    if (!dbFile) return "";
    return path.resolve(basePath, dbFile);
  } catch (err) {
    return "";
  }
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: getLocalD1DB(),
  },
});
