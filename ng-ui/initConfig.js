/**
 * Created by vincent on 2017/3/4.
 */

define(["jquery", "localData", "lodash", "transmission", "angularAMD", "angular-touch"], function ($, localData,  _, tr, angularAMD) {
    "use strict";

    var app = angular.module("transmission", ["ngTouch"]);

    var $app = angularAMD.bootstrap(app);

    $app.config(["$touchProvider", function ($touchProvider) {
        $touchProvider.ngClickOverrideEnabled([true]);
    }]);

    $app.factory("ajaxService", ["$http", "$q", function ($http, $q) {
        var service = {};
        var baseUrl = "/transmission/rpc";

        function ajax(op) {
            var deferred = $q.defer();
            var ajax = $http({
                method: "POST",
                url: baseUrl + (op.url !== undefined ? op.url : ""),
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

            $q.when(ajax,function (response, status, headers, config) {
                deferred.resolve(response, status, headers, config);
            },function (response, status) {
                if (status !== 0) {
                    deferred.reject({
                        errService:op.errService ? op.errService : "Service Error",
                        err:op.err,
                        response:response,
                        status:status
                    });
                }
            });

            return op.cancel === true?deferred:deferred.promise;
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
                url: "?type=getTorrent",
                cancel:true
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
                url: "?type=getActiveTorrent",
                cancel:true
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
                url: "?type=getFullDetail",
                cancel:true
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
                url: "?type=getDetail",
                cancel:true
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
                        "ids": ids
                    }
                },
                url: "?type=removeFromList"
            });
        };

        service.removeAllData = function (sessionId,ids) {
            return ajax({
                sessionId: sessionId,
                param: {
                    "method": "torrent-remove",
                    "arguments": {
                        "delete-local-data":true,
                        "ids": ids
                    }
                },
                url: "?type=removeAllData"
            });
        };

        service.pauseTransform = function (sessionId,ids) {
            return ajax({
                sessionId: sessionId,
                param: {
                    "method": "torrent-stop",
                    "arguments": {
                        "ids": ids
                    }
                },
                url: "?type=torrent-stop"
            });
        };

        service.startTransform = function (sessionId,ids) {
            return ajax({
                sessionId: sessionId,
                param: {
                    "method": "torrent-start",
                    "arguments": {
                        "ids": ids
                    }
                },
                url: "?type=torrent-start"
            });
        };

        service.startTransformNow = function (sessionId,ids) {
            return ajax({
                sessionId: sessionId,
                param: {
                    "method": "torrent-start-now",
                    "arguments": {
                        "ids": ids
                    }
                },
                url: "?type=torrent-start-now"
            });
        };
        return service;
    }]);

    $app.controller("mainController", ["$scope", "$http", "$q", "$sce", "ajaxService", function ($scope, $http, $q, $sce, ajaxService) {

        //获取session
        $scope.getSession = function (session) {
            //获取session
            ajaxService.getSession(session).then(function (response) {
                $scope.data.global = response.data.arguments;
            }, function (reason) {
                var str = reason.response.data;
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

        //获取正在活动的Torrent数据
        $scope.getRecentlyActiveTorrentData = function () {
            //获取活动中的torrent数据
            $scope.ajaxPool.activeTorrent = ajaxService.getActiveTorrent($scope.session);
            $scope.ajaxPool.activeTorrent.promise.then(function (response) {
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
            $scope.ajaxPool.torrent = ajaxService.getTorrent($scope.session);
            $scope.ajaxPool.torrent.promise.then(function (response) {
                $scope.data.torrent = _.sortBy(response.data.arguments.torrents, function (item) {
                    return -item.addedDate;
                });

                $scope.data.ids = [];
                _.each($scope.data.torrent,function (obj,index) {
                    $scope.data.ids.push(obj.id);
                });

                //loop the active torrent
                $scope.ajaxPool.activeTorrent = $scope.getRecentlyActiveTorrentData();
                $scope.pool.activeTorrent = setInterval(function () {
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
                $scope.detail.status = $scope.detail.status !== true;

                if ($scope.detail.status === true) {
                    if($scope.data.selectedIndex !== ''){
                        $scope.detail.torrentData = $scope.data.torrent[$scope.data.selectedIndex];
                        $scope.ajaxPool.fullDetail = ajaxService.getFullDetail($scope.session, [$scope.data.torrent[$scope.data.selectedIndex].id]);
                        $scope.ajaxPool.fullDetail.promise.then(function (response) {
                            $scope.data.detail = response.data.arguments.torrents[0];
                            $scope.pool.detail = setInterval(function () {
                                $scope.ajaxPool.detail = ajaxService.getDetail($scope.session, [$scope.data.torrent[$scope.data.selectedIndex].id]);
                                $scope.ajaxPool.detail.promise.then(function ($response) {
                                    $scope.data.detail = _.merge($scope.data.detail, $response.data.arguments.torrents[0]);
                                }, function (reason) {
                                    console.log("维护明细数据失败");
                                });
                            }, $scope.loopFragment.detail);
                        }, function (reason) {
                            console.log("获取明细失败");
                        });
                    }
                } else {
                    $scope.detail.close();
                }
            },
            "close": function () {
                clearInterval($scope.pool.detail);
                $scope.detail.status = false;
                $scope.closeAjax($scope.ajaxPool.fullDetail);
                $scope.closeAjax($scope.ajaxPool.detail);
            }
        };

        $scope.closeAjax = function (obj) {
            if (typeof obj === "object" && typeof obj.resolve === "function") {
                obj.resolve();
            }
        };

        $scope.reload = {
            "torrent":function () {
                clearInterval($scope.pool.activeTorrent);
                $scope.closeAjax($scope.ajaxPool.torrent);
                $scope.closeAjax($scope.ajaxPool.activeTorrent);
                $scope.loopGetTorrentData();
            },
            "detail":function () {
                clearInterval($scope.pool.detail);
                $scope.closeAjax($scope.ajaxPool.fullDetail);
                $scope.closeAjax($scope.ajaxPool.detail);
            }
        };

        var validationIDS = function(ids) {
            var result = true;
            if($scope.data.torrent.length === 0 || ids === undefined || ids.length === 0 || (ids.length === 1 && ids[0] === undefined)){
                result =  false;
            }
            return result;
        };

        $scope.removeFromList = function (ids) {
            if(validationIDS(ids) === false){
                return false;
            }
            // $scope.session
            ajaxService.removeFromList($scope.session,ids).then(function (response) {
                $scope.reload.torrent();
            },function (reason) {
                console.log("从下载列表中移除失败");
            });
        };

        $scope.removeFromList = function (ids) {
            if(validationIDS(ids) === false){
                return false;
            }
            // $scope.session
            ajaxService.removeAllData($scope.session,ids).then(function (response) {
                $scope.reload.torrent();
            },function (reason) {
                console.log("从下载列表中移除失败");
            });
        };

        $scope.pauseTransform = function (ids) {
            if(validationIDS(ids) === false){
                return false;
            }
            ajaxService.pauseTransform($scope.session,ids).then(function (response) {
                $scope.reload.torrent();
            },function (reason) {
                console.log("暂停传输任务请求失败！");
            })
        };

        $scope.startTransform = function (ids) {
            if(validationIDS(ids) === false){
                return false;
            }
            ajaxService.startTransform($scope.session,ids).then(function (response) {
                $scope.reload.torrent();
            },function (reason) {
                console.log("暂停传输任务请求失败！");
            })
        };

        $scope.startTransformNow = function (ids) {
            if(validationIDS(ids) === false){
                return false;
            }
            ajaxService.startTransformNow($scope.session,ids).then(function (response) {
                $scope.reload.torrent();
            },function (reason) {
                console.log("暂停传输任务请求失败！");
            })
        };

        $scope.init = function () {
            //数据
            $scope.globalData = {};

            $scope.session = "";

            $scope.loopFragment = {
                torrent: 5000,
                active: 5000,
                detail: 5000,
                session: 15000
            };

            //loop pool
            $scope.pool = {
                torrent: "",
                activeTorrent:"",
                session: "",
                detail: ""
            };

            $scope.ajaxPool = {
                torrent:{},
                activeTorrent:{},
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
                global: {},
                torrent: [],
                selectedIndex: "",
                stats: {},
                ids:[],
                detail: {}
            };

            $scope.localMode = false;

            if($scope.localMode === true){
                $scope.data = {
                    global: localData.global,
                    torrent: localData.torrent,
                    selectedIndex: localData.selectedIndex,
                    stats: localData.stats,
                    ids:localData.ids,
                    detail: localData.detail
                };
            }

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

            document.addEventListener('touchstart', function(event) {
                // 判断默认行为是否可以被禁用
                if (event.cancelable) {
                    // 判断默认行为是否已经被禁用
                    if (!event.defaultPrevented) {
                        event.preventDefault();
                    }
                }
            }, false);
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