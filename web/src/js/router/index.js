import { inject } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			name: 'Login',
			component: () => import('../views/LoginView.vue'),
			beforeEnter: (to, from, next) => {
				// If the user has already signed in, redirect them to the home page instead
				const invitation = inject('invitation');
				if (invitation.value) {
					return next({ name: 'Home' });
				}
				next();
			}
		},
		{
			path: '/',
			name: 'Home',
			component: () => import('../views/HomeView.vue')
		},
		{
			path: '/edit',
			name: 'Edit Invitation',
			component: () => import('../views/EditRSVP.vue'),
			meta: { session: true }
		},
		{
			path: '/about',
			name: 'About',
			component: () => import('../views/AboutView.vue')
		},
		{
			path: '/gallery',
			name: 'Gallery',
			component: () => import('../views/GalleryView.vue'),
			meta: { session: true }
		},
		{
			path: '/admin',
			name: 'Admin Overview',
			component: () => import('../views/AdminOverview.vue'),
			meta: { admin: true }
		},
		{
			path: '/admin/calendar',
			name: 'Admin List Calendar Events',
			component: () => import('../views/AdminListCalendar.vue'),
			meta: { admin: true }
		},
		{
			path: '/admin/calendar/new',
			name: 'Admin Create Calendar Event',
			component: () => import('../views/AdminEditCalendar.vue'),
			meta: { admin: true }
		},
		{
			path: '/admin/calendar/:calendarEventId/edit',
			name: 'Admin Edit Calendar Event',
			component: () => import('../views/AdminEditCalendar.vue'),
			meta: { admin: true }
		},
		{
			path: '/admin/calendar/:calendarEventId',
			name: 'Admin View Calendar Event',
			component: () => import('../views/AdminViewCalendar.vue'),
			meta: { admin: true }
		},
		{
			path: '/admin/invitation',
			name: 'Admin List Invitations',
			component: () => import('../views/AdminListInvitations.vue'),
			meta: { admin: true }
		},
		{
			path: '/admin/invitation/new',
			name: 'Admin Create Invitation',
			component: () => import('../views/AdminCreateInvitation.vue'),
			meta: { admin: true }
		},
		{
			path: '/admin/invitation/:invitationId',
			name: 'Admin Edit Invitation',
			component: () => import('../views/EditRSVP.vue'),
			meta: { admin: true }
		},
		{
			path: '/admin/menu',
			name: 'Admin List Menu Items',
			component: () => import('../views/AdminListMenu.vue'),
			meta: { admin: true }
		},
		{
			path: '/admin/menu/:menuItemId',
			name: 'Admin View Menu Item',
			component: () => import('../views/AdminViewMenu.vue'),
			meta: { admin: true }
		},
		{
			path: '/admin/menu/new',
			name: 'Admin Create Menu Item',
			component: () => import('../views/AdminEditMenu.vue'),
			meta: { admin: true }
		},
		{
			path: '/admin/menu/:menuItemId/edit',
			name: 'Admin Edit Menu Item',
			component: () => import('../views/AdminEditMenu.vue'),
			meta: { admin: true }
		},
		{
			path: '/:pathMatch(.*)+',
			name: '404',
			component: () => import('../views/NotFound.vue')
		}
	]
});

router.beforeEach((to, from, next) => {
	const invitation = inject('invitation');
	if (to.meta?.session && !invitation.value?.id) {
		return next({ name: '404', params: { pathMatch: to.path.split('/').slice(1) } });
	}
	if (to.meta?.admin && !invitation.value?.admin) {
		return next({ name: '404', params: { pathMatch: to.path.split('/').slice(1) } });
	}

	next();
});

export default router;
