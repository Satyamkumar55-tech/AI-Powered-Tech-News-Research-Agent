'use strict';

const cron = require('node-cron');
const { generateReport } = require('./reportGenerator');
const db = require('./database');

let scheduledTask = null;

async function start() {
  const schedule = process.env.REPORT_GENERATION_SCHEDULE || '0 * * * *';
  const forceInitial = process.env.FORCE_INITIAL_REPORT === 'true';

  console.log(`[Scheduler] Report generation schedule: "${schedule}"`);

  // Validate the cron expression
  if (!cron.validate(schedule)) {
    console.error(`[Scheduler] Invalid cron expression: "${schedule}". Falling back to hourly.`);
    scheduleTask('0 * * * *');
  } else {
    scheduleTask(schedule);
  }

  // Generate an initial report on startup if the DB is empty or force flag is set
  const reportCount = db.getReportCount();
  const articleCount = db.getArticleCount();

  if (reportCount === 0 || forceInitial) {
    console.log(`[Scheduler] No existing reports found (count: ${reportCount}). Generating initial report now...`);
    // Slight delay to let server fully start up
    setTimeout(async () => {
      try {
        await generateReport();
      } catch (err) {
        console.error('[Scheduler] Initial report generation failed:', err.message);
      }
    }, 2000);
  } else {
    console.log(`[Scheduler] Database has ${reportCount} reports and ${articleCount} articles. Skipping initial generation.`);
    console.log(`[Scheduler] Next report will be generated per schedule: ${schedule}`);
  }
}

function scheduleTask(cronExpression) {
  if (scheduledTask) {
    scheduledTask.stop();
  }

  scheduledTask = cron.schedule(cronExpression, async () => {
    console.log(`\n[Scheduler] ⏰ Scheduled trigger fired at ${new Date().toISOString()}`);
    try {
      await generateReport();
    } catch (err) {
      console.error('[Scheduler] Scheduled report generation failed:', err.message);
    }
  }, {
    scheduled: true,
    timezone: 'UTC',
  });

  console.log(`[Scheduler] Task scheduled successfully with expression: "${cronExpression}"`);
}

function stop() {
  if (scheduledTask) {
    scheduledTask.stop();
    console.log('[Scheduler] Scheduler stopped.');
  }
}

module.exports = { start, stop };
