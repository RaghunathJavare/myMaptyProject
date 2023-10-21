'use strict';

class Place {
  // date = new Date();
  // id = (Date.now() + '').slice(-10);

  constructor(coords, placeName) {
    this.coords = coords;
    this.placeName = placeName;
  }
}

class App {
  #form = document.querySelector('.search');
  #searchBox = document.querySelector('.search__contaienr');
  #inputPlace = document.querySelector('.input__place');
  #overlay = document.querySelector('.overlay');
  #btnCancle = document.querySelector('.btn-cancle');
  #map;
  #mapZoomLevel = 12;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Get user's position
    this._getPosition();
    this._getLocalStorage();

    // Get data from local storage

    // Attach event handlers
    this.#form.addEventListener('submit', this._place.bind(this));
    // this.#searchBox.addEventListener('click', this._hideForm.bind(this));
    this.#btnCancle.addEventListener('click', this._hideForm.bind(this));
  }

  async _getPosition() {
    const data = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    if (!data) return;
    this._loadMap(data);
  }

  _loadMap(position) {
    const { latitude: lat, longitude: lng } = position.coords;

    this.#map = L.map('map').setView([lat, lng], this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    this.#searchBox.classList.remove('hidden');
    this.#overlay.classList.remove('hidden');
    this.#inputPlace.focus();
  }

  _hideForm() {
    this.#searchBox.classList.add('hidden');
    this.#overlay.classList.add('hidden');
    this.#inputPlace.value = '';
  }

  _place(e) {
    e.preventDefault();
    //Get input from user

    const placeName = this.#inputPlace.value;
    if (!placeName) return;
    console.log(placeName);
    const { lat, lng } = this.#mapEvent.latlng;

    const workout = new Place([lat, lng], placeName);

    // // Add new object to workout array
    this.#workouts.push(workout);

    // // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // // Hide form + clear input fields
    this._hideForm();

    // // Set local storage to all Places
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxwidth: 100,
          minwidth: 70,
          autoClose: false,
          closeOnClick: false,
          className: `task-popup`,
        })
      )
      .setPopupContent(`<h6>${workout.placeName}</h6>`)
      .openPopup();
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;
  }
  clear() {
    localStorage.clear();
  }
}

const app = new App();
app.clear();
