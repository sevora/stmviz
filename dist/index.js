"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/*
 * Returns a boolean indicating whether the given configuration is 
 * valid or not. It basically counts all the entities' occurence and they 
 * must all occur
 */
function isValidAlgorithmConfiguration(configuration) {
  var counter = {
    male: {},
    female: {}
  };
  var male = configuration.male.map(function (entity) {
    return entity.name;
  });
  var female = configuration.female.map(function (entity) {
    return entity.name;
  });
  var flat = [].concat(_toConsumableArray(configuration.male), _toConsumableArray(configuration.female)); // Checks if all names are unique whether 
  // they be on the same group or not.

  var names = flat.map(function (x) {
    return x.name;
  });
  if (new Set(names).size !== names.length) return false; // This loop counts every object of every group
  // and adds one for each time it counts it.

  var _iterator = _createForOfIteratorHelper(flat),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var entity = _step.value;
      var name1 = entity.name,
          preferences = entity.preferences; // if any required property is undefined then the configuration
      // is invalid

      if (!entity || !name1 || !preferences) return false;
      var group1 = female.indexOf(name1) == -1 ? 'male' : 'female';
      counter[group1][name1] = !counter[group1][name1] ? 1 : counter[group1][name1] + 1;

      var _iterator2 = _createForOfIteratorHelper(preferences),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var name2 = _step2.value;
          var group2 = group1 == 'male' ? 'female' : 'male';
          counter[group2][name2] = !counter[group2][name2] ? 1 : counter[group2][name2] + 1;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    } // For the configuration to be valid, all entities
    // of the same group must have the same number of countings.

  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  var _loop = function _loop(group) {
    var counts = Object.values(counter[group]);
    if (!counts.every(function (x) {
      return x == counts[0];
    })) return {
      v: false
    };
  };

  for (var group in counter) {
    var _ret = _loop(group);

    if (_typeof(_ret) === "object") return _ret.v;
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


var SMEntity = /*#__PURE__*/function () {
  function SMEntity(parent, name, preferences) {
    _classCallCheck(this, SMEntity);

    this.parent = parent;
    this.name = name;
    this.partner = null;
    this.preferences = [];
    this._preferences = preferences;
    this.rejects = []; // Instead of the names stored into the preference list,
    // their indices will be stored instead.

    var _iterator3 = _createForOfIteratorHelper(preferences),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        name = _step3.value;
        this.preferences.push(this.parent.getIndexByName(name));
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }
  /*
   * Returns a boolean indicating if another entity has takes on higher
   * preference compared to the current partner.
   */


  _createClass(SMEntity, [{
    key: "changePartnerFor",
    value: function changePartnerFor(entity) {
      if (this.partner == null) return true;
      var partnerIndex = this.parent.getIndexByName(this.partner.name);
      var otherIndex = this.parent.getIndexByName(entity.name);

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

  }, {
    key: "addRejection",
    value: function addRejection(entity) {
      entity.rejects.push(this.parent.getIndexByName(this.name));
      this.rejects.push(this.parent.getIndexByName(entity.name));
    }
    /*
     * Returns an index (relative to parent's array) of the currently highest preferred entity that has not 
     * rejected this entity.
     */

  }, {
    key: "getNonRejectedPreferenceIndex",
    value: function getNonRejectedPreferenceIndex() {
      for (var index = 0; index < this.preferences.length; ++index) {
        if (this.rejects.indexOf(this.preferences[index]) == -1) return this.preferences[index];
      }

      return -1;
    }
  }]);

  return SMEntity;
}();
/*
 * Simulates the whole stable marriage 
 * algorithm. Needs a proper configuration
 * as constructor parameter.
 */


var StableMarriage = /*#__PURE__*/function () {
  function StableMarriage(configuration, nameIndexMap) {
    _classCallCheck(this, StableMarriage);

    this.log = new ProcessLogger();
    this.nameIndex = nameIndexMap ? nameIndexMap : {};
    this.male = [];
    this.female = [];
    this.single = [];
    this.nosolution = []; // This iteration prepares a dictionary for
    // O(1) time complexity on later lookups.

    if (Object.keys(this.nameIndex).length == 0) for (var group in configuration) {
      for (var index = 0; index < configuration[group].length; ++index) {
        var name = configuration[group][index].name;
        this.nameIndex[name] = index;
      }
    } // Instantiate all males and also put them on the single array.

    var _iterator4 = _createForOfIteratorHelper(configuration.male),
        _step4;

    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var entity = _step4.value;
        var _name = entity.name,
            preferences = entity.preferences;
        this.male.push(new SMEntity(this, _name, preferences));
        this.single.push(this.male[this.male.length - 1]);
      } // Instantiate all females.

    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }

    var _iterator5 = _createForOfIteratorHelper(configuration.female),
        _step5;

    try {
      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
        var _entity = _step5.value;
        var _name2 = _entity.name,
            _preferences = _entity.preferences;
        this.female.push(new SMEntity(this, _name2, _preferences));
      }
    } catch (err) {
      _iterator5.e(err);
    } finally {
      _iterator5.f();
    }
  }
  /*
   * Returns the index of any entity regardless of what group it belongs to
   * in O(1) time referring to either male or female array of this object.
   */


  _createClass(StableMarriage, [{
    key: "getIndexByName",
    value: function getIndexByName(name) {
      return this.nameIndex[name];
    }
    /* 
     * This sets two entities
     * as the partner of one 
     * another.
     */

  }, {
    key: "engage",
    value: function engage(male, female) {
      male.partner = female;
      female.partner = male;
    }
    /*
     * Runs the algorithm by one iteration.
     * Use the method isDone() to see whether the algorithm
     * is finished or not.
     */

  }, {
    key: "iterate",
    value: function iterate() {
      if (this.isDone()) return; // Mark the beginning of the current log.

      this.log.beginProcess(); // Get a male who still has a female to propose to.
      // Get a female who is on the top of the list of the male
      // and has not rejected the male as well.

      var male = this.single[0];
      var female = this.female[male.getNonRejectedPreferenceIndex()]; // In case a male has proposed to all possible females
      // and have been rejected by all (somehow), then add him
      // to the nosolution array.

      if (male.rejects.length == this.female.length) {
        this.nosolution.push(this.single.shift());
        return;
      }

      this.log.addProcess('prepare', {
        male: male,
        female: female
      }); // If the male and female are both free,

      if (female.partner == null) {
        // engage them. This will remove the male from
        // the single list.
        this.engage(male, female);
        this.single.shift();
        this.log.addProcess('engage', {
          male: male,
          female: female
        }); // Otherwise if the female has a partner,
      } else if (female.partner) {
        var currentPartner = female.partner; // check if the female prefers the new male over her
        // current partner.

        if (female.changePartnerFor(male)) {
          // If this male is preferred,
          // then the current partner will 
          // be dumped 
          currentPartner.addRejection(currentPartner.partner);
          currentPartner.partner = null;
          this.single.push(this.male[this.getIndexByName(currentPartner.name)]); // and the new male will become
          // the new partner.

          this.engage(male, female);
          this.single.shift(); // Male in break refers to the new partner of this female.

          this.log.addProcess('break', {
            male: male,
            female: female,
            dumped: currentPartner
          });
        } else {
          // Otherwise the new male is rejected completely by the female.
          male.addRejection(female); // male in reject refers to the rejected male of the female.

          this.log.addProcess('reject', {
            male: male,
            female: female
          });
        }
      }

      this.log.addProcess('done', {
        male: male,
        female: female
      }); // Mark the end of the log

      this.log.endProcess();
    }
    /*
     * Returns a boolean indicating
     * if the stable marriage algorithm
     * is finished.
     */

  }, {
    key: "isDone",
    value: function isDone() {
      return this.single.length == 0 ? true : false;
    }
  }]);

  return StableMarriage;
}();
/*
 * This is for all the defaults of the application
 * such as the default input, default random names,
 * and more.
 */
// Refers to the minimum number of entity
// for configuration to be valid.


var defaultEntityCountMinimum = 1; // Refers to the maximum number of entity
// for configuration to be valid.

var defaultEntityCountMaximum = 10; // Refers to the maximum number of characters
// a name of an entity has.

var defaultEntityNameMaximum = 12; // Default configuration, already following the defaults.

var defaultAlgorithmConfiguration = {
  male: [{
    name: 'Conrad',
    preferences: ['Sophie', 'Nicole', 'Emma', 'Olivia', 'Ava']
  }, {
    name: 'Joshua',
    preferences: ['Ava', 'Nicole', 'Sophie', 'Emma', 'Olivia']
  }, {
    name: 'William',
    preferences: ['Sophie', 'Olivia', 'Nicole', 'Ava', 'Emma']
  }, {
    name: 'Lucas',
    preferences: ['Nicole', 'Emma', 'Ava', 'Sophie', 'Olivia']
  }, {
    name: 'Oliver',
    preferences: ['Olivia', 'Emma', 'Nicole', 'Ava', 'Sophie']
  }],
  female: [{
    name: 'Ava',
    preferences: ['Conrad', 'Joshua', 'William', 'Lucas', 'Oliver']
  }, {
    name: 'Emma',
    preferences: ['Joshua', 'William', 'Conrad', 'Lucas', 'Oliver']
  }, {
    name: 'Nicole',
    preferences: ['Oliver', 'Conrad', 'Lucas', 'William', 'Joshua']
  }, {
    name: 'Olivia',
    preferences: ['Oliver', 'Lucas', 'Joshua', 'William', 'Conrad']
  }, {
    name: 'Sophie',
    preferences: ['Lucas', 'Joshua', 'Oliver', 'Conrad', 'William']
  }]
}; // 50 male names sorted alphabetically. Used for random initializations.

var maleNames = ['Aiden', 'Alexander', 'Andrew', 'Anthony', 'Asher', 'Benjamin', 'Caleb', 'Carter', 'Christopher', 'Daniel', 'David', 'Dylan', 'Elijah', 'Ethan', 'Gabriel', 'Grayson', 'Henry', 'Issac', 'Jack', 'Jackson', 'Jacob', 'James', 'Jaxon', 'Jayden', 'John', 'Joseph', 'Joshua', 'Julian', 'Leo', 'Levi', 'Liam', 'Lincoln', 'Logan', 'Lucas', 'Luke', 'Mason', 'Mateo', 'Matthew', 'Michael', 'Nathan', 'Noah', 'Oliver', 'Owen', 'Ryan', 'Samuel', 'Sebastian', 'Theodore', 'Thomas', 'William', 'Wyatt']; // 50 female names sorted alphabetically. Used for random initializations.

var femaleNames = ['Abigail', 'Addison', 'Amelia', 'Aria', 'Aubrey', 'Audrey', 'Aurora', 'Ava', 'Avery', 'Bella', 'Brooklyn', 'Camila', 'Charlotte', 'Chloe', 'Claire', 'Eleanor', 'Elizabeth', 'Ella', 'Ellie', 'Emily', 'Emma', 'Evelyn', 'Grace', 'Hannah', 'Harper', 'Hazel', 'Isabella', 'Layla', 'Leah', 'Lillian', 'Lily', 'Luna', 'Madison', 'Mia', 'Mila', 'Natalie', 'Nora', 'Olivia', 'Penelope', 'Riley', 'Savannah', 'Scarlett', 'Skylar', 'Sofia', 'Sophia', 'Stella', 'Victoria', 'Violet', 'Zoe', 'Zoey'];
/*
 * This is for logging the algorithmic process
 * through each iteration for visualization reference.
 */

var ProcessLogger = /*#__PURE__*/function () {
  function ProcessLogger() {
    _classCallCheck(this, ProcessLogger);

    this.history = [];
    this.index = {
      start: null,
      end: null
    };
  }
  /*
   * Use this method to mark
   * the beginning of the current log.
   */


  _createClass(ProcessLogger, [{
    key: "beginProcess",
    value: function beginProcess() {
      this.index.start = this.history.length;
    }
    /*
     * Use this method to mark
     * the end of the current log.
     */

  }, {
    key: "endProcess",
    value: function endProcess() {
      this.index.end = this.history.length;
    }
    /*
     * Add a process, provide a process name and its
     * contents.
     */

  }, {
    key: "addProcess",
    value: function addProcess(process, content) {
      this.history.push({
        process: process,
        content: content
      });
    }
    /*
     * Returns a shallow copy of
     * the contents of the log BEFORE
     * the current marks.
     */

  }, {
    key: "getBefore",
    value: function getBefore() {
      return this.history.slice(0, this.index.start);
    }
    /*
     * Returns a shallow copy of the contents of the log
     * INSIDE the current mark.
     */

  }, {
    key: "getCurrent",
    value: function getCurrent() {
      return this.history.slice(this.index.start, this.index.end);
    }
    /*
     * Returns a shallow copy of
     * the contents of the log AFTER
     * the current marks.
     */

  }, {
    key: "getAfter",
    value: function getAfter() {
      return this.history.slice(this.index.end);
    }
  }]);

  return ProcessLogger;
}();
/*
 * This is a queuable notification
 * message. Used in the notifier 
 * container.
 */


var Notifier = /*#__PURE__*/function () {
  function Notifier(element) {
    _classCallCheck(this, Notifier);

    this.element = element;
    this.queueLimit = 5;
    this.queue = [];
  }
  /* 
   * Method to show a message from queue.
   * Not used publicly.
   */


  _createClass(Notifier, [{
    key: "show",
    value: function show(type, message, duration, callback) {
      this.element.classList.add(type);
      this.element.innerHTML = message;
      setTimeout(function () {
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

  }, {
    key: "queueMessage",
    value: function queueMessage() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'empty';
      var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1500;

      if (type !== 'empty' && this.queue.length + 1 <= this.queueLimit) {
        this.queue.push({
          type: type,
          message: message,
          duration: duration,
          active: false,
          done: false
        });
      }

      var current = this.queue[0];

      if (current && !current.active && !current.done) {
        this.queue[0].active = true;
        this.show(current.type, current.message, current.duration, function () {
          this.queue[0].done = true;
          this.queue.shift();
          this.queueMessage();
        });
      }
    }
  }]);

  return Notifier;
}();
/*
 * This script is for orientation checks.
 * Makes sure that the device is in landscape.
 */


var mainGridDOM = document.getElementById('main-grid');
var orientationWarningDOM = document.getElementById('orientation-warning');
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

window.addEventListener('resize', function () {
  mainGridOrientationCheck();
});
mainGridOrientationCheck();
/*
 * This is used for making 
 * timeout queues which are
 * timeouts that are to be
 * executed after another timeout
 * has finished.
 */

var TimeoutQueue = /*#__PURE__*/function () {
  function TimeoutQueue() {
    _classCallCheck(this, TimeoutQueue);

    this.queue = [];
    this.disable = false;
  }
  /* 
   * Accepts a callback function and 
   * duration on how long before it is 
   * called. Skip parameter is for the inner
   * workings of this class.
   */


  _createClass(TimeoutQueue, [{
    key: "add",
    value: function add(callback, duration) {
      var skip = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      if (!skip) this.queue.push({
        callback: callback,
        duration: duration,
        active: false,
        done: false
      });
      if (this.disable) return;
      var current = this.queue[0];

      if (current && !current.active && !current.done) {
        this.queue[0].active = true;
        setTimeout(function () {
          try {
            this.queue[0].done = true;
            current.callback();
            this.queue.shift();
            this.add(null, null, true);
          } catch (e) {}
        }.bind(this), current.duration);
      }
    }
    /*
     * Method to stop the timeout queue
     * from executing temporarily.
     */

  }, {
    key: "pause",
    value: function pause() {
      this.disable = true;
    }
    /*
     * Method to completely
     * reset the timeout queue.
     */

  }, {
    key: "clear",
    value: function clear() {
      this.queue = [];
    }
    /*
     * Method to continue the timeout
     * queue if it has been paused.
     */

  }, {
    key: "continue",
    value: function _continue() {
      this.disable = false;
      this.add(null, null, true);
    }
  }]);

  return TimeoutQueue;
}();
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


var maleDOM = document.getElementById('male');
var groundDOM = document.getElementById('ground');
var femaleDOM = document.getElementById('female'); // These are special elements for adding more entities in either group.

var maleAddDOM = document.getElementById('male-add');
var femaleAddDOM = document.getElementById('female-add'); // These are the elements inside the control group.

var controlsDOM = document.getElementById('main-controls');
var randomConfigurationDOM = document.getElementById('random-configuration');
var resetDefaultDOM = document.getElementById('reset-default');
var saveConfigurationDOM = document.getElementById('save-configuration');
var fileInputDOM = document.getElementById('file-input');
var fileInputLabelDOM = document.getElementById('file-input-label');
var playVisualizationDOM = document.getElementById('play-visualization');
var pauseVisualizationDOM = document.getElementById('pause-visualization');
var stopVisualizationDOM = document.getElementById('stop-visualization');
var skipVisualizationDOM = document.getElementById('skip-visualization'); //

var notifier = new Notifier(document.getElementById('notifier')); //

var stableMarriageConfiguration;
var stableMarriageAlgorithm;
var stableMarriageNameIndex;
var stableMarriageProcessQueue = [];
var stableMarriageVisualizationRunning = false;
var stableMarriageVisualizationDone = false;
var animationQueue = new TimeoutQueue();
/*
 * Accepts an object and returns a clone
 * instead of a reference.
 */

function clone(object) {
  return JSON.parse(JSON.stringify(object));
}
/*
 * Accepts an array and returns the same array where the order
 * of elements have been shuffled. Mutates the original array.
 */


function shuffleArray(array) {
  var currentIndex = array.length;
  var temporaryValue;
  var randomIndex; // While there remain elements to shuffle...

  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1; // And swap it with the current element.

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
  var shuffledArray = shuffleArray(clone(array));
  return shuffledArray.slice(0, size);
}

function createRandomConfiguration(maleCount, femaleCount) {
  // Get the names for each group.
  var randomMaleNames = randomArrayOfSize(maleNames, maleCount);
  var randomFemaleNames = randomArrayOfSize(femaleNames, femaleCount);
  var configuration = {
    male: [],
    female: []
  }; // Append each new entity on their corresponding group
  // with a shuffled preference array.

  var _iterator6 = _createForOfIteratorHelper(randomMaleNames),
      _step6;

  try {
    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
      var male = _step6.value;
      configuration.male.push({
        name: male,
        preferences: shuffleArray(clone(randomFemaleNames))
      });
    } // Does the same for females.

  } catch (err) {
    _iterator6.e(err);
  } finally {
    _iterator6.f();
  }

  var _iterator7 = _createForOfIteratorHelper(randomFemaleNames),
      _step7;

  try {
    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
      var female = _step7.value;
      configuration.female.push({
        name: female,
        preferences: shuffleArray(clone(randomMaleNames))
      });
    }
  } catch (err) {
    _iterator7.e(err);
  } finally {
    _iterator7.f();
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
  var map = {};

  for (var group in configuration) {
    for (var index = 0; index < configuration[group].length; ++index) {
      var name = configuration[group][index].name;
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
  var map = {};

  for (var _i = 0, _arr = [].concat(_toConsumableArray(maleDOM.children), _toConsumableArray(femaleDOM.children)); _i < _arr.length; _i++) {
    var entityDOM = _arr[_i];

    if (entityDOM.classList.contains('entity')) {
      var inputDOM = entityDOM.querySelector('.name input');
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
  var configuration = {
    male: [],
    female: []
  };

  for (var _i2 = 0, _arr2 = [].concat(_toConsumableArray(maleDOM.children), _toConsumableArray(femaleDOM.children)); _i2 < _arr2.length; _i2++) {
    var entityDOM = _arr2[_i2];
    // Skip this iteration if the entity is the add-entity element.
    if (entityDOM.classList.contains('add-entity')) continue;
    var group = entityDOM.parentNode == maleDOM ? 'male' : 'female'; // Get the name and preferences,

    var name = entityDOM.querySelector('.name input').value;
    var preferences = []; // The preferences are looked up by iterating through the preference list.

    var preferenceListDOM = entityDOM.querySelector('.preference');

    var _iterator8 = _createForOfIteratorHelper(preferenceListDOM.children),
        _step8;

    try {
      for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
        var preferenceDOM = _step8.value;
        preferences.push(preferenceDOM.innerText);
      }
    } catch (err) {
      _iterator8.e(err);
    } finally {
      _iterator8.f();
    }

    configuration[group].push({
      name: name,
      preferences: preferences
    });
  }

  return configuration;
}
/*
 * Accepts data (can be string) a filename and the mime type
 * this causes a file to be saved on to the client.
 */


function clientSaveFile(data, filename, type) {
  var file = new Blob([data], {
    type: type
  });

  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(file, filename);
  } else {
    // Others
    var a = document.createElement("a");
    var url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
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
  var preferenceListDOM = entityDOM.querySelector('.preference');
  var extraHeight = preferenceListDOM.children[0].offsetHeight * preferenceListDOM.children.length; // An original height is stored on the first time hooking of click event (line 195).

  if (!entityDOM.dataset.originalHeight) {
    entityDOM.dataset.originalHeight = entityDOM.offsetHeight;
  }

  return parseInt(entityDOM.dataset.originalHeight) + extraHeight;
}

;
/*
 * Event callback for entity preference click (this occurs when the angle right button is clicked).
 * This callback expands the element to the right height.
 */

function entityPreferenceClick(event) {
  // event.currentTarget.parent.parent.classList.toggle('edit');
  var baseEntityDOM = event.currentTarget.parentElement.parentElement;
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
  var element = event.currentTarget;
  var count = element.selectionStart; // This regex matches any non-alphabetical character.

  var regex = /[^a-z]/gi;
  var value = element.value;

  if (regex.test(value)) {
    element.value = value.replace(regex, '');
    count--;
  }

  element.setSelectionRange(count, count); // The next part is updating all associated
  // preferences on the other group
  // with the same index as this element.

  var baseEntity = event.srcElement.parentElement.parentElement;
  var updateGroup = baseEntity.parentElement == maleDOM ? femaleDOM : maleDOM;

  for (var index = 0; index < updateGroup.children.length - 1; ++index) {
    var preferences = updateGroup.children[index].querySelector('.preference');

    var _iterator9 = _createForOfIteratorHelper(preferences.children),
        _step9;

    try {
      for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
        var preference = _step9.value;
        if (preference.dataset.index == element.dataset.index) preference.innerHTML = element.value;
      }
    } catch (err) {
      _iterator9.e(err);
    } finally {
      _iterator9.f();
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
  var baseEntityDOM = event.currentTarget.parentNode.parentNode;
  var groupDOM = baseEntityDOM.parentNode; // Does not allow the number of entities to drop 
  // below the minimum entity count set by default.

  if (groupDOM.children.length - 1 <= defaultEntityCountMinimum) {
    notifier.queueMessage('warning', "Number of entities cannot go below minimum (".concat(defaultEntityCountMinimum, ")."), 500);
    return;
  }

  var otherGroupDOM = groupDOM == maleDOM ? femaleDOM : maleDOM;
  var inputDOM = baseEntityDOM.querySelector('.name input');
  var currentIndex = inputDOM.dataset.index; // Updates the index of the elements with indices higher than 
  // that of this element by subtracting those by 1.

  var _iterator10 = _createForOfIteratorHelper(groupDOM.children),
      _step10;

  try {
    for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
      var entityDOM = _step10.value;
      if (entityDOM == baseEntityDOM || entityDOM.classList.contains('add-entity')) continue;
      var entityInputDOM = entityDOM.querySelector('.name input');
      var index = parseInt(entityInputDOM.dataset.index);

      if (currentIndex < index) {
        entityInputDOM.dataset.index = index - 1;
      }
    } // Removes this element from the preference list of the 
    // entities on the other group.

  } catch (err) {
    _iterator10.e(err);
  } finally {
    _iterator10.f();
  }

  var _iterator11 = _createForOfIteratorHelper(otherGroupDOM.children),
      _step11;

  try {
    for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
      var _entityDOM = _step11.value;
      // This approach is done for O(n) time complexity instead of O(2n)
      if (_entityDOM.classList.contains('add-entity')) continue;

      var preferenceListDOM = _entityDOM.querySelector('.preference'); // The preference to be removed
      // and the preference that will take
      // over this preferences' index will remain
      // untouched.


      var preferenceDOMRemove = void 0;
      var preferenceDOMUnchanged = void 0;

      var _iterator12 = _createForOfIteratorHelper(preferenceListDOM.children),
          _step12;

      try {
        for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
          var preferenceDOM = _step12.value;

          var _index = parseInt(preferenceDOM.dataset.index);

          if (_index == currentIndex) {
            preferenceDOMRemove = preferenceDOM;
          } else if (_index - 1 == currentIndex) {
            preferenceDOMUnchanged = preferenceDOM;
          } else if (_index > currentIndex) {
            preferenceDOM.dataset.index = _index - 1;
          }
        } // Only after the iteration are they manipulated to prevent wrong conditionals.
        // This changes that index to take over this element's index then removes the original
        // preference element.

      } catch (err) {
        _iterator12.e(err);
      } finally {
        _iterator12.f();
      }

      if (preferenceDOMUnchanged) preferenceDOMUnchanged.dataset.index = parseInt(preferenceDOMUnchanged.dataset.index) - 1;
      preferenceDOMRemove.remove(); // Also recalculate the height of the entity
      // whose preferences are manipulated if it is toggled.

      if (_entityDOM.classList.contains('edit-preference')) _entityDOM.style.minHeight = calculateOpenEntityHeight(_entityDOM) + 'px';
    }
  } catch (err) {
    _iterator11.e(err);
  } finally {
    _iterator11.f();
  }

  ; // Finally remove this whole entity.

  baseEntityDOM.remove();
}
/*
 * Event for when the preference is dragged.
 * Allows the repositioning of all preferences through
 * user action of dragging and dropping.
 */


function preferenceDrag(event) {
  var preferenceDOM = event.target;
  var preferenceListDOM = preferenceDOM.parentNode;
  preferenceDOM.classList.add('dragging');
  var x = event.clientX,
      y = event.clientY;
  var otherPreferenceDOM = document.elementFromPoint(x, y);
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
  var root = document.createElement('div');
  root.className = 'entity';
  root.innerHTML = "\n        <div class=\"name\">\n            <button class=\"toggle-preference\"><i class=\"fas fa-angle-right\"></i></button> \n            <input maxlength=\"".concat(defaultEntityNameMaximum, "\" type=\"text\" value=\"Name\" placeholder=\"Enter Name\">\n            <button class=\"remove-entity\"><i class=\"fas fa-trash\"></i></button>\n        </div>\n        <div class=\"preference\">\n            <!-- Put prefs here separated with <div> tags -->\n        </div>\n\n    ");
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
  var nameDOM = entityDOM.querySelector('.name input');
  var toggleButton = entityDOM.querySelector('.name .toggle-preference');
  var removeButton = entityDOM.querySelector('.name .remove-entity');
  var preferenceListDOM = entityDOM.querySelector('.preference'); // Reset the name and index 
  // through the parameter values.

  nameDOM.value = name;
  nameDOM.dataset.index = nameIndex[name];
  nameDOM.oninput = entityNameInput; // Make sure to hook the events only once.

  if (toggleButton.getAttribute('haslistener') != 'true') toggleButton.addEventListener('click', entityPreferenceClick);
  if (removeButton.getAttribute('haslistener') != 'true') removeButton.addEventListener('click', entityRemoveClick); // Hooking events is done by adding an extra attribute
  // that is set upon initialization.

  toggleButton.setAttribute('haslistener', 'true');
  removeButton.setAttribute('haslistener', 'true'); // The preference list is not cleared out then appended with preferences.
  // Instead, if there are already existing preference element, those will be overwritten
  // and new preference elements are made as needed.

  for (var index = 0; index < preferences.length; ++index) {
    var preference = preferences[index];
    var preferenceDOM = void 0; // Conditional for if a preference element is needed to be made.

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
  } // Removes the excess preference elements if there are any.


  for (var _index2 = preferenceListDOM.children.length - 1; _index2 >= preferences.length; --_index2) {
    preferenceListDOM.children[_index2].remove();
  }

  return entityDOM;
}
/*
 * Sets up the DOM with a given configuration.
 * Changes necessary elements to fit the configuration
 * removes excess, adds if needed.
 */


function populateDOM(configuration) {
  var nameIndex = nameIndexMap(configuration);
  var timeoutQueue = new TimeoutQueue(); // This allows iteration in both groups.

  for (var group in configuration) {
    var groupDOM = group == 'male' ? maleDOM : femaleDOM;
    var groupAddDOM = group == 'male' ? maleAddDOM : femaleAddDOM;
    var groupDOMExcess = groupDOM.children.length - 1 - configuration[group].length;

    var _loop2 = function _loop2(index) {
      var _configuration$group$ = configuration[group][index],
          name = _configuration$group$.name,
          preferences = _configuration$group$.preferences; // This either creates a new element or assigns an existing one,

      var entityDOM = void 0;

      if (index < groupDOM.children.length - 1) {
        entityDOM = groupDOM.children[index];
      } else {
        entityDOM = createSMEntityElement();
        entityDOM.style.opacity = '0';
        groupDOM.insertBefore(entityDOM, groupAddDOM);
        timeoutQueue.add(function () {
          entityDOM.style.removeProperty('opacity');
        }, 100);
      } // Then it is initialized.


      initializeEntityElement(entityDOM, nameIndex, name, preferences); // If the entity is active, its height is recalculated.

      if (entityDOM.classList.contains('edit-preference')) {
        entityDOM.style.minHeight = calculateOpenEntityHeight(entityDOM) + 'px';
      }
    };

    for (var index = 0; index < configuration[group].length; ++index) {
      _loop2(index);
    } // Remove excess entities.


    for (var _index3 = groupDOM.children.length - 2; _index3 >= configuration[group].length; --_index3) {
      groupDOM.children[_index3].remove();
    }
  }
}
/*
 * Event for when the add entity element is clicked.
 * Adds a new entity with random initialization values,
 * as in random name and random order of preferences.
 */


function addEntityClick(event) {
  var baseGroupDOM = event.currentTarget.parentNode; // Limits the add entity event from adding more if the maximum entity count
  // by default is reached.

  if (baseGroupDOM.children.length - 1 >= defaultEntityCountMaximum) {
    notifier.queueMessage('warning', "Maximum number of entities (".concat(defaultEntityCountMaximum, ") has been reached."), 500);
    return;
  } else if (stableMarriageVisualizationRunning) {
    notifier.queueMessage('warning', 'Use stop button to edit configuration.');
    return;
  }

  var gender = baseGroupDOM == maleDOM ? 'male' : 'female';
  var otherGroupDOM = gender == 'male' ? femaleDOM : maleDOM;
  var entityDOM = createSMEntityElement();
  var nameIndex = getDOMNameIndexMap();
  var randomName;
  var preferences = []; // This loop gets a random name that is currently 
  // not used in the configuration.

  do {
    randomName = getRandomName(gender);
  } while (Object.keys(nameIndex).indexOf(randomName) != -1);

  nameIndex[randomName] = baseGroupDOM.children.length - 1; // This iteration adds the new entity on the preference list of the
  // opposite group.

  var _iterator13 = _createForOfIteratorHelper(otherGroupDOM.children),
      _step13;

  try {
    for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
      var otherEntityDOM = _step13.value;
      // Skip the add-entity element.
      if (otherEntityDOM.classList.contains('add-entity')) continue;
      var otherPreferenceListDOM = otherEntityDOM.querySelector('.preference');
      var newPreferenceDOM = document.createElement('div');
      newPreferenceDOM.draggable = true;
      newPreferenceDOM.dataset.index = nameIndex[randomName];
      newPreferenceDOM.innerHTML = randomName;
      newPreferenceDOM.addEventListener('drag', preferenceDrag);
      newPreferenceDOM.addEventListener('dragend', preferenceDragEnd);
      otherPreferenceListDOM.appendChild(newPreferenceDOM);
      var otherBaseEntityDOM = otherPreferenceListDOM.parentNode;

      if (otherBaseEntityDOM.classList.contains('edit-preference')) {
        otherBaseEntityDOM.style.minHeight = calculateOpenEntityHeight(otherBaseEntityDOM) + 'px';
      }

      preferences.push(otherEntityDOM.querySelector('.name input').value);
    }
  } catch (err) {
    _iterator13.e(err);
  } finally {
    _iterator13.f();
  }

  initializeEntityElement(entityDOM, nameIndex, randomName, shuffleArray(preferences));
  baseGroupDOM.insertBefore(entityDOM, event.currentTarget);
}
/*
 * Event for when the random configuration button is clicked.
 * Repopulates the DOM with a random configuration.
 */


function randomConfigurationClick(event) {
  var range = defaultEntityCountMaximum - defaultEntityCountMinimum;
  var randomMaleCount = Math.floor(Math.random() * (range + 1)) + defaultEntityCountMinimum;
  var randomFemaleCount = Math.floor(Math.random() * (range + 1)) + defaultEntityCountMinimum;
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
  var configuration = getDOMConfiguration();

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
  var male = configuration.male,
      female = configuration.female;

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

  for (var _i3 = 0, _arr3 = [].concat(_toConsumableArray(male), _toConsumableArray(female)); _i3 < _arr3.length; _i3++) {
    var entity = _arr3[_i3];
    var name = entity.name,
        preferences = entity.preferences;
    if (!name || !preferences) throw 'An entity is missing required fields.';

    if (!(typeof name == 'string' || name instanceof String) || name.length > defaultEntityNameMaximum || /[^a-z]/gi.test(name)) {
      throw 'An entity has an invalid name.';
    }

    if (!Array.isArray(preferences) || !preferences.every(function (x) {
      return typeof x == 'string' || x instanceof String;
    })) {
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
  var file = event.target.files[0];
  var reader = new FileReader();
  reader.readAsText(file, 'UTF-8');
  reader.addEventListener('load', function (readerEvent) {
    try {
      var configuration = JSON.parse(readerEvent.target.result); // This would throw an error if anything is wrong and prevent 
      // further lines in the same block from being executed;

      validateJSONConfiguration(configuration);
      notifier.queueMessage('valid', 'Configuration loaded successfully.');
      populateDOM(configuration);
    } catch (error) {
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
  animationQueue.add(function () {
    entityDOM.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    entityDOM.classList.add('prepare');
  }, 250);
}
/*
 * Called to open an entity element in ground DOM.
 * Expands and scrolls to the element.
 */


function openAndSelectGroundDOM(groundEntityDOM, selectIndex) {
  animationQueue.add(function () {
    groundEntityDOM.style.removeProperty('opacity');
  }, 250);
  animationQueue.add(function () {
    groundEntityDOM.classList.add('expand-preference');
    ;
    groundEntityDOM.style.minHeight = calculateOpenEntityHeight(groundEntityDOM) + 'px';
  }, 250);
  animationQueue.add(function () {
    groundEntityDOM.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }, 250);
  if (selectIndex != undefined) animationQueue.add(function () {
    groundEntityDOM.querySelector('.preference').children[selectIndex].classList.add('select-highlight');
  }, 500);
}
/*
 * Called to close an entity element in ground DOM.
 * Removes the class for expansion and removes minimum height.
 */


function closeGroundDOM(groundEntityDOM) {
  animationQueue.add(function () {
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
  stableMarriageVisualizationDone = true; // Stop the animation and make the
  // containers interactive again.

  animationQueue.clear();
  maleDOM.classList.remove('disabled');
  groundDOM.classList.remove('disabled');
  femaleDOM.classList.remove('disabled'); // Removes all elements in ground container.

  groundDOM.innerHTML = ''; // For all entities,

  for (var _i4 = 0, _arr4 = [].concat(_toConsumableArray(stableMarriageAlgorithm.male), _toConsumableArray(stableMarriageAlgorithm.female)); _i4 < _arr4.length; _i4++) {
    var entity = _arr4[_i4];
    var entityDOM = entity.element;
    var nameDOM = entityDOM.querySelector('.name input');
    var togglePreferenceDOM = entityDOM.querySelector('.name .toggle-preference');
    var removeEntityDOM = entityDOM.querySelector('.name .remove-entity');
    nameDOM.classList.add('disabled'); // change the event listener to show them and their partner
    // on ground container when clicked in any way.

    togglePreferenceDOM.removeEventListener('click', entityPreferenceClick);
    entityDOM.addEventListener('click', entityPartnerShowClick);
    removeEntityDOM.removeEventListener('click', entityRemoveClick);
    entityDOM.classList.add('prepare');
    entityDOM.classList.remove('disabled'); // This dictates the styling of those who have
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
  var _stableMarriageProces = stableMarriageProcessQueue.shift(),
      process = _stableMarriageProces.process,
      content = _stableMarriageProces.content;

  var male = content.male,
      female = content.female,
      dumped = content.dumped;
  var groundMaleDOM;
  var groundFemaleDOM; // If the process is not called done,

  if (process !== 'done') {
    groundMaleDOM = male.element.cloneNode(true);
    groundFemaleDOM = female.element.cloneNode(true);
    groundMaleDOM.style.opacity = '0';
    groundFemaleDOM.style.opacity = '0'; // then the ground elements are prepared,

    groundMaleDOM.classList.add('prepare');
    groundFemaleDOM.classList.add('prepare');
    groundMaleDOM.classList.add('disabled');
    groundFemaleDOM.classList.add('disabled'); // and if the process is also not prepared,

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
    animationQueue.add(function () {
      groundMaleDOM.classList.remove('reject');
      groundFemaleDOM.classList.remove('prepare');
      groundMaleDOM.classList.add('engage');
      groundFemaleDOM.classList.add('engage');
    }, 500);
    animationQueue.add(function () {
      male.element.classList.remove('reject');
      male.element.classList.add('engage');
      female.element.classList.add('engage');
      notifier.queueMessage('warning', "".concat(male.name, " is engaged with ").concat(female.name, "."), 1000);
    }, 500);
  } else if (process == 'break') {
    // This is the animation for break.
    // Break means the female dumps a male
    // and gets a new partner.
    groundFemaleDOM.classList.add('engage');

    var oldPartnerIndex = female._preferences.indexOf(dumped.name);

    groundFemaleDOM.querySelector('.preference').children[oldPartnerIndex].classList.add('partner-highlight');
    groundDOM.appendChild(groundFemaleDOM);
    openAndSelectGroundDOM(groundFemaleDOM);
    animationQueue.add(function () {
      var preferenceDOM = groundFemaleDOM.querySelector('.preference');

      var maleIndex = female._preferences.indexOf(male.name);

      var oldPartnerIndex = female._preferences.indexOf(dumped.name);

      preferenceDOM.children[maleIndex].classList.add('select-highlight');
      notifier.queueMessage('warning', "".concat(female.name, " breaks up with current partner ").concat(dumped.name, " and engages with ").concat(male.name, "."), 2000);
    }, 500);
    closeGroundDOM(groundMaleDOM);
    closeGroundDOM(groundFemaleDOM);
    animationQueue.add(function () {
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
    var preferenceDOM = groundFemaleDOM.querySelector('.preference');

    var partnerIndex = female._preferences.indexOf(female.partner.name);

    preferenceDOM.children[partnerIndex].classList.add('partner-highlight');
    groundDOM.appendChild(groundFemaleDOM);
    openAndSelectGroundDOM(groundFemaleDOM);
    animationQueue.add(function () {
      var maleIndex = female._preferences.indexOf(male.name);

      preferenceDOM.children[maleIndex].classList.add('select-highlight');
    }, 250);
    closeGroundDOM(groundMaleDOM);
    closeGroundDOM(groundFemaleDOM);
    animationQueue.add(function () {
      groundMaleDOM.classList.remove('prepare');
      groundFemaleDOM.classList.remove('engage');
      groundMaleDOM.classList.add('reject');
      groundFemaleDOM.classList.add('reject');
      notifier.queueMessage('warning', "".concat(female.name, " stays with current partner ").concat(female.partner.name, " and rejects ").concat(male.name, "."), 2000);
    }, 250);
    animationQueue.add(function () {
      male.element.classList.add('reject');
      female.element.classList.add('reject');
    }, 250);
    animationQueue.add(function () {
      female.element.classList.remove('reject');
      female.element.classList.add('engage');
    }, 250);
  } else if (process == 'done') {
    // Animation for when the process is done.
    // Basically removes the elements.
    var _iterator14 = _createForOfIteratorHelper(groundDOM.children),
        _step14;

    try {
      for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
        var child = _step14.value;
        child.style.opacity = '0';
      }
    } catch (err) {
      _iterator14.e(err);
    } finally {
      _iterator14.f();
    }

    animationQueue.add(function () {
      groundDOM.innerHTML = '';
    }, 250);
  } // This first conditional is called when
  // the visualization is finished.


  if (stableMarriageProcessQueue.length == 0) {
    skipVisualizationDOM.classList.add('disabled');
    makeResultInteractable();
    notifier.queueMessage('valid', 'Tap an entity to show its partner.');
  } else {
    // This conditional is called whenever there is still
    // anything to visualize.
    animationQueue.add(function () {
      animationStep();
    }, 250);
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
    stableMarriageConfiguration = getDOMConfiguration(); // This makes sure the configuration is valid.

    if (!isValidAlgorithmConfiguration(stableMarriageConfiguration)) {
      notifier.queueMessage('warning', 'Configuration is invalid. Please use unique names for all entities.');
      return;
    } // Initializes the required variables.


    stableMarriageNameIndex = nameIndexMap(stableMarriageConfiguration);
    stableMarriageAlgorithm = new StableMarriage(getDOMConfiguration(), stableMarriageNameIndex);
    stableMarriageProcessQueue = []; // Makes the algorithm compute all and
    // save each process.

    while (!stableMarriageAlgorithm.isDone()) {
      var _stableMarriageProces2;

      stableMarriageAlgorithm.iterate();

      (_stableMarriageProces2 = stableMarriageProcessQueue).push.apply(_stableMarriageProces2, _toConsumableArray(stableMarriageAlgorithm.log.getCurrent()));
    } // Make sure the animationQueue is not disabled.


    animationQueue.disable = false; // Disable controls except for play, skip, pause, and stop.

    var _iterator15 = _createForOfIteratorHelper(controlsDOM.children),
        _step15;

    try {
      for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
        var controlDOM = _step15.value;

        if (controlDOM == pauseVisualizationDOM || controlDOM == stopVisualizationDOM || controlDOM == skipVisualizationDOM) {
          controlDOM.classList.remove('disabled');
        } else if (controlDOM !== playVisualizationDOM) {
          controlDOM.classList.add('disabled');
        }
      } // Make the containers uninteractive,

    } catch (err) {
      _iterator15.e(err);
    } finally {
      _iterator15.f();
    }

    maleDOM.classList.add('disabled');
    femaleDOM.classList.add('disabled'); // including their elements.

    for (var group in stableMarriageConfiguration) {
      var baseGroupDOM = group == 'male' ? maleDOM : femaleDOM;

      var _iterator16 = _createForOfIteratorHelper(stableMarriageAlgorithm[group]),
          _step16;

      try {
        for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
          var entity = _step16.value;
          var entityDOM = baseGroupDOM.children[stableMarriageNameIndex[entity.name]];
          entityDOM.classList.remove('edit-preference');
          entityDOM.style.removeProperty('min-height');
          entityDOM.classList.add('disabled'); // and set each entity in algorithm
          // its corresponding DOM element.

          entity.element = entityDOM;
        }
      } catch (err) {
        _iterator16.e(err);
      } finally {
        _iterator16.f();
      }
    } //stableMarriageVisualizationDone = false;


    notifier.queueMessage('valid', 'Visualization start.');
    stableMarriageVisualizationRunning = true;
    animationStep(); // This second conditional is for when the visualization is paused.
  } else if (stableMarriageVisualizationRunning && animationQueue.disable) {
    animationQueue["continue"]();
    notifier.queueMessage('valid', 'Visualization continuing.'); // Third conditional is for when the visualization is done, and the user
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
  animationQueue.clear(); // Reset the necessary variables.

  stableMarriageAlgorithm = null;
  stableMarriageNameIndex = null;
  stableMarriageProcessQueue = [];
  stableMarriageVisualizationRunning = false;
  stableMarriageVisualizationDone = false; // Reset the controls to correct state.

  var _iterator17 = _createForOfIteratorHelper(controlsDOM.children),
      _step17;

  try {
    for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
      var controlDOM = _step17.value;

      if (controlDOM == pauseVisualizationDOM || controlDOM == stopVisualizationDOM || controlDOM == skipVisualizationDOM) {
        controlDOM.classList.add('disabled');
      } else {
        controlDOM.classList.remove('disabled');
      }
    } // Make the containers interactable.

  } catch (err) {
    _iterator17.e(err);
  } finally {
    _iterator17.f();
  }

  maleDOM.classList.remove('disabled');
  femaleDOM.classList.remove('disabled');
  groundDOM.classList.add('disabled'); // Animate the removal of the entities.

  var timeoutQueue = new TimeoutQueue();

  var _loop3 = function _loop3() {
    var entityDOM = _arr5[_i5];
    if (entityDOM.classList.contains('add-entity')) return "continue";
    entityDOM.style.opacity = '0';
    timeoutQueue.add(function () {
      entityDOM.remove();
    }, 10);
  };

  for (var _i5 = 0, _arr5 = [].concat(_toConsumableArray(maleDOM.children), _toConsumableArray(femaleDOM.children), _toConsumableArray(groundDOM.children)); _i5 < _arr5.length; _i5++) {
    var _ret2 = _loop3();

    if (_ret2 === "continue") continue;
  } // Repopulate the DOM.


  timeoutQueue.add(function () {
    populateDOM(stableMarriageConfiguration);
  }, 200);
}
/*
 * Event callback for when an entity is clicked,
 * this is only set as a callback AFTER the visualization
 * or when the visualization is skipped where the algorithm
 * has been computed.
 */


function entityPartnerShowClick(event) {
  var entityDOM = event.currentTarget;
  var index = entityDOM.querySelector('.name input').dataset.index;
  var gender = entityDOM.parentNode == maleDOM ? 'male' : 'female';
  var entity = stableMarriageAlgorithm[gender][index]; // If the entity has a partner,

  if (entity.partner) {
    groundDOM.innerHTML = '';
    var partner = entity.partner;
    var groundEntityDOM = entityDOM.cloneNode(true);
    var groundPartnerDOM = partner.element.cloneNode(true);

    var entityIndex = partner._preferences.indexOf(entity.name);

    var partnerIndex = entity._preferences.indexOf(partner.name);

    groundEntityDOM.querySelector('.preference').children[partnerIndex].classList.add('marry-highlight');
    groundPartnerDOM.querySelector('.preference').children[entityIndex].classList.add('marry-highlight'); // show them both add ground container
    // with each other highlighted on one another's
    // preference list.

    groundDOM.appendChild(groundEntityDOM);
    groundDOM.appendChild(groundPartnerDOM);
    openAndSelectGroundDOM(groundEntityDOM);
    openAndSelectGroundDOM(groundPartnerDOM);
  } else {
    // Otherwise send a notifier message,
    notifier.queueMessage('warning', "".concat(entity.name, " has no partner."));
  }
}
/*
 * Event callback for when skip
 * button is clicked.
 */


function skipVisualizationClick(event) {
  if (!stableMarriageVisualizationRunning || stableMarriageVisualizationDone) return; // The skip button is disabled right after skipping,

  event.currentTarget.classList.add('disabled'); // and it skips the whole visualization.

  makeResultInteractable();
  notifier.queueMessage('valid', 'Toggle an entity with their angle button to see their partner.');
} // Populate the DOM with default configuration on 
// start.


populateDOM(defaultAlgorithmConfiguration); // Found individually inside each group.

maleAddDOM.addEventListener('click', addEntityClick);
femaleAddDOM.addEventListener('click', addEntityClick); // These are the controls found in the control group.

randomConfigurationDOM.addEventListener('click', randomConfigurationClick);
resetDefaultDOM.addEventListener('click', resetDefaultClick);
saveConfigurationDOM.addEventListener('click', saveConfigurationClick);
fileInputDOM.addEventListener('change', fileInputChange);
playVisualizationDOM.addEventListener('click', playVisualizationClick);
pauseVisualizationDOM.addEventListener('click', pauseVisualizationClick);
stopVisualizationDOM.addEventListener('click', stopVisualizationClick);
skipVisualizationDOM.addEventListener('click', skipVisualizationClick);
