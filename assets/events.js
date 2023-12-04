let allEvents = [];
let allBookings = []; // Alle Events die der angemeldete Benutzer gebucht hat
const allMonths = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

loadAllEvents();
test();
// Event details

let _currentOpenEvent;

function openEventDetails(_eventEntry)
{
  closeCreateEvent();
  let _eventDetailContainer = document.querySelector(".event-details-container");
  _eventDetailContainer.style.display = "block";
  for (let _event of allEvents)
  {
    if (_event.id == _eventEntry.attributes["data-id"].value)
    {
      _currentOpenEvent = _event;
      break;
    }
  }
  _eventDetailContainer.querySelector(".event-details-title").innerHTML = _currentOpenEvent.title;
  _eventDetailContainer.querySelector(".event-details-date").innerHTML = _currentOpenEvent.dateToString();
  _eventDetailContainer.querySelector(".event-details-time").innerHTML = _currentOpenEvent.timeToString();
}

function bookEvent()
{
  //datenbank eintrag
  // mit _currentOpenEvent
}

function closeEventDetails()
{
  _currentOpenEvent = null;
  document.querySelector(".event-details-container").style.display = "none";
}

// Create Event

function openCreateEvent()
{
  closeEventDetails();
  document.querySelector(".create-event-container").style.display = "block"
}

function saveEventEntries()
{
  let _title = document.querySelector(".create-event-title-input").value;
  _date = [document.querySelector(".create-event-date-input").value.split("-")[2], document.querySelector(".create-event-date-input").value.split("-")[1], document.querySelector(".create-event-date-input").value.split("-")[0]];
  _time = [document.querySelector(".create-event-time-input").value.split(":")[0], document.querySelector(".create-event-time-input").value.split(":")[1]];
  if (_title != "" && _date[0] != null && _date[1] != null && _date[2] != null && _time[0] != null && _time[1] != null)
  {
    _date = [parseInt(_date[0]), parseInt(_date[1]), parseInt(_date[2])];
    _time = [parseInt(_time[0]), parseInt(_time[1])];
    createEvent(_title, _date, _time);
    closeCreateEvent();
  }
}

function closeCreateEvent()
{
  document.querySelector(".create-event-container").style.display = "none";
}

function createEvent(_title, _date, _time, _tags)
{
  allEvents.push(new Event(_title, _date, _time, _tags)); // fügt das Event dem Event-array hinzu
  // löscht alle Events, die älter "heute" sind
  let _currentDate = new Date();
  for (let _i = allEvents.length - 1; _i >= 0; _i--)
  {
    if (allEvents[_i].date[2] < _currentDate.getFullYear() || (allEvents[_i].date[2] == _currentDate.getFullYear() && allEvents[_i].date[1] - 1 < _currentDate.getMonth()) || (allEvents[_i].date[2] == _currentDate.getFullYear() && allEvents[_i].date[1] - 1 == _currentDate.getMonth() && allEvents[_i].date[0] < _currentDate.getDate())) allEvents.splice(_i, 1);
  }
  // sortiert die Events (nach Datum) aufsteigend
  allEvents.sort(function(a, b)
  {
    if (a.date[2] != b.date[2]) return a.date[2] - b.date[2];
    else if (a.date[1] != b.date[1]) return a.date[1] - b.date[1];
    else if (a.date[0] != b.date[0]) return a.date[0] - b.date[0];
    else if (a.time[0] != b.time[0]) return a.time[0] - b.time[0];
    else if (a.time[1] != b.time[1]) return a.time[1] - b.time[1];
    else return 0;
  });
  loadAllEvents();
}

// anzeigen

function loadAllEvents()
{
  document.querySelector(".calendar-container").innerHTML = ""; // löscht alle Events (auf der Website) - Events sind aber noch im Array gespeichert
  for (let _event of allEvents)
  {
    addEvent(_event);
  }
  if (allEvents.length == 0) document.querySelector(".calendar-container").innerHTML = "<div class=\"calendar-empty\">Es sind zurzeit keine Events geplant</div>";
}

function loadEventsWithTags()
{
  document.querySelector(".calendar-container").innerHTML = ""; // löscht alle Events (auf der Website) - Events sind aber noch im Array gespeichert
  let _eventsMatch = [];
  let _currentFilter = document.querySelector(".filter-event-input").value.split(",");
  if (_currentFilter[0] == "")
  {
    loadAllEvents();
    return;
  }
  for (let _event of allEvents)
  {
    for (let _eventTag of _event.tags)
    {
      for (let _filterTag of _currentFilter)
      {
        _filterTag = _filterTag.trim();
        if (!_eventsMatch.includes(_event) && _eventTag.toLowerCase().includes(_filterTag.toLowerCase())) _eventsMatch.push(_event);
      }
    }
  }
  for (let _event of _eventsMatch)
  {
    addEvent(_event);
  }
  if (_eventsMatch.length == 0) document.querySelector(".calendar-container").innerHTML = "<div class=\"calendar-empty\">Es wurden keine Events mit dieser Auswahl gefunden</div>";
}

function addEvent(_event) // fügt die Event-karte dem HTML-dokument zu
{
  addYear(_event.date);
  addMonth(_event.date);
  document.querySelector("[data-year=\"year" + _event.date[2].toString() + "\"]").querySelector("[data-month=\"month" + (_event.date[1] - 1).toString() + "\"]").querySelector(".month-content").innerHTML += _event.getHtml();
}

function addMonth(_date) // fügt neuen Monat (in dem Jahr aus "_date") hinzu (Titel und Feld für Event-karten)
{
  if (!document.querySelector("[data-year=\"year" + _date[2].toString() + "\"]").querySelector("[data-month=\"month" + (_date[1] - 1).toString() + "\"]")) document.querySelector("[data-year=\"year" + _date[2].toString() + "\"]").innerHTML += "<div class=\"month-container\" data-month=\"month" + (_date[1] - 1).toString() + "\"><div class=\"month-title\">" + allMonths[_date[1] - 1] + " " + _date[2] + "</div><div class=\"month-content\"></div></div>";
}

function addYear(_date) // fügt neues Jahr hinzu (Feld für Monate)
{
  if (!document.querySelector("[data-year=\"year" + _date[2].toString() + "\"]")) document.querySelector(".calendar-container").innerHTML += "<div class=\"year-container\" data-year=\"year" + _date[2].toString() + "\"></div>";
}

// Class Event

class Event
{
  constructor(_title, _date, _time)
  {
    this.id = 0;
    this.title = _title;
    this.date = _date; // [day, month, year]
    this.time = _time; // [hour, minute]
    this.tags = [];
    this.imagePath = this.getEventImagePath();
    this.html;
  }
  getHtml() // der HTML code für diese Event-karte
  {
    return "<div class=\"event-entry\" data-id=\"" + this.id + "\" onclick=\"openEventDetails(this)\"><img src=" + this.imagePath + "><div class=\"event-content\">" + this.dateToString() + "<br>" + this.title + "</div>";
  }
  dateToString()
  {
    return (this.date[0].toString() + ". " + allMonths[this.date[1] - 1] + " " + this.date[2].toString());
  }
  timeToString()
  {
    return (((this.time[0].toString().length == 2) ? this.time[0] : ("0" + this.time[0].toString())) + ":" + ((this.time[1].toString().length == 2) ? this.time[1] : ("0" + this.time[1].toString())));
  }
  tagsToString()
  {
    let _tagString = "";
    for (let _i = 0; _i < this.tags; _i++)
    {
      _tagString = _tagString + ((_i > 0) ? ", " : "") + this.tags[_i];
    }
    return _tagString;
  }
  getEventImagePath()
  {
    switch (this.title)
    {
      case "GameNight":
        return "../Images/Image1.jpg";
      default:
        return "../Images/Image1.jpg";
    }
  }
}
function test(){
  console.log("hi");
}