export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startSubscriptionCheckCron } = await import('@/lib/cron');
    startSubscriptionCheckCron();
  }
}
