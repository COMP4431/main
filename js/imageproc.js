(function(imageproc) {
    "use strict";

    var input, output;
    var imageSelector;

    var magnifierRadius = 50;
    var zoomFactor = 3;
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
            var canvas = $("#" + input.canvas.id)[0];
            var ctx = canvas.getContext("2d");
    
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
    
            // Calculate the scaling factor to fit the image within the canvas
            var scaleWidth = canvas.width / image.width;
            var scaleHeight = canvas.height / image.height;
            var scale = Math.min(scaleWidth, scaleHeight); // Use the smaller scale factor to ensure the entire image fits
    
            // Calculate the top left position to center the image
            var x = (canvas.width / 2) - (image.width * scaleWidth / 2);
            var y = (canvas.height / 2) - (image.height * scaleHeight / 2);
    
            // Draw the image scaled and centered
            ctx.drawImage(image, x, y, image.width * scaleWidth, image.height * scaleHeight);
        };
        image.src = "images/" + imageSelector.val(); // Make sure the path is correct
    };
    

    // Initialize the magnifying glass on the output canvas
    imageproc.initMagnifier = function(outputCanvasId, outputImage) {
        var canvas = document.getElementById(outputCanvasId);
        var context = canvas.getContext('2d');
    
        function refreshCanvas() {
            context.putImageData(outputImage, 0, 0);
        }
    
        canvas.addEventListener('mousemove', function(e) {
            var bounds = canvas.getBoundingClientRect();
            var mouseX = e.clientX - bounds.left;
            var mouseY = e.clientY - bounds.top;
    
            // Calculate scale factors
            var scaleX = canvas.width / bounds.width;
            var scaleY = canvas.height / bounds.height;
    
            // Adjust magnifier radius based on scaling
            var adjustedRadiusX = magnifierRadius * scaleX;
            var adjustedRadiusY = magnifierRadius * scaleY;
    
            // Clear and redraw base image
            refreshCanvas();
    
            // Set up magnification
            context.save();
            context.beginPath();
            // Use ellipse for correct aspect ratio
            context.ellipse(mouseX, mouseY, adjustedRadiusX, adjustedRadiusY, 0, 0, Math.PI * 2, true);
            context.strokeStyle = 'black';
            context.stroke();
            context.closePath();
            context.clip();
    
            // Adjust source rectangle to avoid out-of-bounds issues
            var sourceX = Math.max(0, mouseX - (adjustedRadiusX / zoomFactor));
            var sourceY = Math.max(0, mouseY - (adjustedRadiusY / zoomFactor));
            var sourceWidth = Math.min(canvas.width - sourceX, adjustedRadiusX * 2 / zoomFactor);
            var sourceHeight = Math.min(canvas.height - sourceY, adjustedRadiusY * 2 / zoomFactor);
    
            context.drawImage(canvas,
                sourceX, sourceY, sourceWidth, sourceHeight,
                mouseX - adjustedRadiusX, mouseY - adjustedRadiusY,
                adjustedRadiusX * 2, adjustedRadiusY * 2);
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

        console.log("outputId:",outputId);

        // Get the input image and create the output image buffer
        var inputImage = input.getImageData(0, 0, input.canvas.clientWidth, input.canvas.clientHeight);        
        var outputCanvas = $("#" + outputId).get(0).getContext("2d");
        // Create a new imageData object that matches the size of the output canvas
        var outputImage = outputCanvas.createImageData(outputCanvas.canvas.width, outputCanvas.canvas.height);
        console.log("outputImage:",outputCanvas.canvas.width,outputCanvas.canvas.height);

        // Resize the input image to fit the output canvas - to convert the image into htmlelement to process
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

        imageproc.initMagnifier(outputId,outputImage);
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

    imageproc.fromRGBToHSV2 = function(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max === min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6; // converting from 0-6 to 0-1
        }

        // Scale h, s, and v to the range 0-255
        h = Math.round(h * 255);
        s = Math.round(s * 255);
        v = Math.round(v * 255);

        return {h: h, s: s, v: v};
    };

    imageproc.fromHSVToRGB2 = function(h, s, v) {
        h /= 255; // scale h back from 0-255 to 0-1
        s /= 255; // scale s back from 0-255 to 0-1
        v /= 255; // scale v back from 0-255 to 0-1

        var r, g, b;
        var i = Math.floor(h * 6);
        var f = h * 6 - i;
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

        // Convert back to 0-255 range
        r = Math.round(r * 255);
        g = Math.round(g * 255);
        b = Math.round(b * 255);

        return {r: r, g: g, b: b};
    };

    imageproc.fromRGBToCMYK = function(r, g, b) {
        let c = 255 - r;
        let m = 255 - g;
        let y = 255 - b;
        let k = Math.min(c, m, y);

        if (k != 255) {
            c = ((c - k) / (255 - k)) * 255;
            m = ((m - k) / (255 - k)) * 255;
            y = ((y - k) / (255 - k)) * 255;
        } else {
            c = 0;
            m = 0;
            y = 0;
        }

        return {c: Math.round(c), m: Math.round(m), y: Math.round(y), k: Math.round(k)};
    };

    imageproc.fromCMYKToRGB = function(c, m, y, k) {
        c = (c * (255 - k) / 255) + k;
        m = (m * (255 - k) / 255) + k;
        y = (y * (255 - k) / 255) + k;

        let r = 255 - c;
        let g = 255 - m;
        let b = 255 - y;

        return {r: Math.round(r), g: Math.round(g), b: Math.round(b)};
    };
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
