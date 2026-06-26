/**
 * Artillery Processor for IoT Load Test
 * 
 * Custom processor for generating realistic IoT device data
 * and calculating performance metrics
 */

module.exports = {
  // Generate realistic timestamp
  generateTimestamp: function(context, events, done) {
    context.vars.timestamp = new Date().toISOString();
    return done();
  },
  
  // Generate random device ID from pool
  generateDeviceId: function(context, events, done) {
    const devices = ['sensor-001', 'sensor-002', 'sensor-003', 'sensor-004', 'sensor-005'];
    context.vars.device_id = devices[Math.floor(Math.random() * devices.length)];
    return done();
  },
  
  // Generate realistic sensor data
  generateSensorData: function(context, events, done) {
    // Temperature: 25-35°C (realistic range for broiler sheds)
    const temperature = (25 + Math.random() * 10).toFixed(1);
    
    // Humidity: 50-80%
    const humidity = Math.floor(50 + Math.random() * 30);
    
    // Ammonia: 5-20 ppm
    const ammonia = Math.floor(5 + Math.random() * 15);
    
    // Water flow: 10-15 L/min
    const waterFlow = (10 + Math.random() * 5).toFixed(1);
    
    context.vars.data = {
      temperature: parseFloat(temperature),
      humidity: humidity,
      ammonia: ammonia,
      water_flow: parseFloat(waterFlow)
    };
    
    return done();
  },
  
  // Custom metrics calculation
  calculateMetrics: function(context, events, done) {
    if (context.vars.success === 'true') {
      events.emit('counter', 'iot.readings.success');
    } else {
      events.emit('counter', 'iot.readings.failure');
    }
    return done();
  }
};
