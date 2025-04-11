package com.drinkster.dto;

public record PlayerDto(
        String id,
        String name,
        String sex,
        boolean isAdmin) {  }
