/**
 * Created by vincent on 2017/3/4.
 */

define("init", ["jquery", "angular", "lodash","transmission"], function ($, angular, _, tr) {
    "use strict";
    var app = angular.module("transmission", []);

    app.factory("ajaxService", ["$http", "$q", function ($http, $q) {
        var service = {};

        function ajax(op) {
            var deferred = $q.defer();

            var torrentParam = {
                "arguments": {
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
            };


            deferred.promise = $http({
                method: "POST",
                url: "/transmission/rpc",
                headers: op.sessionId !== undefined ? {"X-Transmission-Session-Id": op.sessionId} : {},
                data: (function () {
                    var param = {};
                    switch (op.method) {
                        case "torrent-get":
                            torrentParam.method = op.method;
                            param = torrentParam;
                            break;
                        default:
                            param = {method: op.method};
                            break;
                    }
                    return param;
                })()
            });
            return deferred.promise;
        }

        service.getSession = function (sessionId) {
            return ajax({sessionId: sessionId, method: "session-get"});
        };

        service.getSessionStats = function (sessionId) {
            return ajax({sessionId: sessionId, method: "session-stats"});
        };

        service.getTorrent = function (sessionId) {
            var params = {
                "arguments": {
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
            };
            return ajax({sessionId: sessionId, method: "torrent-get", param: params});
        };

        service.startTorrent = function (sessionId) {
            return ajax({sessionId: sessionId, method: "torrent-start"});
        };

        service.stopTorrent = function (sessionId) {
            return ajax({sessionId: sessionId, method: "torrent-stop"});
        };

        return service;
    }]);

    app.controller("mainController", ["$scope", "$http", "$q", "$sce", "ajaxService", function ($scope, $http, $q, $sce, ajaxService) {



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

        //获取种子数据
        $scope.getTorrentData = function () {
            //获取session
            ajaxService.getTorrent($scope.session).then(function (response) {
                $scope.data.torrent = _.sortBy(response.data.arguments.torrents, function (item) {
                    return -item.addedDate;
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
            $scope.getTorrentData();
            $scope.pool.torrent = setInterval(function () {
                $scope.getTorrentData();
            }, $scope.loopFragment.torrent);
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
            $scope.data.selectedIndex = index;
        };

        //
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
        $scope.parsTorrentClassName = function (status,index) {
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
            if(index === $scope.data.selectedIndex){
                className += " selected";
            }
            return className;
        };

        //解析torrent列表文字
        $scope.parseText = {
            "Status":function (index) {
                var data = $scope.data.torrent[index];
                var html = "";

                switch (data.status){
                    case 0:
                        // className = "paused";
                        html += "已暂停";
                        break;
                    case 4:
                        html += "下载自";
                        html += "<span>" + data.peersSendingToUs + "/" + data.peersConnected + "个用户</span>";
                        html += "<span class=\"icon-download\">";
                        html +=     $scope.bytesConvert(data.rateDownload) + "/s";
                        html += "</span>";
                        html += "<span class=\"icon-upload\">";
                        html +=     $scope.bytesConvert(data.rateUpload) + "/s";
                        html += "</span>";
                        break;
                    case 6:
                        html += "分享至";
                        html += "<span>" + data.peersGettingFromUs + "/" + data.peersConnected + "个用户</span>";
                        html += "<span class=\"icon-upload\">";
                        html +=     $scope.bytesConvert(data.rateUpload) + "/s";
                        html += "</span>";
                        break;
                    default:
                        // className = "seeding";
                        break;
                }

                return $sce.trustAsHtml(html);
            },
            "TransformData":function (index) {
                var data = $scope.data.torrent[index];
                var html = "";

                switch (data.status){
                    case 0:
                        // className = "paused";
                        if(data.metadataPercentComplete < 1){
                            html += "磁性链接";
                            html += "<span>";
                            html +=     "下载元数据（" + (data.metadataPercentComplete < 1 ? tr.parseFloat2(data.metadataPercentComplete * 100) :"100") + "%）";
                            html += "</span>";
                        }else {
                            html += "已下载";
                            html += "<span>";
                            html +=     $scope.bytesConvert(data.totalSize * (data.percentDone < 1 ? data.percentDone : 1)) + "/" + $scope.bytesConvert(data.totalSize);
                            html += "</span>";
                            html += "<span>";
                            html +=     "(" + (data.percentDone < 1 ? tr.parseFloat2(data.percentDone * 100) : "100") + "%)";
                            html += "</span>";
                        }
                        break;
                    case 4:
                        // className = "downloading";,
                        if(data.metadataPercentComplete < 1){
                            html += "磁性链接<span> 下载元数据（" + (data.metadataPercentComplete < 1 ? tr.parseFloat2(data.metadataPercentComplete * 100) :"100") + "）</span>";
                        }else{
                            html += "已下载";
                            html += "<span>";
                            html +=     $scope.bytesConvert(data.totalSize * (data.percentDone < 1 ? data.percentDone:1)) + "/" + $scope.bytesConvert(data.totalSize);
                            html += "</span>";
                            html += "<span>";
                            html +=     "(" + (data.percentDone < 1 ? tr.parseFloat2(data.percentDone * 100) :"100") + "%)";
                            html += "</span>";
                            if(data.uploadedEver > 0){
                                html += "<span>";
                                html +=     "已上传";
                                html += "</span>";
                                html += "<span>";
                                html +=     $scope.bytesConvert(data.uploadedEver);
                                html += "</span>";
                            }
                        }
                        break;
                    case 6:
                        // className = "seeding";
                        html += "已上传";
                        html += "<span>";
                        html +=     $scope.bytesConvert(data.uploadedEver) + "/" + $scope.bytesConvert(data.totalSize);
                        html += "</span>";
                        html += "<span>";
                        html +=     "分享率("+ tr.parseFloat2(data.uploadRatio) + "%)";
                        html += "</span>";
                        break;
                    default:
                        // className = "seeding";
                        break;
                }

                return $sce.trustAsHtml(html);
            }
        };

        $scope.showDetail = function () {
            var index = $scope.data.selectedIndex;
            var data = $scope.data.torrent[index];
            var obj = $("#torrent-detail");
            var torrentList = $("#torrent-list");

            obj.animate({"right":0},200);
            torrentList.animate({"width":60 + "%"},200);
        };

        $scope.init = function () {
            //数据
            $scope.globalData = {};

            $scope.session = "";

            $scope.loopFragment = {
                torrent: 5000,
                session: 15000
            };

            $scope.pool = {
                torrent: "",
                session: ""
            };

            //数据
            $scope.data = {
                global: {},
                torrent: {},
                selectedIndex:"",
                stats: {}
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
        };

        $scope.init();
    }]);

    return app;
});