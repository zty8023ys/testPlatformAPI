(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shareUnit = { title: "Let's play this amazing game!", imageUrl: "./fbcdn/shareImage.png" };
var serverReportHttp = "https://fb.sanshengshi.xyz";
var MAX_AD_INSTANCE = 3;
var VideoStatus;
(function (VideoStatus) {
    VideoStatus[VideoStatus["UNLOAD"] = 0] = "UNLOAD";
    VideoStatus[VideoStatus["LOADING"] = 1] = "LOADING";
    VideoStatus[VideoStatus["LOADED"] = 2] = "LOADED";
})(VideoStatus || (VideoStatus = {}));
var videoMap = {};
var VideoType;
(function (VideoType) {
    VideoType[VideoType["REWARD"] = 0] = "REWARD";
    VideoType[VideoType["INTERSTITIAL"] = 1] = "INTERSTITIAL";
})(VideoType || (VideoType = {}));
videoMap[VideoType.REWARD] = {
    id: "",
    list: []
};
videoMap[VideoType.INTERSTITIAL] = {
    id: "",
    list: []
};
var __index = 0;
var createVideoUnit = function () {
    __index++;
    return {
        status: VideoStatus.UNLOAD,
        instance: null,
        index: __index
    };
};
for (var i = 0; i < MAX_AD_INSTANCE; i++) {
    videoMap[VideoType.REWARD].list.push(createVideoUnit());
    videoMap[VideoType.INTERSTITIAL].list.push(createVideoUnit());
}
var initAd = function (adUnit, videoType) {
    var videoId = videoMap[videoType].id;
    var initFunc = null;
    var typeStr = "";
    if (videoType === VideoType.REWARD) {
        typeStr = "视频";
        initFunc = FBInstant.getRewardedVideoAsync.bind(FBInstant);
    }
    else {
        typeStr = "插屏";
        initFunc = FBInstant.getInterstitialAdAsync.bind(FBInstant);
    }
    var loadAd = function () {
        adUnit.instance.loadAsync().then(function () {
            console.log("加载" + typeStr + "广告成功!" + adUnit.index);
            adUnit.status = VideoStatus.LOADED;
        }).catch(function (e) {
            adUnit.status = VideoStatus.UNLOAD;
            console.log("加载" + typeStr + "广告失败! " + adUnit.index);
            console.error(e);
        });
    };
    if (adUnit.instance) {
        loadAd();
    }
    else {
        initFunc(videoId).then(function (video) {
            adUnit.instance = video;
            loadAd();
        }).catch(function (e) {
            adUnit.status = VideoStatus.UNLOAD;
            console.log("初始化" + typeStr + "广告失败! " + adUnit.index);
            console.error(e);
        });
    }
};
var getVideoAdInstant = function (videoType) {
    if (!videoMap[videoType].id) {
        return;
    }
    var ret = null;
    videoMap[videoType].list.forEach(function (adUnit, index) {
        switch (adUnit.status) {
            case VideoStatus.UNLOAD:
                adUnit.status = VideoStatus.LOADING;
                setTimeout(function () {
                    initAd(adUnit, videoType);
                }, index * 10000);
                break;
            case VideoStatus.LOADING:
                break;
            case VideoStatus.LOADED:
                ret = ret || adUnit;
                break;
        }
    });
    return ret;
};
var initVideo = function (id) {
    videoMap[VideoType.REWARD].id = id;
    getVideoAdInstant(VideoType.REWARD);
};
var initInterstitial = function (id) {
    videoMap[VideoType.INTERSTITIAL].id = id;
    getVideoAdInstant(VideoType.INTERSTITIAL);
};
var playAd = function (type, callback) {
    var adUnit = getVideoAdInstant(type);
    var needPlayIntersitialAd = type === VideoType.REWARD;
    var videoStr = (needPlayIntersitialAd ? "视频" : "插屏");
    if (adUnit) {
        adUnit.status = VideoStatus.UNLOAD;
        adUnit.instance.showAsync().then(function () {
            delete adUnit.instance;
            getVideoAdInstant(type);
            callback();
        }).catch(function (e) {
            if (e.code !== "RATE_LIMITED") {
                delete adUnit.instance;
            }
            else {
                adUnit.status = VideoStatus.LOADING;
                setTimeout(function () {
                    adUnit.status = VideoStatus.LOADED;
                }, 10000);
            }
            console.error(videoStr, "广告播放失败!", e);
            console.log("尝试获取另一个" + videoStr + "广告");
            playAd(type, callback);
        });
    }
    else {
        console.error("没有已加载完毕的" + videoStr + "广告!");
        console.log(needPlayIntersitialAd ? "即将播放插屏广告!" : "即将直接发放奖励!");
        needPlayIntersitialAd ? playAd(VideoType.INTERSTITIAL, callback) : callback(1);
    }
};
var BannerToInterstitialProbability = 0;
var getImageAsync = function (url, callback) {
    var base64 = url.includes("https") ? PlatformAPI.getItem(url) : "";
    if (!base64) {
        PlatformAPI.getBase64Async(url, function (newBase64) {
            callback(newBase64);
        });
    }
    else {
        callback(base64);
    }
};
var updateAsync = function (options) {
    var callback = options.callback;
    if (!FBInstant.context.getID())
        return callback && callback(false, "没有环境");
    var score = options.score;
    getImageAsync(shareUnit.imageUrl, function (base64) {
        var t = {
            action: "CUSTOM",
            image: base64,
            text: typeof (score) !== typeof (void 0) ? ({
                default: "I have run " + score + " meters! Challenge me !",
                localizations: {
                    en_US: "I have run " + score + " meters! Challenge me !",
                    zh_CN: "\u6211\u521A\u521A\u8DD1\u4E86 " + score + " \u7C73! \u5FEB\u6765\u8D85\u8D8A\u6211!"
                }
            }) : shareUnit.title,
            template: "",
            notification: "PUSH"
        };
        FBInstant.updateAsync(t).then(function () {
            callback && callback(true);
        }).catch(function (err) {
            callback && callback(false, err);
        });
    });
};
var subscribeBotAsync = function (gameId) {
    var update = function (subscribeStatus) {
        PlatformAPI.request({
            url: serverReportHttp + "/game/fb/subscribe.html",
            data: {
                fb: gameId,
                player_id: FBInstant.player.getID(),
                subscribe: subscribeStatus
            },
            method: "POST"
        });
    };
    FBInstant.player.canSubscribeBotAsync().then(function (can_subscribe) {
        can_subscribe && FBInstant.player.subscribeBotAsync().then(function (a) {
            console.log("then,", a);
            update(1);
        }).catch(function (e) {
            console.log("catch,", e);
            update(0);
        });
    }).catch(function (n) {
        console.log(n);
    });
};
var updateUserInfo = function (gameId, callback) {
    var update = function () {
        PlatformAPI.request({
            url: serverReportHttp + "/game/user/login.html",
            method: "POST",
            data: {
                fb: gameId,
                player_id: FBInstant.player.getID(),
                user_name: FBInstant.player.getName(),
                header_url: FBInstant.player.getPhoto(),
                locale: FBInstant.getLocale()
            },
            success: function () {
                callback && callback();
            },
            fail: function () {
                update();
            }
        });
    };
    if (FBInstant.player.getName() === null) {
        var checkStartGameInterval_1 = setInterval(function () {
            if (FBInstant.player.getName() === null) {
                console.log("等待调用FBInstant.startGameAsync");
            }
            else {
                clearInterval(checkStartGameInterval_1);
                update();
            }
        }, 100);
    }
    else {
        update();
    }
};
var shuffle = function (arr) {
    var _a;
    var n = arr.length;
    var random = null;
    while (0 != n) {
        random = (Math.random() * n--) >>> 0;
        _a = [arr[random], arr[n]], arr[n] = _a[0], arr[random] = _a[1];
    }
    return arr;
};
var updateSessionData = function () {
    FBInstant.player.getConnectedPlayersAsync().then(function (friends) {
        var friendList = [];
        shuffle(friends).slice(0, 3).forEach(function (player) {
            friendList.push({
                name: player.getName(),
                photo: player.getPhoto(),
                id: player.getID(),
            });
        });
        FBInstant.setSessionData({ friendList: friendList });
    });
};
var fbFuncs = {
    platform: "FBInstant",
    share: function (callback) {
        if (callback === void 0) {
            callback = function e() { };
        }
        getImageAsync(shareUnit.imageUrl, function (base64) {
            FBInstant.shareAsync({
                intent: "REQUEST",
                image: base64,
                text: shareUnit.title,
                data: {}
            }).then(function (e) {
                console.log("shareResult", e);
                callback();
            }).catch(function (e) {
                console.error("shareResult", e);
            });
        });
    },
    onHide: function (callback) {
        FBInstant.onPause(callback);
    },
    createShortcut: function () {
        FBInstant.canCreateShortcutAsync().then(function (can) {
            if (can) {
                FBInstant.createShortcutAsync();
            }
        });
    },
    createVideoAd: function (id, callback) {
        playAd(VideoType.REWARD, callback);
    },
    createInterstitialAd: function (id, callback) {
        playAd(VideoType.INTERSTITIAL, callback);
    },
    initAd: function (data) {
        var interstitialAdId = data.fb_site.img_ad;
        var rewardedVideoId = data.fb_site.video_ad;
        BannerToInterstitialProbability = +data.fb_site.banner_to_interstitial_probability;
        console.log("RewardedVideoId:", rewardedVideoId || "视频广告未配置");
        console.log("InterstitialAdId:", interstitialAdId || "插屏广告未配置");
        console.log("BannerToInterstitialProbability:", BannerToInterstitialProbability);
        if (rewardedVideoId && FBInstant.getSupportedAPIs().indexOf('getRewardedVideoAsync') !== -1) {
            initVideo(rewardedVideoId);
        }
        if (interstitialAdId && FBInstant.getSupportedAPIs().indexOf('getInterstitialAdAsync') !== -1) {
            initInterstitial(interstitialAdId);
        }
        updateUserInfo(data.fb_site.id, function () {
            updateSessionData();
            fbFuncs.createShortcut();
            subscribeBotAsync(data.fb_site.id);
        });
    },
    chooseAsync: function (score, callback) {
        FBInstant.context.chooseAsync({
            filter: ['NEW_CONTEXT_ONLY'],
        }).then(function () {
            updateAsync({ score: score, callback: callback });
        }).catch(function () {
            callback && callback(false);
        });
    },
    getLocaleType: function () {
        var locale = FBInstant.getLocale();
        if (locale === "zh_CN") {
            return "zh";
        }
        else {
            return "en";
        }
    },
    shareAppMessage: function (options) {
        fbFuncs.share(options.success);
    },
    navigateToMiniProgram: function (options) {
        PlatformAPI.request({
            method: "POST",
            url: serverReportHttp + "/game/fb/sharelog.html",
            data: {
                fb: options.extraData.boxname,
                index: options.btnIndex,
                type: 1,
                player_id: FBInstant.player.getID()
            }
        });
        FBInstant.switchGameAsync(options.appId, options.extraData).then(function () {
            PlatformAPI.request({
                method: "POST",
                url: serverReportHttp + "/game/fb/sharelog.html",
                data: {
                    fb: options.extraData.boxname,
                    index: options.btnIndex,
                    type: 2,
                    player_id: FBInstant.player.getID()
                }
            });
            options.success && options.success();
        }).catch(function (e) {
            options.fail && options.fail();
        });
    },
    setUserCloudStorage: function (options) {
        var obj = {};
        options.KVDataList.forEach(function (n) {
            obj[n.key] = n.value;
        });
        FBInstant.player.setStatsAsync(obj).then(options.success);
    },
    getPlayerInfo: function () {
        if (FBInstant.player.getName()) {
            return {
                nickName: FBInstant.player.getName(),
                nickname: FBInstant.player.getName(),
                avatarUrl: FBInstant.player.getPhoto()
            };
        }
        else {
            var ret = {};
            Object.defineProperty(ret, 'nickName', {
                get: function () {
                    return FBInstant.player.getName();
                }
            });
            Object.defineProperty(ret, 'nickname', {
                get: function () {
                    return FBInstant.player.getName();
                }
            });
            Object.defineProperty(ret, 'avatarUrl', {
                get: function () {
                    return FBInstant.player.getPhoto();
                }
            });
            return ret;
        }
    },
    setCloudStats: function (data, success) {
        FBInstant.player.setStatsAsync(data).then(function () {
            success && success();
        });
    },
    getCloudStats: function (options) {
    },
    shareWithImage: function (base64, title, callback) {
        if (typeof (callback) !== "function") {
            callback = function () { };
        }
        FBInstant.shareAsync({
            intent: 'REQUEST',
            image: base64,
            text: shareUnit.title,
            data: {},
        }).then(function (result) {
            console.log("shareResult", result);
            callback({});
        }).catch(function (result) {
            console.error("shareResult", result);
        });
    },
    updateLeaderboard: function (leaderboardName, score, extraData) {
        var extraDataStr = undefined;
        if (typeof (extraData) !== typeof (void 0)) {
            if (typeof (extraData) !== typeof ({})) {
                console.error("extraData必须是一个Object");
                debugger;
                return;
            }
            extraDataStr = JSON.stringify(extraData);
        }
        FBInstant.getLeaderboardAsync(leaderboardName)
            .then(function (leaderboard) {
            return leaderboard.setScoreAsync(score, extraDataStr);
        })
            .then(function () {
            fbFuncs.updateScoreToContext(score);
        })
            .catch(function (err) {
            console.error(err);
        });
    },
    createBannerAd: function (position) {
        console.log("banner 转 插屏几率", BannerToInterstitialProbability);
        if (BannerToInterstitialProbability && (Math.random() < BannerToInterstitialProbability / 100)) {
            PlatformAPI.createInterstitialAd(position, function () { });
        }
        return new Proxy({}, {
            get: function (target, key) {
                return function () { };
            }
        });
    },
    createAsync: function (options) {
        var callback = options.callback;
        var id = options.id;
        FBInstant.context.createAsync(id).then(function () {
            updateAsync(options);
        }).catch(function (err) {
            callback && callback(false, err);
        });
    },
    updateScoreToContext: function (score, callback) {
        updateAsync({ score: score, callback: callback });
    }
};
exports.default = fbFuncs;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ToastAndModal_1 = require("./ToastAndModal");
var SSSGameConfig_1 = require("../SSSGameConfig");
var h5Funcs = {
    platform: "H5",
    toast: null,
    showToast: function (obj) {
        if (typeof (obj) === typeof ("")) {
            ToastAndModal_1.vhs.showToast({
                content: obj,
            });
        }
        else {
            obj.title && !obj.content && (obj.content = obj.title);
            ToastAndModal_1.vhs.showToast(obj);
        }
    },
    showModal: function showToast(obj) {
        ToastAndModal_1.vhs.showModal(obj);
    },
    getItem: function (key) {
        return localStorage.getItem(key);
    },
    setItem: function (key, value) {
        return localStorage.setItem(key, value);
    },
    requestOpenId: function () {
        return "";
    },
    createVideoAd: function (id, callback) {
        console.log("视频播放回调");
        callback && callback();
    },
    createInterstitialAd: function (id, callback) {
        console.log("插屏回调");
        callback && callback();
    },
    initAd: function (data, callback) {
        console.log("initAd--data", data);
        callback && callback();
    },
    getLocaleType: function () { return "zh"; },
    setStorageSync: function (key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    setStorage: function (_b) {
        var key = _b.key, data = _b.data, success = _b.success;
        setTimeout(function () {
            localStorage.setItem(key, JSON.stringify(data));
            success && success({ errMsg: "setStorage:ok", });
        }, 0);
    },
    getOpenDataContext: function () {
        return {
            postMessage: function (message) {
                console.log('open data context post message : ', message);
            },
            canvas: h5Funcs.createCanvas()
        };
    },
    getSystemInfo: function (options) {
        setTimeout(function () {
            options && options.success({
                errMsg: "getSystemInfo:ok",
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                SDKVersion: "9.9.9",
                system: "",
            });
        }, 0);
    },
    getSystemInfoSync: function () {
        return {
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            SDKVersion: "9.9.9",
            system: "",
        };
    },
    getLaunchOptionsSync: function () {
        return {
            query: {}
        };
    },
    clearStorage: function (options) {
        setTimeout(function () {
            localStorage.clear();
            options.success && options.success();
        }, 0);
    },
    clearStorageSync: function () {
        localStorage.clear();
    },
    getStorage: function (_a) {
        var key = _a.key, success = _a.success;
        setTimeout(function () {
            var val = localStorage.getItem(key);
            try {
                success && success({ errMsg: "getStorage:ok", data: JSON.parse(val), });
            }
            catch (e) {
                success && success({ errMsg: "getStorage:ok", data: val, });
            }
        }, 0);
    },
    getStorageSync: function (key) {
        var ret = localStorage.getItem(key);
        try {
            return JSON.parse(ret);
        }
        catch (e) {
            return ret;
        }
    },
    removeStorage: function (_b) {
        var key = _b.key, success = _b.success;
        setTimeout(function () {
            localStorage.removeItem(key);
            success && success();
        }, 0);
    },
    removeStorageSync: function (key) {
        localStorage.removeItem(key);
    },
    getStorageInfo: function (_b) {
        var success = _b.success;
        console.error("已废弃, 使用PlatformAPI.getStorage代替");
        setTimeout(function () {
            success && success({});
        }, 0);
    },
    getStorageInfoSync: function () {
        console.error("已废弃, 使用PlatformAPI.getStorageSync代替");
        return {};
    },
    request: function (options) {
        var url = options.url;
        var success = options.success;
        var fail = options.fail;
        var complete = options.complete;
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            var data;
            try {
                data = JSON.parse(request.responseText);
            }
            catch (error) {
                data = request.responseText;
            }
            if (4 == request.readyState) {
                var headers = request.getAllResponseHeaders();
                var arr = headers.trim().split(/[\r\n]+/);
                var headerMap_1 = {};
                arr.forEach(function (line) {
                    var parts = line.split(': ');
                    var header = parts.shift();
                    var value = parts.join(': ');
                    headerMap_1[header] = value;
                });
                if (200 <= request.status && 400 > request.status) {
                    var res = {
                        data: data,
                        header: headerMap_1,
                        statusCode: request.status,
                    };
                    success && success(res);
                    complete && complete(res);
                }
                else {
                    var res = {
                        url: url,
                        method: options.method || 'GET',
                        data: data,
                        statusCode: request.status,
                        header: headerMap_1,
                        errMsg: request.statusText,
                    };
                    fail && fail(res);
                    complete && complete(res);
                }
            }
        };
        request.open(options.method || "GET", url);
        request.send(JSON.stringify(options.data));
    },
    getVideoAdPlayInfoToday: function () {
        return { playTimes: -1, maxTimes: -1, valid: true };
    },
    updateShareMenu: function (options) {
        options && options.success && options.success({});
    },
    getPlayerInfo: function () {
        return {
            nickname: "test",
            nickName: "test",
            avatarUrl: "https://gss1.bdstatic.com/9vo3dSag_xI4khGkpoWK1HF6hhy/baike/c0%3Dbaike80%2C5%2C5%2C80%2C26/sign=4d7b267a0ae93901420f856c1a853f82/7a899e510fb30f2473057259c395d143ac4b03c8.jpg"
        };
    },
    setCloudStats: function (data, success) {
        h5Funcs.setStorageSync("__cloudObject", JSON.stringify(data));
        success && success();
    },
    getCloudStats: function (options) {
        options.success && options.success(h5Funcs.getStorageSync("__cloudObject"));
    },
    login: function (options) {
        options.success && options.success({ errMsg: "login:ok", code: "1" });
    },
    getUserInfo: function (options) {
        options.success && options.success({
            userInfo: window['PlatformAPI'].getPlayerInfo()
        });
    },
    shareAppMessage: function (options) {
        options.success && options.success({});
    },
    onShow: function (callback, needTryLater) {
        if (needTryLater === void 0) { needTryLater = true; }
        if (window['cc']) {
            var cc = window['cc'];
            cc.game.on(cc.game.EVENT_SHOW, function () {
                callback({ query: {} });
            });
        }
        else {
            if (window['Laya'] || window['laya']) {
                var Laya_1 = window['Laya'];
                var waitStage_1 = setInterval(function () {
                    if (Laya_1.stage) {
                        clearInterval(waitStage_1);
                        console.log("regist Laya onShow");
                        Laya_1.stage.on(Laya_1.Event.VISIBILITY_CHANGE, null, function (b) {
                            if (Laya_1.stage._isVisibility) {
                                callback({ query: {} });
                            }
                        });
                    }
                    else {
                        console.log("Laya.stage is not initialied, wait 100 ms to recheck");
                    }
                }, 100);
            }
            else {
                if (window['egret']) {
                    var waitStage_2 = setInterval(function () {
                        var egret = window['egret'];
                        if (egret.lifecycle && egret.lifecycle.stage) {
                            console.log("regist egret onShow");
                            clearInterval(waitStage_2);
                            egret.lifecycle.stage.addEventListener(egret.Event.ACTIVATE, function () {
                                callback({ query: {} });
                            });
                        }
                        else {
                            console.log("egret.lifecycle.stage is not initialied, wait 100 ms to recheck");
                        }
                    }, 100);
                }
                else {
                    if (needTryLater) {
                        console.error("未知引擎, 将在一秒后重试");
                        setTimeout(function () {
                            h5Funcs.onShow(callback, false);
                        }, 1000);
                    }
                    else {
                        console.error("未知引擎, 需要在此处手动添加某种监听返回前台的方法!");
                        debugger;
                    }
                }
            }
        }
    },
    getWXUserInfo: function () {
        return {
            userInfo: window['PlatformAPI'].getPlayerInfo()
        };
    },
    createInnerAudioContext: function () {
        var au = new Audio();
        au.autoplay = 'autoplay';
        au.preload = 'preload';
        var onplaycallbacks = [];
        var _au = {
            play: function () {
                try {
                    au.play();
                }
                catch (err) {
                    console.error(err);
                }
                for (var i = 0; i < onplaycallbacks.length; i++) {
                    onplaycallbacks[i] && onplaycallbacks[i]();
                }
            },
            pause: function () {
                au.pause();
            },
            stop: function () {
                au.pause();
            },
            onEnded: function () {
                console.warn('未实现的方法');
            },
            onPlay: function (callback) {
                onplaycallbacks.push(callback);
            },
        };
        Object.defineProperty(_au, 'src', {
            set: function (value) {
                au.src = value;
            },
            get: function () {
                return au.src;
            }
        });
        return _au;
    },
    createCanvas: function () {
        return document.createElement("canvas");
    },
    createImage: function () {
        return new Image();
    },
    toTempFilePath: function (options) {
        var xOffset = Math.max(0, (options.height * 1.91 - options.width) / 2);
        options.width = Math.max(options.width, options.height * 1.91);
        var cc = window['cc'];
        var cb = function () {
            cc && cc.director.off(cc.Director.EVENT_AFTER_DRAW, cb);
            var gameCanvas = document.querySelectorAll("canvas")[0];
            if (!gameCanvas) {
                console.error("查找canvas失败, 请修改上方代码, 手动定位主canvas");
                debugger;
                return;
            }
            var allBase64 = gameCanvas.toDataURL("image/png");
            var img = new Image();
            img.onload = function () {
                var c = document.createElement("canvas");
                c.width = options.destWidth;
                c.height = options.destHeight;
                var ctx = c.getContext("2d");
                ctx.drawImage(img, options.x, options.y, options.width, options.height, xOffset, 0, c.width, c.height);
                var base64 = c.toDataURL("image/png");
                options.success && options.success(base64);
            };
            img.src = allBase64;
        };
        if (cc) {
            cc.director.on(cc.Director.EVENT_AFTER_DRAW, cb);
        }
        else {
            cb();
        }
    },
    getSetting: function (options) {
        options && options.success && options.success({
            authSetting: {
                "scope.userInfo": true
            }
        });
    },
    getBase64Async: function (imgUrl, cb) {
        if (imgUrl.includes("fbcdn")) {
            var xhr = new XMLHttpRequest();
            xhr.open("get", imgUrl, true);
            xhr.responseType = "blob";
            xhr.onload = function () {
                if (this.status == 200) {
                    var blob = this.response;
                    var oFileReader = new FileReader();
                    oFileReader.onloadend = function (e) {
                        var base64 = e.target['result'];
                        cb && cb(base64);
                    };
                    oFileReader.readAsDataURL(blob);
                }
                else {
                    console.error("加载图片失败!", imgUrl);
                }
            };
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.send();
        }
        else {
            PlatformAPI.request({
                url: "https://fb.sanshengshi.xyz/event/fb/image.html?url=" + imgUrl,
                success: function (ret) {
                    console.log(ret);
                    var base64 = ret.data.message;
                    cb && cb(base64);
                }
            });
        }
    },
    vibrateShort: function () {
        navigator && navigator.vibrate && navigator.vibrate(15);
    },
    vibrateLong: function () {
        navigator && navigator.vibrate && navigator.vibrate(400);
    },
    getUpdateManager: function () {
        return {
            onCheckForUpdate: function (callback) {
                console.warn('empty function called: getUpdateManager().onCheckForUpdate() ');
                callback && callback({
                    hasUpdate: false,
                });
            },
            onUpdateReady: function () {
                console.warn('empty function called: getUpdateManager().onUpdateReady() ');
            },
            onUpdateFailed: function () {
                console.warn('empty function called: getUpdateManager().onUpdateFailed() ');
            },
            applyUpdate: function () {
                console.warn('empty function called: getUpdateManager().applyUpdate() ');
            },
        };
    },
    getNetworkType: function (options) {
        setTimeout(function () {
            options && options.success && options.success({
                "errMsg": "getNetworkType:ok",
                "networkType": "wifi"
            });
        }, 0);
    },
    checkSession: function (options) {
        setTimeout(function () {
            options && options.success && options.success();
        }, 0);
    },
    init: function (gameId) {
        SSSGameConfig_1.initGame(gameId);
    }
};
exports.default = h5Funcs;

},{"../SSSGameConfig":5,"./ToastAndModal":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vhs = {
    showToast: function (toast) {
        var that = this;
        var createToastTemplate = function () {
            var scale = that.getValidMetaWidthScale();
            var x = document.getElementsByTagName("body")[0];
            var v = document.createElement("div");
            v.id = "vhs-main-toast";
            v.style.visibility = "hidden";
            v.style.minWidth = "45%";
            v.style.maxWidth = "55%";
            v.style.left = "0";
            v.style.right = "0";
            v.style.marginLeft = "auto";
            v.style.marginRight = "auto";
            v.style.backgroundColor = "#333";
            v.style.color = "#fff";
            v.style.textAlign = "center";
            v.style.borderRadius = 5 * scale + "px";
            v.style.padding = 10 * scale + "px";
            v.style.position = "fixed";
            v.style.zIndex = "10";
            v.style.top = "35%";
            v.style.fontSize = 16 * scale + "px";
            x.appendChild(v);
        };
        var removeToast = function () {
            var v = document.getElementById("vhs-main-toast");
            v.parentNode.removeChild(v);
        };
        var duration = 3000;
        if (toast.duration) {
            duration = toast.duration;
        }
        if (toast.content) {
            createToastTemplate();
            var x = document.getElementById("vhs-main-toast");
            x.innerHTML = toast.content;
            x.style.visibility = "visible";
            setTimeout(function () {
                removeToast();
                if (toast.complete)
                    toast.complete();
            }, duration);
        }
    },
    getValidMetaWidthScale: function () {
        var scale = 1;
        var metaTagList = document.getElementsByTagName('meta');
        var metaContentWidth = 0;
        for (var i = metaTagList.length - 1; i >= 0; i--) {
            var meta = metaTagList[i];
            var content = meta.getAttribute('content');
            if (content == null || content.indexOf("width") == -1 || content == "null")
                continue;
            var attributeList = content.split(",");
            for (var j = 0, len = attributeList.length; j < len; j++) {
                var attr = attributeList[j];
                if (attr.indexOf("width") == -1) {
                    continue;
                }
                var widthArray = attr.split("=");
                metaContentWidth = +widthArray[widthArray.length - 1];
            }
            if (metaContentWidth > 0) {
                break;
            }
        }
        var standardMetaWidth = 375.0;
        if (metaContentWidth != 0) {
            scale = metaContentWidth / standardMetaWidth;
        }
        return scale;
    },
    showModal: function (modal) {
        var that = this;
        var createModalTemplate = function () {
            var scale = that.getValidMetaWidthScale();
            var body = document.getElementsByTagName("body")[0];
            var bgCover = document.createElement("div");
            bgCover.id = "vhs-modal-bg-cover";
            bgCover.style.backgroundColor = "rgba(51, 51, 51, 0.85)";
            bgCover.style.width = "100%";
            bgCover.style.height = "100%";
            bgCover.style.position = "fixed";
            bgCover.style.zIndex = "999";
            bgCover.style.top = "0";
            body.appendChild(bgCover);
            var warp = document.createElement("div");
            warp.id = "vhs-modal-warp";
            warp.style.visibility = "visible";
            warp.style.minWidth = "50%";
            warp.style.maxWidth = "66.8%";
            warp.style.backgroundColor = "#fff";
            warp.style.color = "#333";
            warp.style.textAlign = "center";
            warp.style.borderRadius = 5 * scale + "px";
            warp.style.paddingTop = 10 * scale + "px";
            warp.style.position = "fixed";
            warp.style.zIndex = "10";
            warp.style.left = "0";
            warp.style.right = "0";
            warp.style.marginLeft = "auto";
            warp.style.marginRight = "auto";
            warp.style.top = "44%";
            warp.style.fontSize = 15 * scale + "px";
            warp.style.borderStyle = "solid";
            warp.style.borderColor = "#e1e0e4";
            warp.style.borderWidth = 1 * scale + "px";
            bgCover.appendChild(warp);
            var topDiv = document.createElement("div");
            warp.appendChild(topDiv);
            var title = document.createElement("p");
            title.id = "vhs-modal-title";
            title.style.fontSize = 16 * scale + "px";
            title.style.marginTop = "0px";
            title.style.marginBottom = "0px";
            topDiv.appendChild(title);
            var content = document.createElement("div");
            content.id = "vhs-modal-content";
            content.style.paddingTop = 10 * scale + "px";
            content.style.paddingBottom = 15 * scale + "px";
            content.style.paddingLeft = 10 * scale + "px";
            content.style.paddingRight = 10 * scale + "px";
            content.style.fontSize = 14 * scale + "px";
            content.style.color = "rgb(95, 92, 92)";
            topDiv.appendChild(content);
            var actionDiv = document.createElement("div");
            actionDiv.id = "vhs-modal-action";
            actionDiv.style.bottom = 9 * scale + "px";
            actionDiv.style.width = "100%";
            actionDiv.style.borderTop = "1px solid rgb(191, 190, 190)";
            actionDiv.style.height = 41 * scale + "px";
            warp.appendChild(actionDiv);
            var cancel = document.createElement("div");
            cancel.id = "vhs-modal-cancel";
            cancel.style.float = "left";
            cancel.style.width = "50%";
            cancel.style.color = "red";
            cancel.style.height = 41 * scale + "px";
            cancel.style.lineHeight = 41 * scale + "px";
            actionDiv.appendChild(cancel);
            var confirm = document.createElement("div");
            confirm.id = "vhs-modal-confirm";
            confirm.style.float = "right";
            confirm.style.width = "49%";
            confirm.style.height = 41 * scale + "px";
            confirm.style.lineHeight = 41 * scale + "px";
            confirm.style.borderLeft = "1px solid rgb(191, 190, 190)";
            actionDiv.appendChild(confirm);
        };
        var removeModal = function () {
            var w = document.getElementById("vhs-modal-bg-cover");
            w.parentNode.removeChild(w);
        };
        var fixModalPosition = function () {
            var scale = that.getValidMetaWidthScale();
            var warpDiv = document.getElementById("vhs-modal-warp");
            var winOutHeight = window.outerHeight;
            warpDiv.style.top = (winOutHeight * scale - warpDiv.clientHeight) / 2 + "px";
            console.log((winOutHeight * scale - warpDiv.clientHeight) / 2 + "px");
        };
        if (modal.content) {
            createModalTemplate();
            var title = document.getElementById("vhs-modal-title");
            title.innerText = modal.title || "Tips";
            var content = document.getElementById("vhs-modal-content");
            content.innerText = modal.content;
            var cancel = document.getElementById("vhs-modal-cancel");
            cancel.innerHTML = modal.cancelTitle || "Cancel";
            fixModalPosition();
            cancel.onclick = function () {
                if (modal.cancel) {
                    modal.cancel();
                }
                if (modal.success)
                    modal.success({ cancel: true });
                if (modal.complete)
                    modal.complete({ cancel: true });
                removeModal();
            };
            var confirm = document.getElementById("vhs-modal-confirm");
            confirm.innerHTML = modal.confirmTitle || "Confirm";
            confirm.onclick = function () {
                if (modal.confirm)
                    modal.confirm();
                if (modal.success)
                    modal.success({ confirm: true });
                if (modal.complete)
                    modal.complete({ confirm: true });
                removeModal();
            };
        }
    }
};

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var H5_1 = require("./H5/H5");
var FBInstant_1 = require("./FBInstant/FBInstant");
var platforms;
(function (platforms) {
    platforms[platforms["H5"] = 0] = "H5";
    platforms[platforms["FBINSTANT"] = 1] = "FBINSTANT";
})(platforms || (platforms = {}));
var getPlatform = function () {
    if (window['FBInstant']) {
        return platforms.FBINSTANT;
    }
    return platforms.H5;
};
var wrapper = function (funcs) {
    return Object.assign(H5_1.default, funcs);
};
var PlatformAPI;
var p = getPlatform();
console.log("platform::::", p);
window['getPlatform'] = getPlatform;
switch (p) {
    case platforms.H5:
        PlatformAPI = H5_1.default;
        break;
    case platforms.FBINSTANT:
        PlatformAPI = Object.assign(wrapper(FBInstant_1.default), window['FBInstant']);
        break;
}
PlatformAPI = new Proxy(PlatformAPI, {
    get: function (target, key) {
        var ret = Reflect.get(target, key);
        if (typeof (ret) === typeof (void 0)) {
            ret = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                console.log("empty functions:", key, "args:", args);
                return new Proxy({}, {
                    get: function (target, key) {
                        return function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            console.log("call empty functions:", key, args);
                        };
                    }
                });
            };
        }
        return ret;
    }
});
window['oldWx'] = window['wx'];
window['wx'] = window['wx'] || PlatformAPI;
window['FBInstant'] = window['FBInstant'] || PlatformAPI;
window['PlatformAPI'] = PlatformAPI;
exports.default = PlatformAPI;

},{"./FBInstant/FBInstant":1,"./H5/H5":2}],5:[function(require,module,exports){
"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGame = function (__gameId) {
    if (!window['PlatformAPI']) {
        console.error("先引用PlatformAPI, 再引用SSSGameConfig!");
        debugger;
    }
    var serverHttp = "https://fb.sanshengshi.xyz/game/fb/share.html?fb=";
    var initConfig;
    var initAd;
    var initShare;
    var initSwitch;
    var initLoading;
    var initGlobalFunctions;
    var initMoreGame;
    var isLoaded = false;
    var saveForLaterParent = null;
    var needUserInfo = false;
    var loadFromNet = null;
    var createSprite = null;
    var setClickCallback = null;
    var changeSprite = null;
    var removeOldSprite = null;
    var setScaleAnimation = null;
    var setCrossFunc = function (createBrandFunc, loadFromNetFunc, createSpriteFunc, setClickCallbackFunc, changeSpriteFunc, removeOldSpriteFunc, setScaleAnimationFunc) {
        loadFromNet = loadFromNetFunc;
        createSprite = createSpriteFunc;
        setClickCallback = setClickCallbackFunc;
        changeSprite = changeSpriteFunc;
        removeOldSprite = removeOldSpriteFunc;
        setScaleAnimation = setScaleAnimationFunc;
    };
    var globalFunctions = {};
    window["INeedUserInfo"] = function () { };
    window["initSSSGameConfig"] = function (_callback, onLoadFromNetDoneCallBack) {
        if (isLoaded) {
            onLoadFromNetDoneCallBack && onLoadFromNetDoneCallBack();
            _callback && _callback();
            return;
        }
        isLoaded = true;
        var requestFBSSSConfig = function () {
            wx.request({
                url: serverHttp + __gameId,
                success: function (ret) {
                    console.log("game config", ret);
                    if (ret.data && ret.data.status === 1) {
                        var data = ret.data;
                        initConfig(data, _callback, function () {
                            onLoadFromNetDoneCallBack && onLoadFromNetDoneCallBack();
                        });
                    }
                    else {
                        requestFBSSSConfig();
                    }
                },
                failed: function () {
                    requestFBSSSConfig();
                },
                complete: function () {
                    console.log("sdk request complete!");
                }
            });
        };
        requestFBSSSConfig();
    };
    initConfig = function (data, callback, onLoadFromNetDoneCallBack) {
        initSwitch(data);
        initAd(data);
        initShare(data);
        initLoading(data, callback, onLoadFromNetDoneCallBack);
        initMoreGame(data.fb_share.share);
        initGlobalFunctions();
        if (saveForLaterParent) {
            SSSGameConfig.setSSSmoregameBtn(saveForLaterParent);
            saveForLaterParent = null;
        }
        onLoadFromNetDoneCallBack && onLoadFromNetDoneCallBack();
    };
    initGlobalFunctions = function () {
        var inSSSGameConfig = {
            getRandomShareUnit: true,
            createBrandSprite: true,
            setSSSmoregameBtn: true,
            createMoreGameBtn: true,
            getSwitchState: true,
            loadMygameUrlJosn: true,
            getGameConfig: true,
        };
        var SSSGameConfig = {};
        for (var k in globalFunctions) {
            SSSGameConfig[k] = globalFunctions[k];
            console.log("add SSSGameConfig function : " + k);
        }
        for (var k in inSSSGameConfig) {
            SSSGameConfig[k] = SSSGameConfig[k] || (function () { });
        }
        window["SSSGameConfig"] = SSSGameConfig;
    };
    initSwitch = function (data) {
        globalFunctions.getSwitchState = function () {
            return true;
        };
    };
    initLoading = function (data, callback, onLoadFromNetDoneCallBack) {
        var TweenConfig = {
            hugeScale: 1.1,
            toHugeTime: 1,
            delayTime: .8,
            smallScale: .9,
            toSmallTime: 1.5
        };
        var createLayaLoadingScene = function (callback) {
            var Laya = window["Laya"];
            var setPosition = function (sprite, position) {
                sprite.x = position.x, sprite.y = position.y;
            };
            var newSprite = function (path, parent, position, y) {
                if (typeof (y) != typeof (undefined)) {
                    position = { x: position, y: y };
                }
                var texture = Laya.loader.getRes(path);
                if (!texture)
                    return console.error("加载图片失败! ", path), null;
                var ret = new Laya.Sprite();
                ret.graphics.drawTexture(texture, 0, 0);
                ret.width = texture._w;
                ret.height = texture._h;
                ret.pivot(ret.width / 2, ret.height / 2);
                parent && parent.addChild(ret);
                position && setPosition(ret, position);
                return ret;
            };
            createSprite = newSprite;
            var loadFromNet = function (resMap, textureMap, callback) {
                var resList = [];
                resMap.forEach(function (n, index) {
                    textureMap[index] = n;
                    resList.push({
                        url: n,
                        type: "image"
                    });
                });
                Laya.loader.load(resList, Laya.Handler.create(_this, callback));
            };
            var createBrandSprite = function () { };
            var setClickCallbackFunc = function (sprite, callback) {
                sprite.on("mousedown", null, callback);
            };
            var changeSpriteFunc = function (sprite, path) {
                var texture = Laya.loader.getRes(path);
                sprite.graphics.clear();
                sprite.graphics.drawTexture(texture, 0, 0);
                sprite.width = texture._w;
                sprite.height = texture._h;
            };
            var removeOldSpriteFunc = function (parent, name) {
                var node = parent.getChildByName(name);
                node && node.destroy();
            };
            var setScaleAnimationFunc = function (node) {
                node.timerLoop((TweenConfig.toHugeTime + TweenConfig.toSmallTime + TweenConfig.delayTime) * 1000, node, function () {
                    Laya.Tween.to(node, { scaleX: TweenConfig.hugeScale, scaleY: TweenConfig.hugeScale }, TweenConfig.toHugeTime * 1000, null, Laya.Handler.create(node, function () {
                        Laya.Tween.to(node, {}, TweenConfig.delayTime * 1000, null, Laya.Handler.create(node, function () {
                            Laya.Tween.to(node, { scaleX: TweenConfig.smallScale, scaleY: TweenConfig.smallScale }, TweenConfig.toSmallTime * 1000);
                        }));
                    }));
                });
            };
            setCrossFunc(createBrandSprite, loadFromNet, newSprite, setClickCallbackFunc, changeSpriteFunc, removeOldSpriteFunc, setScaleAnimationFunc);
            setTimeout(function () {
                callback();
            }, 0);
        };
        var createCocosCreatorLoadingScene = function (callback) {
            var cc = window["cc"];
            var textureMap = {};
            var LoadResFromNetwork = function (loadMap, textureMap, callback) {
                var waitLoadCount = 0;
                var _loop_1 = function (i) {
                    if (typeof (loadMap[i]) != typeof ("") || loadMap[i].indexOf("https") == -1)
                        return "continue";
                    var r = loadMap[i];
                    waitLoadCount++;
                    cc.loader.load(r, function (e, t) {
                        textureMap[i] = t;
                        waitLoadCount--;
                        if (waitLoadCount == 0) {
                            callback && callback();
                        }
                    });
                };
                for (var i in loadMap) {
                    _loop_1(i);
                }
            };
            var newSprite = function (texture, parent, position) {
                var spriteNode = new cc.Node();
                var spriteFrame = new cc.SpriteFrame();
                spriteNode.addComponent(cc.Sprite).spriteFrame = spriteFrame;
                parent && parent.addChild(spriteNode);
                position && (spriteNode.position = position);
                spriteFrame.setTexture(texture);
                return spriteNode;
            };
            var createBrandSprite = function (parent, x, y) {
                return newSprite(textureMap.brandImage, parent, { x: x, y: y });
            };
            var setClickCallbackFunc = function (sprite, callback) {
                sprite.on("touchstart", callback);
            };
            var changeSpriteFunc = function (sprite, texture) {
                sprite.getComponent(cc.Sprite).spriteFrame.setTexture(texture);
            };
            var removeOldSpriteFunc = function (parent, name) {
                var node = parent.getChildByName(name);
                node && node.destroy();
            };
            var setScaleAnimationFunc = function (node) {
                node.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(TweenConfig.toHugeTime, TweenConfig.hugeScale), cc.delayTime(TweenConfig.delayTime), cc.scaleTo(TweenConfig.toSmallTime, TweenConfig.smallScale))));
            };
            setCrossFunc(createBrandSprite, LoadResFromNetwork, newSprite, setClickCallbackFunc, changeSpriteFunc, removeOldSpriteFunc, setScaleAnimationFunc);
            setTimeout(function () {
                callback();
            }, 0);
        };
        var createEgretLoadingScene = function (callback) {
            var egret = window["egret"];
            var eui = window["eui"];
            var RES = window["RES"];
            var textureMap = {};
            var newSprite = function (texture, parent, position) {
                var img = new eui.Image(texture);
                img.anchorOffsetX = texture.textureWidth / 2;
                img.anchorOffsetY = texture.textureHeight / 2;
                position && (img.x = position.x, img.y = position.y);
                parent && parent.addChild(img);
                return img;
            };
            var LoadResFromNetwork = function (loadMap, textureMap, callback) {
                var waitLoadCount = 0;
                var _loop_2 = function (i) {
                    if (typeof (loadMap[i]) != typeof ("") || loadMap[i].indexOf("https") == -1)
                        return "continue";
                    var r = loadMap[i];
                    waitLoadCount++;
                    RES.getResByUrl(r, function (t) {
                        textureMap[i] = t;
                        waitLoadCount--;
                        if (waitLoadCount == 0) {
                            callback && callback();
                        }
                    }, null, RES.ResourceItem.TYPE_IMAGE);
                };
                for (var i in loadMap) {
                    _loop_2(i);
                }
            };
            var createBrandSprite = function (parent, x, y) {
                return newSprite(textureMap.brandImage, parent, { x: x, y: y });
            };
            var setClickCallbackFunc = function (sprite, callback) {
                sprite.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function () {
                    callback();
                }, sprite);
            };
            var changeSpriteFunc = function (sprite, texture) {
                sprite.source = texture;
            };
            var removeOldSpriteFunc = function (parent, name) {
                var node = parent.getChildByName(name);
                node && parent.removeChild(node);
            };
            var setScaleAnimationFunc = function (node) {
                egret.Tween.get(node, { loop: true }).to({ scaleX: TweenConfig.hugeScale, scaleY: TweenConfig.hugeScale }, TweenConfig.toHugeTime * 500).wait(TweenConfig.delayTime * 1000).to({ scaleX: TweenConfig.smallScale, scaleY: TweenConfig.smallScale }, TweenConfig.toSmallTime * 1000).to({ scaleX: 1, scaleY: 1 }, TweenConfig.toHugeTime * 500);
            };
            setCrossFunc(createBrandSprite, LoadResFromNetwork, newSprite, setClickCallbackFunc, changeSpriteFunc, removeOldSpriteFunc, setScaleAnimationFunc);
            setTimeout(function () {
                callback();
            }, 0);
        };
        var createCocosJSLoadingScene = function () {
            var ccui = window["ccui"];
            var cc = window["cc"];
            var textureMap = {};
            var newSprite = function (texture, parent, position) {
                var sprite = new cc.Sprite(texture);
                position && sprite.setPosition(position);
                parent && parent.addChild(sprite);
                return sprite;
            };
            var LoadResFromNetwork = function (loadMap, textureMap, callback) {
                var waitLoadCount = 0;
                var _loop_3 = function (i) {
                    if (typeof (loadMap[i]) != typeof ("") || loadMap[i].indexOf("https") == -1)
                        return "continue";
                    var r = loadMap[i];
                    waitLoadCount++;
                    cc.loader.loadImg(r, function () { }, function (err, t) {
                        var texture2d = new cc.Texture2D();
                        texture2d.initWithElement(t);
                        texture2d.handleLoadedTexture();
                        textureMap[i] = texture2d;
                        waitLoadCount--;
                        if (waitLoadCount == 0) {
                            callback && callback();
                        }
                    });
                };
                for (var i in loadMap) {
                    _loop_3(i);
                }
            };
            var createBrandSprite = function (parent, x, y) {
                return newSprite(textureMap.brandImage, parent, { x: x, y: y });
            };
            var setClickCallbackFunc = function (sprite, callback) {
                sprite.addClickEventListener(callback);
            };
            var changeSpriteFunc = function (sprite, texture) {
                sprite.loadTextureNormal(texture);
            };
            var removeOldSpriteFunc = function (parent, name) {
                var node = parent.getChildByName(name);
                node && parent.removeChild(node);
            };
            var newButton = function (texture, parent, position) {
                var button = ccui.Button.create();
                button.setTouchEnabled(true);
                button.loadTextures(texture, "", "");
                parent.addChild(button);
                button.setPosition(position);
                return button;
            };
            var setScaleAnimationFunc = function (node) {
                node.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(TweenConfig.toHugeTime, TweenConfig.hugeScale), cc.delayTime(TweenConfig.delayTime), cc.scaleTo(TweenConfig.toSmallTime, TweenConfig.smallScale))));
            };
            setCrossFunc(createBrandSprite, function (loadMap, textureMap, callback) {
                LoadResFromNetwork(loadMap, textureMap, function () {
                    for (var k in loadMap) {
                        textureMap[k] = loadMap[k];
                    }
                    callback();
                });
            }, newButton, setClickCallbackFunc, changeSpriteFunc, removeOldSpriteFunc, setScaleAnimationFunc);
            setTimeout(function () {
                callback();
            }, 0);
        };
        var getCreateLoadingSceneByEngine = function () {
            if (typeof (window) != 'undefined' && window["cc"]) {
                if (window["cc"]['DEFAULT_ENGINE']) {
                    console.log("%c \n\n================================\n\n " + window["cc"]['DEFAULT_ENGINE'] + " Project\n\n================================\n\n", 'color:#ff0000');
                    return createCocosJSLoadingScene;
                }
                console.log("%c \n\n================================\n\n Cocos Creator Project\n\n================================\n\n", 'color:#ff0000');
                return createCocosCreatorLoadingScene;
            }
            else if (typeof (window) != 'undefined' && window["egret"]) {
                console.log("%c \n\n================================\n\n Egret Project\n\n================================\n\n", 'color:#ff0000');
                return createEgretLoadingScene;
            }
            else if (typeof (window) != 'undefined' && (window["laya"] || window["Laya"])) {
                console.log("%c \n\n================================\n\n Laya Project\n\n================================\n\n", 'color:#ff0000');
                return createLayaLoadingScene;
            }
            else {
                console.log("%c \n\n================================\n\nUnkonw Project!!!\n\nUtils Load Failed!!!\n\n================================\n\n", 'color:#ff0000');
            }
            return null;
        };
        var addLoadingScene = function () {
            var createLoadingScene = getCreateLoadingSceneByEngine();
            createLoadingScene && createLoadingScene(callback);
        };
        addLoadingScene();
    };
    initAd = function (data) {
        PlatformAPI.initAd(data);
    };
    initShare = function () {
        var getRandomShareUnit = function () {
            return { title: "", imageUrl: "" };
        };
        globalFunctions.getRandomShareUnit = getRandomShareUnit;
    };
    initMoreGame = function (data) {
        var loadMygameUrlJosn = function () { };
        globalFunctions.loadMygameUrlJosn = loadMygameUrlJosn;
        var moreGameConfig = null;
        var setSSSmoregameBtn = function (_parent) {
            if (!removeOldSprite) {
                saveForLaterParent = _parent;
                return;
            }
            var callback = function () {
                var _createMoreGameBtn = function (parent, unit, btnIndex, x, y) {
                    var sprName = "__SSSMoreGame_" + btnIndex;
                    removeOldSprite(parent, sprName);
                    var textureMap = [];
                    var iconImageLen = unit.icon_image.length;
                    if (iconImageLen == 0)
                        return;
                    loadFromNet(unit.icon_image, textureMap, function () {
                        var spr = createSprite(textureMap[0], parent, { x: isNaN(x) ? unit.icon_image_x : x, y: isNaN(y) ? unit.icon_image_y : y });
                        spr.name = sprName;
                        setScaleAnimation(spr);
                        setClickCallback(spr, function () {
                            wx.navigateToMiniProgram({
                                appId: unit.jump_appid,
                                btnIndex: btnIndex,
                                extraData: {
                                    appid: unit.appid,
                                }
                            });
                        });
                        if (!unit.icon_space)
                            return;
                        var nextIndex = 0;
                        var interval = setInterval(function () {
                            try {
                                changeSprite(spr, textureMap[nextIndex]);
                            }
                            catch (e) {
                                console.log("change frame fail! ", e);
                                clearInterval(interval);
                            }
                            nextIndex++;
                            if (nextIndex == iconImageLen) {
                                nextIndex = 0;
                            }
                        }, unit.icon_space);
                    });
                };
                moreGameConfig.forEach(function (unit, btnIndex) {
                    _createMoreGameBtn(_parent, unit, btnIndex);
                });
                window["createMoreGameBtn"] = function (parent, index, x, y) {
                    _createMoreGameBtn(parent, moreGameConfig[index], index, x, y);
                };
            };
            if (moreGameConfig) {
                callback();
                return;
            }
            setTimeout(function () {
                var moreGameBtnConfig = [];
                data.forEach(function (unit, index) {
                    moreGameBtnConfig.push({
                        "bind_id": 0,
                        "type": 1,
                        "icon_image": [
                            unit.icon_image
                        ],
                        "icon_image_x": +unit.icon_image_x,
                        "icon_image_y": +unit.icon_image_y,
                        "jump_appid": unit.appid,
                        "index": index
                    });
                });
                moreGameConfig = moreGameBtnConfig;
                console.log(moreGameConfig);
                callback();
            }, 0);
        };
        globalFunctions.setSSSmoregameBtn = setSSSmoregameBtn;
        globalFunctions.createMoreGameBtn = function () {
            console.error("创建单个MoreGameBtn调用太早了!");
        };
    };
};

},{}]},{},[4]);
