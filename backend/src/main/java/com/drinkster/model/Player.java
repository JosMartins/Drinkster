package com.drinkster.model;

import com.drinkster.model.enums.Sex;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class Player {

    private UUID id;
    private String name;
    private Sex sex;
    private String socketId;
    private DifficultyValues difficultyValues;
    private List<Penalty> penalties;
    private int isAdmin;
    private int isReady;
    private int isPlaying;


    public Player() {
        this.id = UUID.randomUUID();
        this.difficultyValues = new DifficultyValues();
        this.penalties = new ArrayList<>();
    }

    public void addPenalty(Penalty penalty) {
        this.penalties.add(penalty);
    }

    public void removePenalty(Penalty penalty) {
        this.penalties.remove(penalty);
    }

}
