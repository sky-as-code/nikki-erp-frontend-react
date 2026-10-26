import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The purchase settings of one organization: whether an order needs approving, and above what
 * total.
 *
 * A `two_step` mode with no threshold means every order needs approval; with a threshold, only
 * those at or above it. `one_step` means none do, and the threshold is then ignored.
 */
export type Configuration = {
	id: string,
	approval_mode?: string,

	/** A decimal serialised as a string, for the same reason the order's totals are. */
	approval_threshold?: string,

	/** Whether a confirmed order may still be edited, or is locked on confirmation. */
	po_modification_policy?: string,

	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateConfigurationRequest = Record<string, any>;
export type CreateConfigurationResponse = dyn.RestCreateResponse;

export type DeleteConfigurationRequest = dyn.RestDeleteRequest;
export type DeleteConfigurationResponse = dyn.RestDeleteResponse;

export type GetConfigurationSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetConfigurationByIdRequest = dyn.RestGetByIdRequest;
export type GetConfigurationResponse = dyn.RestGetOneResponse<Configuration>;

export type ConfigurationExistsRequest = dyn.RestExistsRequest;
export type ConfigurationExistsResponse = dyn.RestExistsResponse;

export type SearchConfigurationsRequest = dyn.RestSearchRequest;
export type SearchConfigurationsResponse = dyn.RestSearchResponse<Configuration>;

export type UpdateConfigurationRequest = dyn.RestUpdateRequest;
export type UpdateConfigurationResponse = dyn.RestMutateResponse;
