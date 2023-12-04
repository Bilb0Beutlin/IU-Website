let allEvents;
let currentUser;
const allMonths = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

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
  _eventDetailContainer.querySelector(".event-details-date").innerHTML = _currentOpenEvent.dateToString() + "<br>" + _currentOpenEvent.timeToString() + " Uhr";
  _eventDetailContainer.querySelector(".event-details-tags").innerHTML = _currentOpenEvent.tagsToString();
}

function bookEvent()
{
  currentUser.bookedEventIds.push(_currentOpenEvent.id);
  _currentOpenEvent.addTags(currentUser.tags);
  // leitet zum Bezahlen weiter
  closeEventDetails();
  loadAllEvents();
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
  allEvents.push(new Event(allEvents.length, _title, _date, _time, _tags)); // fügt das Event dem Event-array hinzu
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
  let _currentFilter = document.querySelector(".filter-event-input").value.split(",");
  if (_currentFilter[0] == "")
  {
    loadEvents(allEvents);
    if (allEvents.length == 0) document.querySelector(".calendar-container").innerHTML = "<div class=\"calendar-empty\">Es sind zurzeit keine Events geplant</div>";
    return;
  }
  let _eventsMatch = [];
  for (let _event of allEvents)
  {
    for (let _eventTag of _event.tags)
    {
      for (let _filterTagName of _currentFilter)
      {
        _filterTagName = _filterTagName.trim();
        if (_filterTagName != "" && !_eventsMatch.includes(_event) && _eventTag.name.toLowerCase().includes(_filterTagName.toLowerCase())) _eventsMatch.push(_event);
      }
    }
  }
  loadEvents(_eventsMatch);
  if (_eventsMatch.length == 0) document.querySelector(".calendar-container").innerHTML = "<div class=\"calendar-empty\">Es wurden keine Events mit dieser Auswahl gefunden</div>";
}

function loadEvents(_events)
{
  for (let _event of _events)
  {
    addEvent(_event);
    for (let _bookedEventId of currentUser.bookedEventIds)
    {
      if (_bookedEventId == _event.id) document.querySelector("[data-id=\"" + _event.id + "\"]").style["border-color"] = "green";
    }
  }
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

// Class Event / User

class EventTag
{
  constructor(_name, _count)
  {
    this.name = _name;
    this.count = _count;
  }
  static includes(_tagName, _existingTags)
  {
    for (let _tag of _existingTags)
    {
      if (_tagName == _tag.name) return true;
    }
    return false;
  }
  static addCount(_tagName, _existingTags)
  {
    for (let _tag of _existingTags)
    {
      if (_tagName == _tag.name) _tag.count++;
    }
  }
  static sortAllTags(_tags)
  {
    _tags.sort(function(a, b)
    {
      return b.count - a.count;
    });
  }
  static addTag(_newTagName, _existingTags)
  {
    if (EventTag.includes(_newTagName, _existingTags)) EventTag.addCount(_newTagName, _existingTags);
    else
    {
      _existingTags.push(new EventTag(_newTagName, 1));
    }
    EventTag.sortAllTags(_existingTags);
  }
}

class Event
{
  constructor(_id, _title, _date, _time)
  {
    this.id = _id;
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
    for (let _i = 0; _i < this.tags.length; _i++)
    {
      if (_i >= 5) return _tagString;
      _tagString = _tagString + ((_i > 0) ? "<br>" : "") + this.tags[_i].name;
    }
    return _tagString;
  }
  addTags(_tagNames)
  {
    for (let _tagName of _tagNames)
    {
      EventTag.addTag(_tagName, this.tags);
    }
  }
  getEventImagePath()
  {
    switch (this.title)
    {
      case "GameNight":
        return "../Images/Image1.jpg";
      case "Girls Night":
        return "../Images/Image1.jpg";
      default:
        return "../Images/Image1.jpg";
    }
  }
  static getAllEvents()
  {
    // hier wird auf die Datenbank zugegriffen
    let _event1 = new Event(0, "Game Night", [12, 12, 2023], [13, 0]);
    _event1.addTags(["minecraft", "csgo"]);
    let _event2 = new Event(1, "Game Night", [13, 12, 2023], [14, 30]);
    _event2.addTags(["minecraft", "ark"]);
    let _event3 = new Event(2, "Girls Night", [2, 1, 2024], [13, 0]);
    _event3.addTags(["ark", "csgo"]);
    let _event4 = new Event(3, "Game Night", [2, 1, 2024], [15, 0]);
    _event4.addTags(["pubg", "csgo"]);
    allEvents = [_event1, _event2, _event3, _event4];
    loadAllEvents();
  }
  static saveAllEvents()
  {
    for (let _event of allEvents)
    {
      // hier wird jedes Event mit den zugehörigen Daten in die Datenbank eingetragen
    }
  }
}

class User
{
  constructor()
  {
    this.isAdmin = this.loadUserAdmin();
    if (this.isAdmin) document.querySelector(".create-event-button").style.display = "block";
    this.tags = this.loadUserTags();
    this.bookedEventIds = this.loadUserEvents();
  }
  loadUserAdmin()
  {
    // verbindet sich mit der Datenbank und sieht, ob der angemeldete Benutzer ein Admin ist
    return true;
  }
  loadUserTags()
  {
    // verbindet sich mit der Datenbank und sieht, welche Tags der Benutzer angegeben hat
    return ["minecraft", "csgo", "ark"];
  }
  loadUserEvents()
  {
    // gibt die von aktuellen Benutzer gebuchten Events aus der Datenbank aus
    return [];
  }
}

currentUser = new User();
Event.getAllEvents();