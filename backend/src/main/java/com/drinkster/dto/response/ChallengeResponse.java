package com.drinkster.dto.response;

import com.drinkster.dto.PenaltyDto;
import com.drinkster.model.Challenge;
import com.drinkster.model.Player;

import java.util.List;

public record ChallengeResponse (Challenge challenge,
                                 List<Player> players,
                                 List<PenaltyDto> penaltyList)
        implements BaseResponse { }
