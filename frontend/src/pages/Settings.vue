<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { StartHTTPServer, StopHTTPServer, IsServerRunning } from "../../wailsjs/go/main/App";

const state = reactive({
	httpPort: "3000",
	isRunning: false,
	isLoading: false,
});

onMounted(async () => {
	try {
		state.isRunning = await IsServerRunning();
	} catch(error) {
		console.error("Failed to check server status:", error);
	}
});

async function toggleServer() {
	state.isLoading = true;

	try {
		if (state.isRunning) {
			// Stop server
			await StopHTTPServer();
			state.isRunning = false;
		} else {
			// Start server
			await StartHTTPServer(state.httpPort);
			state.isRunning = true;
		}
		
	} catch (error) {
		console.error('Server error:', error);
	} finally {
		state.isLoading = false;
	}
}
</script>

<template>
	<div>
		<h1>SETTINGS</h1>
		<div>
			<b>HTTP Server</b>
		</div>
		<div>
			<span>
				<input v-model="state.httpPort" autocomplete="off" type="text"/>
				<button 
					class="btn" :class="{ 'btn-stop': state.isRunning, 'btn-start': !state.isRunning }"
					@click="toggleServer"
					:disabled="state.isLoading"
				>
					{{ state.isLoading ? 'Loading...' : (state.isRunning ? 'Stop Server' : 'Start Server') }}
				</button>
			</span>
		</div>
	</div>
</template>
