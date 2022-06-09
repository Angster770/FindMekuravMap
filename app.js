"use strict";

// globals
const form = document.querySelector(".form");

// form output
const formOutput = document.querySelector(".form_output");
const outputContainer = document.querySelector(".input_form");
// the inputs of form
const inputName = document.querySelector(".input_name");
const inputEmail = document.querySelector(".input_email");
const inputPhone = document.querySelector(".input_phone");
const inputAddress = document.querySelector(".input_address");

class Mekurav {
  date = new Date();
  id = Date.now() + "".slice(-10);

  constructor(name, address, phone, email, coords) {
    this.name = name;
    this.address = address;
    this.phone = phone;
    this.email = email;
    this.coords = coords;

    console.log(name, address, phone, email);
    // this._getLocalStorage();
  }
}

class App extends Mekurav {
  #map;
  #mapEvent;
  #mekuravList = [];
  #mapZoom = 13;
  constructor(name, address, phone, email, coords) {
    super(name, address, phone, email, coords);
    this._getPosition();

    form.addEventListener("submit", this._newMekurav.bind(this));
    // this._newOutput();
    outputContainer.addEventListener("click", this._mekuravLocate.bind(this));

    // locaal memory storage
    this._getLocalStorage();
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("no position");
        }
      );
  }

  _loadMap(position) {
    const { longitude } = position.coords;
    const { latitude } = position.coords;
    const coords = [latitude, longitude];

    console.log(`https://www.google.com/maps/@${latitude},${longitude},12z`);

    this.#map = L.map("map").setView(coords, this.#mapZoom);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));

    this.#mekuravList.forEach((mekur) => {
      this._newPopup(mekur);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    // console.log(mapEvent);
  }

  _newMekurav(e) {
    e.preventDefault();

    const inputNameVal = inputName.value;
    const inputAddressVal = inputAddress.value;
    const inputEmailVal = inputEmail.value;
    const inputPhoneVal = inputPhone.value;
    let mekurav1;

    const { lat, lng } = this.#mapEvent.latlng;

    mekurav1 = new Mekurav(
      inputNameVal,
      inputAddressVal,
      inputPhoneVal,
      inputEmailVal,
      [lat, lng]
    );
    this.#mekuravList.push(mekurav1);
    this._newOutput(mekurav1);
    this._newPopup(mekurav1);
    console.log(this.#mekuravList);
    this._setLocalStorage();
    //   console.log(inputName.value);

    // local storage
  }

  _newPopup(mekurav) {
    L.marker(mekurav.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "mekurav_popup",
        })
      )
      .setPopupContent(`${mekurav.name}`)
      .openPopup();
  }

  _newOutput(output) {
    let html = `
    <div class="output form_output" data-id="${output.id}">
    <tr>
    <div>
    <td>Name</td>
    <td class="name_output">${output.name}</td>
    </div>
    <div>
    <td>Address</td>
    <td class="address_output">${output.address}</td>
    </div>
    
    <div>
    <td>Phone</td>
    <td class="phone_output">${output.phone}</td>
    </div>
    
    <div>
    <td>Email</td>
    <td class="email_output">${output.email}</td>
    </div>
    </tr>
    </div>
    `;
    formOutput.classList.remove("hidden");
    formOutput.insertAdjacentHTML("afterend", html);
    inputEmail.value =
      inputName.value =
      inputPhone.value =
      inputAddress.value =
        "";
  }

  _mekuravLocate(e) {
    const mekuravEl = e.target.closest(".output");
    console.log(mekuravEl);
    // console.log(mekuravEl.coords);
    if (!mekuravEl) return;

    // console.log(mekuravList);
    const locate = this.#mekuravList.find(
      (mekur) => mekur.id === mekuravEl.dataset.id
    );
    // console.log(locate.coords);
    this.#map.setView(locate.coords, this.#mapZoom, {
      animate: true,
      pan: {
        animation: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem("mekuravim", JSON.stringify(this.#mekuravList));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("mekuravim"));

    if (!data) return;

    this.#mekuravList = data;

    this.#mekuravList.forEach((mekur) => {
      this._newOutput(mekur);
    });
  }
  reset() {
    localStorage.removeItem("mekuravim");
    location.reload();
  }
}

// callling instance
const app = new App();
