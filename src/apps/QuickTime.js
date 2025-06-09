import WindowManager from '../WindowManager';
import './QuickTime.css';

class QuickTime {
  constructor() {
    this.name = 'Movies';
    this.icon = '../public/icons/QuickTime.png';
    this.player = null;
    this.isPlaying = false;
    this.isPlayerReady = false;
    this.isRepeating = false;
  }

  _getDOM() {
    return `
      <div class="quicktime-app vhs-theme">
        <div class="vhs-top-panel">
          <div class="vhs-screen">
              <div class="vhs-screen-top-labels">
                  <span>TRACK</span>
                  <span>TIME</span>
                  <span>TITLE</span>
              </div>
              <div class="vhs-screen-bottom-display">
                  <span class="track-display">01</span>
                  <span class="time-display">00:00</span>
                  <div class="title-container">
                      <span class="title-display">--</span>
                  </div>
              </div>
          </div>
        </div>

        <div class="video-container">
          <div id="youtube-player"></div>
          <div class="video-overlay"></div>
        </div>
        
        <div class="vhs-bottom-panel">
          <div class="progress-bar-container">
            <div class="progress-bar"></div>
          </div>
          <div class="vhs-buttons-container">
              <div class="vhs-main-controls">
                <button class="vhs-button rewind-button">◀◀</button>
                <button class="vhs-button play-pause-button">▶</button>
                <button class="vhs-button fast-forward-button">▶▶</button>
              </div>
              <div class="vhs-secondary-controls">
                  <button class="vhs-button shuffle-button">SHUFFLE</button>
                  <button class="vhs-button repeat-button">REPEAT</button>
              </div>
          </div>
        </div>
      </div>
    `;
  }

  async launch() {
    const content = this._getDOM();

    this.win = WindowManager.createWindow({
      title: 'Movies',
      width: '640px',
      height: '520px', // Increased height for progress bar
      content: content,
      className: 'quicktime-window' // Custom class for padding
    });

    await this._initializeYouTubePlayer(this.win);
  }

  async _initializeYouTubePlayer(win) {
    try {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        await new Promise(resolve => { window.onYouTubeIframeAPIReady = resolve; });
      }

      this.player = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          listType: 'playlist',
          list: 'PLjcLm8ZY67iO0t3TTAIlFh1CGRFWbLKef',
          origin: window.location.origin
        },
        events: {
          'onReady': (e) => this._onPlayerReady(e, win),
          'onStateChange': this._onPlayerStateChange.bind(this)
        }
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  }

  _onPlayerReady(event, win) {
    this.isPlayerReady = true;
    this.player.setVolume(50);
    this.player.setShuffle(true);
    event.target.playVideo();
    
    // Setup event listeners
    this._setupControls(win);

    // Start progress updater
    setInterval(() => this._updateProgress(), 250);

    // Align progress bar
    const controlsContainer = win.querySelector('.vhs-buttons-container');
    const progressBarContainer = win.querySelector('.progress-bar-container');
    progressBarContainer.style.width = `${controlsContainer.offsetWidth}px`;
    progressBarContainer.style.margin = `0 auto`;
    new ResizeObserver(() => {
      progressBarContainer.style.width = `${controlsContainer.offsetWidth}px`;
    }).observe(controlsContainer);
  }

  _setupControls(win) {
    const playPauseButton = win.querySelector('.play-pause-button');
    const rewindButton = win.querySelector('.rewind-button');
    const fastForwardButton = win.querySelector('.fast-forward-button');
    const repeatButton = win.querySelector('.repeat-button');
    const shuffleButton = win.querySelector('.shuffle-button');
    const progressBarContainer = win.querySelector('.progress-bar-container');
    const videoOverlay = win.querySelector('.video-overlay');

    playPauseButton.addEventListener('click', () => this.togglePlayPause());
    rewindButton.addEventListener('click', () => this.player.previousVideo());
    fastForwardButton.addEventListener('click', () => this.player.nextVideo());
    videoOverlay.addEventListener('click', () => this.togglePlayPause());
    
    repeatButton.addEventListener('click', () => {
      this.isRepeating = !this.isRepeating;
      repeatButton.classList.toggle('active', this.isRepeating);
    });

    shuffleButton.addEventListener('click', () => {
        this.player.setShuffle(true);
        this.player.nextVideo();
    });

    progressBarContainer.addEventListener('click', (e) => {
      if (!this.player || typeof this.player.getDuration !== 'function') return;
      const rect = progressBarContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const duration = this.player.getDuration();
      this.player.seekTo(duration * percentage, true);
    });
  }

  _onPlayerStateChange(event) {
    if (!this.isPlayerReady) return;

    const playPauseButton = this.win.querySelector('.play-pause-button');
    const videoOverlay = this.win.querySelector('.video-overlay');
    
    if (event.data === window.YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      if (playPauseButton) {
        playPauseButton.textContent = '❚❚';
        playPauseButton.classList.add('playing');
      }
      if (videoOverlay) videoOverlay.style.display = 'none';
      this._updateVideoInfo();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      this.isPlaying = false;
      if (playPauseButton) {
        playPauseButton.textContent = '▶';
        playPauseButton.classList.remove('playing');
      }
      if (videoOverlay) videoOverlay.style.display = 'block';
    } else if (event.data === window.YT.PlayerState.ENDED) {
      if (this.isRepeating) {
        this.player.seekTo(0);
        this.player.playVideo();
      } else {
        if (videoOverlay) videoOverlay.style.display = 'block';
      }
    }
  }

  togglePlayPause() {
    if (!this.player || !this.isPlayerReady) return;
    if (this.isPlaying) {
      this.player.pauseVideo();
    } else {
      this.player.playVideo();
    }
  }

  _updateProgress() {
    if (this.player && typeof this.player.getCurrentTime === 'function' && this.isPlayerReady) {
      const currentTime = this.player.getCurrentTime();
      const duration = this.player.getDuration();
      
      const timeDisplay = this.win.querySelector('.time-display');
      if (timeDisplay) {
        timeDisplay.textContent = this._formatTime(currentTime);
      }
      
      const progressBar = this.win.querySelector('.progress-bar');
      if (progressBar && duration > 0) {
        const percentage = (currentTime / duration) * 100;
        progressBar.style.width = `${percentage}%`;
      }
    }
  }

  _updateVideoInfo() {
    if (this.player && typeof this.player.getVideoData === 'function' && this.win) {
      const videoData = this.player.getVideoData();
      const playlistIndex = this.player.getPlaylistIndex();
      
      const trackDisplay = this.win.querySelector('.track-display');
      const titleDisplay = this.win.querySelector('.title-display');
      const titleContainer = this.win.querySelector('.title-container');

      if (trackDisplay) {
        trackDisplay.textContent = (playlistIndex + 1).toString().padStart(2, '0');
      }
      if (titleDisplay) {
        titleDisplay.textContent = videoData.title;
        // Check for overflow and add scrolling class
        if (titleDisplay.scrollWidth > titleContainer.clientWidth) {
          titleDisplay.classList.add('scrolling');
        } else {
          titleDisplay.classList.remove('scrolling');
        }
      }
    }
  }

  _formatTime(seconds) {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }
}

export default new QuickTime(); 