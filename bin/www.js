require('dotenv').config();
const app = require('../app');
const mongoose = require("mongoose");

const port = process.env.PORT ?? 3001;

app.listen(
  port,
  () => {
    console.log(`Server started on port ${port}.`);

    mongoose.connect(process.env.URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }, () => {
      console.log('Connection to database is successful.');
    });
  }
);
