import app from './app'; // Import Express app
import { config } from './config';
import logger from './logger';

const PORT = config.port;

app.listen(PORT, () => {
    logger.info(`Analytics Service running on port ${PORT} in ${config.env} mode`);
});
