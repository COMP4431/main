(function(imageproc) {
    "use strict";

    /*
     * Apply negation to the input data
     */
    imageproc.negation = function(inputData, outputData) {
        console.log("Applying negation...");

        for (var i = 0; i < inputData.data.length; i += 4) {
            outputData.data[i]     = 255 - inputData.data[i];
            outputData.data[i + 1] = 255 - inputData.data[i + 1];
            outputData.data[i + 2] = 255 - inputData.data[i + 2];
        }
    }

    /*
     * Convert the input data to grayscale
     */
    imageproc.grayscale = function(inputData, outputData) {
        console.log("Applying grayscale...");

        /**
         * TODO: You need to create the grayscale operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Find the grayscale value using simple averaging
           
            // Change the RGB components to the resulting value
            var grayscale = Math.round((inputData.data[i] + inputData.data[i + 1] + inputData.data[i + 2]) / 3);
            //console.log(grayscale);
            outputData.data[i]     = grayscale;
            outputData.data[i + 1] = grayscale;
            outputData.data[i + 2] = grayscale;
        }
    }

    /*
     * Applying brightness to the input data
     */
    imageproc.brightness = function(inputData, outputData, offset) {
        console.log("Applying brightness...");

        /**
         * TODO: You need to create the brightness operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Change the RGB components by adding an offset
            //handle clipping of the RGB components
            for (var j = 0; j<3; j++) {
                if (inputData.data[i+j] + offset > 255) 
                    { outputData.data[i+j] = 255; }
                else if (inputData.data[i+j] + offset < 0) 
                    { outputData.data[i+j] = 0; }
                else { outputData.data[i+j] = inputData.data[i+j] + offset; }
            }
        }
    }   
    /*
     * Applying contrast to the input data
     */
    imageproc.contrast = function(inputData, outputData, factor) {
        console.log("Applying contrast...");

        /**
         * TODO: You need to create the brightness operation here
         */

        // var contrast_factor = parseFloat($("#contrast-factor").val());
        // console.log(contrast_factor);

        for (var i = 0; i < inputData.data.length; i += 4) {
            //handle clipping of the RGB components
            for (var j = 0; j<3; j++) {
                if (inputData.data[i+j] * factor > 255) 
                    { outputData.data[i+j] = 255; }
                else if (inputData.data[i+j] * factor < 0) 
                    { outputData.data[i+j] = 0; }
                else { outputData.data[i+j] = inputData.data[i+j] * factor; }
        }
        }
    }

    /*
     * Make a bit mask based on the number of MSB required
     */
    function makeBitMask(bits) {
        var mask = 0;
        for (var i = 0; i < bits; i++) {
            mask >>= 1;
            mask |= 128;
        }
        return mask;
    }

    /*
     * Apply posterization to the input data
     */
    imageproc.posterization = function(inputData, outputData,
                                       redBits, greenBits, blueBits) {
        console.log("Applying posterization...");
        console.log(redBits, greenBits, blueBits);
        /**
         * TODO: You need to create the posterization operation here
         */

        // Create the red, green and blue masks
        // A function makeBitMask() is already given

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Apply the bitmasks onto the RGB channels
            
            outputData.data[i]     = inputData.data[i] & makeBitMask(redBits);
            outputData.data[i + 1] = inputData.data[i + 1] & makeBitMask(greenBits);
            outputData.data[i + 2] = inputData.data[i + 2] & makeBitMask(blueBits); 
        }
    }

    /*
     * Apply threshold to the input data
     */
    imageproc.threshold = function(inputData, outputData, thresholdValue) {
        console.log("Applying thresholding...");

        /**
         * TODO: You need to create the thresholding operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Find the grayscale value using simple averaging
            // You will apply thresholding on the grayscale value
           
            // Change the colour to black or white based on the given threshold
            var grayscale = Math.round((inputData.data[i] + inputData.data[i + 1] + inputData.data[i + 2]) / 3);
            var threshold_val = grayscale > thresholdValue ? 255 : 0;
            outputData.data[i]     = threshold_val;
            outputData.data[i + 1] = threshold_val;
            outputData.data[i + 2] = threshold_val;
        }
    }

    /*
     * Build the histogram of the image for a channel
     */
    function buildHistogram(inputData, channel) {
        var histogram = [];
        for (var i = 0; i < 256; i++)
            histogram[i] = 0;

        /**
         * TODO: You need to build the histogram here
         */

        // Accumulate the histogram based on the input channel
        // The input channel can be:
        // "red"   - building a histogram for the red component
        // "green" - building a histogram for the green component
        // "blue"  - building a histogram for the blue component
        // "gray"  - building a histogram for the intensity
        //           (using simple averaging)
        console.log("channel:",channel);
        switch (channel) {
            case "red":
                for (var i = 0; i < inputData.data.length; i += 4) {
                    histogram[inputData.data[i]]++;
                }
                break;
            case "green":
                for (var i = 0; i < inputData.data.length; i += 4) {
                    histogram[inputData.data[i+1]]++;
                }
                break;
            case "blue":
                for (var i = 0; i < inputData.data.length; i += 4) {
                    histogram[inputData.data[i+2]]++;
                }
                break;
            case "gray":
                for (var i = 0; i < inputData.data.length; i += 4) {
                    var grayscale = math.round((inputData.data[i] + inputData.data[i + 1] + inputData.data[i + 2]) / 3);
                    histogram[grayscale]++;
                }
                break;
            default:
                console.log("Invalid channel");
                return;
        }
        console.log(histogram);
        return histogram;
    }

    /*
     * Find the min and max of the histogram
     */
    function findMinMax(histogram, pixelsToIgnore) {
        var min = 0, max = 255;

        /**
         * TODO: You need to build the histogram here
         */

        // Find the minimum in the histogram with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore
        var accumulated = 0;
        for (min = 0; min < 255; min++) {
            accumulated += histogram[min];
            if (accumulated > pixelsToIgnore)
                break;
        }

        // Find the maximum in the histogram with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore
        var accumulated_2 = 0;
        for (max = 255-1; max >= 0; max--) {
            accumulated_2 += histogram[max];
            if (accumulated_2 > pixelsToIgnore)
                break;
        }

        console.log("min",min, "max",max);
        return {"min": min, "max": max};
    }

    /*
     * Apply automatic contrast to the input data
     */
    imageproc.autoContrast = function(inputData, outputData, type, percentage) {
        console.log("Applying automatic contrast...");

        // Find the number of pixels to ignore from the percentage
        var pixelsToIgnore = (inputData.data.length / 4) * percentage;

        var histogram, minMax;
        if (type == "gray") {
            // Build the grayscale histogram
            histogram = buildHistogram(inputData, "gray");

            // Find the minimum and maximum grayscale values with non-zero pixels
            minMax = findMinMax(histogram, pixelsToIgnore);

            var min = minMax.min, max = minMax.max, range = max - min;

            /**
             * TODO: You need to apply the correct adjustment to each pixel
             */
            var factor = 1/range*255;
            console.log("factor",factor);
            for (var i = 0; i < inputData.data.length; i += 4) {
            // Adjust each pixel based on the minimum and maximum values
            var grayscale = Math.round((inputData.data[i] + inputData.data[i + 1] + inputData.data[i + 2]) / 3);
            var adjusted = ((grayscale - min) * factor);
            adjusted = adjusted < 0 ? 0 : adjusted > 255 ? 255 : adjusted;
            outputData.data[i] = adjusted;
            outputData.data[i + 1] = adjusted;
            outputData.data[i + 2] = adjusted;
            outputData.data[i + 3] = inputData.data[i + 3];
            }
        }
        else {

            /**
             * TODO: You need to apply the same procedure for each RGB channel
             *       based on what you have done for the grayscale version
             */

            ["red", "green", "blue"].forEach((channel, color_offset) =>  {
                histogram = buildHistogram(inputData, channel);

                minMax = findMinMax(histogram, pixelsToIgnore);

                var min = minMax.min, max = minMax.max, range = max - min;

                // Apply the adjustment to each pixel in the current channel
                var factor = 1 / range * 255;
                for (var i = 0; i < inputData.data.length; i += 4) {
                    var value = inputData.data[i + color_offset];
                    var adjusted = ((value - min) * factor); 
                    adjusted = adjusted < 0 ? 0 : adjusted > 255 ? 255 : adjusted; 
                    outputData.data[i + color_offset] = adjusted;
                }
            });
            for (let i = 3; i < inputData.data.length; i += 4) {
                outputData.data[i] = inputData.data[i];
            }

        }
    }

}(window.imageproc = window.imageproc || {}));
