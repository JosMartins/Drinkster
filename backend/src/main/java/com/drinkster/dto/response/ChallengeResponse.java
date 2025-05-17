package com.drinkster.dto.response;

import com.drinkster.dto.PenaltyDto;
import com.drinkster.dto.PlayerDto;
import com.drinkster.dto.ChallengeDto;

import java.util.List;

public record ChallengeResponse (ChallengeDto challenge,
                                 List<PlayerDto> affectedPlayers,
                                 int round,
                                 List<PenaltyDto> penaltyList)
        implements BaseResponse { }
