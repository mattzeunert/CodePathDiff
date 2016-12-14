/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(868);


/***/ },

/***/ 868:
/***/ function(module, exports) {

	"use strict";
	
	function inhibitJavaScriptExecution(jsExecutionInhibitedMessage) {
	    if (!jsExecutionInhibitedMessage) {
	        jsExecutionInhibitedMessage = "JavaScript Execution Inhibited";
	    }
	
	    var windowProperties = {};
	    var Object = window.Object;
	    var console = window.console;
	    var Error = window.Error;
	    console.info("FromJS: Inhibiting JS execution");
	
	    function getPropertyDescriptor(object, propertyName) {
	        var descriptor = Object.getOwnPropertyDescriptor(object, propertyName);
	        if (!descriptor) {
	            return getPropertyDescriptor(Object.getPrototypeOf(object), propertyName);
	        }
	        return descriptor;
	    }
	
	    for (var propName in window) {
	        try {
	            windowProperties[propName] = getPropertyDescriptor(window, propName);
	            Object.defineProperty(window, propName, {
	                get: function () {
	                    propName;
	                    throw Error(jsExecutionInhibitedMessage);
	                },
	                set: function () {
	                    propName;
	                    throw Error(jsExecutionInhibitedMessage);
	                },
	                configurable: true
	            });
	        } catch (err) {
	            // debugger
	            // console.info(err)
	        }
	    }
	
	    return function allowJSExecution() {
	        for (var propName in window) {
	            if (!(propName in windowProperties)) {
	                delete windowProperties[propName];
	            }
	        }
	        delete window.allowJSExecution;
	
	        for (var propName in windowProperties) {
	            try {
	                Object.defineProperty(window, propName, windowProperties[propName]);
	            } catch (err) {
	                // debugger
	                // console.info(err)
	            }
	        }
	
	        console.info("FromJS: Re-allowed JS Execution");
	    };
	}
	
	window.inhibitJavaScriptExecution = inhibitJavaScriptExecution;

/***/ }

/******/ });
//# sourceMappingURL=inhibitJavaScriptExecution.js.map