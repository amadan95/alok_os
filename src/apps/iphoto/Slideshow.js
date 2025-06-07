class Slideshow {
  constructor(photos) {
    this.photos = photos;
    this.currentIndex = 0;
    this.container = null;
    this.timeout = null;
  }

  start() {
    this.container = document.createElement('div');
    this.container.className = 'slideshow-container';
    this.container.innerHTML = `<div class="close-slideshow">×</div>`;
    document.body.appendChild(this.container);

    this.container.querySelector('.close-slideshow').addEventListener('click', () => this.stop());

    this._showNextPhoto();
  }

  _showNextPhoto() {
    if (this.currentIndex >= this.photos.length) {
      this.currentIndex = 0; // Loop slideshow
    }

    const photoName = this.photos[this.currentIndex];
    const img = document.createElement('img');
    img.src = `/sample-photos/${photoName}`;
    
    // Clear previous image
    const existingImg = this.container.querySelector('img');
    if(existingImg) {
        this.container.removeChild(existingImg);
    }

    this.container.appendChild(img);

    // Apply Ken Burns effect
    const randomZoom = 1.2 + Math.random() * 0.3; // between 1.2 and 1.5
    const randomX = Math.random() * 20 - 10; // between -10 and 10
    const randomY = Math.random() * 20 - 10; // between -10 and 10
    img.style.animation = `kenburns ${this.photos.length * 4}s linear infinite`;
    img.style.setProperty('--zoom', randomZoom);
    img.style.setProperty('--x', `${randomX}%`);
    img.style.setProperty('--y', `${randomY}%`);

    this.currentIndex++;
    
    this.timeout = setTimeout(() => this._showNextPhoto(), 4000); // Change photo every 4 seconds
  }

  stop() {
    clearTimeout(this.timeout);
    if (this.container) {
      document.body.removeChild(this.container);
    }
  }
}

export default Slideshow; 