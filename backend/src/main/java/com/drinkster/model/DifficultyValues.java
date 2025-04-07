package com.drinkster.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DifficultyValues {
    private double easy = 0.3;
    private double medium= 0.35;
    private double hard = 0.35;
    private double extreme = 0;
}
