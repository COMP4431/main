(function(imageproc) {
    "use strict";

    imageproc.kuwahara = function(inputData, outputData, size) {
        console.log("Applying Kuwahara filter...");

        var subRegionSize;
        switch (size) {
            case 5:
                subRegionSize = 3;
                break;
            case 9:
                subRegionSize = 5;
                break;
            case 13:
                subRegionSize = 7;
                break;
            default:
                console.log("Invalid filter size");
                return;
        }

        function regionStat(x, y, subRegionSize) {
            var meanR = 0, meanG = 0, meanB = 0;
            var meanValue = 0;
            var variance = 0;
            var count = 0;
            var halfSize = Math.floor(subRegionSize / 2);

            for (var j = -halfSize; j <= halfSize; j++) {
                for (var i = -halfSize; i <= halfSize; i++) {
                    var pixel = imageproc.getPixel(inputData, x + i, y + j);
                    meanR += pixel.r;
                    meanG += pixel.g;
                    meanB += pixel.b;
                    meanValue += (pixel.r + pixel.g + pixel.b) / 3;
                    count++;
                }
            }
            meanR /= count;
            meanG /= count;
            meanB /= count;
            meanValue /= count;

            for (var j = -halfSize; j <= halfSize; j++) {
                for (var i = -halfSize; i <= halfSize; i++) {
                    var pixel = imageproc.getPixel(inputData, x + i, y + j);
                    var value = (pixel.r + pixel.g + pixel.b) / 3;
                    variance += Math.pow(value - meanValue, 2);
                }
            }
            variance /= count;

            return { mean: {r: meanR, g: meanG, b: meanB}, variance: variance };
        }

        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                var regionA = regionStat(x, y, subRegionSize);
                var regionB = regionStat(x + subRegionSize - 1, y, subRegionSize);
                var regionC = regionStat(x, y + subRegionSize - 1, subRegionSize);
                var regionD = regionStat(x + subRegionSize - 1, y + subRegionSize - 1, subRegionSize);

                var minV = Math.min(regionA.variance, regionB.variance, regionC.variance, regionD.variance);
                var i = (x + y * inputData.width) * 4;

                switch (minV) {
                    case regionA.variance:
                        outputData.data[i] = regionA.mean.r;
                        outputData.data[i + 1] = regionA.mean.g;
                        outputData.data[i + 2] = regionA.mean.b;
                        break;
                    case regionB.variance:
                        outputData.data[i] = regionB.mean.r;
                        outputData.data[i + 1] = regionB.mean.g;
                        outputData.data[i + 2] = regionB.mean.b;
                        break;
                    case regionC.variance:
                        outputData.data[i] = regionC.mean.r;
                        outputData.data[i + 1] = regionC.mean.g;
                        outputData.data[i + 2] = regionC.mean.b;
                        break;
                    case regionD.variance:
                        outputData.data[i] = regionD.mean.r;
                        outputData.data[i + 1] = regionD.mean.g;
                        outputData.data[i + 2] = regionD.mean.b;
                }
                outputData.data[i + 3] = 255;  // Ensure alpha is set to 255
            }
        }
    }
}(window.imageproc = window.imageproc || {}));
