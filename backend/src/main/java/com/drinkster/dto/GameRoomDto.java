package com.drinkster.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class GameRoomDto {

    private String roomId;
    private String roomName;
    private boolean isPrivate;
    private String password;
    private int playerCount;
    private String roomState;

}
