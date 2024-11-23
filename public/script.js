document.addEventListener('DOMContentLoaded', () => {
    const processButton = document.getElementById('processButton');
    if (processButton) {
        processButton.addEventListener('click', () => {
            const fileInput = document.getElementById('image');
            const action = document.getElementById('action').value;

            if (!fileInput.files.length) {
                alert('Upload a picture!');
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const originalImageData = ctx.getImageData(0, 0, img.width, img.height);
                    const transformedData = transformImage(originalImageData, action);

                    localStorage.setItem('originalImage', canvas.toDataURL());
                    ctx.putImageData(transformedData, 0, 0);
                    localStorage.setItem('processedImage', canvas.toDataURL());

                    window.location.href = 'image.html';
                };
                img.src = event.target.result;
            };

            reader.readAsDataURL(file);
        });
    }

    const backButton = document.getElementById('backButton');
    if (backButton) {
       
        const originalCanvas = document.getElementById('originalCanvas');
        const processedCanvas = document.getElementById('processedCanvas');
        const originalImage = localStorage.getItem('originalImage');
        const processedImage = localStorage.getItem('processedImage');

        if (originalImage && processedImage) {
            const originalCtx = originalCanvas.getContext('2d');
            const processedCtx = processedCanvas.getContext('2d');

            const originalImg = new Image();
            const processedImg = new Image();

            originalImg.onload = function () {
                originalCanvas.width = originalImg.width;
                originalCanvas.height = originalImg.height;
                originalCtx.drawImage(originalImg, 0, 0);
            };

            processedImg.onload = function () {
                processedCanvas.width = processedImg.width;
                processedCanvas.height = processedImg.height;
                processedCtx.drawImage(processedImg, 0, 0);
            };

            originalImg.src = originalImage;
            processedImg.src = processedImage;
        }

        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});

function transformImage(imageData, action) {
    const { data, width, height } = imageData;
    const pixels = data;

    if (action === 'grayscale') {
        for (let i = 0; i < pixels.length; i += 4) {
            const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
            pixels[i] = pixels[i + 1] = pixels[i + 2] = avg; // R, G, B
        }
    } else if (action === 'blur') {
        const kernelSize = 5;
        const blurredData = blurImage(pixels, width, height, kernelSize);
        for (let i = 0; i < pixels.length; i++) {
            pixels[i] = blurredData[i];
        }
    }

    return new ImageData(pixels, width, height);
}

function blurImage(pixels, width, height, kernelSize) {
    const output = new Uint8ClampedArray(pixels);
    const halfKernel = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0,
                g = 0,
                b = 0,
                count = 0;

            for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                    const px = x + kx;
                    const py = y + ky;

                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        const index = (py * width + px) * 4;
                        r += pixels[index];
                        g += pixels[index + 1];
                        b += pixels[index + 2];
                        count++;
                    }
                }
            }

            const index = (y * width + x) * 4;
            output[index] = r / count;
            output[index + 1] = g / count;
            output[index + 2] = b / count;
        }
    }

    return output;
}
