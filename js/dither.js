(function(imageproc) {
    "use strict";

    /*
     * Apply ordered dithering to the input data
     */
    imageproc.dither = function(inputData, outputData, matrixType) {
        console.log("Applying dithering...");

        /*
         * TODO: You need to extend the dithering processing technique
         * to include multiple matrix types
         */

        // At the moment, the code works only for the Bayer's 2x2 matrix
        // You need to include other matrix types
  
        // Set up the matrix
        var matrix, levels;

        switch (matrixType) {
            case "bayer2":
            matrix = [ [1, 3], [4, 2] ];
            levels = 5;
            break;

            case "bayer4":
            matrix = [[1,9,3,11],[13,5,15,7],[4,12,2,10],[16,8,14,6]];
            levels = 17;
            break;

            case "line":
            matrix = [[3,3,3,5],
                      [3,3,5,3],
                      [3,5,3,3],
                      [5,3,3,3]];
            levels = 20;
            break;
            case "diamond":
            matrix = [[ 3,3,5,3,3],
                      [3,5,3,5,3],
                      [5,3,1,3,5],
                      [3,5,3,5,3 ]
                      [3,3,5,3,3]];
            levels = 16;
            break;

            default:
            console.log("Invalid matrix type");
            return;
        }



        // The following code uses Bayer's 2x2 matrix to create the
        // dithering effect. You need to extend it to work for different
        // matrix types
        console.log("matrix",matrix);
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                var pixel = imageproc.getPixel(inputData, x, y);

                // Change the colour to grayscale and normalize it
                var value = (pixel.r + pixel.g + pixel.b) / 3;
                value = value / 255 * levels;

                // Get the corresponding threshold of the pixel
                var row = matrix.length;
                var coloumn = matrix[0].length;
                //console.log("row",row, "coloumn",coloumn);
                var threshold = matrix[y % row][x % coloumn];

                // Set the colour to black or white based on threshold
                var i = (x + y * outputData.width) * 4;
                outputData.data[i]     = (value < threshold)? 0 : 255
                outputData.data[i + 1] = (value < threshold)? 0 : 255
                outputData.data[i + 2] = (value < threshold)? 0 : 255;
            }
        }
    }
 
}(window.imageproc = window.imageproc || {}));
