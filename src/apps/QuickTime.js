import WindowManager from '../WindowManager';
import './QuickTime.css';

class QuickTime {
  constructor() {
    this.name = 'QuickTime Player';
    this.playlistId = 'PLjcLm8ZY67iNdptEc00nQbLzKIhHrdQx_';
    this.player = null;
    this.isPlaying = false;
    this.isPlayerReady = false;
  }

  async launch() {
    const content = `
      <div class="quicktime-app">
        <div class="quicktime-player">
          <div class="video-container">
            <div id="youtube-player"></div>
          </div>
          <div class="quicktime-controls">
            <div class="playback-controls">
              <button class="prev-button">◀◀</button>
              <button class="play-pause-button">❚❚</button>
              <button class="next-button">▶▶</button>
            </div>
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
              <span class="time-display">00:00 / 00:00</span>
            </div>
            <div class="volume-container">
              <input type="range" class="volume-slider" min="0" max="100" value="100">
            </div>
          </div>
        </div>
      </div>
    `;

    const win = WindowManager.createWindow({
      title: 'QuickTime Player',
      width: '640px',
      height: '480px',
      content: content,
    });

    await this._initializeYouTubePlayer(win);
  }

  async _initializeYouTubePlayer(win) {
    try {
      // Load YouTube IFrame API
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        await new Promise(resolve => {
          window.onYouTubeIframeAPIReady = resolve;
        });
      }

      // Create YouTube player with the user's playlist
      this.player = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        playerVars: {
          listType: 'playlist',
          list: this.playlistId,
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          enablejsapi: 1
        },
        events: {
          onReady: (event) => this._onPlayerReady(event),
          onStateChange: (event) => this._onPlayerStateChange(event),
          onError: (event) => this._onPlayerError(event)
        }
      });

      // Add control event listeners
      const playPauseButton = win.querySelector('.play-pause-button');
      const prevButton = win.querySelector('.prev-button');
      const nextButton = win.querySelector('.next-button');
      const volumeSlider = win.querySelector('.volume-slider');
      const progressBar = win.querySelector('.progress-bar');

      playPauseButton.addEventListener('click', () => this._togglePlayPause());
      
      prevButton.addEventListener('click', () => {
        if (this.player && this.isPlayerReady) {
          this.player.previousVideo();
        }
      });
      
      nextButton.addEventListener('click', () => {
        if (this.player && this.isPlayerReady) {
          this.player.nextVideo();
        }
      });

      volumeSlider.addEventListener('input', (e) => {
        if (this.player && this.isPlayerReady) {
          this.player.setVolume(parseInt(e.target.value));
        }
      });

      progressBar.addEventListener('click', (e) => {
        if (this.player && this.isPlayerReady) {
          const rect = progressBar.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          const duration = this.player.getDuration();
          this.player.seekTo(duration * pos, true);
        }
      });

      // Update progress bar
      setInterval(() => {
        if (this.player && this.isPlayerReady && this.isPlaying) {
          const currentTime = this.player.getCurrentTime();
          const duration = this.player.getDuration();
          const progress = (currentTime / duration) * 100;
          
          const progressFill = win.querySelector('.progress-fill');
          if (progressFill) progressFill.style.width = `${progress}%`;
          
          const timeDisplay = win.querySelector('.time-display');
          if (timeDisplay) timeDisplay.textContent = `${this._formatTime(currentTime)} / ${this._formatTime(duration)}`;
        }
      }, 1000);

    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  }

  _onPlayerReady(event) {
    this.isPlayerReady = true;
    this.isPlaying = true;
    event.target.setShuffle(true); // Shuffle the playlist
    event.target.playVideo();
  }

  _onPlayerStateChange(event) {
    if (!this.isPlayerReady) return;

    const win = document.querySelector('.quicktime-app');
    if (!win) return;
    const playPauseButton = win.querySelector('.play-pause-button');
    
    switch(event.data) {
      case window.YT.PlayerState.PLAYING:
        this.isPlaying = true;
        if (playPauseButton) playPauseButton.textContent = '❚❚';
        break;
      case window.YT.PlayerState.PAUSED:
        this.isPlaying = false;
        if (playPauseButton) playPauseButton.textContent = '▶';
        break;
      case window.YT.PlayerState.ENDED:
        // The player will automatically play the next video in the shuffled playlist.
        // No action needed here.
        break;
    }
  }

  _onPlayerError(event) {
    console.error('YouTube player error:', event.data);
    // Attempt to play the next video if an error occurs
    if (this.player && this.isPlayerReady) {
        this.player.nextVideo();
    }
  }

  _togglePlayPause() {
    if (!this.player || !this.isPlayerReady) return;
    if (this.isPlaying) {
      this.player.pauseVideo();
    } else {
      this.player.playVideo();
    }
  }

  _formatTime(time) {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

export default new QuickTime(); 