package com.drinkster.dto.response;

public record ErrorResponse (String code, String message) implements BaseResponse { }
