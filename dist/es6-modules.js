/*
 * Returns a boolean indicating whether the given configuration is 
 * valid or not. It basically counts all the entities' occurence and they 
 * must all occur
 */
function isValidAlgorithmConfiguration(configuration) {
    let counter = { male: {}, female: {} };
    let male = configuration.male.map(entity => entity.name);
    let female = configuration.female.map(entity => entity.name);
    let flat = [...configuration.male, ...configuration.female];

    // Checks if all names are unique whether 
    // they be on the same group or not.
    let names = flat.map(x => x.name);
    if (new Set(names).size !== names.length) return false;

    // This loop counts every object of every group
    // and adds one for each time it counts it.
    for (let entity of flat) {
        let { name: name1, preferences } = entity;
        
        // if any required property is undefined then the configuration
        // is invalid
        if (!entity || !name1 || !preferences) return false;
        let group1 = female.indexOf(name1) == -1 ? 'male' : 'female';
        
        counter[group1][name1] = !counter[group1][name1] ? 1 : counter[group1][name1] + 1;
        for (let name2 of preferences) {
            let group2 = group1 == 'male' ? 'female' : 'male'
            counter[group2][name2] = !counter[group2][name2] ? 1 : counter[group2][name2] + 1;
        }
    }

    // For the configuration to be valid, all entities
    // of the same group must have the same number of countings.
    for (let group in counter) {
        let counts = Object.values(counter[group]);
        if ( !counts.every(x => x == counts[0]) ) return false;
    }

    return true;
}

/* 
 * Class Abstraction for Stable Marriage Entity.
 *
 * This object stores its own parent (instance of Stable Marriage), name (a string name for people),
 * and preferences (an array of strings of other people that is arranged from the person whom this entity
 * likes the most to the person it likes the least.)
 */
class SMEntity {
    
    constructor(parent, name, preferences) {
        this.parent = parent;
        this.name = name;
        this.partner = null;
        this.preferences = [];
        this._preferences = preferences;
        this.rejects = [];

        // Instead of the names stored into the preference list,
        // their indices will be stored instead.
        for (name of preferences) {
            this.preferences.push(this.parent.getIndexByName(name) );
        }

    }

    /*
     * Returns a boolean indicating if another entity has takes on higher
     * preference compared to the current partner.
     */
    changePartnerFor(entity) {
        if (this.partner == null) return true;
        let partnerIndex = this.parent.getIndexByName(this.partner.name);
        let otherIndex = this.parent.getIndexByName(entity.name);
        if (this.preferences.indexOf(partnerIndex) > this.preferences.indexOf(otherIndex)) {
            return true;
        } 
        return false;
    }

    /*
     * Adds an entity to the rejection list.
     * In the algorithm, this prevents the same entity from
     * retrying on an engagement with this given entity.
     */
    addRejection(entity) {
        entity.rejects.push(this.parent.getIndexByName(this.name));
        this.rejects.push(this.parent.getIndexByName(entity.name));
    }

    /*
     * Returns an index (relative to parent's array) of the currently highest preferred entity that has not 
     * rejected this entity.
     */
    getNonRejectedPreferenceIndex() {
        for (let index = 0; index < this.preferences.length; ++index) {
            if (this.rejects.indexOf(this.preferences[index]) == -1) return this.preferences[index];
        }
        return -1;
    }

}

/*
 * Simulates the whole stable marriage 
 * algorithm. Needs a proper configuration
 * as constructor parameter.
 */
class StableMarriage {
    constructor(configuration, nameIndexMap) {
        this.log = new ProcessLogger();

        this.nameIndex = nameIndexMap ? nameIndexMap : {};
        this.male = [];
        this.female = [];
        this.single = [];
        this.nosolution = [];

        // This iteration prepares a dictionary for
        // O(1) time complexity on later lookups.
        if(Object.keys(this.nameIndex).length == 0) for (let group in configuration) {
            for (let index = 0; index < configuration[group].length; ++index) {
                let { name } = configuration[group][index];
                this.nameIndex[name] = index;
            }
            
        }
        
        // Instantiate all males and also put them on the single array.
        for (let entity of configuration.male) {
            let { name, preferences } = entity;
            this.male.push(new SMEntity(this, name, preferences));
            this.single.push(this.male[this.male.length-1]);
        }

        // Instantiate all females.
        for (let entity of configuration.female) {
            let { name, preferences } = entity;
            this.female.push(new SMEntity(this, name, preferences));
        }
    }

    /*
     * Returns the index of any entity regardless of what group it belongs to
     * in O(1) time referring to either male or female array of this object.
     */
    getIndexByName(name) {
        return this.nameIndex[name];
    }

    /* 
     * This sets two entities
     * as the partner of one 
     * another.
     */
    engage(male, female) {
        male.partner = female;
        female.partner = male;
    }

    /*
     * Runs the algorithm by one iteration.
     * Use the method isDone() to see whether the algorithm
     * is finished or not.
     */
    iterate() {
        if ( this.isDone() ) return;

        // Mark the beginning of the current log.
        this.log.beginProcess();

        // Get a male who still has a female to propose to.
        // Get a female who is on the top of the list of the male
        // and has not rejected the male as well.
        let male = this.single[0];
        let female = this.female[male.getNonRejectedPreferenceIndex()];

        // In case a male has proposed to all possible females
        // and have been rejected by all (somehow), then add him
        // to the nosolution array.
        if (male.rejects.length == this.female.length) {
            this.nosolution.push( this.single.shift() );
            return;
        }

        this.log.addProcess('prepare', { male, female });

        // If the male and female are both free,
        if (female.partner == null) {
            // engage them. This will remove the male from
            // the single list.
            this.engage(male, female);
            this.single.shift();
            this.log.addProcess('engage', { male, female });
        // Otherwise if the female has a partner,
        } else if (female.partner) {
            let currentPartner = female.partner;
            // check if the female prefers the new male over her
            // current partner.
            if (female.changePartnerFor(male)) {
                // If this male is preferred,
                // then the current partner will 
                // be dumped 
                currentPartner.addRejection(currentPartner.partner);
                currentPartner.partner = null;
                this.single.push(this.male[this.getIndexByName(currentPartner.name)]);

                // and the new male will become
                // the new partner.
                this.engage(male, female);
                this.single.shift();
                // Male in break refers to the new partner of this female.
                this.log.addProcess('break', { male, female, dumped: currentPartner });
            } else {
                // Otherwise the new male is rejected completely by the female.
                male.addRejection(female);
                // male in reject refers to the rejected male of the female.
                this.log.addProcess('reject', { male, female });
            }
        }

        this.log.addProcess('done', { male, female });

        // Mark the end of the log
        this.log.endProcess();

    }

    /*
     * Returns a boolean indicating
     * if the stable marriage algorithm
     * is finished.
     */
    isDone() {
        return this.single.length == 0 ? true : false
    }


}

/*
 * This is for all the defaults of the application
 * such as the default input, default random names,
 * and more.
 */

// Refers to the minimum number of entity
// for configuration to be valid.
const defaultEntityCountMinimum = 1;

// Refers to the maximum number of entity
// for configuration to be valid.
const defaultEntityCountMaximum = 10;

// Refers to the maximum number of characters
// a name of an entity has.
const defaultEntityNameMaximum = 12;

// Default configuration, already following the defaults.
const defaultAlgorithmConfiguration = {
    male: [
        { 
            name: 'Conrad',
            preferences: ['Sophie', 'Nicole', 'Emma', 'Olivia', 'Ava']
        },
        {
            name: 'Joshua',
            preferences: ['Ava', 'Nicole', 'Sophie', 'Emma', 'Olivia']
        },
        {
            name: 'William',
            preferences: ['Sophie', 'Olivia', 'Nicole', 'Ava', 'Emma']
        },
        {
            name: 'Lucas',
            preferences: ['Nicole', 'Emma', 'Ava', 'Sophie', 'Olivia']
        },
        {
            name: 'Oliver',
            preferences: ['Olivia', 'Emma', 'Nicole', 'Ava', 'Sophie']
        }
    ],

    female: [
        {
            name: 'Ava',
            preferences: ['Conrad', 'Joshua', 'William', 'Lucas', 'Oliver']
        },
        {
            name: 'Emma',
            preferences: ['Joshua', 'William', 'Conrad', 'Lucas', 'Oliver']
        },
        {
            name: 'Nicole',
            preferences: ['Oliver', 'Conrad', 'Lucas', 'William', 'Joshua']
        },
        {
            name: 'Olivia',
            preferences: ['Oliver', 'Lucas', 'Joshua', 'William', 'Conrad']
        },
        {
            name: 'Sophie',
            preferences: ['Lucas', 'Joshua', 'Oliver', 'Conrad', 'William']
        }
    ]
};

// 50 male names sorted alphabetically. Used for random initializations.
const maleNames = [
'Aiden', 'Alexander', 'Andrew', 'Anthony', 'Asher', 'Benjamin', 'Caleb', 'Carter', 'Christopher', 'Daniel', 
'David', 'Dylan', 'Elijah', 'Ethan', 'Gabriel', 'Grayson', 'Henry', 'Issac', 'Jack', 'Jackson', 
'Jacob', 'James', 'Jaxon', 'Jayden', 'John', 'Joseph', 'Joshua', 'Julian', 'Leo', 'Levi',
'Liam', 'Lincoln', 'Logan', 'Lucas', 'Luke', 'Mason', 'Mateo', 'Matthew', 'Michael', 'Nathan', 
'Noah', 'Oliver', 'Owen', 'Ryan', 'Samuel', 'Sebastian', 'Theodore', 'Thomas', 'William', 'Wyatt'
];

// 50 female names sorted alphabetically. Used for random initializations.
const femaleNames = [
'Abigail', 'Addison', 'Amelia', 'Aria', 'Aubrey', 'Audrey', 'Aurora', 'Ava', 'Avery', 'Bella', 
'Brooklyn', 'Camila', 'Charlotte', 'Chloe', 'Claire', 'Eleanor', 'Elizabeth', 'Ella', 'Ellie', 'Emily',
'Emma', 'Evelyn', 'Grace', 'Hannah', 'Harper', 'Hazel', 'Isabella', 'Layla', 'Leah', 'Lillian', 'Lily',
'Luna', 'Madison', 'Mia', 'Mila', 'Natalie', 'Nora', 'Olivia', 'Penelope', 'Riley', 'Savannah', 'Scarlett',
'Skylar', 'Sofia', 'Sophia', 'Stella', 'Victoria', 'Violet', 'Zoe', 'Zoey'
];

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

/*
 * This script is for orientation checks.
 * Makes sure that the device is in landscape.
 */
const mainGridDOM = document.getElementById('main-grid');
const orientationWarningDOM = document.getElementById('orientation-warning');

/*
 * This hides the main grid and displays a message
 * if the orientation is wrong.
 */
function mainGridOrientationCheck() {
    if (window.innerHeight >= window.innerWidth) {
        mainGridDOM.style.display = 'none';
        orientationWarningDOM.style.display = 'block';
        return;
    } 
    mainGridDOM.style.removeProperty('display');
    orientationWarningDOM.style.removeProperty('display');
}

window.addEventListener('resize', function() { mainGridOrientationCheck(); });

mainGridOrientationCheck();

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
