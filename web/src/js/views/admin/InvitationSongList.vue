<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import InfoPopover from 'components/InfoPopover.vue';
import TableComponent from 'components/TableComponent.vue';

import { formatGuestNames } from 'lib/formatter';

/** @type {Ref<Invitation[]>} */
const invitations = ref([]);

useLoader('invitation', invitations);
const songs = computed(() => {
	return invitations.value.flatMap(invitation => (invitation.songs || []).map((song, idx) => ({
		id: `${invitation.id}-${idx}`,
		invitationId: invitation.id,
		name: formatGuestNames(invitation),
		song
	})));
});

const tableOpts = {
	caption: 'Song',
	columns: [
		{ id: 'id', text: 'Invitation' },
		{ id: 'song', text: 'Song', sort(a, b, dir) {
			const nameA = a.song?.toUpperCase();
			const nameB = b.song?.toUpperCase();
			if (nameA < nameB) {
				return dir * -1;
			}
			if (nameA > nameB) {
				return dir * 1;
			}
			return 0;
		} }
	],
	search(item, term) {
		// Match on the invitation ID
		if (item.id === term) {
			return true;
		}
		// Match on the song definition case-insensitively
		if (item.song.toLowerCase().includes(term.toLowerCase())) {
			return true;
		}
		// Otherwise, no match
		return false;
	}
};
</script>

<template>
	<card-body title="Song Requests" :back="{ name: 'Admin Overview' }">
		<div class="card-text">
			<table-component v-slot="{ item }" :items="songs" v-bind="tableOpts">
				<th scope="row" class="font-monospace">
					<router-link :to="{ name: 'Admin View Invitation', params: { invitationId: item.invitationId } }">
						<info-popover :hint="item.name">
							{{ item.invitationId }}
						</info-popover>
					</router-link>
				</th>
				<td>
					<a
						:href="`https://music.youtube.com/search?q=${encodeURIComponent(item.song)}`"
						class="text-decoration-none"
						target="_blank"
						v-text="item.song"
					/>
				</td>
			</table-component>
		</div>
	</card-body>
</template>
