/**
 * TheMealDB API Integration Service
 */

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Category color theme mappings & icons
export const CATEGORY_STYLES = {
  Beef: {
    bg: 'from-red-50 to-rose-50',
    border: 'border-red-200 hover:border-red-400',
    iconBg: 'from-red-400 to-rose-500',
    icon: 'fa-drumstick-bite',
    textColor: 'text-red-700'
  },
  Chicken: {
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200 hover:border-amber-400',
    iconBg: 'from-amber-400 to-orange-500',
    icon: 'fa-drumstick-bite',
    textColor: 'text-amber-700'
  },
  Dessert: {
    bg: 'from-pink-50 to-rose-50',
    border: 'border-pink-200 hover:border-pink-400',
    iconBg: 'from-pink-400 to-rose-500',
    icon: 'fa-cake-candles',
    textColor: 'text-pink-700'
  },
  Lamb: {
    bg: 'from-orange-50 to-amber-50',
    border: 'border-orange-200 hover:border-orange-400',
    iconBg: 'from-orange-400 to-amber-500',
    icon: 'fa-bowl-food',
    textColor: 'text-orange-700'
  },
  Miscellaneous: {
    bg: 'from-slate-50 to-gray-50',
    border: 'border-slate-200 hover:border-slate-400',
    iconBg: 'from-slate-400 to-gray-500',
    icon: 'fa-utensils',
    textColor: 'text-slate-700'
  },
  Pasta: {
    bg: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-200 hover:border-yellow-400',
    iconBg: 'from-yellow-400 to-amber-500',
    icon: 'fa-wheat-awn',
    textColor: 'text-yellow-700'
  },
  Pork: {
    bg: 'from-rose-50 to-pink-50',
    border: 'border-rose-200 hover:border-rose-400',
    iconBg: 'from-rose-400 to-pink-500',
    icon: 'fa-bacon',
    textColor: 'text-rose-700'
  },
  Seafood: {
    bg: 'from-cyan-50 to-blue-50',
    border: 'border-cyan-200 hover:border-cyan-400',
    iconBg: 'from-cyan-400 to-blue-500',
    icon: 'fa-fish',
    textColor: 'text-cyan-700'
  },
  Side: {
    bg: 'from-teal-50 to-emerald-50',
    border: 'border-teal-200 hover:border-teal-400',
    iconBg: 'from-teal-400 to-emerald-500',
    icon: 'fa-plate-wheat',
    textColor: 'text-teal-700'
  },
  Starter: {
    bg: 'from-emerald-50 to-green-50',
    border: 'border-emerald-200 hover:border-emerald-400',
    iconBg: 'from-emerald-400 to-green-500',
    icon: 'fa-spoon',
    textColor: 'text-emerald-700'
  },
  Vegan: {
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-200 hover:border-green-400',
    iconBg: 'from-green-400 to-emerald-500',
    icon: 'fa-seedling',
    textColor: 'text-green-700'
  },
  Vegetarian: {
    bg: 'from-lime-50 to-green-50',
    border: 'border-lime-200 hover:border-lime-400',
    iconBg: 'from-lime-400 to-green-500',
    icon: 'fa-leaf',
    textColor: 'text-lime-700'
  },
  Breakfast: {
    bg: 'from-amber-50 to-yellow-50',
    border: 'border-amber-200 hover:border-amber-400',
    iconBg: 'from-amber-400 to-yellow-500',
    icon: 'fa-egg',
    textColor: 'text-amber-700'
  },
  Goat: {
    bg: 'from-stone-50 to-amber-50',
    border: 'border-stone-200 hover:border-stone-400',
    iconBg: 'from-stone-400 to-amber-500',
    icon: 'fa-bowl-food',
    textColor: 'text-stone-700'
  }
};

/**
 * Fetch all categories from TheMealDB
 */
export async function fetchCategories() {
  try {
    const response = await fetch(`${BASE_URL}/categories.php`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    return [];
  }
}

/**
 * Fetch all areas/cuisines from TheMealDB
 */
export async function fetchAreas() {
  try {
    const response = await fetch(`${BASE_URL}/list.php?a=list`);
    if (!response.ok) throw new Error('Failed to fetch areas');
    const data = await response.json();
    return (data.meals || []).map(item => item.strArea).filter(Boolean);
  } catch (error) {
    console.error('Error in fetchAreas:', error);
    // Fallback list of common cuisines
    return [
      'American', 'British', 'Canadian', 'Chinese', 'Croatian', 'Dutch', 'Egyptian',
      'Filipino', 'French', 'Greek', 'Indian', 'Irish', 'Italian', 'Jamaican',
      'Japanese', 'Kenyan', 'Malaysian', 'Mexican', 'Moroccan', 'Polish',
      'Portuguese', 'Russian', 'Spanish', 'Thai', 'Tunisian', 'Turkish', 'Ukrainian', 'Vietnamese'
    ];
  }
}

/**
 * Fetch 25 initial recipes to display on page load
 */
export async function fetchInitialRecipes(targetCount = 25) {
  try {
    const res = await fetch(`${BASE_URL}/search.php?s=`);
    const data = await res.json();
    let meals = data.meals || [];

    if (meals.length < targetCount) {
      const resB = await fetch(`${BASE_URL}/search.php?s=c`);
      const dataB = await resB.json();
      if (dataB.meals) {
        const existingIds = new Set(meals.map(m => m.idMeal));
        for (const m of dataB.meals) {
          if (!existingIds.has(m.idMeal)) {
            meals.push(m);
            existingIds.add(m.idMeal);
          }
        }
      }
    }

    return meals.slice(0, targetCount);
  } catch (error) {
    console.error('Error fetching initial recipes:', error);
    return [];
  }
}

/**
 * Search recipes by name or ingredient or cuisine
 */
export async function searchMeals(query) {
  if (!query || !query.trim()) {
    return fetchInitialRecipes(25);
  }
  const cleanQuery = query.trim();
  try {
    // Search by meal name
    const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(cleanQuery)}`);
    const data = await response.json();
    let meals = data.meals || [];

    // If no direct name matches, search by ingredient
    if (meals.length === 0) {
      const ingResponse = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(cleanQuery)}`);
      const ingData = await ingResponse.json();
      if (ingData.meals && ingData.meals.length > 0) {
        const detailedMeals = await Promise.all(
          ingData.meals.slice(0, 25).map(m => getMealById(m.idMeal))
        );
        meals = detailedMeals.filter(Boolean);
      }
    }

    return meals;
  } catch (error) {
    console.error('Error in searchMeals:', error);
    return [];
  }
}

/**
 * Filter recipes by category
 */
export async function filterByCategory(category) {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
    const data = await response.json();
    const meals = data.meals || [];
    
    // Enrich the first 25 meals with full details
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
  } catch (error) {
    console.error('Error filtering by category:', error);
    return [];
  }
}

/**
 * Filter recipes by area / cuisine
 */
export async function filterByArea(area) {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?a=${encodeURIComponent(area)}`);
    const data = await response.json();
    const meals = data.meals || [];

    // Enrich the first 25 meals with full details
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
  } catch (error) {
    console.error('Error filtering by area:', error);
    return [];
  }
}

/**
 * Get full meal details by ID
 */
export async function getMealById(id) {
  try {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
    if (!response.ok) throw new Error('Meal lookup failed');
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
  } catch (error) {
    console.error('Error in getMealById:', error);
    return null;
  }
}

/**
 * Get a random meal
 */
export async function getRandomMeal() {
  try {
    const response = await fetch(`${BASE_URL}/random.php`);
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
  } catch (error) {
    console.error('Error in getRandomMeal:', error);
    return null;
  }
}

/**
 * Extract ingredients and measurements from a meal object
 */
export function extractIngredients(meal) {
  if (!meal) return [];
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        ingredient: ingredient.trim(),
        measure: (measure || '').trim(),
        image: `https://www.themealdb.com/images/ingredients/${encodeURIComponent(ingredient.trim())}-Small.png`
      });
    }
  }
  return ingredients;
}

/**
 * Calculate or estimate consistent, realistic nutrition values for a meal
 */
export function calculateMealNutrition(meal) {
  if (!meal) {
    return {
      calories: 450,
      totalCalories: 1800,
      servings: 4,
      protein: 35,
      carbs: 45,
      fat: 15,
      fiber: 4,
      sugar: 8,
      vitaminA: 15,
      vitaminC: 20,
      calcium: 6,
      iron: 12,
      prepTime: '30 min'
    };
  }

  const idNum = parseInt(meal.idMeal || '52772', 10) || 52772;
  const ingredients = extractIngredients(meal);
  const ingCount = Math.max(ingredients.length, 4);

  const category = (meal.strCategory || '').toLowerCase();
  let baseCalories = 420;
  let baseProtein = 28;
  let baseCarbs = 40;
  let baseFat = 14;
  let baseFiber = 4;
  let baseSugar = 6;
  let servings = 4;
  let prepTime = '35 min';

  if (category.includes('beef') || category.includes('lamb') || category.includes('pork')) {
    baseCalories = 540 + (idNum % 120);
    baseProtein = 42 + (idNum % 14);
    baseCarbs = 25 + (idNum % 20);
    baseFat = 24 + (idNum % 10);
    prepTime = `${35 + (idNum % 30)} min`;
  } else if (category.includes('chicken')) {
    baseCalories = 460 + (idNum % 90);
    baseProtein = 44 + (idNum % 12);
    baseCarbs = 35 + (idNum % 25);
    baseFat = 12 + (idNum % 8);
    prepTime = `${25 + (idNum % 20)} min`;
  } else if (category.includes('seafood')) {
    baseCalories = 380 + (idNum % 80);
    baseProtein = 38 + (idNum % 10);
    baseCarbs = 20 + (idNum % 20);
    baseFat = 10 + (idNum % 6);
    prepTime = `${20 + (idNum % 15)} min`;
  } else if (category.includes('pasta')) {
    baseCalories = 520 + (idNum % 110);
    baseProtein = 22 + (idNum % 8);
    baseCarbs = 68 + (idNum % 18);
    baseFat = 14 + (idNum % 8);
    baseFiber = 5;
    prepTime = `${20 + (idNum % 15)} min`;
  } else if (category.includes('dessert')) {
    baseCalories = 430 + (idNum % 150);
    baseProtein = 6 + (idNum % 4);
    baseCarbs = 62 + (idNum % 25);
    baseFat = 18 + (idNum % 12);
    baseSugar = 32 + (idNum % 15);
    prepTime = `${45 + (idNum % 30)} min`;
  } else if (category.includes('vegan') || category.includes('vegetarian')) {
    baseCalories = 340 + (idNum % 80);
    baseProtein = 16 + (idNum % 10);
    baseCarbs = 48 + (idNum % 20);
    baseFat = 9 + (idNum % 6);
    baseFiber = 8 + (idNum % 4);
    prepTime = `${25 + (idNum % 15)} min`;
  } else if (category.includes('breakfast')) {
    baseCalories = 380 + (idNum % 90);
    baseProtein = 18 + (idNum % 8);
    baseCarbs = 42 + (idNum % 18);
    baseFat = 14 + (idNum % 8);
    prepTime = `${15 + (idNum % 15)} min`;
  } else if (category.includes('starter') || category.includes('side')) {
    baseCalories = 240 + (idNum % 70);
    baseProtein = 8 + (idNum % 6);
    baseCarbs = 28 + (idNum % 15);
    baseFat = 8 + (idNum % 5);
    prepTime = `${15 + (idNum % 15)} min`;
  }

  const calories = Math.round(baseCalories + (ingCount * 5));
  const protein = Math.round(baseProtein);
  const carbs = Math.round(baseCarbs);
  const fat = Math.round(baseFat);
  const fiber = Math.round(baseFiber);
  const sugar = Math.round(baseSugar);
  const totalCalories = calories * servings;

  return {
    calories,
    totalCalories,
    servings,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    vitaminA: 10 + (idNum % 25),
    vitaminC: 15 + (idNum % 35),
    calcium: 4 + (idNum % 18),
    iron: 8 + (idNum % 20),
    prepTime
  };
}

/**
 * Format instructions into clean numbered steps
 */
export function formatInstructions(instructions) {
  if (!instructions) return [];
  const lines = instructions
    .split(/\r?\n|\r/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !/^STEP\s*\d+/i.test(line) && !/^INSTRUCTIONS/i.test(line));

  if (lines.length <= 2) {
    const sentences = instructions
      .replace(/\r?\n/g, ' ')
      .split(/(?<=[.?!])\s+(?=[A-Z0-9])/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
    if (sentences.length > 1) return sentences;
  }

  return lines.length > 0 ? lines : [instructions];
}
