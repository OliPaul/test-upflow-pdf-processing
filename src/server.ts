import app from './app';
import { getConfig } from './config/config';

const config = getConfig();
const { port, host } = config.server;

app.listen(port, () => {
    console.log(`Server is running at http://${host}:${port}`);
});