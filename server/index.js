// Require SDK module
if (!process.env.SWEEPJS_DIR) {
  console.log("Please specify sweepjs install directory.\n\
               i.e.) env SWEEPJS_DIR=$HOME/sweep-sdk/sweepjs npm start\n");
  process.exit(1);
}

console.log(process.env.SWEEPJS_DIR);
const sweepjs = require(process.env.SWEEPJS_DIR);

// sweepjs
const sweep = new sweepjs.Sweep('/dev/ttyUSB0');

// Check device status
const ready = sweep.getMotorReady(); // true if device is ready (calibration routine complete + motor speed stabilized)
const speed = sweep.getMotorSpeed(); // integer value between 0:10 (in HZ)
const rate  = sweep.getSampleRate(); // integer value, either 500, 750 or 1000 (in HZ)

sweep.startScanning();

// Start ws server
const wss = require('ws').Server({port: 5000});

wss.on('connection', ws => {
  setInterval(pushScanInto(ws), 200);
});

const fmod = (a,b) => { 
  return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); 
};

// Websocket
const pushScanInto = ws => {
  return () => {
    
    sweep.scan((err, samples) => {
      if (err) return;

      ws.send(JSON.stringify({removeFromScene: true}), error => {});
      samples.forEach((sample) => {
        const message = {
          ready: ready,
          speed: speed,
          rate: rate,
          degree: fmod(sample.angle / 1000. + 90., 360), // From milli degree to degree and adjust to device orientation
          distance: sample.distance,
          signal: sample.signal,
          removeFromScene: false
        };
        ws.send(JSON.stringify(message), error => {/**/});
      });
    });
  };
}