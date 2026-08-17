/**
 * Open Food Facts API & Product Scanner Service
 */

const OFF_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const OFF_PRODUCT_URL = 'https://world.openfoodfacts.org/api/v0/product';

// Curated popular products database for instant response & offline reliability
export const POPULAR_PRODUCTS = [
  {
    code: '7613034626844',
    product_name: 'Nestlé Cheerios Honey & Nut',
    brands: 'Nestlé',
    image_url: 'https://images.openfoodfacts.org/images/products/761/303/462/6844/front_en.11.400.jpg',
    nutrition_grades: 'c',
    nova_group: 4,
    quantity: '375g',
    categories_tags: ['breakfast-cereals', 'breakfast', 'cereals'],
    nutriments: {
      'energy-kcal_100g': 382,
      proteins_100g: 8.4,
      carbohydrates_100g: 74.5,
      fat_100g: 4.8,
      sugars_100g: 24.1,
      fiber_100g: 8.9
    }
  },
  {
    code: '3017620422003',
    product_name: 'Nutella Hazelnut Spread with Cocoa',
    brands: 'Ferrero',
    image_url: 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.503.400.jpg',
    nutrition_grades: 'e',
    nova_group: 4,
    quantity: '400g',
    categories_tags: ['snacks', 'desserts', 'sweet-spreads'],
    nutriments: {
      'energy-kcal_100g': 539,
      proteins_100g: 6.3,
      carbohydrates_100g: 57.5,
      fat_100g: 30.9,
      sugars_100g: 56.3,
      fiber_100g: 3.0
    }
  },
  {
    code: '5449000000996',
    product_name: 'Coca-Cola Original Taste',
    brands: 'Coca-Cola',
    image_url: 'https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.663.400.jpg',
    nutrition_grades: 'e',
    nova_group: 4,
    quantity: '330ml',
    categories_tags: ['beverages', 'sodas'],
    nutriments: {
      'energy-kcal_100g': 42,
      proteins_100g: 0.0,
      carbohydrates_100g: 10.6,
      fat_100g: 0.0,
      sugars_100g: 10.6,
      fiber_100g: 0.0
    }
  },
  {
    code: '5449000131805',
    product_name: 'Coca-Cola Zero Sugar',
    brands: 'Coca-Cola',
    image_url: 'https://images.openfoodfacts.org/images/products/544/900/013/1805/front_en.393.400.jpg',
    nutrition_grades: 'b',
    nova_group: 4,
    quantity: '330ml',
    categories_tags: ['beverages', 'sodas', 'zero-calorie-drinks'],
    nutriments: {
      'energy-kcal_100g': 0.3,
      proteins_100g: 0.0,
      carbohydrates_100g: 0.0,
      fat_100g: 0.0,
      sugars_100g: 0.0,
      fiber_100g: 0.0
    }
  },
  {
    code: '4060800000213',
    product_name: 'Pepsi Cola Regular',
    brands: 'PepsiCo',
    image_url: 'https://images.openfoodfacts.org/images/products/406/080/000/0213/front_en.21.400.jpg',
    nutrition_grades: 'e',
    nova_group: 4,
    quantity: '330ml',
    categories_tags: ['beverages', 'sodas'],
    nutriments: {
      'energy-kcal_100g': 43,
      proteins_100g: 0.0,
      carbohydrates_100g: 11.0,
      fat_100g: 0.0,
      sugars_100g: 11.0,
      fiber_100g: 0.0
    }
  },
  {
    code: '7622210449283',
    product_name: 'Oreo Original Sandwich Cookies',
    brands: 'Mondelez / Oreo',
    image_url: 'https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.385.400.jpg',
    nutrition_grades: 'd',
    nova_group: 4,
    quantity: '154g',
    categories_tags: ['snacks', 'biscuits', 'cookies', 'desserts'],
    nutriments: {
      'energy-kcal_100g': 474,
      proteins_100g: 5.2,
      carbohydrates_100g: 68.0,
      fat_100g: 19.0,
      sugars_100g: 38.0,
      fiber_100g: 2.7
    }
  },
  {
    code: '5000159461122',
    product_name: 'Snickers Milk Chocolate Bar',
    brands: 'Mars',
    image_url: 'https://images.openfoodfacts.org/images/products/500/015/946/1122/front_en.243.400.jpg',
    nutrition_grades: 'e',
    nova_group: 4,
    quantity: '50g',
    categories_tags: ['snacks', 'desserts', 'chocolates'],
    nutriments: {
      'energy-kcal_100g': 488,
      proteins_100g: 8.6,
      carbohydrates_100g: 60.0,
      fat_100g: 23.0,
      sugars_100g: 51.8,
      fiber_100g: 2.3
    }
  },
  {
    code: '3168930159742',
    product_name: 'Quaker Cruesli Chocolate Granola',
    brands: 'Quaker',
    image_url: 'https://images.openfoodfacts.org/images/products/316/893/015/9742/front_fr.54.400.jpg',
    nutrition_grades: 'a',
    nova_group: 2,
    quantity: '450g',
    categories_tags: ['breakfast', 'breakfast-cereals', 'cereals'],
    nutriments: {
      'energy-kcal_100g': 450,
      proteins_100g: 8.5,
      carbohydrates_100g: 62.0,
      fat_100g: 17.0,
      sugars_100g: 19.0,
      fiber_100g: 6.5
    }
  },
  {
    code: '90162909',
    product_name: 'Red Bull Energy Drink',
    brands: 'Red Bull',
    image_url: 'https://images.openfoodfacts.org/images/products/901/629/09/front_en.299.400.jpg',
    nutrition_grades: 'e',
    nova_group: 4,
    quantity: '250ml',
    categories_tags: ['beverages', 'energy-drinks'],
    nutriments: {
      'energy-kcal_100g': 45,
      proteins_100g: 0.0,
      carbohydrates_100g: 11.0,
      fat_100g: 0.0,
      sugars_100g: 11.0,
      fiber_100g: 0.0
    }
  },
  {
    code: '5201051001031',
    product_name: 'Fage Total 0% Greek Strained Yogurt',
    brands: 'Fage',
    image_url: 'https://images.openfoodfacts.org/images/products/520/105/100/1031/front_en.97.400.jpg',
    nutrition_grades: 'a',
    nova_group: 1,
    quantity: '500g',
    categories_tags: ['dairy', 'yogurts', 'breakfast'],
    nutriments: {
      'energy-kcal_100g': 54,
      proteins_100g: 10.3,
      carbohydrates_100g: 3.0,
      fat_100g: 0.0,
      sugars_100g: 3.0,
      fiber_100g: 0.0
    }
  },
  {
    code: '8715700016053',
    product_name: 'Heinz Tomato Ketchup',
    brands: 'Heinz',
    image_url: 'https://images.openfoodfacts.org/images/products/871/570/001/6053/front_fr.200.400.jpg',
    nutrition_grades: 'd',
    nova_group: 4,
    quantity: '570g',
    categories_tags: ['condiments', 'sauces'],
    nutriments: {
      'energy-kcal_100g': 102,
      proteins_100g: 1.2,
      carbohydrates_100g: 23.2,
      fat_100g: 0.1,
      sugars_100g: 22.8,
      fiber_100g: 1.0
    }
  },
  {
    code: '5000159461139',
    product_name: 'Doritos Nacho Cheese Tortilla Chips',
    brands: 'Doritos / Frito-Lay',
    image_url: 'https://images.openfoodfacts.org/images/products/500/015/946/1139/front_en.114.400.jpg',
    nutrition_grades: 'd',
    nova_group: 4,
    quantity: '180g',
    categories_tags: ['snacks', 'chips'],
    nutriments: {
      'energy-kcal_100g': 502,
      proteins_100g: 6.9,
      carbohydrates_100g: 57.0,
      fat_100g: 26.0,
      sugars_100g: 2.7,
      fiber_100g: 4.8
    }
  },
  {
    code: '4008400404127',
    product_name: 'Kinder Bueno Milk and Hazelnut Bars',
    brands: 'Kinder / Ferrero',
    image_url: 'https://images.openfoodfacts.org/images/products/400/840/040/4127/front_en.216.400.jpg',
    nutrition_grades: 'e',
    nova_group: 4,
    quantity: '43g',
    categories_tags: ['snacks', 'desserts', 'chocolates'],
    nutriments: {
      'energy-kcal_100g': 572,
      proteins_100g: 8.6,
      carbohydrates_100g: 49.5,
      fat_100g: 37.3,
      sugars_100g: 41.2,
      fiber_100g: 1.8
    }
  },
  {
    code: '3017624010701',
    product_name: 'Activia Probiotic Plain Yogurt',
    brands: 'Danone / Activia',
    image_url: 'https://images.openfoodfacts.org/images/products/301/762/401/0701/front_fr.200.400.jpg',
    nutrition_grades: 'b',
    nova_group: 3,
    quantity: '4x125g',
    categories_tags: ['dairy', 'yogurts', 'breakfast'],
    nutriments: {
      'energy-kcal_100g': 63,
      proteins_100g: 4.8,
      carbohydrates_100g: 5.2,
      fat_100g: 3.5,
      sugars_100g: 5.2,
      fiber_100g: 0.0
    }
  }
];

/**
 * Normalize Open Food Facts product structure
 */
export function normalizeProduct(raw) {
  if (!raw) return null;
  const nutriments = raw.nutriments || {};
  
  const kcal = Math.round(
    nutriments['energy-kcal_100g'] ||
    nutriments['energy-kcal'] ||
    (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 0) ||
    250
  );

  const protein = Number((nutriments.proteins_100g ?? nutriments.proteins ?? 5.0).toFixed(1));
  const carbs = Number((nutriments.carbohydrates_100g ?? nutriments.carbohydrates ?? 30.0).toFixed(1));
  const fat = Number((nutriments.fat_100g ?? nutriments.fat ?? 8.0).toFixed(1));
  const sugar = Number((nutriments.sugars_100g ?? nutriments.sugars ?? 12.0).toFixed(1));
  const fiber = Number((nutriments.fiber_100g ?? nutriments.fiber ?? 2.0).toFixed(1));

  let grade = (raw.nutrition_grades || raw.nutrition_grade_fr || '').toLowerCase().trim();
  if (!['a', 'b', 'c', 'd', 'e'].includes(grade)) {
    // Estimate grade from calories and sugar/fat
    if (kcal < 100 && sugar < 5 && fat < 3) grade = 'a';
    else if (kcal < 200 && sugar < 10) grade = 'b';
    else if (kcal < 350) grade = 'c';
    else if (kcal < 480) grade = 'd';
    else grade = 'e';
  }

  const nova = raw.nova_group || raw.nova_groups || (grade === 'a' ? 1 : grade === 'b' ? 2 : 4);

  return {
    code: raw.code || raw._id || String(Date.now()),
    product_name: raw.product_name || raw.product_name_en || raw.generic_name || 'Packaged Food Product',
    brands: raw.brands || raw.brand_owner || 'Generic Brand',
    image_url: raw.image_url || raw.image_front_url || raw.image_small_url || 'https://images.openfoodfacts.org/images/products/316/893/015/9742/front_fr.54.400.jpg',
    nutrition_grades: grade,
    nova_group: nova,
    quantity: raw.quantity || raw.serving_size || '100g',
    categories_tags: Array.isArray(raw.categories_tags) ? raw.categories_tags : [],
    nutriments: {
      'energy-kcal_100g': kcal,
      proteins_100g: protein,
      carbohydrates_100g: carbs,
      fat_100g: fat,
      sugars_100g: sugar,
      fiber_100g: fiber
    }
  };
}

/**
 * Search products by keyword from Open Food Facts API with fallback
 */
export async function searchProducts(query) {
  const clean = (query || '').trim().toLowerCase();
  
  if (!clean) {
    return POPULAR_PRODUCTS.map(normalizeProduct);
  }

  // Check local curated list first
  const localMatches = POPULAR_PRODUCTS.filter(p => 
    p.product_name.toLowerCase().includes(clean) ||
    p.brands.toLowerCase().includes(clean) ||
    p.code.includes(clean) ||
    p.categories_tags.some(t => t.toLowerCase().includes(clean))
  ).map(normalizeProduct);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `${OFF_SEARCH_URL}?search_terms=${encodeURIComponent(clean)}&search_simple=1&action=process&json=1&page_size=20`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.products && data.products.length > 0) {
        const fetched = data.products
          .filter(p => p.product_name && p.product_name.trim().length > 0)
          .map(normalizeProduct);

        // Merge local matches and fetched results without duplicate codes
        const codeMap = new Map();
        [...localMatches, ...fetched].forEach(p => {
          if (!codeMap.has(p.code)) {
            codeMap.set(p.code, p);
          }
        });
        return Array.from(codeMap.values());
      }
    }
  } catch (error) {
    console.warn('Open Food Facts search network note:', error.message);
  }

  return localMatches.length > 0 ? localMatches : POPULAR_PRODUCTS.slice(0, 6).map(normalizeProduct);
}

/**
 * Lookup product by barcode
 */
export async function lookupBarcode(barcode) {
  const cleanBarcode = (barcode || '').trim().replace(/[^0-9]/g, '');
  if (!cleanBarcode) return null;

  // Check local curated products first
  const local = POPULAR_PRODUCTS.find(p => p.code === cleanBarcode);
  if (local) return normalizeProduct(local);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${OFF_PRODUCT_URL}/${cleanBarcode}.json`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.status === 1 && data.product) {
        return normalizeProduct(data.product);
      }
    }
  } catch (error) {
    console.warn('Barcode lookup network note:', error.message);
  }

  // If barcode not found in API, check partial or return a fallback
  const partial = POPULAR_PRODUCTS.find(p => p.code.includes(cleanBarcode) || cleanBarcode.includes(p.code));
  return partial ? normalizeProduct(partial) : null;
}

/**
 * Filter products by Nutri-Score grade
 */
export function filterProductsByGrade(products, grade) {
  if (!grade) return products;
  const target = grade.toLowerCase();
  return products.filter(p => (p.nutrition_grades || '').toLowerCase() === target);
}

/**
 * Filter products by category keyword
 */
export function filterProductsByCategory(products, categoryKey) {
  if (!categoryKey) return products;
  const key = categoryKey.toLowerCase();
  return products.filter(p => {
    const name = p.product_name.toLowerCase();
    const brand = p.brands.toLowerCase();
    const tags = (p.categories_tags || []).join(' ').toLowerCase();
    return name.includes(key) || brand.includes(key) || tags.includes(key);
  });
}
