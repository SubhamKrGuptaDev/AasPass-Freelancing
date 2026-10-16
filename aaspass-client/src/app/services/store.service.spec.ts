import { TestBed } from '@angular/core/testing';
import { StoreService } from './store.service';

describe('StoreService Reviews & Ratings', () => {
  let service: StoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreService);
  });

  it('should be created with initial stores having reviews', () => {
    expect(service).toBeTruthy();
    const stores = service.stores();
    expect(stores.length).toBeGreaterThan(0);
    const store1 = stores.find(s => s.id === 'store-1');
    expect(store1).toBeDefined();
    expect(store1?.reviews).toBeDefined();
    expect(store1?.reviews?.length).toBeGreaterThan(0);
    expect(store1?.reviews?.[0].userName).toBeTruthy();
    expect(store1?.reviews?.[0].rating).toBeGreaterThanOrEqual(1.0);
    expect(store1?.reviews?.[0].rating).toBeLessThanOrEqual(5.0);
    expect(store1?.reviews?.[0].message).toBeTruthy();
  });

  it('should add a review and update average rating and count', () => {
    const storeId = 'store-1';
    const storeBefore = service.getStoreById(storeId);
    const initialCount = storeBefore?.reviews?.length || 0;

    const newReview = service.addReview(storeId, {
      userName: 'Kavita Singh',
      rating: 5.0,
      message: 'Exceptional speed and quality!'
    });

    expect(newReview.userName).toBe('Kavita Singh');
    expect(newReview.rating).toBe(5.0);
    expect(newReview.message).toBe('Exceptional speed and quality!');

    const storeAfter = service.getStoreById(storeId);
    expect(storeAfter?.reviews?.length).toBe(initialCount + 1);
    expect(storeAfter?.reviews?.[0].id).toBe(newReview.id);
    expect(storeAfter?.rating).toBeGreaterThanOrEqual(1.0);
    expect(storeAfter?.rating).toBeLessThanOrEqual(5.0);
  });

  it('should clamp ratings below 1.0 to 1.0 and above 5.0 to 5.0', () => {
    const storeId = 'store-2';

    // Test below minimum (e.g. 0.2 or negative)
    const lowReview = service.addReview(storeId, {
      userName: 'Low Reviewer',
      rating: 0.5,
      message: 'Too low rating attempt'
    });
    expect(lowReview.rating).toBe(1.0);

    // Test above maximum (e.g. 7.5)
    const highReview = service.addReview(storeId, {
      userName: 'High Reviewer',
      rating: 9.9,
      message: 'Too high rating attempt'
    });
    expect(highReview.rating).toBe(5.0);
  });

  it('should toggle store owner demo mode on profile', () => {
    expect(service.currentUser().hasStore).toBe(false);
    service.toggleDemoStore();
    expect(service.currentUser().hasStore).toBe(true);
    expect(service.currentUser().store?.reviews?.length).toBeGreaterThan(0);

    service.toggleDemoStore();
    expect(service.currentUser().hasStore).toBe(false);
  });

});
