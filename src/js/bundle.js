/**
 * NutriPlan - Universal Application Bundle
 * Supports both file:// and http:// protocols without CORS blockage.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. CONSTANTS & MAPPINGS
  // =========================================================================
  const MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
  const OFF_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
  const OFF_PRODUCT_URL = 'https://world.openfoodfacts.org/api/v0/product';

  const STORAGE_KEYS = {
    FOOD_LOG: 'nutriplan_foodlog_v1',
    GOALS: 'nutriplan_goals_v1',
    FAVORITES: 'nutriplan_favorites_v1'
  };

  const DEFAULT_GOALS = {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 65
  };

  const CATEGORY_STYLES = {
    Beef: { bg: 'from-red-50 to-rose-50', border: 'border-red-200 hover:border-red-400', iconBg: 'from-red-400 to-rose-500', icon: 'fa-drumstick-bite' },
    Chicken: { bg: 'from-amber-50 to-orange-50', border: 'border-amber-200 hover:border-amber-400', iconBg: 'from-amber-400 to-orange-500', icon: 'fa-drumstick-bite' },
    Dessert: { bg: 'from-pink-50 to-rose-50', border: 'border-pink-200 hover:border-pink-400', iconBg: 'from-pink-400 to-rose-500', icon: 'fa-cake-candles' },
    Lamb: { bg: 'from-orange-50 to-amber-50', border: 'border-orange-200 hover:border-orange-400', iconBg: 'from-orange-400 to-amber-500', icon: 'fa-bowl-food' },
    Miscellaneous: { bg: 'from-slate-50 to-gray-50', border: 'border-slate-200 hover:border-slate-400', iconBg: 'from-slate-400 to-gray-500', icon: 'fa-utensils' },
    Pasta: { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200 hover:border-yellow-400', iconBg: 'from-yellow-400 to-amber-500', icon: 'fa-wheat-awn' },
    Pork: { bg: 'from-rose-50 to-pink-50', border: 'border-rose-200 hover:border-rose-400', iconBg: 'from-rose-400 to-pink-500', icon: 'fa-bacon' },
    Seafood: { bg: 'from-cyan-50 to-blue-50', border: 'border-cyan-200 hover:border-cyan-400', iconBg: 'from-cyan-400 to-blue-500', icon: 'fa-fish' },
    Side: { bg: 'from-teal-50 to-emerald-50', border: 'border-teal-200 hover:border-teal-400', iconBg: 'from-teal-400 to-emerald-500', icon: 'fa-plate-wheat' },
    Starter: { bg: 'from-emerald-50 to-green-50', border: 'border-emerald-200 hover:border-emerald-400', iconBg: 'from-emerald-400 to-green-500', icon: 'fa-spoon' },
    Vegan: { bg: 'from-green-50 to-emerald-50', border: 'border-green-200 hover:border-green-400', iconBg: 'from-green-400 to-emerald-500', icon: 'fa-seedling' },
    Vegetarian: { bg: 'from-lime-50 to-green-50', border: 'border-lime-200 hover:border-lime-400', iconBg: 'from-lime-400 to-green-500', icon: 'fa-leaf' },
    Breakfast: { bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200 hover:border-amber-400', iconBg: 'from-amber-400 to-yellow-500', icon: 'fa-egg' },
    Goat: { bg: 'from-stone-50 to-amber-50', border: 'border-stone-200 hover:border-stone-400', iconBg: 'from-stone-400 to-amber-500', icon: 'fa-bowl-food' }
  };

  const POPULAR_PRODUCTS = [
    {
      code: '7613034626844',
      product_name: 'Nestlé Cheerios Honey & Nut',
      brands: 'Nestlé',
      image_url: 'https://images.openfoodfacts.org/images/products/761/303/462/6844/front_en.11.400.jpg',
      nutrition_grades: 'c',
      nova_group: 4,
      quantity: '375g',
      categories_tags: ['breakfast-cereals', 'breakfast', 'cereals'],
      nutriments: { 'energy-kcal_100g': 382, proteins_100g: 8.4, carbohydrates_100g: 74.5, fat_100g: 4.8, sugars_100g: 24.1, fiber_100g: 8.9 }
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
      nutriments: { 'energy-kcal_100g': 539, proteins_100g: 6.3, carbohydrates_100g: 57.5, fat_100g: 30.9, sugars_100g: 56.3, fiber_100g: 3.0 }
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
      nutriments: { 'energy-kcal_100g': 42, proteins_100g: 0.0, carbohydrates_100g: 10.6, fat_100g: 0.0, sugars_100g: 10.6, fiber_100g: 0.0 }
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
      nutriments: { 'energy-kcal_100g': 0.3, proteins_100g: 0.0, carbohydrates_100g: 0.0, fat_100g: 0.0, sugars_100g: 0.0, fiber_100g: 0.0 }
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
      nutriments: { 'energy-kcal_100g': 43, proteins_100g: 0.0, carbohydrates_100g: 11.0, fat_100g: 0.0, sugars_100g: 11.0, fiber_100g: 0.0 }
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
      nutriments: { 'energy-kcal_100g': 474, proteins_100g: 5.2, carbohydrates_100g: 68.0, fat_100g: 19.0, sugars_100g: 38.0, fiber_100g: 2.7 }
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
      nutriments: { 'energy-kcal_100g': 488, proteins_100g: 8.6, carbohydrates_100g: 60.0, fat_100g: 23.0, sugars_100g: 51.8, fiber_100g: 2.3 }
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
      nutriments: { 'energy-kcal_100g': 450, proteins_100g: 8.5, carbohydrates_100g: 62.0, fat_100g: 17.0, sugars_100g: 19.0, fiber_100g: 6.5 }
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
      nutriments: { 'energy-kcal_100g': 45, proteins_100g: 0.0, carbohydrates_100g: 11.0, fat_100g: 0.0, sugars_100g: 11.0, fiber_100g: 0.0 }
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
      nutriments: { 'energy-kcal_100g': 54, proteins_100g: 10.3, carbohydrates_100g: 3.0, fat_100g: 0.0, sugars_100g: 3.0, fiber_100g: 0.0 }
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
      nutriments: { 'energy-kcal_100g': 102, proteins_100g: 1.2, carbohydrates_100g: 23.2, fat_100g: 0.1, sugars_100g: 22.8, fiber_100g: 1.0 }
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
      nutriments: { 'energy-kcal_100g': 502, proteins_100g: 6.9, carbohydrates_100g: 57.0, fat_100g: 26.0, sugars_100g: 2.7, fiber_100g: 4.8 }
    }
  ];

  // =========================================================================
  // 2. THEMEALDB API HELPERS
  // =========================================================================
  async function fetchCategories() {
    try {
      const response = await fetch(`${MEALDB_BASE_URL}/categories.php`);
      const data = await response.json();
      return data.categories || [];
    } catch (e) {
      console.warn('Categories fetch error:', e);
      return [];
    }
  }

  async function fetchAreas() {
    try {
      const response = await fetch(`${MEALDB_BASE_URL}/list.php?a=list`);
      const data = await response.json();
      return (data.meals || []).map(m => m.strArea).filter(Boolean);
    } catch (e) {
      return [
        'American', 'British', 'Canadian', 'Chinese', 'Croatian', 'Dutch', 'Egyptian',
        'Filipino', 'French', 'Greek', 'Indian', 'Irish', 'Italian', 'Jamaican',
        'Japanese', 'Kenyan', 'Malaysian', 'Mexican', 'Moroccan', 'Polish',
        'Portuguese', 'Russian', 'Spanish', 'Thai', 'Tunisian', 'Turkish', 'Ukrainian', 'Vietnamese'
      ];
    }
  }

  async function fetchInitialRecipes(targetCount = 25) {
    try {
      const res = await fetch(`${MEALDB_BASE_URL}/search.php?s=`);
      const data = await res.json();
      let meals = data.meals || [];

      if (meals.length < targetCount) {
        const resB = await fetch(`${MEALDB_BASE_URL}/search.php?s=c`);
        const dataB = await resB.json();
        if (dataB.meals) {
          const ids = new Set(meals.map(m => m.idMeal));
          for (const m of dataB.meals) {
            if (!ids.has(m.idMeal)) {
              meals.push(m);
              ids.add(m.idMeal);
            }
          }
        }
      }
      return meals.slice(0, targetCount);
    } catch (e) {
      console.warn('Initial recipes fetch error:', e);
      return [];
    }
  }

  async function searchMeals(query) {
    if (!query || !query.trim()) return fetchInitialRecipes(25);
    const q = query.trim();
    try {
      const res = await fetch(`${MEALDB_BASE_URL}/search.php?s=${encodeURIComponent(q)}`);
      const data = await res.json();
      let meals = data.meals || [];
      if (meals.length === 0) {
        const ingRes = await fetch(`${MEALDB_BASE_URL}/filter.php?i=${encodeURIComponent(q)}`);
        const ingData = await ingRes.json();
        if (ingData.meals && ingData.meals.length > 0) {
          const detailed = await Promise.all(
            ingData.meals.slice(0, 25).map(m => getMealById(m.idMeal))
          );
          meals = detailed.filter(Boolean);
        }
      }
      return meals;
    } catch (e) {
      console.warn('Search error:', e);
      return [];
    }
  }

  async function filterByCategory(category) {
    try {
      const res = await fetch(`${MEALDB_BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
      const data = await res.json();
      const meals = data.meals || [];
      const detailed = await Promise.all(
        meals.slice(0, 25).map(async (m) => {
          try {
            const detail = await getMealById(m.idMeal);
            return detail || { ...m, strCategory: category, strArea: 'International' };
          } catch {
            return { ...m, strCategory: category, strArea: 'International' };
          }
        })
      );
      return detailed;
    } catch (e) {
      console.warn('Category filter error:', e);
      return [];
    }
  }

  async function filterByArea(area) {
    try {
      const res = await fetch(`${MEALDB_BASE_URL}/filter.php?a=${encodeURIComponent(area)}`);
      const data = await res.json();
      const meals = data.meals || [];
      const detailed = await Promise.all(
        meals.slice(0, 25).map(async (m) => {
          try {
            const detail = await getMealById(m.idMeal);
            return detail || { ...m, strArea: area, strCategory: 'Main Course' };
          } catch {
            return { ...m, strArea: area, strCategory: 'Main Course' };
          }
        })
      );
      return detailed;
    } catch (e) {
      console.warn('Area filter error:', e);
      return [];
    }
  }

  async function getMealById(id) {
    try {
      const res = await fetch(`${MEALDB_BASE_URL}/lookup.php?i=${id}`);
      const data = await res.json();
      return data.meals ? data.meals[0] : null;
    } catch {
      return null;
    }
  }

  function extractIngredients(meal) {
    if (!meal) return [];
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const meas = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        list.push({
          ingredient: ing.trim(),
          measure: (meas || '').trim(),
          image: `https://www.themealdb.com/images/ingredients/${encodeURIComponent(ing.trim())}-Small.png`
        });
      }
    }
    return list;
  }

  function calculateMealNutrition(meal) {
    if (!meal) {
      return { calories: 450, totalCalories: 1800, servings: 4, protein: 35, carbs: 45, fat: 15, fiber: 4, sugar: 8, vitaminA: 15, vitaminC: 20, calcium: 6, iron: 12, prepTime: '30 min' };
    }
    const idNum = parseInt(meal.idMeal || '52772', 10) || 52772;
    const ingredients = extractIngredients(meal);
    const ingCount = Math.max(ingredients.length, 4);
    const cat = (meal.strCategory || '').toLowerCase();

    let baseCal = 420, basePro = 28, baseCarb = 40, baseFat = 14, baseFib = 4, baseSug = 6, servings = 4, prepTime = '35 min';

    if (cat.includes('beef') || cat.includes('lamb') || cat.includes('pork')) {
      baseCal = 540 + (idNum % 120); basePro = 42 + (idNum % 14); baseCarb = 25 + (idNum % 20); baseFat = 24 + (idNum % 10);
      prepTime = `${35 + (idNum % 30)} min`;
    } else if (cat.includes('chicken')) {
      baseCal = 460 + (idNum % 90); basePro = 44 + (idNum % 12); baseCarb = 35 + (idNum % 25); baseFat = 12 + (idNum % 8);
      prepTime = `${25 + (idNum % 20)} min`;
    } else if (cat.includes('seafood')) {
      baseCal = 380 + (idNum % 80); basePro = 38 + (idNum % 10); baseCarb = 20 + (idNum % 20); baseFat = 10 + (idNum % 6);
      prepTime = `${20 + (idNum % 15)} min`;
    } else if (cat.includes('pasta')) {
      baseCal = 520 + (idNum % 110); basePro = 22 + (idNum % 8); baseCarb = 68 + (idNum % 18); baseFat = 14 + (idNum % 8); baseFib = 5;
      prepTime = `${20 + (idNum % 15)} min`;
    } else if (cat.includes('dessert')) {
      baseCal = 430 + (idNum % 150); basePro = 6 + (idNum % 4); baseCarb = 62 + (idNum % 25); baseFat = 18 + (idNum % 12); baseSug = 32 + (idNum % 15);
      prepTime = `${45 + (idNum % 30)} min`;
    } else if (cat.includes('vegan') || cat.includes('vegetarian')) {
      baseCal = 340 + (idNum % 80); basePro = 16 + (idNum % 10); baseCarb = 48 + (idNum % 20); baseFat = 9 + (idNum % 6); baseFib = 8 + (idNum % 4);
      prepTime = `${25 + (idNum % 15)} min`;
    }

    const cal = Math.round(baseCal + (ingCount * 5));
    return {
      calories: cal,
      totalCalories: cal * servings,
      servings,
      protein: Math.round(basePro),
      carbs: Math.round(baseCarb),
      fat: Math.round(baseFat),
      fiber: Math.round(baseFib),
      sugar: Math.round(baseSug),
      vitaminA: 10 + (idNum % 25),
      vitaminC: 15 + (idNum % 35),
      calcium: 4 + (idNum % 18),
      iron: 8 + (idNum % 20),
      prepTime
    };
  }

  function formatInstructions(instructions) {
    if (!instructions) return [];
    const lines = instructions
      .split(/\r?\n|\r/)
      .map(l => l.trim())
      .filter(l => l.length > 0 && !/^STEP\s*\d+/i.test(l) && !/^INSTRUCTIONS/i.test(l));

    if (lines.length <= 2) {
      const s = instructions.replace(/\r?\n/g, ' ').split(/(?<=[.?!])\s+(?=[A-Z0-9])/).map(t => t.trim()).filter(t => t.length > 10);
      if (s.length > 1) return s;
    }
    return lines.length > 0 ? lines : [instructions];
  }

  // =========================================================================
  // 3. OPEN FOOD FACTS API HELPERS
  // =========================================================================
  function normalizeProduct(raw) {
    if (!raw) return null;
    const nutriments = raw.nutriments || {};
    const kcal = Math.round(
      nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] ||
      (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 0) || 250
    );
    const protein = Number((nutriments.proteins_100g ?? nutriments.proteins ?? 5.0).toFixed(1));
    const carbs = Number((nutriments.carbohydrates_100g ?? nutriments.carbohydrates ?? 30.0).toFixed(1));
    const fat = Number((nutriments.fat_100g ?? nutriments.fat ?? 8.0).toFixed(1));
    const sugar = Number((nutriments.sugars_100g ?? nutriments.sugars ?? 12.0).toFixed(1));
    const fiber = Number((nutriments.fiber_100g ?? nutriments.fiber ?? 2.0).toFixed(1));

    let grade = (raw.nutrition_grades || raw.nutrition_grade_fr || '').toLowerCase().trim();
    if (!['a', 'b', 'c', 'd', 'e'].includes(grade)) {
      if (kcal < 100 && sugar < 5 && fat < 3) grade = 'a';
      else if (kcal < 200 && sugar < 10) grade = 'b';
      else if (kcal < 350) grade = 'c';
      else if (kcal < 480) grade = 'd';
      else grade = 'e';
    }

    return {
      code: raw.code || raw._id || String(Date.now()),
      product_name: raw.product_name || raw.product_name_en || raw.generic_name || 'Packaged Product',
      brands: raw.brands || raw.brand_owner || 'Brand',
      image_url: raw.image_url || raw.image_front_url || raw.image_small_url || 'https://images.openfoodfacts.org/images/products/316/893/015/9742/front_fr.54.400.jpg',
      nutrition_grades: grade,
      nova_group: raw.nova_group || (grade === 'a' ? 1 : grade === 'b' ? 2 : 4),
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

  async function searchProducts(query) {
    const clean = (query || '').trim().toLowerCase();
    if (!clean) return POPULAR_PRODUCTS.map(normalizeProduct);

    const localMatches = POPULAR_PRODUCTS.filter(p =>
      p.product_name.toLowerCase().includes(clean) ||
      p.brands.toLowerCase().includes(clean) ||
      p.code.includes(clean) ||
      p.categories_tags.some(t => t.toLowerCase().includes(clean))
    ).map(normalizeProduct);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${OFF_SEARCH_URL}?search_terms=${encodeURIComponent(clean)}&search_simple=1&action=process&json=1&page_size=20`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          const fetched = data.products.filter(p => p.product_name).map(normalizeProduct);
          const map = new Map();
          [...localMatches, ...fetched].forEach(p => { if (!map.has(p.code)) map.set(p.code, p); });
          return Array.from(map.values());
        }
      }
    } catch (e) {
      console.warn('OFF Search note:', e);
    }
    return localMatches.length > 0 ? localMatches : POPULAR_PRODUCTS.slice(0, 6).map(normalizeProduct);
  }

  async function lookupBarcode(barcode) {
    const clean = (barcode || '').trim().replace(/[^0-9]/g, '');
    if (!clean) return null;
    const local = POPULAR_PRODUCTS.find(p => p.code === clean);
    if (local) return normalizeProduct(local);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${OFF_PRODUCT_URL}/${clean}.json`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 1 && data.product) return normalizeProduct(data.product);
      }
    } catch (e) {
      console.warn('OFF Barcode note:', e);
    }
    const partial = POPULAR_PRODUCTS.find(p => p.code.includes(clean) || clean.includes(p.code));
    return partial ? normalizeProduct(partial) : null;
  }

  // =========================================================================
  // 4. APP STATE
  // =========================================================================
  class AppState {
    constructor() {
      this.currentPage = 'meals';
      this.viewMode = 'grid';
      this.recipes = [];
      this.categories = [];
      this.areas = [];
      this.selectedCategory = null;
      this.selectedArea = null;
      this.searchQuery = '';
      this.currentMeal = null;

      this.products = [];
      this.selectedNutriScore = '';
      this.selectedProductCategory = null;

      this.foodLog = this.loadFoodLog();
      this.dailyGoals = this.loadGoals();
    }

    loadFoodLog() {
      try {
        const d = localStorage.getItem(STORAGE_KEYS.FOOD_LOG);
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    }

    saveFoodLog() {
      try {
        localStorage.setItem(STORAGE_KEYS.FOOD_LOG, JSON.stringify(this.foodLog));
      } catch (e) { console.warn(e); }
    }

    loadGoals() {
      try {
        const d = localStorage.getItem(STORAGE_KEYS.GOALS);
        return d ? { ...DEFAULT_GOALS, ...JSON.parse(d) } : { ...DEFAULT_GOALS };
      } catch { return { ...DEFAULT_GOALS }; }
    }

    getFormattedTodayKey(date = new Date()) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    addFoodLogEntry(item) {
      const now = new Date();
      const entry = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: item.name || 'Food Item',
        type: item.type || 'meal',
        image: item.image || '',
        calories: Math.round(Number(item.calories) || 0),
        protein: Math.round(Number(item.protein) || 0),
        carbs: Math.round(Number(item.carbs) || 0),
        fat: Math.round(Number(item.fat) || 0),
        sugar: Math.round(Number(item.sugar) || 0),
        fiber: Math.round(Number(item.fiber) || 0),
        servings: Number(item.servings) || 1,
        unit: item.unit || 'serving',
        dateKey: this.getFormattedTodayKey(now),
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.foodLog.unshift(entry);
      this.saveFoodLog();
      return entry;
    }

    removeFoodLogEntry(id) {
      this.foodLog = this.foodLog.filter(x => x.id !== id);
      this.saveFoodLog();
    }

    clearFoodLog() {
      const todayKey = this.getFormattedTodayKey();
      this.foodLog = this.foodLog.filter(x => x.dateKey !== todayKey);
      this.saveFoodLog();
    }

    getTodayLog() {
      const todayKey = this.getFormattedTodayKey();
      return this.foodLog.filter(x => x.dateKey === todayKey);
    }

    getDailyTotals() {
      const items = this.getTodayLog();
      const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, count: items.length };
      items.forEach(x => {
        totals.calories += Number(x.calories) || 0;
        totals.protein += Number(x.protein) || 0;
        totals.carbs += Number(x.carbs) || 0;
        totals.fat += Number(x.fat) || 0;
      });
      return totals;
    }

    getWeeklyData() {
      const days = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const key = this.getFormattedTodayKey(d);
        const items = this.foodLog.filter(x => x.dateKey === key);
        let cal = 0;
        items.forEach(x => { cal += Number(x.calories) || 0; });
        days.push({
          dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNum: d.getDate(),
          isToday: i === 0,
          calories: cal
        });
      }
      return days;
    }
  }

  const state = new AppState();

  // =========================================================================
  // 5. UI TOAST & HELPERS
  // =========================================================================
  function showToast(title, icon = 'success') {
    if (window.Swal) {
      const Toast = window.Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
      Toast.fire({ icon, title });
    } else {
      console.log(`[Toast ${icon}]: ${title}`);
    }
  }

  function renderSpinner(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="col-span-full flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    `;
  }

  function renderEmpty(container, title = 'No results found', subtext = 'Try searching with different keywords.') {
    if (!container) return;
    container.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <i class="fa-solid fa-utensils text-2xl"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-1">${title}</h3>
        <p class="text-sm text-gray-500">${subtext}</p>
      </div>
    `;
  }

  // =========================================================================
  // 6. DOM ELEMENTS
  // =========================================================================
  let els = {};

  function cacheDOMElements() {
    els = {
      loadingOverlay: document.getElementById('app-loading-overlay'),
      sidebar: document.getElementById('sidebar'),
      sidebarOverlay: document.getElementById('sidebar-overlay'),
      sidebarCloseBtn: document.getElementById('sidebar-close-btn'),
      headerMenuBtn: document.getElementById('header-menu-btn'),
      headerTitle: document.querySelector('#header h1'),
      headerSubtitle: document.querySelector('#header p'),
      navLinks: document.querySelectorAll('.nav-link'),

      searchFiltersSection: document.getElementById('search-filters-section'),
      mealCategoriesSection: document.getElementById('meal-categories-section'),
      allRecipesSection: document.getElementById('all-recipes-section'),
      mealDetailsSection: document.getElementById('meal-details'),
      searchInput: document.getElementById('search-input'),
      categoriesGrid: document.getElementById('categories-grid'),
      recipesGrid: document.getElementById('recipes-grid'),
      recipesCount: document.getElementById('recipes-count'),
      gridViewBtn: document.getElementById('grid-view-btn'),
      listViewBtn: document.getElementById('list-view-btn'),

      productsSection: document.getElementById('products-section'),
      productSearchInput: document.getElementById('product-search-input'),
      searchProductBtn: document.getElementById('search-product-btn'),
      barcodeInput: document.getElementById('barcode-input'),
      lookupBarcodeBtn: document.getElementById('lookup-barcode-btn'),
      nutriScoreFilters: document.querySelectorAll('.nutri-score-filter'),
      productCategories: document.querySelectorAll('.product-category-btn'),
      productsGrid: document.getElementById('products-grid'),
      productsCount: document.getElementById('products-count'),

      foodlogSection: document.getElementById('foodlog-section'),
      foodlogDate: document.getElementById('foodlog-date'),
      clearFoodlogBtn: document.getElementById('clear-foodlog'),
      loggedItemsList: document.getElementById('logged-items-list'),
      weeklyChart: document.getElementById('weekly-chart'),
      quickLogBtns: document.querySelectorAll('.quick-log-btn')
    };
  }

  // =========================================================================
  // 7. ROUTING & NAVIGATION
  // =========================================================================
  function navigateTo(page, params = {}) {
    state.currentPage = page;

    // Update Nav Links
    els.navLinks.forEach((link, idx) => {
      const isTarget = (page === 'meals' || page === 'meal-details') ? idx === 0 : page === 'products' ? idx === 1 : idx === 2;
      if (isTarget) {
        link.className = 'nav-link flex items-center gap-3 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg transition-all font-semibold';
      } else {
        link.className = 'nav-link flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all font-medium';
      }
    });

    // Hide all
    if (els.searchFiltersSection) els.searchFiltersSection.style.display = 'none';
    if (els.mealCategoriesSection) els.mealCategoriesSection.style.display = 'none';
    if (els.allRecipesSection) els.allRecipesSection.style.display = 'none';
    if (els.mealDetailsSection) els.mealDetailsSection.style.display = 'none';
    if (els.productsSection) els.productsSection.style.display = 'none';
    if (els.foodlogSection) els.foodlogSection.style.display = 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (page) {
      case 'meals':
        if (els.headerTitle) els.headerTitle.textContent = 'Meals & Recipes';
        if (els.headerSubtitle) els.headerSubtitle.textContent = 'Discover delicious and nutritious recipes tailored for you';
        if (els.searchFiltersSection) els.searchFiltersSection.style.display = '';
        if (els.mealCategoriesSection) els.mealCategoriesSection.style.display = '';
        if (els.allRecipesSection) els.allRecipesSection.style.display = '';
        break;

      case 'meal-details':
        if (els.headerTitle) els.headerTitle.textContent = 'Recipe Details';
        if (els.headerSubtitle) els.headerSubtitle.textContent = 'Detailed ingredients, instructions and nutritional breakdown';
        if (els.mealDetailsSection) els.mealDetailsSection.style.display = '';
        if (params.mealId) loadMealDetails(params.mealId);
        break;

      case 'products':
        if (els.headerTitle) els.headerTitle.textContent = 'Product Scanner';
        if (els.headerSubtitle) els.headerSubtitle.textContent = 'Search packaged foods by name or barcode';
        if (els.productsSection) els.productsSection.style.display = '';
        break;

      case 'foodlog':
        if (els.headerTitle) els.headerTitle.textContent = 'Food Log';
        if (els.headerSubtitle) els.headerSubtitle.textContent = 'Track your daily nutrition and food intake';
        if (els.foodlogSection) els.foodlogSection.style.display = '';
        updateFoodLogView();
        break;
    }
  }

  // =========================================================================
  // 8. MEALS RENDERING & LOGIC
  // =========================================================================
  function renderCategoriesUI(categories) {
    if (!els.categoriesGrid) return;
    els.categoriesGrid.innerHTML = categories.map(cat => {
      const style = CATEGORY_STYLES[cat.strCategory] || { bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', iconBg: 'from-emerald-400 to-green-500', icon: 'fa-bowl-food' };
      const isActive = state.selectedCategory === cat.strCategory;
      return `
        <div
          class="category-card bg-gradient-to-br ${style.bg} rounded-xl p-3 border ${style.border} ${isActive ? 'ring-2 ring-emerald-600 shadow-md scale-105' : 'hover:border-emerald-400 hover:shadow-md'} cursor-pointer transition-all group"
          data-category="${cat.strCategory}"
        >
          <div class="flex items-center gap-2.5">
            <div class="text-white w-9 h-9 bg-gradient-to-br ${style.iconBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <i class="fa-solid ${style.icon}"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">${cat.strCategory}</h3>
            </div>
          </div>
        </div>
      `;
    }).join('');

    els.categoriesGrid.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.dataset.category;
        handleCategoryClick(cat === state.selectedCategory ? null : cat);
      });
    });
  }

  function renderAreaPillsUI(areas) {
    const container = document.querySelector('#search-filters-section .flex.overflow-x-auto');
    if (!container) return;

    const isAllActive = !state.selectedArea && !state.selectedCategory;
    let html = `
      <button data-area="" class="area-pill px-4 py-2 ${isAllActive ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-full font-medium text-sm whitespace-nowrap transition-all">
        All Recipes
      </button>
    `;
    html += areas.map(a => {
      const isActive = state.selectedArea === a;
      return `
        <button data-area="${a}" class="area-pill px-4 py-2 ${isActive ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-full font-medium text-sm whitespace-nowrap transition-all">
          ${a}
        </button>
      `;
    }).join('');

    container.innerHTML = html;
    container.querySelectorAll('.area-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const area = btn.dataset.area;
        handleAreaClick(area || null);
      });
    });
  }

  function renderRecipesUI(recipes) {
    if (!els.recipesGrid) return;
    if (els.recipesCount) els.recipesCount.textContent = `Showing ${recipes ? recipes.length : 0} recipes`;

    if (!recipes || recipes.length === 0) {
      renderEmpty(els.recipesGrid, 'No recipes found', 'Try searching for something else or clearing filters.');
      return;
    }

    if (state.viewMode === 'list') {
      els.recipesGrid.className = 'flex flex-col gap-4';
      els.recipesGrid.innerHTML = recipes.map(m => {
        const cat = m.strCategory || 'Recipe';
        const area = m.strArea || 'International';
        const snip = m.strInstructions ? m.strInstructions.slice(0, 130) + '...' : 'Delicious recipe ready to explore!';
        return `
          <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-center group border border-gray-100 p-3 gap-4" data-meal-id="${m.idMeal}">
            <div class="relative w-full sm:w-48 h-36 rounded-lg overflow-hidden shrink-0">
              <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${m.strMealThumb}" alt="${m.strMeal}" loading="lazy" />
              <span class="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 text-[11px] font-semibold rounded text-gray-700">${cat}</span>
            </div>
            <div class="flex-1 w-full">
              <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">${area}</span>
              <h3 class="text-lg font-bold text-gray-900 mt-1 mb-1.5 group-hover:text-emerald-600 transition-colors">${m.strMeal}</h3>
              <p class="text-xs text-gray-600 mb-2 line-clamp-2">${snip}</p>
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <span><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${cat}</span>
                <span><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${area}</span>
                <span class="ml-auto text-emerald-600 font-semibold">View Recipe &rarr;</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      els.recipesGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5';
      els.recipesGrid.innerHTML = recipes.map(m => {
        const cat = m.strCategory || 'Recipe';
        const area = m.strArea || 'International';
        const snip = m.strInstructions ? m.strInstructions.slice(0, 75) + '...' : 'Delicious recipe ready to cook!';
        return `
          <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group border border-gray-100 flex flex-col justify-between" data-meal-id="${m.idMeal}">
            <div>
              <div class="relative h-48 overflow-hidden bg-gray-100">
                <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${m.strMealThumb}" alt="${m.strMeal}" loading="lazy" />
                <div class="absolute bottom-3 left-3 flex gap-2">
                  <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700 shadow-sm">${cat}</span>
                  <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white shadow-sm">${area}</span>
                </div>
              </div>
              <div class="p-4">
                <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${m.strMeal}</h3>
                <p class="text-xs text-gray-600 mb-3 line-clamp-2">${snip}</p>
              </div>
            </div>
            <div class="px-4 pb-4 pt-0">
              <div class="flex items-center justify-between text-xs pt-2 border-t border-gray-50">
                <span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${cat}</span>
                <span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${area}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    els.recipesGrid.querySelectorAll('.recipe-card').forEach(card => {
      card.addEventListener('click', () => {
        navigateTo('meal-details', { mealId: card.dataset.mealId });
      });
    });
  }

  async function handleCategoryClick(cat) {
    state.selectedCategory = cat;
    state.selectedArea = null;
    if (els.searchInput) els.searchInput.value = '';
    renderCategoriesUI(state.categories);
    renderAreaPillsUI(state.areas);
    renderSpinner(els.recipesGrid);

    state.recipes = cat ? await filterByCategory(cat) : await fetchInitialRecipes(25);
    renderRecipesUI(state.recipes);
  }

  async function handleAreaClick(area) {
    state.selectedArea = area;
    state.selectedCategory = null;
    if (els.searchInput) els.searchInput.value = '';
    renderCategoriesUI(state.categories);
    renderAreaPillsUI(state.areas);
    renderSpinner(els.recipesGrid);

    state.recipes = area ? await filterByArea(area) : await fetchInitialRecipes(25);
    renderRecipesUI(state.recipes);
  }

  async function loadMealDetails(mealId) {
    if (!els.mealDetailsSection) return;
    renderSpinner(els.mealDetailsSection);

    const meal = await getMealById(mealId);
    if (!meal) {
      renderEmpty(els.mealDetailsSection, 'Meal not found', 'Please return to recipes.');
      return;
    }

    state.currentMeal = meal;
    const nutrition = calculateMealNutrition(meal);
    const ingredients = extractIngredients(meal);
    const instructions = formatInstructions(meal.strInstructions);

    let videoUrl = null;
    if (meal.strYoutube) {
      const match = meal.strYoutube.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
      if (match && match[2].length === 11) videoUrl = `https://www.youtube.com/embed/${match[2]}`;
    }

    const cat = meal.strCategory || 'Main';
    const area = meal.strArea || 'International';
    const tags = meal.strTags ? meal.strTags.split(',').filter(Boolean) : [];

    els.mealDetailsSection.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
          <i class="fa-solid fa-arrow-left"></i>
          <span>Back to Recipes</span>
        </button>

        <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div class="relative h-80 md:h-96">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div class="flex items-center gap-2 mb-3 flex-wrap">
                <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full shadow-sm">${cat}</span>
                <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full shadow-sm">${area}</span>
                ${tags.map(t => `<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full shadow-sm">${t.trim()}</span>`).join('')}
              </div>
              <h1 class="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">${meal.strMeal}</h1>
              <div class="flex items-center gap-6 text-white/90 text-sm md:text-base flex-wrap">
                <span class="flex items-center gap-2"><i class="fa-solid fa-clock text-emerald-400"></i><span>${nutrition.prepTime}</span></span>
                <span class="flex items-center gap-2"><i class="fa-solid fa-utensils text-emerald-400"></i><span>${nutrition.servings} servings</span></span>
                <span class="flex items-center gap-2"><i class="fa-solid fa-fire text-amber-400"></i><span>${nutrition.calories} cal/serving</span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 mb-8">
          <button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-md transition-all">
            <i class="fa-solid fa-clipboard-list"></i>
            <span>Log This Meal</span>
          </button>
          ${meal.strSource ? `
            <a href="${meal.strSource}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 px-5 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all">
              <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
              <span>Original Recipe</span>
            </a>
          ` : ''}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-list-check text-emerald-600"></i>
                Ingredients
                <span class="text-sm font-normal text-gray-500 ml-auto">${ingredients.length} items</span>
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${ingredients.map((ing, idx) => `
                  <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                    <input type="checkbox" id="ing_${idx}" class="w-5 h-5 text-emerald-600 rounded border-gray-300" />
                    <img src="${ing.image}" alt="${ing.ingredient}" class="w-8 h-8 object-contain shrink-0" onerror="this.style.display='none'" />
                    <label for="ing_${idx}" class="text-gray-700 flex-1 text-sm select-none">
                      <span class="font-medium text-gray-900">${ing.measure}</span> ${ing.ingredient}
                    </label>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
                Instructions
              </h2>
              <div class="space-y-4">
                ${instructions.map((step, idx) => `
                  <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-sm shadow-sm">
                      ${idx + 1}
                    </div>
                    <p class="text-gray-700 leading-relaxed text-sm md:text-base pt-1">${step}</p>
                  </div>
                `).join('')}
              </div>
            </div>

            ${videoUrl ? `
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i class="fa-solid fa-video text-red-500"></i>
                  Video Tutorial
                </h2>
                <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-inner">
                  <iframe src="${videoUrl}" class="absolute inset-0 w-full h-full" frameborder="0" allowfullscreen></iframe>
                </div>
              </div>
            ` : ''}
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-chart-pie text-emerald-600"></i>
                Nutrition Facts
              </h2>
              <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <p class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Calories</p>
                <p class="text-4xl font-bold text-emerald-600">${nutrition.calories}</p>
                <p class="text-xs text-gray-500 mt-1">Total recipe: ${nutrition.totalCalories} kcal</p>
              </div>

              <div class="space-y-3.5 text-sm">
                <div>
                  <div class="flex justify-between mb-1"><span class="text-gray-700 font-medium">Protein</span><span class="font-bold text-gray-900">${nutrition.protein}g</span></div>
                  <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div class="bg-emerald-500 h-2 rounded-full" style="width: ${Math.min(100, Math.round((nutrition.protein/50)*100))}%"></div></div>
                </div>
                <div>
                  <div class="flex justify-between mb-1"><span class="text-gray-700 font-medium">Carbs</span><span class="font-bold text-gray-900">${nutrition.carbs}g</span></div>
                  <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(100, Math.round((nutrition.carbs/250)*100))}%"></div></div>
                </div>
                <div>
                  <div class="flex justify-between mb-1"><span class="text-gray-700 font-medium">Fat</span><span class="font-bold text-gray-900">${nutrition.fat}g</span></div>
                  <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div class="bg-purple-500 h-2 rounded-full" style="width: ${Math.min(100, Math.round((nutrition.fat/65)*100))}%"></div></div>
                </div>
                <div>
                  <div class="flex justify-between mb-1"><span class="text-gray-700 font-medium">Fiber</span><span class="font-bold text-gray-900">${nutrition.fiber}g</span></div>
                  <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div class="bg-amber-500 h-2 rounded-full" style="width: ${Math.min(100, Math.round((nutrition.fiber/28)*100))}%"></div></div>
                </div>
              </div>

              <div class="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                <div class="bg-gray-50 p-2 rounded flex justify-between"><span>Vit A</span><b>${nutrition.vitaminA}%</b></div>
                <div class="bg-gray-50 p-2 rounded flex justify-between"><span>Vit C</span><b>${nutrition.vitaminC}%</b></div>
                <div class="bg-gray-50 p-2 rounded flex justify-between"><span>Calcium</span><b>${nutrition.calcium}%</b></div>
                <div class="bg-gray-50 p-2 rounded flex justify-between"><span>Iron</span><b>${nutrition.iron}%</b></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('back-to-meals-btn').addEventListener('click', () => navigateTo('meals'));
    document.getElementById('log-meal-btn').addEventListener('click', () => {
      promptLogMeal(meal, nutrition);
    });
  }

  function promptLogMeal(meal, nutrition) {
    if (window.Swal) {
      window.Swal.fire({
        title: `<span class="text-xl font-bold text-gray-900">Log "${meal.strMeal}"</span>`,
        html: `
          <div class="text-left space-y-4 my-2">
            <p class="text-sm text-gray-600">Select how many servings you had:</p>
            <div class="flex items-center justify-center gap-4 py-2">
              <button type="button" id="swal-dec" class="w-10 h-10 rounded-xl bg-gray-100 font-bold text-lg">-</button>
              <input id="swal-servings" type="number" min="0.5" step="0.5" max="10" value="1" class="w-20 text-center text-xl font-bold py-2 border rounded-xl" />
              <button type="button" id="swal-inc" class="w-10 h-10 rounded-xl bg-gray-100 font-bold text-lg">+</button>
            </div>
            <div class="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
              <p id="swal-sum" class="text-lg font-bold text-emerald-700">${nutrition.calories} kcal • ${nutrition.protein}g Protein</p>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Add to Food Log',
        confirmButtonColor: '#059669',
        cancelButtonColor: '#6b7280',
        didOpen: () => {
          const inp = document.getElementById('swal-servings');
          const sum = document.getElementById('swal-sum');
          const update = () => {
            const s = Math.max(0.5, parseFloat(inp.value) || 1);
            inp.value = s;
            sum.textContent = `${Math.round(nutrition.calories * s)} kcal • ${Math.round(nutrition.protein * s)}g Protein`;
          };
          document.getElementById('swal-dec').onclick = () => { inp.value = Math.max(0.5, (parseFloat(inp.value)||1)-0.5); update(); };
          document.getElementById('swal-inc').onclick = () => { inp.value = Math.min(10, (parseFloat(inp.value)||1)+0.5); update(); };
          inp.oninput = update;
        },
        preConfirm: () => parseFloat(document.getElementById('swal-servings').value) || 1
      }).then(res => {
        if (res.isConfirmed) {
          const s = res.value || 1;
          state.addFoodLogEntry({
            name: meal.strMeal,
            type: 'meal',
            image: meal.strMealThumb,
            calories: Math.round(nutrition.calories * s),
            protein: Math.round(nutrition.protein * s),
            carbs: Math.round(nutrition.carbs * s),
            fat: Math.round(nutrition.fat * s),
            servings: s
          });
          showToast(`Logged ${s} serving(s) of "${meal.strMeal}"!`);
        }
      });
    } else {
      state.addFoodLogEntry({
        name: meal.strMeal,
        type: 'meal',
        image: meal.strMealThumb,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        servings: 1
      });
      showToast(`Logged "${meal.strMeal}"!`);
    }
  }

  // =========================================================================
  // 9. PRODUCT SCANNER LOGIC
  // =========================================================================
  function renderProductsUI(products) {
    if (!els.productsGrid) return;
    if (els.productsCount) {
      els.productsCount.textContent = products && products.length > 0 ? `Showing ${products.length} products` : 'Search for products or browse categories';
    }

    if (!products || products.length === 0) {
      renderEmpty(els.productsGrid, 'No products found', 'Search by product name or enter barcode above.');
      return;
    }

    const gradeColors = {
      a: 'bg-green-600 text-white',
      b: 'bg-lime-500 text-white',
      c: 'bg-yellow-500 text-white',
      d: 'bg-orange-500 text-white',
      e: 'bg-red-600 text-white'
    };

    els.productsGrid.innerHTML = products.map(p => {
      const g = (p.nutrition_grades || 'c').toLowerCase();
      const gClass = gradeColors[g] || gradeColors.c;
      const n = p.nutriments || {};
      const kcal = n['energy-kcal_100g'] || 0;
      const pro = n.proteins_100g || 0;
      const carb = n.carbohydrates_100g || 0;
      const fat = n.fat_100g || 0;
      const sug = n.sugars_100g || 0;

      return `
        <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group border border-gray-100" data-code="${p.code}">
          <div>
            <div class="relative h-44 bg-gray-50 flex items-center justify-center overflow-hidden p-4">
              <img class="max-h-36 max-w-full object-contain group-hover:scale-105 transition-transform" src="${p.image_url}" alt="${p.product_name}" loading="lazy" onerror="this.src='https://images.openfoodfacts.org/images/products/316/893/015/9742/front_fr.54.400.jpg'" />
              <div class="absolute top-2.5 left-2.5 ${gClass} text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-sm">
                Nutri-Score ${g.toUpperCase()}
              </div>
              ${p.nova_group ? `<div class="absolute top-2.5 right-2.5 bg-white/90 text-gray-800 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm border border-gray-200">NOVA ${p.nova_group}</div>` : ''}
            </div>

            <div class="p-4">
              <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${p.brands || 'Packaged'}</p>
              <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-emerald-600 transition-colors">${p.product_name}</h3>
              <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span><i class="fa-solid fa-weight-scale mr-1 text-emerald-600"></i>${p.quantity || '100g'}</span>
                <span><i class="fa-solid fa-fire mr-1 text-amber-500"></i>${kcal} kcal/100g</span>
              </div>
              <div class="grid grid-cols-4 gap-1 text-center mb-3">
                <div class="bg-emerald-50 rounded p-1.5"><p class="text-xs font-bold text-emerald-700">${pro}g</p><p class="text-[10px] text-gray-500">Protein</p></div>
                <div class="bg-blue-50 rounded p-1.5"><p class="text-xs font-bold text-blue-700">${carb}g</p><p class="text-[10px] text-gray-500">Carbs</p></div>
                <div class="bg-purple-50 rounded p-1.5"><p class="text-xs font-bold text-purple-700">${fat}g</p><p class="text-[10px] text-gray-500">Fat</p></div>
                <div class="bg-orange-50 rounded p-1.5"><p class="text-xs font-bold text-orange-700">${sug}g</p><p class="text-[10px] text-gray-500">Sugar</p></div>
              </div>
            </div>
          </div>
          <div class="px-4 pb-4 pt-0">
            <button class="log-product-btn w-full py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-emerald-200" data-code="${p.code}">
              <i class="fa-solid fa-plus text-xs"></i>
              <span>Add to Food Log</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    els.productsGrid.querySelectorAll('.log-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = products.find(p => p.code === btn.dataset.code);
        if (product) promptLogProduct(product);
      });
    });
  }

  function promptLogProduct(product) {
    const n = product.nutriments || {};
    const kcal100 = n['energy-kcal_100g'] || 0;
    const pro100 = n.proteins_100g || 0;
    const carb100 = n.carbohydrates_100g || 0;
    const fat100 = n.fat_100g || 0;

    if (window.Swal) {
      window.Swal.fire({
        title: `<span class="text-xl font-bold text-gray-900">Log "${product.product_name}"</span>`,
        html: `
          <div class="text-left space-y-4 my-2">
            <p class="text-sm text-gray-600">Enter portion size consumed:</p>
            <div class="flex items-center justify-center gap-3 py-2">
              <input id="swal-prod-g" type="number" min="10" step="10" value="100" class="w-28 text-center text-xl font-bold py-2 border rounded-xl" />
              <span class="text-base font-semibold text-gray-600">grams / ml</span>
            </div>
            <div class="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
              <p id="swal-prod-sum" class="text-lg font-bold text-emerald-700">${kcal100} kcal • ${pro100}g Protein</p>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Add to Food Log',
        confirmButtonColor: '#059669',
        cancelButtonColor: '#6b7280',
        didOpen: () => {
          const inp = document.getElementById('swal-prod-g');
          const sum = document.getElementById('swal-prod-sum');
          inp.oninput = () => {
            const g = Math.max(1, parseFloat(inp.value) || 100);
            const m = g / 100;
            sum.textContent = `${Math.round(kcal100 * m)} kcal • ${Number((pro100 * m).toFixed(1))}g Protein`;
          };
        },
        preConfirm: () => parseFloat(document.getElementById('swal-prod-g').value) || 100
      }).then(res => {
        if (res.isConfirmed) {
          const g = res.value || 100;
          const m = g / 100;
          state.addFoodLogEntry({
            name: product.product_name,
            type: 'product',
            image: product.image_url,
            calories: Math.round(kcal100 * m),
            protein: Number((pro100 * m).toFixed(1)),
            carbs: Number((carb100 * m).toFixed(1)),
            fat: Number((fat100 * m).toFixed(1)),
            servings: 1,
            unit: `${g}g`
          });
          showToast(`Logged ${g}g of "${product.product_name}"!`);
        }
      });
    }
  }

  // =========================================================================
  // 10. FOOD LOG RENDERING
  // =========================================================================
  function updateFoodLogView() {
    const todayItems = state.getTodayLog();
    const totals = state.getDailyTotals();
    const goals = state.dailyGoals;

    if (els.foodlogDate) {
      els.foodlogDate.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }

    const todaySection = document.getElementById('foodlog-today-section');
    if (todaySection) {
      const calPct = Math.min(100, Math.round((totals.calories / goals.calories) * 100)) || 0;
      const proPct = Math.min(100, Math.round((totals.protein / goals.protein) * 100)) || 0;
      const carbPct = Math.min(100, Math.round((totals.carbs / goals.carbs) * 100)) || 0;
      const fatPct = Math.min(100, Math.round((totals.fat / goals.fat) * 100)) || 0;

      const progressGrid = todaySection.querySelector('.grid');
      if (progressGrid) {
        progressGrid.innerHTML = `
          <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">Calories</span>
              <span class="text-sm font-bold text-emerald-700">${totals.calories} / ${goals.calories} kcal</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div class="bg-emerald-500 h-2.5 rounded-full" style="width: ${calPct}%"></div>
            </div>
            <p class="text-[11px] text-gray-500 mt-1 text-right">${calPct}%</p>
          </div>
          <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">Protein</span>
              <span class="text-sm font-bold text-blue-700">${totals.protein} / ${goals.protein} g</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div class="bg-blue-500 h-2.5 rounded-full" style="width: ${proPct}%"></div>
            </div>
            <p class="text-[11px] text-gray-500 mt-1 text-right">${proPct}%</p>
          </div>
          <div class="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">Carbs</span>
              <span class="text-sm font-bold text-amber-700">${totals.carbs} / ${goals.carbs} g</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div class="bg-amber-500 h-2.5 rounded-full" style="width: ${carbPct}%"></div>
            </div>
            <p class="text-[11px] text-gray-500 mt-1 text-right">${carbPct}%</p>
          </div>
          <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">Fat</span>
              <span class="text-sm font-bold text-purple-700">${totals.fat} / ${goals.fat} g</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div class="bg-purple-500 h-2.5 rounded-full" style="width: ${fatPct}%"></div>
            </div>
            <p class="text-[11px] text-gray-500 mt-1 text-right">${fatPct}%</p>
          </div>
        `;
      }
    }

    const headerCount = document.querySelector('#foodlog-today-section h4');
    if (headerCount) headerCount.textContent = `Logged Items (${todayItems.length})`;

    if (els.clearFoodlogBtn) {
      els.clearFoodlogBtn.style.display = todayItems.length > 0 ? 'inline-flex' : 'none';
      els.clearFoodlogBtn.onclick = () => {
        if (window.Swal) {
          window.Swal.fire({
            title: 'Clear Today\'s Log?',
            text: 'This will remove all logged food items for today.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, clear',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280'
          }).then(res => {
            if (res.isConfirmed) {
              state.clearFoodLog();
              updateFoodLogView();
              showToast('Today\'s log cleared', 'info');
            }
          });
        } else {
          state.clearFoodLog();
          updateFoodLogView();
        }
      };
    }

    if (els.loggedItemsList) {
      if (todayItems.length === 0) {
        els.loggedItemsList.innerHTML = `
          <div class="text-center py-10 text-gray-500">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
              <i class="fa-solid fa-utensils text-3xl"></i>
            </div>
            <p class="font-bold text-gray-800 mb-1">No food logged today</p>
            <p class="text-xs text-gray-500">Add meals from the Recipes page or scan products</p>
          </div>
        `;
      } else {
        els.loggedItemsList.innerHTML = todayItems.map(item => `
          <div class="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-white rounded-xl border border-gray-200 transition-all">
            <div class="flex items-center gap-3.5">
              ${item.image ? `<img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" onerror="this.style.display='none'" />` : `<div class="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0"><i class="fa-solid fa-bowl-food"></i></div>`}
              <div>
                <h4 class="font-bold text-gray-900 text-sm">${item.name}</h4>
                <p class="text-xs text-gray-500"><i class="fa-solid fa-clock mr-1"></i>${item.timestamp} • ${item.servings} serving(s)</p>
              </div>
            </div>
            <div class="flex items-center gap-5">
              <div class="text-right">
                <p class="font-bold text-emerald-600 text-sm">${item.calories} kcal</p>
                <p class="text-[11px] text-gray-500">${item.protein}g P • ${item.carbs}g C • ${item.fat}g F</p>
              </div>
              <button class="del-log-btn text-gray-400 hover:text-red-600 p-2" data-id="${item.id}"><i class="fa-solid fa-trash text-sm"></i></button>
            </div>
          </div>
        `).join('');

        els.loggedItemsList.querySelectorAll('.del-log-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            state.removeFoodLogEntry(btn.dataset.id);
            updateFoodLogView();
            showToast('Item removed', 'info');
          });
        });
      }
    }

    // Weekly Chart Plotly
    renderWeeklyChartPlotly();
  }

  function renderWeeklyChartPlotly() {
    if (!els.weeklyChart || !window.Plotly) return;
    const weekly = state.getWeeklyData();
    const xLabels = weekly.map(w => `${w.dayName} ${w.dayNum}`);
    const yVals = weekly.map(w => w.calories);
    const goalVals = weekly.map(() => state.dailyGoals.calories);

    const traceBars = {
      x: xLabels,
      y: yVals,
      name: 'Logged Calories',
      type: 'bar',
      marker: { color: weekly.map(w => w.isToday ? '#059669' : '#10b981') }
    };

    const traceGoal = {
      x: xLabels,
      y: goalVals,
      name: 'Daily Goal',
      type: 'scatter',
      mode: 'lines',
      line: { color: '#ef4444', dash: 'dash', width: 2 }
    };

    const layout = {
      margin: { t: 20, r: 20, l: 40, b: 40 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      showlegend: true,
      legend: { orientation: 'h', x: 0, y: 1.15 }
    };

    els.weeklyChart.innerHTML = '';
    window.Plotly.newPlot(els.weeklyChart, [traceBars, traceGoal], layout, { responsive: true, displayModeBar: false });
  }

  // =========================================================================
  // 11. INITIALIZATION & BINDINGS
  // =========================================================================
  async function init() {
    cacheDOMElements();

    // Mobile Sidebar
    if (els.headerMenuBtn) els.headerMenuBtn.onclick = () => { els.sidebar.classList.add('open'); if (els.sidebarOverlay) els.sidebarOverlay.classList.add('active'); };
    if (els.sidebarCloseBtn) els.sidebarCloseBtn.onclick = () => { els.sidebar.classList.remove('open'); if (els.sidebarOverlay) els.sidebarOverlay.classList.remove('active'); };
    if (els.sidebarOverlay) els.sidebarOverlay.onclick = () => { els.sidebar.classList.remove('open'); els.sidebarOverlay.classList.remove('active'); };

    // Navigation Links
    els.navLinks.forEach((l, i) => {
      l.onclick = (e) => {
        e.preventDefault();
        els.sidebar.classList.remove('open');
        if (els.sidebarOverlay) els.sidebarOverlay.classList.remove('active');
        if (i === 0) navigateTo('meals');
        else if (i === 1) navigateTo('products');
        else if (i === 2) navigateTo('foodlog');
      };
    });

    // View Toggles
    if (els.gridViewBtn) {
      els.gridViewBtn.onclick = () => {
        state.viewMode = 'grid';
        els.gridViewBtn.className = 'px-3 py-1.5 bg-white rounded-md shadow-sm';
        els.gridViewBtn.querySelector('i').className = 'fa-solid fa-table-cells text-gray-700';
        if (els.listViewBtn) {
          els.listViewBtn.className = 'px-3 py-1.5';
          els.listViewBtn.querySelector('i').className = 'fa-solid fa-list text-gray-500';
        }
        renderRecipesUI(state.recipes);
      };
    }
    if (els.listViewBtn) {
      els.listViewBtn.onclick = () => {
        state.viewMode = 'list';
        els.listViewBtn.className = 'px-3 py-1.5 bg-white rounded-md shadow-sm';
        els.listViewBtn.querySelector('i').className = 'fa-solid fa-list text-gray-700';
        if (els.gridViewBtn) {
          els.gridViewBtn.className = 'px-3 py-1.5';
          els.gridViewBtn.querySelector('i').className = 'fa-solid fa-table-cells text-gray-500';
        }
        renderRecipesUI(state.recipes);
      };
    }

    // Search Input
    let searchTimer = null;
    if (els.searchInput) {
      els.searchInput.oninput = (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(async () => {
          state.searchQuery = e.target.value;
          state.selectedCategory = null;
          state.selectedArea = null;
          renderCategoriesUI(state.categories);
          renderAreaPillsUI(state.areas);
          renderSpinner(els.recipesGrid);
          state.recipes = await searchMeals(e.target.value);
          renderRecipesUI(state.recipes);
        }, 300);
      };
    }

    // Product Scanner Search
    const doProductSearch = async () => {
      const q = els.productSearchInput ? els.productSearchInput.value.trim() : '';
      renderSpinner(els.productsGrid);
      state.products = await searchProducts(q);
      renderProductsUI(state.products);
    };
    if (els.searchProductBtn) els.searchProductBtn.onclick = doProductSearch;
    if (els.productSearchInput) els.productSearchInput.onkeydown = (e) => { if (e.key === 'Enter') doProductSearch(); };

    // Product Scanner Barcode Lookup
    const doBarcode = async () => {
      const code = els.barcodeInput ? els.barcodeInput.value.trim() : '';
      if (!code) return;
      renderSpinner(els.productsGrid);
      const prod = await lookupBarcode(code);
      if (prod) {
        state.products = [prod];
        renderProductsUI([prod]);
      } else {
        renderEmpty(els.productsGrid, 'Barcode not found', `No product found for barcode ${code}.`);
      }
    };
    if (els.lookupBarcodeBtn) els.lookupBarcodeBtn.onclick = doBarcode;
    if (els.barcodeInput) els.barcodeInput.onkeydown = (e) => { if (e.key === 'Enter') doBarcode(); };

    // Nutri-Score filter buttons
    els.nutriScoreFilters.forEach(btn => {
      btn.onclick = () => {
        const grade = btn.dataset.grade || '';
        state.selectedNutriScore = grade;
        els.nutriScoreFilters.forEach(b => {
          b.className = (b.dataset.grade || '') === grade
            ? 'nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold bg-emerald-600 text-white shadow-sm'
            : 'nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200';
        });
        let filtered = state.products;
        if (grade) filtered = filtered.filter(p => (p.nutrition_grades || '').toLowerCase() === grade.toLowerCase());
        renderProductsUI(filtered);
      };
    });

    // Product categories
    els.productCategories.forEach(btn => {
      btn.onclick = async () => {
        const cat = btn.textContent.trim().toLowerCase();
        renderSpinner(els.productsGrid);
        state.products = await searchProducts(cat);
        renderProductsUI(state.products);
      };
    });

    // Quick Log Action buttons
    els.quickLogBtns.forEach((btn, idx) => {
      btn.onclick = () => {
        if (idx === 0) navigateTo('meals');
        else if (idx === 1) navigateTo('products');
        else if (idx === 2) {
          if (window.Swal) {
            window.Swal.fire({
              title: 'Custom Food Entry',
              html: `
                <div class="text-left space-y-3 my-2 text-sm">
                  <input id="custom-name" placeholder="Food Name" class="w-full p-2.5 border rounded-xl" />
                  <div class="grid grid-cols-2 gap-2">
                    <input id="custom-cal" type="number" placeholder="Calories (kcal)" class="p-2.5 border rounded-xl" />
                    <input id="custom-pro" type="number" placeholder="Protein (g)" class="p-2.5 border rounded-xl" />
                    <input id="custom-carb" type="number" placeholder="Carbs (g)" class="p-2.5 border rounded-xl" />
                    <input id="custom-fat" type="number" placeholder="Fat (g)" class="p-2.5 border rounded-xl" />
                  </div>
                </div>
              `,
              showCancelButton: true,
              confirmButtonText: 'Add to Log',
              confirmButtonColor: '#059669',
              preConfirm: () => {
                const name = document.getElementById('custom-name').value.trim();
                if (!name) { window.Swal.showValidationMessage('Please enter food name'); return false; }
                return {
                  name,
                  calories: parseFloat(document.getElementById('custom-cal').value) || 0,
                  protein: parseFloat(document.getElementById('custom-pro').value) || 0,
                  carbs: parseFloat(document.getElementById('custom-carb').value) || 0,
                  fat: parseFloat(document.getElementById('custom-fat').value) || 0
                };
              }
            }).then(res => {
              if (res.isConfirmed) {
                state.addFoodLogEntry(res.value);
                updateFoodLogView();
                showToast(`Logged "${res.value.name}"!`);
              }
            });
          }
        }
      };
    });

    // Load initial data
    try {
      const [cats, areas, recipes] = await Promise.all([
        fetchCategories(),
        fetchAreas(),
        fetchInitialRecipes(25)
      ]);
      state.categories = cats;
      state.areas = areas;
      state.recipes = recipes;

      renderCategoriesUI(cats);
      renderAreaPillsUI(areas);
      renderRecipesUI(recipes);

      state.products = await searchProducts('');
      renderProductsUI(state.products);
      updateFoodLogView();
    } catch (err) {
      console.error('App init error:', err);
    } finally {
      // Always dismiss loading overlay safely
      if (els.loadingOverlay) {
        els.loadingOverlay.style.opacity = '0';
        setTimeout(() => { els.loadingOverlay.style.display = 'none'; }, 400);
      }
    }
  }

  // Self-execute on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
