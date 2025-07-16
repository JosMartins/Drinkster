package com.drinkster.dto.response;

public record ErrorResponse (int code, String message) implements BaseResponse { }
