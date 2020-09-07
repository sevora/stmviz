/*
 * This is used for making 
 * timeout queues which are
 * timeouts that are to be
 * executed after another timeout
 * has finished.
 */
class TimeoutQueue {
    constructor() {
        this.queue = [];
        this.disable = false;
    }

    /* 
     * Accepts a callback function and 
     * duration on how long before it is 
     * called. Skip parameter is for the inner
     * workings of this class.
     */
    add(callback, duration, skip=false) {
        if (!skip) this.queue.push({ callback, duration, active: false, done: false });
        if (this.disable) return;

        let current = this.queue[0];        
        if (current && !current.active && !current.done) {
            this.queue[0].active = true;
            setTimeout(function() {
                try {
                    this.queue[0].done = true;
                    current.callback();
                    this.queue.shift();
                    this.add(null, null, true);
                } catch(e) {

                }
            }.bind(this), current.duration);
        }
    }

    /*
     * Method to stop the timeout queue
     * from executing temporarily.
     */
    pause() {
        this.disable = true;
    }

    /*
     * Method to completely
     * reset the timeout queue.
     */
    clear() {
        this.queue = [];
    }

    /*
     * Method to continue the timeout
     * queue if it has been paused.
     */
    continue() {
        this.disable = false;
        this.add(null, null, true);
    }
}
