package com.drinkster.dto.response;

import com.drinkster.dto.PenaltyDto;
import com.drinkster.dto.PlayerDto;
import com.drinkster.dto.ChallengeDto;

public record ChallengeResponse (ChallengeDto challenge,
                                 PlayerDto[] affectedPlayers,
                                 int round,
                                 PenaltyDto[] penaltyList)
        implements BaseResponse { }
