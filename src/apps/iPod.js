import WindowManager from '../WindowManager';
import './iPod.css';

class iPod {
  constructor() {
    this.name = 'iPod';
    this.audio = new Audio();
    this.playlist = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isDragging = false;
    this.lastAngle = 0;
    this.rotation = 0;
  }

  async launch() {
    await this.fetchMusic();
    const content = this.render();
    this.win = WindowManager.createWindow({
      title: 'iPod',
      width: '300px',
      height: '500px',
      content: content,
    });
    this.addEventListeners();
    this.updateUI();
  }

  async fetchMusic() {
    try {
      const response = await fetch('http://localhost:3001/api/music');
      const albums = await response.json();
      this.playlist = albums.flatMap(album => album.songs);
    } catch (error) {
      console.error('Error fetching music:', error);
    }
  }

  render() {
    const song = this.playlist[this.currentIndex] || { title: 'No Music Found', artist: '' };
    return `
      <div class="ipod-container">
        <div class="ipod-screen">
          <div class="screen-header">
            <span class="pause-icon">${this.isPlaying ? '||' : '▶'}</span>
            <span class="now-playing-title">Now Playing</span>
            <span class="battery-icon">🔋</span>
          </div>
          <div class="track-info">
            <p class="track-number">${this.currentIndex + 1} of ${this.playlist.length}</p>
            <p class="track-title">${song.title}</p>
            <p class="track-artist">${song.artist}</p>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-filled"></div>
          </div>
          <div class="time-info">
            <span class="current-time">0:00</span>
            <span class="remaining-time">-:--</span>
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
  
  addEventListeners() {
    this.win.querySelector('.play-pause').addEventListener('click', () => this.togglePlayPause());
    this.win.querySelector('.next').addEventListener('click', () => this.nextTrack());
    this.win.querySelector('.prev').addEventListener('click', () => this.prevTrack());
    this.win.querySelector('.center-button').addEventListener('click', () => this.togglePlayPause());

    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => this.nextTrack());

    const wheel = this.win.querySelector('.ipod-wheel');
    wheel.addEventListener('mousedown', (e) => this.startDrag(e));
    this.win.addEventListener('mousemove', (e) => this.drag(e));
    this.win.addEventListener('mouseup', () => this.endDrag());
    this.win.addEventListener('mouseleave', () => this.endDrag());
  }

  togglePlayPause() {
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
    this.currentIndex = index;
    const song = this.playlist[index];
    if (song) {
      this.audio.src = song.url;
      this.audio.play();
      this.isPlaying = true;
      this.updateUI();
    }
  }

  nextTrack() {
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.playTrack(this.currentIndex);
  }

  prevTrack() {
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.playTrack(this.currentIndex);
  }

  updateProgress() {
    const { currentTime, duration } = this.audio;
    const progressPercent = (currentTime / duration) * 100;
    this.win.querySelector('.progress-bar-filled').style.width = `${progressPercent}%`;

    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    }

    this.win.querySelector('.current-time').textContent = formatTime(currentTime);
    if(duration) {
      this.win.querySelector('.remaining-time').textContent = `-${formatTime(duration - currentTime)}`;
    }
  }

  updateUI() {
    const song = this.playlist[this.currentIndex] || { title: 'No Music Found', artist: '' };
    this.win.querySelector('.track-number').textContent = `${this.currentIndex + 1} of ${this.playlist.length}`;
    this.win.querySelector('.track-title').textContent = song.title;
    this.win.querySelector('.track-artist').textContent = song.artist;
    this.win.querySelector('.pause-icon').textContent = this.isPlaying ? '||' : '▶';
  }

  startDrag(e) {
    this.isDragging = true;
    const wheel = this.win.querySelector('.ipod-wheel');
    const rect = wheel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    this.lastAngle = angle;
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

    this.rotation += deltaAngle * (180 / Math.PI);
    this.lastAngle = angle;
    
    // Check if we've rotated enough to change tracks
    if (Math.abs(this.rotation) > 30) {
      if (this.rotation > 0) {
        this.nextTrack();
      } else {
        this.prevTrack();
      }
      this.rotation = 0; // Reset rotation
    }
  }

  endDrag() {
    this.isDragging = false;
    this.rotation = 0;
  }
}

export default new iPod(); 