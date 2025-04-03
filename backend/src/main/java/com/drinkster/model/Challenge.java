package com.drinkster.model;

import com.drinkster.model.enums.Sex;
import com.drinkster.model.enums.Difficulty;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Challenge is a class that represents a challenge in the application.
 *
 */
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "challenges")
@Getter
@Setter
@NoArgsConstructor
public class Challenge extends BaseEntity {
    @Column(nullable = false)
    private String text;

    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = false)
    private Difficulty difficulty;

    @ElementCollection
    @CollectionTable(name = "challenge_sexes", joinColumns = @JoinColumn(name = "challenge_id"))
    @Column(name = "sex")
    private List<Sex> sexes = new ArrayList<>();

    @Column(nullable = false)
    private int players;

    @Column(nullable = false)
    private int sips;


    public Challenge(String text, Difficulty diff, List<Sex> sex, int player, int sips) {
        this.text = text;
        this.difficulty = diff;
        this.sexes = sex;
        this.players = player;
        this.sips = sips;
    }


}
