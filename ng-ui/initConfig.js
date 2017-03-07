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
            ajaxService.getTorrent($scope.session).then(function (response) {
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
            if($scope.detailShow === true){
                $scope.detail.close();
                $scope.detail.show();
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

        $scope.detail = {
            "target": $("#torrent-detail"),
            "className": "show",
            "tabNames": ["info", "peers", "tracker", "files"],
            "tabSelect": function (index) {
                $scope.detail.selectedTabIndex = index;
            },
            "loaded" : false,
            "torrentData":false,
            "selectedTabIndex": 0,
            "show": function () {
                if ($scope.data.selectedIndex === "") {
                    console.log("请选择一个传输任务");
                } else {
                    $scope.detailShow = $scope.detailShow !== true;

                    if ($scope.detailShow === true) {
                        $scope.detail.torrentData = $scope.data.torrent[$scope.data.selectedIndex];
                        $scope.ajaxPool = ajaxService.getFullDetail($scope.session, [$scope.data.torrent[$scope.data.selectedIndex].id]).then(function (response) {
                            $scope.detail.loaded = true;

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
                $scope.detailShow = false;
                $scope.detail.loaded = false;
                var arr = [$scope.ajaxPool.fullDetail, $scope.ajaxPool.detail];
                _.each(arr, function (value, index) {
                    if (typeof value === "object" && typeof value.resolve === "function") {
                        value.resolve();
                    }
                });
            }
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
                detail: {},
                fullDetail: {}
            };

            $scope.detailShow = false;

            //数据
            $scope.data = {
                global: {},
                torrent: {},
                selectedIndex: "",
                stats: {},
                detail: {}
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
                blankDetail : "blankdetail.html"
            };
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