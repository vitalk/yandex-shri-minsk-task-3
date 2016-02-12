(function () {
    var video = document.querySelector('.camera__video'),
        canvas = document.querySelector('.camera__canvas');

    var getVideoStream = function (callback) {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function (e) {
                        video.play();

                        callback();
                    };
                },
                function (err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };

    var applyFilterToPixel = function (pixel) {
        var filters = {
            invert: function (pixel) {
                pixel[0] = 255 - pixel[0];
                pixel[1] = 255 - pixel[1];
                pixel[2] = 255 - pixel[2];

                return pixel;
            },
            grayscale: function (pixel) {
                var r = pixel[0];
                var g = pixel[1];
                var b = pixel[2];
                var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                pixel[0] = pixel[1] = pixel[2] = v;

                return pixel;
            },
            threshold: function (pixel) {
                var r = pixel[0];
                var g = pixel[1];
                var b = pixel[2];
                var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 128) ? 255 : 0;
                pixel[0] = pixel[1] = pixel[2] = v;

                return pixel;
            }
        };

        var filterName = document.querySelector('.controls__filter').value;

        return filters[filterName](pixel);
    };

    var applyFilter = function () {
        var pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height),
            d = pixels.data,
            pixel;

        for (var i = 0, len = d.length; i < len; i+=4) {
            pixel  = applyFilterToPixel([d[i], d[i+1], d[i+2]]);
            d[i]   = pixel[0];
            d[i+1] = pixel[1];
            d[i+2] = pixel[2];
        }

        canvas.getContext('2d').putImageData(pixels, 0, 0);
    };

    var captureFrame = function () {
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        applyFilter();
        requestAnimationFrame(captureFrame);
    };

    getVideoStream(function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        captureFrame();
    });
})();
