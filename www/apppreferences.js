var platform = {};
try {
	platform = require ('./platform');
} catch (e) {

}

/**
 * @constructor
 */
function AppPreferences() {
}

var promiseLib;
if (typeof Promise !== "undefined") {
	promiseLib = Promise;
} else if (typeof WinJS !== "undefined" && WinJS.Promise) {
	promiseLib = WinJS.Promise;
} else if (typeof $ !== "undefined" && $.Deferred) {
	promiseLib = function (init) {
		var d = $.Deferred ();
		init (d.resolve.bind (d), d.reject.bind (d));
		return d.promise ();
	}
}

function promiseCheck (maxArgs, successCallback, errorCallback) {
	if (
		typeof successCallback !== 'function' && typeof errorCallback !== 'function'
		&& arguments.length <= maxArgs + 1 // argCount
		&& promiseLib
	) {
		return true;
	} else {
		return false;
	}
}

if (!platform.nativeExec)
	platform.nativeExec = cordova.exec.bind (cordova);

AppPreferences.prototype.prepareKey = platform.prepareKey || function (mode, dict, key, value) {
	var argList = [].slice.apply(arguments);
	argList.shift();
	if (
		(mode == 'get' && argList.length == 1) ||
		(mode == 'get' && argList.length == 2 && argList[1] == null) ||
		(mode == 'set' && argList.length == 2) ||
		(mode == 'set' && argList.length == 3 && argList[2] == null)
	) {
		argList.unshift (undefined);
	}
	var args = {
		key: argList[1]
	};
	if (argList[0] !== undefined)
		args.dict = argList[0]

	if (mode == 'set')
		args.value = argList[2];

	// console.log (JSON.stringify (argList), JSON.stringify (args));
	return args;
}

/**
 * Get a preference value
 *
 * @param {Function} successCallback The function to call when the value is available
 * @param {Function} errorCallback The function to call when value is unavailable
 * @param {String} dict Dictionary for key (OPTIONAL)
 * @param {String} key Key
 */
AppPreferences.prototype.fetch = platform.fetch || function (
	successCallback, errorCallback, dict, key
) {

	var argCount = 2; // dict, key
	var promise = promiseCheck.apply (this, [argCount].concat ([].slice.call(arguments)));
	// for promises
	if (promise) {
		dict = successCallback;
		key  = errorCallback;
	}

	var args = this.prepareKey ('get', dict, key);

	var _successCallback = function (_value) {
		var value = _value;
		try {
			value = JSON.parse (_value);
		} catch (e) {
		}
		successCallback (value);
	}

	var nativeExec = function (resolve, reject) {
		if (!args.key) {
			return reject ();
		}

		if (resolve !== successCallback) {
			successCallback = resolve;
		}

		if (platform.nativeFetch) {
		    return platform.nativeFetch(_successCallback, reject, args);
		}
		return platform.nativeExec(_successCallback, reject, "AppPreferences", "fetch", [args]);
	}

	if (promise) {
		return new promiseLib (nativeExec);
	} else {
		nativeExec (successCallback, errorCallback);
	}

};

/**
 * Set a preference value
 *
 * @param {Function} successCallback The function to call when the value is set successfully
 * @param {Function} errorCallback The function to call when value is not set
 * @param {String} dict Dictionary for key (OPTIONAL)
 * @param {String} key Key
 * @param {String} value Value
 */
AppPreferences.prototype.store = platform.store || function (
	successCallback, errorCallback, dict, key, value
	) {

	var argCount = 3; // dict, key, value
	var promise = promiseCheck.apply (this, [argCount].concat ([].slice.call(arguments)));
	// for promises
	if (promise) {
		value = dict;
		key  = errorCallback;
		dict = successCallback;
	}

	var args = this.prepareKey ('set', dict, key, value);

	args.type  = typeof args.value;

	// VERY IMPORTANT THING
	// WP platform has some limitations, so we need to encode all values to JSON.
	// On plugin side we store value according to it's type.
	// So, every platform plugin must check for type, decode JSON and store
	// value decoded for basic types.
	// TODO: don't think about array of strings, it's android only.
	// Complex structures must be stored as JSON string.
	// On iOS strings stored as strings and JSON stored as NSData
	// Android:
	// Now, interesting thing: how to differentiate between string value
	// and complex value, encoded as json and stored as string?
	// I'm introduce setting named _<preference>_type with value "JSON"
	// Windows Phone ?
	args.value = JSON.stringify (args.value);

	var nativeExec = function (resolve, reject) {
		if (!args.key || args.value === null || args.value === undefined) {
			return reject ();
		}

		if (platform.nativeStore) {
		    return platform.nativeStore (resolve, reject, args);
		}
		return platform.nativeExec (resolve, reject, "AppPreferences", "store", [args]);
	}

	if (promise) {
		return new promiseLib (nativeExec);
	} else {
		nativeExec (successCallback, errorCallback);
	}

};

/**
 * Remove value from preferences
 *
 * @param {Function} successCallback The function to call when the value is available
 * @param {Function} errorCallback The function to call when value is unavailable
 * @param {String} dict Dictionary for key (OPTIONAL)
 * @param {String} key Key
 */
AppPreferences.prototype.remove = platform.remove || function (
	successCallback, errorCallback, dict, key
) {

	var argCount = 2; // dict, key
	var promise = promiseCheck.apply (this, [argCount].concat ([].slice.call(arguments)));
	// for promises
	if (promise) {
		key  = errorCallback;
		dict = successCallback;
	}

	var args = this.prepareKey ('get', dict, key);

	var nativeExec = function (resolve, reject) {
		if (!args.key) {
			return reject ();
		}

		if (platform.nativeRemove) {
		    return platform.nativeRemove (resolve, reject, args);
		}
		return platform.nativeExec (resolve, reject, "AppPreferences", "remove", [args]);
	}

	if (promise) {
		return new promiseLib (nativeExec);
	} else {
		nativeExec (successCallback, errorCallback);
	}

};

/**
 * Clear preferences
 *
 * @param {Function} successCallback The function to call when the value is available
 * @param {Function} errorCallback The function to call when value is unavailable
 * @param {String} dict Dictionary for key (OPTIONAL)
 * @param {String} key Key
 */
AppPreferences.prototype.clearAll = platform.clearAll || function (
	successCallback, errorCallback
) {

	var argCount = 0;
	var promise = promiseCheck.apply (this, [argCount].concat ([].slice.call(arguments)));

	var nativeExec = function (resolve, reject) {
		return platform.nativeExec (resolve, reject, "AppPreferences", "clearAll", []);
	}

	if (promise) {
		return new promiseLib (nativeExec);
	} else {
		nativeExec (successCallback, errorCallback);
	}

};

/**
 * Show native preferences interface
 *
 * @param {Function} successCallback The function to call when the value is available
 * @param {Function} errorCallback The function to call when value is unavailable
 * @param {String} dict Dictionary for key (OPTIONAL)
 * @param {String} key Key
 */
AppPreferences.prototype.show = platform.show || function (
successCallback, errorCallback
) {

	var argCount = 0;
	var promise = promiseCheck.apply (this, [argCount].concat ([].slice.call(arguments)));

	var nativeExec = function (resolve, reject) {
		return platform.nativeExec (resolve, reject, "AppPreferences", "show", []);
	}

	if (promise) {
		return new promiseLib (nativeExec);
	} else {
		nativeExec (successCallback, errorCallback);
	}
};


module.exports = new AppPreferences();
