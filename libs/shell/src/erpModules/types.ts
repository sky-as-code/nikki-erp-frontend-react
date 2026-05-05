import * as dyn from '@nikkierp/common/dynamic_model';


export type CreateModuleRequest = Record<string, any>;
export type CreateModuleResponse = dyn.RestCreateResponse;

export type DeleteModuleRequest = dyn.RestDeleteRequest;
export type DeleteModuleResponse = dyn.RestDeleteResponse;

export type GetModuleSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetModuleRequest = dyn.RestGetByIdRequest;
export type GetModuleResponse = dyn.RestGetOneResponse<Module>;

export type SearchModuleRequest = dyn.RestSearchRequest;
export type SearchModuleResponse = dyn.RestSearchResponse<Module>;

export type SetModuleIsArchivedRequest = dyn.RestSetIsArchivedRequest;
export type SetModuleIsArchivedResponse = dyn.RestMutateResponse;

export type ModuleExistsRequest = dyn.RestExistsRequest;
export type ModuleExistsResponse = dyn.RestExistsResponse;

export type UpdateModuleRequest = dyn.RestUpdateRequest;
export type UpdateModuleResponse = dyn.RestMutateResponse;

export type ModuleLabelRef = {
	$ref: string;
};

export type Module = {
	id: string;
	etag: string;
	created_at: string;
	is_internal: boolean;
	is_orphaned: boolean;
	label?: ModuleLabelRef;
	name: string;
	version: string;
};

/**
Sample get module request: GET essential/modules?page=0&size=500
Sample get module response:
{
  "items": [
    {
      "created_at": "2026-05-03T05:57:11Z",
      "etag": "1777787831117331200",
      "id": "01KQP6K0TD79FJMRP1W6040ZFW",
      "is_internal": false,
      "is_orphaned": false,
      "label": {
        "$ref": "settings.moduleLabel"
      },
      "name": "settings",
      "version": "v1.0.0"
    },
    {
      "created_at": "2026-05-03T05:57:11Z",
      "etag": "1777787831118822900",
      "id": "01KQP6K0TEAWQCC0W6EQF1T9HD",
      "is_internal": false,
      "is_orphaned": false,
      "label": {
        "$ref": "identity.moduleLabel"
      },
      "name": "identity",
      "version": "v1.0.0"
    },
    {
      "created_at": "2026-05-03T05:57:11Z",
      "etag": "1777787831120242600",
      "id": "01KQP6K0TGY17682M58C068ZVS",
      "is_internal": false,
      "is_orphaned": false,
      "label": {
        "$ref": "headquarters.moduleLabel"
      },
      "name": "headquarters",
      "version": "v1.0.0"
    },
    {
      "created_at": "2026-05-03T05:57:11Z",
      "etag": "1777787831121615500",
      "id": "01KQP6K0THM1QTBN7RDFCRXWMS",
      "is_internal": false,
      "is_orphaned": false,
      "label": {
        "$ref": "inventory.moduleLabel"
      },
      "name": "inventory",
      "version": "v1.0.0"
    },
    {
      "created_at": "2026-05-03T05:57:11Z",
      "etag": "1777787831124335200",
      "id": "01KQP6K0TMDP67H6D5CGMNDNTS",
      "is_internal": false,
      "is_orphaned": false,
      "label": {
        "$ref": "essential.moduleLabel"
      },
      "name": "essential",
      "version": "v1.0.1"
    },
    {
      "created_at": "2026-05-03T05:57:11Z",
      "etag": "1777787831125682200",
      "id": "01KQP6K0TN764RT4TMRVFDTY22",
      "is_internal": false,
      "is_orphaned": false,
      "label": {
        "$ref": "authenticate.moduleLabel"
      },
      "name": "authenticate",
      "version": "v1.0.0"
    },
    {
      "created_at": "2026-05-03T05:57:11Z",
      "etag": "1777787831127047300",
      "id": "01KQP6K0TQ89QY1JCC74Q1BCNK",
      "is_internal": false,
      "is_orphaned": false,
      "label": {
        "$ref": "vendingMachine.moduleLabel"
      },
      "name": "vending_machine",
      "version": "v1.0.0"
    }
  ],
  "total": 7,
  "page": 0,
  "size": 500
}
 */
