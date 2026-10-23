require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');

const User = require('./models/User');
const Turbine = require('./models/Turbine');
const Maintenance = require('./models/Maintenance');
const Inspection = require('./models/Inspection');
const Weather = require('./models/Weather');
const Vessel = require('./models/Vessel');
const Alert = require('./models/Alert');
const Report = require('./models/Report');

async function checkDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/windops';
  console.log('===============================================================');
  console.log('                 WINDOPS DATABASE INSPECTOR                    ');
  console.log('===============================================================');
  console.log(`Connecting to: ${uri}\n`);

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[STATUS] Connected to host: ${conn.connection.host}`);
    console.log(`[DATABASE] Active DB Name:  ${conn.connection.name}\n`);

    // Counts
    const [
      userCount,
      turbineCount,
      maintCount,
      inspCount,
      weatherCount,
      vesselCount,
      alertCount,
      reportCount,
    ] = await Promise.all([
      User.countDocuments(),
      Turbine.countDocuments(),
      Maintenance.countDocuments(),
      Inspection.countDocuments(),
      Weather.countDocuments(),
      Vessel.countDocuments(),
      Alert.countDocuments(),
      Report.countDocuments(),
    ]);

    console.log('--- COLLECTION SUMMARY ---');
    console.table([
      { Collection: 'users', Records: userCount, Status: userCount > 0 ? 'Populated' : 'Empty' },
      { Collection: 'turbines', Records: turbineCount, Status: turbineCount === 48 ? '48 / 48 (Complete)' : `${turbineCount} records` },
      { Collection: 'maintenances', Records: maintCount, Status: maintCount > 0 ? 'Populated' : 'Empty' },
      { Collection: 'inspections', Records: inspCount, Status: inspCount > 0 ? 'Populated' : 'Empty' },
      { Collection: 'weathers', Records: weatherCount, Status: weatherCount > 0 ? 'Populated' : 'Empty' },
      { Collection: 'vessels', Records: vesselCount, Status: vesselCount > 0 ? 'Populated' : 'Empty' },
      { Collection: 'alerts', Records: alertCount, Status: alertCount > 0 ? 'Populated' : 'Empty' },
      { Collection: 'reports', Records: reportCount, Status: reportCount > 0 ? 'Populated' : 'Empty' },
    ]);

    // Turbines status breakdown
    const turbines = await Turbine.find({}, 'turbineId status powerOutput windSpeed healthScore');
    const online = turbines.filter((t) => t.status === 'ONLINE').length;
    const maint = turbines.filter((t) => t.status === 'MAINTENANCE').length;
    const warn = turbines.filter((t) => t.status === 'WARNING').length;
    const off = turbines.filter((t) => t.status === 'OFFLINE').length;
    const totalPower = turbines.reduce((sum, t) => sum + (t.status === 'ONLINE' || t.status === 'WARNING' ? t.powerOutput : 0), 0);

    console.log('\n--- TURBINE FLEET BREAKDOWN ---');
    console.log(`Total Turbines:   ${turbines.length} / 48`);
    console.log(`Online:           ${online} (${((online / turbines.length) * 100).toFixed(1)}%)`);
    console.log(`In Maintenance:   ${maint}`);
    console.log(`Warning State:    ${warn}`);
    console.log(`Offline:          ${off}`);
    console.log(`Live Farm Power:  ${totalPower.toFixed(1)} MW / 360.0 MW Rated Capacity`);

    // Weather overview
    const currentWeather = await Weather.findOne().sort({ timestamp: -1 });
    if (currentWeather) {
      console.log('\n--- LIVE METOCEAN WEATHER ---');
      console.log(`Location:         ${currentWeather.location}`);
      console.log(`Wind Velocity:    ${currentWeather.windSpeed} m/s (${currentWeather.windDirection})`);
      console.log(`Wave Height (Hs): ${currentWeather.waveHeight} m`);
      console.log(`Wave Period:      ${currentWeather.wavePeriod} s`);
      console.log(`Sea Temperature:  ${currentWeather.seaTemperature}°C`);
      console.log(`Vessel Access:    ${currentWeather.operationalStatus}`);
      console.log(`Next Safe Window: ${currentWeather.operationalWindow?.nextSafeWindow}`);
    }

    // Active alerts
    const activeAlerts = await Alert.find({ status: 'Active' });
    console.log(`\n--- ACTIVE ALERTS (${activeAlerts.length}) ---`);
    activeAlerts.forEach((a) => {
      console.log(` - [${a.severity.toUpperCase()}] ${a.title} (${a.turbine}): ${a.description}`);
    });

    // Demo users
    const users = await User.find({}, 'name email role title');
    console.log('\n--- DEMO USER PERSONAS ---');
    console.table(users.map((u) => ({ Name: u.name, Email: u.email, Role: u.role, Title: u.title })));

    console.log('\n===============================================================');
    console.log('Database check complete. MongoDB is healthy and operational!');
    console.log('===============================================================');
  } catch (err) {
    console.error('[ERROR] Failed to inspect database:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkDatabase();
