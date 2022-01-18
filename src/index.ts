import * as bodyParser from 'body-parser';
import config from 'config';
import express, { Application } from 'express';
import OAuthServer from 'express-oauth-server';
import 'module-alias/register';
import { connect } from 'mongoose';

import morganMiddleware from '@middleware/morgan';

import routes from '@routes/index';

import logger from '@util/logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongooseStore = require('oauth2-server-mongoose');

const app: Application = express();
const port = config.get('SERVER.PORT');

(async () => {
  const oauth = new OAuthServer({
    model: {
      ...mongooseStore(),
    },
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(oauth.authorize());

  // our middleware
  app.use(morganMiddleware);

  //  Connect all our routes to our application
  app.use('/api', routes);

  connect(config.get('MONGO.URI'), config.get('MONGO.OPTIONS'), () => {
    logger.info('Established DB connection');
  });

  app.listen(port, () => {
    logger.info(`App is listening on port ${port} !`);
  });
})();
