import { inject } from 'vue';
import { createRouter, createWebHistory, isNavigationFailure } from 'vue-router';

import API from 'lib/api';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			name: 'Login',
			component: () => import('../views/LoginView.vue'),
			beforeEnter: () => {
				// If the user has already signed in, redirect them to the home page instead
				const invitation = inject('invitation');
				if (invitation.value && !invitation.value.pending) {
					return { name: 'Home' };
				}
			}
		},
		{
			path: '/',
			name: 'Home',
			component: () => import('../views/HomeView.vue'),
			meta: { session: true }
		},
		{
			path: '/edit',
			name: 'Edit Invitation',
			component: () => import('../views/InvitationEdit.vue'),
			meta: { session: true }
		},
		{
			path: '/about',
			name: 'About',
			component: () => import('../views/AboutView.vue'),
			meta: { session: true }
		},
		{
			path: '/question',
			name: 'Q&A',
			component: () => import('../views/QAndA.vue'),
			meta: { session: true }
		},
		{
			path: '/gallery',
			name: 'Gallery',
			component: () => import('../views/GalleryView.vue'),
			meta: { session: true }
		},
		{
			path: '/story',
			name: 'Our Story',
			component: () => import('../views/OurStory.vue'),
			meta: { session: true }
		},
		{
			path: '/admin',
			name: 'Admin Overview',
			component: () => import('../views/admin/Index.vue'),
			meta: { admin: true },
			children: [
				{
					path: 'stats',
					name: 'Admin Stats',
					component: () => import('../views/admin/InvitationStats.vue')
				},
				{
					path: 'calendar',
					name: 'Admin List Calendar Events',
					component: () => import('../views/admin/CalendarList.vue')
				},
				{
					path: 'calendar/new',
					name: 'Admin Create Calendar Event',
					component: () => import('../views/admin/CalendarEdit.vue')
				},
				{
					path: 'calendar/:calendarEventId/edit',
					name: 'Admin Edit Calendar Event',
					component: () => import('../views/admin/CalendarEdit.vue')
				},
				{
					path: 'calendar/:calendarEventId',
					name: 'Admin View Calendar Event',
					component: () => import('../views/admin/CalendarView.vue')
				},
				{
					path: 'invitation',
					name: 'Admin List Invitations',
					component: () => import('../views/admin/InvitationList.vue')
				},
				{
					path: 'invitation/:invitationId',
					name: 'Admin View Invitation',
					component: () => import('../views/InvitationView.vue')
				},
				{
					path: 'invitation/:invitationId/card',
					name: 'Admin View Invitation Card',
					component: () => import('../views/admin/InvitationCard.vue')
				},
				{
					path: 'invitation/new',
					name: 'Admin Create Invitation',
					component: () => import('../views/admin/InvitationCreate.vue')
				},
				{
					path: 'invitation/:invitationId/edit',
					name: 'Admin Edit Invitation',
					component: () => import('../views/InvitationEdit.vue')
				},
				{
					path: 'songs',
					name: 'Admin List Invitation Songs',
					component: () => import('../views/admin/InvitationSongList.vue')
				},
				{
					path: 'messages',
					name: 'Admin List Invitation Messages',
					component: () => import('../views/admin/InvitationMessageList.vue')
				},
				{
					path: 'menu',
					name: 'Admin List Menu Items',
					component: () => import('../views/admin/MenuList.vue')
				},
				{
					path: 'menu/card',
					name: 'Admin View Menu Card',
					component: () => import('../views/admin/MenuCard.vue')
				},
				{
					path: 'menu/:menuItemId',
					name: 'Admin View Menu Item',
					component: () => import('../views/admin/MenuView.vue')
				},
				{
					path: 'menu/new',
					name: 'Admin Create Menu Item',
					component: () => import('../views/admin/MenuEdit.vue')
				},
				{
					path: 'menu/:menuItemId/edit',
					name: 'Admin Edit Menu Item',
					component: () => import('../views/admin/MenuEdit.vue')
				},
				{
					path: 'about',
					name: 'Admin Edit About Content',
					component: () => import('../views/admin/AboutEdit.vue')
				},
				{
					path: 'question',
					name: 'Admin Q&A Content',
					component: () => import('../views/admin/QAndAEdit.vue')
				},
				{
					path: 'gallery',
					name: 'Admin Gallery Content',
					component: () => import('../views/admin/GalleryEdit.vue')
				},
				{
					path: 'story',
					name: 'Admin Our Story Content',
					component: () => import('../views/admin/OurStoryEdit.vue')
				},
				{
					path: 'feedback',
					name: 'Admin List Feedback Items',
					component: () => import('../views/admin/FeedbackList.vue')
				},
				{
					path: 'token',
					name: 'Admin List Auth Tokens',
					component: () => import('../views/admin/TokenList.vue')
				},
				{
					path: 'token/new',
					name: 'Admin Create Auth Token',
					component: () => import('../views/admin/TokenEdit.vue')
				},
				{
					path: 'seating',
					name: 'Admin View Seating Plan',
					component: () => import('../views/admin/SeatingView.vue')
				},
				{
					path: 'seating/edit',
					name: 'Admin Edit Seating Plan',
					component: () => import('../views/admin/SeatingEdit.vue')
				},
				{
					path: 'seating/layout',
					name: 'Admin Edit Seating Layout',
					component: () => import('../views/admin/SeatingLayoutEdit.vue')
				},
				{
					path: 'palette',
					name: 'Admin View Colour Palette',
					component: () => import('../views/admin/PaletteView.vue')
				},
				{
					path: 'admin',
					name: 'Admin View Administrators',
					component: () => import('../views/admin/AdminList.vue')
				},
				{
					path: 'admin/new',
					name: 'Admin Create Administrator',
					component: () => import('../views/admin/AdminCreate.vue')
				},
				{
					path: 'telemetry',
					name: 'Admin List Telemetry',
					component: () => import('../views/admin/TelemetryList.vue')
				}
			]
		},
		{
			path: '/:pathMatch(.*)+',
			name: '404',
			component: () => import('../views/NotFound.vue'),
			beforeEnter: to => {
				const invitation = inject('invitation');
				// If we're navigating to the 404 page without a valid session, redirect instead to the login page
				// with the requested path as a redirect.
				if (!invitation.value?.id) {
					return { name: 'Login', query: { redirect: to.fullPath } };
				}
			}
		}
	]
});

router.beforeEach(to => {
	const invitation = inject('invitation');
	if (to.meta?.session && !invitation.value?.id) {
		return { name: '404', params: { pathMatch: to.path.split('/').slice(1) } };
	}
	if (to.meta?.admin && !invitation.value?.admin) {
		return { name: '404', params: { pathMatch: to.path.split('/').slice(1) } };
	}
});

router.afterEach(to => {
	// Publish telemetry for non-admin navigation requests
	const invitation = inject('invitation');
	if (!invitation.value?.admin) {
		const event = {
			path: to.path,
			path_match: to.matched?.at(-1)?.path || null,
			path_name: to.name,
			viewport: getCurrentViewportSize()
		};
		API('telemetry', { method: 'POST', body: event });
	}
});

// Add a global error handler for navigation failures
router.onError((error, to) => {
	if (isNavigationFailure(error)) {
		// Fall through on navigation guard failures
		return;
	}

	// Check for chunk load errors and force a page reload to ensure we've got the latest assets
	if (error.name === 'ChunkLoadError') {
		console.error('Failed to load chunk. Refreshing...');
		// If we're navigating to somewhere other than the current path,
		// perform a direct page load rather than using the router
		if (to.fullPath !== window.location.pathname) {
			return window.location = to.fullPath;
		}
		// Otherwise force a page reload
		window.location.reload();
	} else {
		console.error('Routing error:', error);
	}
});

export default router;

// Named bootstrap breakpoints in pixels
const breakpoints = {
	sm: 576,
	md: 768,
	lg: 992,
	xl: 1200,
	xxl: 1400
};

/**
 * Determine the matching bootstrap breakpoint size of the current viewport
 *
 * @returns {String}
 */
function getCurrentViewportSize() {
	let currentBreakpoint = 'xs';

	for (const breakpoint in breakpoints) {
		const minWidth = breakpoints[breakpoint];
		if (window.matchMedia(`(min-width: ${minWidth}px)`).matches) {
			currentBreakpoint = breakpoint;
		}
	}

	return currentBreakpoint;
}
