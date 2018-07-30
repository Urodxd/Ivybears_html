/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the W3C SOFTWARE AND DOCUMENT NOTICE AND LICENSE.
 *
 *  https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 */

(function(window, document) {
    'use strict';

    // Exits early if all IntersectionObserver and IntersectionObserverEntry
    // features are natively supported.
    if ('IntersectionObserver'in window && 'IntersectionObserverEntry'in window && 'intersectionRatio'in window.IntersectionObserverEntry.prototype) {

        // Minimal polyfill for Edge 15's lack of `isIntersecting`
        // See: https://github.com/w3c/IntersectionObserver/issues/211
        if (!('isIntersecting'in window.IntersectionObserverEntry.prototype)) {
            Object.defineProperty(window.IntersectionObserverEntry.prototype, 'isIntersecting', {
                get: function() {
                    return this.intersectionRatio > 0;
                }
            });
        }
        return;
    }

    /**
     * An IntersectionObserver registry. This registry exists to hold a strong
     * reference to IntersectionObserver instances currently observering a target
     * element. Without this registry, instances without another reference may be
     * garbage collected.
     */
    var registry = [];

    /**
     * Creates the global IntersectionObserverEntry constructor.
     * https://w3c.github.io/IntersectionObserver/#intersection-observer-entry
     * @param {Object} entry A dictionary of instance properties.
     * @constructor
     */
    function IntersectionObserverEntry(entry) {
        this.time = entry.time;
        this.target = entry.target;
        this.rootBounds = entry.rootBounds;
        this.boundingClientRect = entry.boundingClientRect;
        this.intersectionRect = entry.intersectionRect || getEmptyRect();
        this.isIntersecting = !!entry.intersectionRect;

        // Calculates the intersection ratio.
        var targetRect = this.boundingClientRect;
        var targetArea = targetRect.width * targetRect.height;
        var intersectionRect = this.intersectionRect;
        var intersectionArea = intersectionRect.width * intersectionRect.height;

        // Sets intersection ratio.
        if (targetArea) {
            this.intersectionRatio = intersectionArea / targetArea;
        } else {
            // If area is zero and is intersecting, sets to 1, otherwise to 0
            this.intersectionRatio = this.isIntersecting ? 1 : 0;
        }
    }

    /**
     * Creates the global IntersectionObserver constructor.
     * https://w3c.github.io/IntersectionObserver/#intersection-observer-interface
     * @param {Function} callback The function to be invoked after intersection
     *     changes have queued. The function is not invoked if the queue has
     *     been emptied by calling the `takeRecords` method.
     * @param {Object=} opt_options Optional configuration options.
     * @constructor
     */
    function IntersectionObserver(callback, opt_options) {

        var options = opt_options || {};

        if (typeof callback != 'function') {
            throw new Error('callback must be a function');
        }

        if (options.root && options.root.nodeType != 1) {
            throw new Error('root must be an Element');
        }

        // Binds and throttles `this._checkForIntersections`.
        this._checkForIntersections = throttle(this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);

        // Private properties.
        this._callback = callback;
        this._observationTargets = [];
        this._queuedEntries = [];
        this._rootMarginValues = this._parseRootMargin(options.rootMargin);

        // Public properties.
        this.thresholds = this._initThresholds(options.threshold);
        this.root = options.root || null;
        this.rootMargin = this._rootMarginValues.map(function(margin) {
            return margin.value + margin.unit;
        }).join(' ');
    }

    /**
     * The minimum interval within which the document will be checked for
     * intersection changes.
     */
    IntersectionObserver.prototype.THROTTLE_TIMEOUT = 100;

    /**
     * The frequency in which the polyfill polls for intersection changes.
     * this can be updated on a per instance basis and must be set prior to
     * calling `observe` on the first target.
     */
    IntersectionObserver.prototype.POLL_INTERVAL = null;

    /**
     * Use a mutation observer on the root element
     * to detect intersection changes.
     */
    IntersectionObserver.prototype.USE_MUTATION_OBSERVER = true;

    /**
     * Starts observing a target element for intersection changes based on
     * the thresholds values.
     * @param {Element} target The DOM element to observe.
     */
    IntersectionObserver.prototype.observe = function(target) {
        var isTargetAlreadyObserved = this._observationTargets.some(function(item) {
            return item.element == target;
        });

        if (isTargetAlreadyObserved) {
            return;
        }

        if (!(target && target.nodeType == 1)) {
            throw new Error('target must be an Element');
        }

        this._registerInstance();
        this._observationTargets.push({
            element: target,
            entry: null
        });
        this._monitorIntersections();
        this._checkForIntersections();
    }
    ;

    /**
     * Stops observing a target element for intersection changes.
     * @param {Element} target The DOM element to observe.
     */
    IntersectionObserver.prototype.unobserve = function(target) {
        this._observationTargets = this._observationTargets.filter(function(item) {

            return item.element != target;
        });
        if (!this._observationTargets.length) {
            this._unmonitorIntersections();
            this._unregisterInstance();
        }
    }
    ;

    /**
     * Stops observing all target elements for intersection changes.
     */
    IntersectionObserver.prototype.disconnect = function() {
        this._observationTargets = [];
        this._unmonitorIntersections();
        this._unregisterInstance();
    }
    ;

    /**
     * Returns any queue entries that have not yet been reported to the
     * callback and clears the queue. This can be used in conjunction with the
     * callback to obtain the absolute most up-to-date intersection information.
     * @return {Array} The currently queued entries.
     */
    IntersectionObserver.prototype.takeRecords = function() {
        var records = this._queuedEntries.slice();
        this._queuedEntries = [];
        return records;
    }
    ;

    /**
     * Accepts the threshold value from the user configuration object and
     * returns a sorted array of unique threshold values. If a value is not
     * between 0 and 1 and error is thrown.
     * @private
     * @param {Array|number=} opt_threshold An optional threshold value or
     *     a list of threshold values, defaulting to [0].
     * @return {Array} A sorted list of unique and valid threshold values.
     */
    IntersectionObserver.prototype._initThresholds = function(opt_threshold) {
        var threshold = opt_threshold || [0];
        if (!Array.isArray(threshold))
            threshold = [threshold];

        return threshold.sort().filter(function(t, i, a) {
            if (typeof t != 'number' || isNaN(t) || t < 0 || t > 1) {
                throw new Error('threshold must be a number between 0 and 1 inclusively');
            }
            return t !== a[i - 1];
        });
    }
    ;

    /**
     * Accepts the rootMargin value from the user configuration object
     * and returns an array of the four margin values as an object containing
     * the value and unit properties. If any of the values are not properly
     * formatted or use a unit other than px or %, and error is thrown.
     * @private
     * @param {string=} opt_rootMargin An optional rootMargin value,
     *     defaulting to '0px'.
     * @return {Array<Object>} An array of margin objects with the keys
     *     value and unit.
     */
    IntersectionObserver.prototype._parseRootMargin = function(opt_rootMargin) {
        var marginString = opt_rootMargin || '0px';
        var margins = marginString.split(/\s+/).map(function(margin) {
            var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
            if (!parts) {
                throw new Error('rootMargin must be specified in pixels or percent');
            }
            return {
                value: parseFloat(parts[1]),
                unit: parts[2]
            };
        });

        // Handles shorthand.
        margins[1] = margins[1] || margins[0];
        margins[2] = margins[2] || margins[0];
        margins[3] = margins[3] || margins[1];

        return margins;
    }
    ;

    /**
     * Starts polling for intersection changes if the polling is not already
     * happening, and if the page's visibilty state is visible.
     * @private
     */
    IntersectionObserver.prototype._monitorIntersections = function() {
        if (!this._monitoringIntersections) {
            this._monitoringIntersections = true;

            // If a poll interval is set, use polling instead of listening to
            // resize and scroll events or DOM mutations.
            if (this.POLL_INTERVAL) {
                this._monitoringInterval = setInterval(this._checkForIntersections, this.POLL_INTERVAL);
            } else {
                addEvent(window, 'resize', this._checkForIntersections, true);
                addEvent(document, 'scroll', this._checkForIntersections, true);

                if (this.USE_MUTATION_OBSERVER && 'MutationObserver'in window) {
                    this._domObserver = new MutationObserver(this._checkForIntersections);
                    this._domObserver.observe(document, {
                        attributes: true,
                        childList: true,
                        characterData: true,
                        subtree: true
                    });
                }
            }
        }
    }
    ;

    /**
     * Stops polling for intersection changes.
     * @private
     */
    IntersectionObserver.prototype._unmonitorIntersections = function() {
        if (this._monitoringIntersections) {
            this._monitoringIntersections = false;

            clearInterval(this._monitoringInterval);
            this._monitoringInterval = null;

            removeEvent(window, 'resize', this._checkForIntersections, true);
            removeEvent(document, 'scroll', this._checkForIntersections, true);

            if (this._domObserver) {
                this._domObserver.disconnect();
                this._domObserver = null;
            }
        }
    }
    ;

    /**
     * Scans each observation target for intersection changes and adds them
     * to the internal entries queue. If new entries are found, it
     * schedules the callback to be invoked.
     * @private
     */
    IntersectionObserver.prototype._checkForIntersections = function() {
        var rootIsInDom = this._rootIsInDom();
        var rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();

        this._observationTargets.forEach(function(item) {
            var target = item.element;
            var targetRect = getBoundingClientRect(target);
            var rootContainsTarget = this._rootContainsTarget(target);
            var oldEntry = item.entry;
            var intersectionRect = rootIsInDom && rootContainsTarget && this._computeTargetAndRootIntersection(target, rootRect);

            var newEntry = item.entry = new IntersectionObserverEntry({
                time: now(),
                target: target,
                boundingClientRect: targetRect,
                rootBounds: rootRect,
                intersectionRect: intersectionRect
            });

            if (!oldEntry) {
                this._queuedEntries.push(newEntry);
            } else if (rootIsInDom && rootContainsTarget) {
                // If the new entry intersection ratio has crossed any of the
                // thresholds, add a new entry.
                if (this._hasCrossedThreshold(oldEntry, newEntry)) {
                    this._queuedEntries.push(newEntry);
                }
            } else {
                // If the root is not in the DOM or target is not contained within
                // root but the previous entry for this target had an intersection,
                // add a new record indicating removal.
                if (oldEntry && oldEntry.isIntersecting) {
                    this._queuedEntries.push(newEntry);
                }
            }
        }, this);

        if (this._queuedEntries.length) {
            this._callback(this.takeRecords(), this);
        }
    }
    ;

    /**
     * Accepts a target and root rect computes the intersection between then
     * following the algorithm in the spec.
     * TODO(philipwalton): at this time clip-path is not considered.
     * https://w3c.github.io/IntersectionObserver/#calculate-intersection-rect-algo
     * @param {Element} target The target DOM element
     * @param {Object} rootRect The bounding rect of the root after being
     *     expanded by the rootMargin value.
     * @return {?Object} The final intersection rect object or undefined if no
     *     intersection is found.
     * @private
     */
    IntersectionObserver.prototype._computeTargetAndRootIntersection = function(target, rootRect) {

        // If the element isn't displayed, an intersection can't happen.
        if (window.getComputedStyle(target).display == 'none')
            return;

        var targetRect = getBoundingClientRect(target);
        var intersectionRect = targetRect;
        var parent = getParentNode(target);
        var atRoot = false;

        while (!atRoot) {
            var parentRect = null;
            var parentComputedStyle = parent.nodeType == 1 ? window.getComputedStyle(parent) : {};

            // If the parent isn't displayed, an intersection can't happen.
            if (parentComputedStyle.display == 'none')
                return;

            if (parent == this.root || parent == document) {
                atRoot = true;
                parentRect = rootRect;
            } else {
                // If the element has a non-visible overflow, and it's not the <body>
                // or <html> element, update the intersection rect.
                // Note: <body> and <html> cannot be clipped to a rect that's not also
                // the document rect, so no need to compute a new intersection.
                if (parent != document.body && parent != document.documentElement && parentComputedStyle.overflow != 'visible') {
                    parentRect = getBoundingClientRect(parent);
                }
            }

            // If either of the above conditionals set a new parentRect,
            // calculate new intersection data.
            if (parentRect) {
                intersectionRect = computeRectIntersection(parentRect, intersectionRect);

                if (!intersectionRect)
                    break;
            }
            parent = getParentNode(parent);
        }
        return intersectionRect;
    }
    ;

    /**
     * Returns the root rect after being expanded by the rootMargin value.
     * @return {Object} The expanded root rect.
     * @private
     */
    IntersectionObserver.prototype._getRootRect = function() {
        var rootRect;
        if (this.root) {
            rootRect = getBoundingClientRect(this.root);
        } else {
            // Use <html>/<body> instead of window since scroll bars affect size.
            var html = document.documentElement;
            var body = document.body;
            rootRect = {
                top: 0,
                left: 0,
                right: html.clientWidth || body.clientWidth,
                width: html.clientWidth || body.clientWidth,
                bottom: html.clientHeight || body.clientHeight,
                height: html.clientHeight || body.clientHeight
            };
        }
        return this._expandRectByRootMargin(rootRect);
    }
    ;

    /**
     * Accepts a rect and expands it by the rootMargin value.
     * @param {Object} rect The rect object to expand.
     * @return {Object} The expanded rect.
     * @private
     */
    IntersectionObserver.prototype._expandRectByRootMargin = function(rect) {
        var margins = this._rootMarginValues.map(function(margin, i) {
            return margin.unit == 'px' ? margin.value : margin.value * (i % 2 ? rect.width : rect.height) / 100;
        });
        var newRect = {
            top: rect.top - margins[0],
            right: rect.right + margins[1],
            bottom: rect.bottom + margins[2],
            left: rect.left - margins[3]
        };
        newRect.width = newRect.right - newRect.left;
        newRect.height = newRect.bottom - newRect.top;

        return newRect;
    }
    ;

    /**
     * Accepts an old and new entry and returns true if at least one of the
     * threshold values has been crossed.
     * @param {?IntersectionObserverEntry} oldEntry The previous entry for a
     *    particular target element or null if no previous entry exists.
     * @param {IntersectionObserverEntry} newEntry The current entry for a
     *    particular target element.
     * @return {boolean} Returns true if a any threshold has been crossed.
     * @private
     */
    IntersectionObserver.prototype._hasCrossedThreshold = function(oldEntry, newEntry) {

        // To make comparing easier, an entry that has a ratio of 0
        // but does not actually intersect is given a value of -1
        var oldRatio = oldEntry && oldEntry.isIntersecting ? oldEntry.intersectionRatio || 0 : -1;
        var newRatio = newEntry.isIntersecting ? newEntry.intersectionRatio || 0 : -1;

        // Ignore unchanged ratios
        if (oldRatio === newRatio)
            return;

        for (var i = 0; i < this.thresholds.length; i++) {
            var threshold = this.thresholds[i];

            // Return true if an entry matches a threshold or if the new ratio
            // and the old ratio are on the opposite sides of a threshold.
            if (threshold == oldRatio || threshold == newRatio || threshold < oldRatio !== threshold < newRatio) {
                return true;
            }
        }
    }
    ;

    /**
     * Returns whether or not the root element is an element and is in the DOM.
     * @return {boolean} True if the root element is an element and is in the DOM.
     * @private
     */
    IntersectionObserver.prototype._rootIsInDom = function() {
        return !this.root || containsDeep(document, this.root);
    }
    ;

    /**
     * Returns whether or not the target element is a child of root.
     * @param {Element} target The target element to check.
     * @return {boolean} True if the target element is a child of root.
     * @private
     */
    IntersectionObserver.prototype._rootContainsTarget = function(target) {
        return containsDeep(this.root || document, target);
    }
    ;

    /**
     * Adds the instance to the global IntersectionObserver registry if it isn't
     * already present.
     * @private
     */
    IntersectionObserver.prototype._registerInstance = function() {
        if (registry.indexOf(this) < 0) {
            registry.push(this);
        }
    }
    ;

    /**
     * Removes the instance from the global IntersectionObserver registry.
     * @private
     */
    IntersectionObserver.prototype._unregisterInstance = function() {
        var index = registry.indexOf(this);
        if (index != -1)
            registry.splice(index, 1);
    }
    ;

    /**
     * Returns the result of the performance.now() method or null in browsers
     * that don't support the API.
     * @return {number} The elapsed time since the page was requested.
     */
    function now() {
        return window.performance && performance.now && performance.now();
    }

    /**
     * Throttles a function and delays its executiong, so it's only called at most
     * once within a given time period.
     * @param {Function} fn The function to throttle.
     * @param {number} timeout The amount of time that must pass before the
     *     function can be called again.
     * @return {Function} The throttled function.
     */
    function throttle(fn, timeout) {
        var timer = null;
        return function() {
            if (!timer) {
                timer = setTimeout(function() {
                    fn();
                    timer = null;
                }, timeout);
            }
        }
            ;
    }

    /**
     * Adds an event handler to a DOM node ensuring cross-browser compatibility.
     * @param {Node} node The DOM node to add the event handler to.
     * @param {string} event The event name.
     * @param {Function} fn The event handler to add.
     * @param {boolean} opt_useCapture Optionally adds the even to the capture
     *     phase. Note: this only works in modern browsers.
     */
    function addEvent(node, event, fn, opt_useCapture) {
        if (typeof node.addEventListener == 'function') {
            node.addEventListener(event, fn, opt_useCapture || false);
        } else if (typeof node.attachEvent == 'function') {
            node.attachEvent('on' + event, fn);
        }
    }

    /**
     * Removes a previously added event handler from a DOM node.
     * @param {Node} node The DOM node to remove the event handler from.
     * @param {string} event The event name.
     * @param {Function} fn The event handler to remove.
     * @param {boolean} opt_useCapture If the event handler was added with this
     *     flag set to true, it should be set to true here in order to remove it.
     */
    function removeEvent(node, event, fn, opt_useCapture) {
        if (typeof node.removeEventListener == 'function') {
            node.removeEventListener(event, fn, opt_useCapture || false);
        } else if (typeof node.detatchEvent == 'function') {
            node.detatchEvent('on' + event, fn);
        }
    }

    /**
     * Returns the intersection between two rect objects.
     * @param {Object} rect1 The first rect.
     * @param {Object} rect2 The second rect.
     * @return {?Object} The intersection rect or undefined if no intersection
     *     is found.
     */
    function computeRectIntersection(rect1, rect2) {
        var top = Math.max(rect1.top, rect2.top);
        var bottom = Math.min(rect1.bottom, rect2.bottom);
        var left = Math.max(rect1.left, rect2.left);
        var right = Math.min(rect1.right, rect2.right);
        var width = right - left;
        var height = bottom - top;

        return (width >= 0 && height >= 0) && {
            top: top,
            bottom: bottom,
            left: left,
            right: right,
            width: width,
            height: height
        };
    }

    /**
     * Shims the native getBoundingClientRect for compatibility with older IE.
     * @param {Element} el The element whose bounding rect to get.
     * @return {Object} The (possibly shimmed) rect of the element.
     */
    function getBoundingClientRect(el) {
        var rect;

        try {
            rect = el.getBoundingClientRect();
        } catch (err) {// Ignore Windows 7 IE11 "Unspecified error"
            // https://github.com/w3c/IntersectionObserver/pull/205
        }

        if (!rect)
            return getEmptyRect();

        // Older IE
        if (!(rect.width && rect.height)) {
            rect = {
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top
            };
        }
        return rect;
    }

    /**
     * Returns an empty rect object. An empty rect is returned when an element
     * is not in the DOM.
     * @return {Object} The empty rect.
     */
    function getEmptyRect() {
        return {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: 0,
            height: 0
        };
    }

    /**
     * Checks to see if a parent element contains a child elemnt (including inside
     * shadow DOM).
     * @param {Node} parent The parent element.
     * @param {Node} child The child element.
     * @return {boolean} True if the parent node contains the child node.
     */
    function containsDeep(parent, child) {
        var node = child;
        while (node) {
            if (node == parent)
                return true;

            node = getParentNode(node);
        }
        return false;
    }

    /**
     * Gets the parent node of an element or its host element if the parent node
     * is a shadow root.
     * @param {Node} node The node whose parent to get.
     * @return {Node|null} The parent node or null if no parent exists.
     */
    function getParentNode(node) {
        var parent = node.parentNode;

        if (parent && parent.nodeType == 11 && parent.host) {
            // If the parent is a shadow root, return the host element.
            return parent.host;
        }
        return parent;
    }

    // Exposes the constructors globally.
    window.IntersectionObserver = IntersectionObserver;
    window.IntersectionObserverEntry = IntersectionObserverEntry;

}(window, document));

/*!
 * rimg v2.1.0
 * (c) 2018 Pixel Union
 */
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global.rimg = factory());
}(this, (function() {
    'use strict';

    /**
     * The default template render function. Turns a template string into an image
     * URL.
     *
     * @param {String} template
     * @param {Size} size
     * @returns {String}
     */
    function defaultTemplateRender(template, size) {
        return template.replace('{size}', size.width + 'x' + size.height);
    }

    /**
     * @type Settings
     */
    var defaults = {
        scale: 1,
        template: false,
        templateRender: defaultTemplateRender,
        max: {
            width: Infinity,
            height: Infinity
        },
        round: 32,
        placeholder: false
    };

    /**
     * Get a data attribute value from an element, with a default fallback and
     * sanitization step.
     *
     * @param {Element} el
     *
     * @param {String} name
     *        The data attribute name.
     *
     * @param {Object} options
     *        An object holding fallback values if the data attribute does not
     *        exist. If this object doesn't have the property, we further fallback
     *        to our defaults.
     *
     * @param {Function} [sanitize]
     *        A function to sanitize the data attribute value with.
     *
     * @returns {String|*}
     */
    function getData(el, name, options, sanitize) {
        var attr = 'data-rimg-' + name;
        if (!el.hasAttribute(attr))
            return options[name] || defaults[name];

        var value = el.getAttribute(attr);

        return sanitize ? sanitize(value) : value;
    }

    /**
     * Sanitize data attributes that represent a size (in the form of `10x10`).
     *
     * @param {String} value
     * @returns {Object} An object with `width` and `height` properties.
     */
    function parseSize(value) {
        value = value.split('x');
        return {
            width: parseInt(value[0], 10),
            height: parseInt(value[1], 10)
        };
    }

    /**
     * Loads information about an element.
     *
     * Options can be set on the element itself using data attributes, or through
     * the `options` parameter. Data attributes take priority.
     *
     * @param {HTMLElement} el
     * @param {Settings} options
     * @returns {Item}
     */
    function parseItem(el) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var isImage = el.hasAttribute('data-rimg-template');

        /**
         * @typedef {Settings} Item
         */
        return {
            el: el,

            // Type of element
            isImage: isImage,
            isBackgroundImage: isImage && el.tagName !== 'IMG',

            // Image scale
            scale: getData(el, 'scale', options),

            // Device density
            density: window.devicePixelRatio || 1,

            // Image template URL
            template: getData(el, 'template', options),
            templateRender: options.templateRender || defaults.templateRender,

            // Maximum image dimensions
            max: getData(el, 'max', options, parseSize),

            // Round image dimensions to the nearest multiple
            round: getData(el, 'round', options),

            // Placeholder image dimensions
            placeholder: getData(el, 'placeholder', options, parseSize)
        };
    }

    /**
     * Round to the nearest multiple.
     *
     * This is so we don't tax the image server too much.
     *
     * @param {Number} size The size, in pixels.
     * @param {Number} multiple The multiple to round to the nearest.
     * @returns {Number}
     */
    function roundSize(size, multiple) {
        return Math.ceil(size / multiple) * multiple;
    }

    /**
     * Get the size of an element.
     *
     * If it is too small, it's parent element is checked, and so on. This helps
     * avoid the situation where an element doesn't have a size yet or is positioned
     * out of the layout.
     *
     * @param {HTMLElement} el
     * @return {Object} size
     * @return {Number} size.width The width, in pixels.
     * @return {Number} size.height The height, in pixels.
     */
    function getElementSize(el) {
        var size = {
            width: 0,
            height: 0
        };

        while (el) {
            size.width = el.offsetWidth;
            size.height = el.offsetHeight;
            if (size.width > 20 && size.height > 20)
                break;
            el = el.parentNode;
        }

        return size;
    }

    /**
     * Trigger a custom event.
     *
     * Note: this approach is deprecated, but still required to support older
     * browsers such as IE 10.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
     *
     * @param {HTMLElement} el
     *        The element to trigger the event on.
     *
     * @param {String} name
     *        The event name.
     *
     * @returns {Boolean}
     *          True if the event was canceled.
     */
    function trigger(el, name) {
        var event = document.createEvent('Event');
        event.initEvent(name, true, true);
        return !el.dispatchEvent(event);
    }

    /**
     * Return the maximum supported density of the image, given the container.
     *
     * @param {Item} item
     * @param {Size} size
     */
    function supportedDensity(item, size) {
        return Math.min(Math.min(Math.max(item.max.width / size.width, 1), item.density), Math.min(Math.max(item.max.height / size.height, 1), item.density)).toFixed(2);
    }

    /**
     * Set the image URL on the element. Supports background images and `srcset`.
     *
     * @param {Item} item
     * @param {Size} size
     * @param {Boolean} isPlaceholder
     */
    function setImage(item, size, isPlaceholder, onLoad) {
        var render = item.templateRender;
        var density = isPlaceholder ? 1 : supportedDensity(item, size);
        var round = isPlaceholder ? 1 : item.round;

        var width = roundSize(size.width * density, round);
        var height = roundSize(size.height * density, round);
        var displaySize = width > item.max.width || height > item.max.height ? {
            width: item.max.width,
            height: item.max.height
        } : {
            width: width,
            height: height
        };

        var url = render(item.template, displaySize);

        // On load callback
        var image = new Image();
        image.onload = onLoad;
        image.src = url;

        // Set image
        if (item.isBackgroundImage) {
            item.el.style.backgroundImage = 'url(\'' + url + '\')';
        } else {
            item.el.setAttribute('srcset', url + ' ' + density + 'x');
        }
    }

    /**
     * Load the image, set loaded status, and trigger the load event.
     *
     * @fires rimg:load
     * @fires rimg:error
     * @param {Item} item
     * @param {Size} size
     */
    function loadFullImage(item, size) {
        var el = item.el;

        setImage(item, size, false, function(event) {
            if (event.type === 'load') {
                el.setAttribute('data-rimg', 'loaded');
            } else {
                el.setAttribute('data-rimg', 'error');
                trigger(el, 'rimg:error');
            }

            trigger(el, 'rimg:load');
        });
    }

    /**
     * Load in a responsive image.
     *
     * Sets the image's `srcset` attribute to the final image URLs, calculated based
     * on the actual size the image is being shown at.
     *
     * @fires rimg:loading
     *        The image URLs have been set and we are waiting for them to load.
     *
     * @fires rimg:loaded
     *        The final image has loaded.
     *
     * @fires rimg:error
     *        The final image failed loading.
     *
     * @param {Item} item
     */
    function loadImage(item) {
        var el = item.el;

        // Already loaded?
        var status = el.getAttribute('data-rimg');
        if (status === 'loading' || status === 'loaded')
            return;

        // Is the SVG loaded?
        if (!el.complete && !item.isBackgroundImage) {
            // Wait for the load event, then call load image
            el.addEventListener('load', function cb() {
                el.removeEventListener('load', cb);
                loadImage(item);
            });

            return;
        }

        // Trigger loading event, and stop if cancelled
        if (trigger(el, 'rimg:loading'))
            return;

        // Mark as loading
        el.setAttribute('data-rimg', 'loading');

        // Get element size. This is used as the ideal display size.
        var size = getElementSize(item.el);

        size.width *= item.scale;
        size.height *= item.scale;

        if (item.placeholder) {
            // Load a placeholder image first, followed by the full image. Force the
            // element to keep its dimensions while it loads. If the image is smaller
            // than the element size, use the image's size. Density is taken into account
            // for HiDPI devices to avoid blurry images.
            if (!item.isBackgroundImage) {
                el.setAttribute('width', Math.min(Math.floor(item.max.width / item.density), size.width));
                el.setAttribute('height', Math.min(Math.floor(item.max.height / item.density), size.height));
            }

            setImage(item, item.placeholder, true, function() {
                return loadFullImage(item, size);
            });
        } else {
            loadFullImage(item, size);
        }
    }

    /**
     * Prepare an element to be displayed on the screen.
     *
     * Images have special logic applied to them to swap out the different sources.
     *
     * @fires rimg:enter
     *        The element is entering the viewport.
     *
     * @param {HTMLElement} el
     * @param {Settings} options
     */
    function load(el, options) {
        if (!el)
            return;
        trigger(el, 'rimg:enter');

        var item = parseItem(el, options);
        if (item.isImage) {
            if (!item.isBackgroundImage) {
                el.setAttribute('data-rimg-template-svg', el.getAttribute('srcset'));
            }

            loadImage(item);
        }
    }

    /**
     * Prepare an element to be displayed on the screen.
     *
     * Images have special logic applied to them to swap out the different sources.
     *
     * @fires rimg:enter
     *        The element is entering the viewport.
     *
     * @param {HTMLElement} el
     * @param {Settings} options
     */
    function update(el, options) {
        if (!el)
            return;
        trigger(el, 'rimg:update');

        var item = parseItem(el, options);

        if (item.isImage) {
            if (!item.isBackgroundImage) {
                el.setAttribute('data-rimg', 'lazy');
                el.setAttribute('srcset', el.getAttribute('data-rimg-template-svg'));
            }

            loadImage(item);
        }
    }

    /**
     * @typedef {Object} Size
     * @property {Number} width
     * @property {Number} height
     */

    /**
     * A function to turn a template string into a URL.
     *
     * @callback TemplateRenderer
     * @param {String} template
     * @param {Size} size
     * @returns {String}
     */

    /**
     * @typedef {Object} Settings
     *
     * @property {String} [template]
     *           A template string used to generate URLs for an image. This allows us to
     *           dynamically load images with sizes to match the container's size.
     *
     * @property {TemplateRenderer} [templateRender]
     *           A function to turn a template string into a URL.
     *
     * @property {Size} [max]
     *           The maximum available size for the image. This ensures we don't
     *           try to load an image larger than is possible.
     *
     * @property {Number} [round]
     *           Round image dimensions to the nearest multiple. This is intended to
     *           tax the image server less by lowering the number of possible image
     *           sizes requested.
     *
     * @property {Size} [placeholder]
     *           The size of the lo-fi image to load before the full image.
     */

    /**
     * Initialize the responsive image handler.
     *
     * @param {String|HTMLElement|NodeList} selector
     *        The CSS selector, element, or elements to track for lazy-loading.
     *
     * @param {Settings} options
     *
     * @returns {PublicApi}
     */
    function rimg() {
        var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[data-rimg="lazy"]';
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        // Intersections
        var io = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting || entry.intersectionRatio > 0) {
                        io.unobserve(entry.target);
                        load(entry.target, options);
                    }
                });
            }
            ,{
                // Watch the viewport, with 20% vertical margins
                rootMargin: '20% 0px'
            });

        /**
         * @typedef {Object} PublicApi
         */
        var api = {
            /**
             * Track a new selector, element, or nodelist for lazy-loading.
             * @type Function
             * @param {String|HTMLElement|NodeList} selector
             */
            track: function track() {
                var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[data-rimg="lazy"]';

                var els = querySelector(selector);
                for (var i = 0; i < els.length; i++) {
                    io.observe(els[i]);
                }
            },
            update: function update$$1() {
                var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[data-rimg="loaded"]';

                var els = querySelector(selector);
                for (var i = 0; i < els.length; i++) {
                    update(els[i], options);
                }
            },

            /**
             * Stop tracking element(s) for lazy-loading.
             * @type Function
             * @param {String|HTMLElement|NodeList} selector
             */
            untrack: function untrack() {
                var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[data-rimg]';

                var els = querySelector(selector);
                for (var i = 0; i < els.length; i++) {
                    io.unobserve(els[i]);
                }
            },

            /**
             * Unload all event handlers and observers.
             * @type Function
             */
            unload: function unload() {
                io.disconnect();
            }
        };

        // Add initial elements
        api.track(selector);

        return api;
    }

    /**
     * Finds a group of elements on the page.
     *
     * @param {String|HTMLElement|NodeList} selector
     * @returns {Object} An array-like object.
     */
    function querySelector(selector) {
        if (typeof selector === 'string') {
            return document.querySelectorAll(selector);
        }

        if (selector instanceof HTMLElement) {
            return [selector];
        }

        if (selector instanceof NodeList) {
            return selector;
        }

        return [];
    }

    return rimg;

})));

/*!
 * rimg-shopify v2.2.0
 * (c) 2018 Pixel Union
 */
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('rimg')) : typeof define === 'function' && define.amd ? define(['rimg'], factory) : (global.rimg = global.rimg || {},
        global.rimg.shopify = factory(global.rimg));
}(this, (function(rimg) {
    'use strict';

    rimg = rimg && rimg.hasOwnProperty('default') ? rimg['default'] : rimg;

    /**
     * Polyfill for Element.matches().
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
     */
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s)
                , i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        }
        ;
    }

    var state = {
        init: init,
        watch: watch,
        unwatch: unwatch
    };

    function init() {
        var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[data-rimg="lazy"]';
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        state.selector = selector;
        state.instance = rimg(selector, options);
        state.loadedWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

        // Listen for Shopify theme editor events
        document.addEventListener('shopify:section:load', function(event) {
            return watch(event.target);
        });

        window.addEventListener('resize', function() {
            return _update();
        });

        document.addEventListener('shopify:section:unload', function(event) {
            return unwatch(event.target);
        });

        // Listen for custom events to allow themes to hook into rimg
        document.addEventListener('theme:rimg:watch', function(event) {
            return watch(event.target);
        });

        document.addEventListener('theme:rimg:unwatch', function(event) {
            return unwatch(event.target);
        });

        // Support custom events triggered through jQuery
        // See: https://github.com/jquery/jquery/issues/3347
        if (window.jQuery) {
            jQuery(document).on({
                'theme:rimg:watch': function themeRimgWatch(event) {
                    return watch(event.target);
                },
                'theme:rimg:unwatch': function themeRimgUnwatch(event) {
                    return unwatch(event.target);
                }
            });
        }
    }

    /**
     * Track an element, and its children.
     *
     * @param {HTMLElement} el
     */
    function watch(el) {
        // Track element
        if (typeof el.matches === 'function' && el.matches(state.selector)) {
            state.instance.track(el);
        }

        // Track element's children
        state.instance.track(el.querySelectorAll(state.selector));
    }

    /**
     * Untrack an element, and its children
     *
     * @param {HTMLElement} el
     * @private
     */
    function unwatch(el) {
        // Untrack element's children
        state.instance.untrack(el.querySelectorAll(state.selector));

        // Untrack element
        if (typeof el.matches === 'function' && el.matches(state.selector)) {
            state.instance.untrack(el);
        }
    }

    /**
     * Update an element, and its children.
     *
     * @param {HTMLElement} el
     */
    function _update() {
        var currentWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

        // Return if we're not 2x smaller, or larger than the existing loading size
        if (currentWidth / state.loadedWidth > 0.5 && currentWidth / state.loadedWidth < 2) {
            return;
        }

        state.loadedWidth = currentWidth;
        state.instance.update();
    }

    return state;

})));

;var Twitter, extend = function(child, parent) {
    for (var key in parent) {
        if (hasProp.call(parent, key))
            child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
}, hasProp = {}.hasOwnProperty, slice = [].slice, bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    }
        ;
};

window.AddressesView = (function(superClass) {
    extend(AddressesView, superClass);

    function AddressesView() {
        return AddressesView.__super__.constructor.apply(this, arguments);
    }

    AddressesView.prototype.events = {
        'click .delete-address': 'deleteAddress',
        'click .edit-address': 'editAddress',
        'click .cancel-edit': 'cancelEditing',
        'click .toggle-new-address': 'toggleNewAddress',
        'change .select-wrapper select': 'updateSelectedText'
    };

    AddressesView.prototype.initialize = function() {
        return this.prepareAddresses();
    }
    ;

    AddressesView.prototype.prepareAddresses = function() {
        var address, addressID, addresses, j, l, len, len1, results1, select, selectableOptions;
        new Shopify.CountryProvinceSelector('address-country','address-province',{
            hideElement: 'address-province-container'
        });
        addresses = this.$('.customer-address');
        if (addresses.length) {
            for (j = 0,
                     len = addresses.length; j < len; j++) {
                address = addresses[j];
                addressID = $(address).data('address-id');
                new Shopify.CountryProvinceSelector("address-country-" + addressID,"address-province-" + addressID,{
                    hideElement: "address-province-container-" + addressID
                });
            }
        }
        selectableOptions = this.$('.select-wrapper select');
        results1 = [];
        for (l = 0,
                 len1 = selectableOptions.length; l < len1; l++) {
            select = selectableOptions[l];
            results1.push(this.updateSelectedText(null, select));
        }
        return results1;
    }
    ;

    AddressesView.prototype.updateSelectedText = function(e, select) {
        var addressID, selectedValue;
        select = e ? $(e.target) : $(select);
        selectedValue = select.find('option:selected').text();
        if (selectedValue !== '') {
            select.prev('.selected-text').text(selectedValue);
        }
        if (select.attr('name') === 'address[country]') {
            addressID = $(select).attr('id').split('address-country-')[1];
            addressID = addressID ? "#address-province-" + addressID : '.new-address-province';
            return this.updateSelectedText(null, $(addressID));
        }
    }
    ;

    AddressesView.prototype.deleteAddress = function(e) {
        var addressID;
        if (e) {
            e.preventDefault();
        }
        addressID = $(e.target).parents('[data-address-id]').data('address-id');
        return Shopify.CustomerAddress.destroy(addressID);
    }
    ;

    AddressesView.prototype.editAddress = function(e) {
        var addressID;
        if (e) {
            e.preventDefault();
        }
        addressID = $(e.currentTarget).parents('[data-address-id]').data('address-id');
        $(".customer-address[data-address-id='" + addressID + "']").addClass('editing');
        return $(".customer-address-edit-form[data-address-id='" + addressID + "']").addClass('show');
    }
    ;

    AddressesView.prototype.cancelEditing = function(e) {
        var addressID;
        if (e) {
            e.preventDefault();
        }
        addressID = $(e.target).parents('[data-address-id]').data('address-id');
        $(".customer-address[data-address-id='" + addressID + "']").removeClass('editing');
        return $(".customer-address-edit-form[data-address-id='" + addressID + "']").removeClass('show');
    }
    ;

    AddressesView.prototype.toggleNewAddress = function(e) {
        if (e) {
            e.preventDefault();
        }
        this.$('.add-new-address').toggle();
        return this.$('.customer-new-address').toggleClass('show');
    }
    ;

    AddressesView.prototype.render = function() {}
    ;

    return AddressesView;

})(Backbone.View);

window.AccountView = (function(superClass) {
    extend(AccountView, superClass);

    function AccountView() {
        return AccountView.__super__.constructor.apply(this, arguments);
    }

    AccountView.prototype.events = {
        'click .toggle-forgetfulness span': 'recoverPassword'
    };

    AccountView.prototype.initialize = function() {
        if ($(document.body).hasClass('template-customers-addresses')) {
            this.addressesView = new AddressesView({
                el: $('.main-content')
            });
        }
        if ($(document.body).hasClass('template-customers-login')) {
            this.checkForReset();
        }
        if (window.location.hash === '#recover') {
            this.recoverPassword();
        }
        this.mobilifyTables();
        return $(window).resize((function(_this) {
            return function() {
                return _this.mobilifyTables();
            }
                ;
        })(this));
    }
    ;

    AccountView.prototype.recoverPassword = function() {
        this.$('.recover-password').toggle();
        return this.$('.customer-login').toggle();
    }
    ;

    AccountView.prototype.checkForReset = function() {
        if ($('.reset-check').data('successful-reset') === true) {
            return $('.successful-reset').show();
        }
    }
    ;

    AccountView.prototype.mobilifyTables = function() {
        return this.$('.orders').mobileTable();
    }
    ;

    AccountView.prototype.render = function() {}
    ;

    return AccountView;

})(Backbone.View);

window.PostView = (function(superClass) {
    extend(PostView, superClass);

    function PostView() {
        return PostView.__super__.constructor.apply(this, arguments);
    }

    PostView.prototype.events = {};

    PostView.prototype.initialize = function() {
        var highlight, j, len, ref;
        this.setFeaturedImage();
        this.artDirection();
        this.wrapAllNodes();
        ref = this.$('.highlight');
        for (j = 0,
                 len = ref.length; j < len; j++) {
            highlight = ref[j];
            this.fixOverlappingElements($(highlight));
        }
        return $(window).resize((function(_this) {
            return function() {
                var l, len1, ref1, results1;
                _this.setFeaturedImage(true);
                if (window.innerWidth > 1020) {
                    ref1 = _this.$('.highlight');
                    results1 = [];
                    for (l = 0,
                             len1 = ref1.length; l < len1; l++) {
                        highlight = ref1[l];
                        results1.push(_this.fixOverlappingElements($(highlight)));
                    }
                    return results1;
                }
            }
                ;
        })(this));
    }
    ;

    PostView.prototype.wrapAllNodes = function() {
        var childNodes, j, len, node, results1;
        childNodes = this.$('.rte')[0].childNodes;
        results1 = [];
        for (j = 0,
                 len = childNodes.length; j < len; j++) {
            node = childNodes[j];
            if (node.nodeType === 3 && node.textContent.replace(/^\s+|\s+$/g, "")) {
                results1.push($(node).replaceWith("<p>" + node.textContent + "</p>"));
            } else {
                results1.push(void 0);
            }
        }
        return results1;
    }
    ;

    PostView.prototype.fixOverlappingElements = function(highlight) {
        if (this.$('.post-meta').overlaps(highlight).length) {
            highlight.addClass('overlapping');
        }
        return highlight.addClass('processed');
    }
    ;

    PostView.prototype.setFeaturedImage = function(resize) {
        var contentWidth, featuredImage, parent, windowWidth;
        featuredImage = this.$('.featured-image');
        if (featuredImage.length) {
            parent = featuredImage.parent();
            windowWidth = $(window).width();
            contentWidth = this.$('.post-content').width();
            if (resize) {
                featuredImage.css({
                    width: windowWidth,
                    marginLeft: -(windowWidth - contentWidth) / 2
                });
                return;
            }
            featuredImage.detach().insertAfter('.page-title').css({
                width: windowWidth,
                marginLeft: -(windowWidth - contentWidth) / 2
            }).addClass('processed');
            if (parent.is(':empty')) {
                return parent.remove();
            }
        }
    }
    ;

    PostView.prototype.artDirection = function() {
        var images;
        images = this.$('.post-content').find('img');
        return images.imagesLoaded((function(_this) {
            return function() {
                var direction, image, imageAlt, imageParent, imageWidth, j, len, marginLeft, marginRight, results1;
                results1 = [];
                for (j = 0,
                         len = images.length; j < len; j++) {
                    image = images[j];
                    image = $(image);
                    if (image.parent().hasClass('post-content')) {
                        image.wrap('<div />');
                    }
                    imageParent = image.parent();
                    if (image.css('float') !== 'none') {
                        direction = image.css('float');
                        imageParent.addClass("highlight highlight-" + direction);
                        _this.fixOverlappingElements(imageParent);
                    }
                    imageWidth = image.width();
                    imageAlt = image.attr('alt');
                    if (imageAlt && imageAlt.length && imageParent.not('img')) {
                        marginLeft = image.css('margin-left');
                        marginRight = image.css('margin-right');
                        results1.push(imageParent.append("<div style='max-width: " + imageWidth + "px; margin-left: " + marginLeft + "; margin-right: " + marginRight + ";' class='photo-caption meta'>" + imageAlt + "</div>"));
                    } else {
                        results1.push(void 0);
                    }
                }
                return results1;
            }
                ;
        })(this));
    }
    ;

    return PostView;

})(Backbone.View);

window.BlogView = (function(superClass) {
    extend(BlogView, superClass);

    function BlogView() {
        return BlogView.__super__.constructor.apply(this, arguments);
    }

    BlogView.prototype.events = {};

    BlogView.prototype.initialize = function() {
        var j, len, post, ref, results1;
        ref = this.$('.blog-post');
        results1 = [];
        for (j = 0,
                 len = ref.length; j < len; j++) {
            post = ref[j];
            results1.push(new PostView({
                el: post
            }));
        }
        return results1;
    }
    ;

    BlogView.prototype.render = function() {}
    ;

    return BlogView;

})(Backbone.View);

window.CartView = (function(superClass) {
    extend(CartView, superClass);

    function CartView() {
        return CartView.__super__.constructor.apply(this, arguments);
    }

    CartView.prototype.events = {
        'change .cart-item-quantity-display': 'updateQuantity',
        'click .cart-item-decrease': 'updateQuantity',
        'click .cart-item-increase': 'updateQuantity',
        'change .cart-instructions textarea': 'saveSpecialInstructions',
        'click .dismiss': 'closeModal',
        'click .cart-modal-wrapper.active': 'closeModal',
        'click .get-rates': 'calculateShipping'
    };

    CartView.prototype.initialize = function() {
        this.sectionBinding();
        return this.render();
    }
    ;

    CartView.prototype.render = function() {
        var error;
        this.context = {};
        this.context.cart = JSON.parse($('[data-cart-strings]').text());
        this.context.shipping = null;
        this.$body = $(document.body);
        this.$modalWrapper = this.$('.cart-modal-wrapper');
        this.$modalTitle = this.$('[data-modal-title]');
        this.$modalMessage = this.$('[data-modal-message]');
        this.$modalAction = this.$('[data-modal-action]');
        this.$cartSubtotal = this.$('[data-cart-subtotal]');
        this.$shippingCalculator = $('[data-shipping-calculator]');
        if (this.$shippingCalculator.length !== 0) {
            try {
                this.context.shipping = JSON.parse($('[data-shipping-calculator-strings]').text());
            } catch (error1) {
                error = error1;
                console.log('No shipping localisations found, unable to continue.');
            }
            if (this.context.shipping == null) {
                return;
            }
            if (this.context.shipping.customerCountry) {
                this.calculateShipping();
            }
            if (this.$('.cart-items').length) {
                this.shippingCalculator();
            }
        }
        return Shopify.onError = (function(_this) {
            return function(XMLHttpRequest) {
                return _this.handleErrors(XMLHttpRequest);
            }
                ;
        })(this);
    }
    ;

    CartView.prototype.sectionBinding = function() {
        this.$el.on('shopify:section:load', (function(_this) {
            return function() {
                _this.delegateEvents();
                return _this.initialize();
            }
                ;
        })(this));
        return this.$el.on('shopify:section:unload', (function(_this) {
            return function() {
                return _this.undelegateEvents();
            }
                ;
        })(this));
    }
    ;

    CartView.prototype.saveSpecialInstructions = function() {
        var newNote;
        newNote = $('.cart-instructions textarea').val();
        return Shopify.updateCartNote(newNote, function(cart) {});
    }
    ;

    CartView.prototype.updatePrice = function($el, price) {
        var attribute, j, len, ref, ref1;
        ref = $el[0].attributes;
        for (j = 0,
                 len = ref.length; j < len; j++) {
            attribute = ref[j];
            if (((ref1 = attribute.name) != null ? ref1.indexOf('data-currency') : void 0) > -1) {
                $el.attr(attribute.name, '');
            }
        }
        return $el.html(price).attr("data-currency-" + Theme.currency, price).attr('data-currency', Theme.currency);
    }
    ;

    CartView.prototype.removeProduct = function($productRow, cart) {
        $productRow.hide();
        return this.updateCart(cart);
    }
    ;

    CartView.prototype.updateQuantity = function(event) {
        var $productPrice, $productQuantity, $productRow, $target, newQuantity, oldQuantity, variant;
        $target = $(event.currentTarget);
        $productRow = $target.parents('tr');
        $productPrice = $productRow.find('.cart-item-total .money');
        $productQuantity = $productRow.find('.cart-item-quantity-display');
        oldQuantity = parseInt($productQuantity.val(), 10);
        oldQuantity = isNaN(oldQuantity) ? 1 : oldQuantity;
        variant = $productRow.data('variant');
        if ($target.hasClass('cart-item-quantity-display')) {
            newQuantity = oldQuantity;
        } else if ($target.hasClass('cart-item-increase')) {
            newQuantity = oldQuantity + 1;
        } else if ($target.hasClass('cart-item-decrease')) {
            newQuantity = Math.max(oldQuantity - 1, 0);
        }
        $productQuantity.val(newQuantity);
        return Shopify.changeItem(variant, newQuantity, (function(_this) {
            return function(cart) {
                var action, cartItem, cartItemQuantity, cartItems, item, message, newProductPrice, title;
                cartItems = cart.items;
                cartItem = cartItems.filter(function(item) {
                    return item.id === variant;
                });
                if (!cartItems.length) {
                    return window.location = '/cart';
                }
                if (newQuantity === 0) {
                    return _this.removeProduct($productRow, cart);
                }
                item = cartItem[0];
                newProductPrice = LS.localization.formatMoney(item.line_price, Theme.moneyFormat);
                cartItemQuantity = item.quantity;
                _this.updatePrice($productPrice, newProductPrice);
                $productQuantity.val(cartItemQuantity);
                if (cartItemQuantity !== newQuantity) {
                    message = _this.context.cart.cartQuantityError.message.replace('** quantity **', cartItemQuantity).replace('** title **', item.title);
                    title = _this.context.cart.cartQuantityError.title;
                    action = _this.context.cart.cartQuantityError.button;
                    _this.openModal(title, message, action);
                }
                return _this.updateCart(cart);
            }
                ;
        })(this));
    }
    ;

    CartView.prototype.updateCart = function(cart) {
        var newTotal;
        newTotal = LS.localization.formatMoney(cart.total_price, Theme.moneyFormat);
        this.updatePrice(this.$cartSubtotal, newTotal);
        if (Theme.currencySwitcher) {
            return this.$body.trigger('switch-currency');
        }
    }
    ;

    CartView.prototype.shippingCalculator = function() {
        var selectableOptions;
        Shopify.Cart.ShippingCalculator.show({
            submitButton: this.context.shipping.submitButton,
            submitButtonDisabled: this.context.shipping.submitButtonProcessing,
            customerIsLoggedIn: this.context.shipping.customerCountry,
            moneyFormat: Theme.moneyFormat
        });
        selectableOptions = this.$shippingCalculator.find('select');
        setTimeout((function(_this) {
            return function() {
                var j, len, results1, select;
                results1 = [];
                for (j = 0,
                         len = selectableOptions.length; j < len; j++) {
                    select = selectableOptions[j];
                    results1.push(_this.updateShippingLabel(select));
                }
                return results1;
            }
                ;
        })(this), 500);
        return this.$('.cart-shipping-calculator select').change((function(_this) {
            return function(e) {
                var j, len, results1, select;
                results1 = [];
                for (j = 0,
                         len = selectableOptions.length; j < len; j++) {
                    select = selectableOptions[j];
                    results1.push(_this.updateShippingLabel(select));
                }
                return results1;
            }
                ;
        })(this));
    }
    ;

    CartView.prototype.calculateShipping = function() {
        var shippingAddress;
        $('.get-rates').val(this.context.shipping.submitButtonProcessing);
        shippingAddress = {};
        shippingAddress.zip = $('.address-zip').val() || '';
        shippingAddress.country = $('.address-country').val() || '';
        shippingAddress.province = $('.address-province').val() || '';
        return Shopify.getCartShippingRatesForDestination(shippingAddress, (function(_this) {
            return function() {
                var address, firstRate, j, len, price, rate, rateValues, ratesFeedback, responseText, shippingCalculatorResponse;
                if (shippingAddress.zip.length) {
                    address = shippingAddress.zip;
                }
                if (shippingAddress.province.length) {
                    address = address + ", " + shippingAddress.province;
                }
                if (shippingAddress.country.length) {
                    address = address + ", " + shippingAddress.country;
                }
                shippingCalculatorResponse = $('.cart-shipping-calculator-response');
                shippingCalculatorResponse.empty().append("<p class='shipping-calculator-response message'/><ul class='shipping-rates'/>");
                ratesFeedback = $('.shipping-calculator-response');
                if (rates.length > 1) {
                    firstRate = Shopify.Cart.ShippingCalculator.formatRate(rates[0].price);
                    responseText = _this.context.shipping.multiRates.replace('** address **', address).replace('** number_of_rates **', rates.length).replace('** rate **', "<span class='money'>" + firstRate + "</span>");
                    ratesFeedback.html(responseText);
                } else if (rates.length === 1) {
                    responseText = _this.context.shipping.oneRate.replace('** address **', address);
                    ratesFeedback.html(responseText);
                } else {
                    ratesFeedback.html(_this.context.shipping.noRates);
                }
                for (j = 0,
                         len = rates.length; j < len; j++) {
                    rate = rates[j];
                    price = Shopify.Cart.ShippingCalculator.formatRate(rate.price);
                    rateValues = _this.context.shipping.rateValues.replace('** rate_title **', rate.name).replace('** rate **', "<span class='money'>" + price + "</span>");
                    $('.shipping-rates').append("<li>" + rateValues + "</li>");
                }
                return $('.get-rates').val(_this.context.shipping.submitButton);
            }
                ;
        })(this));
    }
    ;

    CartView.prototype.updateShippingLabel = function(select) {
        var selectedOption;
        if (select) {
            select = $(select);
            selectedOption = select.find('option:selected').val();
            if (!selectedOption) {
                selectedOption = select.prev('.selected-text').data('default');
            }
            select.prev('.selected-text').text(selectedOption);
            return setTimeout((function(_this) {
                return function() {
                    if (select.attr('name') === 'address[country]') {
                        return _this.updateShippingLabel(_this.$('#address_province'));
                    }
                }
                    ;
            })(this), 500);
        }
    }
    ;

    CartView.prototype.openModal = function(title, message, action) {
        this.$modalTitle.text(title);
        this.$modalMessage.text(message);
        this.$modalAction.text(action);
        return this.$modalWrapper.addClass('active');
    }
    ;

    CartView.prototype.closeModal = function() {
        this.$modalWrapper.removeClass('active');
        this.$modalTitle.text('');
        this.$modalMessage.text('');
        return this.$modalAction.text('');
    }
    ;

    CartView.prototype.handleErrors = function(errors) {
        var errorMessage;
        errorMessage = $.parseJSON(errors.responseText);
        if (errorMessage.zip) {
            errorMessage = this.context.shipping.errorMessage.replace('** error_message **', errorMessage.zip);
            return $('.cart-shipping-calculator-response').html("<p>" + errorMessage + "</p>");
        } else {
            return console.log('Error', errorMessage.stringify());
        }
    }
    ;

    return CartView;

})(Backbone.View);

window.CollectionView = (function(superClass) {
    extend(CollectionView, superClass);

    function CollectionView() {
        return CollectionView.__super__.constructor.apply(this, arguments);
    }

    CollectionView.prototype.events = {
        'change .collection-tag-selector select': '_browseByTag'
    };

    CollectionView.prototype.initialize = function() {
        return this.sectionBinding();
    }
    ;

    CollectionView.prototype.sectionBinding = function() {
        this.$el.on('shopify:section:load', (function(_this) {
            return function() {
                return _this.delegateEvents();
            }
                ;
        })(this));
        return this.$el.on('shopify:section:unload', (function(_this) {
            return function() {
                return _this.undelegateEvents();
            }
                ;
        })(this));
    }
    ;

    CollectionView.prototype._browseByTag = function(e) {
        var fallback, newTag, select;
        select = $(e.target);
        fallback = select.parents(".select-wrapper").find("select").data('fallback-url');
        newTag = select.parents(".select-wrapper").find(':selected').attr('name');
        if (newTag === 'reset') {
            return window.location.href = fallback;
        } else {
            return window.location.href = fallback + "/" + newTag;
        }
    }
    ;

    return CollectionView;

})(Backbone.View);

window.NavigationView = (function(superClass) {
    extend(NavigationView, superClass);

    function NavigationView() {
        return NavigationView.__super__.constructor.apply(this, arguments);
    }

    NavigationView.prototype.events = {
        'click [data-dropdown-toggle]': 'toggleNavigation',
        'keydown [data-dropdown-toggle]': 'toggleNavigationByKey'
    };

    NavigationView.prototype.initialize = function() {
        this.$dropdowns = this.$el.find('.has-dropdown');
        this.dropdownToggle = '[data-dropdown-toggle]';
        this.$el.on('click.navigation', (function(_this) {
            return function(event) {
                if (!$(event.target).closest('.navigation').length) {
                    return _this.$('.navigation .open').removeClass('open');
                }
            }
                ;
        })(this));
        this.$dropdowns.hover((function(_this) {
            return function(event) {
                var $target;
                $target = $(event.currentTarget);
                return _this.closeSiblingMenus($target);
            }
                ;
        })(this));
        this.$el.on('focus.navigation', '.has-dropdown > .header-navigation-link', (function(_this) {
            return function(event) {
                var $target;
                $target = $(event.currentTarget).parent('li');
                return _this.closeTierMenus($target);
            }
                ;
        })(this));
    }
    ;

    NavigationView.prototype.closeSiblingMenus = function($targetLi) {
        var $siblingMenuParents;
        $siblingMenuParents = $targetLi.siblings('.open');
        return this.closeMenus($siblingMenuParents);
    }
    ;

    NavigationView.prototype.closeTierMenus = function($target) {
        var $openMenus;
        $openMenus = $target.parent().find('.open');
        if (!$openMenus.length) {
            return;
        }
        return this.closeMenus($openMenus);
    }
    ;

    NavigationView.prototype.closeMenus = function($menusParents) {
        return $menusParents.each((function(_this) {
            return function(i, menuParent) {
                var $menuParent, $toggle;
                $menuParent = $(menuParent);
                $toggle = $menuParent.closest(_this.dropdownToggle);
                $menuParent.removeClass('open');
                return _this.toggleMenuButton($toggle, false);
            }
                ;
        })(this));
    }
    ;

    NavigationView.prototype.toggleMenuButton = function($button, state) {
        return $button.attr('aria-expanded', state);
    }
    ;

    NavigationView.prototype.toggleNavigationByKey = function(event) {
        if (event.keyCode !== 13) {
            return;
        }
        return this.toggleNavigation(event);
    }
    ;

    NavigationView.prototype.toggleNavigation = function(event) {
        var $parent, $toggle, menuIsOpen;
        $toggle = $(event.currentTarget);
        $parent = $toggle.parent('.has-dropdown');
        menuIsOpen = $parent.hasClass('open');
        this.closeSiblingMenus($parent);
        this.toggleMenuButton($toggle, !menuIsOpen);
        event.preventDefault();
        return $parent.toggleClass('open');
    }
    ;

    NavigationView.prototype.prepareRemove = function() {
        return this.$el.off('click.navigation');
    }
    ;

    return NavigationView;

})(Backbone.View);

window.HeaderView = (function() {
    function HeaderView(instance) {
        this.window = $(window);
        this.$document = $(document.body);
        this.el = instance.el;
        this.$el = $(this.el);
        this._init();
    }

    HeaderView.prototype._init = function() {
        this.windowWidth = window.ThemeUtils.windowWidth();
        this.$drawerMenu = this.$document.find('[data-header-drawer]');
        this.$drawerToggle = this.$el.find('[data-drawer-toggle]');
        this.$mainContent = $('[data-main-content]');
        this.$headerContainer = this.$el.find('[data-main-header]');
        this.$headerContent = this.$el.find('[data-header-content]');
        this.$headerLogo = this.$el.find('[data-header-logo]');
        this.$headerGoal = this.$el.find('.module-header-goal-wrapper');
        this.$searchWrapper = this.$el.find('[data-header-search]');
        this.headerContentWidth = 0;
        this.slideShow = '[data-section-type=slideshow]';
        this.$slideShow = $(this.slideShow);
        this.isHeaderNavigation = this.$headerContainer.attr('data-main-header') === 'header';
        this.hasLogo = this.$headerLogo.length;
        this.isHeaderSticky = this.$headerContainer.attr('data-sticky-header') != null;
        this.navigation = new NavigationView({
            el: this.$document
        });
        this.announcementBarEl = null;
        this.$announcementBarEl = null;
        this.announcementBarRect = {};
        this._checkAnnouncementBar({
            el: document.querySelector('.pxs-announcement-bar')
        });
        if (this.$headerGoal.length) {
            this.goal = new GoalView({
                el: this.$headerGoal
            });
        }
        if (this.isHeaderNavigation) {
            this._calculateHeaderWidths();
        }
        this.sectionChanges(this.$slideShow);
        this._headerOffsets();
        return this._bindEvents();
    }
    ;

    HeaderView.prototype._bindEvents = function() {
        this.$document.on('shopify:section:select', (function(_this) {
            return function() {
                return _this.sectionChanges(null);
            }
                ;
        })(this)).on('shopify:section:deselect', (function(_this) {
            return function() {
                return _this.sectionChanges(null);
            }
                ;
        })(this)).on('click.search', '[data-search-toggle]', (function(_this) {
            return function() {
                return _this._openSearch();
            }
                ;
        })(this)).on('blur.search', '.header-search-input', (function(_this) {
            return function() {
                return _this._closeSearch();
            }
                ;
        })(this)).on('click.drawer', '[data-drawer-toggle]', (function(_this) {
            return function(event) {
                return _this._toggleDrawerNav(event);
            }
                ;
        })(this)).on('calculateHeaderWidths', (function(_this) {
            return function() {
                return _this._calculateHeaderWidths();
            }
                ;
        })(this)).on('toggleStickyHeader', (function(_this) {
            return function(event, $slideshow) {
                return _this.stickyHeader($slideshow);
            }
                ;
        })(this)).on('toggleSlideShowHeader', (function(_this) {
            return function(event, $slideshow) {
                return _this.slideShowHeader($slideshow);
            }
                ;
        })(this)).on('checkAnnouncementBar', (function(_this) {
            return function(event, data) {
                return _this._checkAnnouncementBar(data);
            }
                ;
        })(this)).on('checkHeaderOffsets', (function(_this) {
            return function() {
                return _this._headerOffsets();
            }
                ;
        })(this));
        this.window.on('resize.header', (function(_this) {
            return function() {
                return _this._resizeEvents();
            }
                ;
        })(this));
        return this.window.on('scroll.header', (function(_this) {
            return function() {
                return _this._headerOffsets();
            }
                ;
        })(this));
    }
    ;

    HeaderView.prototype.unBindEvents = function() {
        var ref;
        this.$document.off('.header-search-toggle').off('click.search', '[data-search-toggle]').off('blur.search', '.header-search-input').off('click.drawer', '[data-drawer-toggle]').off('calculateHeaderWidths').off('toggleStickyHeader').off('toggleSlideShowHeader').off('checkAnnouncementBar').off('checkHeaderOffsets');
        this.navigation.prepareRemove();
        this.navigation.undelegateEvents();
        delete this.navigation;
        if ((ref = this.goal) != null) {
            ref.remove();
        }
        this.window.off('resize.header');
        return this.window.off('scroll.header');
    }
    ;

    HeaderView.prototype._resizeEvents = function() {
        var currentWindowWidth;
        this._fitHeader();
        this._headerOffsets();
        currentWindowWidth = window.ThemeUtils.windowWidth();
        if ((this.$document.hasClass('showing-drawer')) && (currentWindowWidth !== this.windowWidth)) {
            this.windowWidth = window.ThemeUtils.windowWidth();
            return this._toggleDrawerNav();
        }
    }
    ;

    /*
      These events need to fire when any section in the TE is reloaded
   */

    HeaderView.prototype.sectionChanges = function($slideshow) {
        this.stickyHeader($slideshow);
        return this.slideShowHeader($slideshow);
    }
    ;

    HeaderView.prototype.stickyHeader = function($slideShow) {
        if ($slideShow == null) {
            $slideShow = $(this.slideShow);
        }
        this.$document.toggleClass('has-sticky-header', this.isHeaderSticky);
        return this._headerOffsets($slideShow);
    }
    ;

    HeaderView.prototype._headerOffsets = function($slideShow) {
        var bodyOffset, bottomEdge, goalHeight, headerOffset, isFullWindowSlideshow, pageYOffset, pastThreshold, scrollThreshold;
        if ($slideShow == null) {
            $slideShow = $(this.slideShow);
        }
        isFullWindowSlideshow = $slideShow.attr('data-full-window-slideshow') != null;
        pageYOffset = window.pageYOffset;
        scrollThreshold = 0;
        headerOffset = '';
        bodyOffset = '';
        if (this.announcementBarEl) {
            scrollThreshold = this.announcementBarRect.height;
        }
        pastThreshold = pageYOffset >= scrollThreshold;
        if (this.isHeaderSticky || isFullWindowSlideshow) {
            if (isFullWindowSlideshow && this.announcementBarEl) {
                headerOffset = this.announcementBarRect.height;
                bodyOffset = this.announcementBarRect.height;
            }
            if (this.isHeaderSticky) {
                headerOffset = pastThreshold ? 0 : scrollThreshold;
                if (!isFullWindowSlideshow) {
                    bodyOffset = scrollThreshold + this.$headerContent.outerHeight(true);
                    if (window.ThemeUtils.windowWidth() < 720) {
                        bodyOffset = 0;
                    }
                    if (window.ThemeUtils.windowWidth() < 720 && this.announcementBarEl) {
                        bodyOffset = this.announcementBarRect.height;
                    }
                }
                if (this.announcementBarEl && !pastThreshold) {
                    bottomEdge = scrollThreshold - pageYOffset;
                    headerOffset = Math.max(bottomEdge, 0);
                }
                if (this.$headerGoal.length && this.$headerGoal.hasClass('active')) {
                    if (window.ThemeUtils.windowWidth() < 720) {
                        this.$headerGoal.css('top', '');
                    } else {
                        goalHeight = this.$headerGoal.height();
                        this.$headerGoal.css('top', headerOffset);
                        bodyOffset += goalHeight;
                        headerOffset += goalHeight;
                    }
                }
            }
        }
        if (window.ThemeUtils.windowWidth() < 720) {
            headerOffset = '';
        }
        this.$document.css({
            paddingTop: bodyOffset
        });
        this.$headerContainer.toggleClass('scrolled', pastThreshold && this.isHeaderSticky).css({
            top: headerOffset
        });
        if ($slideShow.length) {
            $slideShow.trigger('setSlideshowClasses');
        }
        if (isFullWindowSlideshow && this.isHeaderSticky) {
            this.$headerContainer.toggleClass('higher-than-slideshow', !pastThreshold);
            this.$headerContainer.toggleClass('lower-than-slideshow', pastThreshold);
        }
    }
    ;

    HeaderView.prototype.slideShowHeader = function($slideShow) {
        if ($slideShow == null) {
            $slideShow = $(this.slideShow);
        }
        if ($slideShow.length && ($slideShow.attr('data-full-window-slideshow') != null)) {
            this.$headerContainer.addClass('higher-than-slideshow');
            return this.$document.addClass('has-slideshow-full-window');
        } else {
            this.$headerContainer.removeClass('higher-than-slideshow');
            return this.$document.removeClass('has-slideshow-full-window');
        }
    }
    ;

    HeaderView.prototype._calculateHeaderWidths = function() {
        return this.$headerContainer.imagesLoaded((function(_this) {
            return function() {
                var brandingWidth, gutterWidth, logoWidths, toolsWidth;
                brandingWidth = _this.$el.find('.branding').outerWidth(true);
                toolsWidth = _this.$el.find('.header-tools').outerWidth(true);

                /*
            Nav links have 15px left/right for 30px.
            First item only has 15px, this makes the first item equidistant from the logo
         */
                gutterWidth = 15;
                if (_this.$headerLogo.length) {
                    logoWidths = [];
                    _this.$headerLogo.each(function(index, logo) {
                        return logoWidths.push($(logo).width());
                    });
                    brandingWidth = Math.max.apply(Math, logoWidths);
                }
                _this.headerContentWidth = Math.ceil(brandingWidth) + Math.ceil(toolsWidth) + gutterWidth;
                return _this._fitHeader();
            }
                ;
        })(this));
    }
    ;

    HeaderView.prototype._fitHeader = function() {
        var headerWidth;
        headerWidth = this.$headerContent.width();
        return this.$headerContent.toggleClass('collapsed-navigation', this.headerContentWidth >= headerWidth);
    }
    ;

    HeaderView.prototype._toggleDrawerNav = function(event) {
        var isDrawerOpen, top;
        if (event == null) {
            event = null;
        }
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        isDrawerOpen = this.$document.hasClass('showing-drawer');
        this.$document.toggleClass('showing-drawer', !isDrawerOpen);
        if (isDrawerOpen) {
            top = this.$headerContainer.data('old-top');
            if (top) {
                this.$headerContainer.css({
                    top: top
                });
            } else {
                this._headerOffsets();
            }
        } else {
            this.$headerContainer.data('old-top', this.$headerContainer.css('top'));
            this.$headerContainer.css('top', '');
        }
        return this.$headerContainer.one('transitionend', (function(_this) {
            return function() {
                _this.$document.toggleClass('drawer-visible', !isDrawerOpen);
                return _this.$drawerToggle.attr('aria-expanded', !isDrawerOpen);
            }
                ;
        })(this));
    }
    ;

    HeaderView.prototype._openSearch = function() {
        if (window.innerWidth <= 720) {
            window.location.href = '/search';
            return;
        }
        this.$el.find('.header-search-wrapper').addClass('active').find('input').focus();
        return this.$el.find('.header-search-wrapper').on('keyup.search', (function(_this) {
            return function(e) {
                if (e.keyCode === 27) {
                    return _this._closeSearch();
                }
            }
                ;
        })(this));
    }
    ;

    HeaderView.prototype._closeSearch = function() {
        return this.$el.find('.header-search-wrapper').removeClass('active').off('keyup.search');
    }
    ;

    HeaderView.prototype._checkAnnouncementBar = function(data) {
        var el, ref;
        el = data.el;
        this.announcementBarEl = el;
        this.$announcementBarEl = $(this.announcementBarEl);
        this.announcementBarRect = (ref = this.announcementBarEl) != null ? ref.getBoundingClientRect() : void 0;
        return this._headerOffsets();
    }
    ;

    return HeaderView;

})();

/*!
 * pxs-map v2.0.0
 * (c) 2018 undefined
 */

(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) : typeof define === 'function' && define.amd ? define(['jquery'], factory) : (global.PxsMap = factory(global.$));
}(this, (function($) {
    'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

    var justDebounce = debounce;

    function debounce(fn, delay, at_start, guarantee) {
        var timeout;
        var args;
        var self;

        return function debounced() {
            self = this;
            args = Array.prototype.slice.call(arguments);

            if (timeout && (at_start || guarantee)) {
                return;
            } else if (!at_start) {
                clear();

                timeout = setTimeout(run, delay);
                return timeout;
            }

            timeout = setTimeout(clear, delay);
            fn.apply(self, args);

            function run() {
                clear();
                fn.apply(self, args);
            }

            function clear() {
                clearTimeout(timeout);
                timeout = null;
            }
        }
            ;
    }

    var classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    };

    var createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value"in descriptor)
                    descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function(Constructor, protoProps, staticProps) {
            if (protoProps)
                defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
                defineProperties(Constructor, staticProps);
            return Constructor;
        }
            ;
    }();

    var PxsMap = function() {
        function PxsMap(section) {
            var _this = this;

            classCallCheck(this, PxsMap);

            this.$el = $('[data-map]', section.el);
            this.settings = section.data;
            this.map = null;
            this.center = null;

            this.$container = $('[data-map-container]', this.$el);

            // Scale so range is 12 ~ 17, rather than 1 to 6
            this.zoom = 11 + parseInt(this.settings.zoom, 10);
            if (isNaN(this.zoom))
                this.zoom = 13;

            this.colors = null;

            if (this.settings.colors) {
                this.colors = this.settings.colors;
            }

            this.resize = this.resize.bind(this);

            this.address = this.settings.address;
            this.apiKey = this.settings.api_key;

            if (this.apiKey) {
                if (window.googleMaps === undefined) {
                    window.googleMaps = true;

                    $.getScript('https://maps.googleapis.com/maps/api/js?key=' + this.apiKey).done(function() {
                        _this._createMap();
                    }).fail(function(status) {
                        console.error(status);
                    });
                } else {
                    this._createMap();
                }
            }
        }

        createClass(PxsMap, [{
            key: '_createMap',
            value: function _createMap() {
                var _this2 = this;

                return this.geolocate().done(function(results) {
                    _this2.map = new google.maps.Map(_this2.$container.get(0),{
                        center: results[0].geometry.location,
                        clickableIcons: false,
                        disableDefaultUI: true,
                        disableDoubleClickZoom: true,
                        gestureHandling: 'none',
                        keyboardShortcuts: false,
                        maxZoom: _this2.zoom,
                        minZoom: _this2.zoom,
                        scrollWheel: false,
                        styles: _this2._getMapStyles(),
                        zoom: _this2.zoom,
                        zoomControl: false
                    });
                    _this2.center = _this2.map.getCenter();
                    _this2.map.panBy(0, 0);

                    new google.maps.Marker({
                        clickable: false,
                        map: _this2.map,
                        position: _this2.center
                    });

                    google.maps.event.addDomListener(window, 'resize', justDebounce(_this2.resize, 250, true, true));
                }).fail(function(status) {
                    var usageLimits = 'https://developers.google.com/maps/faq#usagelimits';
                    var errorMessage = void 0;

                    switch (status) {
                        case 'ZERO_RESULTS':
                            errorMessage = '<p>Unable to find the address:</p> ' + _this2.address;
                            break;
                        case 'OVER_QUERY_LIMIT':
                            errorMessage = '\n              <p>Unable to load Google Maps, you have reached your usage limit.</p>\n              <p>\n                Please visit\n                <a href="' + usageLimits + '" target="_blank">' + usageLimits + '</a>\n                for more details.\n              </p>\n            ';
                            break;
                        default:
                            errorMessage = 'Unable to load Google Maps.';
                            break;
                    }

                    _this2.displayErrorInThemeEditor(errorMessage, status);
                });
            }
        }, {
            key: 'geolocate',
            value: function geolocate() {
                var deferred = $.Deferred();
                var geocoder = new google.maps.Geocoder();

                geocoder.geocode({
                    address: this.address
                }, function(results, status) {
                    if (status !== google.maps.GeocoderStatus.OK) {
                        deferred.reject(status);
                    }

                    deferred.resolve(results);
                });

                return deferred;
            }
        }, {
            key: 'resize',
            value: function resize() {
                if (this.map) {
                    google.maps.event.trigger(this.map, 'resize');
                    this.map.setCenter(this.center);
                    this.map.panBy(0, 100);
                }
            }
        }, {
            key: 'onSectionUnload',
            value: function onSectionUnload() {
                if (this.map) {
                    google.maps.event.clearListeners(this.map, 'resize');
                }
            }
        }, {
            key: '_getMapStyles',
            value: function _getMapStyles() {
                if (!this.colors) {
                    return;
                }

                return [{
                    elementType: 'geometry',
                    stylers: [{
                        color: this.colors.e
                    }]
                }, {
                    elementType: 'labels.icon',
                    stylers: [{
                        visibility: 'off'
                    }]
                }, {
                    elementType: 'labels.text.fill',
                    stylers: [{
                        color: this.colors.a
                    }]
                }, {
                    elementType: 'labels.text.stroke',
                    stylers: [{
                        color: this.colors.e
                    }]
                }, {
                    featureType: 'administrative',
                    elementType: 'geometry',
                    stylers: [{
                        visibility: 'off'
                    }]
                }, {
                    featureType: 'administrative.country',
                    stylers: [{
                        visibility: 'off'
                    }]
                }, {
                    featureType: 'administrative.land_parcel',
                    stylers: [{
                        visibility: 'off'
                    }]
                }, {
                    featureType: 'administrative.neighborhood',
                    stylers: [{
                        visibility: 'off'
                    }]
                }, {
                    featureType: 'administrative.locality',
                    stylers: [{
                        visibility: 'off'
                    }]
                }, {
                    featureType: 'poi',
                    stylers: [{
                        visibility: 'off'
                    }]
                }, {
                    featureType: 'road',
                    elementType: 'geometry.fill',
                    stylers: [{
                        color: this.colors.d
                    }]
                }, {
                    featureType: 'road',
                    elementType: 'labels.icon',
                    stylers: [{
                        visibility: 'off'
                    }]
                }, {
                    featureType: 'road.arterial',
                    elementType: 'geometry',
                    stylers: [{
                        color: this.colors.c
                    }]
                }, {
                    featureType: 'road.highway',
                    elementType: 'geometry',
                    stylers: [{
                        color: this.colors.b
                    }]
                }, {
                    featureType: 'road.highway.controlled_access',
                    stylers: [{
                        visibility: 'off'
                    }]
                }, {
                    featureType: 'road.local',
                    elementType: 'labels.text.fill',
                    stylers: [{
                        color: this.colors.b
                    }]
                }, {
                    featureType: 'road.local',
                    elementType: 'labels.text.stroke',
                    stylers: [{
                        color: this.colors.e
                    }]
                }, {
                    featureType: 'transit',
                    stylers: [{
                        visibility: 'off'
                    }]
                }, {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{
                        color: this.colors.f
                    }]
                }];
            }
        }, {
            key: 'displayErrorInThemeEditor',
            value: function displayErrorInThemeEditor(errorMessage) {
                var isThemeEditor = window.Shopify && window.Shopify.designMode;

                if (!isThemeEditor) {
                    return;
                }

                this.$container.html('<div class="map-error-message">' + errorMessage + '</div>');
            }
        }]);
        return PxsMap;
    }();

    return PxsMap;

})));

/*!
 * pxs-video v2.0.0
 * (c) 2018 Pixel Union
 */

(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global.PxsVideo = factory());
}(this, (function() {
    'use strict';

    function createCommonjsModule(fn, module) {
        return module = {
            exports: {}
        },
            fn(module, module.exports),
            module.exports;
    }

    var script = createCommonjsModule(function(module) {
        /*!
  * $script.js JS loader & dependency manager
  * https://github.com/ded/script.js
  * (c) Dustin Diaz 2014 | License MIT
  */

        (function(name, definition) {
            if ('object' != 'undefined' && module.exports)
                module.exports = definition();
            else if (typeof undefined == 'function' && undefined.amd)
                undefined(definition);
            else
                this[name] = definition();
        })('$script', function() {
            var doc = document, head = doc.getElementsByTagName('head')[0], s = 'string', f = false, push = 'push', readyState = 'readyState', onreadystatechange = 'onreadystatechange', list = {}, ids = {}, delay = {}, scripts = {}, scriptpath, urlArgs;

            function every(ar, fn) {
                for (var i = 0, j = ar.length; i < j; ++i) {
                    if (!fn(ar[i]))
                        return f;
                }
                return 1;
            }
            function each(ar, fn) {
                every(ar, function(el) {
                    return !fn(el);
                });
            }

            function $script(paths, idOrDone, optDone) {
                paths = paths[push] ? paths : [paths];
                var idOrDoneIsDone = idOrDone && idOrDone.call
                    , done = idOrDoneIsDone ? idOrDone : optDone
                    , id = idOrDoneIsDone ? paths.join('') : idOrDone
                    , queue = paths.length;
                function loopFn(item) {
                    return item.call ? item() : list[item];
                }
                function callback() {
                    if (!--queue) {
                        list[id] = 1;
                        done && done();
                        for (var dset in delay) {
                            every(dset.split('|'), loopFn) && !each(delay[dset], loopFn) && (delay[dset] = []);
                        }
                    }
                }
                setTimeout(function() {
                    each(paths, function loading(path, force) {
                        if (path === null)
                            return callback();

                        if (!force && !/^https?:\/\//.test(path) && scriptpath) {
                            path = path.indexOf('.js') === -1 ? scriptpath + path + '.js' : scriptpath + path;
                        }

                        if (scripts[path]) {
                            return scripts[path] == 2 ? callback() : setTimeout(function() {
                                loading(path, true);
                            }, 0);
                        }

                        scripts[path] = 1;
                        create(path, callback);
                    });
                }, 0);
                return $script;
            }

            function create(path, fn) {
                var el = doc.createElement('script'), loaded;
                el.onload = el.onerror = el[onreadystatechange] = function() {
                    if (el[readyState] && !/^c|loade/.test(el[readyState]) || loaded)
                        return;
                    el.onload = el[onreadystatechange] = null;
                    loaded = 1;
                    scripts[path] = 2;
                    fn();
                }
                ;
                el.async = 1;
                el.src = urlArgs ? path + (path.indexOf('?') === -1 ? '?' : '&') + urlArgs : path;
                head.insertBefore(el, head.lastChild);
            }

            $script.get = create;

            $script.order = function(scripts, id, done) {
                (function callback(s) {
                    s = scripts.shift();
                    !scripts.length ? $script(s, id, done) : $script(s, callback);
                })();
            }
            ;

            $script.path = function(p) {
                scriptpath = p;
            }
            ;
            $script.urlArgs = function(str) {
                urlArgs = str;
            }
            ;
            $script.ready = function(deps, ready, req) {
                deps = deps[push] ? deps : [deps];
                var missing = [];
                !each(deps, function(dep) {
                    list[dep] || missing[push](dep);
                }) && every(deps, function(dep) {
                    return list[dep];
                }) ? ready() : !function(key) {
                    delay[key] = delay[key] || [];
                    delay[key][push](ready);
                    req && req(missing);
                }(deps.join('|'));
                return $script;
            }
            ;

            $script.done = function(idOrDone) {
                $script([null], idOrDone);
            }
            ;

            return $script;
        });
    });

    var classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    };

    var createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value"in descriptor)
                    descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function(Constructor, protoProps, staticProps) {
            if (protoProps)
                defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
                defineProperties(Constructor, staticProps);
            return Constructor;
        }
            ;
    }();

    var api = 'https://www.youtube.com/iframe_api';
    var apiLoadedCallbacks = [];
    var apiLoaded = false;

    window.onYouTubeIframeAPIReady = function() {
        apiLoadedCallbacks.forEach(function(apiLoadedCallback) {
            return apiLoadedCallback();
        });
        apiLoadedCallbacks = [];
        apiLoaded = true;
    }
    ;

    var Youtube = function() {
        function Youtube(el, id) {
            classCallCheck(this, Youtube);

            this.el = el;
            this.id = id;

            this.iframeEl = document.createElement('div');
            this.el.appendChild(this.iframeEl);

            this.onApiLoaded = this._onApiLoaded.bind(this);

            this.isReady = false;
            this.onReady = this._onReady.bind(this);
            this.onReadyCallback = null;

            this.onStateChange = this._onStateChange.bind(this);
            this.onPlayCallback = null;

            if (apiLoaded) {
                this._onApiLoaded();
            } else {
                apiLoadedCallbacks.push(this.onApiLoaded);
                script(api);
            }
        }

        createClass(Youtube, [{
            key: 'play',
            value: function play() {
                var _this = this;

                return new Promise(function(resolve) {
                        _this.onPlayCallback = resolve;

                        if (_this.isReady) {
                            _this.player.playVideo();
                        } else {
                            _this.onReadyCallback = function() {
                                return _this.player.playVideo();
                            }
                            ;
                        }
                    }
                );
            }
        }, {
            key: 'unload',
            value: function unload() {
                this.player.destroy();
            }
        }, {
            key: '_onApiLoaded',
            value: function _onApiLoaded() {
                this.player = new YT.Player(this.iframeEl,{
                    videoId: this.id,
                    playerVars: {
                        modestbranding: true,
                        showinfo: false,
                        controls: false
                    },
                    events: {
                        onReady: this.onReady,
                        onStateChange: this.onStateChange
                    }
                });
            }
        }, {
            key: '_onReady',
            value: function _onReady() {
                this.isReady = true;

                if (this.onReadyCallback) {
                    this.onReadyCallback();
                }
            }
        }, {
            key: '_onStateChange',
            value: function _onStateChange(event) {
                var state = event.data;

                if (this.onPlayCallback && state === YT.PlayerState.PLAYING) {
                    this.onPlayCallback();
                    this.onPlayCallback = null;
                }
            }
        }]);
        return Youtube;
    }();

    var api$1 = 'https://player.vimeo.com/api/player.js';
    var apiLoaded$1 = false;

    var VimeoPlayer = function() {
        function VimeoPlayer(el, id) {
            classCallCheck(this, VimeoPlayer);

            this.el = el;
            this.id = id;

            this.onApiLoaded = this._onApiLoaded.bind(this);

            this.onProgress = this._onProgress.bind(this);
            this.onProgressCallback = null;

            if (apiLoaded$1) {
                this._onApiLoaded();
            } else {
                script(api$1, this.onApiLoaded);
            }
        }

        createClass(VimeoPlayer, [{
            key: 'play',
            value: function play() {
                var _this = this;

                return new Promise(function(resolve) {
                        _this.onProgressCallback = resolve;
                        _this.player.on('progress', _this.onProgress);
                        _this.player.play();
                    }
                );
            }
        }, {
            key: 'unload',
            value: function unload() {
                this.player.unload().catch();
            }
        }, {
            key: '_onApiLoaded',
            value: function _onApiLoaded() {
                this.player = new window.Vimeo.Player(this.el,{
                    id: this.id
                });

                this.player.ready().catch();

                apiLoaded$1 = true;
            }
        }, {
            key: '_onProgress',
            value: function _onProgress() {
                this.player.off('progress', this.onProgress);

                if (this.onProgressCallback) {
                    this.onProgressCallback();
                    this.onProgressCallback = null;
                }
            }
        }]);
        return VimeoPlayer;
    }();

    var optionsDefaults = {
        autoplay: false
    };

    var Video = function() {
        function Video(el) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            classCallCheck(this, Video);

            this.el = el;
            this.playButton = el.querySelector('[data-video-play-button]');
            this.onPlayButtonClick = this._play.bind(this);
            this.video = null;

            var autoplay = options.autoplay || optionsDefaults.autoplay;

            var videoEl = el.querySelector('[data-video]');
            var type = videoEl.getAttribute('data-video');
            var id = videoEl.getAttribute('data-video-id');

            switch (type) {
                case 'youtube':
                    this.video = new Youtube(videoEl,id);
                    break;
                case 'vimeo':
                    this.video = new VimeoPlayer(videoEl,id);
                    break;
                default:
                    this.video = null;
                    break;
            }

            if (this.playButton) {
                this.playButton.addEventListener('click', this.onPlayButtonClick);
            }

            if (autoplay) {
                this._play();
            }
        }

        createClass(Video, [{
            key: '_play',
            value: function _play() {
                var _this = this;

                this.el.classList.add('video-loading');

                this.video.play().then(function() {
                    _this.el.classList.add('video-transitioning');

                    setTimeout(function() {
                        _this.el.classList.remove('video-loading');
                        _this.el.classList.remove('video-transitioning');
                        _this.el.classList.add('video-playing');
                    }, 200);
                });
            }
        }, {
            key: 'unload',
            value: function unload() {
                if (this.playButton) {
                    this.playButton.removeEventListener('click', this.onPlayClick);
                }

                if (this.video) {
                    this.video.unload();
                }
            }
        }]);
        return Video;
    }();

    var PxsVideo = function() {
        function PxsVideo(section) {
            classCallCheck(this, PxsVideo);

            this.video = null;

            var el = section.el.querySelector('[data-video-container]');
            var data = section.data;

            if (!el) {
                return;
            }

            this.video = new Video(el,{
                autoplay: data.autoplay
            });
        }

        createClass(PxsVideo, [{
            key: 'onSectionUnload',
            value: function onSectionUnload() {
                if (this.video) {
                    this.video.unload();
                }
            }
        }]);
        return PxsVideo;
    }();

    return PxsVideo;

})));

;
window.SlideshowView = (function(superClass) {
    extend(SlideshowView, superClass);

    function SlideshowView() {
        return SlideshowView.__super__.constructor.apply(this, arguments);
    }

    SlideshowView.prototype.events = {
        'click .home-slideshow-previous': 'previousSlide',
        'click .home-slideshow-next': 'nextSlide',
        'click .home-slideshow-pagination > span': 'specificSlide',
        'mouseenter': 'pauseLoop',
        'mouseleave': 'startLoop',
        'setSlideshowClasses': 'setSlideshowClasses'
    };

    SlideshowView.prototype.initialize = function() {
        this.$document = $(document.body);
        this.$window = $(window);
        this.$headerNavigation = $('[data-main-header]');
        this.$slideShow = this.$el.find('[data-slideshow-content]');
        this.windowWidth = null;
        this.slideText = '';
        this.autoplayInterval = null;
        this.slidesLocked = false;
        this.autoplaySpeed = parseInt(this.$el.attr('data-slideshow-autoplay'), 10);
        this.isFullWindow = this.$el.attr('data-full-window-slideshow') != null;
        this.$slideNavigation = this.$('.home-slideshow-navigation');
        this.$slidePagination = this.$('.home-slideshow-pagination');
        this.slidePaginationHeight = null;
        this.slideShowMinHeight = parseInt(this.$el.css('min-height'), 10);
        this.ltIE9 = $('html').hasClass('lt-ie9');
        this.$slideNavigation.on('mouseout.slideshowNavigation', (function(_this) {
            return function(event) {
                return $(event.currentTarget).blur();
            }
                ;
        })(this));
        this.transitionend = (function(transition) {
            var transEndEventNames;
            transEndEventNames = {
                "-webkit-transition": "webkitTransitionEnd",
                "-moz-transition": "transitionend",
                "-o-transition": "oTransitionEnd",
                transition: "transitionend"
            };
            return transEndEventNames[transition];
        })(Modernizr.prefixed("transition"));
        this.setupSlides();
        return this.setupHeader();
    }
    ;

    SlideshowView.prototype.setSlideshowClasses = function(event, $slide) {
        var slideText;
        if (event == null) {
            event = null;
        }
        if ($slide) {
            slideText = $slide.data('slide-text');
        } else {
            slideText = this.$slideShow.find('.active').data('slide-text');
        }
        if (slideText !== this.slideText) {
            this.$document.removeClass('slide-color-light slide-color-dark').addClass("slide-color-" + slideText);
            return this.slideText = slideText;
        }
    }
    ;

    SlideshowView.prototype.getMaxSlideHeight = function(windowHeight, windowWidth) {
        var maxHeight;
        maxHeight = windowHeight - this.$headerNavigation.height();
        if (this.isFullWindow && windowWidth > 720) {
            maxHeight = windowHeight;
        }
        return maxHeight;
    }
    ;

    SlideshowView.prototype.setupHeader = function() {
        return this.$document.trigger("toggleStickyHeader", [this.$el]).trigger("toggleSlideShowHeader", [this.$el]);
    }
    ;

    SlideshowView.prototype.setSlideHeight = function(settings) {
        var $slide, $slideImage, $slideText, announcementBarEl, imageHeight, maxHeight, minHeight, slideHeight, slidePadding, textHeight, textWidth, windowHeight, windowWidth;
        $slide = settings.$slide,
            windowWidth = settings.windowWidth,
            windowHeight = settings.windowHeight;
        $slideText = $slide.find('.slide-text');
        $slideImage = $slide.find('.slide-image');
        slidePadding = this.$slidePagination.length ? this.slidePaginationHeight * 2 : 60;
        textHeight = $slideText.length ? $slideText.height() + slidePadding : 0;
        imageHeight = $slideImage.height();
        maxHeight = this.getMaxSlideHeight(windowHeight, windowWidth);
        if (this.isFullWindow) {
            announcementBarEl = document.querySelector('.pxs-announcement-bar');
            slideHeight = windowWidth > 720 ? windowHeight : maxHeight;
            if (announcementBarEl) {
                slideHeight -= announcementBarEl.getBoundingClientRect().height;
            }
            $slide.height(slideHeight);
            if (this.ltIE9) {
                $slide.css('background-image', '').find('img').show().height(slideHeight);
            }
        } else {
            minHeight = Math.max.apply(null, [this.slideShowMinHeight, textHeight, imageHeight]);
            slideHeight = Math.min.apply(null, [minHeight, maxHeight]);
        }
        $slide.attr('data-height', slideHeight);
        if (this.ltIE9) {
            $slideText.css({
                marginTop: -(textHeight / 2)
            });
            if ($slide.hasClass('text-aligned-center')) {
                textWidth = $slideText.outerWidth();
                $slideText.css({
                    marginLeft: -(textWidth / 2)
                });
            }
        }
        return slideHeight;
    }
    ;

    SlideshowView.prototype.setupSlides = function() {
        var paginationWidth, windowHeight, windowWidth;
        this.$slides = this.$el.find('[data-slide]');
        this.slideCount = this.$slides.length;
        this.setSlideshowClasses(null, this.$slides.eq(0));
        if (this.ltIE9) {
            paginationWidth = this.$slidePagination.width();
            this.$slidePagination.css({
                marginLeft: -(paginationWidth / 2)
            });
        }
        windowWidth = window.ThemeUtils.windowWidth();
        windowHeight = window.ThemeUtils.windowHeight();
        this.slidePaginationHeight = this.$slidePagination.height();
        this.windowWidth = windowWidth;
        this.$el.imagesLoaded((function(_this) {
            return function() {
                var $slide, i, j, len, ref, slide, slideHeight, slideID;
                ref = _this.$slides;
                for (i = j = 0,
                         len = ref.length; j < len; i = ++j) {
                    slide = ref[i];
                    $slide = $(slide);
                    slideID = $slide.attr('id');
                    slideHeight = _this.setSlideHeight({
                        $slide: $slide,
                        windowWidth: windowWidth,
                        windowHeight: windowHeight
                    });
                    if (i === 0) {
                        $slide.addClass('active');
                        _this.$el.height(slideHeight);
                        _this.setNavHeight(slideHeight);
                        _this.$el.attr('id', "viewing-" + slideID);
                    }
                    if (i + 1 === _this.slideCount) {
                        _this.$el.addClass('slides-ready');
                    }
                }
                return _this.$window.on('resize.slideshow', function(event) {
                    if (window.ThemeUtils.windowWidth() === _this.windowWidth) {
                        return;
                    }
                    return _this.resetSlideHeights();
                });
            }
                ;
        })(this));
        return this.startLoop();
    }
    ;

    SlideshowView.prototype.resetSlideHeights = function() {
        var $slide, j, len, ref, results1, slide, slideHeight, windowHeight, windowWidth;
        windowWidth = window.ThemeUtils.windowWidth();
        windowHeight = window.ThemeUtils.windowHeight();
        this.windowWidth = windowWidth;

        /*
        Iterate over each slide, so that on slide change, slides have new heights
     */
        ref = this.$slides;
        results1 = [];
        for (j = 0,
                 len = ref.length; j < len; j++) {
            slide = ref[j];
            $slide = $(slide);
            slideHeight = this.setSlideHeight({
                $slide: $slide,
                windowWidth: windowWidth,
                windowHeight: windowHeight
            });
            if ($slide.hasClass('active')) {
                this.$el.height(slideHeight);
                results1.push(this.setNavHeight(slideHeight));
            } else {
                results1.push(void 0);
            }
        }
        return results1;
    }
    ;

    SlideshowView.prototype.resetPaginationPosition = function(height) {
        if (window.ThemeUtils.windowWidth() <= 720) {
            return this.$slidePagination.css({
                bottom: 'auto',
                top: height - 50
            });
        } else {
            return this.$slidePagination.css({
                bottom: 0,
                top: 'auto'
            });
        }
    }
    ;

    SlideshowView.prototype.previousSlide = function(e) {
        if (this.sliding) {
            return;
        }
        this.showNewSlide('prev');
        return e.preventDefault();
    }
    ;

    SlideshowView.prototype.nextSlide = function(e) {
        if (this.sliding) {
            return;
        }
        this.showNewSlide('next');
        if (e) {
            return e.preventDefault();
        }
    }
    ;

    SlideshowView.prototype.specificSlide = function(e) {
        var nextSlideID;
        if (!$(e.currentTarget).hasClass('active')) {
            nextSlideID = $(e.currentTarget).data('slide-id');
            return this.showNewSlide('next', nextSlideID);
        }
    }
    ;

    SlideshowView.prototype.updateSlidePagination = function(index) {
        this.$slidePagination.find('.active').removeClass('active');
        return this.$slidePagination.find('> span').eq(index).addClass('active');
    }
    ;

    SlideshowView.prototype.lockSlide = function(event) {
        this.slidesLocked = true;
        this.pauseLoop();
        return this.showNewSlide('next', event.target.id);
    }
    ;

    SlideshowView.prototype.unlockSlide = function() {
        this.slidesLocked = false;
        return this.startLoop();
    }
    ;

    SlideshowView.prototype.showNewSlide = function(type, specificSlide) {
        var $activeSlide, $nextSlide, called, direction, fallback, imageHeight, slideID;
        this.sliding = true;
        called = false;
        if (this.$slides.length === 1) {
            this.sliding = false;
            return;
        }
        direction = type === 'next' ? 'left' : 'right';
        fallback = type === 'next' ? 'first' : 'last';
        $activeSlide = this.$slideShow.find('.active');
        $nextSlide = specificSlide ? this.$("#" + specificSlide) : $activeSlide[type]();
        $nextSlide = $nextSlide.length ? $nextSlide : this.$slides[fallback]();
        if ($activeSlide.attr('id') === $nextSlide.attr('id')) {
            return;
        }
        $nextSlide.addClass(type);
        $nextSlide[0].offsetWidth;
        $activeSlide.addClass(direction);
        $nextSlide.addClass(direction);
        if ($('html').hasClass('lt-ie10')) {
            $nextSlide.removeClass([type, direction].join(' ')).addClass('active');
            $activeSlide.removeClass(['active', direction].join(' '));
            this.sliding = false;
        } else {
            $nextSlide.one(this.transitionend, (function(_this) {
                return function() {
                    called = true;
                    $nextSlide.removeClass([type, direction].join(' ')).addClass('active');
                    $activeSlide.removeClass(['active', direction].join(' '));
                    return _this.sliding = false;
                }
                    ;
            })(this));
            setTimeout((function(_this) {
                return function() {
                    if (!called) {
                        return $nextSlide.trigger(_this.transitionend);
                    }
                }
                    ;
            })(this), 700);
        }
        imageHeight = parseInt($nextSlide.attr('data-height'), 10);
        this.updateSlidePagination($nextSlide.index());
        this.setNavHeight(imageHeight);
        this.setSlideshowClasses(null, $nextSlide);
        slideID = $nextSlide.attr('id');
        this.$el.attr('id', "viewing-" + slideID);
        return this.$el.height(imageHeight);
    }
    ;

    SlideshowView.prototype.startLoop = function() {
        if (this.autoplaySpeed === 0 || this.slidesLocked) {
            return;
        }
        return this.autoplayInterval = setInterval((function(_this) {
            return function() {
                return _this.nextSlide();
            }
                ;
        })(this), this.autoplaySpeed);
    }
    ;

    SlideshowView.prototype.pauseLoop = function() {
        if (this.autoplayInterval == null) {
            return;
        }
        return clearInterval(this.autoplayInterval);
    }
    ;

    SlideshowView.prototype.setNavHeight = function(imageHeight) {
        return this.$slideNavigation.css({
            lineHeight: imageHeight + "px"
        });
    }
    ;

    SlideshowView.prototype.prepareRemove = function() {
        this.$window.off('resize.slideshow');
        return this.$slideNavigation.off('mouseout.slideshowNavigation');
    }
    ;

    return SlideshowView;

})(Backbone.View);

window.ImagesWithTextView = (function(superClass) {
    extend(ImagesWithTextView, superClass);

    function ImagesWithTextView() {
        return ImagesWithTextView.__super__.constructor.apply(this, arguments);
    }

    ImagesWithTextView.prototype.events = {
        'click .product-details-slideshow-nav-list-item': 'specificSlide'
    };

    ImagesWithTextView.prototype.initialize = function() {
        this.slidePagination = this.$('.product-details-slideshow-nav-list');
        this.ltIE9 = $('html').hasClass('lt-ie9');
        this.slidePagination.children().first().addClass('active');
        return this.$el.find('.product-details-slideshow-list-item').first().addClass('active');
    }
    ;

    ImagesWithTextView.prototype.specificSlide = function(event) {
        var index;
        event.preventDefault();
        if (!$(event.currentTarget).hasClass('active')) {
            index = $(event.currentTarget).attr('data-position');
            return this.updateSlidePagination(index);
        }
    }
    ;

    ImagesWithTextView.prototype.updateSlidePagination = function(index) {
        this.$el.find('.product-details-slideshow-nav-list-item').removeClass('active');
        this.$el.find(".product-details-slideshow-nav-list-item[data-position='" + index + "']").addClass('active');
        return this.showNewSlide(index);
    }
    ;

    ImagesWithTextView.prototype.showNewSlide = function(index) {
        return this.$el.find(".product-details-slideshow-list-item[data-position='" + index + "']").addClass('active').focus().siblings().removeClass('active');
    }
    ;

    return ImagesWithTextView;

})(Backbone.View);

window.ThemeUtils = {
    debounce: function(func, threshold, execAsap) {
        var timeout;
        timeout = false;
        return function() {
            var args, delayed, obj;
            obj = this;
            args = arguments;
            delayed = function() {
                if (!execAsap) {
                    func.apply(obj, args);
                }
                return timeout = null;
            }
            ;
            if (timeout) {
                clearTimeout(timeout);
            } else if (execAsap) {
                func.apply(obj, args);
            }
            return timeout = setTimeout(delayed, threshold || 100);
        }
            ;
    },
    windowWidth: function() {
        return window.innerWidth || document.documentElement.clientWidth;
    },
    windowHeight: function() {
        return window.innerHeight || document.documentElement.clientHeight;
    },
    scrollTarget: function($el) {
        var $stickyHeader, offset;
        if (!($el instanceof jQuery)) {
            $el = $($el);
        }
        offset = $el.offset().top;
        $stickyHeader = $('[data-sticky-header]');
        if ($stickyHeader.length && window.innerWidth >= 720) {
            offset = offset - $stickyHeader.outerHeight();
        }
        return $('html, body').animate({
            scrollTop: offset
        }, 500, 'linear');
    },
    externalLinks: function($el) {
        var anchors;
        anchors = $el.find('a[href^="http"]').filter((function(_this) {
            return function(i, el) {
                return el.href.indexOf(location.hostname) === -1;
            }
                ;
        })(this));
        return anchors.attr('target', '_blank');
    },
    extend: function() {
        var dest, j, k, len, obj, objs, v;
        dest = arguments[0],
            objs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        for (j = 0,
                 len = objs.length; j < len; j++) {
            obj = objs[j];
            for (k in obj) {
                v = obj[k];
                dest[k] = v;
            }
        }
        return dest;
    },
    unique: function(array) {
        var j, key, output, ref, results1, value;
        output = {};
        for (key = j = 0,
                 ref = array.length; 0 <= ref ? j < ref : j > ref; key = 0 <= ref ? ++j : --j) {
            output[array[key]] = array[key];
        }
        results1 = [];
        for (key in output) {
            value = output[key];
            results1.push(value);
        }
        return results1;
    }
};

window.TestimonialView = (function(superClass) {
    extend(TestimonialView, superClass);

    function TestimonialView() {
        return TestimonialView.__super__.constructor.apply(this, arguments);
    }

    TestimonialView.prototype.events = {
        "click .home-testimonials-pagination-list-item": "paginate",
        "click .home-testimonials-navigation-item a": "navigate"
    };

    TestimonialView.prototype.initialize = function() {
        var count, slide;
        this.slideList = this.$(".home-testimonials-slides-list");
        this.pageList = this.$(".home-testimonials-pagination-list");
        this.$window = $(window);
        this.$navigationItem = this.$('.home-testimonials-navigation-item a');
        slide = this.slideList.children();
        count = this.slideList.children().length;
        if (count > 1) {
            slide.last().clone().removeAttr("data-position").addClass("cloned").prependTo(this.slideList);
            slide.first().clone().removeAttr("data-position").addClass("cloned").appendTo(this.slideList);
        } else {
            this.slideList.parents(".home-testimonials").addClass("static");
        }
        this.slideHeight(1);
        this.slideWidth();
        if (count > 1) {
            this.slideRotate(1);
        }
        this.slideList.parents(".home-testimonials").addClass("ready");
        this.$window.on('resize.testimonials', (function(_this) {
            return function() {
                var index;
                index = _this.slideList.children(".active").attr("data-position");
                _this.slideHeight(index);
                _this.slideWidth();
                if (count > 1) {
                    return _this.slideAnim(index);
                }
            }
                ;
        })(this));
        return this.$navigationItem.on('mouseout.testimonials', (function(_this) {
            return function(event) {
                return $(event.currentTarget).blur();
            }
                ;
        })(this));
    }
    ;

    TestimonialView.prototype.slideHeight = function(index) {
        return this.slideList.height(this.slideList.children("div[data-position='" + index + "']").height());
    }
    ;

    TestimonialView.prototype.slideWidth = function() {
        this.slideList.width(this.slideList.parent().width() * this.slideList.children().length);
        return this.slideList.children().width(this.slideList.parent().width());
    }
    ;

    TestimonialView.prototype.slideAnim = function(index) {
        return this.slideList.css({
            "margin-left": -index * this.slideList.parent().width()
        });
    }
    ;

    TestimonialView.prototype.slideRotate = function(index) {
        this.slideList.children().removeClass("active");
        this.pageList.children().removeClass("active");
        this.slideList.children("div[data-position='" + index + "']").addClass("active");
        this.pageList.children("a[data-position='" + index + "']").addClass("active");
        return this.slideAnim(index);
    }
    ;

    TestimonialView.prototype.paginate = function(event, index) {
        if (event == null) {
            event = false;
        }
        if (index == null) {
            index = false;
        }
        if (event) {
            event.preventDefault();
        }
        if ($(event.currentTarget).hasClass('active') && !index) {
            return;
        }
        if (event && !index) {
            index = $(event.currentTarget).attr('data-position');
        }
        this.slideRotate(index);
        return this.slideHeight(index);
    }
    ;

    TestimonialView.prototype.navigate = function(event) {
        var $navigation, index;
        if (event) {
            event.preventDefault();
        }
        $navigation = $(event.currentTarget).parent('div');
        if ($navigation.hasClass("next-slide")) {
            if (!this.slideList.children(".active").next().hasClass("cloned")) {
                index = this.slideList.children(".active").next().attr("data-position");
            } else {
                index = 1;
            }
        }
        if ($navigation.hasClass("previous-slide")) {
            if (!this.slideList.children(".active").prev().hasClass("cloned")) {
                index = this.slideList.children(".active").prev().attr("data-position");
            } else {
                index = this.slideList.children().length - 2;
            }
        }
        this.slideRotate(index);
        return this.slideHeight(index);
    }
    ;

    TestimonialView.prototype.prepareRemove = function() {
        this.$navigationItem.off('mouseout.testimonials');
        return this.$window.off('resize.testimonials');
    }
    ;

    return TestimonialView;

})(Backbone.View);

window.VideoView = (function(superClass) {
    extend(VideoView, superClass);

    function VideoView() {
        return VideoView.__super__.constructor.apply(this, arguments);
    }

    VideoView.prototype.events = {
        'click [data-overlay-play]': 'activateVideo'
    };

    VideoView.prototype.initialize = function() {
        return this.$el.fitVids();
    }
    ;

    VideoView.prototype.activateVideo = function(event) {
        var $overlay, $target, $video, $videoWrapper;
        $target = $(event.currentTarget);
        $videoWrapper = $target.parents('[data-video-wrapper]');
        $overlay = $videoWrapper.find('[data-video-overlay]');
        $video = $videoWrapper.find('iframe');
        if (!$video.length) {
            return;
        }
        $videoWrapper.addClass("active");
        setTimeout((function(_this) {
            return function() {
                return $overlay.addClass('inactive');
            }
                ;
        })(this), 200);
        return setTimeout((function(_this) {
            return function() {
                var $videoSrc, $videoSrcNew, delimiter;
                $videoSrc = $video.attr('src');
                delimiter = ($videoSrc != null ? $videoSrc.indexOf('?') : void 0) === -1 ? '?' : '&';
                $videoSrcNew = ($videoSrc + delimiter) + "autoplay=1";
                $video.attr('src', $videoSrcNew);
                return $overlay.remove();
            }
                ;
        })(this), 400);
    }
    ;

    return VideoView;

})(Backbone.View);

window.HomeView = (function(superClass) {
    extend(HomeView, superClass);

    function HomeView() {
        return HomeView.__super__.constructor.apply(this, arguments);
    }

    HomeView.prototype.initialize = function() {
        this.sections = new ThemeEditor();
        this.sections.register('slideshow', this.slideShow(this.sections));
        this.sections.register('alternating-content', this.alternatingContent(this.sections));
        this.sections.register('images-with-text', this.imagesWithText(this.sections));
        this.sections.register('testimonials', this.testimonials(this.sections));
        this.sections.register('pxs-map', this.map(this.sections));
        return this.sections.register('pxs-video', this.video(this.sections));
    }
    ;

    HomeView.prototype.slideShow = function(sections) {
        return {
            instances: {},
            el: '[data-section-type="slideshow"]',
            init: function(instance) {
                return this.instances[instance.sectionId] = new SlideshowView({
                    el: $(this.el)
                });
            },
            onSectionLoad: function(event) {
                var instance;
                instance = sections.getInstance(event);
                if (!this.instances[instance.sectionId]) {
                    return this.init(instance);
                }
            },
            onSectionUnload: function(event) {
                var instance;
                instance = sections.getInstance(event);
                this.instances[instance.sectionId].setupHeader();
                this.instances[instance.sectionId].prepareRemove();
                this.instances[instance.sectionId].setSlideshowClasses(null);
                this.instances[instance.sectionId].remove();
                return delete this.instances[instance.sectionId];
            },
            onSectionSelect: function(event) {
                var instance;
                instance = sections.getInstance(event);
                this.instances[instance.sectionId].setupHeader();
                return this.instances[instance.sectionId].setSlideshowClasses(null);
            },
            onBlockSelect: function(event) {
                var instanceHandler;
                instanceHandler = this.instances[sections.getInstance(event).sectionId];
                return instanceHandler.lockSlide(event);
            },
            onBlockDeselect: function(event) {
                var instanceHandler;
                instanceHandler = this.instances[sections.getInstance(event).sectionId];
                return instanceHandler.unlockSlide();
            }
        };
    }
    ;

    HomeView.prototype.alternatingContent = function(sections) {
        return {
            instances: {},
            init: function(instance) {
                var $video;
                $video = instance.$container.find('[data-video-wrapper]');
                if ($video.length) {
                    return this.instances[instance.sectionId] = new VideoView({
                        el: $video
                    });
                } else {
                    return this.instances[instance.sectionId] = null;
                }
            },
            onSectionLoad: function(event) {
                var instance;
                instance = sections.getInstance(event);
                if (!this.instances[instance.sectionId]) {
                    return this.init(instance);
                }
            },
            onSectionUnload: function(event) {
                var instance, ref;
                instance = sections.getInstance(event);
                if ((ref = this.instances[instance.sectionId]) != null) {
                    ref.remove();
                }
                return delete this.instances[instance.sectionId];
            }
        };
    }
    ;

    HomeView.prototype.imagesWithText = function(sections) {
        return {
            instances: {},
            init: function(instance) {
                return this.instances[instance.sectionId] = new ImagesWithTextView({
                    el: instance.$container
                });
            },
            onSectionLoad: function(event) {
                var instance;
                instance = sections.getInstance(event);
                if (!this.instances[instance.sectionId]) {
                    return this.init(instance);
                }
            },
            onSectionUnload: function(event) {
                var instance;
                instance = sections.getInstance(event);
                this.instances[instance.sectionId].remove();
                return delete this.instances[instance.sectionId];
            },
            onBlockSelect: function(event) {
                var instance;
                instance = sections.getInstance(event);
                return this.instances[instance.sectionId].updateSlidePagination($(event.target).attr('data-position'));
            }
        };
    }
    ;

    HomeView.prototype.testimonials = function(sections) {
        return {
            instances: {},
            init: function(instance) {
                return this.instances[instance.sectionId] = new TestimonialView({
                    el: instance.$container
                });
            },
            onSectionLoad: function(event) {
                var instance;
                instance = sections.getInstance(event);
                if (!this.instances[instance.sectionId]) {
                    return this.init(instance);
                }
            },
            onSectionUnload: function(event) {
                var instance;
                instance = sections.getInstance(event);
                this.instances[instance.sectionId].prepareRemove();
                this.instances[instance.sectionId].remove();
                return delete this.instances[instance.sectionId];
            },
            onBlockSelect: function(event) {
                var index, instance;
                instance = sections.getInstance(event);
                index = $(event.target).attr('data-index');
                return this.instances[instance.sectionId].paginate(false, index);
            }
        };
    }
    ;

    HomeView.prototype.map = function(sections) {
        return {
            instances: {},
            init: function(instance) {
                return this.instances[instance.sectionId] = new PxsMap(instance);
            },
            onSectionLoad: function(event) {
                var instance;
                instance = sections.getInstance(event);
                if (!this.instances[instance.sectionId]) {
                    return this.init(instance);
                }
            },
            onSectionUnload: function(event) {
                var sectionId;
                sectionId = sections.getInstance(event).sectionId;
                this.instances[sectionId].onSectionUnload();
                return delete this.instances[sectionId];
            }
        };
    }
    ;

    HomeView.prototype.video = function(sections) {
        return {
            instances: {},
            init: function(instance) {
                return this.instances[instance.sectionId] = new PxsVideo(instance);
            },
            onSectionLoad: function(event) {
                var instance;
                instance = sections.getInstance(event);
                if (!this.instances[instance.sectionId]) {
                    return this.init(instance);
                }
            },
            onSectionUnload: function(event) {
                var sectionId;
                sectionId = sections.getInstance(event).sectionId;
                this.instances[sectionId].onSectionUnload();
                return delete this.instances[sectionId];
            }
        };
    }
    ;

    return HomeView;

})(Backbone.View);

window.GiftCardView = (function(superClass) {
    extend(GiftCardView, superClass);

    function GiftCardView() {
        return GiftCardView.__super__.constructor.apply(this, arguments);
    }

    GiftCardView.prototype.initialize = function() {
        return this.addQrCode();
    }
    ;

    GiftCardView.prototype.addQrCode = function() {
        var qrWrapper;
        qrWrapper = $('[data-qr-code]');
        return new QRCode(qrWrapper[0],{
            text: qrWrapper.data('qr-code'),
            width: 120,
            height: 120
        });
    }
    ;

    return GiftCardView;

})(Backbone.View);

window.ListCollectionsView = (function(superClass) {
    extend(ListCollectionsView, superClass);

    function ListCollectionsView() {
        return ListCollectionsView.__super__.constructor.apply(this, arguments);
    }

    ListCollectionsView.prototype.events = {};

    ListCollectionsView.prototype.initialize = function() {
        var collection, collectionDetails, collections, j, len, results1;
        if ($('html').hasClass('lt-ie9')) {
            collections = this.$('.collection-list-item');
            results1 = [];
            for (j = 0,
                     len = collections.length; j < len; j++) {
                collection = collections[j];
                collectionDetails = $(collection).find('.collection-details');
                results1.push(this.verticallyAlignText(collectionDetails));
            }
            return results1;
        }
    }
    ;

    ListCollectionsView.prototype.verticallyAlignText = function(collectionDetails) {
        var textHeight;
        textHeight = collectionDetails.height();
        return collectionDetails.css({
            marginTop: -(textHeight / 2)
        });
    }
    ;

    ListCollectionsView.prototype.render = function() {}
    ;

    return ListCollectionsView;

})(Backbone.View);

window.AccordionView = (function(superClass) {
    extend(AccordionView, superClass);

    function AccordionView() {
        return AccordionView.__super__.constructor.apply(this, arguments);
    }

    AccordionView.prototype.events = {
        'click [data-accordion-trigger]': '_toggle'
    };

    AccordionView.prototype.initialize = function() {
        this.accordionContent = '[data-accordion-content]';
        this.accordionTrigger = '[data-accordion-trigger]';
        return this.activeAccordion = 'accordion-active';
    }
    ;

    AccordionView.prototype._toggle = function(event) {
        var $content, $target, trigger;
        event.preventDefault();
        $target = $(event.currentTarget);
        trigger = $target.attr('data-accordion-trigger');
        $content = $("[data-accordion-content=" + trigger + "]");
        if ($target.hasClass(this.activeAccordion)) {
            return this._close($target, $content);
        } else {
            this._closeAll();
            return this._open($target, $content);
        }
    }
    ;

    AccordionView.prototype._closeAll = function() {
        return $(this.accordionTrigger).each((function(_this) {
            return function(index, accordion) {
                var $target;
                $target = $(accordion);
                if ($target.hasClass(_this.activeAccordion)) {
                    return $target.trigger('click');
                }
            }
                ;
        })(this));
    }
    ;

    AccordionView.prototype._open = function($target, $content) {
        return $content.slideDown({
            duration: 400,
            start: (function(_this) {
                return function() {
                    return $target.addClass(_this.activeAccordion);
                }
                    ;
            })(this)
        });
    }
    ;

    AccordionView.prototype._close = function($target, $content) {
        return $content.slideUp({
            duration: 400,
            start: (function(_this) {
                return function() {
                    return $target.removeClass(_this.activeAccordion);
                }
                    ;
            })(this)
        });
    }
    ;

    AccordionView.prototype.onBlockSelect = function(event) {
        var $container, $target;
        $container = $(event.target);
        $target = $container.find(this.accordionTrigger);
        if (!$target.hasClass(this.activeAccordion)) {
            return $target.trigger('click');
        }
    }
    ;

    return AccordionView;

})(Backbone.View);

window.GoogleMapView = (function(superClass) {
    extend(GoogleMapView, superClass);

    function GoogleMapView() {
        this._getGoogleInfoBoxScript = bind(this._getGoogleInfoBoxScript, this);
        return GoogleMapView.__super__.constructor.apply(this, arguments);
    }

    GoogleMapView.prototype.initialize = function() {
        this.mapCanvas = '[data-google-map]';
        this.$mapCanvas = this.$el.find(this.mapCanvas);
        this.context = JSON.parse(this.$el.find('[data-google-map-json]').text());
        this.infoBoxURL = this.$mapCanvas.data("infobox-url");
        return this._getGoogleScript();
    }
    ;

    GoogleMapView.prototype._getGoogleScript = function() {
        var googleMapsURL;
        if (this.context.apiKey.length) {
            googleMapsURL = "//maps.googleapis.com/maps/api/js?key=" + this.context.apiKey;
        } else {
            googleMapsURL = '//maps.googleapis.com/maps/api/js';
        }
        if (typeof window.google === 'undefined') {
            return $.getScript(googleMapsURL).done((function(_this) {
                return function(script, textStatus) {
                    return _this._getGoogleInfoBoxScript(textStatus);
                }
                    ;
            })(this)).fail((function(_this) {
                return function(jqxhr, settings, exception) {
                    return _this._scriptFailed('GoogleMaps', {
                        jqxhr: jqxhr,
                        settings: settings,
                        exception: exception
                    });
                }
                    ;
            })(this));
        } else {
            return this._getGoogleInfoBoxScript('success');
        }
    }
    ;

    GoogleMapView.prototype._getGoogleInfoBoxScript = function(textStatus) {
        if (textStatus !== 'success') {
            return this._scriptFailed('GoogleMaps');
        }
        return $.getScript(this.infoBoxURL).done((function(_this) {
            return function(script, textStatus) {
                return _this._infoBoxLoaded(textStatus);
            }
                ;
        })(this)).fail((function(_this) {
            return function(jqxhr, settings, exception) {
                return _this._scriptFailed('Infobox', {
                    jqxhr: jqxhr,
                    settings: settings,
                    exception: exception
                });
            }
                ;
        })(this));
    }
    ;

    GoogleMapView.prototype._scriptFailed = function(scriptName, options) {
        if (options == null) {
            options = {};
        }
        console.warn(scriptName + " failed to load");
        if (options != null) {
            return console.warn(options);
        }
    }
    ;

    GoogleMapView.prototype._hasErrors = function(status) {
        var errorMessage;
        switch (status) {
            case 'ZERO_RESULTS':
                errorMessage = this.context.addressNoResults;
                break;
            case 'OVER_QUERY_LIMIT':
                errorMessage = this.context.addressQueryLimit;
                break;
            default:
                errorMessage = this.context.addressError;
        }
        return this.$mapCanvas.append("<div class=\"module-map-error\">" + errorMessage + "</div>");
    }
    ;

    GoogleMapView.prototype._infoBoxLoaded = function(textStatus) {
        if (textStatus !== 'success') {
            return this._scriptFailed('Infobox');
        }
        this.geocoder = new google.maps.Geocoder;
        return this.geocoder.geocode({
            "address": this.context.address
        }, (function(_this) {
            return function(results, status) {
                var infobox, map, mapOptions, marker, stylesArray;
                if (status !== google.maps.GeocoderStatus.OK) {
                    return _this._hasErrors(status);
                }
                _this.$el.addClass('has-map');
                stylesArray = [{
                    'featureType': 'administrative',
                    'elementType': 'labels.text.fill',
                    'stylers': [{
                        'color': '#444444'
                    }]
                }, {
                    'featureType': 'landscape',
                    'elementType': 'all',
                    'stylers': [{
                        'color': '#f2f2f2'
                    }]
                }, {
                    'featureType': 'poi',
                    'elementType': 'all',
                    'stylers': [{
                        'visibility': 'off'
                    }]
                }, {
                    'featureType': 'road',
                    'elementType': 'all',
                    'stylers': [{
                        'saturation': -100
                    }, {
                        'lightness': 45
                    }]
                }, {
                    'featureType': 'road.highway',
                    'elementType': 'all',
                    'stylers': [{
                        'visibility': 'simplified'
                    }]
                }, {
                    'featureType': 'road.arterial',
                    'elementType': 'labels.icon',
                    'stylers': [{
                        'visibility': 'off'
                    }]
                }, {
                    'featureType': 'transit',
                    'elementType': 'all',
                    'stylers': [{
                        'visibility': 'off'
                    }]
                }, {
                    'featureType': 'water',
                    'elementType': 'all',
                    'stylers': [{
                        'color': '#419bf9'
                    }, {
                        'visibility': 'on'
                    }]
                }];
                mapOptions = {
                    center: {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    },
                    zoom: 15,
                    styles: stylesArray,
                    scrollwheel: false
                };
                map = new google.maps.Map(document.querySelector(_this.mapCanvas),mapOptions);
                marker = new google.maps.Marker({
                    position: mapOptions.center
                });
                marker.setMap(map);
                infobox = new InfoBox({
                    content: "<div class='info-box-container'>" + _this.context.title + "</div>",
                    disableAutoPan: false,
                    pixelOffset: new google.maps.Size(0,-120),
                    zIndex: null,
                    closeBoxURL: "",
                    infoBoxClearance: new google.maps.Size(1,1)
                });
                infobox.open(map, marker);
                return google.maps.event.addDomListener(window, 'resize', function() {
                    return setTimeout((function(_this) {
                        return function() {
                            return map.setCenter(mapOptions.center);
                        }
                            ;
                    })(this), 100);
                });
            }
                ;
        })(this));
    }
    ;

    return GoogleMapView;

})(Backbone.View);

window.ThemeEditor = (function(superClass) {
    extend(ThemeEditor, superClass);

    function ThemeEditor() {
        return ThemeEditor.__super__.constructor.apply(this, arguments);
    }

    ThemeEditor.prototype.initialize = function() {
        this.instanceHandlers = {};
        this.instances = {};
        return $(document).on('shopify:section:load', (function(_this) {
            return function(event) {
                return _this._onSectionLoad(event);
            }
                ;
        })(this)).on('shopify:section:unload', (function(_this) {
            return function(event) {
                return _this._onSectionUnload(event);
            }
                ;
        })(this)).on('shopify:section:select', (function(_this) {
            return function(event) {
                return _this._onSectionSelect(event);
            }
                ;
        })(this)).on('shopify:section:deselect', (function(_this) {
            return function(event) {
                return _this._onSectionDeselect(event);
            }
                ;
        })(this)).on('shopify:block:select', (function(_this) {
            return function(event) {
                return _this._onBlockSelect(event);
            }
                ;
        })(this)).on('shopify:block:deselect', (function(_this) {
            return function(event) {
                return _this._onBlockDeselect(event);
            }
                ;
        })(this));
    }
    ;

    ThemeEditor.prototype._findInstance = function(event) {
        var $container, instance;
        instance = this.instances[event.originalEvent.detail.sectionId];
        if (instance != null) {
            return instance;
        } else {
            $container = $('[data-section-id]', event.target);
            if ($container.length) {
                return this._createInstance($container);
            }
        }
    }
    ;

    ThemeEditor.prototype._createInstance = function($container, instanceHandler) {
        var data, el, instance, sectionId, sectionType;
        sectionType = $container.attr('data-section-type');
        sectionId = $container.attr('data-section-id');
        el = $container.parent()[0];
        data = this._loadData(el);
        if (sectionType == null) {
            return;
        }
        instanceHandler = instanceHandler || this.instanceHandlers[sectionType];
        instance = {
            $container: $container,
            el: el,
            data: data,
            instanceHandler: instanceHandler,
            sectionId: sectionId
        };
        this.instances[sectionId] = instance;
        return instance;
    }
    ;

    /*
      Action: A section has been added or re-rendered.
      Expected: Re-execute any JavaScript needed for the section to work and
          display properly (as if the page had just been loaded).
   */

    ThemeEditor.prototype._onSectionLoad = function(event) {
        var $container, ref, ref1;
        $container = $('[data-section-id]', event.target);
        if (!$container.length) {
            return;
        }
        return (ref = this._createInstance($container)) != null ? (ref1 = ref.instanceHandler) != null ? typeof ref1.onSectionLoad === "function" ? ref1.onSectionLoad(event) : void 0 : void 0 : void 0;
    }
    ;

    /*
      Action: A section has been deleted or is being re-rendered.
      Expected: Clean up any event listeners, variables, etc., so that
          nothing breaks when the page is interacted with and no memory leaks occur.
   */

    ThemeEditor.prototype._onSectionUnload = function(event) {
        var instance, ref;
        instance = this._findInstance(event);
        if (instance != null) {
            if ((ref = instance.instanceHandler) != null) {
                if (typeof ref.onSectionUnload === "function") {
                    ref.onSectionUnload(event);
                }
            }
        }
        if (instance) {
            return delete this.instances[instance.sectionId];
        }
    }
    ;

    /*
      Action: User has selected the section in the sidebar.
      Expected: Make sure the section is in view and stays
          in view while selected (scrolling happens automatically).
      Example: Could be used to pause a slideshow
   */

    ThemeEditor.prototype._onSectionSelect = function(event) {
        var ref, ref1;
        return (ref = this._findInstance(event)) != null ? (ref1 = ref.instanceHandler) != null ? typeof ref1.onSectionSelect === "function" ? ref1.onSectionSelect(event) : void 0 : void 0 : void 0;
    }
    ;

    /*
      Action: User has deselected the section in the sidebar.
      Expected: (None)
      Example: Could be used to restart slideshows that are no longer being interacted with.
   */

    ThemeEditor.prototype._onSectionDeselect = function(event) {
        var ref, ref1;
        return (ref = this._findInstance(event)) != null ? (ref1 = ref.instanceHandler) != null ? typeof ref1.onSectionDeselect === "function" ? ref1.onSectionDeselect(event) : void 0 : void 0 : void 0;
    }
    ;

    /*
      Action: User has selected the block in the sidebar.
      Expected: Make sure the block is in view and stays
          in view while selected (scrolling happens automatically).
      Example: Can be used to to trigger a slideshow to bring a slide/block into view
   */

    ThemeEditor.prototype._onBlockSelect = function(event) {
        var ref, ref1;
        return (ref = this._findInstance(event)) != null ? (ref1 = ref.instanceHandler) != null ? typeof ref1.onBlockSelect === "function" ? ref1.onBlockSelect(event) : void 0 : void 0 : void 0;
    }
    ;

    /*
      Action: User has deselected the block in the sidebar.
      Expected: (None)
      Example: Resume a slideshow
   */

    ThemeEditor.prototype._onBlockDeselect = function(event) {
        var ref, ref1;
        return (ref = this._findInstance(event)) != null ? (ref1 = ref.instanceHandler) != null ? typeof ref1.onBlockDeselect === "function" ? ref1.onBlockDeselect(event) : void 0 : void 0 : void 0;
    }
    ;

    /*
      Auto initialisation of a section for the store front
   */

    ThemeEditor.prototype._sectionInit = function(instance) {
        var ref;
        return instance != null ? (ref = instance.instanceHandler) != null ? typeof ref.init === "function" ? ref.init(instance) : void 0 : void 0 : void 0;
    }
    ;

    ThemeEditor.prototype._loadData = function(el) {
        var data, dataEl, error;
        dataEl = el.querySelector('[data-section-data]');
        if (!dataEl) {
            return {};
        }
        data = dataEl.getAttribute('data-section-data') || dataEl.innerHTML;
        try {
            return JSON.parse(data);
        } catch (error1) {
            error = error1;
            console.warn("Sections: invalid section data found. " + error.message);
            return {};
        }
    }
    ;

    /*
      Registration of a section
          - Takes a string parameter as the first argument which
            matches to `[data-section-type]`

       * Example
          @sections = new Sections()
          @sections.register('some-section-type', @someSectionClass)
   */

    ThemeEditor.prototype.register = function(type, instanceHandler) {

        /*
        Storage of a instanceHandler based on the sectionType allows _onSectionLoad
           to connect a new section to it's registered instanceHandler
     */
        this.instanceHandlers[type] = instanceHandler;
        return $("[data-section-type='" + type + "']").each((function(_this) {
            return function(index, container) {
                var $container;
                $container = $(container);
                return _this._sectionInit(_this._createInstance($container, instanceHandler));
            }
                ;
        })(this));
    }
    ;

    /*
      Public method to retrieve information on an instance based on the
      bubbled `event`
   */

    ThemeEditor.prototype.getInstance = function(event) {
        return this._findInstance(event);
    }
    ;

    return ThemeEditor;

})(Backbone.View);

window.PageView = (function(superClass) {
    extend(PageView, superClass);

    function PageView() {
        return PageView.__super__.constructor.apply(this, arguments);
    }

    PageView.prototype.initialize = function() {
        this.sections = new ThemeEditor();
        this.sections.register('map', this.mapSection(this.sections));
        return this.sections.register('faq', this.accordionView(this.sections));
    }
    ;

    PageView.prototype.accordionView = function(sections) {
        return {
            instances: {},
            init: function(instance) {
                return this.instances[instance.sectionId] = new AccordionView({
                    el: instance.$container
                });
            },
            onSectionLoad: function(event) {
                var instance, sectionId;
                instance = sections.getInstance(event);
                sectionId = instance.sectionId;
                if (this.instances[sectionId] == null) {
                    return this.init(instance);
                }
            },
            onSectionUnload: function(event) {
                var sectionId;
                sectionId = sections.getInstance(event).sectionId;
                this.instances[sectionId].remove();
                return delete this.instances[sectionId];
            },
            onBlockSelect: function(event) {
                return this.instances[sections.getInstance(event).sectionId].onBlockSelect(event);
            }
        };
    }
    ;

    PageView.prototype.mapSection = function(sections) {
        return {
            instances: {},
            init: function(instance) {
                return this.instances[instance.sectionId] = new GoogleMapView({
                    el: instance.$container
                });
            },
            onSectionLoad: function(event) {
                var instance, sectionId;
                instance = sections.getInstance(event);
                sectionId = instance.sectionId;
                if (this.instances[sectionId] == null) {
                    return this.init(instance);
                }
            },
            onSectionUnload: function(event) {
                var sectionId;
                sectionId = sections.getInstance(event).sectionId;
                this.instances[sectionId].remove();
                return delete this.instances[sectionId];
            }
        };
    }
    ;

    return PageView;

})(Backbone.View);

window.PasswordView = (function(superClass) {
    extend(PasswordView, superClass);

    function PasswordView() {
        return PasswordView.__super__.constructor.apply(this, arguments);
    }

    PasswordView.prototype.events = {
        "click .password-entry": "togglePasswordForm",
        "submit .password-embedded-newsletter-form": "toggleNewsletterSuccess"
    };

    PasswordView.prototype.initialize = function() {
        this.toggle = this.$(".password-entry");
        this.subscribeWrapper = this.$(".password-subscribe-wrapper");
        this.passwordWrapper = this.$(".password-form-wrapper");
        this.newsletterInput = ".newsletter-input";
        this.emailRegEx = new RegExp(/^((?!\.)[a-z0-9._%+-]+(?!\.)\w)@[a-z0-9-\.]+\.[a-z.]{2,5}(?!\.)\w$/i);
        $(window).on("load resize", window.ThemeUtils.debounce(this.setContentHeight, 100));
        if (this.$("[data-password-form-inner]").hasClass("has-errors")) {
            return this.togglePasswordForm();
        }
    }
    ;

    PasswordView.prototype.toggleNewsletterSuccess = function(event) {
        if (this.emailRegEx.test(this.$(this.newsletterInput).val())) {
            this.$(".password-embedded-newsletter-form").addClass("hidden");
            return this.$(".form-success.hidden").removeClass("hidden");
        } else {
            return event.preventDefault();
        }
    }
    ;

    PasswordView.prototype.togglePasswordForm = function() {
        this.passwordWrapper.add(this.subscribeWrapper).toggleClass("visible");
        if (this.passwordWrapper.hasClass("visible")) {
            return this.toggle.text(this.toggle.data("cancel"));
        } else {
            return this.toggle.text(this.toggle.data("enter-password"));
        }
    }
    ;

    PasswordView.prototype.setContentHeight = function() {
        var contentHeight, footer, footerHeight, headerHeight, windowHeight;
        footer = this.$(".footer-wrapper");
        windowHeight = $(window).height();
        headerHeight = this.$(".main-header-wrapper").outerHeight(true);
        footerHeight = footer.outerHeight(true);
        contentHeight = this.$(".main-content").outerHeight(true);
        if (windowHeight > headerHeight + contentHeight + footerHeight) {
            return footer.css({
                "position": "fixed"
            });
        } else {
            return footer.css({
                "position": "relative"
            });
        }
    }
    ;

    return PasswordView;

})(Backbone.View);

window.RTEView = (function(superClass) {
    extend(RTEView, superClass);

    function RTEView() {
        return RTEView.__super__.constructor.apply(this, arguments);
    }

    RTEView.prototype.events = {
        'change .select-wrapper select': 'updateOption'
    };

    RTEView.prototype.initialize = function() {
        var j, len, select, selects;
        this.setupTabs();
        selects = this.$el.find('select');
        for (j = 0,
                 len = selects.length; j < len; j++) {
            select = selects[j];
            if (!$(select).parent('.select-wrapper').length) {
                $(select).wrap('<div class="select-wrapper" />').parent().prepend('<span class="selected-text"></span>');
            }
            this.updateOption(null, select);
        }
        this.$el.fitVids();
        this.mobilifyTables();
        return $(window).resize((function(_this) {
            return function() {
                return _this.mobilifyTables();
            }
                ;
        })(this));
    }
    ;

    RTEView.prototype.setupTabs = function() {
        var groupedContent;
        return groupedContent = new GroupedContent(this.$el.get(0),{
            layout: 'tabs',
            intelliparse: false
        });
    }
    ;

    RTEView.prototype.updateOption = function(e, selector) {
        var newOption, select;
        select = e ? $(e.target) : $(selector);
        newOption = select.find('option:selected').text();
        return select.siblings('.selected-text').text(newOption);
    }
    ;

    RTEView.prototype.mobilifyTables = function() {
        return this.$el.find('table').mobileTable();
    }
    ;

    return RTEView;

})(Backbone.View);

window.SelectView = (function(superClass) {
    extend(SelectView, superClass);

    function SelectView() {
        return SelectView.__super__.constructor.apply(this, arguments);
    }

    SelectView.prototype.events = {
        "change": "updateSelectText",
        "blur": "blurSelect",
        "focus": "focusSelect"
    };

    SelectView.prototype.initialize = function() {
        if (!(this.$el.parent(".select-wrapper").length || this.$el.hasClass("product-select"))) {
            this.$el.wrap("<div class='select-wrapper' />").parent().prepend("<span class='selected-text'></span>");
        }
        return this.updateSelectText();
    }
    ;

    SelectView.prototype.blurSelect = function() {
        return this.$el.parent(".select-wrapper").toggleClass("active", false);
    }
    ;

    SelectView.prototype.focusSelect = function() {
        return this.$el.parent(".select-wrapper").toggleClass("active", true);
    }
    ;

    SelectView.prototype.updateSelectText = function() {
        var newOption;
        newOption = this.$el.find("option:selected").text();
        return this.$el.siblings(".selected-text").text(newOption);
    }
    ;

    return SelectView;

})(Backbone.View);

/*!
 * pxs-announcement-bar v0.0.0
 * (c) 2018 Pixel Union
 */

(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global.PxsAnnouncementBar = factory());
}(this, (function() {
    'use strict';

    /**
     * Trigger a custom event.
     *
     * Note: this approach is deprecated, but still required to support older
     * browsers such as IE 10.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
     * @param {*} el The element to trigger the event on.
     * @param {*} name The event name.
     * @returns {Boolean} True if the event was canceled.
     */
    function trigger(el, name) {
        var event = document.createEvent('Event');
        event.initEvent(name, true, true);
        return !el.dispatchEvent(event);
    }

    var classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    };

    var createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value"in descriptor)
                    descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function(Constructor, protoProps, staticProps) {
            if (protoProps)
                defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
                defineProperties(Constructor, staticProps);
            return Constructor;
        }
            ;
    }();

    var PxsAnnouncementBar = function() {
        function PxsAnnouncementBar(section) {
            classCallCheck(this, PxsAnnouncementBar);

            this.el = section.el;
            this.scrolledPast = false;

            this._onScroll = this._onScroll.bind(this);
            this._bindEvents();
        }

        createClass(PxsAnnouncementBar, [{
            key: 'onSectionUnload',
            value: function onSectionUnload() {
                window.removeEventListener('scroll', this._onScroll);
            }
        }, {
            key: '_bindEvents',
            value: function _bindEvents() {
                window.addEventListener('scroll', this._onScroll);
            }
        }, {
            key: '_onScroll',
            value: function _onScroll() {
                var _window = window
                    , pageYOffset = _window.pageYOffset;

                var _el$getBoundingClient = this.el.getBoundingClientRect()
                    , height = _el$getBoundingClient.height;

                var scrolledPast = pageYOffset > height;

                // Trigger a hide event when viewport has scrolled past
                if (!this.scrolledPast && scrolledPast) {
                    this.scrolledPast = true;
                    trigger(this.el, 'pxs-ab-hide');
                }

                // Trigger a show announcement bar is back in view
                if (this.scrolledPast && !scrolledPast) {
                    this.scrolledPast = false;
                    trigger(this.el, 'pxs-ab-show');
                }
            }
        }]);
        return PxsAnnouncementBar;
    }();

    return PxsAnnouncementBar;

})));

;
window.AnnouncementBar = (function() {
    function AnnouncementBar(instance) {
        this.$document = $(document.body);
        this.el = instance.el;
        this.announcementBar = new PxsAnnouncementBar(instance);
        this._checkAnnouncementBar();
    }

    AnnouncementBar.prototype.onSectionUnload = function() {
        this.announcementBar.onSectionUnload();
        return this._checkAnnouncementBar();
    }
    ;

    AnnouncementBar.prototype._checkAnnouncementBar = function() {
        this.announcementBarEl = this.el.querySelector('.pxs-announcement-bar');
        return this.$document.trigger('checkAnnouncementBar', {
            el: this.announcementBarEl
        });
    }
    ;

    return AnnouncementBar;

})();

window.CurrencyView = (function(superClass) {
    extend(CurrencyView, superClass);

    function CurrencyView() {
        return CurrencyView.__super__.constructor.apply(this, arguments);
    }

    CurrencyView.prototype.events = {
        'change [name=currencies]': 'convertAll',
        'switch-currency': 'switchCurrency',
        'reset-currency': 'resetCurrency'
    };

    CurrencyView.prototype.initialize = function() {
        this.sectionBinding();
        return this.render();
    }
    ;

    CurrencyView.prototype.sectionBinding = function() {
        this.$el.on('shopify:section:load', (function(_this) {
            return function() {
                _this.delegateEvents();
                return _this.render();
            }
                ;
        })(this));
        return this.$el.on('shopify:section:unload', (function(_this) {
            return function() {
                return _this.undelegateEvents();
            }
                ;
        })(this));
    }
    ;

    CurrencyView.prototype.render = function() {
        var $money, doubleMoney, j, l, len, len1, money, ref, ref1;
        Currency.format = Theme.currencySwitcherFormat;
        Currency.money_with_currency_format[Theme.currency] = Theme.moneyFormatCurrency;
        Currency.money_format[Theme.currency] = Theme.moneyFormat;
        this.defaultCurrency = Theme.defaultCurrency || Theme.currency;
        this.cookieCurrency = Currency.cookie.read();
        if (this.cookieCurrency) {
            this.$("[name=currencies]").val(this.cookieCurrency);
        }
        ref = this.$('span.money span.money');
        for (j = 0,
                 len = ref.length; j < len; j++) {
            doubleMoney = ref[j];
            $(doubleMoney).parents('span.money').removeClass('money');
        }
        ref1 = this.$('span.money');
        for (l = 0,
                 len1 = ref1.length; l < len1; l++) {
            money = ref1[l];
            $money = $(money);
            $money.attr("data-currency-" + Theme.currency, $money.html());
        }
        this.switchCurrency();
        return this.$('.selected-currency').text(Currency.currentCurrency);
    }
    ;

    CurrencyView.prototype.resetCurrency = function() {
        var attribute, j, l, len, len1, money, ref, ref1, ref2;
        ref = this.$('span.money');
        for (j = 0,
                 len = ref.length; j < len; j++) {
            money = ref[j];
            ref1 = $(money)[0].attributes;
            for (l = 0,
                     len1 = ref1.length; l < len1; l++) {
                attribute = ref1[l];
                if (((ref2 = attribute.name) != null ? ref2.indexOf('data-') : void 0) > -1) {
                    $(money).attr(attribute.name, '');
                }
            }
        }
        return this.switchCurrency();
    }
    ;

    CurrencyView.prototype.switchCurrency = function() {
        if (this.cookieCurrency === null) {
            if (Theme.currency === !this.defaultCurrency) {
                return Currency.convertAll(Theme.currency, this.defaultCurrency);
            } else {
                return Currency.currentCurrency = this.defaultCurrency;
            }
        } else if (this.$('[name=currencies]').size() && this.$('[name=currencies] option[value=' + this.cookieCurrency + ']').size() === 0) {
            Currency.currentCurrency = Theme.currency;
            return Currency.cookie.write(Theme.currency);
        } else if (this.cookieCurrency === Theme.currency) {
            return Currency.currentCurrency = Theme.currency;
        } else {
            return Currency.convertAll(Theme.currency, this.cookieCurrency);
        }
    }
    ;

    CurrencyView.prototype.convertAll = function(e, variant, selector) {
        var newCurrency;
        newCurrency = $(e.target).val();
        Currency.convertAll(Currency.currentCurrency, newCurrency);
        this.$('.selected-currency').text(Currency.currentCurrency);
        return this.cookieCurrency = newCurrency;
    }
    ;

    return CurrencyView;

})(Backbone.View);

window.GoalView = (function(superClass) {
    extend(GoalView, superClass);

    function GoalView() {
        return GoalView.__super__.constructor.apply(this, arguments);
    }

    GoalView.prototype.initialize = function() {
        this.$document = $(document.body);
        this.$selector = $('[data-goal-countdown]');
        this.endDateTime = this.$selector.data('end-time');
        if (this.$selector.length && this.getRemainingTime().total >= 0) {
            return this.countDownTimer();
        } else {
            return $(document.body).addClass('has-goal-expired');
        }
    }
    ;

    GoalView.prototype.getRemainingTime = function() {
        var _day, _hour, _minute, _second, days, hours, minutes, seconds, t;
        _second = 1000;
        _minute = _second * 60;
        _hour = _minute * 60;
        _day = _hour * 24;
        t = Date.parse(this.endDateTime) - Date.parse(new Date());
        seconds = Math.floor((t / _second) % 60);
        minutes = Math.floor((t / _minute) % 60);
        hours = Math.floor((t / _hour) % 24);
        days = Math.floor(t / _day);
        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }
    ;

    GoalView.prototype.countDownTimer = function() {
        this.$countdownDays = this.$selector.find("[data-goal-countdown-days]");
        this.$countdownHours = this.$selector.find("[data-goal-countdown-hours]");
        this.$countdownMinutes = this.$selector.find("[data-goal-countdown-minutes]");
        this.$countdownSeconds = this.$selector.find("[data-goal-countdown-seconds]");
        this.lastDayText = this.$selector.data("alt-text");
        this.$productViewDays = $(".product-goal-info-days");
        this.$productViewDaysWrapper = $(".product-goal-info-remaining");
        this.runTimer();
        this.timer = setInterval((function(_this) {
            return function() {
                return _this.runTimer();
            }
                ;
        })(this), 1000);
        return setTimeout((function(_this) {
            return function() {
                _this.$el.addClass('active');
                return _this.$document.trigger('checkHeaderOffsets');
            }
                ;
        })(this), 100);
    }
    ;

    GoalView.prototype.runTimer = function() {
        var timeRemaining;
        timeRemaining = this.getRemainingTime();
        if (timeRemaining.total <= 0) {
            this.$(".module-header-goal-time-up").removeClass("hidden");
            this.$selector.addClass("hidden");
            clearInterval(this.timer);
            return;
        } else {
            this.$countdownDays.html(timeRemaining.days);
            this.$countdownHours.html(timeRemaining.hours);
            this.$countdownMinutes.html(timeRemaining.minutes);
            this.$countdownSeconds.html(timeRemaining.seconds);
        }
        if (this.$productViewDays.length) {
            if (timeRemaining.total > 0 && timeRemaining.days === 0) {
                return this.$productViewDaysWrapper.html(this.lastDayText);
            } else {
                return this.$productViewDays.html(timeRemaining.days);
            }
        }
    }
    ;

    return GoalView;

})(Backbone.View);

window.Instagram = (function() {
    function Instagram($el) {
        this.$photoContainer = null;
        this.$errorContainer = null;
        this.rimg = null;
        this.photos = [];
        this._renderPhotos = this._renderPhotos.bind(this);
        if (!$el.length) {
            return;
        }
        this.init($el);
    }

    Instagram.prototype.init = function($el) {
        this.$photoContainer = $el.find('[data-instagram-photos]');
        this.accessToken = $el.find('[data-instagram-token]').attr('data-instagram-token');
        this.accessTokenError = $el.find('[data-instagram-error]').attr('data-instagram-error');
        rimg.shopify.instance.track(this.$photoContainer[0]);
        if (this.accessToken.length > 0) {
            this._getPhotos();
            return this.$photoContainer.on('rimg:enter', (function(_this) {
                return function() {
                    return _this._renderPhotos();
                }
                    ;
            })(this));
        } else {
            return this._hasError(false);
        }
    }
    ;

    Instagram.prototype.unload = function() {
        return rimg.shopify.instance.track(this.$photoContainer[0]);
    }
    ;

    Instagram.prototype._getPhotos = function(callback) {
        var url;
        if (callback == null) {
            callback = null;
        }
        url = "https://api.instagram.com/v1/users/self/media/recent?access_token=" + this.accessToken + "&count=6&callback=";
        return $.ajax({
            type: "GET",
            dataType: "jsonp",
            url: url,
            success: (function(_this) {
                return function(response) {
                    if (response.meta.code === 200) {
                        _this.$photoContainer.html('');
                        _this.photos = response.data;
                        return typeof callback === "function" ? callback() : void 0;
                    } else {
                        _this._hasError(response);
                        return _this._errorOverlay();
                    }
                }
                    ;
            })(this),
            error: (function(_this) {
                return function(response) {
                    return _this._hasError(response);
                }
                    ;
            })(this)
        });
    }
    ;

    Instagram.prototype._renderPhotos = function() {
        var image, j, len, photo, ref, results1, scale;
        if (!this.photos.length) {
            return this._getPhotos(this._renderPhotos);
        }
        ref = this.photos;
        results1 = [];
        for (j = 0,
                 len = ref.length; j < len; j++) {
            photo = ref[j];
            image = photo.images.standard_resolution;
            scale = image.width > image.height ? 'y' : 'x';
            results1.push(this.$photoContainer.append("<div class=\"instagram-photo\">\n    <a\n        class=\"instagram-link\"\n        target=\"_blank\"\n        href=\"" + photo.link + "\"\n    >\n        <img\n            class=\"\n                instagram-image\n                instagram-image-scale-" + scale + "\n            \"\n            src=\"" + image.url + "\"\n        />\n    </a>\n</div>"));
        }
        return results1;
    }
    ;

    Instagram.prototype._errorOverlay = function() {
        if (this.$photoContainer.find('[data-instagram-errror]').length) {
            return;
        }
        this.$photoContainer.append("<div class=\"instagram-error\" data-instagram-error>" + this.accessTokenError + "</div>");
        return this.$errorContainer = this.$photoContainer.find('[data-instagram-errror]');
    }
    ;

    Instagram.prototype._hasError = function(response) {
        if (response) {
            return console.log("Instagram error: " + response.meta.error_message);
        }
    }
    ;

    return Instagram;

})();

/*********************************************************************
 *  #### Twitter Post Fetcher v17.0.3 ####
 *  Coded by Jason Mayes 2015. A present to all the developers out there.
 *  www.jasonmayes.com
 *  Please keep this disclaimer with my code if you use it. Thanks. :-)
 *  Got feedback or questions, ask here:
 *  http://www.jasonmayes.com/projects/twitterApi/
 *  Github: https://github.com/jasonmayes/Twitter-Post-Fetcher
 *  Updates will be posted to this site.
 *********************************************************************/
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        factory();
    }
}(this, function() {
    var domNode = '';
    var maxTweets = 20;
    var parseLinks = true;
    var queue = [];
    var inProgress = false;
    var printTime = true;
    var printUser = true;
    var formatterFunction = null;
    var supportsClassName = true;
    var showRts = true;
    var customCallbackFunction = null;
    var showInteractionLinks = true;
    var showImages = false;
    var useEmoji = false;
    var targetBlank = true;
    var lang = 'en';
    var permalinks = true;
    var dataOnly = false;
    var script = null;
    var scriptAdded = false;
    function handleTweets(tweets) {
        if (customCallbackFunction === null) {
            var x = tweets.length;
            var n = 0;
            var element = document.getElementById(domNode);
            var html = '<ul>';
            while (n < x) {
                html += '<li>' + tweets[n] + '</li>';
                n++;
            }
            html += '</ul>';
            element.innerHTML = html;
        } else {
            customCallbackFunction(tweets);
        }
    }
    function strip(data) {
        return data.replace(/<b[^>]*>(.*?)<\/b>/gi, function(a, s) {
            return s;
        }).replace(/class="(?!(tco-hidden|tco-display|tco-ellipsis))+.*?"|data-query-source=".*?"|dir=".*?"|rel=".*?"/gi, '');
    }
    function targetLinksToNewWindow(el) {
        var links = el.getElementsByTagName('a');
        for (var i = links.length - 1; i >= 0; i--) {
            links[i].setAttribute('target', '_blank');
        }
    }
    function getElementsByClassName(node, classname) {
        var a = [];
        var regex = new RegExp('(^| )' + classname + '( |$)');
        var elems = node.getElementsByTagName('*');
        for (var i = 0, j = elems.length; i < j; i++) {
            if (regex.test(elems[i].className)) {
                a.push(elems[i]);
            }
        }
        return a;
    }
    function extractImageUrl(image_data) {
        if (image_data !== undefined && image_data.innerHTML.indexOf('data-image') >= 0) {
            var data_src = image_data.innerHTML.match(/data-image=\"([A-z0-9]+:\/\/[A-z0-9]+\.[A-z0-9]+\.[A-z0-9]+\/[A-z0-9]+\/[A-z0-9\-]+)/i)[1];
            return decodeURIComponent(data_src) + '.jpg';
        }
    }
    var twitterFetcher = {
        fetch: function(config) {
            if (config.maxTweets === undefined) {
                config.maxTweets = 20;
            }
            if (config.enableLinks === undefined) {
                config.enableLinks = true;
            }
            if (config.showUser === undefined) {
                config.showUser = true;
            }
            if (config.showTime === undefined) {
                config.showTime = true;
            }
            if (config.dateFunction === undefined) {
                config.dateFunction = 'default';
            }
            if (config.showRetweet === undefined) {
                config.showRetweet = true;
            }
            if (config.customCallback === undefined) {
                config.customCallback = null;
            }
            if (config.showInteraction === undefined) {
                config.showInteraction = true;
            }
            if (config.showImages === undefined) {
                config.showImages = false;
            }
            if (config.useEmoji === undefined) {
                config.useEmoji = false;
            }
            if (config.linksInNewWindow === undefined) {
                config.linksInNewWindow = true;
            }
            if (config.showPermalinks === undefined) {
                config.showPermalinks = true;
            }
            if (config.dataOnly === undefined) {
                config.dataOnly = false;
            }
            if (inProgress) {
                queue.push(config);
            } else {
                inProgress = true;
                domNode = config.domId;
                maxTweets = config.maxTweets;
                parseLinks = config.enableLinks;
                printUser = config.showUser;
                printTime = config.showTime;
                showRts = config.showRetweet;
                formatterFunction = config.dateFunction;
                customCallbackFunction = config.customCallback;
                showInteractionLinks = config.showInteraction;
                showImages = config.showImages;
                useEmoji = config.useEmoji;
                targetBlank = config.linksInNewWindow;
                permalinks = config.showPermalinks;
                dataOnly = config.dataOnly;
                var head = document.getElementsByTagName('head')[0];
                if (script !== null) {
                    head.removeChild(script);
                }
                script = document.createElement('script');
                script.type = 'text/javascript';
                if (config.list !== undefined) {
                    script.src = 'https://syndication.twitter.com/timeline/list?' + 'callback=__twttrf.callback&dnt=false&list_slug=' + config.list.listSlug + '&screen_name=' + config.list.screenName + '&suppress_response_codes=true&lang=' + (config.lang || lang) + '&rnd=' + Math.random();
                } else if (config.profile !== undefined) {
                    script.src = 'https://syndication.twitter.com/timeline/profile?' + 'callback=__twttrf.callback&dnt=false' + '&screen_name=' + config.profile.screenName + '&suppress_response_codes=true&lang=' + (config.lang || lang) + '&rnd=' + Math.random();
                } else if (config.likes !== undefined) {
                    script.src = 'https://syndication.twitter.com/timeline/likes?' + 'callback=__twttrf.callback&dnt=false' + '&screen_name=' + config.likes.screenName + '&suppress_response_codes=true&lang=' + (config.lang || lang) + '&rnd=' + Math.random();
                } else {
                    script.src = 'https://cdn.syndication.twimg.com/widgets/timelines/' + config.id + '?&lang=' + (config.lang || lang) + '&callback=__twttrf.callback&' + 'suppress_response_codes=true&rnd=' + Math.random();
                }
                head.appendChild(script);
            }
        },
        callback: function(data) {
            if (data === undefined || data.body === undefined) {
                inProgress = false;
                if (queue.length > 0) {
                    twitterFetcher.fetch(queue[0]);
                    queue.splice(0, 1);
                }
                return;
            }
            if (!useEmoji) {
                data.body = data.body.replace(/(<img[^c]*class="Emoji[^>]*>)|(<img[^c]*class="u-block[^>]*>)/g, '');
            }
            if (!showImages) {
                data.body = data.body.replace(/(<img[^c]*class="NaturalImage-image[^>]*>|(<img[^c]*class="CroppedImage-image[^>]*>))/g, '');
            }
            if (!printUser) {
                data.body = data.body.replace(/(<img[^c]*class="Avatar"[^>]*>)/g, '');
            }
            var div = document.createElement('div');
            div.innerHTML = data.body;
            if (typeof (div.getElementsByClassName) === 'undefined') {
                supportsClassName = false;
            }
            function swapDataSrc(element) {
                var avatarImg = element.getElementsByTagName('img')[0];
                if (avatarImg && avatarImg.length) {
                    avatarImg.src = avatarImg.getAttribute('data-src-2x');
                }
                return element;
            }
            var tweets = [];
            var authors = [];
            var times = [];
            var images = [];
            var rts = [];
            var tids = [];
            var permalinksURL = [];
            var x = 0;
            if (supportsClassName) {
                var tmp = div.getElementsByClassName('timeline-Tweet');
                while (x < tmp.length) {
                    if (tmp[x].getElementsByClassName('timeline-Tweet-retweetCredit').length > 0) {
                        rts.push(true);
                    } else {
                        rts.push(false);
                    }
                    if (!rts[x] || rts[x] && showRts) {
                        tweets.push(tmp[x].getElementsByClassName('timeline-Tweet-text')[0]);
                        tids.push(tmp[x].getAttribute('data-tweet-id'));
                        if (printUser) {
                            authors.push(swapDataSrc(tmp[x].getElementsByClassName('timeline-Tweet-author')[0]));
                        }
                        times.push(tmp[x].getElementsByClassName('dt-updated')[0]);
                        permalinksURL.push(tmp[x].getElementsByClassName('timeline-Tweet-timestamp')[0]);
                        if (tmp[x].getElementsByClassName('timeline-Tweet-media')[0] !== undefined) {
                            images.push(tmp[x].getElementsByClassName('timeline-Tweet-media')[0]);
                        } else {
                            images.push(undefined);
                        }
                    }
                    x++;
                }
            } else {
                var tmp = getElementsByClassName(div, 'timeline-Tweet');
                while (x < tmp.length) {
                    if (getElementsByClassName(tmp[x], 'timeline-Tweet-retweetCredit').length > 0) {
                        rts.push(true);
                    } else {
                        rts.push(false);
                    }
                    if (!rts[x] || rts[x] && showRts) {
                        tweets.push(getElementsByClassName(tmp[x], 'timeline-Tweet-text')[0]);
                        tids.push(tmp[x].getAttribute('data-tweet-id'));
                        if (printUser) {
                            authors.push(swapDataSrc(getElementsByClassName(tmp[x], 'timeline-Tweet-author')[0]));
                        }
                        times.push(getElementsByClassName(tmp[x], 'dt-updated')[0]);
                        permalinksURL.push(getElementsByClassName(tmp[x], 'timeline-Tweet-timestamp')[0]);
                        if (getElementsByClassName(tmp[x], 'timeline-Tweet-media')[0] !== undefined) {
                            images.push(getElementsByClassName(tmp[x], 'timeline-Tweet-media')[0]);
                        } else {
                            images.push(undefined);
                        }
                    }
                    x++;
                }
            }
            if (tweets.length > maxTweets) {
                tweets.splice(maxTweets, (tweets.length - maxTweets));
                authors.splice(maxTweets, (authors.length - maxTweets));
                times.splice(maxTweets, (times.length - maxTweets));
                rts.splice(maxTweets, (rts.length - maxTweets));
                images.splice(maxTweets, (images.length - maxTweets));
                permalinksURL.splice(maxTweets, (permalinksURL.length - maxTweets));
            }
            var arrayTweets = [];
            var x = tweets.length;
            var n = 0;
            if (dataOnly) {
                while (n < x) {
                    arrayTweets.push({
                        tweet: tweets[n].innerHTML,
                        author: authors[n] ? authors[n].innerHTML : 'Unknown Author',
                        author_data: {
                            profile_url: authors[n] ? authors[n].querySelector('[data-scribe="element:user_link"]').href : null,
                            profile_image: authors[n] ? authors[n].querySelector('[data-scribe="element:avatar"]').getAttribute('data-src-1x') : null,
                            profile_image_2x: authors[n] ? authors[n].querySelector('[data-scribe="element:avatar"]').getAttribute('data-src-2x') : null,
                            screen_name: authors[n] ? authors[n].querySelector('[data-scribe="element:screen_name"]').title : null,
                            name: authors[n] ? authors[n].querySelector('[data-scribe="element:name"]').title : null
                        },
                        time: times[n].textContent,
                        timestamp: times[n].getAttribute('datetime').replace('+0000', 'Z').replace(/([\+\-])(\d\d)(\d\d)/, '$1$2:$3'),
                        image: extractImageUrl(images[n]),
                        rt: rts[n],
                        tid: tids[n],
                        permalinkURL: (permalinksURL[n] === undefined) ? '' : permalinksURL[n].href
                    });
                    n++;
                }
            } else {
                while (n < x) {
                    if (typeof (formatterFunction) !== 'string') {
                        var datetimeText = times[n].getAttribute('datetime');
                        var newDate = new Date(times[n].getAttribute('datetime').replace(/-/g, '/').replace('T', ' ').split('+')[0]);
                        var dateString = formatterFunction(newDate, datetimeText);
                        times[n].setAttribute('aria-label', dateString);
                        if (tweets[n].textContent) {
                            if (supportsClassName) {
                                times[n].textContent = dateString;
                            } else {
                                var h = document.createElement('p');
                                var t = document.createTextNode(dateString);
                                h.appendChild(t);
                                h.setAttribute('aria-label', dateString);
                                times[n] = h;
                            }
                        } else {
                            times[n].textContent = dateString;
                        }
                    }
                    var op = '';
                    if (parseLinks) {
                        if (targetBlank) {
                            targetLinksToNewWindow(tweets[n]);
                            if (printUser) {
                                targetLinksToNewWindow(authors[n]);
                            }
                        }
                        if (printUser) {
                            op += '<div class="user">' + strip(authors[n].innerHTML) + '</div>';
                        }
                        op += '<p class="tweet">' + strip(tweets[n].innerHTML) + '</p>';
                        if (printTime) {
                            if (permalinks) {
                                op += '<p class="timePosted"><a href="' + permalinksURL[n] + '">' + times[n].getAttribute('aria-label') + '</a></p>';
                            } else {
                                op += '<p class="timePosted">' + times[n].getAttribute('aria-label') + '</p>';
                            }
                        }
                    } else {
                        if (tweets[n].textContent) {
                            if (printUser) {
                                op += '<p class="user">' + authors[n].textContent + '</p>';
                            }
                            op += '<p class="tweet">' + tweets[n].textContent + '</p>';
                            if (printTime) {
                                op += '<p class="timePosted">' + times[n].textContent + '</p>';
                            }
                        } else {
                            if (printUser) {
                                op += '<p class="user">' + authors[n].textContent + '</p>';
                            }
                            op += '<p class="tweet">' + tweets[n].textContent + '</p>';
                            if (printTime) {
                                op += '<p class="timePosted">' + times[n].textContent + '</p>';
                            }
                        }
                    }
                    if (showInteractionLinks) {
                        op += '<p class="interact"><a href="https://twitter.com/intent/' + 'tweet?in_reply_to=' + tids[n] + '" class="twitter_reply_icon"' + (targetBlank ? ' target="_blank">' : '>') + 'Reply</a><a href="https://twitter.com/intent/retweet?' + 'tweet_id=' + tids[n] + '" class="twitter_retweet_icon"' + (targetBlank ? ' target="_blank">' : '>') + 'Retweet</a>' + '<a href="https://twitter.com/intent/favorite?tweet_id=' + tids[n] + '" class="twitter_fav_icon"' + (targetBlank ? ' target="_blank">' : '>') + 'Favorite</a></p>';
                    }
                    if (showImages && images[n] !== undefined && extractImageUrl(images[n]) !== undefined) {
                        op += '<div class="media">' + '<img src="' + extractImageUrl(images[n]) + '" alt="Image from tweet" />' + '</div>';
                    }
                    if (showImages) {
                        arrayTweets.push(op);
                    } else if (!showImages && tweets[n].textContent.length) {
                        arrayTweets.push(op);
                    }
                    n++;
                }
            }
            handleTweets(arrayTweets);
            inProgress = false;
            if (queue.length > 0) {
                twitterFetcher.fetch(queue[0]);
                queue.splice(0, 1);
            }
        }
    };
    window.__twttrf = twitterFetcher;
    window.twitterFetcher = twitterFetcher;
    return twitterFetcher;
}));

;
Twitter = (function() {
    function Twitter($el) {
        this.$tweetContainer = null;
        this.init($el);
    }

    Twitter.prototype.init = function($el) {
        var retweets, username;
        this.$tweetContainer = $el.find('[data-twitter-tweets]');
        username = $el.find('[data-twitter-username]').attr('data-twitter-username');
        retweets = $el.find('[data-show-retweets]').length;
        return this._fetchTweets(username, retweets);
    }
    ;

    Twitter.prototype._fetchTweets = function(username, retweets) {
        var config;
        config = {
            'profile': {
                'screenName': username
            },
            'maxTweets': 1,
            'enableLinks': true,
            'showUser': true,
            'showTime': true,
            'useEmoji': true,
            'showRetweet': retweets,
            'customCallback': (function(_this) {
                return function(tweets) {
                    return _this.renderTweets(tweets);
                }
                    ;
            })(this),
            'showInteraction': false
        };
        return twitterFetcher.fetch(config);
    }
    ;

    Twitter.prototype.renderTweets = function(tweets) {
        this.$tweetContainer.html();
        if (tweets.length) {
            return this.$tweetContainer.html($(tweets[0]));
        } else {
            return console.log("No tweets to display. Most probable cause is an incorrectly entered username.");
        }
    }
    ;

    return Twitter;

})();

window.WidgetsView = (function(superClass) {
    extend(WidgetsView, superClass);

    function WidgetsView() {
        return WidgetsView.__super__.constructor.apply(this, arguments);
    }

    WidgetsView.prototype.initialize = function() {
        var $instagram, $twitter;
        $instagram = this.$el.find('[data-widget="instagram"]');
        $twitter = this.$el.find('[data-widget="twitter"]');
        this.instagram = null;
        if ($instagram.length) {
            this.instagram = new Instagram($instagram);
        }
        this.twitter = null;
        if ($twitter.length) {
            return this.twitter = new Twitter($twitter);
        }
    }
    ;

    WidgetsView.prototype.update = function($el) {
        var ref;
        this.instagram.init($el);
        return (ref = this.twitter) != null ? ref.init($el) : void 0;
    }
    ;

    WidgetsView.prototype.remove = function() {
        delete (this.twitter != null);
        if (this.instagram) {
            this.instagram.unload();
            return delete this.instagram;
        }
    }
    ;

    return WidgetsView;

})(Backbone.View);

window.ZoomView = (function(superClass) {
    extend(ZoomView, superClass);

    function ZoomView() {
        return ZoomView.__super__.constructor.apply(this, arguments);
    }

    ZoomView.prototype.events = {
        'prepare-zoom': 'prepareZoom',
        'click': 'toggleZoom',
        'mouseover .product-image-zoom': 'prepareZoom',
        'mouseout .product-image-zoom': 'toggleZoom',
        'mousemove .product-image-zoom': 'zoomImage'
    };

    ZoomView.prototype.initialize = function() {
        this.zoomArea = this.$('.product-image-zoom');
        this.$newImage = null;
        return this.$el.imagesLoaded((function(_this) {
            return function() {
                return _this.prepareZoom();
            }
                ;
        })(this));
    }
    ;

    ZoomView.prototype.prepareZoom = function() {
        var highResSrc, newImage;
        highResSrc = this.$el.find('img').attr('data-high-res');
        newImage = new Image();
        this.$newImage = $(newImage);
        this.$newImage.on('load', (function(_this) {
            return function() {
                var imageHeight, imageWidth, photoAreaHeight, photoAreaWidth, ratio, ratios;
                imageWidth = newImage.width;
                imageHeight = newImage.height;
                photoAreaWidth = _this.$el.width();
                photoAreaHeight = _this.$el.height();
                ratios = [];
                ratios.push(imageWidth / photoAreaWidth);
                ratios.push(imageHeight / photoAreaHeight);
                ratio = Math.max.apply(null, ratios);
                if (ratio >= 1 && imageWidth > photoAreaWidth && imageHeight > photoAreaHeight) {
                    _this.$el.addClass('zoom-enabled');
                    return _this.zoomArea.css({
                        backgroundImage: "url('" + highResSrc + "')"
                    });
                } else {
                    _this.$el.removeClass('zoom-enabled');
                }
            }
                ;
        })(this));
        return newImage.src = highResSrc;
    }
    ;

    ZoomView.prototype.toggleZoom = function(e) {
        if (!this.$el.hasClass('zoom-enabled')) {
            return;
        }
        if (e.type === 'mouseout') {
            this.zoomArea.removeClass('active');
            this.zoomArea.css({
                backgroundPosition: '50% 50%'
            });
            return;
        }
        if (this.zoomArea.hasClass('active')) {
            this.zoomArea.removeClass('active');
        } else {
            this.zoomArea.addClass('active');
        }
        return this.zoomImage(e);
    }
    ;

    ZoomView.prototype.zoomImage = function(e) {
        var bigImageOffset, bigImageX, bigImageY, mousePositionX, mousePositionY, ratioX, ratioY, zoomHeight, zoomWidth;
        zoomWidth = this.zoomArea.width();
        zoomHeight = this.zoomArea.height();
        bigImageOffset = this.$el.offset();
        bigImageX = Math.round(bigImageOffset.left);
        bigImageY = Math.round(bigImageOffset.top);
        mousePositionX = e.pageX - bigImageX;
        mousePositionY = e.pageY - bigImageY;
        if (mousePositionX < zoomWidth && mousePositionY < zoomHeight && mousePositionX > 0 && mousePositionY > 0) {
            if (this.zoomArea.hasClass('active')) {
                ratioY = (e.pageY - bigImageY) / zoomHeight * 100;
                ratioX = (e.pageX - bigImageX) / zoomWidth * 100;
                return this.zoomArea.css({
                    backgroundPosition: ratioX + "% " + ratioY + "%"
                });
            }
        }
    }
    ;

    ZoomView.prototype.prepareRemove = function() {
        return this.$newImage.off('load');
    }
    ;

    return ZoomView;

})(Backbone.View);

window.LinkedOptions = (function() {
    function LinkedOptions(options) {
        this.options = options;
        this._init();
    }

    LinkedOptions.prototype._init = function() {
        return this._mapVariants(this.options.productJSON);
    }
    ;

    LinkedOptions.prototype._getCurrent = function(optionIndex) {
        var key, option1, option2, selector;
        if (this.options.type === 'select') {
            switch (optionIndex) {
                case 0:
                    key = 'root';
                    selector = this.options.$selector.eq(0);
                    break;
                case 1:
                    key = this.options.$selector.eq(0).val();
                    selector = this.options.$selector.eq(1);
                    break;
                case 2:
                    key = (this.options.$selector.eq(0).val()) + " / " + (this.options.$selector.eq(1).val());
                    selector = this.options.$selector.eq(2);
            }
        }
        if (this.options.type === 'radio') {
            switch (optionIndex) {
                case 0:
                    key = 'root';
                    selector = this.options.$selector.filter('[data-option-index=0]').filter(':checked');
                    break;
                case 1:
                    key = this.options.$selector.filter('[data-option-index=0]').filter(':checked').val();
                    selector = this.options.$selector.filter('[data-option-index=1]').filter(':checked');
                    break;
                case 2:
                    option1 = this.options.$selector.filter('[data-option-index=0]').filter(':checked').val();
                    option2 = this.options.$selector.filter('[data-option-index=1]').filter(':checked').val();
                    key = option1 + " / " + option2;
                    selector = this.options.$selector.filter('[data-option-index=2]').filter(':checked');
            }
        }
        return {
            key: key,
            selector: selector
        };
    }
    ;

    LinkedOptions.prototype._updateOptions = function(optionIndex, optionsMap) {
        var $nextOption, $option, $selector, $selectorOptions, availableOptions, initialValue, j, key, l, len, len1, nextSelector, option, ref, selector, updateSelected;
        nextSelector = optionIndex + 1;
        updateSelected = false;
        ref = this._getCurrent(optionIndex),
            key = ref.key,
            selector = ref.selector;
        availableOptions = optionsMap[key] || [];
        if (this.options.type === 'select') {
            $selector = this.options.$productForm.find(selector);
            initialValue = $selector.val();
            $selectorOptions = $selector.find('option');
            for (j = 0,
                     len = $selectorOptions.length; j < len; j++) {
                option = $selectorOptions[j];
                $option = $(option);
                if (availableOptions.indexOf(option.value) === -1) {
                    if (option.selected) {
                        updateSelected = true;
                    }
                    $option.prop('disabled', true).prop('selected', false);
                } else {
                    $option.prop('disabled', false);
                }
            }
            if (availableOptions.indexOf(initialValue) !== -1) {
                $selector.val(initialValue);
            }
            if (updateSelected) {
                $selectorOptions.filter(':not(:disabled)').eq(0).prop('selected', true);
            }
        }
        if (this.options.type === 'radio') {
            $selector = this.options.$selector.filter("[data-option-index=" + optionIndex + "]");
            for (l = 0,
                     len1 = $selector.length; l < len1; l++) {
                option = $selector[l];
                $option = $(option);
                if (availableOptions.indexOf(option.value) === -1) {
                    if (option.checked) {
                        updateSelected = true;
                    }
                    $option.prop('disabled', true).prop('checked', false);
                } else {
                    $option.prop('disabled', false);
                }
            }
            if (updateSelected) {
                $selector.filter(':not(:disabled)').eq(0).attr('checked', true).trigger('click');
            }
        }
        $selector.trigger('change');
        $nextOption = this.options.$selector.filter("[data-option-index=" + nextSelector + "]");
        if ($nextOption.length !== 0) {
            return this._updateOptions(nextSelector, optionsMap);
        }
    }
    ;

    LinkedOptions.prototype._mapVariants = function(product) {
        var j, key, len, optionsMap, ref, variant;
        optionsMap = [];
        optionsMap['root'] = [];
        ref = product.variants;
        for (j = 0,
                 len = ref.length; j < len; j++) {
            variant = ref[j];
            if (variant.available) {
                optionsMap['root'].push(variant.option1);
                optionsMap['root'] = window.ThemeUtils.unique(optionsMap['root']);
                if (product.options.length > 1) {
                    key = variant.option1;
                    optionsMap[key] = optionsMap[key] || [];
                    optionsMap[key].push(variant.option2);
                    optionsMap[key] = window.ThemeUtils.unique(optionsMap[key]);
                }
                if (product.options.length > 2) {
                    key = variant.option1 + " / " + variant.option2;
                    optionsMap[key] = optionsMap[key] || [];
                    optionsMap[key].push(variant.option3);
                    optionsMap[key] = window.ThemeUtils.unique(optionsMap[key]);
                }
            }
        }
        this._updateOptions(0, optionsMap);
        return this.options.$selector.on('change', (function(_this) {
            return function(event) {
                var index, nextSelector;
                index = parseInt($(event.currentTarget).attr('data-option-index'), 10);
                nextSelector = index + 1;
                return _this._updateOptions(nextSelector, optionsMap);
            }
                ;
        })(this));
    }
    ;

    LinkedOptions.prototype.prepareRemove = function() {
        return this.options.$selector.off('change');
    }
    ;

    return LinkedOptions;

})();

window.VariantHelper = (function() {
    function VariantHelper(options) {
        var defaultOptions, isShopify;
        defaultOptions = {
            $addToCartButton: null,
            $priceFields: null,
            $productForm: null,
            $productThumbnails: null,
            $selector: null,
            type: 'select',
            productJSON: null,
            productSettings: null
        };
        this.options = window.ThemeUtils.extend(defaultOptions, options);
        this.$body = $(document.body);
        this.linkedOptions = null;
        this.enableHistory = false;
        this.$masterSelect = this.options.$productForm.find("#product-select-" + this.options.formID);
        this.$smartPaymentButtons = this.options.$productForm.find(".shopify-payment-button");
        isShopify = window.Shopify && window.Shopify.preview_host;
        if (window.history && window.history.replaceState && this.options.productSettings.enableHistory && !isShopify) {
            this.enableHistory = true;
        }
        this._init();
        this._bindEvents();
    }

    VariantHelper.prototype._init = function() {
        var j, len, ref, select;
        if (this.options.type === 'select') {
            ref = this.options.$selector;
            for (j = 0,
                     len = ref.length; j < len; j++) {
                select = ref[j];
                this._setSelectLabel(null, $(select));
            }
        }
        if (this.options.productSettings.linkedOptions) {
            this.linkedOptions = new LinkedOptions(this.options);
        }
        return this._updateCurrency();
    }
    ;

    VariantHelper.prototype._bindEvents = function() {
        return this.options.$selector.on('change', (function(_this) {
            return function(event) {
                return _this._variantChange(event);
            }
                ;
        })(this));
    }
    ;

    VariantHelper.prototype._setSelectLabel = function(event, $target) {
        var selectedOption;
        if (event == null) {
            event = null;
        }
        if ($target == null) {
            $target = false;
        }
        if (!$target) {
            $target = $(event.currentTarget);
        }
        selectedOption = $target.find('option:selected').val();
        return $target.prev('[data-select-text]').find('[data-selected-option]').text(selectedOption);
    }
    ;

    VariantHelper.prototype._getCurrentOptions = function() {
        var $inputs, productOptions;
        productOptions = [];
        $inputs = this.options.$selector;
        if (this.options.type === 'radio') {
            $inputs = $inputs.filter(':checked');
        }
        $inputs.each(function(index, element) {
            return productOptions.push($(element).val());
        });
        return productOptions;
    }
    ;

    VariantHelper.prototype._getVariantFromOptions = function(productOptions) {
        var foundVariant, isMatch, j, len, ref, variant;
        if (this.options.productJSON.variants == null) {
            return;
        }
        foundVariant = null;
        ref = this.options.productJSON.variants;
        for (j = 0,
                 len = ref.length; j < len; j++) {
            variant = ref[j];
            isMatch = productOptions.every(function(value, index) {
                return variant.options[index] === value;
            });
            if (isMatch) {
                foundVariant = variant;
            }
        }
        return foundVariant;
    }
    ;

    VariantHelper.prototype._updateMasterSelect = function(variant) {
        var ref;
        if (variant == null) {
            return;
        }
        if ((ref = this.$masterSelect.find("[data-variant-id=" + variant.id + "]")) != null) {
            ref.prop('selected', true);
        }
        return this.$masterSelect.trigger('change');
    }
    ;

    VariantHelper.prototype._updatePrice = function(variant) {
        var $addToCartButton, $amountSaved, $displayPrice, $originalPrice, $priceComparison, $priceFields, productSettings;
        $addToCartButton = this.options.$addToCartButton;
        $priceFields = this.options.$priceFields;
        productSettings = this.options.productSettings;
        $displayPrice = $priceFields.find('.money:first-child');
        $originalPrice = $priceFields.find('.original');
        $amountSaved = $priceFields.find('.saving-result');
        $priceComparison = $priceFields.find('.product-price-compare');
        if (variant != null) {
            if (variant.available) {
                $addToCartButton.val(productSettings.addToCartText).removeClass('disabled').removeAttr('disabled');
            } else {
                $addToCartButton.val(productSettings.soldOutText).addClass('disabled').attr('disabled', 'disabled');
            }
            if (variant.compare_at_price > variant.price) {
                $displayPrice.html(LS.localization.formatMoney(variant.price, Theme.moneyFormat));
                $originalPrice.html(LS.localization.formatMoney(variant.compare_at_price, Theme.moneyFormat));
                $amountSaved.html(LS.localization.formatMoney(variant.compare_at_price - variant.price, Theme.moneyFormat));
                $priceComparison.show();
            } else {
                $displayPrice.html(LS.localization.formatMoney(variant.price, Theme.moneyFormat));
                $originalPrice.html('');
                $amountSaved.html('');
                $priceComparison.hide();
            }
        } else {
            $addToCartButton.val(productSettings.unavailableText).addClass('disabled').attr('disabled', 'disabled');
        }
        return this._updateCurrency();
    }
    ;

    VariantHelper.prototype._updateImages = function(variant) {
        var imageId, ref;
        imageId = variant != null ? (ref = variant.featured_image) != null ? ref.id : void 0 : void 0;
        if (imageId == null) {
            return;
        }
        return this.options.$productThumbnails.find("[data-image-id='" + imageId + "']").trigger("click");
    }
    ;

    VariantHelper.prototype._updateHistory = function(variant) {
        var newUrl, variantUrl;
        if (!(this.enableHistory && (variant != null))) {
            return;
        }
        newUrl = [window.location.protocol, '//', window.location.host, window.location.pathname, '?variant=', variant.id];
        variantUrl = newUrl.join('');
        return window.history.replaceState({
            path: variantUrl
        }, '', variantUrl);
    }
    ;

    VariantHelper.prototype._variantChange = function(event) {
        var productOptions, variant;
        if (this.options.type === 'select') {
            this._setSelectLabel(event);
        }
        productOptions = this._getCurrentOptions();
        variant = this._getVariantFromOptions(productOptions);
        this._updateMasterSelect(variant);
        this._updatePrice(variant);
        this._updateImages(variant);
        this._updateHistory(variant);
        return this._updateSmartPaymentButtons(variant);
    }
    ;

    VariantHelper.prototype._updateSmartPaymentButtons = function(variant) {
        if (variant.available) {
            return this.$smartPaymentButtons.slideDown();
        } else {
            return this.$smartPaymentButtons.slideUp();
        }
    }
    ;

    VariantHelper.prototype._updateCurrency = function() {
        if (Theme.currencySwitcher) {
            return this.$body.trigger('reset-currency');
        }
    }
    ;

    VariantHelper.prototype.prepareRemove = function() {
        var ref;
        this.options.$selector.off('change');
        return (ref = this.linkedOptions) != null ? ref.prepareRemove() : void 0;
    }
    ;

    return VariantHelper;

})();

window.ImagePreloader = (function() {

    /*
      @param images
          {object} containing URLS to images
      @param size
          {string} containing image size to return images as
   */
    function ImagePreloader(images, size) {
        this.images = images;
        this.size = size;
        this._init();
    }

    ImagePreloader.prototype._init = function() {
        var image, j, len, ref, results1;
        ref = this.images;
        results1 = [];
        for (j = 0,
                 len = ref.length; j < len; j++) {
            image = ref[j];
            results1.push(this._loadImage(this._getSizedImageURL(image, this.size)));
        }
        return results1;
    }
    ;

    /*
      Retrieves the URI for a specified image based on an image size
   */

    ImagePreloader.prototype._getSizedImageURL = function(segment, size) {
        var dateElements, image_id, segmentMatch;
        if (size === 'master') {
            return this.removeProtocol(segment);
        }
        segmentMatch = segment.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);
        if (segmentMatch == null) {
            return null;
        }
        image_id = segmentMatch[0];
        dateElements = segment.split(image_id);
        return this._removeProtocol(dateElements[0] + "_" + size + image_id);
    }
    ;

    /*
      Remove the http/https from an image URL
   */

    ImagePreloader.prototype._removeProtocol = function(segment) {
        return segment.replace(/http(s)?:/, '');
    }
    ;

    /*
      Cache the image as a JS Object to load it into memory
   */

    ImagePreloader.prototype._loadImage = function(path) {
        return (new Image).src = path;
    }
    ;

    return ImagePreloader;

})();

window.ProductDetails = (function() {
    function ProductDetails(instance) {
        var $productJSON, $productSettings;
        this.el = instance.el;
        this.$el = $(this.el);
        this.$productForm = $("[data-product-form]", this.$el);
        this.formID = this.$productForm.attr("data-product-form");
        this.processing = false;
        this.$productSlideshowNavigation = $(".product-slideshow-navigation");
        this.productForm = "product-form-" + this.formID;
        this.$productThumbnails = $(".product-thumbnails", this.$el);
        this.$productImage = $(".product-big-image", this.$el);
        this.$addToCartButton = $(".add-to-cart input", this.$el);
        this.$priceArea = $(".product-price", this.$el);
        this.$productMessage = $("[data-product-message]", this.$el);
        $productJSON = $("[data-product-json-" + this.formID + "]", this.$el);
        $productSettings = $("[data-product-settings-" + this.formID + "]", this.$el);
        if (!$productJSON.length) {
            return;
        }
        this.productJSON = JSON.parse($productJSON.text());
        this.productSettings = JSON.parse($productSettings.text());
        this.$variantDropdowns = $("[data-option-select=" + this.formID + "]", this.$el);
        this.options = this.productJSON.options;
        this.variants = this.productJSON.variants;
        if (this.productSettings.imageZoom) {
            this.zoomView = new ZoomView({
                el: this.$productImage
            });
        }
        if (Theme.currencySwitcher) {
            this.switchCurrency();
        }
        if (this.$variantDropdowns.length) {
            this.setupVariants();
        }
        this.cacheImages();
        Shopify.onError = (function(_this) {
            return function(XMLHttpRequest) {
                return _this.handleErrors(XMLHttpRequest);
            }
                ;
        })(this);
        this._bindEvents();
    }

    ProductDetails.prototype.prepareRemove = function() {
        var ref, ref1, ref2;
        this._unbindEvents();
        this.$productSlideshowNavigation.off("mouseout.productSlideshow");
        if ((ref = this.variantHelpers) != null) {
            ref.prepareRemove();
        }
        if ((ref1 = this.zoomView) != null) {
            ref1.prepareRemove();
        }
        return (ref2 = this.zoomView) != null ? ref2.remove() : void 0;
    }
    ;

    ProductDetails.prototype.setupVariants = function() {
        var dropdownSettings;
        dropdownSettings = {
            $addToCartButton: this.$addToCartButton,
            $priceFields: this.$priceArea,
            $productForm: this.$productForm,
            $productThumbnails: this.$productThumbnails,
            $selector: this.$variantDropdowns,
            formID: this.formID,
            productSettings: this.productSettings,
            productJSON: this.productJSON,
            type: 'select'
        };
        return this.variantHelpers = new VariantHelper(dropdownSettings);
    }
    ;

    ProductDetails.prototype.switchCurrency = function() {
        return $(document.body).trigger("reset-currency");
    }
    ;

    ProductDetails.prototype.cacheImages = function() {
        if (this.productJSON.images.length) {
            new ImagePreloader(this.productJSON.images,'2048x2048');
            return new ImagePreloader(this.productJSON.images,'600x600');
        }
    }
    ;

    ProductDetails.prototype.updateProductImage = function(e, index) {
        var $target, newSrc;
        if (e) {
            e.preventDefault();
        }
        this.$el.find(".product-slideshow-pagination-item.active").removeClass("active");
        $target = e ? $(e.currentTarget) : this.$el.find(".product-thumbnails .product-slideshow-pagination-item").eq(index);
        newSrc = $target.data("default-res");
        $target.addClass("active");
        this.$el.find("[data-product-main-image]").removeAttr("width height").removeClass("product-no-images").attr({
            src: newSrc,
            srcset: newSrc,
            alt: $target.data("alt"),
            "data-high-res": $target.data("high-res")
        });
        if (this.productSettings.imageZoom) {
            return setTimeout((function(_this) {
                return function() {
                    return _this.$productImage.trigger("prepare-zoom");
                }
                    ;
            })(this), 200);
        }
    }
    ;

    ProductDetails.prototype.addToCart = function(e) {
        var quantity;
        e.preventDefault();
        if (this.processing) {
            return;
        }
        this.processing = true;
        if (Modernizr.cssanimations) {
            this.$el.find(".add-to-cart").addClass("loading");
        } else {
            this.$addToCartButton.val(this.productSettings.processingText);
        }
        quantity = this.$el.find("input[name='quantity']").val();
        if (quantity === "" || quantity === "0") {
            return setTimeout((function(_this) {
                return function() {
                    _this.$el.find("input[name='quantity']").addClass("error");
                    _this.$productMessage.text(_this.productSettings.setQuantityText);
                    _this.$el.find(".add-to-cart").removeClass("loading added-success").addClass("added-error");
                    return _this.processing = false;
                }
                    ;
            })(this), 500);
        } else {
            return Shopify.addItemFromForm(this.productForm, (function(_this) {
                return function(cartItem) {
                    return setTimeout(function() {
                        var successMessage;
                        Shopify.getCart(function(cart) {
                            return $(".cart-link .cart-count").text(cart.item_count);
                        });
                        successMessage = _this.productSettings.successMessage.replace('** product **', "<em>" + cartItem.title + "</em>");
                        _this.$productMessage.html(successMessage);
                        _this.$el.find("input[name='quantity']").removeClass("error");
                        _this.$el.find(".add-to-cart").removeClass("loading added-error").addClass("added-success");
                        $(".header-cart-count").addClass("active");
                        if (!Modernizr.cssanimations) {
                            _this.$addToCartButton.val(Theme.addToCartText);
                        }
                        return _this.processing = false;
                    }, 1000);
                }
                    ;
            })(this));
        }
    }
    ;

    ProductDetails.prototype.handleErrors = function(errors) {
        var errorDescription, errorMessage, productTitle, ref;
        errorMessage = $.parseJSON(errors.responseText);
        productTitle = this.productJSON.title;
        errorDescription = errorMessage.description;
        if (((ref = errorMessage.description) != null ? ref.indexOf(productTitle) : void 0) > -1) {
            errorDescription = errorDescription.replace(productTitle, "<em>" + productTitle + "</em>");
        }
        if (errorMessage.message === "Cart Error") {
            return setTimeout((function(_this) {
                return function() {
                    _this.$el.find("input[name='quantity']").removeClass("error");
                    _this.$productMessage.html(errorDescription);
                    _this.$el.find(".add-to-cart").removeClass("loading added-success").addClass("added-error");
                    if (!Modernizr.cssanimations) {
                        _this.$addToCartButton.val(_this.productSettings.addToCartText);
                    }
                    return _this.processing = false;
                }
                    ;
            })(this), 1000);
        }
    }
    ;

    ProductDetails.prototype.tabs = function(e) {
        var body_target, target;
        target = $(e.currentTarget).attr("data-tab");
        body_target = $(e.currentTarget).parents(".product-tabs").find("#" + target);
        $(e.currentTarget).addClass("active").siblings().removeClass("active");
        return body_target.addClass("active").siblings().removeClass("active");
    }
    ;

    ProductDetails.prototype.navigate = function(e) {
        var index, target, total;
        if (e) {
            e.preventDefault();
        }
        total = this.$el.find(".product-slideshow-pagination-item").size() - 1;
        index = this.$el.find(".product-slideshow-pagination-item.active").index();
        if ($(e.currentTarget).hasClass("product-slideshow-next")) {
            if (index === total) {
                target = 0;
            } else {
                target = this.$el.find(".product-slideshow-pagination-item.active").next().index();
            }
        } else {
            if (index === 0) {
                target = total;
            } else {
                target = this.$el.find(".product-slideshow-pagination-item.active").prev().index();
            }
        }
        return this.updateProductImage(false, target);
    }
    ;

    ProductDetails.prototype.amount = function(e) {
        var input, result;
        input = $(e.currentTarget).parents(".number-input-wrapper").find('input');
        result = parseFloat(input.val());
        if ($(e.currentTarget).hasClass("icon-plus")) {
            return input.val(result + 1);
        } else {
            if (result > 0) {
                return input.val(result - 1);
            }
        }
    }
    ;

    ProductDetails.prototype._bindEvents = function() {
        this.$el.on('click', '.product-slideshow-pagination-item', (function(_this) {
            return function(event) {
                return _this.updateProductImage(event);
            }
                ;
        })(this)).on('submit', '.product-form', (function(_this) {
            return function(event) {
                return _this.addToCart(event);
            }
                ;
        })(this)).on('click', '.product-tabs-header-item', (function(_this) {
            return function(event) {
                return _this.tabs(event);
            }
                ;
        })(this)).on('click', '.product-slideshow-navigation', (function(_this) {
            return function(event) {
                return _this.navigate(event);
            }
                ;
        })(this)).on('click', '.number-input-nav-item', (function(_this) {
            return function(event) {
                return _this.amount(event);
            }
                ;
        })(this));
        return this.$productSlideshowNavigation.on("mouseout.productSlideshow", (function(_this) {
            return function(event) {
                return $(event.currentTarget).blur();
            }
                ;
        })(this));
    }
    ;

    ProductDetails.prototype._unbindEvents = function() {
        this.$el.on('click', '.product-slideshow-pagination-item').on('submit', '.product-form').on('click', '.product-tabs-header-item').on('click', '.product-slideshow-navigation').on('click', '.number-input-nav-item');
        return this.$productSlideshowNavigation.off("mouseout.productSlideshow");
    }
    ;

    return ProductDetails;

})();

window.ThemeView = (function(superClass) {
    extend(ThemeView, superClass);

    function ThemeView() {
        return ThemeView.__super__.constructor.apply(this, arguments);
    }

    ThemeView.prototype.el = document.body;

    ThemeView.prototype.initialize = function() {
        var body, ref;
        body = $(document.body);
        this.isHome = body.hasClass('template-index');
        this.isCollection = body.hasClass('template-collection');
        this.isListCollections = body.hasClass('template-list-collections');
        this.isProduct = body.hasClass('template-product');
        this.isCart = body.hasClass('template-cart');
        this.isPage = body.hasClass('template-page');
        this.isPassword = body.hasClass('template-password');
        this.isBlog = body.hasClass('template-blog') || body.hasClass('template-article');
        this.isAccount = ((ref = body.attr('class')) != null ? ref.indexOf('-customers-') : void 0) > 0;
        this.isGiftCardPage = body.hasClass("gift-card-template");
        this.rteViews = [];
        return rimg.shopify.init();
    }
    ;

    ThemeView.prototype.render = function() {
        this._initSections();
        this._templateViews();
        this._richText();
        window.ThemeUtils.externalLinks(this.$el);
        if ($('html').hasClass('lt-ie10')) {
            this.inputPlaceholderFix();
        }
        if (Theme.currencySwitcher) {
            this.currencyView = new CurrencyView({
                el: this.$el
            });
        }
        if (this.$('select').length && !this.isProduct) {
            return this.$('select').each((function(_this) {
                return function(i, item) {
                    return new SelectView({
                        el: $(item)
                    });
                }
                    ;
            })(this));
        }
    }
    ;

    ThemeView.prototype.inputPlaceholderFix = function() {
        var input, j, len, placeholders, text;
        placeholders = $('[placeholder]');
        for (j = 0,
                 len = placeholders.length; j < len; j++) {
            input = placeholders[j];
            input = $(input);
            if (!(input.val().length > 0)) {
                text = input.attr('placeholder');
                input.attr('value', text);
                input.data('original-text', text);
            }
        }
        placeholders.focus(function() {
            input = $(this);
            if (input.val() === input.data('original-text')) {
                return input.val('');
            }
        });
        return placeholders.blur(function() {
            input = $(this);
            if (input.val().length === 0) {
                return input.val(input.data('original-text'));
            }
        });
    }
    ;

    ThemeView.prototype._templateViews = function() {
        if (this.isHome) {
            this.homeView = new HomeView({
                el: this.$el
            });
            this.homeView.render();
        }
        if (this.isGiftCardPage) {
            this.giftcardView = new GiftCardView({
                el: this.$el
            });
        }
        if (this.isCollection) {
            this.collectionView = new CollectionView({
                el: this.$el
            });
            this.collectionView.render();
        }
        if (this.isListCollections) {
            this.listCollectionsView = new ListCollectionsView({
                el: $('.collections-list')
            });
            this.listCollectionsView.render();
        }
        if (this.isCart) {
            new CartView({
                el: this.$el
            });
        }
        if (this.isBlog) {
            this.blogView = new BlogView({
                el: this.$el
            });
            this.blogView.render();
        }
        if (this.isAccount) {
            this.accountView = new AccountView({
                el: this.$el
            });
            this.accountView.render();
        }
        if (this.isPage) {
            new PageView({
                el: this.$el
            });
        }
        if (this.isPassword) {
            return this.passwordView = new PasswordView({
                el: this.$el
            });
        }
    }
    ;

    ThemeView.prototype._initSections = function() {
        $(document).on('shopify:section:load', (function(_this) {
            return function(event) {
                window.ThemeUtils.externalLinks($(event.target));
                return _this._richText();
            }
                ;
        })(this));
        $(document).on('shopify:section:unload', (function(_this) {
            return function() {
                var j, len, ref, results1, rte;
                ref = _this.rteViews;
                results1 = [];
                for (j = 0,
                         len = ref.length; j < len; j++) {
                    rte = ref[j];
                    results1.push(rte.undelegateEvents());
                }
                return results1;
            }
                ;
        })(this));
        this.sections = new ThemeEditor();
        this.sections.register('social-feeds', this._socialFeeds(this.sections));
        this.sections.register('header', this._header(this.sections));
        this.sections.register('pxs-announcement-bar', this._announcementBar(this.sections));
        this.sections.register('template-product', this._productDetails(this.sections));
        return this.sections.register('home-featured-product', this._productDetails(this.sections));
    }
    ;

    ThemeView.prototype._richText = function() {
        var j, len, ref, results1, rte;
        if (this.isPassword) {
            return;
        }
        ref = $('.rte');
        results1 = [];
        for (j = 0,
                 len = ref.length; j < len; j++) {
            rte = ref[j];
            results1.push(this.rteViews.push(new RTEView({
                el: rte
            })));
        }
        return results1;
    }
    ;

    ThemeView.prototype._socialFeeds = function(sections) {
        return {
            instances: {},
            init: function(instance) {
                return this.instances[instance.sectionId] = new WidgetsView({
                    el: instance.$container
                });
            },
            onSectionLoad: function(event) {
                var instance;
                instance = sections.getInstance(event);
                if (this.instances[instance.sectionId] == null) {
                    return this.init(instance);
                }
            },
            onSectionDeselect: function(event) {
                var instance, ref;
                instance = sections.getInstance(event);
                return (ref = this.instances[instance.sectionId]) != null ? ref.update(instance.$container) : void 0;
            },
            onSectionUnload: function(event) {
                var instance, ref;
                instance = sections.getInstance(event);
                if ((ref = this.instances[instance.sectionId]) != null) {
                    ref.remove();
                }
                return delete this.instances[instance.sectionId];
            }
        };
    }
    ;

    ThemeView.prototype._header = function(sections) {
        return {
            instances: {},
            init: function(instance) {
                return this.instances[instance.sectionId] = new HeaderView(instance);
            },
            onSectionLoad: function(event) {
                var instance;
                instance = sections.getInstance(event);
                if (!this.instances[instance.sectionId]) {
                    return this.init(instance);
                }
            },
            onSectionUnload: function(event) {
                var instance, ref;
                instance = sections.getInstance(event);
                if ((ref = this.instances[instance.sectionId]) != null) {
                    ref.unBindEvents();
                }
                return delete this.instances[instance.sectionId];
            }
        };
    }
    ;

    ThemeView.prototype._announcementBar = function(sections) {
        return {
            instances: {},
            init: function(instance) {
                return this.instances[instance.sectionId] = new AnnouncementBar(instance);
            },
            onSectionLoad: function(event) {
                var instance;
                instance = sections.getInstance(event);
                if (!this.instances[instance.sectionId]) {
                    return this.init(instance);
                }
            },
            onSectionUnload: function(event) {
                var instance, ref;
                instance = sections.getInstance(event);
                if ((ref = this.instances[instance.sectionId]) != null) {
                    ref.onSectionUnload();
                }
                return delete this.instances[instance.sectionId];
            }
        };
    }
    ;

    ThemeView.prototype._productDetails = function(sections) {
        return {
            instances: {},
            init: function(instance) {
                return this.instances[instance.sectionId] = new ProductDetails(instance);
            },
            onSectionLoad: function(event) {
                var instance;
                instance = sections.getInstance(event);
                if (!this.instances[instance.sectionId]) {
                    return this.init(instance);
                }
            },
            onSectionUnload: function(event) {
                var instance, ref;
                instance = sections.getInstance(event);
                if ((ref = this.instances[instance.sectionId]) != null) {
                    ref.prepareRemove();
                }
                return delete this.instances[instance.sectionId];
            }
        };
    }
    ;

    return ThemeView;

})(Backbone.View);

$(function() {
    return window.theme = new ThemeView().render();
});
