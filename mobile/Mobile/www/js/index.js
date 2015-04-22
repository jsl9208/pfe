/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        $(function() {
            var deviceID = device.uuid;
            $('.uuid').html(deviceID);
            var cnt = 0;
            var addr = 'ws://192.168.42.1:8081';
            var oscPort = new osc.WebSocketPort({
                url: addr // URL to your Web Socket server.
            });
            oscPort.open();
            // try {
            //     setInterval(function() {
            //         oscPort.send({
            //             timeTag: osc.timeTag(60), // Schedules this bundle 60 seconds from now.
            //             packets: [
            //                 {
            //                     address: "/carrier/frequency",
            //                     args: 440
            //                 },
            //                 {
            //                     address: "/carrier/amplitude",
            //                     args: 0.5
            //                 }
            //             ]
            //         });
            //     }, 500);
            // } catch (err) {
            //     alert(err);
            // }
                
            // var socket = new WebSocket(addr, 'manticore');

            // var onopen = function() {
            setTimeout(function() {
                // };
                var onSuccess = function (acceleration) {
                    $('.show').html('Acceleration X: ' + acceleration.x + '<br>' + 'Acceleration Y: ' + acceleration.y + '<br>' + 'Acceleration Z: ' + acceleration.z + '<br>' + 'Timestamp: '      + acceleration.timestamp + '<br>');
                    if (oscPort.readyState === oscPort.OPEN) {
                        oscPort.send({
                            timeTag: osc.timeTag(60), 
                            packets: [
                                {
                                    address: "/acceleration/x",
                                    args: acceleration.x
                                },
                                {
                                    address: "/acceleration/y",
                                    args: acceleration.y
                                },
                                {
                                    address: "/acceleration/z",
                                    args: acceleration.z
                                },
                                {
                                    address: "/mobile/id",
                                    args: deviceID
                                }
                            ]
                        });
                        cnt++;
                        $('.count').html(cnt);
                    } else {
                        delete oscPort;
                        oscPort = new osc.WebSocketPort({
                            url: addr // URL to your Web Socket server.
                        });
                        oscPort.open()
                    }
                };
                var watchID = navigator.accelerometer.watchAcceleration(onSuccess, function() {}, { frequency: 200 });
            }, 1000);
            
            // socket.onopen = onopen;
        });
    },
};
