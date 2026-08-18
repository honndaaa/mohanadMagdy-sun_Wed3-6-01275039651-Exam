/**
 * NutriPlan UI Components and Renderers
 */

import { CATEGORY_STYLES, extractIngredients, calculateMealNutrition, formatInstructions } from '../api/mealdb.js';

/**
 * Toast notification using SweetAlert2
 */
export function showToast(title, icon = 'success') {
  if (window.Swal) {
    const Toast = window.Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = window.Swal.stopTimer;
        toast.onmouseleave = window.Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: icon,
      title: title
    });
  } else {
    alert(title);
  }
}

/**
 * Render loading spinner
 */
export function renderLoadingSpinner(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-3">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
        <p class="text-sm font-medium text-gray-500">Loading delicious recipes...</p>
      </div>
    </div>
  `;
}

/**
 * Render empty state
 */
export function renderEmptyState(container, title = 'No results found', message = 'Try searching with different keywords or clearing filters') {
  if (!container) return;
  container.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
        <i class="fa-solid fa-utensils text-2xl"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-800 mb-1">${title}</h3>
      <p class="text-sm text-gray-500 max-w-md">${message}</p>
    </div>
  `;
}

/**
 * Render meal categories into #categories-grid
 */
export function renderCategories(categories, activeCategory, onCategoryClick) {
  const container = document.getElementById('categories-grid');
  if (!container) return;

  if (!categories || categories.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = categories.map(cat => {
    const style = CATEGORY_STYLES[cat.strCategory] || {
      bg: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-200 hover:border-emerald-400',
      iconBg: 'from-emerald-400 to-green-500',
      icon: 'fa-bowl-food',
      textColor: 'text-gray-900'
    };

    const isActive = activeCategory === cat.strCategory;
    const activeClasses = isActive 
      ? 'ring-2 ring-emerald-600 shadow-md scale-105' 
      : 'hover:border-emerald-400 hover:shadow-md';

    return `
      <div
        class="category-card bg-gradient-to-br ${style.bg} rounded-xl p-3 border ${style.border} ${activeClasses} cursor-pointer transition-all group"
        data-category="${cat.strCategory}"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="text-white w-9 h-9 bg-gradient-to-br ${style.iconBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
          >
            <i class="fa-solid ${style.icon}"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">${cat.strCategory}</h3>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach click listeners
  container.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      if (onCategoryClick) onCategoryClick(cat === activeCategory ? null : cat);
    });
  });
}

/**
 * Render cuisine/area horizontal pills into #search-filters-section
 */
export function renderAreaPills(areas, activeArea, activeCategory, onAreaClick) {
  const container = document.querySelector('#search-filters-section .flex.overflow-x-auto');
  if (!container) return;

  const isAllActive = !activeArea && !activeCategory;

  let html = `
    <button
      data-area=""
      class="area-pill px-4 py-2 ${isAllActive ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-full font-medium text-sm whitespace-nowrap transition-all"
    >
      All Recipes
    </button>
  `;

  html += areas.map(area => {
    const isActive = activeArea === area;
    return `
      <button
        data-area="${area}"
        class="area-pill px-4 py-2 ${isActive ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-full font-medium text-sm whitespace-nowrap transition-all"
      >
        ${area}
      </button>
    `;
  }).join('');

  container.innerHTML = html;

  container.querySelectorAll('.area-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const area = btn.dataset.area;
      if (onAreaClick) onAreaClick(area || null);
    });
  });
}

/**
 * Render recipes list (Grid or List view)
 */
export function renderRecipes(recipes, container, viewMode = 'grid', onRecipeClick) {
  if (!container) return;

  const countElem = document.getElementById('recipes-count');
  if (countElem) {
    countElem.textContent = `Showing ${recipes ? recipes.length : 0} recipes`;
  }

  if (!recipes || recipes.length === 0) {
    renderEmptyState(container, 'No recipes found', 'Try searching for something else or exploring a different category.');
    return;
  }

  if (viewMode === 'list') {
    container.className = 'flex flex-col gap-4';
    container.innerHTML = recipes.map(meal => {
      const category = meal.strCategory || 'Recipe';
      const area = meal.strArea || 'International';
      const snippet = meal.strInstructions ? meal.strInstructions.slice(0, 140) + '...' : 'Delicious recipe ready to explore!';

      return `
        <div
          class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-center group border border-gray-100 p-3 gap-4"
          data-meal-id="${meal.idMeal}"
        >
          <div class="relative w-full sm:w-48 h-36 rounded-lg overflow-hidden shrink-0">
            <img
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src="${meal.strMealThumb}"
              alt="${meal.strMeal}"
              loading="lazy"
            />
            <span class="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[11px] font-semibold rounded-md text-gray-700">
              ${category}
            </span>
          </div>

          <div class="flex-1 w-full">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                ${area}
              </span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-emerald-600 transition-colors">
              ${meal.strMeal}
            </h3>
            <p class="text-xs text-gray-600 mb-3 line-clamp-2">
              ${snippet}
            </p>
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span class="font-medium text-gray-700"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${category}</span>
              <span class="font-medium text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${area}</span>
              <span class="ml-auto text-emerald-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Recipe <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } else {
    // Grid View
    container.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5';
    container.innerHTML = recipes.map(meal => {
      const category = meal.strCategory || 'Recipe';
      const area = meal.strArea || 'International';
      const snippet = meal.strInstructions ? meal.strInstructions.slice(0, 80) + '...' : 'Delicious recipe ready to cook!';

      return `
        <div
          class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group border border-gray-100 flex flex-col justify-between"
          data-meal-id="${meal.idMeal}"
        >
          <div>
            <div class="relative h-48 overflow-hidden bg-gray-100">
              <img
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                src="${meal.strMealThumb}"
                alt="${meal.strMeal}"
                loading="lazy"
              />
              <div class="absolute bottom-3 left-3 flex gap-2 flex-wrap">
                <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700 shadow-sm">
                  ${category}
                </span>
                <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white shadow-sm">
                  ${area}
                </span>
              </div>
            </div>
            <div class="p-4">
              <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
                ${meal.strMeal}
              </h3>
              <p class="text-xs text-gray-600 mb-3 line-clamp-2">
                ${snippet}
              </p>
            </div>
          </div>

          <div class="px-4 pb-4 pt-0">
            <div class="flex items-center justify-between text-xs pt-2 border-t border-gray-50">
              <span class="font-semibold text-gray-900">
                <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                ${category}
              </span>
              <span class="font-semibold text-gray-500">
                <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                ${area}
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Attach click listeners to recipe cards
  container.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', () => {
      const mealId = card.dataset.mealId;
      if (onRecipeClick) onRecipeClick(mealId);
    });
  });
}

/**
 * Render Meal Details section (#meal-details)
 */
export function renderMealDetails(meal, container, onBackClick, onLogMealClick) {
  if (!container || !meal) return;

  const nutrition = calculateMealNutrition(meal);
  const ingredients = extractIngredients(meal);
  const instructionsList = formatInstructions(meal.strInstructions);
  
  // Extract YouTube ID if available
  let videoEmbedUrl = null;
  if (meal.strYoutube) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = meal.strYoutube.match(regExp);
    if (match && match[2].length === 11) {
      videoEmbedUrl = `https://www.youtube.com/embed/${match[2]}`;
    }
  }

  const category = meal.strCategory || 'Main Dish';
  const area = meal.strArea || 'International';
  const tags = meal.strTags ? meal.strTags.split(',').filter(Boolean) : [];

  container.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <!-- Back Button -->
      <button
        id="back-to-meals-btn"
        class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors"
      >
        <i class="fa-solid fa-arrow-left"></i>
        <span>Back to Recipes</span>
      </button>

      <!-- Hero Section -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div class="relative h-80 md:h-96">
          <img
            src="${meal.strMealThumb}"
            alt="${meal.strMeal}"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div class="flex items-center gap-2 mb-3 flex-wrap">
              <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full shadow-sm">
                ${category}
              </span>
              <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full shadow-sm">
                ${area}
              </span>
              ${tags.map(t => `<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full shadow-sm">${t.trim()}</span>`).join('')}
            </div>
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
              ${meal.strMeal}
            </h1>
            <div class="flex items-center gap-6 text-white/90 text-sm md:text-base flex-wrap">
              <span class="flex items-center gap-2">
                <i class="fa-solid fa-clock text-emerald-400"></i>
                <span>${nutrition.prepTime}</span>
              </span>
              <span class="flex items-center gap-2">
                <i class="fa-solid fa-utensils text-emerald-400"></i>
                <span id="hero-servings">${nutrition.servings} servings</span>
              </span>
              <span class="flex items-center gap-2">
                <i class="fa-solid fa-fire text-amber-400"></i>
                <span id="hero-calories">${nutrition.calories} cal/serving</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-3 mb-8">
        <button
          id="log-meal-btn"
          class="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
          data-meal-id="${meal.idMeal}"
        >
          <i class="fa-solid fa-clipboard-list"></i>
          <span>Log This Meal</span>
        </button>
        ${meal.strSource ? `
          <a
            href="${meal.strSource}"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 px-5 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
            <span>Original Recipe</span>
          </a>
        ` : ''}
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Ingredients & Instructions -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Ingredients -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-list-check text-emerald-600"></i>
              Ingredients
              <span class="text-sm font-normal text-gray-500 ml-auto">
                ${ingredients.length} items
              </span>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${ingredients.map((ing, idx) => `
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                  <input
                    type="checkbox"
                    id="ing_${idx}"
                    class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"
                  />
                  <img
                    src="${ing.image}"
                    alt="${ing.ingredient}"
                    class="w-8 h-8 object-contain shrink-0"
                    onerror="this.style.display='none'"
                  />
                  <label for="ing_${idx}" class="text-gray-700 flex-1 text-sm select-none">
                    <span class="font-medium text-gray-900">${ing.measure}</span> ${ing.ingredient}
                  </label>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Instructions -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
              Instructions
            </h2>
            <div class="space-y-4">
              ${instructionsList.map((step, idx) => `
                <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-sm shadow-sm">
                    ${idx + 1}
                  </div>
                  <p class="text-gray-700 leading-relaxed text-sm md:text-base pt-1">
                    ${step}
                  </p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Video Section -->
          ${videoEmbedUrl ? `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-video text-red-500"></i>
                Video Tutorial
              </h2>
              <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-inner">
                <iframe
                  src="${videoEmbedUrl}"
                  class="absolute inset-0 w-full h-full"
                  title="${meal.strMeal} Video Tutorial"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Right Column - Nutrition Facts -->
        <div class="space-y-6">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-chart-pie text-emerald-600"></i>
              Nutrition Facts
            </h2>
            <div id="nutrition-facts-container">
              <p class="text-sm text-gray-500 mb-4">Per single serving</p>

              <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <p class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Calories</p>
                <p class="text-4xl font-bold text-emerald-600">${nutrition.calories}</p>
                <p class="text-xs text-gray-500 mt-1">Total recipe: ${nutrition.totalCalories} kcal</p>
              </div>

              <div class="space-y-3.5">
                <!-- Protein -->
                <div>
                  <div class="flex items-center justify-between text-sm mb-1">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span class="text-gray-700 font-medium">Protein</span>
                    </div>
                    <span class="font-bold text-gray-900">${nutrition.protein}g</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div class="bg-emerald-500 h-2 rounded-full" style="width: ${Math.min(100, Math.round((nutrition.protein / 50) * 100))}%"></div>
                  </div>
                </div>

                <!-- Carbs -->
                <div>
                  <div class="flex items-center justify-between text-sm mb-1">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span class="text-gray-700 font-medium">Carbs</span>
                    </div>
                    <span class="font-bold text-gray-900">${nutrition.carbs}g</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(100, Math.round((nutrition.carbs / 250) * 100))}%"></div>
                  </div>
                </div>

                <!-- Fat -->
                <div>
                  <div class="flex items-center justify-between text-sm mb-1">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span class="text-gray-700 font-medium">Fat</span>
                    </div>
                    <span class="font-bold text-gray-900">${nutrition.fat}g</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div class="bg-purple-500 h-2 rounded-full" style="width: ${Math.min(100, Math.round((nutrition.fat / 65) * 100))}%"></div>
                  </div>
                </div>

                <!-- Fiber -->
                <div>
                  <div class="flex items-center justify-between text-sm mb-1">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span class="text-gray-700 font-medium">Fiber</span>
                    </div>
                    <span class="font-bold text-gray-900">${nutrition.fiber}g</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div class="bg-amber-500 h-2 rounded-full" style="width: ${Math.min(100, Math.round((nutrition.fiber / 28) * 100))}%"></div>
                  </div>
                </div>

                <!-- Sugar -->
                <div>
                  <div class="flex items-center justify-between text-sm mb-1">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                      <span class="text-gray-700 font-medium">Sugar</span>
                    </div>
                    <span class="font-bold text-gray-900">${nutrition.sugar}g</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div class="bg-pink-500 h-2 rounded-full" style="width: ${Math.min(100, Math.round((nutrition.sugar / 50) * 100))}%"></div>
                  </div>
                </div>
              </div>

              <div class="mt-6 pt-6 border-t border-gray-100">
                <h3 class="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Vitamins & Minerals (% Daily Value)
                </h3>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="flex justify-between bg-gray-50 p-2 rounded-lg">
                    <span class="text-gray-600">Vitamin A</span>
                    <span class="font-bold text-gray-900">${nutrition.vitaminA}%</span>
                  </div>
                  <div class="flex justify-between bg-gray-50 p-2 rounded-lg">
                    <span class="text-gray-600">Vitamin C</span>
                    <span class="font-bold text-gray-900">${nutrition.vitaminC}%</span>
                  </div>
                  <div class="flex justify-between bg-gray-50 p-2 rounded-lg">
                    <span class="text-gray-600">Calcium</span>
                    <span class="font-bold text-gray-900">${nutrition.calcium}%</span>
                  </div>
                  <div class="flex justify-between bg-gray-50 p-2 rounded-lg">
                    <span class="text-gray-600">Iron</span>
                    <span class="font-bold text-gray-900">${nutrition.iron}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach back button listener
  const backBtn = container.querySelector('#back-to-meals-btn');
  if (backBtn && onBackClick) {
    backBtn.addEventListener('click', onBackClick);
  }

  // Attach log button listener
  const logBtn = container.querySelector('#log-meal-btn');
  if (logBtn && onLogMealClick) {
    logBtn.addEventListener('click', () => {
      onLogMealClick(meal, nutrition);
    });
  }
}

/**
 * Render Product Scanner Grid (#products-grid)
 */
export function renderProducts(products, container, onLogProductClick) {
  if (!container) return;

  const countElem = document.getElementById('products-count');
  if (countElem) {
    countElem.textContent = products && products.length > 0 
      ? `Showing ${products.length} products` 
      : 'Search for products or browse by category to see results';
  }

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-3 text-emerald-600">
          <i class="fa-solid fa-box-open text-2xl"></i>
        </div>
        <h3 class="text-base font-bold text-gray-900 mb-1">No products to display</h3>
        <p class="text-xs text-gray-500">Search for a product name or enter barcode above</p>
      </div>
    `;
    return;
  }

  const nutriGradeColors = {
    a: { bg: 'bg-green-600', text: 'text-white', label: 'Nutri-Score A' },
    b: { bg: 'bg-lime-500', text: 'text-white', label: 'Nutri-Score B' },
    c: { bg: 'bg-yellow-500', text: 'text-white', label: 'Nutri-Score C' },
    d: { bg: 'bg-orange-500', text: 'text-white', label: 'Nutri-Score D' },
    e: { bg: 'bg-red-600', text: 'text-white', label: 'Nutri-Score E' }
  };

  container.innerHTML = products.map(p => {
    const grade = (p.nutrition_grades || 'c').toLowerCase();
    const gradeInfo = nutriGradeColors[grade] || nutriGradeColors.c;
    const nutriments = p.nutriments || {};
    const kcal = nutriments['energy-kcal_100g'] || 0;
    const protein = nutriments.proteins_100g || 0;
    const carbs = nutriments.carbohydrates_100g || 0;
    const fat = nutriments.fat_100g || 0;
    const sugar = nutriments.sugars_100g || 0;

    return `
      <div
        class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group border border-gray-100"
        data-barcode="${p.code}"
      >
        <div>
          <div class="relative h-44 bg-gray-50 flex items-center justify-center overflow-hidden p-4">
            <img
              class="max-h-36 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              src="${p.image_url}"
              alt="${p.product_name}"
              loading="lazy"
              onerror="this.src='https://images.openfoodfacts.org/images/products/316/893/015/9742/front_fr.54.400.jpg'"
            />

            <!-- Nutri-Score Badge -->
            <div class="absolute top-2.5 left-2.5 ${gradeInfo.bg} ${gradeInfo.text} text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-sm">
              ${gradeInfo.label}
            </div>

            <!-- NOVA Badge -->
            ${p.nova_group ? `
              <div class="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm border border-gray-200" title="NOVA ${p.nova_group}">
                ${p.nova_group}
              </div>
            ` : ''}
          </div>

          <div class="p-4">
            <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">
              ${p.brands || 'Packaged Food'}
            </p>
            <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-emerald-600 transition-colors">
              ${p.product_name}
            </h3>

            <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <span><i class="fa-solid fa-weight-scale mr-1 text-emerald-600"></i>${p.quantity || '100g'}</span>
              <span><i class="fa-solid fa-fire mr-1 text-amber-500"></i>${kcal} kcal/100g</span>
            </div>

            <!-- Mini Nutrition -->
            <div class="grid grid-cols-4 gap-1 text-center mb-3">
              <div class="bg-emerald-50 rounded p-1.5 border border-emerald-100">
                <p class="text-xs font-bold text-emerald-700">${protein}g</p>
                <p class="text-[10px] text-gray-500">Protein</p>
              </div>
              <div class="bg-blue-50 rounded p-1.5 border border-blue-100">
                <p class="text-xs font-bold text-blue-700">${carbs}g</p>
                <p class="text-[10px] text-gray-500">Carbs</p>
              </div>
              <div class="bg-purple-50 rounded p-1.5 border border-purple-100">
                <p class="text-xs font-bold text-purple-700">${fat}g</p>
                <p class="text-[10px] text-gray-500">Fat</p>
              </div>
              <div class="bg-orange-50 rounded p-1.5 border border-orange-100">
                <p class="text-xs font-bold text-orange-700">${sugar}g</p>
                <p class="text-[10px] text-gray-500">Sugar</p>
              </div>
            </div>
          </div>
        </div>

        <div class="px-4 pb-4 pt-0">
          <button
            class="log-product-btn w-full py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-emerald-200 hover:border-emerald-600"
            data-code="${p.code}"
          >
            <i class="fa-solid fa-plus text-xs"></i>
            <span>Add to Food Log</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach button click listeners
  container.querySelectorAll('.log-product-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const code = btn.dataset.code;
      const product = products.find(p => p.code === code);
      if (product && onLogProductClick) {
        onLogProductClick(product);
      }
    });
  });
}

/**
 * Render Food Log page (#foodlog-section)
 */
export function renderFoodLog(todayItems, totals, goals, onDeleteClick, onClearClick) {
  // Update Date
  const dateElem = document.getElementById('foodlog-date');
  if (dateElem) {
    const now = new Date();
    dateElem.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }

  // Update Macro Progress in #foodlog-today-section
  const todaySection = document.getElementById('foodlog-today-section');
  if (todaySection) {
    const calPct = Math.min(100, Math.round((totals.calories / goals.calories) * 100)) || 0;
    const proPct = Math.min(100, Math.round((totals.protein / goals.protein) * 100)) || 0;
    const carbPct = Math.min(100, Math.round((totals.carbs / goals.carbs) * 100)) || 0;
    const fatPct = Math.min(100, Math.round((totals.fat / goals.fat) * 100)) || 0;

    const progressGrid = todaySection.querySelector('.grid');
    if (progressGrid) {
      progressGrid.innerHTML = `
        <!-- Calories Progress -->
        <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">Calories</span>
            <span class="text-sm font-bold ${totals.calories > goals.calories ? 'text-red-600' : 'text-emerald-700'}">
              ${totals.calories} / ${goals.calories} kcal
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div class="${totals.calories > goals.calories ? 'bg-red-500' : 'bg-emerald-500'} h-2.5 rounded-full transition-all duration-500" style="width: ${calPct}%"></div>
          </div>
          <p class="text-[11px] text-gray-500 mt-1 text-right">${calPct}% of daily goal</p>
        </div>

        <!-- Protein Progress -->
        <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">Protein</span>
            <span class="text-sm font-bold text-blue-700">${totals.protein} / ${goals.protein} g</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div class="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style="width: ${proPct}%"></div>
          </div>
          <p class="text-[11px] text-gray-500 mt-1 text-right">${proPct}% of daily goal</p>
        </div>

        <!-- Carbs Progress -->
        <div class="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">Carbs</span>
            <span class="text-sm font-bold text-amber-700">${totals.carbs} / ${goals.carbs} g</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div class="bg-amber-500 h-2.5 rounded-full transition-all duration-500" style="width: ${carbPct}%"></div>
          </div>
          <p class="text-[11px] text-gray-500 mt-1 text-right">${carbPct}% of daily goal</p>
        </div>

        <!-- Fat Progress -->
        <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">Fat</span>
            <span class="text-sm font-bold text-purple-700">${totals.fat} / ${goals.fat} g</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div class="bg-purple-500 h-2.5 rounded-full transition-all duration-500" style="width: ${fatPct}%"></div>
          </div>
          <p class="text-[11px] text-gray-500 mt-1 text-right">${fatPct}% of daily goal</p>
        </div>
      `;
    }
  }

  // Update Logged Items Header & Count
  const headerCount = document.querySelector('#foodlog-today-section h4');
  if (headerCount) {
    headerCount.textContent = `Logged Items (${todayItems.length})`;
  }

  // Update Clear All Button
  const clearBtn = document.getElementById('clear-foodlog');
  if (clearBtn) {
    clearBtn.style.display = todayItems.length > 0 ? 'inline-flex' : 'none';
    clearBtn.onclick = onClearClick;
  }

  // Render Logged Items List (#logged-items-list)
  const listContainer = document.getElementById('logged-items-list');
  if (listContainer) {
    if (todayItems.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-10 text-gray-500">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
            <i class="fa-solid fa-utensils text-3xl"></i>
          </div>
          <p class="font-bold text-gray-800 mb-1">No food logged today</p>
          <p class="text-xs text-gray-500 max-w-sm mx-auto">
            Start tracking your nutrition by logging meals or scanning packaged food products
          </p>
        </div>
      `;
    } else {
      listContainer.innerHTML = todayItems.map(item => {
        const typeBadge = item.type === 'product'
          ? '<span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">Packaged</span>'
          : item.type === 'custom'
          ? '<span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">Custom</span>'
          : '<span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">Meal</span>';

        return `
          <div class="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-white rounded-xl border border-gray-200/70 hover:shadow-sm transition-all group">
            <div class="flex items-center gap-3.5">
              ${item.image ? `
                <img
                  src="${item.image}"
                  alt="${item.name}"
                  class="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                  onerror="this.style.display='none'"
                />
              ` : `
                <div class="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  <i class="fa-solid fa-bowl-food"></i>
                </div>
              `}
              <div>
                <div class="flex items-center gap-2 mb-0.5">
                  <h4 class="font-bold text-gray-900 text-sm">${item.name}</h4>
                  ${typeBadge}
                </div>
                <div class="flex items-center gap-3 text-xs text-gray-500">
                  <span><i class="fa-solid fa-clock text-gray-400 mr-1"></i>${item.timestamp}</span>
                  ${item.servings ? `<span><i class="fa-solid fa-utensils text-gray-400 mr-1"></i>${item.servings} serving(s)</span>` : ''}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-6">
              <div class="text-right">
                <p class="font-bold text-emerald-600 text-sm">${item.calories} kcal</p>
                <p class="text-[11px] text-gray-500">
                  ${item.protein}g P • ${item.carbs}g C • ${item.fat}g F
                </p>
              </div>
              <button
                class="delete-item-btn w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all"
                data-id="${item.id}"
                title="Remove entry"
              >
                <i class="fa-solid fa-trash text-sm"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Attach delete listeners
      listContainer.querySelectorAll('.delete-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          if (onDeleteClick) onDeleteClick(id);
        });
      });
    }
  }
}

/**
 * Render Weekly Plotly Chart into #weekly-chart
 */
export function renderWeeklyChart(weeklyData, goals) {
  const chartContainer = document.getElementById('weekly-chart');
  if (!chartContainer || !window.Plotly) return;

  const xLabels = weeklyData.map(d => `${d.dayName} ${d.dayNum}`);
  const yCalories = weeklyData.map(d => d.calories);
  const goalLine = weeklyData.map(() => goals.calories);

  const traceBars = {
    x: xLabels,
    y: yCalories,
    name: 'Logged Calories',
    type: 'bar',
    marker: {
      color: weeklyData.map(d => d.isToday ? '#059669' : '#10b981'),
      opacity: weeklyData.map(d => d.isToday ? 1.0 : 0.75),
      line: {
        color: '#047857',
        width: 1
      },
      borderRadius: 6
    }
  };

  const traceGoal = {
    x: xLabels,
    y: goalLine,
    name: 'Daily Goal',
    type: 'scatter',
    mode: 'lines',
    line: {
      color: '#ef4444',
      width: 2,
      dash: 'dash'
    }
  };

  const layout = {
    margin: { t: 20, r: 20, l: 40, b: 40 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    showlegend: true,
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.15,
      font: { family: 'Inter, sans-serif', size: 12 }
    },
    xaxis: {
      tickfont: { family: 'Inter, sans-serif', size: 11, color: '#6b7280' },
      gridcolor: '#f3f4f6',
      zeroline: false
    },
    yaxis: {
      title: 'Calories (kcal)',
      tickfont: { family: 'Inter, sans-serif', size: 11, color: '#6b7280' },
      gridcolor: '#f3f4f6',
      zeroline: false
    }
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  chartContainer.innerHTML = '';
  window.Plotly.newPlot(chartContainer, [traceBars, traceGoal], layout, config);
}
