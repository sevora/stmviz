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
