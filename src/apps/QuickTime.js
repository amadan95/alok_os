import WindowManager from '../WindowManager';
import './QuickTime.css';

class QuickTime {
  constructor() {
    this.name = 'Movies';
    this.icon = '/QuickTime.png';
    this.player = null;
    this.isPlaying = false;
    this.isPlayerReady = false;
    this.isRepeating = false;
    this.isShuffling = false;
  }

  _getDOM() {
    // Using Feather icons as inline SVGs for the controls
    return `
      <div class="quicktime-app te-theme">
        <div class="te-top-panel">
          <div class="te-screen-display">
              <span class="te-track">TRACK --</span>
              <span class="te-title">--</span>
          </div>
        </div>
        <div class="video-container">
          <div id="youtube-player"></div>
          <div class="video-overlay"></div>
        </div>
        
        <div class="te-controls-panel">
          <div class="te-progress-bar-container">
            <span class="te-time-current">00:00</span>
            <div class="te-progress-bar">
              <div class="te-progress-bar-filled"></div>
            </div>
            <span class="te-time-total">00:00</span>
          </div>

          <div class="te-buttons-container">
            <div class="te-button-group">
              <button class="te-button" id="te-shuffle-btn" title="Shuffle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="16 14 16 21 21 21"></polyline><line x1="4" y1="10" x2="8" y2="14"></line></svg>
              </button>
              <div class="te-indicator-light-container">
                <div class="te-indicator-light"></div>
              </div>
            </div>
            <div class="te-button-group">
              <button class="te-button" id="te-rewind-btn" title="Previous">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>
              </button>
            </div>
            <div class="te-button-group">
              <button class="te-button te-play-btn" id="te-play-pause-btn" title="Play/Pause">
                <span>PLAY</span>
              </button>
              <div class="te-indicator-light-container">
                <div class="te-indicator-light te-play-light"></div>
              </div>
            </div>
            <div class="te-button-group">
              <button class="te-button" id="te-fast-forward-btn" title="Next">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
              </button>
            </div>
            <div class="te-button-group">
              <button class="te-button" id="te-repeat-btn" title="Repeat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
              </button>
              <div class="te-indicator-light-container">
                <div class="te-indicator-light"></div>
                <div class="te-indicator-light"></div>
              </div>
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
      width: '1280px',
      height: '960px',
      content: content,
      className: 'quicktime-window'
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
          origin: window.location.origin,
          iv_load_policy: 3,
          modestbranding: 1
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
    this.player.setShuffle(false);
    event.target.playVideo();
    
    this._setupControls(win);

    setInterval(() => this._updateProgress(), 250);
  }

  _setupControls(win) {
    const playPauseButton = win.querySelector('#te-play-pause-btn');
    const rewindButton = win.querySelector('#te-rewind-btn');
    const fastForwardButton = win.querySelector('#te-fast-forward-btn');
    const repeatButton = win.querySelector('#te-repeat-btn');
    const shuffleButton = win.querySelector('#te-shuffle-btn');
    const progressBar = win.querySelector('.te-progress-bar');
    const videoOverlay = win.querySelector('.video-overlay');

    playPauseButton.addEventListener('click', () => this.togglePlayPause());
    rewindButton.addEventListener('click', () => this.player.previousVideo());
    fastForwardButton.addEventListener('click', () => this.player.nextVideo());
    videoOverlay.addEventListener('click', () => this.togglePlayPause());
    
    repeatButton.addEventListener('click', () => {
      this.isRepeating = !this.isRepeating;
      this.player.setLoop(this.isRepeating);
      repeatButton.nextElementSibling.querySelectorAll('.te-indicator-light').forEach(el => el.classList.toggle('active', this.isRepeating));
    });

    shuffleButton.addEventListener('click', () => {
      this.isShuffling = !this.isShuffling;
      this.player.setShuffle(this.isShuffling);
      shuffleButton.nextElementSibling.querySelector('.te-indicator-light').classList.toggle('active', this.isShuffling);
      
      if (this.isShuffling) {
        this.player.playVideoAt(0);
      }
    });

    progressBar.addEventListener('click', (e) => {
      if (!this.player || typeof this.player.getDuration !== 'function') return;
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const duration = this.player.getDuration();
      this.player.seekTo(duration * percentage, true);
    });
  }

  _onPlayerStateChange(event) {
    if (!this.isPlayerReady) return;

    const playPauseText = this.win.querySelector('#te-play-pause-btn span');
    const playLight = this.win.querySelector('.te-play-light');
    const videoOverlay = this.win.querySelector('.video-overlay');
    
    if (event.data === window.YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      if (playPauseText) playPauseText.textContent = 'PAUSE';
      if (playLight) playLight.classList.add('active');
      if (videoOverlay) videoOverlay.style.background = 'transparent';
      this._updateVideoInfo();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      this.isPlaying = false;
      if (playPauseText) playPauseText.textContent = 'PLAY';
      if (playLight) playLight.classList.remove('active');
      if (videoOverlay) videoOverlay.style.background = 'rgba(0,0,0,0.1)';
    } else if (event.data === window.YT.PlayerState.ENDED) {
      if (videoOverlay) videoOverlay.style.background = 'rgba(0,0,0,0.1)';
      if (!this.isRepeating) {
        // Handled by the overlay showing
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
      
      const timeCurrentDisplay = this.win.querySelector('.te-time-current');
      if (timeCurrentDisplay) timeCurrentDisplay.textContent = this._formatTime(currentTime);

      const timeTotalDisplay = this.win.querySelector('.te-time-total');
      if (timeTotalDisplay && duration > 0) timeTotalDisplay.textContent = this._formatTime(duration);
      
      const progressBar = this.win.querySelector('.te-progress-bar-filled');
      if (progressBar && duration > 0) {
        const percentage = (currentTime / duration) * 100;
        progressBar.style.width = `${percentage}%`;
      }
    }
  }

  _updateVideoInfo() {
    if (!this.isPlayerReady || !this.win || !this.player.getVideoData) return;

    const videoData = this.player.getVideoData();
    const playlistIndex = this.player.getPlaylistIndex();

    const trackDisplay = this.win.querySelector('.te-track');
    if (trackDisplay) {
      trackDisplay.textContent = `TRACK ${(playlistIndex + 1).toString().padStart(2, '0')}`;
    }

    const titleDisplay = this.win.querySelector('.te-title');
    if (titleDisplay) {
      titleDisplay.textContent = videoData.title;
    }
  }

  _formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }
}

export default QuickTime; 