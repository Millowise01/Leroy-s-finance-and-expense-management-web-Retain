import app from './app.js';
import { env } from './config/env.js';

app.listen(env.PORT, () => {
  console.log(`Retain API running at http://localhost:${env.PORT}`);
});
