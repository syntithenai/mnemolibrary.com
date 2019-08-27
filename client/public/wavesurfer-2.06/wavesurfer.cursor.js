/*!
 * wavesurfer.js 2.0.6 (Fri Jun 15 2018 10:57:49 GMT+0200 (CEST))
 * https://github.com/katspaugh/wavesurfer.js
 * @license BSD-3-Clause
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("cursor", [], factory);
	else if(typeof exports === 'object')
		exports["cursor"] = factory();
	else
		root["WaveSurfer"] = root["WaveSurfer"] || {}, root["WaveSurfer"]["cursor"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "localhost:8080/dist/plugin/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/plugin/cursor.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/plugin/cursor.js":
/*!******************************!*\
  !*** ./src/plugin/cursor.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @typedef {Object} CursorPluginParams
 * @property {?boolean} deferInit Set to true to stop auto init in `addPlugin()`
 * @property {boolean} hideOnBlur=true Hide the cursor when the mouse leaves the
 * waveform
 * @property {string} width='1px' The width of the cursor
 * @property {string} color='black' The color of the cursor
 * @property {string} opacity='0.25' The opacity of the cursor
 * @property {string} style='solid' The border style of the cursor
 * @property {number} zIndex=3 The z-index of the cursor element
 * @property {object} customStyle An object with custom styles which are applied
 * to the cursor element
 */

/**
 * Displays a thin line at the position of the cursor on the waveform.
 *
 * @implements {PluginClass}
 * @extends {Observer}
 * @example
 * // es6
 * import CursorPlugin from 'wavesurfer.cursor.js';
 *
 * // commonjs
 * var CursorPlugin = require('wavesurfer.cursor.js');
 *
 * // if you are using <script> tags
 * var CursorPlugin = window.WaveSurfer.cursor;
 *
 * // ... initialising wavesurfer with the plugin
 * var wavesurfer = WaveSurfer.create({
 *   // wavesurfer options ...
 *   plugins: [
 *     CursorPlugin.create({
 *       // plugin options ...
 *     })
 *   ]
 * });
 */
var CursorPlugin = function () {
    _createClass(CursorPlugin, null, [{
        key: 'create',

        /**
         * Cursor plugin definition factory
         *
         * This function must be used to create a plugin definition which can be
         * used by wavesurfer to correctly instantiate the plugin.
         *
         * @param  {CursorPluginParams} params parameters use to initialise the
         * plugin
         * @return {PluginDefinition} an object representing the plugin
         */
        value: function create(params) {
            return {
                name: 'cursor',
                deferInit: params && params.deferInit ? params.deferInit : false,
                params: params,
                staticProps: {
                    enableCursor: function enableCursor() {
                        console.warn('Deprecated enableCursor!');
                        this.initPlugins('cursor');
                    }
                },
                instance: CursorPlugin
            };
        }

        /**
         * @type {CursorPluginParams}
         */


        /** @private */

        /** @private */

        /** @private */

    }]);

    /**
     * Construct the plugin class. You probably want to use CursorPlugin.create
     * instead.
     *
     * @param {CursorPluginParams} params
     * @param {object} ws
     */
    function CursorPlugin(params, ws) {
        var _this = this;

        _classCallCheck(this, CursorPlugin);

        this.defaultParams = {
            hideOnBlur: true,
            width: '1px',
            color: 'black',
            opacity: '0.25',
            style: 'solid',
            zIndex: 4,
            customStyle: {}
        };

        this._onMousemove = function (e) {
            var bbox = _this.wavesurfer.container.getBoundingClientRect();
            _this.updateCursorPosition(e.clientX - bbox.left);
        };

        this._onMouseenter = function () {
            return _this.showCursor();
        };

        this._onMouseleave = function () {
            return _this.hideCursor();
        };

        /** @private */
        this.wavesurfer = ws;
        /** @private */
        this.style = ws.util.style;
        /**
         * The cursor html element
         *
         * @type {?HTMLElement}
         */
        this.cursor = null;
        /** @private */
        this.params = ws.util.extend({}, this.defaultParams, params);
    }

    /**
     * Initialise the plugin (used by the Plugin API)
     */


    _createClass(CursorPlugin, [{
        key: 'init',
        value: function init() {
            var wrapper = this.wavesurfer.container;
            this.cursor = wrapper.appendChild(this.style(document.createElement('cursor'), this.wavesurfer.util.extend({
                position: 'absolute',
                zIndex: this.params.zIndex,
                left: 0,
                top: 0,
                bottom: 0,
                width: '0',
                display: 'block',
                borderRightStyle: this.params.style,
                borderRightWidth: this.params.width,
                borderRightColor: this.params.color,
                opacity: this.params.opacity,
                pointerEvents: 'none'
            }, this.params.customStyle)));

            wrapper.addEventListener('mousemove', this._onMousemove);
            if (this.params.hideOnBlur) {
                wrapper.addEventListener('mouseenter', this._onMouseenter);
                wrapper.addEventListener('mouseleave', this._onMouseleave);
            }
        }

        /**
         * Destroy the plugin (used by the Plugin API)
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            this.cursor.parentNode.removeChild(this.cursor);
            this.wrapper.removeEventListener('mousemove', this._onMousemove);
            if (this.params.hideOnBlur) {
                this.wrapper.removeEventListener('mouseenter', this._onMouseenter);
                this.wrapper.removeEventListener('mouseleave', this._onMouseleave);
            }
        }

        /**
         * Update the cursor position
         *
         * @param {number} pos The x offset of the cursor in pixels
         */

    }, {
        key: 'updateCursorPosition',
        value: function updateCursorPosition(pos) {
            this.style(this.cursor, {
                left: pos + 'px'
            });
        }

        /**
         * Show the cursor
         */

    }, {
        key: 'showCursor',
        value: function showCursor() {
            this.style(this.cursor, {
                display: 'block'
            });
        }

        /**
         * Hide the cursor
         */

    }, {
        key: 'hideCursor',
        value: function hideCursor() {
            this.style(this.cursor, {
                display: 'none'
            });
        }
    }]);

    return CursorPlugin;
}();

exports.default = CursorPlugin;
module.exports = exports['default'];

/***/ })

/******/ });
});
//# sourceMappingURL=wavesurfer.cursor.js.map