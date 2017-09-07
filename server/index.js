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
let ready = sweep.getMotorReady(); // true if device is ready (calibration routine complete + motor speed stabilized)
let speed = sweep.getMotorSpeed(); // integer value between 0:10 (in HZ)
let rate  = sweep.getSampleRate(); // integer value, either 500, 750 or 1000 (in HZ)

sweep.startScanning();

// Start ws server
const wss = require('ws').Server({port: 5000});

wss.on('connection', ws => {
  ws.on('message', data => {
    const msg = JSON.parse(data);

    if (msg.motorSpeed || msg.sampleRate) {
      sweep.stopScanning();
      try {
        if (msg.motorSpeed) {
          sweep.setMotorSpeed(msg.motorSpeed);
        } else {
          sweep.setSampleRate(msg.sampleRate);
        }
      } catch (error) {
        console.error(error);
        process.exit(1);
      }

      // Update device status
      ready = sweep.getMotorReady();
      speed = sweep.getMotorSpeed();
      rate  = sweep.getSampleRate();
      sweep.startScanning();
    }
  });

  serve(ws);
});

const serve = ws => {
  pushScanInto(ws)
  .then(() => serve(ws))
  .catch(e => console.log(e));
};

const fmod = (a,b) => {
  return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
};

// Websocket
const pushScanInto = ws => {
  return new Promise((resolve, reject) => {
    sweep.scan((error, samples) => {
      if (error) {
        reject(error);
      }

      ws.send(JSON.stringify({removeFromScene: true}), error => {
        if (error) {
          reject(error);
        }
      });

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
        ws.send(JSON.stringify(message), error => {
          if (error) {
            reject(error);
          }
        });
      });
      resolve();

    });
  });
};
