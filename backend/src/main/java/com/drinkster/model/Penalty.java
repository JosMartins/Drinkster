package com.drinkster.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "penalties")
@Getter
@Setter
@NoArgsConstructor
public class Penalty extends BaseEntity {

    @Column(nullable = false)
    private String text;

    @Column(nullable = false)
    private int rounds;

    @Transient
    private List<String> playerNames = new ArrayList<>();

}
