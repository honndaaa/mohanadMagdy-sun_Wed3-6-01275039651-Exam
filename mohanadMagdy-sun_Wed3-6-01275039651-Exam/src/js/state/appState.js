/**
 * NutriPlan Application State Management
 */

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

export class AppState {
  constructor() {
    this.currentPage = 'meals'; // 'meals' | 'meal-details' | 'products' | 'foodlog'
    this.viewMode = 'grid'; // 'grid' | 'list'
    
    // Meals state
    this.recipes = [];
    this.categories = [];
    this.areas = [];
    this.selectedCategory = null;
    this.selectedArea = null;
    this.searchQuery = '';
    this.currentMeal = null;

    // Products state
    this.products = [];
    this.selectedNutriScore = '';
    this.selectedProductCategory = null;
    this.productSearchQuery = '';

    // Food log & goals from storage
    this.foodLog = this.loadFoodLog();
    this.dailyGoals = this.loadGoals();
    this.favorites = this.loadFavorites();

    // Event listeners
    this.listeners = new Map();
  }

  // ================= Event Pub/Sub =================
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => {
      const arr = this.listeners.get(event) || [];
      this.listeners.set(event, arr.filter(cb => cb !== callback));
    };
  }

  notify(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data, this));
    }
  }

  // ================= Storage Helpers =================
  loadFoodLog() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOOD_LOG);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading food log:', e);
      return [];
    }
  }

  saveFoodLog() {
    try {
      localStorage.setItem(STORAGE_KEYS.FOOD_LOG, JSON.stringify(this.foodLog));
      this.notify('foodLogChanged', this.foodLog);
    } catch (e) {
      console.error('Error saving food log:', e);
    }
  }

  loadGoals() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      return data ? { ...DEFAULT_GOALS, ...JSON.parse(data) } : { ...DEFAULT_GOALS };
    } catch {
      return { ...DEFAULT_GOALS };
    }
  }

  saveGoals(goals) {
    this.dailyGoals = { ...this.dailyGoals, ...goals };
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(this.dailyGoals));
      this.notify('goalsChanged', this.dailyGoals);
    } catch (e) {
      console.error('Error saving goals:', e);
    }
  }

  loadFavorites() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(this.favorites));
      this.notify('favoritesChanged', this.favorites);
    } catch (e) {
      console.error('Error saving favorites:', e);
    }
  }

  // ================= Date Helpers =================
  getFormattedTodayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTodayDisplayDate(date = new Date()) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // ================= Food Log Operations =================
  addFoodLogEntry(item) {
    const now = new Date();
    const entry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name: item.name || 'Food Item',
      type: item.type || 'meal', // 'meal' | 'product' | 'custom'
      image: item.image || '',
      calories: Math.round(Number(item.calories) || 0),
      protein: Math.round(Number(item.protein) || 0),
      carbs: Math.round(Number(item.carbs) || 0),
      fat: Math.round(Number(item.fat) || 0),
      sugar: Math.round(Number(item.sugar) || 0),
      fiber: Math.round(Number(item.fiber) || 0),
      servings: Number(item.servings) || 1,
      unit: item.unit || 'serving',
      dateKey: item.dateKey || this.getFormattedTodayKey(now),
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.foodLog.unshift(entry);
    this.saveFoodLog();
    return entry;
  }

  removeFoodLogEntry(id) {
    this.foodLog = this.foodLog.filter(item => item.id !== id);
    this.saveFoodLog();
  }

  clearFoodLog(dateKey = null) {
    if (dateKey) {
      this.foodLog = this.foodLog.filter(item => item.dateKey !== dateKey);
    } else {
      const todayKey = this.getFormattedTodayKey();
      this.foodLog = this.foodLog.filter(item => item.dateKey !== todayKey);
    }
    this.saveFoodLog();
  }

  getTodayLog(dateKey = null) {
    const key = dateKey || this.getFormattedTodayKey();
    return this.foodLog.filter(item => item.dateKey === key);
  }

  getDailyTotals(dateKey = null) {
    const items = this.getTodayLog(dateKey);
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      fiber: 0,
      count: items.length
    };

    items.forEach(item => {
      totals.calories += Number(item.calories) || 0;
      totals.protein += Number(item.protein) || 0;
      totals.carbs += Number(item.carbs) || 0;
      totals.fat += Number(item.fat) || 0;
      totals.sugar += Number(item.sugar) || 0;
      totals.fiber += Number(item.fiber) || 0;
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
      const totals = this.getDailyTotals(key);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();

      days.push({
        date: d,
        dateKey: key,
        dayName,
        dayNum,
        isToday: i === 0,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        count: totals.count
      });
    }

    return days;
  }

  // ================= Favorites =================
  toggleFavorite(mealId) {
    if (this.isFavorite(mealId)) {
      this.favorites = this.favorites.filter(id => id !== mealId);
    } else {
      this.favorites.push(mealId);
    }
    this.saveFavorites();
    return this.isFavorite(mealId);
  }

  isFavorite(mealId) {
    return this.favorites.includes(mealId);
  }

  // ================= Page & Filter Navigation =================
  setPage(page) {
    this.currentPage = page;
    this.notify('pageChanged', page);
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.notify('viewModeChanged', mode);
  }

  setSelectedCategory(cat) {
    this.selectedCategory = cat;
    this.selectedArea = null; // reset area when category is selected
    this.notify('filterChanged', { type: 'category', value: cat });
  }

  setSelectedArea(area) {
    this.selectedArea = area;
    this.selectedCategory = null; // reset category when area is selected
    this.notify('filterChanged', { type: 'area', value: area });
  }

  setSearchQuery(q) {
    this.searchQuery = q;
    this.selectedCategory = null;
    this.selectedArea = null;
    this.notify('searchChanged', q);
  }

  setSelectedNutriScore(score) {
    this.selectedNutriScore = score;
    this.notify('productFilterChanged', { type: 'score', value: score });
  }

  setSelectedProductCategory(cat) {
    this.selectedProductCategory = cat;
    this.notify('productFilterChanged', { type: 'category', value: cat });
  }
}

export const appState = new AppState();
