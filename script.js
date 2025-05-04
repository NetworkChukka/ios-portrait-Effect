document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const imageUpload = document.getElementById('imageUpload');
    const originalImage = document.getElementById('originalImage');
    const processedImage = document.getElementById('processedImage');
    const applyEffectBtn = document.getElementById('applyEffect');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetEffectBtn = document.getElementById('resetEffect');
    const shareBtn = document.getElementById('shareBtn');
    const blurStrength = document.getElementById('blurStrength');
    const blurValue = document.getElementById('blurValue');
    const brightness = document.getElementById('brightness');
    const brightnessValue = document.getElementById('brightnessValue');
    const controlsCard = document.getElementById('controlsCard');
    const resultCard = document.getElementById('resultCard');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const dropZone = document.getElementById('dropZone');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    // Variables
    let uploadedImage = null;
    let ctx = processedImage.getContext('2d');
    let activeTab = 'original';
    
    // Initialize
    initEventListeners();
    
    function initEventListeners() {
        // Update blur value display
        blurStrength.addEventListener('input', updateBlurValue);
        brightness.addEventListener('input', updateBrightnessValue);
        
        // Handle image upload
        imageUpload.addEventListener('change', handleImageUpload);
        
        // Apply portrait effect
        applyEffectBtn.addEventListener('click', applyPortraitEffect);
        
        // Reset effect
        resetEffectBtn.addEventListener('click', resetEffect);
        
        // Download processed image
        downloadBtn.addEventListener('click', downloadImage);
        
        // Share image
        shareBtn.addEventListener('click', shareImage);
        
        // Tab switching
        tabButtons.forEach(btn => {
            btn.addEventListener('click', switchTab);
        });
        
        // Drag and drop
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
        
        // Click on drop zone
        dropZone.addEventListener('click', () => {
            imageUpload.click();
        });
    }
    
    function updateBlurValue() {
        blurValue.textContent = this.value;
    }
    
    function updateBrightnessValue() {
        brightnessValue.textContent = `${this.value}%`;
    }
    
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        processImageFile(file);
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = '#4361ee';
        dropZone.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
    }
    
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = '#d1d5db';
        dropZone.style.backgroundColor = 'transparent';
    }
    
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        handleDragLeave(e);
        
        const file = e.dataTransfer.files[0];
        if (!file) return;
        
        if (file.type.match('image.*')) {
            processImageFile(file);
        } else {
            showError('Please select an image file');
        }
    }
    
    function processImageFile(file) {
        showLoading(true);
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            uploadedImage = new Image();
            uploadedImage.onload = function() {
                // Display original image
                originalImage.src = event.target.result;
                
                // Set canvas dimensions
                processedImage.width = uploadedImage.width;
                processedImage.height = uploadedImage.height;
                
                // Show controls and hide upload card
                controlsCard.classList.remove('hidden');
                resultCard.classList.remove('hidden');
                
                // Enable apply button
                applyEffectBtn.disabled = false;
                downloadBtn.disabled = true;
                
                showLoading(false);
            };
            uploadedImage.onerror = function() {
                showError('Error loading image');
                showLoading(false);
            };
            uploadedImage.src = event.target.result;
        };
        
        reader.onerror = function() {
            showError('Error reading file');
            showLoading(false);
        };
        
        reader.readAsDataURL(file);
    }
    
    function applyPortraitEffect() {
        if (!uploadedImage) return;
        
        showLoading(true);
        
        // Use setTimeout to allow UI to update before heavy processing
        setTimeout(() => {
            // Create a temporary canvas for processing
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = uploadedImage.width;
            tempCanvas.height = uploadedImage.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw original image
            tempCtx.drawImage(uploadedImage, 0, 0);
            
            // Apply blur to the entire image
            const blurAmount = parseInt(blurStrength.value);
            applyBlurEffect(tempCanvas, blurAmount);
            
            // Apply brightness adjustment
            const brightnessValue = parseInt(brightness.value) / 100;
            applyBrightness(tempCtx, brightnessValue);
            
            // Draw the blurred version to the main canvas
            ctx.drawImage(tempCanvas, 0, 0);
            
            // Draw the original image in the center (simulating focus)
            const centerWidth = uploadedImage.width * 0.7;
            const centerHeight = uploadedImage.height * 0.7;
            const centerX = (uploadedImage.width - centerWidth) / 2;
            const centerY = (uploadedImage.height - centerHeight) / 2;
            
            ctx.drawImage(
                uploadedImage,
                centerX, centerY, centerWidth, centerHeight,
                centerX, centerY, centerWidth, centerHeight
            );
            
            // Enable download button
            downloadBtn.disabled = false;
            
            // Switch to processed view
            switchTab({ target: document.querySelector('.tab-btn[data-tab="processed"]' });
            
            showLoading(false);
        }, 100);
    }
    
    function applyBlurEffect(canvas, intensity) {
        const ctx = canvas.getContext('2d');
        
        // StackBlur approximation
        for (let i = 0; i < intensity; i++) {
            ctx.globalAlpha = 0.5;
            ctx.drawImage(canvas, 1, 0);
            ctx.drawImage(canvas, -1, 0);
            ctx.drawImage(canvas, 0, 1);
            ctx.drawImage(canvas, 0, -1);
            ctx.globalAlpha = 1.0;
        }
    }
    
    function applyBrightness(ctx, value) {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * value);     // R
            data[i + 1] = Math.min(255, data[i + 1] * value); // G
            data[i + 2] = Math.min(255, data[i + 2] * value); // B
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    function resetEffect() {
        if (!uploadedImage) return;
        
        // Reset controls
        blurStrength.value = 5;
        blurValue.textContent = '5';
        brightness.value = 100;
        brightnessValue.textContent = '100%';
        
        // Switch to original view
        switchTab({ target: document.querySelector('.tab-btn[data-tab="original"]' });
    }
    
    function downloadImage() {
        const link = document.createElement('a');
        link.download = 'portrait-effect-' + new Date().getTime() + '.jpg';
        link.href = processedImage.toDataURL('image/jpeg', 0.9);
        link.click();
    }
    
    function shareImage() {
        if (navigator.share) {
            processedImage.toBlob(blob => {
                const file = new File([blob], 'portrait-effect.jpg', { type: 'image/jpeg' });
                
                navigator.share({
                    title: 'Check out my portrait effect',
                    text: 'Created with PortraitCam',
                    files: [file]
                }).catch(err => {
                    console.log('Error sharing:', err);
                    showError('Sharing failed. Please try another method.');
                });
            }, 'image/jpeg', 0.9);
        } else {
            // Fallback for browsers that don't support Web Share API
            const shareUrl = window.location.href;
            const shareText = 'Check out my portrait effect created with PortraitCam!';
            
            // Try to use clipboard API as fallback
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareText + ' ' + shareUrl).then(() => {
                    alert('Link copied to clipboard!');
                }).catch(err => {
                    console.log('Could not copy text: ', err);
                    window.open(`mailto:?subject=Portrait Effect&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
                });
            } else {
                window.open(`mailto:?subject=Portrait Effect&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
            }
        }
    }
    
    function switchTab(e) {
        const tab = e.target.dataset.tab;
        
        // Update active tab button
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Update active image
        if (tab === 'original') {
            originalImage.classList.add('active');
            processedImage.classList.remove('active');
            activeTab = 'original';
        } else {
            originalImage.classList.remove('active');
            processedImage.classList.add('active');
            activeTab = 'processed';
        }
    }
    
    function showLoading(show) {
        if (show) {
            loadingOverlay.classList.remove('hidden');
        } else {
            loadingOverlay.classList.add('hidden');
        }
    }
    
    function showError(message) {
        alert(message); // In a real app, you'd use a nicer notification system
    }
    
    // iOS specific enhancements
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        // Add iOS-specific optimizations
        document.querySelector('input[type="file"]').setAttribute('capture', 'environment');
        
        // Prevent zoom on input focus
        document.addEventListener('focusin', function() {
            window.scrollTo(0, 0);
        });
    }
});