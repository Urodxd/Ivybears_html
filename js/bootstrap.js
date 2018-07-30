if (typeof yoApp == "undefined" || !yoApp) {
    String.prototype.replaceFull = function(stringReplaceFrom, stringReplaceTo) {
        var newString = this;
        return newString.replace(new RegExp(stringReplaceFrom.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"),"g"), stringReplaceTo)
    }
    ;
    var yoApp = {
        ready: !0,
        closed: !1,
        Base64: {
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            decode: function(e) {
                var t = "";
                var n, r, i;
                var s, o, u, a;
                var f = 0;
                e = e.replace(/[^A-Za-z0-9+/=]/g, "");
                while (f < e.length) {
                    s = this._keyStr.indexOf(e.charAt(f++));
                    o = this._keyStr.indexOf(e.charAt(f++));
                    u = this._keyStr.indexOf(e.charAt(f++));
                    a = this._keyStr.indexOf(e.charAt(f++));
                    n = s << 2 | o >> 4;
                    r = (o & 15) << 4 | u >> 2;
                    i = (u & 3) << 6 | a;
                    t = t + String.fromCharCode(n);
                    if (u != 64) {
                        t = t + String.fromCharCode(r)
                    }
                    if (a != 64) {
                        t = t + String.fromCharCode(i)
                    }
                }
                t = yoApp.Base64._utf8_decode(t);
                return t
            },
            _utf8_decode: function(e) {
                var t = "";
                var n = 0;
                var r = c1 = c2 = 0;
                while (n < e.length) {
                    r = e.charCodeAt(n);
                    if (r < 128) {
                        t += String.fromCharCode(r);
                        n++
                    } else if (r > 191 && r < 224) {
                        c2 = e.charCodeAt(n + 1);
                        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                        n += 2
                    } else {
                        c2 = e.charCodeAt(n + 1);
                        c3 = e.charCodeAt(n + 2);
                        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                        n += 3
                    }
                }
                return t
            }
        },
        timer: function(e, i) {
            var t, n, o = i;
            this.pause = function() {
                window.clearTimeout(t),
                    o -= new Date - n
            }
                ,
                this.resume = function() {
                    n = new Date,
                        window.clearTimeout(t),
                        t = window.setTimeout(e, o)
                }
                ,
                this.resume()
        },
        init: function() {
            // Google Fonts append
            var fonts = document.createElement("link");
            fonts.type = "text/css";
            fonts.rel = "stylesheet";
            fonts.href = "https://fonts.googleapis.com/css?family=Lato:400,300,700,400italic,700italic";
            document.head.appendChild(fonts);

            // Random value to avoid cache
            var time = Math.ceil((new Date).getTime() / 1e3 / 40) * 40;

            // Script element
            var yoScript = document.createElement("script");
            yoScript.src = yoApp.eventsScriptURL + "?t=" + time;
            document.getElementsByTagName("head")[0].appendChild(yoScript);

            // Remove disable
            if (document.URL.indexOf("reset=yo") > -1) {
                // Remove item from local storage
                localStorage.removeItem("disable-yo-" + yoApp.appId);
                yoApp.fresh();
            }
        },
        randomTimestamp: function(t, a) {
            var timestamp = Math.floor(Date.now() / 1e3);
            var value = Math.floor(Math.random() * (a - t + 1)) + t;
            return timestamp - value;
        },
        xhr: function() {
            try {
                return new XMLHttpRequest();
            } catch (error) {}

            try {
                return new ActiveXObject('Msxml2.XMLHTTP.6.0');
            } catch (error) {}

            try {
                return new ActiveXObject('Msxml2.XMLHTTP.3.0');
            } catch (error) {}

            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            } catch (error) {}

            try {
                return new ActiveXObject('Microsoft.XMLHTTP');
            } catch (error) {}

            return false;
        },
        meta: function(c) {
            for (var b = document.getElementsByTagName("meta"), a = 0; a < b.length; a++) {
                if (c == b[a].name || c == b[a].getAttribute("property")) {
                    return b[a].content;
                }
            }

            return null;
        },
        setStyles: function() {
            // Dispatch event Init
            try {
                document.dispatchEvent(new CustomEvent("yo::init",{}));
            } catch (Error) {}

            // Create style element
            var yoStyle = document.createElement("style");
            yoStyle.innerHTML = yoApp.settings.themeCSS;
            document.head.appendChild(yoStyle);

            // Append custom css
            if (yoApp.settings.customCss) {
                var yoCustomStyle = document.createElement("style");
                yoCustomStyle.innerHTML = yoApp.settings.customCss;
                document.head.appendChild(yoCustomStyle);
            }

            // Append custom js
            if (yoApp.settings.customJs) {
                var yoCustomScript = document.createElement("script");
                yoCustomScript.innerHTML = "try{" + yoApp.settings.customJs + "} catch(err) {console.log(err.message);}";
                document.head.appendChild(yoCustomScript);
            }
        },
        isActive: function() {
            // Is active
            if (yoApp.meta('yo:active') === "false") {
                return false;
            }

            // Disable on checkout page
            if (window.location.href.indexOf("/checkout") > -1) {
                return false;
            }

            // Check if hidden on mobile
            if (yoApp.settings.hideOnMobile && yoApp.isMobile()) {
                return false;
            }

            // Disable on IE
            if (!(yoApp.isIE() || 7 !== yoApp.isIE() && 8 !== yoApp.isIE())) {
                return false;
            }

            if (yoApp.settings.closable && localStorage.getItem("disable-yo-" + yoApp.appId)) {
                var old = localStorage.getItem("disable-yo-" + yoApp.appId);
                var currentTime = (new Date).getTime();

                // Check if it was disabled for more than 7 days
                if (Math.floor((currentTime - old) / 1e3) > 604800) {
                    localStorage.removeItem("disable-yo-" + yoApp.appId);
                    return true;
                }

                return false;

            }

            return true;

        },
        isMobile: function() {
            return !!(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4)));
        },
        isIE: function() {
            var userAgent = navigator.userAgent.toLowerCase();
            return -1 != userAgent.indexOf("msie") ? parseInt(userAgent.split("msie")[1]) : !1
        },
        utcString: function(e) {
            var date = new Date(e * 1000);

            return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate() + "T" + date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds() + "Z";
        },
        timeago: function(enableTimestampTimer) {
            var cnt = 0
                , indexMapEn = 'second_minute_hour_day_week_month_year'.split('_')
                , locales = {
                'en': function(number, index) {
                    if (index === 0) {
                        return ['just now', 'right now'];
                    }
                    var unit = indexMapEn[parseInt(index / 2)];
                    if (number > 1) {
                        unit += 's';
                    }
                    return [number + ' ' + unit + ' ago', 'in ' + number + ' ' + unit];
                }
            }
                , SEC_ARRAY = [60, 60, 24, 7, 365 / 7 / 12, 12]
                , SEC_ARRAY_LEN = 6
                , ATTR_DATETIME = 'datetime';

            function toDate(input) {
                input = (input || '').trim().replace(/\.\d+/, '');
                input = (input || '').trim().replace(/\.\d+/, '').replace(/-/, '/').replace(/-/, '/').replace(/T/, ' ').replace(/Z/, ' UTC').replace(/([\+\-]\d\d)\:?(\d\d)/, ' $1$2');
                return new Date(input);
            }

            function formatDiff(diff, locale, defaultLocale) {
                locale = locales[locale] ? locale : (locales[defaultLocale] ? defaultLocale : 'en');
                var i = 0
                    , agoin = diff < 0 ? 1 : 0;
                diff = Math.abs(diff);
                for (; diff >= SEC_ARRAY[i] && i < SEC_ARRAY_LEN; i++) {
                    diff /= SEC_ARRAY[i];
                }
                diff = parseInt(diff);
                i *= 2;

                if (diff > (i === 0 ? 9 : 1)) {
                    i += 1;
                }
                return locales[locale](diff, i)[agoin].replace('%s', diff);
            }

            function diffSec(date, nowDate) {
                nowDate = nowDate ? toDate(nowDate) : new Date();
                return (nowDate - toDate(date)) / 1000;
            }

            function nextInterval(diff) {
                var rst = 1
                    , i = 0
                    , d = Math.abs(diff);
                for (; diff >= SEC_ARRAY[i] && i < SEC_ARRAY_LEN; i++) {
                    diff /= SEC_ARRAY[i];
                    rst *= SEC_ARRAY[i];
                }
                d = d % rst;
                d = d ? rst - d : rst;
                return Math.ceil(d);
            }

            function getDateAttr(node) {
                if (node.getAttribute) {
                    return node.getAttribute(ATTR_DATETIME);
                }
                if (node.attr) {
                    return node.attr(ATTR_DATETIME);
                }
            }

            function Timeago(nowDate, defaultLocale) {
                var timers = {};
                if (!defaultLocale) {
                    defaultLocale = 'en';
                }
                function doRender(node, date, locale, cnt) {
                    if (date) {
                        var diff = diffSec(date, nowDate);

                        node.innerHTML = formatDiff(diff, locale, defaultLocale);
                        if (enableTimestampTimer) {
                            timers['k' + cnt] = setTimeout(function() {
                                doRender(node, date, locale, cnt);
                            }, nextInterval(diff) * 1000);
                        }
                    }
                }

                this.render = function(nodes, locale) {
                    if (nodes.length === undefined) {
                        nodes = [nodes];
                    }
                    for (var i = 0; i < nodes.length; i++) {
                        doRender(nodes[i], getDateAttr(nodes[i]), locale, ++cnt);
                        // render item
                    }
                }
                ;
                return this;
            }

            function timeagoFactory(nowDate, defaultLocale) {
                return new Timeago(nowDate,defaultLocale);
            }

            timeagoFactory.register = function(locale, localeFunc) {
                locales[locale] = localeFunc;
            }
            ;

            return timeagoFactory;
        },
        collect: function(data) {
            // Check if data is passed and collect is active
            if (typeof data == "object" && typeof yoApp.settings.analytic_id != "undefined" && yoApp.settings.analytic_id) {
                try {
                    // Set common data
                    data.e_c = 'yo';
                    //data.e_v = '1';
                    data.id = yoApp.settings.analytic_id;
                    //data.rec = '1';
                    //data.url = encodeURIComponent( window.location.href );

                    // Send collect to remote
                    var y = yoApp.xhr();
                    y.open('POST', yoApp.statsUrl + 'collect', 1);
                    y.setRequestHeader('Content-Type', 'application/json');
                    y.send(JSON.stringify(data));
                } catch (error) {}
            }
        },
        objToQuery: function(json) {
            return Object.keys(json).map(function(key) {
                return key + '=' + json[key];
            }).join('&');
        },
        shuffle: function(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

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
        },
        setup: function(eventDetails) {
            // Check if current page is product page
            if (yoApp.meta('og:type') == 'product') {
                yoApp.currentProduct = {};
                yoApp.currentProduct.title = yoApp.meta('og:title');
                yoApp.currentProduct.image = yoApp.meta('og:image:secure_url') ? yoApp.meta('og:image:secure_url') : yoApp.meta('og:image');
                yoApp.currentProduct.url = yoApp.meta('og:url');
            }

            // If random notifications should be displayed
            if (typeof yoApp.settings.randomize != "undefined" && yoApp.settings.randomize) {
                eventDetails = yoApp.shuffle(eventDetails);
            }

            // Dispatch Event Initialized
            try {
                document.dispatchEvent(new CustomEvent("yo::initialized",{}));
            } catch (Error) {}

            // Check if active
            if (yoApp.isActive()) {
                // Set recent events
                yoApp.recentEventDetails = eventDetails;

                // Main holder Div
                var $yoHolder = document.createElement("div");
                $yoHolder.id = "yoHolder";
                $yoHolder.className = "yoHolder personalized " + yoApp.settings.themeStyle;

                // Inner holder div
                var $yoInnerHolder = document.createElement("div");
                $yoInnerHolder.className = "yo-notification";
                $yoInnerHolder.id = "yoInnerHolder";

                // Append Inner holder to main holder
                $yoHolder.appendChild($yoInnerHolder);

                // Append to body
                document.body.appendChild($yoHolder);

                // Get main holder object
                yoApp.yoHolder = document.getElementById("yoHolder");

                // Pause on hover
                yoApp.yoHolder.addEventListener("mouseover", function() {
                    yoApp.pause()
                });

                // Resume on Mouse out
                yoApp.yoHolder.addEventListener("mouseout", function() {
                    yoApp.resume()
                });

                // Set run time
                setTimeout(yoApp.run, yoApp.settings.initialDelay + 1);
            }

            // Process stats queue
            yoApp.processCollect();
        },
        processCollect: function() {
            try {
                // Get stats
                var $yoStats = JSON.parse(localStorage.getItem('yo-stats'));

                if ($yoStats) {
                    // Loop through each item
                    for (var x = 0; x < $yoStats.length; x++) {
                        // Send collect
                        yoApp.collect($yoStats[x]);
                    }

                    // Empty queue
                    yoApp.pushToLs('yo-stats', JSON.stringify([]));
                }
            } catch (error) {
            }
        },
        pause: function() {
            // Push notification
            yoApp.animationTimer.pause()
        },
        resume: function() {
            // Check if ready
            if (yoApp.ready) {
                var elapsed = (new Date).getTime() - yoApp.lastAnimationAt;
                var remaining = elapsed >= yoApp.settings.displayHold ? 1 : yoApp.settings.displayHold - elapsed;
                // Resume timer
                yoApp.animationTimer.resume()
            }
        },
        enqueue: function() {
            // Set ready to false
            yoApp.ready = !1;

            // Calculate delay
            var delay = yoApp.settings.randomize_interval ? (yoApp.settings.randomizeDelayMin && yoApp.settings.randomizeDelayMax ? (Math.floor(Math.random() * (yoApp.settings.randomizeDelayMax - yoApp.settings.randomizeDelayMin + 1)) + yoApp.settings.randomizeDelayMin) : Math.floor(Math.random() * (2 * yoApp.settings.displayInterval)) + 1e3) : yoApp.settings.displayInterval;

            // Hide notification
            yoApp.animateHide();

            // Set Next run
            setTimeout(yoApp.run, delay)
        },
        pushToLs: function(key, value) {
            // Set item in local storage
            try {
                localStorage.setItem(key, value)
            } catch (e) {
                e.code == DOMException.QUOTA_EXCEEDED_ERR && localStorage.clear() && yoApp.pushToLs(key, value);
            }
        },
        run: function() {
            // Check for status and max limit
            if (yoApp.settings.displayedCounter < yoApp.settings.totalPerPage && !yoApp.closed) {
                // Update counter
                yoApp.settings.displayedCounter++;

                // Notification queue counter
                var notificationCounter = 0;

                // Check local storage support
                yoApp.checkLocalStorageSupport();

                // Loop through notifications
                for (var key in yoApp.recentEventDetails) {
                    // Update counter
                    notificationCounter++;

                    // Check for key
                    if (yoApp.recentEventDetails.hasOwnProperty(key)) {
                        // Current notification
                        var eventDetail = JSON.parse(JSON.stringify(yoApp.recentEventDetails[key]));

                        // Check if it is not already displayed
                        if (null === localStorage.getItem("yya-" + eventDetail.id)) {
                            // Set current notification in displayed list
                            yoApp.pushToLs("yya-" + eventDetail.id, 1);

                            // Check if matching products should display
                            if (typeof yoApp.settings.matching != "undefined" && yoApp.settings.matching && typeof yoApp.currentProduct != "undefined" && yoApp.currentProduct) {

                                eventDetail.eventTitle = yoApp.currentProduct.title ? yoApp.currentProduct.title : eventDetail.eventTitle;
                                eventDetail.image = yoApp.currentProduct.image ? yoApp.currentProduct.image : eventDetail.image;
                                eventDetail.url = yoApp.currentProduct.url ? yoApp.currentProduct.url : eventDetail.url;
                                eventDetail.variantTitle = '';
                            }

                            // Check values
                            eventDetail.city = eventDetail.city ? yoApp.Base64.decode(eventDetail.city) : yoApp.settings.fallbackCity;
                            eventDetail.province = eventDetail.province ? yoApp.Base64.decode(eventDetail.province) : yoApp.settings.fallbackProvince;
                            eventDetail.country = eventDetail.country ? yoApp.Base64.decode(eventDetail.country) : yoApp.settings.fallbackCountry;
                            eventDetail.firstName = eventDetail.firstName ? yoApp.Base64.decode(eventDetail.firstName) : yoApp.settings.fallbackFirstName;
                            eventDetail.lastName = eventDetail.lastName ? yoApp.Base64.decode(eventDetail.lastName) : '';

                            // Timestamp
                            eventDetail.createdAt = yoApp.settings.randomTimestamp === !0 ? yoApp.randomTimestamp(yoApp.settings.randomizeTimestampDelayMin, yoApp.settings.randomizeTimestampDelayMax) : eventDetail.createdAt;

                            // Prepare Notification
                            yoApp.displayNotification(eventDetail);
                            // Set ready to yes
                            yoApp.ready = !0;
                            break
                        }
                    }

                    // If loop is on and loop has reached at end, clear everything and start over
                    if (notificationCounter === yoApp.recentEventDetails.length && yoApp.settings.loop) {
                        // Clear local storage
                        yoApp.fresh();

                        // Start over
                        yoApp.run();
                    }
                }
            }
        },
        checkLocalStorageSupport: function() {
            // Try setting an item in local storage
            try {
                localStorage.setItem("yya-lss", 1)
            } catch (i) {
                i.code == DOMException.QUOTA_EXCEEDED_ERR && localStorage.clear()
            }

            if (!localStorage.getItem("yya-lss")) {
                // Shuffle notifications
                yoApp.recentEventDetails = yoApp.shuffle(yoApp.recentEventDetails);
                return false;
            }

            return true;
        },
        displayNotification: function(eventDetail) {
            // Fire event [beforeNotification]
            try {
                document.dispatchEvent(new CustomEvent("yo::beforeNotification",{}));
                window.dispatchEvent(new CustomEvent("yo::beforeNotification",{
                    "detail": eventDetail
                }));
            } catch (Error) {}

            var message_template = eventDetail.message_template
                , firstName = eventDetail.firstName
                , lastName = eventDetail.lastName
                , lastNameInitial = eventDetail.lastNameInitial
                , city = eventDetail.city
                , province = eventDetail.province
                , country = eventDetail.country
                , unixTimestamp = eventDetail.createdAt
                , eventTitle = eventDetail.eventTitle
                , imageUrl = eventDetail.image
                , url = eventDetail.url
                , variantId = eventDetail.variantId
                , variantTitle = eventDetail.variantTitle;

            // Current time
            var now = Math.round((new Date).getTime() / 1e3);

            // Timestamp value
            var yoTimestamp = now - unixTimestamp > 0 ? unixTimestamp : now;

            // Timestamp style attributes
            var yoTimestampStyle = 1 == yoApp.settings.timeagoBolderFont ? "font-weight:bold;" : "font-weight:normal;";
            yoTimestampStyle += "" != yoApp.settings.timeagoColor ? "color:" + yoApp.settings.timeagoColor + " !important;" : "";

            // Timeago HTML
            var timeAgoHtml = now - unixTimestamp < yoApp.settings.timeAgoLimit ? ('<p class="yo-time-stamp" style="' + yoTimestampStyle + '" datetime="' + yoApp.utcString(yoTimestamp) + '">' + yoApp.utcString(yoTimestamp) + "</p>") : '<p class="yo-time-stamp"></p>';

            // Message Style Attributes
            var yoMessageStyle = 1 == yoApp.settings.messageBolderFont ? "font-weight:bold;" : "";
            yoMessageStyle += "" != yoApp.settings.messageColor ? "color:" + yoApp.settings.messageColor + " !important;" : "";

            // URL style attributes
            var yoLinkStyle = 1 == yoApp.settings.urlBolderFont ? "font-weight:bold;" : "";
            yoLinkStyle += "" != yoApp.settings.urlColor ? "color:" + yoApp.settings.urlColor + " !important;" : "";

            // Notification URL
            var notificationUrl = (url ? (yoApp.settings.utm && yoApp.settings.utm != "0" ? yoApp.queryParam(yoApp.queryParam(url, 'utm_source', yoApp.settings.utm_source), 'utm_medium', yoApp.settings.utm_medium) : url) : '');

            // Notification URL HTML
            var notificationUrlHtml = '<a href="' + notificationUrl + '" style="' + yoLinkStyle + '" class="yo-notification-url"><span style="' + yoLinkStyle + '" >' + eventTitle + " </span></a> ";

            // Variant Title
            variantTitle = typeof variantTitle != "undefined" ? variantTitle : '';

            // Notification Variant URL HTML
            var notificationVariantUrlHtml = typeof variantTitle != "undefined" && typeof variantId != "undefined" && variantTitle && variantId ? '<a href="' + yoApp.queryParam(notificationUrl, 'variant', variantId) + '" style="' + yoLinkStyle + '" class="yo-notification-url variant-url"><span style="' + yoLinkStyle + '" >' + variantTitle + " </span></a> " : '';

            // Message after replacing shortcodes
            var message = message_template.replaceFull("[FIRST-NAME]", firstName).replaceFull("[LAST-NAME]", lastName).replaceFull("[LAST-NAME-INITIAL]", lastNameInitial).replaceFull("[CITY]", city).replaceFull("[PROVINCE]", province).replaceFull("[COUNTRY]", country).replaceFull("[TITLE-WITH-LINK]", notificationUrlHtml).replaceFull("[VARIANT-WITH-LINK]", notificationVariantUrlHtml).replaceFull("[TITLE]", eventTitle).replaceFull("[VARIANT]", variantTitle).replaceFull("[TIME-AGO]", timeAgoHtml);

            // Notification info container Style attributes
            var yoNotificationInfoStyle = "" != yoApp.settings.notificationBackground ? "background-color:" + yoApp.settings.notificationBackground + ";" : "";

            // If no image link found
            yoNotificationInfoStyle += !imageUrl ? "padding:20px 20px;" : "";

            // Notification image container HTML
            var notificationImageHtml = imageUrl ? '<div class="yo-event-image"><a href="' + notificationUrl + '" class="yo-notification-url" style="background-image:url(' + imageUrl + ');"></a></div>' : '';

            // Notification info container HTML
            var notificationInfoHtml = '<div class="yo-notification-info" style="' + yoNotificationInfoStyle + '"><div class="yo-message" style="' + yoMessageStyle + '">' + message + '</div></div>';

            // Notification close button HTML
            var notificationCloseButtonHtml = yoApp.settings.closable ? '<span id="closeYo"></span>' : '';

            // Update HTML in DOM
            document.getElementById("yoInnerHolder").innerHTML = notificationImageHtml + notificationInfoHtml + notificationCloseButtonHtml;

            // Set on click for notification url
            var notificationUrlElements = document.getElementsByClassName('yo-notification-url');
            for (var i = 0; i < notificationUrlElements.length; i++) {
                notificationUrlElements[i].setAttribute('onclick', "return yoApp.queueCollect('" + encodeURIComponent(eventTitle) + "', 'click');");
            }

            // Timeago translations
            var translations = yoApp.settings.translations;
            var selectedLanguage = yoApp.settings.language;

            // Time Ago
            var timeago = new yoApp.timeago(yoApp.settings.enableTimestampTimer);

            if (typeof translations[selectedLanguage] != "undefined") {
                timeago.register(selectedLanguage, function(number, index) {
                    return translations[selectedLanguage][index];
                });
            }

            // Render Timeago
            timeago(null, selectedLanguage).render(document.querySelectorAll('.yo-time-stamp'));

            // Attach event listener to close Button
            if (yoApp.settings.closable) {
                var closeBtn = document.getElementById("closeYo");
                closeBtn.addEventListener("click", yoApp.closeMe, !1)
            }

            // If image is available, add click listener
            if (imageUrl) {
                var yoImg = yoApp.yoHolder.getElementsByTagName("img")[0];

                if (yoImg) {
                    yoImg.addEventListener("click", function() {
                        yoApp.collect({
                            "e_a": "click"
                        });
                        window.location.href = notificationUrl;
                    }, !1)
                }
            }

            // Start Animation display
            yoApp.animateShow();

            // Set animation timer
            yoApp.animationTimer = new yoApp.timer(yoApp.enqueue,yoApp.settings.displayHold);

            // Collect Impression
            if (typeof yoApp.settings.analytic_id != "undefined" && yoApp.settings.analytic_id) {
                yoApp.collect({
                    "e_a": "view"
                });
            }
        },
        queueCollect: function(e_n, e_a) {
            if (typeof e_n != "undefined" && typeof e_a != "undefined" && e_n && e_a) {
                var data = {
                    "e_a": e_a,
                    //"e_n": e_n
                };

                // Get existing value from local storage
                var $yoStats = JSON.parse(localStorage.getItem('yo-stats'));
                $yoStats = $yoStats ? $yoStats : [];

                // Add current
                $yoStats.push(data);

                // Update local storage
                localStorage.setItem('yo-stats', JSON.stringify($yoStats));
            }

            return true;
        },
        closeMe: function() {
            // Dispatch Event
            try {
                document.dispatchEvent(new CustomEvent("yo::beforeStop",{}));
            } catch (Error) {}

            // Hide Notification
            yoApp.animateHide();

            // Set value in local storage
            localStorage.setItem("disable-yo-" + yoApp.appId, (new Date).getTime());

            // Set closed status
            yoApp.closed = !0;

            // Collect stats
            if (typeof yoApp.settings.analytic_id != "undefined" && yoApp.settings.analytic_id) {
                yoApp.collect({
                    "e_a": "close",
                    "e_n": "closed"
                });
            }

            // Dispatch event
            try {
                document.dispatchEvent(new CustomEvent("yo::stopped",{}));
            } catch (Error) {}
        },
        animateShow: function() {
            // Set last animation time
            yoApp.lastAnimationAt = new Date().getTime();

            // Dispatch event
            "function" == typeof yoBeforeNotificationShow && yoBeforeNotificationShow(yoApp.yoHolder);
            try {
                document.dispatchEvent(new CustomEvent("yo::beforeNotificationShow",{}));
            } catch (Error) {}

            // Display Notification
            yoApp.yoHolder.style.display = "block";

            // Dispatch event after Notification display
            try {
                document.dispatchEvent(new CustomEvent("yo::afterNotificationShow",{}));
            } catch (Error) {}
        },
        animateHide: function() {
            // Dispatch event before Hide
            try {
                document.dispatchEvent(new CustomEvent("yo::beforeHide",{}));
            } catch (Error) {}

            // Hide notification
            yoApp.yoHolder.style.display = "none";

            // Dispatch event after hide
            try {
                document.dispatchEvent(new CustomEvent("yo::hidden",{}));
            } catch (Error) {}
        },
        queryParam: function(uri, key, value) {
            var re = new RegExp("([?&])" + key + "=.*?(&|$)","i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            } else {
                return uri + separator + key + "=" + value;
            }
        },
        fresh: function() {
            for (var localStorageLoop = localStorage.length; localStorageLoop > 0; localStorageLoop--) {
                "yya" === localStorage.key((localStorageLoop - 1)).split("-")[0] && localStorage.removeItem(localStorage.key((localStorageLoop - 1)))
            }
        }
    };

    yoApp.app = "yo";
    yoApp.eventsScriptURL = "/js/events.js";
    yoApp.statsUrl = "https://analytics.yopify.com/";
    yoApp.appId = "7be36f1bdcfc0f47fca27fd4386627c1";
    yoApp.init()
}
