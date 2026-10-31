package com.aaspass.dto.booking;

import java.util.List;

public record ScheduleResponse(int slotMinutes, List<ScheduleDay> days) {
}
