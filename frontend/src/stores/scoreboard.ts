import { reactive } from 'vue';

export const scoreboardStore = reactive({
  player1Name:       '',
  player1Team:       '',
  player1Score:      0,
  player1Characters: [''] as string[],
  player2Name:       '',
  player2Team:       '',
  player2Score:      0,
  player2Characters: [''] as string[],
  round:             '',
  bestOf:            3,
  activeTournamentId: '',
  activeSetId:        '',
});
