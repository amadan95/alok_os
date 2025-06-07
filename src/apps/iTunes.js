import WindowManager from '../WindowManager';
import './iTunes.css';

class iTunes {
  constructor() {
    this.name = 'iTunes';
    this.placeholderClass = 'itunes-placeholder';
    this.audio = new Audio();
    this.music = [
      { name: 'Doomed', artist: 'Alexander Ehlers', album: 'Free Music Pack', time: '3:30', file: 'Alexander Ehlers - Doomed.mp3' },
      { name: 'Flags', artist: 'Alexander Ehlers', album: 'Free Music Pack', time: '2:45', file: 'Alexander Ehlers - Flags.mp3' },
      { name: 'Great Mission', artist: 'Alexander Ehlers', album: 'Free Music Pack', time: '2:10', file: 'Alexander Ehlers - Great mission.mp3' },
      { name: 'Spacetime', artist: 'Alexander Ehlers', album: 'Free Music Pack', time: '3:05', file: 'Alexander Ehlers - Spacetime.mp3' },
      { name: 'Twists', artist: 'Alexander Ehlers', album: 'Free Music Pack', time: '2:58', file: 'Alexander Ehlers - Twists.mp3' },
      { name: 'Waking the Devil', artist: 'Alexander Ehlers', album: 'Free Music Pack', time: '4:20', file: 'Alexander Ehlers - Waking the devil.mp3' },
      { name: 'Warped', artist: 'Alexander Ehlers', album: 'Free Music Pack', time: '3:15', file: 'Alexander Ehlers - Warped.mp3' }
    ];
    this.currentSongIndex = 0;
  }

  launch() {
    const content = `
      <div class="itunes-app">
        <div class="itunes-header">
            <div class="playback-controls">
              <button class="prev-button">◀◀</button>
              <button class="play-pause-button">▶</button>
              <button class="next-button">▶▶</button>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar"></div>
            </div>
            <div class="volume-container">
                <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="1">
            </div>
        </div>
        <div class="itunes-body">
            <div class="itunes-sidebar">
                <ul class="source-list">
                    <li class="header">Library</li>
                    <li class="selected">Music</li>
                    <li>Movies</li>
                    <li>TV Shows</li>
                    <li>Podcasts</li>
                    <li class="header">Store</li>
                    <li>iTunes Store</li>
                </ul>
            </div>
            <div class="itunes-main">
                <div class="song-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Artist</th>
                                <th>Album</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Song list will be populated here -->
                        </tbody>
                    </table>
                </div>
                <div class="artwork-info">
                    <!-- Artwork and info will be shown here -->
                </div>
            </div>
        </div>
      </div>
    `;

    WindowManager.createWindow({
      title: 'iTunes',
      width: '800px',
      height: '600px',
      content: content,
    });

    const win = document.querySelector('.itunes-app');
    this._loadMusic(win.querySelector('.song-list tbody'));
    this._addPlaybackLogic(win);
  }

  _addPlaybackLogic(win) {
    const playPauseButton = win.querySelector('.play-pause-button');
    const prevButton = win.querySelector('.prev-button');
    const nextButton = win.querySelector('.next-button');
    const progressBar = win.querySelector('.progress-bar');
    const volumeSlider = win.querySelector('.volume-slider');
    const songRows = win.querySelectorAll('.song-list tbody tr');

    playPauseButton.addEventListener('click', () => this._togglePlayPause());
    prevButton.addEventListener('click', () => this._playPrevious());
    nextButton.addEventListener('click', () => this._playNext());
    volumeSlider.addEventListener('input', (e) => this.audio.volume = e.target.value);

    this.audio.addEventListener('timeupdate', () => {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        progressBar.style.width = `${progress}%`;
    });

    songRows.forEach((row, index) => {
        row.addEventListener('click', () => this._playSong(index));
    });
  }
  
  _playSong(index) {
      this.currentSongIndex = index;
      const song = this.music[this.currentSongIndex];
      this.audio.src = `/sample-music/${song.file}`;
      this.audio.play();
      document.querySelector('.play-pause-button').textContent = '❚❚';
  }

  _togglePlayPause() {
      if(this.audio.paused) {
          this.audio.play();
          document.querySelector('.play-pause-button').textContent = '❚❚';
      } else {
          this.audio.pause();
          document.querySelector('.play-pause-button').textContent = '▶';
      }
  }

  _playNext() {
      this.currentSongIndex = (this.currentSongIndex + 1) % this.music.length;
      this._playSong(this.currentSongIndex);
  }

  _playPrevious() {
    this.currentSongIndex = (this.currentSongIndex - 1 + this.music.length) % this.music.length;
    this._playSong(this.currentSongIndex);
  }

  _loadMusic(tbody) {
    this.music.forEach((song, index) => {
      const row = document.createElement('tr');
      row.dataset.index = index;
      row.innerHTML = `
        <td>${song.name}</td>
        <td>${song.artist}</td>
        <td>${song.album}</td>
        <td>${song.time}</td>
      `;
      tbody.appendChild(row);
    });
  }
}

export default new iTunes(); 