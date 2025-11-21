<script setup lang="ts">
import { reactive } from 'vue';
import { Save } from '../../wailsjs/go/main/App'

interface MatchData {
	player1Name: string
	player1Team: string
	player1Score: number
	player2Name: string
	player2Team: string
	player2Score: number
	round: string
}

const matchData: MatchData = reactive({
	player1Name: "",
	player1Team: "",
	player1Score: 0,
	player2Name: "",
	player2Team: "",
	player2Score: 0,
	round: "",
});

function save() {
	Save(matchData);
}

</script>

<template>
	<div>
		<main>
			<h1>SCOREBOARD</h1>
			<div id="player1-input">
				<span>
					<b>Player 1 Name</b>
					<input id="player1-name" v-model="matchData.player1Name" type="text" autocomplete="off"/>
				</span>
				<span>
					<b>Player 1 Team</b>
					<input id="player1-team" v-model="matchData.player1Team" type="text" autocomplete="off"/>
				</span>
				<span>
					<b>Player 1 Score</b>
					<input id="player1-score" v-model="matchData.player1Score" type="number" autocomplete="off"/>
				</span>
			</div>
			<div id="player2-input">
				<span>
					<b>Player 2 Name</b>
					<input id="player2-name" v-model="matchData.player2Name" type="text" autocomplete="off"/>
				</span>
				<span>
					<b>Player 2 Team</b>
					<input id="player2-team" v-model="matchData.player2Team" type="text" autocomplete="off"/>
				</span>
				<span>
					<b>Player 2 Score</b>
					<input id="player2-score" v-model="matchData.player2Score" type="number" autocomplete="off"/>
				</span>
			</div>
			<div id="round-input">
				<span>
					<b>Round</b>
					<input id="round" v-model="matchData.round" type="text" autocomplete="off" />
				</span>
			</div>
			<button class="btn" @click="save">Save</button>
		</main>	
	</div>
</template>

