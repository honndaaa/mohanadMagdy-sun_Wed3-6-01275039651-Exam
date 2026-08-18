/**
 * NutriPlan - Main Application Controller
 */

import {
  fetchCategories,
  fetchAreas,
  fetchInitialRecipes,
  searchMeals,
  filterByCategory,
  filterByArea,
  getMealById
} from './api/mealdb.js';

import {
  searchProducts,
  lookupBarcode,
  filterProductsByGrade,
  filterProductsByCategory
} from './api/openfoodfacts.js';

import { appState } from './state/appState.js';

import {
  showToast,
  renderLoadingSpinner,
  renderEmptyState,
  renderCategories,
  renderAreaPills,
  renderRecipes,
  renderMealDetails,
  renderProducts,
  renderFoodLog,
  renderWeeklyChart
} from './ui/components.js';

// DOM Element References
const elements = {
  loadingOverlay: document.getElementById('app-loading-overlay'),
  sidebar: document.getElementById('sidebar'),
  sidebarOverlay: document.getElementById('sidebar-overlay'),
  sidebarCloseBtn: document.getElementById('sidebar-close-btn'),
  headerMenuBtn: document.getElementById('header-menu-btn'),
  headerTitle: document.querySelector('#header h1'),
  headerSubtitle: document.querySelector('#header p'),
  navLinks: document.querySelectorAll('.nav-link'),
  
  // Meals Page Sections
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

  // Products Page Sections
  productsSection: document.getElementById('products-section'),
  productSearchInput: document.getElementById('product-search-input'),
  searchProductBtn: document.getElementById('search-product-btn'),
  barcodeInput: document.getElementById('barcode-input'),
  lookupBarcodeBtn: document.getElementById('lookup-barcode-btn'),
  nutriScoreFilters: document.querySelectorAll('.nutri-score-filter'),
  productCategories: document.querySelectorAll('.product-category-btn'),
  productsGrid: document.getElementById('products-grid'),
  productsCount: document.getElementById('products-count'),

  // Food Log Page Sections
  foodlogSection: document.getElementById('foodlog-section'),
  foodlogDate: document.getElementById('foodlog-date'),
  clearFoodlogBtn: document.getElementById('clear-foodlog'),
  loggedItemsList: document.getElementById('logged-items-list'),
  weeklyChart: document.getElementById('weekly-chart'),
  quickLogBtns: document.querySelectorAll('.quick-log-btn')
};

/**
 * Initialize App
 */
async function initApp() {
  setupNavigation();
  setupMealsHandlers();
  setupProductScannerHandlers();
  setupFoodLogHandlers();

  // Load initial data
  await loadInitialMealsData();
  await loadInitialProductsData();
  updateFoodLogView();

  // Hide loading overlay smoothly
  if (elements.loadingOverlay) {
    elements.loadingOverlay.style.opacity = '0';
    setTimeout(() => {
      elements.loadingOverlay.style.display = 'none';
    }, 500);
  }
}

/**
 * Setup Navigation & Sidebar
 */
function setupNavigation() {
  // Mobile sidebar toggle
  if (elements.headerMenuBtn) {
    elements.headerMenuBtn.addEventListener('click', () => {
      elements.sidebar.classList.add('open');
      if (elements.sidebarOverlay) elements.sidebarOverlay.classList.add('active');
    });
  }

  const closeSidebar = () => {
    elements.sidebar.classList.remove('open');
    if (elements.sidebarOverlay) elements.sidebarOverlay.classList.remove('active');
  };

  if (elements.sidebarCloseBtn) {
    elements.sidebarCloseBtn.addEventListener('click', closeSidebar);
  }
  if (elements.sidebarOverlay) {
    elements.sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Sidebar Nav Links
  // [0] -> Meals & Recipes, [1] -> Product Scanner, [2] -> Food Log
  elements.navLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      closeSidebar();
      if (index === 0) navigateTo('meals');
      else if (index === 1) navigateTo('products');
      else if (index === 2) navigateTo('foodlog');
    });
  });
}

/**
 * Switch Views
 */
function navigateTo(page, params = {}) {
  appState.setPage(page);

  // Update Nav Links Active Styles
  elements.navLinks.forEach((link, idx) => {
    const isTarget = (page === 'meals' || page === 'meal-details') ? idx === 0 : page === 'products' ? idx === 1 : idx === 2;
    if (isTarget) {
      link.className = 'nav-link flex items-center gap-3 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg transition-all font-semibold';
    } else {
      link.className = 'nav-link flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all font-medium';
    }
  });

  // Hide all sections first
  if (elements.searchFiltersSection) elements.searchFiltersSection.style.display = 'none';
  if (elements.mealCategoriesSection) elements.mealCategoriesSection.style.display = 'none';
  if (elements.allRecipesSection) elements.allRecipesSection.style.display = 'none';
  if (elements.mealDetailsSection) elements.mealDetailsSection.style.display = 'none';
  if (elements.productsSection) elements.productsSection.style.display = 'none';
  if (elements.foodlogSection) elements.foodlogSection.style.display = 'none';

  window.scrollTo({ top: 0, behavior: 'smooth' });

  switch (page) {
    case 'meals':
      if (elements.headerTitle) elements.headerTitle.textContent = 'Meals & Recipes';
      if (elements.headerSubtitle) elements.headerSubtitle.textContent = 'Discover delicious and nutritious recipes tailored for you';
      if (elements.searchFiltersSection) elements.searchFiltersSection.style.display = '';
      if (elements.mealCategoriesSection) elements.mealCategoriesSection.style.display = '';
      if (elements.allRecipesSection) elements.allRecipesSection.style.display = '';
      break;

    case 'meal-details':
      if (elements.headerTitle) elements.headerTitle.textContent = 'Recipe Details';
      if (elements.headerSubtitle) elements.headerSubtitle.textContent = 'Detailed ingredients, instructions and nutritional breakdown';
      if (elements.mealDetailsSection) elements.mealDetailsSection.style.display = '';
      if (params.mealId) {
        loadMealDetails(params.mealId);
      }
      break;

    case 'products':
      if (elements.headerTitle) elements.headerTitle.textContent = 'Product Scanner';
      if (elements.headerSubtitle) elements.headerSubtitle.textContent = 'Search packaged foods by name or barcode';
      if (elements.productsSection) elements.productsSection.style.display = '';
      break;

    case 'foodlog':
      if (elements.headerTitle) elements.headerTitle.textContent = 'Food Log';
      if (elements.headerSubtitle) elements.headerSubtitle.textContent = 'Track your daily nutrition and food intake';
      if (elements.foodlogSection) elements.foodlogSection.style.display = '';
      updateFoodLogView();
      break;
  }
}

/**
 * ================= MEALS & RECIPES =================
 */
async function loadInitialMealsData() {
  renderLoadingSpinner(elements.recipesGrid);

  try {
    // Parallel fetch categories, areas, and 25 recipes
    const [categories, areas, recipes] = await Promise.all([
      fetchCategories(),
      fetchAreas(),
      fetchInitialRecipes(25)
    ]);

    appState.categories = categories;
    appState.areas = areas;
    appState.recipes = recipes;

    renderCategories(categories, appState.selectedCategory, handleCategorySelect);
    renderAreaPills(areas, appState.selectedArea, appState.selectedCategory, handleAreaSelect);
    renderRecipes(recipes, elements.recipesGrid, appState.viewMode, handleRecipeClick);
  } catch (error) {
    console.error('Failed to load meals data:', error);
    renderEmptyState(elements.recipesGrid, 'Failed to load recipes', 'Please check your connection and try again.');
  }
}

function setupMealsHandlers() {
  // Search input with debounce
  let searchTimeout = null;
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async () => {
        appState.searchQuery = query;
        appState.selectedCategory = null;
        appState.selectedArea = null;
        
        // Re-render categories and areas without active highlight
        renderCategories(appState.categories, null, handleCategorySelect);
        renderAreaPills(appState.areas, null, null, handleAreaSelect);
        
        renderLoadingSpinner(elements.recipesGrid);
        const results = await searchMeals(query);
        appState.recipes = results;
        renderRecipes(results, elements.recipesGrid, appState.viewMode, handleRecipeClick);
      }, 350);
    });
  }

  // View Mode Toggles
  if (elements.gridViewBtn) {
    elements.gridViewBtn.addEventListener('click', () => {
      appState.setViewMode('grid');
      elements.gridViewBtn.className = 'px-3 py-1.5 bg-white rounded-md shadow-sm';
      elements.gridViewBtn.querySelector('i').className = 'fa-solid fa-table-cells text-gray-700';
      if (elements.listViewBtn) {
        elements.listViewBtn.className = 'px-3 py-1.5';
        elements.listViewBtn.querySelector('i').className = 'fa-solid fa-list text-gray-500';
      }
      renderRecipes(appState.recipes, elements.recipesGrid, 'grid', handleRecipeClick);
    });
  }

  if (elements.listViewBtn) {
    elements.listViewBtn.addEventListener('click', () => {
      appState.setViewMode('list');
      elements.listViewBtn.className = 'px-3 py-1.5 bg-white rounded-md shadow-sm';
      elements.listViewBtn.querySelector('i').className = 'fa-solid fa-list text-gray-700';
      if (elements.gridViewBtn) {
        elements.gridViewBtn.className = 'px-3 py-1.5';
        elements.gridViewBtn.querySelector('i').className = 'fa-solid fa-table-cells text-gray-500';
      }
      renderRecipes(appState.recipes, elements.recipesGrid, 'list', handleRecipeClick);
    });
  }
}

async function handleCategorySelect(category) {
  appState.selectedCategory = category;
  appState.selectedArea = null;
  if (elements.searchInput) elements.searchInput.value = '';

  renderCategories(appState.categories, category, handleCategorySelect);
  renderAreaPills(appState.areas, null, category, handleAreaSelect);
  renderLoadingSpinner(elements.recipesGrid);

  if (category) {
    const results = await filterByCategory(category);
    appState.recipes = results;
  } else {
    const results = await fetchInitialRecipes(25);
    appState.recipes = results;
  }
  renderRecipes(appState.recipes, elements.recipesGrid, appState.viewMode, handleRecipeClick);
}

async function handleAreaSelect(area) {
  appState.selectedArea = area;
  appState.selectedCategory = null;
  if (elements.searchInput) elements.searchInput.value = '';

  renderCategories(appState.categories, null, handleCategorySelect);
  renderAreaPills(appState.areas, area, null, handleAreaSelect);
  renderLoadingSpinner(elements.recipesGrid);

  if (area) {
    const results = await filterByArea(area);
    appState.recipes = results;
  } else {
    const results = await fetchInitialRecipes(25);
    appState.recipes = results;
  }
  renderRecipes(appState.recipes, elements.recipesGrid, appState.viewMode, handleRecipeClick);
}

function handleRecipeClick(mealId) {
  navigateTo('meal-details', { mealId });
}

async function loadMealDetails(mealId) {
  if (!elements.mealDetailsSection) return;
  elements.mealDetailsSection.innerHTML = `
    <div class="flex items-center justify-center py-24">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
    </div>
  `;

  const meal = await getMealById(mealId);
  if (!meal) {
    renderEmptyState(elements.mealDetailsSection, 'Meal details not found', 'Please return to recipes list.');
    return;
  }

  appState.currentMeal = meal;
  renderMealDetails(
    meal,
    elements.mealDetailsSection,
    () => navigateTo('meals'),
    handleLogMeal
  );
}

/**
 * Handle "Log This Meal" with Servings Dialog
 */
function handleLogMeal(meal, nutrition) {
  if (window.Swal) {
    window.Swal.fire({
      title: `<span class="text-xl font-bold text-gray-900">Log "${meal.strMeal}"</span>`,
      html: `
        <div class="text-left space-y-4 my-2">
          <p class="text-sm text-gray-600">Select how many servings you had today:</p>
          <div class="flex items-center justify-center gap-4 py-2">
            <button type="button" id="swal-decrease" class="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-lg text-gray-700 transition">-</button>
            <input id="swal-servings-input" type="number" min="0.5" step="0.5" max="10" value="1" class="w-20 text-center text-xl font-bold py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            <button type="button" id="swal-increase" class="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-lg text-gray-700 transition">+</button>
          </div>
          <div class="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
            <p class="text-xs text-emerald-800 font-medium">Estimated Intake:</p>
            <p id="swal-summary" class="text-lg font-bold text-emerald-700 mt-0.5">
              ${nutrition.calories} kcal • ${nutrition.protein}g Protein
            </p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Add to Food Log',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'rounded-2xl shadow-xl'
      },
      didOpen: () => {
        const input = document.getElementById('swal-servings-input');
        const summary = document.getElementById('swal-summary');
        const decBtn = document.getElementById('swal-decrease');
        const incBtn = document.getElementById('swal-increase');

        const updateSummary = () => {
          const s = Math.max(0.5, parseFloat(input.value) || 1);
          input.value = s;
          const cal = Math.round(nutrition.calories * s);
          const pro = Math.round(nutrition.protein * s);
          summary.textContent = `${cal} kcal • ${pro}g Protein`;
        };

        if (decBtn) {
          decBtn.onclick = () => {
            input.value = Math.max(0.5, (parseFloat(input.value) || 1) - 0.5);
            updateSummary();
          };
        }
        if (incBtn) {
          incBtn.onclick = () => {
            input.value = Math.min(10, (parseFloat(input.value) || 1) + 0.5);
            updateSummary();
          };
        }
        if (input) input.oninput = updateSummary;
      },
      preConfirm: () => {
        const input = document.getElementById('swal-servings-input');
        return parseFloat(input.value) || 1;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const servings = result.value || 1;
        appState.addFoodLogEntry({
          name: meal.strMeal,
          type: 'meal',
          image: meal.strMealThumb,
          calories: Math.round(nutrition.calories * servings),
          protein: Math.round(nutrition.protein * servings),
          carbs: Math.round(nutrition.carbs * servings),
          fat: Math.round(nutrition.fat * servings),
          sugar: Math.round(nutrition.sugar * servings),
          fiber: Math.round(nutrition.fiber * servings),
          servings: servings,
          unit: 'serving'
        });

        showToast(`Logged ${servings} serving(s) of "${meal.strMeal}"!`);
      }
    });
  } else {
    // Fallback if Swal is not loaded
    appState.addFoodLogEntry({
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

/**
 * ================= PRODUCT SCANNER =================
 */
async function loadInitialProductsData() {
  const products = await searchProducts('');
  appState.products = products;
  renderProducts(products, elements.productsGrid, handleLogProduct);
}

function setupProductScannerHandlers() {
  // Search button & Enter key
  const doProductSearch = async () => {
    const query = elements.productSearchInput ? elements.productSearchInput.value.trim() : '';
    renderLoadingSpinner(elements.productsGrid);
    const results = await searchProducts(query);
    appState.products = results;
    appState.selectedNutriScore = '';
    appState.selectedProductCategory = null;
    updateNutriScoreFilterUI();
    renderProducts(results, elements.productsGrid, handleLogProduct);
  };

  if (elements.searchProductBtn) {
    elements.searchProductBtn.addEventListener('click', doProductSearch);
  }
  if (elements.productSearchInput) {
    elements.productSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doProductSearch();
    });
  }

  // Barcode lookup
  const doBarcodeLookup = async () => {
    const barcode = elements.barcodeInput ? elements.barcodeInput.value.trim() : '';
    if (!barcode) {
      showToast('Please enter a barcode number', 'info');
      return;
    }
    renderLoadingSpinner(elements.productsGrid);
    const product = await lookupBarcode(barcode);
    if (product) {
      appState.products = [product];
      renderProducts([product], elements.productsGrid, handleLogProduct);
      showToast(`Found product: ${product.product_name}`);
    } else {
      renderEmptyState(elements.productsGrid, 'Barcode not found', `No product matching barcode "${barcode}". Try another barcode or search by name.`);
    }
  };

  if (elements.lookupBarcodeBtn) {
    elements.lookupBarcodeBtn.addEventListener('click', doBarcodeLookup);
  }
  if (elements.barcodeInput) {
    elements.barcodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doBarcodeLookup();
    });
  }

  // Nutri-Score Filter Buttons
  elements.nutriScoreFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      const grade = btn.dataset.grade || '';
      appState.selectedNutriScore = grade;
      updateNutriScoreFilterUI();

      let filtered = appState.products;
      if (grade) {
        filtered = filterProductsByGrade(filtered, grade);
      }
      if (appState.selectedProductCategory) {
        filtered = filterProductsByCategory(filtered, appState.selectedProductCategory);
      }
      renderProducts(filtered, elements.productsGrid, handleLogProduct);
    });
  });

  // Category Buttons
  elements.productCategories.forEach(btn => {
    btn.addEventListener('click', async () => {
      const catText = btn.textContent.trim().toLowerCase();
      appState.selectedProductCategory = catText;
      renderLoadingSpinner(elements.productsGrid);
      const results = await searchProducts(catText);
      appState.products = results;
      renderProducts(results, elements.productsGrid, handleLogProduct);
    });
  });
}

function updateNutriScoreFilterUI() {
  elements.nutriScoreFilters.forEach(btn => {
    const grade = btn.dataset.grade || '';
    if (grade === appState.selectedNutriScore) {
      btn.className = 'nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-emerald-600 text-white shadow-sm';
    } else {
      btn.className = 'nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  });
}

function handleLogProduct(product) {
  const nutriments = product.nutriments || {};
  const kcal100 = nutriments['energy-kcal_100g'] || 0;
  const pro100 = nutriments.proteins_100g || 0;
  const carb100 = nutriments.carbohydrates_100g || 0;
  const fat100 = nutriments.fat_100g || 0;

  if (window.Swal) {
    window.Swal.fire({
      title: `<span class="text-xl font-bold text-gray-900">Log "${product.product_name}"</span>`,
      html: `
        <div class="text-left space-y-4 my-2">
          <p class="text-sm text-gray-600">Enter portion size consumed:</p>
          <div class="flex items-center justify-center gap-3 py-2">
            <input id="swal-product-portion" type="number" min="10" step="10" value="100" class="w-28 text-center text-xl font-bold py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            <span class="text-base font-semibold text-gray-600">grams / ml</span>
          </div>
          <div class="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
            <p class="text-xs text-emerald-800 font-medium">Estimated Intake:</p>
            <p id="swal-product-summary" class="text-lg font-bold text-emerald-700 mt-0.5">
              ${kcal100} kcal • ${pro100}g Protein
            </p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Add to Food Log',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'rounded-2xl shadow-xl'
      },
      didOpen: () => {
        const input = document.getElementById('swal-product-portion');
        const summary = document.getElementById('swal-product-summary');

        const updateSummary = () => {
          const grams = Math.max(1, parseFloat(input.value) || 100);
          const mult = grams / 100;
          const cal = Math.round(kcal100 * mult);
          const pro = Number((pro100 * mult).toFixed(1));
          summary.textContent = `${cal} kcal • ${pro}g Protein`;
        };

        if (input) input.oninput = updateSummary;
      },
      preConfirm: () => {
        const input = document.getElementById('swal-product-portion');
        return parseFloat(input.value) || 100;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const grams = result.value || 100;
        const mult = grams / 100;
        appState.addFoodLogEntry({
          name: product.product_name,
          type: 'product',
          image: product.image_url,
          calories: Math.round(kcal100 * mult),
          protein: Number((pro100 * mult).toFixed(1)),
          carbs: Number((carb100 * mult).toFixed(1)),
          fat: Number((fat100 * mult).toFixed(1)),
          servings: 1,
          unit: `${grams}g`
        });

        showToast(`Logged ${grams}g of "${product.product_name}"!`);
      }
    });
  } else {
    appState.addFoodLogEntry({
      name: product.product_name,
      type: 'product',
      image: product.image_url,
      calories: kcal100,
      protein: pro100,
      carbs: carb100,
      fat: fat100,
      servings: 1,
      unit: '100g'
    });
    showToast(`Logged "${product.product_name}"!`);
  }
}

/**
 * ================= FOOD LOG =================
 */
function setupFoodLogHandlers() {
  // Listen to state changes
  appState.subscribe('foodLogChanged', () => {
    if (appState.currentPage === 'foodlog') {
      updateFoodLogView();
    }
  });

  // Quick Action Buttons
  // [0] -> Log a Meal, [1] -> Scan Product, [2] -> Custom Entry
  elements.quickLogBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      if (index === 0) {
        navigateTo('meals');
      } else if (index === 1) {
        navigateTo('products');
      } else if (index === 2) {
        openCustomFoodDialog();
      }
    });
  });
}

function updateFoodLogView() {
  const todayItems = appState.getTodayLog();
  const totals = appState.getDailyTotals();
  const goals = appState.dailyGoals;

  renderFoodLog(
    todayItems,
    totals,
    goals,
    handleDeleteFoodLogItem,
    handleClearFoodLog
  );

  const weeklyData = appState.getWeeklyData();
  renderWeeklyChart(weeklyData, goals);
}

function handleDeleteFoodLogItem(id) {
  appState.removeFoodLogEntry(id);
  showToast('Item removed from Food Log', 'info');
}

function handleClearFoodLog() {
  if (window.Swal) {
    window.Swal.fire({
      title: 'Clear Today\'s Food Log?',
      text: 'This will remove all food items logged today. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear all',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'rounded-2xl'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        appState.clearFoodLog();
        showToast('Today\'s Food Log cleared', 'info');
      }
    });
  } else {
    if (confirm('Clear today\'s food log?')) {
      appState.clearFoodLog();
      showToast('Today\'s Food Log cleared', 'info');
    }
  }
}

function openCustomFoodDialog() {
  if (window.Swal) {
    window.Swal.fire({
      title: '<span class="text-xl font-bold text-gray-900">Add Custom Food Item</span>',
      html: `
        <div class="text-left space-y-3 my-2">
          <div>
            <label class="text-xs font-semibold text-gray-700 mb-1 block">Food Name</label>
            <input id="custom-name" type="text" placeholder="e.g., Homemade Avocado Toast" class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-semibold text-gray-700 mb-1 block">Calories (kcal)</label>
              <input id="custom-calories" type="number" min="0" placeholder="320" class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-700 mb-1 block">Protein (g)</label>
              <input id="custom-protein" type="number" min="0" placeholder="12" class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-700 mb-1 block">Carbs (g)</label>
              <input id="custom-carbs" type="number" min="0" placeholder="28" class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-700 mb-1 block">Fat (g)</label>
              <input id="custom-fat" type="number" min="0" placeholder="14" class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Add to Food Log',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'rounded-2xl shadow-xl'
      },
      preConfirm: () => {
        const name = document.getElementById('custom-name').value.trim();
        const calories = parseFloat(document.getElementById('custom-calories').value) || 0;
        const protein = parseFloat(document.getElementById('custom-protein').value) || 0;
        const carbs = parseFloat(document.getElementById('custom-carbs').value) || 0;
        const fat = parseFloat(document.getElementById('custom-fat').value) || 0;

        if (!name) {
          window.Swal.showValidationMessage('Please enter a food name');
          return false;
        }

        return { name, calories, protein, carbs, fat };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const data = result.value;
        appState.addFoodLogEntry({
          name: data.name,
          type: 'custom',
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          servings: 1
        });
        showToast(`Logged "${data.name}"!`);
      }
    });
  }
}

// Kickoff application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
