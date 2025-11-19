import { createApp } from './app';

const PORT = process.env.PORT || 3002;

const app = createApp();

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});

