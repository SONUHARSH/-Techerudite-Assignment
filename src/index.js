
import express from 'express';
import dotenv from 'dotenv';
import apiRoutes from './routes/userRoute.js';
import sequelize from './config/database.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/v1', apiRoutes);

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Unable to connect to the database:', err));

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Server running on:${PORT}`);
});
