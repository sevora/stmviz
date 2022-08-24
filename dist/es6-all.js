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

/*
 * This script contains the main things that happen
 * with the software. 
 * 
 * OVERVIEW:
 * NON-DOM DEPENDENT FUNCTIONS
 * DOM DEPENDENT FUNCTIONS
 *      - NON-EVENT CALLBACKS
 *      - TIMEOUT QUEUE
 *      - ENTITY EVENT CALLBACKS
 *      - ENTITY CREATION Line
 *      - CONTROL EVENT CALLBACKS I (Randomize, Reset to Default, Save, Load)
 *      - VISUALIZATION FUNCTIONS
 *      - CONTROL EVENT CALLBACKS II (Play, Skip, Pause, Stop)
 */

// These are the elements that contains a representation
// of entities for the algorithm.
const maleDOM = document.getElementById('male');
const groundDOM = document.getElementById('ground');
const femaleDOM = document.getElementById('female');

// These are special elements for adding more entities in either group.
const maleAddDOM = document.getElementById('male-add');
const femaleAddDOM = document.getElementById('female-add');

// These are the elements inside the control group.
const controlsDOM = document.getElementById('main-controls');
const randomConfigurationDOM = document.getElementById('random-configuration');
const resetDefaultDOM = document.getElementById('reset-default');
const saveConfigurationDOM = document.getElementById('save-configuration');
const fileInputDOM = document.getElementById('file-input');
const fileInputLabelDOM = document.getElementById('file-input-label');
const playVisualizationDOM = document.getElementById('play-visualization');
const pauseVisualizationDOM = document.getElementById('pause-visualization');
const stopVisualizationDOM = document.getElementById('stop-visualization');
const skipVisualizationDOM = document.getElementById('skip-visualization');

//
const notifier = new Notifier(document.getElementById('notifier'));

//
let stableMarriageConfiguration;
let stableMarriageAlgorithm;
let stableMarriageNameIndex;
let stableMarriageProcessQueue = [];
let stableMarriageVisualizationRunning = false;
let stableMarriageVisualizationDone = false;

let animationQueue = new TimeoutQueue();

/*
 * Accepts an object and returns a clone
 * instead of a reference.
 */
function clone(object) {
    return JSON.parse( JSON.stringify(object) );
}

/*
 * Accepts an array and returns the same array where the order
 * of elements have been shuffled. Mutates the original array.
 */
function shuffleArray(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/*
 * Accepts an array and an integer referring to the size of the output array,
 * this returns an array of random elements from a given array.
 */
function randomArrayOfSize(array, size) {
    // Clone is used to prevent mutating the original array.
    let shuffledArray = shuffleArray( clone(array) ); 
    return shuffledArray.slice(0, size);
}

function createRandomConfiguration(maleCount, femaleCount) {
    // Get the names for each group.
    let randomMaleNames = randomArrayOfSize(maleNames, maleCount);
    let randomFemaleNames = randomArrayOfSize(femaleNames, femaleCount);
    let configuration = { male: [], female: [] };

    // Append each new entity on their corresponding group
    // with a shuffled preference array.
    for (let male of randomMaleNames) {
        configuration.male.push({ name: male, preferences: shuffleArray(clone(randomFemaleNames)) })
    }

    // Does the same for females.
    for (let female of randomFemaleNames) {
        configuration.female.push({ name: female, preferences: shuffleArray(clone(randomMaleNames)) });
    }

    return configuration;
}


/*
 * Accepts a string 'male' or 'female' and
 * returns a random name that can be found in configuration.js
 */
function getRandomName(gender) {
    if (gender == 'male') {
        return maleNames[Math.floor(Math.random() * maleNames.length)];
    } else if (gender == 'female') {
        return femaleNames[Math.floor(Math.random() * femaleNames.length)];
    }
}

/*
 * Returns a javascript object (dictionary) with
 * the names in configuration file as keys and their index
 * in their group is the value. Used for O(1) lookup.
 */
function nameIndexMap(configuration) {
    let map = {};
    for (let group in configuration) {
        for (let index = 0; index < configuration[group].length; ++index) {
            let { name } = configuration[group][index];
            map[name] = index;
        }    
    } 
    return map;
}

/*
 * Returns a javascript object (dictionary) with the names
 * in the DOM as keys and their index in DOM as value. Used for O(1) lookup.
 */
function getDOMNameIndexMap() {
    let map = {};
    for (let entityDOM of [...maleDOM.children, ...femaleDOM.children]) {
        if (entityDOM.classList.contains('entity')) {
            let inputDOM = entityDOM.querySelector('.name input');
            map[inputDOM.value] = parseInt(inputDOM.dataset.index);
        }
    }
    return map;
}

/*
 * Returns an algorithm configuration 
 * from the DOM.
 */
function getDOMConfiguration() {
    let configuration = { male: [], female: [] };

    for (let entityDOM of [...maleDOM.children, ...femaleDOM.children]) {
        // Skip this iteration if the entity is the add-entity element.
        if (entityDOM.classList.contains('add-entity')) continue;
        let group = entityDOM.parentNode == maleDOM ? 'male' : 'female';

        // Get the name and preferences,
        let name = entityDOM.querySelector('.name input').value;
        let preferences = [];

        // The preferences are looked up by iterating through the preference list.
        let preferenceListDOM = entityDOM.querySelector('.preference');
        for (let preferenceDOM of preferenceListDOM.children) {
            preferences.push(preferenceDOM.innerText);
        }

        configuration[group].push({ name, preferences });
    }

    return configuration;
}

/*
 * Accepts data (can be string) a filename and the mime type
 * this causes a file to be saved on to the client.
 */
function clientSaveFile(data, filename, type) {
    let file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, filename);
    } else { // Others
        let a = document.createElement("a");
        let url = URL.createObjectURL(file);
        
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();
        
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

/*
 * Accepts an entityDOM element can be made using 
 * createSMEntityElement function. Returns height measurements (in px) if
 * the entity is expanded.
 */
function calculateOpenEntityHeight(entityDOM) {
    let preferenceListDOM = entityDOM.querySelector('.preference');
    let extraHeight = preferenceListDOM.children[0].offsetHeight * preferenceListDOM.children.length;
    // An original height is stored on the first time hooking of click event (line 195).
    if (!entityDOM.dataset.originalHeight) {
        entityDOM.dataset.originalHeight = entityDOM.offsetHeight;
    }
    return parseInt(entityDOM.dataset.originalHeight) + extraHeight;
};

/*
 * Event callback for entity preference click (this occurs when the angle right button is clicked).
 * This callback expands the element to the right height.
 */
function entityPreferenceClick(event) {
    // event.currentTarget.parent.parent.classList.toggle('edit');
    let baseEntityDOM = event.currentTarget.parentElement.parentElement;
    if (!baseEntityDOM.dataset.originalHeight) baseEntityDOM.dataset.originalHeight = baseEntityDOM.offsetHeight;

    if (baseEntityDOM.classList.contains('edit-preference')) {
        baseEntityDOM.style.removeProperty('min-height');
    } else {
        baseEntityDOM.style.minHeight = calculateOpenEntityHeight(baseEntityDOM) + 'px';
    }
    baseEntityDOM.classList.toggle('edit-preference');
}

/*
 * Event callback for when the name of an entity is changed through input.
 * Disables all non-alphabetical including whitespace from being inputted,
 * and updates all the preferences associated with the name.
 */
function entityNameInput(event) {
    // The first part of this is to remove any special characters
    // being input.
    let element = event.currentTarget;
    let count = element.selectionStart;
    // This regex matches any non-alphabetical character.
    let regex = /[^a-z]/gi;
    let value = element.value;
    if(regex.test(value)) {
        element.value = value.replace(regex, '');
        count--;
    }
    element.setSelectionRange(count, count);

    // The next part is updating all associated
    // preferences on the other group
    // with the same index as this element.
    let baseEntity = event.srcElement.parentElement.parentElement;
    let updateGroup = baseEntity.parentElement == maleDOM ? femaleDOM : maleDOM;

    for (let index = 0; index < updateGroup.children.length - 1; ++index) {
        let preferences = updateGroup.children[index].querySelector('.preference');
        for (let preference of preferences.children) {
             if (preference.dataset.index == element.dataset.index) preference.innerHTML = element.value;
        }
    }

}

/*
 * Event for when an entity's remove button is clicked.
 * Before this element is completely removed, the indices of its
 * siblings are recalculated and so are the preference list of the
 * other group.
 */
function entityRemoveClick(event) {
    let baseEntityDOM = event.currentTarget.parentNode.parentNode;
    let groupDOM = baseEntityDOM.parentNode;
    
    // Does not allow the number of entities to drop 
    // below the minimum entity count set by default.
    if (groupDOM.children.length - 1 <= defaultEntityCountMinimum) {
        notifier.queueMessage('warning', `Number of entities cannot go below minimum (${defaultEntityCountMinimum}).`, 500);
        return;
    }

    let otherGroupDOM = groupDOM == maleDOM ? femaleDOM : maleDOM;
    let inputDOM = baseEntityDOM.querySelector('.name input');
    let currentIndex = inputDOM.dataset.index;

    // Updates the index of the elements with indices higher than 
    // that of this element by subtracting those by 1.
    for (let entityDOM of groupDOM.children) {
        if (entityDOM == baseEntityDOM || entityDOM.classList.contains('add-entity')) continue;
        let entityInputDOM = entityDOM.querySelector('.name input');
        let index = parseInt(entityInputDOM.dataset.index);
        if (currentIndex < index) {
            entityInputDOM.dataset.index = index - 1;
        }
    }

    // Removes this element from the preference list of the 
    // entities on the other group.
    for (let entityDOM of otherGroupDOM.children) {
        // This approach is done for O(n) time complexity instead of O(2n)
        if (entityDOM.classList.contains('add-entity')) continue;
        let preferenceListDOM = entityDOM.querySelector('.preference');
        // The preference to be removed
        // and the preference that will take
        // over this preferences' index will remain
        // untouched.
        let preferenceDOMRemove;
        let preferenceDOMUnchanged;

        for (let preferenceDOM of preferenceListDOM.children) {
            let index = parseInt(preferenceDOM.dataset.index);

            if (index == currentIndex) {
                preferenceDOMRemove = preferenceDOM;
            } else if (index - 1 == currentIndex) {
                preferenceDOMUnchanged = preferenceDOM;
            } else if (index > currentIndex) {
                preferenceDOM.dataset.index = index - 1;
            }
        }

        // Only after the iteration are they manipulated to prevent wrong conditionals.
        // This changes that index to take over this element's index then removes the original
        // preference element.
        if (preferenceDOMUnchanged) preferenceDOMUnchanged.dataset.index = parseInt(preferenceDOMUnchanged.dataset.index) - 1;
        preferenceDOMRemove.remove();

        // Also recalculate the height of the entity
        // whose preferences are manipulated if it is toggled.
        if (entityDOM.classList.contains('edit-preference')) entityDOM.style.minHeight = calculateOpenEntityHeight(entityDOM) + 'px';
    };

    // Finally remove this whole entity.
    baseEntityDOM.remove();
}

/*
 * Event for when the preference is dragged.
 * Allows the repositioning of all preferences through
 * user action of dragging and dropping.
 */
function preferenceDrag(event) {
    let preferenceDOM = event.target;
    let preferenceListDOM = preferenceDOM.parentNode;
    preferenceDOM.classList.add('dragging');

    let { clientX:x, clientY:y } = event;
    let otherPreferenceDOM = document.elementFromPoint(x, y);
    otherPreferenceDOM = otherPreferenceDOM == null ? preferenceDOM : otherPreferenceDOM;

    if (otherPreferenceDOM.parentNode == preferenceListDOM) {
        otherPreferenceDOM = otherPreferenceDOM !== preferenceDOM.nextSibling ? otherPreferenceDOM : otherPreferenceDOM.nextSibling;
        preferenceListDOM.insertBefore(preferenceDOM, otherPreferenceDOM);
    }

}

/*
 * Event for when the dragging is over.
 */
function preferenceDragEnd(event) {
    event.target.classList.remove('dragging');
}


/*
 * Returns an unset empty div with the proper
 * html for an smentity.
 */
function createSMEntityElement() {
    let root = document.createElement('div');
    root.className = 'entity';

    root.innerHTML = `
        <div class="name">
            <button class="toggle-preference"><i class="fas fa-angle-right"></i></button> 
            <input maxlength="${defaultEntityNameMaximum}" type="text" value="Name" placeholder="Enter Name">
            <button class="remove-entity"><i class="fas fa-trash"></i></button>
        </div>
        <div class="preference">
            <!-- Put prefs here separated with <div> tags -->
        </div>

    `;
    return root;
}

/*
 * Initializes an smentity element by
 * setting the name and preferences properly
 * through a nameIndex(map). This can also
 * reinitialize existing smentity element with
 * values already set.
 */
function initializeEntityElement(entityDOM, nameIndex, name, preferences) {
    let nameDOM = entityDOM.querySelector('.name input');
    let toggleButton = entityDOM.querySelector('.name .toggle-preference');
    let removeButton = entityDOM.querySelector('.name .remove-entity');
    let preferenceListDOM = entityDOM.querySelector('.preference');

    // Reset the name and index 
    // through the parameter values.
    nameDOM.value = name;
    nameDOM.dataset.index = nameIndex[name];

    nameDOM.oninput = entityNameInput;

    // Make sure to hook the events only once.
    if (toggleButton.getAttribute('haslistener') != 'true') toggleButton.addEventListener('click', entityPreferenceClick);
    if (removeButton.getAttribute('haslistener') != 'true')removeButton.addEventListener('click', entityRemoveClick);

    // Hooking events is done by adding an extra attribute
    // that is set upon initialization.
    toggleButton.setAttribute('haslistener', 'true');
    removeButton.setAttribute('haslistener', 'true');

    // The preference list is not cleared out then appended with preferences.
    // Instead, if there are already existing preference element, those will be overwritten
    // and new preference elements are made as needed.
    for (let index = 0; index < preferences.length; ++index) {
        let preference = preferences[index];
        let preferenceDOM;
        
        // Conditional for if a preference element is needed to be made.
        if (preferenceListDOM.children.length - 1 < index) {
            // This creates a whole new element.
            preferenceDOM = document.createElement('div');
            preferenceDOM.addEventListener('drag', preferenceDrag);
            preferenceDOM.addEventListener('dragend', preferenceDragEnd);
            preferenceListDOM.appendChild(preferenceDOM);
        } else {
            // Otherwise just use the existing preference element.
            preferenceDOM = preferenceListDOM.children[index];
        }
        preferenceDOM.draggable = true;
        preferenceDOM.dataset.index = nameIndex[preference];
        preferenceDOM.innerHTML = preference;
    }

    // Removes the excess preference elements if there are any.
    for (let index = preferenceListDOM.children.length - 1; index >= preferences.length; --index) {
        preferenceListDOM.children[index].remove();
    }
    
    return entityDOM;
}

/*
 * Sets up the DOM with a given configuration.
 * Changes necessary elements to fit the configuration
 * removes excess, adds if needed.
 */
function populateDOM(configuration) {
    let nameIndex = nameIndexMap(configuration);
    let timeoutQueue = new TimeoutQueue();

    // This allows iteration in both groups.
    for (let group in configuration) {
        let groupDOM = group == 'male' ? maleDOM : femaleDOM;
        let groupAddDOM = group == 'male' ? maleAddDOM : femaleAddDOM;
        let groupDOMExcess = (groupDOM.children.length - 1) - configuration[group].length;
        
        for (let index = 0; index < configuration[group].length; ++index) {
            let { name, preferences } = configuration[group][index];
            // This either creates a new element or assigns an existing one,
            let entityDOM;
            if (index < groupDOM.children.length - 1) {
                entityDOM = groupDOM.children[index];
            } else {
                entityDOM = createSMEntityElement();
                entityDOM.style.opacity = '0';
                groupDOM.insertBefore(entityDOM, groupAddDOM);
                timeoutQueue.add(function() {
                    entityDOM.style.removeProperty('opacity');
                }, 100)
            }
            // Then it is initialized.
            initializeEntityElement(entityDOM, nameIndex, name, preferences);
            // If the entity is active, its height is recalculated.
            if (entityDOM.classList.contains('edit-preference')) {
                entityDOM.style.minHeight = calculateOpenEntityHeight(entityDOM) + 'px';
            }
        }

        // Remove excess entities.
        for (let index = groupDOM.children.length - 2; index >= configuration[group].length; --index) {
            groupDOM.children[index].remove();
        } 

    }

}

/*
 * Event for when the add entity element is clicked.
 * Adds a new entity with random initialization values,
 * as in random name and random order of preferences.
 */
function addEntityClick(event) {
    let baseGroupDOM = event.currentTarget.parentNode;

    // Limits the add entity event from adding more if the maximum entity count
    // by default is reached.
    if (baseGroupDOM.children.length - 1 >= defaultEntityCountMaximum) {
        notifier.queueMessage('warning', `Maximum number of entities (${defaultEntityCountMaximum}) has been reached.`, 500)
        return;
    } else if (stableMarriageVisualizationRunning) {
        notifier.queueMessage('warning', 'Use stop button to edit configuration.');
        return;
    }
    
    let gender = baseGroupDOM == maleDOM ? 'male' : 'female';
    let otherGroupDOM = gender == 'male' ? femaleDOM : maleDOM;

    let entityDOM = createSMEntityElement();
    let nameIndex = getDOMNameIndexMap();

    let randomName;
    let preferences = [];
    // This loop gets a random name that is currently 
    // not used in the configuration.
    do {
        randomName = getRandomName(gender)
    } while (Object.keys(nameIndex).indexOf(randomName) != -1);
    nameIndex[randomName] = baseGroupDOM.children.length - 1;

    // This iteration adds the new entity on the preference list of the
    // opposite group.
    for (let otherEntityDOM of otherGroupDOM.children) {
        // Skip the add-entity element.
        if (otherEntityDOM.classList.contains('add-entity')) continue;

        let otherPreferenceListDOM = otherEntityDOM.querySelector('.preference');
        let newPreferenceDOM = document.createElement('div');

        newPreferenceDOM.draggable = true;
        newPreferenceDOM.dataset.index = nameIndex[randomName];
        newPreferenceDOM.innerHTML = randomName;

        newPreferenceDOM.addEventListener('drag', preferenceDrag);
        newPreferenceDOM.addEventListener('dragend', preferenceDragEnd);
        otherPreferenceListDOM.appendChild(newPreferenceDOM);

        let otherBaseEntityDOM = otherPreferenceListDOM.parentNode;
        if (otherBaseEntityDOM.classList.contains('edit-preference')) {
            otherBaseEntityDOM.style.minHeight = calculateOpenEntityHeight(otherBaseEntityDOM) + 'px';
        }

        preferences.push(otherEntityDOM.querySelector('.name input').value);
    }
    
    initializeEntityElement(entityDOM, nameIndex, randomName, shuffleArray(preferences));
    baseGroupDOM.insertBefore(entityDOM, event.currentTarget);
}

/*
 * Event for when the random configuration button is clicked.
 * Repopulates the DOM with a random configuration.
 */
function randomConfigurationClick(event) {
    let range = defaultEntityCountMaximum - defaultEntityCountMinimum;
    let randomMaleCount = Math.floor(Math.random() * (range + 1)) + defaultEntityCountMinimum;
    let randomFemaleCount = Math.floor(Math.random() * (range + 1)) + defaultEntityCountMinimum;
    populateDOM(createRandomConfiguration(randomMaleCount, randomFemaleCount));
    notifier.queueMessage('valid', 'Configuration has been randomized.', 500);
}

/*
 * Event for when the reset to default button is clicked.
 * Repopulates the DOM with the default algorithm configuration 
 * in configuration.js
 */
function resetDefaultClick(event) {
    populateDOM(defaultAlgorithmConfiguration);
    notifier.queueMessage('valid', 'Configuration has been reset to default.', 1000);
}

/*
 * Event for when the save configuration button is clicked.
 * Saves the configuration on the client as a json text file.
 */
function saveConfigurationClick(event) {
    let configuration = getDOMConfiguration();
    if (isValidAlgorithmConfiguration(configuration)) {
        clientSaveFile(JSON.stringify(getDOMConfiguration(), null, 4), 'configuration.json', 'application/json');
        notifier.queueMessage('valid', 'The configuration file is being saved at your device as configuration.json');
    } else {
        notifier.queueMessage('error', 'Configuration is invalid. Please use unique names for all entities.');
    }
}

/*
 * Accepts a configuration and may throw an error
 * if the configuration is valid. Used solely inside
 * try-catch blocks.
 */
function validateJSONConfiguration(configuration) {
    let { male, female } = configuration;
    if (!male || !Array.isArray(male)) {
        throw 'Missing male array in configuration object.';
    }
    if (!female || !Array.isArray(female)) {
        throw 'Missing female array in configuration object.';
    }
    if (male.length < defaultEntityCountMinimum) {
        throw 'Male array does not meet minimum length of required elements.';
    }
    if (male.length > defaultEntityCountMaximum) {
        throw 'Male array exceeds maximum length of required elements.';
    }
    if (female.length < defaultEntityCountMinimum) {
        throw 'Female array does not meet minimum length of required elements.';
    }
    if (female.length > defaultEntityCountMaximum) {
        throw 'Female array exceeds maximum length of required elements.';
    }

    for (let entity of [...male, ...female]) {
        let { name, preferences } = entity;
        if (!name || !preferences) throw 'An entity is missing required fields.';
        if (!(typeof name == 'string' || name instanceof String) || name.length > defaultEntityNameMaximum || /[^a-z]/gi.test(name) ) {
            throw 'An entity has an invalid name.';
        }
        if (!Array.isArray(preferences) || !preferences.every(x => (typeof x == 'string' || x instanceof String )) ) {
            throw 'An entity has invalid preferences.';
        }
    }

    if (!isValidAlgorithmConfiguration(configuration)) {
        throw 'The configuration is invalid due to inconsistencies in entity occurence.';
    }
}

/*
 * Called when the hidden file input is changed.
 * This handles when the user uses a configuration
 * file that they have.
 */
function fileInputChange(event) {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.addEventListener('load', function(readerEvent) {
        try {
            let configuration = JSON.parse(readerEvent.target.result);
            // This would throw an error if anything is wrong and prevent 
            // further lines in the same block from being executed;
            validateJSONConfiguration(configuration);

            notifier.queueMessage('valid', 'Configuration loaded successfully.');
            populateDOM(configuration);
        } catch(error) {
            // The notifier shows an error properly in the UI.
            notifier.queueMessage('error', error); 
        } finally {
            // Make sure to reset the value of this 
            // file input to reload the same file
            // if given the same file.
            event.target.value = '';
        }
    });
}

/*
 * Called to highlight an entity element with transition effect.
 * Uses animationQueue object to achieve this effect.
 */
function highlightEntityDOM(entityDOM) {
    animationQueue.add(function() { 
        entityDOM.scrollIntoView({ behavior: 'smooth', block: 'center' });
        entityDOM.classList.add('prepare'); 
    }, 250);
}

/*
 * Called to open an entity element in ground DOM.
 * Expands and scrolls to the element.
 */
function openAndSelectGroundDOM(groundEntityDOM, selectIndex) {
    animationQueue.add(function() { 
        groundEntityDOM.style.removeProperty('opacity');
    }, 250);
    
    animationQueue.add(function() { 
        groundEntityDOM.classList.add('expand-preference');;
        groundEntityDOM.style.minHeight = calculateOpenEntityHeight(groundEntityDOM) + 'px';
    }, 250);

    animationQueue.add(function() {
        groundEntityDOM.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);

    if (selectIndex != undefined) animationQueue.add(function() {
        groundEntityDOM.querySelector('.preference').children[selectIndex].classList.add('select-highlight');
    }, 500);
}

/*
 * Called to close an entity element in ground DOM.
 * Removes the class for expansion and removes minimum height.
 */
function closeGroundDOM(groundEntityDOM) {
    animationQueue.add(function() { 
        groundEntityDOM.classList.remove('expand-preference');
        groundEntityDOM.style.removeProperty('min-height');
    }, 500);
}

/*
 * Function to make the DOM elements interactable
 * when the algorithm is available. Used after the animation
 * or to skip the animation.
 */
function makeResultInteractable() {
    if (!stableMarriageAlgorithm) return;
    stableMarriageVisualizationRunning = true;
    stableMarriageVisualizationDone = true;

    // Stop the animation and make the
    // containers interactive again.
    animationQueue.clear();
    maleDOM.classList.remove('disabled');
    groundDOM.classList.remove('disabled');
    femaleDOM.classList.remove('disabled');

    // Removes all elements in ground container.
    groundDOM.innerHTML = '';

    // For all entities,
    for (let entity of [...stableMarriageAlgorithm.male, ...stableMarriageAlgorithm.female]) {
        let entityDOM = entity.element;
        let nameDOM = entityDOM.querySelector('.name input');
        let togglePreferenceDOM = entityDOM.querySelector('.name .toggle-preference');
        let removeEntityDOM = entityDOM.querySelector('.name .remove-entity');

        nameDOM.classList.add('disabled');
        // change the event listener to show them and their partner
        // on ground container when clicked in any way.
        togglePreferenceDOM.removeEventListener('click', entityPreferenceClick);
        entityDOM.addEventListener('click', entityPartnerShowClick);
        removeEntityDOM.removeEventListener('click', entityRemoveClick);
        
        entityDOM.classList.add('prepare');
        entityDOM.classList.remove('disabled');

        // This dictates the styling of those who have
        // partner and not.
        if (entity.partner !== null) {
            entityDOM.classList.add('marry');
        } else {
            entityDOM.classList.add('reject');
        }
    }
}

/*
 * Function to do a single step of animation in
 * the visualization. Uses animationQueue.
 */
function animationStep() {
    let { process, content } = stableMarriageProcessQueue.shift();
    let { male, female, dumped } = content;
   
    let groundMaleDOM;
    let groundFemaleDOM;

    // If the process is not called done,
    if (process !== 'done') {
        groundMaleDOM = male.element.cloneNode(true);
        groundFemaleDOM = female.element.cloneNode(true);

        groundMaleDOM.style.opacity = '0';
        groundFemaleDOM.style.opacity = '0';

        // then the ground elements are prepared,
        groundMaleDOM.classList.add('prepare');
        groundFemaleDOM.classList.add('prepare');
        groundMaleDOM.classList.add('disabled');
        groundFemaleDOM.classList.add('disabled');

        // and if the process is also not prepared,
        if (process !== 'prepare') {
            // then the ground male element can be added 
            // to the ground container.
            groundDOM.appendChild(groundMaleDOM);
            openAndSelectGroundDOM(groundMaleDOM, male._preferences.indexOf(female.name));
        }

    }

    if (process == 'prepare') {
        // The first step is prepare which is to highlight the
        // male element.
        highlightEntityDOM(male.element);
    } else if (process == 'engage') {
        // This is the animation
        // for engage.
        highlightEntityDOM(female.element);
        groundDOM.appendChild(groundFemaleDOM);
        openAndSelectGroundDOM(groundFemaleDOM);

        closeGroundDOM(groundMaleDOM);
        closeGroundDOM(groundFemaleDOM);

        animationQueue.add(function() {
            groundMaleDOM.classList.remove('reject');
            groundFemaleDOM.classList.remove('prepare');

            groundMaleDOM.classList.add('engage');
            groundFemaleDOM.classList.add('engage');
        }, 500);

        animationQueue.add(function() {
            male.element.classList.remove('reject');

            male.element.classList.add('engage');
            female.element.classList.add('engage');

            notifier.queueMessage('warning', `${male.name} is engaged with ${female.name}.`, 1000);
        }, 500);

    } else if (process == 'break') {
        // This is the animation for break.
        // Break means the female dumps a male
        // and gets a new partner.
        groundFemaleDOM.classList.add('engage'); 

        let oldPartnerIndex = female._preferences.indexOf(dumped.name);
        groundFemaleDOM.querySelector('.preference').children[oldPartnerIndex].classList.add('partner-highlight');

        groundDOM.appendChild(groundFemaleDOM);
        openAndSelectGroundDOM(groundFemaleDOM);

        animationQueue.add(function() {
            let preferenceDOM = groundFemaleDOM.querySelector('.preference');
            let maleIndex = female._preferences.indexOf(male.name);
            let oldPartnerIndex = female._preferences.indexOf(dumped.name);
            preferenceDOM.children[maleIndex].classList.add('select-highlight');
            
            notifier.queueMessage('warning', `${female.name} breaks up with current partner ${dumped.name} and engages with ${male.name}.`, 2000);
        }, 500);

        closeGroundDOM(groundMaleDOM);
        closeGroundDOM(groundFemaleDOM);

        animationQueue.add(function() {
            groundMaleDOM.classList.remove('reject');
            groundMaleDOM.classList.add('engage');

            male.element.classList.remove('reject');
            male.element.classList.add('engage');

            dumped.element.classList.remove('engage');
            dumped.element.classList.add('reject');
        }, 500);

    } else if (process == 'reject') {
        // This is the animation for reject. 
        // Reject means the female stays with
        // their current partner, opposite of 
        // break.
        groundFemaleDOM.classList.add('engage');
        let preferenceDOM = groundFemaleDOM.querySelector('.preference');
        let partnerIndex = female._preferences.indexOf(female.partner.name);
        preferenceDOM.children[partnerIndex].classList.add('partner-highlight');
        groundDOM.appendChild(groundFemaleDOM);

        openAndSelectGroundDOM(groundFemaleDOM);

        animationQueue.add(function() {
            let maleIndex = female._preferences.indexOf(male.name);
            preferenceDOM.children[maleIndex].classList.add('select-highlight');
        }, 250);

        closeGroundDOM(groundMaleDOM);
        closeGroundDOM(groundFemaleDOM);

        animationQueue.add(function() {
            groundMaleDOM.classList.remove('prepare');
            groundFemaleDOM.classList.remove('engage');
            
            groundMaleDOM.classList.add('reject');
            groundFemaleDOM.classList.add('reject');
            notifier.queueMessage('warning', `${female.name} stays with current partner ${female.partner.name} and rejects ${male.name}.`, 2000);
        }, 250);

        animationQueue.add(function() {
            male.element.classList.add('reject');
            female.element.classList.add('reject');
        }, 250);

        animationQueue.add(function() {
            female.element.classList.remove('reject');
            female.element.classList.add('engage');
        }, 250);

    } else if (process == 'done') { 
        // Animation for when the process is done.
        // Basically removes the elements.
        for (let child of groundDOM.children) {
            child.style.opacity = '0';
        }

        animationQueue.add(function() { 
            groundDOM.innerHTML = '';
        }, 250);
        
    }

    // This first conditional is called when
    // the visualization is finished.
    if (stableMarriageProcessQueue.length == 0) {
        skipVisualizationDOM.classList.add('disabled');
        makeResultInteractable();
        notifier.queueMessage('valid', 'Tap an entity to show its partner.');
    } else {
        // This conditional is called whenever there is still
        // anything to visualize.
        animationQueue.add(function() { animationStep() }, 250);
    }

}

/*
 * Event callback for when the play button is clicked.
 * This starts the animation but it validates the 
 * current configuration first.
 */
function playVisualizationClick(event) {
    // This first conditional is for when the stableMarriageAlgorithm is not visualizing and isn't done.
    if (!stableMarriageVisualizationDone && !stableMarriageVisualizationRunning) {
        stableMarriageConfiguration = getDOMConfiguration(); 

        // This makes sure the configuration is valid.
        if (!isValidAlgorithmConfiguration(stableMarriageConfiguration)) {
            notifier.queueMessage('warning', 'Configuration is invalid. Please use unique names for all entities.');
            return;
        }

        // Initializes the required variables.
        stableMarriageNameIndex = nameIndexMap(stableMarriageConfiguration);
        stableMarriageAlgorithm = new StableMarriage(getDOMConfiguration(), stableMarriageNameIndex);
        stableMarriageProcessQueue = [];

        // Makes the algorithm compute all and
        // save each process.
        while(!stableMarriageAlgorithm.isDone()) {
            stableMarriageAlgorithm.iterate();
            stableMarriageProcessQueue.push(...stableMarriageAlgorithm.log.getCurrent());
        }

        // Make sure the animationQueue is not disabled.
        animationQueue.disable = false;

        // Disable controls except for play, skip, pause, and stop.
        for (let controlDOM of controlsDOM.children) {
            if (controlDOM == pauseVisualizationDOM || controlDOM == stopVisualizationDOM || controlDOM == skipVisualizationDOM) {
                controlDOM.classList.remove('disabled');
            } else if (controlDOM !== playVisualizationDOM) {
                controlDOM.classList.add('disabled');
            }
        }       

        // Make the containers uninteractive,
        maleDOM.classList.add('disabled');
        femaleDOM.classList.add('disabled');
        // including their elements.
        for (let group in stableMarriageConfiguration) {
            let baseGroupDOM = group == 'male' ? maleDOM : femaleDOM;
            for (let entity of stableMarriageAlgorithm[group]) {
                let entityDOM = baseGroupDOM.children[stableMarriageNameIndex[entity.name]];
                entityDOM.classList.remove('edit-preference');
                entityDOM.style.removeProperty('min-height');
                entityDOM.classList.add('disabled');
                // and set each entity in algorithm
                // its corresponding DOM element.
                entity.element = entityDOM;
            }
        }

        //stableMarriageVisualizationDone = false;
        notifier.queueMessage('valid', 'Visualization start.');
        stableMarriageVisualizationRunning = true;
        animationStep();
    // This second conditional is for when the visualization is paused.
    } else if (stableMarriageVisualizationRunning && animationQueue.disable) {
        animationQueue.continue();
        notifier.queueMessage('valid', 'Visualization continuing.');
    // Third conditional is for when the visualization is done, and the user
    // can only use stop to reset everything.
    } else {
        notifier.queueMessage('warning', 'Use the stop button to reset the visualization.');
    }
}

/*
 * Event callback for when pause button is clicked.
 * Uses animationQueue to pause animation.
 */
function pauseVisualizationClick(event) {
   if (animationQueue.disable || !stableMarriageVisualizationRunning || stableMarriageVisualizationDone) return;
    animationQueue.pause();
    notifier.queueMessage('valid', 'Visualization paused.');
}

/*
 * Event callback for when the stop button is clicked.
 * Resets all necessary variables, and resets the DOM.
 */
function stopVisualizationClick(event) {
    // Make sure to clear all the animation.
    animationQueue.clear();
    
    // Reset the necessary variables.
    stableMarriageAlgorithm = null;
    stableMarriageNameIndex = null;
    stableMarriageProcessQueue = [];
    stableMarriageVisualizationRunning = false;
    stableMarriageVisualizationDone = false;

    // Reset the controls to correct state.
    for (let controlDOM of controlsDOM.children) {
        if (controlDOM == pauseVisualizationDOM || controlDOM == stopVisualizationDOM || controlDOM == skipVisualizationDOM) {
            controlDOM.classList.add('disabled');
        } else {
            controlDOM.classList.remove('disabled');
        }
    }

    // Make the containers interactable.
    maleDOM.classList.remove('disabled');
    femaleDOM.classList.remove('disabled');
    groundDOM.classList.add('disabled');

    // Animate the removal of the entities.
    let timeoutQueue = new TimeoutQueue();
    for (let entityDOM of [...maleDOM.children, ...femaleDOM.children, ...groundDOM.children]) {
        if (entityDOM.classList.contains('add-entity')) continue;
        entityDOM.style.opacity = '0';
        timeoutQueue.add(function() {
            entityDOM.remove();
        }, 10);
    }

    // Repopulate the DOM.
    timeoutQueue.add(function() { populateDOM(stableMarriageConfiguration); }, 200);
}

/*
 * Event callback for when an entity is clicked,
 * this is only set as a callback AFTER the visualization
 * or when the visualization is skipped where the algorithm
 * has been computed.
 */
function entityPartnerShowClick(event) {
    let entityDOM = event.currentTarget;
    let index = entityDOM.querySelector('.name input').dataset.index;
    let gender = entityDOM.parentNode == maleDOM ? 'male' : 'female';
    let entity = stableMarriageAlgorithm[gender][index];

    // If the entity has a partner,
    if (entity.partner) {
        groundDOM.innerHTML = '';
        let { partner } = entity;
        let groundEntityDOM = entityDOM.cloneNode(true);
        let groundPartnerDOM = partner.element.cloneNode(true);
        let entityIndex = partner._preferences.indexOf(entity.name);
        let partnerIndex = entity._preferences.indexOf(partner.name);
        
        groundEntityDOM.querySelector('.preference').children[partnerIndex].classList.add('marry-highlight');
        groundPartnerDOM.querySelector('.preference').children[entityIndex].classList.add('marry-highlight');

        // show them both add ground container
        // with each other highlighted on one another's
        // preference list.
        groundDOM.appendChild(groundEntityDOM);
        groundDOM.appendChild(groundPartnerDOM);
        openAndSelectGroundDOM(groundEntityDOM);
        openAndSelectGroundDOM(groundPartnerDOM);
    } else {
        // Otherwise send a notifier message,
        notifier.queueMessage('warning', `${entity.name} has no partner.`);
    }
}

/*
 * Event callback for when skip
 * button is clicked.
 */
function skipVisualizationClick(event) {
    if (!stableMarriageVisualizationRunning || stableMarriageVisualizationDone) return;
    // The skip button is disabled right after skipping,
    event.currentTarget.classList.add('disabled');
    // and it skips the whole visualization.
    makeResultInteractable();
    notifier.queueMessage('valid', 'Toggle an entity with their angle button to see their partner.');
}

// Populate the DOM with default configuration on 
// start.
populateDOM(defaultAlgorithmConfiguration);

// Found individually inside each group.
maleAddDOM.addEventListener('click', addEntityClick);
femaleAddDOM.addEventListener('click', addEntityClick);

// These are the controls found in the control group.
randomConfigurationDOM.addEventListener('click', randomConfigurationClick);
resetDefaultDOM.addEventListener('click', resetDefaultClick);
saveConfigurationDOM.addEventListener('click', saveConfigurationClick);
fileInputDOM.addEventListener('change', fileInputChange);
playVisualizationDOM.addEventListener('click', playVisualizationClick);
pauseVisualizationDOM.addEventListener('click', pauseVisualizationClick);
stopVisualizationDOM.addEventListener('click', stopVisualizationClick);
skipVisualizationDOM.addEventListener('click', skipVisualizationClick);

//# sourceMappingURL=es6-all.js.map