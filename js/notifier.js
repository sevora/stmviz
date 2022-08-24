/*
 * This is a queuable notification
 * message. Used in the notifier 
 * container.
 */
class Notifier {
    constructor(element) {
        this.element = element;
        this.queueLimit = 5;
        this.queue = [];
    }

    /* 
     * Method to show a message from queue.
     * Not used publicly.
     */
    show(type, message, duration, callback) {
        this.element.classList.add(type);
        this.element.innerHTML = message;
        
        setTimeout(function() {
            this.element.className = '';
            callback.bind(this)();
        }.bind(this), duration);
    }

    /*
     * This is the only method meant to be
     * used in public. This queues a message
     * that appears as long as given duration.
     * Type value is [valid|warning|error|<any valid class name>].
     */
    queueMessage(type='empty', message='', duration=1500) {
        if (type !== 'empty' && this.queue.length + 1 <= this.queueLimit) {
            this.queue.push({ type, message, duration, active: false, done: false });
        }

        let current = this.queue[0]; 
        if (current && !current.active && !current.done) {
            this.queue[0].active = true;
            this.show(current.type, current.message, current.duration, function() {
                this.queue[0].done = true;
                this.queue.shift();
                this.queueMessage();
            });
        }

    }
}
