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
