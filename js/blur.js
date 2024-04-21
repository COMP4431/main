(function(imageproc) {
    "use strict";

    /*
     * Apply blur to the input data
     */
    imageproc.blur = function(inputData, outputData, kernelSize) {
        console.log("Applying blur...");

        // You are given a 3x3 kernel but you need to create a proper kernel
        // using the given kernel size
        
        // Initialize the kernel and the divisor
        var kernel;
        var divisor;
        console.log("kernelszie:",kernelSize)
        // Determine the kernel to use based on the kernelSize parameter
        switch (kernelSize) {
            case 3:
                kernel = [ [1, 1, 1], [1, 1, 1], [1, 1, 1] ];
                divisor = 9;
                break;
            case 5:
                kernel = [ [1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1] ];
                divisor = 25;
                break;
            case 7:
                kernel = [ [1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1] ];
                divisor = 49;
                break;
            case 9:
                kernel = [ [1, 1, 1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1, 1, 1] ];
                divisor = 81;
                break;
            default:
                console.log("Invalid kernel size");
                return;
        }


        /**
         * TODO: You need to extend the blur effect to include different
         * kernel sizes and then apply the kernel to the entire image
         */

        // Apply the kernel to the whole image
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                var redSum = 0, greenSum = 0, blueSum = 0;
        
                // Loop over the kernel
                for (var j = 0; j < kernelSize; j++) {
                    for (var i = 0; i < kernelSize; i++) {
                        // Calculate the correct x and y coordinates to read the pixel value
                        var pixelX = x + (i - Math.floor(kernelSize / 2));
                        var pixelY = y + (j - Math.floor(kernelSize / 2));
                        var pixel = imageproc.getPixel(inputData, pixelX, pixelY);
                        
                        // Get the kernel value at the current position
                        var kernelValue = kernel[j][i];
        
                        // Accumulate the sum for each color channel
                        redSum += pixel.r * kernelValue;
                        greenSum += pixel.g * kernelValue;
                        blueSum += pixel.b * kernelValue;
                    }
                }
                // Then set the blurred result to the output data
                
                var i = (x + y * outputData.width) * 4;
                outputData.data[i]     = redSum/divisor;
                outputData.data[i + 1] = greenSum/divisor;
                outputData.data[i + 2] = blueSum/divisor;
            }
        }
    } 

}(window.imageproc = window.imageproc || {}));
