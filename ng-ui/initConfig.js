/**
 * Created by vincent on 2017/3/4.
 */

define(["jquery", "lodash", "transmission", "angularAMD", "angular-touch"], function ($, _, tr, angularAMD) {
    "use strict";

    var app = angular.module("transmission", ["ngTouch"]);

    var $app = angularAMD.bootstrap(app);

    $app.config(["$touchProvider", function ($touchProvider) {
        $touchProvider.ngClickOverrideEnabled([true]);
    }]);

    $app.factory("ajaxService", ["$http", "$q", function ($http, $q) {
        var service = {};

        function ajax(op) {
            var deferred = $q.defer();

            deferred.promise = $http({
                method: "POST",
                url: "/transmission/rpc" + (op.url !== undefined ? op.url : ""),
                headers: op.sessionId !== undefined ? {"X-Transmission-Session-Id": op.sessionId} : {},
                data: (function () {
                    var param = {};
                    switch (op.param.method) {
                        case "torrent-get":
                            param = op.param;
                            break;
                        case "torrent-remove":
                            param = op.param;
                            break;
                        default:
                            param = op.param;
                            break;
                    }
                    return param;
                })()
            });

            return deferred.promise;
        }

        service.getSession = function (sessionId) {
            return ajax({
                sessionId: sessionId,
                param: {
                    method: "session-get"
                },
                url: "?type=getSession"
            });
        };

        service.getSessionStats = function (sessionId) {
            return ajax({
                sessionId: sessionId,
                param: {
                    method: "session-stats"
                },
                url: "?type=getSessionStats"
            });
        };

        service.getTorrent = function (sessionId) {
            return ajax({
                sessionId: sessionId,
                param: {
                    method: "torrent-get",
                    arguments: {
                        "fields": [
                            "id",
                            "addedDate",
                            "name",
                            "totalSize",
                            "error",
                            "errorString",
                            "eta",
                            "isFinished",
                            "isStalled",
                            "leftUntilDone",
                            "metadataPercentComplete",
                            "peersConnected",
                            "peersGettingFromUs",
                            "peersSendingToUs",
                            "percentDone",
                            "queuePosition",
                            "rateDownload",
                            "rateUpload",
                            "recheckProgress",
                            "seedRatioMode",
                            "seedRatioLimit",
                            "sizeWhenDone",
                            "status",
                            "trackers",
                            "downloadDir",
                            "uploadedEver",
                            "uploadRatio",
                            "webseedsSendingToUs"
                        ]
                    }
                },
                url: "?type=getTorrent"
            });
        };

        service.getActiveTorrent = function (sessionId) {
            return ajax({
                sessionId: sessionId,
                param: {
                    method: "torrent-get",
                    arguments: {
                        fields: [
                            "id",
                            "error",
                            "errorString",
                            "eta",
                            "isFinished",
                            "isStalled",
                            "leftUntilDone",
                            "metadataPercentComplete",
                            "peersConnected",
                            "peersGettingFromUs",
                            "peersSendingToUs",
                            "percentDone",
                            "queuePosition",
                            "rateDownload",
                            "rateUpload",
                            "recheckProgress",
                            "seedRatioMode",
                            "seedRatioLimit",
                            "sizeWhenDone",
                            "status",
                            "trackers",
                            "downloadDir",
                            "uploadedEver",
                            "uploadRatio",
                            "webseedsSendingToUs"
                        ],
                        ids: "recently-active"
                    }
                },
                url: "?type=getActiveTorrent"
            });
        };

        service.getFullDetail = function (sessionId, ids) {
            return ajax({
                sessionId: sessionId,
                param: {
                    "method": "torrent-get",
                    "arguments": {
                        "fields": [
                            "id",
                            "activityDate",
                            "corruptEver",
                            "desiredAvailable",
                            "downloadedEver",
                            "fileStats",
                            "haveUnchecked",
                            "haveValid",
                            "peers",
                            "startDate",
                            "trackerStats",
                            "comment",
                            "creator",
                            "dateCreated",
                            "files",
                            "hashString",
                            "isPrivate",
                            "pieceCount",
                            "pieceSize"
                        ],
                        "ids": ids
                    }
                },
                url: "?type=getFullDetail"
            });
        };

        service.getDetail = function (sessionId, ids) {
            return ajax({
                sessionId: sessionId,
                param: {
                    "method": "torrent-get",
                    "arguments": {
                        "fields": [
                            "id",
                            "activityDate",
                            "corruptEver",
                            "desiredAvailable",
                            "downloadedEver",
                            "fileStats",
                            "haveUnchecked",
                            "haveValid",
                            "peers",
                            "startDate",
                            "trackerStats"
                        ],
                        "ids": ids
                    }
                },
                url: "?type=getDetail"
            });
        };

        service.startTorrent = function (sessionId) {
            return ajax({
                sessionId: sessionId,
                param: {
                    method: "torrent-start"
                },
                url: "?type=startTorrent"
            });
        };

        service.stopTorrent = function (sessionId) {
            return ajax({
                sessionId: sessionId,
                param: {
                    method: "torrent-stop"
                },
                url: "?type=stopTorrent"
            });
        };

        service.removeFromList = function (sessionId,ids) {

            return ajax({
                sessionId: sessionId,
                param: {
                    "method": "torrent-remove",
                    "arguments": {
                        "ids": [ids]
                    }
                },
                url: "?type=removeFromList"
            });
        };

        return service;
    }]);

    $app.controller("mainController", ["$scope", "$http", "$q", "$sce", "ajaxService", function ($scope, $http, $q, $sce, ajaxService) {

        $scope.c = 1;
        $scope.test = [0, 1, 2, 3, 4, 5, 6];
        $scope.tester = function ($event) {
            $($event.currentTarget).css({"background-color": "#000"});
        };
        $scope.alertSomething = function () {
            console.log('alerting');
        };
        //获取session
        $scope.getSession = function (session) {
            //获取session
            ajaxService.getSession(session).then(function (response) {
                $scope.data.global = response.data.arguments;
            }, function (reason) {
                var str = reason.data;
                var temp = "X-Transmission-Session-Id: ";
                var start = str.indexOf(temp);
                var end = str.indexOf("<\/code>");
                $scope.session = str.substring((start + (temp.length - 1)), end);
                $scope.$emit("getSessionDone");
            });
        };

        //获取现在的状态
        $scope.getStatsData = function () {
            //获取session
            ajaxService.getSessionStats($scope.session).then(function (response) {
                $scope.data.stats = response.data.arguments;
                $scope.$emit("getStatsDone");
            }, function (reason) {
                console.log("查询stats失败");
            });
        };

        //获取所有Torrent数据
        $scope.getTorrentData = function () {
            //获取session
            return ajaxService.getTorrent($scope.session).then(function (response) {
                $scope.data.torrent = _.sortBy(response.data.arguments.torrents, function (item) {
                    return -item.addedDate;
                });
            }, function (reason) {
                console.log("查询Torrent失败");
            });
        };

        //获取正在活动的Torrent数据
        $scope.getRecentlyActiveTorrentData = function () {
            //获取活动中的torrent数据
            ajaxService.getActiveTorrent($scope.session).then(function (response) {
                //替换数据列表中对应的数据
                _.each(response.data.arguments.torrents, function (value, index) {
                    var $index = _.findIndex($scope.data.torrent, function (o) {
                        return o.id === value.id;
                    });

                    if ($index > -1) {
                        _.merge($scope.data.torrent[$index], value);
                    }
                });
            }, function (reason) {
                console.log("查询Torrent失败");
            });
        };

        //排序种子数据
        $scope.sortTorrentData = function () {
            $scope.data.torrent = _.sortBy($scope.data.torrent, function (item) {
                return -item.addedDate;
            });
            return $scope.data.torrent;
        };

        //循环获取种子数据
        $scope.loopGetTorrentData = function () {
            //get all torrent(list)
            $scope.ajaxPool.torrent = ajaxService.getTorrent($scope.session).then(function (response) {
                $scope.data.torrent = _.sortBy(response.data.arguments.torrents, function (item) {
                    return -item.addedDate;
                });

                //loop the active torrent
                $scope.pool.torrent = setInterval(function () {
                    $scope.getRecentlyActiveTorrentData();
                }, $scope.loopFragment.torrent);
            }, function (reason) {
                console.log("查询Torrent失败");
            });
        };

        //循环获取session数据
        $scope.loopGetSessionData = function () {
            $scope.getSession($scope.session);
            $scope.pool.torrent = setInterval(function () {
                $scope.getSession($scope.session);
            }, $scope.loopFragment.session);
        };

        //选择某下载任务
        $scope.selectTorrent = function (index) {
            if(index === $scope.data.selectedIndex){
                return false;
            }

            $scope.data.selectedIndex = index;
            if($scope.detail.status === true){
                $scope.detail.close();
                $scope.detail.show();
            }
        };

        //滑动操作
        $scope.swip = {
            left:function () {
                var w = $(window).width();
                if(w <= 1024){
                    if($scope.consolePanel.status === false && $scope.detail.status === false){
                        $scope.detail.show();
                    }else if($scope.consolePanel.status === true && $scope.detail.status === false){
                        $scope.consolePanel.close();
                    }
                }
            },
            right:function(){
                var w = $(window).width();
                if(w <= 1024) {
                    if ($scope.consolePanel.status === false && $scope.detail.status === true) {
                        $scope.detail.close();
                    }else if ($scope.consolePanel.status === false && $scope.detail.status === false) {
                        $scope.consolePanel.show();
                    }
                }
            }
        };

        //流量转换
        $scope.bytesConvert = function (bytes) {
            var op = {
                "data": bytes,
                "band": 1000
            };
            return tr.bytesConvert(op);
        };

        //分析已下载数据
        $scope.parseFloat2 = function (num) {
            return tr.parseFloat2(num);
        };

        //解析下载任务的样式名
        $scope.parsTorrentClassName = function (status, index) {
            var className = "";
            //4正在下载
            switch (status) {
                case 0:
                    className = "paused";
                    break;
                case 4:
                    className = "downloading";
                    break;
                case 6:
                    className = "seeding";
                    break;
                default:
                    className = "seeding";
                    break;
            }
            if (index === $scope.data.selectedIndex) {
                className += " selected";
            }
            return className;
        };

        //解析剩余时间
        $scope.parseEta = function (eta) {
            var str = "";
            if (eta === -1) {
                str = "不可用";
            } else if (eta === -2) {
                str = "无法预估";
            } else {
                str = tr.secondsToTime(eta);
            }

            return str;
        };

        $scope.parseFloat2 = function (num) {
            return tr.parseFloat2(num);
        };

        //获取状态文本
        $scope.getStatusText = function (op) {
            var str = "";
            switch (op.status){
                case 0:
                    if(op.metaComplete < 1){
                        str = "磁性链接下载元数据中";
                    }else{
                        str = "已暂停";
                    }
                    break;
                case 4:
                    str = "下载中";
                    break;
                case 6:
                    str = "做种中";
                    break;
            }

            return str;
        };

        //获取运行时长
        $scope.howLong = function (start) {
            return $scope.parseEta(parseInt((new Date().getTime()) / 1000) - start);
        };

        $scope.getFullDate = function (ms) {
            return tr.parseFullDate(ms);
        };

        //解析torrent列表文字
        $scope.parseText = {
            "Status": function (index) {
                var data = $scope.data.torrent[index];
                var html = "";

                switch (data.status) {
                    case 0:
                        // className = "paused";
                        html += "已暂停";
                        break;
                    case 4:
                        html += "下载自";
                        html += "<span>" + data.peersSendingToUs + "/" + data.peersConnected + "个用户</span>";
                        html += "<span class=\"icon-download\">";
                        html += $scope.bytesConvert(data.rateDownload) + "/s";
                        html += "</span>";
                        html += "<span class=\"icon-upload\">";
                        html += $scope.bytesConvert(data.rateUpload) + "/s";
                        html += "</span>";
                        break;
                    case 6:
                        html += "分享至";
                        html += "<span>" + data.peersGettingFromUs + "/" + data.peersConnected + "个用户</span>";
                        html += "<span class=\"icon-upload\">";
                        html += $scope.bytesConvert(data.rateUpload) + "/s";
                        html += "</span>";
                        break;
                    default:
                        // className = "seeding";
                        break;
                }

                return $sce.trustAsHtml(html);
            },
            "TransformData": function (index) {
                var data = $scope.data.torrent[index];
                var html = "";

                switch (data.status) {
                    case 0:
                        // className = "paused";
                        if (data.metadataPercentComplete < 1) {
                            html += "磁性链接";
                            html += "<span>";
                            html += "下载元数据（" + (data.metadataPercentComplete < 1 ? tr.parseFloat2(data.metadataPercentComplete * 100) : "100") + "%）";
                            html += "</span>";
                        } else {
                            html += "已下载";
                            html += "<span>";
                            html += $scope.bytesConvert(data.totalSize * (data.percentDone < 1 ? data.percentDone : 1)) + "/" + $scope.bytesConvert(data.totalSize);
                            html += "</span>";
                            html += "<span>";
                            html += "(" + (data.percentDone < 1 ? tr.parseFloat2(data.percentDone * 100) : "100") + "%)";
                            html += "</span>";
                        }
                        break;
                    case 4:
                        // className = "downloading";,
                        if (data.metadataPercentComplete < 1) {
                            html += "磁性链接<span> 下载元数据（" + (data.metadataPercentComplete < 1 ? tr.parseFloat2(data.metadataPercentComplete * 100) : "100") + "）</span>";
                        } else {
                            html += "已下载";
                            html += "<span>";
                            html += $scope.bytesConvert(data.totalSize * (data.percentDone < 1 ? data.percentDone : 1)) + "/" + $scope.bytesConvert(data.totalSize);
                            html += "</span>";
                            html += "<span>";
                            html += "(" + (data.percentDone < 1 ? tr.parseFloat2(data.percentDone * 100) : "100") + "%)";
                            html += "</span>";
                            if (data.uploadedEver > 0) {
                                html += "<span>";
                                html += "已上传";
                                html += "</span>";
                                html += "<span>";
                                html += $scope.bytesConvert(data.uploadedEver);
                                html += "</span>";
                            }
                            html += "<span>";
                            html += "预估剩余时间：" + $scope.parseEta(data.eta);
                            html += "</span>";
                        }
                        break;
                    case 6:
                        // className = "seeding";
                        html += "已上传";
                        html += "<span>";
                        html += $scope.bytesConvert(data.uploadedEver) + "/" + $scope.bytesConvert(data.totalSize);
                        html += "</span>";
                        html += "<span>";
                        html += "分享率(" + tr.parseFloat2(data.uploadRatio) + "%)";
                        html += "</span>";
                        html += "<span>";
                        html += "预估剩余时间：" + $scope.parseEta(data.eta);
                        html += "</span>";
                        break;
                    default:
                        // className = "seeding";
                        break;
                }

                return $sce.trustAsHtml(html);
            }
        };

        //明细
        $scope.detail = {
            "target": $("#torrent-detail"),
            "className": "show",
            "tabNames": ["info", "peers", "tracker", "files"],
            "tabSelect": function (index) {
                $scope.detail.selectedTabIndex = index;
            },
            "status" : false,
            "torrentData":false,
            "selectedTabIndex": 0,
            "show": function () {
                if ($scope.data.selectedIndex === "") {
                    console.log("请选择一个传输任务");
                } else {
                    $scope.detail.status = $scope.detail.status !== true;

                    if ($scope.detail.status === true) {
                        $scope.detail.torrentData = $scope.data.torrent[$scope.data.selectedIndex];
                        $scope.ajaxPool = ajaxService.getFullDetail($scope.session, [$scope.data.torrent[$scope.data.selectedIndex].id]).then(function (response) {

                            $scope.data.detail = response.data.arguments.torrents[0];

                            $scope.pool.detail = setInterval(function () {
                                $scope.ajaxPool.fullDetail = ajaxService.getDetail($scope.session, [$scope.data.torrent[$scope.data.selectedIndex].id]).then(function ($response) {
                                    $scope.data.detail = _.merge($scope.data.detail, $response.data.arguments.torrents[0]);
                                }, function (reason) {
                                    console.log("维护明细数据失败");
                                });
                            }, $scope.loopFragment.detail);
                        }, function (reason) {
                            console.log("获取明细失败");
                        });
                    } else {
                        $scope.detail.close();
                    }
                }
            },
            "close": function () {
                clearInterval($scope.pool.detail);
                $scope.detail.status = false;
                var arr = [$scope.ajaxPool.fullDetail, $scope.ajaxPool.detail];
                _.each(arr, function (value, index) {
                    if (typeof value === "object" && typeof value.resolve === "function") {
                        value.resolve();
                    }
                });
            }
        };

        $scope.closeAjax = function (obj) {
            if (typeof obj === "object" && typeof obj.resolve === "function") {
                obj.resolve();
            }
        };

        $scope.removeFromList = function () {
            // $scope.session
            ajaxService.removeFromList($scope.session,$scope.data.selectedIndex).then(function (response) {
                $scope.closeAjax($scope.ajaxPool.torrent);
                clearInterval($scope.pool.torrent);
                $scope.loopGetTorrentData();
            },function (reason) {
                console.log("从下载列表中移除失败");
            });
        };

        $scope.init = function () {
            //数据
            $scope.globalData = {};

            $scope.session = "";

            $scope.loopFragment = {
                torrent: 5000,
                detail: 5000,
                session: 15000
            };

            //loop pool
            $scope.pool = {
                torrent: "",
                session: "",
                detail: ""
            };

            $scope.ajaxPool = {
                torrent:{},
                detail: {},
                fullDetail: {}
            };

            $scope.consolePanel = {
                status:false,
                show:function () {
                    $scope.consolePanel.status = true;
                },
                close:function () {
                    $scope.consolePanel.status = false;
                }
            };

            //数据
            $scope.data = {
                global: {
                    "arguments": {
                        "activeTorrentCount": 7,
                        "cumulative-stats": {
                            "downloadedBytes": 836097090213,
                            "filesAdded": 11730,
                            "secondsActive": 4558481,
                            "sessionCount": 12,
                            "uploadedBytes": 103641884038
                        },
                        "current-stats": {
                            "downloadedBytes": 153942468427,
                            "filesAdded": 5044,
                            "secondsActive": 1593491,
                            "sessionCount": 1,
                            "uploadedBytes": 24282697586
                        },
                        "downloadSpeed": 28611,
                        "pausedTorrentCount": 17,
                        "torrentCount": 24,
                        "uploadSpeed": 69677
                    }, "result": "success"
                },
                torrent: [
                    {
                    "addedDate": 1487729052,
                    "downloadDir": "/shares/Public/tvshow",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 4,
                    "isFinished": false,
                    "isStalled": true,
                    "leftUntilDone": 14598701056,
                    "metadataPercentComplete": 1,
                    "name": "Ode.To.Joy.2016.WEB-DL.1080p.H264.AAC-HDCTV",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.7894,
                    "queuePosition": 0,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 69334909656,
                    "status": 4,
                    "totalSize": 69334909656,
                    "trackers": [{
                        "announce": "https://tracker.hdchina.club/announce.php?passkey=1a8e4eb58981a44d74ccd53530b92b26",
                        "id": 0,
                        "scrape": "https://tracker.hdchina.club/scrape.php?passkey=1a8e4eb58981a44d74ccd53530b92b26",
                        "tier": 0
                    }],
                    "uploadRatio": 0.0000,
                    "uploadedEver": 1195667,
                    "webseedsSendingToUs": 0
                },
                    {
                    "addedDate": 1487983720,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 5,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 2366750720,
                    "metadataPercentComplete": 1,
                    "name": "Ode.To.Joy.2016.WEB-DL.1080p.H264.AAC-HDCTV.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.0998,
                    "queuePosition": 1,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 2629410675,
                    "status": 0,
                    "totalSize": 2629410675,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }, {
                        "announce": "udp://tracker.leechers-paradise.org:6969",
                        "id": 3,
                        "scrape": "udp://tracker.leechers-paradise.org:6969",
                        "tier": 3
                    }, {
                        "announce": "udp://tracker.leechers-paradise.org:6969/announce",
                        "id": 4,
                        "scrape": "udp://tracker.leechers-paradise.org:6969/scrape",
                        "tier": 4
                    }, {
                        "announce": "udp://9.rarbg.com:2710/announce",
                        "id": 5,
                        "scrape": "udp://9.rarbg.com:2710/scrape",
                        "tier": 5
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 6,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 6
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 7,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 7
                    }, {
                        "announce": "udp://9.rarbg.com:2710",
                        "id": 8,
                        "scrape": "udp://9.rarbg.com:2710",
                        "tier": 8
                    }, {
                        "announce": "udp://9.rarbg.me:2710",
                        "id": 9,
                        "scrape": "udp://9.rarbg.me:2710",
                        "tier": 9
                    }, {
                        "announce": "udp://eddie4.nl:6969/announce",
                        "id": 10,
                        "scrape": "udp://eddie4.nl:6969/scrape",
                        "tier": 10
                    }, {
                        "announce": "udp://zer0day.ch:1337/announce",
                        "id": 11,
                        "scrape": "udp://zer0day.ch:1337/scrape",
                        "tier": 11
                    }],
                    "uploadRatio": 0.1264,
                    "uploadedEver": 33814947,
                    "webseedsSendingToUs": 0
                },
                    {
                    "addedDate": 1487983720,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 7,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 532234240,
                    "metadataPercentComplete": 1,
                        "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.1053,
                    "queuePosition": 2,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 594901733,
                    "status": 0,
                    "totalSize": 594901733,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }, {
                        "announce": "udp://tracker.publicbt.com:80/announce",
                        "id": 3,
                        "scrape": "udp://tracker.publicbt.com:80/scrape",
                        "tier": 3
                    }, {
                        "announce": "udp://tracker.publicbt.com:80",
                        "id": 4,
                        "scrape": "udp://tracker.publicbt.com:80",
                        "tier": 4
                    }, {
                        "announce": "udp://tracker.publicbt.com/announce",
                        "id": 5,
                        "scrape": "udp://tracker.publicbt.com/scrape",
                        "tier": 5
                    }, {
                        "announce": "udp://10.rarbg.me/announce",
                        "id": 6,
                        "scrape": "udp://10.rarbg.me/scrape",
                        "tier": 6
                    }, {
                        "announce": "udp://10.rarbg.com/announce",
                        "id": 7,
                        "scrape": "udp://10.rarbg.com/scrape",
                        "tier": 7
                    }, {
                        "announce": "udp://tracker.openbittorrent.com:80",
                        "id": 8,
                        "scrape": "udp://tracker.openbittorrent.com:80",
                        "tier": 8
                    }, {
                        "announce": "udp://tracker.openbittorrent.com",
                        "id": 9,
                        "scrape": "udp://tracker.openbittorrent.com",
                        "tier": 9
                    }, {
                        "announce": "udp://11.rarbg.me/announce",
                        "id": 10,
                        "scrape": "udp://11.rarbg.me/scrape",
                        "tier": 10
                    }, {
                        "announce": "udp://11.rarbg.com/announce",
                        "id": 11,
                        "scrape": "udp://11.rarbg.com/scrape",
                        "tier": 11
                    }, {
                        "announce": "udp://tracker.openbittorrent.com:80/announce",
                        "id": 12,
                        "scrape": "udp://tracker.openbittorrent.com:80/scrape",
                        "tier": 12
                    }, {
                        "announce": "udp://tracker.openbittorrent.com/announce",
                        "id": 13,
                        "scrape": "udp://tracker.openbittorrent.com/scrape",
                        "tier": 13
                    }, {
                        "announce": "udp://tracker.publicbt.com",
                        "id": 14,
                        "scrape": "udp://tracker.publicbt.com",
                        "tier": 14
                    }],
                    "uploadRatio": 0.0017,
                    "uploadedEver": 109110,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 8,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 736575488,
                    "metadataPercentComplete": 1,
                    "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.0017,
                    "queuePosition": 3,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 737865757,
                    "status": 0,
                    "totalSize": 737865757,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }, {
                        "announce": "udp://10.rarbg.me/announce",
                        "id": 3,
                        "scrape": "udp://10.rarbg.me/scrape",
                        "tier": 3
                    }, {
                        "announce": "udp://10.rarbg.com/announce",
                        "id": 4,
                        "scrape": "udp://10.rarbg.com/scrape",
                        "tier": 4
                    }, {
                        "announce": "udp://tracker.openbittorrent.com:80",
                        "id": 5,
                        "scrape": "udp://tracker.openbittorrent.com:80",
                        "tier": 5
                    }, {
                        "announce": "udp://tracker.openbittorrent.com",
                        "id": 6,
                        "scrape": "udp://tracker.openbittorrent.com",
                        "tier": 6
                    }, {
                        "announce": "udp://11.rarbg.me/announce",
                        "id": 7,
                        "scrape": "udp://11.rarbg.me/scrape",
                        "tier": 7
                    }, {
                        "announce": "udp://11.rarbg.com/announce",
                        "id": 8,
                        "scrape": "udp://11.rarbg.com/scrape",
                        "tier": 8
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 9,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 9
                    }, {
                        "announce": "udp://9.rarbg.com:2710/announce",
                        "id": 10,
                        "scrape": "udp://9.rarbg.com:2710/scrape",
                        "tier": 10
                    }, {
                        "announce": "udp://tracker.openbittorrent.com:80/announce",
                        "id": 11,
                        "scrape": "udp://tracker.openbittorrent.com:80/scrape",
                        "tier": 11
                    }, {
                        "announce": "http://bigfoot1942.sektori.org:6969/announce",
                        "id": 12,
                        "scrape": "http://bigfoot1942.sektori.org:6969/scrape",
                        "tier": 12
                    }, {
                        "announce": "udp://tracker.openbittorrent.com/announce",
                        "id": 13,
                        "scrape": "udp://tracker.openbittorrent.com/scrape",
                        "tier": 13
                    }, {
                        "announce": "udp://tracker.publicbt.com",
                        "id": 14,
                        "scrape": "udp://tracker.publicbt.com",
                        "tier": 14
                    }],
                    "uploadRatio": 0,
                    "uploadedEver": 0,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 9,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 114556928,
                    "metadataPercentComplete": 1,
                        "name": "testMovie2.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.6886,
                    "queuePosition": 4,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 367938059,
                    "status": 0,
                    "totalSize": 367938059,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }],
                    "uploadRatio": 0.1646,
                    "uploadedEver": 42550041,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 11,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 729759744,
                    "metadataPercentComplete": 1,
                        "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.0041,
                    "queuePosition": 5,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 732822543,
                    "status": 0,
                    "totalSize": 732822543,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }],
                    "uploadRatio": 0.0160,
                    "uploadedEver": 56662,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 12,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 736411648,
                    "metadataPercentComplete": 1,
                        "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.0024,
                    "queuePosition": 6,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 738185169,
                    "status": 0,
                    "totalSize": 738185169,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }],
                    "uploadRatio": 0,
                    "uploadedEver": 0,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 13,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 782211880,
                    "metadataPercentComplete": 1,
                        "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0,
                    "queuePosition": 7,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 782211880,
                    "status": 0,
                    "totalSize": 782211880,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }],
                    "uploadRatio": -1,
                    "uploadedEver": 0,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 14,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 834011136,
                    "metadataPercentComplete": 1,
                        "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.0358,
                    "queuePosition": 8,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 865022988,
                    "status": 0,
                    "totalSize": 865022988,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }],
                    "uploadRatio": 0.9037,
                    "uploadedEver": 34951784,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 15,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 1143717888,
                    "metadataPercentComplete": 1,
                        "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.1331,
                    "queuePosition": 9,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 1319395591,
                    "status": 0,
                    "totalSize": 1319395591,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }],
                    "uploadRatio": 0.6997,
                    "uploadedEver": 124265543,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 16,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 990871552,
                    "metadataPercentComplete": 1,
                        "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.0023,
                    "queuePosition": 10,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 993222257,
                    "status": 0,
                    "totalSize": 993222257,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }],
                    "uploadRatio": 0.0581,
                    "uploadedEver": 146457,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 17,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 2638168064,
                    "metadataPercentComplete": 1,
                        "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.0207,
                    "queuePosition": 11,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 2694091945,
                    "status": 0,
                    "totalSize": 2694091945,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }],
                    "uploadRatio": 1.2298,
                    "uploadedEver": 74976664,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 18,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 1392263168,
                    "metadataPercentComplete": 1,
                        "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.0043,
                    "queuePosition": 12,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 1398395387,
                    "status": 0,
                    "totalSize": 1398395387,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }],
                    "uploadRatio": 0.6309,
                    "uploadedEver": 4465063,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 19,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 1598242816,
                    "metadataPercentComplete": 1,
                        "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.0193,
                    "queuePosition": 13,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 1629812674,
                    "status": 0,
                    "totalSize": 1629812674,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }],
                    "uploadRatio": 1.4979,
                    "uploadedEver": 50621567,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 21,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 949305344,
                    "metadataPercentComplete": 1,
                        "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.3879,
                    "queuePosition": 14,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 1550996524,
                    "status": 0,
                    "totalSize": 1550996524,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }],
                    "uploadRatio": 0.6060,
                    "uploadedEver": 380821467,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 22,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 4933730304,
                    "metadataPercentComplete": 1,
                        "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.2865,
                    "queuePosition": 15,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 6915127345,
                    "status": 0,
                    "totalSize": 6915127345,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }],
                    "uploadRatio": 0.5285,
                    "uploadedEver": 1055003687,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1487983721,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 23,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 4814667776,
                    "metadataPercentComplete": 1,
                        "name": "testMovie.mp4",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0.0002,
                    "queuePosition": 16,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 4815736379,
                    "status": 0,
                    "totalSize": 4815736379,
                    "trackers": [{
                        "announce": "http://tracker.trackerfix.com:80/announce",
                        "id": 0,
                        "scrape": "http://tracker.trackerfix.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://9.rarbg.me:2710/announce",
                        "id": 1,
                        "scrape": "udp://9.rarbg.me:2710/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://9.rarbg.to:2710/announce",
                        "id": 2,
                        "scrape": "udp://9.rarbg.to:2710/scrape",
                        "tier": 2
                    }],
                    "uploadRatio": 0,
                    "uploadedEver": 0,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1488184725,
                    "downloadDir": "/shares/Public/movies",
                    "error": 0,
                    "errorString": "",
                    "eta": -2,
                    "id": 24,
                    "isFinished": false,
                    "isStalled": true,
                    "leftUntilDone": 0,
                    "metadataPercentComplete": 1,
                    "name": "Moonlight.2016.BluRay.1080p.x264.DTS-HD.MA.5.1-HDChina",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 1,
                    "queuePosition": 17,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 15901239843,
                    "status": 6,
                    "totalSize": 15901239843,
                    "trackers": [{
                        "announce": "https://tracker.hdchina.club/announce.php?passkey=1a8e4eb58981a44d74ccd53530b92b26",
                        "id": 0,
                        "scrape": "https://tracker.hdchina.club/scrape.php?passkey=1a8e4eb58981a44d74ccd53530b92b26",
                        "tier": 0
                    }],
                    "uploadRatio": 0.0121,
                    "uploadedEver": 193058423,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1488505394,
                    "downloadDir": "/shares/Public/movies",
                    "error": 0,
                    "errorString": "",
                    "eta": -2,
                    "id": 26,
                    "isFinished": false,
                    "isStalled": true,
                    "leftUntilDone": 0,
                    "metadataPercentComplete": 1,
                    "name": "Passengers.2016.BluRay.1080p.x264.DTS-HD.MA.5.1-HDChina",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 1,
                    "queuePosition": 18,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 12523397311,
                    "status": 6,
                    "totalSize": 12523397311,
                    "trackers": [{
                        "announce": "https://tracker.hdchina.club/announce.php?passkey=1a8e4eb58981a44d74ccd53530b92b26",
                        "id": 0,
                        "scrape": "https://tracker.hdchina.club/scrape.php?passkey=1a8e4eb58981a44d74ccd53530b92b26",
                        "tier": 0
                    }],
                    "uploadRatio": 0.0447,
                    "uploadedEver": 560515545,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1488505569,
                    "downloadDir": "/shares/Public/movies",
                    "error": 0,
                    "errorString": "",
                    "eta": -2,
                    "id": 27,
                    "isFinished": false,
                    "isStalled": true,
                    "leftUntilDone": 0,
                    "metadataPercentComplete": 1,
                    "name": "Allied.2016.1080p.BluRay.x264.DTS-HD.MA5.1-HDChina",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 1,
                    "queuePosition": 19,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 12938477070,
                    "status": 6,
                    "totalSize": 12938477070,
                    "trackers": [{
                        "announce": "https://tracker.hdchina.club/announce.php?passkey=1a8e4eb58981a44d74ccd53530b92b26",
                        "id": 0,
                        "scrape": "https://tracker.hdchina.club/scrape.php?passkey=1a8e4eb58981a44d74ccd53530b92b26",
                        "tier": 0
                    }],
                    "uploadRatio": 0.0031,
                    "uploadedEver": 41370410,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1488724837,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -1,
                    "id": 28,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 0,
                    "metadataPercentComplete": 0,
                    "name": "Fallen.2016.V2.DVDRip.XviD.AC3-EVO",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 0,
                    "queuePosition": 20,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 0,
                    "status": 0,
                    "totalSize": 0,
                    "trackers": [{
                        "announce": "udp://tracker.openbittorrent.com:80/announce",
                        "id": 0,
                        "scrape": "udp://tracker.openbittorrent.com:80/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://glotorrents.pw:6969/announce",
                        "id": 1,
                        "scrape": "udp://glotorrents.pw:6969/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://tracker.openbittorrent.com:80/announce",
                        "id": 2,
                        "scrape": "udp://tracker.openbittorrent.com:80/scrape",
                        "tier": 2
                    }, {
                        "announce": "udp://tracker.opentrackr.org:1337/announce",
                        "id": 3,
                        "scrape": "udp://tracker.opentrackr.org:1337/scrape",
                        "tier": 3
                    }, {
                        "announce": "udp://zer0day.to:1337/announce",
                        "id": 4,
                        "scrape": "udp://zer0day.to:1337/scrape",
                        "tier": 4
                    }, {
                        "announce": "udp://tracker.coppersurfer.tk:6969/announce",
                        "id": 5,
                        "scrape": "udp://tracker.coppersurfer.tk:6969/scrape",
                        "tier": 5
                    }],
                    "uploadRatio": -1,
                    "uploadedEver": 0,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1488724931,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": -2,
                    "id": 29,
                    "isFinished": false,
                    "isStalled": true,
                    "leftUntilDone": 0,
                    "metadataPercentComplete": 1,
                    "name": "Hacksaw.Ridge.2016.1080p.BluRay.x264.Atmos.TrueHD7.1-HDChina",
                    "peersConnected": 0,
                    "peersGettingFromUs": 0,
                    "peersSendingToUs": 0,
                    "percentDone": 1,
                    "queuePosition": 21,
                    "rateDownload": 0,
                    "rateUpload": 0,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 21316952531,
                    "status": 6,
                    "totalSize": 21316952531,
                    "trackers": [{
                        "announce": "https://tracker.hdchina.club/announce.php?passkey=1a8e4eb58981a44d74ccd53530b92b26",
                        "id": 0,
                        "scrape": "https://tracker.hdchina.club/scrape.php?passkey=1a8e4eb58981a44d74ccd53530b92b26",
                        "tier": 0
                    }],
                    "uploadRatio": 0.0011,
                    "uploadedEver": 24369263,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1488819263,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": 111474,
                    "id": 35,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 0,
                    "metadataPercentComplete": 1,
                    "name": "Arrival 2016 BluRay 720p DTS AC3 x264-ETRG",
                    "peersConnected": 1,
                    "peersGettingFromUs": 1,
                    "peersSendingToUs": 0,
                    "percentDone": 1,
                    "queuePosition": 22,
                    "rateDownload": 0,
                    "rateUpload": 16000,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 4733078854,
                    "status": 6,
                    "totalSize": 4733078854,
                    "trackers": [{
                        "announce": "http://ipv4.tracker.harry.lu/announce",
                        "id": 0,
                        "scrape": "http://ipv4.tracker.harry.lu/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://tracker.coppersurfer.tk:6969/announce",
                        "id": 1,
                        "scrape": "udp://tracker.coppersurfer.tk:6969/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://tracker.ilibr.org:80/announce",
                        "id": 2,
                        "scrape": "udp://tracker.ilibr.org:80/scrape",
                        "tier": 2
                    }, {
                        "announce": "udp://tracker.leechers-paradise.org:6969/announce",
                        "id": 3,
                        "scrape": "udp://tracker.leechers-paradise.org:6969/scrape",
                        "tier": 3
                    }, {
                        "announce": "udp://eddie4.nl:6969/announce",
                        "id": 4,
                        "scrape": "udp://eddie4.nl:6969/scrape",
                        "tier": 4
                    }, {
                        "announce": "udp://tracker.ilibr.org:6969/announce",
                        "id": 5,
                        "scrape": "udp://tracker.ilibr.org:6969/scrape",
                        "tier": 5
                    }, {
                        "announce": "udp://tracker.coppersurfer.tk:6969/announce",
                        "id": 6,
                        "scrape": "udp://tracker.coppersurfer.tk:6969/scrape",
                        "tier": 6
                    }, {
                        "announce": "udp://tracker.zer0day.to:1337/announce",
                        "id": 7,
                        "scrape": "udp://tracker.zer0day.to:1337/scrape",
                        "tier": 7
                    }, {
                        "announce": "udp://9.rarbg.me:2790/announce",
                        "id": 8,
                        "scrape": "udp://9.rarbg.me:2790/scrape",
                        "tier": 8
                    }, {
                        "announce": "udp://9.rarbg.to:2720/announce",
                        "id": 9,
                        "scrape": "udp://9.rarbg.to:2720/scrape",
                        "tier": 9
                    }, {
                        "announce": "udp://explodie.org:6969/announce",
                        "id": 10,
                        "scrape": "udp://explodie.org:6969/scrape",
                        "tier": 10
                    }, {
                        "announce": "udp://shadowshq.yi.org:6969/announce",
                        "id": 11,
                        "scrape": "udp://shadowshq.yi.org:6969/scrape",
                        "tier": 11
                    }, {
                        "announce": "udp://ipv4.tracker.harry.lu:80/announce",
                        "id": 12,
                        "scrape": "udp://ipv4.tracker.harry.lu:80/scrape",
                        "tier": 12
                    }, {
                        "announce": "udp://tracker.opentrackr.org:1337/announce",
                        "id": 13,
                        "scrape": "udp://tracker.opentrackr.org:1337/scrape",
                        "tier": 13
                    }, {
                        "announce": "udp://p4p.arenabg.ch:1337/announce",
                        "id": 14,
                        "scrape": "udp://p4p.arenabg.ch:1337/scrape",
                        "tier": 14
                    }],
                    "uploadRatio": 0.4291,
                    "uploadedEver": 1702552532,
                    "webseedsSendingToUs": 0
                }, {
                    "addedDate": 1488819263,
                    "downloadDir": "/shares/Public/Downloads/Transmission",
                    "error": 0,
                    "errorString": "",
                    "eta": 209427,
                    "id": 36,
                    "isFinished": false,
                    "isStalled": false,
                    "leftUntilDone": 5185847296,
                    "metadataPercentComplete": 1,
                    "name": "Ender's Game (2013) 2160p UHD BluRay HEVC10 SDR Multi DTSHD 7.1 -DDR",
                    "peersConnected": 8,
                    "peersGettingFromUs": 3,
                    "peersSendingToUs": 2,
                    "percentDone": 0.7963,
                    "queuePosition": 23,
                    "rateDownload": 22000,
                    "rateUpload": 51000,
                    "recheckProgress": 0,
                    "seedRatioLimit": 1,
                    "seedRatioMode": 0,
                    "sizeWhenDone": 25459102603,
                    "status": 4,
                    "totalSize": 25459102603,
                    "trackers": [{
                        "announce": "udp://tracker.coppersurfer.tk:6969/announce",
                        "id": 0,
                        "scrape": "udp://tracker.coppersurfer.tk:6969/scrape",
                        "tier": 0
                    }, {
                        "announce": "udp://tracker.ilibr.org:80/announce",
                        "id": 1,
                        "scrape": "udp://tracker.ilibr.org:80/scrape",
                        "tier": 1
                    }, {
                        "announce": "udp://tracker.leechers-paradise.org:6969/announce",
                        "id": 2,
                        "scrape": "udp://tracker.leechers-paradise.org:6969/scrape",
                        "tier": 2
                    }, {
                        "announce": "udp://eddie4.nl:6969/announce",
                        "id": 3,
                        "scrape": "udp://eddie4.nl:6969/scrape",
                        "tier": 3
                    }, {
                        "announce": "udp://tracker.ilibr.org:6969/announce",
                        "id": 4,
                        "scrape": "udp://tracker.ilibr.org:6969/scrape",
                        "tier": 4
                    }, {
                        "announce": "udp://tracker.coppersurfer.tk:6969",
                        "id": 5,
                        "scrape": "udp://tracker.coppersurfer.tk:6969",
                        "tier": 5
                    }, {
                        "announce": "udp://tracker.zer0day.to:1337/announce",
                        "id": 6,
                        "scrape": "udp://tracker.zer0day.to:1337/scrape",
                        "tier": 6
                    }, {
                        "announce": "udp://9.rarbg.me:2740/announce",
                        "id": 7,
                        "scrape": "udp://9.rarbg.me:2740/scrape",
                        "tier": 7
                    }, {
                        "announce": "udp://9.rarbg.to:2770/announce",
                        "id": 8,
                        "scrape": "udp://9.rarbg.to:2770/scrape",
                        "tier": 8
                    }, {
                        "announce": "udp://explodie.org:6969/announce",
                        "id": 9,
                        "scrape": "udp://explodie.org:6969/scrape",
                        "tier": 9
                    }, {
                        "announce": "udp://shadowshq.yi.org:6969/announce",
                        "id": 10,
                        "scrape": "udp://shadowshq.yi.org:6969/scrape",
                        "tier": 10
                    }, {
                        "announce": "udp://ipv4.tracker.harry.lu:80/announce",
                        "id": 11,
                        "scrape": "udp://ipv4.tracker.harry.lu:80/scrape",
                        "tier": 11
                    }, {
                        "announce": "udp://tracker.opentrackr.org:1337/announce",
                        "id": 12,
                        "scrape": "udp://tracker.opentrackr.org:1337/scrape",
                        "tier": 12
                    }, {
                        "announce": "udp://p4p.arenabg.ch:1337/announce",
                        "id": 13,
                        "scrape": "udp://p4p.arenabg.ch:1337/scrape",
                        "tier": 13
                    }, {
                        "announce": "udp://p4p.arenabg.com:1337/announce",
                        "id": 14,
                        "scrape": "udp://p4p.arenabg.com:1337/scrape",
                        "tier": 14
                    }],
                    "uploadRatio": 0.7311,
                    "uploadedEver": 14846260827,
                    "webseedsSendingToUs": 0
                }],
                selectedIndex: "",
                stats: {},
                ids:[],
                detail: {
                    "activityDate": 1488959866,
                    "comment": "",
                    "corruptEver": 0,
                    "creator": "uTorrent/2210",
                    "dateCreated": 1488609904,
                    "desiredAvailable": 4824252416,
                    "downloadedEver": 20671675508,
                    "fileStats": [
                        {
                            "bytesCompleted": 20512517884,
                            "priority": 0,
                            "wanted": true
                        },
                        {
                            "bytesCompleted": 122331988,
                            "priority": 0,
                            "wanted": true
                        },
                        {
                            "bytesCompleted": 287,
                            "priority": 0,
                            "wanted": true
                        },
                        {
                            "bytesCompleted": 28,
                            "priority": 0,
                            "wanted": true
                        }
                    ],
                    "files": [
                        {
                            "bytesCompleted": 20512517884,
                            "length": 25336770300,
                            "name": "Ender's Game (2013) 2160p UHD BluRay HEVC10 SDR Multi DTSHD 7.1 -DDR/Ender's Game (2013) 2160p UHD BluRay HEVC10 SDR Multi DTSHD 7.1 -DDR.mkv"
                        },
                        {
                            "bytesCompleted": 122331988,
                            "length": 122331988,
                            "name": "Ender's Game (2013) 2160p UHD BluRay HEVC10 SDR Multi DTSHD 7.1 -DDR/sample-Ender's Game (2013) 2160p UHD BluRay HEVC10 SDR Multi DTSHD 7.1 -DDR.mkv"
                        },
                        {
                            "bytesCompleted": 287,
                            "length": 287,
                            "name": "Ender's Game (2013) 2160p UHD BluRay HEVC10 SDR Multi DTSHD 7.1 -DDR/A DDR Release !!!.txt"
                        },
                        {
                            "bytesCompleted": 28,
                            "length": 28,
                            "name": "Ender's Game (2013) 2160p UHD BluRay HEVC10 SDR Multi DTSHD 7.1 -DDR/Torrent downloaded from ExtraTorrent.cc.txt"
                        }
                    ],
                    "hashString": "3e98656e50cf79bb75c79a9b3c63e6b4cfd089b4",
                    "haveUnchecked": 3391488,
                    "haveValid": 20631458699,
                    "id": 36,
                    "isPrivate": false,
                    "peers": [
                        {
                            "address": "2.86.142.169",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "µTorrent 3.4.9",
                            "flagStr": "TdX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 12526,
                            "progress": 1,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "5.79.81.210",
                            "clientIsChoked": false,
                            "clientIsInterested": true,
                            "clientName": "Deluge 1.3.13.0",
                            "flagStr": "TDX",
                            "isDownloadingFrom": true,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 62361,
                            "progress": 1,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "24.84.153.168",
                            "clientIsChoked": true,
                            "clientIsInterested": false,
                            "clientName": "µTorrent 3.4.9",
                            "flagStr": "TX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 42295,
                            "progress": 1,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "41.251.63.215",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "Vuze 5.7.4.0",
                            "flagStr": "TdUX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": true,
                            "peerIsChoked": false,
                            "peerIsInterested": true,
                            "port": 50000,
                            "progress": 0.9726,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "46.166.191.2",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "µTorrent 3.4.9",
                            "flagStr": "TdX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 55508,
                            "progress": 0.9952,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "47.154.115.39",
                            "clientIsChoked": false,
                            "clientIsInterested": false,
                            "clientName": "qBittorrent 3.3.10",
                            "flagStr": "KX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": false,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 8999,
                            "progress": 1,
                            "rateToClient": 4000,
                            "rateToPeer": 0
                        },
                        {
                            "address": "47.184.185.138",
                            "clientIsChoked": false,
                            "clientIsInterested": true,
                            "clientName": "qBittorrent 3.3.11",
                            "flagStr": "TDX",
                            "isDownloadingFrom": true,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 8999,
                            "progress": 0.0558,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "59.126.103.95",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "BitComet 1.37",
                            "flagStr": "d?X",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": false,
                            "isUploadingTo": false,
                            "peerIsChoked": false,
                            "peerIsInterested": false,
                            "port": 30001,
                            "progress": 0.2064,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "60.248.107.31",
                            "clientIsChoked": false,
                            "clientIsInterested": true,
                            "clientName": "BitComet 1.36",
                            "flagStr": "D?X",
                            "isDownloadingFrom": true,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": false,
                            "isUploadingTo": false,
                            "peerIsChoked": false,
                            "peerIsInterested": false,
                            "port": 24269,
                            "progress": 0.9950,
                            "rateToClient": 8000,
                            "rateToPeer": 0
                        },
                        {
                            "address": "68.40.85.168",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "Vuze 5.7.5.0",
                            "flagStr": "d?X",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": false,
                            "isUploadingTo": false,
                            "peerIsChoked": false,
                            "peerIsInterested": false,
                            "port": 15687,
                            "progress": 0.9952,
                            "rateToClient": 9000,
                            "rateToPeer": 0
                        },
                        {
                            "address": "74.240.65.47",
                            "clientIsChoked": true,
                            "clientIsInterested": false,
                            "clientName": "µTorrent 3.4.9",
                            "flagStr": "TUX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": true,
                            "peerIsChoked": false,
                            "peerIsInterested": true,
                            "port": 38464,
                            "progress": 0.1090,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "76.192.159.156",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "Tixati 2.53",
                            "flagStr": "TdX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 48901,
                            "progress": 1,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "79.54.137.238",
                            "clientIsChoked": true,
                            "clientIsInterested": false,
                            "clientName": "µTorrent 3.4.9",
                            "flagStr": "TUX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": true,
                            "peerIsChoked": false,
                            "peerIsInterested": true,
                            "port": 28486,
                            "progress": 0.3476,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "86.0.53.225",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "Vuze 5.7.4.0",
                            "flagStr": "TdX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 38109,
                            "progress": 1,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "93.115.85.131",
                            "clientIsChoked": true,
                            "clientIsInterested": false,
                            "clientName": "qBittorrent 3.3.11",
                            "flagStr": "T?X",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": false,
                            "peerIsInterested": false,
                            "port": 25338,
                            "progress": 0.9952,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "95.14.73.97",
                            "clientIsChoked": false,
                            "clientIsInterested": true,
                            "clientName": "Transmission 2.92",
                            "flagStr": "D?X",
                            "isDownloadingFrom": true,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": false,
                            "isUploadingTo": false,
                            "peerIsChoked": false,
                            "peerIsInterested": false,
                            "port": 52488,
                            "progress": 0.0168,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "112.198.151.224",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "µTorrent 3.4.5",
                            "flagStr": "TdX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 53596,
                            "progress": 0.5907,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "116.231.152.181",
                            "clientIsChoked": false,
                            "clientIsInterested": true,
                            "clientName": "Transmission 2.92",
                            "flagStr": "TDUX",
                            "isDownloadingFrom": true,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": true,
                            "peerIsChoked": false,
                            "peerIsInterested": true,
                            "port": 62059,
                            "progress": 0.4873,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "119.77.242.179",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "BitTorrent 7.9.5",
                            "flagStr": "dUX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": false,
                            "isUploadingTo": true,
                            "peerIsChoked": false,
                            "peerIsInterested": true,
                            "port": 48392,
                            "progress": 0.1327,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "122.150.54.149",
                            "clientIsChoked": true,
                            "clientIsInterested": false,
                            "clientName": "BitTorrent 7.9.9",
                            "flagStr": "TX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 58085,
                            "progress": 1,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "123.195.121.12",
                            "clientIsChoked": false,
                            "clientIsInterested": true,
                            "clientName": "BitComet 1.42",
                            "flagStr": "DX",
                            "isDownloadingFrom": true,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": false,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 23653,
                            "progress": 1,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "124.6.12.145",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "BitComet 1.31",
                            "flagStr": "dX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": false,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 15781,
                            "progress": 1,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "124.120.60.153",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "µTorrent 3.4.9",
                            "flagStr": "d?X",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": false,
                            "isUploadingTo": false,
                            "peerIsChoked": false,
                            "peerIsInterested": false,
                            "port": 25665,
                            "progress": 0.1311,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "125.34.14.246",
                            "clientIsChoked": false,
                            "clientIsInterested": false,
                            "clientName": "Xunlei 0.0.1.2",
                            "flagStr": "TK?X",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": false,
                            "peerIsInterested": false,
                            "port": 15000,
                            "progress": 0.7031,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "147.147.35.165",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "µTorrent 2.2.1",
                            "flagStr": "dX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": false,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 6669,
                            "progress": 1,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "175.183.1.53",
                            "clientIsChoked": true,
                            "clientIsInterested": false,
                            "clientName": "Transmission 2.84",
                            "flagStr": "TX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 51413,
                            "progress": 0.9952,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "178.152.236.38",
                            "clientIsChoked": false,
                            "clientIsInterested": true,
                            "clientName": "n%A6%F1%13%%F76%E3",
                            "flagStr": "TD?X",
                            "isDownloadingFrom": true,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": false,
                            "peerIsInterested": false,
                            "port": 5136,
                            "progress": 0.0214,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "187.44.44.118",
                            "clientIsChoked": false,
                            "clientIsInterested": true,
                            "clientName": "qBittorrent 3.3.4",
                            "flagStr": "TDUX",
                            "isDownloadingFrom": true,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": true,
                            "peerIsChoked": false,
                            "peerIsInterested": true,
                            "port": 42666,
                            "progress": 0.5767,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "193.70.12.16",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "Transmission 2.84",
                            "flagStr": "TdX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 43681,
                            "progress": 1,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "196.13.185.1",
                            "clientIsChoked": true,
                            "clientIsInterested": true,
                            "clientName": "-TB2079-",
                            "flagStr": "TduX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": true,
                            "port": 51413,
                            "progress": 0.1710,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "197.237.28.77",
                            "clientIsChoked": true,
                            "clientIsInterested": false,
                            "clientName": "BitTorrent 7.9.9",
                            "flagStr": "T?X",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": false,
                            "peerIsInterested": false,
                            "port": 12355,
                            "progress": 0.3467,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "203.217.79.246",
                            "clientIsChoked": true,
                            "clientIsInterested": false,
                            "clientName": "µTorrent 3.4.9",
                            "flagStr": "T?X",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": false,
                            "peerIsInterested": false,
                            "port": 26530,
                            "progress": 0.2576,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        },
                        {
                            "address": "222.127.178.8",
                            "clientIsChoked": true,
                            "clientIsInterested": false,
                            "clientName": "µTorrent 3.4.5",
                            "flagStr": "TX",
                            "isDownloadingFrom": false,
                            "isEncrypted": false,
                            "isIncoming": false,
                            "isUTP": true,
                            "isUploadingTo": false,
                            "peerIsChoked": true,
                            "peerIsInterested": false,
                            "port": 33634,
                            "progress": 1,
                            "rateToClient": 0,
                            "rateToPeer": 0
                        }
                    ],
                    "pieceCount": 6070,
                    "pieceSize": 4194304,
                    "startDate": 1488820354,
                    "trackerStats": [
                        {
                            "announce": "udp://tracker.coppersurfer.tk:6969/announce",
                            "announceState": 1,
                            "downloadCount": 714,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://tracker.coppersurfer.tk:6969",
                            "id": 0,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 80,
                            "lastAnnounceResult": "Connection failed",
                            "lastAnnounceStartTime": 0,
                            "lastAnnounceSucceeded": false,
                            "lastAnnounceTime": 1488958812,
                            "lastAnnounceTimedOut": false,
                            "lastScrapeResult": "Connection failed",
                            "lastScrapeStartTime": 0,
                            "lastScrapeSucceeded": false,
                            "lastScrapeTime": 1488959533,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 255,
                            "nextAnnounceTime": 1488960615,
                            "nextScrapeTime": 1488963140,
                            "scrape": "udp://tracker.coppersurfer.tk:6969/scrape",
                            "scrapeState": 1,
                            "seederCount": 141,
                            "tier": 0
                        },
                        {
                            "announce": "udp://tracker.ilibr.org:80/announce",
                            "announceState": 1,
                            "downloadCount": 722,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://tracker.ilibr.org:80",
                            "id": 1,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 80,
                            "lastAnnounceResult": "Connection failed",
                            "lastAnnounceStartTime": 0,
                            "lastAnnounceSucceeded": false,
                            "lastAnnounceTime": 1488954111,
                            "lastAnnounceTimedOut": false,
                            "lastScrapeResult": "Connection failed",
                            "lastScrapeStartTime": 0,
                            "lastScrapeSucceeded": false,
                            "lastScrapeTime": 1488956674,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 289,
                            "nextAnnounceTime": 1488961347,
                            "nextScrapeTime": 1488963900,
                            "scrape": "udp://tracker.ilibr.org:80/scrape",
                            "scrapeState": 1,
                            "seederCount": 142,
                            "tier": 1
                        },
                        {
                            "announce": "udp://tracker.leechers-paradise.org:6969/announce",
                            "announceState": 1,
                            "downloadCount": 363,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://tracker.leechers-paradise.org:6969",
                            "id": 2,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 80,
                            "lastAnnounceResult": "Connection failed",
                            "lastAnnounceStartTime": 0,
                            "lastAnnounceSucceeded": false,
                            "lastAnnounceTime": 1488958187,
                            "lastAnnounceTimedOut": false,
                            "lastScrapeResult": "Connection failed",
                            "lastScrapeStartTime": 1488959410,
                            "lastScrapeSucceeded": true,
                            "lastScrapeTime": 1488959411,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 182,
                            "nextAnnounceTime": 1488961827,
                            "nextScrapeTime": 1488961220,
                            "scrape": "udp://tracker.leechers-paradise.org:6969/scrape",
                            "scrapeState": 1,
                            "seederCount": 82,
                            "tier": 2
                        },
                        {
                            "announce": "udp://eddie4.nl:6969/announce",
                            "announceState": 1,
                            "downloadCount": 356,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://eddie4.nl:6969",
                            "id": 3,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 80,
                            "lastAnnounceResult": "Could not connect to tracker",
                            "lastAnnounceStartTime": 0,
                            "lastAnnounceSucceeded": false,
                            "lastAnnounceTime": 1488959488,
                            "lastAnnounceTimedOut": true,
                            "lastScrapeResult": "Connection failed",
                            "lastScrapeStartTime": 0,
                            "lastScrapeSucceeded": false,
                            "lastScrapeTime": 1488958252,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 190,
                            "nextAnnounceTime": 1488966713,
                            "nextScrapeTime": 1488961890,
                            "scrape": "udp://eddie4.nl:6969/scrape",
                            "scrapeState": 1,
                            "seederCount": 79,
                            "tier": 3
                        },
                        {
                            "announce": "udp://tracker.ilibr.org:6969/announce",
                            "announceState": 1,
                            "downloadCount": 718,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://tracker.ilibr.org:6969",
                            "id": 4,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 80,
                            "lastAnnounceResult": "Could not connect to tracker",
                            "lastAnnounceStartTime": 0,
                            "lastAnnounceSucceeded": false,
                            "lastAnnounceTime": 1488954069,
                            "lastAnnounceTimedOut": true,
                            "lastScrapeResult": "Could not connect to tracker",
                            "lastScrapeStartTime": 0,
                            "lastScrapeSucceeded": false,
                            "lastScrapeTime": 1488956553,
                            "lastScrapeTimedOut": 1,
                            "leecherCount": 292,
                            "nextAnnounceTime": 1488961327,
                            "nextScrapeTime": 1488963810,
                            "scrape": "udp://tracker.ilibr.org:6969/scrape",
                            "scrapeState": 1,
                            "seederCount": 142,
                            "tier": 4
                        },
                        {
                            "announce": "udp://tracker.coppersurfer.tk:6969",
                            "announceState": 1,
                            "downloadCount": 745,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://tracker.coppersurfer.tk:6969",
                            "id": 5,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 80,
                            "lastAnnounceResult": "Success",
                            "lastAnnounceStartTime": 1488959407,
                            "lastAnnounceSucceeded": true,
                            "lastAnnounceTime": 1488959408,
                            "lastAnnounceTimedOut": false,
                            "lastScrapeResult": "Connection failed",
                            "lastScrapeStartTime": 0,
                            "lastScrapeSucceeded": true,
                            "lastScrapeTime": 1488959408,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 258,
                            "nextAnnounceTime": 1488961116,
                            "nextScrapeTime": 1488961210,
                            "scrape": "udp://tracker.coppersurfer.tk:6969",
                            "scrapeState": 1,
                            "seederCount": 144,
                            "tier": 5
                        },
                        {
                            "announce": "udp://tracker.zer0day.to:1337/announce",
                            "announceState": 1,
                            "downloadCount": 523,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://tracker.zer0day.to:1337",
                            "id": 6,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 80,
                            "lastAnnounceResult": "Success",
                            "lastAnnounceStartTime": 1488958802,
                            "lastAnnounceSucceeded": true,
                            "lastAnnounceTime": 1488958803,
                            "lastAnnounceTimedOut": false,
                            "lastScrapeResult": "Connection failed",
                            "lastScrapeStartTime": 0,
                            "lastScrapeSucceeded": true,
                            "lastScrapeTime": 1488958803,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 230,
                            "nextAnnounceTime": 1488960674,
                            "nextScrapeTime": 1488960610,
                            "scrape": "udp://tracker.zer0day.to:1337/scrape",
                            "scrapeState": 1,
                            "seederCount": 115,
                            "tier": 6
                        },
                        {
                            "announce": "udp://9.rarbg.me:2740/announce",
                            "announceState": 1,
                            "downloadCount": 854,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://9.rarbg.me:2740",
                            "id": 7,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 50,
                            "lastAnnounceResult": "Could not connect to tracker",
                            "lastAnnounceStartTime": 0,
                            "lastAnnounceSucceeded": false,
                            "lastAnnounceTime": 1488954114,
                            "lastAnnounceTimedOut": true,
                            "lastScrapeResult": "Connection failed",
                            "lastScrapeStartTime": 1488959810,
                            "lastScrapeSucceeded": false,
                            "lastScrapeTime": 1488958903,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 150,
                            "nextAnnounceTime": 1488961365,
                            "nextScrapeTime": 0,
                            "scrape": "udp://9.rarbg.me:2740/scrape",
                            "scrapeState": 3,
                            "seederCount": 53,
                            "tier": 7
                        },
                        {
                            "announce": "udp://9.rarbg.to:2770/announce",
                            "announceState": 1,
                            "downloadCount": 807,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://9.rarbg.to:2770",
                            "id": 8,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 50,
                            "lastAnnounceResult": "Connection failed",
                            "lastAnnounceStartTime": 0,
                            "lastAnnounceSucceeded": false,
                            "lastAnnounceTime": 1488952830,
                            "lastAnnounceTimedOut": false,
                            "lastScrapeResult": "Connection failed",
                            "lastScrapeStartTime": 0,
                            "lastScrapeSucceeded": false,
                            "lastScrapeTime": 1488956834,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 152,
                            "nextAnnounceTime": 1488960089,
                            "nextScrapeTime": 1488964100,
                            "scrape": "udp://9.rarbg.to:2770/scrape",
                            "scrapeState": 1,
                            "seederCount": 58,
                            "tier": 8
                        },
                        {
                            "announce": "udp://explodie.org:6969/announce",
                            "announceState": 1,
                            "downloadCount": 296,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://explodie.org:6969",
                            "id": 9,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 80,
                            "lastAnnounceResult": "Success",
                            "lastAnnounceStartTime": 1488958812,
                            "lastAnnounceSucceeded": true,
                            "lastAnnounceTime": 1488958812,
                            "lastAnnounceTimedOut": false,
                            "lastScrapeResult": "Connection failed",
                            "lastScrapeStartTime": 0,
                            "lastScrapeSucceeded": true,
                            "lastScrapeTime": 1488958812,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 142,
                            "nextAnnounceTime": 1488960754,
                            "nextScrapeTime": 1488960620,
                            "scrape": "udp://explodie.org:6969/scrape",
                            "scrapeState": 1,
                            "seederCount": 53,
                            "tier": 9
                        },
                        {
                            "announce": "udp://shadowshq.yi.org:6969/announce",
                            "announceState": 1,
                            "downloadCount": 363,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://shadowshq.yi.org:6969",
                            "id": 10,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 80,
                            "lastAnnounceResult": "Connection failed",
                            "lastAnnounceStartTime": 0,
                            "lastAnnounceSucceeded": false,
                            "lastAnnounceTime": 1488959153,
                            "lastAnnounceTimedOut": false,
                            "lastScrapeResult": "Connection failed",
                            "lastScrapeStartTime": 1488959760,
                            "lastScrapeSucceeded": true,
                            "lastScrapeTime": 1488959761,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 182,
                            "nextAnnounceTime": 1488960979,
                            "nextScrapeTime": 1488961570,
                            "scrape": "udp://shadowshq.yi.org:6969/scrape",
                            "scrapeState": 1,
                            "seederCount": 83,
                            "tier": 10
                        },
                        {
                            "announce": "udp://ipv4.tracker.harry.lu:80/announce",
                            "announceState": 1,
                            "downloadCount": 537,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://ipv4.tracker.harry.lu:80",
                            "id": 11,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 50,
                            "lastAnnounceResult": "Success",
                            "lastAnnounceStartTime": 1488959752,
                            "lastAnnounceSucceeded": true,
                            "lastAnnounceTime": 1488959753,
                            "lastAnnounceTimedOut": false,
                            "lastScrapeResult": "Connection failed",
                            "lastScrapeStartTime": 1488957961,
                            "lastScrapeSucceeded": true,
                            "lastScrapeTime": 1488959753,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 169,
                            "nextAnnounceTime": 1488963353,
                            "nextScrapeTime": 1488961560,
                            "scrape": "udp://ipv4.tracker.harry.lu:80/scrape",
                            "scrapeState": 1,
                            "seederCount": 56,
                            "tier": 11
                        },
                        {
                            "announce": "udp://tracker.opentrackr.org:1337/announce",
                            "announceState": 1,
                            "downloadCount": 732,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://tracker.opentrackr.org:1337",
                            "id": 12,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 80,
                            "lastAnnounceResult": "Success",
                            "lastAnnounceStartTime": 1488958802,
                            "lastAnnounceSucceeded": true,
                            "lastAnnounceTime": 1488958803,
                            "lastAnnounceTimedOut": false,
                            "lastScrapeResult": "Could not connect to tracker",
                            "lastScrapeStartTime": 0,
                            "lastScrapeSucceeded": true,
                            "lastScrapeTime": 1488958803,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 236,
                            "nextAnnounceTime": 1488960559,
                            "nextScrapeTime": 1488960610,
                            "scrape": "udp://tracker.opentrackr.org:1337/scrape",
                            "scrapeState": 1,
                            "seederCount": 113,
                            "tier": 12
                        },
                        {
                            "announce": "udp://p4p.arenabg.ch:1337/announce",
                            "announceState": 1,
                            "downloadCount": 218,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://p4p.arenabg.ch:1337",
                            "id": 13,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 80,
                            "lastAnnounceResult": "Connection failed",
                            "lastAnnounceStartTime": 0,
                            "lastAnnounceSucceeded": false,
                            "lastAnnounceTime": 1488956548,
                            "lastAnnounceTimedOut": false,
                            "lastScrapeResult": "Connection failed",
                            "lastScrapeStartTime": 0,
                            "lastScrapeSucceeded": false,
                            "lastScrapeTime": 1488954123,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 216,
                            "nextAnnounceTime": 1488963788,
                            "nextScrapeTime": 1488961360,
                            "scrape": "udp://p4p.arenabg.ch:1337/scrape",
                            "scrapeState": 1,
                            "seederCount": 60,
                            "tier": 13
                        },
                        {
                            "announce": "udp://p4p.arenabg.com:1337/announce",
                            "announceState": 1,
                            "downloadCount": 171,
                            "hasAnnounced": true,
                            "hasScraped": true,
                            "host": "udp://p4p.arenabg.com:1337",
                            "id": 14,
                            "isBackup": false,
                            "lastAnnouncePeerCount": 80,
                            "lastAnnounceResult": "Connection failed",
                            "lastAnnounceStartTime": 0,
                            "lastAnnounceSucceeded": false,
                            "lastAnnounceTime": 1488957775,
                            "lastAnnounceTimedOut": false,
                            "lastScrapeResult": "Connection failed",
                            "lastScrapeStartTime": 0,
                            "lastScrapeSucceeded": false,
                            "lastScrapeTime": 1488955533,
                            "lastScrapeTimedOut": 0,
                            "leecherCount": 241,
                            "nextAnnounceTime": 1488964982,
                            "nextScrapeTime": 1488962750,
                            "scrape": "udp://p4p.arenabg.com:1337/scrape",
                            "scrapeState": 1,
                            "seederCount": 64,
                            "tier": 14
                        }
                    ]
                }

            };

            //连续获取seesion
            var loadSession = setInterval(function () {
                $scope.getSession();
            }, 3000);

            //获取到session后结束循环获取session
            $scope.$on("getSessionDone", function (event) {
                clearInterval(loadSession);

                $scope.loopGetSessionData();

                $scope.getStatsData();
            });

            $scope.$on("getStatsDone", function () {
                $scope.loopGetTorrentData();
            });

            $scope.tmpUrl = {
                detail:"template/detail.html",
                blankDetail : "template/blankdetail.html",
                tips:"template/tips.html",
                settings:"template/settings.html"
            };

            $scope.mobileMode = false;

            $scope.modalUrl = "";
        };

        $scope.init();

    }]);

    $app.directive('includeReplace', function () {
        return {
            require: 'ngInclude',
            restrict: 'A', /* optional */
            link: function (scope, el, attrs) {
                el.replaceWith(el.children());
            }
        };
    });

    return $app;
});