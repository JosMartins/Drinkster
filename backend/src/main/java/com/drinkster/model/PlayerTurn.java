package com.drinkster.model;

import java.util.List;

public record PlayerTurn  (Player player, Challenge challenge, List<Player> affectedPlayers) {  }