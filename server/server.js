require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startSimulation } = require('./services/simulationService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const turbineRoutes = require('./routes/turbineRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const vesselRoutes = require('./routes/vesselRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const alertRoutes = require('./routes/alertRoutes');
const reportRoutes = require('./routes/reportRoutes');
const simulationRoutes = require('./routes/simulationRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in dev
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    system: 'WINDOPS SCADA API',
    facility: 'Tamil Nadu Offshore Wind Farm (360 MW)',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/turbines', turbineRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/vessels', vesselRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/simulation', simulationRoutes);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[WindOps Core] Server initialized on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  
  // Start automatic simulation ticker
  startSimulation(12000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Process Error] Unhandled Rejection: ${err.message}`);
  // server.close(() => process.exit(1));
});

module.exports = app;
