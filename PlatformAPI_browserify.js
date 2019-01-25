(function() {
    function e(t, n, a) {
        function o(i, c) {
            if (!n[i]) {
                if (!t[i]) {
                    var s = "function" == typeof require && require;
                    if (!c && s) return s(i, !0);
                    if (r) return r(i, !0);
                    var l = new Error("Cannot find module '" + i + "'");
                    throw l.code = "MODULE_NOT_FOUND", l;
                }
                var u = n[i] = {
                    exports: {}
                };
                t[i][0].call(u.exports, function(e) {
                    var n = t[i][1][e];
                    return o(n || e);
                }, u, u.exports, e, t, n, a);
            }
            return n[i].exports;
        }
        for (var r = "function" == typeof require && require, i = 0; i < a.length; i++) o(a[i]);
        return o;
    }
    return e;
})()({
    1: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: true
        });
        var a = {
            title: "Let's play this amazing game!",
            imageUrl: "./fbcdn/shareImage.png"
        };
        var o = "https://fb.sanshengshi.xyz";
        var r = 3;
        var i;
        (function(e) {
            e[e["UNLOAD"] = 0] = "UNLOAD";
            e[e["LOADING"] = 1] = "LOADING";
            e[e["LOADED"] = 2] = "LOADED";
        })(i || (i = {}));
        var c = {};
        var s;
        (function(e) {
            e[e["REWARD"] = 0] = "REWARD";
            e[e["INTERSTITIAL"] = 1] = "INTERSTITIAL";
        })(s || (s = {}));
        c[s.REWARD] = {
            id: "",
            list: []
        };
        c[s.INTERSTITIAL] = {
            id: "",
            list: []
        };
        var l = 0;
        var u = function() {
            l++;
            return {
                status: i.UNLOAD,
                instance: null,
                index: l
            };
        };
        for (var f = 0; f < r; f++) {
            c[s.REWARD].list.push(u());
            c[s.INTERSTITIAL].list.push(u());
        }
        var d = function(e, t) {
            var n = c[t].id;
            var a = null;
            var o = "";
            if (t === s.REWARD) {
                o = "视频";
                a = FBInstant.getRewardedVideoAsync.bind(FBInstant);
            } else {
                o = "插屏";
                a = FBInstant.getInterstitialAdAsync.bind(FBInstant);
            }
            var r = function() {
                e.instance.loadAsync().then(function() {
                    console.log("加载" + o + "广告成功!" + e.index);
                    e.status = i.LOADED;
                }).catch(function(t) {
                    e.status = i.UNLOAD;
                    console.log("加载" + o + "广告失败! " + e.index);
                    console.error(t);
                });
            };
            if (e.instance) {
                r();
            } else {
                a(n).then(function(t) {
                    e.instance = t;
                    r();
                }).catch(function(t) {
                    e.status = i.UNLOAD;
                    console.log("初始化" + o + "广告失败! " + e.index);
                    console.error(t);
                });
            }
        };
        var g = function(e) {
            if (!c[e].id) {
                return;
            }
            var t = null;
            c[e].list.forEach(function(n, a) {
                switch (n.status) {
                  case i.UNLOAD:
                    n.status = i.LOADING;
                    setTimeout(function() {
                        d(n, e);
                    }, a * 1e4);
                    break;

                  case i.LOADING:
                    break;

                  case i.LOADED:
                    t = t || n;
                    break;
                }
            });
            return t;
        };
        var v = function(e) {
            c[s.REWARD].id = e;
            g(s.REWARD);
        };
        var m = function(e) {
            c[s.INTERSTITIAL].id = e;
            g(s.INTERSTITIAL);
        };
        var h = function(e, t) {
            var n = g(e);
            var a = e === s.REWARD;
            var o = a ? "视频" : "插屏";
            if (n) {
                n.status = i.UNLOAD;
                n.instance.showAsync().then(function() {
                    delete n.instance;
                    g(e);
                    t();
                }).catch(function(a) {
                    if (a.code !== "RATE_LIMITED") {
                        delete n.instance;
                    } else {
                        n.status = i.LOADING;
                        setTimeout(function() {
                            n.status = i.LOADED;
                        }, 1e4);
                    }
                    console.error(o, "广告播放失败!", a);
                    console.log("尝试获取另一个" + o + "广告");
                    h(e, t);
                });
            } else {
                console.error("没有已加载完毕的" + o + "广告!");
                console.log(a ? "即将播放插屏广告!" : "即将直接发放奖励!");
                a ? h(s.INTERSTITIAL, t) : t(1);
            }
        };
        var y = 0;
        var p = function(e, t) {
            var n = e.includes("https") ? PlatformAPI.getItem(e) : "";
            if (!n) {
                PlatformAPI.getBase64Async(e, function(e) {
                    t(e);
                });
            } else {
                t(n);
            }
        };
        var I = function(e) {
            var t = e.callback;
            if (!FBInstant.context.getID()) return t && t(false, "没有环境");
            var n = e.score;
            p(a.imageUrl, function(e) {
                var o = {
                    action: "CUSTOM",
                    image: e,
                    text: typeof n !== typeof void 0 ? {
                        default: "I have run " + n + " meters! Challenge me !",
                        localizations: {
                            en_US: "I have run " + n + " meters! Challenge me !",
                            zh_CN: "我刚刚跑了 " + n + " 米! 快来超越我!"
                        }
                    } : a.title,
                    template: "",
                    notification: "PUSH"
                };
                FBInstant.updateAsync(o).then(function() {
                    t && t(true);
                }).catch(function(e) {
                    t && t(false, e);
                });
            });
        };
        var S = function(e) {
            var t = function(t) {
                PlatformAPI.request({
                    url: o + "/game/fb/subscribe.html",
                    data: {
                        fb: e,
                        player_id: FBInstant.player.getID(),
                        subscribe: t
                    },
                    method: "POST"
                });
            };
            FBInstant.player.canSubscribeBotAsync().then(function(e) {
                e && FBInstant.player.subscribeBotAsync().then(function(e) {
                    console.log("then,", e);
                    t(1);
                }).catch(function(e) {
                    console.log("catch,", e);
                    t(0);
                });
            }).catch(function(e) {
                console.log(e);
            });
        };
        var T = function(e, t) {
            var n = function() {
                PlatformAPI.request({
                    url: o + "/game/user/login.html",
                    method: "POST",
                    data: {
                        fb: e,
                        player_id: FBInstant.player.getID(),
                        user_name: FBInstant.player.getName(),
                        header_url: FBInstant.player.getPhoto(),
                        locale: FBInstant.getLocale()
                    },
                    success: function() {
                        t && t();
                    },
                    fail: function() {
                        n();
                    }
                });
            };
            if (FBInstant.player.getName() === null) {
                var a = setInterval(function() {
                    if (FBInstant.player.getName() === null) {
                        console.log("等待调用FBInstant.startGameAsync");
                    } else {
                        clearInterval(a);
                        n();
                    }
                }, 100);
            } else {
                n();
            }
        };
        var w = function(e) {
            var t;
            var n = e.length;
            var a = null;
            while (0 != n) {
                a = Math.random() * n-- >>> 0;
                t = [ e[a], e[n] ], e[n] = t[0], e[a] = t[1];
            }
            return e;
        };
        var A = function() {
            FBInstant.player.getConnectedPlayersAsync().then(function(e) {
                var t = [];
                w(e).slice(0, 3).forEach(function(e) {
                    t.push({
                        name: e.getName(),
                        photo: e.getPhoto(),
                        id: e.getID()
                    });
                });
                FBInstant.setSessionData({
                    friendList: t
                });
            });
        };
        var x = {
            platform: "FBInstant",
            share: function(e) {
                if (e === void 0) {
                    e = function e() {};
                }
                p(a.imageUrl, function(t) {
                    FBInstant.shareAsync({
                        intent: "REQUEST",
                        image: t,
                        text: a.title,
                        data: {}
                    }).then(function(t) {
                        console.log("shareResult", t);
                        e();
                    }).catch(function(e) {
                        console.error("shareResult", e);
                    });
                });
            },
            onHide: function(e) {
                FBInstant.onPause(e);
            },
            createShortcut: function() {
                FBInstant.canCreateShortcutAsync().then(function(e) {
                    if (e) {
                        FBInstant.createShortcutAsync();
                    }
                });
            },
            createVideoAd: function(e, t) {
                h(s.REWARD, t);
            },
            createInterstitialAd: function(e, t) {
                h(s.INTERSTITIAL, t);
            },
            initAd: function(e) {
                var t = e.fb_site.img_ad;
                var n = e.fb_site.video_ad;
                y = +e.fb_site.banner_to_interstitial_probability;
                console.log("RewardedVideoId:", n || "视频广告未配置");
                console.log("InterstitialAdId:", t || "插屏广告未配置");
                console.log("BannerToInterstitialProbability:", y);
                if (n && FBInstant.getSupportedAPIs().indexOf("getRewardedVideoAsync") !== -1) {
                    v(n);
                }
                if (t && FBInstant.getSupportedAPIs().indexOf("getInterstitialAdAsync") !== -1) {
                    m(t);
                }
                T(e.fb_site.id, function() {
                    A();
                    x.createShortcut();
                    S(e.fb_site.id);
                });
            },
            chooseAsync: function(e, t) {
                FBInstant.context.chooseAsync({
                    filter: [ "NEW_CONTEXT_ONLY" ]
                }).then(function() {
                    I({
                        score: e,
                        callback: t
                    });
                }).catch(function() {
                    t && t(false);
                });
            },
            getLocaleType: function() {
                var e = FBInstant.getLocale();
                if (e === "zh_CN") {
                    return "zh";
                } else {
                    return "en";
                }
            },
            shareAppMessage: function(e) {
                x.share(e.success);
            },
            navigateToMiniProgram: function(e) {
                PlatformAPI.request({
                    method: "POST",
                    url: o + "/game/fb/sharelog.html",
                    data: {
                        fb: e.extraData.boxname,
                        index: e.btnIndex,
                        type: 1,
                        player_id: FBInstant.player.getID()
                    }
                });
                FBInstant.switchGameAsync(e.appId, e.extraData).then(function() {
                    PlatformAPI.request({
                        method: "POST",
                        url: o + "/game/fb/sharelog.html",
                        data: {
                            fb: e.extraData.boxname,
                            index: e.btnIndex,
                            type: 2,
                            player_id: FBInstant.player.getID()
                        }
                    });
                    e.success && e.success();
                }).catch(function(t) {
                    e.fail && e.fail();
                });
            },
            setUserCloudStorage: function(e) {
                var t = {};
                e.KVDataList.forEach(function(e) {
                    t[e.key] = e.value;
                });
                FBInstant.player.setStatsAsync(t).then(e.success);
            },
            getPlayerInfo: function() {
                if (FBInstant.player.getName()) {
                    return {
                        nickName: FBInstant.player.getName(),
                        nickname: FBInstant.player.getName(),
                        avatarUrl: FBInstant.player.getPhoto()
                    };
                } else {
                    var e = {};
                    Object.defineProperty(e, "nickName", {
                        get: function() {
                            return FBInstant.player.getName();
                        }
                    });
                    Object.defineProperty(e, "nickname", {
                        get: function() {
                            return FBInstant.player.getName();
                        }
                    });
                    Object.defineProperty(e, "avatarUrl", {
                        get: function() {
                            return FBInstant.player.getPhoto();
                        }
                    });
                    return e;
                }
            },
            setCloudStats: function(e, t) {
                FBInstant.player.setStatsAsync(e).then(function() {
                    t && t();
                });
            },
            getCloudStats: function(e) {},
            shareWithImage: function(e, t, n) {
                if (typeof n !== "function") {
                    n = function() {};
                }
                FBInstant.shareAsync({
                    intent: "REQUEST",
                    image: e,
                    text: a.title,
                    data: {}
                }).then(function(e) {
                    console.log("shareResult", e);
                    n({});
                }).catch(function(e) {
                    console.error("shareResult", e);
                });
            },
            updateLeaderboard: function(e, t, n) {
                var a = undefined;
                if (typeof n !== typeof void 0) {
                    if (typeof n !== typeof {}) {
                        console.error("extraData必须是一个Object");
                        debugger;
                        return;
                    }
                    a = JSON.stringify(n);
                }
                FBInstant.getLeaderboardAsync(e).then(function(e) {
                    return e.setScoreAsync(t, a);
                }).then(function() {
                    x.updateScoreToContext(t);
                }).catch(function(e) {
                    console.error(e);
                });
            },
            createBannerAd: function(e) {
                console.log("banner 转 插屏几率", y);
                if (y && Math.random() < y / 100) {
                    PlatformAPI.createInterstitialAd(e, function() {});
                }
                return new Proxy({}, {
                    get: function(e, t) {
                        return function() {};
                    }
                });
            },
            createAsync: function(e) {
                var t = e.callback;
                var n = e.id;
                FBInstant.context.createAsync(n).then(function() {
                    I(e);
                }).catch(function(e) {
                    t && t(false, e);
                });
            },
            updateScoreToContext: function(e, t) {
                I({
                    score: e,
                    callback: t
                });
            }
        };
        n.default = x;
    }, {} ],
    2: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: true
        });
        var a = e("./ToastAndModal");
        var o = e("../SSSGameConfig");
        var r = {
            platform: "H5",
            toast: null,
            showToast: function(e) {
                if (typeof e === typeof "") {
                    a.vhs.showToast({
                        content: e
                    });
                } else {
                    e.title && !e.content && (e.content = e.title);
                    a.vhs.showToast(e);
                }
            },
            showModal: function e(t) {
                a.vhs.showModal(t);
            },
            getItem: function(e) {
                return localStorage.getItem(e);
            },
            setItem: function(e, t) {
                return localStorage.setItem(e, t);
            },
            requestOpenId: function() {
                return "";
            },
            createVideoAd: function(e, t) {
                console.log("视频播放回调");
                t && t();
            },
            createInterstitialAd: function(e, t) {
                console.log("插屏回调");
                t && t();
            },
            initAd: function(e, t) {
                console.log("initAd--data", e);
                t && t();
            },
            getLocaleType: function() {
                return "zh";
            },
            setStorageSync: function(e, t) {
                localStorage.setItem(e, JSON.stringify(t));
            },
            setStorage: function(e) {
                var t = e.key, n = e.data, a = e.success;
                setTimeout(function() {
                    localStorage.setItem(t, JSON.stringify(n));
                    a && a({
                        errMsg: "setStorage:ok"
                    });
                }, 0);
            },
            getOpenDataContext: function() {
                return {
                    postMessage: function(e) {
                        console.log("open data context post message : ", e);
                    },
                    canvas: r.createCanvas()
                };
            },
            getSystemInfo: function(e) {
                setTimeout(function() {
                    e && e.success({
                        errMsg: "getSystemInfo:ok",
                        screenWidth: window.innerWidth,
                        screenHeight: window.innerHeight,
                        windowWidth: window.innerWidth,
                        windowHeight: window.innerHeight,
                        SDKVersion: "9.9.9",
                        system: ""
                    });
                }, 0);
            },
            getSystemInfoSync: function() {
                return {
                    screenWidth: window.innerWidth,
                    screenHeight: window.innerHeight,
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight,
                    SDKVersion: "9.9.9",
                    system: ""
                };
            },
            getLaunchOptionsSync: function() {
                return {
                    query: {}
                };
            },
            clearStorage: function(e) {
                setTimeout(function() {
                    localStorage.clear();
                    e.success && e.success();
                }, 0);
            },
            clearStorageSync: function() {
                localStorage.clear();
            },
            getStorage: function(e) {
                var t = e.key, n = e.success;
                setTimeout(function() {
                    var e = localStorage.getItem(t);
                    try {
                        n && n({
                            errMsg: "getStorage:ok",
                            data: JSON.parse(e)
                        });
                    } catch (t) {
                        n && n({
                            errMsg: "getStorage:ok",
                            data: e
                        });
                    }
                }, 0);
            },
            getStorageSync: function(e) {
                var t = localStorage.getItem(e);
                try {
                    return JSON.parse(t);
                } catch (e) {
                    return t;
                }
            },
            removeStorage: function(e) {
                var t = e.key, n = e.success;
                setTimeout(function() {
                    localStorage.removeItem(t);
                    n && n();
                }, 0);
            },
            removeStorageSync: function(e) {
                localStorage.removeItem(e);
            },
            getStorageInfo: function(e) {
                var t = e.success;
                console.error("已废弃, 使用PlatformAPI.getStorage代替");
                setTimeout(function() {
                    t && t({});
                }, 0);
            },
            getStorageInfoSync: function() {
                console.error("已废弃, 使用PlatformAPI.getStorageSync代替");
                return {};
            },
            request: function(e) {
                var t = e.url;
                var n = e.success;
                var a = e.fail;
                var o = e.complete;
                var r = new XMLHttpRequest();
                r.onreadystatechange = function() {
                    var i;
                    try {
                        i = JSON.parse(r.responseText);
                    } catch (e) {
                        i = r.responseText;
                    }
                    if (4 == r.readyState) {
                        var c = r.getAllResponseHeaders();
                        var s = c.trim().split(/[\r\n]+/);
                        var l = {};
                        s.forEach(function(e) {
                            var t = e.split(": ");
                            var n = t.shift();
                            var a = t.join(": ");
                            l[n] = a;
                        });
                        if (200 <= r.status && 400 > r.status) {
                            var u = {
                                data: i,
                                header: l,
                                statusCode: r.status
                            };
                            n && n(u);
                            o && o(u);
                        } else {
                            var u = {
                                url: t,
                                method: e.method || "GET",
                                data: i,
                                statusCode: r.status,
                                header: l,
                                errMsg: r.statusText
                            };
                            a && a(u);
                            o && o(u);
                        }
                    }
                };
                r.open(e.method || "GET", t);
                r.send(JSON.stringify(e.data));
            },
            getVideoAdPlayInfoToday: function() {
                return {
                    playTimes: -1,
                    maxTimes: -1,
                    valid: true
                };
            },
            updateShareMenu: function(e) {
                e && e.success && e.success({});
            },
            getPlayerInfo: function() {
                return {
                    nickname: "test",
                    nickName: "test",
                    avatarUrl: "https://gss1.bdstatic.com/9vo3dSag_xI4khGkpoWK1HF6hhy/baike/c0%3Dbaike80%2C5%2C5%2C80%2C26/sign=4d7b267a0ae93901420f856c1a853f82/7a899e510fb30f2473057259c395d143ac4b03c8.jpg"
                };
            },
            setCloudStats: function(e, t) {
                r.setStorageSync("__cloudObject", JSON.stringify(e));
                t && t();
            },
            getCloudStats: function(e) {
                e.success && e.success(r.getStorageSync("__cloudObject"));
            },
            login: function(e) {
                e.success && e.success({
                    errMsg: "login:ok",
                    code: "1"
                });
            },
            getUserInfo: function(e) {
                e.success && e.success({
                    userInfo: window["PlatformAPI"].getPlayerInfo()
                });
            },
            shareAppMessage: function(e) {
                e.success && e.success({});
            },
            onShow: function(e, t) {
                if (t === void 0) {
                    t = true;
                }
                if (window["cc"]) {
                    var n = window["cc"];
                    n.game.on(n.game.EVENT_SHOW, function() {
                        e({
                            query: {}
                        });
                    });
                } else {
                    if (window["Laya"] || window["laya"]) {
                        var a = window["Laya"];
                        var o = setInterval(function() {
                            if (a.stage) {
                                clearInterval(o);
                                console.log("regist Laya onShow");
                                a.stage.on(a.Event.VISIBILITY_CHANGE, null, function(t) {
                                    if (a.stage._isVisibility) {
                                        e({
                                            query: {}
                                        });
                                    }
                                });
                            } else {
                                console.log("Laya.stage is not initialied, wait 100 ms to recheck");
                            }
                        }, 100);
                    } else {
                        if (window["egret"]) {
                            var i = setInterval(function() {
                                var t = window["egret"];
                                if (t.lifecycle && t.lifecycle.stage) {
                                    console.log("regist egret onShow");
                                    clearInterval(i);
                                    t.lifecycle.stage.addEventListener(t.Event.ACTIVATE, function() {
                                        e({
                                            query: {}
                                        });
                                    });
                                } else {
                                    console.log("egret.lifecycle.stage is not initialied, wait 100 ms to recheck");
                                }
                            }, 100);
                        } else {
                            if (t) {
                                console.error("未知引擎, 将在一秒后重试");
                                setTimeout(function() {
                                    r.onShow(e, false);
                                }, 1e3);
                            } else {
                                console.error("未知引擎, 需要在此处手动添加某种监听返回前台的方法!");
                                debugger;
                            }
                        }
                    }
                }
            },
            getWXUserInfo: function() {
                return {
                    userInfo: window["PlatformAPI"].getPlayerInfo()
                };
            },
            createInnerAudioContext: function() {
                var e = new Audio();
                e.autoplay = "autoplay";
                e.preload = "preload";
                var t = [];
                var n = {
                    play: function() {
                        try {
                            e.play();
                        } catch (e) {
                            console.error(e);
                        }
                        for (var n = 0; n < t.length; n++) {
                            t[n] && t[n]();
                        }
                    },
                    pause: function() {
                        e.pause();
                    },
                    stop: function() {
                        e.pause();
                    },
                    onEnded: function() {
                        console.warn("未实现的方法");
                    },
                    onPlay: function(e) {
                        t.push(e);
                    }
                };
                Object.defineProperty(n, "src", {
                    set: function(t) {
                        e.src = t;
                    },
                    get: function() {
                        return e.src;
                    }
                });
                return n;
            },
            createCanvas: function() {
                return document.createElement("canvas");
            },
            createImage: function() {
                return new Image();
            },
            toTempFilePath: function(e) {
                var t = Math.max(0, (e.height * 1.91 - e.width) / 2);
                e.width = Math.max(e.width, e.height * 1.91);
                var n = window["cc"];
                var a = function() {
                    n && n.director.off(n.Director.EVENT_AFTER_DRAW, a);
                    var o = document.querySelectorAll("canvas")[0];
                    if (!o) {
                        console.error("查找canvas失败, 请修改上方代码, 手动定位主canvas");
                        debugger;
                        return;
                    }
                    var r = o.toDataURL("image/png");
                    var i = new Image();
                    i.onload = function() {
                        var n = document.createElement("canvas");
                        n.width = e.destWidth;
                        n.height = e.destHeight;
                        var a = n.getContext("2d");
                        a.drawImage(i, e.x, e.y, e.width, e.height, t, 0, n.width, n.height);
                        var o = n.toDataURL("image/png");
                        e.success && e.success(o);
                    };
                    i.src = r;
                };
                if (n) {
                    n.director.on(n.Director.EVENT_AFTER_DRAW, a);
                } else {
                    a();
                }
            },
            getSetting: function(e) {
                e && e.success && e.success({
                    authSetting: {
                        "scope.userInfo": true
                    }
                });
            },
            getBase64Async: function(e, t) {
                if (e.includes("fbcdn")) {
                    var n = new XMLHttpRequest();
                    n.open("get", e, true);
                    n.responseType = "blob";
                    n.onload = function() {
                        if (this.status == 200) {
                            var n = this.response;
                            var a = new FileReader();
                            a.onloadend = function(e) {
                                var n = e.target["result"];
                                t && t(n);
                            };
                            a.readAsDataURL(n);
                        } else {
                            console.error("加载图片失败!", e);
                        }
                    };
                    n.setRequestHeader("Access-Control-Allow-Origin", "*");
                    n.send();
                } else {
                    PlatformAPI.request({
                        url: "https://fb.sanshengshi.xyz/event/fb/image.html?url=" + e,
                        success: function(e) {
                            console.log(e);
                            var n = e.data.message;
                            t && t(n);
                        }
                    });
                }
            },
            vibrateShort: function() {
                navigator && navigator.vibrate && navigator.vibrate(15);
            },
            vibrateLong: function() {
                navigator && navigator.vibrate && navigator.vibrate(400);
            },
            getUpdateManager: function() {
                return {
                    onCheckForUpdate: function(e) {
                        console.warn("empty function called: getUpdateManager().onCheckForUpdate() ");
                        e && e({
                            hasUpdate: false
                        });
                    },
                    onUpdateReady: function() {
                        console.warn("empty function called: getUpdateManager().onUpdateReady() ");
                    },
                    onUpdateFailed: function() {
                        console.warn("empty function called: getUpdateManager().onUpdateFailed() ");
                    },
                    applyUpdate: function() {
                        console.warn("empty function called: getUpdateManager().applyUpdate() ");
                    }
                };
            },
            getNetworkType: function(e) {
                setTimeout(function() {
                    e && e.success && e.success({
                        errMsg: "getNetworkType:ok",
                        networkType: "wifi"
                    });
                }, 0);
            },
            checkSession: function(e) {
                setTimeout(function() {
                    e && e.success && e.success();
                }, 0);
            },
            init: function(e) {
                o.initGame(e);
            }
        };
        n.default = r;
    }, {
        "../SSSGameConfig": 5,
        "./ToastAndModal": 3
    } ],
    3: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: true
        });
        n.vhs = {
            showToast: function(e) {
                var t = this;
                var n = function() {
                    var e = t.getValidMetaWidthScale();
                    var n = document.getElementsByTagName("body")[0];
                    var a = document.createElement("div");
                    a.id = "vhs-main-toast";
                    a.style.visibility = "hidden";
                    a.style.minWidth = "45%";
                    a.style.maxWidth = "55%";
                    a.style.left = "0";
                    a.style.right = "0";
                    a.style.marginLeft = "auto";
                    a.style.marginRight = "auto";
                    a.style.backgroundColor = "#333";
                    a.style.color = "#fff";
                    a.style.textAlign = "center";
                    a.style.borderRadius = 5 * e + "px";
                    a.style.padding = 10 * e + "px";
                    a.style.position = "fixed";
                    a.style.zIndex = "10";
                    a.style.top = "35%";
                    a.style.fontSize = 16 * e + "px";
                    n.appendChild(a);
                };
                var a = function() {
                    var e = document.getElementById("vhs-main-toast");
                    e.parentNode.removeChild(e);
                };
                var o = 3e3;
                if (e.duration) {
                    o = e.duration;
                }
                if (e.content) {
                    n();
                    var r = document.getElementById("vhs-main-toast");
                    r.innerHTML = e.content;
                    r.style.visibility = "visible";
                    setTimeout(function() {
                        a();
                        if (e.complete) e.complete();
                    }, o);
                }
            },
            getValidMetaWidthScale: function() {
                var e = 1;
                var t = document.getElementsByTagName("meta");
                var n = 0;
                for (var a = t.length - 1; a >= 0; a--) {
                    var o = t[a];
                    var r = o.getAttribute("content");
                    if (r == null || r.indexOf("width") == -1 || r == "null") continue;
                    var i = r.split(",");
                    for (var c = 0, s = i.length; c < s; c++) {
                        var l = i[c];
                        if (l.indexOf("width") == -1) {
                            continue;
                        }
                        var u = l.split("=");
                        n = +u[u.length - 1];
                    }
                    if (n > 0) {
                        break;
                    }
                }
                var f = 375;
                if (n != 0) {
                    e = n / f;
                }
                return e;
            },
            showModal: function(e) {
                var t = this;
                var n = function() {
                    var e = t.getValidMetaWidthScale();
                    var n = document.getElementsByTagName("body")[0];
                    var a = document.createElement("div");
                    a.id = "vhs-modal-bg-cover";
                    a.style.backgroundColor = "rgba(51, 51, 51, 0.85)";
                    a.style.width = "100%";
                    a.style.height = "100%";
                    a.style.position = "fixed";
                    a.style.zIndex = "999";
                    a.style.top = "0";
                    n.appendChild(a);
                    var o = document.createElement("div");
                    o.id = "vhs-modal-warp";
                    o.style.visibility = "visible";
                    o.style.minWidth = "50%";
                    o.style.maxWidth = "66.8%";
                    o.style.backgroundColor = "#fff";
                    o.style.color = "#333";
                    o.style.textAlign = "center";
                    o.style.borderRadius = 5 * e + "px";
                    o.style.paddingTop = 10 * e + "px";
                    o.style.position = "fixed";
                    o.style.zIndex = "10";
                    o.style.left = "0";
                    o.style.right = "0";
                    o.style.marginLeft = "auto";
                    o.style.marginRight = "auto";
                    o.style.top = "44%";
                    o.style.fontSize = 15 * e + "px";
                    o.style.borderStyle = "solid";
                    o.style.borderColor = "#e1e0e4";
                    o.style.borderWidth = 1 * e + "px";
                    a.appendChild(o);
                    var r = document.createElement("div");
                    o.appendChild(r);
                    var i = document.createElement("p");
                    i.id = "vhs-modal-title";
                    i.style.fontSize = 16 * e + "px";
                    i.style.marginTop = "0px";
                    i.style.marginBottom = "0px";
                    r.appendChild(i);
                    var c = document.createElement("div");
                    c.id = "vhs-modal-content";
                    c.style.paddingTop = 10 * e + "px";
                    c.style.paddingBottom = 15 * e + "px";
                    c.style.paddingLeft = 10 * e + "px";
                    c.style.paddingRight = 10 * e + "px";
                    c.style.fontSize = 14 * e + "px";
                    c.style.color = "rgb(95, 92, 92)";
                    r.appendChild(c);
                    var s = document.createElement("div");
                    s.id = "vhs-modal-action";
                    s.style.bottom = 9 * e + "px";
                    s.style.width = "100%";
                    s.style.borderTop = "1px solid rgb(191, 190, 190)";
                    s.style.height = 41 * e + "px";
                    o.appendChild(s);
                    var l = document.createElement("div");
                    l.id = "vhs-modal-cancel";
                    l.style.float = "left";
                    l.style.width = "50%";
                    l.style.color = "red";
                    l.style.height = 41 * e + "px";
                    l.style.lineHeight = 41 * e + "px";
                    s.appendChild(l);
                    var u = document.createElement("div");
                    u.id = "vhs-modal-confirm";
                    u.style.float = "right";
                    u.style.width = "49%";
                    u.style.height = 41 * e + "px";
                    u.style.lineHeight = 41 * e + "px";
                    u.style.borderLeft = "1px solid rgb(191, 190, 190)";
                    s.appendChild(u);
                };
                var a = function() {
                    var e = document.getElementById("vhs-modal-bg-cover");
                    e.parentNode.removeChild(e);
                };
                var o = function() {
                    var e = t.getValidMetaWidthScale();
                    var n = document.getElementById("vhs-modal-warp");
                    var a = window.outerHeight;
                    n.style.top = (a * e - n.clientHeight) / 2 + "px";
                    console.log((a * e - n.clientHeight) / 2 + "px");
                };
                if (e.content) {
                    n();
                    var r = document.getElementById("vhs-modal-title");
                    r.innerText = e.title || "Tips";
                    var i = document.getElementById("vhs-modal-content");
                    i.innerText = e.content;
                    var c = document.getElementById("vhs-modal-cancel");
                    c.innerHTML = e.cancelTitle || "Cancel";
                    o();
                    c.onclick = function() {
                        if (e.cancel) {
                            e.cancel();
                        }
                        if (e.success) e.success({
                            cancel: true
                        });
                        if (e.complete) e.complete({
                            cancel: true
                        });
                        a();
                    };
                    var s = document.getElementById("vhs-modal-confirm");
                    s.innerHTML = e.confirmTitle || "Confirm";
                    s.onclick = function() {
                        if (e.confirm) e.confirm();
                        if (e.success) e.success({
                            confirm: true
                        });
                        if (e.complete) e.complete({
                            confirm: true
                        });
                        a();
                    };
                }
            }
        };
    }, {} ],
    4: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: true
        });
        var a = e("./H5/H5");
        var o = e("./FBInstant/FBInstant");
        var r;
        (function(e) {
            e[e["H5"] = 0] = "H5";
            e[e["FBINSTANT"] = 1] = "FBINSTANT";
        })(r || (r = {}));
        var i = function() {
            if (window["FBInstant"]) {
                return r.FBINSTANT;
            }
            return r.H5;
        };
        var c = function(e) {
            return Object.assign(a.default, e);
        };
        var s;
        var l = i();
        console.log("platform::::", l);
        window["getPlatform"] = i;
        switch (l) {
          case r.H5:
            s = a.default;
            break;

          case r.FBINSTANT:
            s = Object.assign(c(o.default), window["FBInstant"]);
            break;
        }
        s = new Proxy(s, {
            get: function(e, t) {
                var n = Reflect.get(e, t);
                if (typeof n === typeof void 0) {
                    n = function() {
                        var e = [];
                        for (var n = 0; n < arguments.length; n++) {
                            e[n] = arguments[n];
                        }
                        console.log("empty functions:", t, "args:", e);
                        return new Proxy({}, {
                            get: function(e, t) {
                                return function() {
                                    var e = [];
                                    for (var n = 0; n < arguments.length; n++) {
                                        e[n] = arguments[n];
                                    }
                                    console.log("call empty functions:", t, e);
                                };
                            }
                        });
                    };
                }
                return n;
            }
        });
        window["oldWx"] = window["wx"];
        window["wx"] = window["wx"] || s;
        window["FBInstant"] = window["FBInstant"] || s;
        window["PlatformAPI"] = s;
        n.default = s;
    }, {
        "./FBInstant/FBInstant": 1,
        "./H5/H5": 2
    } ],
    5: [ function(e, t, n) {
        "use strict";
        var a = this;
        Object.defineProperty(n, "__esModule", {
            value: true
        });
        n.initGame = function(e) {
            var t = window;
            if (!t["PlatformAPI"]) {
                console.error("先引用PlatformAPI, 再引用SSSGameConfig!");
                debugger;
            }
            var n = "https://fb.sanshengshi.xyz/game/fb/share.html?fb=";
            var o;
            var r;
            var i;
            var c;
            var s;
            var l;
            var u;
            var f = false;
            var d = null;
            var g = false;
            var v = null;
            var m = null;
            var h = null;
            var y = null;
            var p = null;
            var I = null;
            var S = function(e, t, n, a, o, r, i) {
                v = t;
                m = n;
                h = a;
                y = o;
                p = r;
                I = i;
            };
            var T = {};
            t.INeedUserInfo = function() {};
            t.initSSSGameConfig = function(t, a) {
                if (f) {
                    a && a();
                    t && t();
                    return;
                }
                f = true;
                var r = function() {
                    wx.request({
                        url: n + e,
                        success: function(e) {
                            console.log("game config", e);
                            if (e.data && e.data.status === 1) {
                                var n = e.data;
                                o(n, t, function() {
                                    a && a();
                                });
                            } else {
                                r();
                            }
                        },
                        failed: function() {
                            r();
                        },
                        complete: function() {
                            console.log("sdk request complete!");
                        }
                    });
                };
                r();
            };
            o = function(e, t, n) {
                c(e);
                r(e);
                i(e);
                s(e, t, n);
                u(e.fb_share.share);
                l();
                if (d) {
                    SSSGameConfig.setSSSmoregameBtn(d);
                    d = null;
                }
                n && n();
            };
            l = function() {
                var e = {
                    getRandomShareUnit: true,
                    createBrandSprite: true,
                    setSSSmoregameBtn: true,
                    createMoreGameBtn: true,
                    getSwitchState: true,
                    loadMygameUrlJosn: true,
                    getGameConfig: true
                };
                var n = t;
                n.SSSGameConfig = {};
                n.PlatformAPI = t.PlatformAPI || {};
                for (var a in T) {
                    t.SSSGameConfig[a] = T[a];
                    console.log("add SSSGameConfig function : " + a);
                }
                for (var a in e) {
                    n.SSSGameConfig[a] = n.SSSGameConfig[a] || function() {};
                }
            };
            c = function(e) {
                T.getSwitchState = function() {
                    return true;
                };
            };
            s = function(e, n, o) {
                var r = {
                    hugeScale: 1.1,
                    toHugeTime: 1,
                    delayTime: .8,
                    smallScale: .9,
                    toSmallTime: 1.5
                };
                var i = function(e) {
                    var n = t.Laya;
                    var o = function(e, t) {
                        e.x = t.x, e.y = t.y;
                    };
                    var i = function(e, t, a, r) {
                        if (typeof r != typeof undefined) {
                            a = {
                                x: a,
                                y: r
                            };
                        }
                        var i = n.loader.getRes(e);
                        if (!i) return console.error("加载图片失败! ", e), null;
                        var c = new n.Sprite();
                        c.graphics.drawTexture(i, 0, 0);
                        c.width = i._w;
                        c.height = i._h;
                        c.pivot(c.width / 2, c.height / 2);
                        t && t.addChild(c);
                        a && o(c, a);
                        return c;
                    };
                    m = i;
                    var c = function(e, t, o) {
                        var r = [];
                        e.forEach(function(e, n) {
                            t[n] = e;
                            r.push({
                                url: e,
                                type: "image"
                            });
                        });
                        n.loader.load(r, n.Handler.create(a, o));
                    };
                    var s = function() {};
                    var l = function(e, t) {
                        e.on("mousedown", null, t);
                    };
                    var u = function(e, t) {
                        var a = n.loader.getRes(t);
                        e.graphics.clear();
                        e.graphics.drawTexture(a, 0, 0);
                        e.width = a._w;
                        e.height = a._h;
                    };
                    var f = function(e, t) {
                        var n = e.getChildByName(t);
                        n && n.destroy();
                    };
                    var d = function(e) {
                        e.timerLoop((r.toHugeTime + r.toSmallTime + r.delayTime) * 1e3, e, function() {
                            n.Tween.to(e, {
                                scaleX: r.hugeScale,
                                scaleY: r.hugeScale
                            }, r.toHugeTime * 1e3, null, n.Handler.create(e, function() {
                                n.Tween.to(e, {}, r.delayTime * 1e3, null, n.Handler.create(e, function() {
                                    n.Tween.to(e, {
                                        scaleX: r.smallScale,
                                        scaleY: r.smallScale
                                    }, r.toSmallTime * 1e3);
                                }));
                            }));
                        });
                    };
                    S(s, c, i, l, u, f, d);
                    setTimeout(function() {
                        e();
                    }, 0);
                };
                var c = function(e) {
                    var n = t.cc;
                    var a = {};
                    var o = function(e, t, a) {
                        var o = 0;
                        var r = function(r) {
                            if (typeof e[r] != typeof "" || e[r].indexOf("https") == -1) return "continue";
                            var i = e[r];
                            o++;
                            n.loader.load(i, function(e, n) {
                                t[r] = n;
                                o--;
                                if (o == 0) {
                                    a && a();
                                }
                            });
                        };
                        for (var i in e) {
                            r(i);
                        }
                    };
                    var i = function(e, t, a) {
                        var o = new n.Node();
                        var r = new n.SpriteFrame();
                        o.addComponent(n.Sprite).spriteFrame = r;
                        t && t.addChild(o);
                        a && (o.position = a);
                        r.setTexture(e);
                        return o;
                    };
                    var c = function(e, t, n) {
                        return i(a.brandImage, e, {
                            x: t,
                            y: n
                        });
                    };
                    var s = function(e, t) {
                        e.on("touchstart", t);
                    };
                    var l = function(e, t) {
                        e.getComponent(n.Sprite).spriteFrame.setTexture(t);
                    };
                    var u = function(e, t) {
                        var n = e.getChildByName(t);
                        n && n.destroy();
                    };
                    var f = function(e) {
                        e.runAction(n.repeatForever(n.sequence(n.scaleTo(r.toHugeTime, r.hugeScale), n.delayTime(r.delayTime), n.scaleTo(r.toSmallTime, r.smallScale))));
                    };
                    S(c, o, i, s, l, u, f);
                    setTimeout(function() {
                        e();
                    }, 0);
                };
                var s = function(e) {
                    var n = t.egret;
                    var a = t.eui;
                    var o = t.RES;
                    var i = {};
                    var c = function(e, t, n) {
                        var o = new a.Image(e);
                        o.anchorOffsetX = e.textureWidth / 2;
                        o.anchorOffsetY = e.textureHeight / 2;
                        n && (o.x = n.x, o.y = n.y);
                        t && t.addChild(o);
                        return o;
                    };
                    var s = function(e, t, n) {
                        var a = 0;
                        var r = function(r) {
                            if (typeof e[r] != typeof "" || e[r].indexOf("https") == -1) return "continue";
                            var i = e[r];
                            a++;
                            o.getResByUrl(i, function(e) {
                                t[r] = e;
                                a--;
                                if (a == 0) {
                                    n && n();
                                }
                            }, null, o.ResourceItem.TYPE_IMAGE);
                        };
                        for (var i in e) {
                            r(i);
                        }
                    };
                    var l = function(e, t, n) {
                        return c(i.brandImage, e, {
                            x: t,
                            y: n
                        });
                    };
                    var u = function(e, t) {
                        e.addEventListener(n.TouchEvent.TOUCH_BEGIN, function() {
                            t();
                        }, e);
                    };
                    var f = function(e, t) {
                        e.source = t;
                    };
                    var d = function(e, t) {
                        var n = e.getChildByName(t);
                        n && e.removeChild(n);
                    };
                    var g = function(e) {
                        n.Tween.get(e, {
                            loop: true
                        }).to({
                            scaleX: r.hugeScale,
                            scaleY: r.hugeScale
                        }, r.toHugeTime * 500).wait(r.delayTime * 1e3).to({
                            scaleX: r.smallScale,
                            scaleY: r.smallScale
                        }, r.toSmallTime * 1e3).to({
                            scaleX: 1,
                            scaleY: 1
                        }, r.toHugeTime * 500);
                    };
                    S(l, s, c, u, f, d, g);
                    setTimeout(function() {
                        e();
                    }, 0);
                };
                var l = function() {
                    var e = t.ccui;
                    var a = t.cc;
                    var o = {};
                    var i = function(e, t, n) {
                        var o = new a.Sprite(e);
                        n && o.setPosition(n);
                        t && t.addChild(o);
                        return o;
                    };
                    var c = function(e, t, n) {
                        var o = 0;
                        var r = function(r) {
                            if (typeof e[r] != typeof "" || e[r].indexOf("https") == -1) return "continue";
                            var i = e[r];
                            o++;
                            a.loader.loadImg(i, function() {}, function(e, i) {
                                var c = new a.Texture2D();
                                c.initWithElement(i);
                                c.handleLoadedTexture();
                                t[r] = c;
                                o--;
                                if (o == 0) {
                                    n && n();
                                }
                            });
                        };
                        for (var i in e) {
                            r(i);
                        }
                    };
                    var s = function(e, t, n) {
                        return i(o.brandImage, e, {
                            x: t,
                            y: n
                        });
                    };
                    var l = function(e, t) {
                        e.addClickEventListener(t);
                    };
                    var u = function(e, t) {
                        e.loadTextureNormal(t);
                    };
                    var f = function(e, t) {
                        var n = e.getChildByName(t);
                        n && e.removeChild(n);
                    };
                    var d = function(t, n, a) {
                        var o = e.Button.create();
                        o.setTouchEnabled(true);
                        o.loadTextures(t, "", "");
                        n.addChild(o);
                        o.setPosition(a);
                        return o;
                    };
                    var g = function(e) {
                        e.runAction(a.repeatForever(a.sequence(a.scaleTo(r.toHugeTime, r.hugeScale), a.delayTime(r.delayTime), a.scaleTo(r.toSmallTime, r.smallScale))));
                    };
                    S(s, function(e, t, n) {
                        c(e, t, function() {
                            for (var a in e) {
                                t[a] = e[a];
                            }
                            n();
                        });
                    }, d, l, u, f, g);
                    setTimeout(function() {
                        n();
                    }, 0);
                };
                var u = function() {
                    if (typeof t != "undefined" && t["cc"]) {
                        if (t["cc"]["DEFAULT_ENGINE"]) {
                            console.log("%c \n\n================================\n\n " + t["cc"]["DEFAULT_ENGINE"] + " Project\n\n================================\n\n", "color:#ff0000");
                            return l;
                        }
                        console.log("%c \n\n================================\n\n Cocos Creator Project\n\n================================\n\n", "color:#ff0000");
                        return c;
                    } else if (typeof t != "undefined" && t["egret"]) {
                        console.log("%c \n\n================================\n\n Egret Project\n\n================================\n\n", "color:#ff0000");
                        return s;
                    } else if (typeof t != "undefined" && (t["laya"] || t["Laya"])) {
                        console.log("%c \n\n================================\n\n Laya Project\n\n================================\n\n", "color:#ff0000");
                        return i;
                    } else {
                        console.log("%c \n\n================================\n\nUnkonw Project!!!\n\nUtils Load Failed!!!\n\n================================\n\n", "color:#ff0000");
                    }
                    return null;
                };
                var f = function() {
                    var e = u();
                    e && e(n);
                };
                f();
            };
            r = function(e) {
                PlatformAPI.initAd(e);
            };
            i = function() {
                var e = function() {
                    return {
                        title: "",
                        imageUrl: ""
                    };
                };
                T.getRandomShareUnit = e;
            };
            u = function(e) {
                var n = function() {};
                T.loadMygameUrlJosn = n;
                var a = null;
                var o = function(n) {
                    if (!p) {
                        d = n;
                        return;
                    }
                    var o = function() {
                        var e = function(e, t, n, a, o) {
                            var r = "__SSSMoreGame_" + n;
                            p(e, r);
                            var i = [];
                            var c = t.icon_image.length;
                            if (c == 0) return;
                            v(t.icon_image, i, function() {
                                var s = m(i[0], e, {
                                    x: isNaN(a) ? t.icon_image_x : a,
                                    y: isNaN(o) ? t.icon_image_y : o
                                });
                                s.name = r;
                                I(s);
                                h(s, function() {
                                    wx.navigateToMiniProgram({
                                        appId: t.jump_appid,
                                        btnIndex: n,
                                        extraData: {
                                            appid: t.appid
                                        }
                                    });
                                });
                                if (!t.icon_space) return;
                                var l = 0;
                                var u = setInterval(function() {
                                    try {
                                        y(s, i[l]);
                                    } catch (e) {
                                        console.log("change frame fail! ", e);
                                        clearInterval(u);
                                    }
                                    l++;
                                    if (l == c) {
                                        l = 0;
                                    }
                                }, t.icon_space);
                            });
                        };
                        a.forEach(function(t, a) {
                            e(n, t, a);
                        });
                        t.createMoreGameBtn = function(t, n, o, r) {
                            e(t, a[n], n, o, r);
                        };
                    };
                    if (a) {
                        o();
                        return;
                    }
                    setTimeout(function() {
                        var t = [];
                        e.forEach(function(e, n) {
                            t.push({
                                bind_id: 0,
                                type: 1,
                                icon_image: [ e.icon_image ],
                                icon_image_x: +e.icon_image_x,
                                icon_image_y: +e.icon_image_y,
                                jump_appid: e.appid,
                                index: n
                            });
                        });
                        a = t;
                        console.log(a);
                        o();
                    }, 0);
                };
                T.setSSSmoregameBtn = o;
                T.createMoreGameBtn = function() {
                    console.error("创建单个MoreGameBtn调用太早了!");
                };
            };
        };
    }, {} ]
}, {}, [ 4 ]);