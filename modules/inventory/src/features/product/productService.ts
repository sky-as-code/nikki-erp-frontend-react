import * as request from '@nikkierp/common/request';
import type {
	DeleteProductResponse,
	Product,
	SearchProductsResponse,
	CreateProductRequest,
	CreateProductResponse,
	UpdateProductRequest,
	UpdateProductResponse,
} from './types';

export const productService = {
	async createProduct(data: CreateProductRequest): Promise<CreateProductResponse> {
		const { orgId, ...createData } = data;
		const response = await request.post<CreateProductResponse>(`${orgId}/inventory/products`, {
			json: createData,
		});
		return response;
	},

	async updateProduct(orgId: string, data: UpdateProductRequest): Promise<UpdateProductResponse> {
		console.log('Updating product with data:', data);
		const response = await request.put<UpdateProductResponse>(`${orgId}/inventory/products/${data.id}`, {
			json: data,
		});
		return response;
	},

	async deleteProduct(orgId: string, id: string): Promise<DeleteProductResponse> {
		const response = await request.del<DeleteProductResponse>(`${orgId}/inventory/products/${id}`);
		return response;
	},

	async getProduct(orgId: string, id: string): Promise<Product> {
		const response = await request.get<Product>(`${orgId}/inventory/products/${id}`);
		return response;
	},
	
	async listProducts(orgId: string, categoryId?: string): Promise<SearchProductsResponse> {
		const graph: Record<string, any> = {
			order: [['created_at', 'desc']],
			where: {},
		};
		if (categoryId) {
			graph.where.product_category_ids = { contains: categoryId };
		}
		const response = await request.get<SearchProductsResponse>(`${orgId}/inventory/products`, {
			searchParams: { graph: JSON.stringify(graph) },
		});
		return response;
	},
};
