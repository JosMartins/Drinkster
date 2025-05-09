package com.drinkster.controller;

import com.drinkster.dto.request.CreateRoomRequest;
import com.drinkster.dto.response.*;
import com.drinkster.model.DifficultyValues;
import com.drinkster.model.GameRoom;
import com.drinkster.model.Player;
import com.drinkster.model.enums.RoomMode;
import com.drinkster.service.RoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoomWebSocketControllerTest {

    @Mock
    private RoomService roomService;

    @Mock
    private SimpMessageHeaderAccessor headerAccessor;

    private RoomWebSocketController controller;
    private final String sessionId = "test-session-id";
    private final UUID roomId = UUID.randomUUID();
    private final UUID playerId = UUID.randomUUID();
    private final DifficultyValues difficultyValues = new DifficultyValues(0.35, 0.35, 0.3, 0.0);

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        controller = new RoomWebSocketController(roomService);
        when(headerAccessor.getSessionId()).thenReturn(sessionId);
    }

    @Test
    void listRoomsReturnsProperResponse() {
        GameRoom room = mock(GameRoom.class);
        when(room.getId()).thenReturn(roomId);
        when(room.getName()).thenReturn("Test Room");
        when(roomService.getRooms()).thenReturn(List.of(room));

        RoomListResponse response = controller.listRooms();

        assertNotNull(response);
        assertEquals(1, response.rooms().size());
        verify(roomService).getRooms();
    }

    @Test
    void listRoomsHandlesEmptyList() {
        when(roomService.getRooms()).thenReturn(Collections.emptyList());

        RoomListResponse response = controller.listRooms();

        assertNotNull(response);
        assertTrue(response.rooms().isEmpty());
    }

    @Test
    void createRoomSuccessfully() {
        CreateRoomRequest.PlayerConfig playerConfig = new CreateRoomRequest.PlayerConfig("TestUser", "MALE", difficultyValues);
        CreateRoomRequest request = new CreateRoomRequest("Test Room", false, null, playerConfig, "standard", 5, true);

        GameRoom mockRoom = mock(GameRoom.class);
        when(mockRoom.getId()).thenReturn(roomId);
        Player mockPlayer = mock(Player.class);
        when(mockPlayer.getId()).thenReturn(playerId);

        when(roomService.createRoom(any(), anyBoolean(), any(), any(), any(), anyInt(), anyBoolean())).thenReturn(mockRoom);

        RoomCreatedResponse response = controller.handleCreateRoom(request, headerAccessor);

        assertNotNull(response);
        assertEquals(roomId.toString(), response.roomId());
        verify(roomService).createRoom(eq("Test Room"), eq(false), eq(null), any(Player.class), eq(RoomMode.NORMAL), eq(5), eq(true));
    }

    @Test
    void joinRoomSuccessfully() {
        CreateRoomRequest.PlayerConfig playerConfig = new CreateRoomRequest.PlayerConfig("JoiningUser", "FEMALE", difficultyValues);

        BaseResponse response = controller.handleJoinRoom(roomId.toString(), playerConfig, headerAccessor);

        assertInstanceOf(JoinResponse.class, response);
        JoinResponse joinResponse = (JoinResponse) response;
        assertNotNull(joinResponse.sessionId());
        verify(roomService).joinRoom(eq(roomId), any(Player.class));
    }

    @Test
    void joinRoomWithInvalidIdReturnsError() {
        CreateRoomRequest.PlayerConfig playerConfig = new CreateRoomRequest.PlayerConfig("JoiningUser", "FEMALE", difficultyValues);
        doThrow(new IllegalArgumentException("Room not found")).when(roomService).joinRoom(any(UUID.class), any(Player.class));

        BaseResponse response = controller.handleJoinRoom(roomId.toString(), playerConfig, headerAccessor);

        assertInstanceOf(ErrorResponse.class, response);
        ErrorResponse errorResponse = (ErrorResponse) response;
        assertEquals("400", errorResponse.code());
        assertEquals("Room not found", errorResponse.message());
    }

    @Test
    void leaveRoomSuccessfully() {
        BaseResponse response = controller.handleLeaveRoom(roomId.toString(), playerId.toString(), headerAccessor);

        assertInstanceOf(JoinResponse.class, response);
        assertEquals(playerId.toString(), ((JoinResponse) response).sessionId());
        verify(roomService).leaveRoom(roomId, playerId, sessionId);
    }

    @Test
    void leaveRoomWithInvalidIdReturnsError() {
        doThrow(new IllegalArgumentException("Invalid ID")).when(roomService).leaveRoom(any(UUID.class), any(UUID.class), anyString());

        BaseResponse response = controller.handleLeaveRoom(roomId.toString(), playerId.toString(), headerAccessor);

        assertInstanceOf(ErrorResponse.class, response);
        assertEquals("400", ((ErrorResponse) response).code());
    }

    @Test
    void kickPlayerSuccessfully() {
        BaseResponse response = controller.handleAdminKickPlayer(roomId.toString(), playerId.toString(), headerAccessor);

        assertInstanceOf(JoinResponse.class, response);
        assertEquals(playerId.toString(), ((JoinResponse) response).sessionId());
        verify(roomService).kickPlayer(roomId, playerId, sessionId);
    }

    @Test
    void getPlayerDifficultySuccessfully() {
        GameRoom mockRoom = mock(GameRoom.class);
        Player mockPlayer = mock(Player.class);
        when(mockPlayer.getDifficultyValues()).thenReturn(difficultyValues);
        when(mockRoom.getPlayer(playerId)).thenReturn(mockPlayer);
        when(roomService.getRoom(roomId)).thenReturn(mockRoom);

        BaseResponse response = controller.handleGetPlayerDifficulty(roomId.toString(), playerId.toString(), headerAccessor);

        assertInstanceOf(GetPlayerDifficultyResponse.class, response);
        GetPlayerDifficultyResponse difficultyResponse = (GetPlayerDifficultyResponse) response;
        assertNotNull(difficultyResponse.difficulty());
        assertEquals(0.3, difficultyResponse.difficulty().easy());
    }

    @Test
    void getPlayerDifficultyWhenRoomNotFoundReturnsError() {
        when(roomService.getRoom(roomId)).thenReturn(null);

        BaseResponse response = controller.handleGetPlayerDifficulty(roomId.toString(), playerId.toString(), headerAccessor);

        assertInstanceOf(ErrorResponse.class, response);
        assertEquals("404", ((ErrorResponse) response).code());
        assertEquals("Room not found", ((ErrorResponse) response).message());
    }

    @Test
    void getPlayerDifficultyWhenPlayerNotFoundReturnsError() {
        GameRoom mockRoom = mock(GameRoom.class);
        when(mockRoom.getPlayer(playerId)).thenReturn(null);
        when(roomService.getRoom(roomId)).thenReturn(mockRoom);

        BaseResponse response = controller.handleGetPlayerDifficulty(roomId.toString(), playerId.toString(), headerAccessor);

        assertInstanceOf(ErrorResponse.class, response);
        assertEquals("404", ((ErrorResponse) response).code());
        assertEquals("Player not found", ((ErrorResponse) response).message());
    }

    @Test
    void changeDifficultySuccessfully() {
        CreateRoomRequest.PlayerConfig playerConfig = new CreateRoomRequest.PlayerConfig("TestUser", "MALE", difficultyValues);

        BaseResponse response = controller.handleChangeDifficulty(roomId.toString(), playerId.toString(), playerConfig, headerAccessor);

        assertInstanceOf(JoinResponse.class, response);
        verify(roomService).changePlayerDifficulty(roomId, playerId, difficultyValues, sessionId);
    }

}