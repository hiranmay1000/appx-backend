const express = require('express');
const cors = require('cors');
const app = express();

const connectToDatabase = require('./config/db');
const signupRoute = require('./routes/signupRoute');
const loginRoute = require('./routes/loginRoute');
const changePasswordRoute = require('./routes/changepassword');
const imageRoute = require('./routes/imageRoute');
const vaultRoute = require('./routes/vaultRoute');

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

connectToDatabase()
  .then(() => {
    console.log("Database connected successfully");

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database", err);
    process.exit(1);
  });

// Routes
app.get('/', (req, res) => {
  res.send('AppxLearn server is ready & live!');
});

app.use('/api', signupRoute);
app.use('/api', loginRoute);
app.use('/api', imageRoute);
app.use('/api', changePasswordRoute);
app.use('/api', vaultRoute);
// app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
