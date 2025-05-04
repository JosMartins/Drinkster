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
    private List<Penalty> penalties = new ArrayList<>();
    private int drinks = 0;
    private boolean isAdmin = false;
    private boolean isReady = false;
    private boolean isPlaying = false;


    public Player() {
        this.id = UUID.randomUUID();
        this.difficultyValues = new DifficultyValues();
    }

    public Player(String name, Sex sex, DifficultyValues difficultyValues, boolean admin, String socket) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.sex = sex;
        this.difficultyValues = difficultyValues;
        this.socketId = socket;
        this.isAdmin = admin;
    }

    public void addPenalty(Penalty penalty) {
        this.penalties.add(penalty);
    }

    public void removePenalty(Penalty penalty) {
        this.penalties.remove(penalty);
    }

    public void addSips(int sips) {
        this.drinks += sips;
    }

    public void processPenalties() {
        for (Penalty penalty : penalties) {
            if (penalty.getRounds() > 0) {
                penalty.decrementRound();
            } else {
                penalties.remove(penalty);
            }

        }
        penalties.clear();
    }
}
