/**
 * Created by vincent on 2017/3/4.
 */

define("init", ["angular","lodash"], function(angular,_) {
    "use strict";
    var app = angular.module("transmission", []);

    app.factory("ajaxService",["$http","$q",function ($http,$q) {
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
                headers: op.sessionId !== undefined?{"X-Transmission-Session-Id":op.sessionId}:{},
                data: (function () {
                    var param = {};
                    switch (op.method){
                        case "torrent-get":
                            torrentParam.method = op.method;
                            param = torrentParam;
                            break;
                        default:
                            param = {method:op.method};
                            break;
                    }
                    return param;
                })()
            });
            return deferred.promise;
        }

        service.getSession = function (sessionId) {
            return ajax({sessionId:sessionId,method:"session-get"});
        };

        service.getSessionStats = function (sessionId) {
            return ajax({sessionId:sessionId,method:"session-stats"});
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
            return ajax({sessionId:sessionId,method:"torrent-get",param:params});
        };

        service.startTorrent = function (sessionId) {
            return ajax({sessionId:sessionId,method:"torrent-start"});
        };

        service.stopTorrent = function (sessionId) {
            return ajax({sessionId:sessionId,method:"torrent-stop"});
        };

        return service;
    }]);

    app.controller("mainController", ["$scope","$http","$q","ajaxService", function($scope,$http,$q,ajaxService) {
        $scope.greeting = "Hello, world!";

        //获取session
        $scope.getSession = function (session) {
            //获取session
            ajaxService.getSession(session).then(function (response) {
                $scope.data.global = response.data.arguments;
            },function (reason) {
                var str = reason.data;
                var temp = "X-Transmission-Session-Id: ";
                var start = str.indexOf(temp);
                var end = str.indexOf("<\/code>");
                $scope.session = str.substring((start + (temp.length -1)),end);
                $scope.$emit("getSessionDone");
            });
        };

        //获取现在的状态
        $scope.getStatsData = function () {
            //获取session
            ajaxService.getSessionStats($scope.session).then(function (response) {
                $scope.data.stats = response.data.arguments;
                $scope.$emit("getStatsDone");
            },function (reason) {
                console.log("查询stats失败");
            });
        };

        //获取种子数据
        $scope.getTorrentData = function () {
            //获取session
            ajaxService.getTorrent($scope.session).then(function (response) {
                $scope.data.torrent = response.data.arguments.torrents;
            },function (reason) {
                console.log("查询Torrent失败");
            });
        };

        //循环获取种子数据
        $scope.loopGetTorrentData = function () {
            $scope.getTorrentData();
            $scope.pool.torrent = setInterval(function () {
                $scope.getTorrentData();
            },$scope.loopFragment.torrent);
        };

        //循环获取session数据
        $scope.loopGetSessionData = function () {
            $scope.getSession($scope.session);
            $scope.pool.torrent = setInterval(function () {
                $scope.getSession($scope.session);
            },$scope.loopFragment.session);
        };

        $scope.init = function () {
            //数据
            $scope.globalData = {};

            $scope.session = "";

            $scope.loopFragment = {
                torrent:5000,
                session:15000
            };

            $scope.pool = {
                torrent:"",
                session:""
            };

            //数据
            $scope.data = {
                global:{},
                torrent:{},
                stats:{}
            };

            //连续获取seesion
            var loadSession = setInterval(function () {
                $scope.getSession();
            },3000);

            //获取到session后结束循环获取session
            $scope.$on("getSessionDone",function (event) {
                clearInterval(loadSession);

                $scope.loopGetSessionData();

                $scope.getStatsData();
            });

            $scope.$on("getStatsDone",function () {
                $scope.loopGetTorrentData();
            });
        };

        $scope.init();
    }]);

    return app;
});