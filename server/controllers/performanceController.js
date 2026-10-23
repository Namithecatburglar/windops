const Turbine = require('../models/Turbine');

// @desc    Get overall wind farm performance analytics
// @route   GET /api/performance
// @access  Private
const getPerformanceAnalytics = async (req, res, next) => {
  try {
    const { timeframe = 'MONTH' } = req.query; // DAY, WEEK, MONTH, YEAR
    const turbines = await Turbine.find({}).sort({ turbineId: 1 });

    const totalCapacity = 360; // 48 x 7.5MW = 360 MW
    const currentOutput = turbines.reduce(
      (sum, t) => sum + (t.status === 'ONLINE' || t.status === 'WARNING' ? t.powerOutput : 0),
      0
    );
    const onlineCount = turbines.filter((t) => t.status === 'ONLINE').length;
    const capacityFactor = +((currentOutput / totalCapacity) * 100).toFixed(1);
    const availability = +((onlineCount / turbines.length) * 100).toFixed(1);

    // Generate time series data tailored for Recharts based on timeframe
    let productionData = [];
    let downtimeData = [];

    if (timeframe === 'DAY') {
      // 24 hours
      for (let h = 0; h < 24; h++) {
        const timeLabel = `${h.toString().padStart(2, '0')}:00`;
        const factor = 0.8 + Math.sin(h / 3) * 0.15;
        const actualMWh = +(300 * factor + (Math.random() - 0.5) * 15).toFixed(1);
        const forecastMWh = +(305 * factor).toFixed(1);
        const lossesMWh = +(18 + (1 - factor) * 15).toFixed(1);

        productionData.push({
          label: timeLabel,
          actual: actualMWh,
          forecast: forecastMWh,
          curtailment: 4.2,
          losses: lossesMWh,
        });

        downtimeData.push({
          label: timeLabel,
          scheduledMaintenance: h >= 6 && h <= 10 ? 12 : 2,
          unscheduledFault: h === 14 ? 8 : 1.5,
          gridCurtailment: 3.0,
        });
      }
    } else if (timeframe === 'WEEK') {
      // 7 days
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      days.forEach((day, idx) => {
        const factor = 0.85 + Math.sin(idx) * 0.1;
        productionData.push({
          label: day,
          actual: +(7200 * factor).toFixed(0),
          forecast: +(7400 * factor).toFixed(0),
          losses: +(380 + (Math.random() - 0.5) * 40).toFixed(0),
        });

        downtimeData.push({
          label: day,
          scheduledMaintenance: 4.5 + idx * 0.5,
          unscheduledFault: 2.1,
          gridCurtailment: 1.8,
        });
      });
    } else if (timeframe === 'YEAR') {
      // 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach((m, idx) => {
        const seasonFactor = idx < 3 || idx > 9 ? 1.15 : 0.82; // Higher offshore wind in winter
        productionData.push({
          label: m,
          actual: +(225000 * seasonFactor).toFixed(0),
          forecast: +(220000 * seasonFactor).toFixed(0),
          losses: +(12400 * seasonFactor).toFixed(0),
        });

        downtimeData.push({
          label: m,
          scheduledMaintenance: 3.2,
          unscheduledFault: 2.8,
          gridCurtailment: 1.4,
        });
      });
    } else {
      // MONTH: 30 days
      for (let d = 1; d <= 30; d++) {
        const label = `Day ${d}`;
        const windCycle = 0.82 + Math.sin(d / 4) * 0.16;
        const actualMWh = +(7100 * windCycle + (Math.random() - 0.5) * 200).toFixed(0);
        const forecastMWh = +(7050 * windCycle).toFixed(0);

        productionData.push({
          label,
          actual: actualMWh,
          forecast: forecastMWh,
          losses: 340,
        });

        if (d % 3 === 0) {
          downtimeData.push({
            label,
            scheduledMaintenance: +(3.0 + Math.random() * 2).toFixed(1),
            unscheduledFault: +(1.2 + Math.random() * 1.5).toFixed(1),
            gridCurtailment: 0.8,
          });
        }
      }
    }

    // Individual turbine comparison ranking
    const turbineComparison = turbines.map((t) => ({
      turbineId: t.turbineId,
      name: t.name,
      zone: t.location.zone,
      status: t.status,
      powerOutput: t.powerOutput,
      capacity: t.capacity,
      windSpeed: t.windSpeed,
      availability: t.availability,
      healthScore: t.healthScore,
      operatingHours: t.operatingHours,
    }));

    res.json({
      success: true,
      data: {
        summary: {
          installedCapacity: totalCapacity,
          currentOutput: +currentOutput.toFixed(1),
          capacityFactor,
          availability,
          totalTurbines: turbines.length,
          onlineTurbines: onlineCount,
          energyLossesYTD: '14.2 GWh',
          carbonOffsetYTD: '412,000 tCO2e',
        },
        timeframe,
        productionData,
        downtimeData,
        turbineComparison,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPerformanceAnalytics,
};
