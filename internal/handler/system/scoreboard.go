package system

import (
	"zhago/internal/dto"
)

type ScoreboardHandler struct {
	server *ServerHandler
}

func NewScoreboardHandler(server *ServerHandler) *ScoreboardHandler {
	return &ScoreboardHandler{
		server: server,
	}
}

func (h *ScoreboardHandler) Update(data dto.UpdateMatchRequest) {
	if !h.server.IsRunning() {
		return
	}

	msg := dto.MessageRequest{
		Type:    "scoreboard.update",
		Payload: data,
	}

	h.server.Broadcast(msg)
}
