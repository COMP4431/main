(function(imageproc) {
    "use strict";

    var input, output;
    var imageSelector;

    imageproc.operation = null;

    /*
     * Init the module and update the input image
     */
    imageproc.init = function(inputCanvasId,
                              outputCanvasId,
                              inputImageId) {
        input  = $("#" + inputCanvasId).get(0).getContext("2d");
        output = $("#" + outputCanvasId).get(0).getContext("2d");

        imageSelector = $("#" + inputImageId);
        imageproc.updateInputImage();
    }

    /*
     * Update the input image canvas
     */
    imageproc.updateInputImage = function() {
        var image = new Image();
        image.onload = function () {
            input.drawImage(image, 0, 0);
        }
        image.src = "images/" + imageSelector.val();
    }

    var magnifierRadius = 50;
    var zoomFactor = 2;
    var tempCanvas2 = document.createElement('canvas');
    var tempCtx2 = tempCanvas2.getContext('2d');

    // Initialize the magnifying glass on the output canvas
    imageproc.initMagnifier = function(outputCanvasId) {
        var canvas = document.getElementById(outputCanvasId);
        console.log("canvas_magnified:",canvas);
        console.log(canvas.width,canvas.height);
        var context = canvas.getContext('2d');
        
        function refreshCanvas() {
            console.log("refreshCanvas");
            context.clearRect(0, 0, canvas.width, canvas.height);
            console.log("tempCanvas2:",tempCanvas2);
            context.drawImage(tempCanvas2, 0, 0, canvas.width, canvas.height);
        }

        canvas.addEventListener('mousemove', function(e) {
            var bounds = canvas.getBoundingClientRect();
            var mouseX = e.clientX - bounds.left;
            var mouseY = e.clientY - bounds.top;

            // Adjust temporary canvas size
            tempCanvas2.width = canvas.width;
            console.log("tempCanvas.width:",tempCanvas2.width);
            tempCanvas2.height = canvas.height;
            console.log("tempCanvas.height:",tempCanvas2.height);
            tempCtx2.drawImage(canvas, 0, 0);

            // Clear and redraw base image
            refreshCanvas();

            // Set up magnification
            context.save();
            context.beginPath();
            context.arc(mouseX, mouseY, magnifierRadius, 0, Math.PI * 2, true);
            context.closePath();
            context.clip();

            // Adjust source rectangle to avoid out-of-bounds issues
            var sourceX = Math.max(0, mouseX - magnifierRadius / zoomFactor);
            var sourceY = Math.max(0, mouseY - magnifierRadius / zoomFactor);
            var sourceWidth = magnifierRadius * 2 / zoomFactor;
            var sourceHeight = magnifierRadius * 2 / zoomFactor;

            // Draw magnified content
            context.drawImage(tempCanvas2,
                sourceX, sourceY, sourceWidth, sourceHeight,
                mouseX - magnifierRadius, mouseY - magnifierRadius,
                magnifierRadius * 2, magnifierRadius * 2);

            context.restore();
        });
        canvas.addEventListener('mouseleave', function() {
            refreshCanvas();
        });
    };
    /*
     * Apply an image processing operation to an input image and
     * then put the output image in the output canvas
     */
    imageproc.apply = function(outputId) {
        // Get the input image and create the output image buffer
        var inputImage = input.getImageData(0, 0,
                         input.canvas.clientWidth, input.canvas.clientHeight);
        console.log("outputId:",outputId);
        var outputCanvas = $("#" + outputId).get(0).getContext("2d");
        // Create a new imageData object that matches the size of the output canvas
        var outputImage = outputCanvas.createImageData(outputCanvas.canvas.width, outputCanvas.canvas.height);
        console.log("outputImage:",outputCanvas.canvas.width,outputCanvas.canvas.height);
        // Resize the input image to fit the output canvas
        var tempCanvas = document.createElement("canvas");
        var tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = input.canvas.width;
        tempCanvas.height = input.canvas.height;
        tempCtx.putImageData(inputImage, 0, 0);
        console.log("tempCanvas:",tempCanvas.width,tempCanvas.height);

        // Draw the resized image on the output canvas
        outputCanvas.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, outputCanvas.canvas.width, outputCanvas.canvas.height);

        // Now get the resized image data from the output canvas
        var resizedImageData = outputCanvas.getImageData(0, 0, outputCanvas.canvas.width, outputCanvas.canvas.height);

        if (imageproc.operation) {
            // Apply the operation
            imageproc.operation(resizedImageData, outputImage, customMatrix);

        }

        // Put the output image in the canvas
        outputCanvas.putImageData(outputImage, 0, 0);

        //imageproc.initMagnifier(outputId);
    }

    /*
     * Convert RGB to HSV
     * Modified from https://gist.github.com/mjackson/5311256
     */
    imageproc.fromRGBToHSV = function(r, g, b) {
        r /= 255, g /= 255, b /= 255;

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max == 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h *= 60;
        }

        return {"h": h, "s": s, "v": v};
    }

    /*
     * Convert HSV to RGB
     * Modified from https://gist.github.com/mjackson/5311256
     */
    imageproc.fromHSVToRGB = function(h, s, v) {
        var r, g, b;

        var i = Math.floor(h / 60.0);
        var f = h / 60.0 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return {"r": Math.round(r * 255),
                "g": Math.round(g * 255),
                "b": Math.round(b * 255)};
    }

    /*
     * Get a pixel colour from an ImageData object
     * 
     * The parameter border can be either "extend" (default) and "wrap"
     */
    imageproc.getPixel = function(imageData, x, y, border) {
        // Handle the boundary cases
        if (x < 0)
            x = (border=="wrap")? imageData.width + (x % imageData.width) : 0;
        if (x >= imageData.width)
            x = (border=="wrap")? x % imageData.width : imageData.width - 1;
        if (y < 0)
            y = (border=="wrap")? imageData.height + (y % imageData.height) : 0;
        if (y >= imageData.height)
            y = (border=="wrap")? y % imageData.height : imageData.height - 1;

        var i = (x + y * imageData.width) * 4;
        return {
            r: imageData.data[i],
            g: imageData.data[i + 1],
            b: imageData.data[i + 2],
            a: imageData.data[i + 3]
        };
    }

    /*
     * Get an empty buffer of the same size as the image dat
     */
    imageproc.createBuffer = function(imageData) {
        // Create the buffer
        var buffer = {
            width: imageData.width,
            height: imageData.height,
            data: []
        };

        // Initialize the buffer
        for (var i = 0; i < imageData.data.length; i+=4) {
            buffer.data[i]     = 0;
            buffer.data[i + 1] = 0;
            buffer.data[i + 2] = 0;
            buffer.data[i + 3] = 255;
        }

        return buffer;
    }

    /*
     * Copy a source data to an destination data
     */
    imageproc.copyImageData = function(src, dest) {
        if (src.data.length != dest.data.length)
            return;

        // Copy the data
        for (var i = 0; i < src.data.length; i+=4) {
            dest.data[i]     = src.data[i];
            dest.data[i + 1] = src.data[i + 1];
            dest.data[i + 2] = src.data[i + 2];
            dest.data[i + 3] = src.data[i + 3];
        }
    }
 
}(window.imageproc = window.imageproc || {}));
