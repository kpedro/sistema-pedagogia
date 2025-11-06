import cron from "node-cron";
import fs from "node:fs/promises";
import path from "node:path";
import { subYears } from "date-fns";
import { prisma } from "../lib/prisma";

const TZ = process.env.CRON_TZ ?? "America/Manaus";
const BACKUP_DIR = process.env.BACKUP_DIR ?? path.resolve("backups");
const UPLOAD_ROOT = process.env.UPLOAD_ROOT ?? path.resolve("uploads");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function backupDatabase() {
  const dbPath = path.resolve("prisma", "dev.db");
  await ensureDir(BACKUP_DIR);
  const target = path.join(BACKUP_DIR, `backup-${Date.now()}.db`);
  await fs.copyFile(dbPath, target);
  console.log(`[cron] Backup gerado em ${target}`);
}

async function cleanupUploads() {
  await ensureDir(UPLOAD_ROOT);
  const entries = await fs.readdir(UPLOAD_ROOT);
  const attachments = await prisma.attachment.findMany({
    select: { path: true }
  });

  const keep = new Set(attachments.map((a) => path.basename(a.path)));
  const deletions: string[] = [];

  for (const entry of entries) {
    if (!keep.has(entry)) {
      const target = path.join(UPLOAD_ROOT, entry);
      deletions.push(target);
      await fs.rm(target, { force: true });
    }
  }

  if (deletions.length) {
    console.log(`[cron] Uploads órfãos removidos: ${deletions.length}`);
  }
}

async function purgeRetention() {
  const fiveYearsAgo = subYears(new Date(), 5);
  const tenYearsAgo = subYears(new Date(), 10);

  const [occurrence, docs] = await Promise.all([
    prisma.occurrence.deleteMany({
      where: {
        happenedAt: { lt: fiveYearsAgo }
      }
    }),
    prisma.document.updateMany({
      where: {
        status: "ARCHIVED",
        archivedAt: { lt: tenYearsAgo }
      },
      data: {
        metadata: JSON.stringify({ purgedAt: new Date().toISOString() })
      }
    })
  ]);

  console.log(`[cron] Ocorrências expurgadas: ${occurrence.count}`);
  console.log(`[cron] Documentos marcados para expurgo: ${docs.count}`);
}

export async function runMaintenance() {
  await backupDatabase();
  await cleanupUploads();
  await purgeRetention();
  await prisma.$disconnect();
}

if (require.main === module) {
  cron.schedule(
    "0 2 * * *",
    () => {
      runMaintenance().catch((error) => {
        console.error("[cron] erro na rotina:", error);
      });
    },
    { timezone: TZ }
  );

  setTimeout(() => {
    runMaintenance().catch((error) => {
      console.error("[cron] erro execução inicial:", error);
    });
  }, 60_000);

  console.log(`[cron] Scheduler ativo (TZ=${TZ}). Pressione Ctrl+C para encerrar.`);
}
