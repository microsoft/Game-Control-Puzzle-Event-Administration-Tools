# Events

Events represent the entire concept of a puzzle event from planning to completion. On their own few things reference them directly, but they act as the primary container for everything to do with running an event.

## Events and Event Instances

While Events themselves have very little metadata - they're a name and an ID, EventInstances track the actual experience that players and staff interact with. They are a level of indirection that helps track different runs of a puzzle event, as larger events may run one or more test runs to determine how long puzzles take to solve, gather feedback on mechanics to improve, and so forth.

## Event Settings

Event instances have their own unique sets of settings. Settings are Key/Value pairs that allow customizing both certain triggers in the event as well as language used on the client website.

There are currently two setting types supported:
* "String" - any arbitrary string value. These are intended to be used at the service layer and will never be transmitted to the player website.
* "UserString" - arbitrary string values that are player-visible. These are primarily intended for customizing strings on the user experince (e.g., changing the general concept of 'Points' to something thematic, such as 'Doubloons' for a Pirate themed event).