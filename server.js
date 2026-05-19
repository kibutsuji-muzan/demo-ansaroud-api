require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config');

const port = config.PORT || 3000;
app.listen(port, () => {
  console.log(`ansaroud backend listening on port ${port} (${config.NODE_ENV})`);
});
