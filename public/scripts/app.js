let markerArray = [];
const labelString = "ABCDEFGHIJKLMNOPQRSTUVYZ";
let placedMarkerCounter = 0;
let map;
let bounds;

// function createListRow(listItem) {
//   const $tableRow = $("<tr>").append(
//     $("<td>").text(listItem.label),
//     $("<td>").text(listItem.title)
//   );
//   return $tableRow;
// }

//Not being used
// function renderList(data) {
//   $("#testTable").empty();
//   data.forEach(item => {
//     let rendered = createListRow(item);
//     $("#testTable").append(rendered);
//   });
// }

function renderPins(pins) {
  $("#pinList").empty();
  for (const pinObj of pins) {
    const $pin = createPinList(pinObj);
    $("#pinList").append($pin);
  }
}

function createPinList(pin) {
  const $pin = $("<p>").text(pin.title);
  return $pin;
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: { lat: 45.5017, lng: -73.5673 }
  });
  bounds = new google.maps.LatLngBounds();
  $.ajax({
    method: "GET",
    url: "/api/lists/1/pinpoints"
  }).done(pinpoints => {
    // renderPins(pinpoints);
    for (var i = 0; i < pinpoints.length; i++) {
      markerArray.push({
        position: {
          lat: pinpoints[i].latitude,
          lng: pinpoints[i].longitude
        }
      });
      for (var elem of markerArray) {
        var marker = new google.maps.Marker({
          position: elem.position,
          label: elem.label
        });
        marker.setMap(map);
        bounds.extend(marker.getPosition());
        map.fitBounds(bounds);
      }
    }
  });
}

$(document).ready(function() {
  // code snippet to add another pin and viewing it on the map
  $("#marker_adder").on("click", function() {
    var newMarker = new google.maps.Marker({
      position: {
        lat: $("#latitude").val(),
        lng: $("#longitude").val()
      }
    });
    markerArray.push(newMarker);
    newMarker.setMap(map);
    bounds.extend(newMarker.getPosition());
    map.fitBounds(bounds);
  });
  $("#accordion").on("click", ".card", function(event) {
    const myID = this.id;
    const myURL = "/api/lists/" + myID;
    const myPinpoints = myURL + "/pinpoints";
    $.ajax({
      method: "GET",
      url: myURL
    })
      .then(results => {
        $("#list_header").text(results[0].title).attr("list-id", results[0].id);
        $("#list_info").text(results[0].description);
      })
      .then(
        $.ajax({
          method: "GET",
          url: myPinpoints
        }).then(results => {
          const listPinpoints = results;
          $("#pin_info").empty();
          initMap();
          markerArray = [];
          for (var point of listPinpoints) {
            var newMarker = new google.maps.Marker({
              position: {
                lat: point.latitude,
                lng: point.longitude
              }
            });
            markerArray.push(newMarker);
            newMarker.setMap(map);
            bounds.extend(newMarker.getPosition());
            map.fitBounds(bounds);
            $("#pin_header").text("List items");
            $("#pin_info").append(
              $("<tr>")
                .addClass("list_row")
                .append(
                  $("<td>")
                    .addClass("row_title")
                    .text(point.title),
                  $("<td>")
                    .addClass("row_description")
                    .text(point.description),
                  $("<td>").append(
                    $("<button>")
                      .attr("id", point.id)
                      .addClass("deleter")
                      .text("🗑")
                  )
                )
            );
          }
          $(".deleter").on("click", function(event) {
            $(this)
              .parent()
              .parent()
              .remove();
          });
        })
      );
  });

  // code snippet to remove a pin rezoom the map
  $("#test2").on("click", function() {
    markerArray[markerArray.length - 1].setMap(null);
    markerArray.pop();
    placedMarkerCounter--;
    $("#map").empty();
    initMap();
  });
});
