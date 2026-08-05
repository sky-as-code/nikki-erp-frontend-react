import { moduleStoreRegistry, readStoreMethodTag } from '@nikkierp/ui/appState/store';
import { describe, expect, it } from 'vitest';

import { groupService } from './group/groupService';
import { orgService } from './organization/orgService';
import { RoleService, roleService } from './role/roleService';
import { userService } from './user/userService';
import { identityStore } from '../store';


describe('identity module store', () => {
	it('registers itself under the micro-app slug', () => {
		expect(moduleStoreRegistry.get('identity')).toBe(identityStore);
	});

	it('creates one slice per service, named after the class', () => {
		const state = identityStore.getState();

		expect(Object.keys(state).sort()).toEqual(
			['GroupService', 'OrgService', 'RoleService', 'UserService', '__moduleStore'],
		);
	});

	it('gives a subclass with no own methods the full inherited CRUD surface', () => {
		const userState = identityStore.getState().UserService as Record<string, unknown>;

		// UserService declares nothing of its own; every key here comes from CrudServiceBase.
		expect(Object.keys(userState).sort()).toEqual(
			['create', 'delete', 'exists', 'getById', 'getModelSchema', 'getOne', 'manageM2m', 'search', 'setIsArchived', 'update'],
		);
	});

	it('adds each service own methods alongside the inherited ones', () => {
		const orgState = identityStore.getState().OrgService as Record<string, unknown>;

		expect(orgState).toHaveProperty('getBySlug');
		expect(orgState).toHaveProperty('manageUsers');
		expect(orgState).toHaveProperty('search');
	});

	it('excludes the protected internals of CrudServiceBase', () => {
		const roleState = identityStore.getState().RoleService as Record<string, unknown>;

		expect(roleState).not.toHaveProperty('withSchema');
		expect(roleState).not.toHaveProperty('emitEvent');
	});

	it('tags each singleton bound method with its own slice', () => {
		// The same prototype function backs getById on every service, so the tags must
		// still disambiguate — that is what makes useServiceLayer work.
		expect(readStoreMethodTag(userService.getById)?.sliceName).toBe('UserService');
		expect(readStoreMethodTag(groupService.getById)?.sliceName).toBe('GroupService');
		expect(readStoreMethodTag(orgService.getBySlug)?.sliceName).toBe('OrgService');
		expect(readStoreMethodTag(roleService.manageEntitlements)?.sliceName).toBe('RoleService');
	});

	it('keeps the singletons usable as plain services for the command bus', () => {
		// registerCrudService() hands these instances to the Shell's CRUD prefix handler,
		// so decoration must not change how they are called.
		expect(typeof userService.search).toBe('function');
		expect(typeof roleService.manageEntitlements).toBe('function');
		// `@storeService` returns a subclass, so `instanceof` against the exported binding
		// must still hold for anything doing type checks on the singleton.
		expect(roleService).toBeInstanceOf(RoleService);
	});
});
