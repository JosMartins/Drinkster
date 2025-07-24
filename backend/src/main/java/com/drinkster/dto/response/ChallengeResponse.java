package com.drinkster.dto.response;

import com.drinkster.dto.PenaltyDto;
import com.drinkster.dto.PlayerDto;
import com.drinkster.dto.ChallengeDto;

/**
 * ChallengeResponse represents the response to a challenge in a game.
 *
 * @param challenge The challenge details. {@link ChallengeDto}
 * @param affectedPlayers The players affected by the challenge. {@link PlayerDto}
 * @param round The round in which the challenge occurred.
 * @param penaltyList The list of penalties applied as a result of the challenge. {@link PenaltyDto}
 */
public record ChallengeResponse (ChallengeDto challenge,
                                 PlayerDto[] affectedPlayers,
                                 int round,
                                 PenaltyDto[] penaltyList)
        implements BaseResponse { }
