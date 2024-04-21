(function(imageproc) {
    "use strict";

    /*
     * Apply sobel edge to the input data
     */
    imageproc.sobelEdge = function(inputData, outputData, threshold) {
        console.log("Applying Sobel edge detection...");

        /* Initialize the two edge kernel Gx and Gy */
        var Gx = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        var Gy = [
            [-1,-2,-1],
            [ 0, 0, 0],
            [ 1, 2, 1]
        ];

        /**
         * TODO: You need to write the code to apply
         * the two edge kernels appropriately
         */
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                var sumXr = 0, sumXg = 0, sumXb = 0;
                var sumYr = 0, sumYg = 0, sumYb = 0;

                // Apply Gx and Gy kernels to pixel and its neighborhood
                for (var j = -1; j <= 1; j++) {
                    for (var i = -1; i <= 1; i++) {
                        var pixel = imageproc.getPixel(inputData, x + i, y + j);
                        var kernelValueX = Gx[j + 1][i + 1];
                        var kernelValueY = Gy[j + 1][i + 1];

                        sumXr += pixel.r * kernelValueX;
                        sumXg += pixel.g * kernelValueX;
                        sumXb += pixel.b * kernelValueX;

                        sumYr += pixel.r * kernelValueY;
                        sumYg += pixel.g * kernelValueY;
                        sumYb += pixel.b * kernelValueY;
                    }
                }

                // Calculate the gradient magnitudes for each channel using Math.hypot
                var magR = Math.hypot(sumXr, sumYr);
                var magG = Math.hypot(sumXg, sumYg);
                var magB = Math.hypot(sumXb, sumYb);

                // Convert the magnitude to grayscale
                var mag = (magR + magG + magB) / 3;

                // Set the output pixel
                var i = (x + y * outputData.width) * 4;
                if (mag > threshold) {
                    outputData.data[i]     = 255;
                    outputData.data[i + 1] = 255;
                    outputData.data[i + 2] = 255;
                } else {
                    outputData.data[i]     = 0;
                    outputData.data[i + 1] = 0;
                    outputData.data[i + 2] = 0;
                }
                outputData.data[i + 3] = 255; // Set the alpha channel
            }
        }
    } 

}(window.imageproc = window.imageproc || {}));
