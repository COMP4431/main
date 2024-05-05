    (function(imageproc) {
        "use strict";

        imageproc.errorDither = function(inputData, outputData, colorChannel,ditherMethod) {
            console.log("Applying error dithering...", ditherMethod);

            var errorDiffusionMatrix;
            var divisor;

            switch (ditherMethod) {
                case "Floyd-Steinberg":
                    errorDiffusionMatrix = [
                        [0, 0, 7],
                        [3, 5, 1]
                    ];
                    divisor = 16;
                    break;
                case "Jarvis":
                    errorDiffusionMatrix = [
                        [0, 0, 0, 7, 5],
                        [3, 5, 7, 5, 3],
                        [1, 3, 5, 3, 1]
                    ];
                    divisor = 48;
                    break;
                case "Judice":
                    errorDiffusionMatrix = [
                        [0, 0, 0, 7, 5],
                        [3, 5, 7, 5, 3],
                        [1, 3, 5, 3, 1]
                    ];
                    divisor = 48;
                    break;
                case "Ninke":
                    errorDiffusionMatrix = [
                        [0, 0, 0, 7, 5],
                        [3, 5, 7, 5, 3],
                        [1, 3, 5, 3, 1]
                    ];
                    divisor = 48;
                    break;
                case "Stucki":
                    errorDiffusionMatrix = [
                        [0, 0, 0, 8, 4],
                        [2, 4, 8, 4, 2],
                        [1, 2, 4, 2, 1]
                    ];
                    divisor = 42;
                    break;
                default:
                    console.error("Unsupported dithering method");
                    return;
            }

            // Convert the image to grayscale
            for (let y = 0; y < inputData.height; y++) {
                for (let x = 0; x < inputData.width; x++) {
                    var index = (x + y * inputData.width) * 4;
                    var gray = (inputData.data[index] * 0.299 + inputData.data[index + 1] * 0.587 + inputData.data[index + 2] * 0.114);
                    outputData.data[index] = gray;
                    outputData.data[index + 1] = gray;
                    outputData.data[index + 2] = gray;
                    outputData.data[index + 3] = inputData.data[index + 3]; // Preserve alpha
                }
            }

            // Apply error diffusion
            for (let y = 0; y < inputData.height; y++) {
                for (let x = 0; x < inputData.width; x++) {
                    var index = (x + y * inputData.width) * 4;
                    var oldPixel = outputData.data[index];
                    var newPixel = oldPixel < 128 ? 0 : 255;
                    outputData.data[index] = newPixel;
                    outputData.data[index + 1] = newPixel;
                    outputData.data[index + 2] = newPixel;

                    var quantError = oldPixel - newPixel;

                    for (let i = 0; i < errorDiffusionMatrix.length; i++) {
                        for (let j = 0;j < errorDiffusionMatrix[i].length; j++) {
                            if (errorDiffusionMatrix[i][j] === 0) {
                                continue;
                            }
                            let newX = x + j - Math.floor(errorDiffusionMatrix[i].length / 2);
                            let newY = y + i;
                            if (newX >= 0 && newX < inputData.width && newY < inputData.height) {
                                let newIndex = (newX + newY * inputData.width) * 4;
                                let diffusedError = outputData.data[newIndex] + (quantError * errorDiffusionMatrix[i][j] / divisor);
                                outputData.data[newIndex] = Math.max(0, Math.min(255, diffusedError));
                                outputData.data[newIndex + 1] = Math.max(0, Math.min(255, diffusedError));
                                outputData.data[newIndex + 2] = Math.max(0, Math.min(255, diffusedError));
                            }
                        }
                    }
                }
            }
        };                
}(window.imageproc = window.imageproc || {}));
