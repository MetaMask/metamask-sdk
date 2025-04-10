import { app } from './analytics-api';
import { getMigrationStats } from './metrics';

// Add migration status endpoint to track key migration progress
app.get('/migration-status', (_req, res) => {
  const stats = getMigrationStats();
  res.json({
    status: 'success',
    data: stats,
  });
});
