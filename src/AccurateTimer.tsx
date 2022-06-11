class ImprovedSetInterval {
  interval: number
  start: () => void
  stop: () => void

  constructor(callback: () => void, interval: number) {
    let that = this;
    let expected: number;
    let timeout: NodeJS.Timeout;
    let isRunning: boolean;
    this.interval = interval;

    this.start = function() {
      isRunning = true;
      expected = Date.now() + this.interval;
      timeout = setTimeout(step, this.interval);
    }

    this.stop = function() {
      isRunning = false;
    }

    function step() {
      if(!isRunning) {
        clearTimeout(timeout);
      } else {
        let drift = Date.now() - expected;
        callback();
        expected += that.interval;
        timeout = setTimeout(step, Math.max(0, that.interval-drift));
      }
    }
  }
}

export default ImprovedSetInterval;
