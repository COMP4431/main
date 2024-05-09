






(function(imageproc) {
        "use strict";

        imageproc.errorDither = function(inputData, outputData, colorSystem, ditherMethod, customMatrix) {
            console.log("Applying error dithering...", ditherMethod);
            // console.log("error dithering Matrix:",customMatrix);
            console.log("colorCahnnel: ", colorSystem);
            var errorDiffusionMatrix;
            var divisor;

            // get the errorDiffusionMatrix and the divisor accroding to the ditherMethod
            switch (ditherMethod) {
                case "Floyd-Steinberg":
                    errorDiffusionMatrix = [
                        [0, 0, 7],
                        [3, 5, 1]
                    ];
                    divisor = 16;
                    break;
                case "Jarvis-Judice-Ninke":
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
                case "Customized":
                    var allZero = true;
                    // Convert string values to integers in customMatrix
                    for (let i = 0; i < customMatrix.length; i++) {
                        for (let j = 0; j < customMatrix[i].length; j++) {
                            customMatrix[i][j] = parseInt(customMatrix[i][j]);
                        }
                    }
                    errorDiffusionMatrix = customMatrix.slice();
                    for (var i = 0; i < customMatrix.length; i++) {
                        for (var j = 0; j < customMatrix[i].length; j++) {
                            if (customMatrix[i][j] != 0) {
                                allZero = false;
                                break;
                            }
                        }
                        if (!allZero) {
                            break;
                        }
                    }
                    // If all values are zero, display an error message and stop
                    if (allZero) {
                        console.error("All values in the custom matrix are zero.");
                        return;
                    }
                    // Use customMatrix in your processing logic
                    // console.log("Custom matrix:", customMatrix);
                    let sum = 0;
                    customMatrix.forEach(row => {
                        row.forEach(cell => {
                            sum += parseInt(cell); // Add cell value to sum
                        });
                    });
                    console.log("Sum of the matrix:", sum);
                    divisor = sum;
                    break;
                default:
                    console.error("Unsupported dithering method");
                    return;
            }

            function makeBitMask(bits) {
                var mask = 0;
                for (var i = 0; i < bits; i++) {
                    mask >>= 1;
                    mask |= 128;
                }
                return mask;
            }

            function  errorDiffusionDither(colorChannel, colorSystem, Bits){
                // Apply error diffusion
                for (let y = 0; y < inputData.height; y++) {
                    for (let x = 0; x < inputData.width; x++) {
                        var index = (x + y * inputData.width) * 4;
                        var oldPixel = outputData.data[index+colorChannel];
                        //var newPixel = oldPixel < 128 ? 0 : 255;
                        if (colorSystem == "gray"){
                            var newPixel = oldPixel < 128 ? 0 : 255;
                        }
                        else{
                            var newPixel = oldPixel & makeBitMask(Bits);
                        };
                        outputData.data[index+ colorChannel] = newPixel;
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
                                    let diffusedError = outputData.data[newIndex+colorChannel] + (quantError * errorDiffusionMatrix[i][j] / divisor);
                                    outputData.data[newIndex+colorChannel] = Math.max(0, Math.min(255, diffusedError));
                                }
                            }
                        }
                    }
                }
            };

            // get the image to process accroding to different color system
            switch(colorSystem){
                case "gray":
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
                    errorDiffusionDither(0, colorSystem);
                    errorDiffusionDither(1, colorSystem);
                    errorDiffusionDither(2, colorSystem);
                    break;
                case "rgb":
                    // Keep the image in RGB format
                    for (let y = 0; y < inputData.height; y++) {
                        for (let x = 0; x < inputData.width; x++) {
                            var index = (x + y * inputData.width) * 4;
                            //var gray = (inputData.data[index] * 0.299 + inputData.data[index + 1] * 0.587 + inputData.data[index + 2] * 0.114);
                            outputData.data[index] = inputData.data[index];
                            outputData.data[index + 1] = inputData.data[index + 1];
                            outputData.data[index + 2] = inputData.data[index + 2];
                            outputData.data[index + 3] = inputData.data[index + 3]; // Preserve alpha
                        }
                    }
                    var redBits = parseInt($("#post-red-bits").val());
                    var greenBits = parseInt($("#post-green-bits").val());
                    var blueBits = parseInt($("#post-blue-bits").val());
                    console.log("Applying posterization with", redBits, "red bits,", greenBits, "green bits, and", blueBits, "blue bits.");
                    errorDiffusionDither(0, colorSystem, redBits);
                    errorDiffusionDither(1, colorSystem, greenBits);
                    errorDiffusionDither(2, colorSystem, blueBits);
                    break;
                case "hsv":
                    //convert to HSI
                    console.log("converting to hsv")
                    for (let y = 0; y < inputData.height; y++) {
                        for (let x = 0; x < inputData.width; x++) {
                            var index = (x + y * inputData.width) * 4;
                            var r = inputData.data[index];
                            var g = inputData.data[index + 1];
                            var b = inputData.data[index + 2];
                            var hsv_value = imageproc.fromRGBToHSV2(r, g, b);
                            outputData.data[index] = hsv_value.h;
                            outputData.data[index + 1] = hsv_value.s;
                            outputData.data[index + 2] = hsv_value.v;
                        }
                    }
                    //apply error diffusion
                    var hBits = parseInt($("#post-h-bits").val());
                    var sBits = parseInt($("#post-s-bits").val());
                    var vBits = parseInt($("#post-v-bits").val());
                    console.log("hBits:",hBits);
                    errorDiffusionDither(0, colorSystem, hBits);
                    errorDiffusionDither(1, colorSystem, sBits);
                    errorDiffusionDither(2, colorSystem, vBits);
                    //convert back to RGB
                    for (let y = 0; y < inputData.height; y++) {
                        for (let x = 0; x < inputData.width; x++) {
                            var index = (x + y * inputData.width) * 4;
                            var h = outputData.data[index];
                            var s = outputData.data[index + 1];
                            var v = outputData.data[index + 2];
                            var rgb_value = imageproc.fromHSVToRGB2(h, s, v);
                            outputData.data[index] = rgb_value.r;
                            outputData.data[index + 1] = rgb_value.g;
                            outputData.data[index + 2] = rgb_value.b;

                        }
                    }
                    
                    break;
                case "cmyk":
                    //convert to CMYK
                    console.log("converting to cmyk")
                    var buffer = new Uint8ClampedArray(inputData.width * inputData.height * 4)
                    for (let y = 0; y < inputData.height; y++) {
                        for (let x = 0; x < inputData.width; x++) {
                            var index = (x + y * inputData.width) * 4;
                            var r = inputData.data[index];
                            var g = inputData.data[index + 1];
                            var b = inputData.data[index + 2];
                            buffer[index + 3] = inputData.data[index + 3];
                            var cmyk_value = imageproc.fromRGBToCMYK(r, g, b);
                            outputData.data[index] = cmyk_value.c;
                            outputData.data[index + 1] = cmyk_value.m;
                            outputData.data[index + 2] = cmyk_value.y2;
                            outputData.data[index + 3] = cmyk_value.k;
                        }
                    }
                    //apply error diffusion
                    var cBits = parseInt($("#post-c-bits").val());
                    var mBits = parseInt($("#post-m-bits").val());
                    var yBits = parseInt($("#post-y-bits").val());
                    var kBits = parseInt($("#post-k-bits").val());
                    console.log("hcits:",cBits);
                    errorDiffusionDither(0, colorSystem, cBits);
                    errorDiffusionDither(1, colorSystem, mBits);
                    errorDiffusionDither(2, colorSystem, yBits);
                    errorDiffusionDither(3, colorSystem, kBits);
                    //convert back to RGB
                    for (let y = 0; y < inputData.height; y++) {
                        for (let x = 0; x < inputData.width; x++) {
                            var index = (x + y * inputData.width) * 4;
                            var c = outputData.data[index];
                            var m = outputData.data[index + 1];
                            var y2 = outputData.data[index + 2];
                            var k = outputData.data[index + 3];
                            var rgb_value = imageproc.fromCMYKToRGB(c, m, y2, k);
                            outputData.data[index] = rgb_value.r;
                            outputData.data[index + 1] = rgb_value.g;
                            outputData.data[index + 2] = rgb_value.b;
                            outputData.data[index + 3] = buffer[index + 3];
                        }
                    }
                    break;
                default:
                    console.error("Fail to convert image into the targeted color channel")
                    return;
            }

            // // Convert the image to grayscale
            // for (let y = 0; y < inputData.height; y++) {
            //     for (let x = 0; x < inputData.width; x++) {
            //         var index = (x + y * inputData.width) * 4;
            //         var gray = (inputData.data[index] * 0.299 + inputData.data[index + 1] * 0.587 + inputData.data[index + 2] * 0.114);
            //         outputData.data[index] = gray;
            //         outputData.data[index + 1] = gray;
            //         outputData.data[index + 2] = gray;
            //         outputData.data[index + 3] = inputData.data[index + 3]; // Preserve alpha
            //     }
            // }
        };                
}(window.imageproc = window.imageproc || {}));
