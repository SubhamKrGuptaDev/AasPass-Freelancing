package com.aaspass.dto.booking;

import java.util.List;

/** What confirming a booking would do: blockers and the pending requests it would auto-reject. */
public record ConfirmPreview(boolean canConfirm, List<BookingResponse> conflictingConfirmed,
                             List<BookingResponse> willAutoReject) {
}
