import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StoreHttpService } from './store-http.service';
import { API_BASE_URL } from '../../config/api.config';
import { ApiResponse, BackendStoreResponse } from '../../models/response.model';

describe('StoreHttpService', () => {
  let service: StoreHttpService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        StoreHttpService
      ]
    });
    service = TestBed.inject(StoreHttpService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /api/stores to load all stores', () => {
    const mockStores: ApiResponse<BackendStoreResponse[]> = {
      success: true,
      message: 'Stores fetched successfully',
      data: [
        {
          id: 1,
          userId: 101,
          storeName: 'PixelCraft Studios',
          category: 'Video & Editing',
          area: 'Indiranagar',
          city: 'Bengaluru'
        }
      ]
    };

    service.getAllStores().subscribe(resp => {
      expect(resp.success).toBe(true);
      expect(resp.data.length).toBe(1);
      expect(resp.data[0].storeName).toBe('PixelCraft Studios');
    });

    const req = httpTesting.expectOne(`${API_BASE_URL}/stores`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStores);
  });

  it('should call GET /api/stores/{id} to fetch a specific store', () => {
    const mockStore: ApiResponse<BackendStoreResponse> = {
      success: true,
      message: 'Store found',
      data: {
        id: 1,
        userId: 101,
        storeName: 'PixelCraft Studios',
        category: 'Video & Editing',
        area: 'Indiranagar',
        city: 'Bengaluru'
      }
    };

    service.getStoreById(1).subscribe(resp => {
      expect(resp.success).toBe(true);
      expect(resp.data.id).toBe(1);
    });

    const req = httpTesting.expectOne(`${API_BASE_URL}/stores/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStore);
  });

  it('should call POST /api/stores to create a store', () => {
    const payload = {
      storeName: 'New Store',
      category: 'Web & Tech',
      area: 'Koramangala',
      city: 'Bengaluru'
    };

    const mockResponse: ApiResponse<BackendStoreResponse> = {
      success: true,
      message: 'Store created',
      data: {
        id: 5,
        userId: 101,
        storeName: 'New Store',
        category: 'Web & Tech',
        area: 'Koramangala',
        city: 'Bengaluru'
      }
    };

    service.createStore(payload).subscribe(resp => {
      expect(resp.success).toBe(true);
      expect(resp.data.id).toBe(5);
    });

    const req = httpTesting.expectOne(`${API_BASE_URL}/stores`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should call PUT /api/stores/{id} to update a store', () => {
    const updatePayload = {
      storeName: 'Updated Store Name',
      category: 'Video & Editing'
    };

    const mockResponse: ApiResponse<BackendStoreResponse> = {
      success: true,
      message: 'Store updated',
      data: {
        id: 1,
        userId: 101,
        storeName: 'Updated Store Name',
        category: 'Video & Editing',
        area: 'Indiranagar',
        city: 'Bengaluru'
      }
    };

    service.updateStore(1, updatePayload).subscribe(resp => {
      expect(resp.success).toBe(true);
      expect(resp.data.storeName).toBe('Updated Store Name');
    });

    const req = httpTesting.expectOne(`${API_BASE_URL}/stores/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatePayload);
    req.flush(mockResponse);
  });

  it('should call DELETE /api/stores/{id} to delete a store', () => {
    const mockResponse: ApiResponse<void> = {
      success: true,
      message: 'Store deleted',
      data: undefined as unknown as void
    };

    service.deleteStore(1).subscribe(resp => {
      expect(resp.success).toBe(true);
    });

    const req = httpTesting.expectOne(`${API_BASE_URL}/stores/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should call POST /api/stores/{id}/reviews to add a review', () => {
    const reviewPayload = {
      userName: 'Reviewer',
      rating: 5,
      message: 'Great service'
    };

    service.addReview(1, reviewPayload).subscribe(resp => {
      expect(resp.success).toBe(true);
    });

    const req = httpTesting.expectOne(`${API_BASE_URL}/stores/1/reviews`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(reviewPayload);
    req.flush({ success: true, message: 'Review added', data: {} });
  });

  it('should call POST /api/stores/{id}/views to record a store view', () => {
    service.recordStoreView(1, 'guest').subscribe(resp => {
      expect(resp.success).toBe(true);
    });

    const req = httpTesting.expectOne(`${API_BASE_URL}/stores/1/views?viewerId=guest`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ success: true, message: 'View recorded', data: {} });
  });
});
