import 'dotenv/config';
import path from 'path';
import express from 'express';

// Errors treatments
import 'express-async-errors';
import * as Sentry from '@sentry/node';
import Youch from 'youch';
import sentryConfig from './config/sentry';

import routes from './routes';

// Database connection
import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);
    this.server.use(Sentry.Handlers.requestHandler());

    this.middlewares();
    this.routes();

    this.server.use(Sentry.Handlers.errorHandler());
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'temp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();
        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal server error.' });
    });
  }
}

export default new App().server;
