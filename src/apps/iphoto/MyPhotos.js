// Generate array of photo filenames from 1 to 106
const photoFiles = Array.from({ length: 106 }, (_, i) => `photo-${i + 1}.jpg`);

export const myEvents = [
  {
    name: "My Photo Collection",
    date: "2024",
    photos: photoFiles
  }
];

export const myPhotos = photoFiles.map(photo => `/media/photos/${photo}`); 