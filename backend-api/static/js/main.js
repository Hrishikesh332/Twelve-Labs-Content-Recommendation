document.addEventListener('DOMContentLoaded', function() {
    // Initialize all DOM elements with error handling
    const elements = {
        searchInput: document.getElementById('searchInput'),
        searchActionButton: document.getElementById('searchActionButton'),
        suggestionDropdown: document.getElementById('suggestionsDropdown'),
        clearSearchButton: document.querySelector('.clear-search'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        resultsSection: document.getElementById('resultsSection'),
        resultsGrid: document.getElementById('resultsGrid'),
        errorState: document.getElementById('errorState'),
        modal: document.getElementById('analysisModal'),
        modalContent: document.getElementById('analysisContent'),
        closeButton: document.querySelector('.close-button'),
        searchTypeButtons: document.querySelectorAll('.search-type-btn'),
        textSearch: document.getElementById('textSearch'),
        imageSearch: document.getElementById('imageSearch'),
        imageInput: document.getElementById('imageInput'),
        fileInput: document.getElementById('fileInput'),
        uploadZone: document.getElementById('uploadZone'),
        uploadProgress: document.getElementById('uploadProgress'),
        sampleVideos: document.querySelector('.sample-videos')
    };

    // Validate required elements exist
    const requiredElements = ['searchActionButton', 'resultsSection', 'resultsGrid'];
    for (const elementId of requiredElements) {
        if (!elements[elementId]) {
            console.error(`Required element not found: ${elementId}`);
        }
    }

    // Application state
    const state = {
        isLoading: false,
        currentSearchType: 'text',
        activeVideoPlayers: new Map(),
        searchHistory: [],
        lastSearchTime: 0
    };

    function initializeEventListeners() {
        // Search functionality
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', handleSearchInput);
            elements.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleSearch();
            });
        }

        if (elements.searchActionButton) {
            elements.searchActionButton.addEventListener('click', handleSearch);
        }

        if (elements.clearSearchButton) {
            elements.clearSearchButton.addEventListener('click', clearSearch);
        }

        // Search type switching
        elements.searchTypeButtons.forEach(button => {
            button.addEventListener('click', () => switchSearchType(button.dataset.type));
        });

        // File upload handling
        if (elements.uploadZone && elements.fileInput) {
            elements.uploadZone.addEventListener('click', () => elements.fileInput.click());
            elements.fileInput.addEventListener('change', handleFileUpload);
            setupDragAndDrop(elements.uploadZone);
        }

        // Handle modal close
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) toggleModal(modal);
            });
        });

        // Add window resize handler for responsive adjustments
        window.addEventListener('resize', debounce(handleWindowResize, 250));
    }

    function handleWindowResize() {
        // Adjust UI elements based on window size
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile-view', isMobile);
        
        // Adjust video player sizes if needed
        state.activeVideoPlayers.forEach(player => {
            if (player.parentElement) {
                player.parentElement.classList.toggle('mobile-player', isMobile);
            }
        });
    }

    function handleSearchInput(e) {
        const value = e.target.value.trim();
        if (elements.searchActionButton) {
            elements.searchActionButton.disabled = !value;
        }
        toggleSampleVideos(!value);
        
        // Show suggestions if we have at least 3 characters
        if (value.length >= 3) {
            showSuggestions(value);
        } else {
            hideSuggestions();
        }
    }

    function showSuggestions(query) {
        if (!elements.suggestionDropdown) return;
        
        // Filter search history for matching suggestions
        const suggestions = state.searchHistory
            .filter(item => item.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5); // Limit to 5 suggestions
            
        if (suggestions.length === 0) {
            hideSuggestions();
            return;
        }
        
        // Build suggestion list
        elements.suggestionDropdown.innerHTML = '';
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.addEventListener('click', () => {
                elements.searchInput.value = suggestion;
                hideSuggestions();
                handleSearch();
            });
            elements.suggestionDropdown.appendChild(item);
        });
        
        elements.suggestionDropdown.classList.remove('hidden');
    }
    
    function hideSuggestions() {
        if (elements.suggestionDropdown) {
            elements.suggestionDropdown.classList.add('hidden');
        }
    }

    function clearSearch() {
        if (elements.searchInput) {
            elements.searchInput.value = '';
        }
        if (elements.searchActionButton) {
            elements.searchActionButton.disabled = true;
        }
        toggleSampleVideos(true);
        hideSuggestions();
    }

    function switchSearchType(type) {
        if (!type || (type !== 'text' && type !== 'image')) {
            console.error('Invalid search type:', type);
            return;
        }

        state.currentSearchType = type;
        
        elements.searchTypeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        if (elements.textSearch) {
            elements.textSearch.classList.toggle('hidden', type !== 'text');
        }
        
        if (elements.imageSearch) {
            elements.imageSearch.classList.toggle('hidden', type !== 'image');
        }

        resetSearchInputs();
        updateActionButtonState();
    }

    async function handleSearch() {
        if (state.isLoading) return;

        // Throttle searches to prevent rapid-fire API calls
        const now = Date.now();
        if (now - state.lastSearchTime < 500) {
            return;
        }
        state.lastSearchTime = now;

        const searchContent = getSearchContent();
        if (!searchContent) {
            showError('Please enter a search query');
            return;
        }

        // Add text searches to history
        if (state.currentSearchType === 'text' && !state.searchHistory.includes(searchContent)) {
            state.searchHistory.unshift(searchContent);
            state.searchHistory = state.searchHistory.slice(0, 10); // Keep last 10 searches
        }

        setLoading(true);
        hideSampleVideos();

        try {
            const response = await performSearch(searchContent);
            const results = await handleSearchResponse(response);
            displayResults(results);
        } catch (error) {
            console.error('Search error:', error);
            showError(error.message || 'Search failed');
            
            // Show error state in results area
            if (elements.resultsGrid) {
                elements.resultsGrid.innerHTML = `
                    <div class="search-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Search Error</h3>
                        <p>${error.message || 'An error occurred during search. Please try again.'}</p>
                    </div>
                `;
            }
        } finally {
            setLoading(false);
        }
    }

    function getSearchContent() {
        if (state.currentSearchType === 'text') {
            return elements.searchInput ? elements.searchInput.value.trim() : '';
        } else {
            return elements.imageInput && elements.imageInput.files.length > 0 ? 
                elements.imageInput.files[0] : null;
        }
    }

    async function performSearch(content) {
        if (!content) {
            throw new Error('No search content provided');
        }

        if (state.currentSearchType === 'text') {
            return fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: content })
            });
        } else {
            const formData = new FormData();
            formData.append('image', content);
            return fetch('/search', {
                method: 'POST',
                body: formData
            });
        }
    }

    async function handleSearchResponse(response) {
        if (!response) {
            throw new Error('No response from server');
        }

        if (!response.ok) {
            let errorMessage = 'Search failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // If parsing JSON fails, use status text
                errorMessage = `${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        try {
            return await response.json();
        } catch (e) {
            throw new Error('Invalid response format');
        }
    }

    function displayResults(results) {
        cleanupVideoPlayers();
        
        if (!elements.resultsSection || !elements.resultsGrid) {
            console.error('Results elements not found');
            return;
        }

        elements.resultsSection.classList.remove('hidden');
        elements.resultsGrid.innerHTML = '';

        if (!results || results.length === 0) {
            showNoResults();
            return;
        }

        // Sort results by score (highest first)
        const sortedResults = [...results].sort((a, b) => b.score - a.score);

        sortedResults.forEach(result => {
            try {
                const card = createResultCard(result);
                elements.resultsGrid.appendChild(card);
            } catch (e) {
                console.error('Error creating result card:', e);
            }
        });

        // Scroll to results
        elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function createResultCard(result) {
        if (!result || !result.video_id) {
            throw new Error('Invalid result data');
        }

        const card = document.createElement('div');
        card.className = 'result-card';
        
        const confidenceClass = result.confidence === 'high' ? 
            'confidence-high' : 'confidence-medium';
        
        const score = (result.score * 100).toFixed(1);
        const duration = result.duration || 60; // Default duration if not provided

        card.innerHTML = `
            <div class="result-video-container">
                <div class="video-wrapper">
                    <video id="video-${result.video_id}" class="result-video" preload="metadata" playsinline>
                        <source src="/video/${result.video_id}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <div class="video-controls">
                        <button class="play-pause-btn" aria-label="Play">
                            <i class="fas fa-play"></i>
                        </button>
                        <div class="time-indicator">
                            <div class="time-segment" style="left: ${getTimePercentage(result.start_time, duration)}%; width: ${getSegmentWidth(result.start_time, result.end_time, duration)}%"></div>
                        </div>
                        <span class="time-display">0:00</span>
                    </div>
                    <div class="video-overlay">
                        <div class="confidence-badge ${confidenceClass}">
                            <i class="fas fa-check-circle"></i>
                            ${result.confidence}
                        </div>
                        <div class="score-badge">
                            <i class="fas fa-chart-line"></i>
                            ${score}%
                        </div>
                    </div>
                </div>
            </div>
            <div class="result-content">
                <div class="result-info">
                    <div class="result-time">
                        <i class="fas fa-clock"></i>
                        <span>${formatTimeRange(result.start_time, result.end_time)}</span>
                    </div>
                    <div class="result-metadata">
                        <span class="filename">${sanitizeHTML(result.filename || 'Unnamed video')}</span>
                    </div>
                </div>
                <button class="analyze-btn" data-video-id="${result.video_id}">
                    <i class="fas fa-chart-bar"></i>
                    Analyze
                </button>
            </div>
        `;

        // Add event listeners
        initializeVideoPlayer(result.video_id, card, result.start_time);
        
        const analyzeBtn = card.querySelector('.analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => showAnalysisModal(result));
        }

        return card;
    }

    function sanitizeHTML(text) {
        const element = document.createElement('div');
        element.textContent = text;
        return element.innerHTML;
    }

    function initializeVideoPlayer(videoId, container, startTime) {
        const video = container.querySelector(`#video-${videoId}`);
        if (!video) return;

        const playPauseBtn = container.querySelector('.play-pause-btn');
        const timeDisplay = container.querySelector('.time-display');
        const timeIndicator = container.querySelector('.time-indicator');

        // Set initial time once metadata is loaded
        video.addEventListener('loadedmetadata', () => {
            video.currentTime = startTime || 0;
            if (timeDisplay) {
                timeDisplay.textContent = formatTime(video.currentTime);
            }
        });

        // Handle play/pause
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleVideoPlayback(video, playPauseBtn);
            });
        }

        // Update time display and indicator
        video.addEventListener('timeupdate', () => {
            if (timeDisplay) {
                timeDisplay.textContent = formatTime(video.currentTime);
            }
            updateTimeIndicator(timeIndicator, video.currentTime, video.duration);
        });

        // Handle video click to play/pause
        video.addEventListener('click', () => {
            toggleVideoPlayback(video, playPauseBtn);
        });

        // Handle play/pause state changes
        video.addEventListener('play', () => {
            if (playPauseBtn) {
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                playPauseBtn.setAttribute('aria-label', 'Pause');
            }
        });

        video.addEventListener('pause', () => {
            if (playPauseBtn) {
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                playPauseBtn.setAttribute('aria-label', 'Play');
            }
        });

        // Handle errors
        video.addEventListener('error', () => {
            console.error(`Error loading video: ${videoId}`);
            container.querySelector('.video-wrapper').innerHTML = `
                <div class="video-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Video could not be loaded</p>
                </div>
            `;
        });

        // Store reference for cleanup
        state.activeVideoPlayers.set(videoId, video);
    }

    function toggleVideoPlayback(video, playPauseBtn) {
        if (!video) return;
        
        if (video.paused) {
            // Pause all other videos first
            state.activeVideoPlayers.forEach(player => {
                if (player !== video && !player.paused) {
                    player.pause();
                }
            });
            
            // Play this video
            video.play().catch(err => {
                console.error('Error playing video:', err);
            });
        } else {
            video.pause();
        }
    }

    function updateTimeIndicator(indicator, currentTime, duration) {
        if (!indicator || !duration) return;
        
        const percentage = (currentTime / duration) * 100;
        indicator.style.setProperty('--progress', `${percentage}%`);
    }

    function showAnalysisModal(result) {
        if (!elements.modal || !elements.modalContent) return;
        
        elements.modalContent.innerHTML = `
            <h2>Video Analysis</h2>
            <div class="analysis-details">
                <div class="analysis-item">
                    <span class="label">Video ID:</span>
                    <span class="value">${result.video_id}</span>
                </div>
                <div class="analysis-item">
                    <span class="label">Filename:</span>
                    <span class="value">${sanitizeHTML(result.filename || 'Unnamed video')}</span>
                </div>
                <div class="analysis-item">
                    <span class="label">Time Range:</span>
                    <span class="value">${formatTimeRange(result.start_time, result.end_time)}</span>
                </div>
                <div class="analysis-item">
                    <span class="label">Match Score:</span>
                    <span class="value">${(result.score * 100).toFixed(1)}%</span>
                </div>
                <div class="analysis-item">
                    <span class="label">Confidence:</span>
                    <span class="value ${result.confidence === 'high' ? 'text-green-500' : 'text-yellow-500'}">${result.confidence}</span>
                </div>
            </div>
            <div class="analysis-video">
                <video controls autoplay>
                    <source src="/video/${result.video_id}" type="video/mp4">
                </video>
            </div>
        `;
        
        toggleModal(elements.modal);
        
        // Set video time to start_time
        const video = elements.modalContent.querySelector('video');
        if (video) {
            video.addEventListener('loadedmetadata', () => {
                video.currentTime = result.start_time || 0;
            });
        }
    }

    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!validateVideoFile(file)) {
            showError('Please upload a valid video file (MP4, AVI, MOV, WMV)');
            return;
        }

        setLoading(true);
        updateUploadProgress(0);
        
        const formData = new FormData();
        formData.append('video', file);

        try {
            // Use fetch with upload progress tracking
            const xhr = new XMLHttpRequest();
            
            // Set up progress tracking
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    updateUploadProgress(percentComplete);
                }
            });
            
            // Create a promise to handle the XHR request
            const uploadPromise = new Promise((resolve, reject) => {
                xhr.open('POST', '/upload_video');
                
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            resolve(response);
                        } catch (e) {
                            reject(new Error('Invalid response format'));
                        }
                    } else {
                        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                    }
                };
                
                xhr.onerror = () => reject(new Error('Network error during upload'));
                xhr.send(formData);
            });
            
            const result = await uploadPromise;
            showSuccess(`Successfully processed video with ${result.segments} segments`);
            
            // Reset file input
            if (elements.fileInput) {
                elements.fileInput.value = '';
            }
            
            // Update file input label
            updateFileInputLabel('Choose video file or drag & drop');
            
        } catch (error) {
            console.error('Upload error:', error);
            showError('Failed to upload video. Please try again.');
        } finally {
            setLoading(false);
            updateUploadProgress(0);
        }
    }

    function updateUploadProgress(percent) {
        if (!elements.uploadProgress) return;
        
        elements.uploadProgress.style.width = `${percent}%`;
        elements.uploadProgress.setAttribute('aria-valuenow', percent);
        
        if (percent >= 100) {
            elements.uploadProgress.classList.add('upload-complete');
            setTimeout(() => {
                elements.uploadProgress.classList.remove('upload-complete');
                elements.uploadProgress.style.width = '0%';
            }, 1000);
        } else {
            elements.uploadProgress.classList.remove('upload-complete');
        }
    }

    function setupDragAndDrop(dropZone) {
        if (!dropZone) return;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults);
        });

        dropZone.addEventListener('dragover', () => {
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length) {
                if (elements.fileInput) {
                    elements.fileInput.files = files;
                    handleFileUpload({ target: elements.fileInput });
                }
            }
        });
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function cleanupVideoPlayers() {
        state.activeVideoPlayers.forEach(player => {
            try {
                player.pause();
                player.src = '';
                player.load();
            } catch (e) {
                console.error('Error cleaning up video player:', e);
            }
        });
        state.activeVideoPlayers.clear();
    }

    function validateVideoFile(file) {
        if (!file) return false;
        
        const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv'];
        const validExtensions = ['.mp4', '.mov', '.avi', '.wmv'];
        
        // Check MIME type
        if (validTypes.includes(file.type)) return true;
        
        // Fallback to extension check
        const fileName = file.name.toLowerCase();
        return validExtensions.some(ext => fileName.endsWith(ext));
    }

    function resetSearchInputs() {
        if (elements.searchInput) {
            elements.searchInput.value = '';
        }
        
        if (elements.imageInput) {
            elements.imageInput.value = '';
        }
        
        updateFileInputLabel('Choose image file or drag & drop');
    }

    function updateActionButtonState() {
        if (!elements.searchActionButton) return;
        
        const hasInput = state.currentSearchType === 'text' ? 
            (elements.searchInput && elements.searchInput.value.trim().length > 0) : 
            (elements.imageInput && elements.imageInput.files.length > 0);
            
        elements.searchActionButton.disabled = !hasInput;
    }

    function setLoading(loading) {
        state.isLoading = loading;
        
        if (elements.searchActionButton) {
            elements.searchActionButton.disabled = loading;
            elements.searchActionButton.classList.toggle('loading', loading);
        }
        
        toggleElement(elements.loadingSpinner, loading);
    }

    function showError(message) {
        const alert = document.createElement('div');
        alert.className = 'error-alert';
        alert.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${sanitizeHTML(message)}</span>
            <button class="close-alert" aria-label="Close">×</button>
        `;
        
        // Add close button functionality
        const closeBtn = alert.querySelector('.close-alert');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => alert.remove());
        }
        
        document.body.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(alert)) {
                alert.remove();
            }
        }, 5000);
    }

    function showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'success-alert';
        alert.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${sanitizeHTML(message)}</span>
            <button class="close-alert" aria-label="Close">×</button>
        `;
        
        // Add close button functionality
        const closeBtn = alert.querySelector('.close-alert');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => alert.remove());
        }
        
        document.body.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(alert)) {
                alert.remove();
            }
        }, 5000);
    }

    function showNoResults() {
        if (!elements.resultsGrid) return;
        
        elements.resultsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No Results Found</h3>
                <p>Try adjusting your search terms or upload more content</p>
            </div>
        `;
    }

    function formatTimeRange(start, end) {
        return `${formatTime(start)} - ${formatTime(end)}`;
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function getTimePercentage(time, duration) {
        if (!duration) return 0;
        return (time / duration) * 100;
    }

    function getSegmentWidth(start, end, duration) {
        if (!duration) return 0;
        return ((end - start) / duration) * 100;
    }

    function toggleElement(element, show) {
        if (!element) return;
        element.classList.toggle('hidden', !show);
    }

    function toggleSampleVideos(show) {
        if (elements.sampleVideos) {
            elements.sampleVideos.classList.toggle('hidden', !show);
        }
    }

    function hideSampleVideos() {
        toggleSampleVideos(false);
    }

    function toggleModal(modal) {
        if (!modal) return;
        
        const isHidden = modal.classList.contains('hidden');
        
        // If opening, add animation class
        if (isHidden) {
            modal.classList.remove('hidden');
            modal.classList.add('modal-opening');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                modal.classList.remove('modal-opening');
            }, 300);
        } else {
            // If closing, add closing animation
            modal.classList.add('modal-closing');
            
            // After animation, hide the modal
            setTimeout(() => {
                modal.classList.remove('modal-closing');
                modal.classList.add('hidden');
            }, 300);
        }
        
        // Toggle body scroll
        document.body.style.overflow = isHidden ? 'hidden' : '';
    }

    function updateFileInputLabel(text) {
        if (!elements.imageSearch) return;
        
        const label = elements.imageSearch.querySelector('.file-input-label');
        if (label) {
            label.textContent = text;
        }
    }

    // Utility function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Initialize the application
    initializeEventListeners();
    handleWindowResize(); // Set initial responsive state
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanupVideoPlayers);
});