require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Turbine = require('../models/Turbine');
const Maintenance = require('../models/Maintenance');
const Inspection = require('../models/Inspection');
const Weather = require('../models/Weather');
const Vessel = require('../models/Vessel');
const Alert = require('../models/Alert');
const Report = require('../models/Report');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/windops');
    console.log('[Seed Engine] Connected to MongoDB');
  } catch (err) {
    console.error('[Seed Engine] MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  console.log('[Seed Engine] Purging old collections...');
  await Promise.all([
    User.deleteMany({}),
    Turbine.deleteMany({}),
    Maintenance.deleteMany({}),
    Inspection.deleteMany({}),
    Weather.deleteMany({}),
    Vessel.deleteMany({}),
    Alert.deleteMany({}),
    Report.deleteMany({}),
  ]);

  console.log('[Seed Engine] Seeding Users with hashed credentials...');
  const users = await User.create([
    {
      name: 'Sarah Lindqvist',
      email: 'admin@windops.io',
      password: 'windops123',
      role: 'admin',
      title: 'Chief Operations Officer',
      status: 'online',
    },
    {
      name: 'Marcus Vance',
      email: 'ops@windops.io',
      password: 'windops123',
      role: 'operations_manager',
      title: 'Indian Offshore Operations Lead',
      status: 'online',
    },
    {
      name: 'Arun Kumar',
      email: 'tech@windops.io',
      password: 'windops123',
      role: 'maintenance_engineer',
      title: 'Senior Field Offshore Engineer',
      status: 'on_duty',
    },
    {
      name: 'Elena Rostova',
      email: 'inspector@windops.io',
      password: 'windops123',
      role: 'inspector',
      title: 'Lead QA / Subsea & NDT Inspector',
      status: 'online',
    },
  ]);
  console.log(`[Seed Engine] Seeded ${users.length} demo users.`);

  console.log('[Seed Engine] Generating 48 Offshore Wind Turbines (360 MW Fleet)...');
  const zones = [
    'Gulf of Mannar Offshore Zone',
    'Gujarat Offshore Wind Zone',
    'Konkan Offshore Zone',
    'Kerala Offshore Zone',
  ];
  const zoneCenters = [
    { lat: 9.02, lng: 78.26 },
    { lat: 21.48, lng: 69.22 },
    { lat: 18.52, lng: 72.62 },
    { lat: 10.18, lng: 75.02 },
  ];
  const turbinesData = [];

  // 48 simulated turbines distributed across Indian offshore project zones.
  let turbineIndex = 1;
  for (let r = 1; r <= 6; r++) {
    for (let c = 1; c <= 8; c++) {
      const tid = `WT-${turbineIndex.toString().padStart(3, '0')}`;
      const zoneIndex = Math.floor((turbineIndex - 1) / 12);
      const zone = zones[zoneIndex];
      const zoneCenter = zoneCenters[zoneIndex];

      // Designated statuses to match exact operational prompt KPI (42 online / 48)
      let status = 'ONLINE';
      let healthScore = Math.floor(92 + Math.random() * 7);
      let powerOutput = +(6.8 + (Math.random() - 0.5) * 1.2).toFixed(1);
      let windSpeed = +(12.0 + (Math.random() - 0.5) * 1.8).toFixed(1);
      let rotorSpeed = +(9.0 + (Math.random() - 0.5) * 0.8).toFixed(1);
      let genTemp = Math.floor(62 + Math.random() * 5);
      let gearTemp = Math.floor(56 + Math.random() * 5);
      let vib = +(1.4 + Math.random() * 0.5).toFixed(2);
      let availability = +(96.0 + Math.random() * 3.8).toFixed(1);

      if (tid === 'WT-024') {
        // High vibration, in progress maintenance
        status = 'ONLINE';
        healthScore = 78;
        vib = 3.82;
        genTemp = 74;
        gearTemp = 71;
        powerOutput = 6.4;
      } else if (tid === 'WT-017') {
        status = 'MAINTENANCE';
        healthScore = 72;
        powerOutput = 0.0;
        rotorSpeed = 0.0;
        genTemp = 42;
        gearTemp = 40;
        vib = 0.4;
        availability = 89.2;
      } else if (tid === 'WT-031') {
        status = 'OFFLINE';
        healthScore = 64;
        powerOutput = 0.0;
        rotorSpeed = 0.0;
        genTemp = 38;
        gearTemp = 36;
        vib = 0.2;
        availability = 82.5;
      } else if (tid === 'WT-038') {
        status = 'MAINTENANCE';
        healthScore = 70;
        powerOutput = 0.0;
        rotorSpeed = 0.0;
        genTemp = 45;
        gearTemp = 44;
        vib = 0.5;
      } else if (tid === 'WT-045') {
        status = 'MAINTENANCE';
        healthScore = 68;
        powerOutput = 0.0;
        rotorSpeed = 0.0;
        genTemp = 43;
        gearTemp = 41;
        vib = 0.4;
      } else if (tid === 'WT-009') {
        status = 'WARNING';
        healthScore = 81;
        genTemp = 78;
        powerOutput = 5.2;
        vib = 2.6;
      } else if (tid === 'WT-042') {
        status = 'WARNING';
        healthScore = 80;
        gearTemp = 76;
        powerOutput = 5.4;
        vib = 2.5;
      }

      // Generate 24 hourly data points for rich Recharts visualizations
      const historicalLog = [];
      const now = Date.now();
      for (let h = 24; h >= 0; h--) {
        const time = new Date(now - h * 3600 * 1000);
        const wave = Math.sin((24 - h) / 4) * 0.7;
        const p = status === 'OFFLINE' || status === 'MAINTENANCE' ? 0 : Math.max(0, +(powerOutput + wave).toFixed(2));
        const w = Math.max(2, +(windSpeed + wave * 0.5).toFixed(1));
        const r = p > 0 ? +(8.0 + (p / 7.5) * 3.5).toFixed(1) : 0;
        historicalLog.push({
          timestamp: time,
          powerOutput: p,
          windSpeed: w,
          rotorSpeed: r,
          generatorTemp: Math.round(genTemp + (Math.random() - 0.5) * 3),
          gearboxTemp: Math.round(gearTemp + (Math.random() - 0.5) * 3),
          vibration: +(vib + (Math.random() - 0.5) * 0.2).toFixed(2),
        });
      }

      turbinesData.push({
        turbineId: tid,
        name: `Turbine ${tid} (Siemens 8.0MW)`,
        model: 'Siemens Gamesa SG 8.0-167 DD',
        location: {
          zone,
          row: r,
          col: c,
          lat: +(zoneCenter.lat + r * 0.018 + (Math.random() - 0.5) * 0.006).toFixed(4),
          lng: +(zoneCenter.lng + c * 0.028 + (Math.random() - 0.5) * 0.006).toFixed(4),
          depthMeters: Math.floor(28 + Math.random() * 8),
        },
        status,
        capacity: 7.5,
        powerOutput,
        windSpeed,
        rotorSpeed,
        pitchAngle: +(1.2 + Math.random() * 0.8).toFixed(1),
        yawAngle: 235.0,
        temperature: {
          generator: genTemp,
          gearbox: gearTemp,
          ambient: 29,
          nacelle: 34,
        },
        vibration: vib,
        healthScore,
        availability,
        lastMaintenance: new Date(Date.now() - Math.floor(Math.random() * 60 + 10) * 24 * 3600 * 1000),
        nextInspection: new Date(Date.now() + Math.floor(Math.random() * 45 + 5) * 24 * 3600 * 1000),
        operatingHours: Math.floor(40000 + Math.random() * 6000),
        historicalLog,
      });

      turbineIndex++;
    }
  }

  const seededTurbines = await Turbine.insertMany(turbinesData);
  console.log(`[Seed Engine] Seeded ${seededTurbines.length} Turbines.`);

  console.log('[Seed Engine] Seeding Maintenance Work Orders...');
  const maintenanceOrders = await Maintenance.create([
    {
      workOrderId: 'WO-1042',
      turbine: 'WT-024',
      issue: 'Gearbox vibration above threshold',
      description: 'Accelerometers show 3.8 mm/s vibration near intermediate shaft bearings. Field technician boarding via SOV Sea Explorer.',
      priority: 'High',
      assignedTo: 'Arun Kumar',
      scheduledDate: new Date(Date.now() + 1 * 24 * 3600 * 1000),
      status: 'In Progress',
      vesselRequired: 'Sea Explorer (SOV)',
      estimatedHours: 6,
      notes: [
        { author: 'Arun Kumar', text: 'Boarded WT-024 transition piece. Acoustic sensors deployed on gearbox housing.' },
      ],
    },
    {
      workOrderId: 'WO-1038',
      turbine: 'WT-017',
      issue: 'Main bearing lubrication flush & filter replacement',
      description: 'Automated greasing canister dry alarm triggered. Scheduled replenishment and oil sample extraction.',
      priority: 'High',
      assignedTo: 'Nils Lindholm',
      scheduledDate: new Date(Date.now() - 2 * 24 * 3600 * 1000), // overdue
      status: 'Overdue',
      vesselRequired: 'Nordic Valkyrie (CTV)',
      estimatedHours: 4,
      notes: [{ author: 'System', text: 'Service delayed past scheduled window due to wave swell > 2.5m.' }],
    },
    {
      workOrderId: 'WO-1035',
      turbine: 'WT-031',
      issue: 'Subsea power export cable joint resistance anomaly',
      description: 'Phase B impedance fluctuation observed on 66kV inter-array string.',
      priority: 'Critical',
      assignedTo: 'Subsea Specialist Team',
      scheduledDate: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      status: 'Overdue',
      vesselRequired: 'Ocean Horizon (Survey Vessel)',
      estimatedHours: 12,
    },
    {
      workOrderId: 'WO-1031',
      turbine: 'WT-038',
      issue: 'Yaw motor drive pinion gear replacement',
      description: 'Yaw brake hydraulic actuator seal leakage causing intermittent yaw positioning error.',
      priority: 'High',
      assignedTo: 'Kasper Holm',
      scheduledDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      status: 'Overdue',
      vesselRequired: 'Sea Explorer (SOV)',
      estimatedHours: 8,
    },
    {
      workOrderId: 'WO-1044',
      turbine: 'WT-009',
      issue: 'Pitch cylinder hydraulic valve recalibration',
      description: 'Blade 2 pitch response lag of 140ms detected during rapid gust feathering test.',
      priority: 'Medium',
      assignedTo: 'Arun Kumar',
      scheduledDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
      status: 'Scheduled',
      vesselRequired: 'Nordic Valkyrie (CTV)',
      estimatedHours: 5,
    },
    {
      workOrderId: 'WO-1045',
      turbine: 'WT-042',
      issue: 'Converter cooling loop de-ionization filter swap',
      description: 'Coolant conductivity approaching 0.45 uS/cm upper threshold.',
      priority: 'Medium',
      assignedTo: 'Soren Olsen',
      scheduledDate: new Date(Date.now() + 4 * 24 * 3600 * 1000),
      status: 'Scheduled',
      vesselRequired: 'Nordic Valkyrie (CTV)',
      estimatedHours: 3,
    },
    {
      workOrderId: 'WO-1046',
      turbine: 'WT-045',
      issue: 'Nacelle anemometer ultrasonic transducer cleaning',
      description: 'Salt crusting on secondary cup anemometer causing 0.6 m/s wind reading deviation.',
      priority: 'Low',
      assignedTo: 'Nils Lindholm',
      scheduledDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      status: 'Scheduled',
      vesselRequired: 'None',
      estimatedHours: 2,
    },
    {
      workOrderId: 'WO-1029',
      turbine: 'WT-004',
      issue: 'Blade lightning receptor conductivity verification',
      description: 'Annual spark gap resistance audit following a southwest monsoon squall event.',
      priority: 'Low',
      assignedTo: 'Rope Access Team 1',
      scheduledDate: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      status: 'Completed',
      completedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000),
      estimatedHours: 6,
    },
    {
      workOrderId: 'WO-1025',
      turbine: 'WT-012',
      issue: 'SCADA optical fiber splice repair inside transition piece',
      description: 'OTDR identified 3.2 dB attenuation on core fiber pair 7.',
      priority: 'Medium',
      assignedTo: 'Tech Comms Unit',
      scheduledDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      status: 'Completed',
      completedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000),
      estimatedHours: 4,
    },
  ]);
  console.log(`[Seed Engine] Seeded ${maintenanceOrders.length} Maintenance Work Orders.`);

  console.log('[Seed Engine] Seeding Inspections...');
  const inspections = await Inspection.create([
    {
      inspectionId: 'INS-2001',
      turbine: 'WT-024',
      type: 'Gearbox Inspection',
      inspector: 'Elena Rostova',
      scheduledDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
      status: 'SCHEDULED',
      method: 'Borescope NDT',
      findings: 'Awaiting borescope camera insertion through sun gear port.',
      severityFound: 'None',
    },
    {
      inspectionId: 'INS-2002',
      turbine: 'WT-008',
      type: 'Blade Inspection',
      inspector: 'Elena Rostova',
      scheduledDate: new Date(Date.now() + 1 * 24 * 3600 * 1000),
      status: 'SCHEDULED',
      method: 'Drone / UAV',
      findings: 'Autonomous high-res photographic drone sweep of 82m blade leading edges.',
      severityFound: 'None',
    },
    {
      inspectionId: 'INS-2003',
      turbine: 'WT-033',
      type: 'Subsea Inspection',
      inspector: 'DeepScan Marine Ops',
      scheduledDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      status: 'IN PROGRESS',
      method: 'ROV Subsea',
      findings: 'ROV actively inspecting monopile scour protection rock dump at depth 34m.',
      severityFound: 'Minor',
    },
    {
      inspectionId: 'INS-2004',
      turbine: 'WT-017',
      type: 'Structural Inspection',
      inspector: 'Elena Rostova',
      scheduledDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      status: 'OVERDUE',
      method: 'Rope Access',
      findings: 'Overdue statutory bolt torque check on tower flange section 3.',
      severityFound: 'Moderate',
    },
    {
      inspectionId: 'INS-2005',
      turbine: 'WT-011',
      type: 'Electrical Inspection',
      inspector: 'Jonas Dahl',
      scheduledDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      status: 'SCHEDULED',
      method: 'Sensory Ultrasound',
      findings: 'Scheduled infrared thermal scan on 33kV GIS switchgear.',
      severityFound: 'None',
    },
    {
      inspectionId: 'INS-2006',
      turbine: 'WT-048',
      type: 'Foundation Inspection',
      inspector: 'Marine GeoTech',
      scheduledDate: new Date(Date.now() + 6 * 24 * 3600 * 1000),
      status: 'SCHEDULED',
      method: 'ROV Subsea',
      findings: 'Secondary transition piece grout seal ultrasonic integrity check.',
      severityFound: 'None',
    },
    {
      inspectionId: 'INS-2007',
      turbine: 'WT-001',
      type: 'Blade Inspection',
      inspector: 'Elena Rostova',
      scheduledDate: new Date(Date.now() - 14 * 24 * 3600 * 1000),
      status: 'COMPLETED',
      method: 'Drone / UAV',
      findings: 'Minor leading edge erosion on suction side tip. Category 1, monitor in 6 months.',
      severityFound: 'Minor',
      completedAt: new Date(Date.now() - 13 * 24 * 3600 * 1000),
    },
    {
      inspectionId: 'INS-2008',
      turbine: 'WT-015',
      type: 'Gearbox Inspection',
      inspector: 'Elena Rostova',
      scheduledDate: new Date(Date.now() + 8 * 24 * 3600 * 1000),
      status: 'SCHEDULED',
      method: 'Borescope NDT',
      findings: 'Standard 24-month planetary gear tooth pitting verification.',
      severityFound: 'None',
    },
    {
      inspectionId: 'INS-2009',
      turbine: 'WT-022',
      type: 'Electrical Inspection',
      inspector: 'Jonas Dahl',
      scheduledDate: new Date(Date.now() + 9 * 24 * 3600 * 1000),
      status: 'SCHEDULED',
      method: 'Visual Walkthrough',
      findings: 'Inverter busbar torque verification and surge arrester check.',
      severityFound: 'None',
    },
    {
      inspectionId: 'INS-2010',
      turbine: 'WT-036',
      type: 'Structural Inspection',
      inspector: 'Elena Rostova',
      scheduledDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      status: 'SCHEDULED',
      method: 'Visual Walkthrough',
      findings: 'Internal tower ladder fall arrest rail and hoist cable audit.',
      severityFound: 'None',
    },
    {
      inspectionId: 'INS-2011',
      turbine: 'WT-040',
      type: 'Blade Inspection',
      inspector: 'Elena Rostova',
      scheduledDate: new Date(Date.now() + 12 * 24 * 3600 * 1000),
      status: 'SCHEDULED',
      method: 'Drone / UAV',
      findings: 'Aerodynamic vortex generator strip detachment inspection.',
      severityFound: 'None',
    },
    {
      inspectionId: 'INS-2012',
      turbine: 'WT-006',
      type: 'Subsea Inspection',
      inspector: 'DeepScan Marine Ops',
      scheduledDate: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      status: 'SCHEDULED',
      method: 'ROV Subsea',
      findings: 'J-tube bellmouth bend restrictor alignment verification.',
      severityFound: 'None',
    },
  ]);
  console.log(`[Seed Engine] Seeded ${inspections.length} Inspections.`);

  console.log('[Seed Engine] Seeding Marine Weather & Forecast...');
  const forecast = [];
  const nowTime = new Date();
  for (let i = 0; i < 48; i += 2) {
    const fTime = new Date(nowTime.getTime() + i * 3600 * 1000);
    const hour = fTime.getHours().toString().padStart(2, '0') + ':00';
    const waveSin = Math.sin(i / 8) * 0.8;
    const windSin = Math.sin(i / 6) * 4.5;

    const wHeight = Math.max(1.1, +(2.6 + waveSin).toFixed(1));
    const wSpeed = Math.max(6.0, +(15.0 + windSin).toFixed(1));
    const wPeriod = +(6.5 + wHeight * 0.6).toFixed(1);

    let opStatus = 'SAFE';
    if (wHeight > 2.2 || wSpeed > 15) opStatus = 'RESTRICTED';
    else if (wHeight > 1.8 || wSpeed > 12) opStatus = 'MARGINAL';

    forecast.push({
      time: hour,
      timestamp: fTime,
      windSpeed: wSpeed,
      windDirection: 'SW 225°',
      waveHeight: wHeight,
      wavePeriod: wPeriod,
      visibility: wSpeed > 16 ? 12 : 18,
      precipitation: wHeight > 2.2 ? 40 : 5,
      operationalStatus: opStatus,
    });
  }

  await Weather.create({
    location: 'Tamil Nadu Offshore Wind Farm - Gulf of Mannar Offshore Zone',
    timestamp: new Date(),
    windSpeed: 15.0,
    windDirection: 'SW 225°',
    waveHeight: 2.6,
    wavePeriod: 7.9,
    visibility: 14,
    seaTemperature: 28,
    airTemperature: 29,
    currentSpeed: 1.6,
    barometricPressure: 1006,
    operationalStatus: 'RESTRICTED',
    operationalWindow: {
      status: 'SAFE',
      nextSafeWindow: 'Tomorrow 08:00 – 13:00 (monsoon window)',
      maxSafeWaveHeight: 2.0,
      maxSafeWindSpeed: 12.0,
      currentWaveHeight: 2.6,
      currentWindSpeed: 15.0,
    },
    forecast,
  });
  console.log('[Seed Engine] Seeded Marine Weather & Forecast timeline.');

  console.log('[Seed Engine] Seeding Marine Vessels...');
  const vessels = await Vessel.create([
    {
      name: 'SEA EXPLORER',
      callsign: 'SOV-311',
      type: 'Service Operation Vessel',
      status: 'Active', // On Site / Active
      location: {
        description: 'Tuticorin Port - Gulf of Mannar Offshore Zone - WT-024 Gangway Attached',
        x: 48,
        y: 45,
        lat: 9.02,
        lng: 78.26,
        heading: 190,
      },
      speedKnots: 0.2,
      assignedTurbine: 'WT-024',
      eta: '07:40',
      crew: 12,
      maxCapacity: 60,
      weatherSuitability: 'OPERATIONAL',
      maxHs: 2.5,
      fuelLevel: 88,
    },
    {
      name: 'NORDIC VALKYRIE',
      callsign: 'CTV-104',
      type: 'Crew Transfer Vessel',
      status: 'En Route',
      location: {
        description: 'Chennai Port - Tamil Nadu Offshore Operations toward WT-017',
        x: 32,
        y: 60,
        lat: 13.12,
        lng: 80.34,
        heading: 35,
      },
      speedKnots: 21.5,
      assignedTurbine: 'WT-017',
      eta: '08:15',
      crew: 6,
      maxCapacity: 14,
      weatherSuitability: 'OPERATIONAL',
      maxHs: 1.8,
      fuelLevel: 74,
    },
    {
      name: 'OCEAN HORIZON',
      callsign: 'SRV-802',
      type: 'Subsea Survey Vessel',
      status: 'On Site',
      location: {
        description: 'Mundra Port - Gujarat Offshore Wind Zone - WT-033 Survey Station',
        x: 65,
        y: 70,
        lat: 21.48,
        lng: 69.22,
        heading: 110,
      },
      speedKnots: 2.1,
      assignedTurbine: 'WT-033',
      eta: 'On Site',
      crew: 8,
      maxCapacity: 20,
      weatherSuitability: 'OPERATIONAL',
      maxHs: 2.2,
      fuelLevel: 82,
    },
    {
      name: 'BALTIC PHOENIX',
      callsign: 'CTV-109',
      type: 'Crew Transfer Vessel',
      status: 'At Port',
      location: {
        description: 'Jawaharlal Nehru Port - Marine Terminal Berth 3',
        x: 12,
        y: 88,
        lat: 18.95,
        lng: 72.95,
        heading: 0,
      },
      speedKnots: 0.0,
      assignedTurbine: 'None',
      eta: '--:--',
      crew: 4,
      maxCapacity: 14,
      weatherSuitability: 'OPERATIONAL',
      maxHs: 1.8,
      fuelLevel: 96,
    },
    {
      name: 'NORTHERN SENTINEL',
      callsign: 'TUG-405',
      type: 'Tug & Anchor Handler',
      status: 'At Port',
      location: {
        description: 'Cochin Port - Standby Mooring',
        x: 16,
        y: 92,
        lat: 9.95,
        lng: 76.02,
        heading: 0,
      },
      speedKnots: 0.0,
      assignedTurbine: 'None',
      eta: '--:--',
      crew: 10,
      maxCapacity: 25,
      weatherSuitability: 'OPERATIONAL',
      maxHs: 3.5,
      fuelLevel: 91,
    },
    {
      name: 'PACIFIC PROTECTOR',
      callsign: 'SOV-520',
      type: 'Service Operation Vessel',
      status: 'Returning',
      location: {
        description: 'Mumbai Port - Konkan Offshore Zone Return Channel',
        x: 25,
        y: 75,
        lat: 18.92,
        lng: 72.84,
        heading: 220,
      },
      speedKnots: 14.2,
      assignedTurbine: 'Mumbai Port',
      eta: '11:30',
      crew: 14,
      maxCapacity: 60,
      weatherSuitability: 'OPERATIONAL',
      maxHs: 2.5,
      fuelLevel: 68,
    },
    {
      name: 'VIKING ENDEAVOUR',
      callsign: 'HLV-901',
      type: 'Heavy Lift Crane Vessel',
      status: 'Weather Delayed',
      location: {
        description: 'Deendayal Port, Kandla - Gulf of Kutch Outer Anchorage',
        x: 82,
        y: 25,
        lat: 22.82,
        lng: 69.05,
        heading: 270,
      },
      speedKnots: 0.5,
      assignedTurbine: 'WT-038',
      eta: 'Delayed (Hs > 2.5m)',
      crew: 22,
      maxCapacity: 80,
      weatherSuitability: 'EXCEEDED',
      maxHs: 2.0,
      fuelLevel: 79,
    },
  ]);
  console.log(`[Seed Engine] Seeded ${vessels.length} Marine Vessels.`);

  console.log('[Seed Engine] Seeding Alerts...');
  const alerts = await Alert.create([
    {
      title: 'HIGH VIBRATION',
      type: 'TURBINE_TELEMETRY',
      severity: 'Critical',
      turbine: 'WT-024',
      description: 'Gearbox intermediate stage vibration measured at 3.82 mm/s (threshold: 3.0 mm/s). Technician on site.',
      status: 'Active',
      createdAt: new Date(Date.now() - 8 * 60 * 1000), // 8 min ago
    },
    {
      title: 'WEATHER WARNING',
      type: 'WEATHER_WARNING',
      severity: 'Warning',
      turbine: 'Gulf of Mannar Offshore Zone',
      description: 'Wave height expected to exceed 3.0m in the Gulf of Mannar Offshore Zone within the next 6 hours. CTV boarding restrictions advised.',
      status: 'Active',
      createdAt: new Date(Date.now() - 24 * 60 * 1000), // 24 min ago
    },
    {
      title: 'MAINTENANCE OVERDUE',
      type: 'MAINTENANCE_OVERDUE',
      severity: 'Warning',
      turbine: 'WT-017',
      description: 'Scheduled gearbox lubrication service overdue by 48 hours. Asset output held in offline state.',
      status: 'Active',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000), // 2 hrs ago
    },
    {
      title: 'PITCH ACTUATOR CALIBRATION',
      type: 'TURBINE_TELEMETRY',
      severity: 'Warning',
      turbine: 'WT-009',
      description: 'Blade 2 pitch response lag of 140ms detected during rapid gust feathering test.',
      status: 'Active',
      createdAt: new Date(Date.now() - 4 * 3600 * 1000),
    },
    {
      title: 'ROV SUBSEA SCAN COMPLETE',
      type: 'SAFETY',
      severity: 'Information',
      turbine: 'WT-033',
      description: 'Cathodic anode corrosion baseline verified by Ocean Horizon ROV unit. Scour protection intact.',
      status: 'Acknowledged',
      acknowledgedBy: 'Marcus Vance',
      acknowledgedAt: new Date(Date.now() - 3 * 3600 * 1000),
      createdAt: new Date(Date.now() - 5 * 3600 * 1000),
    },
    {
      title: 'VESSEL SAFETY ZONE ENTRY',
      type: 'VESSEL_SAFETY',
      severity: 'Information',
      turbine: 'WT-024',
      description: 'SOV Sea Explorer successfully initiated walk-to-work gangway connection to WT-024 transition deck.',
      status: 'Acknowledged',
      acknowledgedBy: 'Sarah Lindqvist',
      acknowledgedAt: new Date(Date.now() - 30 * 60 * 1000),
      createdAt: new Date(Date.now() - 50 * 60 * 1000),
    },
  ]);
  console.log(`[Seed Engine] Seeded ${alerts.length} Alerts.`);

  console.log('[Seed Engine] Seeding Baseline Reports...');
  const reports = await Report.create([
    {
      reportId: 'REP-3001',
      name: 'Turbine Performance Report - 2026-09-01',
      type: 'Turbine Performance Report',
      generatedBy: 'Marcus Vance',
      date: new Date(Date.now() - 6 * 24 * 3600 * 1000),
      status: 'READY',
      summary: {
        totalRecords: 48,
        keyMetric: '42 / 48 Online',
        notes: 'Monthly fleet generation review across 360 MW installed capacity.',
      },
      csvContent: 'TurbineID,Name,Status,CapacityMW,PowerOutputMW\nWT-001,Turbine WT-001,ONLINE,7.5,7.2\nWT-002,Turbine WT-002,ONLINE,7.5,7.1',
    },
    {
      reportId: 'REP-3002',
      name: 'Maintenance Report - 2026-09-04',
      type: 'Maintenance Report',
      generatedBy: 'Sarah Lindqvist',
      date: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      status: 'READY',
      summary: {
        totalRecords: 9,
        keyMetric: '2 Completed, 3 Overdue',
        notes: 'Work order resolution and outstanding offshore technician tasks.',
      },
      csvContent: 'WorkOrderID,Turbine,Issue,Priority,Status\nWO-1042,WT-024,Gearbox vibration,High,In Progress\nWO-1038,WT-017,Lubrication,High,Overdue',
    },
    {
      reportId: 'REP-3003',
      name: 'Monthly Operations Report - August 2026',
      type: 'Monthly Operations Report',
      generatedBy: 'Sarah Lindqvist',
      date: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      status: 'READY',
      summary: {
        totalRecords: 5,
        keyMetric: '96.8% Fleet Availability',
        notes: 'Executive high-level operational synthesis for asset owners and investors.',
      },
      csvContent: 'Metric,Value,Unit,Compliance\nFleet Capacity,360,MW,100%\nAvailability,96.8,%,Exceeded',
    },
  ]);
  console.log(`[Seed Engine] Seeded ${reports.length} Reports.`);

  console.log('====================================================');
  console.log('[Seed Engine] WINDOPS DATABASE SEED COMPLETED!');
  console.log('Demo Credentials:');
  console.log(' - Admin: admin@windops.io / windops123');
  console.log(' - Ops Manager: ops@windops.io / windops123');
  console.log(' - Maintenance Engineer: tech@windops.io / windops123');
  console.log(' - Inspector: inspector@windops.io / windops123');
  console.log('====================================================');

  process.exit(0);
};

seedData().catch((err) => {
  console.error('[Seed Engine] Fatal error during seed:', err);
  process.exit(1);
});
