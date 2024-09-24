import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const domain = import.meta.env.VITE_APPSTAGE === 'production' ? 'http://localhost:5000' : 'https://kdigitalcurry-reactassignment.onrender.com';

export const fetchProducts = createAsyncThunk('product/fetchProducts', async () => {
  const response = await axios.get(`${domain}/products`);
  return response.data;
});

export const fetchMaterials = createAsyncThunk('product/fetchMaterials', async () => {
  const response = await axios.get(`${domain}/materials`);
  return response.data;
});

export const fetchGrades = createAsyncThunk('product/fetchGrades', async () => {
  const response = await axios.get(`${domain}/grades`);
  return response.data;
});

export const fetchCombinations = createAsyncThunk(
  'product/fetchCombinations',
  async ({ page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc', materialId = null, productName = null }) => {
    const response = await axios.get(
      `${domain}/allproducts?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}${materialId ? `&materialId=${materialId}` : ''}${productName ? `&productName=${productName}` : ''}`
    );
    return response.data;
  }
);

export const updateCombination = createAsyncThunk(
  'product/updateCombination',
  async ({ combinationId, formData }) => {
    const response = await axios.put(`${domain}/update-combination/${combinationId}`, {
      ...formData,
    });
    return response.data;
  }
);

export const addCombination = createAsyncThunk(
  'product/addCombination',
  async (body) => {
    const response = await axios.post(`${domain}/add-combination`, body);
    return response.data; // Assuming the response contains relevant data
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    materials: [],
    grades: [],
    data: [],
    status: 'idle',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.materials = action.payload;
      })
      .addCase(fetchGrades.fulfilled, (state, action) => {
        state.grades = action.payload;
      })
      .addCase(fetchCombinations.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default productSlice.reducer;
