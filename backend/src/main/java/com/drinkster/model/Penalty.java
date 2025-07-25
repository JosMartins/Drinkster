package com.drinkster.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "penalties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Penalty extends BaseEntity {

    @Column(nullable = false)
    private String text;

    @Column(nullable = false)
    private int rounds;

    @Transient
    private List<String> playerNames = new ArrayList<>();

    /**
     * Constructor for Penalty class.
     *
     * @param text   the text of the penalty
     * @param rounds the number of rounds for the penalty
     */
    public Penalty(String text, int rounds) {
        this.text = text;
        this.rounds = rounds;
    }

    /**
     * Decrements the number of rounds for the penalty.
     */
    public void decrementRound() {
        if (rounds > 0) {
            rounds--;
        }
    }

    public void incrementRound() {
        rounds++;
    }

    @Override
    public String toString() {
        return "Penalty{" +
                "text='" + text + '\'' +
                ", rounds=" + rounds +
                '}';
    }
}
