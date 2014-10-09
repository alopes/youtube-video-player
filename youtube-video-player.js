(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('jquery'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals (root is window)
        root.YouTubeVideoPlayer = factory(root.$);
    }
}(this, function ($) {
    var OPTIONS = {
        width:      '855',
        height:     '515',
        q:          'hd720',
        playerVars: {
            'autoplay': 0,
            'loop':     0,
            'showinfo': 0,
            'controls': 1,
            'rel':      0,
            'autohide': 1
        }
    };

    var ytDeferred;

    function YouTubeVideoPlayer(options) {
        this.options = $.extend({}, OPTIONS, options);
        this.eventBus = $({});
    }

    YouTubeVideoPlayer.prototype.setup = function() {
        var self = this;
        setupEvents.call(this);

        YouTubeVideoPlayer.loadApi().done(function(){
            self.playerApi = new YT.Player(self.options.id, self.options);
        });
    };

    YouTubeVideoPlayer.prototype.play = function(videoUrl) {
        // Autoplay does not work on mobile devices, as such we can only cue the
        // video in the player and then wait for user-interaction to press the
        // play button directly.
        if (NOTHS.FeatureDetection.autoPlayVideo) {
            this.playerApi.loadVideoByUrl(videoUrl);
        } else {
            this.playerApi.cueVideoByUrl(videoUrl);
        }
    };

    YouTubeVideoPlayer.prototype.pause = function() {
        this.playerApi.pauseVideo();
    };

    YouTubeVideoPlayer.prototype.getEl = function() {
        return $("<div />", {
            "id": this.options.id
        });
    };

    YouTubeVideoPlayer.prototype.on = function(eventName, callback) {
        this.eventBus.on(eventName, callback);
    };

    YouTubeVideoPlayer.prototype.trigger = function(eventName) {
        this.eventBus.trigger(eventName);
    };

    YouTubeVideoPlayer.loadApi = function() {
        if (ytDeferred) return ytDeferred;

        ytDeferred = $.Deferred();

        if (typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined') {
            $.getScript('//www.youtube.com/iframe_api');

            window.onYouTubeIframeAPIReady = function() {
                ytDeferred.resolve();
            };
        }

        return ytDeferred;
    };

    var setupEvents = function() {
        var self = this;

        this.options.events = {
            onStateChange: function(event) {
                switch(event.data) {
                    case YT.PlayerState.ENDED:
                        self.trigger("ended");
                    break;
                }
            }
        };
    };

    return YouTubeVideoPlayer;
}));
