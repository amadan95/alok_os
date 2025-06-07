import WindowManager from '../WindowManager';
import './iPhoto.css';
import { events } from './iphoto/Events';
import Slideshow from './iphoto/Slideshow';

class iPhoto {
  constructor() {
    this.name = 'iPhoto';
    this.placeholderClass = 'iphoto-placeholder';
    this.allPhotos = this._getAllPhotoNames();
    this.currentPhotos = this.allPhotos;
  }

  launch() {
    const content = `
      <div class="iphoto-app">
        <div class="iphoto-sidebar">
          <ul class="source-list">
            <li class="header">Library</li>
            <li class="selected" data-source="all">All Photos</li>
            <li class="header">Events</li>
            ${events.map((event, index) => `
              <li data-source="event" data-event-index="${index}">
                <div class="event-stack">
                  <div class="stack-item-3" style="background-image: url(/sample-photos/${event.photos[2 % event.photos.length]})"></div>
                  <div class="stack-item-2" style="background-image: url(/sample-photos/${event.photos[1 % event.photos.length]})"></div>
                  <div class="stack-item-1" style="background-image: url(/sample-photos/${event.photos[0 % event.photos.length]})"></div>
                </div>
                <span class="event-name">${event.name}</span>
                <span class="photo-count">${event.photos.length}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="iphoto-main">
          <div class="iphoto-toolbar">
            <span>Photos</span>
            <button class="slideshow-button">Slideshow</button>
          </div>
          <div class="iphoto-grid">
            <!-- Thumbnails will be loaded here -->
          </div>
        </div>
      </div>
    `;

    WindowManager.createWindow({
      title: 'iPhoto',
      width: '800px',
      height: '600px',
      content: content,
    });

    this._loadPhotos(win.querySelector('.iphoto-grid'), this.allPhotos);

    this._addSidebarLogic(win);
    this._addToolbarLogic(win);
  }

  _addSidebarLogic(win) {
    const sidebar = win.querySelector('.iphoto-sidebar');
    const grid = win.querySelector('.iphoto-grid');

    sidebar.addEventListener('click', (e) => {
      if (e.target.tagName !== 'LI' || e.target.classList.contains('header')) return;

      // Remove selected class from all items
      sidebar.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
      // Add selected class to the clicked item
      e.target.classList.add('selected');

      const source = e.target.dataset.source;
      if (source === 'all') {
        this.currentPhotos = this.allPhotos;
        this._loadPhotos(grid, this.currentPhotos);
      } else if (source === 'event') {
        const eventIndex = e.target.dataset.eventIndex;
        this.currentPhotos = events[eventIndex].photos;
        this._loadPhotos(grid, this.currentPhotos);
      }
    });
  }

  _addToolbarLogic(win) {
    const slideshowButton = win.querySelector('.slideshow-button');
    slideshowButton.addEventListener('click', () => {
      const slideshow = new Slideshow(this.currentPhotos);
      slideshow.start();
    });
  }

  _getAllPhotoNames() {
    // This is not ideal, but for this project we will hardcode the list.
    // In a real application, this would be a dynamic list.
    return [
      '0185A801-AE20-446B-A4B5-F06BCAD30670.jpeg', '7885B060-A5F9-4BB7-BA31-DF7B2B2162E0.jpeg',
      '02628021-637E-4C9B-BD6C-06DAB6111778.jpeg', '79192C8B-1BDF-4301-91F9-F925D6CC66B8.jpeg',
      '0741FF1E-088B-4D41-84B3-6C5B03F49037.jpeg', '79F9754C-824B-4271-9E88-8463B3248681.jpeg',
      '07921D20-67D9-497D-A4F7-8A767A1879B3.jpeg', '7A0E0135-2AC5-4F4A-B748-CC6AC85D71C3.jpeg',
      '095071FE-D84B-4CE2-B946-D8FD634BF69C.jpeg', '7A6D743B-30C2-4A35-84F6-FE48E55EB6D7.jpeg',
      '0A270088-F35C-46EB-B8F5-264B31C73EF2.jpeg', '7BA05098-09C6-42D6-9F7E-3F62C3B42393.jpeg',
      '0FC41BC0-F0ED-46D5-9DEC-65D9899FB6E6.jpeg', '7BEE5690-AB89-46F3-B416-904D202AC72A.jpeg',
      '1138CF08-9CB9-4C5F-9298-DEEA130BD7F3.jpeg', '7D32A0B4-D081-4792-9CDF-FA07F4C57C26.jpeg',
      '113A18BE-1932-4D7C-BFC8-1F7F7D250C12.jpeg', '7E164DAC-4651-4C48-AC76-6B2863CE54CE.jpeg',
      '1283FB6C-B233-4693-959B-5119649F6D57.jpeg', '7E5C16F9-BBAF-48E7-9B86-862ADABEF9CD.jpeg',
      '14586F94-7709-4237-B42E-68A75AAE655C.jpeg', '7FB8608F-4022-4E11-89BA-8C7BC01008B7.jpeg',
      '14772612-0709-4EFE-A758-56DAE12F2001.jpeg', '80269758-30B6-4F09-A1D8-3EEDB64CB783.jpeg',
      '1481A125-E887-4B04-8195-925936304EEB.jpeg', '80AE608F-20E2-4415-9E91-3D97817DAA3B.jpeg',
      '15AB73A3-64FD-40D1-8208-E249D7D522B1.jpeg', '836C3EB4-720A-4E40-ABFE-AF63F2C9446F.jpeg',
      '15C660ED-0DFC-4552-B282-220FD08312BA.jpeg', '84AB3CA0-AB9C-4203-9853-A830F4A7F59C.jpeg',
      '17540249-F1B5-4EE0-898C-701E85D032DD.jpeg', '850511DA-B98A-4A93-BC64-296DB6CA1338.jpeg',
      '17BCA8E7-A390-48A0-95AC-3F4E1C4F7AC3.jpeg', '87EB5873-B3F3-4F82-9E4D-4C0178A31422.jpeg',
      '1944D2BB-31CD-40F7-BC6E-60A9E797ADF1.jpeg', '8825A85E-1F93-422F-8D23-0F2C9ABE7B77.jpeg',
      '1A382E00-BCA9-4CDC-B846-FBC6884C6144.jpeg', '883177CC-4686-4EC2-B66A-9B68D75A1305.jpeg',
      '1A517083-FE7F-479F-9FA3-D41847EF1E01.jpeg', '88D8D435-C89D-49A6-9874-2921868EEAAB.jpeg',
      '1A72FEF6-8511-4FD5-BB71-ED6F134BD636.jpeg', '89161CC9-0A48-4BD2-AD9A-4029352E6BAC.jpeg',
      '1C807A45-9F73-462E-9B99-C25A72C19819.jpeg', '8A15CA1B-3612-41A0-8AE9-3233E69E78BF.jpeg',
      '1C92D598-60E3-4837-9497-67DFF24DB0D3.jpeg', '8DC54264-9791-4523-BBBC-2A83B61862EE.jpeg',
      '1E175F97-2760-419E-BDBE-1BC75989F287.jpeg', '8DFCFB0E-1447-41F0-B68D-9B03587F929F.jpeg',
      '1EB2A8AE-534E-4560-82E8-50F76DDFACCF.jpeg', '8E3E7A2B-0720-466E-BCDF-D986E20EC6AB.jpeg',
      '21026C49-019C-483E-8102-FF93D1FF08AF.jpeg', '8EB0C9D7-2A65-4FB7-A016-D7F0D72A3993.jpeg',
      '22544158-5669-4208-8222-23EB05741DDD.jpeg', '91E72D9C-B39D-49BC-B006-8644AE31ACFF.jpeg',
      '22CD7A3E-6B5D-4B6A-82C5-C7CCC5FCFFE5.jpeg', '92E4EB7B-A19D-4E96-84E3-DC6112AE4FCF.jpeg'
    ];
  }

  _loadPhotos(gridElement, photoNames) {
    gridElement.innerHTML = ''; // Clear existing photos
    photoNames.forEach(name => {
      const img = document.createElement('img');
      img.src = `/sample-photos/${name}`;
      img.className = 'iphoto-thumbnail';
      gridElement.appendChild(img);

      img.addEventListener('click', () => this._showPhotoViewer(name));
    });
  }

  _showPhotoViewer(photoName) {
    const viewer = document.createElement('div');
    viewer.className = 'iphoto-viewer';
    viewer.innerHTML = `
      <img src="/sample-photos/${photoName}">
      <div class="close-viewer">×</div>
    `;

    document.body.appendChild(viewer);

    viewer.querySelector('.close-viewer').addEventListener('click', () => {
      document.body.removeChild(viewer);
    });
  }
}

export default new iPhoto(); 