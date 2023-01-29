const { dbAll, dbGet, dbRun} = require("./sqliteExtensions");

async function getMilestonesAsync(bd, eventId) {
  let query =
    "SELECT * FROM EventMilestone WHERE fk_eventId = ? ORDER BY minNbUsers";
  return await dbAll(bd, query, [eventId]);
}

async function getCurNbUsersAsync(bd, eventId) {
  let query =
    "SELECT COUNT(*) AS curNbUsers FROM UsersEvents WHERE fk_eventId = ?";
  let response = await dbGet(bd, query, [eventId]);

  return response["curNbUsers"];
}

async function getUserHasJoined(bd, eventId, userId) {
  if (userId < 1) {
    return false
  }

  let query =
      "SELECT COUNT(*) AS entry FROM UsersEvents WHERE fk_eventId = ? AND fk_userId = ?";
  let response = await dbGet(bd, query, [eventId, userId]);

  return response["entry"] > 0;
}

async function getEventsAsync(bd) {
  let query = "SELECT * FROM Events";
  return await dbAll(bd, query);
}

async function getFullEventAsync(bd, eventId, userId) {
  let eventQuery = `SELECT * FROM Events INNER JOIN Restaurants R on R.pk_id = Events.fk_restaurantId WHERE Events.pk_id = ?`;

  let event = await dbGet(bd, eventQuery, [eventId]);
  let milestones = await getMilestonesAsync(bd, eventId);
  let curNbUsers = await getCurNbUsersAsync(bd, eventId);
  let hasJoined = await getUserHasJoined(bd, eventId, userId);

  return _mapFullEvent(event, milestones, curNbUsers, hasJoined);
}

async function getFullEventsAsync(bd, userId = null) {
  let eventsQuery = `SELECT Events.pk_id as eventId FROM Events INNER JOIN Restaurants R on R.pk_id = Events.fk_restaurantId`;

  let events = await dbAll(bd, eventsQuery);

  let fullEvents = [];
  for (let event of events) {
    let curFullEvent = await getFullEventAsync(bd, event.eventId, userId);
    fullEvents.push({ ...curFullEvent, pk_id: event.eventId });
  }

  return fullEvents;
}

async function joinEventAsync(bd, eventId, userId) {
  let insertQuery = `INSERT INTO UsersEvents (fk_userId, fk_eventId) VALUES (?, ?);`
  await dbRun(bd, insertQuery, [userId, eventId]);

  return await getFullEventAsync(bd, eventId);
}

function _computeCurPrice(event, milestones, curNbUsers) {
  let curPrice = event.basePrice;
  if (milestones.length > 0) {
    var biggestMilestone = milestones[0];

    for (var i = 0; i < milestones.length; i++) {
      if (curNbUsers < milestones[i].minNbUsers) break;

      biggestMilestone = milestones[i];
    }

    curPrice -= biggestMilestone.priceDiscount;
  }
  return curPrice;
}

function _mapFullEvent(event, milestones, curNbUsers, hasJoined) {
  return {
    imageUrl: event.imageUrl,
    name: event.restaurantName,
    date: event.eventDate,
    food: event.eventName,
    address: event.restaurantAddress,
    ogPrice: event.basePrice,
    curPrice: _computeCurPrice(event, milestones, curNbUsers),
    curUsers: curNbUsers,
    maxUsers: event.maxNbUsers,
    hasJoined: hasJoined,
    milestones: milestones,
  };
}

module.exports = {
  getMilestonesAsync,
  getCurNbUsersAsync,
  getEventsAsync,
  getUserHasJoined,
  getFullEventAsync,
  getFullEventsAsync,
  joinEventAsync
};