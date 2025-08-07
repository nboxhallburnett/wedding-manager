<script setup>
import { computed, inject, ref, onMounted, useTemplateRef } from 'vue';
import Router from 'router';

import QRCodeStyling from 'qr-code-styling';
import { toBlob, toPng } from 'html-to-image';

import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';
import CustomHR from 'components/CustomHR.vue';

const bride = CONFIG.bride;
const groom = CONFIG.groom;
const date = new Date(CONFIG.date).toDateString();
const where = CONFIG.client.footer[0].text;

const reFill = / fill="(\w+)"/;
const reViewbox = / viewBox="([\d ]+)"/;

/** @type {AddToast} */
const addToast = inject('addToast');
/** @type {Ref<Invitation>} */
const invitation = ref({});
const rsvpLocation = ref('');
const $qrCode = useTemplateRef('qrCode');
const $card = useTemplateRef('card');
const qrCodeSize = 150;
const qrCodeSizePx = ref(`${qrCodeSize}px`);
const borderContent = ref('');

const listFormatter = new Intl.ListFormat('en', {
	style: 'long',
	type: 'conjunction'
});

const guestMsg = computed(() => {
	if (!invitation.value.guests?.length) {
		return '';
	}
	// Get the set of defined names from the invitation
	const names = invitation.value.guests?.map(guest => guest.name).filter(Boolean);
	// Check how many additional guests are part of the invitation without a name defined
	const additionalGuests = invitation.value.guests.length - names.length;
	// If there are any unnamed guests, add a final section just as that count
	if (additionalGuests) {
		names.push(`${additionalGuests} Guest${additionalGuests > 1 ? 's' : ''}`);
	}
	// And output the formatted list string
	return listFormatter.format(names);
});

useLoader(`invitation/${Router.currentRoute.value.params.invitationId}`, invitation);

onMounted(async () => {
	// The rsvp location is the hostname of the current window
	rsvpLocation.value = window.location.hostname;

	// Fetch the themed colours to use for the QR code content
	const primaryColour = getComputedStyle($card.value).getPropertyValue('--bs-primary');
	const dotColour = getComputedStyle($card.value).getPropertyValue('--bs-secondary-color');

	// Fetch the ring and border svg content from the server
	const [ ringSvg, borderSvg ] = await Promise.all([
		fetch('/img/ring.svg'),
		fetch('/img/invitation/border.svg')
	]);
	// Get their text value
	const [ ringSvgContent, borderSvgContent ] = await Promise.all([
		ringSvg.text(),
		borderSvg.text()
	]);
	const themedRingSvg = ringSvgContent
		// Replace the ring svg fill colour with the themed primary colour
		.replace(reFill, ` fill="${primaryColour}"`)
		// And its view box to be square to better fit the QR code instead of its use as a loading spinner
		.replace(reViewbox, ' viewBox="377 256 300 300"');

	borderContent.value = borderSvgContent
		// Replace the border fill colour with the themed primary colour
		.replace(reFill, ` fill="${primaryColour}"`);

	// Generate the themed QR code to point to the specific users id
	const qrCode = new QRCodeStyling({
		width: qrCodeSize,
		height: qrCodeSize,
		data: `${window.location.origin}/?id=${Router.currentRoute.value.params.invitationId}`,
		image: 'data:image/svg+xml,' + encodeURIComponent(themedRingSvg),
		dotsOptions: {
			color: dotColour,
			type: 'rounded',
			gradient: {
				type: 'radial',
				rotation: 0,
				colorStops: [
					{ offset: 0.3, color: primaryColour },
					{ offset: 1, color: dotColour }
				]
			}
		},
		cornersSquareOptions: {
			color: dotColour,
			type: 'rounded',
			gradient: {
				type: 'linear',
				rotation: 180,
				colorStops: [ { offset: 0, color: primaryColour }, { offset: 0.7, color: dotColour } ]
			}
		},
		cornersDotOptions: {
			color: dotColour,
			type: 'extra-rounded',
			gradient: {
				type: 'linear',
				rotation: 180,
				colorStops: [ { offset: 0, color: primaryColour }, { offset: 0.7, color: dotColour } ]
			}
		}
	});
	// And finally add the generated QR code to the DOM
	qrCode.append($qrCode.value);
});

/**
 * Trigger the download of the invitation card as a PNG
 */
async function downloadImage() {
	const dataUrl = await toPng($card.value, {
		cacheBust: true,
		style: { margin: 0 }
	});
	const link = document.createElement('a');
	link.download = 'invitation.png';
	link.href = dataUrl;
	link.click();
}

/**
 * Attempt to share the invitation card using the web share API level 2
 */
async function shareImage() {
	// Create a blob of the invitation card
	const blob = await toBlob($card.value, {
		cacheBust: true,
		style: { margin: 0 }
	});
	// Create a File object from the blob
	const file = new File([ blob ], 'invitation.png', { type: 'image/png' });
	const shareData = {
		text: 'You\'re invited to our wedding!',
		title: 'You\'re invited to our wedding!',
		files: [ file ]
	};
	// Check if the
	if (navigator.canShare && navigator.canShare(shareData)) {
		try {
			await navigator.share(shareData);
		} catch (err) {
			addToast({
				title: 'Error sharing invitation card',
				body: String(err)
			});
			console.error('Error sharing invitation card', err);
		}
	} else {
		addToast({
			title: 'Error sharing invitation card',
			body: 'Your browser or device doesn\'t support sharing png files.'
		});
	}
}
</script>

<template>
	<card-header title="Invitation">
		<router-link class="btn btn-link btn-sm me-2" :to="{ name: 'Admin List Invitations' }">
			Back
		</router-link>
		<button class="btn btn-primary btn-sm" @click="downloadImage">
			Download
		</button>
		<button class="btn btn-primary btn-sm ms-2" @click="shareImage">
			Share
		</button>
	</card-header>
	<div ref="card" class="card shadow ratio ratio-1x1" data-bs-theme="light">
		<div class="card-body">
			<div class="card-content text-body-secondary">
				<div class="card-text h-100">
					<div id="invitation-header" class="text-center">
						<div id="title" class="font-script text-body" v-text="'You\'re Invited'" />
						<div class="mb-4" v-text="'the wedding of'" />
						<div class="font-script text-body h2" v-text="bride" />
						<div class="my-2" v-text="'and'" />
						<div class="font-script text-body h2" v-text="groom" />
						<custom-h-r class="d-inline-block w-66 mb-1" />
						<div class="font-script text-body h3" v-text="date" />
						<div class="mt-4" v-text="where" />
						<div class="mt-1 text-body-tertiary small" v-text="'Reception to follow'" />
					</div>
					<div id="invitation-footer">
						<div>
							<b class="pe-1">To:</b> {{ guestMsg }}
						</div>
						<div class="py-4">
							<b class="pe-1">RSVP:</b> <span class="text-decoration-underline link-underline-primary" v-text="rsvpLocation" />
						</div>
						<div>
							<b class="pe-1">ID:</b> <span class="font-monospace" v-text="invitation.id" />
						</div>
					</div>
				</div>

				<div id="decoration-top-left" v-html="borderContent" />
				<div id="decoration-top-right" v-html="borderContent" />
				<div id="qr-code" ref="qrCode" class="pe-2" />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
$invitation-border-size: 5px;
$qr-code-size: v-bind(qrCodeSizePx);

#invitation-header {
	#title {
		font-size: 3.3rem;
	}
}

#invitation-footer {
	position: absolute;
	max-width: 410px;
	bottom: $invitation-border-size;
	height: $qr-code-size;
}

.card {
	width: 600px;
	left: 0;
	margin-left: calc(50% - 300px);
	z-index: 12;
	user-select: none;

	hr {
		border-color: var(--bs-primary);
		color: var(--bs-primary);
		opacity: 1;
	}
}

.card-body {
	width: 100%;
	padding: $invitation-border-size;
	border: 2px solid var(--bs-primary);

	&::before,
	&::after {
		content: ' ';
		position: absolute;
		/* stylelint-disable-next-line declaration-property-value-no-unknown */
		width: 3 * $invitation-border-size;
		/* stylelint-disable-next-line declaration-property-value-no-unknown */
		height: 3 * $invitation-border-size;
		/* stylelint-disable-next-line declaration-property-value-no-unknown */
		font-size: 3 * $invitation-border-size;
		color: var(--bs-primary);
		border: 2px solid var(--bs-primary);
		/* stylelint-disable-next-line declaration-property-value-no-unknown */
		line-height: 3 * $invitation-border-size;
		top: $invitation-border-size;
		text-align: center;
	}

	&::before {
		left: $invitation-border-size;
	}

	&::after {
		right: $invitation-border-size;
	}

	.card-content {
		border: 2px solid var(--bs-primary);
		height: 100%;
		padding: 1rem;

		&::before,
		&::after {
			content: ' ';
			position: absolute;
			/* stylelint-disable-next-line declaration-property-value-no-unknown */
			width: 3 * $invitation-border-size;
			/* stylelint-disable-next-line declaration-property-value-no-unknown */
			height: 3 * $invitation-border-size;
			/* stylelint-disable-next-line declaration-property-value-no-unknown */
			font-size: 3 * $invitation-border-size;
			color: var(--bs-primary);
			border: 2px solid var(--bs-primary);
			/* stylelint-disable-next-line declaration-property-value-no-unknown */
			line-height: 3 * $invitation-border-size;
			bottom: $invitation-border-size;
			text-align: center;
		}

		&::before {
			left: $invitation-border-size;
		}

		&::after {
			right: $invitation-border-size;
		}
	}
}

.card-text {
	font-size: medium;
}

#decoration-top-left,
#decoration-top-right {
	position: absolute;
	top: $invitation-border-size * 2;
}

#decoration-top-left {
	left: $invitation-border-size * 2;
}

#decoration-top-right {
	right: $invitation-border-size * 2;
	transform: rotate(90deg);
}

#qr-code {
	position: absolute;
	bottom: $invitation-border-size;
	right: $invitation-border-size;
}
</style>
