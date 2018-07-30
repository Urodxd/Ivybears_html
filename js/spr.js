!function() {
    var e = function(e) {
        var t = {
            exports: {}
        };
        return e.call(t.exports, t, t.exports),
            t.exports
    };
    e(function() {
        "use strict";
        window.innerShiv = function() {
            function e(e, t, r) {
                return /^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i.test(r) ? e : t + "></" + r + ">"
            }
            var t, r, a = document, i = "abbr article aside audio canvas datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video".split(" ");
            return function(n, s) {
                if (!t && (t = a.createElement("div"),
                    t.innerHTML = "<nav></nav>",
                    r = 1 !== t.childNodes.length)) {
                    for (var o = a.createDocumentFragment(), d = i.length; d--; )
                        o.createElement(i[d]);
                    o.appendChild(t)
                }
                if (n = n.replace(/^\s\s*/, "").replace(/\s\s*$/, "").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/(<([\w:]+)[^>]*?)\/>/g, e),
                    t.innerHTML = (o = n.match(/^<(tbody|tr|td|col|colgroup|thead|tfoot)/i)) ? "<table>" + n + "</table>" : n,
                    o = o ? t.getElementsByTagName(o[1])[0].parentNode : t,
                !1 === s)
                    return o.childNodes;
                for (var d = a.createDocumentFragment(), u = o.childNodes.length; u--; )
                    d.appendChild(o.firstChild);
                return d
            }
        }()
    });
    (function() {
            window.SPR = function() {
                function e() {}
                return e.shop = Shopify.shop,
                    e.host = "//productreviews.shopifycdn.com",
                    e.version = "v4",
                    e.api_url = e.host + "/proxy/" + e.version,
                    e.badgeEls = [],
                    e.reviewEls = [],
                    e.elSettings = {},
                    e.$ = void 0,
                    e.extraAjaxParams = {
                        shop: e.shop
                    },
                    e.registerCallbacks = function() {
                        return this.$(document).bind("spr:badge:loaded", "undefined" != typeof SPRCallbacks && null !== SPRCallbacks ? SPRCallbacks.onBadgeLoad : void 0),
                            this.$(document).bind("spr:product:loaded", "undefined" != typeof SPRCallbacks && null !== SPRCallbacks ? SPRCallbacks.onProductLoad : void 0),
                            this.$(document).bind("spr:reviews:loaded", "undefined" != typeof SPRCallbacks && null !== SPRCallbacks ? SPRCallbacks.onReviewsLoad : void 0),
                            this.$(document).bind("spr:form:loaded", "undefined" != typeof SPRCallbacks && null !== SPRCallbacks ? SPRCallbacks.onFormLoad : void 0),
                            this.$(document).bind("spr:form:success", "undefined" != typeof SPRCallbacks && null !== SPRCallbacks ? SPRCallbacks.onFormSuccess : void 0),
                            this.$(document).bind("spr:form:failure", "undefined" != typeof SPRCallbacks && null !== SPRCallbacks ? SPRCallbacks.onFormFailure : void 0)
                    }
                    ,
                    e.loadStylesheet = function() {
                        var e, t;
                        return t = document.createElement("link"),
                            t.setAttribute("rel", "stylesheet"),
                            t.setAttribute("type", "text/css"),
                            t.setAttribute("href", "https://productreviews.shopifycdn.com/assets/v4/spr-5a2d2fd286dca8042a3a5a76bc9032c64c52a2792a734307c76740d012641514.css"),
                            t.setAttribute("media", "screen"),
                            e = document.getElementsByTagName("head")[0],
                            e.appendChild(t)
                    }
                    ,
                    e.initRatingHandler = function() {
                        return e.$(document).on("mouseover mouseout", "form a.spr-icon-star", function(t) {
                            var r, a, i;
                            return r = t.currentTarget,
                                i = e.$(r).attr("data-value"),
                                a = e.$(r).parent(),
                                "mouseover" === t.type ? (a.find("a.spr-icon:lt(" + i + ")").addClass("spr-icon-star-hover"),
                                    a.find("a.spr-icon:gt(" + (i - 1) + ")").removeClass("spr-icon-star-hover")) : a.find("a.spr-icon").removeClass("spr-icon-star-hover")
                        })
                    }
                    ,
                    e.initDomEls = function() {
                        return this.badgeEls = this.$(".shopify-product-reviews-badge[data-id]"),
                            this.reviewEls = this.$("#shopify-product-reviews[data-id]"),
                            this.$.each(this.reviewEls, function(e) {
                                return function(t, r) {
                                    var a;
                                    return a = e.$(r).attr("data-id"),
                                        e.elSettings[a] = {},
                                        e.elSettings[a].reviews_el = "#" + (e.$(r).attr("data-reviews-prefix") ? e.$(r).attr("data-reviews-prefix") : "reviews_"),
                                        e.elSettings[a].form_el = "#" + (e.$(r).attr("data-form-prefix") ? e.$(r).attr("data-form-prefix") : "form_")
                                }
                            }(this))
                    }
                    ,
                    e.loadProducts = function() {
                        return this.$.each(this.reviewEls, function(e) {
                            return function(t, r) {
                                var a, i;
                                if (a = e.$(r).attr("data-id"),
                                "false" !== e.$(r).attr("data-autoload"))
                                    return i = e.$.extend({
                                        product_id: a,
                                        version: e.version
                                    }, e.extraAjaxParams),
                                        e.$.get(e.api_url + "/reviews/product", i, e.productCallback, "jsonp")
                            }
                        }(this))
                    }
                    ,
                    e.loadBadges = function() {
                        var e, t, r, a, i;
                        if (r = this.$.map(this.badgeEls, function(e) {
                            return function(t) {
                                return e.$(t).attr("data-id")
                            }
                        }(this)),
                        r.length > 0) {
                            for (t = 7,
                                     i = []; (e = r.splice(0, t)).length > 0; )
                                a = this.$.extend(this.extraAjaxParams, {
                                    product_ids: e
                                }),
                                    i.push(this.$.get(this.api_url + "/reviews/badges", a, this.badgesCallback, "jsonp"));
                            return i
                        }
                    }
                    ,
                    e.pageReviews = function(e) {
                        var t, r, a;
                        return a = this.$(e).data("product-id"),
                            r = this.$(e).data("page"),
                            t = this.$.extend({
                                page: r,
                                product_id: a
                            }, this.extraAjaxParams),
                            this.$.get(this.api_url + "/reviews", t, this.paginateCallback, "jsonp"),
                            !1
                    }
                    ,
                    e.submitForm = function(e) {
                        var t;
                        return t = this.$(e).serializeObject(),
                            t = this.$.extend(t, this.extraAjaxParams),
                            t = this.$.param(t),
                            t = t.replace(/%0D%0A/g, "%0A"),
                            this.$.ajax({
                                url: this.api_url + "/reviews/create",
                                type: "GET",
                                dataType: "jsonp",
                                data: t,
                                success: this.formCallback,
                                beforeSend: function(e) {
                                    return function() {
                                        return e.$(".spr-button-primary").attr("disabled", "disabled")
                                    }
                                }(this),
                                complete: function(e) {
                                    return function() {
                                        return e.$(".spr-button-primary").removeAttr("disabled")
                                    }
                                }(this)
                            }),
                            !1
                    }
                    ,
                    e.reportReview = function(e) {
                        var t;
                        return confirm("Are you sure you want to report this review as inappropriate?") && (t = this.$.extend({
                            id: e
                        }, this.extraAjaxParams),
                            this.$.get(this.api_url + "/reviews/report", t, this.reportCallback, "jsonp")),
                            !1
                    }
                    ,
                    e.toggleReviews = function(e) {
                        var t;
                        return t = this.$("#shopify-product-reviews[data-id='" + e + "']"),
                            t.find(".spr-reviews").toggle()
                    }
                    ,
                    e.toggleForm = function(e) {
                        var t;
                        return t = this.$("#shopify-product-reviews[data-id='" + e + "']"),
                            t.find(".spr-form").toggle()
                    }
                    ,
                    e.setRating = function(e) {
                        var t, r, a;
                        return t = this.$(e).parents("form"),
                            a = this.$(e).attr("data-value"),
                            r = this.$(e).parent(),
                            t.find("input[name='review[rating]']").val(a),
                            this.setStarRating(a, r)
                    }
                    ,
                    e.setStarRating = function(e, t) {
                        return t.find("a:lt(" + e + ")").removeClass("spr-icon-star-empty spr-icon-star-hover"),
                            t.find("a:gt(" + (e - 1) + ")").removeClass("spr-icon-star-hover").addClass("spr-icon-star-empty")
                    }
                    ,
                    e.badgesCallback = function(t) {
                        var r;
                        return r = t.badges,
                            e.$.map(e.badgeEls, function(t) {
                                var a;
                                if (a = e.$(t).attr("data-id"),
                                r[a] !== undefined)
                                    return e.$(t).replaceWith(r[a]),
                                        e.triggerEvent("spr:badge:loaded", {
                                            id: a
                                        })
                            })
                    }
                    ,
                    e.productCallback = function(t) {
                        var r;
                        return r = t.remote_id.toString(),
                            e.renderProduct(r, t.product),
                            e.renderForm(r, t.form),
                            e.renderReviews(r, t.reviews)
                    }
                    ,
                    e.renderProduct = function(e, t) {
                        return this.$.map(this.reviewEls, function(r) {
                            return function(a) {
                                if (e === r.$(a).attr("data-id"))
                                    return r.$(a).html(innerShiv(t, !1)),
                                        r.triggerEvent("spr:product:loaded", {
                                            id: e
                                        })
                            }
                        }(this))
                    }
                    ,
                    e.renderForm = function(e, t) {
                        var r;
                        return r = this.$(this.elSettings[e].form_el + e),
                            r.html(t),
                            this.triggerEvent("spr:form:loaded", {
                                id: e
                            })
                    }
                    ,
                    e.renderReviews = function(t, r) {
                        var a;
                        return a = e.$(e.elSettings[t].reviews_el + t),
                            a.html(r),
                            e.triggerEvent("spr:reviews:loaded", {
                                id: t
                            })
                    }
                    ,
                    e.formCallback = function(t) {
                        var r, a, i, n;
                        return n = t.status,
                            i = t.remote_id,
                            a = t.form,
                            r = e.$(e.elSettings[i].form_el + i),
                            r.html(a),
                        "failure" === n && e.initStarRating(r),
                        "success" === n && e.$("#shopify-product-reviews[data-id='" + i + "'] .spr-summary-actions-newreview").hide(),
                            e.triggerEvent("spr:form:" + n, {
                                id: i
                            })
                    }
                    ,
                    e.initStarRating = function(e) {
                        var t, r, a;
                        if ((a = e.find("input[name='review[rating]']")) && a.val())
                            return r = a.val(),
                                t = e.find(".spr-starrating"),
                                this.setStarRating(r, t)
                    }
                    ,
                    e.paginateCallback = function(t) {
                        var r, a;
                        return a = t.remote_id.toString(),
                            r = t.reviews,
                            e.renderReviews(a, r)
                    }
                    ,
                    e.reportCallback = function(t) {
                        var r;
                        return r = "#report_" + t.id,
                            e.$(r).replaceWith("<span class='spr-review-reportreview'>" + e.$(r).attr("data-msg") + "</span>")
                    }
                    ,
                    e.loadjQuery = function(t) {
                        return e.loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js", function() {
                            return e.$ = jQuery.noConflict(!0),
                                t()
                        })
                    }
                    ,
                    e.loadScript = function(e, t) {
                        var r;
                        return r = document.createElement("script"),
                            r.type = "text/javascript",
                            r.readyState ? r.onreadystatechange = function() {
                                    if ("loaded" === r.readyState || "complete" === r.readyState)
                                        return r.onreadystatechange = null,
                                            t()
                                }
                                : r.onload = function() {
                                    return t()
                                }
                            ,
                            r.src = e,
                            document.getElementsByTagName("head")[0].appendChild(r)
                    }
                    ,
                    e.loadjQueryExtentions = function(e) {
                        return e.fn.serializeObject = function() {
                            var t, r;
                            return t = {},
                                r = this.serializeArray(),
                                e.each(r, function() {
                                    return t[this.name] ? (t[this.name].push || (t[this.name] = [t[this.name]]),
                                        t[this.name].push(this.value || "")) : t[this.name] = this.value || ""
                                }),
                                t
                        }
                    }
                    ,
                    e.triggerEvent = function(e, t) {
                        return this.$(document).trigger(e, t)
                    }
                    ,
                    e
            }(),
                function() {
                    SPR.loadStylesheet(),
                        SPR.loadjQuery(function() {
                            return SPR.$.ajaxSetup({
                                cache: !1
                            }),
                                SPR.loadjQueryExtentions(SPR.$),
                                SPR.$(document).ready(function() {
                                    return SPR.registerCallbacks(),
                                        SPR.initRatingHandler(),
                                        SPR.initDomEls(),
                                        SPR.loadProducts(),
                                        SPR.loadBadges()
                                })
                        })
                }()
        }
    ).call(this)
}("undefined" != typeof global ? global : "undefined" != typeof window && window);
