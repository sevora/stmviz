/*
 * This is for logging the algorithmic process
 * through each iteration for visualization reference.
 */
class ProcessLogger {
    constructor() {
        this.history = [];
        this.index = { start: null, end: null };
    }

    /*
     * Use this method to mark
     * the beginning of the current log.
     */
    beginProcess() {
        this.index.start = this.history.length;
    }

    /*
     * Use this method to mark
     * the end of the current log.
     */
    endProcess() {
        this.index.end = this.history.length;
    }

    /*
     * Add a process, provide a process name and its
     * contents.
     */
    addProcess(process, content) {
        this.history.push({ process, content });
    }

    /*
     * Returns a shallow copy of
     * the contents of the log BEFORE
     * the current marks.
     */
    getBefore() {
        return this.history.slice(0, this.index.start);
    }

    /*
     * Returns a shallow copy of the contents of the log
     * INSIDE the current mark.
     */
    getCurrent() {
        return this.history.slice(this.index.start, this.index.end);
    }

    /*
     * Returns a shallow copy of
     * the contents of the log AFTER
     * the current marks.
     */
    getAfter() {
        return this.history.slice(this.index.end);
    }

}
