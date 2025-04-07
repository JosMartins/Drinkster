# Design Choices (Backend)
<!-- This Document keeps track of all design choices made.-->
___

## Database Design


### don't know where to put this yet
 * Decided not to save Players in the database, as they are not persistent entities. Instead, will use a session-based approach to manage player data during the game session.