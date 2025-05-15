## Endpoints do Backend
### RoomWebSocketController
> * >MessageMapping /list-rooms
> > SendTo /topic/rooms-list
>  > Payload: nenhum
>  > Resposta: RoomListResponse com lista de salas.


MessageMapping /create-room
SendTo /topic/room-created
Payload: CreateRoomRequest
  • name (String)
  • isPrivate (boolean)
  • password (String)
  • player (nome, sexo, dificuldade)
  • mode (String)
  • rememberCount (int)
  • showChallenges (boolean)
Resposta: RoomCreatedResponse com roomId e adminId.


MessageMapping /join-room
SendTo /topic/{roomId}/player-joined
Payload:
  • roomId (String)
  • CreateRoomRequest.PlayerConfig (nome, sexo, dificuldade)
Resposta:
  • JoinResponse com mensagem e playerId
  • ou ErrorResponse.


MessageMapping /leave-room
SendTo /topic/{roomId}/player-left
Payload:
  • roomId (String)
  • playerId (String)
Resposta:
  • JoinResponse (saída)
  • ou ErrorResponse.


MessageMapping /player-ready
SendTo /topic/{roomId}/player-status-update
Payload: roomId, playerId
Resposta: PlayerStatusResponse com ready=true ou ErrorResponse.


MessageMapping /player-unready
SendTo /topic/{roomId}/player-status-update
Payload: roomId, playerId
Resposta: PlayerStatusResponse com ready=false ou ErrorResponse.


MessageMapping /kick-player
SendTo /topic/{roomId}/player-left
Payload: roomId, playerId
Resposta: JoinResponse ou ErrorResponse.


MessageMapping /get-player-difficulty
SendTo /topic/{roomId}/{playerId}/difficulty
Payload: roomId, playerId
Resposta: GetPlayerDifficultyResponse ou ErrorResponse.


MessageMapping /change-difficulty
SendTo /topic/{roomId}/{playerId}/difficulty-changed
Payload:
  • roomId (String)
  • playerId (String)
  • CreateRoomRequest.PlayerConfig.difficulty_values
Resposta: JoinResponse ou ErrorResponse.


MessageMapping /restore-session
SendTo /topic/{playerId}/session-restored
Payload: roomId, playerId
Resposta: BaseResponse (restauração de sessão) ou ErrorResponse.


<hr></hr>
GameWebSocketController
MessageMapping /start-game
SendTo /topic/{roomId}/game-started
Payload: roomId
Resposta: StartGameResponse ou ErrorResponse
Ação: dispara next challenge para cada jogador.


MessageMapping /challenge-{action}
(onde {action} = drank ou outro)
Payload: Map<String,String> com roomId e playerId
Resposta: nenhuma direta; erros via
/topic/{playerId}/error
Ação: registra resposta ao desafio e, quando todos respondem, distribui sips e penalidades, então chama próximo desafio.


MessageMapping /admin-force-skip
Payload: roomId
Resposta: nenhuma direta; erros via
/topic/{roomId}/error
Ação: força pular desafio atual e dispara next challenge.