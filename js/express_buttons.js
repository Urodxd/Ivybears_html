!function() {
    var e = function(e) {
        var t = {
            exports: {}
        };
        return e.call(t.exports, t, t.exports),
            t.exports
    }
        , t = function(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
        , n = function(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
        , r = function(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
        , i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                    r.configurable = !0,
                "value"in r && (r.writable = !0),
                    Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
                t
        }
    }()
        , o = Object.assign || function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
        , a = function(e) {
        return e && e.__esModule ? e : {
            "default": e
        }
    }
        , s = function e(t, n, r) {
        null === t && (t = Function.prototype);
        var i = Object.getOwnPropertyDescriptor(t, n);
        if (i === undefined) {
            var o = Object.getPrototypeOf(t);
            return null === o ? undefined : e(o, n, r)
        }
        if ("value"in i)
            return i.value;
        var a = i.get;
        return a === undefined ? undefined : a.call(r)
    }
        , u = function() {
        function e(e, t) {
            var n = []
                , r = !0
                , i = !1
                , o = undefined;
            try {
                for (var a, s = e[Symbol.iterator](); !(r = (a = s.next()).done) && (n.push(a.value),
                !t || n.length !== t); r = !0)
                    ;
            } catch (e) {
                i = !0,
                    o = e
            } finally {
                try {
                    !r && s["return"] && s["return"]()
                } finally {
                    if (i)
                        throw o
                }
            }
            return n
        }
        return function(t, n) {
            if (Array.isArray(t))
                return t;
            if (Symbol.iterator in Object(t))
                return e(t, n);
            throw new TypeError("Invalid attempt to destructure non-iterable instance")
        }
    }()
        , c = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
        , l = function(e, t) {
        var n = {};
        for (var r in e)
            t.indexOf(r) >= 0 || Object.prototype.hasOwnProperty.call(e, r) && (n[r] = e[r]);
        return n
    };
    (function() {
            this.ScriptLoader = function() {
                function e() {}
                return e.lazyLoad = function(e, t, n) {
                    var r;
                    if (null != (r = document.querySelector("." + t)))
                        return "function" == typeof n ? n() : void 0;
                    r = document.createElement("script"),
                        r.async = !0,
                        r.defer = !0,
                        r.onload = n,
                        r.src = e,
                        r.className = t,
                        document.getElementsByTagName("head")[0].appendChild(r)
                }
                    ,
                    e
            }()
        }
    ).call(this),
        function() {
            var e;
            this.AmazonPayments = {
                metadataTag: function() {
                    return document.getElementById("amazon-payments-metadata")
                },
                metadata: function(e) {
                    return AmazonPayments.metadataTag().getAttribute("data-amazon-payments-" + e)
                },
                withinFlow: function() {
                    return null != AmazonPayments.metadataTag()
                },
                sellerId: function() {
                    return AmazonPayments.metadata("seller-id")
                },
                language: function() {
                    return AmazonPayments.metadata("language")
                },
                authorize: function() {
                    var e, t;
                    return e = AmazonPayments.metadata("callback-url"),
                        t = {
                            popup: !1,
                            scope: "payments:widget payments:shipping_address"
                        },
                        amazon.Login.authorize(t, e)
                }
            },
                e = function() {
                    function e() {
                        window.addEventListener("pageshow", this.cleanup)
                    }
                    return e.prototype.assign = function(e) {
                        return this.flow = this[e]
                    }
                        ,
                        e.prototype.execute = function(e) {
                            return this.flow.call(this, e)
                        }
                        ,
                        e.prototype.checkout = function() {
                            return AmazonPayments.authorize()
                        }
                        ,
                        e.prototype.cart = function(e) {
                            var t;
                            return t = document.createElement("input"),
                                t.type = "hidden",
                                t.name = "goto_amazon_payments",
                                t.value = "amazon_payments",
                                e.parentElement.appendChild(t),
                                t.form.submit()
                        }
                        ,
                        e.prototype.cleanup = function() {
                            var e;
                            if (e = document.getElementsByName("goto_amazon_payments"),
                            e.length > 0)
                                return e.parentNode.removeChild(e)
                        }
                        ,
                        e
                }(),
                this.amazonPaymentsButtonHandler = new e,
                this.AmazonPaymentsPayButton = function() {
                    var e, t;
                    if (AmazonPayments.withinFlow())
                        return t = AmazonPayments.metadata("widget-library-url"),
                            e = "amazon-payments-widget-library",
                            ScriptLoader.lazyLoad(t, e, onAmazonPaymentsReady)
                }
                ,
                this.AmazonPaymentsPayButtonReady = function(e) {
                    var t, n, r, i, o, a;
                    for (null == e && (e = document),
                             r = e.getElementsByClassName("amazon-payments-pay-button"),
                             a = [],
                             i = 0,
                             o = r.length; i < o; i++)
                        n = r[i],
                        "true" !== n.getAttribute("data-amazon-payments-pay-button") && (OffAmazonPayments.Button(n.id, AmazonPayments.sellerId(), {
                            type: "PwA",
                            size: "small",
                            language: AmazonPayments.language(),
                            authorization: function() {
                                return amazonPaymentsButtonHandler.execute(n)
                            },
                            onError: function(e) {
                                return "undefined" != typeof console && null !== console ? console.error(e.getErrorCode() + ": " + e.getErrorMessage()) : void 0
                            }
                        }),
                            n.setAttribute("data-amazon-payments-pay-button", "true"),
                            t = n.querySelector("img:not(.alt-payment-list__item__logo):not(.additional-checkout-button__logo)"),
                            t.className += " alt-payment-list-amazon-button-image",
                            a.push(t.setAttribute("aria-hidden", "true")));
                    return a
                }
        }
            .call(this);
    var h = (e(function() {
        "use strict";
        window.amazonPaymentsButtonHandler.assign("cart"),
            window.onAmazonLoginReady = function() {
                amazon.Login.setSandboxMode(JSON.parse(AmazonPayments.metadata("sandbox-mode"))),
                    amazon.Login.setClientId(AmazonPayments.metadata("client-id")),
                    amazon.Login.setRegion(AmazonPayments.metadata("region")),
                    amazon.Login.setUseCookie(!0)
            }
            ,
            window.onAmazonPaymentsReady = function() {
                AmazonPaymentsPayButtonReady()
            }
    }),
        e(function(e, t) {
            "use strict";
            function n(e) {
                var t = document.createElement("input");
                t.setAttribute("type", "hidden"),
                    t.setAttribute("name", "clear_cart"),
                    t.setAttribute("value", "true"),
                    e.appendChild(t);
                var n = e.elements.quantity
                    , r = e.elements.id
                    , i = document.createElement("input");
                i.setAttribute("type", "hidden"),
                    i.setAttribute("name", "updates[" + r.value + "]"),
                    i.setAttribute("value", n ? n.value : 1),
                    e.appendChild(i),
                    e.setAttribute("action", "/checkout"),
                    window.ShopifyAnalytics.lib.track("Buy Now Button"),
                    e.submit()
            }
            function r() {
                var e = document.getElementById("buy-now-button--checkout");
                if (e) {
                    for (var t = void 0, r = document.forms, i = 0; i < r.length; i++)
                        if (document.forms[i].action && -1 !== r[i].action.indexOf("cart/add")) {
                            t = r[i];
                            break
                        }
                    t && t.elements.id && (e.style.display = "inline-block",
                            e.onclick = function(e) {
                                e.preventDefault ? e.preventDefault() : e.returnValue = !1,
                                    e.preventDefault(),
                                    n(t)
                            }
                    )
                }
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            }),
                t["default"] = r,
                window.Shopify = window.Shopify || {},
                Shopify.StorefrontExpressButtons = Shopify.StorefrontExpressButtons || {},
                Shopify.StorefrontExpressButtons.ExpressCheckout = {
                    initialize: r
                }
        }),
        e(function(e, t) {
            "use strict";
            function n(e) {
                var t = document.querySelector('meta[name="' + r + "-" + e + '"]');
                return t ? t.getAttribute("content") : null
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var r = "shopify-checkout"
                , i = {
                getApiToken: function() {
                    return n("api-token")
                },
                getAuthorizationToken: function() {
                    return n("authorization-token")
                }
            };
            t["default"] = i
        }))
        , f = (e(function() {
        "use strict";
        !function() {
            function e(e) {
                this.message = e
            }
            var t = window
                , n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            e.prototype = new Error,
                e.prototype.name = "InvalidCharacterError",
            t.btoa || (t.btoa = function(t) {
                    for (var r, i, o = String(t), a = 0, s = n, u = ""; o.charAt(0 | a) || (s = "=",
                    a % 1); u += s.charAt(63 & r >> 8 - a % 1 * 8)) {
                        if ((i = o.charCodeAt(a += .75)) > 255)
                            throw new e("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
                        r = r << 8 | i
                    }
                    return u
                }
            ),
            t.atob || (t.atob = function(t) {
                    var r = String(t).replace(/[=]+$/, "");
                    if (r.length % 4 == 1)
                        throw new e("'atob' failed: The string to be decoded is not correctly encoded.");
                    for (var i, o, a = 0, s = 0, u = ""; o = r.charAt(s++); ~o && (i = a % 4 ? 64 * i + o : o,
                    a++ % 4) ? u += String.fromCharCode(255 & i >> (-2 * a & 6)) : 0)
                        o = n.indexOf(o);
                    return u
                }
            )
        }()
    }),
        e(function(e, i) {
            "use strict";
            Object.defineProperty(i, "__esModule", {
                value: !0
            });
            var o = function(e) {
                function i(e) {
                    r(this, i);
                    var t = n(this, (i.__proto__ || Object.getPrototypeOf(i)).call(this));
                    return t.response = e,
                        t.stack = (new Error).stack,
                        t.name = t.constructor.name,
                        t
                }
                return t(i, e),
                    i
            }(Error);
            i["default"] = o
        }))
        , d = e(function(e, i) {
        "use strict";
        Object.defineProperty(i, "__esModule", {
            value: !0
        });
        i.TimeoutPromiseError = function(e) {
            function i() {
                var e, t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
                r(this, i);
                for (var o = arguments.length, a = Array(o > 1 ? o - 1 : 0), s = 1; s < o; s++)
                    a[s - 1] = arguments[s];
                var u = n(this, (e = i.__proto__ || Object.getPrototypeOf(i)).call.apply(e, [this, t].concat(a)));
                return u.stack = (new Error).stack,
                    u.name = "TimeoutPromiseError",
                    u
            }
            return t(i, e),
                i
        }(Error)
    })
        , p = e(function(e, t) {
        "use strict";
        function n(e, t) {
            f.matches = f.matches || f.webkitMatchesSelector || f.msMatchesSelector || f.mozMatchesSelector;
            for (var n = e; n && n !== document.body; )
                if (n = n.parentElement,
                    n.matches(t))
                    return n;
            return null
        }
        function r(e) {
            for (var t = e; !(t.parentNode instanceof Document || t.parentNode instanceof DocumentFragment); )
                t = t.parentNode;
            return t
        }
        function i() {
            for (var e = [], t = l(), n = t.length - 1; n >= 0; n--)
                e.push(h(t[n]));
            return e.join("")
        }
        function o(e) {
            return e ? e.dataset ? e.dataset : [].slice.call(e.attributes).reduce(function(e, t) {
                return /^data-/.test(t.name) && (e[t.name.substr(5)] = t.value),
                    e
            }, {}) : null
        }
        function a(e, t) {
            var n = new Promise(function(e, n) {
                    return setTimeout(n, t, new d.TimeoutPromiseError("Promise exceeded " + t + "ms timeout"))
                }
            );
            return Promise.race([e, n])
        }
        function s(e) {
            window.location.assign(e)
        }
        function u(e, t) {
            var n = void 0;
            return function() {
                for (var r = this, i = arguments.length, o = Array(i), a = 0; a < i; a++)
                    o[a] = arguments[a];
                clearTimeout(n),
                    n = setTimeout(function() {
                        n = null,
                            e.apply(r, o)
                    }, t)
            }
        }
        function c(e) {
            var t = document.getElementById(e);
            if (!t)
                return Promise.reject(new Error("Missing capabilities"));
            var n = JSON.parse(t.textContent);
            return Promise.resolve(n)
        }
        function l() {
            var e = window.crypto || window.msCrypto;
            if (e && e.getRandomValues) {
                var t = new Uint8Array(16);
                return e.getRandomValues(t),
                    t
            }
            for (var n, r = new Array(16), i = 0; i < 16; i++)
                0 == (3 & i) && (n = 4294967296 * Math.random()),
                    r[i] = n >>> ((3 & i) << 3) & 255;
            return r
        }
        function h(e) {
            return (e + 256).toString(16).substr(1)
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
            t.getClosest = n,
            t.getDocumentContext = r,
            t.generateRandomId = i,
            t.dataset = o,
            t.timeoutPromise = a,
            t.redirect = s,
            t.debounce = u,
            t.getCapabilities = c;
        var f = Element.prototype
    });
    !function(e) {
        "use strict";
        function t(e) {
            if ("string" != typeof e && (e = String(e)),
                /[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(e))
                throw new TypeError("Invalid character in header field name");
            return e.toLowerCase()
        }
        function n(e) {
            return "string" != typeof e && (e = String(e)),
                e
        }
        function r(e) {
            var t = {
                next: function() {
                    var t = e.shift();
                    return {
                        done: t === undefined,
                        value: t
                    }
                }
            };
            return v.iterable && (t[Symbol.iterator] = function() {
                    return t
                }
            ),
                t
        }
        function i(e) {
            this.map = {},
                e instanceof i ? e.forEach(function(e, t) {
                    this.append(t, e)
                }, this) : Array.isArray(e) ? e.forEach(function(e) {
                    this.append(e[0], e[1])
                }, this) : e && Object.getOwnPropertyNames(e).forEach(function(t) {
                    this.append(t, e[t])
                }, this)
        }
        function o(e) {
            if (e.bodyUsed)
                return Promise.reject(new TypeError("Already read"));
            e.bodyUsed = !0
        }
        function a(e) {
            return new Promise(function(t, n) {
                    e.onload = function() {
                        t(e.result)
                    }
                        ,
                        e.onerror = function() {
                            n(e.error)
                        }
                }
            )
        }
        function s(e) {
            var t = new FileReader
                , n = a(t);
            return t.readAsArrayBuffer(e),
                n
        }
        function u(e) {
            var t = new FileReader
                , n = a(t);
            return t.readAsText(e),
                n
        }
        function c(e) {
            for (var t = new Uint8Array(e), n = new Array(t.length), r = 0; r < t.length; r++)
                n[r] = String.fromCharCode(t[r]);
            return n.join("")
        }
        function l(e) {
            if (e.slice)
                return e.slice(0);
            var t = new Uint8Array(e.byteLength);
            return t.set(new Uint8Array(e)),
                t.buffer
        }
        function h() {
            return this.bodyUsed = !1,
                this._initBody = function(e) {
                    if (this._bodyInit = e,
                        e)
                        if ("string" == typeof e)
                            this._bodyText = e;
                        else if (v.blob && Blob.prototype.isPrototypeOf(e))
                            this._bodyBlob = e;
                        else if (v.formData && FormData.prototype.isPrototypeOf(e))
                            this._bodyFormData = e;
                        else if (v.searchParams && URLSearchParams.prototype.isPrototypeOf(e))
                            this._bodyText = e.toString();
                        else if (v.arrayBuffer && v.blob && g(e))
                            this._bodyArrayBuffer = l(e.buffer),
                                this._bodyInit = new Blob([this._bodyArrayBuffer]);
                        else {
                            if (!v.arrayBuffer || !ArrayBuffer.prototype.isPrototypeOf(e) && !_(e))
                                throw new Error("unsupported BodyInit type");
                            this._bodyArrayBuffer = l(e)
                        }
                    else
                        this._bodyText = "";
                    this.headers.get("content-type") || ("string" == typeof e ? this.headers.set("content-type", "text/plain;charset=UTF-8") : this._bodyBlob && this._bodyBlob.type ? this.headers.set("content-type", this._bodyBlob.type) : v.searchParams && URLSearchParams.prototype.isPrototypeOf(e) && this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"))
                }
                ,
            v.blob && (this.blob = function() {
                    var e = o(this);
                    if (e)
                        return e;
                    if (this._bodyBlob)
                        return Promise.resolve(this._bodyBlob);
                    if (this._bodyArrayBuffer)
                        return Promise.resolve(new Blob([this._bodyArrayBuffer]));
                    if (this._bodyFormData)
                        throw new Error("could not read FormData body as blob");
                    return Promise.resolve(new Blob([this._bodyText]))
                }
                    ,
                    this.arrayBuffer = function() {
                        return this._bodyArrayBuffer ? o(this) || Promise.resolve(this._bodyArrayBuffer) : this.blob().then(s)
                    }
            ),
                this.text = function() {
                    var e = o(this);
                    if (e)
                        return e;
                    if (this._bodyBlob)
                        return u(this._bodyBlob);
                    if (this._bodyArrayBuffer)
                        return Promise.resolve(c(this._bodyArrayBuffer));
                    if (this._bodyFormData)
                        throw new Error("could not read FormData body as text");
                    return Promise.resolve(this._bodyText)
                }
                ,
            v.formData && (this.formData = function() {
                    return this.text().then(p)
                }
            ),
                this.json = function() {
                    return this.text().then(JSON.parse)
                }
                ,
                this
        }
        function f(e) {
            var t = e.toUpperCase();
            return k.indexOf(t) > -1 ? t : e
        }
        function d(e, t) {
            t = t || {};
            var n = t.body;
            if (e instanceof d) {
                if (e.bodyUsed)
                    throw new TypeError("Already read");
                this.url = e.url,
                    this.credentials = e.credentials,
                t.headers || (this.headers = new i(e.headers)),
                    this.method = e.method,
                    this.mode = e.mode,
                n || null == e._bodyInit || (n = e._bodyInit,
                    e.bodyUsed = !0)
            } else
                this.url = String(e);
            if (this.credentials = t.credentials || this.credentials || "omit",
            !t.headers && this.headers || (this.headers = new i(t.headers)),
                this.method = f(t.method || this.method || "GET"),
                this.mode = t.mode || this.mode || null,
                this.referrer = null,
            ("GET" === this.method || "HEAD" === this.method) && n)
                throw new TypeError("Body not allowed for GET or HEAD requests");
            this._initBody(n)
        }
        function p(e) {
            var t = new FormData;
            return e.trim().split("&").forEach(function(e) {
                if (e) {
                    var n = e.split("=")
                        , r = n.shift().replace(/\+/g, " ")
                        , i = n.join("=").replace(/\+/g, " ");
                    t.append(decodeURIComponent(r), decodeURIComponent(i))
                }
            }),
                t
        }
        function y(e) {
            var t = new i;
            return e.split(/\r?\n/).forEach(function(e) {
                var n = e.split(":")
                    , r = n.shift().trim();
                if (r) {
                    var i = n.join(":").trim();
                    t.append(r, i)
                }
            }),
                t
        }
        function m(e, t) {
            t || (t = {}),
                this.type = "default",
                this.status = "status"in t ? t.status : 200,
                this.ok = this.status >= 200 && this.status < 300,
                this.statusText = "statusText"in t ? t.statusText : "OK",
                this.headers = new i(t.headers),
                this.url = t.url || "",
                this._initBody(e)
        }
        if (!e.fetch) {
            var v = {
                searchParams: "URLSearchParams"in e,
                iterable: "Symbol"in e && "iterator"in Symbol,
                blob: "FileReader"in e && "Blob"in e && function() {
                    try {
                        return new Blob,
                            !0
                    } catch (e) {
                        return !1
                    }
                }(),
                formData: "FormData"in e,
                arrayBuffer: "ArrayBuffer"in e
            };
            if (v.arrayBuffer)
                var b = ["[object Int8Array]", "[object Uint8Array]", "[object Uint8ClampedArray]", "[object Int16Array]", "[object Uint16Array]", "[object Int32Array]", "[object Uint32Array]", "[object Float32Array]", "[object Float64Array]"]
                    , g = function(e) {
                        return e && DataView.prototype.isPrototypeOf(e)
                    }
                    , _ = ArrayBuffer.isView || function(e) {
                        return e && b.indexOf(Object.prototype.toString.call(e)) > -1
                    }
                ;
            i.prototype.append = function(e, r) {
                e = t(e),
                    r = n(r);
                var i = this.map[e];
                this.map[e] = i ? i + "," + r : r
            }
                ,
                i.prototype["delete"] = function(e) {
                    delete this.map[t(e)]
                }
                ,
                i.prototype.get = function(e) {
                    return e = t(e),
                        this.has(e) ? this.map[e] : null
                }
                ,
                i.prototype.has = function(e) {
                    return this.map.hasOwnProperty(t(e))
                }
                ,
                i.prototype.set = function(e, r) {
                    this.map[t(e)] = n(r)
                }
                ,
                i.prototype.forEach = function(e, t) {
                    for (var n in this.map)
                        this.map.hasOwnProperty(n) && e.call(t, this.map[n], n, this)
                }
                ,
                i.prototype.keys = function() {
                    var e = [];
                    return this.forEach(function(t, n) {
                        e.push(n)
                    }),
                        r(e)
                }
                ,
                i.prototype.values = function() {
                    var e = [];
                    return this.forEach(function(t) {
                        e.push(t)
                    }),
                        r(e)
                }
                ,
                i.prototype.entries = function() {
                    var e = [];
                    return this.forEach(function(t, n) {
                        e.push([n, t])
                    }),
                        r(e)
                }
                ,
            v.iterable && (i.prototype[Symbol.iterator] = i.prototype.entries);
            var k = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];
            d.prototype.clone = function() {
                return new d(this,{
                    body: this._bodyInit
                })
            }
                ,
                h.call(d.prototype),
                h.call(m.prototype),
                m.prototype.clone = function() {
                    return new m(this._bodyInit,{
                        status: this.status,
                        statusText: this.statusText,
                        headers: new i(this.headers),
                        url: this.url
                    })
                }
                ,
                m.error = function() {
                    var e = new m(null,{
                        status: 0,
                        statusText: ""
                    });
                    return e.type = "error",
                        e
                }
            ;
            var w = [301, 302, 303, 307, 308];
            m.redirect = function(e, t) {
                if (-1 === w.indexOf(t))
                    throw new RangeError("Invalid status code");
                return new m(null,{
                    status: t,
                    headers: {
                        location: e
                    }
                })
            }
                ,
                e.Headers = i,
                e.Request = d,
                e.Response = m,
                e.fetch = function(e, t) {
                    return new Promise(function(n, r) {
                            var i = new d(e,t)
                                , o = new XMLHttpRequest;
                            o.onload = function() {
                                var e = {
                                    status: o.status,
                                    statusText: o.statusText,
                                    headers: y(o.getAllResponseHeaders() || "")
                                };
                                e.url = "responseURL"in o ? o.responseURL : e.headers.get("X-Request-URL");
                                var t = "response"in o ? o.response : o.responseText;
                                n(new m(t,e))
                            }
                                ,
                                o.onerror = function() {
                                    r(new TypeError("Network request failed"))
                                }
                                ,
                                o.ontimeout = function() {
                                    r(new TypeError("Network request failed"))
                                }
                                ,
                                o.open(i.method, i.url, !0),
                            "include" === i.credentials && (o.withCredentials = !0),
                            "responseType"in o && v.blob && (o.responseType = "blob"),
                                i.headers.forEach(function(e, t) {
                                    o.setRequestHeader(t, e)
                                }),
                                o.send("undefined" == typeof i._bodyInit ? null : i._bodyInit)
                        }
                    )
                }
                ,
                e.fetch.polyfill = !0
        }
    }("undefined" != typeof self ? self : this);
    var y = e(function(e, t) {
        "use strict";
        function n(e) {
            return e.status >= 200 && e.status < 300 ? e : Promise.reject(new s["default"](e))
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var s = a(f)
            , u = function() {
            function e(t) {
                var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                r(this, e),
                    this.host = t,
                    this.headers = o({
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    }, n)
            }
            return i(e, [{
                key: "get",
                value: function(e, t) {
                    return this.request("GET", e, null, t)
                }
            }, {
                key: "post",
                value: function(e, t, n) {
                    return this.request("POST", e, t, n)
                }
            }, {
                key: "patch",
                value: function(e, t, n) {
                    return this.request("PATCH", e, t, n)
                }
            }, {
                key: "put",
                value: function(e, t, n) {
                    return this.request("PUT", e, t, n)
                }
            }, {
                key: "stopPolling",
                value: function() {
                    this.cancelPolling = !0
                }
            }, {
                key: "request",
                value: function(e, t, r, i) {
                    var o = this
                        , a = {
                        method: e,
                        headers: this.headers,
                        body: r ? JSON.stringify(r) : null,
                        credentials: "same-origin"
                    };
                    return "GET" === e && delete a.body,
                    "/" === t[0] && this.host && (t = "https://" + this.host + t),
                        fetch(t, a).then(function(e) {
                            return o.poll(i, e)
                        }).then(n)
                }
            }, {
                key: "poll",
                value: function(e, t) {
                    var n = this
                        , r = o({
                        poll: !0,
                        timeout: 2e4
                    }, e)
                        , i = r.poll
                        , a = r.timeout;
                    if (this.cancelPolling = !1,
                    !i || 202 !== t.status)
                        return t;
                    var s = {
                        method: "GET",
                        headers: this.headers
                    }
                        , u = new Promise(function(e, r) {
                            (function t(n) {
                                    var i = this;
                                    if (this.cancelPolling)
                                        return void r(new Error("cancelled polling"));
                                    if (202 !== n.status)
                                        return void e(n);
                                    var o = n.headers.get("Location")
                                        , a = 1e3 * (Number(n.headers.get("Retry-After")) || 1);
                                    setTimeout(function() {
                                        fetch(o, s).then(t.bind(i))["catch"](r)
                                    }, a)
                                }
                            ).call(n, t)
                        }
                    );
                    return (0,
                        p.timeoutPromise)(u, a)
                }
            }]),
                e
        }();
        t["default"] = u
    })
        , m = e(function(e, o) {
        "use strict";
        function u(e) {
            var t = e.headers.get(p);
            return e.ok && this.storeAuthorizationToken(t),
                e
        }
        function c(e) {
            return 204 === e.status || 202 === e.status ? e : e.json()
        }
        function l(e) {
            return btoa(e + ":")
        }
        Object.defineProperty(o, "__esModule", {
            value: !0
        });
        var f = a(h)
            , d = a(y)
            , p = "X-Shopify-Checkout-Authorization-Token"
            , m = function(e) {
            function o() {
                var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
                    , t = e.host
                    , i = e.accessToken;
                r(this, o),
                i || (i = f["default"].getApiToken());
                var a = {
                    Authorization: "Basic " + l(i),
                    "X-Shopify-Checkout-Version": "2016-09-06"
                }
                    , s = n(this, (o.__proto__ || Object.getPrototypeOf(o)).call(this, t, a));
                return s.storeAuthorizationToken(f["default"].getAuthorizationToken()),
                    s
            }
            return t(o, e),
                i(o, [{
                    key: "request",
                    value: function(e, t, n, r) {
                        return s(o.prototype.__proto__ || Object.getPrototypeOf(o.prototype), "request", this).call(this, e, t, n, r).then(u.bind(this)).then(c)
                    }
                }, {
                    key: "storeAuthorizationToken",
                    value: function(e) {
                        e && (this.secretKey = e,
                            this.headers[p] = e)
                    }
                }, {
                    key: "getCheckout",
                    value: function(e) {
                        return this.get("/api/checkouts/" + e + ".json")
                    }
                }, {
                    key: "createCheckout",
                    value: function(e) {
                        return e.checkout && null == e.checkout.secret && (e.checkout.secret = !0),
                            this.post("/api/checkouts.json", e)
                    }
                }, {
                    key: "updateCheckout",
                    value: function(e, t) {
                        return this.patch("/api/checkouts/" + e + ".json", t)
                    }
                }, {
                    key: "getShippingRates",
                    value: function(e) {
                        return this.get("/api/checkouts/" + e + "/shipping_rates.json")
                    }
                }, {
                    key: "createPayment",
                    value: function(e, t, n) {
                        return this.post("/api/checkouts/" + e + "/payments.json", {
                            payment: t
                        }, n)
                    }
                }, {
                    key: "createPaymentSession",
                    value: function(e, t) {
                        return fetch(e, {
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(t),
                            mode: "cors",
                            method: "POST"
                        }).then(function(e) {
                            return e.json()
                        })
                    }
                }]),
                o
        }(d["default"]);
        o["default"] = m
    })
        , v = e(function(e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var n = {
            init: function() {
                return Promise.all([this.loadCSS(), this.loadDOM()])
            },
            loadCSS: function() {
                var e = this;
                return new Promise(function(t) {
                        if (document.querySelector('link[href*="sheet/main.css"]'))
                            return t(document.querySelector('link[href*="sheet/main.css"]'));
                        var n = document.createElement("link")
                            , r = document.createElement("img")
                            , i = ShopifyPay.sheetStyleSheetUrl;
                        return n.href = i,
                            n.media = "all",
                            n.rel = "stylesheet",
                            n.type = "text/css",
                            r.src = i,
                            r.style.width = 0,
                            r.style.height = 0,
                            r.onerror = function() {
                                r.parentNode.removeChild(r),
                                    t(n)
                            }
                            ,
                            e.stylesheet = n,
                            document.head.appendChild(n),
                            document.body.appendChild(r)
                    }
                )
            },
            loadDOM: function() {
                var e = this;
                return new Promise(function(t) {
                        if (document.querySelector("#sheet-cleanslate"))
                            return t(document.querySelector("#sheet-cleanslate"));
                        var n = document.createElement("div");
                        return n.setAttribute("style", "display: none !important"),
                            n.setAttribute("tabindex", "-1"),
                            n.setAttribute("aria-hidden", "true"),
                            n.setAttribute("id", "sheet-cleanslate"),
                            n.className = "cleanslate",
                            n.innerHTML = '\n      <div id="sheet-container" class="sheet-container sheet-container--hidden">\n        <div class="sheet-backdrop sheet-backdrop--hidden" id="sheet-backdrop"></div>\n        <div class="sheet" id="sheet">\n          <div class="sheet-content sheet-content--hidden" aria-hidden="true" id="sheet-content"></div>\n          <div class="sheet-spinner-wrapper">\n            <svg id="sheet-spinner" class="sheet-spinner sheet-spinner--hidden icon--double-spinner" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">\n              <path class="icon--double-spinner__outer-circle" d="M0 15c0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15-.552 0-1 .448-1 1s.448 1 1 1c7.18 0 13 5.82 13 13s-5.82 13-13 13S2 22.18 2 15c0-.552-.448-1-1-1s-1 .448-1 1z"></path>\n              <path class="icon--double-spinner__inner-circle" d="M4 15c0 6.075 4.925 11 11 11s11-4.925 11-11S21.075 4 15 4c-.552 0-1 .448-1 1s.448 1 1 1c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9c0-.552-.448-1-1-1s-1 .448-1 1z"></path>\n            </svg>\n          </div>\n        </div>\n      </div>',
                            document.body.appendChild(n),
                            e.dom = n,
                            t(n)
                    }
                )
            },
            unload: function() {
                this.stylesheet && this.stylesheet.remove(),
                this.dom && this.dom.remove()
            }
        };
        t["default"] = n
    })
        , b = e(function(e, t) {
        "use strict";
        function n(e) {
            "click" !== e.type && "Escape" !== e.key || m.hide()
        }
        function r(e) {
            e.target.innerHeight !== m.windowHeight && i(e.target.innerHeight)
        }
        function i(e) {
            var t = m.contentHeight ? m.contentHeight : f;
            y = e,
                m.maxHeight = y * h,
                m.setContentHeight(t),
                m.sheet.style.setProperty("max-height", m.maxHeight + "px", "important")
        }
        function o(e, t) {
            e.classList ? e.classList.add(t) : s(e, t) || e.setAttribute("class", e.getAttribute("class") + " " + t)
        }
        function s(e, t) {
            return e.getAttribute("class").indexOf(t) > -1
        }
        function c(e, t) {
            e.classList ? e.classList.remove(t) : s(e, t) && e.setAttribute("class", e.getAttribute("class").replace(t, " "))
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var l = a(v)
            , h = .95
            , f = 580
            , d = 250
            , y = window.innerHeight
            , m = {
            load: function() {
                var e = this
                    , t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : l["default"];
                return this.loader = t,
                    this.loader.init().then(function(t) {
                        var n = u(t, 2)
                            , i = n[0]
                            , o = n[1];
                        return e.stylesheet = i,
                            e.cleanslate = o,
                            e.sheetContainer = o.querySelector("#sheet-container"),
                            e.backdrop = e.sheetContainer.querySelector("#sheet-backdrop"),
                            e.sheet = e.sheetContainer.querySelector("#sheet"),
                            e.content = e.sheet.querySelector("#sheet-content"),
                            e.spinner = e.sheet.querySelector("#sheet-spinner"),
                            e.handleResize = (0,
                                p.debounce)(r, d),
                            e
                    })
            },
            hasLoaded: function() {
                return "undefined" != typeof this.stylesheet && "undefined" != typeof this.cleanslate
            },
            setContent: function(e) {
                return !!this.hasLoaded() && (this.element && this.content.removeChild(this.element),
                    this.element = e,
                    this.content.appendChild(this.element),
                    !0)
            },
            getSheetNode: function() {
                return !!this.hasLoaded() && this.sheet
            },
            hide: function() {
                return !!this.hasLoaded() && (this.sheetContainer.className.indexOf("sheet-container--hidden") >= 0 || (this.cleanslate.setAttribute("tabindex", "-1"),
                    this.cleanslate.setAttribute("aria-hidden", "true"),
                    this.cleanslate.setAttribute("style", "display: none !important"),
                    this.sheetContainer.classList.add("sheet-container--hidden"),
                    this.backdrop.classList.add("sheet-backdrop--hidden"),
                    document.body.classList.remove("lock-scroll"),
                    this.sheet.blur(),
                    this.backdrop.removeEventListener("click", n),
                    document.removeEventListener("keyup", n),
                    window.removeEventListener("resize", this.handleResize),
                    !0))
            },
            show: function() {
                return !!this.hasLoaded() && (-1 === this.sheetContainer.className.indexOf("sheet-container--hidden") || (this.cleanslate.removeAttribute("style"),
                    this.cleanslate.removeAttribute("tabindex"),
                    this.cleanslate.removeAttribute("aria-hidden"),
                    this.sheetContainer.classList.remove("sheet-container--hidden"),
                    this.backdrop.classList.remove("sheet-backdrop--hidden"),
                    document.body.classList.add("lock-scroll"),
                    this.sheet.focus(),
                    this.sheet.tabIndex = 0,
                    this.sheet.setAttribute("role", "dialog"),
                    i(window.innerHeight),
                    this.backdrop.addEventListener("click", n),
                    document.addEventListener("keyup", n),
                    window.addEventListener("resize", this.handleResize),
                    !0))
            },
            focus: function() {
                return !!this.hasLoaded() && (this.sheet.focus(),
                    !0)
            },
            showContent: function() {
                this.show(),
                    this.content.classList.remove("sheet-content--hidden"),
                    this.content.removeAttribute("aria-hidden"),
                    o(this.spinner, "sheet-spinner--hidden"),
                    this.spinner.setAttribute("aria-hidden", "true")
            },
            showSpinner: function() {
                this.show(),
                    c(this.spinner, "sheet-spinner--hidden"),
                    this.spinner.removeAttribute("aria-hidden"),
                    this.content.classList.add("sheet-content--hidden"),
                    this.content.setAttribute("aria-hidden", "true")
            },
            setContentHeight: function(e) {
                if (!this.hasLoaded())
                    return !1;
                this.contentHeight = e;
                var t = this.contentHeight > this.maxHeight ? this.maxHeight : this.contentHeight;
                return this.sheet.style.setProperty("height", t + "px", "important"),
                    this.content.style.setProperty("height", t + "px", "important"),
                    !0
            },
            unload: function() {
                this.hide(),
                    this.loader.unload(),
                    delete this.stylesheet,
                    delete this.cleanslate,
                    delete this.sheetContainer,
                    delete this.backdrop,
                    delete this.sheet
            }
        };
        t["default"] = m
    })
        , g = e(function(e, t) {
        "use strict";
        function n(e) {
            var t = e.indexOf(l)
                , n = e.substring(0, t)
                , r = e.substring(t + 1);
            return n !== u ? {} : JSON.parse(r)
        }
        function r(e) {
            return [u, l, JSON.stringify(e)].join("")
        }
        function i() {
            var e = s.exec(document.cookie);
            return !!e && unescape(e[2])
        }
        function o() {
            document.cookie = "shopify_pay=;expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        }
        function a() {
            var e;
            "object" === ("undefined" == typeof ShopifyAnalytics ? "undefined" : c(ShopifyAnalytics)) && "object" === c(ShopifyAnalytics.lib) && "function" == typeof ShopifyAnalytics.lib.track && (e = ShopifyAnalytics.lib).track.apply(e, arguments)
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
            t.parseMessage = n,
            t.buildMessage = r,
            t.getCookie = i,
            t.clearCookie = o,
            t.track = a;
        var s = new RegExp("(shopify_pay|remember_me_authentication)=([^;]+)")
            , u = "shopify_pay"
            , l = ":"
    })
        , _ = e(function(e, t) {
        "use strict";
        function n(e, t) {
            var n = $.param({
                access_token: t,
                requires_shipping: e.requires_shipping,
                metadata: {
                    flow: "accelerated_flow_incontext"
                }
            })
                , r = document.createElement("iframe");
            return r.id = "shopify-pay-review-sheet",
                r.src = "https://" + window.ShopifyPay.apiHost + "/customers?" + n,
                r
        }
        function r(e) {
            window.location = e
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
            t.ShopifyPaySheet = undefined;
        var i = a(b)
            , o = 5e3;
        t.ShopifyPaySheet = {
            init: function(e, t) {
                var a = this;
                return this.checkout = e,
                    i["default"].load().then(function(e) {
                        return a.sheet = e,
                            a.iframe ? e.showContent() : (a.iframe = n(a.checkout, t),
                                a.timeout = setTimeout(function() {
                                    (0,
                                        g.track)("accelerated_flow_incontext", {
                                        event: "timeout",
                                        checkoutToken: a.checkout.token
                                    }),
                                        r(a.checkout.web_url)
                                }, o),
                                a.sheet.setContent(a.iframe),
                                a.sheet.showSpinner(),
                                a.sheet.focus(),
                                window.addEventListener("message", function(t) {
                                    return a.handleMessages(t, e)
                                }))
                    })
            },
            handleMessages: function(e, t) {
                var n = (0,
                    g.parseMessage)(e.data);
                if (n !== {})
                    switch (n.action) {
                        case "loaded":
                            clearTimeout(this.timeout);
                            break;
                        case "ready":
                            t.showContent();
                            break;
                        case "completed":
                            r(n.redirectUrl);
                            break;
                        case "closed":
                            (0,
                                g.track)("accelerated_flow_incontext", {
                                event: "dismiss",
                                checkoutToken: this.checkout.token
                            }),
                                t.hide();
                            break;
                        case "error":
                            r(this.checkout.clone_url);
                            break;
                        case "resized":
                            t.setContentHeight(parseInt(n.height, 10));
                            break;
                        case "redirect":
                            (0,
                                g.track)("accelerated_flow_incontext", {
                                event: "redirect",
                                step: n.step
                            }),
                                r(n.clone ? this.checkout.clone_url : this.checkout.web_url + "&step=" + n.step + "&validate=1")
                    }
            }
        }
    })
        , k = e(function(e, t) {
        "use strict";
        function n() {
            return r().then(i).then(function(e) {
                return o(e.checkout, e.accessToken)
            }).then(Promise.resolve())
        }
        function r() {
            var e = document.querySelector('form[action="/cart"]');
            return fetch("/cart.json", {
                method: "POST",
                body: new FormData(e),
                headers: {
                    Accept: "application/json"
                },
                credentials: "same-origin"
            }).then(function(e) {
                return e.json()
            })
        }
        function i(e) {
            var t = ShopifyPay.requestHost
                , n = new s["default"]({
                host: t
            });
            return n.createCheckout({
                checkout: {
                    cart_token: e.token
                }
            }).then(function(e) {
                return Promise.resolve({
                    checkout: e.checkout,
                    accessToken: n.accessToken
                })
            })
        }
        function o(e, t) {
            if ("in_context" !== e.shopify_pay_experiment)
                return void (window.location = e.web_url);
            _.ShopifyPaySheet.init(e, t)
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
            t["default"] = n;
        var s = a(m)
    })
        , w = e(function(e, t) {
        "use strict";
        function n() {
            if (window.ShopifyPay.acceleratedFlowIncontext) {
                var e = document.querySelectorAll(o + "," + s)
                    , t = !0
                    , n = !1
                    , i = undefined;
                try {
                    for (var a, c = e[Symbol.iterator](); !(t = (a = c.next()).done); t = !0) {
                        var l = a.value;
                        -1 === u.indexOf(l) && (u.push(l),
                            l.addEventListener("click", r))
                    }
                } catch (e) {
                    n = !0,
                        i = e
                } finally {
                    try {
                        !t && c["return"] && c["return"]()
                    } finally {
                        if (n)
                            throw i
                    }
                }
            }
        }
        function r(e) {
            e.preventDefault(),
                e.target.removeEventListener("click", r),
                (0,
                    g.track)("accelerated_flow_incontext", {
                    step: "started"
                }),
                setTimeout(function() {
                    e.target.disabled = !0
                }),
                (0,
                    i["default"])().then(function() {
                    return e.target.disabled = !1,
                        e.target.addEventListener("click", r)
                })["catch"](function(t) {
                    (0,
                        g.track)("accelerated_flow_incontext", {
                        step: "failed",
                        error: t
                    }),
                        e.target.disabled = !1,
                        e.target.click()
                })
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
            t["default"] = n;
        var i = a(k)
            , o = '[type="submit"][name="checkout"]'
            , s = 'a[href="/checkout"]'
            , u = []
    })
        , S = e(function(e) {
        var t = e.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();
        "number" == typeof __g && (__g = t)
    })
        , P = e(function(e) {
        var t = {}.hasOwnProperty;
        e.exports = function(e, n) {
            return t.call(e, n)
        }
    })
        , A = e(function(e) {
        e.exports = function(e) {
            try {
                return !!e()
            } catch (e) {
                return !0
            }
        }
    })
        , E = e(function(e) {
        e.exports = !A(function() {
            return 7 != Object.defineProperty({}, "a", {
                get: function() {
                    return 7
                }
            }).a
        })
    })
        , C = e(function(e) {
        var t = e.exports = {
            version: "2.5.1"
        };
        "number" == typeof __e && (__e = t)
    })
        , O = e(function(e) {
        e.exports = function(e) {
            return "object" == typeof e ? null !== e : "function" == typeof e
        }
    })
        , x = e(function(e) {
        e.exports = function(e) {
            if (!O(e))
                throw TypeError(e + " is not an object!");
            return e
        }
    })
        , j = e(function(e) {
        var t = S.document
            , n = O(t) && O(t.createElement);
        e.exports = function(e) {
            return n ? t.createElement(e) : {}
        }
    })
        , T = e(function(e) {
        e.exports = !E && !A(function() {
            return 7 != Object.defineProperty(j("div"), "a", {
                get: function() {
                    return 7
                }
            }).a
        })
    })
        , M = e(function(e) {
        e.exports = function(e, t) {
            if (!O(e))
                return e;
            var n, r;
            if (t && "function" == typeof (n = e.toString) && !O(r = n.call(e)))
                return r;
            if ("function" == typeof (n = e.valueOf) && !O(r = n.call(e)))
                return r;
            if (!t && "function" == typeof (n = e.toString) && !O(r = n.call(e)))
                return r;
            throw TypeError("Can't convert object to primitive value")
        }
    })
        , I = e(function(e, t) {
        var n = Object.defineProperty;
        t.f = E ? Object.defineProperty : function(e, t, r) {
            if (x(e),
                t = M(t, !0),
                x(r),
                T)
                try {
                    return n(e, t, r)
                } catch (e) {}
            if ("get"in r || "set"in r)
                throw TypeError("Accessors not supported!");
            return "value"in r && (e[t] = r.value),
                e
        }
    })
        , L = e(function(e) {
        e.exports = function(e, t) {
            return {
                enumerable: !(1 & e),
                configurable: !(2 & e),
                writable: !(4 & e),
                value: t
            }
        }
    })
        , R = e(function(e) {
        e.exports = E ? function(e, t, n) {
                return I.f(e, t, L(1, n))
            }
            : function(e, t, n) {
                return e[t] = n,
                    e
            }
    })
        , z = e(function(e) {
        var t = 0
            , n = Math.random();
        e.exports = function(e) {
            return "Symbol(".concat(e === undefined ? "" : e, ")_", (++t + n).toString(36))
        }
    })
        , F = e(function(e) {
        var t = z("src")
            , n = "toString"
            , r = Function[n]
            , i = ("" + r).split(n);
        C.inspectSource = function(e) {
            return r.call(e)
        }
            ,
            (e.exports = function(e, n, r, o) {
                    var a = "function" == typeof r;
                    a && (P(r, "name") || R(r, "name", n)),
                    e[n] !== r && (a && (P(r, t) || R(r, t, e[n] ? "" + e[n] : i.join(String(n)))),
                        e === S ? e[n] = r : o ? e[n] ? e[n] = r : R(e, n, r) : (delete e[n],
                            R(e, n, r)))
                }
            )(Function.prototype, n, function() {
                return "function" == typeof this && this[t] || r.call(this)
            })
    })
        , N = e(function(e) {
        e.exports = function(e) {
            if ("function" != typeof e)
                throw TypeError(e + " is not a function!");
            return e
        }
    })
        , D = e(function(e) {
        e.exports = function(e, t, n) {
            if (N(e),
            t === undefined)
                return e;
            switch (n) {
                case 1:
                    return function(n) {
                        return e.call(t, n)
                    }
                        ;
                case 2:
                    return function(n, r) {
                        return e.call(t, n, r)
                    }
                        ;
                case 3:
                    return function(n, r, i) {
                        return e.call(t, n, r, i)
                    }
            }
            return function() {
                return e.apply(t, arguments)
            }
        }
    })
        , B = e(function(e) {
        var t = "prototype"
            , n = function(e, r, i) {
            var o, a, s, u, c = e & n.F, l = e & n.G, h = e & n.S, f = e & n.P, d = e & n.B, p = l ? S : h ? S[r] || (S[r] = {}) : (S[r] || {})[t], y = l ? C : C[r] || (C[r] = {}), m = y[t] || (y[t] = {});
            l && (i = r);
            for (o in i)
                a = !c && p && p[o] !== undefined,
                    s = (a ? p : i)[o],
                    u = d && a ? D(s, S) : f && "function" == typeof s ? D(Function.call, s) : s,
                p && F(p, o, s, e & n.U),
                y[o] != s && R(y, o, u),
                f && m[o] != s && (m[o] = s)
        };
        S.core = C,
            n.F = 1,
            n.G = 2,
            n.S = 4,
            n.P = 8,
            n.B = 16,
            n.W = 32,
            n.U = 64,
            n.R = 128,
            e.exports = n
    })
        , U = e(function(e) {
        var t = z("meta")
            , n = I.f
            , r = 0
            , i = Object.isExtensible || function() {
            return !0
        }
            , o = !A(function() {
            return i(Object.preventExtensions({}))
        })
            , a = function(e) {
            n(e, t, {
                value: {
                    i: "O" + ++r,
                    w: {}
                }
            })
        }
            , s = function(e, n) {
            if (!O(e))
                return "symbol" == typeof e ? e : ("string" == typeof e ? "S" : "P") + e;
            if (!P(e, t)) {
                if (!i(e))
                    return "F";
                if (!n)
                    return "E";
                a(e)
            }
            return e[t].i
        }
            , u = function(e, n) {
            if (!P(e, t)) {
                if (!i(e))
                    return !0;
                if (!n)
                    return !1;
                a(e)
            }
            return e[t].w
        }
            , c = function(e) {
            return o && l.NEED && i(e) && !P(e, t) && a(e),
                e
        }
            , l = e.exports = {
            KEY: t,
            NEED: !1,
            fastKey: s,
            getWeak: u,
            onFreeze: c
        }
    })
        , q = e(function(e) {
        var t = "__core-js_shared__"
            , n = S[t] || (S[t] = {});
        e.exports = function(e) {
            return n[e] || (n[e] = {})
        }
    })
        , H = e(function(e) {
        var t = q("wks")
            , n = S.Symbol
            , r = "function" == typeof n;
        (e.exports = function(e) {
                return t[e] || (t[e] = r && n[e] || (r ? n : z)("Symbol." + e))
            }
        ).store = t
    })
        , V = e(function(e) {
        var t = I.f
            , n = H("toStringTag");
        e.exports = function(e, r, i) {
            e && !P(e = i ? e : e.prototype, n) && t(e, n, {
                configurable: !0,
                value: r
            })
        }
    })
        , G = e(function(e, t) {
        t.f = H
    })
        , W = e(function(e) {
        e.exports = !1
    })
        , J = e(function(e) {
        var t = I.f;
        e.exports = function(e) {
            var n = C.Symbol || (C.Symbol = W ? {} : S.Symbol || {});
            "_" == e.charAt(0) || e in n || t(n, e, {
                value: G.f(e)
            })
        }
    })
        , Y = e(function(e) {
        var t = {}.toString;
        e.exports = function(e) {
            return t.call(e).slice(8, -1)
        }
    })
        , K = e(function(e) {
        e.exports = Object("z").propertyIsEnumerable(0) ? Object : function(e) {
            return "String" == Y(e) ? e.split("") : Object(e)
        }
    })
        , Z = e(function(e) {
        e.exports = function(e) {
            if (e == undefined)
                throw TypeError("Can't call method on  " + e);
            return e
        }
    })
        , X = e(function(e) {
        e.exports = function(e) {
            return K(Z(e))
        }
    })
        , Q = e(function(e) {
        var t = Math.ceil
            , n = Math.floor;
        e.exports = function(e) {
            return isNaN(e = +e) ? 0 : (e > 0 ? n : t)(e)
        }
    })
        , ee = e(function(e) {
        var t = Math.min;
        e.exports = function(e) {
            return e > 0 ? t(Q(e), 9007199254740991) : 0
        }
    })
        , te = e(function(e) {
        var t = Math.max
            , n = Math.min;
        e.exports = function(e, r) {
            return e = Q(e),
                e < 0 ? t(e + r, 0) : n(e, r)
        }
    })
        , ne = e(function(e) {
        e.exports = function(e) {
            return function(t, n, r) {
                var i, o = X(t), a = ee(o.length), s = te(r, a);
                if (e && n != n) {
                    for (; a > s; )
                        if ((i = o[s++]) != i)
                            return !0
                } else
                    for (; a > s; s++)
                        if ((e || s in o) && o[s] === n)
                            return e || s || 0;
                return !e && -1
            }
        }
    })
        , re = e(function(e) {
        var t = q("keys");
        e.exports = function(e) {
            return t[e] || (t[e] = z(e))
        }
    })
        , ie = e(function(e) {
        var t = ne(!1)
            , n = re("IE_PROTO");
        e.exports = function(e, r) {
            var i, o = X(e), a = 0, s = [];
            for (i in o)
                i != n && P(o, i) && s.push(i);
            for (; r.length > a; )
                P(o, i = r[a++]) && (~t(s, i) || s.push(i));
            return s
        }
    })
        , oe = e(function(e) {
        e.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")
    })
        , ae = e(function(e) {
        e.exports = Object.keys || function(e) {
            return ie(e, oe)
        }
    })
        , se = e(function(e, t) {
        t.f = Object.getOwnPropertySymbols
    })
        , ue = e(function(e, t) {
        t.f = {}.propertyIsEnumerable
    })
        , ce = e(function(e) {
        e.exports = function(e) {
            var t = ae(e)
                , n = se.f;
            if (n)
                for (var r, i = n(e), o = ue.f, a = 0; i.length > a; )
                    o.call(e, r = i[a++]) && t.push(r);
            return t
        }
    })
        , le = e(function(e) {
        e.exports = Array.isArray || function(e) {
            return "Array" == Y(e)
        }
    })
        , he = e(function(e) {
        e.exports = E ? Object.defineProperties : function(e, t) {
            x(e);
            for (var n, r = ae(t), i = r.length, o = 0; i > o; )
                I.f(e, n = r[o++], t[n]);
            return e
        }
    })
        , fe = e(function(e) {
        var t = S.document;
        e.exports = t && t.documentElement
    })
        , de = e(function(e) {
        var t = re("IE_PROTO")
            , n = function() {}
            , r = "prototype"
            , i = function() {
            var e, t = j("iframe"), n = oe.length, o = "<", a = ">";
            for (t.style.display = "none",
                     fe.appendChild(t),
                     t.src = "javascript:",
                     e = t.contentWindow.document,
                     e.open(),
                     e.write(o + "script" + a + "document.F=Object" + o + "/script" + a),
                     e.close(),
                     i = e.F; n--; )
                delete i[r][oe[n]];
            return i()
        };
        e.exports = Object.create || function(e, o) {
            var a;
            return null !== e ? (n[r] = x(e),
                a = new n,
                n[r] = null,
                a[t] = e) : a = i(),
                o === undefined ? a : he(a, o)
        }
    })
        , pe = e(function(e, t) {
        var n = oe.concat("length", "prototype");
        t.f = Object.getOwnPropertyNames || function(e) {
            return ie(e, n)
        }
    })
        , ye = e(function(e) {
        var t = pe.f
            , n = {}.toString
            , r = "object" == typeof window && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : []
            , i = function(e) {
            try {
                return t(e)
            } catch (e) {
                return r.slice()
            }
        };
        e.exports.f = function(e) {
            return r && "[object Window]" == n.call(e) ? i(e) : t(X(e))
        }
    })
        , me = e(function(e, t) {
        var n = Object.getOwnPropertyDescriptor;
        t.f = E ? n : function(e, t) {
            if (e = X(e),
                t = M(t, !0),
                T)
                try {
                    return n(e, t)
                } catch (e) {}
            if (P(e, t))
                return L(!ue.f.call(e, t), e[t])
        }
    })
        , ve = (e(function() {
        "use strict";
        var e = U.KEY
            , t = me.f
            , n = I.f
            , r = ye.f
            , i = S.Symbol
            , o = S.JSON
            , a = o && o.stringify
            , s = "prototype"
            , u = H("_hidden")
            , c = H("toPrimitive")
            , l = {}.propertyIsEnumerable
            , h = q("symbol-registry")
            , f = q("symbols")
            , d = q("op-symbols")
            , p = Object[s]
            , y = "function" == typeof i
            , m = S.QObject
            , v = !m || !m[s] || !m[s].findChild
            , b = E && A(function() {
            return 7 != de(n({}, "a", {
                get: function() {
                    return n(this, "a", {
                        value: 7
                    }).a
                }
            })).a
        }) ? function(e, r, i) {
                var o = t(p, r);
                o && delete p[r],
                    n(e, r, i),
                o && e !== p && n(p, r, o)
            }
            : n
            , g = function(e) {
            var t = f[e] = de(i[s]);
            return t._k = e,
                t
        }
            , _ = y && "symbol" == typeof i.iterator ? function(e) {
                return "symbol" == typeof e
            }
            : function(e) {
                return e instanceof i
            }
            , k = function(e, t, r) {
            return e === p && k(d, t, r),
                x(e),
                t = M(t, !0),
                x(r),
                P(f, t) ? (r.enumerable ? (P(e, u) && e[u][t] && (e[u][t] = !1),
                    r = de(r, {
                        enumerable: L(0, !1)
                    })) : (P(e, u) || n(e, u, L(1, {})),
                    e[u][t] = !0),
                    b(e, t, r)) : n(e, t, r)
        }
            , w = function(e, t) {
            x(e);
            for (var n, r = ce(t = X(t)), i = 0, o = r.length; o > i; )
                k(e, n = r[i++], t[n]);
            return e
        }
            , C = function(e, t) {
            return t === undefined ? de(e) : w(de(e), t)
        }
            , O = function(e) {
            var t = l.call(this, e = M(e, !0));
            return !(this === p && P(f, e) && !P(d, e)) && (!(t || !P(this, e) || !P(f, e) || P(this, u) && this[u][e]) || t)
        }
            , j = function(e, n) {
            if (e = X(e),
                n = M(n, !0),
            e !== p || !P(f, n) || P(d, n)) {
                var r = t(e, n);
                return !r || !P(f, n) || P(e, u) && e[u][n] || (r.enumerable = !0),
                    r
            }
        }
            , T = function(t) {
            for (var n, i = r(X(t)), o = [], a = 0; i.length > a; )
                P(f, n = i[a++]) || n == u || n == e || o.push(n);
            return o
        }
            , N = function(e) {
            for (var t, n = e === p, i = r(n ? d : X(e)), o = [], a = 0; i.length > a; )
                !P(f, t = i[a++]) || n && !P(p, t) || o.push(f[t]);
            return o
        };
        y || (i = function() {
                if (this instanceof i)
                    throw TypeError("Symbol is not a constructor!");
                var e = z(arguments.length > 0 ? arguments[0] : undefined)
                    , t = function(n) {
                    this === p && t.call(d, n),
                    P(this, u) && P(this[u], e) && (this[u][e] = !1),
                        b(this, e, L(1, n))
                };
                return E && v && b(p, e, {
                    configurable: !0,
                    set: t
                }),
                    g(e)
            }
                ,
                F(i[s], "toString", function() {
                    return this._k
                }),
                me.f = j,
                I.f = k,
                pe.f = ye.f = T,
                ue.f = O,
                se.f = N,
            E && !W && F(p, "propertyIsEnumerable", O, !0),
                G.f = function(e) {
                    return g(H(e))
                }
        ),
            B(B.G + B.W + B.F * !y, {
                Symbol: i
            });
        for (var D = "hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","), $ = 0; D.length > $; )
            H(D[$++]);
        for (var Y = ae(H.store), K = 0; Y.length > K; )
            J(Y[K++]);
        B(B.S + B.F * !y, "Symbol", {
            "for": function(e) {
                return P(h, e += "") ? h[e] : h[e] = i(e)
            },
            keyFor: function(e) {
                if (!_(e))
                    throw TypeError(e + " is not a symbol!");
                for (var t in h)
                    if (h[t] === e)
                        return t
            },
            useSetter: function() {
                v = !0
            },
            useSimple: function() {
                v = !1
            }
        }),
            B(B.S + B.F * !y, "Object", {
                create: C,
                defineProperty: k,
                defineProperties: w,
                getOwnPropertyDescriptor: j,
                getOwnPropertyNames: T,
                getOwnPropertySymbols: N
            }),
        o && B(B.S + B.F * (!y || A(function() {
            var e = i();
            return "[null]" != a([e]) || "{}" != a({
                a: e
            }) || "{}" != a(Object(e))
        })), "JSON", {
            stringify: function(e) {
                if (e !== undefined && !_(e)) {
                    for (var t, n, r = [e], i = 1; arguments.length > i; )
                        r.push(arguments[i++]);
                    return t = r[1],
                    "function" == typeof t && (n = t),
                    !n && le(t) || (t = function(e, t) {
                            if (n && (t = n.call(this, e, t)),
                                !_(t))
                                return t
                        }
                    ),
                        r[1] = t,
                        a.apply(o, r)
                }
            }
        }),
        i[s][c] || R(i[s], c, i[s].valueOf),
            V(i, "Symbol"),
            V(Math, "Math", !0),
            V(S.JSON, "JSON", !0)
    }),
        e(function(e) {
            var t = H("toStringTag")
                , n = "Arguments" == Y(function() {
                return arguments
            }())
                , r = function(e, t) {
                try {
                    return e[t]
                } catch (e) {}
            };
            e.exports = function(e) {
                var i, o, a;
                return e === undefined ? "Undefined" : null === e ? "Null" : "string" == typeof (o = r(i = Object(e), t)) ? o : n ? Y(i) : "Object" == (a = Y(i)) && "function" == typeof i.callee ? "Arguments" : a
            }
        }))
        , be = (e(function() {
        "use strict";
        var e = {};
        e[H("toStringTag")] = "z",
        e + "" != "[object z]" && F(Object.prototype, "toString", function() {
            return "[object " + ve(this) + "]"
        }, !0)
    }),
        e(function(e) {
            e.exports = C.Symbol
        }),
        e(function(e, t) {
            "use strict";
            function n(e) {
                "loading" !== document.readyState ? e() : document.addEventListener ? document.addEventListener("DOMContentLoaded", e) : document.attachEvent("onreadystatechange", function() {
                    "loading" !== document.readyState && e()
                })
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            }),
                t["default"] = n
        }))
        , ge = e(function(e) {
        e.exports = function(e) {
            return function(t, n) {
                var r, i, o = String(Z(t)), a = Q(n), s = o.length;
                return a < 0 || a >= s ? e ? "" : undefined : (r = o.charCodeAt(a),
                    r < 55296 || r > 56319 || a + 1 === s || (i = o.charCodeAt(a + 1)) < 56320 || i > 57343 ? e ? o.charAt(a) : r : e ? o.slice(a, a + 2) : i - 56320 + (r - 55296 << 10) + 65536)
            }
        }
    })
        , _e = e(function(e) {
        e.exports = {}
    })
        , ke = e(function(e) {
        "use strict";
        var t = {};
        R(t, H("iterator"), function() {
            return this
        }),
            e.exports = function(e, n, r) {
                e.prototype = de(t, {
                    next: L(1, r)
                }),
                    V(e, n + " Iterator")
            }
    })
        , we = e(function(e) {
        e.exports = function(e) {
            return Object(Z(e))
        }
    })
        , Se = e(function(e) {
        var t = re("IE_PROTO")
            , n = Object.prototype;
        e.exports = Object.getPrototypeOf || function(e) {
            return e = we(e),
                P(e, t) ? e[t] : "function" == typeof e.constructor && e instanceof e.constructor ? e.constructor.prototype : e instanceof Object ? n : null
        }
    })
        , Pe = e(function(e) {
        "use strict";
        var t = H("iterator")
            , n = !([].keys && "next"in [].keys())
            , r = "keys"
            , i = "values"
            , o = function() {
            return this
        };
        e.exports = function(e, a, s, u, c, l, h) {
            ke(s, a, u);
            var f, d, p, y = function(e) {
                if (!n && e in g)
                    return g[e];
                switch (e) {
                    case r:
                    case i:
                        return function() {
                            return new s(this,e)
                        }
                }
                return function() {
                    return new s(this,e)
                }
            }, m = a + " Iterator", v = c == i, b = !1, g = e.prototype, _ = g[t] || g["@@iterator"] || c && g[c], k = _ || y(c), w = c ? v ? y("entries") : k : undefined, S = "Array" == a ? g.entries || _ : _;
            if (S && (p = Se(S.call(new e))) !== Object.prototype && p.next && (V(p, m, !0),
            W || P(p, t) || R(p, t, o)),
            v && _ && _.name !== i && (b = !0,
                    k = function() {
                        return _.call(this)
                    }
            ),
            W && !h || !n && !b && g[t] || R(g, t, k),
                _e[a] = k,
                _e[m] = o,
                c)
                if (f = {
                    values: v ? k : y(i),
                    keys: l ? k : y(r),
                    entries: w
                },
                    h)
                    for (d in f)
                        d in g || F(g, d, f[d]);
                else
                    B(B.P + B.F * (n || b), a, f);
            return f
        }
    })
        , Ae = (e(function() {
        "use strict";
        var e = ge(!0);
        Pe(String, "String", function(e) {
            this._t = String(e),
                this._i = 0
        }, function() {
            var t, n = this._t, r = this._i;
            return r >= n.length ? {
                value: undefined,
                done: !0
            } : (t = e(n, r),
                this._i += t.length,
                {
                    value: t,
                    done: !1
                })
        })
    }),
        e(function(e) {
            var t = H("unscopables")
                , n = Array.prototype;
            n[t] == undefined && R(n, t, {}),
                e.exports = function(e) {
                    n[t][e] = !0
                }
        }))
        , Ee = e(function(e) {
        e.exports = function(e, t) {
            return {
                value: t,
                done: !!e
            }
        }
    })
        , Ce = e(function(e) {
        "use strict";
        e.exports = Pe(Array, "Array", function(e, t) {
            this._t = X(e),
                this._i = 0,
                this._k = t
        }, function() {
            var e = this._t
                , t = this._k
                , n = this._i++;
            return !e || n >= e.length ? (this._t = undefined,
                Ee(1)) : "keys" == t ? Ee(0, n) : "values" == t ? Ee(0, e[n]) : Ee(0, [n, e[n]])
        }, "values"),
            _e.Arguments = _e.Array,
            Ae("keys"),
            Ae("values"),
            Ae("entries")
    })
        , Oe = (e(function() {
        for (var e = H("iterator"), t = H("toStringTag"), n = _e.Array, r = {
            CSSRuleList: !0,
            CSSStyleDeclaration: !1,
            CSSValueList: !1,
            ClientRectList: !1,
            DOMRectList: !1,
            DOMStringList: !1,
            DOMTokenList: !0,
            DataTransferItemList: !1,
            FileList: !1,
            HTMLAllCollection: !1,
            HTMLCollection: !1,
            HTMLFormElement: !1,
            HTMLSelectElement: !1,
            MediaList: !0,
            MimeTypeArray: !1,
            NamedNodeMap: !1,
            NodeList: !0,
            PaintRequestList: !1,
            Plugin: !1,
            PluginArray: !1,
            SVGLengthList: !1,
            SVGNumberList: !1,
            SVGPathSegList: !1,
            SVGPointList: !1,
            SVGStringList: !1,
            SVGTransformList: !1,
            SourceBufferList: !1,
            StyleSheetList: !0,
            TextTrackCueList: !1,
            TextTrackList: !1,
            TouchList: !1
        }, i = ae(r), o = 0; o < i.length; o++) {
            var a, s = i[o], u = r[s], c = S[s], l = c && c.prototype;
            if (l && (l[e] || R(l, e, n),
            l[t] || R(l, t, s),
                _e[s] = n,
                u))
                for (a in Ce)
                    l[a] || F(l, a, Ce[a], !0)
        }
    }),
        e(function(e) {
            e.exports = function(e, t, n, r) {
                if (!(e instanceof t) || r !== undefined && r in e)
                    throw TypeError(n + ": incorrect invocation!");
                return e
            }
        }))
        , xe = e(function(e) {
        e.exports = function(e, t, n, r) {
            try {
                return r ? t(x(n)[0], n[1]) : t(n)
            } catch (t) {
                var i = e["return"];
                throw i !== undefined && x(i.call(e)),
                    t
            }
        }
    })
        , je = e(function(e) {
        var t = H("iterator")
            , n = Array.prototype;
        e.exports = function(e) {
            return e !== undefined && (_e.Array === e || n[t] === e)
        }
    })
        , Te = e(function(e) {
        var t = H("iterator");
        e.exports = C.getIteratorMethod = function(e) {
            if (e != undefined)
                return e[t] || e["@@iterator"] || _e[ve(e)]
        }
    })
        , Me = e(function(e, t) {
        var n = {}
            , r = {}
            , t = e.exports = function(e, t, i, o, a) {
                var s, u, c, l, h = a ? function() {
                        return e
                    }
                    : Te(e), f = D(i, o, t ? 2 : 1), d = 0;
                if ("function" != typeof h)
                    throw TypeError(e + " is not iterable!");
                if (je(h)) {
                    for (s = ee(e.length); s > d; d++)
                        if ((l = t ? f(x(u = e[d])[0], u[1]) : f(e[d])) === n || l === r)
                            return l
                } else
                    for (c = h.call(e); !(u = c.next()).done; )
                        if ((l = xe(c, f, u.value, t)) === n || l === r)
                            return l
            }
        ;
        t.BREAK = n,
            t.RETURN = r
    })
        , Ie = e(function(e) {
        var t = H("species");
        e.exports = function(e, n) {
            var r, i = x(e).constructor;
            return i === undefined || (r = x(i)[t]) == undefined ? n : N(r)
        }
    })
        , Le = e(function(e) {
        e.exports = function(e, t, n) {
            var r = n === undefined;
            switch (t.length) {
                case 0:
                    return r ? e() : e.call(n);
                case 1:
                    return r ? e(t[0]) : e.call(n, t[0]);
                case 2:
                    return r ? e(t[0], t[1]) : e.call(n, t[0], t[1]);
                case 3:
                    return r ? e(t[0], t[1], t[2]) : e.call(n, t[0], t[1], t[2]);
                case 4:
                    return r ? e(t[0], t[1], t[2], t[3]) : e.call(n, t[0], t[1], t[2], t[3])
            }
            return e.apply(n, t)
        }
    })
        , Re = e(function(e) {
        var t, n, r, i = S.process, o = S.setImmediate, a = S.clearImmediate, s = S.MessageChannel, u = S.Dispatch, c = 0, l = {}, h = "onreadystatechange", f = function() {
            var e = +this;
            if (l.hasOwnProperty(e)) {
                var t = l[e];
                delete l[e],
                    t()
            }
        }, d = function(e) {
            f.call(e.data)
        };
        o && a || (o = function(e) {
                for (var n = [], r = 1; arguments.length > r; )
                    n.push(arguments[r++]);
                return l[++c] = function() {
                    Le("function" == typeof e ? e : Function(e), n)
                }
                    ,
                    t(c),
                    c
            }
                ,
                a = function(e) {
                    delete l[e]
                }
                ,
                "process" == Y(i) ? t = function(e) {
                        i.nextTick(D(f, e, 1))
                    }
                    : u && u.now ? t = function(e) {
                        u.now(D(f, e, 1))
                    }
                    : s ? (n = new s,
                        r = n.port2,
                        n.port1.onmessage = d,
                        t = D(r.postMessage, r, 1)) : S.addEventListener && "function" == typeof postMessage && !S.importScripts ? (t = function(e) {
                        S.postMessage(e + "", "*")
                    }
                        ,
                        S.addEventListener("message", d, !1)) : t = h in j("script") ? function(e) {
                            fe.appendChild(j("script"))[h] = function() {
                                fe.removeChild(this),
                                    f.call(e)
                            }
                        }
                        : function(e) {
                            setTimeout(D(f, e, 1), 0)
                        }
        ),
            e.exports = {
                set: o,
                clear: a
            }
    })
        , ze = e(function(e) {
        var t = Re.set
            , n = S.MutationObserver || S.WebKitMutationObserver
            , r = S.process
            , i = S.Promise
            , o = "process" == Y(r);
        e.exports = function() {
            var e, a, s, u = function() {
                var t, n;
                for (o && (t = r.domain) && t.exit(); e; ) {
                    n = e.fn,
                        e = e.next;
                    try {
                        n()
                    } catch (t) {
                        throw e ? s() : a = undefined,
                            t
                    }
                }
                a = undefined,
                t && t.enter()
            };
            if (o)
                s = function() {
                    r.nextTick(u)
                }
                ;
            else if (n) {
                var c = !0
                    , l = document.createTextNode("");
                new n(u).observe(l, {
                    characterData: !0
                }),
                    s = function() {
                        l.data = c = !c
                    }
            } else if (i && i.resolve) {
                var h = i.resolve();
                s = function() {
                    h.then(u)
                }
            } else
                s = function() {
                    t.call(S, u)
                }
                ;
            return function(t) {
                var n = {
                    fn: t,
                    next: undefined
                };
                a && (a.next = n),
                e || (e = n,
                    s()),
                    a = n
            }
        }
    })
        , Fe = e(function(e) {
        "use strict";
        function t(e) {
            var t, n;
            this.promise = new e(function(e, r) {
                    if (t !== undefined || n !== undefined)
                        throw TypeError("Bad Promise constructor");
                    t = e,
                        n = r
                }
            ),
                this.resolve = N(t),
                this.reject = N(n)
        }
        e.exports.f = function(e) {
            return new t(e)
        }
    })
        , Ne = e(function(e) {
        e.exports = function(e) {
            try {
                return {
                    e: !1,
                    v: e()
                }
            } catch (e) {
                return {
                    e: !0,
                    v: e
                }
            }
        }
    })
        , De = e(function(e) {
        e.exports = function(e, t) {
            if (x(e),
            O(t) && t.constructor === e)
                return t;
            var n = Fe.f(e);
            return (0,
                n.resolve)(t),
                n.promise
        }
    })
        , Be = e(function(e) {
        e.exports = function(e, t, n) {
            for (var r in t)
                F(e, r, t[r], n);
            return e
        }
    })
        , Ue = e(function(e) {
        "use strict";
        var t = H("species");
        e.exports = function(e) {
            var n = S[e];
            E && n && !n[t] && I.f(n, t, {
                configurable: !0,
                get: function() {
                    return this
                }
            })
        }
    })
        , qe = e(function(e) {
        var t = H("iterator")
            , n = !1;
        try {
            var r = [7][t]();
            r["return"] = function() {
                n = !0
            }
                ,
                Array.from(r, function() {
                    throw 2
                })
        } catch (e) {}
        e.exports = function(e, r) {
            if (!r && !n)
                return !1;
            var i = !1;
            try {
                var o = [7]
                    , a = o[t]();
                a.next = function() {
                    return {
                        done: i = !0
                    }
                }
                    ,
                    o[t] = function() {
                        return a
                    }
                    ,
                    e(o)
            } catch (e) {}
            return i
        }
    })
        , He = (e(function() {
        "use strict";
        var e, t, n, r, i = Re.set, o = ze(), a = "Promise", s = S.TypeError, u = S.process, c = S[a], l = "process" == ve(u), h = function() {}, f = t = Fe.f, d = !!function() {
            try {
                var e = c.resolve(1)
                    , t = (e.constructor = {})[H("species")] = function(e) {
                        e(h, h)
                    }
                ;
                return (l || "function" == typeof PromiseRejectionEvent) && e.then(h)instanceof t
            } catch (e) {}
        }(), p = function(e) {
            var t;
            return !(!O(e) || "function" != typeof (t = e.then)) && t
        }, y = function(e, t) {
            if (!e._n) {
                e._n = !0;
                var n = e._c;
                o(function() {
                    for (var r = e._v, i = 1 == e._s, o = 0, a = function(t) {
                        var n, o, a = i ? t.ok : t.fail, u = t.resolve, c = t.reject, l = t.domain;
                        try {
                            a ? (i || (2 == e._h && b(e),
                                e._h = 1),
                                !0 === a ? n = r : (l && l.enter(),
                                    n = a(r),
                                l && l.exit()),
                                n === t.promise ? c(s("Promise-chain cycle")) : (o = p(n)) ? o.call(n, u, c) : u(n)) : c(r)
                        } catch (e) {
                            c(e)
                        }
                    }; n.length > o; )
                        a(n[o++]);
                    e._c = [],
                        e._n = !1,
                    t && !e._h && m(e)
                })
            }
        }, m = function(e) {
            i.call(S, function() {
                var t, n, r, i = e._v, o = v(e);
                if (o && (t = Ne(function() {
                    l ? u.emit("unhandledRejection", i, e) : (n = S.onunhandledrejection) ? n({
                        promise: e,
                        reason: i
                    }) : (r = S.console) && r.error && r.error("Unhandled promise rejection", i)
                }),
                    e._h = l || v(e) ? 2 : 1),
                    e._a = undefined,
                o && t.e)
                    throw t.v
            })
        }, v = function(e) {
            if (1 == e._h)
                return !1;
            for (var t, n = e._a || e._c, r = 0; n.length > r; )
                if (t = n[r++],
                t.fail || !v(t.promise))
                    return !1;
            return !0
        }, b = function(e) {
            i.call(S, function() {
                var t;
                l ? u.emit("rejectionHandled", e) : (t = S.onrejectionhandled) && t({
                    promise: e,
                    reason: e._v
                })
            })
        }, g = function(e) {
            var t = this;
            t._d || (t._d = !0,
                t = t._w || t,
                t._v = e,
                t._s = 2,
            t._a || (t._a = t._c.slice()),
                y(t, !0))
        }, _ = function(e) {
            var t, n = this;
            if (!n._d) {
                n._d = !0,
                    n = n._w || n;
                try {
                    if (n === e)
                        throw s("Promise can't be resolved itself");
                    (t = p(e)) ? o(function() {
                        var r = {
                            _w: n,
                            _d: !1
                        };
                        try {
                            t.call(e, D(_, r, 1), D(g, r, 1))
                        } catch (e) {
                            g.call(r, e)
                        }
                    }) : (n._v = e,
                        n._s = 1,
                        y(n, !1))
                } catch (e) {
                    g.call({
                        _w: n,
                        _d: !1
                    }, e)
                }
            }
        };
        d || (c = function(t) {
                Oe(this, c, a, "_h"),
                    N(t),
                    e.call(this);
                try {
                    t(D(_, this, 1), D(g, this, 1))
                } catch (e) {
                    g.call(this, e)
                }
            }
                ,
                e = function() {
                    this._c = [],
                        this._a = undefined,
                        this._s = 0,
                        this._d = !1,
                        this._v = undefined,
                        this._h = 0,
                        this._n = !1
                }
                ,
                e.prototype = Be(c.prototype, {
                    then: function(e, t) {
                        var n = f(Ie(this, c));
                        return n.ok = "function" != typeof e || e,
                            n.fail = "function" == typeof t && t,
                            n.domain = l ? u.domain : undefined,
                            this._c.push(n),
                        this._a && this._a.push(n),
                        this._s && y(this, !1),
                            n.promise
                    },
                    "catch": function(e) {
                        return this.then(undefined, e)
                    }
                }),
                n = function() {
                    var t = new e;
                    this.promise = t,
                        this.resolve = D(_, t, 1),
                        this.reject = D(g, t, 1)
                }
                ,
                Fe.f = f = function(e) {
                    return e === c || e === r ? new n(e) : t(e)
                }
        ),
            B(B.G + B.W + B.F * !d, {
                Promise: c
            }),
            V(c, a),
            Ue(a),
            r = C[a],
            B(B.S + B.F * !d, a, {
                reject: function(e) {
                    var t = f(this);
                    return (0,
                        t.reject)(e),
                        t.promise
                }
            }),
            B(B.S + B.F * (W || !d), a, {
                resolve: function(e) {
                    return De(W && this === r ? c : this, e)
                }
            }),
            B(B.S + B.F * !(d && qe(function(e) {
                c.all(e)["catch"](h)
            })), a, {
                all: function(e) {
                    var t = this
                        , n = f(t)
                        , r = n.resolve
                        , i = n.reject
                        , o = Ne(function() {
                        var n = []
                            , o = 0
                            , a = 1;
                        Me(e, !1, function(e) {
                            var s = o++
                                , u = !1;
                            n.push(undefined),
                                a++,
                                t.resolve(e).then(function(e) {
                                    u || (u = !0,
                                        n[s] = e,
                                    --a || r(n))
                                }, i)
                        }),
                        --a || r(n)
                    });
                    return o.e && i(o.v),
                        n.promise
                },
                race: function(e) {
                    var t = this
                        , n = f(t)
                        , r = n.reject
                        , i = Ne(function() {
                        Me(e, !1, function(e) {
                            t.resolve(e).then(n.resolve, r)
                        })
                    });
                    return i.e && r(i.v),
                        n.promise
                }
            })
    }),
        e(function(e) {
            e.exports = C.Promise
        }),
        e(function(e, t) {
            "use strict";
            function n(e) {
                var t = {
                    city: e.locality,
                    province_code: e.administrativeArea,
                    zip: e.postalCode
                };
                e.countryCode ? t.country_code = e.countryCode.toLowerCase() : e.country && (t.country = e.country.toLowerCase(),
                "usa" === t.country && (t.country = "united states")),
                e.givenName && (t.first_name = e.givenName),
                e.familyName && (t.last_name = e.familyName),
                e.phoneNumber && (t.phone = e.phoneNumber);
                var n = e.addressLines;
                return n && n.length && (t.address1 = n[0],
                n[1] && (t.address2 = n[1])),
                    s(t)
            }
            function r(e, t) {
                return {
                    type: "final",
                    label: t,
                    amount: e.total_price
                }
            }
            function i(e) {
                var t = [{
                    type: "final",
                    label: "Subtotal",
                    amount: e.total_line_items_price
                }];
                return e.shipping_line && (t = t.concat([{
                    type: "final",
                    label: "Shipping",
                    amount: e.shipping_line.price
                }])),
                e.total_tax && (t = t.concat([{
                    type: "final",
                    label: "Estimated Tax",
                    amount: e.total_tax
                }])),
                e.applied_discount && (t = t.concat([{
                    type: "final",
                    label: "Discount",
                    amount: -e.applied_discount.amount
                }])),
                    t
            }
            function o(e) {
                return a(e).map(c)
            }
            function a(e) {
                return [].concat(e).sort(u)
            }
            function s(e) {
                var t = e.country_code
                    , n = e.country
                    , r = e.zip
                    , i = {};
                return l.test(r) && ("ca" !== t && "canada" !== n || (i.zip = r.trim() + " 0Z0"),
                "gb" === t && (i.zip = r.trim() + " 0ZZ")),
                    Object.assign({}, e, i)
            }
            function u(e, t) {
                var n = parseFloat(e.price)
                    , r = parseFloat(t.price);
                return n < r ? -1 : n > r ? 1 : 0
            }
            function c(e) {
                return {
                    identifier: e.id,
                    label: e.title,
                    detail: "",
                    amount: e.price
                }
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            }),
                t.addressFromEvent = n,
                t.totalFromCheckout = r,
                t.lineItemsFromCheckout = i,
                t.transformedShippingRates = o,
                t.sortShippingRates = a;
            var l = /^[a-z0-9]{2,4}\s?$/i
        }))
        , Ve = e(function(e, t) {
        "use strict";
        function n(e, t) {
            for (var n = 0; n < a.length; n++)
                if (a[n][0].test(e)) {
                    var r = a[n][1];
                    return "function" == typeof r && t ? r(t.field) : r
                }
            return s
        }
        function r(e) {
            var t = [];
            return Object.keys(e).forEach(function(r) {
                Object.keys(e[r]).forEach(function(i) {
                    e[r][i].forEach(function(e) {
                        e && e.code && t.push(n(r + "_" + i + "_" + e.code, {
                            field: i,
                            category: r
                        }))
                    })
                })
            }),
                t
        }
        function i(e) {
            e = Array.isArray(e) ? e : [e];
            var t = e.map(function(e) {
                return o(e)
            });
            return 1 === t.length && t[0].startsWith("Enter ") && (t = ["Please e" + t[0].substr(1) + " and try again"]),
                t
        }
        function o(e) {
            switch (e) {
                case "Some products became unavailable and your cart has been updated. We're sorry for the inconvenience.":
                    return n("not_enough_in_stock");
                case "Checkout is already completed.":
                    return n("already_completed");
                default:
                    return e
            }
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
            t.errorFromCode = n,
            t.errorMessagesFromJson = r,
            t.normalizeErrors = i;
        var a = [[/failed_session/, "There was a problem with the payment service. Please select a different payment method or try again later."], [/first_name_blank$/, "Enter a first name for your shipping address"], [/last_name_blank$/, "Enter a last name for your shipping address"], [/address1_blank$/, "Enter your shipping address"], [/address2_blank$/, "Enter the apartment, suite, etc. for your shipping address"], [/city_blank$/, "Enter the city of your shipping address"], [/country(_code)?_blank$/, "Select a country for your shipping address"], [/country(_code)?_not_supported$/, "Enter a valid country for your shipping address"], [/province(_code)?_blank$/, "Enter a state / province for your shipping address"], [/province(_code)?_invalid_state_in_country$/, "Enter a valid state for your shipping address country"], [/province(_code)?_invalid_province_in_country$/, "Enter a valid province for your shipping address country"], [/province(_code)?_invalid_region_in_country$/, "Enter a valid region for your shipping address country"], [/company_blank$/, "Enter a company name for your shipping address"], [/phone_blank$/, "Enter a valid phone number for your shipping address"], [/zip(_code)?_blank$/, "Enter a ZIP code / postal code for your shipping address"], [/zip(_code)?_invalid_for_country$/, "Enter a valid ZIP code / postal code for your shipping address"], [/zip(_code)?_invalid_for_country_and_province$/, "Enter a valid ZIP code / postal code for your shipping address"], [/email_invalid$/, "Enter a valid email address"], [/generic_error$/, "An error occurred while processing your payment. Please try again."], [/credit_card_processing$/, "Your card can't be processed due to technical difficulties. Please try again in a few minutes."], [/not_enough_in_stock$/, "Some items became unavailable. Refresh your cart and try again."], [/already_completed/, "Your items have already been purchased."], [/empty_cart/, "Your cart is currently empty. Please add items to your cart and try again."], [/full_name_required$/, "Enter both your first and last name"], [/total_price_too_big$/, "Your order total exceeds the limit. Please edit your cart and try again."], [/total_price_zero$/, "To check out with Apple Pay, your order total must be greater than 0. Please choose a new payment method and try again."], [/no_shipping_option$/, "Sorry, we currently don't ship to this country. Please choose a new shipping address and try again."], [/payment_in_progress$/, "Your order is being processed and can't be cancelled at this time. You will receive an email confirmation once the transaction is successful."], [/payment_timeout$/, "The network connection was lost, but your payment is still processing. You'll receive an order confirmation shortly if the transaction is successful."], [/expired_card/, "Your credit card is expired. Please update your card."], [/card_declined/, "Your credit card was declined. In order to resolve this issue, you will need to contact your bank."], [/(invalid|blank)$/, function(e) {
            return "Enter a valid " + e
        }
        ]]
            , s = "An error occurred while processing your checkout. Please try again."
    })
        , Ge = e(function(e, t) {
        "use strict";
        function n(e) {
            var t = e.toLowerCase();
            return {
                amex: "american_express",
                masterCard: "master"
            }[t] || t
        }
        function o(e) {
            return e && e.response && 422 === e.response.status
        }
        function a() {
            var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
                , t = e.checkout || e;
            return t.billing_address ? ApplePaySession.STATUS_INVALID_BILLING_POSTAL_ADDRESS : t.shipping_address ? ApplePaySession.STATUS_INVALID_SHIPPING_POSTAL_ADDRESS : ApplePaySession.STATUS_FAILURE
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var s = function() {
            function e(t) {
                var n = t.apiClient
                    , i = t.sessionToken
                    , o = t.merchantName
                    , a = t.session
                    , s = t.strategy
                    , u = t.shopId
                    , c = t.showErrors
                    , l = t.closeCallback;
                if (r(this, e),
                    this.apiClient = n,
                    this.strategy = s,
                    this._sessionToken = i || (0,
                        p.generateRandomId)(),
                    this._merchantName = o,
                    this._session = a,
                    this._shopId = u,
                    this._showErrors = c,
                    this._firstShippingContactSelected = !0,
                    this._paymentInProgress = !1,
                    this._sheetCancelled = !1,
                    this._closeCallback = l,
                    !s)
                    throw new Error("`strategy` must be supplied to ShopifyApplePaySession");
                this._session.oncancel = this._trackCallback("cancelled", this._onCancel).bind(this),
                    this._session.onvalidatemerchant = this._trackCallback("merchant validated", this._onValidateMerchant.bind(this)),
                    this._session.onshippingcontactselected = this._trackCallback("shipping contact selected", this._onShippingContactSelected).bind(this),
                    this._session.onshippingmethodselected = this._trackCallback("shipping method selected", this._onShippingMethodSelected).bind(this),
                    this._session.onpaymentauthorized = this._trackCallback("payment authorized", this._onPaymentAuthorized).bind(this),
                    this._session.onpaymentmethodselected = this._trackCallback("payment method selected", this._onPaymentMethodSelected).bind(this)
            }
            return i(e, [{
                key: "begin",
                value: function() {
                    var e = this;
                    return this._sheetCancelled = !1,
                        this.strategy.build().then(function(t) {
                            return e.checkout = t
                        }).then(function() {
                            return e._session.begin()
                        })["catch"](function(t) {
                            return e._handleStrategyError(t)
                        })["catch"](function() {
                            return e._handleErrors((0,
                                Ve.errorFromCode)("failed_session"))
                        })
                }
            }, {
                key: "_onCancel",
                value: function() {
                    return this._sheetCancelled = !0,
                        this.apiClient.stopPolling(),
                    this._paymentInProgress && this._showErrors([(0,
                        Ve.errorFromCode)("payment_in_progress")], "Payment in progress"),
                        this._closeCallback(),
                        Promise.resolve()
                }
            }, {
                key: "_onValidateMerchant",
                value: function(e) {
                    var t = this
                        , n = e.validationURL
                        , r = {
                        domain: window.location.hostname,
                        id: this._sessionToken,
                        validation_url: n
                    };
                    return this.apiClient.post("/" + this._shopId + "/apple_pay/sessions", r).then(function(e) {
                        var n = e.body;
                        return t._session.completeMerchantValidation(n)
                    })["catch"](function() {
                        return t._handleErrors((0,
                            Ve.errorFromCode)("failed_session"))
                    })
                }
            }, {
                key: "_onShippingContactSelected",
                value: function(e) {
                    var t = this
                        , n = {
                        partial_addresses: !0,
                        shipping_address: (0,
                            He.addressFromEvent)(e.shippingContact)
                    };
                    return this._updateCheckout(n).then(this._fetchShippingRates.bind(this)).then(this._setDefaultShippingRate.bind(this)).then(function(e) {
                        return t._session.completeShippingContactSelection(ApplePaySession.STATUS_SUCCESS, (0,
                            He.transformedShippingRates)(t.availableShippingRates), (0,
                            He.totalFromCheckout)(e, t._merchantName), (0,
                            He.lineItemsFromCheckout)(e))
                    }).then(function() {
                        return t._firstShippingContactSelected = !1
                    })["catch"](function(e) {
                        return t._displayInitialAddressError(e)
                    })["catch"](function(e) {
                        return t._handleResponseError(e)
                    })["catch"](function(e) {
                        return t._catchPaymentRequestValidatorError(e)
                    })
                }
            }, {
                key: "_onShippingMethodSelected",
                value: function(e) {
                    var t = this
                        , n = e.shippingMethod
                        , r = {
                        shipping_line: {
                            handle: n.identifier
                        }
                    };
                    return this._updateCheckout(r).then(function(e) {
                        return t._session.completeShippingMethodSelection(ApplePaySession.STATUS_SUCCESS, (0,
                            He.totalFromCheckout)(e, t._merchantName), (0,
                            He.lineItemsFromCheckout)(e))
                    })["catch"](function() {
                        return t._session.completeShippingMethodSelection(ApplePaySession.STATUS_FAILURE)
                    })
                }
            }, {
                key: "_onPaymentAuthorized",
                value: function(e) {
                    var t = this
                        , r = e.payment
                        , i = r.token.paymentData
                        , o = {
                        email: r.billingContact.emailAddress || r.shippingContact.emailAddress,
                        billing_address: (0,
                            He.addressFromEvent)(r.billingContact),
                        shipping_address: (0,
                            He.addressFromEvent)(r.shippingContact),
                        credit_card: {
                            brand: n(r.token.paymentMethod.network)
                        }
                    };
                    if (!1 !== this.checkout.requires_shipping && !this.checkout.shipping_line)
                        return this._handleErrors([(0,
                            Ve.errorFromCode)("no_shipping_option")]);
                    var a = {
                        unique_token: (0,
                            p.generateRandomId)(),
                        amount: this.checkout.total_price,
                        payment_token: {
                            type: "apple_pay",
                            payment_data: JSON.stringify(i)
                        }
                    }
                        , s = this._updateCheckout(o).then(this._submitPayment.bind(this, a)).then(this._completePayment.bind(this));
                    return (0,
                        p.timeoutPromise)(s, 2e4)["catch"](function(e) {
                        return t._handlePaymentError(e)
                    })
                }
            }, {
                key: "_onPaymentMethodSelected",
                value: function() {
                    return this._session.completePaymentMethodSelection((0,
                        He.totalFromCheckout)(this.checkout, this._merchantName), (0,
                        He.lineItemsFromCheckout)(this.checkout)),
                        Promise.resolve()
                }
            }, {
                key: "_fetchShippingRates",
                value: function() {
                    var e = this;
                    return !1 === this.checkout.requires_shipping ? (this.availableShippingRates = [],
                        this.checkout) : this.apiClient.getShippingRates(this.checkout.token).then(function(t) {
                        var n = t.shipping_rates;
                        return e.availableShippingRates = (0,
                            He.sortShippingRates)(n),
                            e.checkout
                    })
                }
            }, {
                key: "_setDefaultShippingRate",
                value: function() {
                    if (!this.checkout.requires_shipping)
                        return this.checkout;
                    var e = this.availableShippingRates || []
                        , t = e[0];
                    return t ? this._currentShippingRateAvailable(this.checkout, e) ? this.checkout : this._updateCheckout({
                        shipping_line: {
                            handle: t.id
                        }
                    }) : this.checkout
                }
            }, {
                key: "_currentShippingRateAvailable",
                value: function(e, t) {
                    return !!this.checkout.shipping_line && !!t.map(function(e) {
                        return e.id
                    }).includes(this.checkout.shipping_line.handle)
                }
            }, {
                key: "_getCheckout",
                value: function() {
                    var e = this;
                    return this.apiClient.getCheckout(this.checkout.token).then(function(t) {
                        return e.checkout = t.checkout
                    })
                }
            }, {
                key: "_updateCheckout",
                value: function(e) {
                    var t = this;
                    return this.apiClient.updateCheckout(this.checkout.token, {
                        checkout: e
                    }).then(function(e) {
                        return t.checkout = e.checkout
                    })
                }
            }, {
                key: "_submitPayment",
                value: function(e) {
                    return this._paymentInProgress = !0,
                        this.apiClient.createPayment(this.checkout.token, e)
                }
            }, {
                key: "_completePayment",
                value: function(e) {
                    var t = this;
                    this._paymentInProgress = !1;
                    var n = e.payment
                        , r = n && n.transaction
                        , i = void 0;
                    return n && n.payment_processing_error_message ? i = n.payment_processing_error_message : r && "success" !== r.status && "pending" !== r.status && (i = r.message || "Payment Transaction " + r.status),
                        i ? (this._handleErrors([i]),
                            e) : this._getCheckout().then(function(e) {
                            var n = e.order;
                            return t._session.completePayment(ApplePaySession.STATUS_SUCCESS),
                                n
                        }).then(function(e) {
                            return t._track("payment completed"),
                                e
                        }).then(function(e) {
                            return t._redirect(e.status_url)
                        })
                }
            }, {
                key: "_handlePaymentError",
                value: function(e) {
                    var t = this;
                    o(e) ? e.response.json().then(function(e) {
                        return a(e.errors)
                    }).then(function(e) {
                        return t._session.completePayment(e)
                    })["catch"](function() {
                        return t._session.completePayment(ApplePaySession.STATUS_FAILURE)
                    }) : "TimeoutPromiseError" === e.name && this._paymentInProgress ? (this.apiClient.stopPolling(),
                        this._session.abort(),
                        this._showErrors([(0,
                            Ve.errorFromCode)("payment_timeout")], "Payment in progress")) : this._session.completePayment(ApplePaySession.STATUS_FAILURE)
                }
            }, {
                key: "_displayInitialAddressError",
                value: function(e) {
                    if (o(e) && this._firstShippingContactSelected)
                        return this._session.completeShippingContactSelection(ApplePaySession.STATUS_INVALID_SHIPPING_POSTAL_ADDRESS, [], (0,
                            He.totalFromCheckout)(this.checkout, this._merchantName), (0,
                            He.lineItemsFromCheckout)(this.checkout)),
                            this._firstShippingContactSelected = !1,
                            this.checkout;
                    throw e
                }
            }, {
                key: "_handleStrategyError",
                value: function(e) {
                    var t = this;
                    if (o(e))
                        return e.response.json().then(function(e) {
                            var n = e.errors;
                            return n.base ? t._showErrors((0,
                                Ve.normalizeErrors)(n.base.map(function(e) {
                                return e.message
                            }))) : n
                        });
                    if (e && e.errorCode)
                        return this._showErrors((0,
                            Ve.normalizeErrors)((0,
                            Ve.errorFromCode)(e.errorCode)));
                    throw e
                }
            }, {
                key: "_catchPaymentRequestValidatorError",
                value: function(e) {
                    switch (e.message) {
                        case "Total amount must be greater than zero":
                            return this._handleErrors([(0,
                                Ve.errorFromCode)("total_price_zero")]);
                        case "Total amount is too big":
                            return this._handleErrors([(0,
                                Ve.errorFromCode)("total_price_too_big")]);
                        default:
                            return this._session.abort()
                    }
                }
            }, {
                key: "_trackCallback",
                value: function(e, t) {
                    var n = this;
                    return function(r) {
                        return t.call(n, r).then(n._track(e))
                    }
                }
            }, {
                key: "_handleErrors",
                value: function(e) {
                    var t = this;
                    this._sheetCancelled && !this._paymentInProgress || (this._showErrors && setTimeout(function() {
                        t._showErrors((0,
                            Ve.normalizeErrors)(e))
                    }, 200),
                        this._closeCallback(),
                        this._session.abort())
                }
            }, {
                key: "_handleResponseError",
                value: function(e) {
                    var t = this;
                    if (!o(e))
                        throw e;
                    e.response.json().then(function(e) {
                        var n = e.errors;
                        return t._handleErrors((0,
                            Ve.errorMessagesFromJson)(n))
                    })["catch"](function(e) {
                        throw e
                    })
                }
            }, {
                key: "_track",
                value: function(e) {
                    window.ShopifyAnalytics && ShopifyAnalytics.lib && ShopifyAnalytics.lib.track && ShopifyAnalytics.lib.track("Apple Pay slate - " + e, {
                        strategy: this.strategy.identifier,
                        checkoutToken: this.checkout && this.checkout.token
                    })
                }
            }, {
                key: "_redirect",
                value: function(e) {
                    window.location = e
                }
            }]),
                e
        }();
        t["default"] = s
    })
        , $e = e(function(e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var n = function() {
            function e() {
                var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
                    , n = t.apiClient
                    , i = t.type
                    , o = t.button;
                r(this, e),
                    this.gatewayParams = {
                        type: i
                    },
                    this.button = o,
                    this.setApiClient(n),
                    this.identifier = "NA"
            }
            return i(e, [{
                key: "setApiClient",
                value: function(e) {
                    this.apiClient = e
                }
            }, {
                key: "getCheckout",
                value: function(e) {
                    return this.apiClient.patch("/api/checkouts/" + e, this.params()).then(function(e) {
                        return e.checkout
                    })
                }
            }, {
                key: "createCheckout",
                value: function(e) {
                    return this.apiClient.post("/api/checkouts", this.params(e)).then(function(e) {
                        return e.checkout
                    })
                }
            }, {
                key: "params",
                value: function(e) {
                    return {
                        checkout: o({}, e, {
                            gateway_params: this.gatewayParams
                        })
                    }
                }
            }]),
                e
        }();
        t["default"] = n
    })
        , We = e(function(e, o) {
        "use strict";
        function s(e) {
            var t = (0,
                p.getClosest)(e.button, c) || document.querySelector(c);
            if (!t)
                return {};
            var n = t.elements.quantity
                , r = n ? n.value : 1;
            return {
                line_items: [{
                    variant_id: t.elements.id.value,
                    quantity: r
                }]
            }
        }
        Object.defineProperty(o, "__esModule", {
            value: !0
        });
        var u = a($e)
            , c = 'form[action^="/cart/add"]'
            , l = function(e) {
            function o() {
                var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
                    , t = e.apiClient
                    , i = e.type
                    , a = e.button;
                r(this, o);
                var s = n(this, (o.__proto__ || Object.getPrototypeOf(o)).call(this, {
                    apiClient: t,
                    type: i,
                    button: a
                }));
                return s.identifier = "product",
                    s
            }
            return t(o, e),
                i(o, [{
                    key: "build",
                    value: function() {
                        return this.createCheckout(s(this))
                    }
                }]),
                o
        }(u["default"]);
        o["default"] = l
    })
        , Je = e(function(e, o) {
        "use strict";
        Object.defineProperty(o, "__esModule", {
            value: !0
        });
        var s = a($e)
            , u = 'form[action^="/cart"]'
            , c = /^(https?:\/\/[^\/]+)?\/checkout\/poll/
            , l = function(e) {
            function o() {
                var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
                    , t = e.apiClient
                    , i = e.type
                    , a = e.button;
                r(this, o);
                var s = n(this, (o.__proto__ || Object.getPrototypeOf(o)).call(this, {
                    apiClient: t,
                    type: i,
                    button: a
                }));
                return s.identifier = "cart",
                    s
            }
            return t(o, e),
                i(o, [{
                    key: "build",
                    value: function() {
                        var e = this;
                        return this.updateCart().then(function(e) {
                            var t = e.token;
                            return t || Promise.reject({
                                errorCode: "empty_cart"
                            })
                        }).then(function(t) {
                            return e.createCheckout({
                                cart_token: t
                            })
                        })
                    }
                }, {
                    key: "createCheckout",
                    value: function(e) {
                        return e.secret = !0,
                            this.apiClient.post("/api/checkouts", this.params(e), {
                                poll: !1
                            }).then(this.handleThrottling.bind(this)).then(function(e) {
                                return e.checkout
                            })
                    }
                }, {
                    key: "handleThrottling",
                    value: function(e) {
                        if (202 === e.status && e.headers) {
                            var t = e.headers.get("Location");
                            return c.test(t) ? (this.redirectToQueue(),
                                Promise.reject()) : this.apiClient.get(t)
                        }
                        return e
                    }
                }, {
                    key: "updateCart",
                    value: function() {
                        return fetch("/cart", {
                            method: "POST",
                            body: this.formData(),
                            headers: {
                                Accept: "application/json"
                            },
                            credentials: "same-origin"
                        }).then(function(e) {
                            return e.json()
                        })
                    }
                }, {
                    key: "redirectToQueue",
                    value: function() {
                        var e = document.createElement("input");
                        e.type = "hidden",
                            e.name = "checkout",
                            e.value = "1",
                            this.form.appendChild(e),
                            this.form.submit()
                    }
                }, {
                    key: "formData",
                    value: function() {
                        var e = new FormData(this.form);
                        return e.append("__this_is_not_empty_form", "1"),
                            e
                    }
                }, {
                    key: "form",
                    get: function() {
                        return this._form ? this._form : (this._form = (0,
                            p.getClosest)(this.button, u) || document.querySelector(u),
                            this._form)
                    }
                }]),
                o
        }(s["default"]);
        o["default"] = l
    })
        , Ye = e(function(e, o) {
        "use strict";
        Object.defineProperty(o, "__esModule", {
            value: !0
        });
        var s = a($e)
            , u = function(e) {
            function o() {
                var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
                    , t = e.apiClient
                    , i = e.token
                    , a = e.type
                    , s = e.button;
                r(this, o);
                var u = n(this, (o.__proto__ || Object.getPrototypeOf(o)).call(this, {
                    apiClient: t,
                    type: a,
                    button: s
                }));
                return u.token = i,
                    u.identifier = "checkout",
                    u
            }
            return t(o, e),
                i(o, [{
                    key: "build",
                    value: function() {
                        return this.getCheckout(this.token)
                    }
                }]),
                o
        }(s["default"]);
        o["default"] = u
    })
        , Ke = e(function(e, t) {
        "use strict";
        function n(e, t, n) {
            window.ShopifyAnalytics && ShopifyAnalytics.lib && ShopifyAnalytics.lib.track && ShopifyAnalytics.lib.track(e + " button - " + t, {
                strategy: n
            })
        }
        function r(e) {
            var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Transaction unsuccessful";
            return DigitalWalletsDialog.showMessage({
                title: t,
                errors: e,
                button: "Return to checkout"
            })
        }
        function i(e, t) {
            return a(e, "cart", t)
        }
        function o(e, t) {
            return a(e, "product", t)
        }
        function a(e, t) {
            var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "Transaction unsuccessful";
            return Shopify.StorefrontExpressButtons.DigitalWalletsDialog.showMessage({
                title: n,
                errors: e,
                button: "Return to " + t
            })
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
            t.track = n,
            t.checkoutShowErrors = r,
            t.cartShowErrors = i,
            t.productShowErrors = o
    })
        , Ze = e(function(e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var n = a(We)
            , o = a(Je)
            , s = a(Ye)
            , u = a(m)
            , c = function() {
            function e(t, i) {
                if (r(this, e),
                    this.strategyName = t.getAttribute("data-strategy"),
                    !this.strategyName)
                    throw new Error("Unspecified strategy");
                this.button = t,
                    this.apiClient = new u["default"],
                    this.requireActiveCard = !1;
                var a = {
                    apiClient: this.apiClient,
                    token: Shopify.Checkout.token,
                    type: i,
                    button: t
                };
                switch (this.strategyName) {
                    case "cart":
                        this.strategy = new o["default"](a),
                            this.showErrors = Ke.cartShowErrors;
                        break;
                    case "product":
                        this.strategy = new n["default"](a),
                            this.requireActiveCard = !0,
                            this.showErrors = Ke.productShowErrors;
                        break;
                    case "checkout":
                        this.strategy = new s["default"](a),
                            this.showErrors = Ke.checkoutShowErrors,
                            this.apiClient.host = Shopify.Checkout.apiHost
                }
            }
            return i(e, [{
                key: "init",
                value: function() {
                    throw new Error("You must overwrite the init method.")
                }
            }]),
                e
        }();
        t["default"] = c
    })
        , Xe = e(function(e, o) {
        "use strict";
        function s(e, t) {
            e.style.display = e.getAttribute("data-display-value") || "inline-block",
                (0,
                    Ke.track)(y, "shown", t)
        }
        function u(e) {
            e.preventDefault(),
                (0,
                    Ke.track)(y, "clicked", this.strategy.identifier),
                this.disableButton();
            var t = new ApplePaySession(d,c(this.merchantCapabilities));
            new h["default"]({
                merchantName: this.merchantCapabilities.merchantName,
                apiClient: this.apiClient,
                strategy: this.strategy,
                shopId: this.shopId,
                showErrors: this.showErrors,
                closeCallback: this.enableButton,
                session: t
            }).begin()
        }
        function c(e) {
            var t = e.merchantName
                , n = l(e, ["merchantName"]);
            return n.total = {
                type: "pending",
                label: t,
                amount: "1.00"
            },
                n
        }
        Object.defineProperty(o, "__esModule", {
            value: !0
        });
        var h = a(Ge)
            , f = a(Ze)
            , d = 1
            , y = "Apple Pay"
            , m = function(e) {
            function o(e) {
                r(this, o);
                var t = n(this, (o.__proto__ || Object.getPrototypeOf(o)).call(this, e, "apple_pay_web"));
                return t.disableButton = function() {
                    t.button.disabled = !0
                }
                    ,
                    t.enableButton = function() {
                        t.button.disabled = !1
                    }
                    ,
                    t
            }
            return t(o, e),
                i(o, [{
                    key: "init",
                    value: function() {
                        var e = this;
                        return (0,
                            p.getCapabilities)("apple-pay-shop-capabilities").then(function(t) {
                            var n = t.shopId
                                , r = t.merchantId
                                , i = l(t, ["shopId", "merchantId"]);
                            return e.shopId = n,
                                e.merchantId = r,
                                e.merchantCapabilities = i,
                                e.canMakePayments().then(function(t) {
                                    return t ? (s(e.button, e.strategy.identifier),
                                        e.button.addEventListener("click", u.bind(e)),
                                        Promise.resolve(e)) : Promise.reject(new Error("Apple Pay canMakePayments is false"))
                                })
                        })
                    }
                }, {
                    key: "canMakePayments",
                    value: function() {
                        var e = this;
                        if (!window.ApplePaySession)
                            return Promise.resolve(!1);
                        var t = ApplePaySession.canMakePaymentsWithActiveCard(this.merchantId).then(function(t) {
                            return (0,
                                Ke.track)(y, "canMakePaymentsWithActiveCard: " + t, e.strategy.identifier),
                                t
                        });
                        return this.requireActiveCard ? t : Promise.resolve(ApplePaySession.canMakePayments())
                    }
                }]),
                o
        }(f["default"]);
        o["default"] = m
    })
        , Qe = e(function(e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var n = function() {
            function e(t) {
                var n = t.target
                    , i = t.targetOrigin
                    , o = t.onMessageFn
                    , a = t.verifyOriginFn;
                r(this, e),
                    window.addEventListener("message", this.receive.bind(this)),
                    this.target = n,
                    this.targetOrigin = i,
                    this.onMessageFn = o,
                    this.verifyOriginFn = a
            }
            return i(e, [{
                key: "send",
                value: function(e) {
                    var t = JSON.stringify(e);
                    this.target.postMessage(t, this.targetOrigin)
                }
            }, {
                key: "receive",
                value: function(e) {
                    if (this.verifyOriginFn(e.origin))
                        try {
                            var t = JSON.parse(e.data);
                            this.onMessageFn(t)
                        } catch (t) {
                            console.log("Error parsing the event", e)
                        }
                }
            }]),
                e
        }();
        t["default"] = n
    })
        , et = e(function(e, o) {
        "use strict";
        function s() {
            if (!(f.querySelectorAll("ul.alt-payment-list > li").length > 1)) {
                var e = f.querySelector("[data-alternative-payment-separator]");
                e && (e.className += " hidden")
            }
        }
        function u(e) {
            return new URL(e).origin
        }
        Object.defineProperty(o, "__esModule", {
            value: !0
        });
        var c = a(Ze)
            , l = a(Qe)
            , h = "Google Pay"
            , f = void 0
            , d = function(e) {
            function o(e) {
                r(this, o);
                var t = n(this, (o.__proto__ || Object.getPrototypeOf(o)).call(this, e, "google_pay_web"));
                return t.handleErrors = function() {
                    t.showErrors.apply(t, arguments)
                }
                    ,
                    f = (0,
                        p.getDocumentContext)(e),
                    t.iframe = f.querySelector("iframe.gpay-iframe"),
                    t
            }
            return t(o, e),
                i(o, [{
                    key: "init",
                    value: function() {
                        var e = this;
                        return this.iframe ? (this.isOnCart() && this.sendCartOnFormUpdate(),
                            this.iframe.onload = function() {
                                e.sendResource(),
                                    e.iframeOrigin = u(e.iframe.src),
                                    e.iframeClient = new l["default"]({
                                        target: e.iframe.contentWindow,
                                        targetOrigin: e.iframeOrigin,
                                        onMessageFn: e.onMessageReceived.bind(e),
                                        verifyOriginFn: e.verifyOrigin.bind(e)
                                    })
                            }
                            ,
                            Promise.resolve()) : Promise.reject("iframe could not be found")
                    }
                }, {
                    key: "verifyOrigin",
                    value: function(e) {
                        return e === this.iframeOrigin
                    }
                }, {
                    key: "onMessageReceived",
                    value: function(e) {
                        if (e.google_pay) {
                            var t = e.google_pay;
                            "available"in t ? t.available ? ((0,
                                Ke.track)(h, "shown", this.strategy.identifier),
                                this.button.setAttribute("style", "display:inline-block;")) : s() : t.redirect ? ((0,
                                Ke.track)(h, "redirected", this.strategy.identifier),
                                this.redirect(t.redirect)) : t.instrumentError ? ((0,
                                Ke.track)(h, "errored", this.strategy.identifier),
                                this.handleErrors(t.instrumentError)) : t.clicked && (0,
                                Ke.track)(h, "clicked", this.strategy.identifier),
                                this.hook()
                        }
                    }
                }, {
                    key: "sendResource",
                    value: function() {
                        this.isOnCart() ? this.sendCart() : this.isOnCheckout() && this.sendCheckout()
                    }
                }, {
                    key: "sendCartOnFormUpdate",
                    value: function() {
                        var e = this;
                        this.form = (0,
                            p.getClosest)(this.button, "form");
                        try {
                            new MutationObserver((0,
                                p.debounce)(function() {
                                return e.sendCart.bind(e)
                            }, 200)).observe(this.form, {
                                subtree: !0,
                                attributes: !0
                            })
                        } catch (e) {
                            console.log("GooglePayButton", e)
                        }
                    }
                }, {
                    key: "sendCart",
                    value: function() {
                        var e = this;
                        this.strategy.updateCart().then(function(t) {
                            e.sendMessage({
                                cart: {
                                    token: t.token,
                                    currency: t.currency,
                                    price: t.total_price / 100
                                }
                            })
                        })
                    }
                }, {
                    key: "sendCheckout",
                    value: function() {
                        var e = this;
                        Shopify.Checkout.token && this.strategy.apiClient.getCheckout(Shopify.Checkout.token).then(function(t) {
                            var n = t.checkout;
                            e.sendMessage({
                                checkout: {
                                    token: n.token,
                                    currency: n.currency,
                                    price: n.total_price
                                }
                            })
                        })
                    }
                }, {
                    key: "isOnCart",
                    value: function() {
                        return "cart" === this.strategy.identifier
                    }
                }, {
                    key: "isOnCheckout",
                    value: function() {
                        return "checkout" === this.strategy.identifier
                    }
                }, {
                    key: "sendMessage",
                    value: function(e) {
                        this.iframeClient.send({
                            google_pay: e
                        })
                    }
                }, {
                    key: "redirect",
                    value: function(e) {
                        window.location.assign(e)
                    }
                }, {
                    key: "hook",
                    value: function() {}
                }]),
                o
        }(c["default"]);
        o["default"] = d
    })
        , tt = e(function(e, t) {
        "use strict";
        function n() {
            if ("undefined" != typeof window.paypal)
                return Promise.resolve();
            var e = "https://www.paypalobjects.com/api/checkout.min.js";
            return new Promise(function(t) {
                    var n = document.querySelector('script[src="' + e + '"]');
                    null === n ? (n = document.createElement("script"),
                        n.setAttribute("src", e),
                        n.addEventListener("load", t),
                        document.body.appendChild(n)) : n.addEventListener("load", t)
                }
            )
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
            t.ensureScriptLoaded = n
    })
        , nt = e(function(e, o) {
        "use strict";
        function s(e) {
            var t = {
                key: this.strategy.apiClient.secretKey
            };
            return "cart" === this.strategy.identifier && (t.from_cart = !0),
                this.strategy.apiClient.post("/" + this.metadata.shopId + "/checkouts/" + e.token + "/paypal/tokens", t)
        }
        function u(e) {
            return this.redirectUrl = e.redirect_url,
                e
        }
        function c(e) {
            var t = this;
            return e.response && e.response.json ? e.response.json().then(function(e) {
                var n = e.message;
                return t.showErrors([n], "Something went wrong")
            }) : this.showErrors(["There was a problem with the payment service. Please select a different payment method or try again later."], "Something went wrong")
        }
        function l() {
            var e = document.getElementById("noscript-paypal-replacement");
            e && e.parentNode.removeChild(e)
        }
        function h(e, t) {
            return "checkout" === e ? g[e + "-" + t] : g[e]
        }
        function f(e) {
            var t = e.match(b);
            return null !== t ? t[1] : ""
        }
        function d(e) {
            e && e.setAttribute("data-button-rendered", !0)
        }
        function y(e) {
            if (e) {
                return !!(0,
                    p.dataset)(e).buttonRendered
            }
            return !1
        }
        Object.defineProperty(o, "__esModule", {
            value: !0
        });
        var m = a(Ze)
            , v = "PayPalV4"
            , b = /alt-payment-list__item--paypal-btn--(\w*)/
            , g = {
            "checkout-mobile": 54,
            "checkout-desktop": 42,
            cart: 44,
            product: 40
        }
            , _ = function(e) {
            function o(e) {
                return r(this, o),
                    e.id = e.id || (0,
                        p.generateRandomId)(),
                    n(this, (o.__proto__ || Object.getPrototypeOf(o)).call(this, e))
            }
            return t(o, e),
                i(o, [{
                    key: "init",
                    value: function() {
                        var e = this;
                        return (0,
                            tt.ensureScriptLoaded)().then(function() {
                            return e.createButton()
                        })
                    }
                }, {
                    key: "createButton",
                    value: function() {
                        if (y(this.button))
                            return Promise.reject("PayPal Button was already rendered");
                        if (this.metadata = (0,
                            p.dataset)(document.getElementById("in-context-paypal-metadata")),
                            this.sizeClass = f(this.button.className),
                            !this.metadata)
                            return Promise.reject("PayPal metadata was not found");
                        if ("true" !== this.metadata.paypalV4)
                            return Promise.reject("PayPal V4 not enabled");
                        try {
                            return l(),
                                this.render(),
                                Promise.resolve(this)
                        } catch (e) {
                            return c(e),
                                Promise.reject(e)
                        }
                    }
                }, {
                    key: "payment",
                    value: function() {
                        return (0,
                            Ke.track)(v, "clicked", this.strategy.identifier),
                            this.strategy.build().then(s.bind(this)).then(u.bind(this)).then(function(e) {
                                return e.token
                            })["catch"](c.bind(this))
                    }
                }, {
                    key: "handleAuthorize",
                    value: function(e) {
                        (0,
                            Ke.track)(v, "redirecting", this.strategy.identifier),
                            (0,
                                p.redirect)(this.redirectUrl + "&PayerID=" + e.payerID)
                    }
                }, {
                    key: "handleRememberedUser",
                    value: function() {
                        (0,
                            Ke.track)(v, "remembered_user", this.strategy.identifier)
                    }
                }, {
                    key: "render",
                    value: function() {
                        window.paypal.Button.render({
                            env: this.metadata.environment,
                            commit: !1,
                            style: {
                                label: "paypal",
                                layout: "horizontal",
                                color: "gold",
                                shape: "rect",
                                size: "responsive",
                                maxbuttons: 1,
                                tagline: !1,
                                height: h(this.strategyName, this.sizeClass)
                            },
                            payment: this.payment.bind(this),
                            onAuthorize: this.handleAuthorize.bind(this),
                            onRememberUser: this.handleRememberedUser.bind(this)
                        }, this.button.id),
                            d(this.button),
                            (0,
                                Ke.track)(v, "shown", this.strategy.identifier)
                    }
                }]),
                o
        }(m["default"]);
        o["default"] = _
    })
        , rt = e(function(e, o) {
        "use strict";
        Object.defineProperty(o, "__esModule", {
            value: !0
        });
        var s = a(nt)
            , u = function(e) {
            function o() {
                return r(this, o),
                    n(this, (o.__proto__ || Object.getPrototypeOf(o)).apply(this, arguments))
            }
            return t(o, e),
                i(o, [{
                    key: "render",
                    value: function() {
                        window.paypal.Button.render({
                            env: this.metadata.environment,
                            commit: !1,
                            style: {
                                label: "venmo",
                                layout: "horizontal",
                                shape: "rect",
                                color: "blue",
                                size: "responsive",
                                maxbuttons: 1,
                                tagline: !1,
                                height: 42
                            },
                            payment: this.payment.bind(this),
                            onAuthorize: this.handleAuthorize.bind(this),
                            onRememberUser: this.handleRememberedUser.bind(this)
                        }, this.button.id),
                            markAsRendered(this.button)
                    }
                }]),
                o
        }(s["default"]);
        o["default"] = u
    })
        , it = e(function(e, t) {
        "use strict";
        function n(e) {
            var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
            if (d = [],
                !e)
                return Promise.reject(new Error("No checkout buttons provided"));
            for (var n = new s["default"], i = f.length - 1; i >= 0; i--)
                r(f[i], e[f[i]], n, t);
            return Promise.all(d).then(function(e) {
                return e.filter(function(e) {
                    return e
                })
            })
        }
        function r(e, t, n, r) {
            var o = r.querySelectorAll(t);
            if (o.length)
                for (var a = o.length - 1; a >= 0; a--)
                    d.push(i(e, o[a], n)["catch"](function() {
                        return !1
                    }))
        }
        function i(e, t) {
            try {
                if (p[e])
                    return p[e](t);
                throw new Error("Invalid checkout method " + e)
            } catch (e) {
                return o(e),
                    Promise.reject(e)
            }
        }
        function o(e) {
            console.error("Error" === e.constructor.name ? e.message : e)
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
            t["default"] = n;
        var s = a(m)
            , u = a(Xe)
            , c = a(et)
            , l = a(nt)
            , h = a(rt)
            , f = ["applePay", "googlePay", "paypal", "venmo"]
            , d = void 0
            , p = {
            applePay: function(e) {
                return new u["default"](e).init()
            },
            googlePay: function(e) {
                return new c["default"](e).init()
            },
            paypal: function(e) {
                return new l["default"](e).init()
            },
            venmo: function(e) {
                return new h["default"](e).init()
            }
        }
    })
        , ot = e(function(e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var n = Symbol("targetSymbol")
            , o = Symbol("actionQueueSymbol")
            , a = Symbol("finishedLoadingSymbol")
            , s = function() {
            function e(t) {
                var i = this
                    , s = arguments.length > 1 && arguments[1] !== undefined && arguments[1];
                if (r(this, e),
                    this[o] = [],
                    this[a] = !1,
                    s) {
                    var u = t.onload;
                    t.onload = function() {
                        u && u(),
                            i[n] = t,
                            i[a] = !0,
                            i[o].forEach(function(e) {
                                return e()
                            })
                    }
                } else
                    this[n] = t,
                        this[a] = !0
            }
            return i(e, [{
                key: "postMessage",
                value: function(e) {
                    var t = this
                        , r = function() {
                        e.digitalWalletsDialog = !0,
                            t[n].postMessage(e, t[n].location)
                    };
                    this[a] ? r() : this[o].push(function() {
                        r()
                    })
                }
            }]),
                e
        }();
        t["default"] = s
    })
        , at = e(function(e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var n = t.EVENTS_PREFIX = "DigitalWalletsDialog";
        t.DIALOG_CHANGE = n + ":change",
            t.DIALOG_CHANGED = n + ":changed",
            t.DIALOG_DISMISSED = n + ":dismissed",
            t.IFRAME_SHOWN = n + ":iframe_shown",
            t.IFRAME_HIDDEN = n + ":iframe_hidden",
            t.HTML_ESCAPED_CHARACTERS = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
                "/": "&#x2F;",
                "`": "&#x60;",
                "=": "&#x3D;"
            }
    })
        , st = e(function(e, t) {
        "use strict";
        function n(e) {
            e[d] = new h["default"](e[f].contentWindow,!0)
        }
        function o(e, t) {
            e[f] = document.createElement("iframe"),
                e[f].src = t,
                e[f].style.position = "fixed",
                e[f].style.top = 0,
                e[f].style.left = 0,
                e[f].style.zIndex = 99999,
                e[f].style.height = 0,
                e[f].style.width = 0,
                e[f].style.border = 0,
                e[f].scrolling = "no",
                e[f].tabIndex = "-1",
                e[f].setAttribute("aria-hidden", !0),
                document.body.appendChild(e[f])
        }
        function s(e, t) {
            switch (t.data.type) {
                case at.DIALOG_CHANGED:
                    m = window.pageYOffset,
                        u(e[f], !0),
                        c(!0),
                        l(e, at.IFRAME_SHOWN),
                        e[d].postMessage({
                            type: at.IFRAME_SHOWN
                        });
                    break;
                case at.DIALOG_DISMISSED:
                    u(e[f], !1),
                        c(!1, m),
                        l(e, at.IFRAME_HIDDEN);
                    break;
                default:
                    return
            }
        }
        function u(e, t) {
            var n = t ? "100%" : "0";
            e.style.height = n,
                e.style.width = n,
                t ? (e.removeAttribute("tabindex"),
                    e.removeAttribute("aria-hidden")) : (e.tabIndex = "-1",
                    e.setAttribute("aria-hidden", !0))
        }
        function c(e) {
            var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            document.documentElement.style.overflow = e ? "hidden" : "visible",
                document.documentElement.style.height = e ? "100%" : "auto",
                document.body.style.overflow = e ? "hidden" : "visible",
                document.body.style.height = e ? "100%" : "auto",
                window.scrollTo(0, t)
        }
        function l(e, t) {
            if (-1 !== p.indexOf(t)) {
                var n = new Event(t);
                e[f].dispatchEvent(n)
            }
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var h = a(ot)
            , f = Symbol("iframeSymbol")
            , d = Symbol("messengerSymbol")
            , p = [at.IFRAME_SHOWN, at.IFRAME_HIDDEN]
            , y = void 0
            , m = void 0
            , v = function() {
            function e(t) {
                var i = this;
                return r(this, e),
                y || (y = this,
                    o(this, t),
                    n(this),
                    this._messageHandler = function(e) {
                        e.data && e.data.type && e.data.digitalWalletsDialog && s(i, e)
                    }
                    ,
                    window.addEventListener("message", this._messageHandler)),
                    y
            }
            return i(e, [{
                key: "showMessage",
                value: function(e) {
                    return this[d].postMessage({
                        payload: e,
                        type: at.DIALOG_CHANGE
                    })
                }
            }, {
                key: "destroy",
                value: function() {
                    null !== this[f] && this[f].remove(),
                        y = null,
                        this[f] = null,
                        this[d] = null,
                        window.removeEventListener("message", this._messageHandler),
                        c(!1)
                }
            }]),
                e
        }();
        t["default"] = v
    })
        , ut = e(function(e, t) {
        "use strict";
        function n() {
            if (!Shopify.StorefrontExpressButtons.DigitalWalletsDialog) {
                var e = document.getElementById("shopify-digital-wallet");
                e && (Shopify.StorefrontExpressButtons.DigitalWalletsDialog = new r["default"](e.getAttribute("content")))
            }
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
            t["default"] = n;
        var r = a(st)
    })
        , ct = e(function(e, t) {
        "use strict";
        function n() {
            var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "//www.paypalobjects.com/api/checkout.min.js";
            if (!(document.querySelectorAll('script[src*="' + e + '"]').length > 0)) {
                var t = document.createElement("script");
                t.src = e,
                    window.paypalCheckoutReady = r,
                    document.body.appendChild(t)
            }
        }
        function r() {
            o() && (a("Paypal V4", {
                event_type: "available"
            }),
                i(function(e) {
                    return e ? a("Paypal V4", {
                        event_type: "remembered-user"
                    }) : null
                }))
        }
        function i(e) {
            o() && paypal.isFundingRemembered(paypal.FUNDING.PAYPAL).then(e)
        }
        function o() {
            return "object" === ("undefined" == typeof paypal ? "undefined" : c(paypal)) && "function" == typeof paypal.isFundingRemembered && "object" === c(paypal.FUNDING) && "string" == typeof paypal.FUNDING.PAYPAL
        }
        function a() {
            var e;
            "object" === ("undefined" == typeof ShopifyAnalytics ? "undefined" : c(ShopifyAnalytics)) && "object" === c(ShopifyAnalytics.lib) && "function" == typeof ShopifyAnalytics.lib.track && (e = ShopifyAnalytics.lib).track.apply(e, arguments)
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
            t.loadPaypalV4WithVisibilityTracking = n,
            t.trackPaypalV4Visibility = r,
            t.paypalV4Visibility = i
    });
    e(function() {
        "use strict";
        var e = a(be)
            , t = a(it)
            , n = a(ut)
            , r = a(w)
            , i = document.querySelectorAll("#paypal-express-button");
        "undefined" != typeof ShopifyPaypalV4VisibilityTracking && i.length > 0 && (0,
            ct.loadPaypalV4WithVisibilityTracking)(),
            Shopify.StorefrontExpressButtons.initialize = function() {
                (0,
                    t["default"])({
                    applePay: ".additional-checkout-button--apple-pay",
                    paypal: ".additional-checkout-button--paypal",
                    googlePay: ".additional-checkout-button--google-pay"
                }),
                    AmazonPaymentsPayButton(),
                    Shopify.StorefrontExpressButtons.ExpressCheckout.initialize(),
                    (0,
                        n["default"])(),
                    (0,
                        r["default"])()
            }
            ,
            (0,
                e["default"])(Shopify.StorefrontExpressButtons.initialize)
    })
}("undefined" != typeof global ? global : "undefined" != typeof window && window);
