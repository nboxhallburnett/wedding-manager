<script setup>
import ScrollSpy from 'bootstrap/js/dist/scrollspy';

import { ref, useTemplateRef, watch, nextTick } from 'vue';
import { VueShowdown } from 'vue-showdown';
import Router from 'router';

import { classExtensions } from 'lib/showdown';
import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';

const content = ref('');
const navItems = ref([]);
const $markdownContent = useTemplateRef('markdown-content');
const aboutLoading = ref(true);
// Create a ref for the scrollspy instance itself.
const scrollSpyInstance = ref(null);

// Fetch the about content from the API
useLoader('about', content, aboutLoading, true);

// Because showdown doesn't generate elements in the structure that bootstrap's scrollspy likes nested navigation to be defined in,
// we're going to have to do a bit of DOM manipulation to get the two to play nicely.
watch(content, () => {
	// To start, we need to wait until the next tick so we give vue time to propagate the content changes into showdown
	// and for it to apply its generated content onto the DOM
	nextTick(() => {
		// Now the DOM is ready, we're going to get the div that showdown generates on the DOM as the target for the elements we're using as reference
		const $generatedContainer = $markdownContent.value.children[0];
		// Then we're getting the NodeList of all the direct children of that containing div
		const $elements = $generatedContainer.querySelectorAll(':scope > *');
		// And create a new div that we will use in place of the element showdown generated
		const $replacementContainer = document.createElement('div');

		// This array will store the array of nav items that will be used to generate the bootstrap scrollspy list
		const navItemsValue = [];
		// And these two sections will be used as a reference in the following loop to keep track of the different
		// structures we need to generate in order to get the DOM and the nav items as we want them
		let domSection;
		let navSection;

		// Loop through the NodeList. We're using a basic for loop as NodeList doesn't support for..of or forEach
		for (let i = 0; i < $elements.length; i++) {
			// Store a convenient reference to the current element for the loop
			const $el = $elements[i];
			// We're using <h4> as the "Top level" nav items
			if ($el.nodeName === 'H4') {
				// If there is a previously defined navigation section, this is the start of a new
				// section so push that completed object into the output array
				if (navSection) {
					navItemsValue.push(navSection);
				}
				// If there is a previously defined DOM section, this is also the start of a new
				// section so push that completed constructed element into the replacement div
				if (domSection) {
					$replacementContainer.appendChild(domSection);
				}
				// Create a new navigation section, storing the ID to use as the navigation target, the text to use
				// for the navigation element, and create an empty array to store any child items
				navSection = {
					id: $el.id,
					title: $el.textContent,
					items: []
				};
				// Store a reference to the elements id
				const id = String($el.id);
				// And remove it so we don't have elements with shared ids
				$el.removeAttribute('id');
				// Create a new DOM section, this is a new element to use as the container for all of the
				// elements that are considered as part of its section in the nav
				domSection = document.createElement('div');
				// Set its id to the one that we just removed from the original header element
				domSection.id = id;
				// Add the header element to the new div
				domSection.appendChild($el);
				// There is nothing else to do for this element, so move on to the next one
				continue;
			}
			// We're using <h5> as second level nav items
			if ($el.nodeName === 'H5') {
				// There should never be a h5 without a parent h4, so start off by adding this element's
				// id and text into the parent nav section object
				navSection.items.push({
					id: $el.id,
					title: $el.textContent
				});
				// If there is a previously defined DOM section, because of how bootstrap tracks elements
				// even though it is part of an existing navigation group, the second level navigation items
				// need to be siblings to the top level items on the DOM, so treat this as the start of a new
				// DOM section by pushing the previously constructed element into the replacement div
				if (domSection) {
					$replacementContainer.appendChild(domSection);
				}
				// And perform the same dom section generation that was done for <h4> elements above
				const id = String($el.id);
				$el.removeAttribute('id');
				domSection = document.createElement('div');
				domSection.id = id;
				domSection.appendChild($el);
				// Once again there is nothing else to do for this element, so move on to the next
				continue;
			}
			// If the item is not a header but there is no current containing DOM section (meaning this is some sort of
			// leading content before we get into the list) then just add it directly to the replacement div
			if (!domSection) {
				$replacementContainer.appendChild($el);
				// And move on to the next element
				continue;
			}
			// Finally, this isn't a heading to start a new section and we know it is a child element of
			// a heading, so add the current element to the current DOM section
			domSection.appendChild($el);
		}
		// Now that we're done with the elements, add the final nav section to the nav items output array
		navItemsValue.push(navSection);
		// And the final DOM section to the replacement div
		$replacementContainer.appendChild(domSection);
		// Set the nav items array to the ref that the DOM is listening to to trigger it to generate the appropriate
		// elements for the nav menu
		navItems.value = navItemsValue;
		// Replace the children of the container that showdown generated with our restructured items
		$generatedContainer.replaceChildren($replacementContainer);
		// Allow vue to propagate our changes onto the DOM
		nextTick(() => {
			// Get the calculated scroll margin offset to pass through to the scrollSpy instance
			const scrollMargin = Number(window.getComputedStyle(domSection).scrollMarginTop.split('px')[0]);
			// Finally create the bootstrap scrollspy instance now that the target element exists on the DOM
			scrollSpyInstance.value = new ScrollSpy(document.getElementById('app-container'), {
				target: '#about-navbar',
				offset: scrollMargin * -1
			});

			// Check generated links to ensure we're handling internal navigation efficiently
			const $anchors = $replacementContainer.getElementsByTagName('a');
			for (let i = 0; i < $anchors.length; i++) {
				const $anchor = $anchors[i];
				// If it's an external link, leave it as-is
				if (!$anchor.href.startsWith('/') && !$anchor.href.startsWith(window.location.origin)) {
					return;
				}
				// Otherwise, override its click handler to go through vue-router
				$anchor.addEventListener('click', evt => {
					// If either ctrl or meta was held, let the browser handle it natively
					if (evt.ctrlKey || evt.metaKey) {
						return;
					}
					// Otherwise, prevent the default handling
					evt.preventDefault();
					evt.stopPropagation();
					// And perform the navigation using the router
					Router.push($anchor.href.replace(window.location.origin, ''));
				});
			}
		});
	});
});

function scrollToItem(id) {
	document.getElementById(id).scrollIntoView({
		behavior: 'smooth'
	});
}
</script>

<template>
	<card-body title="Details">
		<div v-show="content" class="card-text row">
			<div
				ref="markdown-content"
				class="col-12 col-md-8 scrollspy-container"
				data-bs-spy="scroll"
				data-bs-target="#about-navbar"
				tabindex="0"
			>
				<vue-showdown flavor="github" :markdown="content" :extensions="classExtensions" />
			</div>
			<div class="d-none d-md-block col-4 border-start">
				<nav id="about-navbar" class="flex-column align-items-stretch">
					<nav class="nav nav-pills flex-column">
						<template v-for="section in navItems" :key="section.id">
							<a
								class="nav-link"
								:href="`#${section.id}`"
								v-text="section.title"
								@click.prevent="scrollToItem(section.id)"
							/>
							<nav v-if="section.items.length" class="nav nav-pills flex-column">
								<a
									v-for="item in section.items"
									:key="item.id"
									class="nav-link ms-3 my-1"
									:href="`#${item.id}`"
									v-text="item.title"
									@click.prevent="scrollToItem(item.id)"
								/>
							</nav>
						</template>
					</nav>
				</nav>
			</div>
		</div>
		<div v-if="aboutLoading" class="placeholder-wave">
			<span class="placeholder w-100 rounded-1" />
			<span class="placeholder w-75 rounded-1" />
			<span class="placeholder w-100 rounded-1" />
			<span class="placeholder w-25 rounded-1" />
			<br>
			<br>
			<span class="placeholder w-100 rounded-1" />
			<span class="placeholder w-100 rounded-1" />
			<span class="placeholder w-50 rounded-1" />
			<br>
			<br>
			<span class="placeholder w-100 rounded-1" />
			<span class="placeholder w-25 rounded-1" />
		</div>
	</card-body>
</template>

<style lang="scss" scoped>
#about-navbar {
	position: sticky;
	top: calc((var(--card-offset) * -1) + var(--header-height) + 16px);
	overflow-y: scroll;
	max-height: fit-content;

	// Set the height to the mozilla max content value to get around firefox not respecting max-height: fit-content;
	height: max-content;
}
</style>

<style lang="scss">
.scrollspy-container div {
	scroll-margin-top: calc(var(--header-height) + 1rem);
}
</style>
