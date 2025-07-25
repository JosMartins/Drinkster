package com.drinkster.dto.response;

/**
 * * Represents an acknowledgment response for actions performed in a game room.
 *
 * @param action The action that was acknowledged.
 * @param status The status of the action.
 */
public record AckResponse(String action, boolean status) implements BaseResponse { }
