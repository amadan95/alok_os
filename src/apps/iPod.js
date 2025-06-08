import WindowManager from '../WindowManager';
import './iPod.css';

class iPod {
  constructor() {
    this.name = 'iPod';
    this.audio = new Audio();
    this.clickSound = new Audio('/media/click.mp3'); // Load click sound
    this.playlist = [];
    this.currentIndex = 0;
    this.currentView = 'nowPlaying'; // Can be 'menu' or 'nowPlaying'
    this.menuItems = ['Now Playing', 'Music', 'Photos', 'Videos', 'Settings'];
    this.activeMenuItem = 0;
    this.isPlaying = false;
    this.isDragging = false;
    this.lastAngle = 0;
    this.rotationAccumulator = 0; // Accumulates rotation
    this.proxyUrl = (url) => `http://localhost:3001/?url=${encodeURIComponent(url)}`;
  }

  async launch() {
    await this.fetchMusic();
    const content = this.render();
    this.win = WindowManager.createWindow({
      title: 'iPod',
      width: '400px',
      height: '600px',
      content: content,
      resizable: true,
    });
    this.addEventListeners();
    this.updateUI();
  }

  async fetchMusic() {
    try {
      const response = await fetch('http://localhost:3001/api/music');
      const data = await response.json();
      this.playlist = data.tracks;
      
      if (this.playlist.length > 0) {
        console.log(`Loaded ${this.playlist.length} tracks from playlist "${data.playlistName}"`);
      } else {
        console.log('Playlist is empty.');
      }
      
    } catch (error) {
      console.error('Error fetching music:', error);
      this.playlist = []; // Ensure playlist is empty on error
    }
  }

  render() {
    return `
      <div class="ipod-container">
        <div class="ipod-screen">
          <div class="screen-display">
            ${this.renderScreenContent()}
          </div>
        </div>
        <div class="ipod-wheel">
          <div class="wheel-button menu">MENU</div>
          <div class="wheel-button next">▶▶</div>
          <div class="wheel-button prev">◀◀</div>
          <div class="wheel-button play-pause">▶||</div>
          <div class="center-button"></div>
        </div>
      </div>
    `;
  }

  renderScreenContent() {
    if (this.currentView === 'menu') {
      return this.renderMenu();
    }
    return this.renderNowPlaying();
  }

  renderMenu() {
    return `
      <div class="screen-header"><span class="now-playing-title">iPod</span></div>
      <ul class="ipod-menu">
        ${this.menuItems.map((item, index) => `
          <li class="${index === this.activeMenuItem ? 'active' : ''}">${item}</li>
        `).join('')}
      </ul>
    `;
  }

  renderNowPlaying() {
    const song = this.playlist[this.currentIndex] || { title: 'No Music Found', artist: '', album: '' };
    // Always fallback to iPod icon since we are not using album art
    const albumArtUrl = '/icons/ipod.png'; 
    
    return `
      <div class="screen-header">
        <span class="pause-icon">${this.isPlaying ? '||' : '▶'}</span>
        <span class="now-playing-title">Now Playing</span>
        <span class="battery-icon">🔋</span>
      </div>
      <div class="now-playing-view">
        <div class="track-info">
            <p class="track-title">${song.title}</p>
            <p class="track-artist">${song.artist}</p>
            <p class="track-album">${song.album}</p>
        </div>
        <div class="album-art">
          <img src="${albumArtUrl}" alt="Album Art" crossorigin="anonymous">
        </div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-filled"></div>
      </div>
      <div class="time-info">
        <span class="current-time">0:00</span>
        <span class="remaining-time">-:--</span>
      </div>
    `;
  }
  
  addEventListeners() {
    const playPauseBtn = this.win.querySelector('.play-pause');
    const nextBtn = this.win.querySelector('.next');
    const prevBtn = this.win.querySelector('.prev');
    const menuBtn = this.win.querySelector('.menu');
    const centerBtn = this.win.querySelector('.center-button');

    if (playPauseBtn) playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextTrack());
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevTrack());
    if (centerBtn) centerBtn.addEventListener('click', () => this.handleCenterClick());
    if (menuBtn) menuBtn.addEventListener('click', () => this.handleMenuClick());
    
    // Add visual feedback for button presses
    [playPauseBtn, nextBtn, prevBtn, menuBtn, centerBtn].forEach(btn => {
        if (!btn) return;
        const addPressed = () => btn.classList.add('pressed');
        const removePressed = () => btn.classList.remove('pressed');

        btn.addEventListener('mousedown', addPressed);
        btn.addEventListener('mouseup', removePressed);
        btn.addEventListener('mouseleave', removePressed);
    });

    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => this.nextTrack());

    const wheel = this.win.querySelector('.ipod-wheel');
    if (wheel) {
      wheel.addEventListener('mousedown', (e) => this.startDrag(e));
      this.win.addEventListener('mousemove', (e) => this.drag(e));
      this.win.addEventListener('mouseup', () => this.endDrag());
      this.win.addEventListener('mouseleave', () => this.endDrag());
    }
  }
    
  playClickSound() {
    this.clickSound.currentTime = 0;
    this.clickSound.play().catch(error => {
      if (error.name === 'NotSupportedError') {
        // This is expected if the user hasn't provided a click.mp3 file.
        // We can safely ignore this error and let the app function silently.
      } else {
        console.error("Click sound playback error:", error);
      }
    });
  }

  handleCenterClick() {
    this.playClickSound();
    if (this.currentView === 'menu') {
      const selectedItem = this.menuItems[this.activeMenuItem];
      if (selectedItem === 'Now Playing') {
        this.currentView = 'nowPlaying';
        this.updateUI();
      }
      // Add other menu actions here
    } else {
      this.togglePlayPause();
    }
  }

  handleMenuClick() {
      this.currentView = 'menu';
      this.updateUI();
  }

  togglePlayPause() {
    if (this.playlist.length === 0) return;
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      if (this.audio.src === '') {
        this.playTrack(this.currentIndex);
      }
      this.audio.play();
    }
    this.isPlaying = !this.isPlaying;
    this.updateUI();
  }

  playTrack(index) {
    if (this.playlist.length === 0) return;
    this.currentIndex = index;
    const song = this.playlist[index];
    if (song) {
      if (song.previewUrl) {
        this.audio.src = this.proxyUrl(song.previewUrl);
        this.audio.play().catch(e => console.error("Audio play failed:", e));
        this.isPlaying = true;
      } else {
        console.log(`No audio URL for: ${song.title} by ${song.artist}`);
        this.isPlaying = false;
        setTimeout(() => this.nextTrack(), 1000);
      }
      this.updateUI();
    }
  }

  nextTrack() {
    if (this.playlist.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.playTrack(this.currentIndex);
  }

  prevTrack() {
    if (this.playlist.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.playTrack(this.currentIndex);
  }

  updateProgress() {
    if (!this.win) return;
    const { currentTime, duration } = this.audio;
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;
    const progressBar = this.win.querySelector('.progress-bar-filled');
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }

    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    }
    const currentTimeEl = this.win.querySelector('.current-time');
    if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime || 0);
    
    const remainingTimeEl = this.win.querySelector('.remaining-time');
    if (remainingTimeEl) {
        const remaining = duration ? duration - currentTime : 0;
        remainingTimeEl.textContent = `-${formatTime(remaining)}`;
    }
  }

  updateUI() {
    if (!this.win) return;

    const screenDisplay = this.win.querySelector('.screen-display');

    // Only do a full re-render if the view has changed
    const nowPlayingView = this.win.querySelector('.now-playing-view');
    const menuView = this.win.querySelector('.ipod-menu');

    if ((this.currentView === 'nowPlaying' && !nowPlayingView) || (this.currentView === 'menu' && !menuView)) {
      screenDisplay.innerHTML = this.renderScreenContent();
    }

    // Update dynamic elements specifically
    if (this.currentView === 'nowPlaying' && this.playlist.length > 0) {
      const song = this.playlist[this.currentIndex] || {};
      const titleEl = this.win.querySelector('.track-title');
      const artistEl = this.win.querySelector('.track-artist');
      const albumEl = this.win.querySelector('.track-album');
      const pauseIcon = this.win.querySelector('.pause-icon');

      if (titleEl) titleEl.textContent = song.title;
      if (artistEl) artistEl.textContent = song.artist;
      if (albumEl) albumEl.textContent = song.album;
      if (pauseIcon) pauseIcon.textContent = this.isPlaying ? '||' : '▶';
    } else if (this.currentView === 'menu') {
       this.win.querySelectorAll('.ipod-menu li').forEach((item, index) => {
        item.classList.toggle('active', index === this.activeMenuItem);
      });
    }
  }

  startDrag(e) {
    this.isDragging = true;
    const wheel = this.win.querySelector('.ipod-wheel');
    const rect = wheel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    this.lastAngle = angle;
    this.rotationAccumulator = 0;
  }

  drag(e) {
    if (!this.isDragging) return;
    
    const wheel = this.win.querySelector('.ipod-wheel');
    const rect = wheel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    
    let deltaAngle = angle - this.lastAngle;
    if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
    if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

    this.rotationAccumulator += deltaAngle * (180 / Math.PI);
    this.lastAngle = angle;
    
    // Define sensitivity - how much rotation moves one menu item
    const sensitivity = 30; 
    
    if (Math.abs(this.rotationAccumulator) > sensitivity) {
      this.playClickSound(); // Play click on scroll
      const direction = this.rotationAccumulator > 0 ? 1 : -1;
      
      if (this.currentView === 'menu') {
          this.activeMenuItem = (this.activeMenuItem + direction + this.menuItems.length) % this.menuItems.length;
          this.updateUI();
      } else {
          // In Now Playing, scroll tracks
          if(direction > 0) this.nextTrack();
          else this.prevTrack();
      }
      
      this.rotationAccumulator %= sensitivity; // Reset accumulator
    }
  }

  endDrag() {
    this.isDragging = false;
    this.rotationAccumulator = 0;
  }
}

export default new iPod(); 