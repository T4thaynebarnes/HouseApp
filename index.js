// creating classes that represents rooms and service class that updates the api and manages that,
// DOM manager class as well.
// A house has two aspects the house and the rooms
/* 
   lit-html snippet - Begin
   Add to the top of your code. Works with html or jsx!
   Formats html in a template literal  using the lit-html library 
   Syntax: html`<div> html or jsx here! ${variable} </div>`
*/
//lit-html snippet - Begin
let html = (strings, ...values) =>
  strings.reduce((acc, str, i) => acc + str + (values[i] || ""), "");
//lit-html snippet - End

// ********************************
class House {
  constructor(name) {
    // name is passed in from user input
    this.name = name;
    // empty array to pass rooms to
    this.rooms = [];
  }
}
// end of House class***

class Room {
  constructor(name, area) {
    this.name = name;
    this.area = area;
  }
}
// end of Room class sneds requests to the pre-existing dom
class HouseService {
  // below is a static member pointing to the api we are using
  static url = "https://ancient-taiga-31359.herokuapp.com/api/houses";
  //   static url = "https://659effdd5023b02bfe892d70.mockapi.io/StarWars";

  //   this will return all the houses in the api
  static getAllHouses() {
    // saying return all the houses from the url above being passed in
    return $.get(this.url);
  }
  // this grabs a specific house using the id in the API
  static getHouse(id) {
    return $.get(this.url + `/${id}`);
  }
  //   this takes a house as a parameters it comes from house class name and room in the array
  static createHouse(house) {
    // we want to return and post whatever house is passed in to the api
    return $.post(this.url, house);
  }
  static updateHouse(house) {
    console.log("checking method", house);
    // below is an object as a parameter:
    return $.ajax({
      url: this.url + `/${house._id}`,
      dataType: "json",
      //   payload is being converted to json with stringify method
      data: JSON.stringify(house),
      contentType: "application/json",
      type: "PUT",
    });
  }
  //   (id) parameter is taking the id from the particular house we wish to delete from the API
  static deleteHouse(id) {
    return $.ajax({
      url: this.url + `/${id}`,
      type: "DELETE",
    });
  }
}

class DOMManager {
  // needed to represent all houses within this class
  static houses;
  //   grab elements and renders them to the dom
  static getAllHouses() {
    //
    HouseService.getAllHouses().then((houses) => this.render(houses));
  }
  // ***end of getAllHouses method
  // ***************************
  static createHouse(name) {
    HouseService.createHouse(new House(name))
      .then(() => {
        return HouseService.getAllHouses();
      })
      .then((houses) => this.render(houses));
  }
  //   ***end of createHouse***
  static deleteHouse(id) {
    HouseService.deleteHouse(id)
      .then(() => {
        return HouseService.getAllHouses();
      })
      .then((houses) => this.render(houses));
  }
  //   *** end of deleteHouse****
  static addRoom(id) {
    console.log("adding rooms...", id);
    for (let house of this.houses) {
      if (house._id == id) {
        console.log("house we are looking at", house);
        house.rooms.push(
          new Room(
            $(`#${house._id}-room-name`).val(),
            $(`#${house._id}-room-area`).val()
          )
        );
        HouseService.updateHouse(house)
          .then(() => {
            return HouseService.getAllHouses();
          })
          .then((houses) => this.render(houses));
      }
    }
  }
  //   **end of addRoom()****
  static deleteRoom(houseId, roomId) {
    for (let house of this.houses) {
      if (house._id == houseId) {
        for (let room of house.rooms) {
          if (room._id == roomId) {
            house.rooms.splice(house.rooms.indexOf(room), 1);
            HouseService.updateHouse(house)
              .then(() => {
                return HouseService.getAllHouses();
              })
              .then((houses) => this.render(houses));
          }
        }
      }
    }
  }
  static render(houses) {
    // we are setting this.houses to be equal to houses that are passed in
    this.houses = houses;
    $("#app").empty();
    // test log1 tells me my rooms arent getting pushed to the array
    // console.log(houses);
    for (let house of houses) {
      $("#app").prepend(
        html`<div id="${house._id}" class="card">
            <div class="card-header">
              <h2>${house.name}</h2>
              <button
                class="btn btn-danger"
                onclick="DOMManager.deleteHouse('${house._id}')"
              >
                Delete
              </button>
            </div>
            <div class="card-body">
              <div class="card">
                <div class="row">
                  <div class="col-sm">
                    <input
                      type="text"
                      id="${house._id}-room-name"
                      class="form-control"
                      placeholder="Room Name"
                    />
                  </div>
                  <div class="col-sm">
                    <input
                      type="text"
                      id="${house._id}-room-area"
                      class="form-control"
                      placeholder="value not working"
                    />
                  </div>
                </div>
                <button
                  id="${house._id}-new-room"
                  onclick="DOMManager.addRoom('${house._id}')"
                  class="btn btn-success form-control"
                >
                  add room
                </button>
              </div>
            </div>
          </div>
          <br /> `
      );
      for (let room of house.rooms) {
        $(`#${house._id}`)
          .find(".card-body")
          .append(
            html`<p>
              <span id="name-${room._id}"
                ><strong> Name: </strong> ${room.name}</span
              >
              <span id="area-name-${room._id}"
                ><strong>Area: </strong> ${room.area}</span
              >
              <button
                class="btn btn-warning"
                onclick="DOMManager.deleteRoom('${house._id}','${room._id}')"
              >
                Delete Room
              </button>
            </p> `
          );
      }
    }
  }
}
// end of DOMManager()***
$("#create-new-house").click(() => {
  DOMManager.createHouse($("#new-house-name").val());
  $("#new-house-name").val("");
});
DOMManager.getAllHouses();
