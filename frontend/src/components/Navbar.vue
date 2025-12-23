<script setup lang="ts">
import { RouterLink } from 'vue-router';

</script>

<template>
	<nav>
		<RouterLink to="/">Home</RouterLink>
		<RouterLink to="/events">Events</RouterLink>
		<RouterLink to="/scoreboard">Scoreboard</RouterLink>
		<RouterLink to="/settings">Settings</RouterLink>
	</nav>
</template>
