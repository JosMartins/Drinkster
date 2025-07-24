package com.drinkster.dto.response;

/**
 * * Represents an acknowledgment response for actions performed in a game room.
 *
 * @param action The action that was acknowledged.
 * @param status The status of the action, typically "success" or "failure".
 */
public record AckResponse(String action, String status) implements BaseResponse { }
