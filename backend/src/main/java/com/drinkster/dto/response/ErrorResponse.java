package com.drinkster.dto.response;

/**
 * ErrorResponse represents an error response in the application.
 *
 * @param code The error code indicating the type of error. (Generally an HTTP status code)
 * @param message The error message providing details about the error.
 */
public record ErrorResponse (int code, String message) implements BaseResponse { }
