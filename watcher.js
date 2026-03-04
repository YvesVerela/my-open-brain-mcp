import chokidar from 'chokidar';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const WATCH_PATH = '/Volumes/ySol Mainet/KRON Op Brain Database';
const authorized = [
  '01_Core_Intelligence (brain context)',
  '02_Knowledge_Base',
  '03_Heavy_Assets (project back ups)'
];

const watcher = chokidar.watch(authorized.map(f => path.join(WATCH_PATH, f)), { persistent: true });
watcher.on('add', async (filePath) => {
  const relativePath = path.relative(WATCH_PATH, filePath);
  const bucket = relativePath.startsWith('03') ? 'project-backups' : 'brain-context';
  try {
    const fileBuffer = fs.readFileSync(filePath);
    await supabase.storage.from(bucket).upload(relativePath, fileBuffer, { upsert: true });
    console.log("✅ Synced: " + path.basename(filePath));
  } catch (err) {
    console.error("❌ Error: " + err.message);
  }
});
